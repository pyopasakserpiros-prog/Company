# Company v3.1.0 — Era 3 Phone-Manufacturing Supplier Ecosystem, Own-Company Vertical Integration & Upstream Supply Calibration Report

- **Date:** 2026-11-12
- **Received Archive Base:** `Company-main (6).zip` (`786f5b1bced6e43cdb1e10d02114bda2cbf0e8fc` on `main`, runtime `v3.0.0`)
- **Delivered Runtime Version:** `3.1.0` (`D.VERSION = "3.1.0"`, `D.RELEASE_VERSION = "3.1.0"`, `S.RELEASE_VERSION = "3.1.0"`)
- **Save / Package Schema:** `S.VERSION = "0.1.0"`, `S.SCHEMA = "company-foundation-1"`, `package.json = "0.1.0"` (unchanged)
- **Locked Files:** `AGENTS.md`, `COMPANY_SOURCE/js/human-core.js`, `COMPANY_SOURCE/CORE_LOCK.json` (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`) — **100% untouched**

---

## 1. Executive Summary

Following the canonical assignment in `ACTIVE_PROMPT.md`, **v3.1.0** transforms the v3.0.0 phone industry foundation into a full, interconnected **12-role phone-manufacturing supplier ecosystem** where:
1. **12 Executable Business Roles (`E.ROLE_CONTRACTS`) & 8 Qualified Material Grades (`E.MATERIAL_GRADES`)** govern distinct operations, required learned subjects, campus equipment, utility draw (`utilityKw`), NRE/licensing/capital gates, BOMs, and 3-stage process pipelines across `fabless_soc` (CPU/SoC design), `wafer_foundry`, `osat_packaging`, `dram_memory` (RAM), `nand_storage` (Flash storage), `camera_module`, `display_panel`, `battery_pack`, `pcb_rf`, `enclosure`, `os_platform`, and `brand`.
2. **Our Observed Campus SME (`phone_campus`) Can Enter, Operate, Sell B2B, and Vertically Integrate Across All 12 Roles**: Through `I.enterCampusRole(w, roleId, options)`, `S.selectFeasibleCampusPhoneRole`, and `S.phoneCompanyReview`, our company can autonomously become a Fabless CPU/SoC designer (booking wafer fabrication at `shenzhen_semi` + OSAT packaging at `singapore_port_3pl`), a DRAM memory producer, a CMOS camera module supplier, an enclosure or PCB/RF manufacturer, an OS vendor, a handset brand, or a vertically integrated group combining CPU + RAM + Camera + Handset assembly. Objective engineering/capital feasibility (`feasible`) is explicitly separated from strategic preference (`feasibleButDeclined` / `declined_prudent` when a cautious CEO preserves cash).
3. **Root-Cause Resolution of Normal-Opening Supply Starvation (`world.js`)**: Without adding any hidden refills, free endowments, or scripted smartphone unlocks, fixing 4 systemic upstream bottlenecks in `world.js` increased 360-day normal-opening phone output from `24` phones (0 smart) in v3.0.0 to **`601` phones (`16` designs, `12` smart)** in `era3-independent` and **`796` phones (`17` designs, `13` smart)** in `era3-world-b`.

---

## 2. Root-Cause Diagnosis & System-Wide Causal Chains

### 2.1 Why v3.0.0 Normal Openings Starved (`24/25` Phones Over 360 Days)
Auditing `COMPANY_SOURCE/js/world.js` and `COMPANY_SOURCE/js/phone-industry.js` revealed four compounding bottlenecks:
1. **Reverse-Tier Production Order Inside Vertically Integrated Firms (`world.js:operate`)**: `operate()` iterated `f.outputs` in array declaration order, where higher-tier materials appeared before their own upstream inputs. Vertically integrated firms attempted Tier 2/3 recipes before producing Tier 0/1 inputs on the same day. Sorting `f.outputs` by ascending material tier immediately restored same-day upstream-to-downstream material flow.
2. **Missing Biological Inputs in `World.step` Procurement (`world.js:step`)**: `World.step` only populated `needs` from `D.MATERIAL_RECIPES`, omitting the biological crop/livestock inputs (`raw_water_m3`, `npk_fertilizer`, `soybean_crop`, `rice_bran_husk`) required by `operate()` for `natural_latex`, `timber_bamboo_log`, and `fresh_milk_soy`. Adding these biological inputs to `needs` restored agricultural and chemical chain continuity.
3. **Insufficient Regional Refining Capacity for Electronic & Chemical Intermediates**: `copper_coil` (`18/day` total), `polymer_resin`, `silicon_wafer`, `pcb`, `nitrogen_ammonia`, and `npk_fertilizer` were bottlenecked by single-firm capacity caps while 28+ firms competed for them. Scaling Tier 0 extraction (`max(12, cap * 4)`) and adding regional refining roles across existing electronics/chemical firms resolved chronic global shortages.
4. **Domestic Residual Consumption Wiping Out Active Phone Division Working Stock**: In `world.js`, domestic household residual consumption drained firm stocks before `Phone.step` could use them. Protecting a B2B working stock buffer (`cap * 3`) and skipping `PHONE_CRITICAL_MATERIALS` held by active phone industry firms preserved paid industrial stock for manufacturing.

### 2.2 Interlocking Supplier Ecosystem & Multi-Supplier Substitution
- **16 Active External Firms (`phone-industry.js`)**: Added `siam_aero_robotics` (`fabless_soc`, `camera_module`), `apex_ind` (`dram_memory`), `solartech_asia` (`nand_storage`, `pcb_rf`), `biomed_siam` (`camera_module`), `green_power` (`battery_pack`, `display_panel`), and `bharat_biotech_it` (`os_platform`) alongside `shenzhen_semi` (`chip`, `wafer_foundry`, `fabless_soc`), `tokyo_elec`, `pacific_solar`, `petro_chem_siam`, `siam_metal`, `singapore_port_3pl` (`ems`, `osat_packaging`), and the 4 handset brands (`siam_tech`, `titan_elec`, `asia_autoparts`, `eastern_auto`).
- **Fabless SoC -> Wafer Foundry -> OSAT Packaging (`produceChipBatch`, `foundryOrders`)**: A `fabless_soc` firm does not own a wafer fab. When it produces a batch of its chip architecture, it books a finite daily wafer foundry slot (`foundrySlots`) at an active `wafer_foundry` (`shenzhen_semi`) and OSAT packaging at `singapore_port_3pl`, pays real foundry + packaging fees (`transfer`), consumes wafer/copper inputs, and receives owned `packaged_tested_ic_grade` chip lots logged in `w.phoneIndustry.foundryOrders`.
- **Multi-Supplier Lot Substitution (`isSubstitutableLot`, `adoptOwnedCompatibleLot`)**: Handset brands and prototypes can purchase compatible same-level components from any supplier (`apex_ind`, `solartech_asia`, `biomed_siam`, `green_power`, `phone_campus`, etc.) verified by `E.isCompatiblePart`. Vertically integrated firms that operate both supplier roles and `brand` retain a 4-unit internal buffer per lot so external B2B orders do not starve their own handset prototype/assembly lines.

---

## 3. Scope Matrix (v3.1.0)

| Requirement (`ACTIVE_PROMPT.md`) | Delivered Implementation | Verification Evidence |
|---|---|---|
| **1. 12 Executable Business Roles (`E.ROLE_CONTRACTS`)** | `fabless_soc`, `wafer_foundry`, `osat_packaging`, `dram_memory`, `nand_storage`, `camera_module`, `display_panel`, `battery_pack`, `pcb_rf`, `enclosure`, `os_platform`, `brand` with distinct subjects, equipment, utility draw, capital/NRE/licensing, BOM, and 3-stage process definitions | `test/phone-supplier-ecosystem-v310.test.cjs` Scenario 1 & 2 |
| **2. Qualified Phone Material Grades (`E.MATERIAL_GRADES`)** | 8 qualified grades (`electronic_silicon_wafer_9n`, `tested_wafer_die_lot`, `packaged_tested_ic_grade`, `cmos_optical_wafer_grade`, `aluminosilicate_panel_substrate`, `high_cycle_lipo_cell_grade`, `hdi_rf_copper_laminate`, `anodized_thermal_enclosure_grade`) recorded on lots and WIP batches | `test/phone-supplier-ecosystem-v310.test.cjs` Scenario 1, 2 & 6 |
| **3. Own-Company Entry into CPU, RAM, Camera & Other Supplier Roles** | `I.enterCampusRole(w, roleId, options)`, `S.selectFeasibleCampusPhoneRole`, `S.phoneCompanyReview`, automatic `phoneWorkshop` job continuation, and `syncCampusMaterialsIfNeeded` (preserving `S.audit(w)` material conservation & allocation) | `test/phone-supplier-ecosystem-v310.test.cjs` Scenario 1, 2 & 3 |
| **4. Campus Vertical Integration (CPU + RAM + Camera + Handset)** | `phone_campus.roles` tracks multiple active roles; vertically integrated campus produces its own SoC, RAM, and Camera lots, prioritizes in-house compatible parts in `selectBestChipForBrand` / `selectBestPartForBrand`, validates `1,200` minutes, and sells phones | `test/phone-supplier-ecosystem-v310.test.cjs` Scenario 3 & `tools/phone-industry-soak.cjs` (`v310-campus-full-life`) |
| **5. Objective Feasibility vs. Strategic Refusal (`declined_prudent`)** | `E.evaluateRoleFeasibility` and `S.phoneCompanyReview` record `feasible: true`, `feasibleButDeclined: true`, and `entry.status = "declined_prudent"` when a cautious CEO preserves cash reserves | `test/phone-supplier-ecosystem-v310.test.cjs` Scenario 4 |
| **6. Failure Modes & Recovery** | Broken machine (`press`, `electronics_bench`, `test_rig`), utility brownout (`w.utilities.brownoutActive`), missing staff, and empty cash block progress with specific Thai diagnostics and recover cleanly when fixed; `I.step(w, day)` is idempotent | `test/phone-supplier-ecosystem-v310.test.cjs` Scenario 5 & `test/phone-industry-v300.test.cjs` |
| **7. Normal-Opening Supply Calibration** | Resolved 4 upstream bottlenecks in `world.js`; normal 360-day sector runs produce **601** (`era3-independent`) and **796** (`era3-world-b`) phones with 12–13 smartphone designs | `node tools/phone-industry-soak.cjs` |
| **8. Observation UI, Bottleneck Integration & Edit Hub** | `debug.js` Phone modal shows 12-role feasibility matrix, active roles, WIP batches (`wipBatches`), foundry/OSAT orders (`foundryOrders`), and channel sales (`channels`); Edit Hub adds role-switching/vertical-integration experiment (`enterCampusRole`); `S.buildObservabilityView` surfaces phone division blockers | `js/debug.js`, `js/sim.js`, `test/phone-supplier-ecosystem-v310.test.cjs` Scenario 6 |

---

## 4. Verification Commands & Exact Results

Executed in `/working_dir/c_bb1a46cd3b739457/work/Company-main/COMPANY_SOURCE`:

1. **Core Lock & Syntax Verification (`node tools/verify.cjs`)**:
   - `PASS permanently locked human core 1.0.0: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`
   - `PASS source syntax and initial catalog/layout/accounting/save schema`
2. **Full Unit & Integration Test Suite (`node tools/test.cjs`)**:
   - **236 / 236 tests PASS** (`0` failures), including:
     - `test/phone-engineering-v300.test.cjs` (9/9 PASS)
     - `test/phone-talent-v3.test.cjs` (4/4 PASS)
     - `test/phone-industry-v300.test.cjs` (14/14 PASS)
     - `test/phone-supplier-ecosystem-v310.test.cjs` (6/6 multi-part acceptance scenarios PASS)
3. **Standalone HTML Build (`node tools/build.cjs`)**:
   - `Built CompanyFoundation_single.html: 1982770 UTF-8 bytes; autonomous campus simulation`
   - Copied identically to `COMPANY_SOURCE/Company_single.html` and root `Company_single.html`.
4. **360-Day Sector Soak + 45-Day Full-Campus-Life Soak (`node tools/phone-industry-soak.cjs`)**:
   - `era3-independent` (360d normal opening): `produced: 601, sold: 601, designs: 16, smart: 12, chips: 8, foundryOrders: 4, wipBatches: 160` — passed daily `S.audit` and `Save.validate`.
   - `era3-world-b` (360d normal opening): `produced: 796, sold: 796, designs: 17, smart: 13, chips: 8, foundryOrders: 4, wipBatches: 160` — passed daily `S.audit` and `Save.validate`.
   - `era3-capable` (360d ample endowment): `produced: 1031, sold: 1030, designs: 22, smart: 18, chips: 8, foundryOrders: 4, wipBatches: 160` — passed daily `S.audit` and `Save.validate`.
   - `v310-campus-full-life` (45d `S.advance(w, 1440)` vertical integration across `fabless_soc` + `dram_memory` + `camera_module` + `brand`): `produced: 52, sold: 47, designs: 5, chips: 2, foundryOrders: 1, wipBatches: 160` — passed daily `S.audit` and `Save.validate`.
5. **High-Scale Node Simulation Benchmark (`node tools/benchmark.cjs`)**:
   - `8` NPCs: `0.939 ms/tick` (p95 `3.823 ms`)
   - `30` NPCs: `1.066 ms/tick` (p95 `4.024 ms`)
   - `100` NPCs: `1.778 ms/tick` (p95 `5.238 ms`)
   - `300` NPCs: `0.608 ms/tick` (p95 `0.995 ms`)
   - `500` NPCs: `1.499 ms/tick` (p95 `2.314 ms`)
   - *(Note: Node simulation benchmark only; not a mobile browser FPS measurement.)*
6. **Browser Test Disclosure (`npm run test:browser`)**:
   - The offline sandbox VM container does not have the `playwright` npm package installed in `node_modules` and has no outbound internet access to run `npm install`, so `npm run test:browser` could not be executed via Playwright in this container. All DOM/script syntax, standalone HTML generation (`node tools/build.cjs`), and `CompanyAPI` / `S.phoneView` / `directorPhoneEdit` contracts are verified via `node tools/verify.cjs` and `node tools/test.cjs`.
7. **Gemini App Skills Synchronization**:
   - Both repository master skills (`.agents/skills/company-evolution-dev/SKILL.md` and `.agents/skills/company-for-every-patch/SKILL.md`), root copies (`SKILL.md`, `SKILL_COMPANY_EVOLUTION_DEV.md`, `SKILL_COMPANY_FOR_EVERY_PATCH.md`), all 14 domain skills in `.agents/skills/`, and the two installed Gemini app skills (`user:company-evolution-dev` and `user:company-for-every-patch`) were updated to `v3.1.0`.
