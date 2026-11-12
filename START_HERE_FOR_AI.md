# เริ่มงานกับ Company v2.6.0

ทุกครั้งอ่าน [AGENTS.md](AGENTS.md) → [สถานะจริง](project_status_and_ai_onboarding.md) → [workflow](docs/company/AGENT_COLLABORATION_WORKFLOW.md) / [ทะเบียนงาน](docs/company/AGENT_WORK_STATUS.md) → [.agents/skills](.agents/skills/README.md) และ source/testที่กระทบ

งานล่าสุดคือเครื่องมือ/เครื่องจักรและสัญญาขายเป็นงวด อ่าน [รายงานv2.6.0](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md), [สัญญาระบบ](docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md), [รับช่วง](docs/company/PLANT_V260_HANDOFF.md) และ [ACTIVE_PROMPT](ACTIVE_PROMPT.md) เพื่อแยกงานที่ทำแล้วจากข้อเสนอ

เล่นCompany_single.htmlออฟไลน์ หรือCOMPANY_SOURCE/index.htmlผ่านlocal server ปุ่มบริษัทมีหน้าเครื่องจักร/งานช่างและฝ่ายขาย/สัญญา เกมเดินเอง ไม่บังคับผู้เล่นรับงาน/ซื้อเครื่อง/ซ่อมแทนNPC

ตรวจในCOMPANY_SOURCE: npm test, npm run check, npm run build, npm run test:browser, node tools/benchmark.cjs ผลล่าสุด177tests/12browser ไม่คัดจำนวนจากแพตช์เก่า; hashHuman CoreและAGENTSห้ามเปลี่ยนโดยไม่มีคำสั่งตรง

วิชาเพิ่มตาม[เทมเพลต](docs/company/templates/KNOWLEDGE_SUBJECT_TEMPLATE.md) อ่าน[ระบบวิชา](docs/company/LEARNED_KNOWLEDGE_SYSTEM.md)และ[ทะเบียน](docs/company/KNOWLEDGE_SUBJECT_CATALOG.md) ทุกแพตช์ต้องมีรายงานและปรับสกิล/status/เอกสารที่กระทบ Geminiแอปต้องซิงก์สองสกิลในแอปต่างหาก การแก้repoไม่ใช่หลักฐานว่าซิงก์แอปแล้ว ZIPต้องครบและตรวจฉบับสุดท้าย
