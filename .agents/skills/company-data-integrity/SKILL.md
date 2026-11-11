---
name: company-data-integrity
description: Use when adding catalog entries or runtime extensions, changing IDs, recipes, cross-references, numeric bounds, or prototype-safe lookup rules.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — ความครบถ้วนของข้อมูลและแค็ตตาล็อก

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง v1.2.0 ให้ Gemini ตรวจ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/data.js: registerSkill, registerRole, registerMaterial, registerProduct, registerTaskKind, validateCatalog; js/sim.js: addSkill/addRole/addMaterial/addProduct extension helpers` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐานเดิม: `COMPANY_SOURCE/test/continuity.test.cjs; core-baseline.test.cjs; quota-and-multi-industry.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- ตรวจ ID ซ้ำ/ไม่มีจริง/ชื่อสงวน prototype และเลขเกินขอบเขตก่อน mutate
- ตรวจ references ทั้งสูตร วัตถุดิบ ผลผลิต skill/role demand API UI และ save
- แยก type ของวัตถุดิบ เกรด หน่วย และเทคตามจริง ไม่ให้ชื่อรวมข้ามข้อจำกัด
- การลงทะเบียนสำเร็จไม่เท่ากับมี demand/NPC ใช้งาน ต้องกำหนดหลักฐานฝั่ง simulation

## โจทย์ลองใช้หลังยกระดับ

เพิ่มสินค้าใน registry ได้แล้วแต่ไม่มีออเดอร์เลย: สกิลนี้รับผิดชอบถึงตรงไหนและต้องส่งต่อสกิลธุรกิจใด?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

Agent Skills specification สำหรับโครงร่าง; Company registration/validation code — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master
