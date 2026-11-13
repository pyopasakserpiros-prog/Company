# Silicon & Handset — spin-off v0.3.0 status

Third playable release, advanced from branch separation base `e7dbd0dbdf2ef733d8d5679aeeb036ff0d139284` (received archive SHA-256 `916a5bbfcd092131415905460e04f9ffbcc5a88a57f58cc8db5dee3c5bf451d0`), 2026-11-13. Independent executable in `SPINOFF_SOURCE/`; parent Company remains on `main` (`v3.1.0`) and its gameplay source is untouched. Original large blueprints remain ambitions, not a completed feature inventory.

## Play

Open root `Silicon_Handset_single.html` offline (`227,609` bytes). All runtime dependencies live in `SPINOFF_SOURCE/js`: the immutable HumanCore (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`) and pure `phone-engineering.js` (`26a27e574b7870867cbb86d50755b84e82071455a9cb0207ee8b5344c613aa43`) are byte-for-byte identical to the base. Source server: serve repository root, visit `SPINOFF_SOURCE/index.html`. Save key `silicon-handset-v030`, `schema: 3` / `release: '0.3.0'`, separate from `0.1.0`/`0.2.0` and Company saves. Never import or delete older or parent-game saves automatically.

Choose/randomise a world seed and one of seven starting roles: handset SME (`brand`), chip (`chip`), memory/storage (`memory`), camera (`camera`), display (`display`), battery (`battery`), or enclosure/EMS supply (`ems`). Named NPCs make autonomous operational decisions. Six Thai observation tabs show people/company activity, rivals/cohorts, measured products/BOM SKUs, inventories/physical lots/provenance tracer, events, and Edit Hub.

## Implemented causal loop (through v0.3.0)

1. **Independently Seeded Ecosystem & Zero Catch-Up**:
   - Each seed generates 4–8 rival brands, 12 supplier firms (2 per component role), 8 outside engineers, and the observed company with varied cash, teams, paid opening stocks/resources, core profiles, specialist knowledge, and R&D portfolio philosophies.
   - No rival capability, research speed, or pricing is computed from the player's capability, cash, victories, or losses.

2. **Component SKU Identity, 9 Engineering Categories & Physical Lot Provenance (`w.skus`, `w.lots`)**:
   - Replaces pure `kind:generation` fungibility with explicit SKU design records (`w.skus`) across all 9 categories (`ALL_CATEGORIES = ['chip','ram','storage','display','camera','battery','enclosure','pcb_rf','os']`) and physical lots (`w.lots`) for the 7 physical module slots (`KINDS`).
   - Each SKU traces `id`, `code`, `name`, `kind`, `level`, `revision`, `focus`, `designerId`, `ipOwnerId`, `manufacturerId`, `licenseMode`, `isSoftware`, `fabricationChain` (for chips: design firm, foundry mode, OSAT partner, Murphy die-yield estimate), measured `spec`, `unitCostEstimate`, and `qualification`.
   - RAM (`type: SDRAM|LPDDR`, `capacityMB`, `bandwidthGBps`, `latencyNs`, `powerMw`) and Storage (`interface: SPI|eMMC`, `capacityMB`, `readMBps`, `writeMBps`, `enduranceCycles`) have distinct functions and constraints.
   - Software (`kind: 'os'`, `isSoftware: true`) tracks license mode (`open_rtos`, `licensed_ip`), driver coverage, OS overhead, and security score without consuming mined `raw` materials.
   - Every physical component unit in existence lives in `w.lots` (`location: 'stock' | 'transit'`), is reserved into prototype (`d.prototypeLots`) or production WIP (`b.reservedLots`), and assembles into finished phone lots (`d.finishedLots`).
   - `LOT_POLICY.allowImplicitMerge === false`: lots with differing `skuId`, `revision`, `manufacturerId`, `ownerId`, `location`, or `unitPrice` never merge implicitly.
   - **Retroactive Immunity**: New R&D completions mint new SKU revisions in `w.skus` without upgrading existing stock lots, in-flight shipments, reserved WIP, or already-built phones.
   - **Audited Compatible Substitution (`qualifySubstitution`)**: Substituting an alternate owned lot for a BOM slot requires passing interface, power, thermal, ISP, and OS compatibility checks (`evaluateSkuCompatibility`), recording accepted substitutions on `d.substitutions`.

3. **Company-Specific R&D Portfolios, Rework & Make/Buy/License Decisions (`f.rndPortfolio`, `w.rndProjects`, `f.sourcingDecision`)**:
   - Firms pursue 9 distinct engineering focuses (`RND_TARGETS`: `power_efficiency`, `compute_performance`, `cost_yield`, `camera_optics`, `memory_bandwidth`, `thermal_envelope`, `battery_life`, `reliability`, `os_platform`).
   - Competing suppliers (`supplier-<role>` vs `supplier-<role>-alt`) and rival brands pursue divergent R&D philosophies that apply measurable causal tradeoffs (`applyFocusTradeoffs`) to clock/IPC/power/die area, RAM bandwidth/power, NAND read/write/endurance, camera sensor area/f-number/low-light, display brightness/watts, battery Wh/discharge/protection, enclosure `rth`/drop resistance, PCB/RF signal integrity, and OS overhead.
   - R&D shares the same finite paid hourly labor budget (`budgets[f.id]`) with manufacturing and commercial sales work—no double spending.
   - Progress requires cash above safety reserve, paid lab/tooling NRE (`4` satang/work unit to `treasury`), and staff with relevant subject knowledge (`>= 10` to advance; `< minSubjectLevel` at prototype qualification triggers `'rework'` with extra engineering work and sunk NRE cost). Cancelling an active project (`cancelRndProject`) records `sunkCostSatang` and `cancelledProjects`.
   - `evaluateSourcingDecision` records `f.sourcingDecision`, separating objective infeasibility (`infeasibleModes`: insufficient cash/NRE or missing specialist skills) from strategic refusal (`declinedFeasibleModes`: `license_and_buy_prudent` when feasible but declined by a prudent/risk-averse CEO).

4. **Preserved v0.2.0 Commercial Cohorts, Paid Sales Work & Competing Quotes**:
   - Three consumer cohorts (`value` THB 5,000,000 / max THB 1,900; `photo` THB 4,000,000 / max THB 3,300; `performance` THB 3,000,000 / max THB 5,200, requiring web score `>= 8`) reconcile to `households.cash`.
   - Each sale requires released inventory, a funded cohort, utility `>= 0.2`, and `25` effective sales-work units (`15%` of brand paid work weighted by `0.25 + sales/100`).
   - `supplierQuotes(world, buyerId, kind, level)` is pure and exposes `skuId`, `skuCode`, `revision`, `focus`, `lotIds`, `stock`, `unitPrice`, `leadMinutes`, and patience-weighted `score`.

## API and invariants

UMD `SiliconSim` / CommonJS `SPINOFF_SOURCE/js/sim.js`:
- `create(seed, {role})`, `advance(world, minutes)`, `snapshot(world)`, `command(world, c)`, `serialize(world)`, `deserialize(text)`, `audit(world)`.
- Pure inspection helpers: `supplierQuotes(world, buyerId, kind, level)`, `consumerUtility(design, segment)`, `evaluateSkuCompatibility(chipSpec, partsSpec)`, `qualifySubstitution(world, designId, kind, candidateLotId)`, `traceSkuChain(world, skuOrLotOrPersonId)`.
- Constants: `SUBJECTS`, `KINDS`, `ALL_CATEGORIES`, `RND_TARGETS`, `LOT_POLICY`.
- `audit(world)` checks `schema === 3`, `release === '0.3.0'`, `WORLD_KEYS` whitelist (rejecting unknown hostile fields), money conservation, raw material conservation, physical component conservation, lot-to-stock map equality per firm, transit lot-to-shipment bijection, WIP reserved lot sums, SKU/R&D project reference integrity, and frozen HumanCore profiles.

## Explicit limits

- Work settles on hourly boundaries; campus canvas is an activity/zone diagram, not a full pathfinding building simulator.
- Technical generation tiers remain `0..3` with multi-revision SKUs (`revision >= 1`); engineering metrics (`clockGhz`, `loadW`, `surfaceC`, `batteryHours`, `lowLightScore`) are deterministic model estimates, not physical laboratory measurements.
- Upstream raw input remains an aggregate processed-input unit paid to `treasury`, not a multi-stage mine/chemical refinery simulation.
- Consumer market uses 3 finite-wallet cohorts rather than individual consumer households, carrier installment contracts, or a two-sided third-party app store ledger.
- In the offline Gemini sandbox VM, `node_modules/playwright` is not pre-installed and `/etc/chromium/policies/managed` blocks browser URLs; UI rendering, tab purity, provenance tracing, Edit Hub isolation, and autosave safety are verified by Test 29 in `test/simulation.test.cjs`, while `test/browser.test.cjs` is updated and ready for Playwright execution.

## Verification

See [PATCH_REPORT_V0.3.0.md](PATCH_REPORT_V0.3.0.md) and `spinoff_phone/validation/v030/` for full test logs (`check.txt`, `unit.txt` 29/29 PASS, `build.txt` 227,609 bytes, `soak.json` 5 seeds × 365 days PASS, `browser.txt`, `integrity.json`).
