# Company v2.9.0 — SME origins, civics and informed decisions

12 พฤศจิกายน 2026 · Codex · ฐาน Agy main `f7167e2315e2d11a7bc8f979c17d4469617c5920` (v2.8.0). เป้าหมายผู้ใช้: โลก/ธุรกิจคำนวณมีผลจริง เริ่มจาก SME เลือกกิจการ และ NPC เรียนรู้/ตัดสินใจตามบริบท

## ผลตรวจ Agy และสิ่งที่เก็บไว้

ก่อนแก้รัน unit/integration **190/190** และ source/core check ผ่าน ฐานมี crisis resolution/OEM repair, counterfactuals, bottleneck tracker/watchlist และ human/org life จริงจาก v2.8.0 จึงต่อยอด ไม่เขียนทับระบบเหล่านี้

พบช่องลัดซอฟต์แวร์จริง: `advanceSoftwareProject` เมื่อไม่มี options.minutes จะบังคับ progress ครบ และ daily evaluator เรียกแบบนั้น ทำให้การมี tick labor ไม่ได้ป้องกันการข้ามเวลาเสมอ นอกจากนี้ QA ข้ามเวลาได้และการเก็บเงินบางช่วงไม่ตรวจผลจ่ายของคู่สัญญา แก้แล้ว พร้อมเทสต์ปิดช่องลัดและทดสอบการทำงานอัตโนมัติจริง

## สิ่งที่เพิ่ม/แก้

1. **SME origins:** หน้าเลือก6กิจการ (ครัวน้ำพริก/เบเกอรี่/ประกอบสายชาร์จ/โลหะ/ซอฟต์แวร์/ช่างภาคสนาม) หยุดเวลารอเลือก ทีม3–5คนและความรู้/เครื่องมือตามงาน ทุนเริ่มแยก cash/stock/equipment/deposit/preparation กระทบเงินจริง จำกัดความรู้เดิมเฉพาะงานที่เคยมีประสบการณ์ ไม่มี SaaS/เทคโนโลยีทุกประเภทให้ฟรี เช่าพื้นที่ในshared campus เปิดเผยข้อจำกัดนี้
2. **Business/people gates:** แก้ chili/cable/rail/suspension/tray ที่เคยรับเงื่อนไข/เครื่องมือผิดตระกูล งานโลหะใช้ machining/metrology ไม่ใช่ IoT firmware. การเลือกบริการดูคน/อะไหล่/กำไรสุทธิ ไม่ไล่แค่feeสูงสุด. บริษัทซอฟต์แวร์รับงานลูกค้าจริงจำกัดหนึ่งโครงการ/ครั้ง ไม่เปิดลูกค้าฟรีซ้ำรายวัน ต้องสะสมอย่างน้อย2400นาทีพัฒนา/480นาทีQAของoriginนี้และมีลูกค้าจ่ายได้
3. **Natural learning:** ผู้บริหารทบทวนเรียนราย3วันจากreserve/openness/ปัญหางาน/ข่าวที่อ่าน มี prerequisite และเวลาฝึกจริง ไม่ปิดวิชาที่บริษัทไม่ได้ใช้ ผล30วันเห็นความต่างของการเรียน/การจ้างตามseed ไม่รับประกันขยายทุกกิจการ
4. **Governments/ministries:** ผู้นำสมมติและวาระ/ผลแข่งขันคณะบริหารจากความนิยม/เงินเฟ้อ/ว่างงาน กระทรวงรายประเทศทบทวน cross-border flows/shortages กำหนด tariff/waiver ตามกลุ่มสินค้า มี3วันnoticeและวันหมดอายุ. Protectionismส่งผลการค้า; assertiveness/pragmatismส่งผลแรงตึงเครียดการทูตด้วย. ใช้12ประเทศ/กลุ่มเดิม
5. **Diplomacy/conflicts:** เจรจา7วัน→ลงนามผู้นำจริงในเกม→รอ3วัน→มีผล/ระงับ/หมดอายุ ไม่ต่ออายุตัวเองทุกวัน สงครามเบิกคลังจริง โครงสร้างพื้นฐานเสียลดกำลังผลิต หยุดยิงแล้วจ่ายฟื้นฟู ไม่ใช่แค่headline
6. **Real trade:** ภาษีรายกลุ่มสินค้าคิดในactualquote/payment; เงินเข้าคลังประเทศผู้ซื้อ สินค้าลดจากผู้ขาย. Quotaจำกัดยอดส่งออกต่อวันข้ามลูกค้าจริง. Thai warehouseไม่ถูกภาษีต่างประเทศผิดประเทศต้นทาง. Supplier choiceคิดlandedprice/leadtime/knownrisk/relationship. ทุกผู้ขายสะสมประวัติซื้อ/ส่งจริงเพื่อใช้เจรจาพาร์ทเนอร์
7. **NPC information:** อ่านข่าว5นาทีตามrole/openness/ความรู้/aptitude, เก็บข่าวที่รับรู้จำกัด16รายการ. CEOข่าวที่อ่านแล้วเท่านั้นเพิ่มcountryrisk/sector evaluationซึ่งใช้เลือกผู้ขาย/R&D. พาร์ทเนอร์ต้อง3deliveries/THB50000spend/trust65/เงินสำรอง/เจรจา7วันและค่าลงนามจริง
8. **UI/save:** บริษัทแสดงทุนและlease/การเรียน/ข้อมูลผู้บริหาร โลกแสดงผู้นำ กระทรวง ข้อตกลงต้นทุนจริง ตัวละครมีข่าวเฉพาะตัว. เปิดsheetดึงsnapshotล่าสุดแก้ข้อมูลอาคารค้าง. Validateทุน/การเมือง/มาตรการ/ข่าว/สนธิสัญญา; learning/selfStudyเป็นactivityที่เซฟรับได้. Release2.9.0 แต่ save/schema/package0.1.0เดิม

สิ่งที่คิดเพิ่มจากโจทย์: ตรวจสมการทุนตั้งต้น, แก้ผิดบริบทของกลุ่มสินค้า, ป้องกันข่าวomniscient, เพิ่มเวลารอมีผล/วันหมดอายุ, กันซอฟต์แวร์รับเงินจากลูกค้าไม่มีทุน และเก็บ supplierhistory ครอบคลุมผู้ขายที่ถูกเลือกจริง

## ไฟล์และผลข้ามระบบ

- เพิ่ม `COMPANY_SOURCE/js/startup.js`, `js/civics.js`, `test/sme-civics-v290.test.cjs`, `tools/sme-soak.cjs`
- แก้ `js/sim.js/world.js/plant.js/api.js/save.js/data.js/debug.js`, `index.html`, `css/debug.css`; buildstandalone3สำเนาจากsourceเดียว
- เทสต์เวอร์ชันเดิมอัปเดตreleaseassertions, fixtureซอฟต์แวร์ระบุเวลาพัฒนา/QAและclientIDที่มีจริง แทนการพึ่งช่องลัด; เทสต์อาชีพ/ความสมดุลเดิมยังอยู่ ไม่ผ่อนเกณฑ์เพื่อให้ผ่าน
- อัปเดตสถานะrootและCOMPANY_SOURCEให้ตรงกัน, START_HERE/ACTIVE_PROMPT/README/ดัชนีโลก/โรงงาน/ideas/ทะเบียนงาน/คู่มือและhandoff รายการไฟล์เปลี่ยนอยู่ [changed-files.txt](../validation/v290/changed-files.txt)
- Master Skillsสองตัว canonical/rootcopiesตรงกัน พร้อม14domain referencesและดัชนี. เป็นการบำรุงเนื้อหาอ้างอิงจากsource/tests ไม่อ้างทดสอบพฤติกรรมเอเจนต์หรือรับรองmasterใหม่ สถานะdraftของdomain skillsไม่ยกระดับลอยๆ สองสกิลในแอปGeminiยังไม่ได้เข้าถึงหรือยืนยันซิงก์
- **ไม่แก้** `AGENTS.md`, Human Core หรือ CORE_LOCK. Hashแกน `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`

## หลักฐานตรวจรับ

Node24.22.1/Linux; Playwright+Chromium สำหรับbrowser ไม่ใช่มือถือผู้ใช้จริง

| ตรวจ | ผล |
|---|---|
| `npm test` | 203/203 unit/integration; ใหม่13กรณี |
| `npm run check` | syntax/schema/บัญชี/lockedcoreผ่าน |
| `npm run test:browser` | 14/14 source/standalone/มือถือ/desktop/chooser/pureviews |
| `node tools/sme-soak.cjs` | 6 origins ×2seeds ×30days, audit/saveทุกวันผ่าน |
| `node tools/benchmark.cjs` | 500NPCเฉลี่ย1.382ms/tick p95 2.510ms; simulation-only ไม่ใช่mobileFPS |
| `npm run build` | standalone3สำเนาจากsourceเดียว; พร้อมไฟล์เล่นออฟไลน์ |

[logsและผลจำลอง](../validation/v290/) แสดงผลรายworld ไม่ใช่รับประกันทุกseed บริษัทบางแห่งเลือกอยู่ธุรกิจเดิม ไม่มีปลดเทคโนโลยีทุกการผลิตภายใน30วันใน12โลกที่ตรวจ โปรแกรมตรวจรูปแบบtestไม่ใช่หลักฐานสมจริงทุกธุรกิจ

ZIPส่งมอบมีprojectrootเดียว รวมhidden .agents/source/assets/tools/tests/docs/ideas/report/standalone ไม่มี.git/node_modules/ZIPซ้อน `BUNDLE_MANIFEST.json` เก็บฐานและSHA256รายไฟล์ กระบวนการส่งมอบต้องreopen/CRC/hashทุกไฟล์แล้วแตกพื้นที่ใหม่ รันcheck/test/buildและเทียบstandaloneที่buildใหม่ ผลตรวจแพ็กสุดท้ายและSHA256อยู่ข้างZIPในartifact ไม่ใส่hashตัวZIPไว้ภายในเพราะอ้างวน ไม่อ้างผู้ใช้ดาวน์โหลดหรืออัปเดตGeminiแล้ว

## เสร็จ / บางส่วน / ข้อจำกัด

เสร็จตามขอบเขตส่งมอบ:6SME origins, named fictional leadership/terms, commodity ministry measures, staged treaties, budgeted conflicts, informednews/learning/supplier partnership, softwarebypassfix, UI/save/tests/docs/skills.

**ยังไม่ใช่การยกเครื่องทุกฟีเจอร์ครบ:** รายสินค้า42รายการยังไม่ได้ทำmass/energy/yieldรายขั้นครบทั้งหมด, ภายนอกเป็นaggregatefirms/blocs, ไม่มีconstitutional/parliamentarycoalitionmodel/tacticalwarfare, customsยังไม่ใช่HS code, automaticministryยังไม่เลือกquotaเอง, tenantbuildingrightsยังไม่แยกครบ, softwarescope/allocatedlaborยังมีค่าประมาณ และไม่มีmisinformationnetwork. ข้อเสนอที่เหลืออยู่ [ideas38](../../../ideas/company/38_sme_civics_followups.md) ไม่ทำซ้ำส่วนที่ย้ายเข้าstatusแล้ว

เปิดเล่นไฟล์root `Company_single.html` หรือเปิด `COMPANY_SOURCE/index.html` ผ่านlocalserver เลือกธุรกิจ แล้วเฝ้าดูNPCเอง ดู [คู่มือ](../SME_AND_CIVICS_SYSTEM.md) / [รับช่วง](../SME_CIVICS_V290_HANDOFF.md)
