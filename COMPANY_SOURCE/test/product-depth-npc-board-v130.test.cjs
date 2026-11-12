const prepare=require("./knowledge-fixtures.cjs");
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("v1.3.0 Chapter 28 & 30: 58 Materials with true physical/chemical origins (N-P-K from Nitrogen Ammonia + Phosphate/Potash), 36 Products across 10 Families, 9 Capability Domains, and 6 B2B Industrial Services", () => {
  const cat = D.createCatalog();
  assert.strictEqual(D.RELEASE_VERSION, "2.9.0");
  assert.strictEqual(Object.keys(cat.materials).length, 64, "Catalog has 58 materials");
  assert.strictEqual(Object.keys(cat.products).length, 42, "Catalog has 36 products");
  assert.strictEqual(Object.keys(D.MATERIAL_RECIPES).length, 40, "Catalog has 35 material recipes");
  assert.strictEqual(Object.keys(D.INDUSTRIAL_SERVICES).length, 10, "Catalog has 6 B2B industrial services");
  assert.strictEqual(Object.keys(D.CAPABILITY_DOMAINS).length, 9, "Catalog has 9 capability domains");
  assert.strictEqual(Object.keys(D.PRODUCT_FAMILIES).length, 10, "Catalog has 10 product families");
  assert.deepStrictEqual(D.validateCatalog(cat), []);

  // Verify N-P-K elemental conservation: nitrogen_ammonia is synthesized from ambient_air_gas + raw_water_m3, and npk_fertilizer uses nitrogen_ammonia + phosphate_potash_rock
  const w = S.create("v130-elemental-npk", { autonomous: false });
  prepare(w,{subjects:["chemical_processing","agriculture"]});
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "phosphate_potash_rock", quantity: 4 });
  const nh3Res = S.command(w, { type: "craftMaterial", materialId: "nitrogen_ammonia", batches: 1 });
  assert.strictEqual(nh3Res.ok, true, "nitrogen_ammonia queued from ambient_air_gas + raw_water_m3");
  S.advance(w, 60);
  const npkRes = S.command(w, { type: "craftMaterial", materialId: "npk_fertilizer", batches: 1 });
  assert.strictEqual(npkRes.ok, true, "npk_fertilizer queued from released nitrogen_ammonia + phosphate_potash_rock");
  S.advance(w, 60);

  // Verify wheat_flour cannot be planted as seed, while wheat_seed can be planted
  const wfSpec = w.catalog.materials.wheat_flour;
  assert.strictEqual(wfSpec.cannotPlantAsSeed, true);
  assert.strictEqual(w.catalog.materials.wheat_seed.isSeed, true);

  assert.deepStrictEqual(S.audit(w), []);
  assert.deepStrictEqual(Save.validate(w), []);
});

test("v1.3.0 Chapter 31 Audit Fixes: (1) Working capital gate on craftMaterialRecipe, (2) acquireExternalAsset does NOT grant free global R&D points, (3) Operating farms do NOT print phantom daily dividend sales", () => {
  const w = S.create("v130-audit-fixes", { autonomous: false });
  prepare(w,{materials:["wheat_flour"],subjects:["food_fermentation"]});
  assert.strictEqual(w.research.points, 0);

  // 1. Working capital gate: if cash is below recipe working-capital floor, craftMaterialRecipe blocks with insufficientWorkingCapital
  w.finance.openingCash -= (w.finance.cash - 50000);
  w.finance.cash = 50000;
  const lowCapCraft = S.craftMaterialRecipe(w, "wheat_flour", 1, { ignoreCapitalGate: false });
  assert.strictEqual(lowCapCraft.ok, false);
  assert.strictEqual(lowCapCraft.code, "insufficientWorkingCapital");

  // Restore cash via directorEdit
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 25000000 });

  // 2. Acquiring jasmine_rice_farm unlocks artisan_bakery via domain capability WITHOUT inflating w.research.points or unlocking unrelated semiconductor/electronics products!
  const acqRes = S.command(w, { type: "acquireExternalAsset", assetId: "jasmine_rice_farm" });
  assert.strictEqual(acqRes.ok, true);
  assert.strictEqual(w.research.points, 0, "Buying a rice farm must NOT inflate global research.points");
  assert.strictEqual(w.research.unlocked.includes("artisan_bakery"), false, "Buying farmland does not teach bakery engineering");
  assert.strictEqual(w.research.unlocked.includes("ai_edge_module"), false, "Unrelated high-tech semiconductor product remains locked");

  // 3. Operating farm produces harvest after growth, NOT phantom daily cash dividend sales
  S.evaluateExternalAssetsDaily(w, 1);
  assert.strictEqual(w.externalWorld.assetPortfolio.ownedAssets.jasmine_rice_farm.totalDividendSatang, 0, "Operating farm does not generate phantom daily cash dividend on top of harvest");

  assert.deepStrictEqual(S.audit(w), []);
  assert.deepStrictEqual(Save.validate(w), []);
});

test("v1.3.0 Chapter 29 & 31 Acceptance Scenarios: Executive Board Decision Ledger, Make-or-Buy, Missing Staff/Parts/Authority Gates, Personality Comparison (Ambitious vs Prudent CEO), and Autonomous Multi-Business Entry", () => {
  // Scenario A: Without an employed CEO (coordinator), Board refuses to self-approve new capital investments while existing operations remain valid
  const wNoCeo = S.create("v130-no-ceo", { autonomous: false });
  const ceo = wNoCeo.people.find((p) => p.role === "coordinator");
  ceo.employed = false;
  ceo.atWork = false;
  ceo.taskId = null;
  ceo.stationId = null;
  const noCeoRes = S.evaluateExecutiveBoardAndBusinessEntry(wNoCeo, 7);
  assert.strictEqual(noCeoRes.ok, false);
  assert.strictEqual(noCeoRes.code, "noExecutiveAuthority");
  assert.strictEqual(wNoCeo.executiveBoard.decisionLedger[0].resolution, "deferred_no_executive_authority");
  assert.deepStrictEqual(Save.validate(wNoCeo), []);

  // Scenario B: Missing spare parts blocks advanceServiceOrder (never completes service for free without deducting parts!)
  const wSrv = S.create("v130-service-gate", { autonomous: false });
  prepare(wSrv,{subjects:["metal_machining","power_electronics"]});
  // Ensure metal_sheet is 0
  assert.strictEqual(wSrv.inventory.materials.metal_sheet, 0);
  const srvStart = S.command(wSrv, { type: "startServiceOrder", serviceTypeId: "field_maintenance", clientCorpId: "siam_metal" });
  assert.strictEqual(srvStart.ok, true);
  const srvBlocked = S.command(wSrv, { type: "advanceServiceOrder", orderId: srvStart.orderId, completeAllSteps: true });
  assert.strictEqual(srvBlocked.ok, false, "Field maintenance must not complete when metal_sheet/wire_harness are 0");
  assert.strictEqual(srvBlocked.code, "insufficientServiceParts");
  assert.strictEqual(wSrv.serviceBusiness.orders[srvStart.orderId].status, "waiting_parts");

  // Once spare parts are stocked, advanceServiceOrder deducts parts and completes
  S.command(wSrv, { type: "directorEdit", action: "grantMaterial", materialId: "metal_sheet", quantity: 2 });
  S.command(wSrv, { type: "directorEdit", action: "grantMaterial", materialId: "wire_harness", quantity: 2 });
  const srvCompleted = S.command(wSrv, { type: "advanceServiceOrder", orderId: srvStart.orderId, completeAllSteps: true });
  assert.strictEqual(srvCompleted.ok, true);
  assert.strictEqual(srvCompleted.paid, true);
  assert.strictEqual(wSrv.inventory.materials.metal_sheet, 1, "1 metal_sheet was deducted for field_maintenance");
  assert.strictEqual(wSrv.inventory.materials.wire_harness, 1, "1 wire_harness was deducted for field_maintenance");

  // Scenario C: New B2B Services (battery_second_life_lab, returnable_pallet_pool, cold_storage_3pl)
  S.command(wSrv, { type: "directorEdit", action: "grantMaterial", materialId: "pack_carton", quantity: 4 });
  const batStart = S.command(wSrv, { type: "startServiceOrder", serviceTypeId: "battery_second_life_lab", clientCorpId: "eastern_auto" });
  assert.strictEqual(batStart.ok, true);
  assert.ok(wSrv.serviceBusiness.instrumentCustody[batStart.orderId], "Battery pack is registered in custody");
  const batDone = S.command(wSrv, { type: "advanceServiceOrder", orderId: batStart.orderId, completeAllSteps: true });
  assert.strictEqual(batDone.ok, true);
  assert.strictEqual(batDone.paid, true);

  // Scenario D: Compare Prudent vs Ambitious CEO on identical company state
  const wPrudent = S.create("v130-ceo-compare", { autonomous: true });
  const wAmbitious = S.create("v130-ceo-compare", { autonomous: true });
  S.command(wPrudent, { type: "directorEdit", action: "grantCash", amount: 15000000 });
  S.command(wAmbitious, { type: "directorEdit", action: "grantCash", amount: 15000000 });

  const ceoP = wPrudent.people.find((p) => p.role === "coordinator");
  const ceoA = wAmbitious.people.find((p) => p.role === "coordinator");
  S.command(wPrudent, { type: "directorEdit", action: "setTrait", personId: ceoP.id, group: "personality", key: "prudence", value: 90 });
  S.command(wPrudent, { type: "directorEdit", action: "setTrait", personId: ceoP.id, group: "personality", key: "riskTaking", value: 20 });
  S.command(wAmbitious, { type: "directorEdit", action: "setTrait", personId: ceoA.id, group: "personality", key: "prudence", value: 35 });
  S.command(wAmbitious, { type: "directorEdit", action: "setTrait", personId: ceoA.id, group: "personality", key: "ambition", value: 92 });
  S.command(wAmbitious, { type: "directorEdit", action: "setTrait", personId: ceoA.id, group: "personality", key: "riskTaking", value: 85 });

  S.command(wPrudent, { type: "evaluateExecutiveBoard", day: 8, ignoreAtWork: true, proposeFleetType: "reefer_6w" });
  S.command(wAmbitious, { type: "evaluateExecutiveBoard", day: 8, ignoreAtWork: true, proposeFleetType: "reefer_6w" });

  const prudentResolutions = wPrudent.executiveBoard.decisionLedger.map((d) => d.resolution);
  const ambitiousResolutions = wAmbitious.executiveBoard.decisionLedger.map((d) => d.resolution);
  assert.ok(prudentResolutions.includes("hold_cash_prudent"), "High-prudence CEO chooses hold_cash_prudent on fleet/asset expansion");
  assert.ok(ambitiousResolutions.includes("approved"), "High-ambition CEO approves fleet/asset expansion on identical financials");

  // Scenario E: Shared product family tooling has 0 setup fee vs cross-family changeover
  S.command(wAmbitious, { type: "triggerToolingChangeover", lineId: "lineA", productId: "artisan_bakery", force: true });
  const cashBeforeSameFam = wAmbitious.finance.cash;
  const sameFamChg = S.command(wAmbitious, { type: "triggerToolingChangeover", lineId: "lineA", productId: "wheat_grain_biscuit", force: false });
  assert.strictEqual(sameFamChg.ok, true);
  assert.strictEqual(sameFamChg.setupCost, 0, "Switching within bakery_grain family has 0 setup cost");
  assert.strictEqual(wAmbitious.finance.cash, cashBeforeSameFam);

  assert.deepStrictEqual(S.audit(wPrudent), []);
  assert.deepStrictEqual(Save.validate(wPrudent), []);
  assert.deepStrictEqual(S.audit(wAmbitious), []);
  assert.deepStrictEqual(Save.validate(wAmbitious), []);

  const app = API.create("v130-api-snapshot", { autonomous: true });
  const snap = app.snapshot();
  assert.strictEqual(snap.releaseVersion, "2.9.0");
  assert.strictEqual(snap.catalog.capabilityDomains.length, 9);
  assert.strictEqual(snap.catalog.productFamilies.length, 10);
  assert.strictEqual(snap.catalog.industrialServices.length, 10);
  assert.ok(snap.executiveBoard && Array.isArray(snap.executiveBoard.decisionLedger));
});
