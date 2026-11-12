# รายงานจัดระเบียบเอกสาร Company

**วันที่:** 11 พฤศจิกายน 2026
**ฐาน:** main v2.0.0, commit `3db03d5`
**ประเภทงาน:** จัดโครงสร้างเอกสารและลิงก์; ไม่มีการแก้เกม

## สิ่งที่เปลี่ยน

- คง Active Prompt ที่ `ACTIVE_PROMPT.md` บนราก repoและทำทางเข้าให้เด่นจาก `README.md`, `START_HERE_FOR_AI.md` และดัชนี Company
- เพิ่ม `docs/company/README.md` เป็นสารบัญ แยกงานปัจจุบัน รายงาน สเปก งานวิจัย พรอมต์เก่า หลักฐาน และเอกสารประวัติ
- ย้ายพรอมต์ Gemini รุ่นก่อนเข้า `docs/company/prompts/archive/`; ย้ายแบบออกแบบไป `design/`, งานวิจัยไป `research/`, baseline/coverage ไป `validation/` และรายงานตรวจรับไป `PATCH_REPORTS/`
- ย้าย JHEVO master dossier เข้า `history/` เพราะเป็นเอกสารจากชื่อ/ช่วงโครงการก่อนหน้า และติดป้ายว่าไม่ใช่ source of truth ปัจจุบัน
- ลบสำเนารายงานแพตช์ 6 ไฟล์ที่ราก `docs/company/` หลังยืนยันเนื้อหาเหมือนกับไฟล์ชื่อเดียวกันใน `PATCH_REPORTS/`; เก็บฉบับ canonical ไว้
- เก็บต้นฉบับ `Company_Business_Expansion_Investment_Report_2026-11-11.docx` ใน `research/source_documents/`; SHA-256 ตรงกับไฟล์แนบที่ได้รับ: `eaa2923a5b760db501f20d8db7e48556f56ff5c9deb19cfd2df921bbd164a1b9`
- อัปเดตลิงก์ Markdown และบันทึก workflow/status/report ให้ใช้ตำแหน่งใหม่

## ผลตรวจและขอบเขต

- ตรวจ local Markdown links หลังย้ายไฟล์และ `git diff --check`
- ไม่แก้ `COMPANY_SOURCE/`, `AGENTS.md` หรือ `.agents/skills/`; ไม่เปลี่ยนความสามารถ/รุ่นเกม
- ไม่รัน game tests เพราะไม่มีการแก้ source
- ไฟล์ coverage matrix สองชื่อมีเนื้อหาเหมือนกัน ณ วันจัดหมวด เก็บไว้ทั้งคู่เพื่อรักษาการอ้างอิงเดิม และระบุไว้ใน README ของ validation
- ผู้ใช้แจ้งว่าส่งพรอมต์ให้ Gemini แล้ว; DOCX ใหม่นี้เก็บเป็นเอกสารเสริม ยังไม่ยืนยันว่า Gemini ได้รับ; repo ยืนยัน ZIP ฐาน/การเริ่ม implement ไม่ได้ และ Codex ไม่ได้ส่งข้อความ/ZIP โดยตรง
