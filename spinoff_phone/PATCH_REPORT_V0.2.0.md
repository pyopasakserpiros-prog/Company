> Historical evidence from before branch separation; parent-game results are not current branch validation. See BRANCH_SEPARATION_REPORT.md.

# Silicon & Handset v0.2.0 implementation report

2026-11-13; owner-authorised continuation from `a3635f0ae4c2131bd50df8074f2dfe90f0fcb11d` on main. Release0.2.0/schema2/storage silicon-handset-v020. Parent Company remains3.1.0; AGENTS, HumanCore/lock, shared phone engineering and all parent gameplay/builds are unchanged. The integration commit is the commit containing this report; the external artifact verification receipt supplies its exact SHA.

## Delivered behavior

- Three separately funded consumer cohorts choose among actual released inventory using different measured needs and hard per-phone/remaining-wallet budgets. Value favors price/battery, photography favors low-light performance, apps require usable web performance. Daily segment order rotates; unmet intents do not create cash or free phones. UI exposes actual demand/sales, wallets and per-product cohort results.
- NPCs review target cohort, affordable engineering generation and price weekly, staggered by firm. Decisions use own technology, supplier costs, CEO traits, commercial preferences, funded demand and competing plans. Current projects keep their original design; new projects follow reviewed plans. Unsold stock blocks new investment and lowers markup above an estimated cost floor. Reasons and review dates are visible.
- Sales expertise matters through finite paid commercial work:15% of the same brand work budget, knowledge multiplier0.25 + sales/100,25 units per conversion. It reduces available engineering work and never bypasses inventory or consumer cash. Daily outreach expires. No new player management buttons.
- Two independently seeded suppliers per component role offer different prices and12–72hour delays. Buyers weigh unit cost against patience-weighted delay, split purchases across available stock and pay before shipment. Ownership, generation, actual quantities and payment are retained. Standardized kind:generation specifications are explicitly disclosed; this is not supplier-specific lot quality.
- Schema2 rejects older saves explicitly. Company and0.1 storage remain untouched. Invalid imports preserve the active world; corrupt automatic saves disable autosaving rather than overwrite the stored original.

## Design additions and review corrections

Six extra suppliers make tradeoffs occur in normal worlds rather than only a special supplier-start fixture. Finite sales effort gives learned expertise a real constraint without cloning labor. Cohort order rotates to avoid permanent settlement priority. The previous “always highest generation” test fixture now specifies a funded performance target, preserving the actual qualified-supplier/independence assertion while allowing deliberate economy products.

Self-review traced creation → plans → paid procurement/transit → prototypes/WIP → release → household transfers → wages and saved continuation. It found repeated prototype purchases after inputs were consumed; procurement now stops once reserved. It also caught a zero-patience falsy fallback and corrupt-autosave overwrite risk. Focused tests cover these boundaries. A subsequent independent narrow code review found that missing engineering task scores could pass import and crash resumed consumer settlement. The load audit now requires finite bounded call/web/game and low-light scores; a dedicated corrupt-save/valid-continuation regression passes. The reviewer rechecked the fix (one focused test passed) and reported no remaining blocker within that review scope. This is code review, not physical industrial calibration.

## Actual verification

Node v24.22.1; Linux system Chromium via Playwright. Logs and screenshots: [validation/v020](validation/v020).

| Command / scope | Result |
|---|---|
| Spin-off npm test | **22/22 passed** |
| Spin-off npm run check | Syntax, initial audit/save and locked HumanCore PASS |
| Spin-off npm run build / test:browser | **4/4 passed**, source390px and standalone1280px; commercial observation/read purity, current/old save safety, mobile150% zoom and corrupt autosave preservation |
| Spin-off tools/soak.cjs | Five365-day full hourly worlds; daily money/raw/component/WIP audit and monthly save validation PASS |
| Parent Company npm test | **236/236 passed** |
| Parent Company npm run check / build | PASS; parent game source/build unchanged |
| Parent Company npm run test:browser | **17/17 passed** |
| Parent Company tools/benchmark.cjs | PASS;500NPC mean0.854ms/tick; simulation-only Node measurement |
| Integrity | Protected-file hashes equal baseline; status/master mirrors identical; git diff --check PASS |

| Seed | Phones sold | Observed company produced | Audit |
|---|---:|---:|---|
| dawn | 5026 | 816 | PASS |
| river | 4978 | 780 | PASS |
| silicon | 4872 | 876 | PASS |
| island | 5109 | 264 | PASS |
| horizon | 3974 | 816 | PASS |

Tests cover price ceilings/budgets, different consumer preferences, paid skill counterfactual, weekly clearance/cost floor, patience endpoints, physical split supplier orders/save continuation, malformed commercial records, no-catchup isolated worlds, elapsed-time partitioning, current-save identity and UI purity. No reset of parent saves. Browser testing is Linux desktop at phone/desktop viewports, not physical-phone FPS. Managed Chromium blocks direct file:// navigation by administrator policy (documented environment limitation); standalone was tested through local HTTP with all assets inlined, without bypassing policy. Direct-file execution is not newly certified.

## Partial scope and next work

This is a deeper playable slice, not the full original Empire blueprint. Cohorts are aggregates; finite opening wallets are not a complete income/replacement economy. Weekly targeting is a heuristic, not perfect forecasting. Prices use estimated component/tooling/labor allowance rather than fully allocated actual per-unit profitability. Hardware remains bounded generations and shared grade specifications; supplier-origin quality, detailed fabs/tooling/capacity, repeat contracts and richer social/career/consumer lives remain future work. Paid EMS tooling still uses the original fixed service arrangement, while physical component procurement has alternatives. No politics/carrier/IP/app-store expansion in this patch.

## Documents, skills and delivery

Updated actual spin-off status/API, README/entry pointers, work register, source README, silicon-handset-dev, both Company master sibling notices and all root mirrors, skill index, three identical parent status mirrors, Gemini sync ledger and [handoff](V020_HANDOFF_HISTORY.md). Company domain references were reviewed for scope: their parent APIs are unchanged, so no domain formula/hook rewrite or maturity upgrade is justified. Installed Gemini app copies were not accessed and remain pending sync for these sibling notes. Historical reports and unimplemented blueprint proposals remain available; no proposal is silently declared complete.

Open root Silicon_Handset_single.html, or serve repository root and visit SPINOFF_SOURCE/index.html. For development install dependencies with npm ci and run the commands above. Source imports original parent HumanCore and phone-engineering; the complete editable ZIP must include both source trees, all tracked documents/research/tests/tools and hidden .agents. Final archive CRC/path/all-file hashes, fresh extraction/check/test/build/browser/soak, original/extracted/rebuilt HTML equality, archive size/SHA and exact pushed commit are recorded in the external verification JSON delivered with the ZIP. The archive receipt is external to avoid self-referential hashes. Recipient download is not independently verified from this environment.

## Changed files

No files deleted. Added/modified paths (historical files retained):

- `.agents/skills/README.md`
- `.agents/skills/company-evolution-dev/SKILL.md`
- `.agents/skills/company-for-every-patch/SKILL.md`
- `.agents/skills/silicon-handset-dev/SKILL.md`
- `COMPANY_SOURCE/project_status_and_ai_onboarding.md`
- `README.md`
- `SKILL.md`
- `SKILL_COMPANY_EVOLUTION_DEV.md`
- `SKILL_COMPANY_FOR_EVERY_PATCH.md`
- `SPINOFF_SOURCE/README.md`
- `SPINOFF_SOURCE/Silicon_Handset_single.html`
- `SPINOFF_SOURCE/index.html`
- `SPINOFF_SOURCE/js/sim.js`
- `SPINOFF_SOURCE/js/ui.js`
- `SPINOFF_SOURCE/package-lock.json`
- `SPINOFF_SOURCE/package.json`
- `SPINOFF_SOURCE/test/browser.test.cjs`
- `SPINOFF_SOURCE/test/simulation.test.cjs`
- `START_HERE_FOR_AI.md`
- `Silicon_Handset_single.html`
- `docs/company/AGENT_WORK_STATUS.md`
- `docs/company/SILICON_HANDSET_V020_HANDOFF.md`
- `docs/company/SKILL_STARTER_HANDOFF/GEMINI_APP_SKILL_SYNC.md`
- `era3/project_status_and_ai_onboarding.md`
- `project_status_and_ai_onboarding.md`
- `spinoff_phone/PATCH_REPORT_V0.2.0.md`
- `spinoff_phone/PROJECT_STATUS.md`
- `spinoff_phone/README.md`
- `spinoff_phone/validation/v020/browser.txt`
- `spinoff_phone/validation/v020/check.txt`
- `spinoff_phone/validation/v020/company-benchmark.txt`
- `spinoff_phone/validation/v020/company-browser.txt`
- `spinoff_phone/validation/v020/company-build.txt`
- `spinoff_phone/validation/v020/company-check.txt`
- `spinoff_phone/validation/v020/company-unit.txt`
- `spinoff_phone/validation/v020/integrity.json`
- `spinoff_phone/validation/v020/soak.json`
- `spinoff_phone/validation/v020/spinoff-1280.png`
- `spinoff_phone/validation/v020/spinoff-390.png`
- `spinoff_phone/validation/v020/unit.txt`
