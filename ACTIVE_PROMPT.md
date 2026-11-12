# Latest owner assignment — Silicon & Handset first playable

Owner authorised implementation after the spin-off design review, with independent seeded rival firms/people/resources and no player-relative catchup. Delivered scope/limits are in [spin-off status](spinoff_phone/PROJECT_STATUS.md) and [report](spinoff_phone/PATCH_REPORT_V0.1.0.md). Source SPINOFF_SOURCE, runtime0.1.0, independent save; parent Company stays3.1.0. Previous Company supplier assignment below is historical context, not an instruction to overwrite the spin-off or start another patch automatically.

# ACTIVE IMPLEMENTATION PROMPT — Gemini: Build the Phone Manufacturing Ecosystem (COMPLETED IN v3.1.0)

> **Status: IMPLEMENTED & VERIFIED IN RUNTIME v3.1.0 (2026-11-12)**
> - **Base**: `786f5b1bced6e43cdb1e10d02114bda2cbf0e8fc` (`v3.0.0`) -> **Delivered**: `v3.1.0` (`236/236` unit/integration tests passing, `tools/phone-industry-soak.cjs` normal opening `601` / `796` phones, full-campus-life `S.advance(1440)` vertical-integration soak passing).
> - **Report**: See [`docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V3.1.0.md`](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V3.1.0.md) and [`docs/company/ERA3_PHONE_SYSTEM.md`](docs/company/ERA3_PHONE_SYSTEM.md).
> - The original assignment prompt is retained below in full for provenance.

You are the implementing developer receiving the complete Company repository as a ZIP from its owner. Continue from **v3.0.0**, gameplay/source commit **786f5b1bced6e43cdb1e10d02114bda2cbf0e8fc**. Later commits may update only this brief and handoff documents. Record the actual received archive/base. You do not have live GitHub access in this workflow: implement locally and return a verified complete project ZIP. Codex/Agy will inspect and integrate it.

This is an authorised development assignment, not a request for another proposal. The owner delegates technical design, creative decisions and implementation to you. Choose the next release number based on the delivered scope; do not confuse runtime release with package/save version. Do not wait for the non-programmer owner to specify semiconductor engineering or every design detail.

**The goal is a living, interconnected phone-production economy in which the observed company can genuinely become a CPU/SoC designer, RAM supplier, camera supplier, another component producer, an assembler, a handset brand, or a vertically integrated group, when its NPC leadership and capabilities make that feasible.** Build businesses deeply enough that our company can operate them through actual people, assets, processes, inventory, contracts and accounts. External supplier labels and numerical component generators alone do not meet this assignment.

This brief provides a design direction and required outcomes, not an exhaustive solution. Critique it, improve it, identify missing dependencies, invent useful mechanics and resolve implementation problems independently. Document important choices. Do not merely implement the examples literally or stop after adding data records and UI labels.

## Read first and preserve

Read actual `AGENTS.md` every time you begin or resume, then `START_HERE_FOR_AI.md`, the three maintained project-status copies, `docs/company/AGENT_COLLABORATION_WORKFLOW.md`, `docs/company/AGENT_WORK_STATUS.md`, both repository master skills and affected `.agents/skills` references. Inspect actual source and tests before trusting documentation.

Read `docs/company/ERA3_PHONE_SYSTEM.md`, the v3.0.0 implementation report and validation records, `docs/company/ERA3_V300_HANDOFF.md`, `ideas/company/36_era3_phone_industry_remaining.md`, and the multi-AI briefs/DOCX in `era3/`. They are design inputs; not all their ambitions exist in code.

Do not modify `AGENTS.md`, `COMPANY_SOURCE/js/human-core.js`, `CORE_LOCK.json` or weaken their checks without separate explicit permission. Locked core SHA-256: `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`. Preserve all legacy businesses and useful systems. Develop subjects, professions and industry mechanics around the core.

## The intended experience

This is an autonomous NPC life-and-business simulation. The owner enjoys observing individuals and organisations react differently to personality, knowledge, resources and events. The player observes, controls time/camera and uses an accessible Edit Hub to change permitted conditions. **NPC executives and employees decide research, recruitment, procurement, investment, product architecture, production, pricing and sales themselves.** Do not require player approval or routine management clicks. A startup-sector choice is an initial condition, not continuing player control.

The world starts at feature phones. Smartphones emerge from capabilities, compatible components/software, experiments and commercial incentives. Outside firms develop even if our company never enters phones. No fixed historical dates, obligatory technology ladder, predetermined brand/spec catalogue, universal progress bar or guaranteed winner. Shared standards and prerequisites are reasonable; an identical scripted development path for every firm/world is not.

The company begins as a small SME. Money is necessary but cannot substitute for staff expertise, equipment, qualification, rights, time, infrastructure and working capital. Some SMEs can enter repair, PCB assembly, firmware, mechanical parts, testing or fabless design long before they could operate a wafer fab. Entry must be possible and explainable, not automatic or universally forbidden.

## What v3.0.0 already does — extend rather than duplicate

Source modules `phone-engineering.js`, `phone-talent.js`, `phone-industry.js` already provide generated measurable parts, named external professionals, funded research, samples/prototypes, owned component lots, prepaid shipping, assembly, pilot qualification, released stock, finite household purchases, warranty cohorts and observation UI. Campus entry currently covers handset work, enclosure supply, maintenance and a simplified acquisition route. Own-company entry into CPU/RAM/camera and other specialist roles is **not complete**.

Existing safeguards include shared outside engineer work budgets; shared component-production minutes; real campus `phoneWorkshop` credits; old demanded chips remaining producible; world-sector transactions before profit/tax/history settlement; immutable external profiles after loading; recruitment preserving identity/education and deterministic edit continuation. Preserve or improve these contracts, with regressions if replacing them.

The old v3.0.0 baseline passed230 unit/integration and17browser cases. These are historical counts, not a future target or permission to skip your own runs. Normal360day sector runs produced only24/25phones despite substantial research wages; an explicitly resource-endowed run produced574. **Default supply and strategy calibration are unresolved.** Investigate root causes; do not disguise shortages or bad unit economics with hidden refills, free money or guaranteed sales. The existing360day tool bypasses full campus life; add evidence of actual campus operation.

## 1. Model economic roles as executable businesses

Use a shared business-capability/process framework, with distinct role-specific requirements. A firm may hold multiple roles and diversify; roles are not permanently tied to one initial company ID. Suggested coverage:

| Business | Distinct operations and meaningful outputs |
|---|---|
| Fabless CPU/SoC design | Architecture, RTL/IP integration, verification, physical design, tape-out, foundry booking, packaged qualified chip lots |
| Wafer foundry | Qualified process node, costly plant/tools, cleanroom/utilities, wafer starts, process capacity, yield, tested dies |
| OSAT / packaging and test | Die attach, bonding/interconnect, encapsulation, electrical test/binning, compatible packages |
| DRAM / memory | Cell/process and controller knowledge, die production or contracted fabrication, packaging/test, qualified RAM components/modules |
| Flash / storage | NAND procurement or manufacture, controller/firmware, endurance/error correction, packaging and test; distinct from volatile RAM |
| Camera ecosystem | Image sensor, lens/optics, actuator/OIS where applicable, module assembly, calibration and ISP/driver integration |
| Display / touch | Panels, backlight where applicable, touch controller/lamination, driver/display-interface compatibility and inspection |
| Battery / power | Cell sourcing/manufacture, pack assembly, protection/charging electronics, safety/aging tests and qualified packs |
| PCB / interconnect / RF | Board fabrication versus PCBA, connectors, antennas/RF/front-end/power management and signal/EMI tests |
| Mechanical / thermal | Enclosure forming/machining/moulding, tolerances/coatings, heat spreaders, sealing and material qualification |
| OS / firmware / platform | Kernel/drivers/BSP, UI/app framework, compatibility/security/testing, updates and commercial licensing |
| EMS / ODM / handset brand | Contract manufacture or owned assembly, integration design, pilot/ramp, QA, launch, distribution and support |

You may reorganise or add useful roles. Do not conflate CPU design with owning a fab, generic semiconductor knowledge with all memory technologies, RAM with storage, or camera megapixels with complete camera quality. Physical manufacturing entry for the core CPU/RAM/camera examples must exist through appropriate owned or contracted stages. Contracted manufacturing is a real funded production order, not a component appearing when a research timer expires.

Use realistic thresholds and scalable tools rather than assigning the same THB5m entry fee to every role. Distinguish fabless NRE, masks, contracted wafer capacity and verification from the orders-of-magnitude larger capex/utility burden of a fab. A company may outsource unavailable stages, buy qualified inputs, license technology, recruit expertise or acquire a business; the resulting rights, obligations, ramp and integration still matter.

## 2. Reusable definitions that actually drive simulation

Document authoring contracts/templates for a business role, process route, material grade, component design, equipment type, qualification and research project. Future AI developers must know required fields and consumers. Suggested role contract:

- ID, role/family, capabilities and entry alternatives; product/service outputs and actual buyers.
- Subject requirements with proficiency and distinct expert roles; staffing/shift needs; individual and team effective capability, specialist bottlenecks and key-person risk.
- Technology/IP rights, compatible standards, prerequisites and qualification evidence.
- Site, equipment, tooling, utilities, environment/safety and calibration requirements.
- BOM with quantities/units, process stages, time/labor/machine occupancy, WIP, loss/yield, QC/rework/scrap and by-products.
- NRE/capex/opex, working capital, order sizes, supplier/customer contracts, lead times, inventory and cash risks.
- NPC feasibility reasons separately from strategic preference; persistent plans, decisions and failure/recovery paths.
- Ownership, inventory/accounting events, save/audit invariants, observation/UI and executable acceptance cases.

Registries must be consumed by real evaluators and work/production systems. Do not build a second decorative catalogue beside hard-coded behavior. Keep SI/engineering units explicit; integer satang for money.

## 3. Real materials, production and inventory

Separate natural resources, refined materials, qualified industrial inputs, components, assemblies, prototypes and finished products. Minerals may be natural resources; electronic-grade silicon, wafers, copper foil, resin, chemicals, glass, cells and packaged chips are manufactured goods. Add rational upstream recipes and purchasing routes. Avoid using a generic glass bottle as a finished qualified phone display input or a generic wafer as every memory/camera process without the required transformation/qualification.

For our company, material must be purchased/produced, received into owned stock, reserved for a work order, consumed at the correct stage, transformed through persistent WIP and inspected before output enters stock. Track quantity/unit/grade/design/owner and provenance. Include setup/changeover, batches, lead times, tool occupancy, maintenance, qualification, yield, rework and scrap where consequential. Labor and machines cannot be reused simultaneously by multiple projects/roles. Progress during actual work differs from elapsed unattended machine processing. No completion simply from opening a screen, calling an action without effort, or passing a calendar day.

External firms may use aggregate production models to control computational cost, but must have plausible funded input acquisition, cost, finite capacity, lead time and output/yield accounting. Comparable constraints must apply to both external and campus firms. Do not make NPC competitors omniscient, resource-free or faster solely because they are offscreen.

A handset manufacturer must own actual CPU, RAM, storage, camera, display, battery, PCB and other required components. Assembly consumes the selected compatible parts, creates real finished stock, then waits for validation/launch or sells under actual contracts. A phone design, patent, purchase order or marketing announcement is not physical inventory. Component suppliers must be able to stockpile, quote, fulfil B2B orders and earn operating revenue; components are not usable only inside a predetermined phone model.

## 4. Engineering and technology competition

Have competing supplier firms choose different budgets, designs, targets and customers from their people, finances, technology, facilities, information and strategy. Replace or deepen bounded level-only formulas where needed. Avoid free universal upgrades or predetermined component specifications. Document defensible approximations and research sources if you consult them; do not invent claims of research or measured calibration.

Derive measurable outcomes and tradeoffs: CPU throughput/latency/ISA/features, power/thermal and manufacturing yield; RAM capacity/bandwidth/latency/power/controller limits; storage throughput/capacity/endurance; camera sensor area/pixel characteristics/optics/ISP/focus/low-light quality; display resolution/brightness/refresh/power; battery Wh/charging/lifetime/safety; RF/connectivity; OS footprint/drivers/performance/security/support. Add details beyond these examples where they materially affect outcomes.

Use workload-specific end-device bottlenecks and compatibility gates. More megapixels, GHz, cores or RAM is not automatically better overall. Show predecessor deltas and comparable task results, including regressions, cost, battery, heat, reliability and price/value. Older components may remain economically useful. Support and production obligations cannot vanish when a new generation is researched.

R&D requires named qualified contributors, tools/prototypes, cost and effort; verification and pilot evidence precede qualification. Failure consumes resources and may teach something rather than granting a completed technology. The owner's earlier frustration was universal technology unlocked within days through generic research points: do not recreate that shortcut under different labels.

## 5. NPC decisions, expertise and SME growth

For each new role, implement discover/evaluate/fund/build-or-contract/qualify/operate/expand/pause/exit paths accessible to our NPC company. External firms should use the same domain principles at an appropriate simulation resolution. A dropdown that lets a human force entry is not the autonomy system.

Knowledge belongs to people and organisations in appropriate forms: learned subjects, practical experience, documented process know-how, team routines and owned/licensed IP are related but not interchangeable. Staff with different innate aptitudes/potential, subjects, fatigue and experience must produce different learning, productivity, quality and research outcomes without changing locked Human Core formulas. Preserve genuinely specialized people; an engineer should not automatically know every supplier profession.

Leadership considers reserve cash/runway, expected demand and margins, rival offerings, known news, team gaps, opportunity costs, supplier risk, plant utilisation and personal risk/prudence/ambition/values. Explain feasible-but-declined versus infeasible decisions. Cash-rich cautious firms may preserve reserves or improve current operations; ambitious ones may invest, hire or acquire. Revisit choices when conditions change. Do not require every capable firm to diversify.

Named outside professionals can be recruited with coherent salary/notice/retention effects and stable identities; transfer preserves learned capability and removes former-employer capacity. Buying a design/IP or company does not grant its unpurchased facilities or instantly transfer all tacit employee knowledge. Licensed parts, outsourced production and acquisitions should be feasible alternatives with meaningful costs and integration constraints.

## 6. Market, finance and world feedback

Build actual inter-firm demand: engineering samples, qualification orders, minimum batches, production contracts, reservations/prepayments, delivery acceptance, invoices, cash collection and warranty obligations. Model meaningful competition in price, quality, capacity, delivery reliability and technical compatibility. Companies can buy from multiple suppliers or vertically integrate when justified. A supplier can sell to other brands while our company is not a phone brand.

Trace the full loop: household/B2B demand → brand plans → component orders → supplier schedules → upstream demand → work/cash/wages → technology and capacity investment → competing products and prices. Country infrastructure, power/water, logistics, tariffs/waivers/export controls, treaties, conflicts and known political news should affect relevant inputs, shipping and decisions through existing world systems.

Unify money/stock and cost accounting across divisions; avoid hidden parallel cash balances, double revenue, free internal transfers or treating procurement/capex as immediate profit. Distinguish inventory, COGS, paid labor, R&D/NRE, operating costs, capex/depreciation and warranties at a defensible abstraction. Internal transfers conserve consolidated resources and do not manufacture profit. Correct the existing default supply starvation and unrealistic portfolio spending through actual production/market/decision changes, not an edited-resource fixture presented as normal play.

## 7. Observation and Edit Hub

Extend the phone market and Company/World sheets with role-specific views: supplier portfolios, specs/benchmarks, staff/expertise, facilities/tools/capacity, process/WIP/batches/yield, raw/component/finished stock, purchase/sales contracts, queues, costs/margins and management plans. Let the observer trace who decided, why, which input/subject/tool is missing, what is shipping and what happens next. Show current action and concrete consequences rather than only a progress bar.

Keep Thai user-facing language, units and mobile-friendly navigation. Edit Hub must let a non-programmer select named targets and perform permitted logged experiments without raw IDs/JSON. Knowledge, personality, money, stock or machine changes must propagate to actual feasibility/work/decisions; do not force a predetermined outcome. Reading tabs must remain pure and save/load must preserve active WIP, contracts, ownership and recruitment.

## 8. Acceptance evidence — prove it through behavior

Implement and verify end-to-end scenarios, not only direct helper calls or registry counts:

1. A qualified campus company enters CPU/SoC design, hires/uses real experts, funds NRE and contracts or operates manufacturing/testing, receives owned qualified chip stock and sells/delivers to a real buyer with real payment.
2. Separate campus RAM and camera businesses obtain their own relevant inputs/technology/tools/work, produce qualified lots and supply a handset maker. Demonstrate additional major supplier roles through the reusable framework, with explicit coverage/remaining boundaries.
3. A campus handset maker sources components from those businesses, consumes compatible stock, manufactures into inventory, validates/releases and sells. A missing part, incompatible design or incomplete qualification blocks the relevant stage.
4. Outside firms continue competing when our company remains a bakery or software SME. Different seeds and executive/team conditions produce meaningful divergent strategies/technical outcomes, not just different names.
5. No cash, missing specialist, broken tool, utility shortage, unavailable licence, full foundry queue, route disruption and failed yield cause specific observable consequences and recovery attempts. Repeating a call does not duplicate labor, shipments, output or cash.
6. Track old-product obligations, supplier loss, recruiting/key-person departure, failed experiments, warranty and affordability. Test procurement/internal transfers/consolidated dividends against resource/cash invariants.
7. Current-version save/load during WIP, transit, notice, qualification and contract payment continues deterministically; UI reads preserve the world/RNG. Invalid saves fail safely without deleting user saves.
8. Run multiple normal-opening long scenarios and at least meaningful full-campus-life scenarios with daily audits/checkpoints. Treat edited cash/knowledge/stock experiments as labelled controls. Investigate inability to bootstrap any meaningful supply chain and structural losses; not every firm must be profitable, but the economic model must offer viable and varied conditional strategies.

Run the actual project commands in `COMPANY_SOURCE`: `npm test`, `npm run check`, `npm run build`, `npm run test:browser`, `node tools/benchmark.cjs` and relevant/extended sector-soak tools. Add meaningful regressions for changed behavior. Record command/environment/counts/results and failures honestly; historical test totals are not evidence. Browser dependencies may require Playwright/Chromium. Do not silently replace browser/campus evidence with sector-only simulation or Node timings with mobile FPS.

## 9. Documentation, skills and complete ZIP return — mandatory every patch

Update both repository master skills, affected domain skills under `.agents/skills`, skill index and maintained root copies from actual APIs/formulas/invariants/tests/limitations. Update all three identical project-status copies, applicable guides/API/authoring templates, work register, README/start/active-prompt navigation and patch report. Move only verified completed proposals into project status; retain unresolved ideas. Do not certify skill maturity merely by renaming a header.

Also update the two Gemini app skills **inside your app**, `company-evolution-dev` and `company-for-every-patch`, when your available tools support that channel. Repo files and installed app skills are separate destinations. If app updates are unavailable, state that plainly and include the updated importable skill documents/instructions in the ZIP; do not claim synchronization.

The update report must include received base/release, changed/added/removed files, design choices and creative additions, source-backed coverage for each supplier/campus route, dependencies/costs/processes, cross-system effects, actual acceptance scenarios/results, remaining gaps and a continuation handoff. A partial subsystem must be labelled partial; a renamed release is not proof of completeness. Work through the required integrated ecosystem rather than stopping at another proposal or a cosmetic catalogue.

Return a **complete editable Company project ZIP**, not only HTML or a diff: one project root; COMPANY_SOURCE/index/js/CSS/assets/tools/tests/package manifests; all three rebuilt standalone HTML aliases; AGENTS; hidden .agents/skills; root skill copies; all maintained docs/status/ideas/reports and delivery manifest. Include directory entries for nested/hidden directories so mobile file managers can display them. Exclude .git, node_modules, cache, nested ZIPs and unrelated games. Preserve original supplied research/proposals unless there is an explicit documented reason to relocate them safely.

Close the final ZIP, reopen it, check central directory/CRC/path safety/required files, compare included file hashes, extract to a new directory and rerun supported check/test/build/browser from that extraction. Verify rebuilt HTML agrees with delivered source. Publish final size and SHA-256 separately when possible, and disclose checks you could not run. If you change the ZIP afterward, verify the final version again. Attach a real downloadable ZIP using your available file tools. Do not claim the owner received/downloaded it or that you pushed GitHub.

**Proceed autonomously. Build a believable ecosystem that makes the owner want to watch what happens next. Treat this brief as a starting design you are expected to improve, while respecting the required outcomes and immutable rules.**
