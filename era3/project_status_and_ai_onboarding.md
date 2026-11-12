# Company Simulation — Current Project Status and AI Onboarding

**Updated:** 2026-11-12. **Runtime:** v3.0.0. **Implementation base:** `a2c5514` on `main`, repository `pyopasakserpiros-prog/Company` (previous runtime v2.9.0). This status is maintained identically at repository root, `COMPANY_SOURCE/` and `era3/`.

## What this game is

Company Simulation / Siam Enterprise is an **autonomous NPC life-and-business world**. Executives and employees decide, learn, work, trade and invest themselves. The player observes, controls time/camera and experiments through Edit Hub; normal management orders or approvals are not required. The owner is not a programmer and enjoys watching different people react differently to traits, knowledge, money and resources. AI collaborators must help design and create, not wait for every detail from the owner.

Read actual `AGENTS.md` before every assignment, then this status, `START_HERE_FOR_AI.md`, the work register/workflow and relevant `.agents/skills`. Do not change AGENTS or the locked Human Core without separate explicit permission. The current implementation authorization does not grant that permission.

## Runtime identity and invariants

| Contract | Current value |
|---|---|
| Release in data/sim | `3.0.0` |
| Save/package version | `0.1.0`; schema `company-foundation-1` |
| Source | Browser JavaScript, UMD/CommonJS, Canvas + DOM in `COMPANY_SOURCE/` |
| Tick / 1× speed | Five game minutes/tick; two game minutes/real second (12 real minutes/full game day) |
| Money | Integer satang, THB1 = 100 satang; real ledgers/counterparties |
| Locked Human Core | 14 traits, 18 values, 30 aptitudes/potentials, 12 states; SHA-256 `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32` |
| Ownership | Simulation owns time, RNG, decisions and cash/stock; UI consumes cloned snapshots |

## Current baseline systems retained

- Six SME origins: food kitchen, bakery, cable workshop, metal workshop, software agency and field repair. Opening paid-in capital, staff/subjects, tools, rent/deposits and stock reflect that origin. No SME starts with every technology or a chip fab.
- 170 learned subjects outside Human Core, prerequisites, individual potential/practice/condition, actual study and target-specific engineering projects/licensing. Knowledge irrelevant to a current business remains learnable.
- Campus life, work/travel/rest, needs, pay, relationships, memories, aspirations, promotion, specialist hiring, career switches, retention and spin-offs. Company/person/knowledge views and accessible Edit Hub exist.
- Legacy catalogues include 64 materials, 40 material recipes, 42 products, 20 equipment types and ten B2B service types. These are registry counts, not guarantees of equal process detail. Timed refinery batches, real labor, machine capacity/condition/faults/repair, services/software/QA, fleet/freight and biological cycles operate at their respective abstraction levels.
- Stock batches, finished lots/FIFO-FEFO/cold chain, paid commercial escrows/deposits/installments, public tenders, deliveries, renegotiation, termination and clearance. NPC crisis responses can recruit, repair, free unstarted reservations and adjust obligations.
- Twelve countries/blocs, 28 initial outside firms, finite cash/stock/resources, household/treasury accounts, trade, transport and prices. Fictional leaders/terms/approval, commerce ministries, commodity measures, treaties, conflicts and recovery affect funded operations. Parliamentary politics, tactical warfare and full population/legal economies are not implemented.
- NPC personal news consumption and risk beliefs affect buying/learning/partnership choices. Observer knowledge is broader than individual NPC information.

## v3.0.0 — Implemented Era 3 phone sector

A distinct physical phone market runs independently of whether the observed SME enters it. Initial outside divisions know feature-phone engineering; opening phone/component inventories are empty. Funded research and compatible supplier designs can generate smartphones. There is no calendar smartphone unlock or fixed finished handset catalogue.

**Generated engineering:** CPU cores/GHz/IPC/node/die area/power, RAM capacity/bandwidth, storage capacity/speed, camera MP/sensor/processing, display/power, battery Wh, enclosure thermals and OS compatibility/overhead are measurable. Bottleneck/task estimates and predecessor deltas show where a model improves or regresses. These are simplified engineering estimates, not real benchmark data.

**Real inventory:** supplier raw purchases → transit/delivery → material-consuming component batches → specific CPU/RAM/display/etc. lots → brand purchases → owned component inventory → assembly/EMS/licence payment → finished phones → pilot qualification → release/household purchase. Missing parts block output, and small complete batches can proceed. Finished inventory can wait before launch. Warranty returns and active/retired customer cohorts have actual money/stock consequences.

**Named outside people:** persistent profiles/subjects/work/pay/loyalty, shared finite engineering time, slow learning, staffing capability and recruitment with notice. Recruitment preserves identity and turns a person into a full campus NPC; the former firm loses that contribution. Current saves freeze profiles and retain recruited education continuity.

**Own company entry:** the CEO evaluates knowledge, personality, tools and cash reserves. A funded handset division uses actual completed campus work and the same purchased-component/assembly pipeline. A qualified metal SME can license an enclosure design and manufacture components using real polymer/metal inputs and a ready press. A repair SME can service a chip firm. Conditional acquisition retains an outside company's team/designs/obligations; dividends require measured operating profit. Full own-company entry into every specialist supplier role is not finished.

**World integration:** component/raw trade obeys route/customs/policy constraints; wages, purchases, taxes, licence/EMS fees, sales and refunds have real counterparties. Phone work runs before world firm profit/tax/history close. The inherited world cash-surplus tax and approximate raw valuation are not full statutory accrual accounting.

**Observation:** the 📱 phone button opens overview, company, products/R&D, supply/stock, market/news and people tabs. These are pure readers. Logged Edit Hub experiments adjust outside cash or an individual's subject/trait; they do not order phone operations. Public events enter World Chronicle without exposing private research starts/failures.

Source/API details and units: `docs/company/ERA3_PHONE_SYSTEM.md`. The original `era3/` briefs remain design history and unresolved ambitions, not proof every proposed system shipped.

## Known limitations and next useful work

Normal opening supply can constrain phone output severely. A deliberately resource-endowed opening proves a later smartphone path but does not establish default economic balance. Supplier raw recipes, process purity, equipment/energy/capital costs and daily capacity remain aggregate. Specialist supplier competition/entry, distributors/carriers, app economy, legal IP/exclusivity/full M&A and detailed lifecycle accounting remain partial or absent. Technical envelopes are bounded, and initial supplier roles are assigned to existing firms. Do not describe this release as a completed replica of the real industry.

Prioritise economic calibration and missing-input observability, then supplier-specific manufacturing and competing technology development, using conservation and actual-work evidence. Preserve legacy businesses and the observer role. Do not force every seed, CEO or firm to enter phones or succeed.

## Verification and delivery

See `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V3.0.0.md` and `docs/company/validation/v300/` for actual commands/results, scenarios and limitations. The initial v2.9 baseline passed 203 tests; this is historical context, not the current test total. Current totals must be read from delivery records.

Run in `COMPANY_SOURCE/` with Node20+:

```sh
npm test
npm run check
npm run build
npm run test:browser
node tools/phone-industry-soak.cjs
node tools/benchmark.cjs
```

Browser checks need Playwright/Chromium. Node timing is simulation-only, not mobile FPS. The sector soak advances world/phone days directly, checks daily audit/save and separately labels an edited resource-endowment fixture; it is not a 360-day full campus-life playthrough. Actual campus jobs are covered by dedicated integration cases.

Play root `Company_single.html` offline, or serve `COMPANY_SOURCE/index.html` with `python3 -m http.server 8000`. All three standalone HTML aliases are rebuilt from source.

## Source map and collaboration

| Module | Role |
|---|---|
| `js/sim.js`, `data.js`, `layout.js` | People/subjects/jobs/autonomy/catalogues/campus |
| `js/economy.js`, `world.js`, `civics.js` | Ledgers, living firms/trade/settlement, governments/policy |
| `js/startup.js`, `plant.js` | SME opening, machines/processes/maintenance |
| `js/phone-engineering.js` | Pure component synthesis/compatibility/thermal/yield estimates |
| `js/phone-talent.js`, `phone-industry.js` | Stable professionals/recruitment; funded physical industry |
| `js/api.js`, `save.js` | Cloned observation/commands and state/reference validation |
| `js/debug.js`, CSS/render modules | Read-only sheets, Edit Hub and presentation |
| `test/`, `tools/` | Tests, checks, builds and reproducible experiments |

Browser load: civics before world; plant/startup and the three phone modules before sim. Use the actual index/build tooling when adding modules.

Codex/Agy access GitHub directly; app Gemini/ChatGPT receive a recorded-base source ZIP via the owner and return a full verified ZIP. Do not overwrite concurrent work; compare base/returned/current main. Both repository master skills, affected domain references, status mirrors, docs and reports must be updated every patch. The two Gemini app skills require an update inside that app by its operator; **app synchronization has not been accessed or verified**.

A full ZIP includes source/assets/tools/tests/manifests, all standalone builds, hidden `.agents/skills`, rules/docs/ideas/status/reports under one root; excludes `.git`, installed dependencies/cache and nested ZIPs. Reopen/CRC/path/hash-check, extract fresh and rerun supported checks/build. Current handoff: `docs/company/ERA3_V300_HANDOFF.md`; outstanding proposals: `ideas/company/36_era3_phone_industry_remaining.md`.

Recent history retained: v2.3 knowledge/company/zoom; v2.4 living world; v2.5 slower time/stock; v2.6 plant/contracts; v2.7 operational processes; v2.8 crises/observability/human depth; v2.9 SME/civics/news; v3.0 physical generated phone industry foundation. Historical patch reports remain in `docs/company/PATCH_REPORTS/`.
