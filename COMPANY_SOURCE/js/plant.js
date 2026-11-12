(function(root,factory){
  const v=factory(typeof module==='object'&&module.exports?require('./data.js'):root.CompanyData);
  if(typeof module==='object'&&module.exports)module.exports=v;else root.CompanyPlant=v;
})(typeof globalThis!=='undefined'?globalThis:this,function(D){
'use strict';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),round=v=>Math.round(v*100)/100;

const SPECS={
  hand_tools:{nameTh:'ชุดเครื่องมือช่างและโต๊ะเตรียมงาน',cost:350000,capacity:4,kw:.1,subject:'maintenance',level:20,scale:'small',compatibleParts:['metal_sheet','wire_harness'],faultModes:[{code:'tool_fixture_loosening',nameTh:'แคลมป์จับชิ้นงานและประแจวัดแรงบิดคลาดเคลื่อน',subsystem:'mechanical',part:'metal_sheet'}]},
  electronics_bench:{nameTh:'สถานีบัดกรีและเครื่องวัดวงจร',cost:1200000,capacity:3,kw:.4,subject:'electrical_basics',level:25,scale:'medium',compatibleParts:['wire_harness','pcb','sensor'],faultModes:[{code:'solder_heater_drift',nameTh:'หัวแร้งควบคุมอุณหภูมิและระบบกราวด์ ESD เสื่อม',subsystem:'electrical',part:'wire_harness'},{code:'oscilloscope_probe_fault',nameTh:'ชุดสายวัดสัญญาณและหัววัดแรงดันชำรุด',subsystem:'calibration',part:'wire_harness'}]},
  test_rig:{nameTh:'ชุดทดสอบไฟฟ้าและโหลดจำลอง',cost:900000,capacity:3,kw:.6,subject:'electrical_basics',level:25,scale:'medium',compatibleParts:['wire_harness','pcb','power_inverter_ic'],faultModes:[{code:'load_bank_relay_wear',nameTh:'รีเลย์สวิตชิ่งโหลดจำลองเกิดอาร์กสะสม',subsystem:'electrical',part:'wire_harness'}]},
  mixer:{nameTh:'เครื่องผสมอาหาร',cost:850000,capacity:4,kw:1.5,subject:'maintenance',level:25,scale:'medium',compatibleParts:['polymer_resin','metal_sheet'],faultModes:[{code:'planetary_gear_seal_wear',nameTh:'ซีลกันรั่วหัวตีผสมและเฟืองทดรอบสึกหรอ',subsystem:'mechanical',part:'polymer_resin'}]},
  oven:{nameTh:'เตาอบควบคุมอุณหภูมิ',cost:1500000,capacity:6,kw:4,subject:'maintenance',level:30,scale:'medium',compatibleParts:['polymer_resin','wire_harness','metal_sheet'],faultModes:[{code:'oven_door_gasket_leak',nameTh:'ขอบยางซิลิโคนเตาอบเสื่อมและเทอร์โมคัปเปิลเพี้ยน',subsystem:'thermal',part:'polymer_resin'}]},
  cooker:{nameTh:'หม้อต้มและเครื่องกวนให้ความร้อน',cost:1000000,capacity:5,kw:3,subject:'maintenance',level:25,scale:'medium',compatibleParts:['polymer_resin','metal_sheet'],faultModes:[{code:'jacket_valve_scaling',nameTh:'ตะกรันเกาะวาล์วไอน้ำและซีลใบพัดกวนสึก',subsystem:'thermal',part:'polymer_resin'}]},
  pasteurizer:{nameTh:'เครื่องพาสเจอไรซ์',cost:2600000,capacity:5,kw:5,subject:'maintenance',level:35,scale:'large',compatibleParts:['polymer_resin','sensor'],faultModes:[{code:'plate_heat_exchanger_fouling',nameTh:'ปะเก็นแผ่นแลกเปลี่ยนความร้อน HTST เสื่อมสภาพ',subsystem:'thermal',part:'polymer_resin'}]},
  fermenter:{nameTh:'ถังหมักและตู้บ่มควบคุมสภาวะ',cost:1800000,capacity:8,kw:1,subject:'maintenance',level:30,scale:'medium',compatibleParts:['polymer_resin','sensor'],faultModes:[{code:'fermenter_ph_seal_drift',nameTh:'ซีลปลอดเชื้อและหัววัดอุณหภูมิ/pH ถังหมักคลาดเคลื่อน',subsystem:'cleanliness',part:'polymer_resin'}]},
  press:{nameTh:'แท่นอัดและเครื่องขึ้นรูปโลหะ',cost:2800000,capacity:3,kw:5,subject:'metal_machining',level:35,scale:'large',compatibleParts:['metal_sheet','structural_steel_plate'],faultModes:[{code:'hydraulic_ram_die_wear',nameTh:'บูชไกด์แม่พิมพ์และแผ่นรองรับแรงอัดสึกหรอ',subsystem:'mechanical',part:'metal_sheet'}]},
  welder:{nameTh:'เครื่องเชื่อมและฟิกซ์เจอร์ประกอบ',cost:1400000,capacity:3,kw:3,subject:'maintenance',level:30,scale:'medium',compatibleParts:['metal_sheet','wire_harness','copper_coil'],faultModes:[{code:'welding_torch_nozzle_burn',nameTh:'หัวจ่ายลวดเชื่อมและฟิกซ์เจอร์จับยึดบิดตัวจากความร้อน',subsystem:'thermal',part:'metal_sheet'}]},
  autoclave:{nameTh:'เครื่องนึ่งฆ่าเชื้อและห้องสะอาด',cost:3600000,capacity:6,kw:6,subject:'maintenance',level:40,scale:'large',compatibleParts:['polymer_resin','sensor'],faultModes:[{code:'autoclave_chamber_seal',nameTh:'ซีลประตูห้องนึ่งแรงดันสูงและกรองไอน้ำเสื่อม',subsystem:'cleanliness',part:'polymer_resin'}]},
  clean_fill:{nameTh:'เครื่องกรองและบรรจุปลอดเชื้อ',cost:2400000,capacity:4,kw:2,subject:'maintenance',level:35,scale:'large',compatibleParts:['polymer_resin','foil_pouch'],faultModes:[{code:'hepa_membrane_clog',nameTh:'ท่อปั๊มรีดท่อปลอดเชื้อและเมมเบรนกรองละเอียดตัน',subsystem:'cleanliness',part:'polymer_resin'}]},
  cold_room:{nameTh:'ห้องเย็นและระบบตรวจอุณหภูมิ',cost:2000000,capacity:12,kw:2,subject:'maintenance',level:30,scale:'large',compatibleParts:['polymer_resin','copper_coil'],faultModes:[{code:'evaporator_seal_frost',nameTh:'ซีลฉนวนห้องเย็นรั่วและคอยล์เย็นจับน้ำแข็งสะสม',subsystem:'thermal',part:'polymer_resin'}]},
  developer_pc:{nameTh:'เครื่องพัฒนาซอฟต์แวร์และระบบสำรองข้อมูล',cost:180000,capacity:4,kw:.2,subject:'software',level:25,scale:'small',compatibleParts:['wire_harness','pcb'],faultModes:[{code:'psu_storage_degraded',nameTh:'ชุดจ่ายไฟเวิร์กสเตชันและสายเชื่อมต่อเซิร์ฟเวอร์ขัดข้อง',subsystem:'electrical',part:'wire_harness'}]},
  diagnostic_kit:{nameTh:'เครื่องมือวินิจฉัยและสอบเทียบภาคสนาม',cost:700000,capacity:3,kw:.2,subject:'metrology',level:25,scale:'small',compatibleParts:['wire_harness','sensor'],faultModes:[{code:'reference_probe_drift',nameTh:'หัววัดมาตรฐานอ้างอิงคลาดเคลื่อนเกินเกณฑ์สอบเทียบ',subsystem:'calibration',part:'wire_harness'}]},
  warehouse_tools:{nameTh:'รถเข็น เครื่องชั่งและอุปกรณ์จัดคลัง',cost:450000,capacity:4,kw:.1,subject:'logistics',level:25,scale:'small',compatibleParts:['metal_sheet','wire_harness'],faultModes:[{code:'pallet_jack_wheel_wear',nameTh:'ล้อรถลากพาเลทและโหลดเซลล์แท่นชั่งสึกหรอ',subsystem:'mechanical',part:'metal_sheet'}]},
  grain_mill:{nameTh:'โรงสีและเครื่องโม่ธัญพืช',cost:1800000,capacity:4,kw:3,subject:'maintenance',level:30,scale:'medium',compatibleParts:['metal_sheet','polymer_resin'],faultModes:[{code:'mill_roller_screen_wear',nameTh:'ลูกหินกะเทาะเปลือกและตะแกรงร่อนแป้งสึก',subsystem:'mechanical',part:'metal_sheet'}]},
  chemical_reactor:{nameTh:'ถังปฏิกรณ์และระบบกลั่นควบคุมสารเคมี',cost:6500000,capacity:3,kw:8,subject:'maintenance',level:40,scale:'heavy',compatibleParts:['polymer_resin','metal_sheet'],faultModes:[{code:'reactor_lining_corrosion',nameTh:'ปะเก็นทนกรด-ด่างและวาล์วระบายแรงดันถังปฏิกรณ์กัดกร่อน',subsystem:'cleanliness',part:'polymer_resin'}]},
  semiconductor_fab:{nameTh:'สายกระบวนการเวเฟอร์และห้องสะอาดเฉพาะทาง',cost:20000000000,capacity:4,kw:20,subject:'maintenance',level:45,scale:'mega',compatibleParts:['wire_harness','optical_lens','microchip'],faultModes:[{code:'wafer_stepper_stage_drift',nameTh:'ชุดควบคุมสเตจลิโธกราฟีและระบบกรองฝุ่น ULPA คลาดเคลื่อน',subsystem:'calibration',part:'wire_harness'}]},
  smelter:{nameTh:'เตาถลุงและเครื่องรีดวัสดุ',cost:4500000,capacity:3,kw:10,subject:'metal_machining',level:40,scale:'heavy',compatibleParts:['metal_sheet','structural_steel_plate'],faultModes:[{code:'smelter_crucible_wear',nameTh:'ผนังเตาหลอมและลูกกลิ้งรีดโลหะสึกจากความร้อนสูง',subsystem:'thermal',part:'metal_sheet'}]}
};

function stage(nameTh,equipment,share,hold=0,temp=null,meta={}){
  return {
    nameTh,
    equipment,
    share,
    holdMinutes:hold,
    temperatureC:temp,
    opCode:meta.opCode||'process_op',
    subject:meta.subject||SPECS[equipment]?.subject||'maintenance',
    minSubjectLevel:meta.minSubjectLevel??0,
    safetyCritical:Boolean(meta.safetyCritical),
    batchShared:meta.batchShared!==undefined?Boolean(meta.batchShared):(hold>0||temp!==null),
    qualityCheckpoint:Boolean(meta.qualityCheckpoint),
    intermediateOut:meta.intermediateOut||nameTh
  };
}

function route(p){
  const id=p.id;
  if(/croissant|bakery|biscuit/.test(id)){
    const isBiscuit=/biscuit/.test(id);
    return [
      stage('ชั่งและนวดแป้ง','mixer',.3,0,null,{opCode:'dough_mixing',subject:'baking_process',minSubjectLevel:20,intermediateOut:'mixed_dough'}),
      stage(isBiscuit?'รีดแผ่นและตัดขึ้นรูปบิสกิต':'พักแป้งและขึ้นรูป','hand_tools',.3,isBiscuit?0:45,null,{opCode:isBiscuit?'rotary_molding':'dough_proofing',subject:'baking_process',minSubjectLevel:20,batchShared:true,intermediateOut:'shaped_pastry'}),
      stage('อบตามอุณหภูมิและพักเย็น','oven',.4,25,180,{opCode:'tunnel_baking',subject:'food_safety',minSubjectLevel:25,batchShared:true,qualityCheckpoint:true,intermediateOut:'baked_lot'})
    ];
  }
  if(/yogurt|probiotic|synbiotic/.test(id)){
    return [
      stage('ผสมและเตรียมอาหารเลี้ยงเชื้อ','mixer',.25,0,null,{opCode:'media_blending',subject:'dairy_processing',minSubjectLevel:25,intermediateOut:'blended_base'}),
      stage('พาสเจอไรซ์และลดอุณหภูมิ','pasteurizer',.25,20,72,{opCode:'htst_pasteurization',subject:'dairy_processing',minSubjectLevel:30,batchShared:true,intermediateOut:'pasteurized_base'}),
      stage('เพาะเชื้อและบ่ม','fermenter',.3,180,38,{opCode:'culture_fermentation',subject:'fermentation',minSubjectLevel:30,batchShared:true,intermediateOut:'fermented_curd'}),
      stage('บรรจุปลอดเชื้อและแช่เย็นควบคุมอุณหภูมิ','cold_room',.2,15,4,{opCode:'cold_fill_chill',subject:'food_safety',minSubjectLevel:30,batchShared:true,qualityCheckpoint:true,intermediateOut:'chilled_probiotic_lot'})
    ];
  }
  if(/saline|wound_dressing/.test(id)){
    return [
      stage('เตรียมและกรองวัตถุดิบเกรดคลินิก','clean_fill',.3,0,null,{opCode:'sterile_prep',subject:'aseptic_processing',minSubjectLevel:35,safetyCritical:true,intermediateOut:'filtered_clinical_solution'}),
      stage('บรรจุในพื้นที่ควบคุม ISO Class-5','clean_fill',.3,0,null,{opCode:'aseptic_fill',subject:'cleanroom_operations',minSubjectLevel:35,safetyCritical:true,intermediateOut:'sealed_sterile_pack'}),
      stage('ฆ่าเชื้อไอน้ำแรงดันสูงและพักเย็น','autoclave',.25,30,121,{opCode:'autoclave_sterilization',subject:'aseptic_processing',minSubjectLevel:35,safetyCritical:true,batchShared:true,intermediateOut:'sterilized_lot'}),
      stage('ตรวจปล่อยความปลอดเชื้อและเอกสาร COA','diagnostic_kit',.15,10,null,{opCode:'sterility_release_assay',subject:'quality_documentation',minSubjectLevel:30,qualityCheckpoint:true,intermediateOut:'coa_certified_lot'})
    ];
  }
  if(/vital_signs_monitor/.test(id)){
    return [
      stage('วางชิ้นส่วนและบัดกรีวงจรวัดสัญญาณชีพ','electronics_bench',.3,0,null,{opCode:'biomed_smt',subject:'electrical_basics',minSubjectLevel:30,intermediateOut:'biomed_pcba'}),
      stage('ประกอบตัวเรือนฉนวนป้องกันไฟรั่วเกรดการแพทย์','hand_tools',.25,0,null,{opCode:'isolation_enclosure',subject:'electrical_safety',minSubjectLevel:35,safetyCritical:true,intermediateOut:'isolated_monitor_unit'}),
      stage('สอบเทียบความแม่นยำเซ็นเซอร์สัญญาณชีพ','diagnostic_kit',.25,15,null,{opCode:'clinical_calibration',subject:'metrology',minSubjectLevel:35,intermediateOut:'calibrated_monitor'}),
      stage('ทดสอบความปลอดภัยทางคลินิกก่อนปล่อยล็อต','test_rig',.2,15,null,{opCode:'clinical_safety_test',subject:'clinical_validation',minSubjectLevel:35,qualityCheckpoint:true,intermediateOut:'clinical_ready_monitor'})
    ];
  }
  if(p.industry==='food'){
    const isOil=/oil/.test(id),isChili=/chili_paste/.test(id),isMeal=/meal|meat/.test(id);
    return [
      stage(isChili?'คั่วสมุนไพรและบดเครื่องแกง':'ชั่งและผสมตามสูตร','mixer',.3,0,null,{opCode:'food_batch_mix',subject:'food_safety',minSubjectLevel:20,intermediateOut:'blended_food_mix'}),
      stage(isOil?'สกัดร้อนและกรองละเอียด':isChili?'เคี่ยวไฟอ่อนและปรุงรสเข้มข้น':'ให้ความร้อนและแปรรูป','cooker',.4,15,isChili?92:90,{opCode:'thermal_cooking',subject:'food_safety',minSubjectLevel:20,batchShared:true,intermediateOut:'cooked_batch'}),
      stage(isMeal?'ลดอุณหภูมิรวดเร็วและซีลถาดบรรจุ':'พักเย็นและเตรียมบรรจุ','hand_tools',.3,10,null,{opCode:'cooling_pack_prep',subject:'food_safety',minSubjectLevel:20,qualityCheckpoint:true,intermediateOut:'food_ready_lot'})
    ];
  }
  if(/rail|tray|suspension|motor|agv|Actuator|drone|switchgear/i.test(id)){
    return [
      stage('ตัดกลึงและขึ้นรูปโครงสร้างโลหะ','press',.3,0,null,{opCode:'cnc_press_forming',subject:'metal_machining',minSubjectLevel:30,intermediateOut:'formed_chassis'}),
      stage('เชื่อมประกอบโครงและตั้งจิ๊กแม่นยำ','welder',.3,0,null,{opCode:'structural_welding',subject:'metal_machining',minSubjectLevel:30,safetyCritical:true,intermediateOut:'welded_frame'}),
      stage('ติดตั้งชุดขับเคลื่อนและเดินสายควบคุม','electronics_bench',.2,0,null,{opCode:'mechatronics_integration',subject:'electrical_basics',minSubjectLevel:25,intermediateOut:'integrated_assembly'}),
      stage('ทดสอบมิติ แรงบิด และการทำงานภายใต้โหลด','diagnostic_kit',.2,10,null,{opCode:'dyno_dimensional_test',subject:'quality',minSubjectLevel:25,qualityCheckpoint:true,intermediateOut:'verified_machine_unit'})
    ];
  }
  if(/battery|lfp|nmc|powerwall|grid_rack|Inverter|Charger/i.test(id)){
    return [
      stage('คัดเกรดเซลล์และวัดความต้านทานภายใน','test_rig',.25,0,null,{opCode:'cell_matching',subject:'electrical_basics',minSubjectLevel:25,intermediateOut:'matched_cell_group'}),
      stage('ประกอบโมดูลวงจรแปลงไฟและระบบป้องกัน BMS','electronics_bench',.35,0,null,{opCode:'hv_bms_assembly',subject:'electrical_safety',minSubjectLevel:30,safetyCritical:true,intermediateOut:'hv_module_core'}),
      stage('ประกอบโครงระบายความร้อนและซีลกันความชื้น','hand_tools',.15,0,null,{opCode:'thermal_enclosure_seal',subject:'power_electronics',minSubjectLevel:25,intermediateOut:'sealed_energy_pack'}),
      stage('ทดสอบโหลดต่อเนื่องและเฝ้าดูอุณหภูมิ','test_rig',.25,60,40,{opCode:'burn_in_cycling',subject:'electrical_safety',minSubjectLevel:30,batchShared:true,qualityCheckpoint:true,intermediateOut:'certified_energy_unit'})
    ];
  }
  if(/visionCamera|ai_edge_module|smartMeter|autoSensor|cold_chain_temp_logger/.test(id)){
    return [
      stage('วางชิ้นส่วน SMT และบัดกรีแผงวงจรความละเอียดสูง','electronics_bench',.35,0,null,{opCode:'precision_smt',subject:'electrical_basics',minSubjectLevel:25,intermediateOut:'smt_pcba'}),
      stage('ประกอบโมดูลเซ็นเซอร์/เลนส์และแฟลชเฟิร์มแวร์','hand_tools',.35,0,null,{opCode:'firmware_optics_assy',subject:'embedded_iot',minSubjectLevel:25,intermediateOut:'flashed_device'}),
      stage('สอบเทียบสัญญาณและเดินเครื่อง Burn-in','test_rig',.3,10,null,{opCode:'sensor_burn_in_cal',subject:'quality',minSubjectLevel:25,batchShared:true,qualityCheckpoint:true,intermediateOut:'calibrated_iot_unit'})
    ];
  }
  return [
    stage('เตรียมชิ้นส่วนและตรวจแบบ','hand_tools',.25,0,null,{opCode:'kit_prep',subject:'embedded_iot',minSubjectLevel:0,intermediateOut:'prepared_kit'}),
    stage('ประกอบและเชื่อมต่อวงจร','electronics_bench',.5,0,null,{opCode:'board_wiring',subject:'electrical_basics',minSubjectLevel:0,intermediateOut:'wired_unit'}),
    stage('ตั้งค่าและทดสอบเดินเครื่อง','test_rig',.25,5,null,{opCode:'functional_test',subject:'quality',minSubjectLevel:0,batchShared:true,qualityCheckpoint:true,intermediateOut:'tested_unit'})
  ];
}

const serviceEquipment={
  calibration_lab:'diagnostic_kit',
  field_maintenance:'hand_tools',
  battery_second_life_lab:'test_rig',
  returnable_pallet_pool:'warehouse_tools',
  cold_storage_3pl:'cold_room',
  industrial_recycling:'press',
  energy_epc_install:'diagnostic_kit',
  b2b_technical_academy:'developer_pc',
  wholesale_distribution:'warehouse_tools',
  toll_smelting_extrusion:'smelter'
};

function materialEquipment(id){
  if(/rice|flour/.test(id))return 'grain_mill';
  if(/microchip|wafer|optical/.test(id))return 'semiconductor_fab';
  if(/ore|alumin|steel|billet|silicon|matte|coke|sheet|copper|sink/.test(id))return 'smelter';
  if(/resin|electrolyte|cathode|fertilizer|ammonia|diesel|tire/.test(id))return 'chemical_reactor';
  if(/sugar|palm|extract|water|compost|saline|culture/.test(id))return 'cooker';
  if(/pcb|led|sensor|cell|inverter|driver|battery|wire/.test(id))return 'electronics_bench';
  if(/dough|protein/.test(id))return 'mixer';
  return 'press';
}

function recipeSpec(materialId,recipe=D.MATERIAL_RECIPES?.[materialId]){
  const eq=materialEquipment(materialId);
  const tier=recipe?.tier||1;
  const isSterile=/saline|culture/.test(materialId);
  const isSemi=/wafer|microchip|optical/.test(materialId);
  const isSmelt=eq==='smelter';
  const isChem=eq==='chemical_reactor';
  const isFood=/rice|flour|sugar|palm|dough|extract/.test(materialId);
  const temp=isSmelt?180:isChem?120:eq==='cooker'?90:isSemi?110:null;
  const setupMinutes=tier>=3?10:5;
  const activeLaborMinutes=tier>=3?15:10;
  const passiveHoldMinutes=temp!==null?15:10;
  const unloadInspectMinutes=5;
  const subject=isSemi?'semiconductor_process':isSmelt?'metallurgy':isChem?'chemical_processing':isSterile?'aseptic_processing':isFood?'food_safety':'metal_machining';
  return {
    id:materialId,
    nameTh:recipe?.nameTh||materialId,
    equipment:eq,
    tier,
    grade:isSterile?'pharma_sterile':isSemi?'electronic_grade':isFood?'food_grade':isSmelt?'metallurgical_grade':'industrial_grade',
    setupMinutes,
    activeLaborMinutes,
    passiveHoldMinutes,
    unloadInspectMinutes,
    totalMinutes:setupMinutes+activeLaborMinutes+passiveHoldMinutes+unloadInspectMinutes,
    temperatureC:temp,
    batchCapacity:Math.max(2,(SPECS[eq]?.capacity||3)*2),
    waterM3:recipe?.inputs?.raw_water_m3||(isChem||eq==='cooker'?1:0),
    subject,
    requiredLevel:tier>=3?45:tier===2?35:25,
    byproducts:Object.keys(recipe?.outputs||{}).filter(k=>k!==materialId)
  };
}

function defaultSubsystems(cond=100){
  return {mechanical:cond,electrical:cond,thermal:cond,calibration:cond,cleanliness:cond};
}

function ensure(w){
  if(w.plant){
    if(!w.plant.refineryBatches)w.plant.refineryBatches={};
    if(!w.plant.serviceRecords)w.plant.serviceRecords=[];
    for(const m of Object.values(w.plant.machines||{})){
      if(!m.subsystems)m.subsystems=defaultSubsystems(m.condition??100);
      if(m.faultMode===undefined)m.faultMode=null;
      if(!m.acquisitionMode)m.acquisitionMode=m.opening?'opening':'purchased_new';
    }
    return w.plant;
  }
  w.plant={
    version:1,
    machines:{},
    maintenance:[],
    refineryBatches:{},
    serviceRecords:[],
    history:[],
    energyKwh:0,
    billedEnergyKwh:0,
    partsConsumed:{},
    decisionTh:'ยังไม่มีแผนซื้อเครื่องใหม่',
    lastReviewDay:0
  };
  for(const k of ['hand_tools','electronics_bench','test_rig','developer_pc','warehouse_tools'])install(w,k,true);
  return w.plant;
}

function install(w,k,opening=false,options={}){
  const x=w.plant;if(!SPECS[k])return null;
  const initCond=options.initialCondition??100;
  const m={
    id:k,
    condition:initCond,
    status:'ready',
    slots:{},
    temperatureC:25,
    totalMinutes:0,
    totalKwh:0,
    installedAt:w.clock.absoluteMinute,
    opening,
    costSatang:opening?0:(options.costSatang??SPECS[k].cost),
    acquisitionMode:opening?'opening':(options.acquisitionMode||'purchased_new'),
    subsystems:defaultSubsystems(initCond),
    faultMode:null,
    currentFamilyId:null,
    changeoverUntil:0,
    downtimeMinutes:0,
    lastPreventiveAt:w.clock.absoluteMinute
  };
  x.machines[k]=m;
  return m;
}

function log(w,type,text,details={}){
  const x=ensure(w);
  x.history.unshift({at:w.clock.absoluteMinute,type,text,...details});
  if(x.history.length>100)x.history.pop();
}

function workState(w,j){
  const u=w.units[j.unitId];if(!u)return null;
  const steps=route(w.catalog.products[u.productId]);
  if(!u.process||u.process.version!==1){
    u.process={version:1,index:0,labor:0,phase:'labor',history:[],lastIntermediate:null};
    j.progress=0;
  }
  if(u.process.index>=steps.length)u.process.phase='complete';
  return {u,steps,state:u.process,step:steps[u.process.index]};
}

function stationFor(w,j){
  if(j.kind!=='assembly'||!j.unitId)return null;
  const q=workState(w,j);if(!q?.step)return null;
  const stations=Object.values(w.layout.stations).filter(s=>s.kind==='assembly').sort((a,b)=>a.id.localeCompare(b.id));
  if(!stations.length)return null;
  const n=Object.keys(SPECS).indexOf(q.step.equipment);
  return stations[n%stations.length].id;
}

function workerQualifiedForStep(w,p,step){
  if(!step||!step.safetyCritical||!step.minSubjectLevel)return true;
  if(!p)return true;
  const subj=step.subject;
  const lv=p.education?.subjects?.[subj]||0;
  if(lv>=step.minSubjectLevel)return true;
  const fallbackLv=Math.max(p.education?.subjects?.safety||0,p.education?.subjects?.quality||0);
  if(fallbackLv>=step.minSubjectLevel+10)return true;
  // Supervised by a qualified colleague at work
  return w.people.some(other=>other.employed&&other.atWork&&other.id!==p.id&&(other.education?.subjects?.[subj]||0)>=step.minSubjectLevel);
}

function available(w,j,p=null){
  if(j.kind!=='assembly'||!j.unitId)return true;
  const q=workState(w,j);if(!q||!q.step)return true;
  if(q.state.phase==='machine')return false;
  if(p&&!workerQualifiedForStep(w,p,q.step))return false;
  const m=ensure(w).machines[q.step.equipment];
  return !!m&&m.status==='ready'&&m.condition>=25&&(m.slots[j.id]||Object.keys(m.slots).length<SPECS[m.id].capacity);
}

function power(w,m,minutes){
  if(minutes<=0)return;
  // Prevent multiplying full machine power/wear when multiple jobs or batches share the same machine in the same tick
  if(m.lastPowerAt===w.clock.absoluteMinute)return;
  m.lastPowerAt=w.clock.absoluteMinute;
  const activeCount=Math.max(1,Object.keys(m.slots||{}).length);
  const loadFactor=1+Math.min(0.35,(activeCount-1)*0.08);
  const energy=SPECS[m.id].kw*(minutes/60)*loadFactor;
  m.totalKwh+=energy;
  ensure(w).energyKwh+=energy;
  m.totalMinutes+=minutes;
  const wearMult=SPECS[m.id].scale==='heavy'||SPECS[m.id].scale==='mega'?0.0038:0.003;
  const wear=minutes*wearMult;
  m.condition=Math.max(0,m.condition-wear);
  if(m.subsystems){
    m.subsystems.mechanical=clamp(m.subsystems.mechanical-wear*1.05,0,100);
    m.subsystems.electrical=clamp(m.subsystems.electrical-wear*0.9,0,100);
    m.subsystems.thermal=clamp(m.subsystems.thermal-wear*(m.temperatureC>60?1.25:0.85),0,100);
    m.subsystems.calibration=clamp(m.subsystems.calibration-wear*0.95,0,100);
    m.subsystems.cleanliness=clamp(m.subsystems.cleanliness-wear*1.1,0,100);
  }
  if(m.condition<45&&!m.faultMode){
    const modes=SPECS[m.id].faultModes||[{code:'general_wear',nameTh:'ชิ้นส่วนหลักสึกหรอจากการใช้งานสะสม',subsystem:'mechanical',part:repairPart(m.id)}];
    const picked=modes[Math.floor(m.totalMinutes)%modes.length];
    m.faultMode={
      code:picked.code,
      nameTh:picked.nameTh,
      subsystem:picked.subsystem,
      requiredPartId:picked.part||repairPart(m.id),
      diagnosed:false,
      diagnosticScore:0,
      detectedAt:w.clock.absoluteMinute
    };
  }
}

function labor(w,j,p,delta,tick){
  const q=workState(w,j);if(!q||!q.step)return {delta,release:false};
  const {step,state}=q,m=ensure(w).machines[step.equipment];
  if(!available(w,j,p))return {delta:0,release:true};
  m.slots[j.id]=true;
  const required=j.required*step.share;
  const subjLv=p?.education?.subjects?.[step.subject]||50;
  const subjMod=step.minSubjectLevel>0?clamp(0.85+(subjLv-step.minSubjectLevel)*0.004,0.65,1.25):1;
  const added=Math.min(delta*(.65+m.condition*.0035)*subjMod,Math.max(0,required-state.labor));
  state.labor+=added;
  power(w,m,tick);
  if(state.labor+1e-8>=required){
    state.workerId=p.id;
    state.startedAt=w.clock.absoluteMinute;
    if(step.holdMinutes){
      state.phase='machine';
      state.holdDone=0;
      state.lastTick=w.clock.absoluteMinute;
      return {delta:added,release:true};
    }
    completeStage(w,j,q,m);
    return {delta:added,release:state.phase!=='complete'};
  }
  return {delta:added,release:false};
}

function completeStage(w,j,q,m){
  const s=q.state;
  s.history.push({
    nameTh:q.step.nameTh,
    opCode:q.step.opCode||'process_op',
    machineId:m.id,
    workerId:s.workerId||null,
    completedAt:w.clock.absoluteMinute,
    holdMinutes:s.holdDone||0,
    temperatureC:m.temperatureC,
    intermediateOut:q.step.intermediateOut||q.step.nameTh
  });
  s.lastIntermediate=q.step.intermediateOut||q.step.nameTh;
  delete m.slots[j.id];
  s.index++;
  s.labor=0;
  s.phase='labor';
  q.u.processHistory=s.history;
  q.u.processStep=s.index;
  if(s.index>=q.steps.length){
    j.progress=j.required;
    s.phase='complete';
  }
}

function enqueueRefineryBatch(w,materialId,batches,activeInputs,inputValueSatang,hooks,options={}){
  const x=ensure(w);
  const recipe=D.MATERIAL_RECIPES?.[materialId];
  const spec=recipeSpec(materialId,recipe);
  const m=x.machines[spec.equipment];
  if(!m||m.status!=='ready'||m.condition<25){
    return {ok:false,code:'equipmentUnavailable',message:'เครื่องจักรแปรรูปยังไม่พร้อมใช้งาน'};
  }
  const activeOnMachine=Object.values(x.refineryBatches||{}).filter(b=>b.equipment===spec.equipment&&!['released','cancelled','scrapped'].includes(b.status));
  if(activeOnMachine.length>=spec.batchCapacity){
    return {ok:false,code:'machineCapacityFull',message:`คิวเครื่อง ${SPECS[spec.equipment].nameTh} เต็มความจุ (${spec.batchCapacity} ล็อต)`};
  }
  const bid=`refbatch-${++w.sequence}`;
  const reservedInputs={};
  for(const [inMat,inQty] of Object.entries(activeInputs)){
    const deduct=inQty*batches;
    reservedInputs[inMat]=deduct;
    w.inventory.reserved[inMat]=(w.inventory.reserved[inMat]||0)+deduct;
  }
  const outputs={};
  for(const [outMat,outQty] of Object.entries(recipe?.outputs||{})){
    if(Object.hasOwn(w.inventory.materials,outMat))outputs[outMat]=outQty*batches;
  }
  const hasSlot=Object.keys(m.slots).length<SPECS[m.id].capacity;
  if(hasSlot)m.slots[bid]=true;
  const batch={
    id:bid,
    materialId,
    nameTh:recipe?.nameTh||materialId,
    batches,
    equipment:spec.equipment,
    grade:spec.grade,
    subject:spec.subject,
    requiredLevel:spec.requiredLevel,
    status:hasSlot?'loading_setup':'inputs_reserved',
    inputs:reservedInputs,
    outputs,
    inputsReserved:true,
    inputsConsumed:false,
    wipValueSatang:inputValueSatang,
    setupMinutes:spec.setupMinutes,
    activeLaborMinutes:spec.activeLaborMinutes,
    passiveHoldMinutes:spec.passiveHoldMinutes,
    unloadInspectMinutes:spec.unloadInspectMinutes,
    setupDone:0,
    laborDone:0,
    holdDone:0,
    inspectDone:0,
    temperatureC:spec.temperatureC,
    operatorId:null,
    operatorName:null,
    inspectorId:null,
    qualityScore:90,
    reworkCount:0,
    waitingReasonTh:hasSlot?'กำลังตั้งเครื่องและโหลดวัตถุดิบเข้าถังแปรรูป':'จองวัตถุดิบแล้ว รอช่องว่างเครื่องจักร',
    createdAt:w.clock.absoluteMinute,
    lastTickAt:w.clock.absoluteMinute,
    releasedAt:null,
    history:[{stage:hasSlot?'loading_setup':'inputs_reserved',at:w.clock.absoluteMinute}]
  };
  x.refineryBatches[bid]=batch;
  log(w,'refineryBatchQueued',`เปิดล็อตแปรรูป ${batch.nameTh} ×${batches} (${bid}) บน ${SPECS[spec.equipment].nameTh}`,{batchId:bid,materialId,batches});
  return {ok:true,batchId:bid,batch,queued:true,status:batch.status,batches,unitsProduced:0};
}

function cancelRefineryBatch(w,batchId){
  const x=ensure(w);
  const b=x.refineryBatches?.[batchId];
  if(!b)return {ok:false,code:'unknownBatch',message:'ไม่พบล็อตแปรรูป'};
  if(b.status==='released'||b.status==='cancelled'||b.status==='scrapped'){
    return {ok:false,code:'batchAlreadyClosed',message:'ล็อตแปรรูปนี้สิ้นสุดกระบวนการแล้ว'};
  }
  const m=x.machines[b.equipment];
  if(m&&m.slots[b.id])delete m.slots[b.id];
  if(b.inputsReserved&&!b.inputsConsumed){
    for(const [inMat,qty] of Object.entries(b.inputs||{})){
      w.inventory.reserved[inMat]=Math.max(0,(w.inventory.reserved[inMat]||0)-qty);
    }
    b.inputsReserved=false;
    b.status='cancelled';
    b.waitingReasonTh='ยกเลิกก่อนเดินเครื่อง คืนสถานะจองวัตถุดิบเข้าคลังปกติ';
    b.history.push({stage:'cancelled',at:w.clock.absoluteMinute});
    return {ok:true,batchId:b.id,status:'cancelled',refundedInputs:true};
  }
  // Once inputs were consumed into running WIP, cancellation cannot refund consumed raw materials
  b.inputsReserved=false;
  b.status='scrapped';
  b.waitingReasonTh='ยกเลิกระหว่างแปรรูป (วัตถุดิบใช้ไปแล้ว ไม่สามารถเสกคืนเข้าคลังได้)';
  b.history.push({stage:'scrapped',at:w.clock.absoluteMinute});
  return {ok:true,batchId:b.id,status:'scrapped',refundedInputs:false};
}

function tickRefinery(w,tick,hooks){
  const x=ensure(w);
  const batches=Object.values(x.refineryBatches||{});
  if(!batches.length)return;
  const busyWorkers=new Set();
  for(const p of w.people){
    if(p.employed&&p.plantTaskAt===w.clock.absoluteMinute)busyWorkers.add(p.id);
  }
  for(const b of batches){
    if(['released','cancelled','scrapped'].includes(b.status))continue;
    const dt=Math.min(tick,Math.max(0,w.clock.absoluteMinute-(b.lastTickAt??w.clock.absoluteMinute)));
    if(dt<=0)continue;
    b.lastTickAt=w.clock.absoluteMinute;
    const m=x.machines[b.equipment];
    if(!m||m.status!=='ready'||m.condition<25){
      b.waitingReasonTh=`รอเครื่อง ${SPECS[b.equipment]?.nameTh||b.equipment} พร้อมทำงาน (สภาพ/ซ่อมบำรุง)`;
      continue;
    }
    if(w.utilities?.brownoutActive){
      b.waitingReasonTh='หยุดรอชั่วคราวเนื่องจากไฟตก (Voltage Brownout)';
      continue;
    }
    if(!m.slots[b.id]){
      if(Object.keys(m.slots).length<SPECS[m.id].capacity){
        m.slots[b.id]=true;
        if(b.status==='inputs_reserved'||b.status==='staged'){
          b.status='loading_setup';
          b.history.push({stage:'loading_setup',at:w.clock.absoluteMinute});
        }
      }else{
        b.status='staged';
        b.waitingReasonTh=`รอช่องว่างเครื่อง ${SPECS[m.id].nameTh} (${Object.keys(m.slots).length}/${SPECS[m.id].capacity})`;
        continue;
      }
    }
    // Check qualified worker availability
    const qualifiedPool=w.people.filter(p=>p.employed&&!busyWorkers.has(p.id)&&((p.education?.subjects?.[b.subject]||0)>=b.requiredLevel||(p.education?.subjects?.chemical_processing||0)>=35||(p.education?.subjects?.food_fermentation||0)>=35||(p.education?.subjects?.metal_machining||0)>=35||(p.education?.subjects?.agriculture||0)>=35));
    if(qualifiedPool.length===0&&hooks?.isMaterialReady&&!hooks.isMaterialReady(b.materialId)){
      b.waitingReasonTh=`รอผู้เชี่ยวชาญวิชา ${b.subject} (ระดับ ${b.requiredLevel}+)`;
      continue;
    }
    const operator=qualifiedPool.find(p=>p.atWork)||qualifiedPool[0]||null;
    if(operator){
      b.operatorId=operator.id;
      b.operatorName=operator.name;
      if(operator.atWork)busyWorkers.add(operator.id);
    }
    const opSkill=operator?(operator.education?.subjects?.[b.subject]||50):55;
    const speedMult=clamp((0.75+opSkill*0.004)*(0.7+m.condition*0.003),0.5,1.5);
    const workDelta=dt*speedMult;

    if(b.status==='inputs_reserved'||b.status==='staged'){
      b.status='loading_setup';
      b.history.push({stage:'loading_setup',at:w.clock.absoluteMinute});
    }
    if(b.status==='loading_setup'){
      b.setupDone=Math.min(b.setupMinutes,b.setupDone+workDelta);
      power(w,m,dt);
      b.waitingReasonTh=`กำลังตั้งเครื่องและโหลดวัตถุดิบ (${Math.round(b.setupDone)}/${b.setupMinutes} นาที)`;
      if(b.setupDone+1e-8>=b.setupMinutes){
        // Consume reserved inputs into WIP!
        if(b.inputsReserved&&!b.inputsConsumed){
          for(const [inMat,qty] of Object.entries(b.inputs||{})){
            w.inventory.reserved[inMat]=Math.max(0,(w.inventory.reserved[inMat]||0)-qty);
            if(hooks?.consumeInput)hooks.consumeInput(inMat,qty);
          }
          b.inputsReserved=false;
          b.inputsConsumed=true;
        }
        b.status='running';
        b.history.push({stage:'running',at:w.clock.absoluteMinute});
      }else{
        continue;
      }
    }
    if(b.status==='running'){
      power(w,m,dt);
      if(b.temperatureC!==null&&m.lastThermalAt!==w.clock.absoluteMinute){
        m.temperatureC+=clamp(b.temperatureC-m.temperatureC,-dt*12,dt*12);
        m.lastThermalAt=w.clock.absoluteMinute;
      }
      b.laborDone=Math.min(b.activeLaborMinutes,b.laborDone+workDelta);
      const tempReady=b.temperatureC===null||Math.abs(m.temperatureC-b.temperatureC)<=15;
      if(tempReady){
        b.holdDone=Math.min(b.passiveHoldMinutes,b.holdDone+dt);
      }
      b.waitingReasonTh=tempReady
        ?`กำลังเดินเครื่องแปรรูป (${Math.round(b.laborDone+b.holdDone)}/${b.activeLaborMinutes+b.passiveHoldMinutes} นาที)`
        :`กำลังเร่งอุณหภูมิเครื่อง (${Math.round(m.temperatureC)}°C / เป้าหมาย ${b.temperatureC}°C)`;
      if(b.laborDone+1e-8>=b.activeLaborMinutes&&b.holdDone+1e-8>=b.passiveHoldMinutes){
        b.status='unloading';
        b.history.push({stage:'unloading',at:w.clock.absoluteMinute});
      }else{
        continue;
      }
    }
    if(b.status==='unloading'||b.status==='inspection'||b.status==='rework'){
      b.status='inspection';
      b.inspectDone=Math.min(b.unloadInspectMinutes,b.inspectDone+workDelta);
      b.waitingReasonTh=`กำลังถ่ายล็อตและตรวจปล่อยคุณภาพ (${Math.round(b.inspectDone)}/${b.unloadInspectMinutes} นาที)`;
      if(b.inspectDone+1e-8>=b.unloadInspectMinutes){
        const totalUnitsOut=Object.values(b.outputs||{}).reduce((a,n)=>a+n,0);
        if(hooks?.warehouseAvailable&&!hooks.warehouseAvailable(totalUnitsOut)){
          b.waitingReasonTh='รอพื้นที่ว่างในคลังสินค้าก่อนตรวจปล่อยล็อตแปรรูป';
          continue;
        }
        b.qualityScore=Math.round(clamp(68+opSkill*0.22+m.condition*0.1,50,100));
        delete m.slots[b.id];
        b.status='released';
        b.releasedAt=w.clock.absoluteMinute;
        b.waitingReasonTh='ผ่านการตรวจปล่อยเข้าคลังวัตถุดิบแล้ว';
        b.history.push({stage:'released',at:w.clock.absoluteMinute,qualityScore:b.qualityScore});
        if(hooks?.releaseBatch)hooks.releaseBatch(b);
      }
    }
  }
}

function tick(w,tickMinutes,hooks=null){
  const x=ensure(w);
  const cold=x.machines.cold_room;
  if(cold?.status==='ready'&&cold.condition>=25&&Object.values(w.units).some(u=>u.stage==='ready'&&w.catalog.products[u.productId]?.industry==='food')){
    cold.temperatureC+=clamp(4-cold.temperatureC,-tickMinutes*2,tickMinutes*2);
    power(w,cold,tickMinutes);
  }

  for(const m of Object.values(x.machines)){
    if(m.status!=='ready')m.downtimeMinutes=(m.downtimeMinutes||0)+tickMinutes;
    for(const slots of [m.slots,m.heldSlots||{}]){
      for(const jid of Object.keys(slots)){
        const isJob=Boolean(w.jobs[jid]&&w.units[w.jobs[jid].unitId]);
        const isRefinery=Boolean(x.refineryBatches?.[jid]&&!['released','cancelled','scrapped'].includes(x.refineryBatches[jid].status));
        if(!isJob&&!isRefinery)delete slots[jid];
      }
    }
    if(!Object.keys(m.slots).length)m.temperatureC+=clamp(25-m.temperatureC,-tickMinutes,tickMinutes);
  }
  for(const j of Object.values(w.jobs)){
    if(j.kind!=='assembly'||!j.unitId)continue;
    const q=workState(w,j);if(!q?.step||q.state.phase!=='machine')continue;
    const m=x.machines[q.step.equipment];
    if(!m||m.status!=='ready'||m.condition<25||w.utilities?.brownoutActive)continue;
    const dt=Math.min(tickMinutes,Math.max(0,w.clock.absoluteMinute-q.state.lastTick));
    q.state.lastTick=w.clock.absoluteMinute;
    if(!dt)continue;
    power(w,m,dt);
    const target=q.step.temperatureC;
    if(target!==null&&m.lastThermalAt!==w.clock.absoluteMinute){
      m.temperatureC+=clamp(target-m.temperatureC,-dt*3,dt*3);
      m.lastThermalAt=w.clock.absoluteMinute;
    }
    if(target===null||Math.abs(m.temperatureC-target)<=2)q.state.holdDone+=dt;
    if(q.state.holdDone>=q.step.holdMinutes)completeStage(w,j,q,m);
  }
  tickRefinery(w,tickMinutes,hooks);
}

function requirements(w){
  const ks=new Set();
  for(const u of Object.values(w.units))for(const s of route(w.catalog.products[u.productId]))ks.add(s.equipment);
  for(const o of Object.values(w.serviceBusiness?.orders||{}))if(!['paid','cancelled'].includes(o.status)&&serviceEquipment[o.serviceTypeId])ks.add(serviceEquipment[o.serviceTypeId]);
  for(const b of Object.values(w.plant?.refineryBatches||{}))if(!['released','cancelled','scrapped'].includes(b.status)&&b.equipment)ks.add(b.equipment);
  return [...ks];
}

function repairPart(k){
  return ['press','welder','smelter','grain_mill','warehouse_tools','hand_tools'].includes(k)?'metal_sheet':['mixer','cooker','pasteurizer','fermenter','cold_room','clean_fill','autoclave','chemical_reactor'].includes(k)?'polymer_resin':'wire_harness';
}

function repairSubject(p,k){
  const s=p.education?.subjects||{};
  return Math.max(s.maintenance||0,(s[SPECS[k].subject]||0)*.8,(s.electrical_basics||0)*.55);
}

function technicianCapability(p,k,hasDiagKit=true){
  const subj=repairSubject(p,k);
  const apt=p.profile?.aptitudes||{};
  const analytical=apt.analytical??50,dexterity=apt.dexterity??50,sensitivity=apt.problemSensitivity??50,attention=apt.attention??50;
  const aptComposite=(analytical*0.35+dexterity*0.3+sensitivity*0.2+attention*0.15)/100;
  const fatigue=Math.max(0.3,1-(p.state?.fatigue||0)/140);
  const expMinutes=p.education?.practiceMinutes?.maintenance||p.experience?.workMinutes||0;
  const expBonus=Math.min(0.2,expMinutes/12000);
  const kitMod=hasDiagKit?1.08:0.88;
  const speed=(.4+subj/100)*(.7+aptComposite*.6+expBonus)*fatigue*kitMod;
  const diagnosticAccuracy=clamp(0.55+(subj/100)*0.25+aptComposite*0.18+(hasDiagKit?0.05:0),0.4,0.99);
  const postCondition=clamp(75+subj*0.22+aptComposite*6-(1-fatigue)*8,72,100);
  return {subj,aptComposite,fatigue,speed,diagnosticAccuracy,postCondition};
}

function request(w,k,hooks,options={}){
  const x=ensure(w),spec=SPECS[k];if(!spec)return false;
  if(x.machines[k])return true;
  const mode=options.acquisitionMode||'purchased_new';
  const wages=w.people.filter(p=>p.employed).reduce((a,p)=>a+p.pay.dailyWage,0),reserve=wages*18;
  if(spec.cost>5000000&&Object.values(w.production.shipped).reduce((a,n)=>a+n,0)<50){
    x.decisionTh=`ยังไม่ซื้อ ${spec.nameTh}: ยังไม่มีปริมาณผลิตรองรับ เลือกซื้อวัตถุดิบจากผู้ผลิตภายนอก`;
    return false;
  }
  const effectiveCost=mode==='used_refurbished'?Math.round(spec.cost*0.65):mode==='leased'?Math.round(spec.cost*0.25):spec.cost;
  const initCond=mode==='used_refurbished'?82:100;
  if(w.finance.cash<effectiveCost+reserve){
    x.decisionTh=`ยังไม่ซื้อ ${spec.nameTh}: ต้องเก็บเงินสำรอง18วัน`;
    return false;
  }
  hooks.pay(effectiveCost,'plant:buy:'+k);
  install(w,k,false,{costSatang:effectiveCost,acquisitionMode:mode,initialCondition:initCond});
  x.machines[k].status='installing';
  const baseLeadDays=k==='semiconductor_fab'?180:spec.cost>=5000000?14:spec.cost>=1800000?5:2;
  const leadDays=mode==='used_refurbished'?Math.max(1,Math.ceil(baseLeadDays*0.6)):baseLeadDays;
  x.machines[k].availableAt=w.clock.absoluteMinute+leadDays*1440;
  const reqMinutes=k==='semiconductor_fab'?4320:spec.cost>=5000000?480:spec.cost>=1800000?240:60;
  x.maintenance.push({
    id:'install:'+k,
    machineId:k,
    type:'install',
    phase:'commissioning',
    progress:0,
    required:reqMinutes,
    workerId:null,
    partsConsumed:false,
    diagnosedFaultTh:'ตรวจรับเครื่องจักร ตั้งศูนย์ และทดสอบเดินเครื่องปลอดภัย (Commissioning)'
  });
  log(w,'equipmentPurchased',`จัดหา ${spec.nameTh} (${mode}) รอช่างติดตั้ง`,{machineId:k,cost:effectiveCost,acquisitionMode:mode});
  return true;
}

function maintain(w,hooks){
  const x=ensure(w),minute=w.clock.absoluteMinute;if(minute%5)return;
  const busy=new Set();
  const task=x.maintenance.find(t=>t.progress<t.required);if(!task)return;
  const m=x.machines[task.machineId],spec=SPECS[m.id];
  if(task.type==='install'&&minute<(m.availableAt||0)){
    x.decisionTh=`รอส่งมอบ ${spec.nameTh} วันที่ ${Math.floor(m.availableAt/1440)+1}`;
    return;
  }
  if(Object.keys(m.slots).length)return;
  const hasDiagKit=Boolean(x.machines.diagnostic_kit&&x.machines.diagnostic_kit.status==='ready'&&x.machines.diagnostic_kit.condition>=25);
  const candidates=w.people.filter(p=>p.employed&&p.atWork&&!busy.has(p.id)&&!p.path.length&&!(p.breakUntil>minute)&&!['eating','sleeping','resting'].includes(p.activity)&&repairSubject(p,m.id)>=spec.level);
  candidates.sort((a,b)=>technicianCapability(b,m.id,hasDiagKit).speed-technicianCapability(a,m.id,hasDiagKit).speed);
  const p=candidates[0];
  if(!p){
    const learner=w.people.find(p=>p.employed&&p.role==='engineer');
    if(learner&&learner.education&&!learner.education.course)hooks.train?.(learner,'maintenance',spec.level);
    x.decisionTh=`${spec.nameTh} รอช่างที่รู้ ${spec.subject} / การซ่อมบำรุง`;
    return;
  }
  const cap=technicianCapability(p,m.id,hasDiagKit);
  if(task.type==='repair'&&!task.diagnosedFaultTh){
    const fm=m.faultMode||((spec.faultModes&&spec.faultModes[0])||{code:'wear_fault',nameTh:'ชิ้นส่วนหลักสึกหรอ',subsystem:'mechanical',part:repairPart(m.id)});
    task.diagnosedFaultTh=`${fm.nameTh} (ความแม่นยำวินิจฉัย ${Math.round(cap.diagnosticAccuracy*100)}%)`;
    if(m.faultMode){m.faultMode.diagnosed=true;m.faultMode.diagnosticScore=round(cap.diagnosticAccuracy*100);}
  }
  if(!task.partsConsumed&&task.type==='repair'){
    const part=repairPart(m.id);
    if((w.inventory.materials[part]||0)-(w.inventory.reserved[part]||0)<1){
      x.decisionTh=`ซ่อม ${spec.nameTh} รออะไหล่ ${w.catalog.materials[part].nameTh}`;
      return;
    }
    w.inventory.materials[part]--;
    w.inventory.consumed[part]++;
    x.partsConsumed=x.partsConsumed||{};
    x.partsConsumed[part]=(x.partsConsumed[part]||0)+1;
    task.partsConsumed=true;
    task.partId=part;
  }
  task.workerId=p.id;
  p.activity='working';
  p.intent={code:'equipmentMaintenance',reasons:[spec.nameTh]};
  const station=Object.values(w.layout.stations).find(s=>s.kind==='assembly');
  if(station&&(p.position.x!==station.access.x||p.position.y!==station.access.y)){
    hooks.walk(p,station);
    return;
  }
  task.progress=Math.min(task.required,task.progress+5*cap.speed);
  const ratio=task.progress/task.required;
  task.phase=ratio<0.25?'diagnosis':ratio<0.85?'repair_execution':'return_to_service_test';
  hooks.claim?.(p);
  p.activity='working';
  p.intent={code:'equipmentMaintenance',reasons:[spec.nameTh]};
  p.plantTaskAt=minute;
  hooks.learn?.(p,5);
  if(task.progress>=task.required){
    m.condition=task.type==='install'?(m.acquisitionMode==='used_refurbished'?85:100):Math.min(100,round(cap.postCondition));
    m.subsystems=defaultSubsystems(m.condition);
    m.faultMode=null;
    m.status='ready';
    m.lastPreventiveAt=minute;
    if(m.heldSlots){m.slots=m.heldSlots;delete m.heldSlots;}
    const rec={
      at:minute,
      machineId:m.id,
      machineNameTh:spec.nameTh,
      type:task.type,
      workerId:p.id,
      workerName:p.name,
      partId:task.partId||null,
      diagnosedFaultTh:task.diagnosedFaultTh||'บำรุงรักษาตามเกณฑ์สภาพ',
      postCondition:m.condition,
      returnToServiceTest:'passed'
    };
    x.serviceRecords=x.serviceRecords||[];
    x.serviceRecords.unshift(rec);
    if(x.serviceRecords.length>60)x.serviceRecords.pop();
    log(w,'equipmentMaintained',`${p.name} ${task.type==='install'?'ติดตั้งและทดสอบเดินเครื่อง':'วินิจฉัย/ซ่อมบำรุงและทดสอบความปลอดภัย'} ${spec.nameTh} เสร็จ (${m.condition.toFixed(1)}%)`,{machineId:m.id,workerId:p.id,postCondition:m.condition});
    x.maintenance=x.maintenance.filter(t=>t!==task);
  }
}

function review(w,hooks){
  const x=ensure(w);
  for(const k of requirements(w))if(!x.machines[k]){request(w,k,hooks);break;}
  for(const m of Object.values(x.machines)){
    if(m.condition<55&&m.status==='ready'&&(!Object.keys(m.slots).length||m.condition<25)&&!x.maintenance.some(t=>t.machineId===m.id)){
      const cost=Math.round(SPECS[m.id].cost*.015);
      if(w.finance.cash<cost)continue;
      hooks.pay(cost,'plant:repair:'+m.id+':'+w.clock.absoluteMinute);
      m.heldSlots=m.slots;
      m.slots={};
      m.status='maintenance';
      const fm=m.faultMode||((SPECS[m.id].faultModes&&SPECS[m.id].faultModes[0])||{code:'wear_fault',nameTh:'การสึกหรอของชุดขับเคลื่อนและซีล',subsystem:'mechanical',part:repairPart(m.id)});
      x.maintenance.push({
        id:'repair:'+m.id+':'+w.clock.absoluteMinute,
        machineId:m.id,
        type:'repair',
        phase:'diagnosis',
        progress:0,
        required:m.condition<25?120:45,
        workerId:null,
        partsConsumed:false,
        diagnosedFaultTh:fm.nameTh
      });
      log(w,'equipmentRepairPlanned',`วางแผนซ่อม ${SPECS[m.id].nameTh} (${fm.nameTh})`,{cost,machineId:m.id,faultCode:fm.code});
      break;
    }
  }
}

function toolFor(type){
  return type.startsWith('material:')?materialEquipment(type.slice(9)):['agriculture','harvest','livestock','mining'].includes(type)?'hand_tools':type==='software'?'developer_pc':type==='freight'?'warehouse_tools':serviceEquipment[type];
}

function businessReady(w,type){
  const k=toolFor(type);if(!k)return true;
  const m=w.plant?.machines[k];
  return !!m&&m.status==='ready'&&m.condition>=25;
}

function useBusiness(w,type,minutes){
  const k=toolFor(type);
  const m=ensure(w).machines[k];
  if(!m||m.status!=='ready'||m.condition<25)return false;
  power(w,m,minutes);
  return true;
}

function storageSize(p){
  return /powerwall|grid_rack|drone|agv|motor|cabinet/.test(p.id)?6:/battery|inverter|charger|tray|rail/i.test(p.id)?3:1;
}

function view(w){
  if(!w.plant)return null;
  return {
    ...w.plant,
    specs:SPECS,
    routes:Object.fromEntries(Object.values(w.catalog.products).map(p=>[p.id,route(p)])),
    recipeSpecs:Object.fromEntries(Object.keys(D.MATERIAL_RECIPES||{}).map(k=>[k,recipeSpec(k)]))
  };
}

function validate(w){
  const x=w.plant;if(!x)return [];
  const errors=[],int=n=>Number.isSafeInteger(n)&&n>=0;
  if(x.version!==1||!x.machines||!Array.isArray(x.maintenance))return ['invalid plant structure'];
  for(const [k,m]of Object.entries(x.machines)){
    if(!SPECS[k]||!m||!Number.isFinite(m.condition)||m.condition<0||m.condition>100||!['ready','maintenance','installing'].includes(m.status)||!m.slots||Object.keys(m.slots).length>SPECS[k].capacity||!Number.isFinite(m.temperatureC)||!Number.isFinite(m.totalKwh)||m.totalKwh<0)
      errors.push('invalid equipment '+k);
  }
  for(const m of Object.values(x.machines)){
    for(const slots of [m.slots,m.heldSlots||{}]){
      for(const [jid,v]of Object.entries(slots)){
        const validJob=Boolean(w.jobs[jid]&&w.units[w.jobs[jid].unitId]);
        const validBatch=Boolean(x.refineryBatches?.[jid]&&!['released','cancelled','scrapped'].includes(x.refineryBatches[jid].status));
        if(v!==true||(!validJob&&!validBatch))errors.push('invalid equipment reservation '+jid);
      }
    }
  }
  for(const [id,q]of Object.entries(x.partsConsumed||{}))if(!w.catalog.materials[id]||!int(q))errors.push('invalid repair parts '+id);
  for(const t of x.maintenance)if(!x.machines[t.machineId]||!Number.isFinite(t.progress)||t.progress<0||t.progress>t.required||!Number.isFinite(t.required)||t.required<=0)errors.push('invalid maintenance task');
  for(const [bid,b]of Object.entries(x.refineryBatches||{})){
    if(!b||b.id!==bid||!w.catalog.materials[b.materialId]||!int(b.batches)||b.batches<1||!['planned','inputs_reserved','staged','loading_setup','running','unloading','inspection','rework','released','cancelled','scrapped'].includes(b.status)||(b.inputsReserved&&b.inputsConsumed))
      errors.push('invalid refinery batch '+bid);
  }
  for(const u of Object.values(w.units)){
    if(!u.process)continue;
    const a=u.process,steps=route(w.catalog.products[u.productId]);
    if(a.version!==1||!int(a.index)||a.index>steps.length||!Number.isFinite(a.labor)||a.labor<0||!['labor','machine','complete'].includes(a.phase)||!Array.isArray(a.history))
      errors.push('invalid process '+u.id);
  }
  if(new Set(x.maintenance.map(t=>t.machineId)).size!==x.maintenance.length)errors.push('duplicate maintenance reservation');
  if(!Number.isFinite(x.energyKwh)||x.energyKwh<0||!Number.isFinite(x.billedEnergyKwh)||x.billedEnergyKwh<0||x.billedEnergyKwh>x.energyKwh+.001)errors.push('invalid plant energy');
  return errors;
}

return Object.freeze({
  SPECS,
  route,
  recipeSpec,
  ensure,
  install,
  available,
  workerQualifiedForStep,
  stationFor,
  labor,
  tick,
  tickRefinery,
  enqueueRefineryBatch,
  cancelRefineryBatch,
  request,
  review,
  maintain,
  technicianCapability,
  businessReady,
  useBusiness,
  view,
  validate,
  serviceEquipment,
  materialEquipment,
  toolFor,
  storageSize,
  repairPart
});
});
