# Codex review — Spin-off design corrections and proposed refinements

Reviewed 2026-11-12 against `bdfa62c` (Company runtime v3.1.0). **Design review only: not a new playable spin-off, implementation order, or certification of v3.1.0.** Original proposals remain valuable; the corrections below qualify their absolute claims. No web research or real-world price calibration was conducted in this review. Numerical examples in the original documents need dated sources/assumptions before becoming simulation parameters.

สรุป: ควรเก็บแกน Make/Co-develop/Buy, เงินสดก่อนเปิดตัว, ห้องแล็บที่มีผลจริง และการติดตามชีวิตคนไว้ แต่เปลี่ยนเส้นทางบังคับและดราม่าที่รับประกันผล ให้เป็นโลกที่เกิดจากเงื่อนไขจริง ผู้เล่นควรสนุกกับบริษัทเล็กที่อยู่รอดด้วยความเชี่ยวชาญได้ด้วย ไม่จำเป็นต้องจบที่จักรวรรดิ SoC ทุกโลก

## 1. Corrections to the two original documents

| Priority / location | Criticism | Replacement design rule |
|---|---|---|
| P0 — Master §2 vs §8 | A mandatory six-step ladder contradicts the instruction to avoid linear progression. | Treat the ladder as illustrative business archetypes. Allow different starting expertise, supplier-first firms, skipped/reversed strategies and permanent specialists. Full custom silicon is one strategy, not the win condition. |
| P0 — Master §6 | Annual releases and guaranteed15–25% perf/W improvements contradict autonomous external research. | Competitors need funded projects, relevant staff, compatible IP/process access and measured qualification. They may delay, fail, specialise or improve cost/reliability rather than speed. The timeline is an example outcome, never a calendar script. |
| P0 — Master §3.2 | The seven axes omit RAM/storage as independent businesses and incorrectly equate some design tasks with complete vertical integration. | Add DRAM and nonvolatile storage/controller/firmware axes. Describe design, IP ownership, fabrication, packaging, module integration and test separately for every family. Owning ISP software does not mean making a camera sensor; designing DDIC/glass does not mean operating an OLED fab. |
| P0 — Specs §5 / §6 | Copying modules and starting new labs is proposed before proving an independent complete economic loop. | First extract contracts and dependencies, then demonstrate one end-to-end autonomous vertical slice. `save.js` imports sim/layout; its schema/validation is not a drop-in independent save engine. Finance currently has a cash ledger/aggregates; do not call it verified double-entry bookkeeping without an actual balanced journal model. |
| P1 — Master §§1–4 | Mask/NRE/respin costs, delays, royalties, margins, carrier share and fixed node advantages are written as universal facts. | Label all as illustrative scenarios. Separate masks from total design NRE, mature from advanced nodes, full-mask from metal-layer respins, FX/date/volume and royalty base/territory/contract. Buying a modem does not automatically clear every device-level SEP obligation or certification. Legal outcomes are conditional, not automatic injunctions. |
| P1 — Master §3.2 | In-house assembly guarantees100% secrecy; off-the-shelf implies poor quality; ownership implies superior performance. | Owned and outsourced operations both have failure/leak risks. Quality depends on capability, process control, qualification and contract execution. Excellent bought components and outsourcing may remain the best strategy. No technology path is inherently superior. |
| P1 — Master §3.2 battery row | “Dual-cell” is treated as necessarily parallel and a fixed5–8% capacity penalty. | Represent series/parallel topology, nominal voltage, pack Wh, charge conversion, current/temperature/C-rate and balancing/protection. Do not hard-code one topology or volume penalty. High charging watts alone do not guarantee fast or safe charging. |
| P1 — Specs §§1–2 | All ten zones and fourteen job titles appear mandatory; designer/thermal and CFO/CTO conflict is predetermined. | A small company rents, shares or contracts lab capability; a person may cover several functions within a real work budget. Conflict comes from evidence, values, incentives, trust and constraints. Cooperative teams and cautious CTOs are possible. |
| P1 — Specs §1 / §5 | “SMT cleanroom” conflates phone assembly with wafer fabrication. A breadboard is not a general high-speed handset prototyping platform. | Distinguish ESD/moisture-controlled SMT, dedicated optical/contamination-sensitive work and semiconductor cleanrooms. Model PCB engineering samples/evaluation boards, suitable fixtures and instrument calibration; lab names do not imply process capability. |
| P1 — Master §7.1 | Fractional exponent may receive negative/zero-invalid input; a0.30 throttle floor prevents thermal shutdown; material alone fixes Rth. | Validate ambient/load/domain, handle zero power and ambient above limits, model shutdown/protection and junction versus skin temperatures. Rth depends on geometry/contact/airflow; add thermal mass for time-to-heat. Mark the exponent as a game approximation, not a physical law. |
| P1 — Master §7.2 | Learning improves defects automatically for all wafers indefinitely. | Maintain process/line/node-specific experience and floor, measurement uncertainty, maintenance/contamination drift and partial transfer to new processes. Preserve Murphy zero-defect limit, mm²/cm² conversion and gross/good/bin/package/scrap conservation. |
| P1 — Master §4 / Specs §3 | Leaks stop old sales immediately; reviews or marketing cause guaranteed universal demand swings. | Model exposure, credibility, audience budget/preferences, replacement need and expectations. Review outcomes differ by use case; demand moves through finite channels. A keynote is optional, not a required SME expense or a free pre-order generator. |

## 2. Strong ideas worth retaining

- Make/co-develop/license/buy with a genuinely contestable board decision is the strongest distinguishing feature. Display alternatives and rejected reasons, including “remain specialised”, “delay”, “lease capacity” and “keep cash”.
- The pre-launch cash valley creates meaningful tension if tied to actual deposits, WIP, committed purchase orders, receivables and support obligations. Avoid a random bankruptcy event masquerading as business risk.
- Labs, camera tuning, RF enclosure interactions and teardown/RMA can link people to measurable product differences. They should create evidence and constrain work, not just buffs from owning a room.
- Watchable workplace life is essential. A technically deep spreadsheet without visible personal priorities, fatigue, learning, mentoring and consequences would miss the owner's goal.

## 3. Proposed playable identity and starting paths

Retain observer/Edit Hub gameplay. Avoid describing the player as a shareholder if that would imply voting to force normal corporate actions. The board is an NPC institution; human interventions are explicitly logged experiments.

Offer starting-condition archetypes, not mandatory career levels: ODM distributor, repair/refurbishment shop, firmware/BSP studio, camera calibration/module integrator, enclosure/thermal workshop, PCB/EMS service, or a small fabless design consultancy. Each needs a viable client/working-capital path and honest tools/knowledge. A memory-chip fab remains a vastly different business from purchasing dies and assembling/testing memory modules. A profitable specialist can be a satisfying long-term outcome.

Define a shared world technology frontier but distinct firm capabilities. A late entrant does not inherit every public blueprint or competitor's tacit know-how. It can buy compatible mature components, hire, license or acquire specific rights/assets. Start at feature-phone capabilities by default if that vision is retained; an advanced-era scenario must be explicitly chosen, not accidentally imported from example5G/200MP specs.

## 4. Business and production contracts before content expansion

For each role define: customer need; entry alternatives; subjects/experience/qualification; named staffing and shifts; owned/licensed know-how; equipment/site/utilities; process route; BOM quantities/units/grades; work/machine/capacity requirements; yields/QC/rework/scrap; legal/commercial rights; funding/runway; output buyers; persistent failure/recovery and observation.

Use separate design and physical states:

`concept → approved budget → engineering samples → EVT evidence → DVT evidence → PVT evidence → released design`

`purchase commitment → in transit → received/quarantined input → reserved input → WIP → tested/graded output → finished inventory → shipped → accepted → receivable/paid → support/RMA`

These are state contracts, not identical required stages for every supplier. A pure OS vendor has no wafer route; a distributor is not expected to design a CPU. Rework returns to a specified stage and consumes real time/material. Allocation must prevent one engineer, machine slot or foundry reservation being spent twice. Closing or canceling an order must release/refund/forfeit commitments according to its actual contract, not erase them.

Distinguish qualified material identity from a string appended to a lot. Purity, inspection evidence, supplier/process/version and rejection history must justify the grade. Internal transfers retain cost/provenance and conserve consolidated stock/cash without creating sales profit.

## 5. Better make-or-buy and board decisions

Keep `QbreakEven = incrementalNRE / (comparableBuyUnitCost − comparableMakeVariableCost)` only as a simple diagnostic. If the denominator is zero/negative there is no positive unit-cost break-even under those assumptions. If products differ, compare delivered value and risk rather than pretending they are substitutes.

Choose among alternatives using scenario cash schedules and a documented discount/uncertainty model: engineering NRE/IP/EDA/masks; yield and qualified sellable units; opportunity cost; delays; downside demand; minimum commitments; packaging/test; support; expected product premium; salvage and reuse across future designs. Include liquidity and debt-covenant feasibility separately from expected NPV. Do not count capex/depreciation twice or treat projected sales as cash already available. Explain forecast range/confidence and decision horizon to the observer.

Board proposals should persist with proposer/evidence/source timestamp, alternatives, dissent, authority, approved tranches, review triggers and outcome history. Funding discovery, a prototype and a full production ramp are different decisions. New evidence may stop or resize a project. A committee meeting cannot be a new random decision every tick or a mandatory delay for every small purchase. Generate dialogue from actual decision records; fixed CFO/CTO scripts are illustrative only.

## 6. Measurable phones and meaningful audiences

Require reproducible workload profiles and component compatibility. Compare call/connectivity, camera shutter/low light/video, browsing, games, idle drain, sustained load, thermal comfort, repairability, support life and total price. Keep peak from sustained results, junction from surface temperature and an engineering estimate from a measured simulation test. GHz, megapixels or smaller node labels do not determine a winner by themselves.

Represent B2B sell-in, channel stock, household sell-through, returns and active installed base separately. Carrier/distributor orders need finite funds/credit, delivery and receivables; channel sales cannot also be booked as direct household sales. Add repair/refurbished/resale flows and replacement demand before inventing unlimited new buyers. Use cohorts for most consumers; named specialists/decision-makers for meaningful stories, not millions of fully rendered consumers.

OS ecosystems need an actual two-sided market: developer costs/tooling/API compatibility, user willingness to pay, competing platforms, app support, commissions/refunds and maintenance/security obligations. A proprietary OS does not passively mint15–30% commission or automatically beat a mature shared platform.

## 7. World causality, human lives and experiments

External actors retain budgets, people/capabilities, facilities, inputs and contracts at a declared aggregation level. Trade disruption acts on specific routes, firms and orders; downstream price effects depend on buffers, substitution and demand, not an unconditional global+30% event. Retain public/private/rumoured information and reading time so an omniscient UI does not make every executive omniscient.

Add individual task expertise, mentoring, practical experience, tool familiarity, outside obligations and incentives around the locked Human Core. A job title is not a personality or an instant complete skill set. Poaching preserves identity and decreases the former firm's contribution; include notice, onboarding, retention and confidentiality constraints without automatically giving the new employer stolen IP.

Edit Hub experiments should offer named targets, units, provenance, previewed scope and optional saved experiment branches. Example paired worlds: same seed, cautious versus ambitious CEO; absent versus present RF specialist; foundry outage with one versus two qualified suppliers. Explain the actual changed outcomes without guaranteeing a specific trait creates one predetermined choice.

## 8. v3.1.0 reuse audit — source-inspected boundaries

Use current Company as a reference implementation, not as proof the new game's desired depth already exists:

| Existing source | What can be reused or adapted | What is not established |
|---|---|---|
| `phone-engineering.js: ROLE_CONTRACTS`, `MATERIAL_GRADES`, `evaluateRoleFeasibility` | Role/material registries and capability evaluation entry points | Complete qualified industrial process histories or accurate real-world thresholds |
| `phone-industry.js: enterCampusRole` and `sim.js` callers | Campus entry/vertical integration route | Balanced viability of every new spin-off starting path |
| `recordWipBatch` | Batch/result record structure | It defaults to completed, started/completed on the same day; a WIP record alone is not a persistent multi-stage scheduler |
| `produceChipBatch` / `foundryOrders` | Cash/input/yield/packaging integration | The inspected path creates packaged output and a completed foundry order within the call; do not claim it proves multi-month queue/wafer-stage lead time |
| `channels` | Segment/channel event records | A channel-type label alone is not a funded carrier/distributor ledger and receivables simulation |
| `human-core.js`, economy/save/API/layout | Immutable human model and useful engine contracts | Save/UI/world modules are coupled to the existing simulation and need dependency extraction and independent tests |

This is a targeted static inspection, not a complete v3.1.0 bug audit, performance test or rejection of that patch. Reported236tests/soak counts belong to its delivery report and were not rerun for this documentation review. Keep explicit distinctions between inherited, adapted, proposed, tested and deferred features. Gemini's app-skill update is reported by the prior delivery; this review did not independently access that app.

## 9. Revised implementation order and exit criteria

1. **Executable economy slice first:** a small autonomous business buys qualified inputs/outsourced capacity, receives them after simulated time, produces or receives physical stock, sells to a funded customer, gets paid and covers wage/support obligations. Include one supplier, competing offerings and a normal-opening viable path. Observer can trace cash/stock and watch actual staff work. No requirement to build all ten labs.
2. **Conditional make-or-buy slice:** named staff compare a bought part with one funded custom component project, book foundry/test capacity, endure actual queue/WIP/qualification and either release, redesign or cancel. Save/load mid-WIP and unavailable funds/tools/people must preserve or block work correctly.
3. **Market and life slice:** several firms with differing expertise/strategy, audiences/channels, credible media/launch choices, warranty/repair/support, mentoring and recruitment. Observe divergent seeded outcomes without forced catastrophe or annual technology advancement.
4. **Broaden after proof:** memory/camera/display/power/RF/OS and deeper upstream processes, multi-country politics and tooling. Expand through the tested role/process contracts, retaining the old business game unchanged.

Before architecture freeze, compare a separate `SPINOFF_SOURCE` executable with shared versioned modules against an isolated fork with explicit ownership. Avoid two unversioned copies that silently drift. Use separate release/save namespace/storage keys and test commands. Do not migrate or delete Company saves automatically. Preserve the locked core and inherited instructions; creating a new directory does not waive AGENTS.

Minimum evidence per slice: normal and infeasible cases; repeat-call idempotence; conservation including WIP/scrap/transit/escrow; current save continuation; UI purity; real campus time/learning; multiple seeds; failure recovery; 390px/mobile navigation; an appropriate population/performance budget. Do not infer physical-device FPS from Node timing. Release only what these checks establish, with updated status/skills/report and verified complete ZIP if delivering an executable.

## 10. Extra proposals that add depth without forcing a tech empire

- A single product family can split into regional SKUs and bill-of-material revisions; shortages trigger qualified substitutions and new regression tests, not magical component interchangeability.
- Supplier development programs fund joint qualification, process improvements and long-term capacity; diversification trades redundancy against engineering cost and split order volume.
- Design knowledge and test infrastructure can be reused, depreciated or become obsolete. A cancelled project may leave useful tooling/IP and disappointed staff, not necessarily zero value.
- Quality incidents have evidence/confidence, containment, recall scope, root-cause analysis and corrective action. RMA observations improve a specific process; they do not randomly add a global quality bonus.
- Engineers can prefer craftsmanship, stability, mentoring or autonomy over prestige. A small profitable camera firm that retains its team should be as watchable as an ambitious SoC company that overextends.
- Offer slow-time story summaries and watchlists: “which decision caused today's shortage?”, “what changed after the specialist left?”, “what did the extra capital finance?”. Observability is part of the core game, not a final debugging overlay.

**Decision status:** these are Codex recommendations for owner/AI review. This assignment authorises revising design documents only; it does not start the spin-off implementation or change the parent game's rules.
