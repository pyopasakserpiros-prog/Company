# Work register

- Codex (`e7dbd0dbdf2ef733d8d5679aeeb036ff0d139284`): dedicated `spinoff-phone` branch separation and `ACTIVE_PROMPT.md` preparation. Results in `BRANCH_SEPARATION_REPORT.md`.
- Gemini (`v0.3.0` implementation on received ZIP `916a5bbfcd092131415905460e04f9ffbcc5a88a57f58cc8db5dee3c5bf451d0`): completed `ACTIVE_PROMPT.md` assignment (Component SKUs `w.skus`, Physical Lots `w.lots`, `LOT_POLICY`, 9-category compatibility & `qualifySubstitution`, Company-Specific R&D Portfolios `f.rndPortfolio`/`w.rndProjects` with rework & sunk costs, Make/Buy/License `f.sourcingDecision` separating infeasibility from prudent refusal, `traceSkuChain` observer UI, and Schema 3 save contract). Verified `check.cjs` PASS, `29/29` unit/UI tests PASS, `build.cjs` PASS (`227,609` bytes), `soak.cjs` 5 seeds × 365 days PASS. Full report in `PATCH_REPORT_V0.3.0.md`.
- `main`: untouched by this spin-off branch task.
- Gemini app skills: updated in the Gemini app environment during this task (`user:company-evolution-dev` and `user:company-for-every-patch`, plus branch skill copies in `.agents/skills/`); see `GEMINI_APP_SKILL_SYNC.md`.
