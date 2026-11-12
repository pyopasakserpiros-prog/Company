---
name: company-evolution-dev
description: MASTER SKILL for Siam Enterprise / Company Simulation (บริษัทจำลองธุรกิจและอุตสาหกรรมอัตโนมัติ, COMPANY_SOURCE/) through v2.7.0 (process-driven-realism-overhaul-v270; historical foundations retained below). Covers the Permanently Locked Human Core 1.0.0, 170 Learned Subjects & Technology Transfer, 20 Equipment Types (5 Subsystems, Fault Modes, New/Used/Leased Acquisition), 42 Product Routes, Timed Refinery Batches for all 40 Recipes (w.plant.refineryBatches), Physical Warehouse Lots & Cold-Chain FEFO/FIFO (w.warehouse), Competitive Public Tenders & Contract Renegotiation/Termination (w.commerce.tenders), Time-Bound Freight & 10 Industrial B2B Services, Real Software/QA/SLA, 180m Biological Livestock Cycle, 6-Stage SME-to-Conglomerate Ladder, Utilities/Culture/Spin-offs, Living Global Geopolitics (12 Nations, 28+ Firms with Accrual Profit/COGS), and 500-NPC Scaling (~1.05ms/tick). MANDATORY RULE: Update this Master Skill on every future patch.
---
## Current release — v2.7.0 (`process-driven-realism-overhaul-v270`, authoritative; earlier sections are historical)

1. **Timed Material Processing & Intermediate Production (`w.plant.refineryBatches`, `P.recipeSpec`, `P.enqueueRefineryBatch`, `P.cancelRefineryBatch`, `P.tickRefinery`)**:
   - All 40 recipes in `D.MATERIAL_RECIPES` run through timed multi-stage refinery batches (`inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released / rework / scrapped / cancelled`).
   - Calling `craftMaterialRecipe` or `runMidstreamRefining` reserves inputs (`w.inventory.reserved`) at tick +0 and never spawns instant output in the same tick.
   - Inputs are deducted (`safeDeductMaterial`, `inputsConsumed = true`) upon completing `loading_setup`. Cancelling before consumption refunds reservations (`status: "cancelled", refundedInputs: true`); cancelling after consumption turns WIP into scrap (`status: "scrapped", refundedInputs: false`).
   - Full warehouse capacity at `inspection` holds batch release (`รอพื้นที่ว่างในคลังสินค้าก่อนตรวจปล่อยล็อตแปรรูป`) until space frees up.
2. **Product-Specific Production Engineering (42 Products) & Shared Machine Guard**:
   - `P.route(product)` defines 3–4 domain stages with `opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint`, and `intermediateOut`.
   - `P.workerQualifiedForStep(w, person, step)` enforces `minSubjectLevel` (or qualified colleague supervision) on `safetyCritical` stages.
   - `power(w, m, minutes)` and thermal heating in `P.tick` / `P.tickRefinery` guard with `m.lastPowerAt === w.clock.absoluteMinute` and `m.lastThermalAt === w.clock.absoluteMinute` so multiple jobs/batches sharing a machine in the same tick never multiply power draw or heating speed.
3. **Equipment Engineering, 5 Subsystems, Fault Diagnosis & 3 Acquisition Modes**:
   - Each machine in `w.plant.machines` tracks `subsystems: { mechanical, electrical, thermal, calibration, cleanliness }`, `faultMode`, and `acquisitionMode` (`purchased_new`, `used_refurbished` at 65% cost / 82% condition / 60% lead time, or `leased` at 25% upfront cost).
   - `P.technicianCapability(person, machineId, hasDiagKit)` computes repair `speed`, `diagnosticAccuracy`, and `postCondition` from learned subjects, Human Core aptitudes (`analytical`, `dexterity`, `problemSensitivity`, `attention`), fatigue, and `diagnostic_kit` availability, recording `returnToServiceTest: "passed"` in `w.plant.serviceRecords`.
4. **Time- and Resource-Bound Freight & 10 Industrial B2B Services**:
   - Autonomous NPC loops no longer call `completeAllSteps: true`.
   - Freight contracts enforce elapsed transit time between dispatch and delivery (`elapsedTimeRequired`) and return travel before a truck becomes `idle` (`elapsedReturnTimeRequired`), plus driver fatigue rest (`driverRestRequired`).
   - All 10 B2B services require `workMinutesDone >= requiredWorkMinutes`, consume spare parts/consumables, record concrete `testMeasurements`, isolate client items in `w.serviceBusiness.instrumentCustody`, and track `storageHoursOccupied` for `cold_storage_3pl`.
5. **Real Software Development, QA, Scope Changes & Defect SLA Penalties**:
   - `advanceSoftwareProject` requires an on-duty developer with `programming >= 40` and `software >= 40` (`noQualifiedDeveloper` blocks progress at 0).
   - Developer productivity and defect generation derive from Human Core traits/fatigue and learned subjects. Supports `discoverScopeChange` (`scopeChangeEvaluated`, `scopeChangeResolution`) and `deployWithKnownDefects` (which triggers `reworkCostSatang` SLA penalties, support tickets, and reputation loss upon entering `supporting`).
6. **Physical Warehouse Lots, FIFO/FEFO & Cold-Chain Protection (`w.warehouse`)**:
   - `S.ensureWarehouse`, `S.reconcileWarehouseLots`, and `S.warehouseAudit` maintain `materialLots`, `finishedLots`, `transferMoves`, and `summary` across all inventory states, applying FEFO to perishables (`coldChainProtected`, `expiresDay: 10` days with active `cold_room` vs `4` days during brownout/unprotected) and FIFO to non-perishables.
7. **Competitive Public Procurement Tenders, Contract Renegotiation, Orderly Termination & Counterparty Funding**:
   - `W.evaluateCompetitiveTender` scores the player against external firms on price, quality, reputation, and documentation (`w.commerce.tenders`).
   - `S.renegotiateCommercialContract` (`W.adjustCommercialEscrow`) and `S.terminateCommercialContract` (`W.closeCommercial`) modify or close contracts cleanly without stuck obligations.
   - `W.payFromCounterparty` links freight, B2B service, and software milestone receipts to external firm cash and `m.playerNetSatang`.
8. **180-Minute Biological Livestock Cycle & External Firm Accrual Profit / COGS**:
   - `feedLivestockHerd` starts a 180-minute biological digestion/lactation cycle (`milkingStage: "digesting" -> "ready_to_milk"`); `milkLivestockHerd` rejects premature milking (`lactationCycleIncomplete`).
   - External firms in `js/world.js` run biological cycles for `fresh_milk_soy`, `natural_latex`, and `timber_bamboo_log`, and separate `cogsSatang`, `operatingExpenseSatang`, `capexSatang`, `accrualProfitSatang`, and `cashFlowSurplusSatang`.
9. **Verification Evidence (v2.7.0)**:
   - `node tools/verify.cjs` PASS (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`), `node tools/test.cjs` **186/186** PASS (including `test/process-realism-v270.test.cjs`), `node tools/build.cjs` (`1,695,923` bytes), `node tools/benchmark.cjs` (`1.056 ms/tick` at 500 NPCs).

## Historical v2.6.0 plant & commercial foundation

Plant module: 20 equipment types, 42 product routes with actual worker labor, elapsed machine holds, temperatures, stations/capacity, wear, electricity and technical maintenance. Commercial sales: stock offers and 120/240/1000-unit supply contracts split 4–80-unit releases from real buyer/TH budgets held in `World.commercialEscrows`. Read `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md` and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md`.

## Historical v2.4.0 – v2.5.0 world & time foundation

External World uses `COMPANY_SOURCE/js/world.js`, daily aggregate nation and firm accounts, finite material stocks, real interfirm transactions/in-transit shipments and indicator-based government/corporate choices. 12 nations/blocs, 28 opening firms plus later spin-offs, 66 bilateral relations. Time 1× uses 2 game minutes/real second; walking uses 8 cells/5-minute tick.

## Historical v2.3.0 learned knowledge foundation

170 learned subjects outside the locked Human Core (`docs/company/LEARNED_KNOWLEDGE_SYSTEM.md`, `KNOWLEDGE_SUBJECT_CATALOG.md`, `docs/company/templates/KNOWLEDGE_SUBJECT_TEMPLATE.md`). `w.knowledge.projects` requires team prerequisites, disciplineMinutes, sample inputs, elapsed days, and independent QA.

## Historical v2.2.0 SME progression, utilities & culture foundation

- **6-Stage SME-to-Conglomerate Growth Progression Ladder & 12 Organic Milestones (`w.companyProgression`)**
- **Real SME Utility Metering, Solar/Water Offsets & Voltage Brownout (`w.utilities`)**
- **Workplace Culture, Water-Cooler Gossip, Clubs, Townhall Awards, Employee Parking Lot & Alumni Spin-Offs (`w.culture`)**
- **10 Resource Classes, 64 Materials, 40 Recipes, 42 Products in 10 Product Families & 10 B2B Industrial Services**
- **Permanently Locked Human Core 1.0.0 (`COMPANY_SOURCE/js/human-core.js`, SHA-256 `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`)**
