> **STATUS UPDATE (2026-11-12 — COMPLETED IN v2.7.0):** All 8 workstreams and 12 acceptance criteria in this implementation brief have been implemented and verified in **Company Simulation v2.7.0 (`process-driven-realism-overhaul-v270`)** on top of baseline `bbc22e4ce61c002b49c2346841af3c4f3e9d0919` (`186/186` unit & integration tests passing, including `COMPANY_SOURCE/test/process-realism-v270.test.cjs`). See [PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md) and [PROCESS_REALISM_V270_HANDOFF.md](docs/company/PROCESS_REALISM_V270_HANDOFF.md).

# GEMINI ACTIVE DEVELOPMENT BRIEF — Process-Driven Realism Overhaul

## Authorization, baseline, and ownership

The user explicitly authorizes you to implement the complete overhaul described below. This is an implementation assignment, not a request for another proposal or a cosmetic redesign. You are the implementing developer. Make architectural and design decisions yourself within the project's immutable rules, and carry the work through integration, verification, documentation, and delivery.

Baseline: Company Simulation `main`, game release **v2.6.0**, gameplay commit **bbc22e4ce61c002b49c2346841af3c4f3e9d0919**. Later documentation-only commits may contain this brief. Record the exact ZIP/source revision you actually receive. Inspect source before trusting any description or historical test count. Choose a release designation appropriate to the resulting implementation; do not confuse game release numbers with save-schema or package versions.

Do not edit `AGENTS.md` without separate explicit user authorization. This assignment does not grant that authorization. Do not modify `COMPANY_SOURCE/js/human-core.js`, `CORE_LOCK.json`, or disable their checks. The immutable Human Core SHA-256 is `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`. Develop learned knowledge, professions, workflows, and operational systems around that core.

Read in order:

1. [AGENTS.md](AGENTS.md).
2. [START_HERE_FOR_AI.md](START_HERE_FOR_AI.md), [project status](project_status_and_ai_onboarding.md), [collaboration workflow](docs/company/AGENT_COLLABORATION_WORKFLOW.md), and [work register](docs/company/AGENT_WORK_STATUS.md).
3. [.agents/skills/README.md](.agents/skills/README.md), both repository master skills, and all domain skills affected by your work.
4. [Player vision](docs/company/PLAYER_VISION_AND_DESIGN_PRINCIPLES.md), [plant/commercial contract](docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md), [world contract](docs/company/LIVING_WORLD_SYSTEM.md), [learned knowledge system](docs/company/LEARNED_KNOWLEDGE_SYSTEM.md), and [subject authoring template](docs/company/templates/KNOWLEDGE_SUBJECT_TEMPLATE.md).
5. [v2.6.0 report](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md), the actual source, callers, tests, build tooling, and save validation.

## The intended game

The user is a non-programmer who enjoys watching autonomous NPC lives and organizations unfold. They should observe who decided something, why, what happened, and what changed afterward. They enjoy editing an individual's personality, knowledge, company finances, or resources and watching different people react differently. Do not turn routine business operations into a manual management checklist for the player.

The problem is causal shallowness. A registered machine, named stage, progress bar, department, or news headline is insufficient unless it constrains real work and affects downstream outcomes. Outputs and income must emerge from actual inputs, labor, equipment occupancy, elapsed simulation time, quality, logistics, contracts, and payment events.

All simulation necessarily uses numerical models. The objective is a defensible **discrete-event / fixed-tick operational simulation**, not gratuitous physical complexity. Use approximations whose assumptions are explicit, whose state transitions are observable, and whose consequences can be tested. Where exact chemistry, engineering, law, or macroeconomics would be excessive, choose an appropriate abstraction with real resource/time constraints. Never disguise an aggregate multiplier as a detailed process.

Preserve useful existing systems and extend them coherently. Do not replace existing modules wholesale, discard tested invariants, or increase content counts to imply depth. The baseline already has personal knowledge, target-specific R&D, equipment, passive processing, finite inventories, outside economies, and funded installment contracts. Audit what works before replacing it.

## Critical source findings to verify first

These findings describe the inspected v2.6.0 source; verify them against your received baseline:

- `sim.js: craftMaterialRecipe` still performs material-recipe input/output conversion synchronously after knowledge, equipment, and resource gates. Having an equipment gate does not make refining a timed process.
- `sim.js: evaluateNewBusinessOperationsDaily` calls `advanceFreightContract(..., { completeAllSteps: true })`, including immediately after accepting some freight work. It also calls `advanceServiceOrder(..., { completeAllSteps: true })`. Multiple operational transitions can therefore collapse into one call.
- `sim.js: advanceSoftwareProject` can use `options.minutes || proj.requiredDevMinutes`, granting the entire development effort when no explicit minutes are supplied. The autonomous daily caller does not supply real developer labor minutes.
- `plant.js` implements actual labor fractions, shared equipment slots, passive holds, temperature targets, wear, energy, installation and repair, but routes remain product-family abstractions. Repair parts are represented by three generic materials and wear is largely a shared linear rule.
- `feedLivestockHerd` can generate milk/manure during a feeding call rather than through an independently elapsed biological production cycle.
- World corporations and national economies use aggregate daily operations, demand budgets, technology indices, and policy formulas. They are less granular than the player's company.
- New `commerce` contracts reserve actual buyer/government funds in `externalWorld.living.commercialEscrows`, but older sales, service, software and freight arrangements are not all funded from those counterparties.

Trace production callers, not just helper definitions. Removing a flag from one function while another autonomous path still completes work instantly does not solve the problem.

## Required workstream 1 — Timed material processing and intermediate production

Upgrade all existing material recipes to executable, time-dependent workflows appropriate to their process. Cover the current 40 recipes, and extend definitions when justified.

Define process specifications with appropriate fields such as input quantities and units, material grades, equipment class, tooling/setup, operator disciplines, active labor, passive/machine time, batch capacity, temperature or other relevant conditions, utilities, expected yields, byproducts, waste, quality checks, and release criteria. Not every recipe needs every physical parameter; each declared parameter must be used.

Implement a lifecycle such as planned → inputs reserved → staged → loading/setup → running → unloading → inspection → released/rework/scrap. Allocate actual personnel and equipment. A batch cannot consume unreserved stock twice, start without its tools, occupy infinite machine capacity, or appear in usable inventory before release. Preserve physical ownership and valuation through WIP, cancellation and interruption.

Use sensible mass/count balances and variable yield where appropriate. Manage byproducts and waste as real quantities with destinations. Prevent free raw-resource creation and circular crafting arbitrage. True natural deposits differ from crops, seeds and processed inputs. Purchased flour, sugar, paper and refined metal must retain valid production/supplier provenance.

Maintain make-or-buy decisions: NPCs may buy intermediates while missing equipment, know-how, economical volume, or lead time. Owning cash or a resource asset must not grant production technology automatically.

## Required workstream 2 — Time- and resource-bound freight and field services

Remove instant multi-stage completion from normal autonomous execution. A test/debug fast-forward facility may exist only as an explicit isolated tool, never as the production shortcut used to earn money. Prove that ordinary callers cannot bypass elapsed time.

Freight should include feasible quotation/acceptance, dispatch planning, driver and vehicle assignment, travel to pickup, loading, outbound travel, delivery/acceptance, invoicing/payment, return or backhaul, unloading and release. Distance, travel speed, driver availability/rest, cargo weight/volume, loading labor, route conditions and relevant breakdowns must influence actual timing and costs. Avoid booking one driver, truck or cargo unit into overlapping work.

Field maintenance, calibration, EPC, recycling, cold storage, technical training, toll processing and other existing services need their own meaningful workflows. Examples include diagnose → plan → procure parts → travel/site access → perform work → test/certify → return custody → customer acceptance → invoice → payment. Cold storage bills over actual occupancy and time. Certificates require actual measurements/tests. Client-owned goods remain distinct from company-owned stock. Failed inspections and SLA breaches must follow actual events.

Retain all existing no-double-booking, custody, fuel, return-leg and anti-arbitrage invariants. Integrate these jobs with the same workforce calendar used by factory and office work.

## Required workstream 3 — Real software development, QA, deployment and support

Replace default full-effort progress increments with person-hours actually worked by assigned developers and specialists. Support concurrent demand on an employee's time without duplicating their capacity.

Provide an appropriate lifecycle: discovery/requirements → architecture/design → implementation → review/integration → testing → defect resolution → acceptance → deployment → support/maintenance. Tasks have dependencies, skill demands, effort estimates, actual work, and completion evidence. The company needs suitable computers, test environments, licenses or compute where relevant.

Knowledge, aptitude, fatigue, familiarity, teamwork and technical debt should affect productivity and defects. Distinguish an estimate from actual effort. High skill must not erase mandatory elapsed acceptance or deployment steps. Developers can discover scope changes and managers can reprioritize or reject them.

SaaS leads, conversions, retention, incidents and revenue must relate to product usefulness, reliability, support capacity and paying customers. Do not create demand or revenue merely because an application status is `live`. Respect existing milestone-deposit/unearned-obligation accounting and prevent collecting the same milestone twice.

## Required workstream 4 — Product-specific production engineering

Audit every existing product and replace inappropriate one-size-fits-all routing where needed. Bakery products, cultured foods, medical consumables, electronics, mechanical assemblies, batteries and energy equipment require different process logic, not just renamed copies of three identical steps.

Define routing/BOM versions and distinguish process order, operation eligibility, setup/changeover, tooling, batch size, compatible machines, labor time, cycle time, wait/curing time, quality checkpoints, rework paths and lot-release evidence. Intermediate output from one operation must be the actual prerequisite for the next.

Use machine capacity and material-handling capacity to generate genuine bottlenecks and queues. Consider batch versus continuous or unit assembly where appropriate. A single oven batch should not pay the full machine electricity separately for every item sharing that cycle, and a shared machine must not heat multiple times faster just because more jobs reference it.

Link operator-specific learned disciplines to the actual task being performed. A team having the right knowledge somewhere does not make every worker equally qualified. Unqualified staff may train, assist under supervision, or do another task; they cannot bypass safety-critical or quality-critical work.

## Required workstream 5 — Equipment engineering and a meaningful technical workforce

Extend machinery and tools across relevant businesses, including kitchens, laboratories, offices, warehouses, transport, farms and service teams. Small firms may use appropriate manual tools; do not require absurd capital equipment for basic work. Advanced operations must not be possible with generic hand tools.

Distinguish commissioning, operation, cleaning, calibration, changeover, preventive maintenance, condition-based maintenance, breakdown repair and acceptance testing. Installation complexity and delivery lead time should fit equipment scale. Include economical acquisition choices when useful: purchase, lease, used equipment, outsourcing, OEM support or external contractors.

Represent credible fault modes and diagnostic evidence rather than one universal health percentage deciding everything. Technician knowledge, multiple Human Core aptitudes, experience, fatigue and available diagnostic tools should influence fault isolation, work duration, mistakes, repair quality and recurrence. Never alter the immutable core formulas.

Specify suitable spare parts, consumables and compatibility. Model parts procurement, shortages, maintenance reservations, equipment downtime, safe shutdown, return-to-service testing and service records. Repairs may fail, uncover another fault, or require an external specialist. A different title alone must not confer competence.

Training must use the real learned-subject system and prerequisite chain; practical work should develop expertise through that system. Do not grant instant knowledge to unblock machinery. NPC management should consider training, recruiting, subcontracting, postponing, or buying the intermediate externally.

## Required workstream 6 — Physical inventory, lots and internal logistics

Extend warehouse limits into usable location/lot/material-handling state. Distinguish raw material, reserved stock, staged material, WIP, quarantine, rejected goods, released finished stock, customer-owned goods, and goods in transit.

Where relevant, track batch/lot identity, provenance, grade, quantity/unit, production/expiry dates, storage requirements, cost basis, reservation owner and genealogy. Implement appropriate FIFO/FEFO, inspection and release policies. Cold-chain protection depends on functioning storage, actual conditions, capacity and time.

Movement between receipt, storage, processing, inspection and dispatch should consume appropriate worker/equipment time. Avoid teleporting goods between operations. Use sensible aggregate moves and batch handling to keep the game performant; do not simulate a separate walking NPC for every screw.

Support production planning against demand forecasts, replenishment policies, safety stock, economic batch sizes, shelf life, cash and storage constraints. Managers may choose make-to-stock, make-to-order, or a hybrid depending on personality and circumstances. Overstocking should have carrying costs and risks, not guaranteed buyers.

## Required workstream 7 — Commercial execution, counterparties and public procurement

Continue the existing inventory-sales and funded installment-contract foundation. Large contracts should result from actual buyer demand, budgets, supplier capability and negotiation, with bounded production releases instead of thousands of active unit objects.

Add meaningful quotation, sampling/prototype approval, qualification, negotiation, credit terms, purchase orders, schedule commitments, delivery/acceptance, returns, disputes and payment. Assess feasible capacity and working-capital exposure before NPCs commit. Model late delivery, failed acceptance, partial delivery, renegotiation, contract variation and orderly termination when a company cannot deliver. Avoid permanently stuck obligations with no decision path.

Expand public purchasing into understandable tender/procurement stages with eligibility, specification, budget, submission deadline, bid preparation effort, evaluation, award, performance security where appropriate, inspection, acceptance and payment. Introduce actual competing suppliers when claiming a competitive tender. Do not generate fictional bids/winners as news without corresponding actors and consequences. Use a coherent game abstraction rather than claiming full compliance with any real country's law.

Bring remaining legacy product/service/software/freight contracts onto consistent counterparty funding and accounting boundaries where appropriate. Track receivables, deposits/unearned obligations, escrow, customer assets, refunds, bad debt and payment delays distinctly. Use actual integer-satang ledger postings and explicit transfers. Revenue, cash receipt, inventory value and accounting profit are different concepts.

## Required workstream 8 — Biological resources and external-world causal depth

Farming and livestock must evolve over elapsed time with appropriate labor, land, planting stock/animals, water, nutrition, health, environmental conditions and production/reproduction cycles. Feeding is an input activity, not an instant manufacturing button for milk. Preserve realistic seed/propagation loops and finite resource reserves. Integrate harvest handling, spoilage, grading and storage with the same inventory/logistics system.

External firms should follow compatible production, capacity, workforce/knowledge, logistics and financial constraints at an appropriate level of detail. A hierarchical/aggregate simulation for distant actors is acceptable if its flows and obligations are explicit and conserved. Do not claim they operate fully detailed factories or NPC populations unless implemented.

Strengthen actual supply/demand formation, replenishment and trade. Government budgets, taxation, spending, credit conditions, trade restrictions and international cooperation should produce traceable economic effects. Distinguish cash-flow surplus from accrual profit/COGS and distinguish policy assumptions from empirical real-world claims.

Do not require wars, elections, bankruptcies or expansion in every run. Outcomes should arise from state, decisions and contingencies, with deterministic seeded uncertainty where appropriate. Events must have identifiable actors, causes, duration, resource/financial impacts and aftermath.

## Cross-system architecture and invariants

Design reusable operational primitives where useful: work orders, routings/operations, batch/lot records, resource reservations, calendars, queues, equipment occupancy, transport legs, inspections, contracts and financial events. Avoid implementing eight incompatible progress-bar systems. Keep modules focused; `sim.js` is already large, so extract cohesive components when justified.

- Simulation owns authoritative time, state, RNG and money. UI/rendering reads immutable snapshots and sends validated commands. Opening a window must not advance work, initialize simulation state, spend money, or consume RNG.
- Advance work from fixed simulation ticks or scheduled simulation events, never from UI refreshes, real-clock timers, or the number of times an API is called.
- A person's labor-minute budget, a machine's occupancy, and a vehicle's availability cannot be spent twice. Passive processing may continue without tying up an operator, while still occupying its machine and consuming relevant utilities.
- Reserve before consumption; account for WIP, in-transit assets and customer custody; release reservations safely on cancellation/failure. Require idempotent completion and payment transitions.
- Preserve material/count/energy accounting at the abstraction level claimed. Post real financial transfers and reconcile counterparty budgets. No automatic stock refill or income without a documented source.
- Preserve the slower observation pacing introduced in v2.5.0: baseline 1× is two simulated minutes per real second, and walking uses the current eight-cell bound per five-minute tick. Improve operational travel sensibly without making the day rush past again. Do not change pacing incidentally while changing process timing.
- Preserve the current offline standalone delivery model, mobile usability, and reasonable scaling up to the project's supported NPC counts. Keep long-term contracts/batches aggregated where necessary. Benchmark representative operational load, not only an empty scene.
- Current-version saves must retain queues, reservations, in-progress work, passive timers, faults, custody, shipment positions, contract obligations and accounting evidence. Validate before replacing a running game. Do not add mandatory cross-version migration work beyond AGENTS unless specifically authorized.

## Observability and player-facing UX

Make the process visible in Thai, using technical details only where they help the player understand a decision or blockage. Extend the existing Company, World and character windows rather than burying essential information in unrelated menus.

The player should be able to inspect:

- What an NPC is doing, which task and location they are assigned to, and why another task was rejected.
- What a batch is waiting for: material, qualified operator, setup, machine, transport, temperature, inspection, storage space, customer acceptance or payment.
- Which resource is the bottleneck, what a manager decided about it, and what happened after that decision.
- What the technician diagnosed, which parts were needed, the repair/test outcome, and the resulting downtime.
- Forecast commitments versus actual capacity, warehouse lots and their genealogy, shipments, contract installments, budget/escrow, overdue receivables and actual profit/cash movements.

Display reasons derived from actual decision records and state. Do not append generic personality excuses or invented operational news. The player should be able to change personality, subject proficiency, money or inventory through the permitted Edit Hub and observe different feasible responses, without a guaranteed single outcome.

## Creative authority and implementation strategy

You are explicitly expected to think beyond this brief. Identify missing dependencies, contradictions, exploits, opportunities and awkward player experiences. Design additional ideas yourself, improve weak suggestions, and resolve implementation details without asking the non-technical user to be the designer. Explain important choices and tradeoffs in the update report.

This document establishes the goals and invariants, not a rigid catalogue of implementation details. Reorder and combine workstreams according to dependencies. Implement an end-to-end working slice first if helpful, but continue through the entire authorized scope; do not ship a small first phase as if the complete overhaul were finished. If context or execution limits prevent finishing, deliver a working, honestly labelled partial result plus an exact continuation record; do not silently mark the rest complete or remove it from the active work register.

Research unfamiliar real-world workflows using reliable technical/industry sources when tools permit. Cite what informed the design, and separate sourced process facts from game parameters. If internet access is unavailable, disclose that and avoid pretending research occurred. Add learned subjects using the existing subject template when required, with actual prerequisites, aptitude effects and work applicability; avoid knowledge entries that have no behavioral effect.

## Verification and acceptance criteria

Use the repository's actual check/test/build/browser commands. Add behavioral and integration tests that distinguish a real causal process from a renamed instant operation. Do not weaken, delete, or indiscriminately update assertions merely to make the suite pass. Where old tests intentionally exercised instant behavior, revise their scenario around the new contract and explain the change.

At minimum, demonstrate:

1. A material-processing batch cannot yield usable output immediately after submission. Insufficient inputs, unavailable machinery, missing qualifications and interrupted utilities produce actual waits or failures. Downstream orders remain blocked until release.
2. Concurrent batches cannot exceed machine, operator or storage capacity. Shared equipment power/thermal behavior is not multiplied incorrectly by referencing jobs. Cancellation cannot duplicate stock, refund consumed materials, or leave dead reservations.
3. A freight contract cannot finish outbound travel, customer delivery and return travel at the same simulated timestamp. Driver rest, loading, vehicle faults and route delays change actual delivery/payment times.
4. Service certificates, recycled output, EPC completion and revenue require the underlying timed work, custody transitions and acceptance. No production autonomous caller uses instant `completeAllSteps` shortcuts.
5. A software project with zero qualified developer time makes no implementation progress. Better or worse staff change completion/defect outcomes under otherwise equal conditions; deploying with unresolved issues has genuine downstream costs.
6. Technicians with different relevant knowledge/aptitudes diagnose and repair differently. Missing parts, missing expertise or failed commissioning prevent release. Training follows prerequisites and does not mutate Human Core.
7. Warehouse lots/WIP/in-transit/customer-owned goods reconcile across receipt, processing, scrap, return, sale and save/load. A full or unsuitable warehouse affects real operations.
8. Large B2B/public contracts have actual demand and funded buyers, realistic bounded releases, acceptance and payment. Qualification/budget failure prevents award. Late/failed obligations have an autonomous resolution path. Payments/refunds are never duplicated.
9. Feeding/planting/harvesting cannot bypass biological elapsed cycles or generate free unlimited resources. Outside firms respect the same declared conservation boundaries.
10. Same seed and commands produce the same outcome. Opening all UI windows or changing render speed leaves simulation decisions unchanged. Saving and loading mid-operation reproduces continuation, including faults, holds, transit, contracts and escrow.
11. Multi-day, multi-seed autonomous scenarios require no routine player intervention. Include normal, capital-poor, skill-poor, supply-shocked and high-volume cases. Record actual successes, stalls, failures and reasons rather than forcing every NPC to diversify or every contract to succeed.
12. Mobile and desktop UI expose the true operational state without uncaught errors or unresponsive performance. Verify source build and the delivered standalone aliases match.

Report the actual environment, commands, results, observed operational behavior and limitations. Existing baseline evidence is 177 unit tests and 12 browser tests; these are historical reference counts, not predetermined targets or proof of your patch.

## Mandatory documentation, skills and ZIP handoff

Before completion:

- Write a substantive patch/update report with the received baseline, release, rationale, files added/changed/removed, cross-system effects, self-generated improvements, actual verification, complete/partial/deferred work and known limitations. Produce reports for subsequent updates too; never rely on chat history as the only record.
- Update both current project-status copies, README/onboarding, affected API/system documentation, active work register and handoff notes. Move implemented ideas into project status; retain unimplemented work as clearly labelled proposals/remaining scope. Keep the root `ACTIVE_PROMPT.md` easy to find and mark its true execution status.
- Update **both** repository master skills (`company-evolution-dev`, `company-for-every-patch`), their root copies (`SKILL.md`, `SKILL_COMPANY_EVOLUTION_DEV.md`, `SKILL_COMPANY_FOR_EVERY_PATCH.md`), all affected `.agents/skills` domain skills and indexes against the actual source and evidence. Do not raise a starter's maturity merely by renaming it.
- In the Gemini app, update the two corresponding installed app-local skills as well if its tools support it. Repository copies do not synchronize the app automatically. If app-local updating is inaccessible, prepare exact replacement files/instructions and clearly mark that channel as pending; never claim both locations were updated from repository changes alone.
- Return a **complete editable Company project ZIP**, not only a standalone HTML, diff, screenshots or report. Include source `index.html`, JS/CSS/assets, package manifests/lockfile, tools/tests, all rebuilt standalone aliases, `AGENTS.md`, hidden `.agents/skills`, system/status/ideas/report/handoff documents and all referenced necessary files. Exclude `.git`, `node_modules`, caches, nested ZIPs and unrelated games.
- Use one project root and explicit directory entries, including hidden skill directories, so mobile file managers expose the structure. Keep valid relative paths.
- Close the final ZIP, reopen that exact artifact, validate central directory/CRC, filenames, traversal safety and required files, and compare hashes with the intended project. Extract it into a fresh directory and run relevant check/test/build commands from that extracted source. If the artifact changes, repeat verification of the new artifact.
- Provide a manifest with the received baseline and delivery version, file changes and hashes, plus final ZIP size and SHA-256 separately from the archive. Distinguish packaging integrity from actually verifying a receiver's downloaded copy.
- Supply a concise continuation note and ready-to-use handoff prompt so another agent can continue without asking the user to reconstruct the technical context. Do not claim GitHub was updated if you only worked from a ZIP; Codex/Agy will integrate the returned ZIP against the latest repository.

The final delivery must make it possible to follow an order or business activity from its initial decision, through real work and constraints, to delivery, payment and consequences. Use your judgment and creativity to make that world worth observing.
