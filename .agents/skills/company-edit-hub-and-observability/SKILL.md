---
name: company-edit-hub-and-observability
description: Use when changing Edit Hub, personality/company/resource editing, Thai labels, NPC inspection, decision history, or mobile usability.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — Edit Hub และการสังเกตโลก NPC

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ให้ Gemini ตรวจ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/debug.js: edit modal; js/api.js: dispatch, snapshot views; js/sim.js: directorEdit, setTrait/grantCash/grantMaterial command branches` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐานเดิม: `COMPANY_SOURCE/test/campus-behavior.test.cjs; autonomous-campus-v010.test.cjs; campus-browser.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- ผู้ใช้ไม่รู้โค้ด: เลือกชื่อคน/บริษัท ชื่อของ และจำนวนที่อ่านรู้เรื่อง ไม่ต้องเปิด JSON หรือจำ ID
- แสดงเป้าหมาย ค่าปัจจุบัน สิ่งที่แก้ หน่วยบาท และข้อผิดพลาดด้วยภาษาไทย
- แก้ข้อมูลเฉพาะคนผ่าน clone/validate/freeze ไม่เปลี่ยนสูตร human-core หรือคนอื่น
- ให้เห็นก่อน/หลังและเหตุผล NPC ที่เกิดจริง ปุ่มปิด/กลับไปดูโลกและการแตะบนมือถือสำคัญ

## โจทย์ลองใช้หลังยกระดับ

ผู้ใช้เสกเงินให้บริษัทแต่เข้า wallet คน: ออกแบบ flow เป้าหมายและหลักฐานหลังแก้ให้ป้องกันความสับสนอย่างไร?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

webapp-testing; Playwright best practices; วิสัยทัศน์ผู้เล่นใน repo — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

companyKnowledge snapshot powers the company sheet and character ความรู้ tab with Lv1–Lv5. directorEdit/setSubject changes one selected NPC. Display subject names, team holders and missing requirements rather than pooled research thresholds.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ

## v2.4.0 — Verified living-world integration

`debug.js:renderWorldSheet` exposes six World categories; entity selectors hold UI-only IDs and stop live replacement while a native select is focused. A nation card can open its firm's details. Display real cash, input shortages, utilization, policy reasons, shipments and journal records. Do not generate news or mutate RNG during render. Browser tests include mobile entity selection and standalone save equality. `profit` in the external model is daily after-tax cash surplus: label it กระแสเงินสดสุทธิ, not statutory accounting profit.

Contract: `docs/company/LIVING_WORLD_SYSTEM.md`; evidence: `COMPANY_SOURCE/test/living-world-v240.test.cjs`, `test/campus-browser.cjs` and patch report. Existing starter maturity is unchanged.

## v2.5.0 integration

sim.productionSteps/productionView expose actual timed assembly checkpoints; planStockProduction creates no-deposit internal stockBatch orders, excluded from activeOrders/shipping until ready stock is allocated on acceptance. Save accepts internal offerId=null only with stockBatch/deposit0/unitPrice1. api.frame uses2game minutes/real second at1×; move uses8cells/tick. Read v2.5.0 patch report for remaining manufacturing scope; do not claim dedicated machinery or government procurement completed.

## Verified v2.6.0 integration

Company sheet adds company_plant and company_contracts. Show actual machine condition, temperature, utilization slots, parts/install/repair queues, technician, price and energy, plus contract ordered/delivered/paid. No normal management buttons. API resolveActivityLabelTh translates equipmentMaintenance/equipmentUnavailable. Snapshot reads never initialize plant; P.businessReady/view are pure.

Contract: `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`; report: `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md`. Existing starter maturity is unchanged.

## v2.7.0 Process-Driven Realism Overhaul (`process-driven-realism-overhaul-v270`)

- **Timed Refinery Batches (`w.plant.refineryBatches`)**: All 40 material recipes run through `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released/rework/scrapped/cancelled` via `P.enqueueRefineryBatch`, `P.cancelRefineryBatch`, and `P.tickRefinery`.
- **Product Routes (42 Products), Shared Machine Guard & Equipment Subsystems**: 3–4 stage domain routes with `opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint`, and `intermediateOut`; `m.lastPowerAt`/`m.lastThermalAt` prevent multi-job power/thermal multiplication in the same tick; machines track 5 `subsystems`, `faultModes`, `P.technicianCapability`, `serviceRecords`, and `purchased_new`/`used_refurbished`/`leased` acquisition modes.
- **Time-Bound Freight, 10 B2B Services & Real Software/QA/SLA**: Autonomous loops never pass `completeAllSteps: true`; freight enforces outbound/return elapsed time and driver rest; services require `workMinutesDone`, `testMeasurements`, `instrumentCustody`, and `storageHoursOccupied`; software requires qualified developers (`programming >= 40`, `software >= 40`), supports `discoverScopeChange`, and penalizes `deployWithKnownDefects`.
- **Physical Warehouse Lots (`w.warehouse`), Competitive Tenders (`w.commerce.tenders`), and 180m Biological Livestock Cycle**: `reconcileWarehouseLots` / `warehouseAudit` with FEFO/FIFO and cold-chain shelf life; `W.evaluateCompetitiveTender`, `renegotiateCommercialContract`, `terminateCommercialContract`, and `W.payFromCounterparty`; separated `feedLivestockHerd` and `milkLivestockHerd` (180m cycle) and external firm `cogsSatang`/`accrualProfitSatang`.
- Read `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`, `docs/company/LIVING_WORLD_SYSTEM.md`, and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md`. Verified with **186/186** tests (`test/process-realism-v270.test.cjs`).

## v2.8.0 Live Bottleneck Tracker, Watchlist & Human Depth Observability (`living-scenarios-observability-and-human-depth-v280`)

- **Live Bottleneck & Causal Tracker (`S.buildObservabilityView(w)`)**: Exposed on `API.view(w).observability` and rendered in the `🔍 ติดตามสด / คอขวด` (`company_tracker`) sub-tab of `debug.js`. Shows active company bottlenecks (`whatIsStuckTh`, `whyStuckTh`, `howSolvingTh`), per-employee live status (`doingTh`, `stuckTh`, `solvingTh`, `aspiration`, `latestMemoryTh`), and cause-and-effect chains (`causalChains`) without mutating simulation state.
- **Persistent Watchlist (`w.watchlist`, `S.toggleWatchlist`)**: Saves starred people, events, threads, and bottlenecks in `w.watchlist` (validated by `Save.validate(w)`) and syncs with `uiState.trackedIds` and `⭐` star buttons in `debug.js`.
- **Character Sheet & Edit Hub Extensions**: Displays `p.aspiration` and `p.memories` in the Character Sheet (`chronicle` tab) and adds Sandbox triggers for OEM repair, internal career switches, and retention counter-offers. Verified with **190/190** tests (`test/living-scenarios-human-depth-v280.test.cjs`).

## Historical v2.9.0 integration (source-backed; preceding release notes are historical)

debug.showBusinessChooser pauses time and starts six origins through API.newGame. Company overview shows reconciled opening assets/learning/intelligence. World countries show named fictional leaders/terms/ministry measures/customs/security, diplomacy staged agreements. Character News shows only read reports. openSheet refreshes the latest snapshot; test panels do not change saved simulation.

Read `docs/company/SME_AND_CIVICS_SYSTEM.md` and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md`; verify with `test/sme-civics-v290.test.cjs` and relevant existing tests. This reference update does not claim a new mastery certification or a Gemini app update.

## Historical v3.0.0 integration reference

Reference key: `directorPhoneEdit`. api snapshots include phoneIndustry/phoneTalent; debug.js openPhoneIndustry renders six pure observation tabs, specs/comparisons/projects/lots/people. directorPhoneEdit is an explicitly logged experiment: integer satang grant, individual subject or trait. UI converts THB→satang and uses labels, not raw JSON. Observe differences without issuing launch/procurement commands; test tab reads preserve the serialized world.

Read `docs/company/ERA3_PHONE_SYSTEM.md`, the v3 report and actual source. This source-reference update does not change starter maturity or certify the Gemini app skills.

## Current v3.1.0 integration reference

Reference key: `phone-engineering.js`, `phone-industry.js`, `phone-talent.js`, `world.js`, `sim.js`, `debug.js`. Models 12 executable phone supply-chain roles (`E.ROLE_CONTRACTS`: `fabless_soc`, `wafer_foundry`, `osat_packaging`, `dram_memory`, `nand_storage`, `camera_module`, `display_panel`, `battery_pack`, `pcb_rf`, `enclosure`, `os_platform`, `brand`) and 8 qualified material grades (`E.MATERIAL_GRADES`). Supports own-company entry and vertical integration (`I.enterCampusRole`), Fabless SoC -> Wafer Foundry -> OSAT orders (`foundryOrders`), persistent WIP batches (`wipBatches`), `declined_prudent` strategic refusal, and resolved normal-opening upstream supply starvation (`world.js`). Verified by `test/phone-supplier-ecosystem-v310.test.cjs` (**236/236** total tests) and `tools/phone-industry-soak.cjs`.

## Silicon & Handset sibling boundary

For the new SPINOFF_SOURCE runtime, use silicon-handset-dev and spinoff_phone/PROJECT_STATUS.md; this domain's Company APIs above remain unchanged. Spin-off reuses HumanCore/phone engineering but has its own finance/people/work/stock/save/UI contracts and audit {ok,errors}. Check actual consumers in SPINOFF_SOURCE/js/sim.js and ui.js before applying Company-specific hooks. Runtime/campus/physics depth differs; do not certify inherited full Company features from shared imports.
