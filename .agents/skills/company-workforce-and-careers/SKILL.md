---
name: company-workforce-and-careers
description: Use when changing hiring, skills/training, mentoring, employee capacity, promotions, career quotas, or performance bonuses.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — กำลังคน อาชีพ และการเติบโต

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง v1.2.0 ให้ Gemini ตรวจ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/data.js: CAREER_QUOTAS, CAREER_LADDERS, getCareerStep, resolveOrgAssignment; js/sim.js: evaluateAutonomousHiring, getDepartmentHeadroom, findSupervisorForRole, evaluatePromotions, evaluateBonuses` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐานเดิม: `COMPANY_SOURCE/test/quota-and-multi-industry.test.cjs; hierarchy-10lv-greenfield-v050.test.cjs; workforce-career-realism.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- แยกทักษะที่เรียนได้จากคุณลักษณะแกนและอำนาจตามโครงสร้าง
- เลื่อนขั้นต้องมีตำแหน่งว่างและการประเมินจริง ไม่เพียงทำงานนานครบเกณฑ์
- ตรวจคนเดียวไม่ถูกจองซ้อนข้าม dev/บริการ/ผลิต/ขนส่ง
- ตรวจ merit/relationships/ค่านิยมผู้ประเมินและผลต่อคนที่ถูกมองข้าม พร้อมค่าใช้จ่ายจ้าง/ฝึกจริง

## โจทย์ลองใช้หลังยกระดับ

วิศวกรคนเดียวรับโปรเจกต์แอปกับซ่อมภาคสนามพร้อมกัน: quota ของตำแหน่งช่วยป้องกันได้หรือยังต้องมี capacity booking?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

systematic-debugging; workforce/organization specs ของ Company — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master
