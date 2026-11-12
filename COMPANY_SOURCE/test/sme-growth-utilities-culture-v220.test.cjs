const prepare=require("./knowledge-fixtures.cjs");
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");
const S = require("../js/sim.js");
const Save = require("../js/save.js");
const API = require("../js/api.js");

test("v2.2.0 SME-to-Conglomerate 6-Stage Progression Ladder & 12 Organic Milestones", () => {
  assert.strictEqual(D.VERSION, "3.0.0");
  assert.strictEqual(D.RELEASE_VERSION, "3.0.0");
  assert.strictEqual(S.RELEASE_VERSION, "3.0.0");
  assert.strictEqual(D.SME_GROWTH_STAGES.length, 6);
  assert.strictEqual(D.SME_MILESTONE_CATALOG.length, 12);

  const w = S.create("sme-ladder-v220", { autonomous: true, starterCount: 5 });
  assert.strictEqual(w.companyProgression.currentStageId, "stage_1_micro_workshop");
  assert.strictEqual(w.companyProgression.currentStageOrder, 1);

  // Achieve milestones and grow company step by step
  w.metrics.ordersPaid = 3;
  w.reputation = 50;
  S.scaleCompany(w, 10, { freeGrant: true });
  S.evaluateCompanyGrowthStage(w, 4);
  assert.strictEqual(w.companyProgression.currentStageId, "stage_2_registered_sme");
  assert.ok(w.companyProgression.achievedMilestones.first_order_paid);
  assert.ok(w.companyProgression.achievedMilestones.team_double_digits);

  // Construct first expansion plot & repay part of debt -> Stage 3
  S.command(w, { type: "directorEdit", action: "constructPlot", plotId: "solarPlant" });
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 10000000 });
  S.command(w, { type: "repayDebt", amount: 3000000 });
  w.metrics.ordersPaid = 7;
  w.reputation = 55;
  S.scaleCompany(w, 14, { freeGrant: true });
  S.evaluateCompanyGrowthStage(w, 8);
  assert.strictEqual(w.companyProgression.currentStageId, "stage_3_midcap_manufacturer");
  assert.ok(w.companyProgression.achievedMilestones.first_plot_constructed);
  assert.ok(w.companyProgression.achievedMilestones.first_debt_repaid);

  // Reach Debt-Free & Conglomerate scale -> Stage 6
  S.command(w, { type: "repayDebt", amount: w.finance.debt });
  for (const pid of ["waterPlant", "prodLineB", "prodLineC", "rawDepot", "refineryMill"]) {
    S.command(w, { type: "directorEdit", action: "constructPlot", plotId: pid });
  }
  w.metrics.ordersPaid = 45;
  w.reputation = 85;
  S.scaleCompany(w, 110, { freeGrant: true });
  S.evaluateCompanyGrowthStage(w, 25);
  assert.strictEqual(w.companyProgression.currentStageId, "stage_6_regional_conglomerate");
  assert.strictEqual(w.companyProgression.currentStageOrder, 6);
  assert.strictEqual(w.companyProgression.creditLimitMultiplier, 4.5);
  assert.ok(w.companyProgression.achievedMilestones.debt_free_turnaround);
  assert.deepStrictEqual(S.audit(w), []);
  assert.deepStrictEqual(Save.validate(w), []);
});

test("v2.2.0 Real SME Utility Metering, Solar/Water Offsets & Voltage Brownout Squeeze", () => {
  const w = S.create("utility-v220", { autonomous: true });

  // 1. Baseline utility metering (no solar or water plant)
  S.stepUtilitiesDaily(w, 1);
  const baseGrossKwh = w.utilities.dailyKwh;
  const baseNetKwh = w.utilities.netKwh;
  assert.ok(baseGrossKwh >= 100);
  assert.strictEqual(w.utilities.solarOffsetKwh, 0);
  assert.strictEqual(baseNetKwh, baseGrossKwh);
  assert.ok(w.utilities.accruedElectricSatang > 0);
  assert.ok(w.utilities.accruedWaterSatang > 0);

  // 2. Overdrive regime consumes significantly more power than Eco Saver regime
  S.command(w, { type: "directorEdit", action: "setProductionRegime", regimeId: "mass_throughput" });
  S.stepUtilitiesDaily(w, 2);
  const overdriveKwh = w.utilities.dailyKwh;
  S.command(w, { type: "directorEdit", action: "setProductionRegime", regimeId: "craft_precision" });
  S.stepUtilitiesDaily(w, 3);
  const ecoKwh = w.utilities.dailyKwh;
  assert.ok(overdriveKwh > baseGrossKwh, "Overdrive must consume more kWh than balanced");
  assert.ok(ecoKwh < baseGrossKwh, "Eco saver must consume less kWh than balanced");

  // 3. Constructing solarPlant and waterPlant directly offsets kWh and m3 and accumulates Baht savings
  S.command(w, { type: "directorEdit", action: "constructPlot", plotId: "solarPlant" });
  S.command(w, { type: "directorEdit", action: "constructPlot", plotId: "waterPlant" });
  S.stepUtilitiesDaily(w, 4);
  assert.ok(w.utilities.solarOffsetKwh > 0, "Solar plant must offset daily kWh");
  assert.ok(w.utilities.waterOffsetM3 > 0, "Water plant must offset daily water m3");
  assert.ok(w.utilities.totalSavedBySolarWaterSatang > 0, "Green savings must be tracked in satang");

  // 4. Test Brownout when cash is insufficient for 2 billing cycles, then recovery on payment
  const savedCash = w.finance.cash;
  const savedOpening = w.finance.openingCash;
  // Temporarily drain cash to 100 satang via valid equipment post to simulate cash squeeze
  const drain = w.finance.cash - 100;
  w.finance.openingCash -= drain;
  w.finance.cash -= drain;

  const bill1 = S.payUtilityBills(w, { day: 5 });
  assert.strictEqual(bill1.ok, false);
  assert.strictEqual(w.utilities.unpaidCycles, 1);
  assert.strictEqual(w.utilities.brownoutActive, false);

  const bill2 = S.payUtilityBills(w, { day: 6 });
  assert.strictEqual(bill2.ok, false);
  assert.strictEqual(w.utilities.unpaidCycles, 2);
  assert.strictEqual(w.utilities.brownoutActive, true, "2nd unpaid cycle triggers Brownout");

  // Restore cash and pay bill -> clears brownout
  w.finance.openingCash = savedOpening;
  w.finance.cash = savedCash;
  const paidRes = S.payUtilityBills(w, { day: 7 });
  assert.strictEqual(paidRes.ok, true);
  assert.ok(paidRes.paidSatang > 0);
  assert.strictEqual(w.utilities.brownoutActive, false);
  assert.strictEqual(w.utilities.accruedElectricSatang, 0);
  assert.strictEqual(w.utilities.accruedWaterSatang, 0);
  assert.deepStrictEqual(S.audit(w), []);
  assert.deepStrictEqual(Save.validate(w), []);
});

test("v2.2.0 Complete 10 B2B Services (Wholesale Anti-Arbitrage & Toll Smelting Custody/Slag) + 42 Products", () => {
  const cat = D.createCatalog();
  assert.strictEqual(Object.keys(cat.products).length, 42);
  assert.strictEqual(Object.keys(D.INDUSTRIAL_SERVICES).length, 10);
  assert.ok(cat.products.braided_fast_charge_kit);
  assert.ok(cat.products.artisan_chili_paste_jar);

  const w = S.create("services-v220", { autonomous: true });
  prepare(w,{subjects:["commerce","metal_machining"]});
  S.command(w, { type: "directorEdit", action: "grantCash", amount: 15000000 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "pack_carton", quantity: 10 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "metal_sheet", quantity: 10 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "coke_reducing_flux", quantity: 10 });
  S.command(w, { type: "directorEdit", action: "grantMaterial", materialId: "raw_water_m3", quantity: 10 });

  // 1. Anti-circular arbitrage on wholesale_distribution
  const badWholesale = S.startServiceOrder(w, "wholesale_distribution", "singapore_port_3pl", {
    purchasedFromCorpId: "singapore_port_3pl",
  });
  assert.strictEqual(badWholesale.ok, false);
  assert.strictEqual(badWholesale.code, "circularWholesaleForbidden");

  // Valid wholesale order
  const okWholesale = S.startServiceOrder(w, "wholesale_distribution", "singapore_port_3pl", {
    purchasedFromCorpId: "nusantara_nickel",
  });
  assert.strictEqual(okWholesale.ok, true);
  const doneWholesale = S.advanceServiceOrder(w, okWholesale.orderId, { completeAllSteps: true });
  assert.strictEqual(doneWholesale.ok, true);
  assert.strictEqual(doneWholesale.paid, true);
  assert.strictEqual(w.serviceBusiness.metrics.wholesaleLotsDistributed, 1);

  // 2. Contract Toll Smelting registers client custody separately from inventory and yields mineral_slag_mud
  const slagBefore = w.inventory.materials.mineral_slag_mud || 0;
  const startToll = S.startServiceOrder(w, "toll_smelting_extrusion", "nusantara_nickel");
  assert.strictEqual(startToll.ok, true);
  assert.ok(w.serviceBusiness.instrumentCustody[startToll.orderId], "Client ore must be tracked in custody");

  const doneToll = S.advanceServiceOrder(w, startToll.orderId, { completeAllSteps: true });
  assert.strictEqual(doneToll.ok, true);
  assert.strictEqual(doneToll.paid, true);
  assert.strictEqual(w.serviceBusiness.instrumentCustody[startToll.orderId], undefined, "Custody released on completion");
  assert.strictEqual(w.inventory.materials.mineral_slag_mud, slagBefore + 1, "Toll smelting yields 1 mineral_slag_mud");
  assert.deepStrictEqual(S.audit(w), []);
  assert.deepStrictEqual(Save.validate(w), []);
});

test("v2.2.0 Workplace Culture, Water-Cooler Gossip, Employee Wallet Grant, Parking Lot & Alumni Spin-Off Companies", () => {
  const app = API.create("culture-spinoff-v220", { autonomous: true });
  const initSnap = app.snapshot();
  assert.strictEqual(initSnap.releaseVersion, "3.0.0");
  const targetPerson = initSnap.people.find((p) => p.role === "engineer") || initSnap.people[0];
  const cashBefore = initSnap.company.cash;

  // 1. Grant personal wallet savings via directorEdit without changing company cash!
  const grantRes = app.dispatch({
    type: "directorEdit",
    action: "grantPersonWallet",
    personId: targetPerson.id,
    amount: 500000, // ฿5,000
  });
  assert.strictEqual(grantRes.ok, true);
  const afterGrantSnap = app.snapshot();
  assert.strictEqual(afterGrantSnap.company.cash, cashBefore, "Company cash must remain unchanged when granting personal wallet money");
  const updatedPerson = afterGrantSnap.people.find((p) => p.id === targetPerson.id);
  assert.strictEqual(updatedPerson.pay.wallet, 500000);
  assert.ok(afterGrantSnap.culture.parkedVehicles.length >= 1, "Employee with ฿5,000+ wallet parks personal vehicle in campus lot");
  assert.deepStrictEqual(app.audit(), []);

  // 2. Advance 7 days so life milestones (buyVehicle), water-cooler gossip, after-work clubs, and utility metering run naturally
  app.advance(7 * 1440);
  const day8Snap = app.snapshot();
  assert.ok(day8Snap.culture.recentGossip.length >= 1, "Water-cooler gossip recorded from real company state");
  assert.ok(day8Snap.culture.clubActivities.length >= 1, "After-work club sessions recorded");
  assert.ok(day8Snap.culture.parkedVehicles.length >= 1, "Parking lot contains employee vehicles");

  // 3. Trigger Townhall Employee Award & Alumni Spin-Off Startup
  const awardRes = app.dispatch({ type: "evaluateTownhallAwards", payBonus: true });
  assert.strictEqual(awardRes.ok, true);

  const corpCountBefore = Object.keys(app.snapshot().externalWorld.corporations).length;
  const spinoffRes = app.dispatch({
    type: "evaluateEmployeeSpinoff",
    personId: targetPerson.id,
    force: true,
    relationshipMode: "partner",
  });
  assert.strictEqual(spinoffRes.ok, true);
  const finalSnap = app.snapshot();
  assert.strictEqual(Object.keys(finalSnap.externalWorld.corporations).length, corpCountBefore + 1, "New Alumni Spin-off SME added to external corporations");
  assert.strictEqual(finalSnap.culture.alumniSpinoffs.length, 1);
  assert.ok(finalSnap.companyProgression.achievedMilestones.first_alumni_spinoff, "First alumni spin-off milestone unlocked");
  assert.deepStrictEqual(app.audit(), []);
});
