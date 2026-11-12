(function(root,factory){const v=factory(typeof module==='object'&&module.exports?require('./data.js'):root.CompanyData);if(typeof module==='object'&&module.exports)module.exports=v;else root.CompanyPlant=v;})(typeof globalThis!=='undefined'?globalThis:this,function(D){
'use strict';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const SPECS={
 hand_tools:{nameTh:'ชุดเครื่องมือช่างและโต๊ะเตรียมงาน',cost:350000,capacity:4,kw:.1,subject:'maintenance',level:20},
 electronics_bench:{nameTh:'สถานีบัดกรีและเครื่องวัดวงจร',cost:1200000,capacity:3,kw:.4,subject:'electrical_basics',level:25},
 test_rig:{nameTh:'ชุดทดสอบไฟฟ้าและโหลดจำลอง',cost:900000,capacity:3,kw:.6,subject:'electrical_basics',level:25},
 mixer:{nameTh:'เครื่องผสมอาหาร',cost:850000,capacity:4,kw:1.5,subject:'maintenance',level:25},
 oven:{nameTh:'เตาอบควบคุมอุณหภูมิ',cost:1500000,capacity:6,kw:4,subject:'maintenance',level:30},
 cooker:{nameTh:'หม้อต้มและเครื่องกวนให้ความร้อน',cost:1000000,capacity:5,kw:3,subject:'maintenance',level:25},
 pasteurizer:{nameTh:'เครื่องพาสเจอไรซ์',cost:2600000,capacity:5,kw:5,subject:'maintenance',level:35},
 fermenter:{nameTh:'ถังหมักและตู้บ่มควบคุมสภาวะ',cost:1800000,capacity:8,kw:1,subject:'maintenance',level:30},
 press:{nameTh:'แท่นอัดและเครื่องขึ้นรูปโลหะ',cost:2800000,capacity:3,kw:5,subject:'metal_machining',level:35},
 welder:{nameTh:'เครื่องเชื่อมและฟิกซ์เจอร์ประกอบ',cost:1400000,capacity:3,kw:3,subject:'maintenance',level:30},
 autoclave:{nameTh:'เครื่องนึ่งฆ่าเชื้อและห้องสะอาด',cost:3600000,capacity:6,kw:6,subject:'maintenance',level:40},
 clean_fill:{nameTh:'เครื่องกรองและบรรจุปลอดเชื้อ',cost:2400000,capacity:4,kw:2,subject:'maintenance',level:35},
 cold_room:{nameTh:'ห้องเย็นและระบบตรวจอุณหภูมิ',cost:2000000,capacity:12,kw:2,subject:'maintenance',level:30},
 developer_pc:{nameTh:'เครื่องพัฒนาซอฟต์แวร์และระบบสำรองข้อมูล',cost:180000,capacity:4,kw:.2,subject:'software',level:25},
 diagnostic_kit:{nameTh:'เครื่องมือวินิจฉัยและสอบเทียบภาคสนาม',cost:700000,capacity:3,kw:.2,subject:'metrology',level:25},
 warehouse_tools:{nameTh:'รถเข็น เครื่องชั่งและอุปกรณ์จัดคลัง',cost:450000,capacity:4,kw:.1,subject:'logistics',level:25},
 grain_mill:{nameTh:'โรงสีและเครื่องโม่ธัญพืช',cost:1800000,capacity:4,kw:3,subject:'maintenance',level:30},
 chemical_reactor:{nameTh:'ถังปฏิกรณ์และระบบกลั่นควบคุมสารเคมี',cost:6500000,capacity:3,kw:8,subject:'maintenance',level:40},
 semiconductor_fab:{nameTh:'สายกระบวนการเวเฟอร์และห้องสะอาดเฉพาะทาง',cost:20000000000,capacity:4,kw:20,subject:'maintenance',level:45},
 smelter:{nameTh:'เตาถลุงและเครื่องรีดวัสดุ',cost:4500000,capacity:3,kw:10,subject:'metal_machining',level:40}
};
function stage(nameTh,equipment,share,hold=0,temp=null){return {nameTh,equipment,share,holdMinutes:hold,temperatureC:temp};}
function route(p){const id=p.id;
 if(/croissant|bakery|biscuit/.test(id))return [stage('ชั่งและนวดแป้ง','mixer',.3),stage('พักแป้งและขึ้นรูป','hand_tools',.3,/biscuit/.test(id)?0:45),stage('อบตามอุณหภูมิและพักเย็น','oven',.4,25,180)];
 if(/yogurt|probiotic|synbiotic/.test(id))return [stage('ผสมและเตรียมอาหารเลี้ยงเชื้อ','mixer',.3),stage('พาสเจอไรซ์และลดอุณหภูมิ','pasteurizer',.35,20,72),stage('เพาะเชื้อและบ่ม','fermenter',.35,180,38)];
 if(/saline|wound_dressing/.test(id))return [stage('เตรียมและกรองวัตถุดิบ','clean_fill',.4),stage('บรรจุในพื้นที่ควบคุม','clean_fill',.3),stage('ฆ่าเชื้อและพักเย็น','autoclave',.3,30,121)];
 if(p.industry==='food')return [stage('ชั่งและผสมตามสูตร','mixer',.3),stage(/oil/.test(id)?'แยกและกรองน้ำมัน':'ให้ความร้อนและแปรรูป','cooker',.4,15,90),stage('พักเย็นและเตรียมบรรจุ','hand_tools',.3,10)];
 if(/rail|tray|suspension|motor|agv|Actuator/.test(id))return [stage('เตรียมและขึ้นรูปวัสดุ','press',.4),stage('เชื่อมและประกอบ','welder',.4),stage('ทดสอบมิติและการทำงาน','diagnostic_kit',.2,10)];
 if(/battery|lfp|nmc|powerwall/i.test(id))return [stage('คัดเซลล์และตรวจความปลอดภัย','test_rig',.25),stage('ประกอบโมดูลและระบบป้องกัน','electronics_bench',.45),stage('ทดสอบโหลดและเฝ้าดูอุณหภูมิ','test_rig',.3,60)];
 return [stage('เตรียมชิ้นส่วนและตรวจแบบ','hand_tools',.25),stage('ประกอบและเชื่อมต่อ','electronics_bench',.5),stage('ตั้งค่าและทดสอบเดินเครื่อง','test_rig',.25,5)];
}
const serviceEquipment={calibration_lab:'diagnostic_kit',field_maintenance:'hand_tools',battery_second_life_lab:'test_rig',returnable_pallet_pool:'warehouse_tools',cold_storage_3pl:'cold_room',industrial_recycling:'press',energy_epc_install:'diagnostic_kit',b2b_technical_academy:'developer_pc',wholesale_distribution:'warehouse_tools',toll_smelting_extrusion:'smelter'};
function ensure(w){if(w.plant)return w.plant;w.plant={version:1,machines:{},maintenance:[],history:[],energyKwh:0,billedEnergyKwh:0,partsConsumed:{},decisionTh:'ยังไม่มีแผนซื้อเครื่องใหม่',lastReviewDay:0};for(const k of ['hand_tools','electronics_bench','test_rig','developer_pc','warehouse_tools'])install(w,k,true);return w.plant;}
function install(w,k,opening=false){const x=w.plant;if(!SPECS[k])return null;const m={id:k,condition:100,status:'ready',slots:{},temperatureC:25,totalMinutes:0,totalKwh:0,installedAt:w.clock.absoluteMinute,opening,costSatang:opening?0:SPECS[k].cost};x.machines[k]=m;return m;}
function log(w,type,text,details={}){const x=ensure(w);x.history.unshift({at:w.clock.absoluteMinute,type,text,...details});if(x.history.length>100)x.history.pop();}
function workState(w,j){const u=w.units[j.unitId];if(!u)return null;const steps=route(w.catalog.products[u.productId]);if(!u.process||u.process.version!==1){u.process={version:1,index:0,labor:0,phase:'labor',history:[]};j.progress=0;}return {u,steps,state:u.process,step:steps[u.process.index]};}
function stationFor(w,j){if(j.kind!=='assembly'||!j.unitId)return null;const q=workState(w,j);if(!q?.step)return null;const stations=Object.values(w.layout.stations).filter(s=>s.kind==='assembly').sort((a,b)=>a.id.localeCompare(b.id));if(!stations.length)return null;const n=Object.keys(SPECS).indexOf(q.step.equipment);return stations[n%stations.length].id;}
function available(w,j){if(j.kind!=='assembly'||!j.unitId)return true;const q=workState(w,j);if(!q||!q.step)return true;if(q.state.phase==='machine')return false;const m=ensure(w).machines[q.step.equipment];return !!m&&m.status==='ready'&&m.condition>=25&&(m.slots[j.id]||Object.keys(m.slots).length<SPECS[m.id].capacity);}
function power(w,m,minutes){if(minutes<=5&&m.lastPowerAt===w.clock.absoluteMinute)return;m.lastPowerAt=w.clock.absoluteMinute;const energy=SPECS[m.id].kw*minutes/60;m.totalKwh+=energy;ensure(w).energyKwh+=energy;m.totalMinutes+=minutes;m.condition=Math.max(0,m.condition-minutes*.003);}
function labor(w,j,p,delta,tick){const q=workState(w,j);if(!q||!q.step)return {delta,release:false};const {step,state}=q,m=ensure(w).machines[step.equipment];if(!available(w,j))return {delta:0,release:true};
 m.slots[j.id]=true;const required=j.required*step.share,added=Math.min(delta*(.65+m.condition*.0035),Math.max(0,required-state.labor));state.labor+=added;power(w,m,tick);
 if(state.labor+1e-8>=required){state.workerId=p.id;state.startedAt=w.clock.absoluteMinute;if(step.holdMinutes){state.phase='machine';state.holdDone=0;state.lastTick=w.clock.absoluteMinute;return {delta:added,release:true};}completeStage(w,j,q,m);return {delta:added,release:state.phase!=="complete"};}
 return {delta:added,release:false};
}
function completeStage(w,j,q,m){const s=q.state;s.history.push({nameTh:q.step.nameTh,machineId:m.id,workerId:s.workerId||null,completedAt:w.clock.absoluteMinute,holdMinutes:s.holdDone||0,temperatureC:m.temperatureC});delete m.slots[j.id];s.index++;s.labor=0;s.phase='labor';q.u.processHistory=s.history;q.u.processStep=s.index;if(s.index>=q.steps.length){j.progress=j.required;s.phase='complete';}}
function tick(w,tick){const x=ensure(w);
 const cold=x.machines.cold_room;if(cold?.status==='ready'&&cold.condition>=25&&Object.values(w.units).some(u=>u.stage==='ready'&&w.catalog.products[u.productId]?.industry==='food')){cold.temperatureC+=clamp(4-cold.temperatureC,-tick*2,tick*2);power(w,cold,tick);}

 for(const m of Object.values(x.machines)){for(const slots of [m.slots,m.heldSlots||{}])for(const jid of Object.keys(slots))if(!w.jobs[jid]||!w.units[w.jobs[jid].unitId])delete slots[jid];if(!Object.keys(m.slots).length)m.temperatureC+=clamp(25-m.temperatureC,-tick,tick);}
 for(const j of Object.values(w.jobs)){if(j.kind!=='assembly'||!j.unitId)continue;const q=workState(w,j);if(!q?.step||q.state.phase!=='machine')continue;const m=x.machines[q.step.equipment];if(!m||m.status!=='ready'||m.condition<25||w.utilities?.brownoutActive)continue;
  const dt=Math.min(tick,Math.max(0,w.clock.absoluteMinute-q.state.lastTick));q.state.lastTick=w.clock.absoluteMinute;if(!dt)continue;
  power(w,m,dt);const target=q.step.temperatureC;if(target!==null&&m.lastThermalAt!==w.clock.absoluteMinute){m.temperatureC+=clamp(target-m.temperatureC,-dt*3,dt*3);m.lastThermalAt=w.clock.absoluteMinute;}if(target===null||Math.abs(m.temperatureC-target)<=2)q.state.holdDone+=dt;
  if(q.state.holdDone>=q.step.holdMinutes)completeStage(w,j,q,m);
 }
}
function requirements(w){const ks=new Set();for(const u of Object.values(w.units))for(const s of route(w.catalog.products[u.productId]))ks.add(s.equipment);for(const o of Object.values(w.serviceBusiness?.orders||{}))if(!['paid','cancelled'].includes(o.status)&&serviceEquipment[o.serviceTypeId])ks.add(serviceEquipment[o.serviceTypeId]);return [...ks];}
function repairPart(k){return ['press','welder','smelter','grain_mill','warehouse_tools','hand_tools'].includes(k)?'metal_sheet':['mixer','cooker','pasteurizer','fermenter','cold_room','clean_fill','autoclave','chemical_reactor'].includes(k)?'polymer_resin':'wire_harness';}
function repairSubject(p,k){const s=p.education?.subjects||{};return Math.max(s.maintenance||0,(s[SPECS[k].subject]||0)*.8,(s.electrical_basics||0)*.55);}
function request(w,k,hooks){const x=ensure(w),spec=SPECS[k];if(!spec)return false;if(x.machines[k])return true;const wages=w.people.filter(p=>p.employed).reduce((a,p)=>a+p.pay.dailyWage,0),reserve=wages*18;
 if(spec.cost>5000000&&Object.values(w.production.shipped).reduce((a,n)=>a+n,0)<50){x.decisionTh=`ยังไม่ซื้อ ${spec.nameTh}: ยังไม่มีปริมาณผลิตรองรับ เลือกซื้อวัตถุดิบจากผู้ผลิตภายนอก`;return false;}
 if(w.finance.cash<spec.cost+reserve){x.decisionTh=`ยังไม่ซื้อ ${spec.nameTh}: ต้องเก็บเงินสำรอง18วัน`;return false;}
 hooks.pay(spec.cost,'plant:buy:'+k);install(w,k);x.machines[k].status='installing';x.machines[k].availableAt=w.clock.absoluteMinute+(k==='semiconductor_fab'?180:spec.cost>=5000000?14:spec.cost>=1800000?5:2)*1440;x.maintenance.push({id:'install:'+k,machineId:k,type:'install',progress:0,required:k==='semiconductor_fab'?4320:spec.cost>=5000000?480:spec.cost>=1800000?240:60,workerId:null,partsConsumed:false});log(w,'equipmentPurchased',`ซื้อ ${spec.nameTh} รอช่างติดตั้ง`,{machineId:k,cost:spec.cost});return true;
}
function maintain(w,hooks){const x=ensure(w),minute=w.clock.absoluteMinute;if(minute%5)return;
 const busy=new Set();
 const task=x.maintenance.find(t=>t.progress<t.required);if(!task)return;
 const m=x.machines[task.machineId],spec=SPECS[m.id];if(task.type==='install'&&minute<(m.availableAt||0)){x.decisionTh=`รอส่งมอบ ${spec.nameTh} วันที่ ${Math.floor(m.availableAt/1440)+1}`;return;}if(Object.keys(m.slots).length)return;
 const p=w.people.filter(p=>p.employed&&p.atWork&&!busy.has(p.id)&&!p.path.length&&!(p.breakUntil>minute)&&!['eating','sleeping','resting'].includes(p.activity)&&repairSubject(p,m.id)>=spec.level).sort((a,b)=>repairSubject(b,m.id)-repairSubject(a,m.id))[0];
 if(!p){const learner=w.people.find(p=>p.employed&&p.role==='engineer');if(learner&&learner.education&&!learner.education.course)hooks.train?.(learner,'maintenance',spec.level);x.decisionTh=`${spec.nameTh} รอช่างที่รู้ ${spec.subject} / การซ่อมบำรุง`;return;}
 if(!task.partsConsumed&&task.type==='repair'){
  const part=repairPart(m.id);if((w.inventory.materials[part]||0)-(w.inventory.reserved[part]||0)<1){x.decisionTh=`ซ่อม ${spec.nameTh} รออะไหล่ ${w.catalog.materials[part].nameTh}`;return;}
  w.inventory.materials[part]--;w.inventory.consumed[part]++;x.partsConsumed=x.partsConsumed||{};x.partsConsumed[part]=(x.partsConsumed[part]||0)+1;task.partsConsumed=true;task.partId=part;
 }
 task.workerId=p.id;p.activity='working';p.intent={code:'equipmentMaintenance',reasons:[spec.nameTh]};const apt=p.profile.aptitudes,ability=((apt.analytical||50)+(apt.dexterity??50))/200;const fatigue=Math.max(.3,1-(p.state.fatigue||0)/140);const speed=(.4+repairSubject(p,m.id)/100)*(.7+ability*.6)*fatigue;
 const station=Object.values(w.layout.stations).find(s=>s.kind==='assembly');if(station&&(p.position.x!==station.access.x||p.position.y!==station.access.y)){hooks.walk(p,station);return;}
 task.progress=Math.min(task.required,task.progress+5*speed);hooks.claim?.(p);p.activity='working';p.intent={code:'equipmentMaintenance',reasons:[spec.nameTh]};p.plantTaskAt=minute;
 hooks.learn?.(p,5);
 if(task.progress>=task.required){m.condition=task.type==='install'?100:Math.min(100,75+repairSubject(p,m.id)*.25);m.status='ready';if(m.heldSlots){m.slots=m.heldSlots;delete m.heldSlots;}log(w,'equipmentMaintained',`${p.name} ${task.type==='install'?'ติดตั้ง':'ซ่อม/บำรุง'} ${spec.nameTh} เสร็จ`,{machineId:m.id,workerId:p.id});x.maintenance=x.maintenance.filter(t=>t!==task);}
}
function review(w,hooks){const x=ensure(w);for(const k of requirements(w))if(!x.machines[k]){request(w,k,hooks);break;}
 for(const m of Object.values(x.machines)){if(m.condition<55&&m.status==='ready'&&(!Object.keys(m.slots).length||m.condition<25)&&!x.maintenance.some(t=>t.machineId===m.id)){
  const cost=Math.round(SPECS[m.id].cost*.015);if(w.finance.cash<cost)continue;hooks.pay(cost,'plant:repair:'+m.id+':'+w.clock.absoluteMinute);m.heldSlots=m.slots;m.slots={};m.status='maintenance';x.maintenance.push({id:'repair:'+m.id+':'+w.clock.absoluteMinute,machineId:m.id,type:'repair',progress:0,required:m.condition<25?120:45,workerId:null,partsConsumed:false});log(w,'equipmentRepairPlanned',`วางแผนซ่อม ${SPECS[m.id].nameTh}`,{cost,machineId:m.id});break;
 }}
}
function materialEquipment(id){if(/rice|flour/.test(id))return 'grain_mill';if(/microchip|wafer|optical/.test(id))return 'semiconductor_fab';if(/ore|alumin|steel|billet|silicon/.test(id))return 'smelter';if(/resin|electrolyte|cathode|fertilizer|culture/.test(id))return 'chemical_reactor';if(/sugar|palm|extract|water|compost/.test(id))return 'cooker';if(/pcb|led|sensor|cell|inverter/.test(id))return 'electronics_bench';if(/dough|protein/.test(id))return 'mixer';return 'press';}
function toolFor(type){return type.startsWith('material:')?materialEquipment(type.slice(9)):['agriculture','harvest','livestock','mining'].includes(type)?'hand_tools':type==='software'?'developer_pc':type==='freight'?'warehouse_tools':serviceEquipment[type];}
function businessReady(w,type){const k=toolFor(type);if(!k)return true;const m=w.plant?.machines[k];return !!m&&m.status==='ready'&&m.condition>=25;}
function useBusiness(w,type,minutes){const k=toolFor(type);const m=ensure(w).machines[k];if(!m||m.status!=='ready'||m.condition<25)return false;power(w,m,minutes);return true;}
function storageSize(p){return /powerwall|grid_rack|drone|agv|motor|cabinet/.test(p.id)?6:/battery|inverter|charger|tray|rail/i.test(p.id)?3:1;}
function view(w){if(!w.plant)return null;return {...w.plant,specs:SPECS,routes:Object.fromEntries(Object.values(w.catalog.products).map(p=>[p.id,route(p)]))};}
function validate(w){const x=w.plant;if(!x)return [];const errors=[],int=n=>Number.isSafeInteger(n)&&n>=0;if(x.version!==1||!x.machines||!Array.isArray(x.maintenance))return ['invalid plant structure'];
 for(const [k,m]of Object.entries(x.machines)){if(!SPECS[k]||!m||!Number.isFinite(m.condition)||m.condition<0||m.condition>100||!['ready','maintenance','installing'].includes(m.status)||!m.slots||Object.keys(m.slots).length>SPECS[k].capacity||!Number.isFinite(m.temperatureC)||!Number.isFinite(m.totalKwh)||m.totalKwh<0)errors.push('invalid equipment '+k);}
 for(const m of Object.values(x.machines))for(const slots of [m.slots,m.heldSlots||{}])for(const [jid,v]of Object.entries(slots))if(v!==true||!w.jobs[jid]||!w.units[w.jobs[jid].unitId])errors.push('invalid equipment reservation '+jid);
 for(const [id,q]of Object.entries(x.partsConsumed||{}))if(!w.catalog.materials[id]||!int(q))errors.push('invalid repair parts '+id);
 for(const t of x.maintenance)if(!x.machines[t.machineId]||!Number.isFinite(t.progress)||t.progress<0||t.progress>t.required||!Number.isFinite(t.required)||t.required<=0)errors.push('invalid maintenance task');
 for(const u of Object.values(w.units)){if(!u.process)continue;const a=u.process,steps=route(w.catalog.products[u.productId]);if(a.version!==1||!int(a.index)||a.index>steps.length||!Number.isFinite(a.labor)||a.labor<0||!['labor','machine','complete'].includes(a.phase)||!Array.isArray(a.history))errors.push('invalid process '+u.id);}
 if(new Set(x.maintenance.map(t=>t.machineId)).size!==x.maintenance.length)errors.push('duplicate maintenance reservation');
 if(!Number.isFinite(x.energyKwh)||x.energyKwh<0||!Number.isFinite(x.billedEnergyKwh)||x.billedEnergyKwh<0||x.billedEnergyKwh>x.energyKwh+.001)errors.push('invalid plant energy');return errors;
}
return Object.freeze({SPECS,route,ensure,install,available,stationFor,labor,tick,request,review,maintain,businessReady,useBusiness,view,validate,serviceEquipment,materialEquipment,toolFor,storageSize,repairPart});
});
