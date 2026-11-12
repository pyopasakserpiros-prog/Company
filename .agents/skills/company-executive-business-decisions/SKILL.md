---
name: company-executive-business-decisions
description: Use when an NPC company has cash but does not diversify, or when changing investment, business entry, technology gates, reserves, or executive decisions.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — ผู้บริหาร การลงทุน และการแตกธุรกิจ

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ตรวจ [สถานะโครงการ](../../../project_status_and_ai_onboarding.md) และ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/sim.js: evaluateFacilityInvestment, evaluatePlotConstruction, evaluateDebtRepayment, acquireExternalAsset, acquireFleetVehicle, evaluateNewBusinessOperationsDaily, computeFinancialPools, reserveBoardBudget, consumeBoardReservation, cancelBoardReservation, evaluateExecutiveBoardAndBusinessEntry, recordBoardDecision` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน; ใน v2.1.0 บอร์ดประเมินเวลา 10:45 น. `tod(w) === 645`, แยกงบที่จองกับทุนที่จ่ายแล้ว, รองรับบริษัท <10 คน และบังคับใช้ `nextReviewDay`)
- ตัวอย่างหลักฐาน: `COMPANY_SOURCE/test/campus-behavior.test.cjs; external-assets-production-chains-v060.test.cjs; product-depth-npc-board-v130.test.cjs; business-depth-world-corridors-v210.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/). ระบบบอร์ดและเงินสดอิสระมีแล้ว; ใช้สกิลนี้ออกแบบการต่อยอด ไม่เขียนเหมือนไม่มี call-site

## หัวข้อที่เสนอให้ขยาย

- ตรวจ call-site ว่าเคยเสนอทางเลือกจริงก่อนสรุปว่า CEO ไม่ชอบเสี่ยง
- แยกข้อจำกัดทุน/ความรู้/เทค/คน/เครื่อง/ตลาด/ทุนหมุนเวียนกับการตัดสินใจไม่ทำ
- ให้มีทางเลือกเก็บเงิน ทดลอง จ้างช่วง ฝึกทีม หรือขยายตามความเหมาะสม
- บันทึกตัวเลือกที่ประเมิน เหตุผลมติ ผู้ตัดสินใจ งบที่จอง และเวลาทบทวน

## โจทย์ลองใช้หลังยกระดับ

เงินมากและตลาดรถเย็นดีแต่ไม่มีคนขับพร้อม: แยก planner ที่ขาดกับการเลือกเตรียมความสามารถอย่างไร?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

systematic-debugging; source Company และ ideas บท 28–32 — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

reviewKnowledge / productReadiness / acquireTechnologyLicense: cash, team coverage, market and cost shape research-versus-purchase decisions. License purchase pays real money and never instantly qualifies manufacturing.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ

## Verified v2.6.0 integration

At11:15 CEO/autonomy may buy required equipment with18-day cash reserve; >5m satang equipment needs50 shipped units. At11:30 commercial sales evaluates inventory sales and weekly contracts afterday14, history/knowledge/cash/prudence/ambition. Contracts120/240/1000 aggregate units release4–80-unit installments only after prior paid. Government requires rep65, quality_documentation40, contract_management25, no deposit and7-day payment. Procurement is simplified solicitation, not competitive multi-bid legal tender.

Contract: `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`; report: `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md`. Existing starter maturity is unchanged.

## v2.7.0 Process-Driven Realism Overhaul (`process-driven-realism-overhaul-v270`)

- **Timed Refinery Batches (`w.plant.refineryBatches`)**: All 40 material recipes run through `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released/rework/scrapped/cancelled` via `P.enqueueRefineryBatch`, `P.cancelRefineryBatch`, and `P.tickRefinery`.
- **Product Routes (42 Products), Shared Machine Guard & Equipment Subsystems**: 3–4 stage domain routes with `opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint`, and `intermediateOut`; `m.lastPowerAt`/`m.lastThermalAt` prevent multi-job power/thermal multiplication in the same tick; machines track 5 `subsystems`, `faultModes`, `P.technicianCapability`, `serviceRecords`, and `purchased_new`/`used_refurbished`/`leased` acquisition modes.
- **Time-Bound Freight, 10 B2B Services & Real Software/QA/SLA**: Autonomous loops never pass `completeAllSteps: true`; freight enforces outbound/return elapsed time and driver rest; services require `workMinutesDone`, `testMeasurements`, `instrumentCustody`, and `storageHoursOccupied`; software requires qualified developers (`programming >= 40`, `software >= 40`), supports `discoverScopeChange`, and penalizes `deployWithKnownDefects`.
- **Physical Warehouse Lots (`w.warehouse`), Competitive Tenders (`w.commerce.tenders`), and 180m Biological Livestock Cycle**: `reconcileWarehouseLots` / `warehouseAudit` with FEFO/FIFO and cold-chain shelf life; `W.evaluateCompetitiveTender`, `renegotiateCommercialContract`, `terminateCommercialContract`, and `W.payFromCounterparty`; separated `feedLivestockHerd` and `milkLivestockHerd` (180m cycle) and external firm `cogsSatang`/`accrualProfitSatang`.
- Read `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`, `docs/company/LIVING_WORLD_SYSTEM.md`, and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md`. Verified with **186/186** tests (`test/process-realism-v270.test.cjs`).

## v2.8.0 Multi-Scenario Crisis Resolution & Counterfactual Divergence (`living-scenarios-observability-and-human-depth-v280`)

- **Operational Crisis & Bottleneck Resolution (`S.evaluateOperationalCrisesAndBottlenecks`, `S.contractOemMaintenance`, `S.unreservePartForRepair`)**: At `11:20` (`tod === 680`), executives and coordinators evaluate broken machines, missing specialist knowledge, late contracts, and unsold stock. `P.maintain` iterates all maintenance tasks without head-of-line blocking, `unreservePartForRepair` frees parts locked by unstarted units, `contractOemMaintenance` hires external OEM repair when internal repair is blocked, `evaluateAutonomousHiring` recruits specialists for missing subjects, and `evaluateCommercialSales` renegotiates late contracts (`renegotiateCommercialContract`) or discounts stagnant finished stock (`clearanceDiscountPct`).
- **Counterfactual Comparison (`S.runCounterfactualComparison`)**: Compares identical world seeds across CEO personality, technician knowledge, or capital changes. Verified with **190/190** tests (`test/living-scenarios-human-depth-v280.test.cjs`).
