# รายงานแพตช์ Company v2.4.0 — โลกภายนอกที่มีบัญชีและเหตุผล

วันที่ 12 พฤศจิกายน 2026 · Codex · ฐาน main `a511b3e` (v2.3.0) · งานที่ผู้ใช้สั่งโดยตรง: ยกเครื่องโลกภายนอก ประเทศ รัฐบาล บริษัท และหน้าต่างโลก พร้อมทำรายงานทุกครั้ง

## สิ่งที่ทำ

- เพิ่ม `COMPANY_SOURCE/js/world.js` แยกจาก sim: 12 ประเทศ/กลุ่มเศรษฐกิจ, 28 กิจการเริ่มต้น, บัญชีประเทศ/บริษัท, การผลิตจาก input จริงและทุนหมุนเวียน, ปริมาณสำรอง, พืชมีพันธุ์/น้ำ/ปุ๋ย/เวลา, เงินฝั่งผู้บริโภคและอุตสาหกรรมปลายทาง
- แทนการสลับรัฐบาลทุก6วัน/ข่าวโลกทุก5วัน/ข่าวบริษัทสุ่มด้วยการทบทวนนโยบายจากเศรษฐกิจ วาระผู้นำและความนิยม การลงทุนจาก utilization/ผลตอบแทน/นิสัยผู้บริหาร และธุรกรรมจริง
- เพิ่มการค้าระหว่างบริษัท: หักเงิน/สินค้า จ่ายภาษี พักสินค้าระหว่างทาง รับของเมื่อถึงกำหนดและล่าช้าจากความขัดแย้ง
- ความสัมพันธ์66คู่ มีความตึงเครียด ความเชื่อมั่น สนธิสัญญา มาตรการและความขัดแย้ง ส่งผล route/tariff/เวลา และทางเดินการค้าเดิม
- ตลาดวัตถุดิบมีสต็อก/คำขอซื้อ ราคาและเหตุผล; ใช้ราคาจริงกับ PO ตั้งแต่วันแรก คำขอรับซื้อ B2B เกิดจากของที่ผู้ซื้อขาดและเงินที่มี
- ซื้อวัตถุดิบหักคลังผู้ขายจริง; ขาย B2B ต้องให้ผู้ซื้อจ่ายได้และรับของจริง รักษาบัญชีทั้งสองฝั่ง มีตลาดสำรองคลังไทย500หน่วย/วัตถุดิบตั้งต้นเพื่อให้ SME เริ่มงานได้ แต่ไม่เติมของฟรี
- UI โลก6หมวดพร้อมรายละเอียดรายประเทศ รายบริษัท วัตถุดิบ ความสัมพันธ์ เส้นทางและพงศาวดาร กดจากประเทศไปบริษัทได้ แก้ป้ายวัตถุดิบที่เคยเรียกเมล็ด/ผลผลิตชีวภาพทุกอย่างว่าต้นน้ำแท้
- เพิ่มการตรวจ world ledger/material conservation ใน S.audit และ Save.validate; บันทึกเซฟเก็บสถานะโลกและงานขนส่งได้ครบ

## สิ่งที่คิดเพิ่มและเหตุผล

คลังไทยของตลาดสำรองช่วยไม่ให้กิจการตั้งต้นต้องนำเข้าชิ้นส่วนทุกชิ้นจนพลาด deadline โดยยังคงต้นทุน สต็อกจำกัดและการเติมคลังจริง แยก world.js ออกเพื่อให้ AI ตัวต่อไปแก้โลกได้โดยไม่เพิ่มระบบทั้งหมดใน sim.js อีก การแสดงเหตุผล/ข้อจำกัด/ประวัติรายบริษัทช่วยเฝ้าดูการตัดสินใจ แทนมีเพียงข่าวสวยงาม

## ไฟล์และผลข้ามระบบ

เพิ่ม world.js, test/living-world-v240.test.cjs, LIVING_WORLD_SYSTEM.md, เอกสารแผนและ handoff และรายงานนี้ แก้ sim.js/data.js/save.js/index.html/debug.js/css, ชุดทดสอบเดิมที่อ้างรุ่น/จำนวนบริษัท/6คำขอซื้อคงที่/ราคาฐาน และเพิ่ม browser cases สร้าง standaloneทั้ง3ไฟล์ใหม่ อัปเดต ACTIVE_PROMPT (แยกงานล่าสุดจากพรอมต์ประวัติ), README, project statusทั้ง2สำเนา, START_HERE, API, ดัชนีรายงาน/เอกสาร/skills, ideas และทะเบียนงาน

คำสั่งซื้ออาจถูกปฏิเสธเพราะโลกไม่มีของหรือราคาจริงเกินเงิน สินค้ามี lead time ตามแหล่งส่ง ไม่ใช่ส่งของฟรีเมื่อครบเวลาเดิม เงื่อนไขวิชา/R&Dของบริษัทหลักและ Human Coreยังใช้กฎเดิม AGENTS.md และไฟล์แกน/CORE_LOCKไม่เปลี่ยน

## ผลตรวจ

- `npm test`: 166/166 ผ่าน รวม14กรณีโลกใหม่: เดินโลก180วันและต่อเซฟถึง200วัน, หลายseed, ไม่มีทุน/input, ขนส่ง, นโยบาย/วาระ, สงคราม/สนธิสัญญา, ราคาไม่คูณซ้ำ, สต็อกผู้ขาย, B2Bไม่มีเงิน, พืช/พันธุ์, เซฟเสีย, วิกฤตชั่วคราว และผลผลิตตามBOM/สำรองหมด
- `npm run check`: ผ่าน syntax/catalog/layout/accounting/save และ hashแกนที่ล็อก
- `npm run test:browser`: 11/11 ผ่าน Chromium รวมหน้าจอ390×844, world6หมวดและเลือกentity, เดสก์ท็อป/standalone และการเปิดดูไม่เปลี่ยนเซฟ
- `npm run build`: standaloneทั้งสามสำเนาจาก sourceเดียวกัน
- `node tools/benchmark.cjs`: 500NPC เฉลี่ย0.596 ms/tick, p95 0.692 ms, max4.825 ms (Node simulation-only ไม่ใช่FPSมือถือ)
- ZIPฉบับส่งมอบต้องผ่าน CRC, manifest/ไฟล์แฮช และ check/test/build จาก sourceที่แตกใหม่ ก่อนส่งลิงก์

## ข้อจำกัดและการรับช่วง

อ่าน [สัญญาระบบและข้อจำกัดฉบับละเอียด](../LIVING_WORLD_SYSTEM.md) ก่อนทำต่อ ภายนอกเป็นกิจการและประเทศแบบรวม ไม่ใช่ Human Core NPCทุกคนหรือกองทัพจริง ภาษีแบบย่อคิดจากกระแสเงินสดสุทธิบวก ไม่มีการคำนวณภาษีตามกฎหมายประเทศจริง บางวัตถุดิบชีวภาพไม่มีวงจรผลิตภายนอกจึงขายจากสต็อกหรือซื้อเข้ามา ไม่มีการเติมฟรี

สัญญาสินค้า/บริการ/ซอฟต์แวร์/กองรถของบริษัทหลักยังใช้บัญชีคู่ค้าระบบเดิม ไม่ได้ย้ายทุกสัญญาเข้า walletโลกนี้ คำสั่งmanualสถานการณ์เดิมบางรายการยังใช้ตัวคูณระดับโลก การขนส่งบริษัทหลักกำหนดlead timeตอนเริ่มส่ง ส่วนการเลื่อนกลางทางจากคู่ขัดแย้งอยู่ในshipmentระหว่างบริษัทภายนอก ไม่มีระบบควบรวม/ล้มละลายเต็มรูปแบบ

อัปเดต company-evolution-dev/company-for-every-patch และสำเนาราก พร้อม world/observability/architecture/save/accounting/supply-chain/qa skills ตามงาน สกิล NPCชีวิต/อาชีพ/ความรู้/การผลิตภายใน/ผัง/การวาดภาพไม่เปลี่ยนสัญญา จึงคงคู่มือเดิม สกิลเฉพาะที่เป็นร่างยังไม่อ้าง maturityสูงขึ้น ไม่มีเครื่องมืออัปเดตสกิลในแอปGemini จึง **ยังไม่อ้างว่าซิงก์สกิลในแอปแล้ว**

เปิดเกม: ใช้ Company_single.html หรือ source/index.html ผ่าน local server กดปุ่มโลกที่แถบล่าง เดินเวลาหลายวันแล้วเปิดรายละเอียดประเทศ/บริษัท/ตลาดเพื่อดูเหตุผลและผลที่เกิด ไม่ต้องบริหารรัฐบาลเอง

## ชุดส่งมอบ

ZIPรากเดียว Company-v2.4.0 รวมsource/tools/tests/assets/.agents/เอกสาร/รายงานและstandalone มีBUNDLE_MANIFEST.jsonระบุฐานa511b3eและSHA-256ทุกไฟล์ ตรวจCRCและแตกในพื้นที่ใหม่ เทียบแฮชทุกไฟล์และรันcheck/test/buildจากsourceที่แตก ทั้งสามHTMLต้องตรงกัน แฮชZIPและขนาดแจ้งแยกในไฟล์.sha256ข้างZIP การตรวจนี้ไม่ยืนยันว่าผู้รับดาวน์โหลดสำเร็จแล้ว

## รายการไฟล์ในชุดเปลี่ยนแปลง

```text
M	ACTIVE_PROMPT.md
M	.agents/skills/README.md
M	.agents/skills/company-economy-and-accounting/SKILL.md
M	.agents/skills/company-edit-hub-and-observability/SKILL.md
M	.agents/skills/company-evolution-dev/SKILL.md
M	.agents/skills/company-for-every-patch/SKILL.md
M	.agents/skills/company-gameplay-architecture/SKILL.md
M	.agents/skills/company-qa-and-delivery/SKILL.md
M	.agents/skills/company-save-system/SKILL.md
M	.agents/skills/company-supply-chain-and-resources/SKILL.md
M	.agents/skills/company-world-and-markets/SKILL.md
M	COMPANY_SOURCE/CompanyFoundation_single.html
M	COMPANY_SOURCE/Company_single.html
M	COMPANY_SOURCE/README.md
M	COMPANY_SOURCE/css/debug.css
M	COMPANY_SOURCE/index.html
M	COMPANY_SOURCE/js/data.js
M	COMPANY_SOURCE/js/debug.js
M	COMPANY_SOURCE/js/save.js
M	COMPANY_SOURCE/js/sim.js
M	COMPANY_SOURCE/project_status_and_ai_onboarding.md
M	COMPANY_SOURCE/test/business-depth-world-corridors-v210.test.cjs
M	COMPANY_SOURCE/test/campus-browser.cjs
M	COMPANY_SOURCE/test/ecosystem-multitier-dag-v100.test.cjs
M	COMPANY_SOURCE/test/geopolitics-living-world-v200.test.cjs
M	COMPANY_SOURCE/test/product-depth-npc-board-v130.test.cjs
M	COMPANY_SOURCE/test/simulation.test.cjs
M	COMPANY_SOURCE/test/sme-growth-utilities-culture-v220.test.cjs
M	COMPANY_SOURCE/test/true-upstream-agri-fleet-software-v110.test.cjs
M	Company_single.html
M	README.md
M	SKILL.md
M	SKILL_COMPANY_EVOLUTION_DEV.md
M	SKILL_COMPANY_FOR_EVERY_PATCH.md
M	START_HERE_FOR_AI.md
M	docs/company/AGENT_WORK_STATUS.md
M	docs/company/PATCH_REPORTS/README.md
M	docs/company/PRESENTATION_API.md
M	docs/company/README.md
M	ideas/company/README.md
M	project_status_and_ai_onboarding.md
A	COMPANY_SOURCE/js/world.js
A	COMPANY_SOURCE/test/living-world-v240.test.cjs
A	docs/company/LIVING_WORLD_SYSTEM.md
A	docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.4.0.md
A	docs/company/WORLD_V240_HANDOFF.md
A	docs/superpowers/plans/2026-11-12-living-world.md
```
