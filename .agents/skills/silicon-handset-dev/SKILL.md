---
name: silicon-handset-dev
description: Use when developing, reviewing, testing or delivering the Silicon and Handset spin-off executable or its autonomous phone-industry systems.
metadata:
  intended-project: Silicon-Handset
  maturity: source-backed-reference
---
# Silicon & Handset development reference

Read AGENTS, spinoff_phone/PROJECT_STATUS.md and latest spin-off report first. Parent Company3.1.0 and spin-off0.1.0 are distinct executables, saves and status documents. Do not replace Company root master references or mutate its locked HumanCore. Source imports ../../COMPANY_SOURCE/js/human-core.js and phone-engineering.js; offline build inlines them. Preserve the immutable core hash and copy-free source ownership.

SiliconSim create(seed,{role}), advance(world,minutes), snapshot, command, serialize/deserialize and audit are in SPINOFF_SOURCE/js/sim.js. Audit returns {ok,errors}, command true/throws. Allcash integer satang; world minute display settles only completed hours, partition-invariant. Firms/people/designs/shipments/WIP/offers/events are persistent arrays. Snapshot clones state. UI state/timing RNG may choose a new seed; rendering must not consume simulation randomness or change work.

Generate rival firms/resources/people independently from seed. Never use player capability/fortune to set competitors. Commercial and recruitment interactions may legitimately affect them. Isolate these flows when testing independence rather than demanding identical market outcomes after changing player purchasing.

Stock keys kind:generation, finite paid upstream shipments, prototype consumption, shared work, WIP reservations and finished stock precede sales. One active WIP per firm. Projects need valid stage-specific requirements/design/owner/level. Reject missing requirements/duplicate WIP on load. Refreeze retained profiles. Paid timed redesign consumes fresh prototype inputs. Recruiting requires accepted offer/notice, preserves identity/education and removes former capacity. Check no doublework/doublecash/output, including rejection/idempotence.

Run npm test/check/build/test:browser in SPINOFF_SOURCE, node tools/soak.cjs OUTPUT.json and appropriate parent regressions. Browser deps/devices must be reported honestly. Rebuild both spin-off standalone aliases. Full ZIP includes parent shared dependencies, hidden skills/docs/tests/tools; exclude .git/node_modules/cache/nestedZIP. Reopen CRC/path/hash, extract fresh and run tests/check/build/browser; publish artifact SHA separately.

Known limits: hourly activity schedule, three research increments, aggregate processed-input/tooling/household models, unused sales subject, no full original campus/career/politics/carrier/IP/app ecosystem. Update source-specific references/status/report every patch; reference retrieval and runtime tests are not new skill-mastery or Gemini-app certification.
