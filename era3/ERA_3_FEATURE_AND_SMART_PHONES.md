# Era 3 — Feature and Smart Phones

**Project proposal and portable AI collaboration brief — revision 1, 2026-11-12**

| Field | Meaning |
|---|---|
| Game | Company Simulation / Siam Enterprise, an autonomous company-and-NPC life simulation |
| Current shipped runtime | v2.9.0; source baseline `855e183d9b7a404c857e9abc162c1a67a4a84f76` on `pyopasakserpiros-prog/Company`, branch `main` |
| Intended major release | v3.0.0 / Era 3; **proposed, not implemented** |
| Current authorization | Publish the proposal, ideas and current context so multiple AIs can collaborate. This document does not authorize claiming an implementation or completed release. |
| Portable companion | `project_status_and_ai_onboarding.md` and `ERA_3_COEVOLUTION_ARCHITECTURE_AND_AI_BLUEPRINT.md`, located beside this file in `era3/` |
| Canonical proposal location | `era3/ERA_3_FEATURE_AND_SMART_PHONES.md` (with detailed Thai + technical co-evolution architecture blueprint in `era3/ERA_3_COEVOLUTION_ARCHITECTURE_AND_AI_BLUEPRINT.md`) |

## 0. Read this first: the game is an autonomous world, not a management-command game

**NPCs must make the decisions. The world and companies operate on their own. The player cannot issue operational orders; the player's intervention is editing conditions through Edit Hub and observing the consequences.**

The owner is not a programmer. They enjoy watching people and companies live, make choices, develop differently and produce unexpected but explainable outcomes. They experiment by changing a person's personality or knowledge, a company's cash, or available resources and then watch what those agents do. AIs should contribute their own ideas and engineering judgment rather than requiring the owner to design every system.

The observer can inspect people, companies, markets and histories, control simulation time/camera, and use permitted Edit Hub experiments. The existing new-game business selection sets an initial condition; it does not give the player operational authority afterward. A market window, design window or R&D window is **observational**: it explains what NPCs are proposing, doing and deciding. Do not introduce normal-play buttons requiring the player to approve a design, choose a CPU, sign a contract, direct research, hire an engineer, set prices or launch a product. Any experimental override belongs explicitly in Edit Hub, with scope, validation and provenance.

An example of success: the observer adds cash, but a prudent CEO retains a reserve, recruits a specialist and commissions a prototype before deciding whether to enter phones. A different CEO might buy a licence, pursue a niche, outsource work, postpone entry or make an expensive mistake. Neither cash nor an edit guarantees one predetermined outcome.

**All future designs in this brief inherit this autonomy requirement.**

## 1. How to use this two-document handoff

Read this file and its companion project status. Together they provide sufficient context for a proposal, technical critique, additional research, risk analysis and implementation recommendations without browsing the repository or knowing the previous chat.

For actual implementation, obtain the source project and its current `AGENTS.md`; these two documents are not a substitute for inspecting code, testing, assets or dependency contracts. A chat-app AI receiving only these documents must not claim it inspected live GitHub, changed the game, ran tests or synchronized app skills.

Distinguish four categories throughout any response:

1. **Owner requirements:** stated in section 2; do not silently discard them.
2. **Existing behavior:** v2.9.0 capabilities and limitations in section 3 and project status.
3. **Proposed design:** sections 4–20; revise creatively when justified.
4. **Unresolved or unverified:** calibration, open decisions, research and future tests; never present these as completed features.

Contributors may improve, replace or extend proposed mechanisms and explain material tradeoffs. Do not simply implement a list mechanically. Preserve the owner requirements and immutable project rules. Product schemas and module names below are design suggestions, not existing APIs.

## 2. Owner requirements for Era 3

- Make phones the deepest business model in the game and a reference for deeper models in other industries later.
- All participating handset companies begin with feature-phone capabilities. Smartphones emerge through subsequent development. Existing non-phone industries must not be silently reset.
- Do not enumerate a fixed catalogue of finished phone products. Companies generate designs from their knowledge, resources, staff, suppliers, technology, manufacturing capability, market information and executive decisions.
- Model CPU, GPU, RAM, storage, OS, display, other software and hardware as meaningful constituents, with physically plausible compatibility and consequences.
- Expand semiconductor businesses and related supply chains to support phones. Companies must negotiate for or buy necessary components and services. Full vertical integration is allowed when actual capital, people, technology, utilities and capacity support it.
- The external industry continues evolving even if the observed company never enters phones. No company has a scripted mandatory technology ladder or a guaranteed leadership role.
- A late entrant starts with its own actual capabilities. It may research, license, outsource, recruit, acquire a relevant business or combine these approaches. World progress does not automatically unlock company knowledge.
- External firms have identifiable researchers, software engineers and other relevant staff whose capabilities and work drive outcomes. The observer's company can recruit them; competitors can also recruit from it.
- External staff may use a reduced simulation representation. On recruitment into the on-campus company, expand the person coherently into the full NPC system, retaining identity, history, learned knowledge and relevant traits.
- Provide dedicated business and market windows, product inspection, model-name pools and causal reports. These are observation surfaces; **NPCs operate the business autonomously**.
- Keep genuine natural resources distinct from manufactured intermediates. Processed materials must have plausible production or procurement paths.
- Maintain accessible Thai player-facing explanations and Edit Hub, even when design documents use technical English.

## 3. Existing game: the starting point, not an Era 3 implementation

The reviewed v2.9.0 source has 170 learned subjects, 64 material types, 40 material recipes, 42 fixed catalogue products, 10 B2B services, 20 equipment types, 12 countries/economic blocs, 28 starting external firms and 66 bilateral relations. These are current counts, not Era 3 targets. An initial `cable_workshop` world returned no `S.audit` errors during this documentation task. No handset products were found in the product-ID check; no runtime phone-design ecosystem is claimed.

### Existing systems to preserve and extend

- **NPC life and organization:** on-campus people with locked Human Core profiles, needs/state, learned skills and subjects, walking/work/rest, wages/wallets, relationships, careers, aspirations, memories, retention, internal transfers and spin-offs.
- **Knowledge:** prerequisites, practice/study, subject-dependent performance/potential, company knowledge projects, prototypes, validation and target-specific technology licensing. Money alone does not create qualified production.
- **SME openings:** six selectable origins: food kitchen, bakery, cable assembly, metal workshop, software agency and field maintenance. Three to five staff, limited relevant know-how, purchased tools/stock, lease/deposit/preparation and reconciled opening capital. No phone origin exists yet.
- **Operations:** timed material processing, product routes, machine slots/condition/faults/maintenance, specialist gaps, paid OEM fallback, stock batches, physical warehouse lots/FIFO-FEFO, delivery contracts and public tenders.
- **Software:** client projects with developer/QA work time and milestone accounting, SaaS subscriptions and support mechanisms. v2.9 removed an omitted-minute completion bypass. Scope estimation and allocated project labor remain approximate.
- **World:** external firm cash/stock/production/trade, national public and residual-household accounts, staged commodity measures/treaties, fictional leaders/terms and budgeted economic conflict/recovery.
- **Information and decisions:** personal news reading, executive known-risk/sector signals, learning reviews and conditional supplier partnership negotiations.
- **Observation:** Company/World/person sheets, bottleneck tracker/watchlist, cause/effect records and counterfactual comparison.

### Gaps relevant to Era 3

- Current catalogue products are static; dynamic engineering designs, component variants and product families require new persistent contracts.
- External firms are aggregate operating entities, not complete named workforces. Existing employee spin-offs do not establish the proposed external talent system.
- Existing generic `microchip`, `silicon_wafer`, `pcb`, `battery` and related resources are coarse abstractions, not qualified handset components.
- The current `microchip` recipe takes wafer and PCB inputs, and the wafer chain abbreviates purity processing. These must not be treated as an accurate fab, packaging or handset manufacturing model.
- Existing semiconductor buildings and subject labels do not prove appropriate capital scale, process qualification, cleanroom conditions, PDK compatibility, yields or mature production capability.
- No phone installed-base economy, model lifecycle, OS ecosystem, operator adoption model or phone-specific acquisition mechanism is established.
- Not all 42 existing products have a validated mass/energy/yield model. Era 3 must not claim to have upgraded every other business automatically.

## 4. Recommended architecture: a constrained engineering and economic ecosystem

Use **capability-constrained product generation**, with domain-specific engineering evaluation and shared economic infrastructure. Generate product candidates from a market brief and feasible technology/component choices; build and evaluate prototypes; authorize production only after relevant validations. Name pools provide identity, not performance. Give each company a coherent brand/family naming style, prevent accidental same-brand model collisions, and retain stable names/revisions in historical records.

Two alternatives were considered: extending the fixed catalogue is easier but fails the emergent-product requirement; randomizing specifications creates variety without causality. The recommended approach makes variety an outcome of the actual state of the world.

Separate these concepts explicitly:

| Concept | Meaning |
|---|---|
| Individual knowledge | What a person has learned and can apply |
| Company knowledge asset | Controlled design records, documented processes, source code and organizational learning |
| IP/legal entitlement | What the company may manufacture, modify, distribute or license under the simulated agreement |
| Technical capability | What a staffed, equipped and qualified team/facility can actually accomplish |
| Blueprint/revision | A specific reproducible design and its required parts, processes and software |
| Qualification | Evidence that a design/process meets defined tests, within a stated operating envelope |
| Physical item/lot | A finite produced or purchased quantity with provenance, cost and quality |
| Commercial product/model | A marketed configuration, support promise, price and distribution strategy |

A talented person does not substitute for a fab. Owning a patent does not install a process. Having a prototype does not imply scalable yield. A world announcement does not transfer a blueprint.

Use shared contracts for money, physical flows, workforce time, procurement, obligations and event history. Keep phone/fab-specific engineering models modular rather than imposing one generic quality score on all future industries.

## 5. Dynamic product identity, hierarchy and persistence

A suggested conceptual `ProductDesign` includes stable ID, owner, family/model name, revision, target segments/countries, architecture, component references, hierarchical BOM, software baseline, process route, required knowledge/team roles, IP entitlements, test evidence, limitations, estimated/actual costs, lifecycle state and support obligations.

A component may itself be an engineered product sold by another firm. A SoC design can reference CPU/GPU IP blocks, but purchased packaged SoCs are physical stock items; do not consume a second CPU and GPU if already contained in that package. Account explicitly for packaged memory/stacked arrangements where chosen.

Rules:

- Stable generated IDs survive save/load and ownership transfer. Avoid pre-registering every possible phone/RAM/storage combination in `data.js`.
- A released revision is reproducible and immutable as a historical record. Engineering changes create new revisions and may require requalification.
- Separate platform/common-board reuse from marketing variants. A storage option does not necessarily require a completely new R&D programme, but it still must be compatible and tested.
- Approved substitutes require validated compatibility; procurement cannot swap an incompatible part silently.
- Supplier discontinuation, software-support expiry, defective lots and recalls affect the specific variants/revisions involved.
- Ensure no cyclic physical BOM or duplicate nested consumption. Recycling is an explicit lossy process, not an inventory-creation cycle.
- Dynamic references must resolve during validation and survive serialization without functions, runtime pointers or reliance on a live network.

The early world can initialize a bounded number of reproducible, feature-phone-grade designs and suppliers. This is scenario initialization, not a fixed catalogue prescribing future products.

## 6. Hardware compatibility and engineering consequences

### Component families

| Family | Suggested attributes | Consequences and validation |
|---|---|---|
| SoC/application/baseband processor | CPU architecture/core configuration, GPU if present, memory controllers, IO, power envelope, package, supported software interfaces | Workload performance, compatible memory/display/cameras, driver availability, board/thermal constraints |
| DRAM | Generation, capacity, bandwidth, voltage/interface, package | Working set limits, multitasking, bandwidth bottlenecks; match controller capabilities |
| Nonvolatile storage | Technology, capacity, interface, throughput/latency, endurance | Boot/load time, app capacity, wear and cost; storage is not RAM |
| Display/input | Technology, resolution, dimensions, brightness, refresh rate, interface, touch/keypad controller | Usability, GPU load, power, physical fit, drivers |
| Cellular/RF/antenna | Standards/bands, front-end parts, RF design, antenna tuning | Country/operator availability, signal quality, certification and consumption |
| Battery/PMIC/charging | Chemistry, Wh, voltage, discharge/charge limits, cycle behavior, protection | Runtime, safety margins, heating, aging and compatible charging |
| Camera/audio/sensors | Sensor/optics and processing/support requirements | Image/audio quality, capabilities and integration burden |
| PCB/interconnect | Layers, routing/impedance capability, component package constraints, assembly yield | Signal integrity, manufacturability, rework and cost |
| Enclosure/thermal/mechanical | Materials, dimensions, mass, dissipation, seals, repair access | Sustained performance, durability, ingress resistance, assembly and repair time |

Feature phones need not have a separate GPU or smartphone-class application processor. A touchscreen alone does not classify a device as a smartphone. A capable application platform can exist with physical keys.

### Evaluation models

Use workload-dependent limits and calibrated abstractions. Do not add CPU/RAM/GPU scores with incompatible units or make price determine quality.

- Calculate power by operating state/workload and component behavior. Approximate runtime with available battery energy in Wh divided by average W, then account for usable capacity, network conditions, aging and workload variability.
- Maintain a thermal state/envelope: ambient conditions, enclosure/dissipation and generated heat influence throttling and reliability. Compare peak and sustained performance.
- Model CPU, graphics, memory bandwidth/capacity, storage and software overhead as separate potential bottlenecks for defined tasks.
- Derive camera results from sensor, optics, processing/software and conditions, not megapixels alone.
- Represent RF/antenna integration, durability, battery health and assembly defects with testable outcomes and uncertainty.
- Distinguish estimated design performance from measured prototype results. Engineering can discover a flaw the executive did not anticipate.

Publish units, calibration assumptions and valid operating ranges. The target is observable engineering causality, not transistor-level circuit simulation or a claim of laboratory-grade prediction.

## 7. R&D: people, evidence, uncertainty and organizational memory

An R&D project needs a technical objective, baseline knowledge, prerequisite capabilities, named contributors/reviewers, available person-hours, equipment/tool access, experiments/prototype consumables, cash budget, schedule estimates, risks and acceptance evidence.

Possible outcomes: successful qualification; partial result; design requiring rework; useful knowledge without a marketable product; suspension; cancellation; or a strategic pivot. Preserve partial learning rather than turning every failed prototype into zero progress.

Suggested disciplines include digital logic, computer architecture, embedded systems, RF/antenna engineering, signal integrity, semiconductor devices/process integration, IC verification, physical design, memory systems, power electronics, thermal engineering, battery safety, OS/kernel/drivers, security, manufacturing engineering, reliability, metrology, procurement and industrial economics. Audit the existing 170 subjects before adding duplicates. Use the project's subject specification template for prerequisites, aptitudes, learning/practice, applied outcomes and limitations.

Aptitudes and learned proficiency must interact with fatigue, attention, motivation, tools, communication, team coverage and complexity. Avoid a single intelligence multiplier. More staff do not linearly speed every task; review, integration, training and bottleneck specialists matter. Do not double-book the same person across development, fab work, teaching and customer support.

Distinguish experimental progress, documented knowledge and qualified production. Papers or a licensed design can reduce uncertainty; transfer still takes integration/training/validation. A departing engineer changes capacity and tacit knowledge, but does not erase retained company-owned documents or automatically transfer all proprietary assets to the new employer.

## 8. Semiconductor business ecosystem

Support distinct roles: IP/design-tool providers, fabless designers, wafer suppliers, foundries, integrated device manufacturers (IDMs), memory producers, OSAT packaging/test firms and equipment/material suppliers. One firm can eventually own multiple divisions, but each must have staffing, assets, capacity, qualified processes and accounts.

### Proposed design and fabrication flow

**Design:** market/technical brief → IP/architecture choices → logic design → verification → physical implementation against the chosen process design kit (PDK) → signoff → mask/tape-out procurement → prototype silicon → bring-up/test → possible respin → production qualification.

**Materials:** quartz/silica feedstock → metallurgical silicon → electronic-grade purification → crystal growth → wafer slicing/polishing/cleaning. Separate bauxite/aluminium and silica/silicon where the old composite resource is insufficient.

**Fabrication:** qualified wafer input → repeated deposition/coating/lithography/etch/doping/clean/metrology operations according to the process route → wafer test → dicing → packaging/interconnect → final test/binning → packaged component stock.

**Board/device assembly:** bare PCB manufacture → component procurement → placement/soldering/inspection → board programming/test → enclosure/display/battery integration → RF/functional/safety/quality tests → packing and finished stock.

A die is not a PCB. A package substrate is not automatically interchangeable with the handset board. Keep ownership and flows explicit when outsourcing wafer fabrication or packaging: customer-owned WIP is not the contractor's freely sellable inventory.

### Capacity, yield and economics

- Track wafer size, approximate die area/usable die count, process eligibility, defect-related yield, test/packaging yield, process maturity and bin distribution. Use a stated geometric approximation rather than arbitrary fixed chips-per-wafer.
- Distinguish gross dies, good dies, packaged passing chips, lower performance bins and scrap. Integer lot accounting must reconcile.
- Track lithography/etch/deposition/metrology/packaging tool groups, qualified operators, cleanroom conditions, uptime, maintenance/calibration, contamination and utility constraints. Model meaningful repeated tool visits and queue bottlenecks; avoid pretending one progress bar is the full fab.
- Process generation/node is not a universal technology level. Memory, logic, RF, analog and power devices have different requirements; a mature process may be economically preferable.
- Charge design tools/IP, engineering labor, masks/NRE, prototype lots, process development, maintenance, consumables, energy, water treatment, waste handling, failed lots and financing as applicable. Prevent duplicated payroll charges disguised as additional labor cash costs.
- An advanced fab takes substantial capital, qualification and elapsed time. Do not inherit small generic building prices as realistic semiconductor capex. Establish explicit economic scaling rather than inventing exact real-world prices in this proposal.

Keep resource extraction, wafer production, IC design, fab processes and board assembly economically separable. Supply shortages and weak yield should propagate into component availability, handset schedules, prices, margins and strategic decisions.

## 9. Physical resources and the upstream rule

New material families may include high-purity silicon/polysilicon, process-qualified wafers, dopants, specialty gases, photoresist and processing chemicals, ultrapure water, copper/other interconnect metals, package substrates/mould compounds, solder materials, glass/display layers, battery materials and mechanical polymers/metals.

These are proposed families, not an instruction to add every chemical as decorative stock. Select granularity where provenance, shortage, purity, handling, substitution or process outcome actually matters. Research specific chemistry/processes before fixing quantities and recipes.

For every input define: natural or processed origin, unit, quality/purity grade, acquisition/production path, transformations, loss/by-products, storage constraints, transport, demand and downstream users. Pure silicon, flour, paper, glass, PCB, RAM and batteries are not natural upstream resources. Intermediate businesses may import them without owning the mines or fabs, provided finite suppliers and actual transactions exist.

Use electricity in kWh, water in a declared volume unit and material quantities in coherent mass/item/batch units. Separate capacity from consumed inventory. Recoverable material may be recycled with costs, delays, conversion loss and quality limits; it must never recreate the original amount or product for free.

## 10. Software platforms, ecosystems and IP

Represent firmware/RTOS, smartphone OS, kernel, drivers/HAL, middleware, app APIs/ABI, SDK/toolchains, essential applications, security updates and optional proprietary services as versioned assets with ownership and support states.

Early-world software must support the feature-phone baseline. Do not preload a finished modern smartphone platform that every company can instantly adopt. New capabilities arise from actual funded projects, open collaboration, licensing or acquisitions.

Possible company strategies: develop a platform, fork an available open platform under its licence, license a platform, outsource a subsystem, share an alliance platform, or remain a focused feature-phone producer. Each creates distinct cost, differentiation, dependence, ecosystem and support risks.

Compatibility is a matrix of provided/required capabilities, supported hardware and software versions, not an OS label. Hardware substitutions or an OS upgrade may require driver work, regression testing, security review and recertification where applicable. Keep app availability and installability consistent with the actual platform/resources.

Open-source software does not inherently incur a per-unit licence fee, but adaptation, QA, security, distribution and support still require work. Proprietary agreements may charge per device, revenue share, subscription or NRE. Track contracts rather than consuming fictional physical OS units.

Distinguish legal/regulatory authorization, operator interoperability/certification, platform compatibility and optional proprietary services. Requirements vary by country and technology. Android CDD/CTS and GMS are reference concepts, not blanket compulsory paid certifications or automatic access to real brands/services.

App developers should respond to installed base, SDK maturity, compatibility stability, monetization opportunity and support burden. Model a bounded ecosystem rather than inventing unlimited app-company revenue or implementing a real app store in this patch.

## 11. Product development, release and after-sales

Suggested handset lifecycle: concept/market brief → feasibility → architecture/design → engineering prototype → design verification → production validation/pilot → release → volume production → maintenance/revisions → phase-out/end-of-support. EVT/DVT/PVT terminology may be used with clear criteria; do not assume every small modification needs a complete new programme.

At each gate, record NPC decision, evidence, remaining risks, resource commitment and reason. A CEO can delay, simplify, license, cancel or accept defined commercial risk; hard safety/technical/legal constraints cannot be bypassed by personality or cash.

Production requires a qualified revision, tooling/fixtures/programming/calibration, compatible lots, staffed capacity, setup/changeover, utilities and working capital. Track WIP, rework, scrap, process measurements, finished lots and ownership. A phone is not sold merely because its BOM was consumed.

After release, track returns, field failures, repair capacity/parts, warranty provisions versus actual payments, software commitments, vulnerability fixes and recall decisions. Failure data feeds subsequent engineering work and buyer trust. End-of-life does not erase unpaid warranties or ongoing software commitments.

## 12. Procurement, commercial relationships and vertical integration

Component/fab/assembly contracts should capture buyer/seller, item/revision, quantity/quality, price/currency, minimum order quantity, NRE/tooling, capacity reservation, deposits/credit terms, lead time, delivery milestones, acceptable substitutions, IP/support scope and cancellation/defect remedies.

Reserve capacity once. Do not sell the same production slots or stock to multiple customers. A distributor, fab and phone brand must agree on physical ownership and where cash/receivables/escrow obligations sit.

Make-or-buy decisions compare attainable quality, knowledge gaps, volume, total ownership cost, available cash/credit, utilization, supplier dependence, risks and strategic value. Full vertical integration is allowed, not mandated or automatically superior. Underutilized owned facilities can bankrupt an otherwise capable designer.

For SME entry, a reasonable proposed initial route is a small brand using a licensed/reference feature-phone platform and contract assembly, with real integration, quality, support and financing responsibilities. Retail/repair, design services, contract assembly or component businesses may be alternative entry positions. Final origins need economic calibration; no phone-origin budget is approved here.

Acquisitions must transfer explicitly priced ownership of equity/assets/rights/obligations, not duplicate cash, staff, stock or IP. Include due diligence, debt, valuations, integration cost, staff retention, IP scope and organizational compatibility. An asset purchase and buying shares are different transactions. Retained liabilities, minority rights and jurisdictional restrictions can be approximated transparently.

## 13. External firms, reduced-detail people and recruitment

Generate a bounded set of named external people with stable IDs, employer/team/project, learned subjects/proficiency, relevant aptitudes/personality, experience, salary, satisfaction/loyalty, career preferences, availability, learning history and notice/contract state. Use fictional identities. Do not create full off-campus navigation or simulate every worker's movement.

Choose a representation that preserves coherent underlying traits from creation, for example a deterministic latent full profile plus an actively simulated subset. The exact implementation remains open. Compare knowledge growth and productive time fairly with on-campus workers; reduced detail must not produce free labor, instantaneous study or arbitrary buffs.

Recruitment flow can include discovery through public history/referrals, contact, candidate interest, compensation/role offers, negotiation, counter-offer, notice, relocation/onboarding and employer transfer. These are autonomous company/person decisions. Personality, family/career preferences and team loyalty can outweigh salary.

Promotion to the full campus representation must retain identity, age/history, proficiency, relevant aptitudes/personality and financial/employment continuity. Use the existing locked Human Core; this proposal does not authorize modifying it. Do not reroll talent when hiring, duplicate a person across employers, leave them assigned to old projects or silently halve/double their skill.

The former company must react to departures through rescheduling, retention, replacement, outsourcing, training or cancellation. Acquisitions can retain teams or suffer departures. Tacit knowledge, documented assets and legal rights remain distinct.

## 14. Autonomous executives, information and divergent worlds

All firms, including the observer's, choose among feasible strategies using cash runway, debt/credit, market beliefs, current sales/margins, workforce/capacity, engineering gaps, supplier reliability, competitor activity and executive traits.

Possible decisions include conserve cash, refine an existing model, enter a niche, explore research, train/recruit, license, outsource, increase inventory, change suppliers, invest in equipment, join a platform alliance, acquire a firm, discontinue or exit. Do not make a hidden universal script that always launches the next generation after a fixed number of days.

Use bounded rationality: leaders have estimates, biases and incomplete information. Public launches, trade news and known supplier statements can be observed; secret competitor projects are not automatically executive knowledge. The player's observer view may reveal more than any particular NPC knows.

Exploration must be affordable and attributable. An executive's creativity can change the search over feasible designs; prudence affects reserves and risk tolerance; expertise improves estimates. None should guarantee success or override incompatible hardware.

Different seeds and interventions should yield explainable differences in staffing, funding, process maturity, IP, products and competitive outcomes. Replaying the same seed/state/commands must remain deterministic. A cash edit, employee departure or failed batch should create a traceable cause/effect chain.

## 15. Markets, adoption, operators and the living world

Distinguish market demand, retailer/distributor stock, sell-in shipments, end-customer sell-through, active installed base and replacement demand. Count one device's lifecycle coherently; a shipment between channel firms is not a second end-user sale.

Use bounded consumer/enterprise cohorts with country, purchasing power, segment needs, current devices, replacement behavior, network availability, brand beliefs and app/service requirements. Choices should respond to total ownership cost, availability, durability, support, relevant task performance and compatibility. Premium specifications do not imply universal demand.

Separate handset makers from semiconductor, display, battery, platform, operator and channel firms. Only handset participants start with feature-phone products; food producers and mines do not become phone vendors by fiat.

Telecom operators/infrastructure need investment, compatible standards/bands, capacity and commercial incentives. Avoid a modern network magically available everywhere at startup. A better network does not automatically make every phone compatible, and an app-capable device need not require the newest radio generation.

Connect existing national policies, tariffs, treaties, export controls, FX/freight and conflicts to specific items, origins, entitlements and actual routes. Do not apply the same semiconductor embargo multiplier to every domestic component. Contract timing, inventory buffers, substitution and domestic production can alter exposure.

Track learning from actual field/sales outcomes without granting perfect demand forecasts. Shortages, price wars, unsold stock, credit risk, return costs and old models' continuing niches should be possible. A firm may rationally keep selling feature phones after competitors introduce smartphones.

## 16. Observation UI and Edit Hub

Provide dedicated inspection surfaces for:

| Surface | Questions it must answer |
|---|---|
| Phone business overview | What does this company do, own and know? What are its constraints, reserves and strategy? |
| Product/model browser | Who designed each model/revision? Which components/software are used? What tests, prices, stock and support states apply? |
| Engineering/R&D | Who is working on what, with what tools/time/budget? What failed? What decision is pending? |
| Industry market | What is selling, where, to whom and why? Distinguish channel shipments, sales and installed base. |
| Supply chain/contracts | Who supplies which qualified revision, at what lead time/capacity/terms, and what is blocked? |
| Semiconductor/facility view | Which process/PDK, lots, tool queues, yield bins, people and utility constraints determine output? |
| External company/talent view | Which named people/projects explain capabilities and departures? What can our executives actually know? |
| Causal chronicle/comparison | Which choices/interventions/news led to observed changes? |

Every view reads snapshots without advancing time, changing RNG, completing research or signing agreements. Display Thai explanations and accessible mobile layouts. Avoid forcing players to understand JSON, technical IDs or electrical engineering.

No operational management buttons. A displayed board decision is made by NPCs; the observer does not have to click approval. Edit Hub may expose scoped experimental changes to persons, cash, materials or other approved state, clearly distinguished from normal NPC decisions and logged as interventions.

A meaningful record reads: “The engineering team rejected this display because the selected controller cannot drive it; the CEO chose a lower resolution to preserve the launch window.” Generic randomized headlines do not meet the observability requirement.

## 17. Time, performance, determinism and accounting

Current simulation uses five-minute ticks; at 1×, two game minutes pass per real second. Product R&D and fabs operate over much longer horizons than a workday. Calibrate separate durations for a minor revision, new platform, chip design/respin, process qualification and facility construction; do not compress every project into a few in-game days.

Propose fast-forward-to-event or higher simulation speed with accounting and obligations preserved. Offscreen companies can use event-driven/daily work allocation and batched cohort simulation while maintaining real elapsed time and consistent progress. No catch-up completion that skips wages, consumables, market events or staff departures.

Bound candidate-design search, active projects, component variants, workforce size, retained histories and market cohorts. Summarize old events without deleting active obligations or ownership references. Benchmark external-industry scale separately from campus headcount, and report Node simulation cost separately from browser/mobile frame performance.

Use explicit memory units (for example Gbit versus GB), energy/power units (Wh versus W) and item/mass/area/volume units; conversions must be declared and tested.

Money remains integer satang. Use a documented precision/rounding policy for prices, interest/FX allocation and unit costs. Track quantities, WIP, reservations, ownership, scrap and stock consistently. Deposits are not automatically recognized revenue. Allocate overhead/R&D/production costs coherently without charging cash twice for one wage or transfer. Model warranty liabilities and actual settlements separately. External firms may not receive unrecorded cash or stock refills to keep the story moving.

Research/public announcements, model names and event timing must use simulation-owned deterministic randomness. Rendering is not allowed to change world outcomes. Current-version saves must preserve generated designs, variants, workforce assignments, contracts, IP, WIP, installed cohorts and long-lived obligations, with integrity validation and resumability.

## 18. Reusable templates for future industries

Phone-specific physics should coexist with a reusable business-definition contract:

1. Customer need and proposed value.
2. Product/service specification, revision and ownership.
3. Individual disciplines, team roles and organizational knowledge requirements.
4. Rights/licences/standards and qualified capability.
5. Hierarchical BOM or service resources, units, grades and provenance.
6. Equipment/process route, setups, staffing, capacity and elapsed time.
7. Experiments, acceptance tests, yield, defects, rework and by-products.
8. Procurement/subcontracting/ownership and commercial obligations.
9. Cost, financing, inventory/WIP and revenue recognition.
10. Distribution, adoption, support, failure and end-of-life.
11. Executive/person decisions, information limits and causal explanations.
12. Serialization, conservation tests and counterfactual scenarios.

Create analogous templates for a discipline, component technology, facility process and external professional. A subject definition needs prerequisites, proficiency interpretation, relevant aptitudes/states, learning/practice rules, applied work effects, quality/safety implications, evidence and limitations. Do not pad the subject catalogue with names that never change work.

Treat Era 3 as a reference model to validate before porting abstractions into food, logistics, agriculture or other businesses. Reuse common contracts, not identical physics or a universal effort formula.

## 19. Suggested implementation workstreams (not an executed plan)

| Workstream | Independently inspectable result |
|---|---|
| A. Domain contracts and scenario bootstrap | Generated IDs, physical/component/software distinctions, compatibility schema, finite feature-phone baseline and valid saves |
| B. External people and team work | Stable external identities, realistic work/learning/payroll, staffing bottlenecks and coherent employer transfer |
| C. Components and semiconductor operations | Design/IP/PDK/fab/OSAT separation, materials/tool queues, yield/cost and actual purchase/subcontract flows |
| D. Product engineering and R&D | Autonomous design candidates, prototypes, tests, gates, revisions, cancellation and software/hardware integration |
| E. Market and installed ecosystem | Country/segment/operator demand, channels, real sales/stock, app/platform effects and after-sales |
| F. Strategy and ownership | Make/buy/license, recruitment/retention, alliances/acquisitions and causal executive decisions |
| G. Observer experience and delivery | Read-only phone/market/facility/talent views, Edit Hub experiments, source-backed reports, tests, skills and verified packaging |

Workstreams are engineering organization, not a mandatory technological progression for every simulated company. Build a thin end-to-end autonomous slice early: a small brand sources compatible parts, develops/tests a feature-phone revision, contracts manufacturing, sells finite stock and fulfills support obligations while a competitor independently pursues a different project. Then deepen bottlenecks and ecosystem feedback. Do not ship placeholder tabs as proof that the ecosystem exists.

Future implementers should inspect source, create concrete contracts and an implementation plan, define failing behavioral tests, implement, verify and document. They may rearrange workstreams based on real dependencies, with an explicit explanation.

## 20. Acceptance evidence and failure scenarios

At minimum, demonstrate:

- **World autonomy:** phone firms fund projects, source inputs, launch/support/discontinue models while the observer company never enters the sector. No player approval is required at any gate.
- **Emergence:** companies generate different feasible revisions/strategies from differences in staff, cash, knowledge, supplier access and leadership. No universal scripted phone upgrade sequence.
- **Causal intervention:** editing cash alone cannot create missing knowledge or manufacturing; changing a relevant expert/trait or input availability can alter feasible actions and outcomes.
- **Compatibility:** an unsupported memory interface, missing driver, RF mismatch or inadequate power design blocks qualification or produces a documented limitation; optimistic CEO personality cannot invalidate the constraint.
- **Engineering:** sustained performance/energy/task bottlenecks respond to component and software changes. Higher resolution or clock speed has costs and may worsen the product for its target segment.
- **Manufacturing:** unavailable tools, contamination, low yield, a lost specialist, failed utilities or reserved capacity affect output, cost, schedules and recovery decisions.
- **Procurement/ownership:** finite supplier stock/capacity, long lead times, rejected substitutions, insolvency, embargoes and subcontracted WIP conserve money and physical ownership.
- **Recruitment/acquisition:** no duplicated people, assets or IP; history/skills persist on transfer; former employers react; buyer integration does not instantly qualify every technology.
- **Software:** platforms require actual development/integration/QA and ongoing support. No free subscribers, automatic paid-service entitlement or fake physical OS consumption.
- **Market:** channel resale does not double-count end-user demand; installed base/replacement/returns/support affect future decisions; unsold inventory and failed products are possible.
- **SME fairness:** a small entrant can pursue an attainable route without owning a fab; capital-rich but unqualified entrants still face constraints. No guaranteed profit or diversification.
- **Reproducibility:** same seed/state/commands reproduce outcomes; save/load continuation preserves obligations, clocks and reference integrity; snapshots remain pure.
- **Delivery:** current tests remain meaningful, new behavioral tests cover the scenarios, browser/mobile observation works, performance budgets are measured, and the actual source/build/archive is verified.

Use multiple worlds and long horizons; classify “could not act because prerequisites were missing” separately from “could act but chose not to.” Record adverse outcomes, not only successful demonstrations. A predetermined winning company is not a valid emergence test.

## 21. Open design decisions and calibration research

The owner has supplied the vision; AIs should propose justified defaults instead of asking them to set every technical parameter. Areas needing research/design resolution include:

- Opening technology envelope and available radio infrastructure; fictional era versus historical dates; avoiding contradictions with advanced non-phone catalogue products.
- Feasible SME origin routes and budgets, industry capital/cost scaling, realistic R&D/fab lead times and useful fast-forward behavior.
- External workforce size/representation, common proficiency semantics, retention/relocation friction and performance cost.
- PDK/process/IP abstraction, initial supplier roles, market information access and standards/entitlement granularity.
- Appropriate engineering/power/thermal/yield calibration and uncertainty; bounds on candidate generation and component compatibility.
- Market cohort sizes, channel inventories, app incentives, support duration and replacement patterns.
- Treatment of old generic chip recipes in other industries so introducing detailed components does not leave free or incompatible production shortcuts.
- Save-version policy for the major release. Current project rules do not require old-version migration by default; do not silently break valid current-version references or delete user saves.

Use real sources for material/technical claims; distinguish factual engineering constraints from gameplay scaling. No exact future architecture, budget, number of phone models or numeric release acceptance target has been approved by this document.

## 22. Codebase navigation and immutable rules for implementers

This is orientation, not a promise that proposed modules already exist:

| Existing path | Current responsibility / integration implication |
|---|---|
| `COMPANY_SOURCE/js/human-core.js`, `CORE_LOCK.json` | Locked Human Core; do not modify. Preserve profile meanings and validation. |
| `COMPANY_SOURCE/js/data.js` | Static catalogue, recipes, industries, external corporations/nations and baseline data; audit coarse semiconductor resources |
| `COMPANY_SOURCE/js/sim.js` | Main simulation, people/subjects/knowledge, jobs, executive decisions, production, services, software and audits; avoid an uncontrolled monolithic extension |
| `COMPANY_SOURCE/js/economy.js` | Integer-satang player finance/ledger; preserve idempotence and cash/debt reconciliation |
| `COMPANY_SOURCE/js/world.js` | External aggregate firms, finite stocks/cash/trade/escrows and national economic effects |
| `COMPANY_SOURCE/js/civics.js` | Leaders, ministries, commodity policy, treaties and economic conflict |
| `COMPANY_SOURCE/js/startup.js` | Six existing SME origins and opening-capital reconciliation; phone origins are future work |
| `COMPANY_SOURCE/js/plant.js` | Equipment, routes, timed processing, maintenance and resource/capacity gates |
| `COMPANY_SOURCE/js/api.js` | Validated commands and immutable cloned snapshots; UI must not mutate simulation |
| `COMPANY_SOURCE/js/save.js` | Save integrity, references, schema and current-version validation |
| `COMPANY_SOURCE/js/debug.js`, `css/debug.css`, render/layout modules | Existing mobile/desktop observation/Edit Hub and campus presentation |
| `COMPANY_SOURCE/test/`, `tools/` | Runtime/browser checks, locked-core verification, build, benchmarks and SME soak script |
| `.agents/skills/`, root `SKILL*.md` | Repository master/domain references and handoff copies; maintain affected references every patch |

Human Core SHA-256: `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`. Its 14 personality dimensions, 18 values, 30 aptitudes/potentials and 12 state dimensions are locked. Learnable disciplines and outside-core systems may be added. `AGENTS.md` itself cannot be changed without explicit owner permission; this brief is not that permission. Latest explicit user instructions outrank local guidance.

Codex and Agy can operate on GitHub; chat-app Gemini/ChatGPT use owner-mediated ZIP handoffs. Read current `AGENTS.md`, start guide, status, work register, skills and relevant source before implementation; preserve concurrent work, compare returned ZIPs against their base, never force-push over others. Document runtime changes, affected skills, status, limitations and test evidence each patch.

Two Gemini app skills require updating inside the app as well as repository copies when applicable. Repository edits do not prove app synchronization. Full implementation ZIPs must include source/assets/tools/tests/builds/hidden skills/docs/reports and be reopened, CRC/hash checked, extracted fresh and tested. This **two-document proposal package** is intentionally not an implementation ZIP.

## 23. Research references and evidence boundaries

Primary sources consulted on 2026-11-12 for design grounding:

1. [MediaTek Helio G99 specifications](https://www.mediatek.com/products/smartphones/mediatek-helio-g99): example of a real SoC specifying CPU/GPU and supported memory/storage. Vendor specification, not an independent performance comparison or a proposed starting-era chip.
2. [ASML — How microchips are made](https://www.asml.com/en/technology/all-about-microchips/how-microchips-are-made): wafer-based multilayer fabrication, cleanroom sensitivity, and fabless/foundry/IDM roles. Educational industry overview, not a complete recipe or cost model.
3. [Android — Vendor interface object](https://source.android.com/docs/core/architecture/vintf): manifests and compatibility matrices for device/framework interfaces and updates. Android-specific example, not a universal requirement for every simulated OS.
4. [Android — Compatibility overview](https://source.android.com/docs/compatibility/overview): CDD/CTS and distinction from optional GMS licensing; do not invent universal paid compatibility fees.

These sources support selected constraints. They do not validate every proposed formula, chemical route, cost, duration or market behavior. Research and calibrate those before implementation. Use fictional company/platform/model names unless a deliberate and appropriate real-world reference is needed.

Existing runtime evidence is summarized in the companion status. Historical v2.9 test results are not tests of Era 3, and no runtime test result is a proof of full real-world accuracy.

## 24. Ready-to-use brief for another AI

> You are collaborating on Company Simulation / Siam Enterprise. Read this proposal and its accompanying project status completely. The game is an autonomous NPC life-and-business simulation: executives and staff decide and operate everything; the player observes, controls time/view and changes conditions through Edit Hub, never issues normal operational management orders. The current runtime is v2.9.0; Era 3 / v3.0.0 is a proposed phone-industry overhaul, not an implemented feature. We want emergent feature-phone-to-smartphone development, dynamic products assembled from compatible real components/software, serious semiconductor/supplier operations, finite money/materials/capacity, persistent external professionals and coherent recruitment/acquisition. Preserve the immutable Human Core and AGENTS rules. Separate individual knowledge, organizational assets, IP entitlement, engineering qualification and manufacturing capacity. Review the proposal critically, invent additional useful ideas, identify contradictions and prioritize a feasible end-to-end implementation. Explain causal mechanisms, tradeoffs, test scenarios and remaining uncertainty; do not simply repeat the proposal. With only these documents, provide analysis/design and do not claim live source access or implementation. Before coding, inspect the actual current project and its rules. Every actual patch must update relevant skills/status/docs/report and verify the final deliverable, including fresh extraction of any returned project ZIP.

## 25. Collaboration record

- **2026-11-12, Codex, revision 1:** consolidated owner requirements and two design discussions; checked runtime identity/catalogue counts and initial audit against `855e183`; documented existing versus proposed behavior, autonomy, semiconductor correction, two-file context, data/engineering/economic contracts, acceptance scenarios and unresolved research.
- **2026-11-12, Agy, revision 2 (Co-Evolution & B2B Silicon Deal Architecture Blueprint):** authored [`era3/ERA_3_COEVOLUTION_ARCHITECTURE_AND_AI_BLUEPRINT.md`](ERA_3_COEVOLUTION_ARCHITECTURE_AND_AI_BLUEPRINT.md) defining the concrete 6-stage B2B Silicon & Component Deal Pipeline (`chip_architecture_taped_out` → `es_sampling_and_eval` → `design_win_negotiation` → `public_design_win_announced` → `wafer_fab_and_binned_delivery` → `commercial_mass_production`), the Causal Tech Media & Flagship Launch News Engine, the 6 Co-Evolving Hardware/Software Tech Trees (SoC/Modem, Display/Touch, DRAM/Storage, Battery/PMIC/Thermal, Camera/ISP, OS/Drivers), concrete module boundaries (`js/semiconductor.js`, `js/handset.js`, `js/talent.js`), JSON data schemas (`ChipDesign`, `SiliconSupplyContract`, `PhoneModelDesign`), engineering/yield/thermal equations, and the 4-phase implementation roadmap.
- **Runtime implementation status:** not started by this documentation assignment. No Era 3 module, UI, product catalogue or performance claim is delivered here.
- **Next collaborator:** add a dated, attributed contribution and identify whether it is a proposal, source-inspected finding, implemented change or verified result. Keep the companion status truthful; do not turn future work into completed features by editing prose.
