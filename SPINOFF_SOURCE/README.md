# Silicon & Handset v0.2.0 standalone source

All runtime dependencies are in this folder. Open the root or source Silicon_Handset_single.html offline in a browser that permits local files; alternatively serve the repository root (`python3 -m http.server 8000`) and visit /SPINOFF_SOURCE/index.html. Managed Chromium here blocks file:// by policy; localhost tests do not certify local-file navigation.

With Node >=20, run `npm ci`, `npm run check`, `npm test`, `npm run build`, `npm run test:browser`, then `node tools/soak.cjs OUTPUT.json`. Browser tests use Playwright and CHROMIUM_PATH, /usr/bin/chromium when available, or Playwright Chromium (`npx playwright install chromium`). Build inlines CSS/JS and writes identical source/root HTML aliases. No external parent-game source or dependency symlinks are needed.

[Status/API/limits](../spinoff_phone/PROJECT_STATUS.md) · [Dependency provenance](../spinoff_phone/DEPENDENCY_PROVENANCE.md). Schema2/release0.2.0 and silicon-handset-v020 storage are retained. This branch relocation implements no new gameplay feature.
