---
name: company-qa-and-delivery
description: Use when verifying a Company patch, collecting NPC behavior evidence, writing update reports, packaging a full project ZIP, or integrating returned chat-app work.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — QA เอกสาร และส่งมอบ ZIP

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ตรวจ [สถานะโครงการ](../../../project_status_and_ai_onboarding.md) และ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/package.json; tools/test.cjs, verify.cjs, build.cjs, core-review.cjs, benchmark.cjs; test/campus-browser.cjs; test/business-depth-world-corridors-v210.test.cjs` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐาน: `COMPANY_SOURCE/test/core-baseline.test.cjs; final-core.test.cjs; business-depth-world-corridors-v210.test.cjs; campus-browser.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- ใช้ผลรันจริงและสถานการณ์อัตโนมัติ ไม่คัดจำนวนเทสต์เก่าหรืออ้าง command path ว่าเป็น autonomous
- npm test ไม่รวม browser suite; build ปัจจุบันสร้าง CompanyFoundation_single.html เท่านั้น ตรวจ alias ที่แจกจริงแยก
- ทุกแพตช์อัปเดตสกิลที่เกี่ยวข้อง project status เอกสาร รายงานและดัชนีตามผลจริง
- ZIP เกมต้องครบ source/เอกสาร/สกิลซ่อน/เครื่องมือ/เทสต์/report/manifest ตรวจ ZIP สุดท้ายและแตกในที่ว่างก่อนส่ง

## โจทย์ลองใช้หลังยกระดับ

ZIP เปิดได้แต่ไม่มี .agents/skills และ source ไม่ตรง HTML: จะตรวจจาก artifact และรายงานสิ่งที่ขาดอย่างไร?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

webapp-testing; systematic-debugging; Playwright best practices; skill-creator — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

New tests: knowledge-and-company.test.cjs and added mobile browser cases cover real qualification, licensing, personal learning, aptitude differences, legacy saves and full-map zoom. Build regenerates all three HTML aliases; inspect final ZIP/CRC and extracted checks.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ

## v2.4.0 — Verified living-world integration

v2.4.0 adds test/living-world-v240.test.cjs (14 cases) and two World browser tests. Run check/test/build/browser and simulation benchmark. World tests cover conservation, no capital/input, crop propagation, finite reserves, policies/terms, bilateral scenarios, real purchasing, multi-seed days and save continuation. npm test baseline166, browser11 at delivery; verify actual output, don't copy counts. Package world.js as source plus rebuilt three HTML aliases and documents/skills; CRC/hash-check final ZIP and run extracted source checks. See patch report and LIVING_WORLD_SYSTEM.md.

Contract: `docs/company/LIVING_WORLD_SYSTEM.md`; evidence: `COMPANY_SOURCE/test/living-world-v240.test.cjs`, `test/campus-browser.cjs` and patch report. Existing starter maturity is unchanged.

## Verified v2.6.0 integration

test/plant-and-commercial.test.cjs adds10 scenarios covering physical equipment/thermal timing/repair gates, full warehouse sale fulfillment and escrow conservation, large contracts and government budget. Browser adds machinery/contracts mobile read-only check. Latest targets177 tests/12browser but always verify actual counts. Extract final ZIP and run check/test/build; include plant.js/world.js and all hidden skills/docs.

Contract: `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`; report: `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md`. Existing starter maturity is unchanged.

## v2.7.0 Process-Driven Realism Overhaul (`process-driven-realism-overhaul-v270`)

- **Timed Refinery Batches (`w.plant.refineryBatches`)**: All 40 material recipes run through `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released/rework/scrapped/cancelled` via `P.enqueueRefineryBatch`, `P.cancelRefineryBatch`, and `P.tickRefinery`.
- **Product Routes (42 Products), Shared Machine Guard & Equipment Subsystems**: 3–4 stage domain routes with `opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint`, and `intermediateOut`; `m.lastPowerAt`/`m.lastThermalAt` prevent multi-job power/thermal multiplication in the same tick; machines track 5 `subsystems`, `faultModes`, `P.technicianCapability`, `serviceRecords`, and `purchased_new`/`used_refurbished`/`leased` acquisition modes.
- **Time-Bound Freight, 10 B2B Services & Real Software/QA/SLA**: Autonomous loops never pass `completeAllSteps: true`; freight enforces outbound/return elapsed time and driver rest; services require `workMinutesDone`, `testMeasurements`, `instrumentCustody`, and `storageHoursOccupied`; software requires qualified developers (`programming >= 40`, `software >= 40`), supports `discoverScopeChange`, and penalizes `deployWithKnownDefects`.
- **Physical Warehouse Lots (`w.warehouse`), Competitive Tenders (`w.commerce.tenders`), and 180m Biological Livestock Cycle**: `reconcileWarehouseLots` / `warehouseAudit` with FEFO/FIFO and cold-chain shelf life; `W.evaluateCompetitiveTender`, `renegotiateCommercialContract`, `terminateCommercialContract`, and `W.payFromCounterparty`; separated `feedLivestockHerd` and `milkLivestockHerd` (180m cycle) and external firm `cogsSatang`/`accrualProfitSatang`.
- Read `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`, `docs/company/LIVING_WORLD_SYSTEM.md`, and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md`. Verified with **186/186** tests (`test/process-realism-v270.test.cjs`).

## Historical v2.9.0 integration (source-backed; preceding release notes are historical)

Baselinef7167e2:190/190 tests. New sme-civics-v290.test.cjs adds13 behavioral cases; browser14, 12SME worlds×30days daily audit/save, syntax/core/build and benchmark. Include report/status/skills/standalone and all tracked files in one-root ZIP, CRC+allhash verification, fresh-extract check/test/build. Root master copies must match canonical files; no app Gemini sync claim.

Read `docs/company/SME_AND_CIVICS_SYSTEM.md` and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md`; verify with `test/sme-civics-v290.test.cjs` and relevant existing tests. This reference update does not claim a new mastery certification or a Gemini app update.

## Era 3 proposal routing — documentation update, 2026-11-12

The current runtime remains v2.9.0. `era3/ERA_3_FEATURE_AND_SMART_PHONES.md` is the canonical **proposed** major phone-industry design, accompanied by `era3/project_status_and_ai_onboarding.md`; root and COMPANY_SOURCE status copies must match the canonical English status. Two files provide context, not source access or an implementation. NPCs make all engineering/business decisions; the observer can inspect/time-control/edit conditions, never issue normal operational orders. Keep proposed dynamic products, semiconductor operations and external professionals separate from existing capabilities. Update status/report/skills with actual evidence when implementation occurs. Gemini app synchronization is not established by these repo files.

## Current v3.0.0 integration reference

Reference key: `phone-industry-soak.cjs`. Run npm test/check/build/test:browser, node tools/phone-industry-soak.cjs and benchmark. Preserve red-green regressions for price vs real BOM, outside-profile freeze, recruited education aliases and sector settlement. Verify actual campus research/enclosure manufacture. Sector soak distinguishes normal from explicitly endowed raw stocks. Update status/masters/domain references/report, inspect final ZIP CRC/path/all hashes and rerun checks/test/build after fresh extraction. Report app-skill access separately.

Read `docs/company/ERA3_PHONE_SYSTEM.md`, the v3 report and actual source. This source-reference update does not change starter maturity or certify the Gemini app skills.
