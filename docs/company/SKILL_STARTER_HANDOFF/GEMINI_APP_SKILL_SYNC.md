# ข้อกำหนดซิงก์สกิล Gemini และสกิลร่วมของทุกเอเจนต์

## สองสกิลเดิมต้องอัปเดตทั้งสองช่องทาง

| สกิลที่ติดตั้งในแอป Gemini | ไฟล์ร่วมใน repo สำหรับทุกเอเจนต์ | สำเนาที่ใช้งานในโครงการ |
|---|---|---|
| company-evolution-dev | .agents/skills/company-evolution-dev/SKILL.md | SKILL.md และ SKILL_COMPANY_EVOLUTION_DEV.md ที่ราก |
| company-for-every-patch | .agents/skills/company-for-every-patch/SKILL.md | SKILL_COMPANY_FOR_EVERY_PATCH.md ที่ราก |

ผู้ใช้ย้ำว่าสองชื่อเดิมเป็นสกิลในแอป Gemini แต่ไฟล์สำเนาใน .agents/skills เป็นของใช้ร่วมสำหรับ Codex, Agy และทุกเอเจนต์ด้วย ไม่ใช่โฟลเดอร์เฉพาะแอป การมีไฟล์ใน GitHub ไม่ได้อัปเดต installed skill ในแอป และการแก้ในแอปอย่างเดียวก็ไม่อัปเดตไฟล์ใน repo

ทุกแพตช์ Gemini ต้องอัปเดตสองสกิลนี้ทั้งในแอปและไฟล์/สำเนาที่ใช้อยู่ให้สอดคล้องกัน พร้อมทบทวนสกิล Master เฉพาะโดเมนใน .agents/skills ที่แพตช์กระทบ สกิลใหม่ทั้งหมดเป็นชุดร่วมของทุกเอเจนต์ และต้องติดไปกับ ZIP เกมรวมโฟลเดอร์ซ่อน .agents

## ผู้รับผิดชอบและการยืนยัน

1. Gemini ตรวจ source และไฟล์สกิลที่ได้รับจริง ปรับสองสกิลเดิมให้ตรงเกม/ขั้นตอนล่าสุดและอ้างอิงชุด Master หลังยกระดับ ไม่คัดข้อมูลประวัติผิด ๆ จากสำเนาฐานไปติดตั้งซ้ำ
2. อัปเดตไฟล์ใน .agents/skills และสำเนาที่รากให้ตรงกัน ตรวจเนื้อหา/เวอร์ชันคำแนะนำและลิงก์ ก่อนส่ง ZIP กลับ
3. อัปเดต installed skill ชื่อ company-evolution-dev และ company-for-every-patch ในแอป Gemini ผ่านความสามารถจัดการสกิลที่มีจริง แล้วอ่านกลับ/ตรวจผลสำเร็จจริง ไม่สร้างชื่อ tool หรืออ้างว่าสำเร็จจากการเขียนไฟล์
4. บันทึกผลแยกในรายงาน: repo/ZIP skill files, installed company-evolution-dev, installed company-for-every-patch และความตรงกันของชุด พร้อมหลักฐาน revision/hash/ผลอ่านกลับเท่าที่เครื่องมือให้ได้
5. ถ้าช่องทางแอปทำไม่ได้ ให้ระบุ pending พร้อมสาเหตุและเตรียมไฟล์สำหรับติดตั้ง ไม่ถือว่างานซิงก์ครบและไม่ตัดข้อกำหนดนี้ทิ้ง การอัปเดตจริงในแอปยังต้องดำเนินต่อผ่านผู้ใช้/ช่องทางที่รองรับ

Codex และ Agy ดูแลไฟล์ใน repo ได้ตามงานที่รับ แต่ไม่มีการยืนยันการเข้าถึง installed skills ในแอป Gemini จากเซสชันนี้ เมื่อแก้ไฟล์ร่วมแล้วจึงต้องส่งต่อรายการ app-sync-needed ให้ Gemini ผ่านผู้ใช้ ไม่อ้างว่า push แทนการซิงก์แอปได้

## สถานะของการส่งร่างครั้งนี้

ร่าง 14 หมวดถูกเพิ่มใน repo ให้ Gemini ยกระดับแล้ว สองสกิลเดิมใน repo คงไว้เป็นฐานและยังรอ Gemini ปรับตามงานที่มอบหมาย ไม่มีหลักฐานยืนยันว่าสอง installed skills ในแอปได้รับการอัปเดตแล้ว

## Sibling Silicon & Handset0.2.0 — 2026-11-13

Canonical master references/root mirrors and silicon-handset-dev updated from actual commercial APIs/tests. Repository copies match. Installed Gemini app skills were not accessed; sync remains pending for these sibling notes. No Company gameplay API or skill maturity changed.
