# เริ่มงานกับ Company Simulation

สถานะ source ของ branch `main` ล่าสุดคือ **รุ่นเกม v2.0.0** อ่าน [project status](project_status_and_ai_onboarding.md) เพื่อดูระบบที่ตรวจแล้ว ผลทดสอบ และรายงานทุกแพตช์

## อ่านก่อนเริ่มทุกครั้ง

1. [AGENTS.md](AGENTS.md) — กฎเหล็ก; ห้ามแก้โดยไม่ได้รับอนุญาตจากผู้ใช้โดยตรง
2. [สถานะโครงการ](project_status_and_ai_onboarding.md) — ความสามารถที่มีจริง รุ่นเกม และผลตรวจล่าสุด
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

เปิด `COMPANY_SOURCE/CompanyFoundation_single.html` แบบออฟไลน์ หรือ `COMPANY_SOURCE/index.html` ผ่าน local server ดูรายละเอียดที่ [README ของ source](COMPANY_SOURCE/README.md) และผลตรวจล่าสุดที่ [project status](project_status_and_ai_onboarding.md)

## หลักทำงาน

ผู้ใช้ชอบเฝ้าดู NPC ใช้ชีวิตและตัดสินใจเอง พร้อมทดลองเปลี่ยนนิสัย เงิน บริษัท และทรัพยากรเพื่อดูผล ทีมพัฒนาต้องช่วยคิดและออกแบบต่อ ไม่รอให้ผู้ใช้แจกแจงทุกอย่าง Edit Hub ต้องเข้าใจง่าย ไม่บังคับจำ ID หรือแก้ JSON

Gemini/ChatGPT ที่ทำงานผ่านแอปแชตรับ ZIP ผ่านผู้ใช้และต้องส่ง ZIP โครงการกลับ; ตรวจ ZIP ฉบับสุดท้ายและเทียบกับ repo ล่าสุดก่อนรวมเสมอ การอัปเดต repo ไม่ได้ซิงก์แอป Gemini ที่ทำงานจาก ZIP เก่าโดยอัตโนมัติ ดู [workflow](docs/company/AGENT_COLLABORATION_WORKFLOW.md)
