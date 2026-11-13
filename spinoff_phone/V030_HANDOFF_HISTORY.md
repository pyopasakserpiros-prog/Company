# Silicon & Handset v0.3.0 handoff & next-step prompt

## 1. Handoff summary
- **Base received**: `spinoff-phone` branch separation base `e7dbd0dbdf2ef733d8d5679aeeb036ff0d139284` (`Company-spinoff-phone.zip`, `659,627` bytes, SHA-256 `916a5bbfcd092131415905460e04f9ffbcc5a88a57f58cc8db5dee3c5bf451d0`).
- **Delivered release**: **Silicon & Handset v0.3.0** (`schema: 3`, storage key `silicon-handset-v030`).
- **Protected files**: `AGENTS.md`, `SPINOFF_SOURCE/js/human-core.js` (`fa83eaa0...`), `SPINOFF_SOURCE/CORE_LOCK.json`, and `SPINOFF_SOURCE/js/phone-engineering.js` (`26a27e57...`) are byte-for-byte unchanged.
- **What is completed in v0.3.0**:
  - Explicit Component SKUs (`w.skus`) across all 9 categories (`chip`, `ram`, `storage`, `display`, `camera`, `battery`, `enclosure`, `pcb_rf`, `os`) and physical lots (`w.lots`) with non-merging policy (`LOT_POLICY.allowImplicitMerge === false`), retroactive immunity, and compatible substitution (`qualifySubstitution`).
  - Company-owned R&D portfolios (`f.rndPortfolio`, `w.rndProjects`, `RND_TARGETS`) with 9 engineering focuses, causal engineering tradeoffs, specialist subject gating, prototype rework, cancellation sunk costs, and Make/Buy/License evaluation (`f.sourcingDecision`) separating infeasibility from prudent refusal.
  - Read-only Provenance Chain Tracer (`traceSkuChain`), updated 6-tab Thai observer UI, Edit Hub target/current/proposed/provenance view, and Schema 3 adversarial save validation.
- **How to verify after extracting the returned ZIP**:
  - Inside `SPINOFF_SOURCE/`:
    1. `node tools/check.cjs` (`npm run check`)
    2. `node --test test/simulation.test.cjs` (`npm test` — 29/29 tests)
    3. `node tools/build.cjs` (`npm run build` — verify `SPINOFF_SOURCE/Silicon_Handset_single.html` and root `Silicon_Handset_single.html` match byte-for-byte)
    4. `npm run test:browser` (in an environment with `playwright` installed and localhost Chromium permitted)
    5. `node tools/soak.cjs spinoff_phone/validation/v030/soak.json`

## 2. Ready-to-use prompt for the next patch (Proposal — not yet authorized until owner sends it)

> **Candidate Prompt for v0.4.0 (Post-Launch Field Reliability, RMA Teardown & Wafer Binning)**:
> "Read `AGENTS.md`, `START_HERE_FOR_AI.md`, `BRANCH_LAYOUT.md`, `spinoff_phone/PROJECT_STATUS.md`, `spinoff_phone/PATCH_REPORT_V0.3.0.md`, and `.agents/skills/silicon-handset-dev/SKILL.md` first. Starting from the Silicon & Handset v0.3.0 base (`schema: 3`), implement v0.4.0 (`schema: 4`, storage `silicon-handset-v040`):
> 1. **Wafer Binning (A-Bin / B-Bin) & Multi-Batch Foundry/Supplier Capacity Contracts**: When chip/memory/display suppliers manufacture lots, use die-area and process quality to split output into full-spec `A-Bin` SKUs and harvested lower-clock/lower-cost `B-Bin` SKUs with exact physical unit conservation. Allow brands to sign multi-batch supply reservations or buy discounted `B-Bin` lots for value phones.
> 2. **Post-Launch Installed Base, Thermal/Battery Field Reliability, RMA Warranty Claims & OTA Firmware Patches**: Track active phones in consumer cohorts after purchase. High surface temperatures (`surfaceC`), low battery protection, or high OS overhead cause field defects and warranty RMA returns that cost real cash and engineering hours to inspect/repair, while software engineers can develop and release OTA firmware updates (`os` SKU revisions) that reduce OS overhead or thermal throttling on already-sold phones without altering their physical hardware lots.
> Preserve observer-only Thai gameplay, immutable `human-core.js`, independent rivals with zero catch-up, integer satang and lot conservation, all existing tests, updated skills/docs/reports, and return a verified complete editable branch ZIP."
