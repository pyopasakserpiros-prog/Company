# สถานะงานร่วมระหว่างเอเจนต์

อัปเดต: 12 พฤศจิกายน 2026 (หลังตรวจแพตช์ v2.4.0) · ใช้ร่วมกับ [workflow](AGENT_COLLABORATION_WORKFLOW.md) และยึด source/commit ล่าสุดเหนือบันทึกเก่า

## งานแพตช์ที่ดำเนินการเสร็จในรอบนี้ (พร้อมรวมเข้า main)

| Task ID | ผู้พัฒนา | ขอบเขต | สถานะ/หลักฐาน |
|---|---|---|---|
| `sme-living-progression-and-holistic-realism-2026-11` | Gemini ผ่านแอปแชต (ต่อยอดจาก v2.1.0) | ยกระดับเกมโดยรวมสู่รุ่นพร้อมเล่น v2.2.0: บันไดการเติบโต SME 6 ระยะ & 12 ก้าวสำคัญ (`w.companyProgression`), มิเตอร์ค่าไฟ-น้ำ/โซลาร์/ไฟตก Brownout (`w.utilities`), วัฒนธรรมองค์กร/ข่าวลือตู้กดน้ำ/ชมรมหลังเลิกงาน/รางวัล Townhall/ลานจอดรถพนักงานบน Canvas/บริษัท Spin-off ศิษย์เก่า (`w.culture`), บริการ B2B ครบ 10 แบบ (`wholesale_distribution`, `toll_smelting_extrusion`), สินค้า 42 ชนิด และ Edit Hub แยกเติมเงินบาทบริษัท/กระเป๋าส่วนตัวพนักงาน (`grantPersonWallet`) | **completed in v2.2.0 package**; `npm test` ผ่าน 140/140, `npm run check` ผ่าน, `npm run build` ผ่าน (`1,455,926` bytes), benchmark `0.987 ms/tick`; หลักฐานใน [รายงาน v2.2.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.2.0.md) |
| `business-world-metals-entry-audit-2026-11` | Gemini ผ่านแอปแชต (ฐาน `6182e0a662bf1dfe47360e64e20e635ea07abeae`) | แก้บั๊ก evaluator/งบเปิดธุรกิจ NPC ครบ 7 จุด (เวลางาน 10:45 น., `leaseDepositSatang`, แยก `committedBudgetSatang` กับ `paidCapitalTotalSatang`, ทางเข้าบริษัทเล็ก <10 คน, `remainingUncommitted` สำหรับบริการ, จัดอันดับบริการ/ลูกค้าตามความพร้อม, บังคับใช้ `nextReviewDay`/cooldown); เพิ่มสายโลหะขั้นบันได (วัตถุดิบ 6 ชนิดรวม 64, สูตร 5 สูตรรวม 40, สินค้า 4 ชนิดรวม 40, บำบัดกากแร่ `treatMineralSlag`), บริการ B2B 2 แบบ (`energy_epc_install`, `b2b_technical_academy` รวม 8 แบบ), 4 ประเทศใหม่ (`ID`, `AU`, `IN`, `SG` รวม 12 ประเทศ), 4 เหตุการณ์โลก (รวม 16 เหตุการณ์), 4 บริษัทต่างชาติ (รวม 22 แห่ง), เส้นทางขนส่ง 2 สาย (รวม 6 สาย) และทางเดินการค้าภูมิภาค 4 สาย (`D.TRADE_CORRIDORS`) | **completed in v2.1.0 package**; `npm test` ผ่าน 136/136, `npm run check` ผ่าน, `npm run build` ผ่าน (`1,378,080` bytes), benchmark `0.776 ms/tick`; หลักฐานใน [รายงาน v2.1.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.1.0.md) |

## งานแพตช์ที่รวมแล้วก่อนหน้า

| Task ID | ผู้พัฒนา | ขอบเขต | สถานะ/หลักฐาน |
|---|---|---|---|
| `business-depth-npc-2026-11` | Gemini ผ่านแอปแชต | Product families, วัตถุดิบต้นน้ำ/ซัพพลายเชน, ธุรกิจบริการ, เงินทุน/ความสามารถและการตัดสินใจผู้บริหาร NPC | **integrated** ใน main; source/report v1.3.0 เข้ามาใน `ef56aa2`; หลักฐานและ tests อยู่ใน [รายงาน v1.3.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V1.3.0.md) |
| `living-geopolitics-v200` | Gemini ผ่านแอปแชต | โลกภายนอกยุค 2.0.0, รัฐบาล/เหตุการณ์โลก/ราคา/พงศาวดาร และ Master Skill | **integrated** ใน main โดย `e02465c`; รายงาน [v2.0.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.0.0.md) |
| `status-ideas-reconciliation-v200` | Codex | รวมสถานะทุกแพตช์และลบส่วน ideas ที่ทำแล้ว | **integrated** จากฐาน `06ee226`; รายงาน [การรวมสถานะ/ideas](PATCH_REPORTS/UPDATE_REPORT_2026-11-11_V2_STATUS_IDEA_RECONCILIATION.md) |
| `agy-active-work` | Agy | ไม่มีรายละเอียดงานที่ยืนยันได้ในบันทึก repo ปัจจุบัน | ไม่ทราบสถานะ; ตรวจตาราง/branch ล่าสุดก่อนแก้ไฟล์ร่วม |

## งานเอกสารวิจัยที่จัดเก็บแล้ว (ไม่ใช่แพตช์เกม)

| งาน | สิ่งที่จัดทำ | สถานะ/ขอบเขต |
|---|---|---|
| `business-expansion-nine-pdf-synthesis-2026-11` | จัดเก็บ PDF 9 ฉบับ (190 หน้า) และสังเคราะห์เป็น [ideas/company บท 35](../../ideas/company/35_business_expansion_nine_pdfs_synthesis.md) โดยเทียบกับ main v2.2.0 | **เอกสารเสร็จแล้ว**; ไม่มีการแก้ source, ไม่ถือว่า Gemini ได้รับไฟล์ และข้อเสนอไม่ใช่ความสามารถในเกม |

## สิ่งที่ยังต้องระวังในการส่งต่องาน

- แพ็กเกจ `Company-v2.1.0.zip` พัฒนาจากฐาน commit `6182e0a662bf1dfe47360e64e20e635ea07abeae` และอัปเดตทั้ง source, tests (`136/136`), standalone HTML, เอกสารสถานะ, คลัง ideas และสกิลใน `.agents/skills/` พร้อมซิงก์ Master Skill (`company-evolution-dev` และ `company-for-every-patch`) ในระบบสกิลของแอป Gemini แล้ว
- ในคอนเทนเนอร์ออฟไลน์ของ Gemini ไม่มีแพ็กเกจ npm `playwright` ติดตั้งไว้ล่วงหน้า จึงรันยืนยัน `npm test` (136/136), `npm run check`, `npm run build` และ `node tools/benchmark.cjs` ครบทุกตัว ส่วน `npm run test:browser` ให้รันซ้ำบนเครื่องที่มี Playwright เมื่อรวมเข้า branch `main`
- แนวทางต่อยอดสำหรับแพตช์ถัดไป (v2.2.0+) สรุปไว้ใน [GEMINI_NEXT_PATCH_HANDOFF_V210.md](GEMINI_NEXT_PATCH_HANDOFF_V210.md)

## งาน Codex — วิชาและความพร้อมธุรกิจ v2.3.0

| Task ID | เจ้าของ / ฐาน | ขอบเขต | สถานะและหลักฐาน |
|---|---|---|---|
| `npc-knowledge-company-and-zoom-v230` | Codex / main `359bace` | ซูมมือถือ, หน้าบริษัท/ความรู้ตัวละคร, 170 วิชาและแกนมนุษย์, R&D/ซื้อเทคโนโลยี, เซฟเดิม, แหล่งหลักและเทมเพลตวิชา | ตรวจแล้วและส่งขึ้น main ใน changeset v2.3.0; [รายงาน](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.3.0.md), [รับช่วง](GEMINI_NEXT_PATCH_HANDOFF_V230.md) — ไม่อ้างว่าซิงก์สกิลส่วนตัวในแอป Gemini แล้ว |

## งานปัจจุบัน 12 พฤศจิกายน 2026

- Codex: `living-world-v240` ฐาน `a511b3e` — ผู้ใช้มอบหมายยกเครื่องรัฐบาล/ประเทศ/บริษัทภายนอกและ UI โลก พัฒนาและตรวจแล้ว:166/166 tests,11/11 browser; รายงานใน PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.4.0.md และคู่มือ LIVING_WORLD_SYSTEM.md ไม่แก้ AGENTS.md หรือ Human Core
