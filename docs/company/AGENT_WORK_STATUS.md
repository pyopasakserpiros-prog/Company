# สถานะงานร่วมระหว่างเอเจนต์

อัปเดต: 12 พฤศจิกายน 2026 (หลังพัฒนาและตรวจแพตช์ v2.7.0) · ใช้ร่วมกับ [workflow](AGENT_COLLABORATION_WORKFLOW.md) และยึด source/commit ล่าสุดเหนือบันทึกเก่า

## งานแพตช์ที่ดำเนินการเสร็จในรอบนี้ (พร้อมรวมเข้า main)

| Task ID | ผู้พัฒนา | ขอบเขต | สถานะ/หลักฐาน |
|---|---|---|---|
| `process-driven-realism-overhaul-v270` | Gemini ผ่านแอปแชต (ต่อยอดจาก `bbc22e4ce61c002b49c2346841af3c4f3e9d0919` / v2.6.0) | ยกระดับความสมจริงเชิงกระบวนการครบทั้ง 8 Workstreams สู่รุ่น **v2.7.0**: (1) คิวแปรรูปวัตถุดิบและสินค้าขั้นกลางตามเวลาจริงทั้ง 40 สูตร (`w.plant.refineryBatches`), (2) ขนส่งและบริการ B2B 10 แบบตามเวลาจริง/ผลวัดเทคนิค/ชั่วโมงห้องเย็น (ยกเลิก `completeAllSteps: true` ในลูปอัตโนมัติ), (3) ซอฟต์แวร์/QA/ปรับขอบเขตงาน/โทษ SLA จากบั๊กค้างที่ผูกกับชั่วโมงนักพัฒนาจริง, (4) วิศวกรรมการผลิต 42 สินค้า + เกณฑ์ `safetyCritical` + ตัวกันคูณค่าไฟ/ความร้อนซ้ำเมื่อแชร์เครื่อง, (5) ระบบย่อยเครื่องจักร 5 ด้าน (`subsystems`), อาการเสีย (`faultModes`), โหมดจัดหา `purchased_new`/`used_refurbished`/`leased` และ `P.technicianCapability`, (6) คลังสินค้าล็อต/FIFO-FEFO/โซ่ความเย็น (`w.warehouse`), (7) ประมูลภาครัฐแข่งขัน (`w.commerce.tenders`), เจรจาปรับสัญญา (`renegotiateCommercialContract`), ยุติสัญญา (`terminateCommercialContract`) และ `W.payFromCounterparty`, (8) วงจรชีวภาพปศุสัตว์ 180 นาที (`feedLivestockHerd` แยกจาก `milkLivestockHerd`) และแยก `cogsSatang`/`accrualProfitSatang` ของกิจการภายนอก | **completed in v2.7.0 package (`Company-v2.7.0.zip`)**; `npm test` ผ่าน **186/186** (รวม `test/process-realism-v270.test.cjs`), `npm run check` ผ่าน, `npm run build` ผ่าน (`1,695,923` bytes), benchmark 500 NPCs `1.056 ms/tick`; ซิงก์ Master Skills ในแอป Gemini แล้ว; หลักฐานใน [รายงาน v2.7.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md) และ [รับช่วง v2.7.0](PROCESS_REALISM_V270_HANDOFF.md) |

## งานแพตช์ที่รวมแล้วก่อนหน้า

| Task ID | ผู้พัฒนา | ขอบเขต | สถานะ/หลักฐาน |
|---|---|---|---|
| `plant-and-commercial-v260` | Codex (ฐาน `c2609be`) | เครื่องจักร 20 ชนิด, route สินค้า 42 รายการ, งานช่างและสัญญาส่งมอบเป็นงวดพร้อม `commercialEscrows` | **integrated** ใน `bbc22e4`; `177/177` tests, `12/12` browser; [รายงาน v2.6.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md) |
| `time-and-stock-batch-v250` | Codex | เวลา 1× (2 นาทีจำลอง/วินาทีจริง), เดิน 8 ช่อง/tick และผลิตเข้าคลัง `stockBatch` | **integrated** ใน `c2609be`; [รายงาน v2.5.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.5.0.md) |
| `living-world-v240` | Codex (ฐาน `a511b3e`) | ยกเครื่องรัฐบาล/ประเทศ/บริษัทภายนอกและ UI โลก 6 หมวด | **integrated**; `166/166` tests, `11/11` browser; [รายงาน v2.4.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.4.0.md) |
| `npc-knowledge-company-and-zoom-v230` | Codex (ฐาน `359bace`) | ซูมมือถือ, หน้าบริษัท/ความรู้ตัวละคร 170 วิชา, R&D/ซื้อเทคโนโลยี, เซฟเดิม | **integrated**; [รายงาน v2.3.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.3.0.md) |
| `sme-living-progression-and-holistic-realism-2026-11` | Gemini ผ่านแอปแชต | บันไดการเติบโต SME 6 ระยะ & 12 ก้าวสำคัญ, มิเตอร์ค่าไฟ-น้ำ/โซลาร์/ไฟตก, วัฒนธรรมองค์กร/ลานจอดรถ/Spin-off, บริการ B2B 10 แบบ, สินค้า 42 ชนิด | **integrated** (v2.2.0); [รายงาน v2.2.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.2.0.md) |
| `business-world-metals-entry-audit-2026-11` | Gemini ผ่านแอปแชต | แก้บั๊ก evaluator/งบเปิดธุรกิจ NPC 7 จุด, สายโลหะขั้นบันได, 12 ประเทศ, 4 ทางเดินการค้า | **integrated** (v2.1.0); [รายงาน v2.1.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.1.0.md) |
| `living-geopolitics-v200` | Gemini ผ่านแอปแชต | โลกภายนอกยุค 2.0.0 และ Master Skills | **integrated** ใน `e02465c`; [รายงาน v2.0.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.0.0.md) |
| `business-depth-npc-2026-11` | Gemini ผ่านแอปแชต | Product families, วัตถุดิบต้นน้ำ, ธุรกิจบริการ, บอร์ดผู้บริหาร NPC | **integrated** ใน `ef56aa2`; [รายงาน v1.3.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V1.3.0.md) |
| `agy-active-work` | Agy | ไม่มีรายละเอียดงานที่ยืนยันได้ในบันทึก repo ปัจจุบัน | ไม่ทราบสถานะ; ตรวจตาราง/branch ล่าสุดก่อนแก้ไฟล์ร่วม |

## งานเอกสารวิจัยที่จัดเก็บแล้ว (ไม่ใช่แพตช์เกม)

| งาน | สิ่งที่จัดทำ | สถานะ/ขอบเขต |
|---|---|---|
| `business-expansion-nine-pdf-synthesis-2026-11` | จัดเก็บ PDF 9 ฉบับ (190 หน้า) และสังเคราะห์เป็น [ideas/company บท 35](../../ideas/company/35_business_expansion_nine_pdfs_synthesis.md) | **เอกสารเสร็จแล้ว**; ส่วนที่ทำจริงใน v2.7.0 ย้ายเข้า status แล้ว |

## สิ่งที่ต้องระวังในการส่งต่องานหลัง v2.7.0

- แพ็กเกจ `Company-v2.7.0.zip` พัฒนาต่อจากฐาน `bbc22e4ce61c002b49c2346841af3c4f3e9d0919` (v2.6.0) อัปเดตทั้งซอร์สโค้ด, ชุดทดสอบ (`186/186`), standalone HTML (`1,695,923` bytes), เอกสารสถานะ และสกิลใน `.agents/skills/` พร้อมซิงก์ Master Skill (`company-evolution-dev` และ `company-for-every-patch`) ในแอป Gemini แล้ว
- ในคอนเทนเนอร์ออฟไลน์ของ Gemini ไม่มีแพ็กเกจ npm `playwright` ติดตั้งไว้ล่วงหน้า จึงรันยืนยัน `npm test` (`186/186`), `npm run check`, `npm run build` และ `node tools/benchmark.cjs` ครบทุกตัว ส่วน `npm run test:browser` ให้รันซ้ำบนเครื่องที่มี Playwright เมื่อรวมเข้า branch `main`
- แนวทางส่งต่องานหลัง v2.7.0 สรุปไว้ใน [PROCESS_REALISM_V270_HANDOFF.md](PROCESS_REALISM_V270_HANDOFF.md)
