---
name: company-evolution-dev
description: MASTER SKILL for Siam Enterprise / Company Simulation (บริษัทจำลองธุรกิจและอุตสาหกรรมอัตโนมัติ, COMPANY_SOURCE/) up to Era 2.0.0 (v2.0.0). Covers the Permanently Locked Human Core 1.0.0, 10-Level Corporate Hierarchy (Lv.1-Lv.10), 4-Tier Org Tree, 56x34 Greenfield Campus (14 Constructible Facilities), 10 Resource Classes (58 Materials, 35 Recipes, 36 Products in 10 Product Families), 9 Capability Domains, 8 Distinct Business Process Models + 6 Industrial B2B Services, Autonomous NPC Executive Board & Decision Ledger, Living Global Geopolitics (8 Nations/Governments, 12 Wars/Treaties/Shocks, FX/Oil/Tariff Transmission, World Chronicle), 18 Multi-Role External Corporations, and 500-NPC High-Performance Scaling (<1ms/tick). MANDATORY RULE: Update this Master Skill on every future patch.
---
# Siam Enterprise: Autonomous Multi-Industry Company Simulation — MASTER ENGINEERING SKILL (Era 2.0.0 / v2.0.0)

> **MANDATORY MASTER SKILL UPDATE RULE**: Whenever a new patch or feature is developed for `Siam Enterprise / Company Simulation (COMPANY_SOURCE/)`, you MUST update both this Master Skill (`company-evolution-dev`) and the Evergreen Workflow Skill (`company-for-every-patch`) in `.agents/skills/`, root `SKILL.md`, and via `skills:update_skill` before completing the turn.

## 1. Core Identity & Architecture Overview (Era 2.0.0)
- **Game Title**: `Siam Enterprise: Autonomous Multi-Industry Company Simulation (บริษัทจำลองธุรกิจและอุตสาหกรรมอัตโนมัติ)`
- **Source Root**: `COMPANY_SOURCE/` (`D.VERSION: "2.0.0"`, `D.RELEASE_VERSION: "2.0.0"`, catalog version `1.2.0`, `S.VERSION: "0.1.0"` as the current simulation/save state marker, package.json version `0.1.0`)
- **Standalone Build**: `COMPANY_SOURCE/CompanyFoundation_single.html` and `Company_single.html` (built via `node tools/build.cjs`, 100% Offline)
- **Permanently Locked Human Core 1.0.0 (`COMPANY_SOURCE/js/human-core.js`)**:
  - **HARD INVARIANT**: Never modify `js/human-core.js` or `CORE_LOCK.json` (`SHA-256: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`).
  - Drives 14 Personality traits, 18 Values, 30 Aptitudes, and 12 Vitality States for every employee, manager, and CEO.

## 2. Complete System Architecture (Up to Era 2.0.0)
1. **10-Level Corporate Hierarchy (`Lv.1–Lv.10 / G1–G10`) & 4-Tier Organizational Tree**:
   - Divisions: Executive (`executive`), White-Collar Office (`office`: Sales, Admin/Procurement/Finance, R&D), and Blue-Collar Factory (`factory`: Production, QC/QA, Warehouse/Logistics).
   - 4-Tier Structure: Division ➔ Department ➔ Section ➔ Group (`D.ORG_TREE` & `D.resolveOrgAssignment`).
   - Span-of-Control Headcount Quotas (`CAREER_QUOTAS` & `getDepartmentHeadroom`) and Boss Promotion Evaluation (`evaluatePromotions`: Merit vs Favoritism/Nepotism with `promotionGrievance` ripple effects).
2. **56×34 Greenfield Industrial Estate & 14 Constructible Expansion Facilities (`D.EXPANSION_PLOTS`)**:
   - 8 Core Campus Buildings (`hq`, `rnd`, `factory`, `warehouse`, `canteen`, `courtyard`, `training`, `gate`) + 14 Constructible Plots (`rawDepot`, `prodLineB`, `prodLineC`, `cleanroomPlant`, `dispatchHub`, `execAnnex`, `maintWorkshop`, `qaLab`, `solarPlant`, `waterPlant`, `refineryMill`, `bakeryPlant`, `expoHall`, `dormitory`).
3. **10 Resource Classes, 58 Materials, 35 Multi-Stage Recipes & True Elemental Provenance (`D.RESOURCE_CLASSES`, `D.MATERIAL_RECIPES`)**:
   - **True Natural Resources (`T0_NATURAL` — 9 items)**: `silica_bauxite_ore`, `bauxite_ore`, `copper_iron_ore`, `lithium_brine_ore`, `phosphate_potash_rock`, `crude_petro_feedstock`, `raw_water_m3`, `ambient_air_gas`, `iron_ore` (9 catalog entries).
   - **Biological Seeds & Cuttings (`SEED_STOCK` — 5 items)**: `rice_seed`, `wheat_seed`, `cane_stalk_seed`, `palm_seedling`, `soybean_seed` (strict biological rule: `milled_rice`, `artisan_flour`, and `wheat_flour` have `cannotPlantAsSeed: true` and are rejected by `plantCropPlot`!).
   - **Cultivated Crops, Livestock & Forestry Logs (`CULTIVATED_CROP` — 8 items)**: `paddy_grain`, `wheat_grain`, `raw_cane`, `crude_palm`, `soybean_crop`, `fresh_milk_soy`, `natural_latex`, `timber_bamboo_log`.
   - **Refined T1, Intermediate T2 & High-Tech T3 Components**: True N-P-K synthesis (`ambient_air_gas` + `raw_water_m3` ➔ `nitrogen_ammonia` + `phosphate_potash_rock` ➔ `npk_fertilizer`), `wheat_flour`, `pharma_saline_water`, `silicon_wafer`, `microchip`, `power_inverter_ic`, etc.
4. **9 Capability Domains (`D.CAPABILITY_DOMAINS`), 10 Product Families (`D.PRODUCT_FAMILIES`), and 36 Products**:
   - 9 Domains: `food_fermentation`, `metal_machining`, `power_electronics`, `embedded_iot`, `semiconductor_optics`, `biomed_sterile`, `software_cloud`, `fleet_coldchain`, `agri_soil_science`.
   - Switching between products in the same Product Family on a production line incurs **0 tooling changeover cost** (`sameFamily: true`).
5. **8 Distinct Business Process Models & 6 Industrial B2B Services (`D.BUSINESS_PROCESS_MODELS`, `D.SECTOR_PROCESS_MODELS`, `D.INDUSTRIAL_SERVICES`)**:
   - **4 Factory Sector Engines (`w.sectorProcesses`)**:
     1. `food_bakery_batch`: Perishable `freshnessPct`, `shelfLifeDays` (3d base / 7d with `cold_chain_hub`), `expireFoodBatch` converts spoiled food to `+1 organic_compost`.
     2. `electronics_smt_rma`: Firmware revisions (`firmwareRevision`), 14-day post-sale `warrantyLots`, `triggerRmaClaim` & `resolveRmaClaim` (consumes 1 `pcb` or pays `customerRefund`).
     3. `automotive_oem_tooling`: Per-line `currentToolingProductId`, `triggerToolingChangeover`, and consecutive rhythm bonus.
     4. `biomed_sterile_lot`: ISO Class-5 `sterilityIndex` (`0..100`), `certifyBiomedLot`, quarantine rejection if `< 70%`.
   - **True Upstream Agriculture, Livestock, Mining & Forestry (`w.agriculture`)**: 8-stage crop cycle (`plantCropPlot`, `careCropPlot`, `harvestCropPlot`, `saveSeedFromCrop`), dairy herd feeding (`feedLivestockHerd`), finite mine reserve depletion & geological survey (`surveyNewMineVein`), and 3-age forestry rotation.
   - **Fleet Freight Transport (`w.fleetTransport`)**: 3 vehicle types (`dry_6w`, `reefer_6w`, `heavy_10w`), round-trip fuel (`diesel_liter`) + empty backhaul accounting, `cargoCustody` separation, and `matchBackhaulCargo`.
   - **Software House & SaaS (`w.softwareBusiness`)**: 8 apps, 30/40/30 milestone accounting (`unearnedDepositSatang`), strict engineer qualification & QA defect gate, and SaaS active subscriber billing (`0 subscribers = 0 revenue`).
   - **6 Industrial B2B Services (`w.serviceBusiness`)**: `calibration_lab`, `field_maintenance`, `industrial_recycling`, `battery_second_life_lab`, `returnable_pallet_pool`, `cold_storage_3pl` with strict spare-part & custody gates.
6. **Autonomous NPC Executive Board & Decision Ledger (`w.executiveBoard`, `evaluateExecutiveBoardAndBusinessEntry`)**:
   - Computes `uncommittedCashSatang` after deducting `survivalReserveSatang` (weighted by CEO `prudence`), payables, unpaid wages, `unearnedDepositsSatang`, and `committedBudgetSatang`.
   - Evaluates and logs proposals (`approved`, `pilot_or_buy_inputs`, `deferred_missing_staff`, `deferred_missing_materials`, `deferred_working_capital`, `deferred_unprofitable_market`, `hold_cash_prudent`, `deferred_no_executive_authority`) in `w.executiveBoard.decisionLedger`.
7. **Era 2.0.0 Living Global Geopolitics & World Chronicle (`w.externalWorld.geopolitics`, `w.externalWorld.worldChronicle`)**:
   - **8 Sovereign Nations & Blocs (`D.GLOBAL_NATIONS`)**: `TH`, `US`, `CN`, `JP`, `EU`, `ME`, `RU_EE`, `ASEAN`, each with multiple political/economic regimes (`changeForeignRegime`).
   - **12 Global Geopolitical Events (`D.GEOPOLITICAL_EVENTS`)**: Wars/blockades (`red_sea_blockade_war`, `black_sea_grain_fertilizer_war`), trade/tech embargoes (`superpower_chip_embargo`), regime elections (`us_regime_tariff_shift`, `global_green_supercycle_election`, `china_rare_earth_quota_shift`), international treaties (`asean_jp_eu_free_trade_pact`, `global_food_medical_accord`, `apac_robotics_semi_alliance`), and shocks (`el_nino_agri_drought`, `global_port_congestion_crisis`, `global_cyber_cloud_alert`).
   - **Real Economic Transmission (`recomputeGeopoliticalMultipliers`)**: Dynamically updates `fxRateBahtPerUsd`, `globalOilIndex`, `globalFreightRateMultiplier`, `globalLeadTimeMultiplier`, `materialPriceMultipliers`, `materialSpotPrices`, and `sectorDemandMultipliers`, feeding directly into `sellMaterialB2B`, `placePurchase`, `makeOffer`, `fleetTransport.openQuotes`, `stockMarket.indices`, and Executive Board asset scoring.
   - **World Chronicle (`w.externalWorld.worldChronicle`)**: Logged and merged into `snap.chronicle` under `category: "WORLD_GEOPOLITICS"`.

## 3. Verification & Benchmark Suite
```bash
cd COMPANY_SOURCE
node tools/verify.cjs
node tools/test.cjs
node tools/build.cjs
node tools/benchmark.cjs
```
- All **132/132** unit tests pass with 0 failures (`~0.80 ms/tick` at 500 concurrent NPCs).
