# SME origins, governments and informed decisions — v2.9.0

Implemented from Agy baseline `f7167e2` (v2.8.0), preserving its bottleneck/crisis resolution, comparison worlds, watchlists and human-life systems. See [status](../../project_status_and_ai_onboarding.md) and [report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md).

## Starting a company

First entry and New Company open a chooser while time stays paused. `CompanyStartup.list()` provides six origins: food kitchen, bakery, cable assembly, metal assembly, software agency, field repair. The player chooses an origin, not daily management duties. `S.create(seed,{autonomous:true,startingBusiness:id})` configures the same simulation through `startup.js`; legacy calls without `startingBusiness` retain the old test/scenario opening, not the new player flow.

Opening capital (integer satang) = remaining cash + purchased opening tools + BOM stock at catalog cost + 30-day rental deposit + registration/preparation costs. Each origin has 3–5 relevant people, salaries, a leased workspace and limited existing professional experience. The campus drawing is a shared site, not free ownership of all its industrial buildings. There is no gifted software project, launched SaaS or subscriber base. Software has one paid development workstation. Listed opening know-how represents pre-founding professional preparation; new products still require qualified people, prototypes, time and process validation.

| Origin | Paid-in capital (THB) | People | Opening operation |
|---|---:|---:|---|
| Food kitchen | 100,000 | 4 | Chili paste, purchased ingredients |
| Bakery | 140,000 | 5 | Bakery product, purchased flour, real oven |
| Cable workshop | 150,000 | 5 | Cable assembly from bought components; no chip fab |
| Metal workshop | 280,000 | 5 | Bought profiles/sheet, mechanical pressing/inspection |
| Software agency | 120,000 | 3 | Client-funded project, no ready SaaS |
| Field repair | 150,000 | 4 | Maintenance visits with tools and finite spare parts |

`B.REQUIREMENTS` fixes inappropriate inherited family gates: chili uses food formulation/safety instead of bakery; cable assembly uses electrical/assembly knowledge instead of IoT firmware; mounting rails/suspension/battery trays use machining/metrology/safety instead of electronic control programming. `plant.js` maps metal routes to mechanical operations.

## Natural learning and growth

`reviewSmallBusinessLearning` at 10:35 every third day considers wages reserve, CEO openness, work/quality pressure and actual read news; it nominates a learner and resolves prerequisite courses through `plantHooks.train`. It does not gift knowledge or lock other subjects. Ordinary study/practice still determines progress from Human Core aptitudes, state and subject rules. A closed-minded executive may postpone learning. `startup.learningHistory`/`decisionTh` explain actual decisions.

`evaluateSmallBusinessDaily` at 11:30 considers cash above 14 days' wages plus a working buffer. A software origin can seek one active project at a time from distinct operating clients, with a seven-day commercial review interval, at least 2,400 effective development minutes and 480 QA minutes. Field repair selects its relevant service when the prior job finishes. All service selection now weights subject coverage, parts and net margin rather than choosing the largest nominal fee regardless of qualification.

Physical diversification from software/service origins requires half the target team knowledge, CEO risk above 65, and cash above 2.5 times opening capital before evaluation; actual product qualifications and machines still apply. This is a risk/investment filter, not permanent prohibition. Other established business gates are retained. News-derived sector signals adjust R&D attractiveness, without forcing investment.

## Governments and commerce ministries

`civics.js` loads before `world.js`. `W.ensure` creates national political institutions; `W.step` delegates political/diplomatic updates once per simulated day. No real clock or render RNG is used.

Each of the 12 countries/economic blocs has a **fictional** named leader, party/regime, protectionism/pragmatism/assertiveness traits, term, succession history and commerce ministry. Initial remaining incumbent terms end after the existing 120–240 day scenario offsets. Subsequent terms: US 1,460 days, TH/JP 1,080, others 1,440. Performance = approval minus inflation/unemployment penalties; seeded opposition scores compete against the incumbent. A popular incumbent may stay. A losing incumbent changes policy regime and leader; results and vote shares persist. Economic blocs remain aggregate councils, not real constitutional models.

Ministries review actual 30-day cross-border imports/exports and relevant input shortages weekly. Shortage/cost pressure can produce an import waiver; an import imbalance plus protectionist leadership can produce a tariff. Policies specify commodity group, announcement day, effective day (three-day notice), expiry and reason. Groups: food, energy, metals, electronics, chemicals, biological, industrial. Classification uses material IDs/categories, not a formal customs HS database. `C.issueMeasure` additionally supports finite daily export quotas; ministries do not yet autonomously choose quotas.

`C.quote` applies bilateral/commodity policies to actual transactions; a commodity waiver/treaty does not waive unrelated goods. `W.quote` chooses stock-available sellers using landed price, lead time, known country risk and relationship pricing. `S.placePurchase` saves actual origin, customs amount and policy evidence. `W.sellToPlayer` decreases seller stock and splits actual payment into supplier receipts and TH customs revenue; external inter-firm trades use the same policy layer. Domestic Thai warehouse purchases incur no fictional foreign tariff.

## Diplomacy, war and contracts

Trust and tension trigger **proposals**, not instant eternal treaties. Proposed → seven-day negotiation → signed by current leaders → effective after three days → expiry 183 days after signing; tension can reject or suspend. Expiry never extends merely because the quote is recomputed. Signatory names persist after leadership changes. Legacy authored geopolitical scenarios remain supported.

Conflicts record parties, dates, spending and ceasefire. Daily security spending transfers available treasury cash to the aggregate domestic economy; no new money. Infrastructure damage grows by 0.08 percentage points/day to a 35% cap and reduces external productive capacity. Ceasefire does not restore production immediately; paid recovery reduces damage 0.04/day. Routes and shipments retain existing sanctions/war delays and restrictions. This is an economic conflict model, not a tactical military or casualty simulation.

Partner negotiations require at least three actual supplier deliveries, THB50,000 accumulated spending, trust ≥65, executive news exposure and 18 days' wages plus buffer. After seven days, conditions are checked again before calling `setCorporationRelation`. No automatic joint venture or cash-only partnership. Existing competitor corporations, tenders and relationship choices remain in use.

## NPC information and observability

`readNewsTick` offers five minutes of reading between 08:00–08:40 at a seed-specific slot. Role, openness and market knowledge affect participation; analytical/verbal aptitude and market knowledge affect comprehension. Each person remembers at most 16 distinct reports. Only a report actually read by the executive changes company country-risk/sector evaluations; these affect supplier scoring and research preferences. External metadata is used to interpret the report, not to give every NPC omniscience. There is no misinformation or full private-information network yet.

Company overview shows opening assets/capital, lease, learning and executive intelligence. Country panels show leaders/terms, election results, ministries and active/announced/expired measures, customs and security costs. Diplomacy shows staged treaties. Character → News shows that person's actual read reports. Snapshots/UI are read-only; opening a sheet refreshes from the latest snapshot to avoid stale post-simulation building levels.

## Software correctness fixes found during the baseline audit

v2.8 implementation could force a software project to `testing` when the caller omitted `minutes`; a daily caller did exactly that. The daily bypass is removed. Omitted/invalid developer minutes now fail; tick processing records qualified, non-double-booked developer time. QA cannot advance before actual tester time. Missing cloud/QA funds stop the stage. Deposits/UAT/final payment require real counterparty funds, not just a player-side receipt. Milestone accounting fixtures now declare explicit labor/test time; the runtime test exercises actual autonomous progression. Broader software scope estimation and project cost allocation remain approximations.

## Verification and limits

Run `npm test`, `npm run check`, `npm run build`, `npm run test:browser` in `COMPANY_SOURCE`. Reproduce the 12-world/30-day run with `node tools/sme-soak.cjs` (JSON stdout). New integration cases: `test/sme-civics-v290.test.cjs`; browser chooser/government/news cases: `test/campus-browser.cjs`. [30-day results](validation/v290/sme-30day-results.json) cover six origins × two seeds, daily audit/save checkpoints. This patch does not claim complete realism for all 42 products, new countries, constitutional/legal systems, parliamentary coalitions, sanctions law, customs origins fraud, full bank/insurer models or individual external employees. These remain proposals, not hidden completion claims.
