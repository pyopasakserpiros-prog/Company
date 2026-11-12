# Company Simulation — Current Project Status and AI Onboarding

**Updated:** 2026-11-12. **Runtime:** v3.1.0. **Implementation base:** `786f5b1bced6e43cdb1e10d02114bda2cbf0e8fc` on `main`, repository `pyopasakserpiros-prog/Company` (previous runtime v3.0.0). This status is maintained identically at repository root, `COMPANY_SOURCE/` and `era3/`.

## What this game is

Company Simulation / Siam Enterprise is an **autonomous NPC life-and-business world**. Executives and employees decide, learn, work, trade and invest themselves. The player observes, controls time/camera and experiments through Edit Hub; normal management orders or approvals are not required. The owner is not a programmer and enjoys watching different people react differently to traits, knowledge, money and resources. AI collaborators must help design and create, not wait for every detail from the owner.

Read actual `AGENTS.md` before every assignment, then this status, `START_HERE_FOR_AI.md`, the work register/workflow and relevant `.agents/skills`. Do not change AGENTS or the locked Human Core without separate explicit permission.

## Runtime identity and invariants

| Contract | Current value |
|---|---|
| Release in data/sim | `3.1.0` |
| Save/package version | `0.1.0`; schema `company-foundation-1` |
| Source | Browser JavaScript, UMD/CommonJS, Canvas + DOM in `COMPANY_SOURCE/` |
| Tick / 1× speed | Five game minutes/tick; two game minutes/real second (12 real minutes/full game day) |
| Money | Integer satang, THB1 = 100 satang; real ledgers/counterparties |
| Locked Human Core | 14 traits, 18 values, 30 aptitudes/potentials, 12 states; SHA-256 `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32` |
| Ownership | Simulation owns time, RNG, decisions and cash/stock; UI consumes cloned snapshots |

## Current baseline systems retained

- Six SME origins: food kitchen, bakery, cable workshop, metal workshop, software agency and field repair. Opening paid-in capital, staff/subjects, tools, rent/deposits and stock reflect that origin. No SME starts with every technology or a chip fab.
- 170 learned subjects outside Human Core, prerequisites, individual potential/practice/condition, actual study and target-specific engineering projects/licensing. Knowledge irrelevant to a current business remains learnable.
- Campus life, work/travel/rest, needs, pay, relationships, memories, aspirations, promotion, specialist hiring, career switches, retention and spin-offs. Company/person/knowledge views and accessible Edit Hub exist.
- Legacy catalogues include 64 materials, 40 material recipes, 42 products, 20 equipment types and ten B2B service types. These are registry counts, not guarantees of equal process detail. Timed refinery batches, real labor, machine capacity/condition/faults/repair, services/software/QA, fleet/freight and biological cycles operate at their respective abstraction levels.
- Stock batches, finished lots/FIFO-FEFO/cold chain, paid commercial escrows/deposits/installments, public tenders, deliveries, renegotiation, termination and clearance. NPC crisis responses can recruit, repair, free unstarted reservations and adjust obligations.
- Twelve countries/blocs, 28 initial outside firms, finite cash/stock/resources, household/treasury accounts, trade, transport and prices. Fictional leaders/terms/approval, commerce ministries, commodity measures, treaties, conflicts and recovery affect funded operations. Parliamentary politics, tactical warfare and full population/legal economies are not implemented.
- NPC personal news consumption and risk beliefs affect buying/learning/partnership choices. Observer knowledge is broader than individual NPC information.

## v3.1.0 — Implemented Era 3 Phone-Manufacturing Supplier Ecosystem & Vertical Integration

Building on the v3.0.0 generated physical phone industry foundation, **v3.1.0** delivers the executable 12-role phone-manufacturing supplier ecosystem, own-company entry and vertical integration across specialist supplier roles, and normal-opening upstream supply calibration:

1. **12 Executable Business Roles (`E.ROLE_CONTRACTS`) & 8 Qualified Material Grades (`E.MATERIAL_GRADES`)**:
   - Models `fabless_soc` (Fabless CPU/SoC Design), `wafer_foundry` (Semiconductor Wafer Foundry), `osat_packaging` (OSAT Packaging & Test), `dram_memory` (DRAM / Volatile Memory Supplier), `nand_storage` (NAND Flash / eMMC / UFS Supplier), `camera_module` (Camera & Optics Supplier), `display_panel` (Display & Touch Panel Supplier), `battery_pack` (Battery & BMS Pack Supplier), `pcb_rf` (PCB / Interconnect / RF Supplier), `enclosure` (Mechanical & Thermal Enclosure Supplier), `os_platform` (OS / Firmware / Platform Vendor), and `brand` (Handset Brand / ODM / EMS).
   - Each role contract specifies subject requirements, key specialist subject, required campus equipment, utility draw (`utilityKw`), entry capital (`entryCapitalSatang`), NRE/licensing costs, working-capital days, qualified material grade (`electronic_silicon_wafer_9n`, `tested_wafer_die_lot`, `packaged_tested_ic_grade`, `cmos_optical_wafer_grade`, `aluminosilicate_panel_substrate`, `high_cycle_lipo_cell_grade`, `hdi_rf_copper_laminate`, `anodized_thermal_enclosure_grade`), BOM, and 3-stage process stages.
   - External industry expanded to **16 active firms** across all 12 roles (`siam_aero_robotics`, `apex_ind`, `solartech_asia`, `biomed_siam`, `green_power`, `bharat_biotech_it` alongside `shenzhen_semi`, `tokyo_elec`, `pacific_solar`, `petro_chem_siam`, `siam_metal`, `singapore_port_3pl`, and the 4 handset brands).

2. **Fabless SoC -> Wafer Foundry -> OSAT Packaging Pipeline (`produceChipBatch`, `foundryOrders`) & Persistent WIP (`wipBatches`)**:
   - Distinguishes owning a semiconductor fab (`wafer_foundry`) from fabless chip design (`fabless_soc`). A fabless company designs its architecture, pays foundry + OSAT fees, books finite daily foundry slots (`foundrySlots`), and receives packaged, tested `chip` lots (`packaged_tested_ic_grade`) logged in `w.phoneIndustry.foundryOrders`.
   - Component and handset production records multi-stage WIP batches in `w.phoneIndustry.wipBatches`, and compatible multi-supplier lots substitute cleanly (`isSubstitutableLot`, `adoptOwnedCompatibleLot`) while preserving a 4-unit internal buffer when a supplier also operates `brand`.

3. **Own-Company Entry Across All Supplier Roles, Vertical Integration & `declined_prudent` Separation**:
   - `I.enterCampusRole(w, roleId, options)`, `S.selectFeasibleCampusPhoneRole`, and `S.phoneCompanyReview` allow the observed campus SME (`phone_campus`) to enter any feasible supplier or brand role, sell components B2B to external handset makers, and vertically integrate across multiple roles (e.g., `fabless_soc` + `dram_memory` + `camera_module` + `brand`).
   - `E.evaluateRoleFeasibility` and `S.phoneCompanyReview` explicitly separate objective feasibility (`feasible: true`) from strategic refusal (`feasibleButDeclined: true`, `entry.status = "declined_prudent"`) when a cautious CEO preserves cash reserves.
   - Campus production pulls available campus warehouse inputs via `syncCampusMaterialsIfNeeded` (reconciling `w.inventory.consumed` and `w.knowledge.materialsConsumed`), checks campus machine readiness and utility brownouts (`checkCampusEquipmentReady`), and automatically continues `phoneWorkshop` jobs while `campusFirmId` is active.

4. **Normal-Opening Upstream Supply Calibration (`world.js`)**:
   - Fixed the 4 root causes of v3.0.0 normal-opening supply starvation (`24/25` phones over 360 days) without hidden refills or free endowments: (a) sorted `operate()` outputs by ascending material tier so vertically integrated firms produce raw/refined materials before consuming them; (b) added biological inputs (`raw_water_m3`, `npk_fertilizer`, `soybean_crop`, `rice_bran_husk`) for `natural_latex`/`timber_bamboo_log`/`fresh_milk_soy` to `World.step` procurement `needs`; (c) scaled Tier 0 extraction and added regional refining for `copper_coil`, `polymer_resin`, `silicon_wafer`, `pcb`, `nitrogen_ammonia`, and `npk_fertilizer`; (d) protected B2B working stock buffers and active phone division materials (`PHONE_CRITICAL_MATERIALS`) from domestic residual consumption before `Phone.step` runs.
   - Normal 360-day sector runs now produce **`601` phones (`16` designs, `12` smart)** in `era3-independent` and **`796` phones (`17` designs, `13` smart)** in `era3-world-b`, compared to `1,031` phones (`22` designs, `18` smart) in the endowed `era3-capable` fixture.

## Known limitations and next useful work

- Outside firms and EMS still use aggregate daily batch models rather than per-machine cleanroom/SMT placement queues.
- Base catalog material IDs (`64` materials, `40` recipes, `42` products) are preserved for backward compatibility while `E.MATERIAL_GRADES` tracks phone-grade qualification on phone lots and WIP batches.
- Carrier/retail channels (`carrier_bundle`, `retail_distributor`, `direct_household` in `w.phoneIndustry.channels`) record segment and radio-generation sales, while full carrier balance-sheet financing, app-store developer ecosystems, and formal patent/IP litigation remain partial or future scope.
- Playwright (`playwright` npm package) is not pre-installed in the offline sandbox VM container, so `npm run test:browser` must be run in an environment with Playwright/Chromium installed.

## Spin-off implementation — separate Silicon & Handset v0.1.0

Owner authorised a first playable spin-off after the design review. SPINOFF_SOURCE now implements independent seeded rival firms/people/resources, autonomous phone/supplier business, persistent work/stock/production, recruiting and a separate observer UI/save namespace. Company gameplay remains3.1.0. Read spinoff_phone/PROJECT_STATUS.md and PATCH_REPORT_V0.1.0.md for exact scope/evidence/limits; do not infer the complete Empire blueprint is finished. Root Silicon_Handset_single.html is the separate offline game.

## Verification and delivery

See `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V3.1.0.md` for exact commands, results, scenarios and limitations.

Run in `COMPANY_SOURCE/` with Node 18/20+:

```sh
npm test
npm run check
npm run build
npm run test:browser
node tools/phone-industry-soak.cjs
node tools/benchmark.cjs
```

At v3.1.0, `node tools/verify.cjs` passes (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`), `node tools/test.cjs` passes **236/236** unit/integration tests (including `test/phone-supplier-ecosystem-v310.test.cjs`), `node tools/build.cjs` builds `CompanyFoundation_single.html` (`1,982,770` UTF-8 bytes, copied to `COMPANY_SOURCE/Company_single.html` and root `Company_single.html`), `node tools/phone-industry-soak.cjs` passes 360-day sector soaks + 45-day full-campus-life (`S.advance(1440)`) soak, and `node tools/benchmark.cjs` records `1.499 ms/tick` mean at 500 NPCs.

## Source map and collaboration

| Module | Role |
|---|---|
| `js/sim.js`, `data.js`, `layout.js` | People/subjects/jobs/autonomy/catalogues/campus |
| `js/economy.js`, `world.js`, `civics.js` | Ledgers, living firms/trade/settlement, governments/policy |
| `js/startup.js`, `plant.js` | SME opening, machines/processes/maintenance |
| `js/phone-engineering.js` | 12 role contracts, 8 material grades, pure component synthesis/compatibility/thermal/yield/feasibility estimates |
| `js/phone-talent.js`, `phone-industry.js` | Stable professionals/recruitment across 12 roles; funded 16-firm physical industry, foundry orders, WIP batches & campus vertical integration |
| `js/api.js`, `save.js` | Cloned observation/commands and state/reference validation |
| `js/debug.js`, CSS/render modules | Read-only sheets, 6 phone tabs, role feasibility diagnostics, Edit Hub and presentation |
| `test/`, `tools/` | Tests, checks, builds and reproducible experiments |

Both repository master skills, root skill copies, all 14 domain skills, status mirrors, docs and reports are updated for v3.1.0, and the two installed Gemini app skills (`user:company-evolution-dev` and `user:company-for-every-patch`) were updated via `skills:update_skill` in the Gemini environment.
