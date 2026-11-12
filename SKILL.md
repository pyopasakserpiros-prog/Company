---
name: company-evolution-dev
description: MASTER SKILL for Siam Enterprise / Company Simulation (บริษัทจำลองธุรกิจและอุตสาหกรรมอัตโนมัติ, COMPANY_SOURCE/) through v2.6.0 (historical v2.2.0 foundation retained below). Covers the Permanently Locked Human Core 1.0.0, 6-Stage SME-to-Conglomerate Growth Ladder & 12 Organic Milestones, 10-Level Corporate Hierarchy (Lv.1-Lv.10), 4-Tier Org Tree, 56x34 Greenfield Campus (14 Constructible Facilities + Visual Employee Parking Lot), 10 Resource Classes (64 Materials, 40 Recipes, 42 Products in 10 Product Families), 9 Capability Domains, 8 Distinct Business Process Models + 10 Industrial B2B Services (Wholesale & Toll Smelting included), Real SME Utility Metering (Solar/Water Offset & Brownout), Workplace Culture (Water-Cooler Gossip, Clubs, Townhall Awards & Alumni Spin-Off SMEs), Autonomous NPC Executive Board, Living Global Geopolitics (12 Nations, 16 Events, 4 Trade Corridors, 22+ Corporations), and 500-NPC Scaling (<1ms/tick). MANDATORY RULE: Update this Master Skill on every future patch.
---
## Current release — v2.6.0 (authoritative; earlier sections are historical)

Plant module:20 equipment types,42 product routes with actual worker labor, elapsed machine holds, temperatures, stations/capacity, wear, electricity and technical maintenance. Equipment purchase requires cash, delivery lead time and qualified installation. Learn missing maintenance prerequisites through the actual education system; no free skill gains. Material40 recipes/service10/software/freight/hand agriculture use appropriate tool gates, while material recipes retain synchronous batch completion.

Commercial sales: stock offers and120/240/1000-unit supply contracts split4–80-unit releases from real buyer/TH budgets held in World.commercialEscrows. Deposits/invoices release actual money; completed contracts return unused reserve. Public procurement is simplified solicitation, not legal competitive tender. Read PLANT_AND_COMMERCIAL_SYSTEM and v2.6.0 report before modifying, including limits and current verification177 tests/12 browser.

Every patch must produce an update report, refresh affected skills/status/docs and validate final ZIP. Root copies synchronized; Gemini app-local skill updates still await that app's tool/user workflow and cannot be claimed from repo edits. No changes to AGENTS/Human Core.

## Historical v2.4.0 world foundation

External World uses `COMPANY_SOURCE/js/world.js`, daily aggregate nation and firm accounts, finite material stocks, real interfirm transactions/in-transit shipments and indicator-based government/corporate choices. UI World has six inspection categories with nested entity details. 12 nations/blocs, 28 opening firms plus later spin-offs, 66 bilateral relations. Main material purchases and B2B sales connect to outside cash/stock; other main product/service contracts retain legacy finance. No scheduled random government/corporate headlines.

Read `docs/company/LIVING_WORLD_SYSTEM.md` for API, cash/stock equations, policy/term thresholds, production/crop rules and limitations. Current evidence is 166 unit tests and 11 browser cases plus check/build; do not treat older 140/152 counts below as current. `test/living-world-v240.test.cjs` verifies economic failures and 180-day/save continuation. World is aggregate economics, not human-agent households, real armies or legal tax modeling. External `profit` is after-tax cash surplus.

Every patch updates repo skills, project status, impacted docs and a patch report. Final ZIP must include world.js and all source/tools/tests/skills, pass CRC/hash comparisons and relevant extracted checks. App-local Gemini skills still need explicit synchronization in that app; repo updates alone do not sync it.

# Siam Enterprise: Autonomous Multi-Industry Company Simulation — MASTER ENGINEERING SKILL (Era 2.2.0 / v2.2.0)

> **MANDATORY MASTER SKILL UPDATE RULE**: Whenever a new patch or feature is developed for `Siam Enterprise / Company Simulation (COMPANY_SOURCE/)`, you MUST update both this Master Skill (`company-evolution-dev`) and the Evergreen Workflow Skill (`company-for-every-patch`) in `.agents/skills/`, root `SKILL.md`, and via `skills:update_skill` before completing the turn.

## 1. Core Identity & Architecture Overview (Era 2.2.0)
- **Game Title**: `Siam Enterprise: Autonomous Multi-Industry Company Simulation (บริษัทจำลองธุรกิจและอุตสาหกรรมอัตโนมัติ)`
- **Source Root**: `COMPANY_SOURCE/` (`D.VERSION: "2.2.0"`, `D.RELEASE_VERSION: "2.2.0"`, `S.RELEASE_VERSION: "2.2.0"`, catalog version `1.2.0`, `S.VERSION: "0.1.0"`, package.json version `0.1.0`)
- **Standalone Build**: `COMPANY_SOURCE/CompanyFoundation_single.html` and `Company_single.html` (`1,455,926` UTF-8 bytes, 100% Offline)
- **Permanently Locked Human Core 1.0.0 (`COMPANY_SOURCE/js/human-core.js`)**:
  - **HARD INVARIANT**: Never modify `js/human-core.js` or `CORE_LOCK.json` (`SHA-256: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`).

## 2. Complete System Architecture (Up to Era 2.2.0)
1. **6-Stage SME-to-Conglomerate Growth Progression Ladder & 12 Organic Milestones (`w.companyProgression`, `D.SME_GROWTH_STAGES`, `D.SME_MILESTONE_CATALOG`)**:
   - Evolves organically from `stage_1_micro_workshop` ➔ `stage_2_registered_sme` ➔ `stage_3_midcap_manufacturer` ➔ `stage_4_supply_chain_group` ➔ `stage_5_public_pcl` ➔ `stage_6_regional_conglomerate` via `evaluateCompanyGrowthStage(w, completedDay)`.
   - Tracks 12 first-time SME milestones (`first_order_paid`, `first_research_unlock`, `first_debt_repaid`, `debt_free_turnaround`, `team_double_digits`, `first_plot_constructed`, `first_fleet_truck`, `first_b2b_service`, `first_external_asset`, `first_green_utility_offset`, `first_employee_car`, `first_alumni_spinoff`) and scales `creditLimitMultiplier` (`1.0x..4.5x`) and `b2bTrustBonus`.
2. **Real SME Utility Metering, Solar/Water Offsets & Voltage Brownout (`w.utilities`, `stepUtilitiesDaily`, `payUtilityBills`)**:
   - Meters daily electricity (`dailyKwh`) by building levels, active lines, production regime (`craft_precision: 0.76x`, `lean_balanced: 1.0x`, `mass_throughput: 1.55x`), and OT hours, plus daily water (`dailyWaterM3`).
   - Offsets electricity via `solarPlant` (`145 kWh/d`) + `offsite_solar_wind_farm` (`210 kWh/d * level`) and water via `waterPlant` (`18 m3/d`), tracking `totalSavedBySolarWaterSatang`.
   - 2 consecutive unpaid billing cycles trigger a **Voltage Brownout (`brownoutActive = true`)** reducing assembly speed by 20% until paid.
3. **Workplace Culture, Water-Cooler Gossip, Clubs, Townhall Awards, Employee Parking Lot & Alumni Spin-Offs (`w.culture`)**:
   - `stepWorkplaceCultureDaily` generates deterministic real-state water-cooler gossip (`recentGossip`), runs 3 after-work clubs (`club_courtyard_running`, `club_canteen_friday_social`, `club_rnd_boardgame_tech`), and updates `parkedVehicles` (drawn visually in the 2D Canvas parking lot in `campus-render.js`).
   - `evaluateTownhallAwards` recognizes top contributors; `evaluateEmployeeSpinoff` lets senior/wealthy/ambitious employees launch a Spin-off SME in `w.externalWorld.corporations` (`partner` or `rival`) funded from their personal wallet.
4. **10 Resource Classes, 64 Materials, 40 Recipes, 42 Products in 10 Product Families & 10 B2B Industrial Services**:
   - Added 2 fast-turnover SME starter products (`braided_fast_charge_kit`, `artisan_chili_paste_jar` -> **42 products total**).
   - Added `wholesale_distribution` (with circular arbitrage rejection `circularWholesaleForbidden`) and `toll_smelting_extrusion` (with client ore custody in `sv.instrumentCustody` and `mineral_slag_mud` byproduct yield -> **10 B2B services total**).
5. **Autonomous Daytime Executive Board (`w.executiveBoard`) & Living Global Geopolitics (`12` Nations, `16` Events, `4` Trade Corridors, `22+` Corporations)**.
6. **Player-Friendly Non-Coder Edit Hub (`debug.js` & `directorEdit`)**:
   - Supports direct Baht grants separated between Company Cash (`grantCash`) and Employee Personal Wallet (`grantPersonWallet` — preserving 100% closed-loop payroll reconciliation), material category filters, and trait behavioral tendency previews.

## 3. Verification & Benchmark Suite
```bash
cd COMPANY_SOURCE
node tools/verify.cjs
node tools/test.cjs
node tools/build.cjs
node tools/benchmark.cjs
```
- All **140/140** unit tests pass with 0 failures (`~0.987 ms/tick` at 500 concurrent NPCs).

## v2.3.0 — Learned knowledge, company inspection, and technology entry

Current release adds 170 learned subjects outside the locked Human Core. Read `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md`, the generated `KNOWLEDGE_SUBJECT_CATALOG.md`, and `docs/company/templates/KNOWLEDGE_SUBJECT_TEMPLATE.md` before changing any subject or business requirement. Research sources are in `docs/company/research/KNOWLEDGE_CURRICULUM_SOURCES.md`.

- `sim.js`: SUBJECT_DETAILS, SUBJECT_PREREQUISITE_LEVELS, subjectSpec, subjectTalent, subjectPotential, learnSubject, subjectPerformance, productRequirements, MATERIAL_SUBJECTS/materialRequirements, SERVICE_SUBJECTS, OPERATIONS_SUBJECTS. Knowledge is personal (`p.education`); it is never locked by employer business type. Personal interests and paid after-work study can develop unrelated subjects.
- `w.knowledge.projects`: per-target qualification, team prerequisites, disciplineMinutes, real sample inputs in `materialsConsumed`, elapsed days, independent QA and failure/rework. Pooled research.points no longer unlocks anything; buying an asset does not grant product knowledge.
- `beginKnowledgeProject` and `acquireTechnologyLicense`: the latter pays 3× base research fee, reduces work to 40%, and still requires transfer time, qualified staff, samples and QA. `reviewKnowledge` chooses preparation/learning/buying/research using actual cash, workforce, market, cost and CEO risk.
- `API.snapshot().companyKnowledge`, `catalog.products[].readiness`, `people[].education`: company tabs and character ความรู้/Lv1–Lv5 must report actual state. `directorEdit/setSubject` only edits the selected person and creates an event.
- `save.js`: legacy saves without knowledge migrate; prior point unlocks are archived, contracts/finance/inventory retained. Reject invalid subjects and qualification evidence. Do not reset a valid current knowledge state on load.
- `campus-render.js`: centerCamera fits both map dimensions; minimum zoom derives from viewport/world size, including phones. Build updates all three standalone aliases.
- Verify with `test/knowledge-and-company.test.cjs`, `test/campus-browser.cjs`, normal check/test/build and benchmark. Regenerate the subject reference with `node tools/knowledge-catalog.cjs` from COMPANY_SOURCE. Never copy old global-point-unlock fixtures into production logic.

Repo skill updates do not update the Gemini app automatically. Record app-sync status truthfully if that app's skill update tool is unavailable.

## v2.5.0 integration

sim.productionSteps/productionView expose actual timed assembly checkpoints; planStockProduction creates no-deposit internal stockBatch orders, excluded from activeOrders/shipping until ready stock is allocated on acceptance. Save accepts internal offerId=null only with stockBatch/deposit0/unitPrice1. api.frame uses2game minutes/real second at1×; move uses8cells/tick. Read v2.5.0 patch report for remaining manufacturing scope; do not claim dedicated machinery or government procurement completed.

## Pending process-realism assignment

Root ACTIVE_PROMPT.md is the user-authorized English Gemini brief for eight operational workstreams afterv2.6.0. Verify baseline/source, especially synchronous crafting, production completeAllSteps callers and default software effort. It is pending implementation, not current functionality. Follow its acceptance/report/skill/ZIP requirements and record actual handoff ownership.
