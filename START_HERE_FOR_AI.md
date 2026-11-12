> สถานะล่าสุด (12 พฤศจิกายน 2026): แพตช์ **v2.7.0 (`process-driven-realism-overhaul-v270`)** พัฒนาและตรวจสอบครบทั้ง 8 Workstreams ตาม [ACTIVE_PROMPT.md](ACTIVE_PROMPT.md) แล้ว (`186/186` tests ผ่าน) ดู [รายงาน v2.7.0](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md) และ [เอกสารรับช่วง v2.7.0](docs/company/PROCESS_REALISM_V270_HANDOFF.md)

# เริ่มงานกับ Company v2.7.0

ทุกครั้งอ่าน [AGENTS.md](AGENTS.md) → [สถานะจริง](project_status_and_ai_onboarding.md) → [workflow](docs/company/AGENT_COLLABORATION_WORKFLOW.md) / [ทะเบียนงาน](docs/company/AGENT_WORK_STATUS.md) → [.agents/skills](.agents/skills/README.md) และ source/test ที่กระทบ

งานล่าสุดคือการยกเครื่องความสมจริงเชิงกระบวนการทั้ง 8 ด้านใน **v2.7.0**: คิวแปรรูปวัตถุดิบตามเวลาจริง (`w.plant.refineryBatches`), ขนส่งและบริการ B2B 10 แบบตามเวลา/ผลวัดจริง, ซอฟต์แวร์/QA/ปรับขอบเขตงาน, วิศวกรรมเครื่องจักร (ระบบย่อย 5 ด้าน/วินิจฉัยอาการเสีย/ซื้อใหม่-มือสอง-เช่า), คลังสินค้าล็อต/FIFO-FEFO/โซ่ความเย็น (`w.warehouse`), ประมูลภาครัฐแข่งขัน/เจรจาปรับสัญญา/ยุติสัญญา (`w.commerce.tenders`), และวงจรชีวภาพปศุสัตว์ 180 นาทีพร้อมบัญชีต้นทุนขายโลกภายนอก อ่าน [รายงาน v2.7.0](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md), [สัญญาระบบโรงงานและคลัง](docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md), [คู่มือโลก](docs/company/LIVING_WORLD_SYSTEM.md) และ [รับช่วง v2.7.0](docs/company/PROCESS_REALISM_V270_HANDOFF.md)

เล่น `Company_single.html` ออฟไลน์ หรือ `COMPANY_SOURCE/index.html` ผ่าน local server ปุ่มบริษัทมีหน้าเครื่องจักร/งานช่าง/คิวแปรรูป/คลังล็อต และฝ่ายขาย/สัญญา/ผลประมูล เกมเดินเอง ไม่บังคับผู้เล่นรับงาน/ซื้อเครื่อง/ซ่อมแทน NPC

ตรวจใน `COMPANY_SOURCE`: `npm test`, `npm run check`, `npm run build`, `npm run test:browser`, `node tools/benchmark.cjs` ผลล่าสุด **186/186 tests** (`node tools/test.cjs`); hash Human Core และ `AGENTS.md` ห้ามเปลี่ยนโดยไม่มีคำสั่งตรง

วิชาเพิ่มตาม [เทมเพลต](docs/company/templates/KNOWLEDGE_SUBJECT_TEMPLATE.md) อ่าน [ระบบวิชา](docs/company/LEARNED_KNOWLEDGE_SYSTEM.md) และ [ทะเบียน](docs/company/KNOWLEDGE_SUBJECT_CATALOG.md) ทุกแพตช์ต้องมีรายงานและปรับสกิล/status/เอกสารที่กระทบ พร้อมซิงก์สอง Master Skills ในแอป Gemini และตรวจ ZIP ฉบับสุดท้ายก่อนส่งมอบ
