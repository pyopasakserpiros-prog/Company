# สถานะงานร่วมระหว่างเอเจนต์

อัปเดต: 11 พฤศจิกายน 2026 · ใช้ร่วมกับ [workflow](AGENT_COLLABORATION_WORKFLOW.md) และยึด source/commit ล่าสุดเหนือบันทึกเก่า

## งานที่เตรียมส่งต่อ

| Task ID | ผู้พัฒนา | ขอบเขต | สถานะ/หลักฐาน |
|---|---|---|---|
| business-world-metals-entry-audit-2026-11 | Gemini ผ่านแอปแชต (ผู้ใช้เป็นผู้ส่ง ZIP) | แก้บั๊ก evaluator/งบเปิดธุรกิจ NPC; พิจารณาโมเดลโลหะ, ธุรกิจ/สินค้า, ประเทศและตลาดโลกตาม [พรอมต์](../../ACTIVE_PROMPT.md) และ [ข้อเสนอ](../../ideas/company/34_business_depth_world_markets_and_npc_entry_audit.md) | **planned**; เอกสารเตรียมใน main จากฐาน 6182e0a; รอผู้ใช้ส่ง ZIP ให้ Gemini; source ยังไม่เปลี่ยน; [รายงาน](PATCH_REPORTS/UPDATE_REPORT_2026-11-11_BUSINESS_WORLD_PROMPT_AND_ENTRY_AUDIT.md) |

## งานแพตช์ที่รวมแล้ว

| Task ID | ผู้พัฒนา | ขอบเขต | สถานะ/หลักฐาน |
|---|---|---|---|
| `business-depth-npc-2026-11` | Gemini ผ่านแอปแชต | Product families, วัตถุดิบต้นน้ำ/ซัพพลายเชน, ธุรกิจบริการ, เงินทุน/ความสามารถและการตัดสินใจผู้บริหาร NPC | **integrated** ใน main; source/report v1.3.0 เข้ามาใน `ef56aa2`; หลักฐานและ tests อยู่ใน [รายงาน v1.3.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V1.3.0.md) |
| `living-geopolitics-v200` | Gemini ผ่านแอปแชต | โลกภายนอกยุค 2.0.0, รัฐบาล/เหตุการณ์โลก/ราคา/พงศาวดาร และ Master Skill | **integrated** ใน main โดย `e02465c`; รายงาน [v2.0.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.0.0.md); ไฟล์สกิลใน repo ตรวจพบแล้ว ส่วนการติดตั้งในแอป Gemini เป็นข้อความที่รายงานระบุและยังตรวจตรงจากแอปนี้ไม่ได้ |
| `status-ideas-reconciliation-v200` | Codex | รวมสถานะทุกแพตช์และลบส่วน ideas ที่ทำแล้ว | **integrated** ในงานเอกสารนี้จากฐาน `06ee226`; รายงาน [การรวมสถานะ/ideas](PATCH_REPORTS/UPDATE_REPORT_2026-11-11_V2_STATUS_IDEA_RECONCILIATION.md); ผลตรวจ docs/code ผ่านและ source ไม่เปลี่ยน |
| `agy-active-work` | Agy | ไม่มีรายละเอียดงานที่ยืนยันได้ในบันทึก repo ปัจจุบัน | ไม่ทราบสถานะ; ตรวจตาราง/branch ล่าสุดก่อนแก้ไฟล์ร่วม |

## งานเอกสาร/สกิลที่เสร็จก่อนหน้า

- ร่างสกิล Company 14 หมวดเพิ่มใน `.agents/skills/`; ปัจจุบันยังระบุเป็น `starter-draft` จนกว่าจะมีหลักฐานการยกระดับและใช้งานจริง
- ปรับ `AGENTS.md` โดยใช้เอกสารเกมเก่าเป็นแนวทาง แต่รักษากฎเดิมและปรับเฉพาะบริบท Company; ผู้ใช้สั่งห้ามแก้ AGENTS.md โดยไม่ได้รับอนุญาตใหม่
- ผู้ใช้กำชับให้ Gemini คิดและสร้างสรรค์เอง ตรวจ ZIP ก่อนส่ง และอัปเดต Master Skills ทุกแพตช์ กฎเหล่านี้บันทึกไว้ใน `AGENTS.md` แล้ว

## สิ่งที่ยังต้องระวังในการส่งต่องาน

- Task business-world-metals-entry-audit-2026-11 เป็นพรอมต์ที่เตรียมไว้ ยังไม่ได้ส่งให้แอป Gemini และยังไม่ใช่งานที่กำลัง implement จนกว่าผู้ใช้จะแจ้งว่าเริ่มแล้ว

- แอปแชตทำงานจาก ZIP ที่ผู้ใช้ส่งให้ การแก้ repo ไม่ได้อัปเดต ZIP เก่าหรือสกิลในแอปโดยอัตโนมัติ
- รายงาน v2.0.0 อ้างว่าซิงก์ Master Skills ในแอป Gemini แล้ว แต่ repo นี้ยืนยันได้เฉพาะไฟล์สกิลใน Git เท่านั้น
- งานใหม่ให้ระบุ Task ID, เจ้าของ, base commit, ZIP/branch ที่ใช้, ระบบร่วม, หลักฐานผลตรวจ และ commit ที่รวม
- ไม่มีสถานะ active ของ Agy ที่ยืนยันได้ในบันทึกนี้ จึงต้องเช็กกับ Agy/branch จริงก่อนแตะไฟล์ที่อาจใช้ร่วมกัน
