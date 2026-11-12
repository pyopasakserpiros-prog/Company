# เอกสารส่งต่องาน (Handoff) — หลังแพตช์ Company v2.7.0 (`process-driven-realism-overhaul-v270`)

- **รุ่นปัจจุบัน:** `v2.7.0` (`D.VERSION = "2.7.0"`, `D.RELEASE_VERSION = "2.7.0"`, `S.RELEASE_VERSION = "2.7.0"`)
- **ฐานก่อนพัฒนา:** `bbc22e4ce61c002b49c2346841af3c4f3e9d0919` (`v2.6.0`)
- **ผู้ดำเนินการแพตช์ v2.7.0:** Gemini (ดำเนินการครบทั้ง 8 Workstreams ตาม `ACTIVE_PROMPT.md`)
- **หลักฐานการตรวจรับ:** `node tools/verify.cjs` ผ่าน, `node tools/test.cjs` ผ่าน **186/186**, `node tools/build.cjs` สร้างไฟล์เดี่ยว `1,695,923` bytes, `node tools/benchmark.cjs` เฉลี่ย `1.056 ms/tick` ที่ 500 NPCs

## 1. สิ่งที่พัฒนาเสร็จแล้วใน v2.7.0 (ห้ามทำซ้ำหรือย้อนกลับเป็นแบบเสกทันที)

1. **คิวแปรรูปวัตถุดิบตามเวลาจริง (`w.plant.refineryBatches`):**
   - `craftMaterialRecipe` และ `runMidstreamRefining` ส่งเข้าคิว `P.enqueueRefineryBatch` เสมอ (สถานะ `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released/rework/scrapped/cancelled`)
   - ห้ามเปลี่ยนกลับไปบวกวัตถุดิบผลลัพธ์ทันทีใน tick +0
2. **การขนส่งกองรถและบริการ B2B 10 ประเภทตามเวลาจริง:**
   - ลูปอัตโนมัติของ NPC ใช้ `completeAllSteps: false` ทั้งหมด ต้องรอเวลาเดินทางจริง เวลาทำงานของผู้เชี่ยวชาญ และการวัดผล (`testMeasurements`, `storageHoursOccupied`)
3. **วิศวกรรมซอฟต์แวร์และการประเมินขอบเขตงาน:**
   - `advanceSoftwareProject` ต้องมีนักพัฒนาที่รู้ `programming >= 40` และ `software >= 40` ความเร็วและบั๊กผูกกับโปรไฟล์ Human Core จริง รองรับ `discoverScopeChange` และ `deployWithKnownDefects`
4. **วิศวกรรมการผลิต 42 สินค้า & เครื่องจักร 20 ชนิด:**
   - `P.route(product)` มี metadata รายขั้นครบ (`opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint`, `intermediateOut`)
   - เครื่องจักรมี `subsystems` 5 ด้าน, `faultModes`, โหมดจัดหา `purchased_new`/`used_refurbished`/`leased`, และตัวกันคูณค่าไฟ/ความร้อนซ้ำเมื่อหลายงานแชร์เครื่องเดียวกันใน tick เดียว
5. **คลังสินค้าล็อต (`w.warehouse`), การประมูลภาครัฐแข่งขัน (`w.commerce.tenders`), และวงจรชีวภาพ 180 นาที:**
   - `S.reconcileWarehouseLots` และ `S.warehouseAudit` ดูแลล็อต FIFO/FEFO และโซ่ความเย็น
   - `W.evaluateCompetitiveTender`, `S.renegotiateCommercialContract`, `S.terminateCommercialContract` และ `W.payFromCounterparty` เชื่อมสัญญากับงบคู่ค้าโลกจริง
   - `feedLivestockHerd` แยกจาก `milkLivestockHerd` (รอบย่อยและผลิตน้ำนม 180 นาที) และกิจการภายนอกแยก `cogsSatang`, `operatingExpenseSatang`, `accrualProfitSatang`, `cashFlowSurplusSatang`

## 2. สิ่งที่ต้องทำเมื่อรวมเข้า `main` บนเครื่องที่มี Playwright

- รัน `npm run test:browser` (`node test/campus-browser.cjs`) บนเครื่องที่มีแพ็กเกจ `playwright` เพื่อยืนยันการเรนเดอร์ผ่านเบราว์เซอร์จริงควบคู่กับผล `186/186` Node tests

## 3. แนวทางต่อยอดในอนาคต (รอคำสั่งอนุมัติจากผู้ใช้ก่อนเริ่ม)

- การแสดงผลแอนิเมชันเฉพาะของแต่ละเครื่องจักรบนแผนที่ 2D Canvas (เช่น สถานะความร้อนเตาถลุง/เตาอบ หรือรถโฟร์กลิฟต์ย้ายพาเลทในคลัง)
- สัญญาจ้างเหมาซ่อมบำรุงภายนอก (External Maintenance Contractor) เมื่อบริษัทไม่มีวิศวกรประจำการ
- ระบบภาษีเงินได้นิติบุคคลและงบดุล/งบกำไรขาดทุนเต็มรูปแบบรายไตรมาสของบริษัทผู้เล่น
