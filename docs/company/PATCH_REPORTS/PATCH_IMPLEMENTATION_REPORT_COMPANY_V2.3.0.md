# รายงาน Company v2.3.0 — ความรู้ NPC เทคโนโลยี และหน้าบริษัท

ฐาน: main `359bace` (v2.2.0) · ผู้พัฒนา Codex · วันที่ 11 พฤศจิกายน 2026 · source ใหม่ v2.3.0, save/core headers และ Human Core ที่ล็อกคงเดิม

## ปัญหาและผลที่เปลี่ยน

ผู้ใช้พบว่ากล้องย่อไม่เห็นทั้งนิคม ข้อมูลบริษัทกระจัดกระจาย และทีมเล็กปลดล็อกสินค้าทั้งหมดด้วยแต้มรวมอย่างรวดเร็ว เซฟจริงที่ให้มาตอนโหลดมีปลดล็อกครบ 42 สินค้าและ 2,309 แต้ม แต่ทีมปัจจุบันไม่มี engineer จึงยกเลิกการใช้แต้มเป็นสิทธิผลิต

- กล้อง fit ทั้งแนวกว้าง/สูงและ min zoom ตาม viewport; ปุ่มบ้านคืนมุมมองทั้งนิคมและเลิกตามตัวละคร ทดสอบปุ่ม/ล้อ/บีบนิ้ว
- หน้าบริษัทแยกภาพรวม R&D/ความรู้ สารบัญวิชา ธุรกิจ/สินค้า บอร์ด/แผน โครงสร้าง/คน ทรัพย์สิน/ทรัพยากร; หน้าตัวละครมีความรู้ Lv1–Lv5 โดยลดหัวการ์ดที่บังข้อมูลบนจอมือถือ
- เพิ่ม 170 วิชาที่มี prerequisites, ระดับ, หลายแกน aptitude/potential, อัตราเรียนตามระดับ/สภาพ, ประสบการณ์จริง และผลต่องาน วิชาไม่ขึ้นกับตำแหน่งหรือโมเดลที่บริษัทใช้ ความรู้ที่ยังไม่มีงานใช้ไม่ถูกล็อก พนักงานมีความสนใจ/ประวัติหลากหลาย และอาจศึกษานอกงานจากเงินตัวเอง
- gate หลายวิชาของทีมแยกจากผู้ลงมือหลัก ตรวจสินค้า 42 รายการ กระบวนการ 40 สูตร บริการ 10 แบบ ซอฟต์แวร์ ขนส่ง เกษตรและปศุสัตว์; สูตรพื้นฐานยังต้องมีผู้รู้ ส่วนสูตรที่มี tech gate ต้องรับรองกระบวนการเฉพาะด้วย
- R&D มีเวลาแต่ละแขนง วัตถุดิบต้นแบบ ค่างานทดลอง ระยะวัน และ QA คนละคน ตรวจไม่ผ่านต้องแก้และใช้ตัวอย่างใหม่ การขาย/รับงานใหม่ตรวจ readiness; คำว่าแบบแปลนไม่เท่ากับพร้อมดำเนินงาน
- ซื้อสิทธิถ่ายทอดเทคโนโลยีเฉพาะเป้าหมายได้ในราคา 3 เท่าฐานงานวิจัย ใช้ 40% ชั่วโมงและยังต้องรับถ่ายทอด/ตรวจรับ ผู้บริหารเลือกจากเงินสำรอง ความรู้ โอกาส ตลาด ความเสี่ยง และทางเลือกซื้อชิ้นส่วน
- Edit Hub แก้วิชารายบุคคลพร้อมเหตุการณ์; legacy research grants ไม่ทำให้ผลิตได้ทุกอุตสาหกรรม ซื้อฟาร์มไม่แถมความรู้เบเกอรี่
- build อัปเดต CompanyFoundation_single.html, COMPANY_SOURCE/Company_single.html และ Company_single.html จาก source เดียวกัน

## หลักฐานที่ตรวจจริง

- `npm test`: **152/152** รวมชุดใหม่ 12 ข้อ ทดสอบเงิน/แต้มไม่ข้าม gate, ทีมหลายคนร่วมความรู้, ผู้เชี่ยวชาญออก, ชั่วโมง/วัน/ต้นแบบ/QA, ซื้อเทคโนโลยี, วิชาที่นายจ้างไม่ใช้, aptitude/fatigue และงานประกอบจริงที่ความรู้ต่างกันแต่ core เหมือนกัน
- `npm run check`: ผ่าน syntax/catalog/layout/save และ SHA-256 Human Core `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`
- `npm run build`: ผ่าน และ HTML สามสำเนาแฮชตรงกัน
- `npm run test:browser`: **9/9** บน Chromium Linux ครอบคลุมมือถือ 390×844, pinch/ปุ่ม, fit ทั้งนิคม, บริษัท, Lv4/Lv5 ในหน้าตัวละคร และ standalone/desktop ไม่มี page error
- Node benchmark 500 NPC: **0.582 ms/tick**, p95 **0.704 ms** เป็นเวลา simulation ไม่ใช่ FPS โทรศัพท์
- เซฟผู้ใช้: นำเข้าวันที่ 21 (42 unlock claims เก็บเป็นประวัติ, เหลือสิทธิเริ่มต้นที่ตรวจใหม่) เงิน/คน/16 ออเดอร์คงอยู่; จำลองต่อ 7 วันถึงวันที่ 28 ตรวจ audit/save ทุกวันผ่านและ serialize/load กลับตรงกัน ไม่ commit เซฟส่วนตัวลง repo
- ตรวจ SHA ของไฟล์ล็อกและ AGENTS.md เทียบฐานโดยไม่แก้ไข; ตรวจลิงก์เอกสารและ diff whitespace

## สิ่งที่คิดและออกแบบเพิ่ม

เพิ่มการศึกษาส่วนตัวที่ใช้เงิน/เวลาพัก, ความรู้ข้ามอาชีพที่ยังไม่ได้ใช้, การลาออกทำให้บริษัทสูญเสียผู้รู้แต่ไม่ลบเอกสารเทคโนโลยี, การซื้อสิทธิที่ต้องทดลองก่อน, independent QA/rework, prototype material ledger และทะเบียนที่สร้างจาก source เพื่อให้เพิ่มเนื้อหาในอนาคตได้อย่างตรวจสอบได้

ค้นแหล่งหลักบนอินเทอร์เน็ต: O*NET, ESCO, ABET, CS2023, MIT OCW, FAO/Codex, NIST NICE, USDA และ ACCA รายงาน [แหล่งหลัก](../research/KNOWLEDGE_CURRICULUM_SOURCES.md) แยกข้อเท็จจริงจากสูตรเกม; จำนวน 170 และน้ำหนัก aptitude เป็นการออกแบบของเกม ไม่ใช่มาตรฐานวิชาชีพที่องค์กรรับรอง

## เอกสารและสกิล

- [คู่มือระบบ](../LEARNED_KNOWLEDGE_SYSTEM.md), [ทะเบียน 170 วิชา](../KNOWLEDGE_SUBJECT_CATALOG.md), [เทมเพลตเพิ่มวิชา](../templates/KNOWLEDGE_SUBJECT_TEMPLATE.md), [รับช่วง](../GEMINI_NEXT_PATCH_HANDOFF_V230.md)
- อัปเดต project status ทั้ง repo/source, README, START_HERE, API, ดัชนีเอกสาร, ทะเบียนงาน และส่วน ideas ที่ระบบใหม่ทำแล้ว
- อัปเดต Master Skills ทั้งสอง, root mirrors และสกิลเฉพาะด้านที่กระทบ 14 รายการ โดยไม่เลื่อน maturity ร่างเป็น master เพียงเปลี่ยนชื่อ
- **แอป Gemini:** ไม่มีเครื่องมือ skills:update_skill ของแอป Gemini ในฝั่ง Codex จึงอัปเดตเฉพาะ repo และสำเนาส่งต่อ ไม่อ้างว่าซิงก์แอปแล้ว

## ข้อจำกัด

ไม่มีระบบผู้สอน NPC ที่จองเวลาเต็มรูปแบบหรือใบอนุญาตวิชาชีพรายประเทศ การศึกษาในงานเป็นหลักสูตรภายนอกที่คิดค่าบริการ กำหนดเวลา/เลเวล/เพดาน/น้ำหนักเป็นสมมติฐาน simulation ซึ่งยังปรับสมดุลต่อได้ การคงออเดอร์เก่าไม่รับประกันว่าจะผลิตต่อได้หากขาดผู้รู้ ชุดทดสอบเบราว์เซอร์ไม่ใช่การวัด FPS บนเครื่องผู้ใช้

## เปิดเล่นและส่งมอบ

เปิด Company_single.html รุ่นใหม่หรือ COMPANY_SOURCE/index.html ผ่าน local server ตาม README ผู้ใช้ไม่ต้องเขียนโค้ด เปิดบริษัทเพื่อดูแผน และเปิดตัวละคร → ความรู้เพื่อดูวิชาส่วนบุคคล

ZIP ส่งมอบรวม project root ชั้นเดียว พร้อมโฟลเดอร์ .agents, source, เครื่องมือ/เทสต์, เอกสารและ standalone; ไม่มี .git/node_modules/cache/ZIP ซ้อน ตรวจ CRC และแตกใหม่เพื่อตรวจ check/test/build โดยแฮชไฟล์ตรงต้นทาง ขนาดและ SHA ของ ZIP สุดท้ายระบุในไฟล์ .sha256 แยกจาก ZIP เพื่อหลีกเลี่ยง hash อ้างตัวเอง

## ไฟล์เพิ่ม/แก้ (ไม่มีการลบไฟล์)

```text
M	.agents/skills/README.md
M	.agents/skills/company-campus-and-logistics/SKILL.md
M	.agents/skills/company-data-integrity/SKILL.md
M	.agents/skills/company-economy-and-accounting/SKILL.md
M	.agents/skills/company-edit-hub-and-observability/SKILL.md
M	.agents/skills/company-evolution-dev/SKILL.md
M	.agents/skills/company-executive-business-decisions/SKILL.md
M	.agents/skills/company-for-every-patch/SKILL.md
M	.agents/skills/company-gameplay-architecture/SKILL.md
M	.agents/skills/company-npc-life-and-behavior/SKILL.md
M	.agents/skills/company-production-and-services/SKILL.md
M	.agents/skills/company-qa-and-delivery/SKILL.md
M	.agents/skills/company-rendering-and-performance/SKILL.md
M	.agents/skills/company-save-system/SKILL.md
M	.agents/skills/company-supply-chain-and-resources/SKILL.md
M	.agents/skills/company-workforce-and-careers/SKILL.md
M	.agents/skills/company-world-and-markets/SKILL.md
M	COMPANY_SOURCE/CompanyFoundation_single.html
M	COMPANY_SOURCE/Company_single.html
M	COMPANY_SOURCE/README.md
M	COMPANY_SOURCE/css/debug.css
M	COMPANY_SOURCE/index.html
M	COMPANY_SOURCE/js/api.js
M	COMPANY_SOURCE/js/campus-render.js
M	COMPANY_SOURCE/js/data.js
M	COMPANY_SOURCE/js/debug.js
M	COMPANY_SOURCE/js/save.js
M	COMPANY_SOURCE/js/sim.js
M	COMPANY_SOURCE/project_status_and_ai_onboarding.md
M	COMPANY_SOURCE/test/autonomous-campus-v010.test.cjs
M	COMPANY_SOURCE/test/business-depth-world-corridors-v210.test.cjs
M	COMPANY_SOURCE/test/campus-browser.cjs
M	COMPANY_SOURCE/test/ecosystem-multitier-dag-v100.test.cjs
M	COMPANY_SOURCE/test/expert-audit-codezero-v100.test.cjs
M	COMPANY_SOURCE/test/external-assets-production-chains-v060.test.cjs
M	COMPANY_SOURCE/test/geopolitics-living-world-v200.test.cjs
A	COMPANY_SOURCE/test/knowledge-and-company.test.cjs
A	COMPANY_SOURCE/test/knowledge-fixtures.cjs
M	COMPANY_SOURCE/test/product-depth-npc-board-v130.test.cjs
M	COMPANY_SOURCE/test/simulation.test.cjs
M	COMPANY_SOURCE/test/sme-growth-utilities-culture-v220.test.cjs
M	COMPANY_SOURCE/test/true-upstream-agri-fleet-software-v110.test.cjs
M	COMPANY_SOURCE/tools/build.cjs
A	COMPANY_SOURCE/tools/knowledge-catalog.cjs
M	Company_single.html
M	README.md
M	SKILL.md
M	SKILL_COMPANY_EVOLUTION_DEV.md
M	SKILL_COMPANY_FOR_EVERY_PATCH.md
M	START_HERE_FOR_AI.md
M	docs/company/AGENT_WORK_STATUS.md
A	docs/company/GEMINI_NEXT_PATCH_HANDOFF_V230.md
A	docs/company/KNOWLEDGE_SUBJECT_CATALOG.md
A	docs/company/LEARNED_KNOWLEDGE_SYSTEM.md
A	docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.3.0.md
M	docs/company/PATCH_REPORTS/README.md
M	docs/company/PRESENTATION_API.md
M	docs/company/README.md
A	docs/company/research/KNOWLEDGE_CURRICULUM_SOURCES.md
M	docs/company/research/README.md
A	docs/company/templates/KNOWLEDGE_SUBJECT_TEMPLATE.md
A	docs/company/templates/README.md
M	ideas/company/29_npc_executive_board_and_business_entry.md
M	ideas/company/README.md
M	project_status_and_ai_onboarding.md
```
