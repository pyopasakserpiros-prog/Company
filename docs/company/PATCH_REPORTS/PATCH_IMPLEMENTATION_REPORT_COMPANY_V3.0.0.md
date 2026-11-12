# Company v3.0.0 — Era 3 implementation report

Date:2026-11-12. Base:`a2c5514` on main (runtime2.9.0; original gameplay baseline855e183). Delivered runtime:**3.0.0**, save/package0.1.0 and schema unchanged. Owner authorised implementation and creative decisions. AGENTS/Human Core/lock unchanged.

## Result

Phones now have a separate generated physical industry. Outside firms fund research with named staff, obtain real inputs, manufacture components, deliver purchased parts, consume owned CPU/RAM/display/storage/battery/camera/enclosure in assembly, hold finished stock through pilot qualification, then sell from released stock to finite household budgets. The observed SME may remain outside the sector; independent research continues. No player management checklist is required.

The campus CEO can fund a handset division from real knowledge/reserves, enter through enclosure manufacturing from a qualified metal SME, service the semiconductor firm, recruit named professionals with notice, or conditionally acquire an outside brand. These are executable routes with different requirements, not guaranteed actions for every personality. Campus phone research/production credits actual completed jobs; a licence or cash endowment does not create physical devices.

Detailed units, state fields, ownership/cash sequence, source exports and limitations are in [ERA3_PHONE_SYSTEM.md](../ERA3_PHONE_SYSTEM.md). Ready-to-use continuation is in [ERA3_V300_HANDOFF.md](../ERA3_V300_HANDOFF.md).

## Design sources and independent decisions

Used the earlier Era3 multi-AI briefs, `era3/ERA_3_COMPLETE_SYSTEM_DESIGN_BY_AGY.md` and the newly supplied Thai phone-system DOCX. Original documents are preserved. Selected generated designs, supplier dependencies, stable external people, paid research, meaningful task comparisons and observer UI. Rejected example historical timelines as mandatory unlocks, forced bankruptcies, universal SME bans, superlinear research work and unqualified "newer is better" scores.

Added independently: stable zero-defect yield mathematics/mm²→cm² conversion; packaging scrap/cost conservation and actual EMS payments; real purchased prototype samples; smaller complete batches when large batches lack parts; old-chip demand retention; post-build pilot validation/launch stock; finite warranty/retirement cohorts; cost-based pricing/clearance; actual component customs and policy constraints; paid campus enclosure licence/production; profitable-only dividends; public/private phone-news boundary; explicit normal-versus-endowed experimental evidence.

## Scope matrix

| Requirement | Verified delivery / remaining boundary |
|---|---|
| Generated brands/models/specs | Model names and component selection/scores generated from seed/firm/project/supply; initial firms and technical envelopes remain bounded |
| Measurable hardware/OS | CPU cores/GHz/IPC/node/power, RAM/storage/camera/display/battery/thermal/OS constraints, task bottlenecks and predecessor deltas; numerical estimates, not measured physics |
| Real stock/production | Owned raw/components/finished lots, samples, finite transit, consumption, pilot/release/sale; external factories/EMS are aggregate daily batches |
| Supplier businesses | Existing outside firms produce input-consuming phone components; campus enclosure route is playable; full own-company entry into every specialist supplier is unfinished |
| Independent NPC world | Named staff, paid shared work, subjects/learning, knowledge/cash gates, risk/stock choices; full strategy portfolios/information/R&D budgeting are partial |
| People transfer | Salary/vacancy/loyalty/notice, actual hiring charge and retained identity/education; not a complete labour market |
| Accounting/government | Real transfers/customs/cohorts, sector-before-close world history/tax, capital/ownership/dividends; coarse raw valuation/cost allocation and simplified inherited cash-surplus levy |
| UI | Six read-only mobile/standalone phone tabs including actual stock/raw inputs/shipments/people, measured specs and logged Edit Hub experiments |
| Ecosystem | Conditional app-capable OS/hardware evolution; full app economy/carriers/retailers/IP law/exclusivity/capital equipment physics deferred |

## Review findings fixed

Independent reviewer reproduced three integration bugs: external Human Core profiles became mutable after JSON loading; recruited education aliases separated and edits diverged; and phone operations ran after world settlement, so firm history/tax omitted them. Added failing reproductions, then fixed all three and reran checks. Phone work now enters a `World.step` callback before profit/tax/history. Current save load freezes outside profiles and restores recruited education continuity.

Other integration fixes: original quantity retained across repeated commercial renegotiation (a legacy budget mismatch exposed by changed world flows); new `investmentIncome` category permits actual dividends and historical core migration adds only a zero aggregate; no original ledger/cash is rewritten. Acquisition excludes the already-owned campus division. Supplier component receipts/COGS and warranty costs feed division profitability. Live shipping obligations are retained even when historical records are compacted. Multi-component suppliers share one daily production-minute budget across their designs, prioritising lower stock to avoid starvation; a regression failed before this fix and passes afterward.

## Actual verification

- Before implementation: baseline203/203 unit/integration passed.
- Final integrated runtime: `npm test` **230/230**, `npm run check` passed with unchanged core SHA; `npm run test:browser` **17/17**, source/standalone/mobile read purity, generated specs, actual stock and Edit Hub cash-unit checks. Screenshot inspection completed for phone products/stock at390px width.
- `node tools/benchmark.cjs`: Node-only timing across8/30/100/300/500 NPCs. Recorded500mean0.818ms/tick,p951.219ms (not mobileFPS or full phone-industry-year timing).
- `node tools/phone-industry-soak.cjs`: three360day external-sector worlds, daily S.audit/Save.validate. Normal seeds produced24/sold15 and produced25/sold25. The explicitly edited ample-input opening produced574/sold573, generated23designs including19smart designs and4chip blueprints. This test does not simulate360days of full campus life.
- Actual30day campus research and45day enclosure manufacture are separate integration cases; capital-only/missing-staff/no-cash/idempotence/corrupt-lot cases and current save/load continuation are tested.
- All three standalone HTML copies rebuilt from source. Final closed-archive CRC/paths/all file hashes/fresh-extraction checks are recorded in a separate delivery receipt beside the ZIP; read that receipt for the final artifact result, size and SHA. The live-contract retention correction is included in the recorded fresh-extraction test run.

Final delivery CRC/hash/fresh-extraction acceptance is published separately beside the archive. Earlier extracted source also passed its then-current complete suite; the final source additionally includes the shared component-production budget regression.

Evidence: [validation/v300](../validation/v300/README.md). Counts are observed results, not fixed future targets. No physical-device performance, externally measured semiconductor calibration or Gemini app update is claimed.

## Economic limitations observed

Normal stocks support very little phone output over a year while research wages continue. This is a real unresolved economic calibration issue, not proof of balanced or profitable default play. The ample-input run is intentionally marked as an endowment experiment and cannot substitute for normal-world balance. Raw/part grades, producer capital/utility/process capacity, broader supplier competition, information/portfolio decisions and lifecycle accounting need further work. No hidden refills, scripted smartphone date or success guarantee was added to conceal this.

## Files, documentation and skills

New engineering/talent/industry modules, three dedicated test suites and reproducible sector-soak tool. Integrations touch sim/world/economy/save/API, source load order, debug UI/CSS and all standalone builds. Old release assertions now expect3.0.0; the original historical accounting fixture permits only the new zero-valued income aggregate.

Updated the three identical English status files, start/README/active prompt, work register, document/report/ideas indexes, both repository master references and matching root copies, all14affected domain references, guide/handoff and remaining-ideas chapter36. No source/proposal files intentionally removed. A changed-file manifest is kept in validation; the ZIP manifest includes every delivered source/docs/assets/hidden-skill file and hash. Historical app-skill baselines remain archived without pretending they are live app copies.

Reference retrieval checks cover the16canonical master/domain references; starter maturity is retained. **The two Gemini app skills have not been accessed or synchronized.** Their operator must update them inside that app. This patch's code, references and full project package can be handed to that operator.

## Play and continuation

Open root `Company_single.html` offline or serve `COMPANY_SOURCE/index.html`. Click **📱โทรศัพท์** for observer tabs. SME choice sets opening conditions; NPCs choose the rest. Use the clearly labelled Edit Hub experiment to alter money/knowledge/traits and watch outcomes.

Completed foundation moved to project status. Remaining work is in [ideas36](../../../ideas/company/36_era3_phone_industry_remaining.md); original era3 proposals remain historical design inputs. Future work needs fresh user scope, updated affected skills/status/report and a verified complete editable ZIP. A continuation prompt is supplied without automatically authorising another patch.
