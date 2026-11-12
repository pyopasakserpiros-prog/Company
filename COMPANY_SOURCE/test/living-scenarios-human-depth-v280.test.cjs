"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const P = require("../js/plant.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");
const prepare = require("./knowledge-fixtures.cjs");

test("v2.8.0 Pillar 1: Multi-Scenario Bottlenecks — Broken Machine, Locked/Missing Spare Part, Specialist Gap, Overloaded Contract Renegotiation, and Unsold Stock Clearance", () => {
  assert.strictEqual(D.VERSION, "2.8.0");
  assert.strictEqual(D.RELEASE_VERSION, "2.8.0");
  assert.strictEqual(S.RELEASE_VERSION, "2.8.0");

  // Scenario A & B: Cash-rich company with broken critical machine, missing specialist, and spare part locked in production reservation
  const w = S.create("v280-crisis-scenarios", { autonomous: true });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 50000000 });

  // Break the electronics_bench so it requires repair part (wire_harness) and electrical_basics >= 25
  const bench = w.plant.machines.electronics_bench;
  bench.condition = 20;
  bench.status = "maintenance";
  w.plant.maintenance.push({
    id: "maint-test-bench",
    machineId: "electronics_bench",
    kind: "repair",
    required: 60,
    progress: 0,
    partConsumed: false,
    technicianId: null,
    createdAt: 0,
  });

  // Remove all staff knowledge of electrical_basics so the company has cash but lacks a specialist
  for (const p of w.people) {
    if (p.education?.subjects) {
      p.education.subjects.electrical_basics = 10;
    }
  }

  // Trigger crisis resolver: it should assign study and/or hire a specialist and/or contract OEM maintenance
  const crisisRes = S.evaluateOperationalCrisesAndBottlenecks(w);
  assert.strictEqual(crisisRes.ok, true);
  assert.ok(crisisRes.actions.length >= 1, "Crisis resolver takes autonomous action when machine is stuck without specialist");

  // Direct OEM Contractor repair consumes real spare part and restores machine
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "wire_harness", quantity: 2 });
  const oemRes = S.contractOemMaintenance(w, "electronics_bench");
  assert.strictEqual(oemRes.ok, true);
  assert.strictEqual(w.plant.machines.electronics_bench.status, "ready");
  assert.ok(w.plant.machines.electronics_bench.condition >= 90);
  assert.strictEqual((w.plant.partsConsumed.wire_harness || 0) >= 1, true, "OEM repair consumes real spare part (wire_harness)");

  // Scenario C: Overloaded / Late Commercial Contract triggers autonomous renegotiation
  for (const p of w.people) {
    p.atWork = true;
    p.path = [];
  }
  w.metrics.ordersPaid = 6;
  w.production.started.speaker += 24;
  w.production.completed.speaker += 24;
  w.production.shipped.speaker += 24;
  for (const [m, q] of Object.entries(w.catalog.products.speaker.bom)) {
    w.inventory.opening[m] += q * 24;
    w.inventory.consumed[m] += q * 24;
  }
  w.clock.absoluteMinute = 13 * 1440 + 690; // Day 14 (Math.floor(absoluteMinute / 1440) + 1 === 14)
  w.clock.tick = (w.clock.absoluteMinute - 540) / S.TICK;
  w.lastSettledDay = 13;
  S.evaluateCommercialSales(w); // Creates contract
  S.evaluateCommercialSales(w); // Creates installment order
  const contracts = Object.values(w.commerce?.contracts || {});
  assert.ok(contracts.length >= 1, "Commercial contract created");
  const contract = contracts[0];
  const initialQty = contract.quantity;
  const activeOrder = w.orders[contract.currentOrderId];
  assert.ok(activeOrder, "Active installment order exists");
  // Simulate approaching deadline with 0 ready units
  activeOrder.deadline = w.clock.absoluteMinute + 360;
  S.evaluateCommercialSales(w);
  assert.ok(contract.quantity < initialQty || (contract.renegotiatedCount || 0) >= 1, "Late installment triggers autonomous contract renegotiation");

  // Scenario D: Unsold Finished Goods in Warehouse populate finishedLots and trigger clearance deal
  const stockOrder = {
    id: "stock-v280-1",
    offerId: null,
    customerName: "ผลิตเก็บคลังพร้อมขาย",
    productId: "speaker",
    quantity: 2,
    unitPrice: 1,
    total: 2,
    deposit: 0,
    acceptedAt: 540,
    deadline: 540 + 1440 * 30,
    paymentMinutes: 0,
    shipped: 0,
    completedAt: null,
    status: "accepted",
    stockBatch: true,
    materialConsumed: true,
  };
  w.orders[stockOrder.id] = stockOrder;
  for (let i = 1; i <= 2; i++) {
    const uid = `unit-v280-${i}`;
    w.units[uid] = {
      id: uid,
      orderId: stockOrder.id,
      productId: "speaker",
      stage: "ready",
      quality: 0.9,
      attempts: 0,
      reserved: false,
      materialConsumed: true,
    };
    for (const [m, q] of Object.entries(w.catalog.products.speaker.bom)) {
      w.inventory.opening[m] += q;
      w.inventory.consumed[m] += q;
    }
    w.production.started.speaker += 1;
    w.production.completed.speaker += 1;
    w.inventory.finished.speaker += 1;
  }
  S.reconcileWarehouseLots(w);
  assert.strictEqual(
    (w.warehouse.finishedLots.speaker || []).reduce((a, l) => a + l.qty, 0),
    w.inventory.finished.speaker,
    "finishedLots reconciles 100% with w.inventory.finished",
  );
  assert.deepStrictEqual(S.audit(w), []);
  assert.deepStrictEqual(Save.validate(w), []);
});

test("v2.8.0 Pillar 2: Counterfactual Comparison — Changing CEO Personality, Technician Knowledge, or Capital Produces Divergent Trajectories from Identical Seed", () => {
  const base = S.create("v280-counterfactual-seed", { autonomous: true });

  // 1. Prudent vs Risk-Taking CEO with ample capital
  S.command(base, { type: "directorEdit", action: "grantCash", amount: 60000000 });
  const ceo = base.people.find((p) => p.role === "coordinator");
  S.command(base, { type: "directorEdit", action: "setTrait", personId: ceo.id, group: "personality", key: "prudence", value: 92 });
  S.command(base, { type: "directorEdit", action: "setTrait", personId: ceo.id, group: "personality", key: "riskTaking", value: 15 });

  const cmpCeo = S.runCounterfactualComparison(
    base,
    {
      ceoPersonality: { prudence: 18, riskTaking: 92, ambition: 90 },
    },
    5,
  );
  assert.strictEqual(cmpCeo.diverged, true, "Risk-taking vs Prudent CEO diverges over 5 days");
  assert.ok(typeof cmpCeo.summaryTh === "string" && cmpCeo.summaryTh.length > 10);

  // 2. Novice vs Master Technicians
  const cmpTech = S.runCounterfactualComparison(
    base,
    {
      technicianSubjects: { embedded_iot: 95, smt_process: 95, electrical_basics: 95, quality: 95 },
    },
    4,
  );
  assert.strictEqual(cmpTech.diverged, true, "Master technicians vs baseline technicians diverge");
});

test("v2.8.0 Pillar 3: Live Observability View ('ใครกำลังทำอะไร ติดอะไร กำลังแก้ยังไง') & Persistent Watchlist Across Save/Load", () => {
  const app = API.create("v280-observability", { autonomous: true });
  const snap1 = app.snapshot();
  assert.ok(snap1.observability, "Snapshot exposes observability object");
  assert.ok(Array.isArray(snap1.observability.activeBottlenecks));
  assert.ok(Array.isArray(snap1.observability.peopleWorkboard));
  assert.strictEqual(snap1.observability.peopleWorkboard.length, snap1.people.filter((p) => p.employed).length);

  for (const row of snap1.observability.peopleWorkboard) {
    assert.ok(row.doingWhatTh, "Workboard row includes doingWhatTh");
    assert.ok(row.stuckOnTh, "Workboard row includes stuckOnTh");
    assert.ok(row.solvingHowTh, "Workboard row includes solvingHowTh");
  }

  // Star a person and a bottleneck and verify persistence across save/load
  const targetPersonId = snap1.people[0].id;
  const starRes = app.dispatch({
    type: "toggleWatchlist",
    targetType: "person",
    targetId: targetPersonId,
    labelTh: "ติดตาม CEO",
  });
  assert.strictEqual(starRes.ok, true);
  assert.strictEqual(starRes.starred, true);

  const savedJson = app.save();
  const app2 = API.create("other-seed");
  const loadRes = app2.load(savedJson);
  assert.strictEqual(loadRes.ok, true);
  const snap2 = app2.snapshot();
  assert.ok(snap2.watchlist.people.includes(targetPersonId), "Starred person persists across Save/Load");
  assert.strictEqual(snap2.people.find((p) => p.id === targetPersonId).starred, true);
  assert.deepStrictEqual(app2.audit(), []);
});

test("v2.8.0 Pillar 4: Deep Human & Organizational Life — Aspirations, Memories, Conflict, Internal Career Switch, Retention Counter-Offers, and Live Spin-off Firms", () => {
  const w = S.create("v280-human-depth", { autonomous: true });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 40000000 });

  // 1. Every person has an initialized personal aspiration and memory array
  for (const p of w.people) {
    assert.ok(p.aspiration && typeof p.aspiration.id === "string", `${p.id} has aspiration`);
    assert.ok(Array.isArray(p.memories), `${p.id} has memories array`);
  }

  // 2. Internal Career Switch moves an employee to a needed role and records memory
  const asm = w.people.find((p) => p.employed && p.role === "assembler");
  const switchRes = S.command(w, {
    type: "evaluateInternalCareerSwitch",
    personId: asm.id,
    toRole: "engineer",
    force: true,
  });
  assert.strictEqual(switchRes.ok, true);
  assert.strictEqual(asm.role, "engineer");
  assert.ok(asm.memories.some((m) => m.type === "career_switch"));
  assert.strictEqual(w.culture.roleSwitches.length >= 1, true);

  // 3. Employee Retention Counter-Offer raises wage, pays bonus with 100% payroll conservation, and clears concern
  asm.concern = { day: 1, action: "considerLeaving", reasons: ["ค่าตอบแทนไม่สอดคล้องกับภาระงาน"] };
  const retRes = S.command(w, {
    type: "evaluateEmployeeRetention",
    personId: asm.id,
    force: true,
  });
  assert.strictEqual(retRes.ok, true);
  assert.strictEqual(asm.concern, null);
  assert.ok(asm.memories.some((m) => m.type === "retained_counteroffer"));
  assert.strictEqual(w.culture.retentionOffers.length >= 1, true);

  // 4. Alumni Spin-off creates both externalWorld.corporations AND externalWorld.living.firms entry passing W.validate
  const spinoffRes = S.command(w, {
    type: "evaluateEmployeeSpinoff",
    personId: asm.id,
    force: true,
  });
  assert.strictEqual(spinoffRes.ok, true);
  const corpId = spinoffRes.spinoff.corpId;
  assert.ok(w.externalWorld.corporations[corpId], "Spin-off registered in corporations");
  assert.ok(w.externalWorld.living.firms[corpId], "Spin-off registered in living.firms for active B2B trade");
  assert.ok(asm.memories.some((m) => m.type === "founded_spinoff"));

  assert.deepStrictEqual(S.audit(w), []);
  assert.deepStrictEqual(Save.validate(w), []);
});
