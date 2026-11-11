---
name: company-evolution-dev
description: MASTER SKILL for Siam Enterprise / Company Simulation (บริษัทจำลองธุรกิจและอุตสาหกรรมอัตโนมัติ, COMPANY_SOURCE/) up to Era 2.2.0 (v2.2.0). Covers the Permanently Locked Human Core 1.0.0, 6-Stage SME-to-Conglomerate Growth Ladder & 12 Organic Milestones, 10-Level Corporate Hierarchy (Lv.1-Lv.10), 4-Tier Org Tree, 56x34 Greenfield Campus (14 Constructible Facilities + Visual Employee Parking Lot), 10 Resource Classes (64 Materials, 40 Recipes, 42 Products in 10 Product Families), 9 Capability Domains, 8 Distinct Business Process Models + 10 Industrial B2B Services (Wholesale & Toll Smelting included), Real SME Utility Metering (Solar/Water Offset & Brownout), Workplace Culture (Water-Cooler Gossip, Clubs, Townhall Awards & Alumni Spin-Off SMEs), Autonomous NPC Executive Board, Living Global Geopolitics (12 Nations, 16 Events, 4 Trade Corridors, 22+ Corporations), and 500-NPC Scaling (<1ms/tick). MANDATORY RULE: Update this Master Skill on every future patch.
---
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
