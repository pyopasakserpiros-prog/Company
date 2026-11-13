# Silicon & Handset v0.3.0 implementation report

- **Date**: 2026-11-13
- **Received Base**: Dedicated branch `spinoff-phone`, separation base commit `e7dbd0dbdf2ef733d8d5679aeeb036ff0d139284`
- **Received Archive**: `Company-spinoff-phone.zip` (`659,627` bytes, SHA-256 `916a5bbfcd092131415905460e04f9ffbcc5a88a57f58cc8db5dee3c5bf451d0`)
- **Delivered Runtime**: **0.3.0**, schema **3**, storage key **`silicon-handset-v030`**
- **Immutable Files Verified Unchanged**:
  - `AGENTS.md`: SHA-256 `909301ff2290bdea100401e5243637ac32d1fdc7646abd4dfec7b4caa248ca95`
  - `SPINOFF_SOURCE/js/human-core.js`: SHA-256 `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`
  - `SPINOFF_SOURCE/CORE_LOCK.json`: SHA-256 `9543f73d658f35dd22bdc96a1882c9ebdaeee5a5aaea1cc085cab40fc61602c6`
  - `SPINOFF_SOURCE/js/phone-engineering.js`: SHA-256 `26a27e574b7870867cbb86d50755b84e82071455a9cb0207ee8b5344c613aa43`

## 1. Delivered capabilities & causal architecture

1. **Component Design/SKU Identity & Physical Lot Provenance (`w.skus`, `w.lots`, `LOT_POLICY`)**:
   - Replaced pure `kind:generation` fungibility with explicit SKU design records (`w.skus`) across all 9 categories (`ALL_CATEGORIES = ['chip','ram','storage','display','camera','battery','enclosure','pcb_rf','os']`) and physical lots (`w.lots`) across the 7 physical module slots (`KINDS`).
   - Each SKU records `id`, `code`, `name`, `kind`, `level`, `revision`, `focus`, `designerId`, `ipOwnerId`, `manufacturerId`, `licenseMode`, `isSoftware`, `fabricationChain` (for chips: design firm, wafer foundry mode, OSAT partner, Murphy die-yield estimate), immutable `spec`, `unitCostEstimate`, and `qualification`.
   - RAM (`SDRAM`/`LPDDR`, `capacityMB`, `bandwidthGBps`, `latencyNs`, `powerMw`) and Storage (`SPI`/`eMMC`, `capacityMB`, `readMBps`, `writeMBps`, `enduranceCycles`) have distinct functions, specs, and compatibility checks.
   - Software (`kind: 'os'`, `isSoftware: true`) tracks designer, IP owner, license mode (`open_rtos`, `licensed_ip`), driver coverage, OS overhead, and security score without consuming mined `raw` materials.
   - Physical lots (`w.lots`) trace `id`, `skuId`, `kind`, `level`, `revision`, `focus`, `designerId`, `ipOwnerId`, `manufacturerId`, `ownerId`, `location` (`'stock' | 'transit'`), `quantity`, `unitPrice`, `createdMinute`, `shipmentId`, `wipId`, and `designId`.
   - `LOT_POLICY.allowImplicitMerge === false`: lots with different `skuId`, `revision`, `manufacturerId`, `ownerId`, `location`, or `unitPrice` never merge implicitly.
   - **Retroactive Immunity**: When a firm completes R&D and mints a new SKU or revision, existing stock lots in `w.lots`, in-flight shipments in `w.shipments`, active `w.WIP` batches (`b.reservedLots`), and already-assembled phones (`d.prototypeLots`, `d.finishedLots`, `d.chip`, `d.parts`) retain their exact original SKU, revision, lot IDs, and specs.
   - **Audited Compatible Lot Substitution (`qualifySubstitution`, `evaluateSkuCompatibility`)**: Substituting an alternate owned lot for a BOM slot checks interface (`isa`, `SDRAM/LPDDR`, `SPI/eMMC`, `RGB/MIPI`), power (`battery.maxDischargeW >= peakPowerW`, `pcb_rf.maxPowerDeliveryW >= peakPowerW`), camera ISP (`camera.megapixels <= chip.ispMpLimit * 1.5`), thermal/battery chassis fit, and OS (`driverCoverage >= 0.95`, `ram.capacityMB >= os.minRamMB`), recording valid substitutions on `d.substitutions`.

2. **Company-Specific R&D Portfolios, Rework & Sunk Costs (`f.rndPortfolio`, `w.rndProjects`, `RND_TARGETS`)**:
   - Replaced shared generic research multipliers with company-owned R&D portfolios (`f.rndPortfolio`) and project records (`w.rndProjects`) across 9 engineering targets (`power_efficiency`, `compute_performance`, `cost_yield`, `camera_optics`, `memory_bandwidth`, `thermal_envelope`, `battery_life`, `reliability`, `os_platform`).
   - Competing suppliers (`supplier-<role>` vs `supplier-<role>-alt`) and rival brands pursue divergent philosophies with measurable causal tradeoffs (`applyFocusTradeoffs`, labelled as game engineering estimates).
   - R&D shares the same finite paid hourly work budget (`budgets[f.id]`) with manufacturing and commercial sales effort—no double spending of labor hours.
   - Progress requires cash above safety reserve, paid lab/tooling NRE (`4` satang per work unit to `treasury`), and staff with relevant subject knowledge (`>= 10` to advance; `< minSubjectLevel` at prototype qualification triggers `'rework'` with `+1,200` engineering minutes and sunk NRE cost).
   - Key engineer departure (`notice -> joined`) updates `proj.stallReason` on the former employer's active project without transferring the former firm's owned IP/SKUs. Cancelling an active project (`cancelRndProject`) records `sunkCostSatang` and `cancelledProjects`.

3. **Make / Buy / License Evaluation & Prudent Refusal (`evaluateSourcingDecision`, `f.sourcingDecision`)**:
   - Executives evaluate `buy_merchant_sku`, `license_and_buy_prudent`, and `co_develop_custom_sku`, explicitly separating objective infeasibility (`infeasibleModes`: insufficient NRE/reserve cash or missing specialist skills `< 35`) from strategic refusal (`declinedFeasibleModes`: when objective requirements are met, but a high-prudence / low-risk-taking CEO declines custom NRE to preserve liquidity).

4. **Observer UI, Provenance Chain Tracer & Schema 3 Adversarial Save Contract (`SPINOFF_SOURCE/js/ui.js`)**:
   - Updated all 6 Thai observer tabs to display R&D portfolios, active R&D project lead engineers/NRE/stall reasons, Make/Buy/License decisions, BOM SKU codes (`CPU SKU`, `RAM SKU`, `Storage SKU`, `กล้องและเลนส์`, `ตัวถัง / บอร์ด RF`, `แพลตฟอร์ม OS`), prototype/finished lot IDs, and physical warehouse/transit lots.
   - Added read-only Provenance Chain Tracer (`traceSkuChain`) in `📦 คลังและคิวผลิต` to trace any SKU or named engineer from design → manufactured lots → shipments → phone BOMs → retail sales without mutating simulation state.
   - Enhanced `🧪 Edit Hub` to show Target Identity, Current Value, live Proposed Value preview (`oninput`), and Experiment Capital provenance (`v.editCapital`).
   - Updated save contract to `schema: 3`, `release: '0.3.0'`, storage key `silicon-handset-v030`. `audit(w)` enforces a strict `WORLD_KEYS` whitelist, SKU/lot/R&D relational integrity, and lot-to-stock reconciliation. Older `0.1.0`/`0.2.0` saves and parent Company keys are untouched and explicitly rejected; broken autosaves disable overwriting (`autoSaveEnabled = false`).

## 2. Decisions contributed beyond the prompt

- **Fixture-Safe Lot Synchronization Guard (`syncAuthorizedFixtureStock`)**: Baseline tests (Tests 5, 6, 19) directly mutate `f.stock[key]` and `w.materials.componentOpening` in live memory to set up controlled counterfactuals, whereas Test 9 mutates `v.firms[0].stock['chip:0'] = 999` in serialized JSON without updating `componentOpening` or `lots` to test save rejection. We designed `syncAuthorizedFixtureStock(w)` at external entry points (`advance`, `command`, `serialize`—never `deserialize`) to synchronize `w.lots` only when `sum(f.stock) + inTransit + componentsConsumed === componentOpening + supplierProduction`. This preserves all 22 baseline tests unmodified while strictly rejecting forged stock or lot mismatches in `audit(w)` and `deserialize(text)`.
- **In-Process Node UI & Edit Hub Harness (Test 29)**: Because the offline sandbox container lacks `node_modules/playwright` and enforces a managed Chromium URL block policy, we added Test 29 in `test/simulation.test.cjs` to execute `SPINOFF_SOURCE/js/ui.js` inside a Node VM DOM harness, verifying all 6 observer tabs, the SKU/engineer provenance tracer, Edit Hub live previews, read purity (`serialize` unchanged), and `localStorage` save isolation on every `npm test` run.

## 3. Actual verification results

Environment: Linux x86_64 sandbox container, Node `v18.20.4`. Logs stored in [validation/v030](validation/v030).

| Command / Check | Result |
|---|---|
| `node tools/check.cjs` (`npm run check`) | **PASS** — syntax check across all `js/*.js`, initial `audit(w)` & save round-trip PASS, `human-core.js` SHA-256 `fa83eaa0...` verified |
| `node --test test/simulation.test.cjs` (`npm test`) | **29/29 PASS** (22 preserved baseline tests + 7 new v0.3.0 acceptance matrix & UI harness tests) |
| `node tools/build.cjs` (`npm run build`) | **PASS** — `227,609` bytes written identically to `SPINOFF_SOURCE/Silicon_Handset_single.html` and root `Silicon_Handset_single.html` |
| `node tools/soak.cjs` | **5/5 seeds × 365 days PASS** — daily cash/raw/component/lot/WIP audit and monthly `deserialize(serialize(w))` round-trip PASS |
| `npm run test:browser` | Updated `test/browser.test.cjs` for v0.3.0; in this offline container `playwright` npm package is not pre-installed and `/usr/bin/chromium` has an organization `URLBlocklist` policy blocking both `file://` and `http://127.0.0.1`/`localhost` (`This page is blocked`). UI/DOM verified via Test 29 in `test/simulation.test.cjs`; browser limitation explicitly reported per `AGENTS.md` & `ACTIVE_PROMPT.md` |

### 365-Day Multi-Seed Soak Summary (`spinoff_phone/validation/v030/soak.json`)

| Seed | Firms | People | Phone Designs | Phones Sold | Observed Firm Produced | Joined Offers | Daily & Monthly Audit |
|---|---:|---:|---:|---:|---:|---:|---|
| `dawn` | 20 | 84 | 24 | 5,053 | 792 | 10 | **PASS** (`errors: []`) |
| `river` | 20 | 89 | 27 | 4,951 | 768 | 14 | **PASS** (`errors: []`) |
| `silicon` | 18 | 79 | 18 | 4,790 | 864 | 48 | **PASS** (`errors: []`) |
| `island` | 21 | 90 | 27 | 5,106 | 504 | 48 | **PASS** (`errors: []`) |
| `horizon` | 17 | 75 | 16 | 4,039 | 816 | 14 | **PASS** (`errors: []`) |

## 4. Changed files inventory

Modified files:
- `.agents/skills/README.md`
- `.agents/skills/silicon-handset-dev/SKILL.md`
- `.agents/skills/silicon-handset-every-patch/SKILL.md`
- `README.md`
- `SPINOFF_SOURCE/README.md`
- `SPINOFF_SOURCE/Silicon_Handset_single.html`
- `SPINOFF_SOURCE/index.html`
- `SPINOFF_SOURCE/js/sim.js`
- `SPINOFF_SOURCE/js/ui.js`
- `SPINOFF_SOURCE/package-lock.json`
- `SPINOFF_SOURCE/package.json`
- `SPINOFF_SOURCE/test/browser.test.cjs`
- `SPINOFF_SOURCE/test/simulation.test.cjs`
- `START_HERE_FOR_AI.md`
- `Silicon_Handset_single.html`
- `project_status_and_ai_onboarding.md`
- `spinoff_phone/GEMINI_APP_SKILL_SYNC.md`
- `spinoff_phone/IDEAS.md`
- `spinoff_phone/PROJECT_STATUS.md`
- `spinoff_phone/README.md`
- `spinoff_phone/WORK_STATUS.md`

Added files:
- `spinoff_phone/PATCH_REPORT_V0.3.0.md`
- `spinoff_phone/V030_HANDOFF_HISTORY.md`
- `spinoff_phone/validation/v030/browser.txt`
- `spinoff_phone/validation/v030/build.txt`
- `spinoff_phone/validation/v030/check.txt`
- `spinoff_phone/validation/v030/integrity.json`
- `spinoff_phone/validation/v030/soak.json`
- `spinoff_phone/validation/v030/unit.txt`

Deleted files: None.
