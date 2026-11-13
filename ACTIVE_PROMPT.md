# Gemini implementation assignment — Silicon & Handset v0.3 candidate

You are receiving the entire `spinoff-phone` branch as an editable ZIP from the owner. You do not have GitHub access in this workflow. Read AGENTS.md, START_HERE_FOR_AI.md, BRANCH_LAYOUT.md, current status, the dedicated master/workflow skills, source, tests and the latest separation report before changing anything. Record the received archive hash and base. Runtime baseline is 0.2.0, schema 2, not Company 3.1.0. This prompt authorizes the next implementation when the owner hands it to you; preparation of this branch does not mean Gemini has received or started it.

## Goal and decision authority

Create a living electronics industry in which components are actual differentiated products and companies research different things for intelligible reasons. The owner is not a programmer. Take initiative: investigate the entire causal loop, invent useful solutions, choose architecture, design, scope and tradeoffs, implement, test and deliver a complete playable patch. Do not merely answer this checklist or return a proposal. You have broad creative authority within the owner's invariants. Improve deficiencies you discover within scope and explain your decisions. Blueprints are ambitions and adjustable proposals, not compulsory technology ladders or proof of completed features. Do not claim the entire blueprint is finished.

Preserve observer-only Thai gameplay, human identity, autonomous business decisions, finite resources, consolidated accounting and independent competition. Never edit AGENTS.md, HumanCore bytes/formulas or its immutable hash/config. Existing Company-named globals inside the locked dependency are intentional. Develop outside the core. Use SPINOFF_SOURCE exclusively; do not restore the old Company game.

## 1. Real component identity and provenance

Replace the current `kind:generation` fungibility with explicit component design/SKU identity and physical lots. Trace designer, IP owner/license rights, manufacturer, purchaser/current owner, production lot, revision, qualification and compatible uses. Keep design ownership distinct from manufacturing and stock ownership. A design record is not inventory; possessing money or knowledge is not possessing a manufactured component.

Support CPU/SoC, volatile RAM, nonvolatile storage, camera/optics/ISP dependencies, display/touch, battery/BMS, RF/PCB, enclosure/thermal design and OS/firmware/platform compatibility at an honest level of abstraction. RAM and storage have distinct functions and constraints. Software rights/releases need explicit provenance and costs; do not pretend software is a mined material. Use an extensible schema that can represent these categories without hiding missing implementation behind labels. Generated brands and specifications must vary with seed, people, choices and resources, not a fixed catalogue of prewritten successful phones.

Trace real finite stock through purchase, cash transfer, transit, reservation, prototype consumption, production WIP, release, finished inventory and sale. Preserve the exact SKU/revision/lot used by existing work, transit and orders. A later research success must never upgrade old stock, an in-flight order, a reserved BOM or an assembled phone retroactively. Old products and obligations can continue; substitution must explicitly qualify compatibility, price, ownership and quantities. Prevent double reservations, double deliveries and double payments. Document whether lots can merge and on which identity fields.

## 2. Company-specific R&D portfolios

Replace arbitrary shared three-level research progress with company-owned projects and choices: power efficiency, manufacturing cost/yield, compute performance, reliability, camera quality, thermal envelope, memory bandwidth/capacity, battery life or other meaningful targets. At least three firms must demonstrably pursue different research paths, resulting in different actual products and business consequences, not just different names on the same multiplier.

Tie progress to named people's relevant learned subjects, immutable potential, condition, time and actual paid work; tooling/lab access; money/NRE; prototype inputs; supplier capabilities; and qualification. Research competes with production, support and paid commercial work for real labor. Do not spend the same hours twice. Include failure, rework, prototype loss, delayed qualification, budget exhaustion, stalled projects and cancellation with traceable sunk costs. A probability or simplified equation is acceptable when clearly described; invented values must be labelled game estimates rather than measured engineering data.

Engineering tradeoffs must be measurable and causal. Faster compute can require power/cooling/cost; a camera improvement needs relevant optics/sensor/ISP/software; more RAM is not automatically faster storage; a battery tradeoff can affect size, cost or reliability. Check interfaces, supply voltages, package/enclosure fit, bandwidth, thermal/power budget and OS requirements at the chosen model resolution. Never grant a blanket 'newer is better' bonus or fabricate empirical GHz/FPS/battery measurements. Expose units, assumptions and limitations. Qualification compares a prototype against its target and constraints, not an arbitrary generation badge.

## 3. Autonomous firms, SMEs and people

Retain 4–8 seeded rival brands and a living supplier ecosystem with their own starting information, people, funds, stock, tools, projects and objectives. Competitors may buy, license, contract manufacturing, recruit, acquire capabilities or conserve cash instead of building a fab. A small firm must have viable make/buy/license/contract/acquire alternatives; owning a wafer fab is not a universal progression step. Distinguish fabless IP design, foundry production, packaging/testing and integration, with explicit costs/capacity if represented.

No player-relative catch-up, rubber-banding, rival level floors derived from player success, shared global unlocks, or schedules that force all firms along the same path. Use own evidence, constrained knowledge, CEO priorities and market observations. Real trades/recruitment can affect other firms; distinguish these causal interactions from artificial dependence.

Recruit actual people with persistent identity, profile, subjects, employer, acceptance, notice and capacity loss for the previous firm. Losing a key engineer must matter. Avoid conjuring a replacement expert or transferring a firm's entire IP with a person's name. Explain abstraction of knowledge/IP transfer. Executives select/review/continue/pause/abandon projects, set product positioning and prices, procure stock, honor existing SKU obligations and respond to problems without player approval buttons. Preserve the distinction between infeasibility and a feasible but declined choice.

## 4. Preserve v0.2 economics and trustworthy observation

Keep finite consumer cohort wallets and affordability, actual released-stock sales, paid commercial expertise/work, competing supplier quotes, price/delay choice and procurement splitting where appropriate. No free cash, parts, output, research, demand funding or recurring rescue subsidy. Maintain integer satang and consolidated cash conservation across company, supplier, person and consumer accounts. Track capital experiments separately from operational revenue. Extend physical audits to lots, reservations, losses, shipments, WIP and finished goods, not just totals that could conceal wrong-SKU use.

Build clear Thai observer views that explain who chose what, why, which target/constraints were used, what inputs were paid/consumed, where the order is and what outcome occurred. Let the owner compare firms and follow a named engineer or SKU through the chain. Use accessible mobile/desktop layouts and human names/units rather than requiring JSON or internal IDs.

Edit Hub must show target identity, current value, proposed value and provenance, validate edits, preserve selected targets and record experiments. It may alter permitted individual/world conditions, never locked formulas. Explain effects without promising a deterministic behavior if decisions remain conditional. Read-only views/snapshots/quotes must not mutate RNG, time, stock, projects or cash. No UI-generated excuses unrelated to actual decisions.

## 5. Data and current-save contract

Update version/schema deliberately and keep the spin-off storage namespace separate. Old save migration is not required by AGENTS; explicitly reject unsupported releases without deleting their bytes or silently overwriting invalid autosaves. Validate current saves before replacing live state, including hostile future fields, malformed nested projects, prototype data, owner/license references, unsupported component kinds, invalid numbers, duplicated IDs/reservations, inconsistent lots and manufactured stock. Reject or explicitly sanitize according to a documented contract; do not let unknown imported fields drive privileged runtime paths. Refreeze human profiles after a valid round trip. Test midway through research, qualification, transit and production.

## 6. Acceptance matrix — demonstrate causal behavior

| Scenario | Evidence required |
|---|---|
| No cash / inadequate reserve | No unfunded NRE, order, wage or production; explain feasible alternatives and failed commitment |
| No staff / wrong subjects / key person leaves | Work stalls or slows for the relevant reason; no phantom labor or replacement identity |
| No parts / delayed shipment | No prototype or sale from missing inventory; quantities and ownership reconcile |
| Incompatible parts or OS | Explicit rejection/qualification failure; no generation-grade fiction substituting for interfaces |
| Research improves a new SKU | Old stock/WIP/transit/orders retain original specs and IDs; new batch uses qualified revision |
| Three different firm research paths | Show target, people, expenditure, prototype result, distinct specs and actual business effect |
| Actual SKU transaction | Buyer buys a named seller SKU, seller stock falls, cash transfers, transit arrives, BOM consumes it, finished phone sells to funded cohort |
| Weak observed supplier | Player starts as a weak supplier while rivals independently choose and progress; no artificial catch-up to player |
| No-catch-up counterfactual | Isolate direct trades/recruitment when comparing seeds; changed player capability must not directly set rival technology |
| Labor budget | Research, production and sales share finite paid hours; no double spending; absent sales effort prevents conversions |
| Money and material | Consolidated audits after every relevant operation, failure, cancellation, reservation and delivery; no hidden refills |
| Current-save adversarial tests | Good mid-process round trips; bad/future fields rejected safely; invalid autosave and active world preserved |
| UI purity/accessibility | Mobile and desktop, zoom, keyboard/dialog close, Edit Hub target/current/proposed/provenance, snapshot/hash unchanged by observation |

Run source syntax/core checks, meaningful unit/integration tests, build, browser tests on source and standalone, normal multi-seed long soaks and controlled counterfactuals. Preserve baseline tests unless a documented superseded behavior requires a stronger replacement; never weaken tests to obtain green. Distinguish normal untouched-opening evidence from endowed fixtures. Record seeds, durations, commands, environment, results and failures. If long runs reveal no release/sales, investigate causality rather than fabricating outputs or granting invisible capital. Report limits honestly; browser emulation is not mobile-device FPS and abstract engineering scores are not laboratory measurements.

## 7. Documentation, skills and complete handoff

Every patch updates actual source/API docs, master and affected domain skill references, skill index, root status, README, work register, patch report, ideas and handoff. Mark delivered/partial/deferred accurately; remove completed proposals from the pending list and preserve unresolved ideas. Record decisions you contributed beyond this prompt. This is source-backed maintenance, not a claim of skill mastery.

Update the two Gemini app skills when accessible, using the branch-specific master and every-patch import documents. If unavailable, explicitly mark both unsynced and include ready-to-import documents; repository edits do not synchronize installed app skills. Do not overwrite app content with old Company gameplay instructions or assert synchronization without evidence.

Return the full editable branch as one ZIP with a single root folder: all branch files, SPINOFF_SOURCE and its assets/tests/tools/package manifest+lockfile, both built HTML aliases, immutable core+lock, AGENTS, hidden .agents skills, status/reports/ideas/blueprints and this prompt/history as appropriate. Include directory entries for mobile archive viewers. Exclude .git, node_modules, caches and nested ZIPs. No old Company game payload or dependency symlinks. Close and reopen the final archive, check CRC, safe paths, file inventory and hashes, extract fresh and rerun check/tests/build/browser/soak as feasible. Verify both HTML aliases equal the rebuilt source output. Supply ZIP size and SHA-256 separately, exact received base and changed-file inventory. If an environment policy blocks file:// browser navigation, report it and use authorized localhost tests; do not bypass policy or claim file:// was tested. Keep final limitations and unresolved failures explicit.

The owner downloads the whole GitHub branch ZIP and sends it with this prompt. You return a full ZIP through the app; Codex can later compare received base, returned changes and latest branch before integration. Do not claim GitHub access, push, receipt or that another agent has started. Finish the concrete playable patch and reviewable delivery, not only a design document.
