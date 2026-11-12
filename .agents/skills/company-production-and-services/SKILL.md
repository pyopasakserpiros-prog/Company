---
name: company-production-and-services
description: Use when changing manufacturing, QA/rework, software/SaaS projects, industrial services, or lifecycle completion requirements.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — การผลิต ซอฟต์แวร์ และบริการ

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ตรวจ [สถานะโครงการ](../../../project_status_and_ai_onboarding.md) และ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/data.js: BUSINESS_PROCESS_MODELS, SECTOR_PROCESS_MODELS, INDUSTRIAL_SERVICES; COMPANY_SOURCE/js/sim.js: ensureJobs, finishJob, startSoftwareProject, advanceSoftwareProject, updateSaasSubscription, startServiceOrder, advanceServiceOrder` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน). ปัจจุบันมี 8 process models, สินค้า 40 ชนิด และ 8 บริการ B2B (รวม `energy_epc_install` และ `b2b_technical_academy`)
- ตัวอย่างหลักฐาน: `COMPANY_SOURCE/test/continuity.test.cjs; true-upstream-agri-fleet-software-v110.test.cjs; product-depth-npc-board-v130.test.cjs; business-depth-world-corridors-v210.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- เขียน lifecycle เฉพาะธุรกิจพร้อม input/output เวลา คน เครื่อง และ QC จริง
- จองทรัพยากรและตรวจของที่ต้องใช้ก่อนทำงาน ไม่ทำสำเร็จเมื่ออะไหล่/งบไม่ครบ
- แยกคำสั่งสาธิต/test helper ออกจากเส้นทาง NPC รับ/เดินงานเอง
- ตรวจการ retry ยกเลิก รับประกัน support และ billing ซ้ำ; อย่านับทุก app ว่า live เพราะมีชื่อใน registry

## โจทย์ลองใช้หลังยกระดับ

ใบงานบริการขาดอะไหล่แต่ถูกทำ paid: ต้องตรวจ transition/consumption/ledger และตัวเรียกอัตโนมัติส่วนใด?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

systematic-debugging; webapp-testing สำหรับผลที่แสดงใน UI — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

productReadiness, materialReady, SERVICE_SUBJECTS and software/field-operation matrices enforce learned knowledge. Prototype samples add to inventory.consumed and knowledge.materialsConsumed, reconciled in audit.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ

## v2.5.0 integration

sim.productionSteps/productionView expose actual timed assembly checkpoints; planStockProduction creates no-deposit internal stockBatch orders, excluded from activeOrders/shipping until ready stock is allocated on acceptance. Save accepts internal offerId=null only with stockBatch/deposit0/unitPrice1. api.frame uses2game minutes/real second at1×; move uses8cells/tick. Read v2.5.0 patch report for remaining manufacturing scope; do not claim dedicated machinery or government procurement completed.
