# Company Simulation — AI Skills

สกิลเหล่านี้ใช้กับ `COMPANY_SOURCE/` ของเกม Siam Enterprise / Company Simulation โดยเฉพาะ ตรวจ source และ [project status](../../project_status_and_ai_onboarding.md) ทุกครั้งก่อนอ้างพฤติกรรมหรือเวอร์ชัน

## สกิลหลัก

- [`company-evolution-dev/SKILL.md`](company-evolution-dev/SKILL.md) — Master Skill ภาพรวมสถาปัตยกรรมและระบบที่ตรวจถึง v2.0.0; สำเนาระดับ root คือ [`SKILL.md`](../../SKILL.md), [`SKILL_COMPANY_EVOLUTION_DEV.md`](../../SKILL_COMPANY_EVOLUTION_DEV.md), และ [`SKILL_COMPANY_FOR_EVERY_PATCH.md`](../../SKILL_COMPANY_FOR_EVERY_PATCH.md) สำหรับการส่งต่อไฟล์
- [`company-for-every-patch/SKILL.md`](company-for-every-patch/SKILL.md) — Evergreen workflow ก่อน/หลังแพตช์และรายการตรวจ Master Skill

## สกิลเฉพาะด้าน

สกิล 14 รายการด้านล่างมี metadata `maturity: starter-draft`; เป็นร่างตั้งต้นสำหรับเอเจนต์ทุกตัว ไม่ใช่ Master Skill ที่ยืนยันว่าใช้งานครบแล้ว:

- `company-npc-life-and-behavior` — ชีวิตและพฤติกรรม NPC
- `company-workforce-and-careers` — กำลังคน อาชีพ และการเติบโต
- `company-executive-business-decisions` — การลงทุน/ตัดสินใจผู้บริหาร
- `company-economy-and-accounting` — เงินและบัญชี
- `company-supply-chain-and-resources` — วัตถุดิบและซัพพลายเชน
- `company-production-and-services` — การผลิตและบริการ
- `company-campus-and-logistics` — นิคม/อาคาร/การขนส่ง
- `company-world-and-markets` — โลกภายนอกและตลาด
- `company-edit-hub-and-observability` — Edit Hub และการสังเกตผล
- `company-gameplay-architecture` — สถาปัตยกรรมเกม
- `company-data-integrity` — ความถูกต้องของข้อมูล
- `company-save-system` — ระบบเซฟ
- `company-rendering-and-performance` — การแสดงผลและประสิทธิภาพ
- `company-qa-and-delivery` — QA เอกสารและส่งมอบ ZIP

## การดูแลสกิล

ทุกแพตช์ให้ตรวจ Master Skill และสกิลเฉพาะด้านที่ได้รับผลกระทบกับ source/test จริง อัปเดตดัชนีและไฟล์ที่เกี่ยวข้อง พร้อมระบุผลในรายงาน สกิลใน repo ไม่ได้ซิงก์แอป Gemini โดยอัตโนมัติ
