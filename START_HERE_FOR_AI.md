> สถานะล่าสุด (12 พฤศจิกายน 2026): แพตช์ **v2.8.0 (`living-scenarios-observability-and-human-depth-v280`)** พัฒนาและตรวจสอบครบทั้ง 4 เสาหลักบนสาขา `main` แล้ว (`190/190` tests ผ่าน) ดู [รายงาน v2.8.0](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.8.0.md)

# เริ่มงานกับ Company v2.8.0

ทุกครั้งอ่าน [AGENTS.md](AGENTS.md) → [สถานะจริง](project_status_and_ai_onboarding.md) → [workflow](docs/company/AGENT_COLLABORATION_WORKFLOW.md) / [ทะเบียนงาน](docs/company/AGENT_WORK_STATUS.md) → [.agents/skills](.agents/skills/README.md) และ source/test ที่กระทบ

งานล่าสุดใน **v2.8.0 (`living-scenarios-observability-and-human-depth-v280`)** ต่อยอดจากฐาน v2.7.0 ครบ 4 เสาหลัก:
1. **การแก้คอขวดและวิกฤตหลายสถานการณ์อัตโนมัติ (`evaluateOperationalCrisesAndBottlenecks`, `contractOemMaintenance`, `unreservePartForRepair`)** — เมื่อบริษัทมีเงินแต่ขาดผู้รู้ เครื่องจักรสำคัญเสีย อะไหล่ถูกจองค้าง รับสัญญาเกินกำลัง หรือสินค้าสำเร็จรูปค้างคลัง ผู้บริหารและฝ่ายขาย/ปฏิบัติการจะตัดสินใจรับสมัครผู้เชี่ยวชาญรายวิชา ปลดจองอะไหล่จากงานที่ยังไม่เริ่ม จ้างช่างศูนย์ OEM ภายนอก เจรจาลดขนาดสัญญาล่วงหน้า หรือจัดโปรลดราคาระบายสต็อก (`clearanceDiscountPct`) โดยตรวจสอบย้อนกลับได้ทุกขั้นตอน
2. **การเปรียบเทียบโลกคู่ขนาน (`S.runCounterfactualComparison`)** — เริ่มจาก seed โลกเดียวกันแล้วเปลี่ยนนิสัย CEO (รอบคอบ vs กล้าเสี่ยง), ความรู้ช่าง หรือเงินทุน เพื่อเทียบผลระยะยาวตามบริบทจริง
3. **ระบบติดตามสดและปักหมุด (`S.buildObservabilityView`, `w.watchlist`, แท็บ `🔍 ติดตามสด / คอขวด`)** — เปิดดูแล้วรู้ทันทีว่า *"ใครกำลังทำอะไร ติดอะไร กำลังแก้ยังไง"* พร้อมห่วงโซ่สาเหตุ-ผลลัพธ์ และติดดาวคนที่สนใจข้ามวัน/เซฟได้
4. **ความลึกของชีวิตและองค์กร (`p.aspiration`, `p.memories`, `w.culture.conflicts`, `evaluateInternalCareerSwitch`, `evaluateEmployeeRetention`, `evaluateEmployeeSpinoff`)** — เป้าหมายชีวิตส่วนตัว ความทรงจำจากประสบการณ์จริง ความเชื่อใจ/ความขัดแย้งหน้างาน การย้ายสายงานภายใน การยื่นข้อเสนอรั้่งตัวก่อนลาออก และการแยกตัวตั้งบริษัท Spin-off ที่มีชีวิตจริงใน `w.externalWorld.living.firms`

ตรวจใน `COMPANY_SOURCE`: `node tools/verify.cjs`, `node tools/test.cjs` (**190/190 tests**), `node tools/build.cjs`, `node tools/benchmark.cjs`; hash Human Core และ `AGENTS.md` ห้ามเปลี่ยนโดยไม่มีคำสั่งตรง
