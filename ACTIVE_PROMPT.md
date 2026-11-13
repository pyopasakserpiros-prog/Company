# Gemini Implementation Assignment — Silicon & Handset v0.4.0 Candidate

You are receiving the entire `spinoff-phone` branch as an editable ZIP from the project owner. You do not have GitHub access in this workflow. Read `AGENTS.md`, `START_HERE_FOR_AI.md`, `BRANCH_LAYOUT.md`, the current project status, the dedicated master/workflow skills (`.agents/skills/silicon-handset-dev` and `silicon-handset-every-patch`), the six foundational audit/architecture PDFs, source code, and tests before changing anything. Record the received archive hash and base commit.

**Baseline Context:**
- Runtime Baseline: **v0.3.0** (Schema 3, Storage Key `silicon-handset-v030`, Commit `ea15889ae8a12b83718a78b1a470bb906e0225de`).
- Tested State: 29/29 tests PASS, `check.cjs` PASS, `build.cjs` PASS (`227,609` bytes), 5 seeds × 365-day soak PASS. Component SKU identity (`w.skus`), physical lots (`w.lots`), `LOT_POLICY`, 9-category compatibility (`qualifySubstitution`), divergent company R&D portfolios (`f.rndPortfolio`), Make/Buy/License evaluation (`f.sourcingDecision`), and UI provenance tracing are complete and verified.
- Target Release: **v0.4.0** (Schema 4, Storage Key `silicon-handset-v040`).

---

## Strategic Objective & Executive Authority

Your mission is to elevate *Silicon & Handset* into a **causally honest, deeply emergent macroeconomic and physical hardware simulation** by resolving the architectural flaws and latent time-bombs exposed in the project's six master audit documents:
1. `DEEP_LOGIC_BUGS_AND_FUTURE_TIMEBOMBS_AUDIT.pdf`
2. `ECONOMIC_AND_BUSINESS_REALISM_AUDIT_REPORT.pdf`
3. `POST_V030_ARCHITECTURE_AND_ROADMAP_HANDOFF.pdf`
4. `LIVING_ECOSYSTEM_ENGINE_AND_AUTONOMOUS_DIFF_SPEC.pdf`
5. `SUPPLIER_ECOSYSTEM_AND_SEED_DIVERGENCE_BLUEPRINT.pdf`
6. `MASTER_AI_DEVELOPER_GUIDE_AND_EXECUTION_PLAYBOOK.pdf`

The project owner is not a programmer or hardware engineer. They want a living, breathing, watchable world where companies, engineers, suppliers, and consumers make real decisions, triumph, fail, adapt, and surprise the observer—100% driven by autonomous NPC logic without player micromanagement.

**Non-Negotiable Constraints (`AGENTS.md` & `BRANCH_LAYOUT.md`):**
- **Strictly Immutable Human Core:** Never edit `SPINOFF_SOURCE/js/human-core.js` (SHA-256 `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`) or `SPINOFF_SOURCE/CORE_LOCK.json`. Implement all HumanCore integrations at call-sites in `SPINOFF_SOURCE/js/`.
- **Observer-Only Gameplay:** No player management buttons (no approving POs, buying stock, setting prices, or hiring staff). The observer inspects views, controls time, and tests conditions via Edit Hub.
- **Strict Integer Satang Conservation:** `totalCash(w) === w.openingCapital + w.editCapital` must hold after every tick, transaction, RMA refund, and clearance sale. Never mint or destroy satang.
- **Physical Lot & Material Conservation:** Raw materials, component lots, transit shipments, WIP batches, active installed base, and scrap must reconcile cleanly in `audit(w)`.
- **Zero Rubber-Banding / Catch-Up:** Competitors succeed or fail based solely on their own balance sheets, talent, and decisions.

---

## 1. Foundation Hardening & Code Defect Exorcism (LB-01 through LB-10)

You must eliminate the ten specific code bugs and latent time-bombs documented in `DEEP_LOGIC_BUGS_AND_FUTURE_TIMEBOMBS_AUDIT.pdf`:

1. **LB-01 (Multi-Candidate Recruitment Fallback):** In `sim.js: recruit()`, replace the single-candidate check (`candidates[0]`) with an iteration over `for (const p of candidates)` filtered by wage affordability against `firm.cash` runway. Score candidates by utility-to-wage ratio (`p.subjects[need] / offeredWage`) and extend the offer to the first willing and affordable candidate. Never abort recruitment when `candidates[0]` refuses.
2. **LB-02 (Display Upgrade Utility & GPU Fill-Rate):** In `phone-engineering.js + sim.js`:
   - Compute `displayVisualScore` (accounting for PPI sharpness, brightness nits, OLED contrast, and refresh rate) and include it explicitly in `consumerUtility()`.
   - Replace the unconditional `153600 / display.pixels` penalty in `taskScores.game` with a realistic GPU fill-rate model comparing `chip.gpuGflops` against `display.pixels * (display.refreshHz / 60)`. Rewarding visual immersion when driven by an adequate GPU stops higher-resolution screens from acting as a 100% net-negative poison pill.
3. **LB-03 (Sub-Hour Monotonic Clock & Causality):** In `sim.js: advance()`, eliminate the `w.minute -= rem` rewind that stamps events backwards relative to mid-hour Edit Hub commands and delays shipment ETAs by +60m. Advance time monotonically to hour boundaries `(Math.floor(w.minute / 60) + 1) * 60` and ensure `s.eta <= boundary` deliveries execute on time.
4. **LB-04 (Multi-Aptitude HumanCore Mapping):** Define canonical `SUBJECT_SPECS` mapping each domain subject (`semiconductor`, `optics`, `software`, `electronics`, `manufacturing`, `quality`, `sales`) to multi-dimensional HumanCore aptitudes (e.g., optics weighted by `visualAcuity`, `colorDiscrimination`, `analytical`, and `precision`) rather than hard-capping all subjects by `potential.memory`. Wire `H.evaluateAbility()`, `H.workplaceVoice()`, and `H.deriveAspirations()` directly into simulation routines.
5. **LB-05 (Off-Duty SleepDebt Balance):** Map evening leisure hours (20:00–22:59) and rest days to `'offDuty'` (`+0.45/h` sleepDebt with `workLifeBalance` recovery) instead of workplace `'rest'` (`+0.60/h`). Add adaptive recovery allowing exhausted NPCs (`sleepDebt > 35` or `energy < 30`) to sleep in or go to bed early, preventing irreversible population-wide burnout spirals.
6. **LB-06 (Target BOM-to-Lot Binding):** Ensure phone designs bind to explicit `componentSkuIds` at project inception, and verify that prototype and manufacturing stages consume lots matching those exact SKUs (or trigger an explicit, re-evaluated Engineering Change Order / BOM Substitution check via `evaluate()`).
7. **LB-07 (Physics Ceilings & Thermal Safety Cut-Off):** 
   - Replace linear formulas clamped at 100 in `phone-engineering.js` with diminishing-returns curves, separating pixel pitch low-light SNR from daylight resolution.
   - Enforce hard thermal qualification failure in `evaluate()`: if steady-state `surfaceC > 50°C` (even after DVFS thermal throttling floor), set `compatible = false` and push `'ความร้อนสะสมเกินเกณฑ์ความปลอดภัยตัวเครื่อง'` to `reasonsTh`.
   - Scale wafer cost and defect density inversely with node nanometers (`waferCost ~ (130 / nodeNm)^0.9`), ensuring bleeding-edge nodes require high volume to beat mature nodes on unit economics.
8. **LB-08 (Repeat Batch Optimization & Idle Labor Elimination):**
   - Route repeat production runs of an already-released SKU revision directly from `procurement -> manufacture -> inventory`, skipping redundant pilot (600 work) and release (180 work) overhead unless BOM revision changed.
   - Cleanly carry over excess work (`overflow = p.work - p.required`) across internal stage transitions.
   - Redirect unspent engineering hours during parts transit into active background R&D, yield learning, or QA testbench prep rather than wasting 82% of paid labor.
9. **LB-09 (Stateful UI DOM Preservation):** In `ui.js: render()`, update `<select id="firm">` options in place rather than calling `replaceChildren()` on every frame. Never overwrite or destroy focused elements (`document.activeElement`), and decouple fast simulation ticks from panel rendering (throttle full panel refresh to 4–5 Hz during 5x/20x playback).
10. **LB-10 (Bounded Ledger & Flexible Audit Constraints):**
    - Store corporate accounting entries in a dedicated, bounded `firm.financialHistory` ring buffer, separating them from personal daily meal transfers so corporate B2B and retail sales history are not wiped out in 3.5 days.
    - Prune completed job offers (`status === 'joined'`) older than 90 days into an archive counter.
    - Refactor `audit(w)` to enforce relational conservation laws (`sum(lotInputsConsumed) === batch.reservedPartCount`, valid SKU foreign keys) rather than hardcoded magic constants (`quantity * 7`, `batch === 12`).

---

## 2. Stock-Flow Consistent Circular Macroeconomic Engine (Remedy R1)

In v0.3.0, consumer wallets are static and drain to zero while treasury and employee cash hoard millions, causing industry-wide demand starvation by Year 2–3. You must implement closed-loop circular income velocity:

1. **Household Income Recycling:**
   - On each `daily(w)` step, employed workers retain a prudence-weighted savings buffer:
     $$\text{reserveSatang} = \text{baseReserve} + \text{profile.personality.prudence} \times \text{prudenceScale}$$
   - A bounded fraction of cash above subsistence/meal reserves is transferred via `transfer(w, person, w.households, amount, 'รายจ่ายค่าครองชีพครัวเรือน')` and distributed across `w.segments` using seeded cohort income shares (with exact integer remainder distribution).
2. **Upstream Factor Recycling & Renewable Extraction:**
   - `w.treasury` represents external mining, energy, and upstream services whose workers buy consumer goods. Each day, a bounded velocity fraction (1.5%–3.0% of `treasury.cash` above an operating reserve floor) transfers via `transfer(w, w.treasury, w.households, recycleSatang, 'รายได้หมุนเวียนจากภาคซัพพลายเชนต้นน้ำ')` into `w.segments`.
   - `w.treasury` converts paid extraction revenue into newly processed upstream raw stock (`treasury.stock`) at a bounded daily extraction capacity, updating `materials.extracted` explicitly in `audit(w)` to prevent Year 3 raw material exhaustion.
3. **Audit Conservation Equation:**
   - Replace static `s.cash + s.spent === s.initialCash` with:
     $$\text{s.initialCash} + \text{s.incomeReceived} + \text{s.refundsReceived} - \text{s.spent} === \text{s.cash}$$
   - Maintain strict `totalCash(w) === w.openingCapital + w.editCapital` exact to the satang.

---

## 3. Seeded Multinomial Logit Demand & Sunk-Cost Clearance Pricing

1. **Multinomial Logit Discrete Choice with Outside Option:**
   - Replace winner-take-all sorting (`candidates[0]`) in `settleMarket()` with deterministic Multinomial Logit choice probabilities using the simulation's seeded PRNG:
     $$P(\text{choose } j \mid \text{segment } s) = \frac{\exp(\beta_s \cdot U_{j,s})}{\exp(\beta_s \cdot U_{\text{outside},s}) + \sum_{k \in \mathcal{A}_s} \exp(\beta_s \cdot U_{k,s})}$$
   - **Outside Option ($U_{\text{outside},s}$):** If available phones are overpriced or technologically stagnant, buyers defer purchase and keep their cash.
   - Eliminates artificial 100%-vs-0% market share cliffs and alphabetical string tie-breakers (`'d1'` vs `'d2'`).
2. **Scale-Consistent Calibration:**
   - Calibrate daily wages to reflect skilled technical labor: Engineers = THB 800–2,200/day; CEOs = THB 1,800–3,500/day.
   - Calibrate segment price ceilings: Value = THB 2,900; Photo = THB 6,900; Performance Flagship = THB 15,900.
   - Calibrate custom silicon NRE so break-even volume ($Q_{\text{breakeven}}$) lands between 400 and 1,200 units (~10%–25% of annual market volume)—creating a genuine high-stakes strategic gamble.
3. **Sunk-Cost Clearance Liquidation & Insolvency Resolution:**
   - Drop the rigid `floor = cost * 1.08` pricing rule when a phone is superseded (`d.isLegacy`) or when `firm.cash < 14 * dailyWageBill`. Allow rational markdowns down to `0.55 * estimatedCost` to liquidate dead inventory into working capital.
   - If a firm misses payroll (`unpaidDays >= 7`), freeze new R&D/NRE and trigger clearance sales; at `unpaidDays >= 14`, unpaid staff may resign into the unemployed pool (`employerId = null`), and insolvent firms may auction excess inventory to solvent peers at wholesale discount, eliminating immortal "zombie firms".

---

## 4. Cohort Vintage Installed Base, RMA Warranty Loop & Post-Launch OTA (Remedy R2)

Smartphones are durable experience goods, not daily meals. Implement stateful installed base and post-sale dynamics while preserving $O(|S| \times |V|)$ computational efficiency:

1. **Cohort Vintage Installed Base (`w.installedBase`):**
   - Track active devices grouped into weekly vintage buckets: `{ id, segmentId, designId, firmId, firmwareRev, acquiredDay, warrantyUntilDay, activeUnits, failedUnits, retiredUnits, healthPermille, cumulativeThermalStress }`.
   - **Deterministic Aging & Degradation:** Daily health decay scales with `1 / battery.cycleLife`, `max(0, surfaceC - 41)`, and `1 / enclosure.dropResistanceScore`.
   - Units whose health falls below tolerance transition to `retiredUnits`, injecting replacement demand back into that cohort.
2. **Field RMA Warranty Queue & Root-Cause Teardown Learning:**
   - Field failures occurring within warranty (`day <= warrantyUntilDay`) enter `firm.rmaQueue`.
   - Resolving an RMA unit requires real paid quality/manufacturing work minutes plus either compatible replacement parts or a satang refund (`transfer()` back to `segment.cash`).
   - Unresolved RMAs erode `firm.brandTrust` (0..100), penalizing future launch sales.
   - Completed RMA teardowns generate subsystem-tagged `failureLessons` that reduce defect rates on future designs.
3. **Post-Launch OTA Firmware Projects:**
   - Handset brands can schedule `ota_patch` projects consuming software engineering hours to increment `design.firmwareRev`.
   - Deployed OTA updates apply to active `installedBase` buckets, reducing `os.overhead`, patching driver bugs, or applying conservative DVFS power limits to cool overheating phones and reduce RMA claims.

---

## 5. Thai Observer UI & Causal Observability

Turn deep backend math into watchable, dramatic stories in `SPINOFF_SOURCE/js/ui.js` (cleanly responsive at 390px mobile and 1280px desktop):

1. **Causal "Why" Chains Over Raw Numbers:** Provide human-readable, specific Thai explanations for every major decision (e.g., why a chip was chosen, why a project suffered rework, why a phone was marked down, or why an engineer accepted an offer).
2. **BOM Teardown & 8-Axis Benchmark Profile:** Display the 7-component vendor/SKU breakdown for each phone, its thermal throttling ratio, its pricing anatomy, and a plain-Thai bottleneck diagnosis (`engineeringDiagnosisTh`).
3. **Customer Voice & Installed Base Pulse:** Show active phones in consumer pockets, real pain-point quotes generated from physical bottlenecks (e.g., *"เครื่องร้อน 47°C จนเฟรมเรตตกหลังเล่น 10 นาที"*), field failure rates, and brandTrust trajectories.
4. **Macroeconomic Velocity & Cash Flow Inspector:** Provide an inspectable summary of household income, circular cash recycling, treasury extraction, and corporate cash runways.

---

## 6. Schema 4 Save Contract & Storage Isolation

1. **Atomic Schema Upgrade:** Update save metadata to `schema: 4`, `release: '0.4.0'`, with dedicated storage key `silicon-handset-v040`.
2. **Adversarial Validation:** Validate all imported JSON before replacing live world state. Reject corrupted or forged SKU/lot/installedBase references, hostile unknown fields, and invalid numbers.
3. **Safe Rejection Contract:** Explicitly reject legacy `0.1.0`, `0.2.0`, and `0.3.0` saves with a clear Thai notification without deleting the user's stored data or overwriting autosaves when in an invalid state. Refreeze HumanCore profiles via `H.freezeProfile()`.

---

## 7. Mandatory Verification Suite & Exit Gates

Before completing the patch, you must execute and report evidence for:

1. **`node tools/check.cjs` (`npm run check`):** Syntax sweep across all JavaScript files, initial `audit(w)` verification, and byte-for-byte SHA-256 match for `js/human-core.js` (`fa83eaa0...`).
2. **`node --test test/simulation.test.cjs` (`npm test`):** All 29 baseline tests preserved and passing + at least **6 new targeted tests** verifying:
   - Multi-candidate recruitment fallback (LB-01).
   - Display upgrade utility and GPU fill-rate balance (LB-02).
   - Sub-hour monotonic clock advancement and on-time shipment ETAs (LB-03).
   - Circular macroeconomic cash recycling and non-zero Year-3 sales (Remedy R1).
   - Vintage installed base degradation, RMA warranty queue, and teardown learning (Remedy R2).
   - Post-launch OTA firmware patch deployment.
   - Sunk-cost clearance liquidation preventing immortal zombie firms.
   - Schema 4 save/load round-trip and adversarial rejection.
3. **`node tools/build.cjs` (`npm run build`):** Generates standalone offline HTML files (`Silicon_Handset_single.html` and `SPINOFF_SOURCE/Silicon_Handset_single.html`) with identical byte counts and zero external dependencies.
4. **`node tools/soak.cjs`:** Multi-seed soak test running **5 seeds × 1,095 days (3 full simulated years)** with daily cash/material/installedBase audits and periodic save/load round-trips, proving active handset sales and economic vibrancy throughout Year 3.
5. **Documentation & Report:**
   - Update `spinoff_phone/PROJECT_STATUS.md`, `project_status_and_ai_onboarding.md`, `START_HERE_FOR_AI.md`, and `spinoff_phone/WORK_STATUS.md`.
   - Update `.agents/skills/silicon-handset-dev/SKILL.md` and `silicon-handset-every-patch/SKILL.md`.
   - Generate `spinoff_phone/PATCH_REPORT_V0.4.0.md` detailing all implemented capabilities, mathematical formulations, changed files, test output, and multi-year soak results.
