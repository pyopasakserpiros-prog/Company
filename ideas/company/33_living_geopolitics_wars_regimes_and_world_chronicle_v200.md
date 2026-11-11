# บทที่ 33: ยุค 2.0.0 — ระบบภูมิรัฐศาสตร์โลกมีชีวิต รัฐบาล 8 ประเทศ สงคราม สนธิสัญญา และพงศาวดารโลก (Living Global Geopolitics & World Chronicle — v2.0.0)

เอกสารบทที่ 33 สรุปสถาปัตยกรรมยุค **v2.0.0** ของ **Siam Enterprise / Company Simulation (`COMPANY_SOURCE/`)** ซึ่งยกระดับโลกภายนอกให้มีชีวิตอย่างสมบูรณ์:
1. **`D.GLOBAL_NATIONS` (8 ประเทศและกลุ่มเศรษฐกิจคู่ค้า/มหาอำนาจ):**
   - `TH` (ราชอาณาจักรไทย), `US` (สหรัฐอเมริกา), `CN` (สาธารณรัฐประชาชนจีน), `JP` (ญี่ปุ่น), `EU` (สหภาพยุโรป), `ME` (ตะวันออกกลางและโอเปก), `RU_EE` (ยูเรเซียและภูมิภาคทะเลดำ), และ `ASEAN` (ประชาคมเศรษฐกิจอาเซียน)
   - แต่ละประเทศมีขั้วรัฐบาลหลายรูปแบบ (`regimes`) เมื่อเกิดการเลือกตั้งหรือเปลี่ยนขั้วรัฐบาล (`changeForeignRegime`) จะเปลี่ยนอัตราภาษี (`tariffModPct`), แรงกดดันค่าเงิน (`fxModPct`), ตัวคูณราคาวัตถุดิบเฉพาะกลุ่ม (`materialMods`), และตัวคูณอุปสงค์รายอุตสาหกรรม (`sectorDemandMods`) ทันที
2. **`D.GEOPOLITICAL_EVENTS` (12 เหตุการณ์ภูมิรัฐศาสตร์โลก):**
   - ครอบคลุมสงครามและการปิดล้อมทางทะเล (`red_sea_blockade_war`, `black_sea_grain_fertilizer_war`), สงครามการค้าและคว่ำบาตรชิป (`superpower_chip_embargo`), การเปลี่ยนขั้วรัฐบาลมหาอำนาจ (`us_regime_tariff_shift`, `global_green_supercycle_election`, `china_rare_earth_quota_shift`), สนธิสัญญาความร่วมมือระหว่างประเทศ (`asean_jp_eu_free_trade_pact`, `global_food_medical_accord`, `apac_robotics_semi_alliance`), และวิกฤตซัพพลายเชน/ภูมิอากาศ/ไซเบอร์ (`el_nino_agri_drought`, `global_port_congestion_crisis`, `global_cyber_cloud_alert`)
3. **การส่งผ่านผลกระทบทางเศรษฐกิจจริง (`recomputeGeopoliticalMultipliers`):**
   - คำนวณ `fxRateBahtPerUsd`, `globalOilIndex`, `globalFreightRateMultiplier`, `globalLeadTimeMultiplier`, `materialPriceMultipliers` (ครบทั้ง 58 วัตถุดิบ), `materialSpotPrices`, และ `sectorDemandMultipliers`
   - ส่งผลจริงต่อราคาขายวัตถุดิบ B2B (`sellMaterialB2B`), ราคาสั่งซื้อวัตถุดิบ (`placePurchase`), ค่าระวางใบเสนอราคาขนส่ง (`fleetTransport.openQuotes`), ดัชนีตลาดหุ้น (`stockMarket.indices`), และการให้คะแนนซื้อสินทรัพย์ต้นน้ำของคณะกรรมการบริหาร (`evaluateExecutiveBoardAndBusinessEntry`)
4. **พงศาวดารโลกภายนอก (`w.externalWorld.worldChronicle`):**
   - บันทึกทุกเหตุการณ์ระดับโลก การเปลี่ยนรัฐบาลต่างชาติ และการแข่งขันระหว่าง 18 บริษัทภายนอก พร้อมผสานเข้ากับหน้าต่างพงศาวดารหลักภายใต้หมวด `WORLD_GEOPOLITICS` (`🌍 พงศาวดารโลก/ภูมิรัฐศาสตร์`)
