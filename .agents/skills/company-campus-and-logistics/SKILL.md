---
name: company-campus-and-logistics
description: Use when changing campus layout, reachable stations, expansion plots, freight vehicles, drivers, cargo custody, dispatch, or returns.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — พื้นที่ทำงาน การเดิน และโลจิสติกส์

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ให้ Gemini ตรวจ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/layout.js: findPath, validateLayout, addStation; js/sim.js: constructPlot, acquireFleetVehicle, acceptFreightContract, advanceFreightContract, matchBackhaulCargo` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐานเดิม: `COMPANY_SOURCE/test/layout-economy.test.cjs; campus-behavior.test.cjs; true-upstream-agri-fleet-software-v110.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- ตรวจพื้นที่และเส้นทางจริงเมื่อเพิ่มอาคาร/สถานี ไม่ทำงานจากจุดที่ไปไม่ถึง
- แยกเส้นทางคนในแคมปัสจากสัญญาขนส่งภายนอก
- รถยังไม่ว่างจนจบเงื่อนไขกลับ จองคนขับ น้ำหนัก/ปริมาตร/cargo และช่องโหลด
- แยก custody ลูกค้าจากสินค้าบริษัท คิดระยะรถเปล่า เชื้อเพลิง ค่าทาง ซ่อม เคลม และ backhaul จริง

## โจทย์ลองใช้หลังยกระดับ

รถรับเงินส่งของแล้วแต่ยังไม่กลับลาน: การรับงานใหม่ควรตรวจสถานะรถและคนขับตรงไหน?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

Update Method; source layout/freight ของ Company — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

operationReadiness checks freight knowledge and the assigned driver's driving level; centerCamera/minimumZoom fit the current viewport and both map axes.

อ่าน `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และกรณีตรวจ `test/knowledge-and-company.test.cjs`; สถานะร่างเดิมไม่เปลี่ยน maturity อัตโนมัติ

## v2.5.0 integration

sim.productionSteps/productionView expose actual timed assembly checkpoints; planStockProduction creates no-deposit internal stockBatch orders, excluded from activeOrders/shipping until ready stock is allocated on acceptance. Save accepts internal offerId=null only with stockBatch/deposit0/unitPrice1. api.frame uses2game minutes/real second at1×; move uses8cells/tick. Read v2.5.0 patch report for remaining manufacturing scope; do not claim dedicated machinery or government procurement completed.

## Verified v2.6.0 integration

Machines attach deterministically to existing assembly stations via P.stationFor; operators travel between steps. Technician must reach workshop before work, uses a reserved tick (no parallel production). New machinery lead times2/5/14days (wafer line180days) then installation; existing freight uses warehouse tools while retaining vehicle/fuel/custody lifecycle. No new machine sprites or dedicated buildings claimed.

Contract: `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`; report: `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md`. Existing starter maturity is unchanged.

## v2.7.0 Process-Driven Realism Overhaul (`process-driven-realism-overhaul-v270`)

- **Timed Refinery Batches (`w.plant.refineryBatches`)**: All 40 material recipes run through `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released/rework/scrapped/cancelled` via `P.enqueueRefineryBatch`, `P.cancelRefineryBatch`, and `P.tickRefinery`.
- **Product Routes (42 Products), Shared Machine Guard & Equipment Subsystems**: 3–4 stage domain routes with `opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint`, and `intermediateOut`; `m.lastPowerAt`/`m.lastThermalAt` prevent multi-job power/thermal multiplication in the same tick; machines track 5 `subsystems`, `faultModes`, `P.technicianCapability`, `serviceRecords`, and `purchased_new`/`used_refurbished`/`leased` acquisition modes.
- **Time-Bound Freight, 10 B2B Services & Real Software/QA/SLA**: Autonomous loops never pass `completeAllSteps: true`; freight enforces outbound/return elapsed time and driver rest; services require `workMinutesDone`, `testMeasurements`, `instrumentCustody`, and `storageHoursOccupied`; software requires qualified developers (`programming >= 40`, `software >= 40`), supports `discoverScopeChange`, and penalizes `deployWithKnownDefects`.
- **Physical Warehouse Lots (`w.warehouse`), Competitive Tenders (`w.commerce.tenders`), and 180m Biological Livestock Cycle**: `reconcileWarehouseLots` / `warehouseAudit` with FEFO/FIFO and cold-chain shelf life; `W.evaluateCompetitiveTender`, `renegotiateCommercialContract`, `terminateCommercialContract`, and `W.payFromCounterparty`; separated `feedLivestockHerd` and `milkLivestockHerd` (180m cycle) and external firm `cogsSatang`/`accrualProfitSatang`.
- Read `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`, `docs/company/LIVING_WORLD_SYSTEM.md`, and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md`. Verified with **186/186** tests (`test/process-realism-v270.test.cjs`).

## Historical v2.9.0 integration (source-backed; preceding release notes are historical)

SME origins own paid tools but lease 40–100m² in shared campus, paying rent and deposit. UI discloses shared-site scale; it is not a privately owned free industrial estate. Building/facility rights are not yet fully partitioned among tenants. Existing movement, machine availability and trade-route delays remain authoritative.

Read `docs/company/SME_AND_CIVICS_SYSTEM.md` and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md`; verify with `test/sme-civics-v290.test.cjs` and relevant existing tests. This reference update does not claim a new mastery certification or a Gemini app update.

## Historical v3.0.0 integration reference

Reference key: `campusMinutes`. Campus work credits campusMinutes only on actual qualified phoneWorkshop completion. These jobs compete with travel/needs/other work. Division phone stock is separate from the legacy warehouse and visible in the phone supply screen. Prepaid component/raw shipments cannot be truncated while live. External transport is aggregate route-days, not campus vehicle animation.

Read `docs/company/ERA3_PHONE_SYSTEM.md`, the v3 report and actual source. This source-reference update does not change starter maturity or certify the Gemini app skills.

## Current v3.1.0 integration reference

Reference key: `phone-engineering.js`, `phone-industry.js`, `phone-talent.js`, `world.js`, `sim.js`, `debug.js`. Models 12 executable phone supply-chain roles (`E.ROLE_CONTRACTS`: `fabless_soc`, `wafer_foundry`, `osat_packaging`, `dram_memory`, `nand_storage`, `camera_module`, `display_panel`, `battery_pack`, `pcb_rf`, `enclosure`, `os_platform`, `brand`) and 8 qualified material grades (`E.MATERIAL_GRADES`). Supports own-company entry and vertical integration (`I.enterCampusRole`), Fabless SoC -> Wafer Foundry -> OSAT orders (`foundryOrders`), persistent WIP batches (`wipBatches`), `declined_prudent` strategic refusal, and resolved normal-opening upstream supply starvation (`world.js`). Verified by `test/phone-supplier-ecosystem-v310.test.cjs` (**236/236** total tests) and `tools/phone-industry-soak.cjs`.
