# เริ่มงานกับ Company v3.0.0

อ่าน [AGENTS.md](AGENTS.md) ฉบับจริงทุกครั้ง → [สถานะ](project_status_and_ai_onboarding.md) → [workflow](docs/company/AGENT_COLLABORATION_WORKFLOW.md) / [ทะเบียนงาน](docs/company/AGENT_WORK_STATUS.md) → [.agents/skills](.agents/skills/README.md) → source/tests ที่เกี่ยวข้อง

ล่าสุด: ธุรกิจโทรศัพท์แยก มีชิ้นส่วน/สต็อก/งานวิจัย/ต้นแบบ/ประกอบ/รอเปิดตัว/ขายจริง NPC ทำงานเอง ผู้เล่นดูและทดลองผ่าน Edit Hub ไม่ออกคำสั่งบริหารแทน NPC ระบบยุค3ยังมีข้อจำกัดด้านซัพพลายต้นน้ำและการปรับสมดุล ไม่ถือว่าข้อเสนอทุกฉบับทำครบแล้ว

- [รายงาน v3.0.0](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V3.0.0.md)
- [สัญญาระบบโทรศัพท์](docs/company/ERA3_PHONE_SYSTEM.md) / [รับช่วง](docs/company/ERA3_V300_HANDOFF.md)
- [งานค้าง Era3](ideas/company/36_era3_phone_industry_remaining.md)
- [ACTIVE_PROMPT](ACTIVE_PROMPT.md) แยกงานที่ส่งมอบจากข้อเสนอถัดไป

คง AGENTS/Human Core เดิม สกิล repo และสองสกิลในแอป Gemini เป็นคนละปลายทาง ยังไม่ได้เข้าถึงหรือยืนยันซิงก์แอป

## บริบทฐาน Agy v2.8.0 (ประวัติ ไม่ใช่งานค้าง)

งานฐานใน **v2.8.0 (`living-scenarios-observability-and-human-depth-v280`)** ต่อยอดจากฐาน v2.7.0 ครบ 4 เสาหลัก:
1. **การแก้คอขวดและวิกฤตหลายสถานการณ์อัตโนมัติ (`evaluateOperationalCrisesAndBottlenecks`, `contractOemMaintenance`, `unreservePartForRepair`)** — เมื่อบริษัทมีเงินแต่ขาดผู้รู้ เครื่องจักรสำคัญเสีย อะไหล่ถูกจองค้าง รับสัญญาเกินกำลัง หรือสินค้าสำเร็จรูปค้างคลัง ผู้บริหารและฝ่ายขาย/ปฏิบัติการจะตัดสินใจรับสมัครผู้เชี่ยวชาญรายวิชา ปลดจองอะไหล่จากงานที่ยังไม่เริ่ม จ้างช่างศูนย์ OEM ภายนอก เจรจาลดขนาดสัญญาล่วงหน้า หรือจัดโปรลดราคาระบายสต็อก (`clearanceDiscountPct`) โดยตรวจสอบย้อนกลับได้ทุกขั้นตอน
2. **การเปรียบเทียบโลกคู่ขนาน (`S.runCounterfactualComparison`)** — เริ่มจาก seed โลกเดียวกันแล้วเปลี่ยนนิสัย CEO (รอบคอบ vs กล้าเสี่ยง), ความรู้ช่าง หรือเงินทุน เพื่อเทียบผลระยะยาวตามบริบทจริง
3. **ระบบติดตามสดและปักหมุด (`S.buildObservabilityView`, `w.watchlist`, แท็บ `🔍 ติดตามสด / คอขวด`)** — เปิดดูแล้วรู้ทันทีว่า *"ใครกำลังทำอะไร ติดอะไร กำลังแก้ยังไง"* พร้อมห่วงโซ่สาเหตุ-ผลลัพธ์ และติดดาวคนที่สนใจข้ามวัน/เซฟได้
4. **ความลึกของชีวิตและองค์กร (`p.aspiration`, `p.memories`, `w.culture.conflicts`, `evaluateInternalCareerSwitch`, `evaluateEmployeeRetention`, `evaluateEmployeeSpinoff`)** — เป้าหมายชีวิตส่วนตัว ความทรงจำจากประสบการณ์จริง ความเชื่อใจ/ความขัดแย้งหน้างาน การย้ายสายงานภายใน การยื่นข้อเสนอรั้่งตัวก่อนลาออก และการแยกตัวตั้งบริษัท Spin-off ที่มีชีวิตจริงใน `w.externalWorld.living.firms`

ตรวจใน `COMPANY_SOURCE`: `node tools/verify.cjs`, `node tools/test.cjs` (**190/190 tests**), `node tools/build.cjs`, `node tools/benchmark.cjs`; hash Human Core และ `AGENTS.md` ห้ามเปลี่ยนโดยไม่มีคำสั่งตรง
