---
name: company-economy-and-accounting
description: Use when changing company cash, revenue, receivables, deposits, debt, wages, personal wallets, grants, or conservation rules.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — บัญชี เศรษฐกิจ และกระแสเงินสด

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ตรวจ [สถานะโครงการ](../../../project_status_and_ai_onboarding.md) และ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/economy.js: post, auditFinance; js/sim.js: pay, payBills, audit, computeFinancialPools, reserveBoardBudget, consumeBoardReservation, sellMaterialB2B, acquireExternalAsset, acquireFleetVehicle, directorEdit` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐาน: `COMPANY_SOURCE/test/layout-economy.test.cjs; continuity.test.cjs; simulation.test.cjs; business-depth-world-corridors-v210.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- เงินภายในเป็นสตางค์จำนวนเต็ม แยกบริษัท กระเป๋าคน เงินมัดจำ ลูกหนี้ และภาระจ่าย
- รับเงินไม่เท่ากับรับรู้รายได้ invoice ไม่เท่ากับเงินสด ใช้ reference ป้องกันลงบัญชีซ้ำ
- ติดตามแหล่งรายได้/ต้นทุนและการเคลื่อนไหว stock อย่าให้ปันผลซ้ำยอดขายผลผลิตเดียวกัน
- แยกการเสกโดยผู้เล่นที่มีบัญชีแหล่งที่มาออกจากรายได้ธุรกิจปกติ

## โจทย์ลองใช้หลังยกระดับ

โครงการซอฟต์แวร์รับมัดจำแล้วถูกยกเลิก: เงิน ภาระส่งมอบ/คืนเงิน และกำไรควรตรวจแยกอย่างไร?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

systematic-debugging; economy.js และ accounting tests ของ Company — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

Research tuition/experiments and technology license costs post equipment expenses; personal after-work learning reduces wallet and increases outsideSpending, preserving payroll identities. Never recognize prototypes as sales.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ

## v2.4.0 — Verified living-world integration

World module uses integer satang in firm/nation accounts and exact cash conservation. Player materials PO cost equals seller receipt + import tax to TH; B2B sale debits buyer cash and adds buyer stock. `playerNetSatang` reconciles these explicit player boundary flows. External daily levy is simplified 15% of positive cash surplus, not jurisdiction accounting profit. Main product/service contract finance remains existing system. Never describe world accounts as covering every main contract.

Contract: `docs/company/LIVING_WORLD_SYSTEM.md`; evidence: `COMPANY_SOURCE/test/living-world-v240.test.cjs`, `test/campus-browser.cjs` and patch report. Existing starter maturity is unchanged.

## Verified v2.6.0 integration

Purchases/repairs post equipment expenses. Machine energy becomes incremental utility consumption; partsConsumed reconciles repair materials separately. Commercial reserve/pay/close are World escrow transfers, not sales on signature. Firm or TH treasury must reserve full contract funds; only actual deposits/invoices reach company cash. Sum world cash includes escrow balances. commerce.paidSatang must equal escrow.paid.

Contract: `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`; report: `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md`. Existing starter maturity is unchanged.

## v2.7.0 Process-Driven Realism Overhaul (`process-driven-realism-overhaul-v270`)

- **Timed Refinery Batches (`w.plant.refineryBatches`)**: All 40 material recipes run through `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released/rework/scrapped/cancelled` via `P.enqueueRefineryBatch`, `P.cancelRefineryBatch`, and `P.tickRefinery`.
- **Product Routes (42 Products), Shared Machine Guard & Equipment Subsystems**: 3–4 stage domain routes with `opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint`, and `intermediateOut`; `m.lastPowerAt`/`m.lastThermalAt` prevent multi-job power/thermal multiplication in the same tick; machines track 5 `subsystems`, `faultModes`, `P.technicianCapability`, `serviceRecords`, and `purchased_new`/`used_refurbished`/`leased` acquisition modes.
- **Time-Bound Freight, 10 B2B Services & Real Software/QA/SLA**: Autonomous loops never pass `completeAllSteps: true`; freight enforces outbound/return elapsed time and driver rest; services require `workMinutesDone`, `testMeasurements`, `instrumentCustody`, and `storageHoursOccupied`; software requires qualified developers (`programming >= 40`, `software >= 40`), supports `discoverScopeChange`, and penalizes `deployWithKnownDefects`.
- **Physical Warehouse Lots (`w.warehouse`), Competitive Tenders (`w.commerce.tenders`), and 180m Biological Livestock Cycle**: `reconcileWarehouseLots` / `warehouseAudit` with FEFO/FIFO and cold-chain shelf life; `W.evaluateCompetitiveTender`, `renegotiateCommercialContract`, `terminateCommercialContract`, and `W.payFromCounterparty`; separated `feedLivestockHerd` and `milkLivestockHerd` (180m cycle) and external firm `cogsSatang`/`accrualProfitSatang`.
- Read `docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md`, `docs/company/LIVING_WORLD_SYSTEM.md`, and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md`. Verified with **186/186** tests (`test/process-realism-v270.test.cjs`).

## Historical v2.9.0 integration (source-backed; preceding release notes are historical)

B.configure opening paid-in capital = cash + equipment + stock + 30-day deposit + registration/preparation, all satang. W.sellToPlayer splits landed payment into supplier receipt and destination customs; C.recordTrade records real transactions. Conflict spending is treasury-to-domestic-sector transfer. Software deposits/UAT/final receipts require W.payFromCounterparty success. Project labor allocation remains approximate.

Read `docs/company/SME_AND_CIVICS_SYSTEM.md` and `docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md`; verify with `test/sme-civics-v290.test.cjs` and relevant existing tests. This reference update does not claim a new mastery certification or a Gemini app update.

## Historical v3.0.0 integration reference

Reference key: `investmentIncome`. Phone transfers post actual world firm receipts/payments, customs to treasury, wages/refunds to households and sales from household budgets. World.step sector callback precedes review/tax/history. expansion funds the campus division; investmentIncome permits positive profitable dividends, not a refund of contributed capital. Check playerNetSatang, national capitalReceipts and all conservation. COGS/raw valuation/tax remain approximate.

Read `docs/company/ERA3_PHONE_SYSTEM.md`, the v3 report and actual source. This source-reference update does not change starter maturity or certify the Gemini app skills.

## Current v3.1.0 integration reference

Reference key: `phone-engineering.js`, `phone-industry.js`, `phone-talent.js`, `world.js`, `sim.js`, `debug.js`. Models 12 executable phone supply-chain roles (`E.ROLE_CONTRACTS`: `fabless_soc`, `wafer_foundry`, `osat_packaging`, `dram_memory`, `nand_storage`, `camera_module`, `display_panel`, `battery_pack`, `pcb_rf`, `enclosure`, `os_platform`, `brand`) and 8 qualified material grades (`E.MATERIAL_GRADES`). Supports own-company entry and vertical integration (`I.enterCampusRole`), Fabless SoC -> Wafer Foundry -> OSAT orders (`foundryOrders`), persistent WIP batches (`wipBatches`), `declined_prudent` strategic refusal, and resolved normal-opening upstream supply starvation (`world.js`). Verified by `test/phone-supplier-ecosystem-v310.test.cjs` (**236/236** total tests) and `tools/phone-industry-soak.cjs`.
