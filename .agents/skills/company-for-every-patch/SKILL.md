---
name: company-for-every-patch
description: Evergreen pre-patch and post-patch workflow, architectural invariants, Zero Code-Zero verification, Process-Driven Realism & Living Scenarios/Observability/Human Depth invariants (v2.8.0), and MANDATORY Master Skill update checklist for every patch of Siam Enterprise / Company Simulation (COMPANY_SOURCE/) through v2.8.0. Use on every Company patch alongside company-evolution-dev.
---
## Current release — v2.8.0 (`living-scenarios-observability-and-human-depth-v280`, authoritative)

1. **Pre-Patch Onboarding Sequence**:
   - Read `AGENTS.md` -> `START_HERE_FOR_AI.md` -> `ACTIVE_PROMPT.md` -> `project_status_and_ai_onboarding.md` -> `docs/company/AGENT_COLLABORATION_WORKFLOW.md` -> `docs/company/AGENT_WORK_STATUS.md` -> `.agents/skills/README.md` -> `company-evolution-dev` + `company-for-every-patch`.
   - Run baseline checks in `COMPANY_SOURCE/`: `node tools/verify.cjs` and `node tools/test.cjs`.
2. **Non-Negotiable Architectural & Process-Realism Invariants (Up to v2.8.0)**:
   - **Permanently Locked Human Core 1.0.0 (`COMPANY_SOURCE/js/human-core.js`)**: NEVER edit `js/human-core.js`, `CORE_LOCK.json` (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`), or `AGENTS.md`.
   - **Version Identifiers**: `D.VERSION = "2.8.0"`, `D.RELEASE_VERSION = "2.8.0"`, `S.RELEASE_VERSION = "2.8.0"`; keep `S.VERSION = "0.1.0"`, `S.SCHEMA = "company-foundation-1"`, and `package.json = "0.1.0"`.
   - **Timed Material Refinery Batches (`w.plant.refineryBatches`)**: Never revert `craftMaterialRecipe` or `runMidstreamRefining` to synchronous instant output. Inputs are reserved at enqueue (`w.inventory.reserved`), deducted after `loading_setup` (`inputsConsumed = true`), and released only after `inspection` and warehouse space verification.
   - **Multi-Scenario Crisis & Bottleneck Autonomy**: Keep `P.maintain` iterating across all pending tasks (never head-of-line blocking on `x.maintenance[0]`), `unreservePartForRepair` releasing unstarted unit reservations when a broken machine needs a part in stock, `S.contractOemMaintenance` providing paid OEM fallback repair, and `evaluateCommercialSales` autonomously renegotiating late contracts (`renegotiateCommercialContract`) and offering `warehouseSale` clearance markdowns (`clearanceDiscountPct`).
   - **Observability Purity & Relationship Integrity**: `S.buildObservabilityView(w)` must remain a pure reader (never mutating `w` or advancing RNG during `API.view(w)`). Never create self-relationships (`otherId !== p.id`) in `finishJob` or `evaluatePromotions`, as `Save.validate(w)` enforces `other !== p.id`.
   - **Warehouse Lot & World Escrow Conservation**: `S.audit(w)`, `S.warehouseAudit(w)`, `S.commercialAudit(w)`, `W.validate(w)`, and `Save.validate(w)` must all return `[]` (zero errors). Use `W.payFromCounterparty` and `W.adjustCommercialEscrow` so external counterparty cash and `m.playerNetSatang` reconcile exactly.
3. **Mandatory Post-Patch & Master Skill Update Checklist**:
   - Run `node tools/verify.cjs`, `node tools/test.cjs` (**190/190** tests), `node tools/build.cjs`, and `node tools/benchmark.cjs` in `COMPANY_SOURCE/`, and copy `CompanyFoundation_single.html` to `Company_single.html` and root `Company_single.html`.
   - Update `.agents/skills/company-evolution-dev/SKILL.md`, `.agents/skills/company-for-every-patch/SKILL.md`, root `SKILL.md`, `SKILL_COMPANY_EVOLUTION_DEV.md`, `SKILL_COMPANY_FOR_EVERY_PATCH.md`, `.agents/skills/README.md`, `START_HERE_FOR_AI.md`, `project_status_and_ai_onboarding.md`, `docs/company/AGENT_WORK_STATUS.md`, and affected domain skills/docs.
   - Write `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V<X.Y.Z>.md` and keep `main` free of `.zip` files.
