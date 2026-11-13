# Dedicated branch layout and enduring rule mapping

Base: e7dbd0dbdf2ef733d8d5679aeeb036ff0d139284. Owner authorized a new `spinoff-phone` branch, removal of old Company game files here, and standalone spin-off dependencies. Main is not edited or pushed.

| Historical AGENTS reference | Branch interpretation |
|---|---|
| COMPANY_SOURCE | SPINOFF_SOURCE |
| COMPANY_SOURCE/js/human-core.js | SPINOFF_SOURCE/js/human-core.js, identical immutable bytes |
| CORE_LOCK.json | SPINOFF_SOURCE/CORE_LOCK.json, unchanged contents |
| Company tools/test/verify/build | SPINOFF_SOURCE npm test/check/build/test:browser and tools/soak.cjs |
| Company master/domain references | .agents/skills/silicon-handset-dev and silicon-handset-every-patch |
| Company workflow/status/handoff | spinoff_phone/WORKFLOW.md, WORK_STATUS.md, PROJECT_STATUS.md and ACTIVE_PROMPT.md |

AGENTS is preserved unmodified. Tiny historical-path bridge pages exist solely to keep its mandated links resolvable. They contain no old game payload. No enduring rule, formula or checksum is overridden. Existing CompanyCore/CompanyPhoneEngineering global names are preserved to avoid modifying immutable/shared code.

[Exact keep/remove inventory](spinoff_phone/BRANCH_INVENTORY.json) records every original tracked file. Removed scope: Company source and HTML, root Company skill copies and domain skills, Company reports/ideas/docs, unrelated era3 PDFs/DOCX and research. Retained: all dedicated spin-off designs/reviews/reports/evidence (except parent test logs), source/tests/tools/lockfile and hidden spin-off skills. Mixed historical spin-off reports are explicitly historical, not current validation. Necessary engineering and human dependencies were copied with provenance, not deleted as old game payload.

[Dependency provenance](spinoff_phone/DEPENDENCY_PROVENANCE.md) · [Separation report](spinoff_phone/BRANCH_SEPARATION_REPORT.md)
