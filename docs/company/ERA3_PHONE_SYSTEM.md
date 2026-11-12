# Company v3.0.0 — Era 3 phone-industry contracts

Updated 2026-11-12. Implementation base: `a2c5514` on `main`, runtime v2.9.0. Runtime delivery: **v3.0.0**. Save/package version stays `0.1.0`, schema `company-foundation-1`.

This is an autonomous life-and-business simulation. NPCs make decisions; the player observes and edits conditions. The Era 3 vision is larger than this release. This guide describes executable contracts and explicit abstractions, not a claim to simulate an entire real phone industry.

## Models and evidence

`phone-engineering.js` exports pure `synthesizeChip(seed, capability, options)`, `parts(seed, level)`, `evaluate(chip, parts, options)` and `wafer(options)`. Hardware varies deterministically by seed, company knowledge and funded project. Technical envelopes currently have bounded levels; the game does not discover arbitrary CPU architectures. Finished handset names and specifications are generated from selected supplier designs, never drawn from a fixed finished-phone catalogue.

Chip records expose cores, GHz, IPC index, GPU estimate, node nm, die mm², memory interface/limit, display limit and W. Parts expose RAM MB/bandwidth, storage MB/read speed/interface, camera MP/sensor/processing, display dimensions/W, battery Wh/discharge W, enclosure thermal resistance, and OS ISA/RAM/driver requirements/overhead/app capability. Compatibility is a gate. Battery hours = usable Wh / workload-average W. Peak W, ambient temperature and thermal resistance constrain sustained throughput. Call/web/game task estimates respond to bottlenecks; a newer label does not make a model better. Comparisons retain improvements and regressions against the preceding handset.

Wafer yield uses die area in cm² when applying defects/cm², a stable Murphy zero-defect limit, integer dies and conserved good/bin/scrap totals. Failed packaging costs remain in unit cost. These are disclosed engineering estimates, not measured silicon benchmarks or a full PDK/process simulator.

## Physical stock and cash sequence

1. Research work comes from named, paid outside engineers or actual completed campus `phoneWorkshop` jobs. A campus day by itself grants no work. Shared outside engineering budgets are at most 360 minutes/person/day; campus jobs compete with other work, travel and needs.
2. A handset prototype requires purchased CPU, RAM, storage, display, camera, battery and enclosure samples in that firm's lots, plus actual generic prototype materials. Consumed samples cannot be sold afterward.
3. Suppliers purchase real processed inputs from finite world stocks. Cash leaves the buyer, enters the seller, customs reaches the importing treasury, and stock becomes an in-transit contract before delivery. Existing legacy resources are shared with other industries.
4. Supplier manufacturing consumes inputs before creating owned component lots. All component types share one production-time budget, with lower-stock designs prioritised. Chip packaging transfers a real fee to EMS. Chip suppliers retain demand for older silicon designs instead of producing only the newest one.
5. Brand procurement reserves specific seller lots, pays actual costs/tax and waits for delivery. Owned input lots carry supplier/design IDs and FIFO costs. Missing components prevent assembly; a smaller complete batch can proceed when a planned larger batch cannot.
6. Assembly consumes one of each selected component plus PCB/copper inputs, pays EMS and an OS licence where another firm owns it, and uses finite shared daily EMS capacity. Output is an owned finished-phone lot. There is no direct materials-to-cash conversion.
7. A design starts in `pilot`. At least two physical units, 1,200 further paid effective validation minutes and a seven-day post-design observation interval are required before the NPC releases it. Finished units may wait in stock while qualification runs.
8. Actual household budgets purchase released stock. Components and phones are not sold twice. NPC pricing includes measured component/assembly costs and a margin; clearance respects the current cost floor. Cohorts track active devices, returns and retirement. Warranty refunds are actual cash transfers, bounded to 365 days and a low heat-dependent monthly hazard; retirement begins at 540 days.

`w.phoneIndustry.lots`: `quantity = available + reserved + used + sold`. Procurement moves reserved stock into a buyer lot on delivery. `contracts` retain raw/component type, ownership, price, tax, dates and shipping state. No opening physical phone/component gifts are created. Initial feature-phone engineering knowledge is an explicit opening condition, separate from inventory.

## Cross-system accounting and policy

The living world calls sector work via `World.step(w, day, beforeSettlement)` after generic production/trade but before firm profit/tax/history and government review. `sim.js` supplies the phone callback. This avoids erasing phone transactions at the next day's reset. Raw and component routes consult `Civics.quote`; tariffs/waivers/quotas and blocked routes affect actual transfers and delivery. Component customs currently use proxy commodity groups, not HS codes.

World firm cash reconciles opening + receipts − payments. Wages go to national households; consumers fund sales; refunds reverse consumption; customs goes to treasury. Generic world tax remains the inherited simplified levy on positive cash surplus, not a real tax return. Phone sale COGS uses the latest measured assembly unit cost; raw stock valuation remains a spot-price estimate. This is not a complete FIFO accrual ledger for every upstream operation. R&D wage allocation is informational, not a second cash debit.

Campus capital is an `expansion` expense into a separately funded division account (`phone_campus`), reconciled through `playerNetSatang`. There is no free duplicate workforce: the division consumes actual campus job credits. Conditional acquisition pays previous owners' households and retains an outside company/team/obligations. Profitable owned phone operations can return dividends through `investmentIncome`; initial contributed capital cannot create a dividend. Full legal M&A/IP/exclusivity is not implemented.

## Campus business entry

The SME starts in its existing sector. Every fourteen days the autonomous CEO can evaluate entry using personality, knowledge, equipment and cash after wage reserves. A handset team needs electrical/software/quality capability and THB5m division capital plus 90 days' wages. Money alone does not unlock it. Repair SMEs may instead perform real maintenance service work for the semiconductor company.

A qualified metal workshop with a ready press can take the enclosure-supplier route. It spends the same conservative division capital and buys a paid licence to an existing enclosure design. The licence creates a usable blueprint, not physical components. Actual polymer/metal stock and campus work create saleable enclosure lots. A failed press blocks new supplier work. This route demonstrates own-company supplier production; comprehensive entry into RAM/foundry/camera/battery businesses is still future scope.

## People, save and observation

`phone-talent.js` keeps stable named people, immutable Human Core profiles, subjects, employer, pay, loyalty/satisfaction, work and recruitment notice. Subject level, potential, learning aptitude and condition affect effective work. Staff loss removes capability. Accepted recruitment observes notice and preserves identity/profile/education while creating a full campus person and removing outside work contribution. Save loading re-freezes outside profiles and restores the recruited education reference so subsequent edits continue identically.

`sim.js`: `phoneView`, `phoneTalentView`, `phoneAudit`, `phoneCompanyReview`. `api.js` exposes cloned phone/talent snapshots. UI button **📱 โทรศัพท์** opens six observation tabs: overview, firms, products/R&D, supply/stock, market/news and people. They show prices/specs/comparisons, decisions, contributors, lots and shipments. Reading tabs never advances time or RNG. Public phone events feed World Chronicle; private research-start/failure records are withheld from that public feed.

Edit Hub phone experiments permit external cash endowment and a named person's subject/trait edits through `directorPhoneEdit`, with validated units and logged provenance. No ordinary purchase/design/launch command is required from the player. Repository skill updates do not synchronize Gemini's app skills.

## Boundaries that must remain visible

- Outside production and EMS use aggregate daily capacity, inputs and paid labor, not a full placement/reflow/cleanroom machine queue. Campus phone labor uses campus stations; its division inventory is displayed in the phone screen, separate from the legacy material warehouse.
- Some old processed-material proxies are coarse (including generic wafer, battery and glass resources). They are not natural upstream materials. Dedicated phone-grade purity/chemistry recipes and full capital/utility costs remain unfinished.
- Initial supplier roles are assigned to existing firms. Supplier generation and technical levels are bounded. The new market has direct household sell-through, not a complete distributor/retailer/carrier balance-sheet network.
- Information, recruiting and acquisition are partial models. No full app-store economy, carrier standards/certification, IP litigation, exclusivity, liquidation or professional labour-market replacement is claimed.
- Normal openings can be severely input-constrained. The 360-day ample-input experiment is explicitly an edited opening endowment, not the default economy. Calibration of supply, wages, scale and profitability needs further work; do not promise smartphones or a profitable phone firm in every seed.

Verification and scope matrix: [report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V3.0.0.md). Continuing work: [handoff](ERA3_V300_HANDOFF.md).
