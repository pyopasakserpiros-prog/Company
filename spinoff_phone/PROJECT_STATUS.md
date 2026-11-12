# Silicon & Handset — spin-off v0.1.0 status

First playable release, source base9f6e2b8, 2026-11-12. Independent executable in SPINOFF_SOURCE; parent Company remains3.1.0 and its gameplay source is unchanged. The owner authorised this first patch, creative decisions and an independent rival world. Original large blueprints remain ambitions, not a completed feature inventory.

## Play

Open root `Silicon_Handset_single.html` offline. Source development requires this complete repository: SPINOFF_SOURCE imports the original immutable HumanCore and pure phone-engineering module from COMPANY_SOURCE. Source server: serve repository root, visit SPINOFF_SOURCE/index.html. Save key `silicon-handset-v010`, schema1/release0.1.0, separate from Company saves. Never import or delete parent-game saves automatically.

Choose/randomise a world seed and one of seven starting roles: handset SME, chip, memory/storage, camera, display, battery, or enclosure/EMS supply. This sets initial conditions only. Named NPCs choose normal business operations. Six Thai observation tabs show people/company activity, rivals, measured products, inventories/queues, events and Edit Hub. Time controls pause/1x/5x/20x and advance-one-day are observation tools.

## Implemented causal loop

Each seed generates4–8 rival brands, six supplier firms and the observed company, varying cash, team sizes, paid opening stocks/resources, core profiles and specialist knowledge. All start with feature-phone technology. No rival capability is computed from the player's capability, cash, victories or losses. Rival progress can diverge strongly because it depends on its own team, funds, inputs and work. Real market competition and recruiting may legitimately affect another firm's resources; the no-catchup test isolates these interactions rather than banning them.

Persistent named people reuse the unchanged Company HumanCore: personality, values, aptitudes/potential and needs. Their hourly sleep/meal/commute/work/rest schedule, condition and phase-specific subjects influence available work/learning. Daily wages and paid meals transfer real cash. Research, prototype validation, assembly and specialist roles use relevant knowledge; the sales subject is stored but does not yet influence retail demand. This first version does not recreate every parent-game relationship/career feature.

Suppliers consume finite processed input units into persistent WIP and produce actual component stock. Paid upstream orders have shipping delays. Brands pay suppliers, wait for specific generation parts, consume real prototype parts, validate, procure batches, use paid EMS tooling, work through pilot/assembly/release and sell from finished inventory to finite household cash. Failed validation requires paid timed redesign and a new prototype. Material audits reconcile raw stock, transit, consumed material, prototype losses, WIP, finished components/phones and sales. Paid opening stock is explicit; no invisible recurring subsidy/refill.

R&D uses shared paid work and lab/tooling cost with cash-reserve gating. CPU/parts/OS measurements reuse phone engineering: GHz/cores, RAM/storage, camera, battery/thermal and task scores. Designs differ by supplier/technology/seed. Component-specific bespoke R&D and sophisticated strategic portfolios remain future work; knowledge mostly influences effort rather than unrestricted hardware invention.

Companies can recruit unemployed specialists or poach an employed engineer through autonomous salary offers, personal acceptance, notice and post-move cooldown. Transfers preserve identity/profile/subjects, remove former employer capacity and add it to the new team. The observer influences conditions through logged cash/individual subject/trait experiments, not a required manual hire button.

## API and invariants

UMD `SiliconSim` / CommonJS `SPINOFF_SOURCE/js/sim.js`: create(seed,{role}), advance(world,minutes), snapshot(world), command(world,c), serialize/deserialize, audit(world). `audit` returns `{ok,errors}`; `command` returns true or throws. Monetary values are integer satang. Snapshots clone state and do not mutate RNG/time. Advance retains minute-level display but settles only fully elapsed hours;60minutes equals12calls of5minutes. Save loads validate references/ownership/process requirements/material reservations, reject duplicate WIP and refreeze profiles.

World arrays: firms, people, designs, shipments, WIP, offers, events. Snapshot also exposes wip alias. Company stocks use kind:generation keys; designs retain measured chip/parts/evaluation and actual inventory/produced/sold counts. People carry stable employer IDs/subjects/core/state. Audit checks money total against opening+logged experiment capital and physical conservation. Startup stocks are paid opening endowments, distinct from free normal output.

## Explicit limits

This is the first playable vertical slice, not the whole Empire blueprint. Work is hourly; rendered campus is an activity diagram, not the original full pathfinding campus. Seven business roles and three bounded research increments; no global player-relative locks, but content is finite. Upstream uses aggregate processed-input units and paid tooling; it is not a detailed mine/refinery/wafer-fab simulation or realistic industrial NRE calibration. No multi-country politics, carrier finance, patent litigation, full app store, keynote/media ecology, extensive warranty/repair economy or complete social/career system. Household demand is an aggregate finite-budget ranking, not individual consumer lives. No physical-phone benchmark or mobile-device FPS certification.

## Verification / next work

Run npm test/check/build/test:browser inside SPINOFF_SOURCE; tools/soak.cjs runs five full spin-off worlds×365days with daily audits/monthly save validation. Browser tests cover source390px and standalone1280px, read purity, Edit Hub units, separate storage and30day continuation. Parent Company regression is checked separately. Exact results and review fixes: PATCH_REPORT_V0.1.0.md and validation/v010. Archive acceptance/size/SHA are supplied separately with the final ZIP.

Next priorities: richer firm-specific product targets and consumer segments; actual supplier tooling/process economics; supplier diversification and repeat contracts; deeper subjects/relationships; owned capacity vs outsourcing; broader technical envelopes. Retain independent rivals and no catchup. Every patch updates this status, affected skills, report and verified full editable delivery.
