# รายงาน Company v2.6.0 — เครื่องจักร งานช่าง และสัญญาขายเป็นงวด

ฐาน main c2609be (v2.5.0), วันที่12พฤศจิกายน2026, Codex ผู้ใช้อนุมัติให้ทำงานผลิตต่อ และเพิ่มข้อกำหนดเครื่องมือในธุรกิจอื่นด้วย งานนี้ไม่แก้AGENTS.md หรือHuman Core/CORE_LOCK

## ผลงาน

เพิ่มplant.js เครื่องมือ20ชนิด routeครบ42สินค้า มีแรงงานจริง เวลาที่เครื่องทำเอง อุณหภูมิ ช่องเครื่อง สึกหรอ ค่าไฟ กำหนดส่งเครื่อง2/5/14วัน (สายเวเฟอร์180วัน) ติดตั้งโดยคนรู้จริง ซ่อมพร้อมอะไหล่/ทุนและการเรียนวิชาจากprerequisite เพิ่มgateเครื่องให้สูตร40วัตถุดิบ บริการ10แบบ ซอฟต์แวร์ ขนส่งและเครื่องมือพื้นฐานเกษตร

ฝ่ายขายเสนอสินค้าคงคลังให้ผู้ใช้สินค้าจริงและกันงบผู้ซื้อก่อนรับสัญญา เพิ่มสัญญารวม120/240/1,000ชิ้นแบ่งงวด4–80ตามกำลังผลิต งวดใหม่รอจ่ายงวดก่อน งานจัดซื้อรัฐแบบย่อมีเงื่อนไขเอกสาร/ชื่อเสียง/ทุนและไม่มีมัดจำ จ่าย7วันหลังinvoice คลังจำกัดพื้นที่ตามขนาดสินค้าและจองพื้นที่ก่อนแพ็ก ไม่สร้างชิ้นงานพันตัวพร้อมกัน

เพิ่มหน้าบริษัทเครื่องจักร/งานช่างและฝ่ายขาย/สัญญา แสดงสิ่งที่เกิดจากstateจริง รักษาเวลา1×ช้าลง5เท่าและเดิน8ช่องจากรุ่นก่อน

## สิ่งที่คิดเพิ่มและเหตุผล

ไม่ซื้อไลน์ราคาแพงเพียงเพราะมีเงินและขาดinputเล็กน้อย ต้องมีประวัติปริมาณงานรองรับ; อุปกรณ์ต้องรอส่งและติดตั้ง; ช่างต้องมีอะไหล่และความรู้จริงไม่ซ่อมฟรี หากขาดวิชาเริ่มเรียนprerequisite; เวลารอเครื่องปล่อยคนทำงานอื่นได้; แยกเงินกันสัญญาจากรายได้เพื่อไม่รับรู้ยอดขายทั้งพันชิ้นล่วงหน้า; เพิ่มขนาดพื้นที่คลังตามชนิดสินค้าและกันพื้นที่ให้งานแพ็กที่กำลังทำ

## สถาปัตยกรรมและเอกสาร

อ่าน [คู่มือและสัญญาระบบ](../PLANT_AND_COMMERCIAL_SYSTEM.md) สำหรับฟังก์ชัน สูตร หน่วย และข้อจำกัด ไฟล์หลักที่เพิ่มคือplant.js/testplantและคู่มือ; แก้sim/api/save/world/index/debugรวมถึงfixtureบริษัทที่มีโรงงานพร้อมเดิม (fixtureติดตั้งอุปกรณ์อย่างชัดเจน ไม่ใส่เป็นทางลัดในเกมจริง) สร้างstandalone3สำเนาจากsourceเดียวกัน

อัปเดตstatusทั้ง2สำเนา README/START_HERE/ACTIVE_PROMPT ทะเบียนงาน API ideas/directoryindexและรายงาน Master2ตัวและสำเนาราก พร้อมdomain production/economy/supply-chain/campus/executive/world/observability/architecture/save/QAตามผลกระทบ ไม่เปลี่ยนmaturityร่างเป็นmasterโดยไม่มีประเมิน ไม่มีเครื่องมือซิงก์สกิลแอปGemini จึงเตรียมสำเนารากและระบุรอซิงก์ ไม่อ้างว่าในแอปอัปเดตแล้ว สกิลบุคลิก/อาชีพ/registryวิชาไม่เปลี่ยนสัญญา และไม่เปลี่ยนแกนมนุษย์

## การตรวจ

npm test ผ่าน177/177 (เดิม167+ใหม่10); checkผ่านsyntax/catalog/layout/finance/saveและcorehashเดิม; buildผ่านสามสำเนา; browser12/12รวม390×844และdesktop/standaloneและsnapshotไม่เปลี่ยนจากการเปิดหน้าจอเครื่องจักร/สัญญา

ทดสอบโลก120วัน2seedโดยเปิดautonomy เพิ่มcashผ่านEdit Hub ปิดเป้าชนะชั่วคราวเฉพาะฉากตรวจ (winCashสูง/scenarioDays365): ทั้งสองโลกrunningวันที่121 ไม่มีaudit/save errors มีสัญญาB2B120ชิ้นจริง; seedplant-world-aออกงวด105/ส่ง70, seedplant-world-bออก40/ส่ง0ในช่วงที่วัด เป็นการตรวจผลตามเงื่อนไข ไม่รับประกันทุกเซฟต้องได้งานรัฐหรือส่งครบภายใน120วัน การตรวจนี้ทำก่อนเพิ่มETAรับเครื่อง/การเรียนprerequisite/ขนาดช่องคลังบางข้อ จึงไม่ใช้แทนการตรวจsuiteล่าสุด

กรณีแยกใหม่ตรวจrouteเครื่อง42สินค้า; ไม่มีช่าง/ไม่มีอะไหล่;ซื้อ/รอ/ติดตั้ง;เวลารอและอุณหภูมิ+เซฟกลางทาง;escrowบริษัท/รัฐ;งวดใหญ่โดยไม่มีพันunit;ข้อมูลงบ/เครื่องเสีย;เงื่อนไขงานรัฐ;ไม่ซื้อfabเก็งกำไร;เสนอของในคลัง→ส่ง→รับเงิน→คืนงบส่วนเหลือโดยไม่ผลิตซ้ำ

benchmarkล่าสุด: 500NPCเฉลี่ย 0.654 ms/tick,p95 1.031,max 5.341 (Node simulation-only ไม่ใช่FPSมือถือ)

## เสร็จ/ข้อจำกัด

วงจรสินค้าจากแรงงาน→เครื่อง→รอ→QA→แพ็ก→คลัง/สัญญา→ส่ง→เงินจริงทำแล้ว เครื่องมีบทบาทกับการทำงานและการบำรุงที่ตรวจจริง แต่routeยังเป็นแบบกลุ่มไม่ใช่ทุกโรงงานตามวิศวกรรมจริง สูตรวัตถุดิบยังbatchAPIเดิมหลังผ่านgateเครื่อง ไม่ใช่คิวcontinuous/refiningทุกขั้น บริการและซอฟต์แวร์ใช้lifecycleเดิมพร้อมgateเครื่อง งานรัฐเป็นการเสนอราคาจัดซื้อแบบย่อ ยังไม่มีประมูลแข่งหลายผู้ยื่น/กฎหมาย/หลักประกันครบวงจร สัญญาเดิมไม่ถูกย้ายเข้ากระเป๋าคู่ค้าทั้งหมด อะไหล่เป็น3วัสดุแทนชิ้นส่วนเฉพาะเครื่อง

รายงานและสถานะไม่อ้างว่าจำลองทุกอุตสาหกรรมสมบูรณ์ ข้อเสนอที่ยังไม่มีจริงอยู่ในideasและบันทึกรับช่วง ผู้ใช้ยังเป็นผู้สังเกต ไม่ต้องกดสั่งซื้อเครื่อง/ซ่อม/รับประมูลแทนNPC

## ส่งมอบ

เปิดCompany_single.htmlหรือsource/index.html บริษัท→เครื่องจักร/งานช่าง และฝ่ายขาย/สัญญา ZIPรากเดียวCompany-v2.6.0มีsource/assets/tools/tests/.agents/เอกสาร/รายงานและstandaloneพร้อมmanifestฐานc2609beและSHAทุกไฟล์ ก่อนส่งตรวจCRC/เทียบแฮช/แตกในพื้นที่ใหม่และรันcheck/test/buildจากsourceที่แตก แฮชและขนาดZIPแจ้งแยกใน.sha256 ไม่อ้างผู้รับดาวน์โหลดสำเร็จแล้ว

## รายการไฟล์ในชุดเปลี่ยนแปลง

```text
M	.agents/skills/README.md
M	.agents/skills/company-campus-and-logistics/SKILL.md
M	.agents/skills/company-economy-and-accounting/SKILL.md
M	.agents/skills/company-edit-hub-and-observability/SKILL.md
M	.agents/skills/company-evolution-dev/SKILL.md
M	.agents/skills/company-executive-business-decisions/SKILL.md
M	.agents/skills/company-for-every-patch/SKILL.md
M	.agents/skills/company-gameplay-architecture/SKILL.md
M	.agents/skills/company-production-and-services/SKILL.md
M	.agents/skills/company-qa-and-delivery/SKILL.md
M	.agents/skills/company-save-system/SKILL.md
M	.agents/skills/company-supply-chain-and-resources/SKILL.md
M	.agents/skills/company-world-and-markets/SKILL.md
M	ACTIVE_PROMPT.md
M	COMPANY_SOURCE/CompanyFoundation_single.html
M	COMPANY_SOURCE/Company_single.html
M	COMPANY_SOURCE/README.md
M	COMPANY_SOURCE/index.html
M	COMPANY_SOURCE/js/api.js
M	COMPANY_SOURCE/js/data.js
M	COMPANY_SOURCE/js/debug.js
M	COMPANY_SOURCE/js/save.js
M	COMPANY_SOURCE/js/sim.js
M	COMPANY_SOURCE/js/world.js
M	COMPANY_SOURCE/project_status_and_ai_onboarding.md
M	COMPANY_SOURCE/test/business-depth-world-corridors-v210.test.cjs
M	COMPANY_SOURCE/test/campus-browser.cjs
M	COMPANY_SOURCE/test/ecosystem-multitier-dag-v100.test.cjs
M	COMPANY_SOURCE/test/geopolitics-living-world-v200.test.cjs
M	COMPANY_SOURCE/test/knowledge-fixtures.cjs
M	COMPANY_SOURCE/test/product-depth-npc-board-v130.test.cjs
M	COMPANY_SOURCE/test/sme-growth-utilities-culture-v220.test.cjs
M	COMPANY_SOURCE/test/true-upstream-agri-fleet-software-v110.test.cjs
M	Company_single.html
M	README.md
M	SKILL.md
M	SKILL_COMPANY_EVOLUTION_DEV.md
M	SKILL_COMPANY_FOR_EVERY_PATCH.md
M	START_HERE_FOR_AI.md
M	docs/company/AGENT_WORK_STATUS.md
M	docs/company/LIVING_WORLD_SYSTEM.md
M	docs/company/PATCH_REPORTS/README.md
M	docs/company/PRESENTATION_API.md
M	docs/company/README.md
M	ideas/company/README.md
M	project_status_and_ai_onboarding.md
A	COMPANY_SOURCE/js/plant.js
A	COMPANY_SOURCE/test/plant-and-commercial.test.cjs
A	docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.6.0.md
A	docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md
A	docs/company/PLANT_V260_HANDOFF.md
A	docs/superpowers/plans/2026-11-12-plant-commercial.md
```
