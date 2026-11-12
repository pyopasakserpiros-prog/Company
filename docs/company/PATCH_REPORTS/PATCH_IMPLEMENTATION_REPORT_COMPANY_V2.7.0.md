# รายงานผลการพัฒนาแพตช์ Company Simulation — รุ่น v2.7.0 (`process-driven-realism-overhaul-v270`)

- **วันที่ดำเนินการ:** 12 พฤศจิกายน 2026
- **ผู้รับผิดชอบ:** Gemini (ผ่านแอปแชต ต่อยอดจากฐาน commit `bbc22e4ce61c002b49c2346841af3c4f3e9d0919` / รุ่น v2.6.0)
- **รุ่นเกม (`D.VERSION` / `D.RELEASE_VERSION` / `S.RELEASE_VERSION`):** `2.7.0` (คงค่า `S.VERSION = "0.1.0"`, `S.SCHEMA = "company-foundation-1"` และ `package.json = "0.1.0"`)
- **สถานะ Human Core 1.0.0 (`COMPANY_SOURCE/js/human-core.js`):** ไม่แก้ไข (`SHA-256: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32` ตรงตาม `CORE_LOCK.json` 100%)
- **สถานะ `AGENTS.md`:** ไม่แก้ไข

## 1. สรุปภาพรวมการยกระดับ 8 Workstreams (Process-Driven Realism Overhaul)

แพตช์ **v2.7.0** เปลี่ยนผ่านระบบการแปรรูปวัตถุดิบ ขนส่ง บริการ B2B ซอฟต์แวร์ วิศวกรรมเครื่องจักร คลังสินค้าล็อต/โซ่ความเย็น การประมูลภาครัฐแข่งขัน และวงจรชีวภาพ/บัญชีโลกภายนอก ให้ทำงานตามเวลาจำลองที่ผ่านไปจริง (Timed Multi-Stage Processes) แรงงานที่มีคุณวุฒิ อุปกรณ์ที่พร้อมใช้งาน และงบประมาณคู่ค้าที่ตรวจสอบย้อนกลับได้

### Workstream 1: การแปรรูปวัตถุดิบและสินค้าขั้นกลางตามเวลาจริง (`w.plant.refineryBatches`)
- ยกเลิกการเสกผลลัพธ์ทันทีใน tick เดียวของ `craftMaterialRecipe` สำหรับสูตรวัตถุดิบทั้ง 40 สูตร (`D.MATERIAL_RECIPES`)
- เพิ่มสเปกกระบวนการ `P.recipeSpec(materialId)` และคิวล็อตแปรรูป `w.plant.refineryBatches` ใน `COMPANY_SOURCE/js/plant.js` (`P.enqueueRefineryBatch`, `P.cancelRefineryBatch`, `P.tickRefinery`)
- แต่ละล็อตเดินผ่านสถานะ `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released / rework / scrapped / cancelled`
- จองวัตถุดิบ (`w.inventory.reserved`) ตั้งแต่เปิดล็อต และตัดวัตถุดิบเข้า WIP (`safeDeductMaterial`, `inputsConsumed = true`) เมื่อจบขั้นตั้งเครื่อง (`loading_setup`)
- หากยกเลิกก่อนตัดวัตถุดิบ (`status: "cancelled"`) จะคืนสถานะจองเข้าคลังปกติ หากยกเลิกหลังตัดวัตถุดิบเข้าเครื่องแล้ว (`status: "scrapped"`) จะไม่เสกวัตถุดิบดิบคืนฟรี
- หากคลังสินค้าเต็มเมื่อถึงขั้น `inspection` ล็อตจะรอพื้นที่ว่าง (`รอพื้นที่ว่างในคลังสินค้าก่อนตรวจปล่อยล็อตแปรรูป`) ก่อนปล่อยผลผลิตและผลพลอยได้ (`byproducts`) เข้าคลัง

### Workstream 2: การขนส่งกองรถ (Fleet Freight) และบริการอุตสาหกรรม B2B ทั้ง 10 ประเภทตามเวลาและทรัพยากรจริง
- ยกเลิกทางลัด `completeAllSteps: true` ในลูปอัตโนมัติของ NPC ทั้งระบบขนส่งและบริการอุตสาหกรรม
- บังคับเวลาเดินทางจริงระหว่าง `outbound -> delivered` (`elapsedTimeRequired`) และขากลับ `delivered -> returning -> idle` (`elapsedReturnTimeRequired`) พร้อมระบบพักคนขับตามความล้า (`driverRestRequired`) การจับคู่เที่ยวขากลับ (`matchBackhaulCargo`) และการซ่อมรถเสียกลางทาง
- บริการ B2B ทั้ง 10 ประเภท (`D.INDUSTRIAL_SERVICES`) เดินตามเวลาทำงานจริง (`workMinutesDone / requiredWorkMinutes`), หักวัสดุสิ้นเปลืองและอะไหล่จริง, บันทึกผลการวัดทางเทคนิค (`order.testMeasurements`), แยกทรัพย์สินของลูกค้าใน `w.serviceBusiness.instrumentCustody` และคิดชั่วโมงห้องเย็น (`storageHoursOccupied`) สำหรับ `cold_storage_3pl`

### Workstream 3: วิศวกรรมซอฟต์แวร์ การทดสอบ QA การปรับขอบเขตงาน และภาระ SLA หลังส่งมอบ
- ยกเลิกการข้ามชั่วโมงพัฒนาด้วย `options.minutes || proj.requiredDevMinutes` ใน `advanceSoftwareProject`
- ต้องมีนักพัฒนาที่มีความรู้ `programming >= 40` และ `software >= 40` จึงจะเดินความคืบหน้าได้ (หากไม่มีนักพัฒนาที่มีคุณวุฒิ จะคืน `code: "noQualifiedDeveloper"` และความคืบหน้าเป็น 0)
- ความเร็วพัฒนา (`productivity`) และอัตราการเกิดบั๊ก (`defectsFound`) คำนวณจากทักษะ `programming`/`software`, ความถนัด `analytical`, ความรับผิดชอบ `conscientiousness` และความล้า `fatigue` จาก Human Core โดยตรง
- รองรับการค้นพบและประเมินการขยายขอบเขตงาน (`discoverScopeChange` -> `scopeChangeEvaluated`, `scopeChangeResolution`) และการส่งมอบพร้อมบั๊กค้าง (`deployWithKnownDefects`) ซึ่งก่อให้เกิดค่าปรับ SLA/rework (`reworkCostSatang`), ตั๋วซัพพอร์ตค้าง และผลกระทบต่อชื่อเสียงบริษัท

### Workstream 4: วิศวกรรมการผลิตเฉพาะตัวสินค้าทั้ง 42 รายการ และการใช้พลังงาน/ความร้อนเครื่องจักรร่วมกัน
- ขยาย `P.route(product)` สำหรับสินค้าทั้ง 42 รายการให้มี metadata รายขั้นตอนครบถ้วน: `opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint`, `intermediateOut`
- เพิ่ม `P.workerQualifiedForStep(w, person, step)` เพื่อตรวจเกณฑ์ความรู้ขั้นต่ำในขั้นตอน `safetyCritical` (เช่น งานปลอดเชื้อ อุปกรณ์การแพทย์ และระบบไฟฟ้าแรงดันสูง) หรือต้องมีผู้เชี่ยวชาญในกะคอยกำกับดูแล
- ป้องกันการคูณค่าไฟและการสึกหรอซ้ำซ้อนเมื่อหลายชิ้นงานหรือล็อตแปรรูปใช้เครื่องจักรเดียวกันใน tick เดียวกัน (`m.lastPowerAt === w.clock.absoluteMinute` และ `m.lastThermalAt === w.clock.absoluteMinute`)

### Workstream 5: วิศวกรรมเครื่องจักร ระบบย่อย 5 ด้าน การวินิจฉัยอาการเสีย และรูปแบบการจัดหาเครื่องจักร
- เครื่องจักรทุกเครื่องใน `w.plant.machines` มีสุขภาพระบบย่อย 5 ด้าน (`subsystems: { mechanical, electrical, thermal, calibration, cleanliness }`) และโหมดอาการเสียจำเพาะ (`SPECS[k].faultModes`, `m.faultMode`)
- เพิ่ม `P.technicianCapability(person, machineId, hasDiagKit)` คำนวณความเร็วซ่อม (`speed`), ความแม่นยำวินิจฉัย (`diagnosticAccuracy`) และสภาพหลังซ่อม (`postCondition`) จากวิชา ความถนัด ความล้า และชุดเครื่องมือวินิจฉัย
- รองรับการจัดหาเครื่องจักร 3 รูปแบบผ่าน `P.request(w, k, hooks, { acquisitionMode })`: `purchased_new` (เครื่องใหม่), `used_refurbished` (เครื่องมือสองปรับสภาพ ราคา 65% สภาพเริ่มต้น 82% เวลารอส่งสั้นลง) และ `leased` (เช่าดำเนินงาน จ่ายเงินก้อนแรก 25%) พร้อมบันทึกประวัติการซ่อมและตรวจรับ (`w.plant.serviceRecords`, `returnToServiceTest: "passed"`)

### Workstream 6: คลังสินค้ากายภาพ ล็อตวัตถุดิบ/สินค้า การตัดจ่าย FIFO/FEFO และโซ่ความเย็น (`w.warehouse`)
- เพิ่มสถานะคลังสินค้า `w.warehouse` (`ensureWarehouse`, `reconcileWarehouseLots`, `warehouseAudit`) ติดตาม `materialLots`, `finishedLots`, `transferMoves` และสรุปสถานะคลัง (`rawAvailable`, `reserved`, `staged`, `wipUnits`, `quarantineUnits`, `rejectedUnits`, `releasedFinished`, `customerCustody`, `inTransitInbound`, `inTransitOutbound`)
- ตัดจ่ายวัตถุดิบเน่าเสียง่ายตามวันหมดอายุก่อน (FEFO) และวัตถุดิบทั่วไปตามลำดับเข้าก่อน (FIFO)
- เชื่อมสถานะห้องเย็น (`cold_room`) และไฟตก (`utilities.brownoutActive`) เข้ากับอายุเก็บรักษาล็อตวัตถุดิบควบคุมอุณหภูมิ (`coldChainProtected`, `expiresDay`)

### Workstream 7: การประมูลภาครัฐแข่งขัน การปรับโครงสร้างสัญญา และการยุติสัญญาอย่างเป็นทางการ
- เพิ่ม `W.evaluateCompetitiveTender(w, productId, quantity, unitPrice, playerRep, playerDocLevel)` ใน `COMPANY_SOURCE/js/world.js` ให้การประมูลจัดซื้อภาครัฐแข่งขันด้านราคา คุณภาพ ชื่อเสียง และความพร้อมส่งมอบกับบริษัทภายนอก พร้อมบันทึกผลใน `w.commerce.tenders`
- เพิ่ม `S.renegotiateCommercialContract` และ `W.adjustCommercialEscrow` สำหรับเจรจาลดจำนวนส่งมอบและคืนเงินกันส่วนต่างให้ผู้ซื้อโดยสมดุลบัญชีโลก 100%
- เพิ่ม `S.terminateCommercialContract` เพื่อยุติสัญญาที่ส่งมอบไม่ไหว คืนเงินกันคงเหลือใน `commercialEscrows` ให้ผู้ซื้อ และป้องกันออเดอร์ค้างตายตัว
- เพิ่ม `W.payFromCounterparty` เพื่อผูกการรับเงินจากงานขนส่ง บริการ B2B และซอฟต์แวร์เข้ากับเงินสดจริงของบริษัทคู่ค้าภายนอกและสมการเงินโลก (`m.playerNetSatang`)

### Workstream 8: วงจรชีวภาพการย่อยและให้นมปศุสัตว์ (180 นาที) และบัญชีต้นทุนขาย/กำไรเกณฑ์คงค้างของโลกภายนอก
- แยกคำสั่งให้อาหารสัตว์ (`feedLivestockHerd`) ออกจากคำสั่งรีดนม (`milkLivestockHerd`) โดยการให้อาหารจะเริ่มวงจรย่อยและผลิตน้ำนมตามเวลาชีวภาพ 180 นาที (`milkingStage: "digesting" -> "ready_to_milk"`) ห้ามเสกน้ำนมทันทีใน tick +0
- เพิ่มวงจรผลิตชีวภาพใน `COMPANY_SOURCE/js/world.js` สำหรับกิจการภายนอกที่ผลิต `fresh_milk_soy`, `natural_latex` และ `timber_bamboo_log`
- แยกตัวเลขต้นทุนขาย (`cogsSatang`), ค่าใช้จ่ายดำเนินงาน (`operatingExpenseSatang`), รายจ่ายลงทุน (`capexSatang`), กำไรตามเกณฑ์คงค้าง (`accrualProfitSatang`) และกระแสเงินสดสุทธิหลังภาษี (`cashFlowSurplusSatang`) ของบริษัทภายนอกทุกแห่ง

## 2. รายการไฟล์ที่แก้ไขและสร้างใหม่

- **ซอร์สโค้ดหลัก (`COMPANY_SOURCE/js/`):**
  - `COMPANY_SOURCE/js/data.js`: อัปเดต `VERSION` และ `RELEASE_VERSION` เป็น `"2.7.0"`
  - `COMPANY_SOURCE/js/plant.js`: เพิ่ม `recipeSpec`, `enqueueRefineryBatch`, `cancelRefineryBatch`, `tickRefinery`, `workerQualifiedForStep`, `technicianCapability`, ระบบย่อยเครื่องจักร 5 ด้าน, `faultModes`, โหมดจัดหาเครื่องจักร 3 แบบ และตัวกันคูณพลังงาน/ความร้อนซ้ำใน tick เดียว
  - `COMPANY_SOURCE/js/world.js`: เพิ่ม `adjustCommercialEscrow`, `payFromCounterparty`, `evaluateCompetitiveTender`, วงจรชีวภาพของกิจการภายนอก และแยก `cogsSatang` / `operatingExpenseSatang` / `accrualProfitSatang` / `cashFlowSurplusSatang`
  - `COMPANY_SOURCE/js/sim.js`: เชื่อมทั้ง 8 Workstreams เข้ากับลูปจำลองราย tick/รายวัน, เพิ่ม `ensureWarehouse`, `reconcileWarehouseLots`, `warehouseAudit`, `renegotiateCommercialContract`, `terminateCommercialContract`, `milkLivestockHerd`, `cancelRefineryBatch` และอัปเดต `S.audit(w)`
  - `COMPANY_SOURCE/js/save.js`: ขยายการตรวจความถูกต้องของ `refineryBatches`, `warehouse`, `commerce.tenders` และรองรับการโหลดเซฟอย่างปลอดภัย
  - `COMPANY_SOURCE/js/api.js`: ส่งออก `warehouse`, `plant.refineryBatches`, `plant.recipeSpecs`, `plant.serviceRecords` และ `commerce.tenders` ใน frozen snapshot โดยไม่แก้ไขสถานะเกม
  - `COMPANY_SOURCE/js/debug.js`: แสดงผลคิวแปรรูปวัตถุดิบ (`refineryBatches`), สถานะล็อตคลังสินค้า (`warehouse`), ระบบย่อยและอาการเสียเครื่องจักร และการประมูลภาครัฐ (`tenders`) เป็นภาษาไทยทั้งหมด
- **ชุดทดสอบ (`COMPANY_SOURCE/test/`):**
  - สร้างใหม่ `COMPANY_SOURCE/test/process-realism-v270.test.cjs` (ครอบคลุมเกณฑ์ตรวจรับทั้ง 12 ข้อใน `ACTIVE_PROMPT.md`)
  - ปรับการทดสอบเดิมที่ใช้สมมติฐานการเสกผลลัพธ์ทันทีให้เดินเวลาจำลองตามสัญญาใหม่ (`ecosystem-multitier-dag-v100.test.cjs`, `expert-audit-codezero-v100.test.cjs`, `geopolitics-living-world-v200.test.cjs`, `product-depth-npc-board-v130.test.cjs`, `business-depth-world-corridors-v210.test.cjs`, `sme-growth-utilities-culture-v220.test.cjs`, `true-upstream-agri-fleet-software-v110.test.cjs`)
- **ไฟล์สร้างเดี่ยว (Standalone Build):**
  - `COMPANY_SOURCE/CompanyFoundation_single.html`, `COMPANY_SOURCE/Company_single.html` และ `Company_single.html` (`1,695,923` UTF-8 bytes)

## 3. ผลการทดสอบและตรวจสอบคุณภาพ (Verification & Benchmark Evidence)

1. **`node tools/verify.cjs` (`npm run check`):**
   - `PASS permanently locked human core 1.0.0: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`
   - `PASS source syntax and initial catalog/layout/accounting/save schema`
2. **`node tools/test.cjs` (`npm test`):**
   - ผ่านครบ **186/186** การทดสอบ (`fail 0`), รวมถึงชุดทดสอบใหม่ `test/process-realism-v270.test.cjs` ทั้ง 9 กลุ่มย่อยที่ตรวจเกณฑ์ AC1–AC12
3. **`node tools/build.cjs` (`npm run build`):**
   - สร้าง `CompanyFoundation_single.html` และสำเนา `Company_single.html` สำเร็จ (`1,695,923` UTF-8 bytes)
4. **`node tools/benchmark.cjs`:**
   - 8 NPCs: `0.919 ms/tick` (p95 `3.746 ms`)
   - 30 NPCs: `0.808 ms/tick` (p95 `3.027 ms`)
   - 100 NPCs: `1.518 ms/tick` (p95 `4.610 ms`)
   - 300 NPCs: `0.586 ms/tick` (p95 `1.014 ms`)
   - 500 NPCs: `1.056 ms/tick` (p95 `1.510 ms`)
5. **การทดสอบผ่านเบราว์เซอร์ (`npm run test:browser`):**
   - ในคอนเทนเนอร์ออฟไลน์ของสภาพแวดล้อมนี้ไม่มีแพ็กเกจ npm `playwright` ติดตั้งไว้ล่วงหน้า และ Chromium ในคอนเทนเนอร์มีนโยบายองค์กรบล็อกการเปิด URL `file://` และ `http://127.0.0.1` จึงตรวจสอบความบริสุทธิ์ของ `API.snapshot()`, ความถูกต้องของไวยากรณ์ JS ทุกไฟล์ และความสมบูรณ์ของไฟล์ build ผ่าน Node verification & test suite (`186/186`) และให้รัน `npm run test:browser` ซ้ำบนเครื่องที่มี Playwright เมื่อรวมเข้า `main`

## 4. ขอบเขตและข้อจำกัดปัจจุบันที่ส่งต่ออย่างตรงไปตรงมา

- เครื่องจักรและการแปรรูปวัตถุดิบจำลองเวลา แรงงาน ความร้อน พลังงาน อะไหล่ และพื้นที่คลังในระดับกลุ่มกระบวนการของเกม ยังไม่ใช่การจำลองพลศาสตร์ของไหล/เคมีระดับโมเลกุลหรือผังห้องเครื่องแยกทุกชิ้นในมุมมอง 2D
- คลังสินค้าล็อต (`w.warehouse`) ซิงก์และตรวจกระทบยอด (`warehouseAudit`) กับ `w.inventory` อัตโนมัติทุก tick เพื่อรักษาความเข้ากันได้กับสมการอนุรักษ์วัตถุดิบและสินค้าทั้งหมด
- การซิงก์สกิลในแอป Gemini (`company-evolution-dev` และ `company-for-every-patch`) ดำเนินการผ่านเครื่องมือ `skills:update_skill` ในรอบนี้แล้ว พร้อมอัปเดตไฟล์สกิลใน `.agents/skills/` และสำเนาระดับ root ครบถ้วน
