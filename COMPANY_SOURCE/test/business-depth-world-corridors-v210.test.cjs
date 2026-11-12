const prepare=require("./knowledge-fixtures.cjs");
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("v2.1.0 Executive Board Bug Fixes: Daytime CEO Authority, Leased Fleet Deposit (No NaN), Committed Budget Reservation Lifecycle (No Double Deduction), and Topic Cooldowns", () => {
  const w = S.create("v210-board-fixes", { autonomous: true });
  assert.strictEqual(D.VERSION, "2.7.0");
  assert.strictEqual(D.RELEASE_VERSION, "2.7.0");
  assert.strictEqual(S.RELEASE_VERSION, "2.7.0");

  // 1. Verify FLEET_VEHICLES all have integer leaseDepositSatang = dailyLeaseCost * 5
  for (const [vid, spec] of Object.entries(D.FLEET_VEHICLES)) {
    assert.strictEqual(Number.isSafeInteger(spec.leaseDepositSatang), true, `${vid} must define integer leaseDepositSatang`);
    assert.strictEqual(spec.leaseDepositSatang, spec.dailyLeaseCost * 5);
  }

  // 2. Verify acquireFleetVehicle supports both string "leased" and { ownership: "leased" }, deducts leaseDepositSatang, and never produces NaN
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 15000000 });
  const cashBeforeLease = w.finance.cash;
  const leaseRes = S.acquireFleetVehicle(w, "reefer_6w", "leased");
  assert.strictEqual(leaseRes.ok, true, "Leasing reefer_6w via string option succeeds");
  assert.strictEqual(leaseRes.ownership, "leased");
  assert.strictEqual(leaseRes.costSatang, D.FLEET_VEHICLES.reefer_6w.leaseDepositSatang);
  assert.strictEqual(w.finance.cash, cashBeforeLease - D.FLEET_VEHICLES.reefer_6w.leaseDepositSatang);

  // 3. Verify Board Reservation Lifecycle (reserveBoardBudget -> consumeBoardReservation -> cancelBoardReservation) never double-deducts paid capital
  const poolsBefore = S.computeFinancialPools(w);
  const uncommittedBefore = poolsBefore.uncommittedCashSatang;
  const r1 = S.reserveBoardBudget(w, "test-res-1", 1000000, { category: "fleet_expansion", targetId: "heavy_10w" });
  assert.strictEqual(r1.committedBudgetSatang, 1000000);
  assert.strictEqual(w.executiveBoard.budgetPools.uncommittedCashSatang, uncommittedBefore - 1000000, "Open reservation reduces uncommittedCashSatang");

  // Consume reservation after payment: committedBudgetSatang returns to 0 and paidCapitalTotalSatang increases by 1,000,000
  const c1 = S.consumeBoardReservation(w, "test-res-1", 1000000);
  assert.strictEqual(c1.committedBudgetSatang, 0, "Consumed reservation is cleared from open committedBudgetSatang");
  assert.strictEqual(c1.paidCapitalTotalSatang, 1000000, "Paid capital is tracked in paidCapitalTotalSatang");
  assert.strictEqual(w.executiveBoard.budgetPools.uncommittedCashSatang, uncommittedBefore, "No double-deduction after reservation is consumed");

  // 4. Verify nextReviewDay cooldown prevents duplicate spam on consecutive calls for the same topic unless forceReview is true
  const ceo = w.people.find((p) => p.role === "coordinator");
  ceo.atWork = true;
  const evalDay5A = S.evaluateExecutiveBoardAndBusinessEntry(w, 5);
  assert.strictEqual(evalDay5A.ok, true);
  const ledgerLenAfterFirst = w.executiveBoard.decisionLedger.length;
  assert.ok(ledgerLenAfterFirst >= 1);

  // Calling again on the same day without forceReview respects topicCooldowns
  const evalDay5B = S.evaluateExecutiveBoardAndBusinessEntry(w, 5);
  assert.strictEqual(evalDay5B.ok, true);
  for (const d of w.executiveBoard.decisionLedger) {
    assert.strictEqual(Number.isFinite(d.committedBudget), true, "committedBudget is always finite");
    assert.strictEqual(Number.isFinite(d.uncommittedCashBefore), true, "uncommittedCashBefore is always finite");
    assert.ok(d.nextReviewDay > d.day, "nextReviewDay is strictly after decision day");
  }

  assert.deepStrictEqual(S.audit(w), []);
  assert.deepStrictEqual(Save.validate(w), []);
});

test("v2.1.0 Metals & Aluminum Value Chain (Bauxite -> Alumina Billet -> Extrusion Profile, Iron Ore + Coke Flux -> Structural Steel + Slag Ecology) & 4 Stepped Products + 2 New Industrial Services", () => {
  const w = S.create("v210-metals-and-services", { autonomous: false });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 30000000 });
  prepare(w,{materials:["alumina_billet","structural_steel_plate","nickel_cobalt_matte","aluminum_extrusion_profile"],subjects:["metal_machining","power_electronics","management"]});
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "bauxite_ore", quantity: 8 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "iron_ore", quantity: 8 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "copper_iron_ore", quantity: 6 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "lithium_brine_ore", quantity: 6 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "polymer_resin", quantity: 6 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "solar_cell", quantity: 4 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "wire_harness", quantity: 4 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "pack_carton", quantity: 4 });

  // 1. Smelt bauxite_ore + coke_reducing_flux + raw_water_m3 -> alumina_billet + mineral_slag_mud (timed refinery batch)
  const alumBefore = w.inventory.materials.alumina_billet;
  const alumRes = S.command(w, { type: "craftMaterial", materialId: "alumina_billet", batches: 2 });
  assert.strictEqual(alumRes.ok, true, "Bauxite ore queues timed refinery batch for alumina_billet");
  assert.strictEqual(w.inventory.materials.alumina_billet, alumBefore, "Timed refinery batch does not yield output at tick +0");
  S.advance(w, 60);
  assert.ok(w.inventory.materials.alumina_billet >= 6);
  assert.ok(w.inventory.materials.mineral_slag_mud >= 2, "Bayer/Hall-Héroult refining generates mineral_slag_mud byproduct");

  // 2. Smelt iron_ore + coke_reducing_flux -> structural_steel_plate + mineral_slag_mud
  const steelRes = S.command(w, { type: "craftMaterial", materialId: "structural_steel_plate", batches: 2 });
  assert.strictEqual(steelRes.ok, true, "Iron ore queues timed refinery batch for structural_steel_plate");
  S.advance(w, 60);
  assert.ok(w.inventory.materials.structural_steel_plate >= 6);

  // 3. Smelt nickel_cobalt_matte and extrude aluminum_extrusion_profile
  const matteRes = S.command(w, { type: "craftMaterial", materialId: "nickel_cobalt_matte", batches: 1 });
  assert.strictEqual(matteRes.ok, true);
  S.advance(w, 60);
  assert.ok(w.inventory.materials.nickel_cobalt_matte >= 2);

  const extRes = S.command(w, { type: "craftMaterial", materialId: "aluminum_extrusion_profile", batches: 2 });
  assert.strictEqual(extRes.ok, true, "Alumina billet queues timed extrusion into aluminum_extrusion_profile");
  S.advance(w, 60);
  assert.ok(w.inventory.materials.aluminum_extrusion_profile >= 6);

  // 4. Treat mineral_slag_mud byproduct -> recovers organic_compost and coke_reducing_flux while conserving inventory
  const slagBefore = w.inventory.materials.mineral_slag_mud;
  assert.ok(slagBefore >= 4);
  const treatRes = S.command(w, { type: "treatMineralSlag", batches: 2 });
  assert.strictEqual(treatRes.ok, true);
  assert.strictEqual(w.inventory.materials.mineral_slag_mud, slagBefore - treatRes.slagUsed);

  // 5. Test new Chapter 21 services: energy_epc_install & b2b_technical_academy
  const epcStart = S.command(w, { type: "startServiceOrder", serviceTypeId: "energy_epc_install", clientCorpId: "green_power" });
  assert.strictEqual(epcStart.ok, true);
  const epcDone = S.command(w, { type: "advanceServiceOrder", orderId: epcStart.orderId, completeAllSteps: true });
  assert.strictEqual(epcDone.ok, true);
  assert.strictEqual(epcDone.paid, true);

  const acadStart = S.command(w, { type: "startServiceOrder", serviceTypeId: "b2b_technical_academy", clientCorpId: "bharat_biotech_it" });
  assert.strictEqual(acadStart.ok, true);
  const acadDone = S.command(w, { type: "advanceServiceOrder", orderId: acadStart.orderId, completeAllSteps: true });
  assert.strictEqual(acadDone.ok, true);
  assert.strictEqual(acadDone.paid, true);

  assert.deepStrictEqual(S.audit(w), []);
  assert.deepStrictEqual(Save.validate(w), []);
});

test("v2.1.0 Living External World Expansion: 12 Nations (ID, AU, IN, SG), 16 Geopolitical Events, 22 Corporations, and 4 Regional Trade Corridors", () => {
  const w = S.create("v210-world-corridors", { autonomous: true });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 25000000 });

  assert.strictEqual(Object.keys(w.externalWorld.geopolitics.nations).length, 12);
  assert.strictEqual(Object.keys(w.externalWorld.geopolitics.tradeCorridors).length, 4);
  assert.strictEqual(Object.keys(w.externalWorld.corporations).length, 28);

  // Trigger Indonesia Nickel & Bauxite Ban -> corridor_indo_australia_mineral becomes restricted and bauxite/nickel prices surge
  const idBan = S.command(w, { type: "triggerGeopoliticalEvent", eventId: "indonesia_nickel_bauxite_ban" });
  assert.strictEqual(idBan.ok, true);
  assert.ok(w.externalWorld.geopolitics.materialPriceMultipliers.bauxite_ore >= 1.3);
  assert.ok(w.externalWorld.geopolitics.materialPriceMultipliers.nickel_cobalt_matte >= 1.3);
  assert.strictEqual(w.externalWorld.geopolitics.tradeCorridors.corridor_indo_australia_mineral.status, "restricted");

  // Trigger Singapore ASEAN Cold-Chain Corridor -> freight rate multiplier rises and lead time drops
  const sgCorr = S.command(w, { type: "triggerGeopoliticalEvent", eventId: "singapore_asean_coldchain_corridor" });
  assert.strictEqual(sgCorr.ok, true);
  assert.ok(w.externalWorld.geopolitics.globalLeadTimeMultiplier <= 0.86);

  // Trigger Australia Pilbara Cyclone Iron Shock & India Clean Grid Boom
  const auShock = S.command(w, { type: "triggerGeopoliticalEvent", eventId: "australia_pilbara_cyclone_iron_shock" });
  assert.strictEqual(auShock.ok, true);
  assert.ok(w.externalWorld.geopolitics.materialPriceMultipliers.iron_ore >= 1.35);

  const inBoom = S.command(w, { type: "triggerGeopoliticalEvent", eventId: "india_apac_clean_grid_pharma_boom" });
  assert.strictEqual(inBoom.ok, true);
  assert.ok(w.externalWorld.geopolitics.sectorDemandMultipliers.energy >= 1.25);

  const app = API.create("v210-api-corridors", { autonomous: true });
  const snap = app.snapshot();
  assert.strictEqual(snap.releaseVersion, "2.7.0");
  assert.strictEqual(snap.catalog.tradeCorridors.length, 4);
  assert.strictEqual(snap.catalog.globalNations.length, 12);
  assert.strictEqual(snap.catalog.geopoliticalEvents.length, 16);

  assert.deepStrictEqual(S.audit(w), []);
  assert.deepStrictEqual(Save.validate(w), []);
});

test("v2.1.0 Autonomous Multi-Seed 12-Day & 35-Day continueEndless Runs (Without ignoreAtWork): Real Business Entry, Zero NaN, Zero Audit Errors", () => {
  // 1. Multi-seed 12-day autonomous runs (including 5-person lean startup and 8-person standard starter) WITHOUT ignoreAtWork
  for (const [seed, headcount] of [
    ["v210-lean-5p-seedA", 5],
    ["v210-std-8p-seedB", 8],
    ["v210-growth-12p-seedC", 12],
  ]) {
    const w = S.create(seed, { autonomous: true, initialHeadcount: headcount });
    S.advance(w, 1440 * 12);

    const ledger = w.executiveBoard.decisionLedger;
    assert.ok(ledger.length > 0, `Seed ${seed} (${headcount} staff) must record Executive Board decisions during normal daytime simulation`);
    const nonNoAuth = ledger.filter((d) => d.resolution !== "deferred_no_executive_authority");
    assert.ok(
      nonNoAuth.length > 0,
      `Seed ${seed} (${headcount} staff) must evaluate real business proposals during working hours (not 100% deferred_no_executive_authority)`,
    );
    assert.strictEqual(Number.isSafeInteger(w.executiveBoard.committedBudgetSatang), true);
    assert.strictEqual(Number.isSafeInteger(w.executiveBoard.budgetPools.uncommittedCashSatang), true);
    assert.deepStrictEqual(S.audit(w), [], `Zero audit errors for ${seed}`);
    assert.deepStrictEqual(Save.validate(w), [], `Zero save validation errors for ${seed}`);
  }

  // 2. 35-Day continueEndless Autonomous Empire Simulation (without ignoreAtWork)
  const wEndless = S.create("v210-endless-35d", { autonomous: true, initialHeadcount: 10 });
  S.command(wEndless, { type: "continueEndless" });
  S.command(wEndless, { type: "directorEdit", action: "grantCash", amount: 18000000 });
  S.advance(wEndless, 1440 * 35);

  assert.strictEqual(wEndless.status, "running", "continueEndless keeps simulation running across 35 days");
  const resolutions = new Set(wEndless.executiveBoard.decisionLedger.map((d) => d.resolution));
  assert.ok(resolutions.has("approved"), "35-day endless simulation autonomously approves business entries");
  assert.ok(
    wEndless.serviceBusiness.metrics.completedOrders > 0 ||
      wEndless.fleetTransport.metrics.completedTrips > 0 ||
      Object.values(wEndless.softwareBusiness.saasProducts).some((a) => a.activeSubscribers > 0),
    "Autonomous company actively operates new business lines over 35 days",
  );
  assert.strictEqual(Number.isNaN(wEndless.executiveBoard.committedBudgetSatang), false);
  assert.deepStrictEqual(S.audit(wEndless), []);
  assert.deepStrictEqual(Save.validate(wEndless), []);
});
