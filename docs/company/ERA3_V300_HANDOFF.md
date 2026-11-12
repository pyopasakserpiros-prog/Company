# Company v3.1.0 — Era 3 Supplier Ecosystem Handoff

Implementation base `786f5b1bced6e43cdb1e10d02114bda2cbf0e8fc` (v3.0.0) -> delivered runtime **v3.1.0**. Read [AGENTS.md](../../AGENTS.md), [current status](../../project_status_and_ai_onboarding.md), [work register](AGENT_WORK_STATUS.md), [system contracts](ERA3_PHONE_SYSTEM.md), skills and [v3.1.0 report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V3.1.0.md).

## What was completed in v3.1.0

1. **12 Executable Supplier & Brand Roles (`E.ROLE_CONTRACTS`) + 8 Qualified Material Grades (`E.MATERIAL_GRADES`)** in `COMPANY_SOURCE/js/phone-engineering.js`.
2. **16-Firm External Ecosystem, Fabless SoC -> Wafer Foundry -> OSAT Packaging (`foundryOrders`), Persistent WIP (`wipBatches`), Multi-Supplier Compatible Lot Substitution (`isSubstitutableLot`, `adoptOwnedCompatibleLot`), and Carrier/Retail Channel Tracking (`channels`)** in `COMPANY_SOURCE/js/phone-industry.js`.
3. **Own-Company Entry & Vertical Integration Across All 12 Roles (`I.enterCampusRole`, `S.selectFeasibleCampusPhoneRole`, `S.phoneCompanyReview`)** plus explicit `declined_prudent` separation when a cautious CEO declines an objectively feasible role.
4. **Normal-Opening Supply Starvation Resolution (`world.js`)**: `era3-independent` 360-day soak increased from `24` phones (0 smart) to **`601` phones (`16` designs, `12` smart)**; `era3-world-b` increased from `25` phones to **`796` phones (`17` designs, `13` smart)**; `v310-campus-full-life` 45-day full-campus-life (`S.advance(1440)`) soak produced **`52` phones (`47` sold, `5` designs)**.
5. **End-to-End Acceptance Suite**: `test/phone-supplier-ecosystem-v310.test.cjs` (**236/236** total tests passing).

## Acceptance Traps to Retain on Future Patches

- Never modify `AGENTS.md`, `COMPANY_SOURCE/js/human-core.js`, or `CORE_LOCK.json` (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`).
- Keep base catalog counts at `64` materials, `42` products, and `40` material recipes (`test/ecosystem-multitier-dag-v100.test.cjs` and `test/product-depth-npc-board-v130.test.cjs`).
- When pulling campus materials into `phone_campus` (`syncCampusMaterialsIfNeeded`), always increment both `w.inventory.consumed[k]` and `w.knowledge.materialsConsumed[k]` so `S.audit(w)` material allocation invariants pass.
- Preserve `tokyo_elec` Day 1 40% shared production budget (`test/phone-industry-v300.test.cjs` Subtest 19) and `shenzhen_semi` no-staff block (`test/phone-industry-v300.test.cjs` Subtest 3).
