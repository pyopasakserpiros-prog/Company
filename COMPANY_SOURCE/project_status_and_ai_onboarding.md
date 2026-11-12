# สถานะ Company Simulation — v2.7.0

อัปเดต 12 พฤศจิกายน 2026 ยึด source จริงเหนือรายงานเก่า รุ่นเกม `D.VERSION` / `D.RELEASE_VERSION` / `S.RELEASE_VERSION = "2.7.0"`; save schema/version และ `package.json` ยังคง `"0.1.0"` (ไม่ใช่เลขแพตช์เกม) Human Core 1.0.0 ถูกล็อกถาวรตาม `AGENTS.md` (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`)

## ระบบที่ใช้งานได้

- ผู้เล่นเฝ้าดู NPC/ผู้บริหารตัดสินใจเอง แก้ข้อมูลรายบุคคล/เงิน/ของผ่าน Edit Hub เพื่อทดลองผล ไม่ต้องบริหารงานประจำแทน NPC
- บริษัทบน campus มีการเดินทาง ทำงาน พัก ความสัมพันธ์ ค่าจ้าง อาชีพ บอร์ด งบลงทุน การขยาย และบัญชีเงิน/สินค้า
- วิชา 170 รายการแยกจาก Human Core มี prerequisite/ระดับ/ศักยภาพ/ทักษะใช้งานจริง R&D และรับถ่ายทอดเทคโนโลยีเฉพาะเป้าหมาย ทีมพร้อมหลายวิชา ต้นแบบและ QA จริง
- catalog วัตถุดิบ 64 สูตร 40 สินค้า 42 บริการ B2B 10 รวมธุรกิจซอฟต์แวร์/SaaS กองรถ เกษตร/ต้นน้ำ/ทรัพย์สินภายนอกตามเงื่อนไขของแต่ละระบบ
- โลกภายนอก 12 ประเทศ/กลุ่ม 28 กิจการตั้งต้น มีเงิน/สต็อก/การค้า/ขนส่ง แยกต้นทุนขาย (`cogsSatang`) ค่าใช้จ่ายดำเนินงาน (`operatingExpenseSatang`) กำไรเกณฑ์คงค้าง (`accrualProfitSatang`) และกระแสเงินสดสุทธิ (`cashFlowSurplusSatang`) นโยบายรัฐบาลและสัมพันธ์ 66 คู่ ปุ่มโลก 6 หมวด อ่าน [คู่มือโลก](docs/company/LIVING_WORLD_SYSTEM.md)
- เวลา 1× ใช้ 2 นาทีจำลองต่อวินาทีจริง (วันเต็ม 12 นาทีจริง) เดิน 8 ช่องต่อ tick 5 นาที จาก v2.5.0

## สิ่งที่เพิ่มและเชื่อมจริงใน v2.7.0 (Process-Driven Realism Overhaul)

1. **คิวแปรรูปวัตถุดิบและสินค้าขั้นกลางตามเวลาจริง (`w.plant.refineryBatches`):** สูตรวัตถุดิบทั้ง 40 สูตรเดินผ่านสถานะ `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released/rework/scrapped/cancelled` ใช้เครื่องจักร ความร้อน เวลาคน/เวลารอเครื่องจริง และตรวจพื้นที่ว่างคลังก่อนปล่อยของ
2. **การขนส่งกองรถและบริการ B2B 10 แบบตามเวลาจริง:** ยกเลิกทางลัด `completeAllSteps: true` ในลูปอัตโนมัติของ NPC บังคับเวลาเดินทางไป-กลับจริง การพักคนขับ การวัดผลทางเทคนิค (`testMeasurements`), การแยกทรัพย์สินลูกค้า (`instrumentCustody`) และชั่วโมงห้องเย็น (`storageHoursOccupied`)
3. **วิศวกรรมซอฟต์แวร์/QA/SLA จริง:** ต้องมีนักพัฒนาที่มีความรู้ `programming >= 40` และ `software >= 40` ความเร็วและอัตราเกิดบั๊กคำนวณจากโปรไฟล์ Human Core รองรับการประเมินขยายขอบเขตงาน (`discoverScopeChange`) และโทษปรับ SLA/ชื่อเสียงเมื่อส่งมอบงานที่มีบั๊กค้าง (`deployWithKnownDefects`)
4. **วิศวกรรมการผลิตเฉพาะตัวสินค้า 42 รายการ & เครื่องจักร 20 ชนิด:** `P.route(product)` มีเกณฑ์วิชาและ `safetyCritical` รายขั้น, ป้องกันการคูณค่าไฟ/ความร้อนซ้ำเมื่อแชร์เครื่องใน tick เดียว, เครื่องจักรมีระบบย่อย 5 ด้าน (`subsystems`), อาการเสีย (`faultModes`), การจัดหา 3 แบบ (`purchased_new`, `used_refurbished`, `leased`) และการตรวจรับหลังซ่อม (`serviceRecords`)
5. **คลังสินค้าล็อต/FIFO-FEFO/โซ่ความเย็น (`w.warehouse`):** ติดตาม `materialLots`, `finishedLots`, อายุเก็บรักษาตามสถานะห้องเย็น/ไฟตก และบล็อกการรับของเกินความจุคลัง
6. **ประมูลภาครัฐแข่งขัน เจรจาปรับสัญญา และยุติสัญญา (`w.commerce.tenders`):** ประมูลแข่งกับกิจการภายนอกด้วยคะแนนราคา/คุณภาพ/ชื่อเสียง (`W.evaluateCompetitiveTender`), ปรับลดจำนวนสัญญาระหว่างทางพร้อมคืนเงินกันส่วนต่าง (`renegotiateCommercialContract`), ยุติสัญญาอย่างเป็นทางการ (`terminateCommercialContract`), และผูกการจ่ายเงินของคู่ค้าขนส่ง/บริการ/ซอฟต์แวร์ผ่าน `W.payFromCounterparty`
7. **วงจรชีวภาพปศุสัตว์ 180 นาที:** แยก `feedLivestockHerd` จาก `milkLivestockHerd` ต้องผ่านเวลาชีวภาพ 180 นาทีจึงให้น้ำนม พร้อมวงจรชีวภาพของกิจการภายนอก (`fresh_milk_soy`, `natural_latex`, `timber_bamboo_log`)

อ่าน [คู่มือโรงงานและสัญญา](docs/company/PLANT_AND_COMMERCIAL_SYSTEM.md), [รายงาน v2.7.0](docs/company/PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.7.0.md) และ [รับช่วง v2.7.0](docs/company/PROCESS_REALISM_V270_HANDOFF.md)

## ข้อจำกัดสำคัญ

เครื่องจักรอยู่ตามสถานีในผังเดิม ยังไม่มีภาพแอนิเมชันแยกห้องเครื่องทุกชนิดในมุมมอง 2D; กระบวนการเป็นระดับกลุ่มอุตสาหกรรมของเกม ไม่ใช่จำลองเคมี/ฟิสิกส์ระดับโรงงานจริง; โลกภายนอกเป็นเศรษฐกิจรวม ไม่ใช่ประชากรรายคนหรือกฎหมายภาษีจริง

## ผลตรวจล่าสุด (v2.7.0)

- `npm test`: **186/186** ผ่านครบทุกข้อ (รวมชุดทดสอบใหม่ `test/process-realism-v270.test.cjs`); `npm run check` และ `npm run build` (`1,695,923` bytes) ผ่าน
- `node tools/benchmark.cjs`: 500 NPC เฉลี่ย `1.056 ms/tick`, p95 `1.510 ms` (300 NPC เฉลี่ย `0.586 ms/tick`)
- แกนมนุษย์ (`human-core.js`), `CORE_LOCK.json` และ `AGENTS.md` ไม่เปลี่ยน

## เอกสารและงานร่วม

อ่าน [AGENTS.md](AGENTS.md), [workflow](docs/company/AGENT_COLLABORATION_WORKFLOW.md), [ทะเบียนงาน](docs/company/AGENT_WORK_STATUS.md) และ [ดัชนีรายงานทุกแพตช์](docs/company/PATCH_REPORTS/README.md) ก่อนเริ่มทุกครั้ง
