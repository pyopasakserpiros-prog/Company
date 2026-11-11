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

ฐานอ้างอิง v1.2.0 ให้ Gemini ตรวจ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/sim.js: evaluateFacilityInvestment, evaluatePlotConstruction, evaluateDebtRepayment, acquireExternalAsset, evaluateNewBusinessOperationsDaily` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐานเดิม: `COMPANY_SOURCE/test/campus-behavior.test.cjs; external-assets-production-chains-v060.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

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
