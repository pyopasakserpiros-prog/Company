# Company v3.1.0 — Era 3 phone-industry & supplier-ecosystem contracts

Updated 2026-11-12. Implementation base: `786f5b1bced6e43cdb1e10d02114bda2cbf0e8fc` on `main`, runtime v3.0.0. Runtime delivery: **v3.1.0**. Save/package version stays `0.1.0`, schema `company-foundation-1`.

This is an autonomous life-and-business simulation. NPCs make decisions; the player observes and edits conditions. This guide describes the executable v3.1.0 contracts and explicit abstractions.

## 1. 12 Executable Business Roles & 8 Qualified Material Grades (`phone-engineering.js`)

`phone-engineering.js` exports:
- `MATERIAL_GRADES`: 8 qualified phone-grade inputs (`electronic_silicon_wafer_9n`, `tested_wafer_die_lot`, `packaged_tested_ic_grade`, `cmos_optical_wafer_grade`, `aluminosilicate_panel_substrate`, `high_cycle_lipo_cell_grade`, `hdi_rf_copper_laminate`, `anodized_thermal_enclosure_grade`) with purity grade, raw inputs, and process transformation descriptions.
- `ROLE_CONTRACTS`: 12 executable roles (`fabless_soc`, `wafer_foundry`, `osat_packaging`, `dram_memory`, `nand_storage`, `camera_module`, `display_panel`, `battery_pack`, `pcb_rf`, `enclosure`, `os_platform`, `brand`) plus legacy alias mapping (`roleContract(roleId)`). Each contract defines `outputs`, `actualBuyers`, `subjectRequirements`, `keySpecialistSubject`, `requiredEquipment`, `utilityKw`, `entryCapitalSatang`, `nreCostSatang`, `licenseFeeSatang`, `workingCapitalDays`, `qualifiedMaterialGrade`, `bom`, `workMinutesPerUnit`, `minBatchSize`, `baseYield`, and 3-stage `processStages`.
- Pure functions: `synthesizeChip(seed, capability, options)`, `synthesizeComponent(seed, kind, capability, level, options)`, `parts(seed, level, options)`, `isCompatiblePart(chip, kind, spec)`, `evaluate(chip, parts, options)`, `wafer(options)`, and `evaluateRoleFeasibility(snapshotOrContext, roleId)`.

`evaluateRoleFeasibility` evaluates campus subject proficiency, installed/ready machines, cash above wage reserve, utility brownout state, and CEO personality (`riskTaking`, `prudence`) to return both objective feasibility (`feasible`) and strategic refusal (`feasibleButDeclined` when a cautious CEO declines a feasible entry to protect reserves).

## 2. 16-Firm Supplier Ecosystem, Fabless->Foundry->OSAT & WIP Batches (`phone-industry.js`)

- **16 Active External Firms**:
  - Handset Brands (`brand`): `siam_tech` (also `os_platform`), `titan_elec`, `asia_autoparts`, `eastern_auto`.
  - Semiconductor & Foundry/OSAT: `shenzhen_semi` (`chip`, `wafer_foundry`, `fabless_soc`), `siam_aero_robotics` (`fabless_soc`, `camera_module`), `singapore_port_3pl` (`ems`, `osat_packaging`).
  - Memory, Storage, Optics, Display, Battery, PCB/RF, Enclosure, OS: `tokyo_elec` (`display`, `display_panel`, `camera_module`, `dram_memory`, `nand_storage`), `apex_ind` (`dram_memory`), `solartech_asia` (`nand_storage`, `pcb_rf`), `biomed_siam` (`camera_module`), `pacific_solar` (`battery`, `battery_pack`), `green_power` (`battery_pack`, `display_panel`), `petro_chem_siam` (`materials`, `pcb_rf`, `enclosure`), `siam_metal` (`enclosure`), `bharat_biotech_it` (`os_platform`).
- **IDM vs. Fabless SoC Manufacturing (`produceChipBatch`)**:
  - Firms owning a wafer foundry (`wafer_foundry`) consume `silicon_wafer` + `copper_coil`, run `E.wafer(...)`, pay OSAT packaging fees to `singapore_port_3pl` (unless vertically integrated in `osat_packaging`), and receive `packaged_tested_ic_grade` chip lots.
  - Fabless firms (`fabless_soc`, including `phone_campus` or `siam_aero_robotics`) do not own a wafer fab: they book finite daily foundry capacity (`foundrySlots`) at an active wafer foundry (`shenzhen_semi`) and OSAT packaging at `singapore_port_3pl`, pay real foundry + packaging fees, and receive owned `chip` lots recorded in `w.phoneIndustry.foundryOrders`.
- **Multi-Supplier Lot Compatibility & Internal Buffer (`isSubstitutableLot`, `adoptOwnedCompatibleLot`, `purchase`)**:
  - Handset makers can source compatible same-level components from any qualified supplier (`apex_ind`, `solartech_asia`, `biomed_siam`, `green_power`, `phone_campus`, etc.) verified by `E.isCompatiblePart`.
  - When a vertically integrated firm operates both supplier roles and `brand`, external B2B buyers leave a 4-unit internal buffer per lot so the integrated firm can assemble its own handsets while selling surplus lots B2B.
- **Persistent WIP & Channel Ledgers**:
  - Every chip, component, and phone batch records a structured entry in `w.phoneIndustry.wipBatches` (`materialGrade`, `goodUnits`, `scrapUnits`, `workMinutesDone`, `inputCostSatang`, `serviceFeeSatang`).
  - Retail sales classify transactions into `carrier_bundle`, `retail_distributor`, or `direct_household` in `w.phoneIndustry.channels`.

## 3. Own-Company Supplier Entry & Vertical Integration (`enterCampusRole`, `phoneCompanyReview`)

- Every 14 days in `S.phoneCompanyReview`, the autonomous CEO evaluates `selectFeasibleCampusPhoneRole(w, wages, excludeRoles)` across all 12 roles.
- If a role is objectively feasible (`feasible: true`) but the CEO is highly conservative (`riskTaking < 40` or `prudence > 82` with tight buffer), `w.phoneIndustry.playerEntry` records `status: "declined_prudent"` and `feasibleButDeclined: true`.
- Otherwise, the company invests role-specific `entryCapitalSatang` (`120m–800m` satang depending on role) via `I.enterCampusRole(w, roleId, options)`, licenses or synthesizes an initial blueprint (never granting free physical lots), and schedules `phoneWorkshop` jobs.
- When `phoneWorkshop` completes in `finishJob`, if `w.phoneIndustry.campusFirmId` is active and no other `phoneWorkshop` job is queued, a new `phoneWorkshop` job is automatically queued so daily campus engineering and production proceed continuously.
- If `phone_campus` is already active and the CEO has `riskTaking >= 50` with sufficient cash reserves, `phoneCompanyReview` can expand `phone_campus.roles` into additional feasible roles (Vertical Integration across CPU + RAM + Camera + Handset).
- `syncCampusMaterialsIfNeeded` pulls unreserved materials from `w.inventory.materials` into `phone_campus` stock while incrementing both `w.inventory.consumed[k]` and `w.knowledge.materialsConsumed[k]` so `S.audit(w)` material conservation and allocation equations hold exactly.

## 4. Normal-Opening Upstream Supply Calibration (`world.js`)

Four systemic bottlenecks in `world.js` were resolved so normal openings produce sustained electronics and agricultural inputs without artificial gifts:
1. `operate()` sorts firm outputs by ascending material tier so vertically integrated firms produce Tier 0/1/2 inputs before attempting Tier 2/3 recipes on the same day.
2. `World.step` procurement `needs` includes biological crop/livestock inputs (`raw_water_m3`, `npk_fertilizer`, `soybean_crop`, `rice_bran_husk`) for firms producing `natural_latex`, `timber_bamboo_log`, and `fresh_milk_soy`.
3. Tier 0 extraction and regional refining capacities cover `copper_coil`, `polymer_resin`, `silicon_wafer`, `pcb`, `nitrogen_ammonia`, and `npk_fertilizer`.
4. Domestic household residual consumption preserves B2B working stock buffers and skips `PHONE_CRITICAL_MATERIALS` held by active phone industry firms so `Phone.step` can consume them.

## 5. Boundaries That Remain Visible

- External firms and EMS operate as daily batch models rather than per-machine cleanroom/SMT queues.
- Base catalog material/product/recipe counts (`64` / `42` / `40`) remain fixed for legacy test compatibility while phone-grade qualifications live in `E.MATERIAL_GRADES` and `w.phoneIndustry`.
- Full carrier balance-sheet financing, third-party app developer ecosystems, and formal patent litigation remain simplified or future scope.
