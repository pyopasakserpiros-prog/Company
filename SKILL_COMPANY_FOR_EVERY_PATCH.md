---
name: company-for-every-patch
description: Use on every Company Simulation patch and when preparing its verification, documentation, skill updates or full editable delivery.
---
## Current v3.1.0 — 12-role phone-manufacturing supplier ecosystem, campus vertical integration & normal-opening supply calibration

Read `docs/company/ERA3_PHONE_SYSTEM.md` and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V3.1.0.md` before changing phones. Runtime is `3.1.0`; package/save remain `0.1.0` (`company-foundation-1`). NPCs operate autonomously; the player observes and uses Edit Hub only.

- Verify all 12 executable roles in `E.ROLE_CONTRACTS` (`fabless_soc`, `wafer_foundry`, `osat_packaging`, `dram_memory`, `nand_storage`, `camera_module`, `display_panel`, `battery_pack`, `pcb_rf`, `enclosure`, `os_platform`, `brand`) and 8 qualified grades in `E.MATERIAL_GRADES`.
- Verify campus supplier entry and vertical integration (`I.enterCampusRole`, `S.selectFeasibleCampusPhoneRole`, `S.phoneCompanyReview`): no free physical lots on entry, real campus `phoneWorkshop` minutes, equipment readiness & utility brownout checks (`checkCampusEquipmentReady`), and `syncCampusMaterialsIfNeeded` updating both `w.inventory.consumed` and `w.knowledge.materialsConsumed` to preserve `S.audit(w)` material allocation invariants.
- Verify objective feasibility vs. strategic refusal (`feasible: true`, `feasibleButDeclined: true`, `entry.status === "declined_prudent"` when a cautious CEO preserves cash).
- Verify Fabless SoC -> Wafer Foundry -> OSAT Packaging orders (`w.phoneIndustry.foundryOrders`), persistent WIP batches (`w.phoneIndustry.wipBatches`), and multi-supplier compatible lot substitution (`isSubstitutableLot`, `adoptOwnedCompatibleLot`).
- Run `node tools/verify.cjs`, `node tools/test.cjs` (**236/236 PASS**, including `test/phone-supplier-ecosystem-v310.test.cjs`), `node tools/build.cjs`, `node tools/phone-industry-soak.cjs` (both 360-day sector soaks and 45-day full-campus-life `S.advance(1440)` soak), and `node tools/benchmark.cjs`.

## Retained v3.0.0 — generated physical phone industry foundation

Read `docs/company/ERA3_PHONE_SYSTEM.md` and the v3 report before changing phones. Runtime is3.0.0; package/save remain0.1.0. NPCs operate; player observes/EditHub only.

- `phone-engineering.js`: pure `synthesizeChip`, `parts`, `evaluate`, `wafer`; GHz/MB/Wh/W/mm² and integer satang. Check ISA/memory/display/driver/power compatibility, workload/thermal bottlenecks and predecessor deltas. Bounded generated envelopes are not arbitrary technological discovery.
- `phone-industry.js`: `ensure/step/view/validate/compare`. No opening physical phones/parts; funded samples and actual input lots precede prototypes, assembly, pilot stock, release and household sales. Retain older demanded chips. Preserve reserved/used/sold conservation and in-flight obligations. Costs/fees/customs need actual counterparties.
- `phone-talent.js`: `ensure/capability/work/payroll/negotiateRecruitment/recruitToCampus/step/view/validate`. Stable profiles, subjects, finite shared360minute work, notice and identity-preserving recruitment. Re-freeze outside profiles and restore transferred education aliases in Save.deserialize.
- `sim.js:phoneCompanyReview` chooses affordable handset/enclosure/repair/acquisition routes from real subjects/tools/reserves/personality. Campus credits come only from completed `phoneWorkshop` jobs. Capital is funded expansion; dividends require measured profit via `investmentIncome`.
- `World.step(w,day,beforeSettlement)` calls phone work BEFORE profit/tax/history and government close. Both raw/component trade use Civics.quote, customs and finite shipping. Pure `phoneView/phoneTalentView` feed api/debug tabs. Experimental edits use validated/logged `directorPhoneEdit`, not normal management commands.
- Re-run new `test/phone-*-*.test.cjs`, baseline suite/check/build/browser, actual campus work/supplier cases, recruited save continuation and `node tools/phone-industry-soak.cjs`. This sector-only soak labels its deliberately endowed input fixture; it does not prove360daycampuslife or mobileFPS.
- Limits: aggregate factories/EMS, coarse processed inputs, bounded levels/initial supplier roles, direct household retail, incomplete legal IP/M&A/carrier/apps and normal supply calibration. Do not call all Era3 proposals completed. Maintain reference facts each patch; no new maturity certification or Gemini app synchronization is claimed.


## Retained v2.9.0 release

Every patch: read AGENTS and source first, preserve Agy's existing systems, update both repo master references and affected domain references/status/report together. For SME/political/news changes, additionally verify:

1. All six `startingBusiness` origins reconcile paid-in capital/opening cash/tools/stock/deposit; no gift of unrelated technology or SaaS. Start chooser must pause time on phone and standalone. Subjects remain learnable outside the current industry.
2. Use `civics.js` before `world.js`. Test popular-incumbent retention and unpopular turnover, announced/effective/expired measures, commodity specificity, finite quota, negotiated treaty/signature/expiry, war/ceasefire budget conservation. Pure reads may not sign deals, renew treaties or draw RNG.
3. Give news its actual personal reading time and finite knowledge record. Demonstrate that known risk changes a real supplier choice; hidden news alone must not update company beliefs. Partnership requires supplier history, negotiation time and paid signing.
4. Software calls without developer minutes/incomplete QA/unfunded clients must fail. Autonomous tick labor must finish projects normally; never restore a daily/manual compatibility bypass to satisfy an old fixture. Accounting fixtures explicitly declare labor and QA, and use real registered clients.
5. Run unit/integration, syntax/core, build, browser phone/desktop/standalone, meaningful multi-seed multi-origin audit/save runs and scaling benchmark. Record exact commands, runtime and limits. `docs/company/validation/v290` is evidence for this revision, not a guarantee for future changes.
6. Report partial scope honestly: aggregate outside firms, fictional leaders/bloc councils, no full legal/parliamentary/tactical model, product-by-product process detail still varies. Keep unfinished proposals in ideas; completed contracts belong in status. Two Gemini app skills still require updates inside that app by its operator; repo synchronization alone is insufficient.

Full ZIP delivery: one root with directories including .agents; all tracked source/assets/tests/tools/docs/report/builds. Close/reopen ZIP, CRC check, verify each file hash, extract fresh, rerun check/test/build and verify rebuilt standalone hashes. Keep ZIP outside git and publish its SHA256 separately. Do not claim app synchronization, recipient download or on-device playtest without evidence.

## Retained operational invariants — v2.8.0 (`living-scenarios-observability-and-human-depth-v280`, authoritative)

1. **Pre-Patch Onboarding Sequence**:
   - Read `AGENTS.md` -> `START_HERE_FOR_AI.md` -> `ACTIVE_PROMPT.md` -> `project_status_and_ai_onboarding.md` -> `docs/company/AGENT_COLLABORATION_WORKFLOW.md` -> `docs/company/AGENT_WORK_STATUS.md` -> `.agents/skills/README.md` -> `company-evolution-dev` + `company-for-every-patch`.
   - Run baseline checks in `COMPANY_SOURCE/`: `node tools/verify.cjs` and `node tools/test.cjs`.
2. **Non-Negotiable Architectural & Process-Realism Invariants (Up to v2.8.0)**:
   - **Permanently Locked Human Core 1.0.0 (`COMPANY_SOURCE/js/human-core.js`)**: NEVER edit `js/human-core.js`, `CORE_LOCK.json` (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`), or `AGENTS.md`.
   - **Version Identifiers**: `D.VERSION = "3.1.0"`, `D.RELEASE_VERSION = "3.1.0"`, `S.RELEASE_VERSION = "3.1.0"`; keep `S.VERSION = "0.1.0"`, `S.SCHEMA = "company-foundation-1"`, and `package.json = "0.1.0"`.
   - **Timed Material Refinery Batches (`w.plant.refineryBatches`)**: Never revert `craftMaterialRecipe` or `runMidstreamRefining` to synchronous instant output. Inputs are reserved at enqueue (`w.inventory.reserved`), deducted after `loading_setup` (`inputsConsumed = true`), and released only after `inspection` and warehouse space verification.
   - **Multi-Scenario Crisis & Bottleneck Autonomy**: Keep `P.maintain` iterating across all pending tasks (never head-of-line blocking on `x.maintenance[0]`), `unreservePartForRepair` releasing unstarted unit reservations when a broken machine needs a part in stock, `S.contractOemMaintenance` providing paid OEM fallback repair, and `evaluateCommercialSales` autonomously renegotiating late contracts (`renegotiateCommercialContract`) and offering `warehouseSale` clearance markdowns (`clearanceDiscountPct`).
   - **Observability Purity & Relationship Integrity**: `S.buildObservabilityView(w)` must remain a pure reader (never mutating `w` or advancing RNG during `API.view(w)`). Never create self-relationships (`otherId !== p.id`) in `finishJob` or `evaluatePromotions`, as `Save.validate(w)` enforces `other !== p.id`.
   - **Warehouse Lot & World Escrow Conservation**: `S.audit(w)`, `S.warehouseAudit(w)`, `S.commercialAudit(w)`, `W.validate(w)`, and `Save.validate(w)` must all return `[]` (zero errors). Use `W.payFromCounterparty` and `W.adjustCommercialEscrow` so external counterparty cash and `m.playerNetSatang` reconcile exactly.
3. **Mandatory Post-Patch & Master Skill Update Checklist**:
   - Run `node tools/verify.cjs`, `node tools/test.cjs` (report the actual discovered/pass/fail counts), `node tools/build.cjs`, and `node tools/benchmark.cjs` in `COMPANY_SOURCE/`, and copy `CompanyFoundation_single.html` to `Company_single.html` and root `Company_single.html`.
   - Update `.agents/skills/company-evolution-dev/SKILL.md`, `.agents/skills/company-for-every-patch/SKILL.md`, root `SKILL.md`, `SKILL_COMPANY_EVOLUTION_DEV.md`, `SKILL_COMPANY_FOR_EVERY_PATCH.md`, `.agents/skills/README.md`, `START_HERE_FOR_AI.md`, `project_status_and_ai_onboarding.md`, `docs/company/AGENT_WORK_STATUS.md`, and affected domain skills/docs.
   - Write `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V<X.Y.Z>.md` and keep `main` free of `.zip` files.

## Sibling spin-off v0.1.0 (separate runtime)

SPINOFF_SOURCE is the owner-authorised Silicon & Handset game, reusing unchanged HumanCore/pure phone engineering. Read spinoff_phone/PROJECT_STATUS.md and silicon-handset-dev skill for its distinct hourly loop, generated rivals, finite WIP/ledger, recruiting and audit {ok,errors}. Parent Company remains3.1.0; do not interpret spin-off results as new Company features. Build/test/save namespaces and standalone files are separate. App skills were not accessed by this sibling release.
