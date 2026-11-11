const prepare=require("./knowledge-fixtures.cjs");
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("v0.6.0+ External Assets catalog (12 assets) initializes agricultural plots, requires growth time before harvest, and provides operational bonuses", () => {
  const assets = Object.values(D.EXTERNAL_ASSETS);
  assert.equal(assets.length, 12, "Must have 12 External Assets across 4 categories");

  const w = S.create("v060-ext-assets", { autonomous: true });
  prepare(w,{subjects:["agriculture","food_fermentation","chemical_processing"]});
  prepare(w,{products:["artisan_bakery"],subjects:["food_fermentation","agriculture"]});
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 50000000 });

  for (const aid of [
    "jasmine_rice_farm",
    "palm_oil_plantation",
    "sugarcane_estate",
    "offsite_solar_wind_farm",
    "deepsea_port_terminal",
    "retail_flagship_network",
  ]) {
    const res = S.command(w, { type: "acquireExternalAsset", assetId: aid });
    assert.equal(res.ok, true, `Failed to acquire ${aid}`);
  }

  // Chapter 23 Rule: Buying a farm does NOT magically spawn finished flour or uncultivated crops at t=0 before growing!
  assert.equal(w.inventory.materials.artisan_flour, 0, "Acquiring farm must not spawn instant free flour before crop growth");
  assert.equal(w.agriculture.plots.plot_jasmine_rice_farm.stage, "growing", "Rice plot must be planted and growing");

  // Advance 1 full day (1440m): crops finish growing, harvest, save seed for next cycle, replant, and mill into flour/oil/sugar!
  S.advance(w, 1440);
  assert.ok(w.inventory.materials.artisan_flour >= 4, "After crop growth & milling, artisan_flour is produced in stock");
  assert.ok(w.inventory.materials.refined_palm_oil >= 4, "After crop growth & refining, refined_palm_oil is produced in stock");
  assert.ok(w.inventory.materials.refined_sugar_syrup >= 4, "After crop growth & milling, refined_sugar_syrup is produced in stock");
  assert.ok(w.research.unlocked.includes("artisan_bakery"), "Established bakery qualification is preserved after buying a farm");

  const upRes = S.command(w, { type: "acquireExternalAsset", assetId: "jasmine_rice_farm", upgrade: true });
  assert.equal(upRes.ok, true);
  assert.equal(upRes.level, 2);

  const bonuses = S.getActiveExternalAssetBonuses(w);
  assert.ok(bonuses.rentReductionPct >= 0.3, "Solar/Wind + Sugarcane must reduce daily rent/utility cost");
  assert.ok(bonuses.leadTimeReductionPct >= 0.25, "Deepsea Port must reduce supplier lead times");
  assert.ok(bonuses.pricePremiumBonus >= 0.1, "Retail Network + Port must boost B2B unit prices");
  assert.ok(bonuses.depositPctBonus >= 0.08, "Retail Network must increase customer deposit ratio");

  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v0.6.0+ Multi-Stage Production Chain (Rice Farm -> Rice Mill -> Flour Mill -> Artisan Bakery) vs Asset-Light Make-or-Buy Strategy", () => {
  const wIntegrated = S.create("v060-vertical-bakery", { autonomous: true, initialHeadcount: 14 });
  prepare(wIntegrated,{subjects:["agriculture","food_fermentation","chemical_processing"]});
  S.command(wIntegrated, { type: "directorEdit", action: "grantCash", amount: 40000000 });
  S.command(wIntegrated, { type: "setSupplyChainStrategy", strategyId: "vertical_integration" });
  S.command(wIntegrated, { type: "constructPlot", plotId: "refineryMill" });
  S.command(wIntegrated, { type: "constructPlot", plotId: "bakeryPlant" });
  S.command(wIntegrated, { type: "acquireExternalAsset", assetId: "jasmine_rice_farm" });
  S.command(wIntegrated, { type: "acquireExternalAsset", assetId: "palm_oil_plantation" });
  S.command(wIntegrated, { type: "acquireExternalAsset", assetId: "sugarcane_estate" });
  S.command(wIntegrated, { type: "acquireExternalAsset", assetId: "forestry_pulp_mill" });

  // Advance 4 days: multi-cycle harvests + seed saving + replanting + midstream refining
  S.advance(wIntegrated, 1440 * 4);
  const ap = wIntegrated.externalWorld.assetPortfolio;
  assert.ok(ap.totalHarvestedUnits >= 40, "External assets must harvest crops and logs across cycles");
  assert.ok(ap.totalRefinedUnits >= 20, "Midstream chains must refine harvested crops into flour/oil/sugar/cartons");
  assert.ok(ap.totalChainSavingsSatang > 0, "In-house refining must record positive cost savings vs market price");
  assert.deepEqual(S.audit(wIntegrated), []);
  assert.deepEqual(Save.validate(wIntegrated), []);

  // Scenario B: Asset-Light Bakery (Owns 0 farms, skips automatic midstream refining, buys from market)
  const wLight = S.create("v060-asset-light-bakery", { autonomous: true, initialHeadcount: 12 });
  prepare(wLight,{subjects:["agriculture","food_fermentation","chemical_processing"]});
  S.command(wLight, { type: "directorEdit", action: "grantCash", amount: 20000000 });
  S.command(wLight, { type: "directorEdit", action: "grantResearch", points: 100 });
  S.command(wLight, { type: "setSupplyChainStrategy", strategyId: "asset_light" });
  assert.equal(Object.keys(wLight.externalWorld.assetPortfolio.ownedAssets).length, 0);

  S.command(wLight, { type: "directorEdit", action: "grantMaterial", materialId: "paddy_grain", quantity: 10 });
  S.evaluateExternalAssetsDaily(wLight, 1);
  assert.equal(wLight.externalWorld.assetPortfolio.totalRefinedUnits, 0, "Asset-light mode skips automatic midstream refining");
  assert.deepEqual(S.audit(wLight), []);
  assert.deepEqual(Save.validate(wLight), []);

  const app = API.create("v060-api-check", { autonomous: true });
  const snap = app.snapshot();
  assert.ok(snap.catalog.materials.length >= 50);
  assert.ok(snap.catalog.products.length >= 28);
  assert.equal(snap.catalog.productionModes.length, 8);
  assert.equal(snap.catalog.externalAssets.length, 12);
  assert.ok(snap.catalog.productionChains.length >= 8);
  assert.equal(snap.catalog.supplyChainStrategies.length, 3);
});
