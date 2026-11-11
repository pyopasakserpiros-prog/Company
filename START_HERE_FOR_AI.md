# เริ่มงานกับ Company Simulation

สถานะ source ของ branch `main` ล่าสุดคือ **รุ่นเกม v2.2.0** อ่าน [project status](project_status_and_ai_onboarding.md) เพื่อดูระบบที่ตรวจแล้ว ผลทดสอบ (140/140 tests) และรายงานทุกแพตช์

## อ่านก่อนเริ่มทุกครั้ง

1. [AGENTS.md](AGENTS.md) — กฎเหล็ก; ห้ามแก้โดยไม่ได้รับอนุญาตจากผู้ใช้โดยตรง
2. [สถานะโครงการ](project_status_and_ai_onboarding.md) — ความสามารถที่มีจริง รุ่นเกม v2.2.0 และผลตรวจล่าสุด
3. [Workflow ทำงานร่วมกัน](docs/company/AGENT_COLLABORATION_WORKFLOW.md) และ [ทะเบียนงาน](docs/company/AGENT_WORK_STATUS.md)
4. [Master Skills และดัชนีสกิล](.agents/skills/README.md) พร้อม `SKILL.md` ที่เกี่ยวข้องกับงาน
5. อ่าน source/test จริงใน `COMPANY_SOURCE/` ก่อนยืนยันพฤติกรรม

## เล่น ตรวจ และ build

ต้องใช้ Node.js 20 ขึ้นไป:

```bash
cd COMPANY_SOURCE
npm ci
npm run check
npm test
npm run build
npm run test:browser
```

เปิด `COMPANY_SOURCE/CompanyFoundation_single.html` (หรือ `Company_single.html`) แบบออฟไลน์ หรือ `COMPANY_SOURCE/index.html` ผ่าน local server ดูรายละเอียดที่ [README ของ source](COMPANY_SOURCE/README.md) และผลตรวจล่าสุดที่ [project status](project_status_and_ai_onboarding.md)

## หลักทำงาน

ผู้ใช้ชอบเฝ้าดู NPC ใช้ชีวิตและตัดสินใจเอง พร้อมทดลองเปลี่ยนนิสัย เงิน บริษัท และทรัพยากรเพื่อดูผล ทีมพัฒนาต้องช่วยคิดและออกแบบต่อ ไม่รอให้ผู้ใช้แจกแจงทุกอย่าง Edit Hub ต้องเข้าใจง่าย ไม่บังคับจำ ID หรือแก้ JSON

Gemini/ChatGPT ที่ทำงานผ่านแอปแชตรับ ZIP ผ่านผู้ใช้และต้องส่ง ZIP โครงการกลับ; ตรวจ ZIP ฉบับสุดท้ายและเทียบกับ repo ล่าสุดก่อนรวมเสมอ การอัปเดต repo ไม่ได้ซิงก์แอป Gemini ที่ทำงานจาก ZIP เก่าโดยอัตโนมัติ ดู [workflow](docs/company/AGENT_COLLABORATION_WORKFLOW.md)

## รายงานและงานล่าสุด

- [รายงานแพตช์ v2.2.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.2.0.md) — สรุปการยกระดับเกมสู่รุ่นพร้อมเล่น v2.2.0 (บันได SME 6 ระยะ, มิเตอร์ค่าไฟ-น้ำ/โซลาร์, วัฒนธรรมองค์กร/ลานจอดรถ/บริษัท Spin-off, บริการ B2B ครบ 10 แบบ และ Edit Hub แยกกระเป๋าเงิน)
- [รายงานแพตช์ v2.1.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.1.0.md) — สรุปการแก้บั๊ก NPC Business-Entry Audit ทั้ง 7 จุด, สายโลหะ/อะลูมิเนียมขั้นบันได, บริการ B2B 8 แบบ, 12 ประเทศ/16 เหตุการณ์โลก และทางเดินการค้าภูมิภาค 4 สาย
- [เอกสารส่งต่องานถัดไปหลัง v2.1.0](docs/company/GEMINI_NEXT_PATCH_HANDOFF_V210.md) และ [ทะเบียนงาน](docs/company/AGENT_WORK_STATUS.md)
