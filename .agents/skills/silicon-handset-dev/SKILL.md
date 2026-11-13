---
name: silicon-handset-dev
description: Use when developing, reviewing, testing or delivering the Silicon and Handset spin-off executable or its autonomous phone-industry systems.
metadata:
  intended-project: Silicon-Handset
  maturity: source-backed-reference
---
# Silicon & Handset development reference

Read AGENTS, spinoff_phone/PROJECT_STATUS.md and latest spin-off report first. Parent Company3.1.0 and spin-off0.2.0 are distinct executables, saves and status documents. Do not replace Company root master references or mutate its locked HumanCore. Source imports ../../COMPANY_SOURCE/js/human-core.js and phone-engineering.js; offline build inlines them. Preserve the immutable core hash and copy-free source ownership.

SiliconSim create(seed,{role}), advance(world,minutes), snapshot, command, serialize/deserialize and audit are in SPINOFF_SOURCE/js/sim.js. Audit returns {ok,errors}, command true/throws. Allcash integer satang; world minute display settles only completed hours, partition-invariant. Firms/people/designs/shipments/WIP/offers/events are persistent arrays. Snapshot clones state. UI state/timing RNG may choose a new seed; rendering must not consume simulation randomness or change work.

Generate rival firms/resources/people independently from seed. Never use player capability/fortune to set competitors. Commercial and recruitment interactions may legitimately affect them. Isolate these flows when testing independence rather than demanding identical market outcomes after changing player purchasing.

Stock keys kind:generation, finite paid upstream shipments, prototype consumption, shared work, WIP reservations and finished stock precede sales. One active WIP per firm. Projects need valid stage-specific requirements/design/owner/level. Reject missing requirements/duplicate WIP on load. Refreeze retained profiles. Paid timed redesign consumes fresh prototype inputs. Recruiting requires accepted offer/notice, preserves identity/education and removes former capacity. Check no doublework/doublecash/output, including rejection/idempotence.

Run npm test/check/build/test:browser in SPINOFF_SOURCE, node tools/soak.cjs OUTPUT.json and appropriate parent regressions. Browser deps/devices must be reported honestly. Rebuild both spin-off standalone aliases. Full ZIP includes parent shared dependencies, hidden skills/docs/tests/tools; exclude .git/node_modules/cache/nestedZIP. Reopen CRC/path/hash, extract fresh and run tests/check/build/browser; publish artifact SHA separately.

Known limits: hourly activity schedule, three research increments, aggregate processed-input/tooling/cohort models, standardized generation grades, no full original campus/career/politics/carrier/IP/app ecosystem. Update source-specific references/status/report every patch; reference retrieval and runtime tests are not new skill-mastery or Gemini-app certification.


v0.2.0 source contracts: schema2/release0.2.0, storage silicon-handset-v020; old saves fail explicitly. `segments` wallets reconcile to households.cash, and purchases to design.segmentSales. `consumerUtility(d,segment)` and `supplierQuotes(w,buyerId,kind,level)` are pure exported reads. Internal `reviewStrategy` chooses affordable generation/cohort and prices weekly from own capability/costs, CEO traits and competitor plans. `settleMarket` requires budget, released stock, needs fit and25 effective commercial units per sale. Brand hourly work dedicates15% to sales, weighted by0.25 + sales/100; the remainder funds engineering/research, never double work. Each cohort's unmet demand is observable; salesWork expires daily. Procurement splits actual paid stock among sorted cost/delay quotes; shipment unitPrice, seller ownership and generation persist. Two suppliers per role have seeded80–124.99% base terms and12–72hour delays. Low stock raises price12%. Specs remain standardized within kind:generation, not provenance-specific lots. `firm.strategy`/`procurement`, `design.targetSegment`/`segmentSales`/`priceReason` feed observer UI. Validate shape on import; malformed automatic saves disable overwriting until explicit valid load/new world. See test/simulation.test.cjs commercial regressions and browser.test.cjs observability/old-save/autosave checks; v020 report records actual counts. No player-relative catchup, no normal business command UI, no parent-game save reset.
