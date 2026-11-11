# เอกสารส่งต่องานถัดไปหลังแพตช์ v2.2.0 (Handoff to Codex / Claude / Next Agent)

- **Task ID ที่ส่งมอบในรอบนี้:** `sme-living-progression-and-holistic-realism-2026-11`
- **ฐาน commit ตั้งต้น:** `6182e0a662bf1dfe47360e64e20e635ea07abeae` (`main` v2.0.0 ➔ v2.1.0 ➔ v2.2.0)
- **รุ่นเกมที่ส่งมอบ:** `v2.2.0` (`D.VERSION = "2.2.0"`, `D.RELEASE_VERSION = "2.2.0"`, `S.RELEASE_VERSION = "2.2.0"`)
- **ไฟล์ที่ล็อกและยืนยันไม่แตะต้อง 100%:** `AGENTS.md`, `COMPANY_SOURCE/js/human-core.js` (`SHA-256: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`), `COMPANY_SOURCE/CORE_LOCK.json`

## สิ่งที่พัฒนาและยืนยันด้วยเทสต์ใน v2.2.0 (`140/140` Tests Passing)

1. **บันไดการเติบโต SME 6 ระยะ (`D.SME_GROWTH_STAGES`) และ 12 ก้าวแรกแห่งความสำเร็จ (`D.SME_MILESTONE_CATALOG`, `w.companyProgression`)**:
   - จำลองการเติบโตของกิจการตั้งแต่ห้องแถว/เวิร์กช็อปตั้งต้น (Micro SME) ไปจนถึงบริษัทมหาชน (PCL) และกลุ่มบริษัทระดับภูมิภาค (ASEAN Conglomerate) พร้อมบันทึก Timeline ก้าวสำคัญและขยายเพดานเครดิต/ความเชื่อมั่นคู่ค้า B2B
2. **ระบบมิเตอร์ค่าไฟฟ้า-น้ำประปาโรงงาน โซลาร์รูฟท็อป และวิกฤตไฟตก (`w.utilities`, `stepUtilitiesDaily`, `payUtilityBills`)**:
   - ปิดช่องว่างที่โรงงานเดินเครื่องฟรีโดยคิดหน่วยไฟฟ้า (`kWh`) ตามระดับอาคาร จำนวนไลน์ผลิต โหมดเดินเครื่อง (`craft_precision` vs `mass_throughput`) และชั่วโมง OT พร้อมหักลบพลังงานที่ผลิตได้จาก `solarPlant` / `offsite_solar_wind_farm` และน้ำรีไซเคิลจาก `waterPlant` หากค้างชำระ 2 รอบจะเกิดภาวะไฟตก (`brownoutActive`) ลดความเร็วประกอบลง 20%
3. **ระบบวัฒนธรรมองค์กร ข่าวลือข้างตู้กดน้ำ ชมรมหลังเลิกงาน รางวัลพนักงานดีเด่น ลานจอดรถพนักงาน และบริษัท Spin-off ศิษย์เก่า (`w.culture`)**:
   - พนักงานพูดคุยข่าวลือข้างตู้กดน้ำตามสถานะจริงของบริษัท (`recentGossip`), เข้าชมรมหลังเลิกงาน (`clubActivities`), รับรางวัลพนักงานดีเด่น (`evaluateTownhallAwards`), นำรถส่วนตัวที่ซื้อจากเงินออมมาจอดใน **ลานจอดรถพนักงานบนผัง 2D Canvas (`campus-render.js`)**, และพนักงานอาวุโสสามารถแยกตัวไปตั้งบริษัท **Spin-off SME (`evaluateEmployeeSpinoff`)** ใน `w.externalWorld.corporations`
4. **ขยายบริการวิศวกรรมและค้าส่ง B2B ครบ 10 รูปแบบ (`wholesale_distribution`, `toll_smelting_extrusion`) และสินค้าตั้งต้นหมุนเงินไว 2 ชนิด (`braided_fast_charge_kit`, `artisan_chili_paste_jar` -> รวม 42 ชนิด)**
5. **ยกระดับ Edit Hub สำหรับผู้เล่นที่ไม่รู้โค้ด (`debug.js`, `grantPersonWallet`)**:
   - แยกการเติมเงินบาทเข้าบัญชีบริษัท (`grantCash`) ออกจากกระเป๋าเงินออมส่วนตัวของพนักงาน (`grantPersonWallet`) โดยรักษาสมการบัญชี 100%, เพิ่มตัวกรองหมวดวัตถุดิบ และแสดงคำอธิบายแนวโน้มพฤติกรรมเมื่อปรับนิสัย/ค่านิยม
