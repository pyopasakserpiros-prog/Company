---
name: company-for-every-patch
description: Evergreen pre-patch and post-patch workflow, architectural invariants, Zero Code-Zero verification, 8-Workstream Process-Driven Realism invariants (Timed Refinery Batches, Warehouse Lots/FEFO, Equipment Subsystems/Acquisition Modes, Competitive Tenders, 180m Biological Cycles), and MANDATORY Master Skill update checklist for every patch of Siam Enterprise / Company Simulation (COMPANY_SOURCE/) through v2.7.0. Use on every Company patch alongside company-evolution-dev.
---
## Current release — v2.7.0 (`process-driven-realism-overhaul-v270`, authoritative)

1. **Pre-Patch Onboarding Sequence**:
   - Read `AGENTS.md` -> `START_HERE_FOR_AI.md` -> `ACTIVE_PROMPT.md` -> `project_status_and_ai_onboarding.md` -> `docs/company/AGENT_COLLABORATION_WORKFLOW.md` -> `docs/company/AGENT_WORK_STATUS.md` -> `.agents/skills/README.md` -> `company-evolution-dev` + `company-for-every-patch`.
   - Run baseline checks in `COMPANY_SOURCE/`: `node tools/verify.cjs` and `node tools/test.cjs`.
2. **Non-Negotiable Architectural & Process-Realism Invariants (Up to v2.7.0)**:
   - **Permanently Locked Human Core 1.0.0 (`COMPANY_SOURCE/js/human-core.js`)**: NEVER edit `js/human-core.js`, `CORE_LOCK.json` (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`), or `AGENTS.md`.
   - **Version Identifiers**: `D.VERSION = "2.7.0"`, `D.RELEASE_VERSION = "2.7.0"`, `S.RELEASE_VERSION = "2.7.0"`; keep `S.VERSION = "0.1.0"`, `S.SCHEMA = "company-foundation-1"`, and `package.json = "0.1.0"`.
   - **Timed Material Refinery Batches (`w.plant.refineryBatches`)**: Never revert `craftMaterialRecipe` or `runMidstreamRefining` to synchronous instant output. Inputs are reserved at enqueue (`w.inventory.reserved`), deducted after `loading_setup` (`inputsConsumed = true`), and released only after `inspection` and warehouse space verification.
   - **No Instant Completion Shortcuts in Live Loops**: Never pass `completeAllSteps: true` in autonomous NPC freight or B2B service loops. Freight requires elapsed outbound and return time; services require specialist work minutes, consumables, and `testMeasurements`; software requires qualified developers (`programming >= 40`, `software >= 40`).
   - **Shared Machine Power & Thermal Guard**: Keep `m.lastPowerAt === w.clock.absoluteMinute` and `m.lastThermalAt === w.clock.absoluteMinute` in `js/plant.js` so concurrent jobs/batches sharing a machine in the same tick never multiply power or heating.
   - **Warehouse Lot & World Escrow Conservation**: `S.audit(w)`, `S.warehouseAudit(w)`, `S.commercialAudit(w)`, `W.validate(w)`, and `Save.validate(w)` must all return `[]` (zero errors). Use `W.payFromCounterparty` and `W.adjustCommercialEscrow` so external counterparty cash and `m.playerNetSatang` reconcile exactly.
3. **Mandatory Post-Patch & Master Skill Update Checklist**:
   - Run `node tools/verify.cjs`, `node tools/test.cjs` (**186/186** tests), `node tools/build.cjs`, and `node tools/benchmark.cjs` in `COMPANY_SOURCE/`, and copy `CompanyFoundation_single.html` to `Company_single.html` and root `Company_single.html`.
   - Update `.agents/skills/company-evolution-dev/SKILL.md`, `.agents/skills/company-for-every-patch/SKILL.md`, root `SKILL.md`, `SKILL_COMPANY_EVOLUTION_DEV.md`, `SKILL_COMPANY_FOR_EVERY_PATCH.md`, `.agents/skills/README.md`, `START_HERE_FOR_AI.md`, `project_status_and_ai_onboarding.md`, `docs/company/AGENT_WORK_STATUS.md`, and affected domain skills/docs.
   - Call `skills:update_skill` for both `company-evolution-dev` and `company-for-every-patch` when running in the Gemini app environment.
   - Write `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V<X.Y.Z>.md` and package/verify `Company-v<X.Y.Z>.zip` (including `.agents/skills/`, excluding `.git` and `node_modules`) by extracting and running verification/tests in a clean directory before presenting deliverables.
