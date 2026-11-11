# สกิล Company — ดัชนีและสถานะ

เปิดอ่าน AGENTS.md ฉบับปัจจุบันก่อนเริ่มงานทุกครั้ง แล้วเลือกสกิลตามขอบเขตงานจากตารางนี้

## ร่างเฉพาะเกม Company: รอ Gemini ยกระดับ

14 หมวดด้านล่างเป็นโครงตั้งต้นที่ผู้ใช้ให้ Codex push ไว้ใน repo มี `metadata.maturity: starter-draft` ทุกไฟล์ ยังไม่ใช่ Master Skill ที่ผ่านการทดลองใช้ ให้ Gemini ตรวจโค้ดจริง คิดเพิ่ม รวม/แยก/ปรับตามความเหมาะสม แล้วเปลี่ยนสถานะหลังตรวจ ไม่อ้างว่าฟีเจอร์เกมครบหรือเทสต์ผ่านจากเนื้อหาสกิล

| Skill | ใช้ตั้งต้นสำหรับ |
|---|---|
| [company-campus-and-logistics](company-campus-and-logistics/SKILL.md) | พื้นที่ทำงาน การเดิน และโลจิสติกส์ |
| [company-data-integrity](company-data-integrity/SKILL.md) | ความครบถ้วนของข้อมูลและแค็ตตาล็อก |
| [company-economy-and-accounting](company-economy-and-accounting/SKILL.md) | บัญชี เศรษฐกิจ และกระแสเงินสด |
| [company-edit-hub-and-observability](company-edit-hub-and-observability/SKILL.md) | Edit Hub และการสังเกตโลก NPC |
| [company-executive-business-decisions](company-executive-business-decisions/SKILL.md) | ผู้บริหาร การลงทุน และการแตกธุรกิจ |
| [company-gameplay-architecture](company-gameplay-architecture/SKILL.md) | สถาปัตยกรรมและลูปจำลอง |
| [company-npc-life-and-behavior](company-npc-life-and-behavior/SKILL.md) | ชีวิต บุคลิก และการตัดสินใจ NPC |
| [company-production-and-services](company-production-and-services/SKILL.md) | การผลิต ซอฟต์แวร์ และบริการ |
| [company-qa-and-delivery](company-qa-and-delivery/SKILL.md) | QA เอกสาร และส่งมอบ ZIP |
| [company-rendering-and-performance](company-rendering-and-performance/SKILL.md) | การแสดงภาพและประสิทธิภาพ |
| [company-save-system](company-save-system/SKILL.md) | ระบบเซฟและการรับข้อมูลกลับ |
| [company-supply-chain-and-resources](company-supply-chain-and-resources/SKILL.md) | วัตถุดิบ ต้นน้ำ และซัพพลายเชน |
| [company-workforce-and-careers](company-workforce-and-careers/SKILL.md) | กำลังคน อาชีพ และการเติบโต |
| [company-world-and-markets](company-world-and-markets/SKILL.md) | โลกภายนอก ตลาด และบริษัทคู่ค้า |

## สองสกิลเดิมของ workflow/แอป

- [company-evolution-dev](company-evolution-dev/SKILL.md) และสำเนา `SKILL.md` / `SKILL_COMPANY_EVOLUTION_DEV.md` ที่ราก
- [company-for-every-patch](company-for-every-patch/SKILL.md) และสำเนา `SKILL_COMPANY_FOR_EVERY_PATCH.md` ที่ราก

สองชุดนี้คงเนื้อหาเดิมในงานเพิ่มร่างครั้งนี้ และอาจมีข้อมูลประวัติที่ต้องตรวจ ไม่ใช่ชุด Master แยกตามโดเมนใหม่ ให้ Gemini ปรับไฟล์และซิงก์สกิลในแอปด้วยเครื่องมือที่มีจริงเมื่อได้รับงาน/ไฟล์แล้ว ห้ามอ้างว่าการ push repo อัปเดตในแอปสำเร็จ

## การรับช่วงและการอัปเดต

อ่าน [ชุดส่งต่อและแหล่งอ้างอิง](../../docs/company/SKILL_STARTER_HANDOFF/README.md) และ [พรอมต์ Gemini](../../docs/company/SKILL_STARTER_HANDOFF/GEMINI_PROMPT.md) สำหรับรายละเอียด ทุกแพตช์ต้องทบทวนสกิลที่ได้รับผลกระทบพร้อมสถานะโครงการ เอกสารและรายงาน ไม่ต้องรอผู้ใช้ระบุชื่อไฟล์ ให้คงข้อมูลข้อเสนอ/ร่างแยกจากสิ่งที่เกมทำแล้ว และห้ามแก้กฎเหล็กโดยไม่มีคำอนุญาตโดยตรง
