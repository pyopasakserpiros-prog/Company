# Dependency provenance

Copied from main base e7dbd0dbdf2ef733d8d5679aeeb036ff0d139284, formerly COMPANY_SOURCE/js. These modules now belong to the self-contained spin-off dependency tree. No formulas or behavior changed.

- `SPINOFF_SOURCE/js/human-core.js` SHA-256 `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`
- `SPINOFF_SOURCE/js/phone-engineering.js` SHA-256 `26a27e574b7870867cbb86d50755b84e82071455a9cb0207ee8b5344c613aa43`

CORE_LOCK.json copied unchanged to SPINOFF_SOURCE; its relative js/human-core.js entry is still correct. check.cjs enforces the same fixed expected hash. AGENTS bytes unchanged. Global names retained intentionally.
