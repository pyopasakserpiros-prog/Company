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
