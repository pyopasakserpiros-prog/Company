---
name: company-qa-and-delivery
description: Use when verifying a Company patch, collecting NPC behavior evidence, writing update reports, packaging a full project ZIP, or integrating returned chat-app work.
metadata:
  maturity: starter-draft
  intended-project: Company
---

# ร่างตั้งต้น — QA เอกสาร และส่งมอบ ZIP

**สถานะ: ร่างตั้งต้นใน repo รอ Gemini ยกระดับ ยังไม่ใช่ Master Skill ที่ผ่านการใช้งานจริง และยังไม่ยืนยันการอัปเดตสกิลในแอป Gemini**

## จุดเริ่มในโครงการ

ฐานอ้างอิง source v2.2.0; ตรวจ [สถานะโครงการ](../../../project_status_and_ai_onboarding.md) และ source ล่าสุดก่อนเชื่อชื่อ/พฤติกรรม:

- Source: `COMPANY_SOURCE/package.json; tools/test.cjs, verify.cjs, build.cjs, core-review.cjs, benchmark.cjs; test/campus-browser.cjs; test/business-depth-world-corridors-v210.test.cjs` (รายการต่อจากไฟล์แรกใช้ราก COMPANY_SOURCE เช่นกัน)
- ตัวอย่างหลักฐาน: `COMPANY_SOURCE/test/core-baseline.test.cjs; final-core.test.cjs; business-depth-world-corridors-v210.test.cjs; campus-browser.cjs` (ชื่อที่ตามมาอยู่ test/ เว้นแต่ระบุ tools/)

## หัวข้อที่เสนอให้ขยาย

- ใช้ผลรันจริงและสถานการณ์อัตโนมัติ ไม่คัดจำนวนเทสต์เก่าหรืออ้าง command path ว่าเป็น autonomous
- npm test ไม่รวม browser suite; build ปัจจุบันสร้าง CompanyFoundation_single.html เท่านั้น ตรวจ alias ที่แจกจริงแยก
- ทุกแพตช์อัปเดตสกิลที่เกี่ยวข้อง project status เอกสาร รายงานและดัชนีตามผลจริง
- ZIP เกมต้องครบ source/เอกสาร/สกิลซ่อน/เครื่องมือ/เทสต์/report/manifest ตรวจ ZIP สุดท้ายและแตกในที่ว่างก่อนส่ง

## โจทย์ลองใช้หลังยกระดับ

ZIP เปิดได้แต่ไม่มี .agents/skills และ source ไม่ตรง HTML: จะตรวจจาก artifact และรายงานสิ่งที่ขาดอย่างไร?

ให้ Gemini เติมวิธีวิเคราะห์ ลำดับตัดสินใจ ตัวอย่างจากโค้ดจริง ข้อผิดพลาดที่พบบ่อย ขอบเขตกับสกิลข้างเคียง และหลักฐานที่ต้องตรวจ ห้ามประกาศว่าเทสต์ผ่านหรือระบบครบเพราะมีร่างนี้

## แหล่งแนวคิด

webapp-testing; systematic-debugging; Playwright best practices; skill-creator — ดู [รายการแหล่งอ้างอิง](../../../docs/company/SKILL_STARTER_HANDOFF/SOURCES.md) ไม่คัดลอก API/ระบบจากเกมเก่ามาเป็นข้อเท็จจริงของ Company

## เมื่อทำเป็น Master Skill

อ่าน AGENTS.md ก่อนและเคารพไฟล์ที่ล็อก อัปเดตสกิล/สถานะ/เอกสาร/รายงานตามแพตช์จริง เลือกชื่อ/ขอบเขตใหม่ รวม/แยก หรือเพิ่มสกิลอื่นได้ตามเหตุผล แล้วอัปเกรดไฟล์ร่างใน `.agents/skills/<name>/SKILL.md` หลังตรวจ พร้อมเปลี่ยน maturity ตามจริง ไม่เปลี่ยนแค่ชื่อให้ดูเป็น master

## ตรวจเพิ่มใน v2.3.0

New tests: knowledge-and-company.test.cjs and added mobile browser cases cover real qualification, licensing, personal learning, aptitude differences, legacy saves and full-map zoom. Build regenerates all three HTML aliases; inspect final ZIP/CRC and extracted checks.

หลักฐาน: `COMPANY_SOURCE/test/knowledge-and-company.test.cjs` และ `test/campus-browser.cjs`; อ่านคู่มือ `docs/company/LEARNED_KNOWLEDGE_SYSTEM.md` และเทมเพลตวิชาก่อนเพิ่มรายการใหม่ เกณฑ์เหล่านี้ไม่เปลี่ยน maturity ของร่างเดิมโดยอัตโนมัติ
