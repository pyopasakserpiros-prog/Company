---
name: company-data-integrity
description: Use when adding catalog entries or runtime extensions, changing IDs, recipes, cross-references, numeric bounds, or prototype-safe lookup rules.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — ความครบถ้วนของข้อมูลและแค็ตตาล็อก

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ให้ Gemini ตรวจ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/data.js: registerSkill, registerRole, registerMaterial, registerProduct, registerTaskKind, validateCatalog; js/sim.js: addSkill/addRole/addMaterial/addProduct extension helpers` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐานเดิม: `COMPANY_SOURCE/test/continuity.test.cjs; core-baseline.test.cjs; quota-and-multi-industry.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- ตรวจ ID ซ้ำ/ไม่มีจริง/ชื่อสงวน prototype และเลขเกินขอบเขตก่อน mutate
- ตรวจ references ทั้งสูตร วัตถุดิบ ผลผลิต skill/role demand API UI และ save
- แยก type ของวัตถุดิบ เกรด หน่วย และเทคตามจริง ไม่ให้ชื่อรวมข้ามข้อจำกัด
- การลงทะเบียนสำเร็จไม่เท่ากับมี demand/NPC ใช้งาน ต้องกำหนดหลักฐานฝั่ง simulation

## โจทย์ลองใช้หลังยกระดับ

เพิ่มสินค้าใน registry ได้แล้วแต่ไม่มีออเดอร์เลย: สกิลนี้รับผิดชอบถึงตรงไหนและต้องส่งต่อสกิลธุรกิจใด?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

Agent Skills specification สำหรับโครงร่าง; Company registration/validation code — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

Validate every subject ID, weighted aptitude sum, prerequisite DAG, material map and business requirement; knowledge-catalog.cjs regenerates the reference directly from current source.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ

## v2.7.0 Process-Driven Realism Overhaul (`process-driven-realism-overhaul-v270`)

- **Timed Refinery Batches (`w.plant.refineryBatches`)**: All 40 material recipes run through `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released/rework/scrapped/cancelled` via `P.enqueueRefineryBatch`, `P.cancelRefineryBatch`, and `P.tickRefinery`.
- **Product Routes (42 Products), Shared Machine Guard & Equipment Subsystems**: 3–4 stage domain routes with `opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint`, and `intermediateOut`; `m.lastPowerAt`/`m.lastThermalAt` prevent multi-job power/thermal multiplication in the same tick; machines track 5 `subsystems`, `faultModes`, `P.technicianCapability`, `serviceRecords`, and `purchased_new`/`used_refurbished`/`leased` acquisition modes.
- **Time-Bound Freight, 10 B2B Services & Real Software/QA/SLA**: Autonomous loops never pass `completeAllSteps: true`; freight enforces outbound/return elapsed time and driver rest; services require `workMinutesDone`, `testMeasurements`, `instrumentCustody`, and `storageHoursOccupied`; software requires qualified developers (`programming >= 40`, `software >= 40`), supports `discoverScopeChange`, and penalizes `deployWithKnownDefects`.
- **Physical Warehouse Lots (`w.warehouse`), Competitive Tenders (`w.commerce.tenders`), and 180m Biological Livestock Cycle**: `reconcileWarehouseLots` / `warehouseAudit` with FEFO/FIFO and cold-chain shelf life; `W.evaluateCompetitiveTender`, `renegotiateCommercialContract`, `terminateCommercialContract`, and `W.payFromCounterparty`; separated `feedLivestockHerd` and `milkLivestockHerd` (180m cycle) and external firm `cogsSatang`/`accrualProfitSatang`.
- Read `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`, `docs/company/LIVING_WORLD_SYSTEM.md`, and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md`. Verified with **186/186** tests (`test/process-realism-v270.test.cjs`).

## Historical v2.9.0 integration (source-backed; preceding release notes are historical)

Release2.9.0, save/schema stay0.1.0/company-foundation-1. startup.PROFILES and REQUIREMENTS reference real subjects/products/machines/BOMs. C.category uses ID-based commodity groups, not HS customs codes. Add validation/reference tests before adding profiles or trade groups; no claimed new countries/catalog product count.

Read `docs/company/SME_AND_CIVICS_SYSTEM.md` and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md`; verify with `test/sme-civics-v290.test.cjs` and relevant existing tests. This reference update does not claim a new mastery certification or a Gemini app update.

## Historical v3.0.0 integration reference

Reference key: `phoneAudit`. sim phoneAudit combines industry/talent validation and missing-talent detection. Check design/chip/part/firm IDs, lot conservation, finite integer cash/counts, projects/contracts/cohorts and valid immutable profiles. Engineering evaluates interface/power/RAM limits; generated names do not prove compatibility. Run test/phone-engineering-v300.test.cjs and industry/talent cases with hostile numbers and corrupted references.

Read `docs/company/ERA3_PHONE_SYSTEM.md`, the v3 report and actual source. This source-reference update does not change starter maturity or certify the Gemini app skills.

## Current v3.1.0 integration reference

Reference key: `phone-engineering.js`, `phone-industry.js`, `phone-talent.js`, `world.js`, `sim.js`, `debug.js`. Models 12 executable phone supply-chain roles (`E.ROLE_CONTRACTS`: `fabless_soc`, `wafer_foundry`, `osat_packaging`, `dram_memory`, `nand_storage`, `camera_module`, `display_panel`, `battery_pack`, `pcb_rf`, `enclosure`, `os_platform`, `brand`) and 8 qualified material grades (`E.MATERIAL_GRADES`). Supports own-company entry and vertical integration (`I.enterCampusRole`), Fabless SoC -> Wafer Foundry -> OSAT orders (`foundryOrders`), persistent WIP batches (`wipBatches`), `declined_prudent` strategic refusal, and resolved normal-opening upstream supply starvation (`world.js`). Verified by `test/phone-supplier-ecosystem-v310.test.cjs` (**236/236** total tests) and `tools/phone-industry-soak.cjs`.
