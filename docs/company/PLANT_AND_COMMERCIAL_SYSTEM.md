# Company v2.7.0 — โรงงาน คิวแปรรูปวัตถุดิบ เครื่องจักร คลังสินค้าล็อต และสัญญาขาย

ฐาน `bbc22e4ce61c002b49c2346841af3c4f3e9d0919` (v2.6.0) · อัปเดต 12 พฤศจิกายน 2026 (v2.7.0 โดย Gemini)

## 1. กระบวนการผลิตสินค้า 42 รายการ และการใช้เครื่องจักรร่วมกัน

`COMPANY_SOURCE/js/plant.js` โหลดหลัง `world.js` และก่อน `sim.js` เก็บ `w.plant` เครื่องมือ 20 แบบ และ route สินค้าครบ 42 รายการ แยกจาก Human Core

- `P.route(product)` คืนรายการขั้นตอน 3–4 ขั้น โดยแต่ละขั้นประกอบด้วย `nameTh`, `equipment`, `share`, `holdMinutes`, `temperatureC`, `opCode`, `subject`, `minSubjectLevel`, `safetyCritical`, `batchShared`, `qualityCheckpoint` และ `intermediateOut`
- `P.workerQualifiedForStep(w, person, step)` บังคับว่าขั้นตอนที่มี `safetyCritical: true` ต้องดำเนินการโดยพนักงานที่มีระดับวิชาถึง `minSubjectLevel` (หรือมีผู้เชี่ยวชาญที่มีคุณวุฒิทำงานกำกับอยู่ในกะเดียวกัน)
- แต่ละชิ้นมี `unit.process { version, index, labor, phase, history, lastIntermediate }` บันทึกประวัติผู้ทำ เครื่องจักร อุณหภูมิ เวลารอ และผลผลิตขั้นกลางจริง
- **ตัวกันคูณพลังงานและความร้อนซ้ำ (`m.lastPowerAt` / `m.lastThermalAt`):** เมื่อหลายชิ้นงานหรือหลายล็อตแปรรูปอ้างอิงเครื่องจักรเดียวกันใน tick เดียวกัน เครื่องจะคิดค่าไฟ การสึกหรอ และการเร่งอุณหภูมิเพียงครั้งเดียวต่อ tick ตามโหลดจริง ไม่คูณซ้ำตามจำนวนชิ้นงาน

## 2. คิวแปรรูปวัตถุดิบและสินค้าขั้นกลางตามเวลาจริง (`w.plant.refineryBatches`)

สูตรวัตถุดิบทั้ง 40 สูตร (`D.MATERIAL_RECIPES`) เดินผ่านคิวล็อตแปรรูปตามเวลาจริงใน `w.plant.refineryBatches` (`P.recipeSpec`, `P.enqueueRefineryBatch`, `P.cancelRefineryBatch`, `P.tickRefinery`):

- สถานะของแต่ละล็อต: `inputs_reserved -> staged -> loading_setup -> running -> unloading -> inspection -> released / rework / scrapped / cancelled`
- เมื่อเปิดล็อต (`craftMaterialRecipe` หรือ `runMidstreamRefining`) ระบบจะจองวัตถุดิบใน `w.inventory.reserved` ยังไม่เสกผลลัพธ์ใน tick +0
- เมื่อจบขั้นตั้งเครื่อง (`loading_setup`) จึงตัดวัตถุดิบเข้างานระหว่างทำ (`safeDeductMaterial`, `inputsConsumed = true`)
- หากยกเลิกก่อนตัดวัตถุดิบ (`cancelRefineryBatch`) จะคืนสถานะจองเข้าคลังปกติ (`status: "cancelled", refundedInputs: true`) แต่หากยกเลิกหลังตัดวัตถุดิบเข้าเครื่องแล้วจะกลายเป็นของเสีย (`status: "scrapped", refundedInputs: false`) โดยไม่เสกวัตถุดิบดิบคืนฟรี
- เมื่อถึงขั้น `inspection` ระบบจะตรวจพื้นที่ว่างในคลัง (`hooks.warehouseAvailable`) หากคลังเต็มจะรอจนกว่าจะมีพื้นที่ว่างก่อนปล่อยผลผลิตและผลพลอยได้ (`byproducts`) เข้าคลัง

## 3. วิศวกรรมเครื่องจักร ระบบย่อย อาการเสีย และรูปแบบการจัดหา

เครื่องจักรทุกตัวใน `w.plant.machines` มี:
- **ระบบย่อย 5 ด้าน (`subsystems`):** `mechanical`, `electrical`, `thermal`, `calibration`, `cleanliness` ซึ่งสึกหรอตามลักษณะงานและอุณหภูมิ
- **อาการเสียจำเพาะ (`SPECS[k].faultModes` & `m.faultMode`):** เมื่อสภาพเครื่องลดลงหรือเข้าคิวซ่อม ช่างจะวินิจฉัยอาการเสียจริงพร้อมบันทึกความแม่นยำวินิจฉัย (`diagnosticAccuracy`)
- **ความสามารถช่าง (`P.technicianCapability(person, machineId, hasDiagKit)`):** คำนวณ `speed`, `diagnosticAccuracy` และ `postCondition` จากวิชาซ่อมบำรุง/วิชาเฉพาะเครื่อง ความถนัด (`analytical`, `dexterity`, `problemSensitivity`, `attention`) ความล้า และการใช้ `diagnostic_kit`
- **รูปแบบการจัดหา 3 โหมด (`acquisitionMode` ใน `P.request`):**
  1. `purchased_new`: ซื้อเครื่องใหม่ (ราคาเต็ม 100%, สภาพเริ่มต้น 100%)
  2. `used_refurbished`: ซื้อเครื่องมือสองปรับสภาพ (ราคา 65%, สภาพเริ่มต้น 82%, เวลารอส่งสั้นลง 40%)
  3. `leased`: เช่าดำเนินงาน (จ่ายเงินก้อนแรก 25%)
- เมื่อติดตั้งหรือซ่อมเสร็จ ต้องผ่านการทดสอบเดินเครื่องก่อนกลับเข้าประจำการ (`returnToServiceTest: "passed"` ใน `w.plant.serviceRecords`)

## 4. คลังสินค้ากายภาพ ล็อต FIFO/FEFO และโซ่ความเย็น (`w.warehouse`)

`S.ensureWarehouse`, `S.reconcileWarehouseLots` และ `S.warehouseAudit` ติดตามสถานะคลังสินค้ากายภาพ:
- `materialLots` และ `finishedLots` บันทึกล็อตวัตถุดิบและสินค้าสำเร็จรูปพร้อม `lotId`, `qty`, `provenance`, `createdDay`, `expiresDay`, `coldChainRequired`, `coldChainProtected`
- ตัดจ่ายวัตถุดิบเน่าเสียง่ายตามวันหมดอายุก่อน (FEFO) และวัตถุดิบทั่วไปตามลำดับเข้าก่อน (FIFO)
- เมื่อห้องเย็น (`cold_room`) พร้อมใช้งานและไม่มีไฟตก (`!w.utilities.brownoutActive`) ล็อตวัตถุดิบควบคุมอุณหภูมิจะมีอายุเก็บรักษา 10 วัน (`coldChainProtected: true`) แต่หากไฟตกหรือไม่มีห้องเย็น อายุเก็บรักษาจะลดลงเหลือ 4 วัน (`coldChainProtected: false`)

## 5. การประมูลภาครัฐแข่งขัน การปรับโครงสร้างสัญญา และการยุติสัญญา (`w.commerce`)

- **ประมูลภาครัฐแข่งขัน (`W.evaluateCompetitiveTender` & `w.commerce.tenders`):** การจัดซื้อภาครัฐทุก 14 วันนำคะแนนของบริษัทผู้เล่น (ราคา คุณภาพ ชื่อเสียง และระดับวิชา `quality_documentation`) ไปเทียบแข่งขันกับบริษัทภายนอกในสาขาเดียวกัน หากชนะจึงได้รับสัญญาและกันงบจากคลังรัฐบาล (`TH`)
- **เจรจาปรับลดสัญญา (`S.renegotiateCommercialContract` & `W.adjustCommercialEscrow`):** ลดจำนวนส่งมอบคงเหลือเมื่อกำลังผลิตตึงตัว และคืนเงินกันส่วนต่างจาก `commercialEscrows` กลับเข้าบัญชีผู้ซื้ออย่างถูกต้อง
- **ยุติสัญญาอย่างเป็นทางการ (`S.terminateCommercialContract`):** ยกเลิกออเดอร์งวดปัจจุบันที่ยังไม่ตัดวัตถุดิบ ปิดสถานะสัญญาเป็น `terminated` และคืนเงินกันคงเหลือทั้งหมดให้ผู้ซื้อโดยไม่ทิ้งภาระค้าง
- **ผูกงบคู่ค้าโลก (`W.payFromCounterparty`):** รายรับจากสัญญาขนส่ง บริการ B2B และซอฟต์แวร์หักจากเงินสดจริงของบริษัทคู่ค้าภายนอกและปรับ `m.playerNetSatang` ให้สมการเงินโลกสมดุล 100%

## 6. การตรวจสอบและขอบเขตการออกแบบ

- รัน `npm test` (`186/186`), `npm run check`, `npm run build` จาก `COMPANY_SOURCE/`; ชุดทดสอบใหม่คือ `test/process-realism-v270.test.cjs` ควบคู่กับ `test/plant-and-commercial.test.cjs`
- โมเดลเป็นระดับกลุ่มกระบวนการอุตสาหกรรมของเกม ตัวเลขอุณหภูมิ เวลา และคะแนนประมูลเป็นค่าการออกแบบเกม ไม่ใช่สูตรผลิตอาหาร/ยาตามกฎหมายหรือมาตรฐานวิศวกรรมโรงงานจริง
