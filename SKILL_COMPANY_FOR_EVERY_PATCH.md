---
name: company-for-every-patch
description: Evergreen pre-patch and post-patch workflow, architectural invariants, Zero Code-Zero verification, Process-Driven Realism & Living Scenarios/Observability/Human Depth invariants (v2.8.0), and MANDATORY Master Skill update checklist for every patch of Siam Enterprise / Company Simulation (COMPANY_SOURCE/) through v2.9.0. Use on every Company patch alongside company-evolution-dev.
---
## Current release — v2.9.0

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
   - **Version Identifiers**: `D.VERSION = "2.9.0"`, `D.RELEASE_VERSION = "2.9.0"`, `S.RELEASE_VERSION = "2.9.0"`; keep `S.VERSION = "0.1.0"`, `S.SCHEMA = "company-foundation-1"`, and `package.json = "0.1.0"`.
   - **Timed Material Refinery Batches (`w.plant.refineryBatches`)**: Never revert `craftMaterialRecipe` or `runMidstreamRefining` to synchronous instant output. Inputs are reserved at enqueue (`w.inventory.reserved`), deducted after `loading_setup` (`inputsConsumed = true`), and released only after `inspection` and warehouse space verification.
   - **Multi-Scenario Crisis & Bottleneck Autonomy**: Keep `P.maintain` iterating across all pending tasks (never head-of-line blocking on `x.maintenance[0]`), `unreservePartForRepair` releasing unstarted unit reservations when a broken machine needs a part in stock, `S.contractOemMaintenance` providing paid OEM fallback repair, and `evaluateCommercialSales` autonomously renegotiating late contracts (`renegotiateCommercialContract`) and offering `warehouseSale` clearance markdowns (`clearanceDiscountPct`).
   - **Observability Purity & Relationship Integrity**: `S.buildObservabilityView(w)` must remain a pure reader (never mutating `w` or advancing RNG during `API.view(w)`). Never create self-relationships (`otherId !== p.id`) in `finishJob` or `evaluatePromotions`, as `Save.validate(w)` enforces `other !== p.id`.
   - **Warehouse Lot & World Escrow Conservation**: `S.audit(w)`, `S.warehouseAudit(w)`, `S.commercialAudit(w)`, `W.validate(w)`, and `Save.validate(w)` must all return `[]` (zero errors). Use `W.payFromCounterparty` and `W.adjustCommercialEscrow` so external counterparty cash and `m.playerNetSatang` reconcile exactly.
3. **Mandatory Post-Patch & Master Skill Update Checklist**:
   - Run `node tools/verify.cjs`, `node tools/test.cjs` (report the actual discovered/pass/fail counts), `node tools/build.cjs`, and `node tools/benchmark.cjs` in `COMPANY_SOURCE/`, and copy `CompanyFoundation_single.html` to `Company_single.html` and root `Company_single.html`.
   - Update `.agents/skills/company-evolution-dev/SKILL.md`, `.agents/skills/company-for-every-patch/SKILL.md`, root `SKILL.md`, `SKILL_COMPANY_EVOLUTION_DEV.md`, `SKILL_COMPANY_FOR_EVERY_PATCH.md`, `.agents/skills/README.md`, `START_HERE_FOR_AI.md`, `project_status_and_ai_onboarding.md`, `docs/company/AGENT_WORK_STATUS.md`, and affected domain skills/docs.
   - Write `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V<X.Y.Z>.md` and keep `main` free of `.zip` files.
