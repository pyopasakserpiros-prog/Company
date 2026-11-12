# Company Simulation — Current Project Status and AI Onboarding

**Updated:** 2026-11-12. **Runtime:** v2.9.0. **Inspected source baseline:** `855e183d9b7a404c857e9abc162c1a67a4a84f76`, branch `main`, repository `pyopasakserpiros-prog/Company`.

**Current collaboration project:** **Era 3 — Feature and Smart Phones**, intended major release v3.0.0. **Status: proposal/documentation only; not implemented.** Read the companion `ERA_3_FEATURE_AND_SMART_PHONES.md` in the same `era3/` handoff folder. The runtime has not been renamed to v3.0.0 by this documentation update.

Canonical status: repository-root `project_status_and_ai_onboarding.md`. Identical portable copies are maintained in `era3/` and `COMPANY_SOURCE/`. Links below use GitHub paths so a downloaded status copy retains useful navigation. The content of this status and the Era 3 proposal is sufficient for context/design discussion without opening other documents; actual coding still requires the source project and current rules.

## 1. What kind of game this is — mandatory context

**Company Simulation / Siam Enterprise is an autonomous NPC life-and-business world. NPC executives and employees make operational decisions themselves; the world continues without player management orders. The player observes and experiments by editing conditions through Edit Hub.**

The owner is not a programmer. They enjoy watching NPCs live, work, learn, form relationships, develop businesses, make mistakes and react differently to different traits and resources. They may change a person's personality/knowledge, company cash or available goods and watch what happens. AIs should proactively propose creative improvements and choose justified implementation details rather than asking the owner to design all mechanics.

Normal player tools are observation, time/camera controls and permitted, validated Edit Hub interventions. There must be no required player approval for hiring, research, a phone design, procurement, manufacturing, launch, pricing or acquisitions. Existing startup-origin choice is an initial condition, not ongoing executive control. Business/market/R&D UI must show NPC plans, reasons, actions and consequences. Any experimental override must be clearly scoped and logged in Edit Hub, not disguised as an ordinary management command.

The rendered campus contains workplaces and people with genuine simulation state. A world outside the observed company produces, trades, develops and changes policy independently. Personality influences choices together with knowledge, information, needs and constraints; it must not be a decorative explanation for a scripted outcome.

## 2. Runtime identity, source and fundamental invariants

| Item | Current value / contract |
|---|---|
| Runtime release | `D.VERSION`, `D.RELEASE_VERSION`, `S.RELEASE_VERSION`: `2.9.0` |
| Save/package version | `S.VERSION` and `package.json`: `0.1.0`; this is not the release number |
| Save schema | `company-foundation-1` |
| Language/architecture | Browser JavaScript, UMD/CommonJS-compatible modules, Canvas/DOM UI; no server required to play the built HTML |
| Source directory | `COMPANY_SOURCE/` |
| Simulation tick | Five game minutes |
| Normal speed | Two game minutes per real second at 1×; a full game day is twelve real minutes |
| Human Core | Permanently locked 1.0.0; 14 personality dimensions, 18 values, 30 aptitudes/potentials and 12 state dimensions |
| Human Core SHA-256 | `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32` |
| Money | Integer satang; 100 satang = THB1. Finance/ownership/stock must reconcile. |
| Simulation/UI boundary | Simulation owns time, RNG, decisions and transfers; UI reads immutable cloned snapshots and sends validated commands. Rendering cannot advance research, sign contracts or alter RNG. |

`AGENTS.md`, `COMPANY_SOURCE/js/human-core.js` and the core lock/checks must not be modified without explicit owner permission. This proposal/documentation assignment grants no such permission. Learnable subjects, business systems and external representations may be extended outside the locked core. Latest explicit owner instructions take precedence over local guidance.

At this development stage old-version save migration is not mandatory by default. Valid saves for a supported current version must still preserve state and reject corruption without deleting the user's saves.

## 3. Source-inspected current inventory

A fresh v2.9.0 `S.create('era3-context-audit',{autonomous:true,startingBusiness:'cable_workshop'})` was inspected during this documentation task. It produced these counts and `S.audit(w) === []`:

| Registry/state | Count | Interpretation |
|---|---:|---|
| Learned subjects | 170 | Separate from innate Human Core traits; existing prerequisites/potential/performance rules |
| Materials | 64 | Mixed natural resources, biological goods and intermediates; accuracy varies by chain |
| Material recipes | 40 | Existing timed processing routes, not a calibrated chemical/fab simulator |
| Catalogue products | 42 | Fixed baseline product definitions, not emergent phone designs |
| Industrial B2B services | 10 | Actual operational/service systems with differing requirements |
| Equipment types | 20 | Working tools/machines, condition, repairs and operational gates |
| Countries/economic blocs | 12 | Fictionalized/aggregate national economies, not complete constitutional simulations |
| Starting external firms | 28 | Finite cash/stock and aggregate operations; later spin-offs can add firms |
| Bilateral relations | 66 | Political/trade relationship state |
| Selectable SME origins | 6 | No handset origin yet |

The current product-ID check found no `phone`/`handset` products. Source inspection and the current guides do not establish a dynamic phone engineering/market ecosystem. Counts and passing initial audits are not proof that every model is deeply realistic.

## 4. Existing people, learning and executive systems

- On-campus NPCs have identity, Human Core traits/state, learned skills/subjects, needs, movement, work/rest, wallets/wages, relationships and career progression.
- Subject proficiency is separate from innate aptitude. Prerequisites, practice/study, relevant aptitudes, personal state, performance/potential and team coverage affect knowledge and work.
- Subjects are not locked to the employer's current business. A person can know something their present job does not use.
- Company knowledge projects, prototype work, validation and target-specific technology licensing support qualification. Pooled points or cash alone must not grant every technology.
- Executive reviews consider knowledge gaps, reserves, risk, investment, learning, hiring, debt and existing operational needs. Feasibility and choice are separate: not investing does not automatically mean a missing implementation.
- v2.8 added aspirations, memories, workplace conflict/coaching, internal role changes, retention counter-offers and employee spin-offs that become external firms.
- The bottleneck tracker/watchlist shows active constraints and causal work histories. Counterfactual comparison can contrast the same base world under changed executive traits, technician knowledge or cash.

**Current limitation:** external firms do not yet have complete persistent named technical workforces. A spin-off founder or aggregate firm technology value is not the Era 3 external-professional system.

## 5. Existing SME beginnings and v2.9 behavior

New-game UI pauses for an origin selection. Each origin starts with relevant experience, purchased tools/BOM stock, leased workspace and reconciled capital rather than complimentary industrial ownership or finished SaaS.

| Origin ID | Opening activity | Paid-in capital (THB) | Staff |
|---|---|---:|---:|
| `food_kitchen` | Small chili-paste/packaged-food kitchen | 100,000 | 4 |
| `bakery` | Small bakery with purchased inputs and an oven | 140,000 | 5 |
| `cable_workshop` | Cable-kit assembly using bought components | 150,000 | 5 |
| `metal_workshop` | Mounting rails/metal assemblies using purchased profiles/sheet | 280,000 | 5 |
| `software_agency` | Client-funded software projects, no finished SaaS/customer gift | 120,000 | 3 |
| `repair_service` | Field-maintenance work with tools and finite spare parts | 150,000 | 4 |

Opening capital = remaining cash + equipment + stock + rental deposit + registration/preparation. The campus is shared leased space; tenant rights are not fully partitioned in the current physical layout. API creation without `startingBusiness` retains a legacy regression/scenario opening; the player-facing chooser passes an origin explicitly.

v2.9 reviews learning every third day using reserves, executive openness and work/news pressure, with prerequisite courses and actual learning time. Services are evaluated using readiness, parts and margin rather than nominal fee alone. Selected chili/cable/metal product knowledge gates and metal routes were corrected where inherited family requirements were inappropriate.

The software-agency origin may pursue actual client projects with minimum 2,400 development progress minutes and 480 QA minutes, one active project and a seven-day review interval; work progresses through the actual tick system. v2.9 removed a caller path that could complete implementation when developer minutes were omitted, blocked incomplete QA, and required actual client funding for relevant payments. Scope and labor allocation still contain approximations.

NPCs read limited news at personal time slots with differing participation/comprehension. Executive-read reports affect known country risk and sector signals used in supplier/R&D evaluation. Supplier partnerships require actual delivery/spending history, trust, reserves, negotiation time and paid signing. Views expose these decisions; they do not require player approval.

## 6. Existing production, services, logistics and finance

- Product work has machine/tool routes and labor/time constraints, with assembly, testing/QA, packing and delivery behavior.
- Material processing uses timed refinery batches, reservations, consumed-input states, inspection, release/rework/scrap/cancellation and warehouse checks.
- Machines have capacity, condition, subsystem faults, maintenance and acquisition modes. Specialist capability and actual parts affect repair; paid OEM repair is a fallback.
- Stock production, finished lots/FIFO-FEFO, cold-chain/spoilage constraints and commercial fulfillment are present.
- Contracts/public tenders, competitor evaluation, deposits/escrows, renegotiation, termination and actual counterparties affect finances.
- Freight/fleet operations, field/industrial services, software/SaaS, agriculture, biological cycles, finite extraction/forestry and external assets exist at their current levels of abstraction.
- NPC crisis responses can release unstarted reservations for repairs, recruit specialists, contract OEM work, renegotiate overloaded contracts and discount stagnant finished stock.
- Player finance and external-world accounts use real transfers/ledgers. External inventory/reserves are finite; do not add hidden subsidies/refills for narrative continuity.

**Limits:** not every product has a complete mass/energy/yield/process model. Generic chips/wafer/battery resources and simple recipes are not realistic handset components. The semiconductor recipe's wafer-plus-PCB abstraction and abbreviated purification chain need redesign for Era 3. Current software estimates, external production/accounting cost assumptions and facility economics require further calibration.

## 7. Existing world, government and markets

Twelve countries/blocs and 28 starting external firms have finite cash/stock, trade and production. Nations have public treasuries, aggregate household/downstream purchasing balances, inflation/unemployment/approval and policy feedback. This is an economic simulation with bounded residual sectors, not a complete population economy.

v2.9 adds fictional named leaders, regime/term history and competing performance-based retention/turnover. Initial incumbent terms have scenario offsets; subsequent terms are 1,080–1,460 game days depending on country. Economic blocs remain aggregate councils.

Commerce ministries review relevant shortages and actual cross-border flows. Commodity measures have announcement/effective/expiry dates; autonomous ministries currently select tariffs/waivers. Export-quota enforcement exists, but autonomous quota-policy choice is not claimed. Treaties progress through negotiation, signing, delayed effect and suspension/expiry. Commodity-specific landed costs affect actual payments and customs revenue. Domestic warehouse purchases do not get a foreign-origin tax by mistake.

Conflicts use public funds, impair external capacity/infrastructure and affect transport. Ceasefire requires time/paid recovery. No tactical units, casualties or full diplomatic/legal institutions are modeled.

**Limits:** no complete parliamentary coalitions, HS-code customs law, full telecom operators/network economics, phone app ecosystem or handset installed-base market. An observer's world view may reveal information not available to individual executives.

## 8. UI, play and source map

The player can inspect Company, World and person information, learned knowledge/R&D, businesses/products, board plans, organization, equipment, commercial obligations, assets, personal news, bottlenecks and histories. Campus camera zoom/pinch and responsive source/standalone views exist. Edit Hub changes permitted state with validation/provenance; preserve accessibility for a non-programmer.

Offline play: open root `Company_single.html`, or `COMPANY_SOURCE/Company_single.html` / `CompanyFoundation_single.html`. Source play: run `python3 -m http.server 8000` inside `COMPANY_SOURCE`, then open `http://localhost:8000/index.html`.

| Path under `COMPANY_SOURCE/` | Role |
|---|---|
| `js/data.js` | Catalogue, recipe/process definitions, world baselines |
| `js/sim.js` | Simulation, people/subjects/knowledge/jobs/decisions/operations/audits |
| `js/human-core.js` | Immutable Human Core |
| `js/economy.js` | Finance/ledger and reconciliation |
| `js/world.js` | External firms, trade, reserves, escrows and national economics |
| `js/civics.js` | Political leadership, ministries, commodity measures and diplomacy |
| `js/startup.js` | Six SME origins and opening reconciliation |
| `js/plant.js` | Machines, routes, timed processing and maintenance |
| `js/api.js` / `js/save.js` | Commands/snapshots and save/reference integrity |
| `js/debug.js`, CSS, render/layout modules | Observer UI, Edit Hub and campus presentation |
| `test/`, `tools/`, `package.json` | Runtime/browser verification, builds, core checks and benchmarks |

Modules are UMD/CommonJS-compatible; browser script ordering matters. `civics.js` loads before `world.js`, `startup.js` after `plant.js` and before `sim.js`. New modules must work in browser, Node tests and all standalone builds.

## 9. Verification evidence: distinguish historical results from this task

At the v2.9.0 delivery, **203/203 unit/integration tests** and **14/14 browser tests** passed, including source/standalone, desktop/mobile observation and chooser coverage. Twelve SME worlds (six origins × two seeds) ran for thirty days with daily audit/save checkpoints. The delivered ZIP was CRC/hash checked, extracted fresh and checked/tested/rebuilt; rebuilt standalone hashes matched. These are historical delivery results, not tests of Era 3.

The recorded simulation-only benchmark at 500 NPCs was mean 1.382 ms/tick, p95 2.510 ms. It is not mobile FPS and is not a performance budget proven for the proposed external phone workforce.

This documentation assignment re-inspected the current release/schema/catalogue counts, initial-world audit and locked-core hash. Documentation checks/report record any further commands actually run. Runtime code and standalone builds are unchanged, and the full historical suites are not claimed to have been rerun merely to publish a proposal.

Implementation verification commands, from `COMPANY_SOURCE` with Node 20+ and the required development tools:

```sh
npm test
npm run check
npm run build
npm run test:browser
node tools/sme-soak.cjs
node tools/benchmark.cjs
```

Browser tests require Playwright and Chromium. `npm test` does not include the browser suite. Build generates all three standalone HTML copies. Counts must be reported from actual output, not preserved as a fixed target.

## 10. Current project: Era 3 — Feature and Smart Phones

**Required direction:** the phone sector begins at feature phones and evolves through actual company research, staffing, resources and strategy. Products are generated from compatible components/software and engineering qualification rather than a predefined finished-phone list. External firms develop independently, use named relevant professionals, and can lose or gain staff through recruitment. Late entrants research/license/outsource/recruit/acquire rather than inheriting all world technology. Semiconductor/component businesses, procurement, potential vertical integration, phone market/lifecycle/support and dedicated observer UI must be substantially deeper than the current coarse model.

**Non-negotiable interaction rule:** NPCs decide all business and engineering operations. The owner reiterated that players cannot command the company; they observe and edit conditions. Phone configuration/R&D/market screens must not turn into player-operated management workflows.

**What has actually been done:** a portable English proposal and this source-grounded status have been written for collaboration, with references to existing code, explicit proposed contracts and acceptance scenarios. The canonical proposal is [Era 3 — Feature and Smart Phones](https://github.com/pyopasakserpiros-prog/Company/blob/main/era3/ERA_3_FEATURE_AND_SMART_PHONES.md); identical status copies are available at root, in `era3/` and `COMPANY_SOURCE/`.

**What has not been done:** no Era 3 runtime modules, generated phone models, compatibility solver, detailed fabs, external technical workforce, phone acquisition system, telecom/installed-base/app economy or dedicated phone UI have been implemented by publishing these documents. No v3.0.0 release, calibrated budget or performance target is asserted. A small two-document handoff ZIP is context, not an executable project or complete implementation package.

The proposal supplies owner requirements, conceptual schemas, hardware/power/thermal constraints, semiconductor/material flows, software/IP distinctions, product gates, markets, autonomous people/strategy, UI responsibilities, delivery workstreams, tests and open research. These mechanisms are recommendations that contributors may improve creatively, not final immutable APIs or a scripted path every firm must follow.

## 11. Collaboration, update and delivery rules

Before editing a real project, read current `AGENTS.md`, `START_HERE_FOR_AI.md`, this status, the collaboration workflow, work register, master/domain skills and relevant source. Record base commit and ownership/scope, preserve others' changes and compare current main before integration; no force-push/reset over concurrent work.

Codex and Agy can access the repository directly. Chat-app Gemini/ChatGPT use source ZIPs supplied by the owner and return verified ZIPs; they must not claim GitHub access or a live merge. A returned ZIP must be compared against its recorded base and current main instead of overwriting the working tree wholesale.

Every actual patch updates affected Master Skills/domain references, maintained root copies, status, docs, indices and an update report with source base, changes, reasoning, cross-system effects, exact verification, limitations and handoff. Finished features belong in status; unresolved ideas remain proposals. These documentary status changes do not themselves implement a feature.

The two Gemini app skills (`company-evolution-dev`, `company-for-every-patch`) also require updating within that app when applicable. Current repository files are available; app access/synchronization has **not** been verified. Do not claim synchronization from repository edits.

An implementation ZIP must contain a single project root, source, referenced assets, tools/tests/dependency manifests, standalone builds, hidden `.agents/skills`, rules, docs/ideas/status and reports. Exclude `.git`, installed dependencies/caches and nested archives. Close/reopen it, check paths/CRC, compare hashes, extract fresh and rerun supported checks/builds. Record what could not be checked. The user expressly requested a **two-document proposal folder** here, so this context package intentionally contains only those two Markdown files.

## 12. Source and report navigation

These links are optional supporting evidence, not missing prerequisites for understanding the two-file brief:

- [Rules: AGENTS.md](https://github.com/pyopasakserpiros-prog/Company/blob/main/AGENTS.md)
- [Start guide](https://github.com/pyopasakserpiros-prog/Company/blob/main/START_HERE_FOR_AI.md)
- [Agent workflow](https://github.com/pyopasakserpiros-prog/Company/blob/main/docs/company/AGENT_COLLABORATION_WORKFLOW.md) / [work register](https://github.com/pyopasakserpiros-prog/Company/blob/main/docs/company/AGENT_WORK_STATUS.md)
- [Master/domain skill index](https://github.com/pyopasakserpiros-prog/Company/blob/main/.agents/skills/README.md)
- [v2.9 SME/civics guide](https://github.com/pyopasakserpiros-prog/Company/blob/main/docs/company/SME_AND_CIVICS_SYSTEM.md)
- [v2.9 implementation report](https://github.com/pyopasakserpiros-prog/Company/blob/main/docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md)
- [v2.9 validation records](https://github.com/pyopasakserpiros-prog/Company/tree/main/docs/company/validation/v290)
- [All patch report index](https://github.com/pyopasakserpiros-prog/Company/blob/main/docs/company/PATCH_REPORTS/README.md)
- [Current Era 3 documentation report](https://github.com/pyopasakserpiros-prog/Company/blob/main/docs/company/PATCH_REPORTS/UPDATE_REPORT_2026-11-12_ERA3_PROPOSAL_HANDOFF.md)

Recent progression, preserved as history: v2.3 learned knowledge/company views; v2.4 living external world; v2.5 time/stock batches; v2.6 machinery/commercial systems; v2.7 process/warehouse/tender depth; v2.8 crises/counterfactuals/observability/human organization; v2.9 SME beginnings/civics/informed decisions. Era 3 is the next proposed major project, not another completed history entry.
