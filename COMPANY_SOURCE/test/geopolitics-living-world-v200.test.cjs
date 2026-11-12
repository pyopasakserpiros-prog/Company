"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("v2.0.0 Era 2.0 Living Global Geopolitics: 8 Sovereign Nations & Foreign Government Regime Shifts directly change material prices, FX rate, B2B sell revenue, and World Chronicle", () => {
  assert.strictEqual(D.RELEASE_VERSION, "2.7.0");
  assert.strictEqual(S.RELEASE_VERSION, "2.7.0");
  assert.strictEqual(Object.keys(D.GLOBAL_NATIONS).length, 12, "Must have 8 sovereign nations/blocs");
  assert.strictEqual(Object.keys(D.GEOPOLITICAL_EVENTS).length, 16, "Must have 12 global geopolitical events");

  const w = S.create("v200-geopolitics-regimes", { autonomous: false });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 25000000 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "lithium_brine_ore", quantity: 10 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "cathode_electrolyte", quantity: 10 });

  const lithMultBefore = w.externalWorld.geopolitics.materialPriceMultipliers.lithium_brine_ore || 1.0;

  // 1. China changes government policy to strategic_resource_control -> lithium & cathode prices jump!
  const cnShift = S.command(w, {
    type: "changeForeignRegime",
    nationId: "CN",
    regimeId: "strategic_resource_control",
  });
  assert.strictEqual(cnShift.ok, true);
  assert.strictEqual(cnShift.regimeId, "strategic_resource_control");
  const lithMultAfter = w.externalWorld.geopolitics.materialPriceMultipliers.lithium_brine_ore;
  assert.ok(lithMultAfter > lithMultBefore, `China resource control raises lithium price multiplier (${lithMultBefore} -> ${lithMultAfter})`);

  // 2. US changes government to america_first_tariff -> microchip & silicon_wafer prices rise and FX rate shifts
  const usShift = S.command(w, {
    type: "changeForeignRegime",
    nationId: "US",
    regimeId: "america_first_tariff",
  });
  assert.strictEqual(usShift.ok, true);
  assert.ok(w.externalWorld.geopolitics.materialPriceMultipliers.microchip >= 1.25, "US tariff regime raises microchip global price multiplier");
  assert.ok(w.externalWorld.worldChronicle.some((c) => c.category === "REGIME_CHANGE"), "Regime change is recorded in worldChronicle");

  // 3. Selling cathode_electrolyte B2B reflects the elevated geopolitical market price
  const sellRes = S.command(w, {
    type: "sellMaterialB2B",
    materialId: "cathode_electrolyte",
    quantity: 2,
    buyerCorpId: "green_power",
  });
  assert.strictEqual(sellRes.ok, true);
  assert.ok(sellRes.revenueSatang > D.MATERIAL_RECIPES.cathode_electrolyte.b2bSellPrice * 2, "B2B material sale earns elevated geopolitical price");

  assert.deepStrictEqual(S.audit(w), []);
  assert.deepStrictEqual(Save.validate(w), []);
});

test("v2.0.0 Era 2.0 Wars, Maritime Blockades & International Treaties: Red Sea War, Black Sea Grain/Fertilizer War, and ASEAN-JP-EU Free Trade Pact drive oil, freight quotes, stock indices, and Executive Board hedging", () => {
  const w = S.create("v200-wars-and-treaties", { autonomous: true });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 35000000 });

  const baseQuoteRate = w.fleetTransport.openQuotes[0].offeredRateSatang;

  // 1. Trigger Red Sea Blockade War -> Oil, Diesel, Polymer Resin, and Freight Rates surge
  const warRes = S.command(w, {
    type: "triggerGeopoliticalEvent",
    eventId: "red_sea_blockade_war",
    applySpotPriceToPO: true,
  });
  assert.strictEqual(warRes.ok, true);
  assert.ok(warRes.globalOilIndex >= 1.3, "Red Sea War spikes global oil index");
  assert.ok(w.externalWorld.geopolitics.materialPriceMultipliers.diesel_liter >= 1.3, "Diesel price multiplier surges during Red Sea War");
  assert.ok(w.fleetTransport.openQuotes[0].offeredRateSatang > baseQuoteRate, "Freight route quote rates increase during maritime blockade");
  assert.ok(w.externalWorld.worldChronicle[0].category === "WAR_CONFLICT", "War event logged at top of worldChronicle");

  // 2. Trigger Black Sea Grain & Fertilizer War -> Wheat, NPK Fertilizer, and Food Sector Demand surge
  const grainWar = S.command(w, {
    type: "triggerGeopoliticalEvent",
    eventId: "black_sea_grain_fertilizer_war",
  });
  assert.strictEqual(grainWar.ok, true);
  assert.ok(w.externalWorld.geopolitics.materialPriceMultipliers.wheat_grain >= 1.35, "Wheat grain price surges");
  assert.ok(w.externalWorld.geopolitics.materialPriceMultipliers.npk_fertilizer >= 1.3, "NPK fertilizer price surges");
  assert.ok(w.externalWorld.geopolitics.sectorDemandMultipliers.food >= 1.2, "Food export demand surges");

  // 3. Trigger ASEAN-JP-EU Free Trade Pact -> Lead times drop and B2B trade demand rises
  const pactRes = S.command(w, {
    type: "triggerGeopoliticalEvent",
    eventId: "asean_jp_eu_free_trade_pact",
  });
  assert.strictEqual(pactRes.ok, true);
  assert.strictEqual(w.externalWorld.geopolitics.globalLeadTimeMultiplier, 0.85, "Free trade pact cuts cross-border lead time multiplier to 0.85");
  assert.ok(w.externalWorld.worldChronicle.some((c) => c.category === "INTL_COOPERATION"));

  // 4. Advance multiple days to verify daily geopolitical & off-site corporate simulation preserves 100% accounting & save invariants
  S.advance(w, 1440 * 6);
  assert.deepStrictEqual(S.audit(w), []);
  assert.deepStrictEqual(Save.validate(w), []);

  // 5. Verify CompanyAPI snapshot exposes globalNations, geopoliticalEvents, and WORLD_GEOPOLITICS chronicle entries
  const app = API.create("v200-api-check", { autonomous: true });
  app.dispatch({ type: "triggerGeopoliticalEvent", eventId: "global_green_supercycle_election" });
  const snap = app.snapshot();
  assert.strictEqual(snap.releaseVersion, "2.7.0");
  assert.strictEqual(snap.catalog.globalNations.length, 12);
  assert.strictEqual(snap.catalog.geopoliticalEvents.length, 16);
  assert.ok(snap.chronicle.some((c) => c.category === "WORLD_GEOPOLITICS"), "Chronicle includes WORLD_GEOPOLITICS entries");
});
