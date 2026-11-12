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
