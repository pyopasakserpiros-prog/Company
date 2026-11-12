---
name: company-for-every-patch
description: Evergreen pre-patch and post-patch workflow, architectural invariants, Zero Code-Zero verification, 8 Business Process Models, NPC Business-Entry Audit invariants & Era 2.2.0 Geopolitics/Trade Corridors audit, and MANDATORY Master Skill update checklist for every patch of Siam Enterprise / Company Simulation (COMPANY_SOURCE/) through v2.6.0. Use on every Company patch alongside company-evolution-dev.
---
## Current release — v2.6.0 (authoritative; earlier sections are historical)

Plant module:20 equipment types,42 product routes with actual worker labor, elapsed machine holds, temperatures, stations/capacity, wear, electricity and technical maintenance. Equipment purchase requires cash, delivery lead time and qualified installation. Learn missing maintenance prerequisites through the actual education system; no free skill gains. Material40 recipes/service10/software/freight/hand agriculture use appropriate tool gates, while material recipes retain synchronous batch completion.

Commercial sales: stock offers and120/240/1000-unit supply contracts split4–80-unit releases from real buyer/TH budgets held in World.commercialEscrows. Deposits/invoices release actual money; completed contracts return unused reserve. Public procurement is simplified solicitation, not legal competitive tender. Read PLANT_AND_COMMERCIAL_SYSTEM and v2.6.0 report before modifying, including limits and current verification177 tests/12 browser.

Every patch must produce an update report, refresh affected skills/status/docs and validate final ZIP. Root copies synchronized; Gemini app-local skill updates still await that app's tool/user workflow and cannot be claimed from repo edits. No changes to AGENTS/Human Core.

## Historical v2.4.0 world foundation

External World uses `COMPANY_SOURCE/js/world.js`, daily aggregate nation and firm accounts, finite material stocks, real interfirm transactions/in-transit shipments and indicator-based government/corporate choices. UI World has six inspection categories with nested entity details. 12 nations/blocs, 28 opening firms plus later spin-offs, 66 bilateral relations. Main material purchases and B2B sales connect to outside cash/stock; other main product/service contracts retain legacy finance. No scheduled random government/corporate headlines.

Read `docs/company/LIVING_WORLD_SYSTEM.md` for API, cash/stock equations, policy/term thresholds, production/crop rules and limitations. Current evidence is 166 unit tests and 11 browser cases plus check/build; do not treat older 140/152 counts below as current. `test/living-world-v240.test.cjs` verifies economic failures and 180-day/save continuation. World is aggregate economics, not human-agent households, real armies or legal tax modeling. External `profit` is after-tax cash surplus.

Every patch updates repo skills, project status, impacted docs and a patch report. Final ZIP must include world.js and all source/tools/tests/skills, pass CRC/hash comparisons and relevant extracted checks. App-local Gemini skills still need explicit synchronization in that app; repo updates alone do not sync it.

# Company Simulation — Evergreen Patch Workflow & Master Skill Checklist (`company-for-every-patch` — Era 2.2.0)

Use this skill on **every patch** of `Siam Enterprise: Autonomous Multi-Industry Company Simulation (COMPANY_SOURCE/)` alongside the Master Skill `company-evolution-dev`.

## 1. Pre-Patch Onboarding Sequence
1. Read `START_HERE_FOR_AI.md`, `AGENTS.md`, `project_status_and_ai_onboarding.md`, and look up `company-evolution-dev` + `company-for-every-patch`.
2. Run baseline verification in `COMPANY_SOURCE/`:
   ```bash
   node tools/verify.cjs
   node tools/test.cjs
   ```

## 2. Non-Negotiable Architectural Invariants (Up to v2.2.0)
1. **Permanently Locked Human Core 1.0.0 (`COMPANY_SOURCE/js/human-core.js`)**:
   - NEVER edit `js/human-core.js` or `CORE_LOCK.json` (`SHA-256: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`).
   - Source distinction: `D.VERSION` / `D.RELEASE_VERSION` are the game release (`"2.2.0"`); catalog version is `"1.2.0"`; `S.VERSION` in `sim.js` is the current world/save state marker (`"0.1.0"`); `package.json` is `"0.1.0"`.
2. **100% Autonomous NPC, Daytime Executive Board & Living Geopolitical World**:
   - Executive Board live review MUST run during daytime working hours (`tod(w) === 645` / 10:45 AM in `step(w)`) when the CEO/senior leader is naturally `atWork`. Never rely on `ignoreAtWork: true` to claim autonomous live progression works.
   - Keep `committedBudgetSatang` (`eb.reservations` via `reserveBoardBudget`) strictly separate from already-paid capital (`paidCapitalTotalSatang` via `consumeBoardReservation`) so cash is never double-deducted.
   - Maintain `leaseDepositSatang` on all `FLEET_VEHICLES`, enforce `nextReviewDay` / `topicCooldowns`, and evaluate `service_entry` against `remainingUncommitted` (never raw `w.finance.cash`).
3. **Closed-Loop Integer-Satang Accounting & Material/Product Conservation**:
   - `S.audit(w)` and `Save.validate(w)` must return `[]` (zero errors) at all times.
   - Non-PO operational expenses post to `equipment` or `expansion` (never `materials`, which is reserved for `w.purchases` reconciliation); customer refunds/SLA penalties post to `customerRefund`.
4. **High-Performance 500-NPC Scaling (`< 2 ms/tick`)**:
   - Maintain $O(1)$ per-tick station/social indexing (`tickCtx`) and LRU pathfinding cache.

## 3. Mandatory Post-Patch & Master Skill Update Checklist
Before finishing ANY patch turn:
1. **Run Verification, Unit Tests (`140+` tests), Build & Benchmark**:
   ```bash
   cd COMPANY_SOURCE
   node tools/verify.cjs
   node tools/test.cjs
   node tools/build.cjs
   node tools/benchmark.cjs
   ```
   Copy `CompanyFoundation_single.html` to `Company_single.html` and the output directory.
2. **Update Master Skill & Onboarding Docs (MANDATORY ON EVERY PATCH)**:
   - Update `.agents/skills/company-evolution-dev/SKILL.md`, `.agents/skills/company-for-every-patch/SKILL.md`, root `SKILL.md`, `SKILL_COMPANY_EVOLUTION_DEV.md`, `SKILL_COMPANY_FOR_EVERY_PATCH.md`, `START_HERE_FOR_AI.md`, and `project_status_and_ai_onboarding.md`.
   - Call `skills:update_skill` for **both** `company-evolution-dev` and `company-for-every-patch` so the Master Skill in Gemini is always synchronized with the latest patch.
3. **Write Patch Implementation Report & Package Full Project ZIP**:
   - Create `PATCH_IMPLEMENTATION_REPORT_COMPANY_V<X.Y.Z>.md` and package `Company-v<X.Y.Z>.zip` (excluding `.git` and `node_modules`), then extract and verify the packaged ZIP in a clean temp folder before delivery.

## Learned subject and business-entry maintenance

For any new or revised subject, use `docs/company/templates/KNOWLEDGE_SUBJECT_TEMPLATE.md`. Check prerequisites/levels, weighted Human Core components (read-only), individual learning/experience, actual work effects, every consumer/gate, NPC preparation, snapshot/UI and save validation. All subjects remain learnable even when no company business uses them.

Regenerate `docs/company/KNOWLEDGE_SUBJECT_CATALOG.md` using `node COMPANY_SOURCE/tools/knowledge-catalog.cjs`; update the system guide and research evidence when needed. Verify raw money/points do not bypass qualification, buying technology still needs staff and transfer, and legacy saves do not turn everybody into universal experts. `tools/build.cjs` now updates the three official HTML aliases directly.

When an app-specific `skills:update_skill` tool is not available to the current agent, keep both repository master copies current and report Gemini-app sync as unavailable; never fabricate that update.

## v2.5.0 integration

sim.productionSteps/productionView expose actual timed assembly checkpoints; planStockProduction creates no-deposit internal stockBatch orders, excluded from activeOrders/shipping until ready stock is allocated on acceptance. Save accepts internal offerId=null only with stockBatch/deposit0/unitPrice1. api.frame uses2game minutes/real second at1×; move uses8cells/tick. Read v2.5.0 patch report for remaining manufacturing scope; do not claim dedicated machinery or government procurement completed.
