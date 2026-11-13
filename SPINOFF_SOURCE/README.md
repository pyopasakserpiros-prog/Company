# Silicon & Handset v0.2.0

Open ../Silicon_Handset_single.html offline. For editable source, keep the complete repository (shared immutable HumanCore/engineering reside in COMPANY_SOURCE), serve repo root and visit SPINOFF_SOURCE/index.html. This is a separate executable/save namespace; parent Company3.1.0 is preserved.

Run `npm ci` for development dependencies, then `npm test`, `npm run check`, `npm run build`, `npm run test:browser`; `node tools/soak.cjs OUTPUT.json` validates five365day worlds. Browser tests use CHROMIUM_PATH if supplied, otherwise system /usr/bin/chromium where present, otherwise Playwright's installed browser (`npx playwright install chromium`). Build inlines all shared code/CSS and creates both root and source Silicon_Handset_single.html.

Detailed game/API/limitations: ../spinoff_phone/PROJECT_STATUS.md. All normal operations are autonomous. New-game seed and starting role set opening conditions; Edit Hub experiments are logged. Export/import/autosave use only silicon-handset-v020; invalid import preserves the active world.
