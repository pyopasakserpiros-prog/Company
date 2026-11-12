# รายงานการพัฒนาและตรวจรับแพตช์ Company Simulation รุ่น v2.8.0 (`living-scenarios-observability-and-human-depth-v280`)

- **วันที่ส่งมอบ:** 12 พฤศจิกายน 2026
- **รุ่นซอร์ส (`D.VERSION` / `D.RELEASE_VERSION` / `S.RELEASE_VERSION`):** `"2.8.0"` (คง `S.VERSION = "0.1.0"`, `S.SCHEMA = "company-foundation-1"` และ `package.json = "0.1.0"` ตามกฎสถาปัตยกรรม)
- **ฐานที่พัฒนาต่อยอด:** `9e3bc1f` (v2.7.0 `process-driven-realism-overhaul-v270`)
- **สถานะไฟล์ที่ล็อกถาวร:**
  - `COMPANY_SOURCE/js/human-core.js` & `CORE_LOCK.json`: ไม่มีการแก้ไข (`SHA-256: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`)
  - `AGENTS.md`: ไม่มีการแก้ไข (`0` diff)

---

## 1. สรุปภาพรวม 4 เสาหลักที่พัฒนาใน v2.8.0

### เสาหลักที่ 1: ทดลองโลกหลายสถานการณ์ และการแก้คอขวด/วิกฤตอัตโนมัติของ NPC
1. **บริษัทมีเงินแต่ขาดผู้รู้เฉพาะทาง (`evaluateAutonomousHiring`, `candidates`):**
   - สแกนโครงการวิจัย (`w.knowledge.projects`), งานซ่อมเครื่องจักรที่ค้าง (`w.plant.maintenance`), และสินค้าที่ยังไม่พร้อมผลิต เพื่อหาวิชาเฉพาะทางที่ทีมขาด (`missingSubjects`)
   - ผู้สมัครงาน (`candidates(w)`) แสดง `education` และ `topSubjects` จริง เมื่อเปิดรับสมัครอัตโนมัติจะให้คะแนนผู้สมัครที่มีวิชาตรงกับช่องว่างของบริษัทสูงสุด และมอบหมายให้เรียนต่อยอดทันทีหลังรับเข้าทำงาน
2. **เครื่องจักรสำคัญเสีย อะไหล่ติดจอง หรือขาดช่างภายใน (`P.maintain`, `unreservePartForRepair`, `contractOemMaintenance`, `evaluateOperationalCrisesAndBottlenecks`):**
   - แก้ Head-of-Line Blocking ใน `P.maintain(w, hooks)` (`COMPANY_SOURCE/js/plant.js`) ให้วนตรวจงานซ่อมที่ยังไม่เสร็จทุกใบในคิว แทนที่จะหยุดทั้งโรงงานเมื่อใบแรกสุดรออะไหล่หรือรอช่าง
   - เพิ่ม `unreservePartForRepair(w, partId)` (`COMPANY_SOURCE/js/sim.js`) เมื่อเครื่องจักรเสียและต้องการอะไหล่ที่มีอยู่ในคลังจริง (`w.inventory.materials[part] >= 1`) แต่ติดสถานะจอง (`w.inventory.reserved[part]`) ของชิ้นงานที่ยังไม่เริ่มประกอบ ระบบจะปลดจองอะไหล่จากชิ้นงานนั้นเพื่อให้ช่างนำมาซ่อมเครื่องจักรได้ทันทีโดยสมการสต็อกสมดุล 100%
   - เพิ่ม `S.contractOemMaintenance(w, machineId, options)` เมื่อเครื่องจักรหลักเสียค้างเกิน 180 นาที หรือบริษัทไม่มีช่างที่มีระดับวิชาซ่อมถึงเกณฑ์ (`< 30`) และบริษัทมีเงินสดเหนือเงินสำรองอยู่รอด (`survivalReserveSatang`) ผู้บริหารจะว่าจ้างช่างศูนย์บริการ OEM ภายนอก จ่ายค่าซ่อมจริง (`post(w, "equipment", -oemFee)`) ฟื้นฟูสภาพเครื่องและระบบย่อยทั้ง 5 ด้าน พร้อมบันทึก `w.plant.serviceRecords`
3. **รับสัญญาเกินกำลังการผลิต หรือสินค้าสำเร็จรูปค้างคลังขายไม่ออก (`evaluateCommercialSales`, `reconcileWarehouseLots`):**
   - เมื่อสัญญาส่งมอบระยะยาว (`w.commerce.contracts`) มีงวดงานที่เหลือเวลาไม่ถึง 24 ชั่วโมง (`now(w) > previous.deadline - 1440`) แต่ผลิตเสร็จพร้อมส่งไม่ถึง 50% ของจำนวนงวด ฝ่ายขายและผู้บริหารจะเรียก `renegotiateCommercialContract(w, contract.id)` เพื่อเจรจาลดขนาดสัญญาล่วงหน้าและคืนวงเงินค้ำประกันส่วนต่าง (`W.adjustCommercialEscrow`) แทนการปล่อยให้ผิดนัดส่งมอบซ้ำซาก
   - ติดตามอายุสินค้าสำเร็จรูปในคลังผ่าน `w.warehouse.finishedLots[pId]` (`ageDays`) เมื่อมีสินค้าสำเร็จรูปค้างคลัง (`>= 4` ชิ้น หรือค้างนาน `ageDays >= 2` วัน) ฝ่ายขายจะเปิดดีลระบายสต็อก (`warehouseSale`) พร้อมส่วนลดล้างสต็อก `clearanceDiscountPct` (`12%–18%`) เพื่อเปลี่ยนของค้างคลังเป็นกระแสเงินสด

### เสาหลักที่ 2: เปลี่ยนคนแล้วโลกเปลี่ยนไหม (`S.runCounterfactualComparison`)
- เพิ่มฟังก์ชัน `S.runCounterfactualComparison(baseWorld, variantSpec, days)` (`COMPANY_SOURCE/js/sim.js`) ที่โคลนโลกตั้งต้น (`S.clone(baseWorld)`) ด้วย seed เดียวกันทุกประการ แล้วปรับเงื่อนไขเฉพาะจุดในโลกเปรียบเทียบ (`ceoPersonality`, `technicianSubject`, `cashDeltaSatang`, `breakMachineId`) ก่อนรันจำลองไปข้างหน้าเป็นจำนวนวันเท่ากัน
- คืนผลเปรียบเทียบระยะยาว (`base`, `variant`, `diverged`, `summaryTh`) ทั้งเงินสด หนี้สิน ชื่อเสียง จำนวนโครงการวิจัย การซื้อสิทธิถ่ายทอดเทคโนโลยี (`licensesAcquired`) การจ้างซ่อม OEM และมติบอร์ดบริหาร พิสูจน์ว่า CEO สายรอบคอบกับสายกล้าเสี่ยง หรือช่างที่มีความรู้ต่างกัน นำพาบริษัทไปคนละเส้นทางตามสถานการณ์จริง

### เสาหลักที่ 3: ทำให้ผู้เล่นมองเห็นและติดตามผลได้ง่าย (`S.buildObservabilityView`, `w.watchlist`, แท็บ `🔍 ติดตามสด / คอขวด`)
- เพิ่ม `S.buildObservabilityView(w)` ซึ่งคำนวณสถานะแบบอ่านอย่างเดียว (Pure Reader ไม่กระทบ RNG หรือสถานะเกม) ส่งออกใน `API.view(w).observability` ประกอบด้วย:
  - `activeBottlenecks`: รายการคอขวดของบริษัท (`machine_breakdown`, `knowledge_gap`, `material_shortage`, `contract_overload`, `unsold_inventory`, `hr_retention_risk`) ที่ระบุชัดเจนว่า **ติดอะไร (`whatIsStuckTh`)**, **ทำไมถึงติด (`whyStuckTh`)**, และ **NPC กำลังแก้อย่างไร (`howSolvingTh`)**
  - `peopleStatus`: สถานะสดของพนักงานทุกคนว่า **กำลังทำอะไร (`doingTh`)**, **ติดขัดเรื่องใด (`stuckTh`)**, **กำลังแก้อย่างไร (`solvingTh`)**, เป้าหมายชีวิต (`aspiration`) และความทรงจำล่าสุด (`latestMemoryTh`)
  - `causalChains`: เส้นทางสาเหตุ → การตัดสินใจ → ผลลัพธ์ที่เพิ่งเกิดขึ้นในบริษัท
- เพิ่มระบบปักหมุด/ติดดาวถาวร `w.watchlist` (`people`, `events`, `threads`, `bottlenecks`, `notes`) พร้อมคำสั่ง `toggleWatchlist` ที่รองรับการเซฟ/โหลด (`Save.validate`) และเชื่อมกับแท็บใหม่ `🔍 ติดตามสด / คอขวด` (`company_tracker`) ใน `COMPANY_SOURCE/js/debug.js`

### เสาหลักที่ 4: เพิ่มความลึกของชีวิตคนและองค์กร
1. **เป้าหมายชีวิตส่วนตัว (`p.aspiration`) และความทรงจำจากประสบการณ์จริง (`p.memories`, `p.historyLog`, `recordPersonMemory`):**
   - พนักงานทุกคนมีเป้าหมายชีวิตที่คำนวณจากบุคลิกและค่านิยมใน Human Core (`executive_leader`, `independent_founder`, `master_specialist`, `mentor_builder`, `craft_perfectionist`, `financial_security`) พร้อมเปอร์เซ็นต์ความคืบหน้า (`progressPct`) และบันทึกความทรงจำเมื่อเกิดเหตุการณ์สำคัญในชีวิตการทำงาน
2. **ความเชื่อใจ ความขัดแย้งหน้างาน และการโค้ชอย่างสร้างสรรค์ (`w.culture.conflicts`):**
   - เมื่อชิ้นงานไม่ผ่าน QC ใน `finishJob` หรือเมื่อพนักงานอาวุโสพลาดการเลื่อนตำแหน่งใน `evaluatePromotions` ระบบจะคำนวณผลต่อความเชื่อใจ (`p.relationships[otherId].trust`), ความน้อยใจสะสม (`p.career.promotionGrievance`), และบันทึกเหตุการณ์ใน `w.culture.conflicts` ตามระดับความเห็นอกเห็นใจ (`empathy` / `care`) และความเป็นธรรมของผู้ประเมิน
3. **การย้ายสายงานภายใน (`S.evaluateInternalCareerSwitch`), การยื่นข้อเสนอรั้่งตัวก่อนลาออก (`S.evaluateEmployeeRetention`) และการตั้งบริษัท Spin-off ที่มีชีวิตจริง (`S.evaluateEmployeeSpinoff`):**
   - พนักงานที่ฝึกฝนวิชาข้ามสายจนเชี่ยวชาญกว่าสายงานเดิมสามารถขอย้ายแผนกภายใน (`w.culture.roleSwitches`)
   - เมื่อพนักงานเกิดความกังวลถึงขั้น `considerLeaving` ใน `settleDay` ผู้บริหารสามารถยื่นข้อเสนอขึ้นค่าจ้างและโบนัสรั้งตัว (`w.culture.retentionOffers`) เพื่อรักษาคนสำคัญไว้
   - เมื่อพนักงานอาวุโสแยกตัวตั้งบริษัทใหม่ (`evaluateEmployeeSpinoff`) บริษัทใหม่จะถูกลงทะเบียนเข้าสู่ระบบเศรษฐกิจโลกที่มีชีวิตจริงใน `w.externalWorld.living.firms[corpId]` พร้อมทุนตั้งต้น กำลังผลิต และสถานะคู่ค้า (`partner`) หรือคู่แข่ง (`rival`)

---

## 2. ผลการตรวจสอบและทดสอบ (Verification Evidence)

- **`node tools/verify.cjs`:**
  - `PASS permanently locked human core 1.0.0: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`
  - `PASS source syntax and initial catalog/layout/accounting/save schema`
- **`node tools/test.cjs`:**
  - **ผ่านครบ 190 / 190 tests (`fail 0`)** รวมชุดทดสอบใหม่ `COMPANY_SOURCE/test/living-scenarios-human-depth-v280.test.cjs`
- **`node tools/benchmark.cjs`:**
  - 8 NPCs: `0.778 ms/tick` (p95 `2.610 ms`)
  - 30 NPCs: `1.458 ms/tick` (p95 `4.224 ms`)
  - 100 NPCs: `3.384 ms/tick` (p95 `10.161 ms`)
  - 300 NPCs: `0.517 ms/tick` (p95 `0.758 ms`)
  - 500 NPCs: `0.911 ms/tick` (p95 `1.563 ms`)
- **`node tools/build.cjs`:**
  - สร้างไฟล์เล่นเดี่ยว `COMPANY_SOURCE/CompanyFoundation_single.html`, `COMPANY_SOURCE/Company_single.html` และ `Company_single.html` ขนาด `1,760,571` UTF-8 bytes สำเร็จ
