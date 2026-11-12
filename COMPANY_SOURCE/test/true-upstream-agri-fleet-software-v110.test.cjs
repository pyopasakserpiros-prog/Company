const prepare=require("./knowledge-fixtures.cjs");
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("v1.1.0 Chapter 23 True Upstream & 8-Stage Agricultural Cycle: 2+ consecutive crop cycles, seed saving from paddy_grain, and strict rejection of milled_rice/artisan_flour as seed", () => {
  const w = S.create("v110-agri-true-upstream", { autonomous: false });
  prepare(w,{subjects:["agriculture","food_fermentation","chemical_processing"]});
  const plotId = "plot_jasmine_rice_farm";

  // 1. Verify True Natural Upstream separation (Sugar, Flour, Paper, and Rice are NOT T0_NATURAL)
  assert.equal(w.catalog.materials.paddy_grain.isTrueNaturalResource, false);
  assert.equal(w.catalog.materials.milled_rice.isTrueNaturalResource, false);
  assert.equal(w.catalog.materials.artisan_flour.isTrueNaturalResource, false);
  assert.equal(w.catalog.materials.refined_sugar_syrup.isTrueNaturalResource, false);
  assert.equal(w.catalog.materials.pack_carton.isTrueNaturalResource, false);
  assert.equal(w.catalog.materials.silica_bauxite_ore.isTrueNaturalResource, true);
  assert.equal(w.catalog.materials.raw_water_m3.isTrueNaturalResource, true);
  assert.equal(D.TRUE_RESOURCE_CHAIN_TABLE.length, 9, "Must expose 8 end-to-end true resource chain definitions");

  // 2. Grant milled_rice and artisan_flour and verify they CANNOT be planted as seed or sorted into seed!
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "milled_rice", quantity: 10 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "artisan_flour", quantity: 10 });

  const badPlant1 = S.command(w, { type: "plantCropPlot", plotId, seedMaterialId: "milled_rice" });
  assert.equal(badPlant1.ok, false, "Milled white rice (milled_rice) must NEVER be usable as seed");
  assert.equal(badPlant1.code, "invalidSeedMaterial");

  const badPlant2 = S.command(w, { type: "plantCropPlot", plotId, seedMaterialId: "artisan_flour" });
  assert.equal(badPlant2.ok, false, "Rice flour (artisan_flour) must NEVER be usable as seed");
  assert.equal(badPlant2.code, "invalidSeedMaterial");

  const badSave1 = S.command(w, { type: "saveSeedFromCrop", cropMaterialId: "milled_rice", quantity: 4 });
  assert.equal(badSave1.ok, false, "Cannot save seed from milled rice");
  assert.equal(badSave1.code, "cannotSaveAsSeed");

  const badSave2 = S.command(w, { type: "saveSeedFromCrop", cropMaterialId: "artisan_flour", quantity: 4 });
  assert.equal(badSave2.ok, false, "Cannot save seed from flour");

  // 3. Cycle 1: Plant using rice_seed -> deducts rice_seed from stock -> cannot harvest in same tick -> grow -> harvest & split into saved seed + paddy_grain
  const seedBeforeCycle1 = w.inventory.materials.rice_seed;
  assert.equal(seedBeforeCycle1, 4, "Initial rice_seed stock is 4");

  const plant1 = S.command(w, { type: "plantCropPlot", plotId, seedSaveRatio: 0.3 });
  assert.equal(plant1.ok, true, "Planting cycle 1 with rice_seed must succeed");
  assert.equal(w.inventory.materials.rice_seed, seedBeforeCycle1 - 2, "Planting must deduct 2 rice_seed from stock");

  // Attempting to harvest immediately in the same tick must be rejected!
  const prematureHarvest = S.command(w, { type: "harvestCropPlot", plotId });
  assert.equal(prematureHarvest.ok, false, "Cannot harvest before growth duration completes");
  assert.equal(prematureHarvest.code, "cropNotRipe");

  // Advance 1 full day (1440m) so crop reaches ready_to_harvest
  S.advance(w, 1440);
  const plot = w.agriculture.plots[plotId];
  assert.equal(plot.stage, "ready_to_harvest");

  const nutrientsBeforeHarvest1 = plot.soilNutrients;
  const harvest1 = S.command(w, { type: "harvestCropPlot", plotId, seedSaveRatio: 0.3 });
  assert.equal(harvest1.ok, true, "Cycle 1 harvest must succeed after growth time");
  assert.equal(harvest1.cycle, 1);
  assert.ok(harvest1.savedSeedQty >= 2, "Cycle 1 must save part of harvest as rice_seed for Cycle 2");
  assert.ok(harvest1.warehouseCropQty >= 4, "Cycle 1 must send remaining paddy_grain to warehouse");
  assert.equal(
    harvest1.savedSeedQty + harvest1.warehouseCropQty + harvest1.spoiledLoss,
    harvest1.grossYield,
    "Saved seed + warehouse crop + spoiled loss must equal gross harvest yield",
  );
  assert.ok(plot.soilNutrients < nutrientsBeforeHarvest1, "Harvesting must deplete soil nutrients (no free reset)");

  // 4. Cycle 2: Replant using the saved seed -> apply compost/fertilizer & water -> grow -> harvest Cycle 2!
  const plant2 = S.command(w, { type: "plantCropPlot", plotId, seedSaveRatio: 0.7 });
  assert.equal(plant2.ok, true, "Cycle 2 replanting using saved seed must succeed");

  const care2 = S.command(w, { type: "careCropPlot", plotId, applyWater: true, waterUnits: 1, applyFertilizer: true });
  assert.equal(care2.ok, true, "Applying water and fertilizer during Cycle 2 must replenish soil");

  S.advance(w, 1440);
  const harvest2 = S.command(w, { type: "harvestCropPlot", plotId, seedSaveRatio: 0.7 });
  assert.equal(harvest2.ok, true, "Cycle 2 harvest must succeed");
  assert.equal(harvest2.cycle, 2, "Must complete 2 consecutive agricultural cycles");
  assert.ok(harvest2.savedSeedQty > harvest2.warehouseCropQty, "Saving 70% seed reduces warehouse crop available for sale/milling");

  // 5. Milling & Grinding Chain: paddy_grain -> milled_rice + rice_bran_husk -> artisan_flour -> organic_compost
  const millRes = S.command(w, { type: "craftMaterial", materialId: "milled_rice", batches: 2 });
  assert.equal(millRes.ok, true, "Milling paddy_grain produces milled_rice and rice_bran_husk");
  assert.ok(w.inventory.materials.rice_bran_husk >= 2);

  const compostRes = S.command(w, { type: "craftMaterial", materialId: "organic_compost", batches: 1 });
  assert.equal(compostRes.ok, true, "Rice bran/husk + raw water ferments into organic_compost");

  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v1.1.0 Chapter 23 Edge Cases: missing seed blocks planting, low water/nutrients reduce yield, finite mine depletes reserveRemaining, and renewable forest tracks treeStock", () => {
  const w = S.create("v110-resource-limits", { autonomous: false });
  prepare(w,{subjects:["agriculture","food_fermentation","chemical_processing"]});
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 50000000 });
  // Disable auto midstream refining so we can inspect raw extracted ores and logs directly
  S.command(w, { type: "setSupplyChainStrategy", strategyId: "asset_light" });

  // 1. Drain all rice_seed and verify planting fails with insufficientSeed
  while (w.inventory.materials.rice_seed > 0) {
    S.command(w, { type: "sellMaterialB2B", materialId: "rice_seed", quantity: 1 });
  }
  const noSeedAttempt = S.command(w, { type: "plantCropPlot", plotId: "plot_jasmine_rice_farm" });
  assert.equal(noSeedAttempt.ok, false, "Cannot plant without seed in stock");
  assert.equal(noSeedAttempt.code, "insufficientSeed");

  // 2. Finite Mine (`silica_copper_mine`): reserveRemaining decreases on extraction and never spawns free metal_sheet or microchip
  S.command(w, { type: "acquireExternalAsset", assetId: "silica_copper_mine" });
  const mineAsset = w.externalWorld.assetPortfolio.ownedAssets.silica_copper_mine;
  const initialReserve = mineAsset.reserveRemaining;
  assert.equal(initialReserve, 420);
  assert.equal(w.inventory.materials.metal_sheet, 0, "Buying mine must NOT grant free smelted metal_sheet");
  assert.equal(w.inventory.materials.microchip, 0, "Buying mine must NOT grant free microchip");

  S.evaluateExternalAssetsDaily(w, 1);
  assert.ok(mineAsset.reserveRemaining < initialReserve, "Mine reserveRemaining must decrease when ore is extracted");
  assert.ok(mineAsset.tailingsGenerated > 0, "Mining must generate tailings/slag");
  assert.ok(w.inventory.materials.silica_bauxite_ore > 0, "Mining extracts raw quartz silica ore");
  assert.ok(w.inventory.materials.bauxite_ore > 0, "Mining extracts separate bauxite ore");
  assert.ok(w.inventory.materials.phosphate_potash_rock > 0, "Mining extracts phosphate/potash rock for fertilizer");

  // 3. Renewable Forest (`forestry_pulp_mill`): logging reduces treeStock and queues sapling cohorts
  S.command(w, { type: "acquireExternalAsset", assetId: "forestry_pulp_mill" });
  const forestAsset = w.externalWorld.assetPortfolio.ownedAssets.forestry_pulp_mill;
  const initialTrees = forestAsset.treeStock;
  assert.equal(initialTrees, 120);

  S.evaluateExternalAssetsDaily(w, 2);
  assert.ok(forestAsset.treeStock < initialTrees, "Cutting timber must reduce standing treeStock");
  assert.ok(forestAsset.saplingCohorts.length > 0, "Forestry must plant sapling cohort to regrow after logging");
  assert.ok(w.inventory.materials.timber_bamboo_log >= 6, "Logging produces raw timber_bamboo_log");

  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v1.1.0 Chapter 19 Fleet Freight Transport Business: round-trip fuel & empty backhaul accounting, overweight/incompatible rejection, no double-booking, custody separation, and breakdown handling", () => {
  const w = S.create("v110-fleet-transport", { autonomous: false });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 20000000 });

  // 1. Overweight / incompatible cargo quote (`fquote-2`: 9500 kg ore_metal, `fquote-3`: cold_chain) must be rejected by the 6500 kg dry_6w truck!
  const overweightAttempt = S.command(w, { type: "acceptFreightContract", quoteId: "fquote-2", vehicleId: "truck-1" });
  assert.equal(overweightAttempt.ok, false, "6500kg dry truck must reject 9500kg heavy metal cargo");
  assert.equal(overweightAttempt.code, "incompatibleOrOverweightVehicle");

  const coldChainAttempt = S.command(w, { type: "acceptFreightContract", quoteId: "fquote-3", vehicleId: "truck-1" });
  assert.equal(coldChainAttempt.ok, false, "Dry truck must reject cold_chain cargo requiring reefer");
  assert.equal(coldChainAttempt.code, "incompatibleOrOverweightVehicle");

  // 2. Accept valid dry cargo quote (`fquote-1`: 120km outbound + 120km empty backhaul = 240km, 43.2L diesel = ฿1,382.40, toll ฿200, rate ฿4,500)
  const accept1 = S.command(w, { type: "acceptFreightContract", quoteId: "fquote-1", vehicleId: "truck-1" });
  assert.equal(accept1.ok, true, "Compatible dry cargo quote must be accepted");
  const cid = accept1.contractId;
  const contract = w.fleetTransport.contracts[cid];
  assert.equal(contract.totalRoundTripKm, 240, "Must include 120km outbound + 120km empty backhaul");
  assert.equal(contract.fuelLiters, 43.2, "240km * 0.18 L/km = 43.2 liters");
  assert.equal(contract.expectedMarginBeforeOverheadSatang, 241760, "฿4,500 - ฿1,382.40 - ฿200 - ฿500 = ฿2,417.60 (241,760 satang)");

  assert.ok(w.fleetTransport.cargoCustody[cid], "Customer cargo must be tracked in cargoCustody");

  // 3. Cannot double-book `truck-1` while it is already reserved!
  const doubleBookAttempt = S.command(w, { type: "acceptFreightContract", quoteId: "fquote-4", vehicleId: "truck-1" });
  assert.equal(doubleBookAttempt.ok, false, "Cannot double-book the same truck on two overlapping jobs");
  assert.equal(doubleBookAttempt.code, "vehicleBusy");

  // 4. Step through outbound -> delivered -> invoiced/paid, and verify truck is in `returning` status until backhaul completes!
  S.command(w, { type: "advanceFreightContract", contractId: cid }); // reserved -> outbound
  assert.equal(w.fleetTransport.contracts[cid].status, "outbound");

  S.command(w, { type: "advanceFreightContract", contractId: cid }); // outbound -> delivered (truck enters returning)
  assert.equal(w.fleetTransport.contracts[cid].status, "delivered");
  assert.equal(w.fleetTransport.vehicles["truck-1"].status, "returning");

  S.command(w, { type: "advanceFreightContract", contractId: cid }); // delivered -> invoiced -> paid (truck still returning!)
  assert.equal(w.fleetTransport.contracts[cid].status, "paid");
  assert.equal(w.fleetTransport.vehicles["truck-1"].status, "returning", "Paid contract must NOT make truck idle before empty backhaul finishes");

  // Repeat billing/payment call must be idempotent (never double-credits cash!)
  const cashAfterFirstPay = w.finance.cash;
  S.command(w, { type: "advanceFreightContract", contractId: cid });
  assert.equal(w.finance.cash, cashAfterFirstPay, "Duplicate advanceFreightContract must never double-pay invoice");

  // Finish empty backhaul return -> truck becomes idle
  S.command(w, { type: "advanceFreightContract", contractId: cid, finishReturn: true });
  assert.equal(w.fleetTransport.vehicles["truck-1"].status, "idle", "Truck becomes idle after completing empty backhaul return");

  // 5. Acquire a Cold-Chain Reefer Truck (`reefer_6w`), test breakdown & maintenance
  const buyReefer = S.command(w, { type: "acquireFleetVehicle", vehicleTypeId: "reefer_6w" });
  assert.equal(buyReefer.ok, true);
  const reeferId = buyReefer.vehicleId;

  const acceptCold = S.command(w, { type: "acceptFreightContract", quoteId: "fquote-3", vehicleId: reeferId });
  assert.equal(acceptCold.ok, true, "Reefer truck can accept cold_chain cargo");
  S.command(w, { type: "advanceFreightContract", contractId: acceptCold.contractId }); // outbound
  const breakdownRes = S.command(w, { type: "advanceFreightContract", contractId: acceptCold.contractId, triggerBreakdown: true });
  assert.equal(breakdownRes.ok, false);
  assert.equal(breakdownRes.code, "vehicleBreakdown");
  assert.equal(w.fleetTransport.vehicles[reeferId].status, "broken");

  const maintRes = S.command(w, { type: "maintainFleetVehicle", vehicleId: reeferId });
  assert.equal(maintRes.ok, true, "Maintaining broken vehicle restores condition and tireCondition to 100%");
  assert.equal(w.fleetTransport.vehicles[reeferId].status, "idle");

  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
});

test("v1.1.0 Chapter 20 Software & SaaS App Business: 30/40/30 milestone accounting, unearned deposit separation, QA defect gate, Blocked project freeze, and 0-subscriber SaaS rule", () => {
  const w = S.create("v110-software-saas", { autonomous: false });
  prepare(w,{subjects:["software"]});
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 25000000 });

  // 1. SaaS with 0 subscribers must generate 0 revenue when billing cycle runs!
  const zeroSubBill = S.command(w, { type: "updateSaasSubscription", appId: "pos_retail", runBillingCycle: true });
  assert.equal(zeroSubBill.ok, true);
  assert.equal(zeroSubBill.activeSubscribers, 0);
  assert.equal(zeroSubBill.billedRevenueSatang, 0, "SaaS with 0 subscribers must NEVER generate free revenue");

  // 2. Custom Software Project (`swproj-1`: ฿120,000 contract):
  // Step 1: Contracted -> collects 30% deposit (฿36,000) into unearnedDepositSatang, recognizedRevenueSatang is still 0!
  const stepContract = S.command(w, { type: "advanceSoftwareProject", projectId: "swproj-1" });
  assert.equal(stepContract.ok, true);
  const proj = w.softwareBusiness.projects["swproj-1"];
  assert.equal(proj.status, "contracted");
  assert.equal(proj.unearnedDepositSatang, 3600000, "30% deposit (฿36,000) must be held as unearned deposit before acceptance");
  assert.equal(proj.recognizedRevenueSatang, 0, "Deposit is NOT recognized as revenue before acceptance");

  // 3. Test Blocked Project Rule: if project is blocked, advancing must fail without free progress!
  proj.status = "blocked";
  const blockedAttempt = S.command(w, { type: "advanceSoftwareProject", projectId: "swproj-1" });
  assert.equal(blockedAttempt.ok, false, "Blocked project must not advance progress for free");
  assert.equal(blockedAttempt.code, "projectBlocked");

  // Unblock and advance to testing with 2 injected defects
  const stepDev = S.command(w, { type: "advanceSoftwareProject", projectId: "swproj-1", unblock: true, injectDefects: 2 });
  assert.equal(stepDev.ok, true);
  assert.equal(proj.status, "testing");
  assert.equal(proj.defectsFound, 2);

  // 4. QA Defect Gate: attempting acceptance without fixing defects must be rejected!
  const unfixedAttempt = S.command(w, { type: "advanceSoftwareProject", projectId: "swproj-1", fixDefects: false });
  assert.equal(unfixedAttempt.ok, false, "Cannot pass QA or UAT while defects remain unresolved");
  assert.equal(unfixedAttempt.code, "unresolvedDefects");

  // Fix defects -> issue QA certificate -> enter customer_acceptance
  const passQa = S.command(w, { type: "advanceSoftwareProject", projectId: "swproj-1", fixDefects: true });
  assert.equal(passQa.ok, true);
  assert.equal(proj.status, "customer_acceptance");
  assert.equal(proj.qaCertificateIssued, true);

  // Version mismatch at customer_acceptance must be rejected!
  const wrongVer = S.command(w, { type: "advanceSoftwareProject", projectId: "swproj-1", deliveredVersion: "0.9.0-beta" });
  assert.equal(wrongVer.ok, false, "Mismatched version must be rejected at customer acceptance");
  assert.equal(wrongVer.code, "versionMismatch");

  // Pass customer_acceptance -> deploy (collects UAT 40% + Deploy 30%)
  S.command(w, { type: "advanceSoftwareProject", projectId: "swproj-1" }); // customer_acceptance -> deployed
  const finalDeploy = S.command(w, { type: "advanceSoftwareProject", projectId: "swproj-1" }); // deployed -> supporting
  assert.equal(finalDeploy.ok, true);
  assert.equal(proj.status, "supporting");
  assert.equal(proj.recognizedRevenueSatang, 12000000, "Full ฿120,000 recognized upon deployment");
  assert.equal(proj.unearnedDepositSatang, 0, "Unearned deposit is now 0");
  assert.equal(finalDeploy.projectSurplusSatang, 2500000, "Project surplus with ฿20,000 bug rework must equal ฿25,000 (2,500,000 satang)");

  // 5. SaaS Conversion, Billing & Churn + Internal Dogfooding
  S.command(w, { type: "updateSaasSubscription", appId: "pos_retail", addLeads: 50, convertUsers: 50 });
  const saasBill1 = S.command(w, { type: "updateSaasSubscription", appId: "pos_retail", runBillingCycle: true });
  assert.equal(saasBill1.ok, true);
  assert.equal(saasBill1.activeSubscribers, 50);
  assert.equal(saasBill1.billedRevenueSatang, 3000000, "50 accounts * ฿600 = ฿30,000 (3,000,000 satang)");

  // Churn 20 users -> next billing cycle only bills 30 users!
  S.command(w, { type: "updateSaasSubscription", appId: "pos_retail", churnUsers: 20 });
  const saasBill2 = S.command(w, { type: "updateSaasSubscription", appId: "pos_retail", runBillingCycle: true });
  assert.equal(saasBill2.activeSubscribers, 30);
  assert.equal(saasBill2.billedRevenueSatang, 1800000, "Churned users must stop generating future bills immediately");

  // Internal Dogfooding: installing TMS internally deducts setup cost and NEVER creates external sales revenue
  const salesBeforeInternal = w.finance.totals.sales;
  S.command(w, { type: "updateSaasSubscription", appId: "tms_fleet", launchMvp: true, installInternally: true });
  assert.equal(w.softwareBusiness.saasProducts.tms_fleet.installedInternally, true);
  assert.equal(w.finance.totals.sales, salesBeforeInternal, "Internal app installation must never create fake external sales revenue");

  // Save/Load mid-operation roundtrip
  assert.deepEqual(S.audit(w), []);
  assert.deepEqual(Save.validate(w), []);
  const saved = Save.serialize(w);
  const loaded = Save.deserialize(saved);
  assert.deepEqual(S.audit(loaded), []);
});


test("8. Factory Sector Process Models (Food Spoilage -> Compost, Electronics RMA, Automotive Tooling Changeover, Biomed Sterile COA) & Industrial B2B Services (Calibration, Field SLA, Eco Recycling) preserve 100% audit invariants", () => {
  const w = S.create("sector-and-service-v120", { autonomous: true });
  assert.strictEqual(D.RELEASE_VERSION, "2.6.0");
  assert.strictEqual(D.BUSINESS_PROCESS_MODELS.length, 8);
  assert.strictEqual(Object.keys(D.SECTOR_PROCESS_MODELS).length, 4);
  assert.strictEqual(Object.keys(D.INDUSTRIAL_SERVICES).length, 10);

  // Grant cash, research, and materials for comprehensive process testing
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 18000000 });
  prepare(w,{products:["herbalDrink"],subjects:["food_fermentation","quality","metal_machining","animal_husbandry"]});
  S.command(w, { type: "directorEdit", action: "addMaterials", quantity: 10 });

  // 8A. Model 1 (Food & Bakery Batch): Bake/ready a food unit, then test shelf-life expiration -> converts to +1 organic_compost while keeping product & material conservation 100% valid
  const openOffer = Object.values(w.offers).find((o) => o.status === "open");
  assert.ok(openOffer, "has an open offer");
  openOffer.productId = "herbalDrink";
  openOffer.quantity = 2; // quantity 2 so when the first unit finishes packing (stage === ready), shipping does not immediately ship it before we test shelf-life spoilage!
  const accOfferRes = S.acceptOffer(w, openOffer.id);
  assert.strictEqual(accOfferRes.ok, true, "herbalDrink offer accepted");
  const foodUnits = Object.values(w.units).filter((u) => u.productId === "herbalDrink");
  assert.ok(foodUnits.length === 2, "herbalDrink units created");
  // Advance until at least 1 herbalDrink unit reaches stage === "ready"
  let readyFoodUnit = null;
  for (let i = 0; i < 160; i++) {
    S.step(w);
    readyFoodUnit = Object.values(w.units).find((u) => u.productId === "herbalDrink" && u.stage === "ready");
    if (readyFoodUnit) break;
  }
  assert.ok(readyFoodUnit, "at least 1 herbalDrink unit reached ready stage");
  const compostBefore = w.inventory.materials.organic_compost;
  const expRes = S.command(w, { type: "expireFoodBatch", unitId: readyFoodUnit.id });
  assert.strictEqual(expRes.ok, true, "expireFoodBatch succeeds");
  assert.strictEqual(w.inventory.materials.organic_compost, compostBefore + 1, "Spoiled food batch recovers +1 organic_compost");
  assert.strictEqual(w.sectorProcesses.foodBakery.spoiledUnitsCount, 1);
  assert.deepStrictEqual(Save.validate(w), [], "Save.validate after food spoilage is 100% clean");

  // 8B. Model 2 (Electronics SMT & Post-Sale RMA): Open an RMA claim and repair it using 1 PCB
  const pcbBefore = w.inventory.materials.pcb;
  const rmaOpen = S.command(w, { type: "triggerRmaClaim", productId: "controller", defectiveQty: 1 });
  assert.strictEqual(rmaOpen.ok, true);
  const rmaRes = S.command(w, { type: "resolveRmaClaim", claimId: rmaOpen.claimId, mode: "rework_board" });
  assert.strictEqual(rmaRes.ok, true);
  assert.strictEqual(rmaRes.resolutionMode, "rework_board");
  assert.strictEqual(w.inventory.materials.pcb, pcbBefore - 1, "RMA board repair deducts 1 PCB from stock");

  // 8C. Model 3 (Automotive EV & Heavy OEM Tooling Changeover): Switch Line A tooling and verify rhythm bonus on consecutive same model
  const chg1 = S.command(w, { type: "triggerToolingChangeover", lineId: "lineA", productId: "ev_battery_pack", force: true });
  assert.strictEqual(chg1.ok, true);
  assert.strictEqual(chg1.changed, true);
  const chg2 = S.command(w, { type: "triggerToolingChangeover", lineId: "lineA", productId: "ev_battery_pack", force: false });
  assert.strictEqual(chg2.ok, true);
  assert.strictEqual(chg2.changed, false);
  assert.strictEqual(chg2.consecutiveSameModelCount, 2, "Consecutive same model increments rhythm counter without changeover fee");

  // 8D. Model 4 (Bio-Medical Cleanroom Sterile Quarantine & Clinical Release): Test contamination rejection vs certified release
  const bioReject = S.command(w, { type: "certifyBiomedLot", productId: "vital_monitor", contaminateLot: true });
  assert.strictEqual(bioReject.ok, false);
  assert.strictEqual(bioReject.code, "sterilityContamination");
  assert.strictEqual(w.sectorProcesses.biomedSterile.sterilityRejectedLots, 1);

  const bioPass = S.command(w, { type: "certifyBiomedLot", productId: "vital_monitor", contaminateLot: false });
  assert.strictEqual(bioPass.ok, true);
  assert.strictEqual(bioPass.status, "certified");
  assert.strictEqual(w.sectorProcesses.biomedSterile.clinicalCertificatesIssued >= 1, true);

  // 8E. Model 5B & 5C (Dairy Livestock Feeding/Milking & Mine Vein Survey)
  const milkBefore = w.inventory.materials.fresh_milk_soy;
  const herdRes = S.command(w, { type: "feedLivestockHerd", assetId: "dairy_soy_farm" });
  assert.strictEqual(herdRes.ok, true);
  assert.ok(w.inventory.materials.fresh_milk_soy > milkBefore, "Dairy herd feeding produces fresh_milk_soy");

  const surveyRes = S.command(w, { type: "surveyNewMineVein", assetId: "copper_bauxite_mine" });
  assert.strictEqual(surveyRes.ok, true);
  assert.ok(surveyRes.reserveRemaining > 360, "Geological survey increases mine reserveRemaining");

  // 8F. Model 6 (Fleet Backhaul Matching on returning vehicle)
  const quoteId = w.fleetTransport.openQuotes.find((q) => q.status === "quoted")?.id;
  if (quoteId) {
    const acc = S.command(w, { type: "acceptFreightContract", quoteId });
    assert.strictEqual(acc.ok, true);
    // Advance to delivered (vehicle is now returning)
    S.command(w, { type: "advanceFreightContract", contractId: acc.contractId, completeAllSteps: false });
    S.command(w, { type: "advanceFreightContract", contractId: acc.contractId, completeAllSteps: false });
    const backhaulRes = S.command(w, { type: "matchBackhaulCargo", contractId: acc.contractId });
    assert.strictEqual(backhaulRes.ok, true, "Backhaul cargo matched while vehicle is returning");
    S.command(w, { type: "advanceFreightContract", contractId: acc.contractId, completeAllSteps: true, finishReturn: true });
  }

  // 8G. Model 8 (Industrial B2B Services: Calibration Lab Custody, Field Maintenance SLA, Industrial Recycling Material Recovery)
  const calStart = S.command(w, { type: "startServiceOrder", serviceTypeId: "calibration_lab", clientCorpId: "siam_auto" });
  assert.strictEqual(calStart.ok, true);
  assert.ok(w.serviceBusiness.instrumentCustody[calStart.orderId], "Client instrument is held in lab custody separately from inventory");
  const calDone = S.command(w, { type: "advanceServiceOrder", orderId: calStart.orderId, completeAllSteps: true });
  assert.strictEqual(calDone.ok, true);
  assert.strictEqual(calDone.paid, true);
  assert.strictEqual(w.serviceBusiness.instrumentCustody[calStart.orderId], undefined, "Client instrument returned after calibration");

  const metalBefore = w.inventory.materials.metal_sheet;
  const recStart = S.command(w, { type: "startServiceOrder", serviceTypeId: "industrial_recycling", clientCorpId: "eastern_chem" });
  assert.strictEqual(recStart.ok, true);
  const recDone = S.command(w, { type: "advanceServiceOrder", orderId: recStart.orderId, completeAllSteps: true });
  assert.strictEqual(recDone.ok, true);
  assert.ok(w.inventory.materials.metal_sheet > metalBefore, "Industrial recycling service recovers real materials into inventory");

  assert.deepStrictEqual(S.audit(w), [], "S.audit(w) has zero errors after all 8 business process models execute");
  assert.deepStrictEqual(Save.validate(w), [], "Save.validate(w) has zero errors after all 8 business process models execute");
});
