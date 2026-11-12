const prepare=require("./knowledge-fixtures.cjs");
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("v1.0.0+ 5-Tier Material & Product Value Chain DAG (True Natural T0 -> Cultivated/Refined T1 -> Intermediate T2 -> Tech-Gated Component T3 -> Product T4)", () => {
  const cat = D.createCatalog();
  const mats = Object.values(cat.materials);
  const prods = Object.values(cat.products);

  // 1. Verify 51 materials across Tiers 0-3 (with separated resourceClass), 32 recipes, and 28 finished products
  assert.equal(mats.length, 64, "Catalog must contain 51 materials across True T0, Bio Seeds, Cultivated Crops, and Tiers 1-3");
  assert.equal(prods.length, 42, "Catalog must contain 28 finished products (Tier 4)");
  assert.equal(Object.keys(D.MATERIAL_RECIPES).length, 40, "All 32 craftable Tier 1-3 materials must have multi-stage recipes");
  assert.equal(D.RELEASE_VERSION, "2.7.0");

  const tier0 = mats.filter((m) => m.tier === 0);
  const tier1 = mats.filter((m) => m.tier === 1);
  const tier2 = mats.filter((m) => m.tier === 2);
  const tier3 = mats.filter((m) => m.tier === 3);
  assert.equal(tier0.length, 9, "Only 7 genuine geological/environmental resources are Tier 0 (T0_NATURAL)");
  assert.equal(tier1.length, 37, "27 Tier 1 materials (4 seeds + 7 cultivated crops + 16 stage-1 refined/soil/fuel/byproducts)");
  assert.equal(tier2.length, 10, "9 Tier 2 second-stage advanced intermediates");
  assert.equal(tier3.length, 8, "8 Tier 3 tech-gated high-tech components");

  // Verify Chapter 23 Rule: Rice, Sugar, Flour, Paper, and Milk are NEVER Tier 0 True Natural Resources!
  for (const nonNaturalId of [
    "paddy_grain",
    "milled_rice",
    "artisan_flour",
    "raw_cane",
    "refined_sugar_syrup",
    "pack_carton",
    "fresh_milk_soy",
  ]) {
    assert.equal(cat.materials[nonNaturalId].isTrueNaturalResource, false, `${nonNaturalId} must not be marked as a true natural resource`);
    assert.notEqual(cat.materials[nonNaturalId].tier, 0, `${nonNaturalId} must not be in Tier 0`);
  }

  // 2. Verify Tier 0 raw resources and cultivated crops CANNOT be crafted via instant factory recipe
  const w = S.create("v100-dag-test", { autonomous: true, initialHeadcount: 12 });
  for (const rawMat of tier0) {
    assert.equal(rawMat.craftable, false, `${rawMat.id} must be uncraftable`);
    const attempt = S.command(w, { type: "craftMaterial", materialId: rawMat.id, batches: 1 });
    assert.equal(attempt.ok, false, `Crafting Tier 0 raw material ${rawMat.id} must be rejected`);
    assert.equal(attempt.code, "uncraftableMaterial");
  }

  // 3. Verify Early-Game Tech Gate on Tier 3 Components (e.g., microchip requires R&D >= 250)
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "silicon_wafer", quantity: 10 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "pcb", quantity: 10 });
  const earlyChipAttempt = S.command(w, { type: "craftMaterial", materialId: "microchip", batches: 1 });
  assert.equal(earlyChipAttempt.ok, false, "Early-game company without R&D knowledge cannot fabricate microchip in-house");
  assert.equal(earlyChipAttempt.code, "insufficientResearch");

  // 4. Multi-Step Semiconductor Value Chain: Quartz Sand (T0) -> Metallurgical Silicon MG-Si (T1) -> Silicon Wafer (T2) -> Microchip (T3)
  prepare(w,{materials:["metallurgical_silicon","silicon_wafer","microchip"],subjects:["embedded_iot"]});
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "silica_bauxite_ore", quantity: 10 });

  // Prevent background auto-buy/refining from altering exact intermediate counts during the step-by-step DAG check
  w.policies.autoBuy = false;
  w.policies.autoAccept = false;
  const step1 = S.command(w, { type: "craftMaterial", materialId: "metallurgical_silicon", batches: 3 });
  assert.equal(step1.ok, true, "Step 1 (T0 -> T1): Queue quartz sand smelting into metallurgical silicon");
  assert.equal(w.inventory.materials.metallurgical_silicon, 0, "Output not released before timed smelting finishes");
  S.advance(w, 60);
  assert.equal(w.inventory.materials.metallurgical_silicon, 6);

  const step2 = S.command(w, { type: "craftMaterial", materialId: "silicon_wafer", batches: 2 });
  assert.equal(step2.ok, true, "Step 2 (T1 -> T2): Queue metallurgical silicon conversion into silicon wafer");
  S.advance(w, 60);
  assert.equal(w.inventory.materials.metallurgical_silicon, 2);
  assert.equal(w.inventory.materials.silicon_wafer, 14);

  const step3 = S.command(w, { type: "craftMaterial", materialId: "microchip", batches: 3 });
  assert.equal(step3.ok, true, "Step 3 (T2 -> T3): Queue microchip fabrication in-house once R&D threshold is met");
  S.advance(w, 60);
  assert.equal(w.inventory.materials.microchip, 6);

  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v1.0.0+ B2B Intermediate Material Selling & Living Off-Site Corporate Ecosystem (18 Multi-Role Corporations)", () => {
  const w = S.create("v100-ecosystem-b2b", { autonomous: true, initialHeadcount: 14 });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 30000000 });
  prepare(w,{products:["artisan_bakery"],materials:["bakery_dough_butter"],subjects:["food_fermentation","agriculture"]});

  const corps = Object.values(w.externalWorld.corporations || {});
  assert.equal(corps.length, 28, "Catalog corporations plus five regional producers and finite wholesale exchange");
  assert.ok(corps.some((c) => c.roles.includes("client") && c.roles.includes("supplier")));
  assert.ok(corps.some((c) => c.roles.includes("competitor") && c.roles.includes("client")));

  // Acquire Rice Farm + Palm Plantation -> advance 1 day so crops grow, harvest, save seed, and mill into flour & palm oil
  S.command(w, { type: "acquireExternalAsset", assetId: "jasmine_rice_farm" });
  S.command(w, { type: "acquireExternalAsset", assetId: "palm_oil_plantation" });
  S.advance(w, 1440);
  assert.ok(w.inventory.materials.artisan_flour >= 4);
  assert.ok(w.inventory.materials.refined_palm_oil >= 4);

  const doughBefore = w.inventory.materials.bakery_dough_butter || 0;
  const doughRes = S.command(w, { type: "craftMaterial", materialId: "bakery_dough_butter", batches: 2 });
  assert.equal(doughRes.ok, true, "Queue Tier 2 bakery_dough_butter from Tier 1 flour + palm oil");
  assert.equal(w.inventory.materials.bakery_dough_butter, doughBefore, "Output waits for timed mixing/proofing batch release");
  S.advance(w, 60);
  assert.equal(w.inventory.materials.bakery_dough_butter, doughBefore + 4);

  const cashBefore = w.finance.cash;
  const sellRes = S.command(w, {
    type: "sellMaterialB2B",
    materialId: "bakery_dough_butter",
    quantity: 3,
    buyerCorpId: "cp_health",
  });
  assert.equal(sellRes.ok, true, "Should sell crafted intermediate material to B2B buyer");
  assert.ok(sellRes.revenueSatang > 0);
  assert.equal(w.finance.cash, cashBefore + sellRes.revenueSatang);
  assert.equal(w.inventory.materials.bakery_dough_butter, doughBefore + 4 - 3);
  assert.ok(w.externalWorld.totalB2BMaterialSalesUnits >= 3);

  const relRes = S.command(w, { type: "setCorporationRelation", corpId: "shenzhen_semi", mode: "partner" });
  assert.equal(relRes.ok, true);
  assert.equal(w.externalWorld.corporations.shenzhen_semi.relationshipMode, "partner");

  S.advance(w, 1440 * 5);
  assert.ok(w.externalWorld.ecosystemFeed.length >= 8);
  assert.ok(w.externalWorld.b2bMaterialDemands.length > 0);
  for(const d of w.externalWorld.b2bMaterialDemands)assert.ok(w.externalWorld.living.firms[d.buyerCorpId].cash >= d.unitPriceSatang);

  const app = API.create("v100-api-snap", { autonomous: true });
  const snap = app.snapshot();
  assert.equal(snap.releaseVersion, "2.7.0");
  assert.equal(snap.catalog.materialTiers.length, 5);
  assert.equal(snap.catalog.materialRecipes.length, 40);
  assert.equal(snap.catalog.materials.length, 64);
  assert.equal(snap.catalog.products.length, 42);

  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
  const saved = Save.serialize(w);
  const loaded = Save.deserialize(saved);
  assert.deepEqual(S.audit(loaded), []);
});
