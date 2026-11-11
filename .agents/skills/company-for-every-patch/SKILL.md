---
name: company-for-every-patch
description: Evergreen pre-patch and post-patch workflow, architectural invariants, Zero Code-Zero verification, 8 Business Process Models, NPC Business-Entry Audit invariants & Era 2.2.0 Geopolitics/Trade Corridors audit, and MANDATORY Master Skill update checklist for every patch of Siam Enterprise / Company Simulation (COMPANY_SOURCE/) up to v2.2.0. Use on every Company patch alongside company-evolution-dev.
---
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
