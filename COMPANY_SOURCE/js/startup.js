(function(root,factory){const v=factory(typeof module==='object'&&module.exports?require('./plant.js'):root.CompanyPlant);if(typeof module==='object'&&module.exports)module.exports=v;else root.CompanyStartup=v;})(typeof globalThis!=='undefined'?globalThis:this,function(P){
'use strict';
const base={safety:30,mathematics:25};
const office={accounting:40,procurement:35,office_admin:35,inventory_control:30,sales_negotiation:35,business_law:25};
const owner={accounting:40,financial_planning:35,people_management:35,project_management:30,sales_negotiation:35,business_law:30};
const quality={quality:40,metrology:35,quality_documentation:35,warehouse_operations:35,logistics:30};
const crew=(role,subjects,wage=35000)=>({role,subjects:{...base,...subjects},dailyWage:wage});
const PROFILES={
 food_kitchen:{id:'food_kitchen',nameTh:'ครัวน้ำพริกและอาหารบรรจุ',icon:'🌶️',sector:'food',productId:'artisan_chili_paste_jar',capital:10000000,rent:30000,areaM2:45,equipment:['hand_tools','mixer','cooker','warehouse_tools'],crew:[crew('coordinator',owner,40000),crew('assembler',{food_formulation:45,food_safety:45,shelf_life:30,maintenance:20},38000),crew('inspector',{...quality,food_safety:40},35000),crew('admin',office,33000)],learning:{food_preservation:35,cost_accounting:35,market_analysis:35},descriptionTh:'เช่าครัวขนาดเล็ก ซื้อวัตถุดิบแปรรูปจากผู้ขาย มีสูตรพื้นฐานและทีม4คน ไม่ได้ปลูก/สกัดวัตถุดิบเอง'},
 bakery:{id:'bakery',nameTh:'เบเกอรี่ขนาดเล็ก',icon:'🥖',sector:'food',productId:'artisan_bakery',capital:14000000,rent:45000,areaM2:65,equipment:['hand_tools','mixer','oven','warehouse_tools'],crew:[crew('coordinator',owner,42000),crew('assembler',{bakery:45,baking_process:45,food_safety:40,shelf_life:35},38000),crew('assembler',{bakery:35,baking_process:35,food_safety:35},33000),crew('inspector',{...quality,food_safety:40},35000),crew('admin',office,33000)],learning:{bakery:55,food_preservation:35,cost_accounting:35},descriptionTh:'ซื้อแป้ง น้ำมันและบรรจุภัณฑ์ ใช้เตาอบจริง ทีม5คน มีเวลาหมัก/อบและอายุสินค้า ไม่ได้มีโรงสีตั้งต้น'},
 cable_workshop:{id:'cable_workshop',nameTh:'เวิร์กช็อปประกอบชุดสายชาร์จ',icon:'🔌',sector:'electronics',productId:'braided_fast_charge_kit',capital:15000000,rent:45000,areaM2:65,equipment:['hand_tools','electronics_bench','test_rig','warehouse_tools'],crew:[crew('coordinator',owner,42000),crew('engineer',{electrical_basics:45,smt_process:40,electrical_safety:40,circuit_design:35,maintenance:30,research_methods:35},45000),crew('assembler',{electrical_basics:40,smt_process:35,electrical_safety:35,quality:30},35000),crew('inspector',quality,36000),crew('admin',office,33000)],learning:{circuit_design:45,quality:45,cost_accounting:35},descriptionTh:'ประกอบจากบอร์ดสำเร็จและชุดสายไฟที่ซื้อมา ทีม5คน มีเครื่องบัดกรี/ทดสอบ ไม่มีโรงงานชิปหรือความรู้ทุกอุตสาหกรรม'},
 metal_workshop:{id:'metal_workshop',nameTh:'งานประกอบรางและฐานยึดโลหะ',icon:'🔩',sector:'automotive',productId:'solar_mounting_rail_kit',capital:28000000,rent:70000,areaM2:100,equipment:['hand_tools','press','diagnostic_kit','warehouse_tools'],crew:[crew('coordinator',owner,45000),crew('engineer',{metal_machining:45,machining:40,metallurgy:35,mechanical_design:35,maintenance:35,safety:40},48000),crew('assembler',{metal_machining:40,machining:35,safety:35},38000),crew('inspector',{...quality,metrology:40},38000),crew('admin',office,34000)],learning:{tooling:40,mechanical_design:45,cost_accounting:40},descriptionTh:'ซื้อโปรไฟล์และเหล็กสำเร็จมาตัด เจาะ ประกอบและตรวจมิติ ทีม5คน ไม่ได้มีเหมือง/เตาถลุง และรางโลหะไม่ต้องเขียนเฟิร์มแวร์'},
 software_agency:{id:'software_agency',nameTh:'ทีมรับพัฒนาซอฟต์แวร์',icon:'💻',sector:'software',capital:12000000,rent:30000,areaM2:40,equipment:['hand_tools','developer_pc'],crew:[crew('coordinator',{...owner,requirements_analysis:35},42000),crew('engineer',{software:45,programming:45,requirements_analysis:40,software_testing:40,version_control:40,algorithms:35,data_structures:35,research_methods:35},50000),crew('admin',{...office,software_testing:35,requirements_analysis:35},35000)],learning:{software_testing:45,api_design:35,contract_management:30},descriptionTh:'ทีม3คนเช่าออฟฟิศ รับงานจริงเป็นโครงการ เริ่มจากคอมพิวเตอร์และความรู้ของนักพัฒนา ไม่มีSaaSที่เสร็จแล้วหรือลูกค้าฟรี'},
 repair_service:{id:'repair_service',nameTh:'ทีมช่างบำรุงรักษาภาคสนาม',icon:'🧰',sector:'service',serviceType:'field_maintenance',capital:15000000,rent:35000,areaM2:45,equipment:['hand_tools','diagnostic_kit','warehouse_tools'],crew:[crew('coordinator',owner,42000),crew('engineer',{maintenance:45,metal_machining:40,electrical_safety:40,safety:40,metrology:35},48000),crew('inspector',{...quality,maintenance:30,electrical_safety:35},36000),crew('admin',office,33000)],learning:{maintenance:55,metrology:45,contract_management:35},descriptionTh:'ทีม4คนรับตรวจและซ่อมหน้างาน มีเครื่องมือและอะไหล่เบื้องต้น ไม่มีโรงงานหนักหรือใบรับรองแล็บสากลที่ได้มาฟรี'}
};
const REQUIREMENTS={
 artisan_chili_paste_jar:{food_formulation:35,food_safety:35,shelf_life:25,quality:25},
 braided_fast_charge_kit:{electrical_basics:30,smt_process:30,electrical_safety:25,quality:25},
 solar_mounting_rail_kit:{metal_machining:35,metallurgy:25,metrology:30,quality:30,safety:25},
 ev_suspension_kit:{metal_machining:40,mechanical_design:35,metrology:35,quality:35,safety:30},
 ev_battery_tray_assembly:{metal_machining:40,mechanical_design:35,metallurgy:30,metrology:35,quality:35,safety:30}
};
function configure(catalog,id){const p=PROFILES[id];if(!p)throw new TypeError('unknown starting business');
 catalog.starters=p.crew.map((m,i)=>({name:['อรุณ ผู้ก่อตั้ง','มินตรา ชำนาญงาน','ธนา ตั้งใจ','วารี ตรวจดี','ศศิ จัดการ'][i],role:m.role,dailyWage:m.dailyWage}));
 for(const k of Object.keys(catalog.initialStock))catalog.initialStock[k]=0;
 if(p.productId)for(const [k,q]of Object.entries(catalog.products[p.productId].bom))catalog.initialStock[k]=q*16;
 if(p.serviceType)for(const k of ['metal_sheet','wire_harness','polymer_resin','sensor'])catalog.initialStock[k]=4;
 const stockValue=Object.entries(catalog.initialStock).reduce((a,[id,q])=>a+q*catalog.materials[id].unitCost,0),equipmentValue=p.equipment.reduce((a,k)=>a+P.SPECS[k].cost,0),deposit=p.rent*30,license=200000;
 const cash=p.capital-stockValue-equipmentValue-deposit-license;if(cash<=0)throw Error('startup capital insufficient');
 Object.assign(catalog.rules,{initialCash:cash,initialDebt:0,rentDaily:p.rent,creditLimit:Math.min(p.capital,10000000)});
 return {profileId:p.id,nameTh:p.nameTh,sector:p.sector,productId:p.productId||null,serviceType:p.serviceType||null,paidInCapital:p.capital,openingCash:cash,openingStockValue:stockValue,openingEquipmentValue:equipmentValue,leaseDeposit:deposit,registrationValue:license,rentDaily:p.rent,areaM2:p.areaM2,workspace:'leased_shared_campus',learningGoals:{...p.learning},lastLearningDay:0,learningHistory:[],decisionTh:'เริ่มจากงานที่ทีมมีประสบการณ์และเครื่องมือจริง',createdDay:1};
}
function apply(w,startup){const p=PROFILES[startup.profileId];w.startup=startup;w.research.unlocked=p.productId?[p.productId]:[];w.knowledge.projects={};w.knowledge.historicalBlueprints=[...w.research.unlocked];
 w.plant.machines={};for(const k of p.equipment)P.install(w,k,true);
 for(let i=0;i<w.people.length;i++){const person=w.people[i],ed=person.education,hobby=ed.interests?.[0],hobbyLevel=ed.subjects[hobby]||0;ed.subjects={...p.crew[i].subjects};if(hobby&&hobbyLevel>0)ed.subjects[hobby]=Math.max(ed.subjects[hobby]||0,hobbyLevel);ed.course=null;}
 // No opening industrial portfolio, fleet contracts, pre-built software or complimentary paying SaaS users.
 w.softwareBusiness.projects={};for(const a of Object.values(w.softwareBusiness.saasProducts)){a.status='concept';a.version='0.1.0';a.mvpProgressMinutes=0;a.leadCount=0;a.activeSubscribers=0;}
 w.softwareBusiness.workstations.totalStations=p.id==='software_agency'?1:0;
 if(p.productId){w.knowledge.projects['product:'+p.productId]={id:'product:'+p.productId,targetId:p.productId,kind:'product',subject:({artisan_chili_paste_jar:'food_formulation',braided_fast_charge_kit:'electrical_basics',solar_mounting_rail_kit:'metal_machining'})[p.productId]||'bakery',requirements:{...(REQUIREMENTS[p.productId]||{bakery:40,baking_process:35,food_safety:40,shelf_life:30,quality:30})},nameTh:w.catalog.products[p.productId].nameTh,status:'qualified',requiredLevel:35,startedDay:-365,minDays:21,qualifiedDay:0,requiredMinutes:6000,workMinutes:6000,spentSatang:0,qaMinutes:240,prototypeConsumed:true,contributors:{priorProfessionalExperience:6000},reviewerId:'priorWorkshop',lastReasonTh:'สูตร/กระบวนการตั้งต้นจากประสบการณ์ก่อนก่อตั้ง มีค่าเตรียมกิจการในทุนเริ่มต้น',openingKnowHow:true};}
 w.externalWorld.assetPortfolio.supplyChainStrategy='asset_light';
 return startup;
}
function validate(w){const s=w.startup;if(!s)return [];const errors=[];
 if(!PROFILES[s.profileId]||!Number.isSafeInteger(s.paidInCapital)||s.paidInCapital<=0||s.paidInCapital!==s.openingCash+s.openingStockValue+s.openingEquipmentValue+s.leaseDeposit+s.registrationValue)errors.push('startup opening capital reconciliation');
 for(const k of ['openingCash','openingStockValue','openingEquipmentValue','leaseDeposit','registrationValue','rentDaily','areaM2'])if(!Number.isSafeInteger(s[k])||s[k]<0)errors.push('invalid startup '+k);
 if(s.workspace!=='leased_shared_campus'||!Array.isArray(s.learningHistory)||!s.learningGoals||typeof s.learningGoals!=='object'||Array.isArray(s.learningGoals)||Object.values(s.learningGoals).some(v=>!Number.isFinite(v)||v<0||v>100))errors.push('invalid startup state');return errors;
}
function list(){return Object.values(PROFILES).map(p=>({id:p.id,nameTh:p.nameTh,icon:p.icon,descriptionTh:p.descriptionTh,capital:p.capital,people:p.crew.length,sector:p.sector}));}
return Object.freeze({PROFILES,REQUIREMENTS,configure,apply,validate,list});
});
