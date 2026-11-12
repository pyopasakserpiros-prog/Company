---
name: company-world-and-markets
description: Use when changing suppliers, client demand, external corporations, commodity prices, competition, government events, or market news.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — โลกภายนอก ตลาด และบริษัทคู่ค้า

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ตรวจ [สถานะโครงการ](../../../project_status_and_ai_onboarding.md) และ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/data.js: GLOBAL_NATIONS, GEOPOLITICAL_EVENTS, EXTERNAL_CORPORATIONS, TRADE_CORRIDORS, FREIGHT_ROUTES; COMPANY_SOURCE/js/sim.js: freshGeopolitics, recomputeGeopoliticalMultipliers, changeForeignRegime, triggerGeopoliticalEvent, freshExternalWorld, simulateOffsiteEcosystemDaily, updateExternalWorld, evaluateExternalAssetsDaily, sellMaterialB2B, setCorporationRelation` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐาน: `COMPANY_SOURCE/test/ecosystem-multitier-dag-v100.test.cjs; scale-logistics-external-v040.test.cjs; geopolitics-living-world-v200.test.cjs; business-depth-world-corridors-v210.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/). โลกปัจจุบันมี 12 ประเทศ/กลุ่ม (`ID`, `AU`, `IN`, `SG` เพิ่มใน v2.1.0), 16 เหตุการณ์, 22 บริษัทภายนอก และ 4 ทางเดินการค้าภูมิภาค (`TRADE_CORRIDORS`); ตรวจผลส่งผ่านราคาจากการทดสอบจริง

## หัวข้อที่เสนอให้ขยาย

- แยกข่าว/ดัชนีที่เป็นข้อมูลกับธุรกรรมที่ย้ายเงินหรือสินค้า
- ลูกค้า/supplier ต้องมีเงื่อนไขความต้องการ ราคา คุณภาพ lead time และความเสี่ยงที่ใช้จริง
- ห้ามเติม stock/เงินให้บริษัทผู้เล่นจาก event โดยไม่มีแหล่งหรือบัญชีตามระบบ
- ให้ผลที่ผู้เล่นเห็นโยงกับการตัดสินใจและความสัมพันธ์จริง ไม่อ้างว่า external corp มี inventory/capacity ละเอียดถ้ายังไม่มี

## โจทย์ลองใช้หลังยกระดับ

ข่าว supply shock เกิดขึ้นแล้วราคา/lead time/ปริมาณซื้อเปลี่ยนจริงหรือแค่มีข้อความ จะตรวจอย่างไร?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

Update Method; systematic-debugging; ecosystem tests ของ Company — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

reviewKnowledge reads actual geopolitics.sectorDemandMultipliers and government.demandMultiplier when ranking research candidates; do not invent a productDemandMultipliers field that the world never writes.

อ่าน `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และกรณีตรวจ `test/knowledge-and-company.test.cjs`; สถานะร่างเดิมไม่เปลี่ยน maturity อัตโนมัติ

## v2.4.0 — Verified living-world integration

`js/world.js` now owns `externalWorld.living`: ensure/step/apply/validate/scenario/quote/sellToPlayer/receivePlayerSale. 12 nations/blocs, 28 opening firms (22 catalog + 5 regional + finite wholesale exchange), 66 relations. Daily government/corporate decisions use actual indicators and account balances. Stocks and paid goods in transit are separate. Existing scripted manual scenarios remain; periodic random event/regime/corporate-news rotation is removed. Read LIVING_WORLD_SYSTEM.md before changing supply or policies. Never regenerate opening stocks on daily steps. Company-wide cash conservation includes explicit playerNetSatang for material trades only; legacy product/service/software/freight contracts are not all linked to firm wallets. Do not claim agent-level households, real military or jurisdiction tax laws.

Contract: `docs/company/LIVING_WORLD_SYSTEM.md`; evidence: `COMPANY_SOURCE/test/living-world-v240.test.cjs`, `test/campus-browser.cjs` and patch report. Existing starter maturity is unchanged.

## Verified v2.6.0 integration

world.js reserveCommercial/payCommercial/closeCommercial/recordProductDelivery connect new warehouse/B2B/public procurement buyers to finite real budgets. commercialEscrows counted in global conservation. Existing generic market/software/freight/service contracts are not all retrofitted. Actual new-contract deliveries increment buyer.finishedGoods and commerce.delivered; refunds return unspent reserve.

Contract: `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`; report: `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md`. Existing starter maturity is unchanged.

## v2.7.0 Process-Driven Realism Overhaul (`process-driven-realism-overhaul-v270`)

- **Timed Refinery Batches (`w.plant.refineryBatches`)**: All 40 material recipes run through `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released/rework/scrapped/cancelled` via `P.enqueueRefineryBatch`, `P.cancelRefineryBatch`, and `P.tickRefinery`.
- **Product Routes (42 Products), Shared Machine Guard & Equipment Subsystems**: 3–4 stage domain routes with `opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint`, and `intermediateOut`; `m.lastPowerAt`/`m.lastThermalAt` prevent multi-job power/thermal multiplication in the same tick; machines track 5 `subsystems`, `faultModes`, `P.technicianCapability`, `serviceRecords`, and `purchased_new`/`used_refurbished`/`leased` acquisition modes.
- **Time-Bound Freight, 10 B2B Services & Real Software/QA/SLA**: Autonomous loops never pass `completeAllSteps: true`; freight enforces outbound/return elapsed time and driver rest; services require `workMinutesDone`, `testMeasurements`, `instrumentCustody`, and `storageHoursOccupied`; software requires qualified developers (`programming >= 40`, `software >= 40`), supports `discoverScopeChange`, and penalizes `deployWithKnownDefects`.
- **Physical Warehouse Lots (`w.warehouse`), Competitive Tenders (`w.commerce.tenders`), and 180m Biological Livestock Cycle**: `reconcileWarehouseLots` / `warehouseAudit` with FEFO/FIFO and cold-chain shelf life; `W.evaluateCompetitiveTender`, `renegotiateCommercialContract`, `terminateCommercialContract`, and `W.payFromCounterparty`; separated `feedLivestockHerd` and `milkLivestockHerd` (180m cycle) and external firm `cogsSatang`/`accrualProfitSatang`.
- Read `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`, `docs/company/LIVING_WORLD_SYSTEM.md`, and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md`. Verified with **186/186** tests (`test/process-realism-v270.test.cjs`).

## Current v2.9.0 integration (source-backed; preceding release notes are historical)

civics.js owns governments/leaders, ministries, commodity policies, treaties and budgeted conflicts. W.quote/trade/sellToPlayer apply these to real stock and cash. Verify commodity-specific exemptions, policy notice/expiry, actual customs, staged agreements and ceasefire recovery; do not treat fictional leaders/bloc councils as real legal structures.

Read `docs/company/SME_AND_CIVICS_SYSTEM.md` and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md`; verify with `test/sme-civics-v290.test.cjs` and relevant existing tests. This reference update does not claim a new mastery certification or a Gemini app update.
