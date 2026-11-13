# Silicon & Handset v0.3.0 standalone source

All runtime dependencies are in this folder. Open the root or source `Silicon_Handset_single.html` offline in a browser that permits local files; alternatively serve the repository root (`python3 -m http.server 8000`) and visit `/SPINOFF_SOURCE/index.html`. Managed Chromium in restricted containers may block `file://` or loopback by policy; check `spinoff_phone/PATCH_REPORT_V0.3.0.md` for exact verification scope.

With Node >=20 (or Node >=18.20 with `node --test`), run `npm ci`, `npm run check`, `npm test` (29/29 unit + integration + UI harness tests), `npm run build`, `npm run test:browser` (requires `playwright` and unrestricted Chromium), then `node tools/soak.cjs OUTPUT.json`. Build inlines CSS/JS and writes identical source/root HTML aliases (`227,609` bytes). No external parent-game source or dependency symlinks are needed.

[Status/API/limits](../spinoff_phone/PROJECT_STATUS.md) · [v0.3.0 Report](../spinoff_phone/PATCH_REPORT_V0.3.0.md) · [Dependency provenance](../spinoff_phone/DEPENDENCY_PROVENANCE.md). Schema `3` / release `0.3.0` and `silicon-handset-v030` storage key are enforced; older `0.1.0`/`0.2.0` and parent Company saves are preserved untouched.
