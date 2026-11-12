# Living external world implementation plan

**Goal:** Replace scheduled random geopolitical/corporate headlines with stateful economies and an observational World UI.
**Authorization:** User requested a complete external-world overhaul and immediate execution; implement in this session.
**Architecture:** `js/world.js` owns aggregate sovereign economies, external company operations, bilateral relations, shipments and market clearing. `sim.js` integrates existing purchase/demand/chronicle boundaries; UI only reads snapshots.
**Stack:** Existing offline JavaScript UMD, deterministic simulation day/seed, integer satang.

## Constraints and design

Keep AGENTS.md and locked Human Core unchanged. Preserve existing catalog nations/blocs and manual scenario commands. Nations/blocs are fictionalized aggregate economic actors, not current real-world forecasts. External companies are aggregate operations, not full NPC campuses. No news without a recorded action. No daily free corporate cash. Preserve cash and material flow equations; bound histories. New saves retain all world state. Policies depend on indicators; elections have terms and approval. Conflict/treaty consequences are bilateral and feed routes, costs and demand. World UI uses Thai labels and nested entity details on phone and desktop.

## Tasks

- [x] Create `COMPANY_SOURCE/js/world.js`: ensure/step/apply/view/validate, finite inventories, cash accounts, production, market purchases, bilateral shipments, policy reviews and diplomacy. Verify conservation, no-capital/no-input failures, multi-day deterministic continuation and idempotent daily steps in `test/living-world-v240.test.cjs`.
- [x] Integrate module into `sim.js`, `index.html`, `api.js`, `save.js`: remove scheduled automatic event/regime rotation and old random corporate news; apply market scarcity to spot prices, purchasing and B2B selling. Keep manual scenarios available. Verify old suites and current save validation.
- [x] Implement World sheet in `debug.js` and navigation in `index.html`: overview, countries/governments, corporations, commodities, diplomacy/routes and chronicle. Entity selectors preserve selection during refresh. Verify mobile and standalone navigation and render purity in browser tests.
- [x] Update relevant skills, project status, APIs, handoff and patch report; build all standalone copies. Run check/test/browser/benchmark, review diff, commit/push main and package complete ZIP; CRC, manifest hashes and extracted-source checks before delivery.

## Review focus

Cash cannot be created by intercompany headlines; bankrupt companies retain reserve/stop operating. Recipe output requires actual inputs. Delayed shipments remain assets in transit, never duplicated. UI reads never advance world/RNG. Unknown/malformed world values rejected before loading. Monthly histories bounded; election/war are not forced every few days. Distinguish modeled aggregate economy from jurisdiction-specific law or agent-level government simulation.
