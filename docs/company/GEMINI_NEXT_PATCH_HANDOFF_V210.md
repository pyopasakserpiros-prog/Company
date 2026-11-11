# เอกสารส่งต่องานถัดไปหลังแพตช์ v2.1.0 (Handoff to Codex / Claude / Next Agent)

- **Task ID ที่ส่งมอบในรอบนี้:** `business-world-metals-entry-audit-2026-11`
- **ฐาน commit ตั้งต้น:** `6182e0a662bf1dfe47360e64e20e635ea07abeae` (`main` v2.0.0)
- **รุ่นเกมที่ส่งมอบ:** `v2.1.0` (`D.VERSION = "2.1.0"`, `D.RELEASE_VERSION = "2.1.0"`)
- **ไฟล์ที่ล็อกและยืนยันไม่แตะต้อง 100%:** `AGENTS.md`, `COMPANY_SOURCE/js/human-core.js` (`SHA-256: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`), `COMPANY_SOURCE/CORE_LOCK.json`

## 1. สิ่งที่ทำเสร็จและยืนยันด้วยเทสต์ใน v2.1.0

1. **แก้บั๊ก NPC Business-Entry Audit ครบ 7 จุด (`COMPANY_SOURCE/js/sim.js`, `js/data.js`, `js/save.js`):**
   - ย้ายการประเมินอัตโนมัติของบอร์ด (`evaluateExecutiveBoardAndBusinessEntry`) จาก `evaluateExternalAssetsDaily` ตอนข้ามวัน (เที่ยงคืน `00:00` น. ซึ่งไม่มีผู้บริหารอยู่ที่ทำงาน) มาเป็นเวลางานจริง `tod(w) === 645` (`10:45` น.) ใน `step(w)` ทำให้ CEO หรือผู้นำอาวุโสที่ `atWork` ประเมินและอนุมัติขยายธุรกิจได้จริงระหว่างเดินเวลาปกติโดยไม่ต้องพึ่ง `ignoreAtWork: true`
   - เพิ่ม `leaseDepositSatang` (`dailyLeaseCost * 5`: `dry_6w = 900,000`, `reefer_6w = 1,250,000`, `heavy_10w = 1,700,000` สตางค์) ใน `FLEET_VEHICLES` และปรับ `acquireFleetVehicle` (`getFleetUpfrontCost`) ให้รองรับทั้ง `{ ownership: "leased" }` และ `"leased"` พร้อมคืน `costSatang` ตรงกัน ไม่มี `NaN`
   - แยกงบที่จองไว้ (`committedBudgetSatang` / `eb.reservations`) ออกจากทุนที่จ่ายออกไปแล้ว (`paidCapitalTotalSatang`) ด้วย `reserveBoardBudget`, `consumeBoardReservation` และ `cancelBoardReservation` ป้องกันการหักเงินซ้ำสองต่อใน `computeFinancialPools`
   - เปิดทางให้บริษัทขนาดเล็ก (`< 10` คน) ประเมินและเปิดธุรกิจขนาดย่อมที่เหมาะกับกำลังคนและทุนได้ (เช่น เช่ารถ 1 คัน หรือเปิดบริการ B2B ที่ใช้ผู้เชี่ยวชาญ 1 คน) โดยไม่ติด deadlock
   - เปลี่ยน `service_entry` ให้ตรวจ `remainingUncommitted` หลังหักเงินสำรองอยู่รอดแทน `w.finance.cash` ดิบ
   - เปลี่ยนการเลือกบริการ B2B และลูกค้าจาก round-robin/รายแรก มาเป็นการจัดอันดับตามดีมานด์ อัตรากำไร ความพร้อมของอะไหล่ และความสัมพันธ์ลูกค้า
   - บังคับใช้ `nextReviewDay` และ `eb.topicCooldowns` เพื่อไม่ให้บอร์ดบันทึกมติซ้ำเรื่องเดิมทุกวันก่อนถึงรอบทบทวน
2. **สายโลหะและอะลูมิเนียมขั้นบันได (Stepped Metals & Extrusion Ladder):**
   - เพิ่มวัตถุดิบ 6 ชนิด (`coke_reducing_flux`, `alumina_billet`, `structural_steel_plate`, `mineral_slag_mud`, `nickel_cobalt_matte`, `aluminum_extrusion_profile` -> รวม **64 ชนิด**), สูตรแปรรูป 5 สูตร (รวม **40 สูตร**) พร้อม `alternativeInputs` บน `metal_sheet`, `heat_sink`, `cathode_electrolyte`, ระบบบำบัดกากแร่ `treatMineralSlag(w, batchCount)` และสินค้าใหม่ 4 ชนิด (`solar_mounting_rail_kit`, `ev_battery_tray_assembly`, `industrial_switchgear_cabinet`, `high_nickel_nmc_module` -> รวม **40 ชนิด**)
3. **บริการวิศวกรรม B2B ใหม่ 2 ประเภท (รวม 8 ประเภท):** `energy_epc_install` และ `b2b_technical_academy`
4. **ตลาดโลก 12 ประเทศ เหตุการณ์ภูมิรัฐศาสตร์ 16 เหตุการณ์ บริษัทต่างชาติ 22 แห่ง เส้นทางขนส่ง 6 สาย และทางเดินการค้า 4 สาย (`D.TRADE_CORRIDORS`):**
   - เพิ่ม `ID` (อินโดนีเซีย), `AU` (ออสเตรเลีย), `IN` (อินเดีย), `SG` (สิงคโปร์) พร้อมเหตุการณ์ `indonesia_nickel_bauxite_ban`, `australia_pilbara_cyclone_iron_shock`, `singapore_asean_coldchain_corridor`, `india_apac_clean_grid_pharma_boom` และบริษัทคู่ค้า `nusantara_nickel`, `pilbara_resources`, `bharat_biotech_it`, `singapore_port_3pl`

## 2. จุดที่เสนอให้ Codex / Claude ต่อยอดในรอบถัดไป (v2.2.0+)

1. **การรัน `npm run test:browser` บนเครื่องที่มี Playwright:** ในคอนเทนเนอร์ออฟไลน์ของ Gemini ไม่มีแพ็กเกจ npm `playwright` ติดตั้งไว้ล่วงหน้า จึงรัน `npm test` (`136/136`), `npm run check`, `npm run build` และ `node tools/benchmark.cjs` ครบทั้งหมด เมื่อนำเข้า `main` ให้รัน `npm run test:browser` เพิ่มเติม
2. **UI Visualization สำหรับ `snap.externalWorld.tradeCorridors` และ `w.executiveBoard.reservations`:** ข้อมูลทางเดินการค้า 4 สายและรายการจองงบของบอร์ดถูกส่งออกทาง `api.js` และ `debug.js` แล้ว สามารถนำไปวาดแผนผังสายการค้าภูมิภาคและการ์ดงบจองใน UI เพิ่มเติมได้
3. **ต่อยอดโมเดลผู้ค้าส่งวัสดุ (Wholesale Distribution) และรับจ้างถลุงโลหะ (Toll Smelting):** ตามที่คัดแยกไว้ใน `ideas/company/34_business_depth_world_markets_and_npc_entry_audit.md`
