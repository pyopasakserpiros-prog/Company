> **Current collaboration: Era 3 — Feature and Smart Phones.** Download the two English context documents in [era3/](era3/): [proposal](era3/ERA_3_FEATURE_AND_SMART_PHONES.md) and [current project status](era3/project_status_and_ai_onboarding.md). Runtime remains v2.9.0; v3.0.0 is proposed, not implemented. NPCs make all operational decisions; the player observes and edits conditions through Edit Hub.

# เริ่มงานกับ Company v2.9.0

อ่าน [AGENTS.md](AGENTS.md) ฉบับจริงทุกครั้ง → [สถานะ](project_status_and_ai_onboarding.md) → [workflow](docs/company/AGENT_COLLABORATION_WORKFLOW.md) / [ทะเบียนงาน](docs/company/AGENT_WORK_STATUS.md) → [.agents/skills](.agents/skills/README.md) → source/tests ที่เกี่ยวข้อง

งานล่าสุด: Codex ต่อยอด Agy v2.8.0 (`f7167e2`) เป็น v2.9.0: จุดเริ่ม SME 6 แบบ คน/ความรู้/ทุนตามกิจการ กระทรวงพาณิชย์/ผู้นำ/ข้อตกลงรายสินค้า และ NPC อ่านข่าว/เรียนรู้ตามบริบท แก้ช่องลัดซอฟต์แวร์ที่พบจากการตรวจจริง คง AGENTS/Human Core เดิม

- [รายงานล่าสุด](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md)
- [คู่มือ SME/รัฐบาล/ข่าว](docs/company/SME_AND_CIVICS_SYSTEM.md)
- [รับช่วงและข้อจำกัด](docs/company/SME_CIVICS_V290_HANDOFF.md)
- [ACTIVE_PROMPT](ACTIVE_PROMPT.md) แยกคำสั่งที่ทำแล้วจากข้อเสนอใหม่
- ผลตรวจ 203/203 integration/unit, 14/14 browser; 12 โลก SME จำลอง 30 วัน ตรวจบัญชีและเซฟรายวันผ่าน

ไม่มีสิทธิแก้ AGENTS/Human Core จากคำขอพัฒนาเกมทั่วไป ต้องอัปเดต Master Skills/สถานะ/รายงานทุกแพตช์ สกิล repo และ 2 สกิลในแอป Gemini เป็นคนละปลายทาง ยังไม่ได้เข้าถึงหรือยืนยันการซิงก์แอป

## บริบทฐาน Agy v2.8.0 (ประวัติ ไม่ใช่งานค้าง)

งานฐานใน **v2.8.0 (`living-scenarios-observability-and-human-depth-v280`)** ต่อยอดจากฐาน v2.7.0 ครบ 4 เสาหลัก:
1. **การแก้คอขวดและวิกฤตหลายสถานการณ์อัตโนมัติ (`evaluateOperationalCrisesAndBottlenecks`, `contractOemMaintenance`, `unreservePartForRepair`)** — เมื่อบริษัทมีเงินแต่ขาดผู้รู้ เครื่องจักรสำคัญเสีย อะไหล่ถูกจองค้าง รับสัญญาเกินกำลัง หรือสินค้าสำเร็จรูปค้างคลัง ผู้บริหารและฝ่ายขาย/ปฏิบัติการจะตัดสินใจรับสมัครผู้เชี่ยวชาญรายวิชา ปลดจองอะไหล่จากงานที่ยังไม่เริ่ม จ้างช่างศูนย์ OEM ภายนอก เจรจาลดขนาดสัญญาล่วงหน้า หรือจัดโปรลดราคาระบายสต็อก (`clearanceDiscountPct`) โดยตรวจสอบย้อนกลับได้ทุกขั้นตอน
2. **การเปรียบเทียบโลกคู่ขนาน (`S.runCounterfactualComparison`)** — เริ่มจาก seed โลกเดียวกันแล้วเปลี่ยนนิสัย CEO (รอบคอบ vs กล้าเสี่ยง), ความรู้ช่าง หรือเงินทุน เพื่อเทียบผลระยะยาวตามบริบทจริง
3. **ระบบติดตามสดและปักหมุด (`S.buildObservabilityView`, `w.watchlist`, แท็บ `🔍 ติดตามสด / คอขวด`)** — เปิดดูแล้วรู้ทันทีว่า *"ใครกำลังทำอะไร ติดอะไร กำลังแก้ยังไง"* พร้อมห่วงโซ่สาเหตุ-ผลลัพธ์ และติดดาวคนที่สนใจข้ามวัน/เซฟได้
4. **ความลึกของชีวิตและองค์กร (`p.aspiration`, `p.memories`, `w.culture.conflicts`, `evaluateInternalCareerSwitch`, `evaluateEmployeeRetention`, `evaluateEmployeeSpinoff`)** — เป้าหมายชีวิตส่วนตัว ความทรงจำจากประสบการณ์จริง ความเชื่อใจ/ความขัดแย้งหน้างาน การย้ายสายงานภายใน การยื่นข้อเสนอรั้่งตัวก่อนลาออก และการแยกตัวตั้งบริษัท Spin-off ที่มีชีวิตจริงใน `w.externalWorld.living.firms`

ตรวจใน `COMPANY_SOURCE`: `node tools/verify.cjs`, `node tools/test.cjs` (**190/190 tests**), `node tools/build.cjs`, `node tools/benchmark.cjs`; hash Human Core และ `AGENTS.md` ห้ามเปลี่ยนโดยไม่มีคำสั่งตรง
