'use strict';
const S = require('../js/sim.js');
const W = require('../js/world.js');
const I = require('../js/phone-industry.js');
const P = require('../js/plant.js');
const Save = require('../js/save.js');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const out = [];

// 1. Sector-wide 360-day runs (normal opening vs ample opening)
for (const [seed, ample] of [['era3-independent', false], ['era3-world-b', false], ['era3-capable', true]]) {
  const w = S.create(seed);
  if (ample) {
    for (const f of Object.values(w.externalWorld.living.firms)) {
      for (const k of ['pcb', 'silicon_wafer', 'copper_coil', 'glass_bottle', 'battery', 'polymer_resin', 'metal_sheet']) {
        const q = 20000;
        f.stock[k] = (f.stock[k] || 0) + q;
        if (!f.flow[k]) f.flow[k] = { opening: 0, produced: 0, bought: 0, used: 0, sold: 0 };
        f.flow[k].opening += q;
      }
    }
  }
  for (let d = 1; d <= 360; d++) {
    w.clock.absoluteMinute = (d - 1) * 1440 + 540;
    w.clock.tick = (w.clock.absoluteMinute - 540) / 5;
    w.lastSettledDay = d - 1;
    W.step(w, d, () => I.step(w, d));
    assert.deepEqual(S.audit(w), [], seed + ' audit ' + d);
    assert.deepEqual(Save.validate(w), [], seed + ' save ' + d);
  }
  out.push({
    seed,
    mode: 'daily_sector_step',
    days: 360,
    scenario: ample ? 'explicit opening endowment: 20000 additional units of 7 processed inputs per outside firm' : 'normal opening inputs (multi-tier regional production & refining)',
    metrics: w.phoneIndustry.metrics,
    designs: w.phoneIndustry.designs.map(d => ({
      id: d.id,
      name: d.nameTh,
      category: d.category,
      stage: d.stage,
      produced: d.produced,
      sold: d.sold,
      cpu: d.evaluation.cpuThroughput,
      ramMB: d.parts.ram.capacityMB,
      storageMB: d.parts.storage.capacityMB,
      cameraMP: d.parts.camera.megapixels
    })),
    chips: w.phoneIndustry.chips.length,
    foundryOrders: (w.phoneIndustry.foundryOrders || []).length,
    wipBatches: (w.phoneIndustry.wipBatches || []).length,
    staff: Object.keys(w.phoneTalent.people).length,
    validation: 'passed daily audit and current save'
  });
}

// 2. Full-campus-life (`S.advance(w, 1440)`) multi-day supplier & vertical integration scenario
{
  const seed = 'v310-campus-full-life';
  const w = S.create(seed, { autonomous: true, startingBusiness: 'cable_workshop' });
  S.command(w, { type: 'directorEdit', action: 'grantCash', amount: 1000000000 });
  S.command(w, { type: 'directorEdit', action: 'setTrait', personId: w.people[0].id, group: 'personality', key: 'riskTaking', value: 75 });
  for (const p of w.people) {
    if (!p.employed) continue;
    for (const subj of ['semiconductor_physics', 'circuit_design', 'semiconductor_optics', 'embedded_firmware', 'software', 'electrical_basics', 'quality', 'metrology']) {
      S.command(w, { type: 'directorEdit', action: 'setSubject', personId: p.id, subjectId: subj, level: 72 });
    }
  }
  for (const eq of ['developer_pc', 'test_rig', 'electronics_bench', 'diagnostic_kit']) {
    P.install(w, eq, true);
  }
  for (const [m, q] of Object.entries({ silicon_wafer: 60, copper_coil: 90, polymer_resin: 80, metal_sheet: 80, pcb: 80, battery: 60, glass_bottle: 60 })) {
    w.inventory.materials[m] = (w.inventory.materials[m] || 0) + q;
    w.inventory.opening[m] = (w.inventory.opening[m] || 0) + q;
  }
  S.phoneCompanyReview(w, 14);
  I.enterCampusRole(w, 'dram_memory', { addCapitalSatang: 100000000, day: 14 });
  I.enterCampusRole(w, 'camera_module', { addCapitalSatang: 100000000, day: 14 });
  I.enterCampusRole(w, 'brand', { addCapitalSatang: 250000000, day: 14 });
  w.phoneIndustry.firms.phone_campus.role = 'brand';

  S.command(w, { type: 'continueEndless' });
  const days = 45;
  for (let d = 1; d <= days; d++) {
    S.advance(w, 1440);
    assert.deepEqual(S.audit(w), [], seed + ' audit ' + d);
    assert.deepEqual(Save.validate(w), [], seed + ' save ' + d);
  }
  const cf = w.phoneIndustry.firms.phone_campus;
  out.push({
    seed,
    mode: 'full_campus_advance_1440',
    days,
    scenario: 'full-campus-life vertical integration (fabless_soc + dram_memory + camera_module + brand)',
    campusRoles: cf.roles,
    campusProduced: cf.produced,
    campusSold: cf.sold,
    campusRevenueSatang: cf.revenueSatang,
    metrics: w.phoneIndustry.metrics,
    designs: w.phoneIndustry.designs.map(d => ({
      id: d.id,
      firmId: d.firmId,
      name: d.nameTh,
      category: d.category,
      stage: d.stage,
      produced: d.produced,
      sold: d.sold
    })),
    chips: w.phoneIndustry.chips.length,
    foundryOrders: (w.phoneIndustry.foundryOrders || []).length,
    wipBatches: (w.phoneIndustry.wipBatches || []).length,
    validation: 'passed daily S.advance(1440) audit and save validation'
  });
}

fs.writeFileSync(process.argv[2] || 'phone-industry-soak-results.json', JSON.stringify(out, null, 2));
console.log(out.map(x => ({
  seed: x.seed,
  mode: x.mode,
  days: x.days,
  produced: x.metrics.produced,
  sold: x.metrics.sold,
  designs: x.designs.length,
  smart: x.designs.filter(d => d.category === 'smart').length,
  chips: x.chips,
  foundryOrders: x.foundryOrders,
  wipBatches: x.wipBatches
})));
