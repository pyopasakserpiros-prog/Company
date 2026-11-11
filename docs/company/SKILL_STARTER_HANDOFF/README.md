# ชุดร่างสกิล Company ที่ส่งต่อให้ Gemini

ร่าง 14 หมวดอยู่ใน [.agents/skills](../../../.agents/skills/README.md) โดยมี maturity: starter-draft ยังไม่ใช่ Master Skill ที่ตรวจประสิทธิผลแล้ว ผู้ใช้มอบให้ Gemini วิเคราะห์ ปรับรวม/แยก คิดเพิ่มเติม และยกระดับเอง

- [แหล่งอ้างอิง](SOURCES.md): สกิลสาธารณะ 3 รายการและเอกสารประกอบ 5 รายการ พร้อม source-checks.json
- [พรอมต์ให้ Gemini](GEMINI_PROMPT.md)
- [โจทย์ทดลองหลังยกระดับ](UPGRADE_SCENARIOS.md)
- [ข้อเสนอการอัปเดตเอกสาร/ส่งมอบ](requirements/DOCUMENTATION_AND_DELIVERY_PROPOSAL.md): ข้อเสนอให้พิจารณา ไม่ใช่การแก้ AGENTS.md
- [สองสกิลแอปเดิมเพื่อเทียบฐาน](existing-app-skill-baselines/README.md): สำเนาอ้างอิงจากฐานเดิม ไม่ใช่ installed skills ที่อัปเดตแล้ว

การมีไฟล์ใน repo ไม่ได้ซิงก์ installed skills ในแอป Gemini แอปต้องได้รับไฟล์/พรอมต์ผ่านผู้ใช้ และตรวจเครื่องมือที่มีจริงก่อนอัปเดตสองสกิลในแอป ไม่สมมติว่า Gemini อ่านการเปลี่ยนแปลง GitHub ระหว่างทำงานได้


- [ข้อกำหนดซิงก์สองสกิล Gemini กับ .agents/skills ของทุกเอเจนต์](GEMINI_APP_SKILL_SYNC.md): ต้องครบทั้งแอปและ repo พร้อมหลักฐานแยกแต่ละช่องทาง
