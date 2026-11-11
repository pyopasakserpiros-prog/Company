# รายงานการพัฒนาแพตช์ Siam Enterprise / Company Simulation — รุ่น v1.3.0
**หัวข้อแพตช์:** ความลึกของตระกูลผลิตภัณฑ์ ต้นทางทรัพยากรตามหลักเคมี/กายภาพ และระบบคณะกรรมการบริหาร NPC อัตโนมัติ (Product Families, True Elemental Material Origins & Autonomous NPC Executive Board — Chapters 28–32)

## 1. สรุปภาพรวมการอัปเกรด (Executive Summary)
แพตช์ **v1.3.0** พัฒนาต่อยอดจากฐาน v1.2.0 โดยแก้ไขจุดเชื่อมเชิงตรรกะทั้งหมดที่ระบุใน **บทที่ 31 (`31_audit_evidence_and_acceptance_scenarios.md`)** และขยายความลึกของตัวสินค้า วัตถุดิบ และกระบวนการตัดสินใจของ NPC ตาม **บทที่ 28–32**:
1. **แก้ไขจุดตรวจจากบทที่ 31 ครบทุกข้อ (100% Verified Fixes):**
   - **`craftMaterialRecipe` Working-Capital Gate:** บังคับตรวจเงินทุนหมุนเวียนขั้นต่ำ (`capitalRequirement`) ก่อนเดินเครื่องแปรรูปวัตถุดิบ โดยไม่หักค่าธรรมเนียมซ้ำซ้อนกับต้นทุนวัตถุดิบ
   - **`acquireExternalAsset` แยกความสามารถโดเมนออกจากแต้มวิจัยรวม:** การซื้อไร่ข้าวหรือเหมืองแร่ปลดล็อกเฉพาะห่วงโซ่และผลิตภัณฑ์ปลายทางที่ผูกกันผ่าน `w.capabilities.unlockedProducts` และ `w.capabilities.unlockedChains` โดย **ไม่เพิ่ม `w.research.points` รวม** จนเผลอปลดล็อกชิปเซมิคอนดักเตอร์หรือเครื่องมือแพทย์ฟรี
   - **`evaluateExternalAssetsDaily` แยกสินทรัพย์ปฏิบัติการออกจากปันผลเครือข่าย:** สินทรัพย์ต้นน้ำที่ผลิตวัตถุดิบจริง (ไร่นา เหมือง ป่าปลูก ฟาร์มโคนม) จะให้ผลผลิตเข้าคลังตามวงจรการเติบโต/การขุดเท่านั้น ไม่เสกเงินปันผลรายวัน (`sales`) ซ้อนทับอีก ส่วนสินทรัพย์เครือข่ายเชิงพาณิชย์ (ท่าเรือน้ำลึก โชว์รูมค้าปลีก ห้องเย็น 3PL โซลาร์ฟาร์ม) จึงจะรับรู้รายได้ค่าบริการเครือข่าย
   - **ยกเลิกการเลือก `unowned[0]` และ `plots[0]` แบบเรียงลำดับอาร์เรย์:** เปลี่ยนเป็นการให้คะแนนตามคอขวดวัตถุดิบจริง (`w.inventory.consumed`, `w.inventory.purchased`) และความแออัดของคิวงานในแต่ละสถานี (`assembly`, `qa`, `shipping`, `machineCondition`)
   - **บังคับตรวจคุณสมบัติวิศวกรและอะไหล่งานบริการจริง:** `startSoftwareProject` บังคับใช้วิศวกร (`engineer` หรือผู้มีทักษะวิจัย `>= 28`) ห้ามดึงพนักงานทั่วไปที่ไม่มีทักษะเขียนโค้ดมาทำแทน และ `advanceServiceOrder` บังคับตรวจอะไหล่ (`metal_sheet`, `wire_harness`, `raw_water_m3`, `pack_carton`) และเงินสดค่าสารมาตรฐานก่อนทำงาน หากอะไหล่ขาดจะเข้าสถานะ `waiting_parts` ทันที ไม่ส่งงานสำเร็จฟรี
2. **ความลึกของทรัพยากรและสมดุลธาตุอาหาร N-P-K ตามหลักเคมีจริง (บทที่ 30 — 58 วัตถุดิบ & 35 สูตรแปรรูป):**
   - เพิ่มวัตถุดิบต้นทางและตัวกลางใหม่ 7 ชนิด (`ambient_air_gas`, `iron_ore`, `wheat_seed`, `wheat_grain`, `nitrogen_ammonia`, `wheat_flour`, `pharma_saline_water`)
   - แก้สูตร `npk_fertilizer` ให้ใช้แม่ปุ๋ยไนโตรเจนจากแอมโมเนียสังเคราะห์ (`nitrogen_ammonia` ซึ่งแยก N2 จากอากาศ `ambient_air_gas` + H2 จาก `raw_water_m3`) ผสมกับหินฟอสเฟตและโพแทช (`phosphate_potash_rock`) **ยุติการสร้างธาตุ N จากหินฟอสเฟตกับน้ำเปล่า**
   - แยกแป้งสาลีกลูเตน (`wheat_flour` โม่จาก `wheat_grain` ซึ่งปลูกจาก `wheat_seed`) ออกจากแป้งข้าวหอม (`artisan_flour`) และห้ามนำแป้งทุกชนิดไปปลูกเป็นเมล็ดพันธุ์
3. **10 ตระกูลผลิตภัณฑ์ (`D.PRODUCT_FAMILIES`), 9 โดเมนความสามารถ (`D.CAPABILITY_DOMAINS`), 36 สินค้า และ 6 บริการวิศวกรรม B2B (บทที่ 28 & 32):**
   - เพิ่มสินค้าอุตสาหกรรมใหม่ 8 ชนิด (`probiotic_yogurt_cup`, `wheat_grain_biscuit`, `sterile_wound_dressing`, `medical_saline_iv`, `cold_chain_temp_logger`, `ev_traction_motor`, `lfp_grid_rack`, `warehouse_agv_bot`)
   - การสลับรุ่นสินค้าภายในตระกูลเดียวกัน (`sameFamily`) บนสายการผลิตใช้จิ๊กร่วมกันได้โดย **เสียค่าตั้งแม่พิมพ์ใหม่ 0 บาท**
   - ขยายธุรกิจบริการวิศวกรรม B2B เป็น 6 โมเดล โดยเพิ่ม 3 โมเดลใหม่จากบทที่ 28 และ 32:
     1. `battery_second_life_lab`: ห้องแล็บตรวจสุขภาพแบตเตอรี่ SOH รายเซลล์และคัดเกรดโมดูล Second-Life (แยก Custody ของลูกค้า และสกัดโลหะคืนจากเซลล์เสื่อมโดยไม่เสกเซลล์เสียเป็นของใหม่ฟรี)
     2. `returnable_pallet_pool`: บริการให้เช่าพาเลตและบรรจุภัณฑ์หมุนเวียน B2B (เบิกบรรจุภัณฑ์จริง ส่งเช่า ล้าง/ซ่อมคืน)
     3. `cold_storage_3pl`: บริการคลังห้องเย็นรับฝากสินค้า B2B 3PL (แยกทะเบียนฝากของลูกค้าออกจากสต็อกบริษัท 100%)
4. **ระบบคณะกรรมการบริหารและสมุดบันทึกมติการลงทุน (`w.executiveBoard` — บทที่ 29):**
   - คำนวณ **เงินสดอิสระ (`uncommittedCashSatang`)** หลังหักเงินสำรองฉุกเฉินตามความรอบคอบของ CEO (`survivalReserveSatang`), เจ้าหนี้การค้า, ค่าแรงค้างจ่าย, เงินมัดจำลูกค้าที่มีภาระต้องส่งมอบ (`unearnedDepositsSatang`), และงบที่ผูกพันแล้ว (`committedBudgetSatang`)
   - ประเมินและบันทึกมติ (`approved`, `pilot_or_buy_inputs`, `deferred_missing_staff`, `deferred_missing_materials`, `deferred_working_capital`, `deferred_unprofitable_market`, `hold_cash_prudent`, `deferred_no_executive_authority`) ลงใน `w.executiveBoard.decisionLedger` พร้อมแสดงผลในแท็บ **🏛️ สมุดมติบอร์ดบริหาร & โดเมนความรู้ (บท 29/32)**

## 2. ผลการรันตรวจสอบและข้อจำกัดของสภาพแวดล้อม (Verification, Benchmark & Environment Report)
- **`node tools/verify.cjs` (`npm run check`):** `PASS`
  - `human-core.js` SHA-256: `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32` (ไม่เปลี่ยนแปลง 100%)
  - ไวยากรณ์ แค็ตตาล็อกเริ่มต้น (58 วัตถุดิบ, 36 สินค้า, 35 สูตร, 6 บริการ B2B) และ Save Schema ผ่านครบ
- **`node tools/test.cjs` (`npm test`):** `PASS 130/130` ข้อ (0 ความล้มเหลว)
- **`node tools/build.cjs` (`npm run build`):** `PASS` สร้าง `CompanyFoundation_single.html` และ `Company_single.html` ขนาด `1,220,381` UTF-8 bytes
- **`node tools/benchmark.cjs`:**
  - 8 พนักงาน: `0.458 ms/tick`
  - 30 พนักงาน: `0.645 ms/tick`
  - 100 พนักงาน: `1.394 ms/tick`
  - 300 พนักงาน: `0.477 ms/tick`
  - 500 พนักงาน: `0.795 ms/tick` (`p95: 1.199 ms`)
- **หมายเหตุเรื่อง `npm run test:browser`:** ในสภาพแวดล้อม VM ปัจจุบัน (`Node v18.20.4` โหมด Offline) ไม่มีแพ็กเกจ `playwright` ติดตั้งอยู่ใน `node_modules` (`Cannot find module 'playwright'`) จึงตรวจสอบความถูกต้องของ API, DOM Presenter และชุดทดสอบจำลองทั้งหมดผ่าน Node Test Runner ทั้ง 130 ข้อแทนตามข้อกำหนดการรายงานตามจริง
- **ตาราง Coverage Matrix (`NPC_COVERAGE_MATRIX_V1.3.0.csv` & `docs/company/NPC_COVERAGE_MATRIX_TO_COMPLETE.csv`):** กรอกและยืนยันครบทั้ง **123 รายการ** (`VERIFIED_V130`)
