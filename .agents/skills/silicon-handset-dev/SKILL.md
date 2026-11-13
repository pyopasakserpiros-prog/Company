---
name: silicon-handset-dev
description: Use when developing, reviewing, testing or delivering the Silicon and Handset spin-off executable or its autonomous phone-industry systems.
metadata:
  intended-project: Silicon-Handset
  maturity: source-backed-reference
---
# Silicon & Handset development reference (v0.3.0)

Read AGENTS, BRANCH_LAYOUT.md, spinoff_phone/PROJECT_STATUS.md and latest report (`spinoff_phone/PATCH_REPORT_V0.3.0.md`) first. Runtime **0.3.0** (`schema: 3`, save key `silicon-handset-v030`); all dependencies are local in `SPINOFF_SOURCE/js`. HumanCore (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`), `CORE_LOCK.json`, and `phone-engineering.js` (`26a27e574b7870867cbb86d50755b84e82071455a9cb0207ee8b5344c613aa43`) remain byte-identical. No parent game files are required. This is the branch master/domain reference, not a mastery certification.

## Core Simulation & API (`SPINOFF_SOURCE/js/sim.js`)
- UMD `SiliconSim` / CommonJS `SPINOFF_SOURCE/js/sim.js`:
  - `create(seed, {role})`, `advance(world, minutes)`, `snapshot(world)`, `command(world, c)`, `serialize(world)`, `deserialize(text)`, `audit(world)`.
  - Pure inspection & verification helpers: `supplierQuotes(world, buyerId, kind, level)`, `consumerUtility(design, segment)`, `evaluateSkuCompatibility(chipSpec, partsSpec)`, `qualifySubstitution(world, designId, kind, candidateLotId)`, `traceSkuChain(world, skuOrLotOrPersonId)`.
  - Exported constants: `SUBJECTS`, `KINDS` (7 physical lot-tracked module slots per phone), `ALL_CATEGORIES` (all 9 categories: `chip`, `ram`, `storage`, `display`, `camera`, `battery`, `enclosure`, `pcb_rf`, `os`), `RND_TARGETS` (9 R&D portfolio focuses), `LOT_POLICY` (`allowImplicitMerge: false`).
- `audit` returns `{ok, errors}`; `command` returns `true` or throws (`grantCash`, `setSubject`, `setTrait`, `cancelRndProject`). All cash is integer satang; world minute display settles only completed hours, partition-invariant (`60` minutes equals `12` calls of `5` minutes).
- Persistent world arrays: `firms`, `people`, `designs`, `skus`, `lots`, `rndProjects`, `shipments`, `WIP` (snapshot alias `wip`), `offers`, `events`, `ledger`.
- Snapshot deep-clones state. Rendering, tab switches, quotes, compatibility checks, and `traceSkuChain` must never consume simulation RNG or mutate world state.

## v0.3.0 Component SKU & Physical Lot Provenance (`w.skus`, `w.lots`)
- Every component design is an explicit SKU record in `w.skus` (`id`, `code`, `name`, `kind`, `level`, `revision`, `focus`, `designerId`, `ipOwnerId`, `manufacturerId`, `licenseMode`, `isSoftware`, `fabricationChain`, `spec`, `unitCostEstimate`, `qualified`, `qualification`, `createdMinute`).
- RAM (`kind: 'ram'`, volatile working memory: `type: SDRAM|LPDDR`, `capacityMB`, `bandwidthGBps`, `latencyNs`, `powerMw`) and Storage (`kind: 'storage'`, nonvolatile flash: `interface: SPI|eMMC`, `capacityMB`, `readMBps`, `writeMBps`, `enduranceCycles`) have distinct functions and compatibility rules.
- Software (`kind: 'os'`, `isSoftware: true`) tracks designer, IP owner, license mode (`open_rtos`, `licensed_ip`), driver coverage, OS overhead, and security score without consuming mined `raw` materials.
- Every physical component unit in existence lives in an explicit lot in `w.lots` (`id`, `skuId`, `kind`, `level`, `revision`, `focus`, `designerId`, `ipOwnerId`, `manufacturerId`, `ownerId`, `location: 'stock'|'transit'`, `quantity`, `unitPrice`, `createdMinute`, `shipmentId`, `wipId`, `designId`).
- `LOT_POLICY.allowImplicitMerge === false`: lots with different `skuId`, `revision`, `manufacturerId`, `ownerId`, `location`, or `unitPrice` never merge implicitly.
- **Retroactive Immunity**: Completing a new R&D project mints a new SKU/revision in `w.skus` without mutating existing SKUs, existing stock lots in `w.lots`, in-flight shipments, active WIP batches, or already-designed/produced phones (`d.prototypeLots`, `b.reservedLots`, `d.finishedLots`).
- **Compatible Substitution (`qualifySubstitution`)**: Substituting an alternate owned lot for a BOM slot requires passing `E.isCompatiblePart` and `evaluateSkuCompatibility` (checking ISA, SDRAM/LPDDR, SPI/eMMC, RGB/MIPI, battery `maxDischargeW >= peakPowerW`, PCB/RF `signalIntegrity` & power delivery, camera `megapixels <= chip.ispMpLimit * 1.5`, and thermal/battery chassis fit). Valid substitutions are logged on `d.substitutions`.

## v0.3.0 Company-Specific R&D Portfolios & Make/Buy/License Decisions (`f.rndPortfolio`, `w.rndProjects`, `f.sourcingDecision`)
- Each firm owns `f.rndPortfolio` (`philosophy`, `activeProjectId`, `completedProjects`, `cancelledProjects`, `sunkCostSatang`, `lastBlockReason`) and active projects in `w.rndProjects`.
- Competing suppliers and brands pursue distinct R&D focuses (`power_efficiency`, `compute_performance`, `cost_yield`, `camera_optics`, `memory_bandwidth`, `thermal_envelope`, `battery_life`, `reliability`, `os_platform`) with causal engineering tradeoffs (`applyFocusTradeoffs`).
- R&D shares the same finite paid hourly labor budget (`budgets[f.id]`) with production and commercial sales work—no double spending of hours.
- Progress requires cash above safety reserve, paid NRE (`4` satang per work unit to `treasury`), and staff with relevant subject knowledge (`>= 10` to advance; `< minSubjectLevel` at prototype qualification triggers `'rework'` with extra engineering work and sunk NRE cost). Cancelling a project (`cancelRndProject`) records `sunkCostSatang` and `cancelledProjects`.
- `evaluateSourcingDecision` records `f.sourcingDecision`, explicitly separating objective infeasibility (`infeasibleModes`: insufficient cash/NRE or missing specialist skills) from strategic refusal (`declinedFeasibleModes`: `license_and_buy_prudent` when feasible but declined by a prudent/risk-averse CEO).

## Preserved v0.2.0 Commercial & Save Contracts (`schema: 3`, `release: '0.3.0'`)
- Three consumer cohorts (`value`, `photo`, `performance`) reconcile to `households.cash`, and purchases to `design.segmentSales`. Each retail conversion requires released inventory, a funded cohort, utility `>= 0.2` (`web >= 8` for `performance`), and `25` effective commercial sales-work units (`15%` of brand paid work weighted by `0.25 + sales/100`).
- Save contract: `schema: 3`, `release: '0.3.0'`, storage key `silicon-handset-v030`. Old `0.1.0` and `0.2.0` saves and parent Company keys are untouched and explicitly rejected on load. `audit(w)` rejects unknown top-level world fields (`WORLD_KEYS`), malformed SKU/lot/R&D references, and lot-to-stock mismatches. Broken autosaves disable overwriting (`autoSaveEnabled = false`).

## Verification & Delivery
- Run `npm run check`, `npm test` (**29/29** tests in `test/simulation.test.cjs`), `npm run build`, `npm run test:browser` (when Playwright & unrestricted Chromium are available), and `node tools/soak.cjs OUTPUT.json` (5 seeds × 365 days).
- Rebuild both standalone aliases (`SPINOFF_SOURCE/Silicon_Handset_single.html` and root `Silicon_Handset_single.html`, byte-identical).
- Package full editable ZIP with single root folder and directory entries, excluding `.git`, `node_modules`, caches, and nested ZIPs; verify CRC, safe paths, hashes, fresh extraction, and test reruns.
