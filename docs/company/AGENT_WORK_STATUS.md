# สถานะงานร่วมระหว่างเอเจนต์

อัปเดต: 12 พฤศจิกายน 2026 (หลังพัฒนาและรวมแพตช์ v2.8.0 บน `main`) · ใช้ร่วมกับ [workflow](AGENT_COLLABORATION_WORKFLOW.md) และยึด source/commit ล่าสุดเหนือบันทึกเก่า

## งานแพตช์ที่ดำเนินการเสร็จในรอบนี้ (รวมบน main แล้ว)

| Task ID | ผู้พัฒนา | ขอบเขต | สถานะ/หลักฐาน |
|---|---|---|---|
| `living-scenarios-observability-and-human-depth-v280` | Agy (ต่อยอดจาก `9e3bc1f` / v2.7.0) | พัฒนาและตรวจสอบครบ 4 เสาหลักสู่รุ่น **v2.8.0**: (1) การแก้คอขวดและวิกฤตหลายสถานการณ์อัตโนมัติ (`evaluateOperationalCrisesAndBottlenecks`, `contractOemMaintenance`, `unreservePartForRepair`, คัดผู้สมัครตามวิชาเฉพาะทาง, เจรจาลดขนาดสัญญาล่วงหน้า, ลดราคาระบายสต็อก `clearanceDiscountPct`), (2) การเปรียบเทียบโลกคู่ขนานเมื่อเปลี่ยนนิสัย CEO/ความรู้ช่าง/เงินทุน (`S.runCounterfactualComparison`), (3) ระบบติดตามสด *"ใครกำลังทำอะไร ติดอะไร กำลังแก้ยังไง"* พร้อมห่วงโซ่สาเหตุและรายการติดดาวถาวร (`S.buildObservabilityView`, `w.watchlist`, แท็บ `🔍 ติดตามสด / คอขวด`), (4) ความลึกของชีวิตและองค์กร (`p.aspiration`, `p.memories`, ความขัดแย้ง/การโค้ชหน้างาน `w.culture.conflicts`, การย้ายสายงานภายใน `evaluateInternalCareerSwitch`, ข้อเสนอรั้่งตัวก่อนลาออก `evaluateEmployeeRetention`, และบริษัท Spin-off ที่มีชีวิตจริงใน `w.externalWorld.living.firms`) | **integrated on `main` (v2.8.0)**; `node tools/verify.cjs` ผ่าน, `node tools/test.cjs` ผ่าน **190/190** (รวม `test/living-scenarios-human-depth-v280.test.cjs`), `node tools/build.cjs` ผ่าน (`1,760,571` bytes), benchmark 500 NPCs `0.911 ms/tick`; หลักฐานใน [รายงาน v2.8.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.8.0.md) |

## งานแพตช์ที่รวมแล้วก่อนหน้า

| Task ID | ผู้พัฒนา | ขอบเขต | สถานะ/หลักฐาน |
|---|---|---|---|
| `process-driven-realism-overhaul-v270` | Gemini ผ่านแอปแชต + Agy รวมขึ้น `main` (`9e3bc1f`) | ยกระดับความสมจริงเชิงกระบวนการครบทั้ง 8 Workstreams สู่รุ่น **v2.7.0**: คิวแปรรูปวัตถุดิบตามเวลาจริง (`w.plant.refineryBatches`), ขนส่งและบริการ B2B 10 แบบตามเวลา/ผลวัดจริง, ซอฟต์แวร์/QA/SLA, ระบบย่อยเครื่องจักร 5 ด้าน & โหมดซื้อใหม่/มือสอง/เช่า, คลังสินค้าล็อต/FIFO-FEFO (`w.warehouse`), ประมูลภาครัฐแข่งขัน (`w.commerce.tenders`), วงจรชีวภาพปศุสัตว์ 180 นาที และบัญชีต้นทุนขายโลกภายนอก | **integrated** ใน `9e3bc1f`; `186/186` tests; [รายงาน v2.7.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md) |
| `plant-and-commercial-v260` | Codex (ฐาน `c2609be`) | เครื่องจักร 20 ชนิด, route สินค้า 42 รายการ, งานช่างและสัญญาส่งมอบเป็นงวดพร้อม `commercialEscrows` | **integrated** ใน `bbc22e4`; `177/177` tests; [รายงาน v2.6.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md) |
| `time-and-stock-batch-v250` | Codex | เวลา 1× (2 นาทีจำลอง/วินาทีจริง), เดิน 8 ช่อง/tick และผลิตเข้าคลัง `stockBatch` | **integrated** ใน `c2609be`; [รายงาน v2.5.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.5.0.md) |
| `living-world-v240` | Codex (ฐาน `a511b3e`) | ยกเครื่องรัฐบาล/ประเทศ/บริษัทภายนอกและ UI โลก 6 หมวด | **integrated**; `166/166` tests; [รายงาน v2.4.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.4.0.md) |
| `npc-knowledge-company-and-zoom-v230` | Codex (ฐาน `359bace`) | ซูมมือถือ, หน้าบริษัท/ความรู้ตัวละคร 170 วิชา, R&D/ซื้อเทคโนโลยี, เซฟเดิม | **integrated**; [รายงาน v2.3.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.3.0.md) |
| `sme-living-progression-and-holistic-realism-2026-11` | Gemini ผ่านแอปแชต | บันไดการเติบโต SME 6 ระยะ & 12 ก้าวสำคัญ, มิเตอร์ค่าไฟ-น้ำ/โซลาร์/ไฟตก, วัฒนธรรมองค์กร/ลานจอดรถ/Spin-off, บริการ B2B 10 แบบ, สินค้า 42 ชนิด | **integrated** (v2.2.0); [รายงาน v2.2.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.2.0.md) |
| `business-world-metals-entry-audit-2026-11` | Gemini ผ่านแอปแชต | แก้บั๊ก evaluator/งบเปิดธุรกิจ NPC 7 จุด, สายโลหะขั้นบันได, 12 ประเทศ, 4 ทางเดินการค้า | **integrated** (v2.1.0); [รายงาน v2.1.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.1.0.md) |
| `living-geopolitics-v200` | Gemini ผ่านแอปแชต | โลกภายนอกยุค 2.0.0 และ Master Skills | **integrated** ใน `e02465c`; [รายงาน v2.0.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.0.0.md) |
| `business-depth-npc-2026-11` | Gemini ผ่านแอปแชต | Product families, วัตถุดิบต้นน้ำ, ธุรกิจบริการ, บอร์ดผู้บริหาร NPC | **integrated** ใน `ef56aa2`; [รายงาน v1.3.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V1.3.0.md) |

## งานเอกสารวิจัยที่จัดเก็บแล้ว (ไม่ใช่แพตช์เกม)

| งาน | สิ่งที่จัดทำ | สถานะ/ขอบเขต |
|---|---|---|
| `business-expansion-nine-pdf-synthesis-2026-11` | จัดเก็บ PDF 9 ฉบับ (190 หน้า) และสังเคราะห์เป็น [ideas/company บท 35](../../ideas/company/35_business_expansion_nine_pdfs_synthesis.md) | **เอกสารเสร็จแล้ว**; ส่วนที่ทำจริงใน v2.7.0–v2.8.0 ย้ายเข้า status แล้ว |
