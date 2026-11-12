(function(root,factory){const v=factory();if(typeof module==='object'&&module.exports)module.exports=v;else root.CompanyPhoneEngineering=v;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
// Pure deterministic engineering estimates & reusable business-role/process/material-grade contracts.
// Power W, capacity MB/Wh, area mm², latency ns, brightness nits, costs integer satang.
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const num=(v,d=0,a=0,b=1e9)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,a,b):d;
const round=v=>Math.round(v*10000)/10000;
const money=v=>Math.round(clamp(v,0,Number.MAX_SAFE_INTEGER));
function rng(seed){let h=2166136261;for(const c of String(seed)){h=Math.imul(h^c.charCodeAt(0),16777619);}return()=>{h+=0x6D2B79F5;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}

const MATERIAL_GRADES=Object.freeze({
  electronic_silicon_wafer_9n:{
    id:'electronic_silicon_wafer_9n',
    nameTh:'เวเฟอร์ซิลิคอนเกรดอิเล็กทรอนิกส์ 9N (Electronic-Grade Silicon Wafer)',
    unit:'wafer_lot',
    purityGrade:'9N (99.9999999%)',
    rawInputs:{silicon_wafer:1,copper_coil:1},
    processStepTh:'ขัดผิวเคมีกล (CMP) และตรวจสอบความหนาแน่นจุดบกพร่องก่อนเข้าห้องสะอาด',
    usedByRoles:['wafer_foundry','fabless_soc','dram_memory','nand_storage']
  },
  tested_wafer_die_lot:{
    id:'tested_wafer_die_lot',
    nameTh:'ล็อตดายซิลิคอนผ่านการวัดผลบนเวเฟอร์ (Probed Good Die Lot)',
    unit:'die_lot',
    purityGrade:'Class-100 Cleanroom Wafer Probe',
    rawInputs:{silicon_wafer:1,copper_coil:1},
    processStepTh:'ลิโธกราฟี กัดลาย โดปปิ้ง และวัดไฟฟ้าระดับเวเฟอร์ (Wafer Sort)',
    usedByRoles:['wafer_foundry','osat_packaging','fabless_soc']
  },
  packaged_tested_ic_grade:{
    id:'packaged_tested_ic_grade',
    nameTh:'ชิปบรรจุแพ็กเกจและคัดเกรดความถี่/ความร้อน (Binned BGA/CSP Package)',
    unit:'chip_lot',
    purityGrade:'JEDEC Moisture/Thermal Qualified',
    rawInputs:{copper_coil:1,polymer_resin:1},
    processStepTh:'ยึดดาย ต่อลวดทองแดง/ฟลิปชิป หุ้มเรซินอีพ็อกซี และคัดเกรด A-Bin/B-Bin',
    usedByRoles:['osat_packaging','fabless_soc','dram_memory','nand_storage']
  },
  cmos_optical_wafer_grade:{
    id:'cmos_optical_wafer_grade',
    nameTh:'ชุดเซ็นเซอร์รับภาพ CMOS และชิ้นเลนส์เคลือบมัลติโค้ต (CMOS & Multi-Coat Optics)',
    unit:'optics_lot',
    purityGrade:'ISO-6 Optical Alignment Grade',
    rawInputs:{optical_lens:1,sensor:1},
    fallbackRawInputs:{glass_bottle:1,silicon_wafer:1,polymer_resin:1},
    processStepTh:'จัดแนวแกนแสงเลนส์ ประกอบแอคชูเอเตอร์ และสอบเทียบ MTF/สีในห้องมืด',
    usedByRoles:['camera_module']
  },
  aluminosilicate_panel_substrate:{
    id:'aluminosilicate_panel_substrate',
    nameTh:'กระจกอะลูมิโนซิลิเกตเคลือบ ITO และชั้นพิกเซลจอภาพ (Tempered ITO Display Substrate)',
    unit:'panel_lot',
    purityGrade:'Optical Zero-Bubble Lamination',
    rawInputs:{glass_bottle:1,copper_coil:1},
    processStepTh:'หลอมปรับโครงสร้างกระจกผิวเรียบ เคลือบขั้วโปร่งใส ITO ประกบชั้นแบ็กไลต์/พิกเซล และตรวจพิกเซลเสีย',
    usedByRoles:['display_panel']
  },
  high_cycle_lipo_cell_grade:{
    id:'high_cycle_lipo_cell_grade',
    nameTh:'เซลล์ลิเธียมคัดความต้านทานภายในพร้อมวงจรป้องกัน BMS (Matched Li-Ion/Li-Po Cell Pack)',
    unit:'cell_lot',
    purityGrade:'UN38.3 Thermal & Overcharge Certified',
    rawInputs:{battery:1},
    fallbackRawInputs:{cathode_electrolyte:1,foil_pouch:1,copper_coil:1},
    processStepTh:'คัดเกรดความจุ/ความต้านทานภายใน เชื่อมแถบนิกเกิล ประกอบวงจร BMS และทดสอบโหลดความร้อน',
    usedByRoles:['battery_pack']
  },
  hdi_rf_copper_laminate:{
    id:'hdi_rf_copper_laminate',
    nameTh:'แผงวงจรหลายชั้น HDI และวงจรกรองคลื่นวิทยุ RF (HDI Multi-Layer & RF Front-End Board)',
    unit:'board_lot',
    purityGrade:'Controlled Impedance 50-Ohm RF',
    rawInputs:{pcb:1,copper_coil:1},
    processStepTh:'เจาะไมโครเวีย ชุบทองแดง วางวงจรกรองความถี่วิทยุ และวัดความสมบูรณ์สัญญาณ/EMI',
    usedByRoles:['pcb_rf','brand','ems']
  },
  anodized_thermal_enclosure_grade:{
    id:'anodized_thermal_enclosure_grade',
    nameTh:'โครงตัวถังขึ้นรูปแม่นยำพร้อมแผ่นกระจายความร้อน (Precision Thermal Chassis)',
    unit:'chassis_lot',
    purityGrade:'CMM Dimensional Tolerance ±0.05mm',
    rawInputs:{polymer_resin:1,metal_sheet:1},
    processStepTh:'อัดขึ้นรูป/กัด CNC ชุบผิวอโนไดซ์ ติดแผ่นกราไฟต์นำความร้อน และวัดมิติ',
    usedByRoles:['enclosure']
  }
});

const ROLE_CONTRACTS=Object.freeze({
  fabless_soc:{
    id:'fabless_soc',
    legacyRole:'chip',
    nameTh:'ผู้ออกแบบชิปประมวลผล/SoC แบบไร้โรงหล่อ (Fabless CPU/SoC Design)',
    family:'semiconductor_design',
    outputs:['chip'],
    actualBuyers:['brand','ems'],
    subjectRequirements:{semiconductor_physics:42,circuit_design:40,embedded_firmware:32},
    keySpecialistSubject:'semiconductor_physics',
    requiredEquipment:['developer_pc','test_rig'],
    utilityKw:0.8,
    entryCapitalSatang:180000000,
    nreCostSatang:1500000,
    licenseFeeSatang:1800000,
    workingCapitalDays:45,
    qualifiedMaterialGrade:'electronic_silicon_wafer_9n',
    bom:{silicon_wafer:1,copper_coil:1},
    workMinutesPerUnit:25,
    minBatchSize:10,
    baseYield:0.82,
    entryAlternatives:['in_house_rnd','license_core_ip','contract_foundry_osat'],
    processStages:[
      {code:'soc_arch_rtl',nameTh:'ออกแบบสถาปัตยกรรมชุดคำสั่งและรวมบล็อก RTL/ISP',workShare:0.4,passiveHoldMinutes:0,cleanroomRequired:false,qualityGateTh:'จำลองชุดคำสั่งและตรวจ Timing Closure ผ่าน'},
      {code:'physical_verification_tapeout',nameTh:'วางผังวงจร Physical Design และส่งแม่พิมพ์ Tape-Out',workShare:0.35,passiveHoldMinutes:60,cleanroomRequired:false,qualityGateTh:'ผ่านกฎ DRC/LVS ของโหนดการผลิต'},
      {code:'foundry_osat_qualification',nameTh:'สั่งผลิตเวเฟอร์ผ่าน Foundry และคัดเกรดแพ็กเกจ OSAT',workShare:0.25,passiveHoldMinutes:180,cleanroomRequired:true,qualityGateTh:'ตรวจวัดกำลังไฟและความถี่ชิป A-Bin/B-Bin ผ่านเกณฑ์'}
    ]
  },
  wafer_foundry:{
    id:'wafer_foundry',
    legacyRole:'chip',
    nameTh:'โรงหล่อเวเฟอร์ซิลิคอนและห้องสะอาด (Semiconductor Wafer Foundry)',
    family:'semiconductor_manufacturing',
    outputs:['chip','wafer_die'],
    actualBuyers:['fabless_soc','dram_memory','nand_storage','brand'],
    subjectRequirements:{semiconductor_process:48,physical_chemistry:42,cleanroom_operations:38,metrology:38},
    keySpecialistSubject:'semiconductor_process',
    requiredEquipment:['semiconductor_fab','diagnostic_kit'],
    utilityKw:20,
    entryCapitalSatang:800000000,
    nreCostSatang:5000000,
    licenseFeeSatang:4500000,
    workingCapitalDays:60,
    qualifiedMaterialGrade:'tested_wafer_die_lot',
    bom:{silicon_wafer:1,copper_coil:1},
    workMinutesPerUnit:30,
    minBatchSize:20,
    baseYield:0.78,
    entryAlternatives:['build_cleanroom_fab','contract_wafer_capacity'],
    processStages:[
      {code:'wafer_clean_oxidation',nameTh:'ล้างเวเฟอร์ด้วยน้ำบริสุทธิ์และสร้างชั้นออกไซด์',workShare:0.25,passiveHoldMinutes:60,cleanroomRequired:true,qualityGateTh:'ควบคุมฝุ่นห้องสะอาดและความหนาออกไซด์'},
      {code:'lithography_etch_implant',nameTh:'ฉายแสงลิโธกราฟี กัดลาย และฝังไอออน',workShare:0.45,passiveHoldMinutes:180,cleanroomRequired:true,qualityGateTh:'ความแม่นยำการซ้อนทับเลเยอร์และค่า Defect Density D0'},
      {code:'metallization_wafer_probe',nameTh:'เดินสายโลหะเชื่อมวงจรและวัดผลไฟฟ้าบนเวเฟอร์ (Wafer Sort)',workShare:0.3,passiveHoldMinutes:60,cleanroomRequired:true,qualityGateTh:'คัดแยก Good Dies ตามสมการ Murphy Yield'}
    ]
  },
  osat_packaging:{
    id:'osat_packaging',
    legacyRole:'ems',
    nameTh:'โรงงานประกอบแพ็กเกจชิปและทดสอบไฟฟ้า (OSAT Packaging & Test)',
    family:'semiconductor_packaging',
    outputs:['packaged_chip','pcb_rf'],
    actualBuyers:['fabless_soc','wafer_foundry','dram_memory','nand_storage','brand'],
    subjectRequirements:{semiconductor_process:35,smt_process:35,metrology:35,quality:32},
    keySpecialistSubject:'smt_process',
    requiredEquipment:['electronics_bench','test_rig'],
    utilityKw:2.4,
    entryCapitalSatang:150000000,
    nreCostSatang:800000,
    licenseFeeSatang:1200000,
    workingCapitalDays:30,
    qualifiedMaterialGrade:'packaged_tested_ic_grade',
    bom:{copper_coil:1,polymer_resin:1},
    workMinutesPerUnit:20,
    minBatchSize:15,
    baseYield:0.96,
    entryAlternatives:['in_house_osat','contract_packaging'],
    processStages:[
      {code:'die_attach_wirebond',nameTh:'ตัดเวเฟอร์ ยึดดาย และเชื่อมสัญญาณ (Die Attach & Interconnect)',workShare:0.4,passiveHoldMinutes:20,cleanroomRequired:true,qualityGateTh:'แรงยึดลวดเชื่อมและความต้านทานจุดสัมผัส'},
      {code:'molding_encapsulation',nameTh:'ฉีดเรซินห่อหุ้มป้องกันความชื้นและอบบ่ม',workShare:0.25,passiveHoldMinutes:45,cleanroomRequired:false,qualityGateTh:'ไร้โพรงอากาศและการโก่งตัวของแพ็กเกจ'},
      {code:'final_electrical_binning',nameTh:'ทดสอบไฟฟ้า-ความร้อนและคัดเกรดความเร็ว (Final Test & Binning)',workShare:0.35,passiveHoldMinutes:15,cleanroomRequired:false,qualityGateTh:'แยก A-Bin / B-Bin และตัดของเสีย'}
    ]
  },
  dram_memory:{
    id:'dram_memory',
    legacyRole:'display',
    nameTh:'ผู้ผลิตหน่วยความจำชั่วคราวความเร็วสูง (DRAM / Volatile Memory Supplier)',
    family:'memory_supplier',
    outputs:['ram'],
    actualBuyers:['brand','ems'],
    subjectRequirements:{semiconductor_physics:38,circuit_design:38,metrology:35},
    keySpecialistSubject:'circuit_design',
    requiredEquipment:['electronics_bench','test_rig'],
    utilityKw:2.5,
    entryCapitalSatang:220000000,
    nreCostSatang:1400000,
    licenseFeeSatang:1800000,
    workingCapitalDays:40,
    qualifiedMaterialGrade:'electronic_silicon_wafer_9n',
    bom:{silicon_wafer:1,copper_coil:1},
    workMinutesPerUnit:30,
    minBatchSize:4,
    baseYield:0.88,
    entryAlternatives:['in_house_rnd','license_jedec_dram','contract_wafer_fab'],
    processStages:[
      {code:'dram_cell_controller',nameTh:'ออกแบบตัวเก็บประจุเซลล์หน่วยความจำและวงจรควบคุมจังหวะ',workShare:0.35,passiveHoldMinutes:0,cleanroomRequired:false,qualityGateTh:'ตรงตามมาตรฐานอินเทอร์เฟซ SDRAM/LPDDR ของชิป'},
      {code:'dram_wafer_packaging',nameTh:'แปรรูปดายหน่วยความจำและประกอบแพ็กเกจความหนาแน่นสูง',workShare:0.35,passiveHoldMinutes:45,cleanroomRequired:true,qualityGateTh:'ตรวจสอบกระแสรั่วไหล أثناءรีเฟรช (Self-Refresh Power)'},
      {code:'dram_bandwidth_timing_qa',nameTh:'ทดสอบแบนด์วิดท์และค่าความหน่วงที่ความถี่จริง',workShare:0.3,passiveHoldMinutes:20,cleanroomRequired:false,qualityGateTh:'แบนด์วิดท์และ Latency ผ่านเกณฑ์โดยไม่มีบิตเพี้ยน'}
    ]
  },
  nand_storage:{
    id:'nand_storage',
    legacyRole:'display',
    nameTh:'ผู้ผลิตหน่วยเก็บข้อมูลแฟลชถาวร (NAND Flash / eMMC / UFS Supplier)',
    family:'storage_supplier',
    outputs:['storage'],
    actualBuyers:['brand','ems'],
    subjectRequirements:{embedded_firmware:38,circuit_design:35,semiconductor_process:32,quality:30},
    keySpecialistSubject:'embedded_firmware',
    requiredEquipment:['electronics_bench','test_rig'],
    utilityKw:2.2,
    entryCapitalSatang:200000000,
    nreCostSatang:1200000,
    licenseFeeSatang:1600000,
    workingCapitalDays:35,
    qualifiedMaterialGrade:'electronic_silicon_wafer_9n',
    bom:{silicon_wafer:1,copper_coil:1},
    workMinutesPerUnit:30,
    minBatchSize:4,
    baseYield:0.9,
    entryAlternatives:['in_house_rnd','license_flash_controller'],
    processStages:[
      {code:'nand_controller_ecc',nameTh:'พัฒนาคอนโทรลเลอร์จัดการบล็อกเสียและรหัสแก้ข้อมูลผิดพลาด (ECC/Wear-Leveling)',workShare:0.35,passiveHoldMinutes:0,cleanroomRequired:false,qualityGateTh:'เฟิร์มแวร์รองรับอินเทอร์เฟซ SPI/eMMC และป้องกันข้อมูลสูญหาย'},
      {code:'nand_die_stack_package',nameTh:'ซ้อนดายแฟลช (Die Stacking) และเชื่อมลงบอร์ดโมดูล',workShare:0.35,passiveHoldMinutes:30,cleanroomRequired:true,qualityGateTh:'ความสมบูรณ์ของการเชื่อมสายสัญญาณทุกเลเยอร์'},
      {code:'endurance_read_write_test',nameTh:'คัดกรองบล็อกเสียและวัดความเร็วอ่าน/เขียนต่อเนื่อง',workShare:0.3,passiveHoldMinutes:30,cleanroomRequired:false,qualityGateTh:'ความเร็วอ่านเขียนและรอบอายุการใช้งาน (P/E Cycles) ผ่านเกณฑ์'}
    ]
  },
  camera_module:{
    id:'camera_module',
    legacyRole:'display',
    nameTh:'ผู้ผลิตโมดูลกล้อง เซ็นเซอร์รับภาพ และชุดเลนส์ออปติคัล (Camera & Optics Supplier)',
    family:'optics_sensor_supplier',
    outputs:['camera'],
    actualBuyers:['brand','ems'],
    subjectRequirements:{semiconductor_optics:35,metrology:35,electrical_basics:35,quality:30},
    keySpecialistSubject:'semiconductor_optics',
    requiredEquipment:['electronics_bench','diagnostic_kit'],
    utilityKw:1.8,
    entryCapitalSatang:180000000,
    nreCostSatang:1200000,
    licenseFeeSatang:1600000,
    workingCapitalDays:35,
    qualifiedMaterialGrade:'cmos_optical_wafer_grade',
    bom:{polymer_resin:1,metal_sheet:1},
    preferredBom:{optical_lens:1,sensor:1},
    workMinutesPerUnit:30,
    minBatchSize:4,
    baseYield:0.87,
    entryAlternatives:['in_house_rnd','license_optics_module'],
    processStages:[
      {code:'cmos_pixel_optics_design',nameTh:'ออกแบบพื้นที่รับแสงเซ็นเซอร์ ชุดเลนส์ และอัลกอริทึมลดสัญญาณรบกวน',workShare:0.35,passiveHoldMinutes:0,cleanroomRequired:false,qualityGateTh:'สมดุลขนาดพิกเซล รูรับแสง และความคมชัด'},
      {code:'active_alignment_assembly',nameTh:'ประกอบชุดเลนส์ มอเตอร์โฟกัส และเซ็นเซอร์ในห้องไร้ฝุ่น',workShare:0.35,passiveHoldMinutes:20,cleanroomRequired:true,qualityGateTh:'ไร้ฝุ่นบนหน้าเซ็นเซอร์และระนาบโฟกัสตรงศูนย์'},
      {code:'mtf_lowlight_isp_calibration',nameTh:'สอบเทียบความคมชัด MTF สมดุลแสงสีขาว และประสิทธิภาพแสงน้อย',workShare:0.3,passiveHoldMinutes:15,cleanroomRequired:false,qualityGateTh:'ค่าความคมชัดและคุณภาพประมวลผลภาพผ่านเกณฑ์'}
    ]
  },
  display_panel:{
    id:'display_panel',
    legacyRole:'display',
    nameTh:'ผู้ผลิตแผงหน้าจอและโมดูลสัมผัส (Display & Touch Panel Supplier)',
    family:'display_supplier',
    outputs:['display'],
    actualBuyers:['brand','ems'],
    subjectRequirements:{electrical_basics:38,circuit_design:35,metrology:32,quality:35},
    keySpecialistSubject:'electrical_basics',
    requiredEquipment:['electronics_bench','test_rig'],
    utilityKw:3.0,
    entryCapitalSatang:240000000,
    nreCostSatang:1600000,
    licenseFeeSatang:2000000,
    workingCapitalDays:40,
    qualifiedMaterialGrade:'aluminosilicate_panel_substrate',
    bom:{glass_bottle:1,copper_coil:1},
    workMinutesPerUnit:30,
    minBatchSize:4,
    baseYield:0.86,
    entryAlternatives:['in_house_rnd','license_panel_module'],
    processStages:[
      {code:'glass_ito_backplane',nameTh:'แปรรูปซับสเตรตกระจก เคลือบวงจรทรานซิสเตอร์ และไดรเวอร์จอ',workShare:0.35,passiveHoldMinutes:30,cleanroomRequired:true,qualityGateTh:'อินเทอร์เฟซ RGB/MIPI และความละเอียดตรงขีดจำกัดชิป'},
      {code:'backlight_touch_lamination',nameTh:'ประกบชั้นกระจายแสง แผงสัมผัส และซีลขอบกันฝุ่น',workShare:0.35,passiveHoldMinutes:25,cleanroomRequired:true,qualityGateTh:'ไร้ฟองอากาศและจุดสว่างรั่ว'},
      {code:'pixel_power_optical_inspection',nameTh:'ตรวจสอบพิกเซลเสีย ความสว่าง และอัตราการกินไฟของหน้าจอ',workShare:0.3,passiveHoldMinutes:15,cleanroomRequired:false,qualityGateTh:'ผ่านเกณฑ์ Dead Pixel และการใช้พลังงาน'}
    ]
  },
  battery_pack:{
    id:'battery_pack',
    legacyRole:'battery',
    nameTh:'ผู้ผลิตเซลล์แบตเตอรี่และระบบจัดการพลังงาน (Battery & BMS Pack Supplier)',
    family:'power_supplier',
    outputs:['battery'],
    actualBuyers:['brand','ems'],
    subjectRequirements:{power_electronics:35,electrical_safety:38,quality:30},
    keySpecialistSubject:'power_electronics',
    requiredEquipment:['test_rig','electronics_bench'],
    utilityKw:3.5,
    entryCapitalSatang:180000000,
    nreCostSatang:1100000,
    licenseFeeSatang:1500000,
    workingCapitalDays:35,
    qualifiedMaterialGrade:'high_cycle_lipo_cell_grade',
    bom:{battery:1},
    fallbackBom:{cathode_electrolyte:1,foil_pouch:1,copper_coil:1},
    workMinutesPerUnit:30,
    minBatchSize:4,
    baseYield:0.91,
    entryAlternatives:['in_house_rnd','license_bms_pack'],
    processStages:[
      {code:'cell_matching_grading',nameTh:'คัดเกรดเซลล์เคมีลิเธียมและวัดความต้านทานภายใน',workShare:0.3,passiveHoldMinutes:20,cleanroomRequired:false,qualityGateTh:'ความจุ Wh และกำลังจ่ายไฟสูงสุด (Max Discharge W) เพียงพอ'},
      {code:'bms_protection_assembly',nameTh:'ประกอบวงจรป้องกันไฟเกิน/ความร้อน (BMS) และหุ้มฉนวนนิรภัย',workShare:0.35,passiveHoldMinutes:15,cleanroomRequired:false,qualityGateTh:'วงจรตัดไฟลัดวงจรและควบคุมอุณหภูมิทำงานแม่นยำ'},
      {code:'charge_aging_safety_test',nameTh:'ชาร์จกระตุ้นเซลล์ (Formation Aging) และทดสอบความปลอดภัยภายใต้โหลด',workShare:0.35,passiveHoldMinutes:45,cleanroomRequired:false,qualityGateTh:'ไม่มีอาการบวมหรือความร้อนสะสมเกินพิกัด'}
    ]
  },
  pcb_rf:{
    id:'pcb_rf',
    legacyRole:'materials',
    nameTh:'ผู้ผลิตแผงวงจรหลายชั้น HDI และโมดูลคลื่นวิทยุ RF (PCB / Interconnect / RF Supplier)',
    family:'interconnect_rf_supplier',
    outputs:['pcb_rf','enclosure'],
    actualBuyers:['brand','ems'],
    subjectRequirements:{electrical_basics:35,smt_process:35,circuit_design:32},
    keySpecialistSubject:'smt_process',
    requiredEquipment:['electronics_bench','test_rig'],
    utilityKw:2.0,
    entryCapitalSatang:140000000,
    nreCostSatang:900000,
    licenseFeeSatang:1200000,
    workingCapitalDays:30,
    qualifiedMaterialGrade:'hdi_rf_copper_laminate',
    bom:{polymer_resin:1,metal_sheet:1},
    preferredBom:{pcb:1,copper_coil:1},
    workMinutesPerUnit:25,
    minBatchSize:5,
    baseYield:0.92,
    entryAlternatives:['in_house_rnd','license_rf_board'],
    processStages:[
      {code:'hdi_stackup_impedance',nameTh:'ออกแบบเลเยอร์บอร์ด HDI และคำนวณอิมพีแดนซ์สายอากาศ RF',workShare:0.35,passiveHoldMinutes:0,cleanroomRequired:false,qualityGateTh:'ลดการสูญเสียสัญญาณและคลื่นรบกวนข้ามช่อง'},
      {code:'microvia_smt_shielding',nameTh:'เดินลายทองแดง วางคอนเน็กเตอร์ และครอบเกราะป้องกันคลื่นแม่เหล็กไฟฟ้า (EMI Shield)',workShare:0.35,passiveHoldMinutes:20,cleanroomRequired:false,qualityGateTh:'จุดบัดกรีและฝาครอบกันกวนสัญญาณสมบูรณ์'},
      {code:'rf_emi_power_integrity_test',nameTh:'ทดสอบความแรงสัญญาณวิทยุและเสถียรภาพไฟเลี้ยงบนบอร์ด',workShare:0.3,passiveHoldMinutes:15,cleanroomRequired:false,qualityGateTh:'ผ่านเกณฑ์ Signal Integrity และ EMI'}
    ]
  },
  enclosure:{
    id:'enclosure',
    legacyRole:'enclosure',
    nameTh:'ผู้ผลิตตัวถัง โครงสร้างระบายความร้อน และซีลกันฝุ่น (Mechanical & Thermal Enclosure Supplier)',
    family:'mechanical_thermal_supplier',
    outputs:['enclosure'],
    actualBuyers:['brand','ems'],
    subjectRequirements:{metal_machining:40,quality:30},
    keySpecialistSubject:'metal_machining',
    requiredEquipment:['press'],
    utilityKw:5.0,
    entryCapitalSatang:150000000,
    nreCostSatang:900000,
    licenseFeeSatang:2000000,
    workingCapitalDays:30,
    qualifiedMaterialGrade:'anodized_thermal_enclosure_grade',
    bom:{polymer_resin:1,metal_sheet:1},
    workMinutesPerUnit:30,
    minBatchSize:4,
    baseYield:0.93,
    entryAlternatives:['license_enclosure_design','in_house_cad_tooling'],
    processStages:[
      {code:'cad_mold_thermal_design',nameTh:'ออกแบบแม่พิมพ์ตัวถังและช่องทางกระจายความร้อน Rth',workShare:0.3,passiveHoldMinutes:0,cleanroomRequired:false,qualityGateTh:'ค่าความต้านทานความร้อน Rth เหมาะสมกับกำลังไฟชิป'},
      {code:'press_cnc_forming',nameTh:'อัดขึ้นรูปพอลิเมอร์/แผ่นโลหะและกัดร่องยึดบอร์ด',workShare:0.45,passiveHoldMinutes:15,cleanroomRequired:false,qualityGateTh:'ความแม่นยำมิติและจุดยึดโมดูล'},
      {code:'surface_finish_drop_qc',nameTh:'เคลือบผิว ติดแผ่นนำความร้อน และตรวจความทนทานการตกกระแทก',workShare:0.25,passiveHoldMinutes:10,cleanroomRequired:false,qualityGateTh:'ผ่านด่านตรวจมิติและซีลตัวเรือน'}
    ]
  },
  os_platform:{
    id:'os_platform',
    legacyRole:'brand',
    nameTh:'ผู้พัฒนาระบบปฏิบัติการ เฟิร์มแวร์ ไดรเวอร์ BSP และแพลตฟอร์ม (OS / Firmware / Platform Vendor)',
    family:'software_platform',
    outputs:['os'],
    actualBuyers:['brand'],
    subjectRequirements:{software:40,programming:40,embedded_firmware:35},
    keySpecialistSubject:'software',
    requiredEquipment:['developer_pc'],
    utilityKw:0.4,
    entryCapitalSatang:120000000,
    nreCostSatang:1000000,
    licenseFeeSatang:1200,
    workingCapitalDays:30,
    qualifiedMaterialGrade:'hdi_rf_copper_laminate',
    bom:{polymer_resin:1,copper_coil:1},
    workMinutesPerUnit:20,
    minBatchSize:1,
    baseYield:0.98,
    entryAlternatives:['in_house_os_rnd','license_commercial_os'],
    processStages:[
      {code:'kernel_bsp_driver_port',nameTh:'พัฒนาเคอร์เนลและชุดไดรเวอร์ BSP รองรับชุดคำสั่งชิปและชิ้นส่วน',workShare:0.4,passiveHoldMinutes:0,cleanroomRequired:false,qualityGateTh:'ความครอบคลุมไดรเวอร์ >= 95% และรองรับ ISA'},
      {code:'power_scheduler_ui_sdk',nameTh:'ปรับจูนตัวจัดการพลังงานพื้นหลังและชุดเครื่องมือนักพัฒนาแอป (SDK)',workShare:0.35,passiveHoldMinutes:0,cleanroomRequired:false,qualityGateTh:'ควบคุม OS Overhead และการใช้แรมขั้นต่ำ'},
      {code:'hardware_in_loop_security_qa',nameTh:'ทดสอบความเสถียรบนบอร์ดจริงและแพตช์ความปลอดภัย',workShare:0.25,passiveHoldMinutes:30,cleanroomRequired:false,qualityGateTh:'ผ่านการทดสอบความเข้ากันได้และพร้อมปล่อยไลเซนส์'}
    ]
  },
  brand:{
    id:'brand',
    legacyRole:'brand',
    nameTh:'แบรนด์โทรศัพท์ ผู้พัฒนาเครื่องต้นแบบ และผู้ประกอบขั้นสุดท้าย (Handset Brand / ODM / EMS)',
    family:'handset_oem_odm',
    outputs:['phone'],
    actualBuyers:['household','carrier','distributor'],
    subjectRequirements:{electrical_basics:40,software:40,quality:30},
    keySpecialistSubject:'electrical_basics',
    requiredEquipment:['electronics_bench','test_rig'],
    utilityKw:2.5,
    entryCapitalSatang:500000000,
    nreCostSatang:2000000,
    licenseFeeSatang:1200,
    workingCapitalDays:60,
    qualifiedMaterialGrade:'hdi_rf_copper_laminate',
    bom:{pcb:1,copper_coil:1},
    workMinutesPerUnit:20,
    minBatchSize:2,
    baseYield:0.94,
    entryAlternatives:['in_house_brand_rnd','contract_ems_assembly','acquire_existing_brand'],
    processStages:[
      {code:'system_architecture_evt',nameTh:'กำหนดสถาปัตยกรรมเครื่อง คัดเลือกชิป/ชิ้นส่วน และสร้างต้นแบบ EVT',workShare:0.35,passiveHoldMinutes:0,cleanroomRequired:false,qualityGateTh:'ตรวจความเข้ากันได้ของชิป แรม จอ แบต ตัวถัง และ OS'},
      {code:'pcba_box_build_assembly',nameTh:'ประกอบชิ้นส่วนจริงลงแผงวงจรและตัวถัง (Box-Build Assembly)',workShare:0.35,passiveHoldMinutes:30,cleanroomRequired:false,qualityGateTh:'ใช้ชิ้นส่วนจริงครบทุกชิ้นจากคลังล็อตที่ถือครอง'},
      {code:'pilot_validation_certification',nameTh:'ผลิตนำร่อง ทดสอบความร้อน/แบต/คลื่นวิทยุ 1,200 นาที ก่อนวางตลาด',workShare:0.3,passiveHoldMinutes:120,cleanroomRequired:false,qualityGateTh:'มีเครื่องนำร่อง >= 2 เครื่อง และผ่านเวลาทดสอบ 7 วัน'}
    ]
  }
});

const ROLE_ALIASES=Object.freeze({
  chip:'fabless_soc',
  display:'display_panel',
  battery:'battery_pack',
  materials:'pcb_rf',
  ems:'osat_packaging',
  enclosure:'enclosure',
  brand:'brand',
  fabless_soc:'fabless_soc',
  wafer_foundry:'wafer_foundry',
  osat_packaging:'osat_packaging',
  dram_memory:'dram_memory',
  nand_storage:'nand_storage',
  camera_module:'camera_module',
  display_panel:'display_panel',
  battery_pack:'battery_pack',
  pcb_rf:'pcb_rf',
  os_platform:'os_platform'
});

function roleContract(roleId){
  const canonical=ROLE_ALIASES[roleId]||roleId;
  return ROLE_CONTRACTS[canonical]||ROLE_CONTRACTS.brand;
}

function synthesizeChip(seed,capability=40,options={}){
 options=options||{};const r=rng(seed),c=num(capability,40,0,100),level=Math.floor(num(options.level,0,0,6)),q=.85+r()*.3;
 const focus=['balanced','performance','low_power','budget_yield','ai_isp'].includes(options.focus)?options.focus:(['balanced','performance','low_power','ai_isp'][Math.floor(r()*4)]||'balanced');
 const nodeNm=num(options.nodeNm,Math.max(22,130/Math.pow(1.35,level)),10,350),cores=level?Math.min(8,1+level+Math.floor(r()*2)):1;
 const clockGhz=round((.18+c*.005+level*.22)*q),dieAreaMm2=round((12+cores*8+level*7)*(nodeNm/130)**1.5*(1.15-c*.003)*(.9+r()*.2));
 const loadW=round((.22+cores*clockGhz*.5)*(nodeNm/130)**.65*(1.15-c*.003));
 const ipcIndex=round(.65+c/120),gpuGflops=level?round(cores*clockGhz*(8+c/20)):0;
 const latencyNs=round(Math.max(12,95-level*11-c*.22+(focus==='low_power'?4:focus==='performance'?-4:0)));
 const npuTops=level>=2?round((level-1)*(.6+c/80)*(focus==='ai_isp'?1.25:1)):0;
 const ispMpLimit=level?Math.round(4*2**Math.min(4,level)*(focus==='ai_isp'?1.25:1)):2;
 const maskCostSatang=money(Math.round(1200000*(130/Math.max(14,nodeNm))**1.15));
 return{id:'chip-'+String(seed).replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,48)+'-'+level+'-'+Math.floor(r()*1e6),isa:'arm32',cores,clockGhz,nodeNm:round(nodeNm),dieAreaMm2,ipcIndex,gpuGflops,memoryType:level?'LPDDR':'SDRAM',maxRamMB:level?128*2**level:32,maxPixels:level?320*480*2**(level-1):240*320,radioGeneration:Math.min(5,2+Math.floor(level/2)),idleW:round(loadW*.055),loadW,peakW:round(loadW*1.35),level,focus,latencyNs,npuTops,ispMpLimit,maskCostSatang};
}

function parts(seed,level=0,options={}){
 options=options||{};const r=rng(seed),l=Math.floor(num(level,0,0,6)),cap=num(options.capability,45,0,100),capFactor=.92+cap/500;
 const width=l?240+80*l:128+Math.floor(r()*3)*16,height=l?320+160*l:160+Math.floor(r()*3)*16;
 const camMp=l?2*2**l:.3,sensorArea=round((2+l*2)*capFactor),fNumber=round(Math.max(1.6,2.8-l*.18-(cap-45)*.002));
 const lowLightScore=round(clamp((sensorArea/Math.max(1,camMp))*18+(3.2-fNumber)*22+l*8,10,98));
 const ramCap=l?64*2**l:8+Math.floor(r()*3)*8,ramBw=round((l?.6+l*.8:.08)*(.9+r()*.2));
 const ramLatencyNs=round(Math.max(14,75-l*8-(cap-45)*.15)),ramPowerMw=round(Math.max(25,(l?85+l*30:40)*(1.08-cap*.0015)));
 const storageRead=round((l?30+l*25:8)*(.85+r()*.3)),storageWrite=round(storageRead*.68),storageCap=l?512*2**l:16+Math.floor(r()*4)*8;
 const enduranceCycles=Math.round((l?1500+l*600:1000)*capFactor);
 const displayWatts=round((.12+l*.25)*(.85+r()*.3)),brightnessNits=Math.round((l?320+l*75:180)*capFactor),refreshHz=l>=3?90:60;
 const battWh=round((3.5+l*2)*(.85+r()*.3)),maxDischargeW=round(3+l*2+r()),chargeW=round(Math.min(maxDischargeW*1.1,2.5+l*3.5)),cycleLife=Math.round((350+l*75)*capFactor);
 const rth=round((l?3.3:5)*(.9+r()*.2)),dropResistanceScore=round(clamp((l?68:74)+(cap-45)*.2,35,96));
 const osOverhead=l?round(.16/(1+l*.2)):.03,securityScore=round(clamp(55+l*7+(cap-45)*.25,30,98));
 return{
   camera:{megapixels:camMp,sensorAreaMm2:2+l*2,processingQuality:round(.4+l*.1),fNumber,lowLightScore,hasOis:l>=2?1:0},
   ram:{type:l?'LPDDR':'SDRAM',capacityMB:ramCap,bandwidthGBps:ramBw,latencyNs:ramLatencyNs,powerMw:ramPowerMw},
   storage:{readMBps:storageRead,writeMBps:storageWrite,capacityMB:storageCap,interface:l?'eMMC':'SPI',enduranceCycles},
   display:{pixels:width*height,width,height,watts:displayWatts,interface:l?'MIPI':'RGB',brightnessNits,refreshHz},
   battery:{wh:battWh,maxDischargeW,chargeW,cycleLife,protectionScore:round(clamp(65+l*5+(cap-45)*.2,40,99))},
   enclosure:{material:l?'aluminium_graphite':'polymer',rth,dropResistanceScore,ipRatingCode:l>=2?67:l>=1?54:50},
   pcb_rf:{layers:l?4+l*2:2,signalIntegrity:round(clamp(.78+l*.035+(cap-45)*.0015,.5,0.99)),emiShieldingScore:round(clamp(62+l*6,40,98)),radioGeneration:Math.min(5,2+Math.floor(l/2)),maxPowerDeliveryW:round(maxDischargeW*1.25+2)},
   os:{id:l?'open_mobile':'embedded_rtos',isa:'arm32',minRamMB:l?64:4,installableApps:!!l,apiLevel:l,version:1+l,driverCoverage:1,overhead:osOverhead,securityScore,supportMonths:12+l*6}
 };
}

function synthesizeComponent(seed,kind,capability=45,level=0,options={}){
  const base=parts(seed+':'+kind,level,{capability,...options});
  return base[kind]||base.enclosure;
}

function isCompatiblePart(chip,kind,spec){
  if(!chip||!spec||typeof spec!=='object')return false;
  const cLevel=num(chip.level,0,0,6);
  if(kind==='ram')return spec.type===chip.memoryType&&num(spec.capacityMB)>0&&num(spec.capacityMB)<=num(chip.maxRamMB);
  if(kind==='storage')return spec.interface===(cLevel>0?'eMMC':'SPI')&&num(spec.capacityMB)>0;
  if(kind==='display')return spec.interface===(cLevel>0?'MIPI':'RGB')&&num(spec.pixels)>0&&num(spec.pixels)<=num(chip.maxPixels)&&spec.pixels===spec.width*spec.height;
  if(kind==='battery')return num(spec.wh)>0&&num(spec.maxDischargeW)>=num(chip.peakW,1)*1.05;
  if(kind==='camera')return num(spec.megapixels)>0&&num(spec.sensorAreaMm2)>0;
  if(kind==='enclosure')return num(spec.rth)>0;
  if(kind==='pcb_rf')return num(spec.signalIntegrity,0.8)>=0.55&&num(spec.maxPowerDeliveryW,10)>=num(chip.peakW,1);
  if(kind==='os')return spec.isa===chip.isa&&num(spec.driverCoverage,0)>=0.95&&num(spec.minRamMB,4)<=num(chip.maxRamMB,32);
  return true;
}

function evaluate(chip,p,options={}){
 chip=chip||{};p=p||{};options=options||{};const reasonsTh=[],bad=s=>reasonsTh.push(s),ram=p.ram||{},storage=p.storage||{},display=p.display||{},battery=p.battery||{},enclosure=p.enclosure||{},os=p.os||{},pcbRf=p.pcb_rf||null;
 const required=[chip.cores,chip.clockGhz,chip.nodeNm,chip.dieAreaMm2,chip.maxRamMB,chip.maxPixels,ram.capacityMB,ram.bandwidthGBps,storage.capacityMB,display.pixels,display.width,display.height,battery.wh,battery.maxDischargeW,enclosure.rth];
 if(required.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<=0))bad('ข้อมูลชิ้นส่วนหรือหน่วยไม่ถูกต้อง');
 if([chip.idleW,chip.loadW,chip.peakW,display.watts,os.overhead,os.minRamMB,os.driverCoverage].some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0))bad('ข้อมูลพลังงานหรือระบบปฏิบัติการไม่ถูกต้อง');
 if(!chip.isa||!os.id||chip.isa!==os.isa)bad('ระบบปฏิบัติการไม่รองรับชุดคำสั่งของชิป');
 if(!chip.memoryType||ram.type!==chip.memoryType)bad('ชนิดแรมไม่ตรงกับตัวควบคุมหน่วยความจำ');
 if(num(ram.capacityMB)>num(chip.maxRamMB))bad('ความจุแรมเกินขีดจำกัดของชิป');
 if(num(ram.capacityMB)<num(os.minRamMB))bad('แรมไม่พอสำหรับระบบปฏิบัติการ');
 if(num(display.pixels)>num(chip.maxPixels)||display.pixels!==display.width*display.height)bad('ความละเอียดจอไม่ตรงกับขีดจำกัดของชิป');
 if(num(os.driverCoverage,0,0,1)<.95)bad('ไดรเวอร์ชิ้นส่วนยังไม่ครบ');

 if(storage.interface!==(num(chip.level)>0?'eMMC':'SPI')||display.interface!==(num(chip.level)>0?'MIPI':'RGB'))bad('อินเทอร์เฟซจอหรือหน่วยเก็บข้อมูลไม่รองรับ');
 const idle=num(chip.idleW),load=Math.max(idle,num(chip.loadW)),peak=Math.max(load,num(chip.peakW)),screen=num(display.watts),overhead=num(os.overhead,0,0,1),aux=.035+num(ram.capacityMB)*.00007;
 const duties={standby:[.01,.01],call:[.32,.12],web:[.55,.8],game:[.95,1],mixed:[.24,.35]},d=Object.hasOwn(duties,options.workload)?duties[options.workload]:duties.mixed;
 const averagePowerW=round(Math.max(.0001,(idle+(load-idle)*d[0]+screen*d[1]+aux)*(1+overhead))),peakPowerW=round((peak+screen+aux)*(1+overhead));
 if(num(battery.maxDischargeW)<peakPowerW)bad('แบตเตอรี่จ่ายกำลังสูงสุดไม่พอ');
 if(pcbRf&&typeof pcbRf==='object'){
   if(typeof pcbRf.signalIntegrity==='number'&& (!Number.isFinite(pcbRf.signalIntegrity)||pcbRf.signalIntegrity<.5))bad('ความสมบูรณ์สัญญาณแผงวงจรและคลื่นวิทยุต่ำกว่าเกณฑ์');
   if(typeof pcbRf.maxPowerDeliveryW==='number'&& (!Number.isFinite(pcbRf.maxPowerDeliveryW)||pcbRf.maxPowerDeliveryW<peakPowerW))bad('แผงวงจรจ่ายกำลังไฟสูงสุดไม่เพียงพอ');
 }
 const ambient=num(options.ambientC,30,-50,80),rth=num(enclosure.rth,5,.01,100),surfaceC=round(ambient+peakPowerW*rth),budget=Math.max(0,(43-ambient)/rth),sustainedFactor=round(Math.min(1,(budget/Math.max(.0001,peakPowerW))**.8));
 const compatible=!reasonsTh.length,compute=num(chip.cores)*num(chip.clockGhz)*num(chip.ipcIndex,1,.1,4)*sustainedFactor/(1+overhead),memory=Math.min(1,num(ram.bandwidthGBps)/.6),score=v=>compatible?round(clamp(v,0,100)):0;
 const taskScores={call:score(65+compute*25),web:score((os.installableApps?compute*40*memory:compute*8)*Math.min(1,Math.max(0,ram.capacityMB-os.minRamMB)/64)*Math.min(1,(storage.readMBps||8)/30)),game:score((os.installableApps?compute*25*memory:compute*4)*Math.min(1,Math.max(0,ram.capacityMB-os.minRamMB)/128)*Math.min(1,153600/Math.max(1,display.pixels)))};
 const silicon=wafer({dieAreaMm2:num(chip.dieAreaMm2,25,.01,1e6)}).unitCostSatang;
 const cameraQuality=round((p.camera?.megapixels||0)*(.5+(p.camera?.sensorAreaMm2||0)/10)*(p.camera?.processingQuality||.4));
 const photoLowLightScore=score(cameraQuality*12+num(p.camera?.lowLightScore,35,0,100)*.55);
 const displayQualityScore=score(num(display.brightnessNits,220,50,2000)/12+num(display.refreshHz,60,30,240)/4);
 const bottleneckSummaryTh=!compatible?reasonsTh[0]:sustainedFactor<.75?'ติดคอขวดความร้อนสะสมของตัวถังและกำลังไฟสูงสุด':memory<.7?'ติดคอขวดแบนด์วิดท์หน่วยความจำ RAM':(storage.readMBps||8)<25?'ติดคอขวดความเร็วอ่านข้อมูลหน่วยเก็บข้อมูล':!os.installableApps?'จำกัดด้วยเฟิร์มแวร์ฟีเจอร์โฟน (ไม่รองรับแอปภายนอก)':'สมดุลฮาร์ดแวร์และระบบปฏิบัติการทำงานเต็มประสิทธิภาพ';
 return{compatible,reasonsTh,batteryHours:round(num(battery.wh)*.92/averagePowerW),averagePowerW,peakPowerW,surfaceC,sustainedFactor,taskScores,cpuThroughput:round(compute),ramCapacityMB:ram.capacityMB,storageCapacityMB:storage.capacityMB,cameraQuality,photoLowLightScore,displayQualityScore,osOverhead:overhead,bottleneckSummaryTh,costEstimateSatang:money(silicon+num(ram.capacityMB)*35+num(storage.capacityMB)*3+num(display.pixels)*.08+num(battery.wh)*1800+(enclosure.material==='polymer'?4500:9500)+12000)};
}

function wafer(options={}){
 options=options||{};const diameterMm=num(options.diameterMm,200,0,1000),area=num(options.dieAreaMm2,25,.0001,1e6),defects=num(options.defectsPerCm2,.1,0,1e6),packYield=num(options.packYield,.98,0,1),bin=num(options.binAFraction,.8,0,1);
 const grossDies=Math.floor(clamp(Math.PI*(diameterMm/2)**2/area-Math.PI*diameterMm/Math.sqrt(2*area),0,1e9)),x=area/100*defects,dieYield=x===0?1:(-Math.expm1(-x)/x)**2,goodDies=Math.round(grossDies*dieYield),packagedGood=Math.floor(goodDies*packYield),aBin=Math.floor(packagedGood*bin),bBin=packagedGood-aBin,scrap=grossDies-packagedGood;
 // All wafer and attempted packaging spend is borne by sellable dies, including failed packages.
 const total=num(options.waferCostSatang,3000000,0,1e12)+goodDies*num(options.packCostSatang,1200,0,1e12)+packagedGood*num(options.royaltySatang,400,0,1e12);
 return{grossDies,dieYield,goodDies,packagedGood,aBin,bBin,scrap,unitCostSatang:packagedGood?money(Math.ceil(total/packagedGood)):0};
}

function evaluateRoleFeasibility(snapshotOrContext,roleId){
  const contract=roleContract(roleId);
  const ctx=snapshotOrContext||{};
  const subjects=ctx.subjects||{};
  const machines=ctx.machines||{};
  const cashSatang=num(ctx.cashSatang,0,0,1e15);
  const wageReserveSatang=num(ctx.wageReserveSatang,0,0,1e15);
  const riskTaking=num(ctx.riskTaking,50,0,100);
  const prudence=num(ctx.prudence,50,0,100);
  const brownout=Boolean(ctx.brownoutActive);
  const missingSubjects=[];
  let totalSubjectMargin=0;
  for(const [subj,reqLv]of Object.entries(contract.subjectRequirements||{})){
    const actual=num(subjects[subj],0,0,100);
    if(actual<reqLv)missingSubjects.push({subjectId:subj,required:reqLv,actual:Math.round(actual)});
    else totalSubjectMargin+=actual-reqLv;
  }
  const missingEquipment=[];
  const brokenEquipment=[];
  for(const eqId of contract.requiredEquipment||[]){
    const m=machines[eqId];
    if(!m)missingEquipment.push(eqId);
    else if(m.status!=='ready'||num(m.condition,100)<25)brokenEquipment.push(eqId);
  }
  const requiredCash=wageReserveSatang+contract.entryCapitalSatang;
  const missingCapitalSatang=Math.max(0,requiredCash-cashSatang);
  const utilityBlocked=brownout&&contract.utilityKw>=2.0;
  const feasible=missingSubjects.length===0&&missingEquipment.length===0&&brokenEquipment.length===0&&missingCapitalSatang===0&&!utilityBlocked;
  const safetyBuffer=wageReserveSatang*(1.25+prudence/100)+contract.entryCapitalSatang*(1.1+Math.max(0,prudence-55)/100);
  const feasibleButDeclined=feasible&&(riskTaking<40||(prudence>78&&cashSatang<safetyBuffer));
  const strategicScore=round((feasible?100:0)+totalSubjectMargin*1.4+(riskTaking-prudence*.45)*.6+Math.min(40,(cashSatang-requiredCash)/Math.max(1,contract.entryCapitalSatang)*15));
  let reasonTh='พร้อมเข้าดำเนินธุรกิจตามความเชี่ยวชาญ เครื่องจักร และเงินทุนจริง';
  if(!feasible){
    const partsTh=[];
    if(missingSubjects.length)partsTh.push('ขาดผู้เชี่ยวชาญวิชา '+missingSubjects.map(x=>`${x.subjectId}(${x.actual}/${x.required})`).join(', '));
    if(missingEquipment.length)partsTh.push('ยังไม่มีเครื่องจักร '+missingEquipment.join(', '));
    if(brokenEquipment.length)partsTh.push('เครื่องจักรชำรุดรอซ่อม '+brokenEquipment.join(', '));
    if(missingCapitalSatang>0)partsTh.push(`ต้องการทุนและสำรองเพิ่มอีก ${Math.ceil(missingCapitalSatang/100).toLocaleString()} บาท`);
    if(utilityBlocked)partsTh.push('ระบบไฟฟ้าในนิคมกำลังไฟตก');
    reasonTh=partsTh.join(' • ');
  }else if(feasibleButDeclined){
    reasonTh='ผ่านเกณฑ์ความรู้ เครื่องจักร และทุนขั้นต้นแล้ว แต่ผู้บริหารสายรอบคอบเลือกสำรองเงินสดและโฟกัสงานหลักก่อน';
  }
  return {
    roleId:contract.id,
    nameTh:contract.nameTh,
    outputs:contract.outputs,
    entryCapitalSatang:contract.entryCapitalSatang,
    feasible,
    feasibleButDeclined,
    missingSubjects,
    missingEquipment,
    brokenEquipment,
    missingCapitalSatang,
    utilityBlocked,
    strategicScore,
    reasonTh
  };
}

return Object.freeze({
  MATERIAL_GRADES,
  ROLE_CONTRACTS,
  ROLE_ALIASES,
  roleContract,
  synthesizeChip,
  synthesizeComponent,
  parts,
  isCompatiblePart,
  evaluate,
  wafer,
  evaluateRoleFeasibility
});
});
