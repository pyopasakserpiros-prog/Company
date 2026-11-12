> รุ่นล่าสุด v2.9.0: เริ่ม SME 6 แบบ รัฐบาล/กระทรวง/ข้อตกลงรายสินค้า และ NPC ที่รับข่าว/เรียนรู้ตามบริบท ดู [รายงาน](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.9.0.md) / [คู่มือ](docs/company/SME_AND_CIVICS_SYSTEM.md)

# Company Simulation — Autonomous Campus

เกมจำลองบริษัทที่ผู้เล่นเฝ้ามอง NPC และ CEO ตัดสินใจเอง ฉากหลักเป็นที่ดินภายนอกที่มีอาคารสำนักงาน โรงงาน คลัง โรงอาหาร สวน และศูนย์ฝึก

เปิดเล่น `COMPANY_SOURCE/CompanyFoundation_single.html` (หรือ `Company_single.html`) ได้แบบออฟไลน์ หรือเปิด `COMPANY_SOURCE/index.html` ผ่าน local server ดูวิธีรันและทดสอบใน [COMPANY_SOURCE/README.md](COMPANY_SOURCE/README.md)

สถานะคำสั่งล่าสุดและพรอมต์ประวัติอยู่ที่ [ACTIVE_PROMPT.md](ACTIVE_PROMPT.md) ส่วนเอกสาร Company จัดหมวดไว้ใน [ดัชนีเอกสาร](docs/company/README.md)

ทุกครั้งที่เริ่มงาน ต้องเปิดอ่าน `AGENTS.md` ฉบับปัจจุบันก่อน จากนั้นอ่าน `START_HERE_FOR_AI.md` และ `project_status_and_ai_onboarding.md` สำหรับข้อกำหนดและสถานะปัจจุบัน

Human Core 1.0.0 ถูกล็อกถาวร ห้ามแก้ไฟล์แกนหรือ hash; เพิ่มระบบภายนอกแกนได้ เกม Company ปัจจุบันอยู่ branch `main`; ข้อความ branch ในเอกสารเก่าต้องเทียบกับ repo จริง

## ผู้เล่นและทิศทางเกม

ผู้ใช้ไม่มีความรู้ด้านเขียนโค้ด ชอบเฝ้าดูโลก NPC ที่ใช้ชีวิตและตัดสินใจเอง และทดลองแก้นิสัย บริษัท เงิน หรือทรัพยากรเพื่อดูผลที่ตามมา ทีม Codex/Agy/Gemini/ChatGPT ต้องช่วยคิดและเสนอไอเดียเองด้วย ไม่รอให้ผู้ใช้กำหนดทุกอย่าง Edit Hub ต้องใช้ง่ายด้วยภาษาของผู้เล่น

อ่าน [ความต้องการผู้เล่นและหลักออกแบบ](docs/company/PLAYER_VISION_AND_DESIGN_PRINCIPLES.md) ก่อนเสนอหรือพัฒนาฟีเจอร์ **AGENTS.md คือกฎเหล็ก ห้ามแก้โดยไม่ได้รับอนุญาตจากผู้ใช้โดยตรง**

## Workflow ร่วมพัฒนา

ทีมมี Codex และ Agy ที่เข้าถึง repo โดยตรง กับ Gemini/ChatGPT แบบแอปแชตที่รับส่ง ZIP ผ่านผู้ใช้ อ่าน [ขั้นตอนทำงานร่วมกัน](docs/company/AGENT_COLLABORATION_WORKFLOW.md) และ [สถานะงานปัจจุบัน](docs/company/AGENT_WORK_STATUS.md) ก่อนเริ่ม เพื่อประสานขอบเขตและไม่แก้ทับงานกัน

Gemini มีอิสระคิดไอเดีย ออกแบบเพิ่มเติม และตัดสินใจภายใต้กฎเหล็ก เมื่อส่ง ZIP กลับให้ตรวจเทียบกับ repo ล่าสุดก่อนรวม และย้ายเฉพาะ ideas ที่ตรวจแล้วว่าทำเสร็จไปบันทึกในสถานะโครงการ

รุ่น v2.3.0 เพิ่มหน้าบริษัท ความรู้รายตัวละคร 170 วิชา และโครงการวิจัย/รับถ่ายทอดเทคโนโลยี ดู [คู่มือระบบ](docs/company/LEARNED_KNOWLEDGE_SYSTEM.md) และ [เทมเพลตวิชา](docs/company/templates/KNOWLEDGE_SUBJECT_TEMPLATE.md)

## โลกภายนอก v2.4.0 – v2.7.0

ปุ่ม **โลก** มี 6 หมวด: ภาพรวม ประเทศ/รัฐบาล บริษัท ตลาด การทูต/เส้นทาง และพงศาวดาร รัฐมีคลังและนโยบายจากเศรษฐกิจ บริษัทภายนอกใช้เงินและสต็อกจริง แยกต้นทุนขาย (`cogsSatang`), ค่าใช้จ่ายดำเนินงาน (`operatingExpenseSatang`), กำไรตามเกณฑ์คงค้าง (`accrualProfitSatang`) และกระแสเงินสดสุทธิ (`cashFlowSurplusSatang`) พร้อมวงจรชีวภาพภายนอก ตรวจเหตุผลการตัดสินใจและของระหว่างทางได้

อ่าน [คู่มือและข้อจำกัด](docs/company/LIVING_WORLD_SYSTEM.md) และ [รายงานแพตช์ v2.7.0](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md)

## รุ่นปัจจุบัน v2.7.0 — Process-Driven Realism Overhaul

ยกระดับกระบวนการผลิตและธุรกิจทั้ง 8 ด้านให้ทำงานตามเวลาจำลองที่ผ่านไปจริง:
- คิวแปรรูปวัตถุดิบทั้ง 40 สูตร (`w.plant.refineryBatches`: จองวัตถุดิบ → ตั้งเครื่อง → เดินเครื่อง/คุมอุณหภูมิ → ถ่ายล็อตและตรวจปล่อยเข้าคลัง)
- การขนส่งกองรถและบริการอุตสาหกรรม B2B ทั้ง 10 แบบตามเวลาเดินทาง/เวลาทำงานผู้เชี่ยวชาญจริง พร้อมบันทึกผลวัด (`testMeasurements`) และชั่วโมงห้องเย็น (`storageHoursOccupied`)
- วิศวกรรมซอฟต์แวร์และ QA ที่ผูกกับชั่วโมงทำงานของนักพัฒนาที่มีคุณวุฒิจริง การประเมินขยายขอบเขตงาน และโทษ SLA เมื่อส่งมอบพร้อมบั๊กค้าง
- วิศวกรรมการผลิตเฉพาะตัวสินค้า 42 รายการ, ระบบย่อยเครื่องจักร 5 ด้าน (`subsystems`), การวินิจฉัยอาการเสีย (`faultModes`), และการจัดหาเครื่องจักร 3 แบบ (`purchased_new`, `used_refurbished`, `leased`)
- คลังสินค้าล็อต (`w.warehouse`), FIFO/FEFO, โซ่ความเย็น, การประมูลภาครัฐแข่งขันกับบริษัทภายนอก (`w.commerce.tenders`), การเจรจาปรับลดสัญญา/ยุติสัญญา และวงจรชีวภาพปศุสัตว์ 180 นาที

อ่าน [คู่มือและขอบเขต](docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md), [รายงาน v2.7.0](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md) และ [เอกสารรับช่วง v2.7.0](docs/company/PROCESS_REALISM_V270_HANDOFF.md) ก่อนพัฒนาต่อ
