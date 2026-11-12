---
name: company-supply-chain-and-resources
description: Use when adding materials or recipes, farming and seed cycles, mining, upstream provenance, make-or-buy, or material procurement.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — วัตถุดิบ ต้นน้ำ และซัพพลายเชน

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ตรวจ [สถานะโครงการ](../../../project_status_and_ai_onboarding.md) และ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/data.js: RESOURCE_CLASSES, AGRICULTURE_CROPS, MATERIAL_RECIPES, PRODUCTION_CHAINS, TRUE_RESOURCE_CHAIN_TABLE; js/sim.js: craftMaterialRecipe, treatMineralSlag, plantCropPlot, careCropPlot, harvestCropPlot, saveSeedFromCrop, runMidstreamRefining, planPurchases` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน). แค็ตตาล็อกปัจจุบันมี 64 วัตถุดิบ/40 สูตร (รวมสายโลหะขั้นบันไดและกากแร่ `mineral_slag_mud`); เทียบ ID กับ source ก่อนใช้ข้อเสนอ
- ตัวอย่างหลักฐาน: `COMPANY_SOURCE/test/true-upstream-agri-fleet-software-v110.test.cjs; external-assets-production-chains-v060.test.cjs; product-depth-npc-board-v130.test.cjs; business-depth-world-corridors-v210.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- แยกแร่/น้ำธรรมชาติ พันธุ์ พืชผล ผลพลอยได้ และของแปรรูป ไม่ใช้ tier แทนทุกมิติ
- น้ำตาล แป้ง กระดาษ ข้าว แนฟทา/ดีเซลไม่ใช่ต้นน้ำธรรมชาติ
- ทุกสูตรแปรรูปต้องตามต้นทางได้ ใช้ N/P/K จากแหล่งที่มีธาตุนั้นและมีต้นทุนจริง
- ทำทางซื้อเมื่อเทคผลิตเองยังขาด พร้อม lead time และการหักสต็อก/พันธุ์ตามจริง

## โจทย์ลองใช้หลังยกระดับ

สูตรหินฟอสเฟต/โพแทช+น้ำให้ NPK มีอะไรขาด และจะแยกทางซื้อกับผลิตเองอย่างไร?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

systematic-debugging; แหล่งและสเปกทรัพยากรของ Company — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

Prototype inputs join normal purchase demand; material qualifications are per process and learned subjects. Farmland ownership does not teach baking; planting/harvesting/livestock need their own knowledge.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ

## v2.4.0 — Verified living-world integration

External firms consume D.MATERIAL_RECIPES inputs and produce all catalog outputs/byproducts; natural extraction draws finite reserves, environmental flows are capacity-limited. Supported crop cycles consume real planting stock, water, fertilizer and wait at least two daily steps; save seed from gross harvest. Unsupported biological upstream processes do not auto-produce. Wholesale opening500/material is finite and buys replenishment from real producers. PO reserves seller stock immediately; buyer physical inventory arrives through existing pipeline. External interfirm goods remain living.shipments until delivery.

Contract: `docs/company/LIVING_WORLD_SYSTEM.md`; evidence: `COMPANY_SOURCE/test/living-world-v240.test.cjs`, `test/campus-browser.cjs` and patch report. Existing starter maturity is unchanged.

## Verified v2.6.0 integration

Material recipes map to grain mill/smelter/reactor/fab and other equipment. Missing machines may fall back to existing real supplier pipeline. Repair parts metal_sheet/polymer_resin/wire_harness have actual consumption in plant.partsConsumed; purchase planning includes unmet maintenance needs. Warehouse space uses product footprint1/3/6 slots, pack jobs reserve capacity; stock planning pauses at80%.

Contract: `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`; report: `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md`. Existing starter maturity is unchanged.

## v2.7.0 Process-Driven Realism Overhaul (`process-driven-realism-overhaul-v270`)

- **Timed Refinery Batches (`w.plant.refineryBatches`)**: All 40 material recipes run through `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released/rework/scrapped/cancelled` via `P.enqueueRefineryBatch`, `P.cancelRefineryBatch`, and `P.tickRefinery`.
- **Product Routes (42 Products), Shared Machine Guard & Equipment Subsystems**: 3–4 stage domain routes with `opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint`, and `intermediateOut`; `m.lastPowerAt`/`m.lastThermalAt` prevent multi-job power/thermal multiplication in the same tick; machines track 5 `subsystems`, `faultModes`, `P.technicianCapability`, `serviceRecords`, and `purchased_new`/`used_refurbished`/`leased` acquisition modes.
- **Time-Bound Freight, 10 B2B Services & Real Software/QA/SLA**: Autonomous loops never pass `completeAllSteps: true`; freight enforces outbound/return elapsed time and driver rest; services require `workMinutesDone`, `testMeasurements`, `instrumentCustody`, and `storageHoursOccupied`; software requires qualified developers (`programming >= 40`, `software >= 40`), supports `discoverScopeChange`, and penalizes `deployWithKnownDefects`.
- **Physical Warehouse Lots (`w.warehouse`), Competitive Tenders (`w.commerce.tenders`), and 180m Biological Livestock Cycle**: `reconcileWarehouseLots` / `warehouseAudit` with FEFO/FIFO and cold-chain shelf life; `W.evaluateCompetitiveTender`, `renegotiateCommercialContract`, `terminateCommercialContract`, and `W.payFromCounterparty`; separated `feedLivestockHerd` and `milkLivestockHerd` (180m cycle) and external firm `cogsSatang`/`accrualProfitSatang`.
- Read `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`, `docs/company/LIVING_WORLD_SYSTEM.md`, and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md`. Verified with **186/186** tests (`test/process-realism-v270.test.cjs`).

## Historical v2.9.0 integration (source-backed; preceding release notes are historical)

W.quote chooses real stock-available suppliers by landed price, route time, partner/rival price and known country risk. Purchase records retain origin, customsTaxSatang, tradePolicyIds/reason; all actual sellers accumulate delivery/spend history. C.quote applies finite daily export quota and commodity-specific policy. Startup manufacturing buys intermediate BOM stock, not fictional upstream ownership.

Read `docs/company/SME_AND_CIVICS_SYSTEM.md` and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md`; verify with `test/sme-civics-v290.test.cjs` and relevant existing tests. This reference update does not claim a new mastery certification or a Gemini app update.

## Current v3.0.0 integration reference

Reference key: `phone-industry.js`. Owned CPU/RAM/storage/display/camera/battery/enclosure lots retain design IDs. Raw/component prepaid contracts reserve finite seller stock and delay delivery with Civics.quote policy/customs. No physical gifts at opening. Keep needed older chips producible. lots satisfy quantity=available+reserved+used+sold. Coarse legacy processed inputs are not true upstream resources; dedicated purity routes remain unfinished.

Read `docs/company/ERA3_PHONE_SYSTEM.md`, the v3 report and actual source. This source-reference update does not change starter maturity or certify the Gemini app skills.
