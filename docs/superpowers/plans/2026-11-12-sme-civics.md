# SME origins, political institutions and informed NPC decisions

Authorization: user asked to inspect completed Agy work and implement deeper government/trade/business simulation plus startup business choice and natural learning. Base f7167e2/v2.8.0. AGENTS/Human Core remain immutable.

Architecture: keep Agy's production/warehouse/crisis/life systems; add isolated startup.js and civics.js UMD modules. World delegates elections, leaders, ministries, bilateral measures and agreements to Civics; actual quotes/trades apply origin- and commodity-specific policy. Sim owns SME initialization, informed learning/news and decisions; UI remains observational with a new-game business chooser.

- [x] Verify baseline: source/tests and major changes since2.7; record real shortcomings rather than invalidate working features.
- [x] Six SME origins with explicit paid-in-capital/opening-assets/cash reconciliation, leased workspace, bounded crew, only relevant opening know-how/equipment/stock, no complimentary unrelated SaaS/projects. Correct inappropriate startup-product requirements and routes.
- [x] Political leaders/terms/transitions and commerce ministries with staged/effective commodity policies, customs revenue, bilateral negotiations/treaties/waivers, budgeted conflict/ceasefire consequences. Persist and validate; pass actual per-material trade costs and delays into existing pipelines.
- [x] NPC reads limited news according to role/personality/knowledge; records known events and evaluations; influences learning, supplier risk and growth choices. Business origin is a preference, not a permanent knowledge lock.
- [x] World and Company inspection, startup chooser on first entry/new game, save validation and desktop/mobile coverage. Preserve legacy API creation for regression scenarios.
- [x] Full check/test/build/browser/performance, multi-profile/multi-seed runs, docs/status/skills/report/handoff, final ZIP CRC/hash/extracted checks, push main.

Model boundaries: fictional leaders and economic blocs, no claim of simulating real parliamentary law or tactical warfare; aggregate outside firms remain aggregate. No guaranteed diversification/war/election turnover in every run. Reference actual balances and events rather than fabricated headlines.
