# Pending design work (post-v0.3.0)

## Completed and removed from pending in v0.3.0
- **Component SKU Identity & Physical Lot Provenance (`w.skus`, `w.lots`, `LOT_POLICY`)**: Implemented in `SPINOFF_SOURCE/js/sim.js` and `ui.js` (`PATCH_REPORT_V0.3.0.md`). Replaces pure `kind:generation` fungibility with explicit SKU/revision/lot tracking across 9 categories (`chip`, `ram`, `storage`, `display`, `camera`, `battery`, `enclosure`, `pcb_rf`, `os`), retroactive immunity, and audited compatible lot substitution (`qualifySubstitution`).
- **Company-Specific R&D Portfolios & Make/Buy/License Evaluation (`f.rndPortfolio`, `w.rndProjects`, `f.sourcingDecision`)**: Implemented 9 engineering focuses (`RND_TARGETS`), causal engineering tradeoffs, specialist subject gating, prototype rework, cancellation sunk costs, and explicit separation of objective infeasibility vs prudent strategic refusal (`declinedFeasibleModes`).
- **Observer Provenance Tracer & Schema 3 Adversarial Save Validation**: Implemented `traceSkuChain`, 6-tab Thai observer UI updates, Edit Hub target/current/proposed/provenance preview, and `schema: 3` / `silicon-handset-v030` validation.

## Remaining future candidates (unimplemented ambitions)
1. **Multi-Stage Foundry Wafer Queue, Binning (A-Bin / B-Bin) & Long-Term Supply Contracts**:
   - Expand chip/memory/display supplier production from single-stage batches into wafer-sort and OSAT binning yields (`A-Bin` flagship vs `B-Bin` harvested SKUs from the same wafer lot), plus multi-batch supply reservation contracts and capacity queues during industry shortages.
2. **Post-Launch Field Reliability, RMA Warranty Claims & OTA Firmware Updates**:
   - Track installed-base defect rates in consumer hands (driven by thermal stress `surfaceC`, battery protection score, and OS stability), generating warranty RMA claims, teardown root-cause evidence, and software-engineer OTA firmware patches that reduce OS overhead or thermal throttling post-launch.
3. **B2B Carrier/Distributor Channels, Tech Media Reviews & Deeper Workplace Relationships**:
   - Add funded carrier/distributor sell-in vs consumer sell-through channels, independent review benchmarks comparing promised vs measured sustained performance, and engineer mentoring/workplace conflict dynamics.

Retain `SPINOFF_MASTER_DESIGN_AND_CODEX_BLUEPRINT.md`, `SPINOFF_GAMEPLAY_UI_AND_SYSTEM_SPECS.md`, and `CODEX_REVIEW_AND_DESIGN_REFINEMENTS.md` as adjustable design references; implementation and test evidence determine actual status.
