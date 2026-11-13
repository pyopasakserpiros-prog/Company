# Gemini app sync — synchronized for v0.3.0 (2026-11-13)

Both installed Gemini app entries `user:company-evolution-dev` and `user:company-for-every-patch` were updated via `skills:update_skill` (`status: "updated"`, 2026-11-13) during the Silicon & Handset v0.3.0 implementation task in the Gemini app environment. Both skills preserve the parent `main` (`COMPANY_SOURCE/`) reference in a separate section while embedding the complete `spinoff-phone` (`SPINOFF_SOURCE/`, v0.3.0, schema 3) master and every-patch workflow.

Branch-specific repository skill copies (maintained in lockstep and ready for standalone import if needed):
- [Spin-off master reference](../.agents/skills/silicon-handset-dev/SKILL.md)
- [Spin-off every-patch workflow](../.agents/skills/silicon-handset-every-patch/SKILL.md)
