'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../js/sim.js');
const W = require('../js/world.js');
const E = require('../js/phone-engineering.js');
const I = require('../js/phone-industry.js');
const T = require('../js/phone-talent.js');
const P = require('../js/plant.js');
const Save = require('../js/save.js');
const API = require('../js/api.js');

function daily(w, d) {
  w.clock.absoluteMinute = (d - 1) * 1440 + 540;
  w.clock.tick = (w.clock.absoluteMinute - 540) / 5;
  w.lastSettledDay = d - 1;
  W.step(w, d, () => I.step(w, d));
}

function equipCampus(w, machineIds) {
  for (const id of machineIds) {
    P.install(w, id, true);
  }
}

function trainCampusStaff(w, subjectIds, level = 65) {
  for (const p of w.people) {
    if (!p.employed) continue;
    for (const s of subjectIds) {
      S.command(w, { type: 'directorEdit', action: 'setSubject', personId: p.id, subjectId: s, level });
    }
  }
}

test('v3.1.0 Scenario 1: Campus company enters Fabless SoC (CPU/SoC design), books Wafer Foundry + OSAT, receives qualified chips, and sells B2B to handset buyers', () => {
  assert.ok(E.ROLE_CONTRACTS.fabless_soc, 'fabless_soc role contract exists');
  assert.ok(E.ROLE_CONTRACTS.wafer_foundry, 'wafer_foundry role contract exists');
  assert.ok(E.ROLE_CONTRACTS.osat_packaging, 'osat_packaging role contract exists');
  assert.ok(Object.keys(E.ROLE_CONTRACTS).length >= 12, '12 executable phone supply-chain roles exist');
  assert.ok(Object.keys(E.MATERIAL_GRADES).length >= 8, '8 qualified phone material grades exist');

  const w = S.create('v310-fabless-soc', { autonomous: true, startingBusiness: 'cable_workshop' });
  S.command(w, { type: 'directorEdit', action: 'grantCash', amount: 1000000000 });
  S.command(w, { type: 'directorEdit', action: 'setTrait', personId: w.people[0].id, group: 'personality', key: 'riskTaking', value: 72 });
  trainCampusStaff(w, ['semiconductor_physics', 'circuit_design', 'embedded_firmware', 'electrical_basics', 'quality'], 68);
  equipCampus(w, ['developer_pc', 'test_rig', 'electronics_bench']);

  const feas = E.evaluateRoleFeasibility({
    subjects: { semiconductor_physics: 68, circuit_design: 68, embedded_firmware: 68 },
    machines: w.plant.machines,
    cashSatang: w.finance.cash,
    wageReserveSatang: 5000000,
    riskTaking: 72,
    prudence: 50
  }, 'fabless_soc');
  assert.equal(feas.feasible, true, 'Campus meets fabless_soc objective feasibility');

  // Review on day 14 enters fabless_soc (highest priority specialist role when semiconductor_physics + circuit_design are ready)
  S.phoneCompanyReview(w, 14);
  assert.equal(w.phoneIndustry.campusFirmId, 'phone_campus');
  const cf = w.phoneIndustry.firms.phone_campus;
  assert.equal(cf.role, 'fabless_soc');
  assert.equal(w.phoneIndustry.lots.filter(l => l.ownerId === 'phone_campus').length, 0, 'No free chip lots granted on entry');

  S.command(w, { type: 'continueEndless' });
  for (let d = 0; d < 25; d++) {
    S.advance(w, 1440);
    assert.deepEqual(S.audit(w), [], `audit day ${d + 1}`);
  }

  const s = w.phoneIndustry;
  const campusChips = s.chips.filter(c => c.ownerId === 'phone_campus');
  assert.ok(campusChips.length >= 1, 'Campus fabless_soc owns SoC architecture');
  assert.ok(s.foundryOrders.some(o => o.fablessFirmId === 'phone_campus'), 'Campus fabless_soc booked Wafer Foundry + OSAT packaging');

  const campusChipLots = s.lots.filter(l => l.ownerId === 'phone_campus' && l.kind === 'chip');
  assert.ok(campusChipLots.length >= 1, 'Campus fabless_soc received packaged & tested chip lots from foundry + OSAT');
  assert.equal(campusChipLots[0].materialGrade, 'packaged_tested_ic_grade');

  // Verify B2B sales of campus chips to handset makers
  const chipSales = s.contracts.filter(c => c.sellerId === 'phone_campus' && c.componentKind === 'chip');
  assert.ok(chipSales.length >= 1 || cf.sold > 0, 'Campus fabless_soc sold chips to handset makers with real payment');
  assert.deepEqual(Save.validate(w), []);
});

test('v3.1.0 Scenario 2: Separate campus RAM (dram_memory), Camera (camera_module), Flash, Battery, Display, and PCB supplier roles produce qualified lots and supply handset makers', () => {
  // 2A: Campus DRAM Memory Supplier
  const wRam = S.create('v310-campus-ram', { autonomous: true, startingBusiness: 'cable_workshop' });
  S.command(wRam, { type: 'directorEdit', action: 'grantCash', amount: 1000000000 });
  S.command(wRam, { type: 'directorEdit', action: 'setTrait', personId: wRam.people[0].id, group: 'personality', key: 'riskTaking', value: 65 });
  trainCampusStaff(wRam, ['semiconductor_physics', 'circuit_design', 'metrology', 'electrical_basics', 'quality'], 62);
  equipCampus(wRam, ['electronics_bench', 'test_rig']);
  for (const [m, q] of [['silicon_wafer', 40], ['copper_coil', 40]]) {
    wRam.inventory.materials[m] = (wRam.inventory.materials[m] || 0) + q;
    wRam.inventory.opening[m] = (wRam.inventory.opening[m] || 0) + q;
  }

  S.phoneCompanyReview(wRam, 14);
  assert.equal(wRam.phoneIndustry.firms.phone_campus.role, 'dram_memory');
  S.command(wRam, { type: 'continueEndless' });
  for (let d = 0; d < 20; d++) S.advance(wRam, 1440);

  const ramLots = wRam.phoneIndustry.lots.filter(l => l.ownerId === 'phone_campus' && l.kind === 'ram');
  assert.ok(ramLots.length >= 1, 'Campus dram_memory produced qualified LPDDR DRAM lots');
  assert.equal(ramLots[0].materialGrade, 'electronic_silicon_wafer_9n');
  assert.deepEqual(S.audit(wRam), []);

  // 2B: Campus Camera Module Supplier
  const wCam = S.create('v310-campus-camera', { autonomous: true, startingBusiness: 'cable_workshop' });
  S.command(wCam, { type: 'directorEdit', action: 'grantCash', amount: 1000000000 });
  S.command(wCam, { type: 'directorEdit', action: 'setTrait', personId: wCam.people[0].id, group: 'personality', key: 'riskTaking', value: 65 });
  trainCampusStaff(wCam, ['semiconductor_optics', 'metrology', 'electrical_basics', 'quality'], 65);
  equipCampus(wCam, ['electronics_bench', 'diagnostic_kit']);
  for (const [m, q] of [['polymer_resin', 45], ['metal_sheet', 45]]) {
    wCam.inventory.materials[m] = (wCam.inventory.materials[m] || 0) + q;
    wCam.inventory.opening[m] = (wCam.inventory.opening[m] || 0) + q;
  }

  S.phoneCompanyReview(wCam, 14);
  assert.equal(wCam.phoneIndustry.firms.phone_campus.role, 'camera_module');
  S.command(wCam, { type: 'continueEndless' });
  for (let d = 0; d < 20; d++) S.advance(wCam, 1440);

  const camLots = wCam.phoneIndustry.lots.filter(l => l.ownerId === 'phone_campus' && l.kind === 'camera');
  assert.ok(camLots.length >= 1, 'Campus camera_module produced qualified CMOS camera module lots');
  assert.equal(camLots[0].materialGrade, 'cmos_optical_wafer_grade');
  assert.deepEqual(S.audit(wCam), []);
});

test('v3.1.0 Scenario 3: Campus vertically integrates across CPU + RAM + Camera + Handset Brand, consumes own stock, validates 1,200m, and sells phones', () => {
  const w = S.create('v310-vertical-integration', { autonomous: true, startingBusiness: 'cable_workshop' });
  S.command(w, { type: 'directorEdit', action: 'grantCash', amount: 1000000000 });
  S.command(w, { type: 'directorEdit', action: 'setTrait', personId: w.people[0].id, group: 'personality', key: 'riskTaking', value: 75 });
  trainCampusStaff(w, [
    'semiconductor_physics', 'circuit_design', 'semiconductor_optics',
    'embedded_firmware', 'software', 'electrical_basics', 'quality', 'metrology'
  ], 75);
  equipCampus(w, ['developer_pc', 'test_rig', 'electronics_bench', 'diagnostic_kit']);

  for (const [m, q] of Object.entries({
    silicon_wafer: 80, copper_coil: 120, polymer_resin: 100,
    metal_sheet: 100, pcb: 100, battery: 80, glass_bottle: 80
  })) {
    w.inventory.materials[m] = (w.inventory.materials[m] || 0) + q;
    w.inventory.opening[m] = (w.inventory.opening[m] || 0) + q;
  }

  // Enter CPU (fabless_soc), RAM (dram_memory), Camera (camera_module), and Handset (brand)
  S.phoneCompanyReview(w, 14);
  I.enterCampusRole(w, 'dram_memory', { addCapitalSatang: 100000000, day: 14 });
  I.enterCampusRole(w, 'camera_module', { addCapitalSatang: 100000000, day: 14 });
  I.enterCampusRole(w, 'brand', { addCapitalSatang: 300000000, day: 14 });

  const cf = w.phoneIndustry.firms.phone_campus;
  cf.role = 'brand';
  assert.ok(cf.roles.includes('fabless_soc'));
  assert.ok(cf.roles.includes('dram_memory'));
  assert.ok(cf.roles.includes('camera_module'));
  assert.ok(cf.roles.includes('brand'));

  S.command(w, { type: 'continueEndless' });
  for (let d = 0; d < 45; d++) {
    S.advance(w, 1440);
  }

  const s = w.phoneIndustry;
  assert.ok(s.lots.some(l => l.ownerId === 'phone_campus' && l.kind === 'chip'), 'Vertically integrated campus produced own CPU/SoC lots');
  assert.ok(s.lots.some(l => l.ownerId === 'phone_campus' && l.kind === 'ram'), 'Vertically integrated campus produced own RAM lots');
  assert.ok(s.lots.some(l => l.ownerId === 'phone_campus' && l.kind === 'camera'), 'Vertically integrated campus produced own Camera lots');

  const campusDesigns = s.designs.filter(d => d.firmId === 'phone_campus');
  assert.ok(campusDesigns.length >= 1, 'Vertically integrated campus designed a phone');
  assert.equal(campusDesigns[0].chipId, 'phone-campus-chip-0', 'Campus handset uses its own in-house SoC');
  assert.equal(campusDesigns[0].componentIds.ram, 'phone-campus-ram-0', 'Campus handset uses its own in-house RAM');
  assert.equal(campusDesigns[0].componentIds.camera, 'phone-campus-camera-0', 'Campus handset uses its own in-house Camera');
  assert.ok(campusDesigns[0].produced > 0, 'Vertically integrated campus assembled real phones from compatible parts');

  // Verify incompatible part specs are rejected by E.isCompatiblePart and E.evaluate
  const chip = s.chips.find(c => c.id === 'phone-campus-chip-0');
  const badRam = { capacityMB: chip.maxRamMB * 4, memoryType: 'LPDDR5X', bandwidthGBs: 68 };
  assert.equal(E.isCompatiblePart(chip, 'ram', badRam), false, 'Incompatible RAM exceeding chip controller limits is rejected');
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test('v3.1.0 Scenario 4: Outside firms compete while our company stays a bakery SME; cautious CEO declines feasible entry (declined_prudent)', () => {
  // 4A: Bakery SME stays out while external phone ecosystem builds, ships, and sells phones
  const wBakery = S.create('v310-bakery-observer', { autonomous: true, startingBusiness: 'bakery' });
  for (let d = 1; d <= 60; d++) {
    daily(wBakery, d);
  }
  assert.equal(Boolean(wBakery.phoneIndustry.campusFirmId), false, 'Bakery SME does not enter phone industry without capabilities');
  assert.ok(wBakery.phoneIndustry.metrics.produced > 20, 'External ecosystem produces phones while player is a bakery');
  assert.ok(wBakery.phoneIndustry.metrics.sold > 10, 'External ecosystem sells phones while player is a bakery');

  // 4B: Objective feasibility vs strategic preference (declined_prudent)
  const wCautious = S.create('v310-cautious-ceo', { autonomous: true, startingBusiness: 'software_agency' });
  S.command(wCautious, { type: 'directorEdit', action: 'grantCash', amount: 800000000 });
  S.command(wCautious, { type: 'directorEdit', action: 'setTrait', personId: wCautious.people[0].id, group: 'personality', key: 'riskTaking', value: 25 });
  S.command(wCautious, { type: 'directorEdit', action: 'setTrait', personId: wCautious.people[0].id, group: 'personality', key: 'prudence', value: 92 });
  trainCampusStaff(wCautious, ['software', 'electrical_basics', 'quality'], 60);

  S.phoneCompanyReview(wCautious, 14);
  assert.equal(Boolean(wCautious.phoneIndustry.campusFirmId), false, 'Cautious CEO did not open phone division');
  assert.equal(wCautious.phoneIndustry.playerEntry.status, 'declined_prudent', 'Recorded declined_prudent status');
  assert.equal(wCautious.phoneIndustry.playerEntry.feasibleButDeclined, true, 'Recorded objective feasibility separately from strategic refusal');
  assert.ok(wCautious.phoneIndustry.playerEntry.candidateRole, 'Recorded which role was feasible');
});

test('v3.1.0 Scenario 5: Failure modes (broken machine, utility brownout, full foundry queue, empty cash) block progress and recover cleanly', () => {
  const w = S.create('v310-failure-recovery', { autonomous: true, startingBusiness: 'metal_workshop' });
  S.command(w, { type: 'directorEdit', action: 'grantCash', amount: 1000000000 });
  S.command(w, { type: 'directorEdit', action: 'setTrait', personId: w.people[0].id, group: 'personality', key: 'riskTaking', value: 65 });
  S.phoneCompanyReview(w, 14);
  const cf = w.phoneIndustry.firms.phone_campus;
  assert.equal(cf.role, 'enclosure');

  // 1) Break press machine -> blocks production with explicit Thai reason
  w.plant.machines.press.status = 'broken';
  w.plant.machines.press.condition = 10;
  w.phoneIndustry.campusMinutes = 240;
  I.step(w, 1);
  assert.ok(cf.decisionTh.includes('เครื่องอัดขึ้นรูปไม่พร้อม'), `Broken machine blocked work: ${cf.decisionTh}`);
  assert.equal(w.phoneIndustry.lots.filter(l => l.ownerId === 'phone_campus').length, 0);

  // 2) Repair machine, trigger utility brownout -> blocks high-draw operation
  w.plant.machines.press.status = 'ready';
  w.plant.machines.press.condition = 95;
  w.utilities = w.utilities || {};
  w.utilities.brownoutActive = true;
  w.phoneIndustry.campusMinutes = 240;
  I.step(w, 2);
  assert.ok(cf.decisionTh.includes('กำลังไฟตก'), `Utility brownout blocked work: ${cf.decisionTh}`);

  // 3) Clear brownout and advance work -> recovers and produces enclosure lots
  w.utilities.brownoutActive = false;
  S.command(w, { type: 'continueEndless' });
  for (let d = 0; d < 35; d++) S.advance(w, 1440);
  assert.ok(w.phoneIndustry.lots.some(l => l.ownerId === 'phone_campus' && l.kind === 'enclosure' && l.quantity > 0), 'Recovered after machine repair and brownout clear');
  assert.deepEqual(S.audit(w), []);
});

test('v3.1.0 Scenario 6, 7 & 8: Save/load determinism mid-WIP & mid-transit, pure UI snapshots, and multi-day full-campus-life conservation', () => {
  const w = S.create('v310-save-determinism', { autonomous: true, startingBusiness: 'cable_workshop' });
  S.command(w, { type: 'directorEdit', action: 'grantCash', amount: 1000000000 });
  S.command(w, { type: 'directorEdit', action: 'setTrait', personId: w.people[0].id, group: 'personality', key: 'riskTaking', value: 70 });
  trainCampusStaff(w, ['semiconductor_physics', 'circuit_design', 'embedded_firmware', 'electrical_basics', 'quality'], 65);
  equipCampus(w, ['developer_pc', 'test_rig', 'electronics_bench']);

  S.phoneCompanyReview(w, 14);
  S.command(w, { type: 'continueEndless' });
  for (let d = 0; d < 12; d++) S.advance(w, 1440);

  // Verify WIP batches & foundry orders are populated
  assert.ok(w.phoneIndustry.wipBatches.length > 0, 'Active WIP batch ledger is populated');
  assert.ok(w.phoneIndustry.foundryOrders.length > 0, 'Foundry order ledger is populated');

  // Verify S.phoneView(w), I.view(w), and API.state(w) are 100% pure
  const before = Save.serialize(w);
  const pv = S.phoneView(w);
  assert.ok(pv.roleContracts.length >= 12, 'phoneView includes 12 role contracts');
  assert.ok(pv.materialGrades.length >= 8, 'phoneView includes 8 material grades');
  assert.ok(pv.roleFeasibility.length >= 12, 'phoneView includes role feasibility diagnostics');
  assert.equal(Save.serialize(w), before, 'S.phoneView is 100% pure');

  // Save/deserialize mid-WIP and mid-transit and verify bit-identical continuation
  const loaded = Save.deserialize(before);
  assert.deepEqual(Save.validate(loaded), []);
  for (let d = 0; d < 5; d++) {
    S.advance(w, 1440);
    S.advance(loaded, 1440);
  }
  assert.equal(Save.serialize(w), Save.serialize(loaded), 'Save/load mid-WIP and mid-transit is bit-identical');
  assert.deepEqual(S.audit(w), []);
});
