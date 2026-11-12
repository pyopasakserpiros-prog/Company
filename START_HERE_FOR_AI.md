# เริ่มงานกับ Company v3.1.0

**สถานะล่าสุด (v3.1.0 — พัฒนาและตรวจสอบเสร็จสมบูรณ์):** ดำเนินการตามโจทย์ใน [ACTIVE_PROMPT.md](ACTIVE_PROMPT.md) เสร็จสมบูรณ์แล้วจากฐาน `786f5b1bced6e43cdb1e10d02114bda2cbf0e8fc` (v3.0.0) สู่รุ่น **v3.1.0**:
- ขยายระบบนิเวศซัพพลายเชนโทรศัพท์มือถือครบ **12 บทบาทธุรกิจ (`E.ROLE_CONTRACTS`)** และ **8 เกรดวัสดุมาตรฐาน (`E.MATERIAL_GRADES`)** พร้อมบริษัทภายนอก 16 แห่ง
- รองรับการเข้าสู่ธุรกิจของบริษัทเรา (`phone_campus`) และการบูรณาการแนวดิ่ง (Vertical Integration) ครบทุกบทบาท ทั้งผู้ออกแบบชิป Fabless SoC (`fabless_soc` สั่งหล่อเวเฟอร์ผ่าน `wafer_foundry` + แพ็กเกจ `osat_packaging`), แรม (`dram_memory`), แฟลช (`nand_storage`), โมดูลกล้อง (`camera_module`), หน้าจอ (`display_panel`), แบตเตอรี่ (`battery_pack`), แผงวงจร/คลื่นวิทยุ (`pcb_rf`), ตัวถัง (`enclosure`), ระบบปฏิบัติการ (`os_platform`) และแบรนด์มือถือ (`brand`) พร้อมแยกความพร้อมเชิงวิศวกรรมออกจากการปฏิเสธเชิงกลยุทธ์ (`declined_prudent`)
- แก้คอขวดการขาดแคลนวัตถุดิบต้นน้ำในโลกปกติ (`world.js`) จนการจำลอง 360 วันแบบไม่เสกของ (`era3-independent` และ `era3-world-b`) ผลิตและขายโทรศัพท์ได้จริง **601–796 เครื่อง** (สมาร์ตโฟน 12–13 รุ่น) และผ่านชุดทดสอบ `236/236` ข้อ

อ่าน [AGENTS.md](AGENTS.md) ฉบับจริงทุกครั้ง → [สถานะ](project_status_and_ai_onboarding.md) → [workflow](docs/company/AGENT_COLLABORATION_WORKFLOW.md) / [ทะเบียนงาน](docs/company/AGENT_WORK_STATUS.md) → [.agents/skills](.agents/skills/README.md) → source/tests ที่เกี่ยวข้อง

- [รายงาน v3.1.0](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V3.1.0.md)
- [รายงาน v3.0.0](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V3.0.0.md)
- [สัญญาระบบโทรศัพท์](docs/company/ERA3_PHONE_SYSTEM.md) / [รับช่วง](docs/company/ERA3_V300_HANDOFF.md)
- [งานค้าง Era3](ideas/company/36_era3_phone_industry_remaining.md)

ตรวจใน `COMPANY_SOURCE`: `node tools/verify.cjs`, `node tools/test.cjs` (**236/236 tests**), `node tools/build.cjs`, `node tools/phone-industry-soak.cjs`, `node tools/benchmark.cjs`; hash Human Core (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`) และ `AGENTS.md` ห้ามเปลี่ยนโดยไม่มีคำสั่งตรง
