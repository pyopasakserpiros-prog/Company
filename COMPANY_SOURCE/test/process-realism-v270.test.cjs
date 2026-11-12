"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const P = require("../js/plant.js");
const W = require("../js/world.js");
const E = require("../js/economy.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");
const prepare = require("./knowledge-fixtures.cjs");

let globalPlantSeq = 0;
function plantHooks(w) {
  return {
    pay: (n, ref) =>
      E.post(w.finance, {
        id: "testplantv270:" + w.clock.absoluteMinute + ":" + ++globalPlantSeq,
        kind: "equipment",
        delta: -n,
        reference: ref,
        at: w.clock.absoluteMinute,
      }),
    claim: (p) => {
      if (p.taskId && w.jobs[p.taskId]) w.jobs[p.taskId].assignee = null;
      p.taskId = null;
    },
    walk: (p, s) => {
      p.position = { ...s.access };
      p.path = [];
    },
  };
}

test("v2.7.0 AC1 & AC2: Timed Material Processing, Intermediate Production, Shared Machine Power/Thermal & Cancellation", () => {
  const w = S.create("v270-refinery-timed", { autonomous: false });
  prepare(w, {
    subjects: ["agriculture", "food_fermentation", "chemical_processing", "maintenance"],
  });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 50000000 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "paddy_grain", quantity: 16 });

  const milledBefore = w.inventory.materials.milled_rice || 0;
  const branBefore = w.inventory.materials.rice_bran_husk || 0;

  // 1) Queue timed batch: at tick +0 output MUST NOT exist yet, inputs are reserved
  const craft1 = S.command(w, { type: "craftMaterial", materialId: "milled_rice", batches: 2 });
  assert.equal(craft1.ok, true);
  assert.equal(craft1.queued, true);
  assert.ok(craft1.batchId);
  assert.equal(w.inventory.materials.milled_rice || 0, milledBefore, "Output must not exist at tick +0");
  assert.equal(w.inventory.materials.rice_bran_husk || 0, branBefore, "Byproduct must not exist at tick +0");
  assert.ok((w.inventory.reserved.paddy_grain || 0) >= 4, "Inputs must be reserved before consumption");
  assert.deepEqual(S.audit(w), []);

  // 2) Cancel before input consumption releases reservation cleanly
  const craft2 = S.command(w, { type: "craftMaterial", materialId: "milled_rice", batches: 1 });
  assert.equal(craft2.ok, true);
  const cancelBefore = S.command(w, { type: "cancelRefineryBatch", batchId: craft2.batchId });
  assert.equal(cancelBefore.ok, true);
  assert.equal(cancelBefore.status, "cancelled");
  assert.equal(cancelBefore.refundedInputs, true);
  assert.deepEqual(S.audit(w), []);

  // 3) Shared machine power/thermal guard: two batches on grain_mill in same tick must not multiply power or heating
  const craft3 = S.command(w, { type: "craftMaterial", materialId: "milled_rice", batches: 1 });
  assert.equal(craft3.ok, true);
  const mill = w.plant.machines.grain_mill;
  assert.ok(mill);
  const kwhBefore = mill.totalKwh;
  S.step(w);
  const kwhGain = mill.totalKwh - kwhBefore;
  const maxSingleTickKwh = (P.SPECS.grain_mill.kw * 5) / 60 + 0.01;
  assert.ok(kwhGain <= maxSingleTickKwh, `Shared machine kWh gain (${kwhGain}) must not exceed single-machine tick draw (${maxSingleTickKwh})`);

  // 4) Step simulation until batch 1 completes all stages (inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released)
  let elapsedMinutes = 5;
  while (elapsedMinutes < 180) {
    const b = w.plant.refineryBatches[craft1.batchId];
    if (b && ["released", "rework", "scrapped"].includes(b.status)) break;
    S.step(w);
    elapsedMinutes += 5;
  }
  const doneBatch = w.plant.refineryBatches[craft1.batchId];
  assert.ok(doneBatch);
  assert.equal(doneBatch.status, "released");
  assert.ok(elapsedMinutes >= 20, "Refinery batch requires multi-stage elapsed time");
  assert.ok((w.inventory.materials.milled_rice || 0) > milledBefore, "Output material released after inspection");
  assert.ok((w.inventory.materials.rice_bran_husk || 0) > branBefore, "Byproduct released after inspection");

  // 5) Cancel after input consumption converts WIP into scrap without refunding consumed raw inputs
  const craft4 = S.command(w, { type: "craftMaterial", materialId: "milled_rice", batches: 1 });
  assert.equal(craft4.ok, true);
  for (let i = 0; i < 6; i++) {
    const b = w.plant.refineryBatches[craft4.batchId];
    if (b && b.inputsConsumed) break;
    S.step(w);
  }
  assert.equal(w.plant.refineryBatches[craft4.batchId].inputsConsumed, true);
  const cancelAfter = S.command(w, { type: "cancelRefineryBatch", batchId: craft4.batchId });
  assert.equal(cancelAfter.ok, true);
  assert.equal(cancelAfter.status, "scrapped");
  assert.equal(cancelAfter.refundedInputs, false);
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v2.7.0 AC3: Time- and Resource-Bound Freight & Logistics Lifecycle", () => {
  const w = S.create("v270-freight-timed", { autonomous: false });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 30000000 });

  const accept = S.command(w, { type: "acceptFreightContract", quoteId: "fquote-1", vehicleId: "truck-1" });
  assert.equal(accept.ok, true);
  const cid = accept.contractId;

  // Dispatch to outbound
  const toOutbound = S.command(w, { type: "advanceFreightContract", contractId: cid });
  assert.equal(toOutbound.ok, true);
  assert.equal(w.fleetTransport.contracts[cid].status, "outbound");

  // Attempting to complete outbound travel at the exact same timestamp as dispatch must fail
  const sameTickDeliver = S.command(w, { type: "advanceFreightContract", contractId: cid });
  assert.equal(sameTickDeliver.ok, false);
  assert.equal(sameTickDeliver.code, "elapsedTimeRequired");

  // Even passing completeAllSteps: true without elapsed time cannot skip transit time
  const shortcutAttempt = S.command(w, { type: "advanceFreightContract", contractId: cid, completeAllSteps: true });
  assert.equal(shortcutAttempt.ok, false);
  assert.equal(shortcutAttempt.code, "elapsedTimeRequired");

  // Advance clock and deliver -> truck enters returning
  S.advance(w, 15);
  const deliver = S.command(w, { type: "advanceFreightContract", contractId: cid });
  assert.equal(deliver.ok, true);
  assert.equal(w.fleetTransport.contracts[cid].status, "delivered");
  assert.equal(w.fleetTransport.vehicles["truck-1"].status, "returning");

  // Attempting to finish return leg at the exact same timestamp as delivery must fail
  const sameTickReturn = S.command(w, { type: "advanceFreightContract", contractId: cid, finishReturn: true });
  assert.equal(sameTickReturn.ok, false);
  assert.equal(sameTickReturn.code, "elapsedReturnTimeRequired");

  // Settle invoice and finish return leg after elapsed time
  S.command(w, { type: "advanceFreightContract", contractId: cid });
  assert.equal(w.fleetTransport.contracts[cid].status, "paid");
  S.advance(w, 15);
  const ret = S.command(w, { type: "advanceFreightContract", contractId: cid, finishReturn: true });
  assert.equal(ret.ok, true);
  assert.equal(w.fleetTransport.vehicles["truck-1"].status, "idle");
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v2.7.0 AC4: Industrial B2B Services Require Timed Multi-Stage Execution, Test Measurements & Cold Storage Occupancy", () => {
  const w = S.create("v270-services-timed", { autonomous: false });
  prepare(w, {
    subjects: ["metrology", "quality", "maintenance", "electrical_basics", "logistics", "food_safety"],
  });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 50000000 });
  S.command(w, { type: "directorEdit", action: "addMaterials", quantity: 10 });

  // 1) Calibration Lab service: multi-stage execution produces testMeasurements and frees custody upon completion
  const calStart = S.command(w, { type: "startServiceOrder", serviceTypeId: "calibration_lab", clientCorpId: "siam_auto" });
  assert.equal(calStart.ok, true);
  const order = w.serviceBusiness.orders[calStart.orderId];
  assert.equal(order.status, "accepted");
  assert.ok(Array.isArray(order.stages) && order.stages.length >= 3);
  assert.ok(w.serviceBusiness.instrumentCustody[calStart.orderId]);

  // Step 1: partial workMinutes (10 of 25) leaves order in 'in_progress'
  const s1 = S.advanceServiceOrder(w, calStart.orderId, { workMinutes: 10, completeAllSteps: false });
  assert.equal(s1.ok, true);
  assert.equal(order.status, "in_progress");
  assert.equal(order.workMinutesDone, 10);
  assert.ok(w.serviceBusiness.instrumentCustody[calStart.orderId], "Custody remains active while service is in_progress");

  // Step 2: finish remaining workMinutes -> status becomes 'certified_or_verified' and testMeasurements are recorded
  w.clock.absoluteMinute += 5;
  w.clock.tick++;
  S.advanceServiceOrder(w, calStart.orderId, { workMinutes: 20, completeAllSteps: false });
  assert.equal(order.status, "certified_or_verified");
  assert.ok(order.testMeasurements && order.testMeasurements.passed === true, "Service order must record concrete test measurements");
  assert.equal(w.serviceBusiness.instrumentCustody[calStart.orderId], undefined, "Custody released upon calibration completion");

  w.clock.absoluteMinute += 5;
  w.clock.tick++;
  S.advanceServiceOrder(w, calStart.orderId, { completeAllSteps: false }); // invoiced & settled
  assert.equal(order.invoiced, true);
  assert.equal(order.status, "paid");

  // 2) Cold storage 3PL service: requires cold_room machine and tracks storageHoursOccupied
  P.install(w, "cold_room");
  const coldStart = S.command(w, { type: "startServiceOrder", serviceTypeId: "cold_storage_3pl", clientCorpId: "cp_health" });
  assert.equal(coldStart.ok, true);
  const coldOrder = w.serviceBusiness.orders[coldStart.orderId];
  S.advanceServiceOrder(w, coldStart.orderId, { workMinutes: 30, completeAllSteps: false });
  w.clock.absoluteMinute += 5;
  w.clock.tick++;
  S.advanceServiceOrder(w, coldStart.orderId, { completeAllSteps: false });
  assert.equal(coldOrder.status, "paid");
  assert.ok(coldOrder.storageHoursOccupied > 0, "Cold storage service must track storageHoursOccupied");
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v2.7.0 AC5: Real Software Development, Qualified Developer Time, Skill/Aptitude Comparison, Scope Change & Defect SLA Penalty", () => {
  const w = S.create("v270-software-real", { autonomous: false });
  prepare(w, { subjects: ["software", "programming"] });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 50000000 });

  // Contract swproj-1 (discovery -> contracted)
  assert.equal(S.command(w, { type: "advanceSoftwareProject", projectId: "swproj-1" }).ok, true);
  const proj = w.softwareBusiness.projects["swproj-1"];
  assert.equal(proj.status, "contracted");

  // 1) Zero qualified developers => zero development progress
  const savedSubjects = w.people.map((p) => ({
    id: p.id,
    sw: p.education.subjects.software,
    prog: p.education.subjects.programming,
  }));
  for (const p of w.people) {
    p.education.subjects.software = 0;
    p.education.subjects.programming = 0;
  }
  const noDev = S.command(w, { type: "advanceSoftwareProject", projectId: "swproj-1", minutes: 60 });
  assert.equal(noDev.ok, false);
  assert.equal(noDev.code, "noQualifiedDeveloper");
  assert.equal(proj.progressMinutes, 0);

  // Restore developers
  for (const s of savedSubjects) {
    const p = w.people.find((x) => x.id === s.id);
    if (p) {
      p.education.subjects.software = s.sw;
      p.education.subjects.programming = s.prog;
    }
  }

  // 2) Compare low-skill/fatigued vs high-skill/rested software cohorts on speed and defect generation
  const wLow = S.create("v270-sw-cohort", { autonomous: false });
  const wHigh = S.create("v270-sw-cohort", { autonomous: false });
  for (const p of wLow.people) {
    p.atWork = true;
    p.education.subjects.software = 42;
    p.education.subjects.programming = 42;
    p.state.fatigue = 82;
    p.state.burnout = 65;
  }
  for (const p of wHigh.people) {
    p.atWork = true;
    p.education.subjects.software = 95;
    p.education.subjects.programming = 95;
    p.state.fatigue = 5;
    p.state.burnout = 5;
  }
  S.command(wLow, { type: "advanceSoftwareProject", projectId: "swproj-1" });
  S.command(wHigh, { type: "advanceSoftwareProject", projectId: "swproj-1" });

  // Run 4 sprints (40 raw minutes) of active software implementation
  for (let i = 0; i < 4; i++) {
    S.command(wLow, { type: "advanceSoftwareProject", projectId: "swproj-1", minutes: 10 });
    S.command(wHigh, { type: "advanceSoftwareProject", projectId: "swproj-1", minutes: 10 });
  }
  const pLow = wLow.softwareBusiness.projects["swproj-1"];
  const pHigh = wHigh.softwareBusiness.projects["swproj-1"];
  assert.ok(pHigh.progressMinutes > pLow.progressMinutes, `High-skill dev progress (${pHigh.progressMinutes}) must exceed low-skill (${pLow.progressMinutes})`);

  // Finish implementation on both and compare generated defects
  while (pLow.status === "implementing") {
    S.command(wLow, { type: "advanceSoftwareProject", projectId: "swproj-1", minutes: 30 });
  }
  while (pHigh.status === "implementing") {
    S.command(wHigh, { type: "advanceSoftwareProject", projectId: "swproj-1", minutes: 30 });
  }
  assert.ok(pHigh.defectsFound <= pLow.defectsFound, `High-skill defects (${pHigh.defectsFound}) must not exceed low-skill (${pLow.defectsFound})`);

  // 3) Scope change discovery & manager evaluation
  const reqBefore = proj.requiredDevMinutes;
  S.command(w, { type: "advanceSoftwareProject", projectId: "swproj-1", minutes: 20, discoverScopeChange: true });
  assert.equal(proj.scopeChangeEvaluated, true);
  assert.ok(["approved_scope_extension", "rejected_frozen_scope"].includes(proj.scopeChangeResolution));
  if (proj.scopeChangeResolution === "approved_scope_extension") {
    assert.ok(proj.requiredDevMinutes > reqBefore);
  }

  // 4) Deploying with unresolved defects (deployWithKnownDefects: true) triggers downstream SLA/rework penalty & support tickets
  const subProj = S.command(w, {
    type: "startSoftwareProject",
    appId: "pos_retail",
    clientCorpId: "cp_health",
  });
  assert.equal(subProj.ok, true);
  const sp = w.softwareBusiness.projects[subProj.projectId];
  S.command(w, { type: "advanceSoftwareProject", projectId: sp.id, injectDefects: 3, minutes: 1000 }); // contracted -> testing with 3 defects
  assert.equal(sp.status, "testing");
  sp.qaProgressMinutes = sp.requiredQaMinutes; // actual QA time fixture
  S.command(w, { type: "advanceSoftwareProject", projectId: sp.id, deployWithKnownDefects: true }); // testing -> customer_acceptance with known defects
  assert.equal(sp.deployedWithDefects, true);
  assert.equal(sp.unresolvedDefectsAtDeploy, 3);
  S.command(w, { type: "advanceSoftwareProject", projectId: sp.id }); // customer_acceptance -> deployed
  const repBefore = w.reputation;
  const supRes = S.command(w, { type: "advanceSoftwareProject", projectId: sp.id }); // deployed -> supporting
  assert.equal(supRes.ok, true);
  assert.ok(sp.reworkCostSatang > 0, "Deploying with known defects must incur SLA/rework penalty cost");
  assert.ok(w.reputation < repBefore, "Deploying with known defects reduces company reputation");
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v2.7.0 AC6: Equipment Engineering, Subsystem Fault Diagnosis, Technician Skill Comparison & Acquisition Modes", () => {
  const w = S.create("v270-equipment-tech", { autonomous: false });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 80000000 });

  // 1) Acquisition modes: purchased_new, used_refurbished, leased BEFORE prepare() installs all machines
  assert.equal(P.request(w, "smelter", plantHooks(w), { acquisitionMode: "purchased_new" }), true);
  assert.equal(w.plant.machines.smelter.acquisitionMode, "purchased_new");
  assert.equal(w.plant.machines.smelter.status, "installing");
  assert.equal(w.plant.machines.smelter.costSatang, P.SPECS.smelter.cost);

  assert.equal(P.request(w, "press", plantHooks(w), { acquisitionMode: "used_refurbished" }), true);
  assert.equal(w.plant.machines.press.acquisitionMode, "used_refurbished");
  assert.ok(w.plant.machines.press.condition < w.plant.machines.smelter.condition, "Used refurbished machine starts with lower condition than new");
  assert.ok(w.plant.machines.press.costSatang < P.SPECS.press.cost, "Used refurbished machine has lower upfront cost");

  assert.equal(P.request(w, "autoclave", plantHooks(w), { acquisitionMode: "leased" }), true);
  assert.equal(w.plant.machines.autoclave.acquisitionMode, "leased");
  assert.equal(w.plant.machines.autoclave.costSatang, Math.round(P.SPECS.autoclave.cost * 0.25));

  // 2) Technician capability comparison (low-skill vs high-skill engineer)
  const eng = w.people.find((p) => p.role === "engineer") || w.people[0];
  eng.atWork = true;
  eng.position = { ...w.layout.stations.assembly1.access };
  eng.education.subjects.maintenance = 20;
  eng.education.subjects.electrical_basics = 15;
  const lowCap = P.technicianCapability(eng, "electronics_bench");

  eng.education.subjects.maintenance = 95;
  eng.education.subjects.electrical_basics = 92;
  const highCap = P.technicianCapability(eng, "electronics_bench");

  assert.ok(highCap.speed > lowCap.speed, "High-skill technician repairs faster");
  assert.ok(highCap.diagnosticAccuracy > lowCap.diagnosticAccuracy, "High-skill technician has higher diagnostic accuracy");

  // 3) Induce breakdown, verify missing parts block repair, then supply parts & complete return-to-service acceptance
  const bench = w.plant.machines.electronics_bench;
  bench.condition = 12;
  bench.subsystems.electrical = 18;
  // Clear install tasks from maintenance queue so we isolate electronics_bench repair
  w.plant.maintenance = [];
  delete w.plant.machines.smelter;
  delete w.plant.machines.press;
  delete w.plant.machines.autoclave;

  P.review(w, plantHooks(w));
  assert.equal(bench.status, "maintenance");

  const part = "wire_harness";
  w.inventory.opening[part] -= w.inventory.materials[part];
  w.inventory.materials[part] = 0;

  P.maintain(w, plantHooks(w));
  const maintTask = w.plant.maintenance.find((t) => t.machineId === "electronics_bench");
  assert.equal(maintTask.progress, 0, "Missing spare parts must block repair progress");
  assert.ok(maintTask.diagnosedFaultTh, "Technician records fault diagnosis");

  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: part, quantity: 2 });
  for (let i = 0; i < 35; i++) {
    P.maintain(w, plantHooks(w));
    w.clock.absoluteMinute += 5;
    w.clock.tick++;
  }
  assert.equal(bench.status, "ready");
  assert.equal(bench.faultMode, null);
  assert.ok(Array.isArray(w.plant.serviceRecords) && w.plant.serviceRecords[0].returnToServiceTest === "passed");
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v2.7.0 AC7: Physical Warehouse Lots, Custody, Cold-Chain Protection & Full Capacity Blocking", () => {
  const w = S.create("v270-warehouse-lots", { autonomous: false });
  prepare(w, { subjects: ["agriculture", "food_fermentation", "maintenance"] });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 50000000 });

  // 1) With active cold_room and no brownout, fresh_milk_soy lots receive coldChainProtected = true and 10-day shelf life
  P.install(w, "cold_room");
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "fresh_milk_soy", quantity: 6 });
  S.reconcileWarehouseLots(w);
  assert.deepEqual(S.warehouseAudit(w), []);
  const protectedLot = w.warehouse.materialLots.fresh_milk_soy.find((l) => l.coldChainProtected === true);
  assert.ok(protectedLot);
  assert.equal(protectedLot.expiresDay, 11);

  // 2) When cold chain fails (brownoutActive = true), newly received perishable lots have shorter shelf life (4 days) and coldChainProtected = false
  w.utilities.brownoutActive = true;
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "fresh_milk_soy", quantity: 4 });
  S.reconcileWarehouseLots(w);
  const unprotectedLot = w.warehouse.materialLots.fresh_milk_soy.find((l) => l.coldChainProtected === false);
  assert.ok(unprotectedLot);
  assert.equal(unprotectedLot.expiresDay, 5);
  w.utilities.brownoutActive = false;

  // 3) Full warehouse blocks refinery batch release at inspection until warehouse space is available
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "paddy_grain", quantity: 6 });
  const craftRes = S.command(w, { type: "craftMaterial", materialId: "milled_rice", batches: 1 });
  assert.equal(craftRes.ok, true);
  const batch = w.plant.refineryBatches[craftRes.batchId];
  batch.status = "inspection";
  batch.inputsReserved = false;
  batch.inputsConsumed = true;
  w.inventory.reserved.paddy_grain = Math.max(0, (w.inventory.reserved.paddy_grain || 0) - 2);
  w.inventory.opening.paddy_grain -= 2;
  w.inventory.materials.paddy_grain -= 2;
  batch.inspectDone = batch.unloadInspectMinutes;

  // Run tickRefinery with warehouseAvailable returning false => batch stays in 'inspection' (blocked by full warehouse)
  w.clock.absoluteMinute += 5;
  w.clock.tick++;
  P.tickRefinery(w, 5, {
    warehouseAvailable: () => false,
    releaseBatch: () => {},
  });
  assert.equal(batch.status, "inspection");
  assert.ok(batch.waitingReasonTh.includes("รอพื้นที่ว่างในคลังสินค้า"));

  // Once warehouse space is available, batch releases cleanly
  w.clock.absoluteMinute += 5;
  w.clock.tick++;
  let released = false;
  P.tickRefinery(w, 5, {
    warehouseAvailable: () => true,
    releaseBatch: () => {
      released = true;
      w.inventory.opening.milled_rice = (w.inventory.opening.milled_rice || 0) + 2;
      w.inventory.materials.milled_rice = (w.inventory.materials.milled_rice || 0) + 2;
    },
  });
  assert.equal(batch.status, "released");
  assert.equal(released, true);
  S.reconcileWarehouseLots(w);
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v2.7.0 AC8: Commercial Tenders, Competitive Evaluation, Contract Renegotiation & Orderly Termination", () => {
  const w = S.create("v270-commercial-tenders", { autonomous: false });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 100000000 });
  S.advance(w, 13 * 1440 + 150);
  w.status = "running";
  w.policies.autoAccept = true;
  w.reputation = 82;
  for (const p of w.people) {
    p.atWork = true;
    p.path = [];
    p.education.subjects.quality_documentation = 65;
    p.education.subjects.contract_management = 65;
  }
  w.metrics.ordersPaid = 6;
  w.production.started.speaker = (w.production.started.speaker || 0) + 24;
  w.production.shipped.speaker = (w.production.shipped.speaker || 0) + 24;
  w.production.completed.speaker = (w.production.completed.speaker || 0) + 24;
  for (const [mId, qty] of Object.entries(w.catalog.products.speaker.bom)) {
    w.inventory.opening[mId] = (w.inventory.opening[mId] || 0) + 24 * qty;
    w.inventory.consumed[mId] = (w.inventory.consumed[mId] || 0) + 24 * qty;
  }

  // 1) Competitive tender evaluation runs during evaluateCommercialSales and records tender in w.commerce.tenders
  S.evaluateCommercialSales(w);
  assert.ok(Array.isArray(w.commerce.tenders) && w.commerce.tenders.length > 0, "Public tender evaluation must be recorded in w.commerce.tenders");
  const tender = w.commerce.tenders[0];
  assert.equal(typeof tender.playerScore, "number");
  assert.ok(Array.isArray(tender.competitors) && tender.competitors.length > 0);
  assert.equal(typeof tender.competitors[0].score, "number");

  // 2) Contract renegotiation reduces remaining quantity and adjusts buyer escrow cleanly
  const contract = Object.values(w.commerce.contracts).find((c) => c.status === "awarded");
  assert.ok(contract);
  const qtyBefore = contract.quantity;
  const escrowBefore = w.externalWorld.living.commercialEscrows[contract.id].balance;
  const reneg = S.renegotiateCommercialContract(w, contract.id, {
    newQuantity: Math.floor(qtyBefore * 0.5),
  });
  assert.equal(reneg.ok, true);
  assert.ok(contract.quantity < qtyBefore);
  assert.ok(w.externalWorld.living.commercialEscrows[contract.id].balance < escrowBefore);
  assert.deepEqual(S.commercialAudit(w), []);
  assert.deepEqual(W.validate(w), []);

  // 3) Orderly contract termination settles remaining escrow without leaving stuck obligations
  const term = S.terminateCommercialContract(w, contract.id, "ยุติสัญญาตามข้อตกลงร่วม");
  assert.equal(term.ok, true);
  assert.equal(contract.status, "terminated");
  const esc = w.externalWorld.living.commercialEscrows[contract.id];
  assert.equal(esc.balance, 0);
  assert.equal(esc.opening, esc.paid + esc.returned);
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v2.7.0 AC9: Biological Livestock Digestion/Lactation Cycle & External World Accrual Profit/COGS", () => {
  const w = S.create("v270-bio-world", { autonomous: false });
  prepare(w, { subjects: ["animal_husbandry", "agriculture"] });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 40000000 });
  S.command(w, { type: "directorEdit", action: "addMaterials", quantity: 10 });

  const milkBefore = w.inventory.materials.fresh_milk_soy || 0;
  const feed = S.command(w, { type: "feedLivestockHerd", assetId: "dairy_soy_farm" });
  assert.equal(feed.ok, true);
  assert.equal(feed.milkingStage, "digesting");
  assert.equal(w.inventory.materials.fresh_milk_soy || 0, milkBefore, "Feeding alone must not yield immediate milk at tick +0");

  // Premature milking before 180 minutes is rejected
  const prematureMilk = S.command(w, { type: "milkLivestockHerd", assetId: "dairy_soy_farm" });
  assert.equal(prematureMilk.ok, false);
  assert.equal(prematureMilk.code, "lactationCycleIncomplete");

  // Advance 180 minutes and verify biological milk harvest
  S.advance(w, 180);
  assert.ok((w.inventory.materials.fresh_milk_soy || 0) > milkBefore, "Milk harvested after 180-minute biological cycle");

  // External world firm accrual profit vs cash-flow surplus separation
  S.updateExternalWorld(w, 2);
  const firm = Object.values(w.externalWorld.living.firms)[0];
  assert.ok("cogsSatang" in firm);
  assert.ok("operatingExpenseSatang" in firm);
  assert.ok("accrualProfitSatang" in firm);
  assert.ok("cashFlowSurplusSatang" in firm);
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(W.validate(w), []);
});

test("v2.7.0 AC10 & AC11: Determinism, Snapshot Purity, Mid-Operation Save/Load & Multi-Scenario Stability", () => {
  // 1) Mid-operation save/load roundtrip with active refinery, freight, software & service jobs
  const w = S.create("v270-midop-continuity", { autonomous: false });
  prepare(w, {
    subjects: ["agriculture", "food_fermentation", "software", "programming", "metrology", "quality", "maintenance"],
  });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 80000000 });
  S.command(w, { type: "directorEdit", action: "addMaterials", quantity: 12 });

  S.command(w, { type: "craftMaterial", materialId: "milled_rice", batches: 2 });
  S.command(w, { type: "acceptFreightContract", quoteId: "fquote-1", vehicleId: "truck-1" });
  S.command(w, { type: "advanceFreightContract", contractId: "fcontract-1" });
  S.command(w, { type: "advanceSoftwareProject", projectId: "swproj-1" });
  S.command(w, { type: "startServiceOrder", serviceTypeId: "calibration_lab", clientCorpId: "siam_auto" });

  S.advance(w, 15);

  // Snapshot purity via API.create + load: repeated snapshot calls must never mutate save payload or RNG
  const saveBeforeSnap = Save.serialize(w);
  const app = API.create("v270-snap-purity", { autonomous: false });
  app.load(saveBeforeSnap);
  const snap1 = app.snapshot();
  const snap2 = app.snapshot();
  assert.deepEqual(snap1, snap2);
  assert.equal(app.save(), saveBeforeSnap, "API.snapshot must never mutate world state");
  assert.ok(snap1.plant && snap1.plant.refineryBatches);
  assert.ok(snap1.warehouse && snap1.warehouse.materialLots);

  // Save/load roundtrip mid-operation and continue stepping
  const wLoaded = Save.deserialize(saveBeforeSnap);
  for (let i = 0; i < 12; i++) {
    S.step(w);
    S.step(wLoaded);
  }
  assert.equal(Save.serialize(wLoaded), Save.serialize(w), "Mid-operation save/load must preserve exact deterministic continuation");
  assert.deepEqual(S.audit(wLoaded), []);
  assert.deepEqual(Save.validate(wLoaded), []);

  // 2) Multi-scenario stability across normal, capital-poor, skill-poor, and supply-shocked seeds
  const scenarios = [
    { seed: "v270-sc-normal", mode: "normal" },
    { seed: "v270-sc-cap-poor", mode: "capital_poor" },
    { seed: "v270-sc-skill-poor", mode: "skill_poor" },
    { seed: "v270-sc-supply-shock", mode: "supply_shock" },
  ];
  for (const sc of scenarios) {
    const sw = S.create(sc.seed, { autonomous: true });
    if (sc.mode === "capital_poor") {
      const drain = Math.max(0, sw.finance.cash - 50000);
      sw.finance.openingCash -= drain;
      sw.finance.cash -= drain;
    } else if (sc.mode === "skill_poor") {
      for (const p of sw.people) {
        for (const k of Object.keys(p.education.subjects)) p.education.subjects[k] = 5;
      }
    } else if (sc.mode === "supply_shock") {
      W.scenario(sw, "red_sea_blockade", 1, 7);
    }
    S.advance(sw, 1440 * 3);
    assert.deepEqual(S.audit(sw), [], `Scenario ${sc.mode} failed S.audit`);
    assert.deepEqual(Save.validate(sw), [], `Scenario ${sc.mode} failed Save.validate`);
  }
});
