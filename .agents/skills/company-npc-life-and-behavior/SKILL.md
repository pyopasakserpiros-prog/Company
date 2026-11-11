---
name: company-npc-life-and-behavior
description: Use when changing NPC personality effects, work/rest choices, relationships, learning, life events, or explanations of behavior.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — ชีวิต บุคลิก และการตัดสินใจ NPC

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ให้ Gemini ตรวจ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/js/human-core.js (อ่านเท่านั้น); js/sim.js: selectJob, personStep, pickColleagueToHelp, updateSocial, evaluatePersonalLifeMilestones` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐานเดิม: `COMPANY_SOURCE/test/simulation.test.cjs; campus-behavior.test.cjs; workforce-career-realism.test.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- ห้ามแก้สูตรแกนที่ล็อก เพิ่มระบบชีวิตภายนอกแกนผ่านสัญญาที่รองรับ
- แยกนิสัย ทักษะ ความเหนื่อย ข้อมูล ความสัมพันธ์ และทรัพยากรก่อนอธิบายเหตุผล
- การเปลี่ยนนิสัยต้องมีผลต่อ choice weights จริง ไม่ใช่แค่ข้อความสุ่ม
- ตัวอย่างเปรียบเทียบก่อน/หลังต้องแยกผลจาก RNG หรือสถานการณ์ที่เปลี่ยนร่วม

## โจทย์ลองใช้หลังยกระดับ

ผู้เล่นเพิ่มความรอบคอบของ CEO: จะสังเกตผลอย่างไรโดยไม่บังคับว่าเขาต้องปฏิเสธทุกการลงทุน?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

systematic-debugging; Update Method; human-core model ของโครงการ — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

learnSubject / personalStudyTick: individual interests, after-work study funded from personal wallet, weighted aptitude/potential, energy/stress and learned experience; no company-type subject locks.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ
