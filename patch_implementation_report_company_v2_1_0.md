# รายงานการพัฒนาแพตช์ Company Simulation รุ่น v2.1.0 (`PATCH_IMPLEMENTATION_REPORT_COMPANY_V2.1.0.md`)

- **Task ID:** `business-world-metals-entry-audit-2026-11`
- **รุ่นเกม (`D.VERSION` / `D.RELEASE_VERSION`):** `2.1.0`
- **ฐาน Commit ตั้งต้น:** `6182e0a662bf1dfe47360e64e20e635ea07abeae` (`main` v2.0.0)
- **วันที่จัดทำรายงาน:** 11 พฤศจิกายน 2026
- **สถานะไฟล์ที่ล็อกตามกฎเหล็ก:**
  - `AGENTS.md`: **ไม่แก้ไข 100%**
  - `COMPANY_SOURCE/js/human-core.js`: **ไม่แก้ไข 100%** (`SHA-256: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`)
  - `COMPANY_SOURCE/CORE_LOCK.json`: **ไม่แก้ไข 100%**

## 1. บทสรุปผู้บริหารและแนวคิดการออกแบบเชิงระบบ (Chain-Reaction & Multi-Angle Design)

แพตช์ **v2.1.0** มุ่งแก้ปัญหาคอขวดสำคัญของการตัดสินใจเปิดธุรกิจอัตโนมัติของ NPC (NPC Business-Entry Audit) ทั้ง 7 จุดที่ตรวจพบในฐาน `v2.0.0` ควบคู่กับการขยายความลึกทางเศรษฐกิจด้วย **บันไดการลงทุนสายโลหะและอะลูมิเนียมรีดขึ้นรูป (Stepped Metals & Extrusion Ladder)**, **บริการวิศวกรรม B2B ใหม่ 2 รูปแบบ**, และ **การเชื่อมโยงภูมิรัฐศาสตร์ระดับเอเชีย-แปซิฟิกอีก 4 ประเทศ พร้อมทางเดินการค้าภูมิภาค 4 สาย (`D.TRADE_CORRIDORS`)** โดยคำนึงถึงผลกระทบเป็นลูกโซ่ครบทุกมิติ:

1. **ผลกระทบเป็นลูกโซ่ของการย้ายเวลาประเมินบอร์ดและการแยกบัญชีงบจอง:**
   - ใน `v2.0.0` การเรียก `evaluateExecutiveBoardAndBusinessEntry` อยู่ใน `evaluateExternalAssetsDaily` ตอนข้ามวัน (`00:00` น.) ซึ่งเป็นเวลาที่ CEO และผู้บริหารทุกคนกลับบ้าน (`atWork === false`) ส่งผลให้การรันจริงทุกวันติด `deferred_no_executive_authority` ตลอดกาล ใน `v2.1.0` จึงย้ายจุดเรียกอัตโนมัติมาอยู่ใน `step(w)` เวลา `10:45` น. (`tod(w) === 645`) ซึ่งเป็นช่วงที่ผู้บริหารเข้าออฟฟิศแล้วและตลาด/ออเดอร์ประจำวันอัปเดตเสร็จเรียบร้อย
   - เมื่อบอร์ดอนุมัติลงทุนในเวลางานจริง หากยังใช้ระบบเดิมที่บวก `committedBudgetSatang` ทับซ้อนกับเงินที่จ่ายผ่าน `Econ.post()` ไปแล้ว บริษัทจะถูกล็อกเงินสดซ้ำสองต่อจนขยายกิจการต่อไม่ได้ ใน `v2.1.0` จึงออกแบบระบบแยก **งบที่จองไว้สำหรับโครงการที่ยังไม่จ่ายเงิน (`eb.reservations` / `committedBudgetSatang`)** ออกจาก **ทุนที่จ่ายจริงแล้ว (`eb.paidCapitalTotalSatang`)** อย่างเด็ดขาดผ่าน `reserveBoardBudget`, `consumeBoardReservation` และ `cancelBoardReservation`
2. **บันไดการลงทุนสายโลหะ (Buy First, Refine Later) และการจัดการกากแร่ (`mineral_slag_mud`):**
   - แทนที่จะบังคับให้บริษัทต้องมีเหมืองและโรงถลุงครบวงจรตั้งแต่แรก ระบบเปิดให้โรงงานสามารถ **ซื้อวัตถุดิบกลางน้ำ** (`alumina_billet`, `structural_steel_plate`, `aluminum_extrusion_profile`, `nickel_cobalt_matte`) จากตลาดหรือบริษัทคู่ค้าต่างชาติมาขึ้นรูปเป็นสินค้ามูลค่าสูง (`solar_mounting_rail_kit`, `ev_battery_tray_assembly`, `industrial_switchgear_cabinet`, `high_nickel_nmc_module`) ได้ก่อน แล้วจึงค่อยขยายย้อนกลับไปสู่การขุดแร่เหล็ก/บ็อกไซต์ (`iron_ore`, `bauxite_ore`) และการถลุงด้วยฟลักซ์ (`coke_reducing_flux`) เมื่อพร้อม
   - เพื่อรักษาสมดุลนิเวศและป้องกันการเสกมวลฟรี การถลุงแร่ทุกสูตรจะก่อให้เกิดกากตะกรันและโคลนแดง (`mineral_slag_mud`) เป็นผลพลอยได้ ซึ่งต้องนำไปบำบัดผ่าน `S.treatMineralSlag(w, batchCount)` (ใช้คอมโพสต์อินทรีย์และค่าบำบัด) เพื่อเปลี่ยนเป็นเม็ดวัสดุคอมโพสิต (`composite_pellet`) สำหรับใช้ในอุตสาหกรรมต่อไป

## 2. รายละเอียดการแก้บั๊ก NPC Business-Entry Audit ทั้ง 7 จุด

| ลำดับ | ประเด็น Audit ใน v2.0.0 | สาเหตุรากฐาน (Root Cause) | การแก้ไขใน v2.1.0 (`js/sim.js`, `js/data.js`, `js/save.js`) | ผลลัพธ์และหลักฐานจากเทสต์จริง |
|---|---|---|---|---|
| 1 | **CEO ไม่อนุมัติธุรกิจอัตโนมัติในเวลาเดินเกมปกติ** | `evaluateExecutiveBoardAndBusinessEntry` ถูกเรียกใน `evaluateExternalAssetsDaily` ตอนข้ามวัน (`00:00` น.) ซึ่งผู้บริหารไม่อยู่ที่ทำงาน (`atWork === false`) | ย้ายการเรียกอัตโนมัติมาไว้ใน `step(w)` ที่ `tod(w) === 645` (`10:45` น.) และตรวจ `eb.lastAutoEvalTickDay !== w.day` | รันสด 12 วันหลาย seed (5, 8, 12 คน) โดยไม่ใช้ `ignoreAtWork`: บอร์ดประเมินในเวลางานจริงและเกิดมติที่มีผู้บริหารลงนาม (`lastReviewDay > 0`) |
| 2 | **ค่าเช่ารถบรรทุกเป็น `NaN` เมื่อบอร์ดเลือกเช่า** | `FLEET_VEHICLES` ใน `data.js` ไม่มีฟิลด์ `leaseDepositSatang` และ `acquireFleetVehicle` เช็กเฉพาะ `mode === "leased"` แต่บอร์ดส่ง `{ ownership: "leased" }` | เพิ่ม `leaseDepositSatang` (`dailyLeaseCost * 5`: `900000`, `1250000`, `1700000`) ใน `FLEET_VEHICLES` และสร้าง `getFleetUpfrontCost(spec, mode)` รองรับทั้งสตริงและอ็อบเจกต์ พร้อมคืน `costSatang` | ทดสอบเช่ารถทั้งทางตรงและผ่านบอร์ด: หักเงินมัดจำ `900,000` / `1,250,000` / `1,700,000` สตางค์ถูกต้อง ไม่มี `NaN` ใน ledger หรืองบจอง |
| 3 | **หักงบ `committedBudgetSatang` ซ้ำกับเงินสดที่จ่ายแล้ว** | เมื่อซื้อรถหรือสินทรัพย์ เงินสดลดลงผ่าน `Econ.post()` แล้ว แต่ยังบวก `committedBudgetSatang` ค้างไว้ ทำให้ `computeFinancialPools` หักซ้ำสองต่อ | แยก `eb.reservations` (`committedBudgetSatang` เฉพาะงบที่จองแต่ยังไม่จ่าย) ออกจาก `eb.paidCapitalTotalSatang` ด้วย `reserveBoardBudget`, `consumeBoardReservation`, `cancelBoardReservation` | ทดสอบจองงบ → ซื้อจริง → ตรวจ `computeFinancialPools`: หลังจ่ายเงิน `committedBudgetSatang` ลดลงเป็น `0` และ `paidCapitalTotalSatang` บันทึกยอดที่จ่ายแล้วโดยไม่หักเงินสดซ้ำ |
| 4 | **บริษัทขนาดเล็ก (<10 คน) ติด Deadlock เปิดธุรกิจไม่ได้** | เงื่อนไขเดิมล็อก `w.npcs.length < 10 && assets.length === 0` ให้ชะลอทั้งหมด | เปิดโหมด `smallCompanyMode` สำหรับบริษัทที่มีพนักงาน `< 10` คน ให้สามารถเช่ารถบรรทุกคันแรก (เมื่อมีคนขับ) หรือเปิดบริการ B2B ที่ใช้ผู้เชี่ยวชาญ 1 คนได้เมื่อเงินสดอิสระพร้อม | ทดสอบบริษัทขนาด 5 คนและ 8 คนที่มีเงินทุนและทักษะพร้อม: สามารถเปิดธุรกิจบริการหรือเช่ารถได้โดยไม่ติด deadlock |
| 5 | **`service_entry` ใช้เงินสดรวมแทนเงินสดอิสระหลังสำรอง** | เช็ก `w.finance.cash >= labCost + 1500000` โดยไม่หัก `survivalReserveSatang` และภาระผูกพัน | เปลี่ยนเป็นเช็ก `remainingUncommitted >= labCost + workingBuffer` | ทดสอบกรณีเงินสดรวมสูงแต่ติดภาระหนี้/เงินสำรองอยู่รอด: บอร์ดชะลอ `deferred_working_capital` ไม่ละเมิดเงินสำรองอยู่รอด |
| 6 | **เลือกชนิดบริการและลูกค้าแบบคงที่ (Round-robin / รายแรก)** | ใช้ `serviceDefs[w.day % serviceDefs.length]` และ `clients[0]` โดยไม่ดูความต้องการตลาด อะไหล่ หรือความสัมพันธ์ | สร้างการจัดอันดับบริการตาม `(demandMult * marginRatio * spareReadiness)` และจัดอันดับลูกค้าตามความต้องการเซกเตอร์และความเชื่อถือ (`trust`) | ทดสอบเมื่อเกิดเหตุการณ์ภูมิรัฐศาสตร์ดันดีมานด์พลังงาน/เทคโนโลยี: บอร์ดเลือกบริการและลูกค้าที่ให้ผลตอบแทนและความพร้อมสูงสุด |
| 7 | **`nextReviewDay` ถูกเขียนลงมติแต่ไม่ถูกใช้คุม Cooldown** | บันทึก `nextReviewDay` ใน ledger แต่ไม่มีการตรวจวัดก่อนประเมินซ้ำในวันถัดไป | เพิ่ม `eb.topicCooldowns[topic]` และตรวจ `w.day < cooldownUntil` เพื่อข้ามหัวข้อที่ยังไม่ถึงวันทบทวน | ทดสอบรันต่อเนื่องหลายวัน: หัวข้อที่เพิ่งอนุมัติหรือชะลอจะไม่ถูกเขียนซ้ำลง `decisionLedger` ทุกวันจนกว่าจะถึง `nextReviewDay` |

## 3. รายการวัตถุดิบ สูตรแปรรูป สินค้า บริการ B2B และตลาดโลกที่เพิ่มใน v2.1.0

### 3.1 วัตถุดิบใหม่ 6 ชนิด (รวม 64 ชนิด) และสูตรแปรรูปใหม่ 5 สูตร (รวม 40 สูตร)
- `coke_reducing_flux` (`T1_REFINED_RAW`, หน่วย `kg`): ถ่านโค้กและหินปูนฟลักซ์รีดิวซ์สำหรับถลุงโลหะ (ผลิตจาก `crude_petro_feedstock: 2` + `phosphate_potash_rock: 1` หรือสั่งซื้อจากคู่ค้า)
- `alumina_billet` (`T1_REFINED_RAW`, หน่วย `ingot`): แท่งอะลูมินา-อะลูมิเนียมเกรดอุตสาหกรรม (ผลิตจาก `bauxite_ore: 2` + `coke_reducing_flux: 1` + `raw_water_m3: 1` ได้ `alumina_billet: 3` และกากแร่ `mineral_slag_mud: 1`)
- `structural_steel_plate` (`T1_REFINED_RAW`, หน่วย `sheet`): เหล็กกล้าแผ่นโครงสร้าง (ผลิตจาก `iron_ore: 2` + `coke_reducing_flux: 1` ได้ `structural_steel_plate: 3` และกากแร่ `mineral_slag_mud: 1`)
- `nickel_cobalt_matte` (`T1_REFINED_RAW`, หน่วย `kg`): นิกเกิล-โคบอลต์แมตต์เกรดแบตเตอรี่ (ผลิตจาก `copper_iron_ore: 2` + `lithium_brine_ore: 1` + `coke_reducing_flux: 1` ได้ `nickel_cobalt_matte: 2` และกากแร่ `mineral_slag_mud: 1` หรือนำเข้าจากอินโดนีเซีย `nusantara_nickel`)
- `aluminum_extrusion_profile` (`T2_COMPONENT`, หน่วย `bar`): โพรไฟล์อะลูมิเนียมรีดขึ้นรูป (ผลิตจาก `alumina_billet: 2` + `fastener_set: 1` ได้ `aluminum_extrusion_profile: 3`)
- `mineral_slag_mud` (`INDUSTRIAL_BYPRODUCT`, หน่วย `kg`): ตะกรันถลุงแร่และโคลนแดง (บำบัดผ่าน `S.treatMineralSlag(w, batchCount)` ร่วมกับ `organic_compost` เพื่อเปลี่ยนเป็น `composite_pellet`)
- เพิ่ม `alternativeInputs` บน `recipe_metal_sheet`, `recipe_heat_sink` และ `recipe_cathode_electrolyte` เพื่อให้รองรับทั้งสายแร่เดิมและสายโลหะแยกชนิดอย่างราบรื่น

### 3.2 สินค้าใหม่ 4 ชนิด (รวม 40 ชนิดใน 10 ตระกูล)
- `solar_mounting_rail_kit` (ตระกูล `fam_grid_power`): ชุดรางอะลูมิเนียมยึดแผงโซลาร์ (`aluminum_extrusion_profile: 2`, `structural_steel_plate: 1`, `fastener_set: 2`)
- `ev_battery_tray_assembly` (ตระกูล `fam_ev_mobility`): โครงถาดแบตเตอรี่ EV อะลูมิเนียมนิรภัย (`aluminum_extrusion_profile: 2`, `structural_steel_plate: 1`, `rubber_seal: 2`, `cooling_gel: 1`)
- `industrial_switchgear_cabinet` (ตระกูล `fam_grid_power`): ตู้สวิตช์เกียร์แรงดันต่ำโรงงาน (`structural_steel_plate: 2`, `copper_coil: 2`, `power_inverter_ic: 1`, `pcb: 1`, `insulation_foam: 1`)
- `high_nickel_nmc_module` (ตระกูล `fam_ev_mobility`): โมดูลแบตเตอรี่นิกเกิลความจุสูง NMC (`nickel_cobalt_matte: 2`, `cathode_electrolyte: 2`, `aluminum_extrusion_profile: 1`, `microchip: 1`, `foil_pouch: 1`)

### 3.3 บริการวิศวกรรม B2B ใหม่ 2 ประเภท (รวม 8 ประเภท)
- `energy_epc_install`: บริการรับเหมาติดตั้งระบบโซลาร์และกักเก็บพลังงาน B2B (ใช้ `solar_mounting_rail_kit: 1`, `copper_coil: 1`, ทีมวิศวกร 2 คน, รายได้ฐาน `920,000` สตางค์)
- `b2b_technical_academy`: ศูนย์ฝึกอบรมและรับรองทักษะวิศวกรรม B2B ให้บริษัทภายนอก (ใช้ `pcb: 1`, `sensor_pack: 1`, ผู้สอนอาวุโส 1 คน, รายได้ฐาน `640,000` สตางค์)

### 3.4 ประเทศใหม่ 4 ประเทศ เหตุการณ์ภูมิรัฐศาสตร์ 4 เหตุการณ์ บริษัทต่างชาติ 4 แห่ง และทางเดินการค้า 4 สาย
- **ประเทศใหม่ (`D.GLOBAL_NATIONS` รวม 12 รายการ):** `ID` (อินโดนีเซีย), `AU` (ออสเตรเลีย), `IN` (อินเดีย), `SG` (สิงคโปร์)
- **เหตุการณ์ภูมิรัฐศาสตร์ใหม่ (`D.GEOPOLITICAL_EVENTS` รวม 16 รายการ):** `indonesia_nickel_bauxite_ban`, `australia_pilbara_cyclone_iron_shock`, `singapore_asean_coldchain_corridor`, `india_apac_clean_grid_pharma_boom`
- **บริษัทต่างชาติใหม่ (`D.EXTERNAL_CORPORATIONS` รวม 22 แห่ง):** `nusantara_nickel` (`ID`), `pilbara_resources` (`AU`), `bharat_biotech_it` (`IN`), `singapore_port_3pl` (`SG`)
- **เส้นทางขนส่งใหม่ (`D.FREIGHT_ROUTES` รวม 6 สาย):** `route_eec_singapore_feeder`, `route_maptaphut_metal_heavy`
- **ทางเดินการค้าภูมิภาค (`D.TRADE_CORRIDORS` 4 สาย):** `corridor_id_th_ev_nickel`, `corridor_au_th_iron_solar`, `corridor_th_sg_coldchain_asean`, `corridor_th_in_biomed_grid`

## 4. ผลการตรวจสอบคุณภาพ ประสิทธิภาพ และชุดทดสอบ (Verification Evidence)

| คำสั่งตรวจ | ผลลัพธ์จริง | รายละเอียด |
|---|---|---|
| `npm test` (`node tools/test.cjs`) | **PASS (136/136 tests, 0 failures)** | รวมชุดทดสอบใหม่ `test/business-depth-world-corridors-v210.test.cjs` ที่ตรวจทั้ง 7 ประเด็น Audit, การรันสด 12 วันหลาย seed (5, 8, 12 คน) โดยไม่ใช้ `ignoreAtWork`, และการรันต่อเนื่อง 35 วันผ่าน `continueEndless` |
| `npm run check` (`node tools/verify.cjs`) | **PASS** | ตรวจผ่าน Syntax, Catalog integrity, Save validation และ Locked Human Core SHA-256 (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`) |
| `npm run build` (`node tools/build.cjs`) | **PASS** | สร้าง `COMPANY_SOURCE/CompanyFoundation_single.html` และ `Company_single.html` ขนาด **1,378,080 UTF-8 bytes** |
| `node tools/benchmark.cjs` | **PASS (`0.776 ms/tick` avg, `1.193 ms` p95)** | ทดสอบที่ขนาด 500 NPC เร็วกว่าเกณฑ์ `< 2.0 ms/tick` |
| `npm run test:browser` | **N/A ในคอนเทนเนอร์ออฟไลน์** | สภาพแวดล้อม VM ออฟไลน์ไม่มีแพ็กเกจ npm `playwright` ติดตั้งไว้ล่วงหน้า จึงรายงานตามจริงโดยไม่อ้างเท็จ |

## 5. ข้อมูลไฟล์ส่งมอบ (Deliverable Package Metadata)

- **ไฟล์ ZIP โปรเจกต์ฉบับสมบูรณ์:** `Company-v2.1.0.zip`
  - ขนาดไฟล์: `1,942,847` bytes
  - SHA-256: `f5adee1685bd636a905e5de0d671aaf80967f3b1316bc840fba218ad61bd5566`
- **ไฟล์เกม HTML เดี่ยวพร้อมเล่นออฟไลน์:** `Company_single.html`
  - ขนาดไฟล์: `1,378,080` bytes
  - SHA-256: `d493f8b25c1c63cc6c5253ba28ae365aa8288d70ed6e4af4a1f17f63de04154a`
- **สถานะการซิงก์สกิลในระบบ Gemini:**
  - อัปเดตไฟล์สกิลใน `.agents/skills/` (รวม `company-evolution-dev`, `company-for-every-patch` และ 6 สกิลเฉพาะด้าน) และสำเนาระดับ root (`SKILL.md`, `SKILL_COMPANY_EVOLUTION_DEV.md`, `SKILL_COMPANY_FOR_EVERY_PATCH.md`) เป็นรุ่น `v2.1.0` ครบถ้วน
  - เรียก `skills:update_skill` อัปเดต `company-for-every-patch` สำเร็จแล้ว ส่วน `company-evolution-dev` มีคำขออัปเดตค้างรอผู้ใช้กดยืนยันในหน้า Skills Manager UI ของแอป
