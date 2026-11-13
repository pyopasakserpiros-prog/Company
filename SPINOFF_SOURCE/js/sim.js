/* Silicon & Handset v0.3.0: independent, deterministic observer simulation with SKU/lot provenance & company R&D portfolios. Money: integer satang. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./human-core.js'):root.CompanyCore,typeof module==='object'&&module.exports?require('./phone-engineering.js'):root.CompanyPhoneEngineering);if(typeof module==='object'&&module.exports)module.exports=api;else root.SiliconSim=api;})(typeof globalThis!=='undefined'?globalThis:this,function(H,E){
'use strict';
const SUBJECTS=['electronics','software','quality','semiconductor','optics','manufacturing','sales'];
const KINDS=['chip','ram','storage','display','camera','battery','enclosure'];
const ALL_CATEGORIES=['chip','ram','storage','display','camera','battery','enclosure','pcb_rf','os'];
const OUTPUT={chip:['chip'],memory:['ram','storage'],display:['display'],camera:['camera'],battery:['battery'],ems:['enclosure']};
const PRICE={chip:17000,ram:6500,storage:5500,display:10000,camera:6500,battery:7500,enclosure:5000,pcb_rf:3500,os:2500};
const SEGMENTS=[
  {id:'value',name:'ใช้คุ้มค่าและแบตอึด',maxPrice:190000,initialCash:500000000,demand:5,weights:[.25,.55,.1,.1]},
  {id:'photo',name:'ถ่ายภาพและสื่อสาร',maxPrice:330000,initialCash:400000000,demand:4,weights:[.15,.15,.6,.1]},
  {id:'performance',name:'แอปและประสิทธิภาพ',maxPrice:520000,initialCash:300000000,demand:3,weights:[.15,.1,.1,.65]}
];
const RND_TARGETS=Object.freeze([
  {id:'power_efficiency',nameTh:'ประหยัดพลังงานและลดความร้อนสะสม',subject:'semiconductor',tradeoffTh:'ลดกำลังไฟ Idle/Load/Peak ลง 18–24% ยืดอายุแบตเตอรี่และลดความร้อนผิวเครื่อง แต่จำกัดความถี่สูงสุดลงเล็กน้อย (ประมาณการแบบจำลอง)'},
  {id:'compute_performance',nameTh:'ประสิทธิภาพประมวลผลและความเร็วสูงสุด',subject:'semiconductor',tradeoffTh:'เพิ่มความถี่สัญญาณนาฬิกา IPC และกราฟิก 16–25% แต่กินไฟและความร้อนสูงขึ้น ต้องใช้แบตเตอรี่และตัวถังที่รองรับกำลังไฟสูง (ประมาณการแบบจำลอง)'},
  {id:'cost_yield',nameTh:'ลดต้นทุนการผลิตและเพิ่มอัตราของดี (Cost & Yield)',subject:'manufacturing',tradeoffTh:'ลดพื้นที่ดายและต้นทุนต่อหน่วยลง 15–20% เพิ่มความคุ้มค่า แต่สเปกสูงสุดอยู่ในระดับมาตรฐาน (ประมาณการแบบจำลอง)'},
  {id:'camera_optics',nameTh:'คุณภาพเลนส์ เซ็นเซอร์รับแสง และ ISP แสงน้อย',subject:'optics',tradeoffTh:'ขยายพื้นที่รับแสงและรูรับแสง เพิ่มคะแนนถ่ายภาพแสงน้อย 12–20 คะแนน ต้องใช้ชิป ISP และไดรเวอร์ที่รองรับความละเอียด (ประมาณการแบบจำลอง)'},
  {id:'memory_bandwidth',nameTh:'แบนด์วิดท์หน่วยความจำและความเร็วอ่านเขียน',subject:'electronics',tradeoffTh:'เพิ่มแบนด์วิดท์ RAM และความเร็วอ่านเขียน Storage 25–32% ลดคอขวดเว็บและเกม แต่ใช้พลังงานวงจรควบคุมเพิ่มขึ้น (ประมาณการแบบจำลอง)'},
  {id:'thermal_envelope',nameTh:'โครงสร้างระบายความร้อนและความสมบูรณ์สัญญาณบอร์ด',subject:'manufacturing',tradeoffTh:'ลดค่าความต้านทานความร้อน Rth ของตัวถังและเพิ่มเสถียรภาพบอร์ด RF ช่วยให้ชิปทำงานต่อเนื่องไม่ตกสปีด แต่ต้นทุนวัสดุสูงขึ้น (ประมาณการแบบจำลอง)'},
  {id:'battery_life',nameTh:'ความจุพลังงานและวงจรจ่ายไฟกระแสสูง (BMS)',subject:'electronics',tradeoffTh:'เพิ่มความจุ Wh และเพดานจ่ายไฟสูงสุด รองรับชิปแรงสูงและยืดชั่วโมงใช้งาน แต่เพิ่มต้นทุนเซลล์ (ประมาณการแบบจำลอง)'},
  {id:'reliability',nameTh:'ความทนทาน อายุรอบชาร์จ และความเสถียรระบบ',subject:'quality',tradeoffTh:'เพิ่มความทนทานการตกกระแทก รอบอายุการใช้งาน และความสมบูรณ์สัญญาณ ลดโอกาสต้นแบบล้มเหลว (ประมาณการแบบจำลอง)'},
  {id:'os_platform',nameTh:'เคอร์เนล ไดรเวอร์ BSP และประสิทธิภาพแพลตฟอร์ม OS',subject:'software',tradeoffTh:'ลดภาระงานพื้นหลัง (OS Overhead) เพิ่มความปลอดภัยและความครอบคลุมไดรเวอร์โดยไม่ใช้แร่ธาตุต้นน้ำ (ประมาณการแบบจำลอง)'}
]);
const LOT_POLICY=Object.freeze({
  allowImplicitMerge:false,
  identityFields:Object.freeze(['id','skuId','kind','level','revision','designerId','ipOwnerId','manufacturerId','ownerId','location','unitPrice','createdMinute']),
  ruleTh:'แต่ละล็อตมีรหัสและประวัติการผลิตแยกกัน ห้ามรวมล็อตข้าม SKU, Revision, ผู้ผลิต, เจ้าของ, สถานะคลัง หรือราคาต้นทุน'
});

const WORLD_KEYS=new Set(['schema','release','seed','minute','playerFirmId','firms','people','designs','skus','lots','rndProjects','shipments','WIP','offers','events','ledger','nextId','treasury','households','openingCapital','editCapital','materials','segments','settings']);
const clone=x=>JSON.parse(JSON.stringify(x));
function hash(s){let n=2166136261;for(const c of String(s)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;}
const random=(s,id)=>hash(s+':'+id)/4294967296;
const round4=v=>Math.round(v*10000)/10000;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const day=w=>Math.floor(w.minute/1440);
const firm=(w,id)=>w.firms.find(f=>f.id===id);
const person=(w,id)=>w.people.find(p=>p.id===id);
const skuById=(w,id)=>w.skus.find(s=>s.id===id);
const lotById=(w,id)=>w.lots.find(l=>l.id===id);

function event(w,text,firmId=null){
  w.events.push({day:day(w),minute:w.minute,text,firmId});
  if(w.events.length>400)w.events.shift();
}
function transfer(w,a,b,n,reason){
  if(!Number.isSafeInteger(n)||n<0||a.cash<n)return false;
  a.cash-=n;b.cash+=n;
  w.ledger.push({minute:w.minute,from:a.id,to:b.id,amount:n,reason});
  if(w.ledger.length>1200)w.ledger.shift();
  return true;
}

function defaultFocusForFirm(seed,f){
  if(f.role==='chip')return f.id.endsWith('-alt')?'compute_performance':'power_efficiency';
  if(f.role==='memory')return f.id.endsWith('-alt')?'cost_yield':'memory_bandwidth';
  if(f.role==='camera')return f.id.endsWith('-alt')?'reliability':'camera_optics';
  if(f.role==='display')return f.id.endsWith('-alt')?'compute_performance':'power_efficiency';
  if(f.role==='battery')return f.id.endsWith('-alt')?'reliability':'battery_life';
  if(f.role==='ems')return f.id.endsWith('-alt')?'cost_yield':'thermal_envelope';
  const brandTargets=['power_efficiency','compute_performance','camera_optics','cost_yield','thermal_envelope'];
  return brandTargets[(f.index+hash(seed+':focus:'+f.id))%brandTargets.length];
}

function skuPrefix(f,kind){
  const tag=f.id.replace(/[^a-zA-Z0-9]/g,'').toUpperCase().slice(0,6)||'FIRM';
  const kTag={chip:'SOC',ram:'RAM',storage:'NAND',display:'PNL',camera:'CAM',battery:'BAT',enclosure:'ENC',pcb_rf:'PCB',os:'OS'}[kind]||kind.toUpperCase();
  return `${tag}-${kTag}`;
}

function applyFocusTradeoffs(kind,baseSpec,focus,level,skillBonus=0){
  const s=clone(baseSpec);
  const boost=clamp(skillBonus/250,0,0.12);
  if(focus==='baseline')return s;
  if(kind==='chip'){
    if(focus==='compute_performance'){
      s.clockGhz=round4(s.clockGhz*(1.18+boost));
      s.ipcIndex=round4(s.ipcIndex*(1.10+boost*0.5));
      s.gpuGflops=round4(s.gpuGflops*1.22);
      s.loadW=round4(s.loadW*1.22);
      s.peakW=round4(s.peakW*1.24);
      s.dieAreaMm2=round4(s.dieAreaMm2*1.10);
      s.maskCostSatang=Math.round(s.maskCostSatang*1.15);
      s.focus='performance';
    }else if(focus==='power_efficiency'){
      s.clockGhz=round4(s.clockGhz*0.96);
      s.idleW=round4(Math.max(0.01,s.idleW*0.76));
      s.loadW=round4(Math.max(0.05,s.loadW*0.78));
      s.peakW=round4(Math.max(0.08,s.peakW*0.80));
      s.latencyNs=round4(s.latencyNs*0.96);
      s.focus='low_power';
    }else if(focus==='cost_yield'){
      s.dieAreaMm2=round4(Math.max(6,s.dieAreaMm2*0.84));
      s.clockGhz=round4(s.clockGhz*0.94);
      s.loadW=round4(s.loadW*0.92);
      s.peakW=round4(s.peakW*0.92);
      s.maskCostSatang=Math.round(s.maskCostSatang*0.82);
      s.focus='budget_yield';
    }else if(focus==='camera_optics'){
      s.ispMpLimit=Math.round((s.ispMpLimit||4)*1.5);
      s.npuTops=round4((s.npuTops||0)+0.8+level*0.4);
      s.loadW=round4(s.loadW*1.05);
      s.peakW=round4(s.peakW*1.06);
      s.focus='ai_isp';
    }
  }else if(kind==='ram'){
    if(focus==='memory_bandwidth'||focus==='compute_performance'){
      s.bandwidthGBps=round4(s.bandwidthGBps*(1.28+boost));
      s.latencyNs=round4(Math.max(10,s.latencyNs*0.84));
      s.powerMw=round4(s.powerMw*1.15);
    }else if(focus==='power_efficiency'||focus==='cost_yield'){
      s.powerMw=round4(Math.max(18,s.powerMw*0.78));
      s.bandwidthGBps=round4(s.bandwidthGBps*0.95);
    }
  }else if(kind==='storage'){
    if(focus==='memory_bandwidth'||focus==='compute_performance'){
      s.readMBps=round4(s.readMBps*(1.30+boost));
      s.writeMBps=round4(s.writeMBps*(1.28+boost));
      s.enduranceCycles=Math.round(s.enduranceCycles*1.12);
    }else if(focus==='reliability'||focus==='cost_yield'){
      s.enduranceCycles=Math.round(s.enduranceCycles*(1.35+boost));
      s.readMBps=round4(s.readMBps*0.96);
    }
  }else if(kind==='camera'){
    if(focus==='camera_optics'){
      s.sensorAreaMm2=round4(s.sensorAreaMm2*(1.32+boost));
      s.fNumber=round4(Math.max(1.4,s.fNumber-0.22));
      s.processingQuality=round4(Math.min(0.98,s.processingQuality*(1.20+boost)));
      s.lowLightScore=round4(clamp(s.lowLightScore+14+boost*25,10,99));
    }else if(focus==='reliability'||focus==='cost_yield'){
      s.hasOis=level>=1?1:s.hasOis;
      s.processingQuality=round4(Math.min(0.95,s.processingQuality*1.06));
    }
  }else if(kind==='display'){
    if(focus==='compute_performance'){
      s.brightnessNits=Math.round(s.brightnessNits*1.20);
      s.refreshHz=level>=2?120:90;
      s.watts=round4(s.watts*1.16);
    }else if(focus==='power_efficiency'||focus==='cost_yield'){
      s.watts=round4(Math.max(0.08,s.watts*0.78));
      s.brightnessNits=Math.round(s.brightnessNits*0.96);
    }
  }else if(kind==='battery'){
    if(focus==='battery_life'){
      s.wh=round4(s.wh*(1.20+boost));
      s.maxDischargeW=round4(s.maxDischargeW*1.24);
      s.cycleLife=Math.round(s.cycleLife*1.10);
    }else if(focus==='reliability'){
      s.protectionScore=round4(clamp(s.protectionScore+12,40,99));
      s.cycleLife=Math.round(s.cycleLife*1.28);
      s.maxDischargeW=round4(s.maxDischargeW*1.12);
    }
  }else if(kind==='enclosure'){
    if(focus==='thermal_envelope'){
      s.rth=round4(Math.max(1.5,s.rth*0.76));
      s.dropResistanceScore=round4(clamp(s.dropResistanceScore+8,35,99));
      s.material=level>=1?'aluminium_graphite':s.material;
    }else if(focus==='cost_yield'){
      s.rth=round4(s.rth*1.06);
      s.dropResistanceScore=round4(clamp(s.dropResistanceScore+2,35,98));
    }
  }else if(kind==='pcb_rf'){
    if(focus==='thermal_envelope'||focus==='reliability'){
      s.signalIntegrity=round4(clamp(s.signalIntegrity+0.06,0.5,0.99));
      s.emiShieldingScore=round4(clamp(s.emiShieldingScore+10,40,99));
      s.maxPowerDeliveryW=round4(s.maxPowerDeliveryW*1.25);
    }else if(focus==='cost_yield'){
      s.signalIntegrity=round4(clamp(s.signalIntegrity-0.02,0.55,0.99));
    }
  }else if(kind==='os'){
    if(focus==='os_platform'||focus==='power_efficiency'){
      s.overhead=round4(Math.max(0.015,s.overhead*0.72));
      s.securityScore=round4(clamp(s.securityScore+10,30,99));
      s.driverCoverage=1;
    }
  }
  return s;
}

function registerSku(w,params){
  const {firmObj,kind,level,revision=1,focus='balanced',leadEngineerId=null,licenseMode='owned',manufacturerId=firmObj.id,ipOwnerId=firmObj.id,skillBonus=0}=params;
  const existing=w.skus.find(s=>s.designerId===firmObj.id&&s.kind===kind&&s.level===level&&s.revision===revision);
  if(existing)return existing;
  const seed=w.seed+':'+firmObj.id+':'+level+(revision>1?':r'+revision:'');
  const baseCap=45+level*10;
  const rawSpec=kind==='chip'?E.synthesizeChip(seed,baseCap,{level}):E.synthesizeComponent(seed,kind,baseCap,level);
  const specObj=applyFocusTradeoffs(kind,rawSpec,focus,level,skillBonus);
  const focusMeta=RND_TARGETS.find(t=>t.id===focus);
  const costFactor=focus==='cost_yield'?0.86:focus==='compute_performance'?1.16:focus==='camera_optics'?1.12:focus==='thermal_envelope'?1.10:1;
  const unitCostEstimate=Math.round((PRICE[kind]||5000)*(1+level)*costFactor);
  const id=`sku-${kind}-${firmObj.id}-g${level}-r${revision}`;
  const code=`${skuPrefix(firmObj,kind)}-G${level}R${revision}`;
  const kindNameTh={chip:'ชิป SoC',ram:'หน่วยความจำ RAM',storage:'สตอเรจแฟลช',display:'แผงหน้าจอ',camera:'โมดูลกล้อง',battery:'แบตเตอรี่ BMS',enclosure:'โครงตัวถังระบายความร้อน',pcb_rf:'บอร์ด HDI/RF',os:'แพลตฟอร์ม OS/BSP'}[kind]||kind;
  const sku={
    id,
    code,
    name:`${firmObj.name} ${kindNameTh} G${level} Rev.${revision}${focusMeta?' ('+focusMeta.nameTh.split(' ')[0]+')':''}`,
    kind,
    level,
    revision,
    focus,
    designerId:firmObj.id,
    ipOwnerId,
    manufacturerId:kind==='os'?null:manufacturerId,
    licenseMode,
    isSoftware:kind==='os',
    fabricationChain:kind==='chip'?{
      designFirmId:firmObj.id,
      foundryMode:firmObj.id.endsWith('-alt')?'contract_wafer_foundry':'integrated_wafer_line',
      osatPartnerId:'supplier-ems',
      dieYieldEstimate:round4(E.wafer({dieAreaMm2:specObj.dieAreaMm2}).dieYield)
    }:null,
    spec:specObj,
    unitCostEstimate,
    qualified:true,
    qualification:{
      passed:true,
      minute:w.minute,
      targetFocus:focus,
      leadEngineerId:leadEngineerId||firmObj.people[0]||null,
      summaryTh:focus==='baseline'?'ผ่านเกณฑ์มาตรฐานอุตสาหกรรมเริ่มต้น':(focusMeta?focusMeta.tradeoffTh:'ผ่านการทดสอบความเข้ากันได้และขีดจำกัดวิศวกรรม'),
      constraintsChecked:['interface','power','thermal','yield']
    },
    createdMinute:w.minute
  };
  w.skus.push(sku);
  return sku;
}

function ensureSupplierSku(w,supplier,kind,level){
  const matching=w.skus.filter(s=>s.manufacturerId===supplier.id&&s.kind===kind&&s.level===level&&s.qualified);
  if(matching.length)return matching.at(-1);
  const hasRndForLevel=supplier.rndPortfolio?.completedProjects?.some(p=>p.targetKind===kind&&p.targetLevel===level);
  const focus=hasRndForLevel?(supplier.rndPortfolio?.philosophy||defaultFocusForFirm(w.seed,supplier)):'baseline';
  return registerSku(w,{firmObj:supplier,kind,level,revision:1,focus});
}

function syncAuthorizedFixtureStock(w){
  if(!Array.isArray(w?.lots)||!Array.isArray(w?.firms))return;
  const stockFromMap=w.firms.reduce((n,f)=>n+Object.values(f.stock||{}).reduce((a,q)=>a+(Number.isSafeInteger(q)&&q>=0?q:0),0),0);
  const stockFromLots=w.lots.filter(l=>l.location==='stock').reduce((n,l)=>n+l.quantity,0);
  const inTransit=w.shipments.filter(s=>s.key!=='raw').reduce((n,s)=>n+s.quantity,0);
  const expectedTotal=w.materials.componentOpening+w.firms.filter(f=>f.role!=='brand').reduce((n,f)=>n+f.production,0);
  // Only reconcile if the caller lawfully adjusted both f.stock and w.materials.componentOpening in lockstep.
  if(stockFromMap+inTransit+w.materials.componentsConsumed!==expectedTotal)return;
  if(stockFromMap===stockFromLots){
    let anyDiff=false;
    for(const f of w.firms){
      for(const [key,q] of Object.entries(f.stock||{})){
        const [kind,lvStr]=key.split(':');
        const lv=Number(lvStr);
        const lotSum=w.lots.filter(l=>l.ownerId===f.id&&l.location==='stock'&&l.kind===kind&&l.level===lv).reduce((n,l)=>n+l.quantity,0);
        if(q!==lotSum){anyDiff=true;break;}
      }
      if(anyDiff)break;
    }
    if(!anyDiff)return;
  }
  for(const f of w.firms){
    for(const [key,targetQty] of Object.entries(f.stock||{})){
      if(!Number.isSafeInteger(targetQty)||targetQty<0)continue;
      const [kind,lvStr]=key.split(':');
      const level=Number(lvStr);
      if(!KINDS.includes(kind)||!Number.isInteger(level))continue;
      const lots=w.lots.filter(l=>l.ownerId===f.id&&l.location==='stock'&&l.kind===kind&&l.level===level);
      const currentQty=lots.reduce((a,l)=>a+l.quantity,0);
      if(currentQty===targetQty)continue;
      if(targetQty<currentQty){
        let rem=currentQty-targetQty;
        for(const l of lots){
          const take=Math.min(rem,l.quantity);
          l.quantity-=take;rem-=take;
          if(l.quantity===0)w.lots.splice(w.lots.indexOf(l),1);
          if(!rem)break;
        }
      }else{
        const diff=targetQty-currentQty;
        const supplier=(OUTPUT[f.role]||[]).includes(kind)?f:w.firms.find(s=>(OUTPUT[s.role]||[]).includes(kind)&&s.capability>=level)||w.firms.find(s=>(OUTPUT[s.role]||[]).includes(kind));
        const sku=ensureSupplierSku(w,supplier,kind,level);
        w.lots.push({
          id:'lot-'+w.nextId++,
          skuId:sku.id,
          kind,
          level,
          revision:sku.revision,
          focus:sku.focus,
          designerId:sku.designerId,
          ipOwnerId:sku.ipOwnerId,
          manufacturerId:sku.manufacturerId,
          ownerId:f.id,
          location:'stock',
          quantity:diff,
          unitPrice:PRICE[kind]*(1+level),
          createdMinute:w.minute,
          shipmentId:null,
          wipId:null,
          designId:null
        });
      }
    }
  }
}

function createLot(w,params){
  const {sku,ownerId,location='stock',quantity,unitPrice,shipmentId=null,wipId=null,designId=null}=params;
  const lot={
    id:'lot-'+w.nextId++,
    skuId:sku.id,
    kind:sku.kind,
    level:sku.level,
    revision:sku.revision,
    focus:sku.focus,
    designerId:sku.designerId,
    ipOwnerId:sku.ipOwnerId,
    manufacturerId:sku.manufacturerId,
    ownerId,
    location,
    quantity,
    unitPrice:unitPrice??sku.unitCostEstimate,
    createdMinute:w.minute,
    shipmentId,
    wipId,
    designId
  };
  w.lots.push(lot);
  if(location==='stock'){
    const f=firm(w,ownerId);
    if(f){
      const key=sku.kind+':'+sku.level;
      f.stock[key]=(f.stock[key]||0)+quantity;
    }
  }
  return lot;
}

function debitStockLots(w,ownerFirm,kind,level,quantity,preferredSkuId=null){
  const candidates=w.lots.filter(l=>l.ownerId===ownerFirm.id&&l.location==='stock'&&l.kind===kind&&l.level===level&&l.quantity>0)
    .sort((a,b)=>(preferredSkuId?(b.skuId===preferredSkuId)-(a.skuId===preferredSkuId):0)||a.createdMinute-b.createdMinute||a.id.localeCompare(b.id));
  const avail=candidates.reduce((n,l)=>n+l.quantity,0);
  if(avail<quantity)return null;
  let rem=quantity;
  const taken=[];
  for(const l of candidates){
    if(!rem)break;
    const take=Math.min(rem,l.quantity);
    l.quantity-=take;
    rem-=take;
    taken.push({sourceLotId:l.id,skuId:l.skuId,kind:l.kind,level:l.level,revision:l.revision,focus:l.focus,designerId:l.designerId,ipOwnerId:l.ipOwnerId,manufacturerId:l.manufacturerId,quantity:take,unitPrice:l.unitPrice});
    if(l.quantity===0)w.lots.splice(w.lots.indexOf(l),1);
  }
  const key=kind+':'+level;
  ownerFirm.stock[key]=(ownerFirm.stock[key]||0)-quantity;
  return taken;
}

function evaluateSkuCompatibility(chipSpec,partsSpec){
  const base=E.evaluate(chipSpec,partsSpec);
  const reasonsTh=[...base.reasonsTh];
  const cam=partsSpec?.camera||{},batt=partsSpec?.battery||{},enc=partsSpec?.enclosure||{};
  if(typeof cam.megapixels==='number'&&typeof chipSpec?.ispMpLimit==='number'&&cam.megapixels>chipSpec.ispMpLimit*1.5){
    reasonsTh.push('ความละเอียดเซ็นเซอร์กล้องเกินขีดจำกัด ISP ของชิปประมวลผล');
  }
  if(typeof batt.wh==='number'&&typeof enc.rth==='number'&&batt.wh>18&&enc.rth>5.5){
    reasonsTh.push('ขนาดความจุแบตเตอรี่และการระบายความร้อนไม่สมดุลกับโครงสร้างตัวถัง');
  }
  const compatible=reasonsTh.length===0;
  return {
    ...base,
    compatible,
    reasonsTh,
    taskScores:compatible?base.taskScores:{call:0,web:0,game:0},
    photoLowLightScore:compatible?base.photoLowLightScore:0,
    displayQualityScore:compatible?base.displayQualityScore:0,
    bottleneckSummaryTh:!compatible?reasonsTh[0]:base.bottleneckSummaryTh
  };
}

function create(seed='silicon-1',options={}){
  seed=String(seed);
  const w={
    schema:3,
    release:'0.3.0',
    seed,
    minute:0,
    playerFirmId:'player',
    firms:[],
    people:[],
    designs:[],
    skus:[],
    lots:[],
    rndProjects:[],
    shipments:[],
    WIP:[],
    offers:[],
    events:[],
    ledger:[],
    nextId:1,
    treasury:{id:'upstream',cash:500000000,stock:100000},
    households:{id:'households',cash:1200000000,purchases:0},
    openingCapital:0,
    editCapital:0,
    materials:{opening:100000,consumed:0,componentOpening:0,componentsConsumed:0},
    segments:SEGMENTS.map(s=>({...s,cash:s.initialCash,purchases:0,spent:0,lastDemand:0,lastSales:0,unmet:0,results:[]})),
    settings:{market:true,recruitment:true}
  };
  const count=4+hash(seed)%5;
  const names=['นที','อรุณ','เมฆา','ศิลา','ดาวเหนือ','ลานนา','คีรี','บุษบา'];
  const familyNames=['ศรีสุวรรณ','วัฒนกุล','รุ่งเรือง','จิตรมั่น','สุขสวัสดิ์','ธาราทิพย์','เกียรติไพศาล','แสงอรุณ','วงศ์ประเสริฐ','รัตนชัย','ใจดี','ชาญวิทย์','พงศ์เจริญ','อินทรรักษ์','พรหมพิทักษ์','กิตติธร'];
  const companyBases=['อรุณ','ธารา','นภา','ศิลา','สุริยา','คีรี','จันทรา','วารี','นที','เมฆา','บุษบา','รัตนา'];
  const companySuffixes=['ก้าวหน้า','รุ่งเรือง','สร้างสรรค์','วิชั่น','อินโนเวชัน','พัฒนา','ไพศาล','ก้าวไกล','เจริญ','ประสาน'];
  const businessNames={brand:'โมบาย',chip:'เซมิคอนดักเตอร์',memory:'เมมโมรี',display:'จอภาพ',camera:'ออปติกส์',battery:'พลังเซลล์',ems:'งานประกอบ'};
  const personName=id=>names[hash(seed+id+'given')%names.length]+' '+familyNames[hash(seed+id+'family')%familyNames.length];
  function companyName(id,role){
    let n=hash(seed+id+'company')%(companyBases.length*companySuffixes.length),candidate;
    do{
      candidate=companyBases[n%companyBases.length]+' '+companySuffixes[Math.floor(n/companyBases.length)]+' '+businessNames[role];
      n=(n+1)%(companyBases.length*companySuffixes.length);
    }while(w.firms.some(f=>f.name===candidate));
    return candidate;
  }

  function add(id,name,role,index){
    if(id!=='player')name=companyName(id,role);
    const f={
      id,
      name,
      role,
      cash:Math.round((role==='brand'?35000000:50000000)*(0.8+random(seed,id+'capital')*.8)),
      stock:{},
      people:[],
      products:[],
      project:null,
      decision:'เตรียมทีมและสำรวจตลาด',
      capability:0,
      research:0,
      workDone:0,
      raw:role==='brand'?0:100+Math.floor(random(seed,id+'raw')*120),
      paidToday:false,
      production:0,
      sales:0,
      revenue:0,
      costs:0,
      history:[],
      salesWork:0,
      strategy:null,
      procurement:[],
      supplyTerms:{priceBps:8000+Math.floor(random(seed,id+'quote')*4500),leadHours:12+Math.floor(random(seed,id+'lead')*61)},
      rndPortfolio:null,
      sourcingDecision:null,
      index
    };
    f.rndPortfolio={
      philosophy:defaultFocusForFirm(seed,f),
      activeProjectId:null,
      completedProjects:[],
      cancelledProjects:[],
      sunkCostSatang:0,
      lastBlockReason:null
    };
    w.firms.push(f);
    w.materials.opening+=f.raw;
    for(let j=0;j<3+Math.floor(random(seed,id+'team')*3);j++){
      const pid=id+'-p'+j,profile=H.createProfile(seed,pid),p={
        id:pid,
        name:personName(pid),
        employerId:id,
        role:j===0?'ceo':'engineer',
        profile,
        state:H.createState(profile),
        subjects:{},
        cash:100000,
        wage:14000+Math.floor(random(seed,pid)*7000),
        activity:'sleep',
        position:{x:20+index*65,y:120},
        notice:null,
        workMinutes:0,
        unpaidDays:0
      };
      for(const s of SUBJECTS){
        p.subjects[s]=Math.min(p.profile.potential.memory,18+Math.floor(random(seed,pid+s)*42)+(s===(role==='chip'?'semiconductor':role==='camera'?'optics':role==='brand'?'electronics':'manufacturing')?16:0));
      }
      f.people.push(pid);
      w.people.push(p);
    }
    if(role!=='brand'){
      for(const k of OUTPUT[role]){
        const sku=registerSku(w,{firmObj:f,kind:k,level:0,revision:1,focus:f.rndPortfolio.philosophy});
        const q=18+Math.floor(random(seed,id+k+'stock')*24);
        createLot(w,{sku,ownerId:f.id,location:'stock',quantity:q,unitPrice:PRICE[k]});
        w.materials.componentOpening+=q;
      }
      if(role==='ems'){
        registerSku(w,{firmObj:f,kind:'pcb_rf',level:0,revision:1,focus:f.rndPortfolio.philosophy});
      }
    }else{
      registerSku(w,{firmObj:f,kind:'os',level:0,revision:1,focus:'os_platform',licenseMode:'open_rtos'});
    }
  }

  const playerRole=['brand',...Object.keys(OUTPUT)].includes(options.role)?options.role:'brand';
  add('player',playerRole==='brand'?'สยามโทรศัพท์ SME':'สยาม '+playerRole+' SME',playerRole,0);
  for(let i=0;i<count;i++)add('rival-'+i,names[(i+hash(seed+'names'))%names.length]+' โมบาย','brand',i+1);
  for(const [i,r] of ['chip','memory','display','camera','battery','ems'].entries()){
    add('supplier-'+r,{chip:'อิสระเซมิคอนดักเตอร์',memory:'ธาราเมมโมรี',display:'แสงจอภาพ',camera:'เลนส์สยาม',battery:'พลังเซลล์',ems:'ร่วมประกอบ EMS'}[r],r,count+i+1);
  }
  for(const [i,r] of Object.keys(OUTPUT).entries())add('supplier-'+r+'-alt','',r,count+7+i);
  for(let i=0;i<8;i++){
    let p=clone(w.people[1]);
    p.id='outside-'+i;
    p.name=personName(p.id);
    p.employerId=null;
    p.profile=H.createProfile(seed,p.id);
    p.state=H.createState(p.profile);
    p.subjects={};
    for(const s of SUBJECTS)p.subjects[s]=45+Math.floor(random(seed,p.id+s)*25);
    p.notice=null;
    w.people.push(p);
  }
  // All opening endowments are explicit paid capital; goods have an opening cost.
  for(const f of w.firms){
    const price=f.raw*1200+Object.entries(f.stock).reduce((n,[k,q])=>n+q*PRICE[k.split(':')[0]],0);
    transfer(w,f,w.treasury,price,'opening paid stock');
  }
  w.openingCapital=totalCash(w);
  event(w,'โลกใหม่: ทุกบริษัทเริ่มจากเทคโนโลยีฟีเจอร์โฟน มีพอร์ตวิจัยและล็อตชิ้นส่วนของตนเอง');
  return w;
}

function totalCash(w){
  return w.treasury.cash+w.households.cash+w.firms.reduce((a,f)=>a+f.cash,0)+w.people.reduce((a,p)=>a+p.cash,0);
}

function supplierQuotes(w,buyerId,kind,level){
  const buyer=firm(w,buyerId);
  if(!buyer||!KINDS.includes(kind)||!Number.isInteger(level)||level<0||level>3)return [];
  const ceo=person(w,buyer.people[0]),patience=ceo?.profile.personality.patience??50;
  const key=kind+':'+level;
  return w.firms.filter(s=>s.id!==buyerId&&(OUTPUT[s.role]||[]).includes(kind)&&s.capability>=level).map(s=>{
    const stock=s.stock[key]||0;
    const sku=w.skus.filter(x=>x.manufacturerId===s.id&&x.kind===kind&&x.level===level&&x.qualified).at(-1);
    const lots=w.lots.filter(l=>l.ownerId===s.id&&l.location==='stock'&&l.kind===kind&&l.level===level&&l.quantity>0);
    const unitPrice=Math.round(PRICE[kind]*(1+level)*s.supplyTerms.priceBps/10000*(stock<12?1.12:1));
    const leadMinutes=s.supplyTerms.leadHours*60;
    return {
      sellerId:s.id,
      key,
      skuId:sku?.id||`sku-${kind}-${s.id}-g${level}-r1`,
      skuCode:sku?.code||`${skuPrefix(s,kind)}-G${level}R1`,
      revision:sku?.revision||1,
      focus:sku?.focus||s.rndPortfolio?.philosophy||'balanced',
      lotIds:lots.map(l=>l.id),
      stock,
      unitPrice,
      leadMinutes,
      score:unitPrice+Math.round(leadMinutes/60*(110-patience)*8)
    };
  }).sort((a,b)=>a.score-b.score||a.sellerId.localeCompare(b.sellerId));
}

function acquire(w,f,level,target,design=null){
  f.procurement=[];
  for(const k of KINDS){
    const key=k+':'+level;
    const owned=f.stock[key]||0;
    const pending=w.shipments.filter(s=>s.to===f.id&&s.key===key).reduce((a,s)=>a+s.quantity,0);
    let need=Math.max(0,target-owned-pending);
    if(!need)continue;
    const quotes=supplierQuotes(w,f.id,k,level);
    const record={key,needed:need,orders:[],alternatives:quotes,unfilled:need};
    for(const quote of quotes){
      const seller=firm(w,quote.sellerId);
      const sku=ensureSupplierSku(w,seller,k,level);
      const q=Math.min(need,quote.stock,Math.floor(f.cash/quote.unitPrice));
      const cost=q*quote.unitPrice;
      if(q&&transfer(w,f,seller,cost,'ซื้อ '+k+' ('+sku.code+')')){
        const debited=debitStockLots(w,seller,k,level,q,sku.id);
        seller.revenue+=cost;
        f.costs+=cost;
        const usedSku=debited&&debited[0]?skuById(w,debited[0].skuId)||sku:sku;
        const shipId='s'+w.nextId++;
        const transitLot=createLot(w,{
          sku:usedSku,
          ownerId:f.id,
          location:'transit',
          quantity:q,
          unitPrice:quote.unitPrice,
          shipmentId:shipId,
          designId:design?.id||null
        });
        w.shipments.push({
          id:shipId,
          from:seller.id,
          to:f.id,
          key,
          skuId:usedSku.id,
          skuCode:usedSku.code,
          revision:usedSku.revision,
          lotId:transitLot.id,
          quantity:q,
          unitPrice:quote.unitPrice,
          eta:w.minute+quote.leadMinutes
        });
        record.orders.push({
          sellerId:seller.id,
          skuId:usedSku.id,
          skuCode:usedSku.code,
          lotId:transitLot.id,
          quantity:q,
          unitPrice:quote.unitPrice,
          leadMinutes:quote.leadMinutes
        });
        need-=q;
      }
      if(!need)break;
    }
    record.unfilled=need;
    record.reason=need?'ของพร้อมขายหรือเงินยังไม่พอ รอประเมินรอบทำงานถัดไป':'เลือกต้นทุนรวมเวลารอและล็อตชิ้นส่วนที่เข้ากันได้ ตามความอดทนผู้บริหาร';
    f.procurement.push(record);
  }
}

function estimatedCost(w,f,level){
  return 32000+KINDS.reduce((n,k)=>{
    const q=supplierQuotes(w,f.id,k,level).filter(q=>q.stock>0);
    return n+(q[0]?.unitPrice||Math.round(PRICE[k]*(1+level)*1.12));
  },0);
}

function evaluateSourcingDecision(w,f,level){
  const ceo=person(w,f.people[0]);
  const prudence=ceo?.profile.personality.prudence??50;
  const riskTaking=ceo?.profile.personality.riskTaking??50;
  const maxElec=Math.max(0,...f.people.map(id=>person(w,id)?.subjects.electronics||0));
  const maxSw=Math.max(0,...f.people.map(id=>person(w,id)?.subjects.software||0));
  const customNre=160000*(level+1);
  const reserve=Math.round(450000+prudence*6000);
  const canCustom=f.cash>=reserve+customNre&&maxElec>=35&&maxSw>=30;
  const declinesPrudently=canCustom&&(prudence>68||riskTaking<42)&&f.cash<(reserve+customNre)*1.6;
  const chosenMode=!canCustom?'buy_merchant_sku':declinesPrudently?'license_and_buy_prudent':'co_develop_custom_sku';
  return {
    minute:w.minute,
    chosenMode,
    feasibleModes:canCustom?['buy_merchant_sku','license_and_buy_prudent','co_develop_custom_sku']:['buy_merchant_sku'],
    infeasibleModes:canCustom?[]:[{
      mode:'co_develop_custom_sku',
      reasonTh:f.cash<reserve+customNre?`ไม่ผ่านเกณฑ์ทุน: ต้องใช้ NRE และเงินสำรองรวม ${Math.round((reserve+customNre)/100).toLocaleString('th-TH')} บาท`:'ไม่ผ่านเกณฑ์ความรู้: ขาดวิศวกรอิเล็กทรอนิกส์/ซอฟต์แวร์ระดับ 35+'
    }],
    declinedFeasibleModes:declinesPrudently?[{
      mode:'co_develop_custom_sku',
      reasonTh:'ทำได้แต่ปฏิเสธ (Declined Prudent): ผู้บริหารสายรอบคอบเลือกซื้อล็อตชิ้นส่วนตลาดและรักษาเงินสดสำรองแทนการเสี่ยงทุ่ม NRE'
    }]:[],
    summaryTh:chosenMode==='co_develop_custom_sku'?'ร่วมวิจัยปรับแต่งสเปกเฉพาะทางควบคู่การจัดซื้อล็อตผู้ผลิต':chosenMode==='license_and_buy_prudent'?'ผ่านเกณฑ์ทำเองแต่ผู้บริหารเลือกซื้อล็อตมาตรฐานเพื่อรักษาสภาพคล่อง':'จัดซื้อล็อตชิ้นส่วนจากซัพพลายเออร์ตามความคุ้มค่าและเวลารอ'
  };
}

function reviewStrategy(w,f){
  if(f.role!=='brand')return;
  const ceo=person(w,f.people[0]);
  if(!ceo)return;
  const maxLevel=Math.min(f.capability,...KINDS.map(k=>Math.max(...w.firms.filter(s=>(OUTPUT[s.role]||[]).includes(k)).map(s=>s.capability))));
  const focus=f.rndPortfolio?.philosophy||defaultFocusForFirm(w.seed,f);
  const options=w.segments.map(segment=>{
    let level=maxLevel;
    while(level>0&&estimatedCost(w,f,level)*1.22>segment.maxPrice)level--;
    const cost=estimatedCost(w,f,level);
    const competitors=w.firms.filter(other=>other.id!==f.id&&other.strategy?.segmentId===segment.id).length;
    const focusMatch=(segment.id==='value'&&(focus==='power_efficiency'||focus==='cost_yield'))||(segment.id==='photo'&&focus==='camera_optics')||(segment.id==='performance'&&(focus==='compute_performance'||focus==='thermal_envelope'))?0.25:0;
    const affinity=.35+random(w.seed,f.id+segment.id)*1.2+focusMatch+(segment.id==='performance'?ceo.profile.personality.ambition/250:segment.id==='value'?ceo.profile.personality.prudence/250:ceo.profile.personality.openness/250);
    return {
      segmentId:segment.id,
      level,
      cost,
      competitors,
      score:cost*1.08<=segment.maxPrice?segment.demand*Math.min(1,segment.cash/(segment.maxPrice*30))*affinity/(1+competitors*.4):0
    };
  }).sort((a,b)=>b.score-a.score||a.segmentId.localeCompare(b.segmentId));
  const pick=options[0],seg=w.segments.find(s=>s.id===pick.segmentId);
  f.sourcingDecision=evaluateSourcingDecision(w,f,pick.level);
  f.strategy={
    ...pick,
    reviewed:w.minute,
    options,
    reason:'เน้น '+seg.name+' • แนวทางวิจัย '+focus+' • คู่แข่งวางแผนกลุ่มนี้ '+pick.competitors+' ราย • งบต่อเครื่อง '+Math.round(seg.maxPrice/100)+' บาท • รุ่นที่ทีมและต้นทุนรองรับ '+pick.level
  };
  for(const d of w.designs.filter(d=>d.firmId===f.id)){
    const target=w.segments.find(s=>s.id===d.targetSegment),cost=estimatedCost(w,f,d.level),floor=Math.round(cost*1.08),margin=1.25+ceo.profile.personality.ambition/400,clearance=d.inventory>18?.88:1;
    d.price=Math.max(floor,Math.min(target.maxPrice,Math.round(cost*margin*clearance)));
    d.priceReason=d.inventory>18?'ลดส่วนเพิ่มเพื่อระบายสต็อก โดยรักษาพื้นต้นทุน':'ตั้งส่วนเพิ่มตามต้นทุนและงบกลุ่มเป้าหมาย';
    d.estimatedUnitCost=cost;
  }
}

function consumerUtility(d,segment){
  const e=d.evaluation;
  if(!e.compatible||(segment.id==='performance'&&e.taskScores.web<8))return -1;
  const features=[e.taskScores.call/100,Math.min(1,e.batteryHours/24),Math.min(1,e.photoLowLightScore/100),e.taskScores.web/200+e.taskScores.game/200];
  return features.reduce((n,v,i)=>n+v*segment.weights[i],0)+(segment.id==='value'?.65:.25)*(1-d.price/segment.maxPrice);
}

function settleMarket(w){
  const start=day(w)%w.segments.length;
  for(const segment of [...w.segments.slice(start),...w.segments.slice(0,start)]){
    const demand=segment.demand+hash(w.seed+':'+day(w)+':'+segment.id)%3;
    segment.lastDemand=demand;
    segment.lastSales=0;
    segment.results=[];
    for(let i=0;i<demand;i++){
      const candidates=w.designs.filter(d=>d.released&&d.inventory>0&&d.price<=segment.maxPrice&&d.price<=segment.cash&&firm(w,d.firmId).salesWork>=25).map(d=>({d,utility:consumerUtility(d,segment)})).filter(x=>x.utility>=.2).sort((a,b)=>b.utility-a.utility||a.d.id.localeCompare(b.d.id));
      if(!candidates.length)break;
      const {d,utility}=candidates[0],f=firm(w,d.firmId);
      if(!transfer(w,w.households,f,d.price,'ครัวเรือน '+segment.id+' ซื้อโทรศัพท์'))break;
      segment.cash-=d.price;
      segment.spent+=d.price;
      segment.purchases++;
      segment.lastSales++;
      d.inventory--;
      d.sold++;
      d.segmentSales[segment.id]++;
      if(Array.isArray(d.finishedLots)){
        const fl=d.finishedLots.find(x=>x.remaining>0);
        if(fl)fl.remaining--;
      }
      f.sales++;
      f.salesWork-=25;
      f.revenue+=d.price;
      w.households.purchases++;
      let row=segment.results.find(r=>r.designId===d.id);
      if(!row){
        row={designId:d.id,firmId:f.id,quantity:0,price:d.price,utility};
        segment.results.push(row);
      }
      row.quantity++;
    }
    segment.unmet=demand-segment.lastSales;
  }
}

function hasParts(f,l,q){
  return KINDS.every(k=>(f.stock[k+':'+l]||0)>=q);
}

function qualifySubstitution(w,designId,kind,candidateLotId){
  const d=w.designs.find(x=>x.id===designId);
  const lot=lotById(w,candidateLotId);
  if(!d||!lot)return {ok:false,compatible:false,reasonTh:'ไม่พบรุ่นโทรศัพท์หรือล็อตชิ้นส่วน'};
  if(lot.ownerId!==d.firmId||lot.location!=='stock'||lot.quantity<=0)return {ok:false,compatible:false,reasonTh:'ล็อตไม่ได้อยู่ในคลังพร้อมใช้ของบริษัท'};
  if(lot.kind!==kind)return {ok:false,compatible:false,reasonTh:'ชนิดชิ้นส่วนไม่ตรงกับตำแหน่ง BOM'};
  const sku=skuById(w,lot.skuId);
  if(!sku||!sku.qualified)return {ok:false,compatible:false,reasonTh:'SKU ยังไม่ผ่านการรับรองวิศวกรรม'};
  const candidateChip=kind==='chip'?clone(sku.spec):clone(d.chip);
  const candidateParts=clone(d.parts);
  if(kind!=='chip')candidateParts[kind]=clone(sku.spec);
  const partCompat=kind==='chip'?KINDS.slice(1).every(k=>E.isCompatiblePart(candidateChip,k,candidateParts[k])):E.isCompatiblePart(candidateChip,kind,sku.spec);
  const evalResult=evaluateSkuCompatibility(candidateChip,candidateParts);
  const ok=partCompat&&evalResult.compatible;
  return {
    ok,
    compatible:ok,
    skuId:sku.id,
    lotId:lot.id,
    revision:lot.revision,
    reasonTh:ok?`ใช้ล็อต ${lot.id} (${sku.code}) ทดแทนได้ ผ่านเกณฑ์อินเทอร์เฟซและพลังงาน`:(evalResult.reasonsTh[0]||'อินเทอร์เฟซหรือสเปกไม่เข้ากันกับบอร์ด'),
    evaluation:evalResult
  };
}

function consumeLotsForDesign(w,f,d,l,q,mode){
  const consumedRecords=[];
  for(const k of KINDS){
    const preferredSkuId=d?.bomSkus?.[k]||null;
    const taken=debitStockLots(w,f,k,l,q,preferredSkuId);
    if(!taken)throw new Error('ชิ้นส่วนในล็อตไม่เพียงพอสำหรับ '+k);
    for(const item of taken){
      if(preferredSkuId&&item.skuId!==preferredSkuId&&d){
        d.substitutions=d.substitutions||[];
        d.substitutions.push({
          minute:w.minute,
          kind:k,
          fromSkuId:preferredSkuId,
          toSkuId:item.skuId,
          lotId:item.sourceLotId,
          quantity:item.quantity,
          reasonTh:'ใช้ล็อต SKU ที่ผ่านเกณฑ์ความเข้ากันได้ในคลังทดแทน'
        });
      }
      consumedRecords.push(item);
    }
  }
  w.materials.componentsConsumed+=q*7;
  if(mode==='prototype'&&d){
    d.prototypeLots=consumedRecords;
  }
  return consumedRecords;
}

function selectSupplierSkuForDesign(w,f,kind,level){
  const ownedLot=w.lots.find(l=>l.ownerId===f.id&&l.location==='stock'&&l.kind===kind&&l.level===level&&l.quantity>0);
  if(ownedLot){
    const s=skuById(w,ownedLot.skuId);
    if(s&&s.qualified)return s;
  }
  const supplier=w.firms.find(s=>(OUTPUT[s.role]||[]).includes(kind)&&s.capability>=level)||w.firms.find(s=>(OUTPUT[s.role]||[]).includes(kind));
  return ensureSupplierSku(w,supplier,kind,level);
}

function makeDesign(w,f,l){
  const baseParts=E.parts(w.seed+f.id,l);
  const bomSkus={};
  const parts={...baseParts};
  for(const k of KINDS.slice(1)){
    const sku=selectSupplierSkuForDesign(w,f,k,l);
    bomSkus[k]=sku.id;
    parts[k]=clone(sku.spec);
  }
  const chipSku=selectSupplierSkuForDesign(w,f,'chip',l);
  bomSkus.chip=chipSku.id;
  const chip=clone(chipSku.spec);
  const emsSupplier=w.firms.find(s=>s.role==='ems'&&s.capability>=l)||w.firms.find(s=>s.role==='ems');
  const pcbSku=registerSku(w,{firmObj:emsSupplier,kind:'pcb_rf',level:l,revision:1,focus:emsSupplier.rndPortfolio?.philosophy||'baseline'});
  bomSkus.pcb_rf=pcbSku.id;
  parts.pcb_rf=clone(pcbSku.spec);
  const osSku=w.skus.filter(s=>s.designerId===f.id&&s.kind==='os'&&s.level<=l&&s.qualified).at(-1)||registerSku(w,{firmObj:f,kind:'os',level:l,revision:1,focus:'baseline',licenseMode:l>0?'licensed_ip':'open_rtos'});
  bomSkus.os=osSku.id;
  parts.os=clone(osSku.spec);

  const evaluation=evaluateSkuCompatibility(chip,parts);
  const cost=estimatedCost(w,f,l);
  const targetSegment=f.strategy?.segmentId||'value';
  const focus=f.rndPortfolio?.philosophy||defaultFocusForFirm(w.seed,f);
  return {
    id:'d'+w.nextId++,
    firmId:f.id,
    name:f.name+' '+(f.products.length+1),
    level:l,
    focus,
    bomSkus,
    osLicense:{
      skuId:osSku.id,
      code:osSku.code,
      designerId:osSku.designerId,
      ipOwnerId:osSku.ipOwnerId,
      licenseMode:osSku.licenseMode,
      revision:osSku.revision
    },
    chip,
    parts,
    evaluation,
    price:Math.min(w.segments.find(s=>s.id===targetSegment).maxPrice,Math.round(cost*1.35)),
    targetSegment,
    segmentSales:{value:0,photo:0,performance:0},
    priceReason:'ราคาเปิดตัวตามต้นทุนล็อต SKU และงบกลุ่มเป้าหมาย',
    estimatedUnitCost:cost,
    produced:0,
    sold:0,
    inventory:0,
    prototypeConsumed:0,
    prototypeLots:[],
    finishedLots:[],
    substitutions:[],
    qualificationFailures:[],
    released:false,
    created:w.minute
  };
}

function startOrGetRndProject(w,f){
  if(!f.rndPortfolio){
    f.rndPortfolio={philosophy:defaultFocusForFirm(w.seed,f),activeProjectId:null,completedProjects:[],cancelledProjects:[],sunkCostSatang:0,lastBlockReason:null};
  }
  if(f.rndPortfolio.activeProjectId){
    const active=w.rndProjects.find(p=>p.id===f.rndPortfolio.activeProjectId);
    if(active&&active.status==='active')return active;
    f.rndPortfolio.activeProjectId=null;
  }
  const targetLevel=Math.min(3,f.capability+1);
  const outputs=f.role==='brand'?['os','camera','chip']:OUTPUT[f.role];
  const targetKind=outputs[(f.rndPortfolio.completedProjects.length+f.index)%outputs.length];
  const targetFocus=f.rndPortfolio.philosophy||defaultFocusForFirm(w.seed,f);
  const targetMeta=RND_TARGETS.find(t=>t.id===targetFocus)||RND_TARGETS[0];
  const reqSubj=targetMeta.subject||(f.role==='chip'?'semiconductor':f.role==='camera'?'optics':'electronics');
  const engineers=f.people.map(id=>person(w,id)).filter(Boolean).sort((a,b)=>(b.subjects[reqSubj]||0)-(a.subjects[reqSubj]||0));
  const lead=engineers[0];
  const existingRevs=w.skus.filter(s=>s.designerId===f.id&&s.kind===targetKind&&s.level===targetLevel).length;
  const proj={
    id:'rnd-'+w.nextId++,
    firmId:f.id,
    targetKind,
    targetFocus,
    targetLevel,
    targetRevision:existingRevs+1,
    requiredSubject:reqSubj,
    minSubjectLevel:18+targetLevel*6,
    leadEngineerId:lead?.id||null,
    toolingMode:f.role==='chip'?'foundry_mpw_shuttle':f.role==='brand'?'in_house_lab':'specialist_test_rig',
    stage:'development',
    status:'active',
    workDone:f.research||0,
    workRequired:12000*(f.capability+1),
    nreSpentSatang:0,
    reworkCount:0,
    stallReason:null,
    resultSkuId:null,
    startedMinute:w.minute
  };
  w.rndProjects.push(proj);
  f.rndPortfolio.activeProjectId=proj.id;
  return proj;
}

function research(w,f,budget){
  const ceo=person(w,f.people[0]);
  if(f.capability>=3){
    if(f.rndPortfolio)f.rndPortfolio.lastBlockReason='ถึงเพดานรุ่นเทคโนโลยีหลักระดับ 3 แล้ว';
    return 0;
  }
  if(!ceo||f.people.length===0){
    if(f.rndPortfolio)f.rndPortfolio.lastBlockReason='ไม่มีผู้บริหารหรือวิศวกรปฏิบัติงานวิจัย';
    return 0;
  }
  const reserve=1500000+ceo.profile.personality.conscientiousness*15000;
  if(f.cash<reserve){
    if(f.rndPortfolio){
      f.rndPortfolio.lastBlockReason='รักษาเงินสำรอง ยังไม่อนุมัติงบ NRE เพิ่ม';
      const active=w.rndProjects.find(p=>p.id===f.rndPortfolio.activeProjectId&&p.status==='active');
      if(active)active.stallReason='งบสำรองต่ำกว่าเกณฑ์ความปลอดภัย หยุดเบิก NRE ชั่วคราว';
    }
    return 0;
  }
  const proj=startOrGetRndProject(w,f);
  if(proj.leadEngineerId&&!f.people.includes(proj.leadEngineerId)){
    const replacement=f.people.map(id=>person(w,id)).filter(Boolean).sort((a,b)=>(b.subjects[proj.requiredSubject]||0)-(a.subjects[proj.requiredSubject]||0))[0];
    proj.leadEngineerId=replacement?.id||null;
    proj.stallReason='วิศวกรหลักย้ายงาน โครงการชะลอตัวระหว่างส่งต่อความรู้';
  }
  const bestSkill=Math.max(0,...f.people.map(id=>person(w,id)?.subjects?.[proj.requiredSubject]||0));
  if(bestSkill<10){
    proj.stallReason='ขาดบุคลากรที่มีความรู้พื้นฐานวิชา '+proj.requiredSubject+' (ต้องมีอย่างน้อย 10)';
    f.rndPortfolio.lastBlockReason=proj.stallReason;
    return 0;
  }
  const remaining=Math.max(0,proj.workRequired-f.research);
  const spent=Math.min(budget,remaining);
  const nreCost=Math.ceil(spent*4);
  if(!transfer(w,f,w.treasury,nreCost,'ห้องทดลองและเครื่องมือวิจัย')){
    proj.stallReason='เงินสดไม่พอจ่ายค่าห้องทดลองและเครื่องมือวิจัย NRE';
    return 0;
  }
  f.costs+=nreCost;
  f.research+=spent;
  proj.workDone=f.research;
  proj.nreSpentSatang+=nreCost;
  proj.stallReason=null;
  if(proj.workDone>=proj.workRequired*0.75&&proj.stage==='development'){
    proj.stage='prototype_qual';
  }
  if(f.research>=proj.workRequired){
    const lead=person(w,proj.leadEngineerId)||ceo;
    const leadSkill=lead?.subjects?.[proj.requiredSubject]||0;
    if(leadSkill<proj.minSubjectLevel&&proj.reworkCount===0){
      proj.stage='rework';
      proj.reworkCount++;
      proj.workRequired+=1200;
      proj.stallReason=`ต้นแบบวิจัยไม่ผ่านเกณฑ์วิศวกรรม (${proj.requiredSubject} ${Math.round(leadSkill)}/${proj.minSubjectLevel}) ต้องปรับปรุงซ้ำ (Rework)`;
      f.rndPortfolio.sunkCostSatang+=proj.nreSpentSatang;
      event(w,`${f.name} ต้องแก้ไขต้นแบบวิจัย ${proj.targetKind} ซ้ำ (Rework)`,f.id);
      return spent;
    }
    f.research=0;
    f.capability++;
    const skillBonus=leadSkill-40;
    const producedKinds=f.role==='brand'?[proj.targetKind]:OUTPUT[f.role];
    let firstSku=null;
    for(const k of producedKinds){
      const rev=w.skus.filter(s=>s.designerId===f.id&&s.kind===k&&s.level===f.capability).length+1;
      const sku=registerSku(w,{
        firmObj:f,
        kind:k,
        level:f.capability,
        revision:rev,
        focus:proj.targetFocus,
        leadEngineerId:lead?.id||null,
        skillBonus
      });
      if(!firstSku)firstSku=sku;
    }
    if(f.role==='ems'){
      const rev=w.skus.filter(s=>s.designerId===f.id&&s.kind==='pcb_rf'&&s.level===f.capability).length+1;
      registerSku(w,{firmObj:f,kind:'pcb_rf',level:f.capability,revision:rev,focus:proj.targetFocus,leadEngineerId:lead?.id||null,skillBonus});
    }
    proj.stage='completed';
    proj.status='completed';
    proj.workDone=proj.workRequired;
    proj.resultSkuId=firstSku?.id||null;
    f.rndPortfolio.activeProjectId=null;
    f.rndPortfolio.completedProjects.push({
      id:proj.id,
      day:day(w),
      targetKind:proj.targetKind,
      targetFocus:proj.targetFocus,
      level:f.capability,
      skuId:firstSku?.id||null,
      nreSpentSatang:proj.nreSpentSatang,
      leadEngineerId:proj.leadEngineerId
    });
    event(w,`${f.name} วิจัยสำเร็จ: ${firstSku?.code||('ระดับ '+f.capability)} (${proj.targetFocus})`,f.id);
    f.history.push({day:day(w),type:'research',level:f.capability,focus:proj.targetFocus,skuId:firstSku?.id||null});
  }
  return spent;
}

function operate(w,f,budget){
  if(budget<=0)return;
  f.workDone+=budget;
  if(f.role!=='brand'){
    budget-=research(w,f,budget*.3);
    const outputs=OUTPUT[f.role];
    let candidates=[];
    for(let l=0;l<=f.capability;l++)for(const k of outputs)candidates.push({k,l,q:f.stock[k+':'+l]||0});
    candidates.sort((a,b)=>a.q-b.q||a.l-b.l);
    const c=candidates[0];
    let batch=w.WIP.find(b=>b.firmId===f.id);
    if(!batch&&c.q<120&&f.raw>=12&&transfer(w,f,w.treasury,3000,'พลังงาน/วัสดุสิ้นเปลือง')){
      f.raw-=12;
      f.costs+=3000;
      w.materials.consumed+=12;
      const sku=ensureSupplierSku(w,f,c.k,c.l);
      batch={
        id:'b'+w.nextId++,
        firmId:f.id,
        kind:c.k,
        level:c.l,
        skuId:sku.id,
        skuCode:sku.code,
        revision:sku.revision,
        quantity:12,
        work:0,
        required:240,
        stage:'manufacture',
        inputs:12
      };
      w.WIP.push(batch);
    }
    if(batch){
      batch.work+=budget;
      if(batch.work>=batch.required){
        const sku=skuById(w,batch.skuId)||ensureSupplierSku(w,f,batch.kind,batch.level);
        createLot(w,{
          sku,
          ownerId:f.id,
          location:'stock',
          quantity:batch.quantity,
          unitPrice:Math.round(PRICE[batch.kind]*(1+batch.level)*f.supplyTerms.priceBps/10000)
        });
        f.production+=batch.quantity;
        w.WIP.splice(w.WIP.indexOf(batch),1);
      }
    }
    f.decision=batch?'ผลิต '+batch.kind+' ('+(batch.skuCode||batch.kind)+') • งาน '+Math.floor(batch.work)+'/'+batch.required:'วิจัยพอร์ตเฉพาะทางและรักษาสต็อก';
    return;
  }
  if(!f.project){
    const ceo=person(w,f.people[0]);
    const reserve=ceo?Math.round(300000+ceo.profile.personality.conscientiousness*5000):800000;
    const current=w.designs.filter(d=>d.firmId===f.id).at(-1);
    if(current&&current.inventory>20){f.decision='ระบายสินค้าคงคลังก่อนลงทุนเพิ่ม';return;}
    if(f.cash<reserve){f.decision='รักษาเงินสำรอง ยังไม่เริ่มโครงการใหม่';return;}
    if(!f.strategy)reviewStrategy(w,f);
    const level=f.strategy.level;
    if(current&&current.level===level&&current.targetSegment===f.strategy.segmentId&&current.evaluation.compatible){
      f.project={stage:'procurement',work:0,required:1,designId:current.id,level,batch:12};
    }else{
      if(!transfer(w,f,w.treasury,80000*(level+1),'ทุนวิจัยผลิตภัณฑ์'))return;
      f.costs+=80000*(level+1);
      const d=makeDesign(w,f,level);
      w.designs.push(d);
      f.project={stage:'research',work:0,required:1800*(level+1),designId:d.id,level,batch:12};
      event(w,f.name+' เริ่มออกแบบ '+d.name+' ('+d.focus+')',f.id);
    }
  }
  const p=f.project,d=w.designs.find(d=>d.id===p.designId);
  f.decision=p.stage;
  if(p.stage==='research'){
    p.work+=budget;
    if(p.work>=p.required){p.stage='prototype';p.work=0;p.required=600;}
  }else if(p.stage==='prototype'){
    if(!p.inputs){
      acquire(w,f,p.level,1,d);
      if(!hasParts(f,p.level,1)){f.decision='รอชิ้นส่วนสำหรับต้นแบบ';return;}
      consumeLotsForDesign(w,f,d,p.level,1,'prototype');
      p.inputs=1;
      d.prototypeConsumed=1;
    }
    p.work+=budget;
    if(p.work>=p.required){p.stage='validation';p.work=0;p.required=900;}
  }else if(p.stage==='validation'){
    p.work+=budget;
    if(p.work>=p.required){
      if(!d.evaluation.compatible){
        f.decision='ต้นแบบไม่ผ่านความเข้ากันได้';
        d.qualificationFailures=d.qualificationFailures||[];
        d.qualificationFailures.push({minute:w.minute,reasonsTh:d.evaluation.reasonsTh||['ไม่ผ่านความเข้ากันได้']});
        p.stage='failed';
        p.work=0;
        p.required=900;
        event(w,f.name+' ต้นแบบไม่ผ่านการทดสอบ',f.id);
      }else{
        p.stage='procurement';
        p.work=0;
        p.required=1;
      }
    }
  }else if(p.stage==='procurement'){
    acquire(w,f,p.level,p.batch,d);
    if(hasParts(f,p.level,p.batch)){
      const ems=firm(w,'supplier-ems');
      if(!transfer(w,f,ems,24000,'สิทธิ์ใช้สายประกอบ EMS'))return;
      f.costs+=24000;
      ems.revenue+=24000;
      const reserved=consumeLotsForDesign(w,f,d,p.level,p.batch,'wip');
      p.stage='pilot';
      p.work=0;
      p.required=600;
      w.WIP.push({
        id:'b'+w.nextId++,
        firmId:f.id,
        designId:d.id,
        kind:'phone',
        level:p.level,
        quantity:p.batch,
        work:0,
        required:1800,
        stage:'pilot',
        inputs:p.batch*7,
        reservedLots:reserved
      });
    }
  }else if(p.stage==='pilot'||p.stage==='manufacture'){
    const b=w.WIP.find(b=>b.firmId===f.id);
    if(!b)return;
    b.work+=budget;
    p.work+=budget;
    if(p.stage==='pilot'&&p.work>=p.required){
      p.stage='manufacture';
      p.work=0;
      p.required=1200;
      b.stage='manufacture';
    }else if(p.stage==='manufacture'&&p.work>=p.required){
      d.inventory+=p.batch;
      d.produced+=p.batch;
      f.production+=p.batch;
      d.finishedLots=d.finishedLots||[];
      d.finishedLots.push({
        lotId:'flot-'+w.nextId++,
        producedMinute:w.minute,
        quantity:p.batch,
        remaining:p.batch,
        bomLots:b.reservedLots||[]
      });
      w.WIP.splice(w.WIP.indexOf(b),1);
      p.stage='release';
      p.work=0;
      p.required=180;
    }
  }else if(p.stage==='failed'){
    p.work+=budget;
    f.decision='วิเคราะห์ข้อผิดพลาดและเตรียมแบบสำรอง';
    if(p.work>=p.required&&transfer(w,f,w.treasury,80000,'ออกแบบใหม่หลังทดสอบล้มเหลว')){
      f.costs+=80000;
      if(f.rndPortfolio)f.rndPortfolio.sunkCostSatang+=80000;
      const level=Math.max(0,p.level-1),replacement=makeDesign(w,f,level);
      w.designs.push(replacement);
      f.project={stage:'research',work:0,required:1800*(level+1),designId:replacement.id,level,batch:12};
      event(w,f.name+' เริ่มแบบสำรองระดับ '+level+' หลังต้นแบบไม่ผ่าน',f.id);
    }
  }else if(p.stage==='release'){
    p.work+=budget;
    if(p.work>=p.required){
      if(!d.released){
        d.released=true;
        f.products.push(d.id);
        event(w,f.name+' เปิดขาย '+d.name+' • แบตเตอรี่ '+d.evaluation.batteryHours+' ชั่วโมง',f.id);
        f.history.push({day:day(w),type:'launch',designId:d.id});
      }
      f.project=null;
    }
  }
}

function recruit(w,f){
  if(!w.settings.recruitment||f.people.length>=6||f.cash<2500000||w.offers.some(o=>o.to===f.id&&o.status==='notice'))return;
  const ceo=person(w,f.people[0]);
  if(!ceo)return;
  const need=f.role==='chip'?'semiconductor':f.role==='camera'?'optics':'electronics';
  const candidates=w.people.filter(p=>p.role!=='ceo'&&p.employerId!==f.id&&!p.notice&&(p.employerId===null||(day(w)>30&&firm(w,p.employerId).people.length>3&&(!p.lastJoined||w.minute-p.lastJoined>60*1440)))).sort((a,b)=>b.subjects[need]-a.subjects[need]||a.id.localeCompare(b.id));
  const p=candidates[0];
  if(!p)return;
  const wage=Math.ceil(p.wage*(1.1+ceo.profile.personality.ambition/500));
  const accept=wage>p.wage*(p.employerId?(1.12+p.profile.values.security/700+p.profile.personality.patience/1500-p.unpaidDays*.04):(1.05+p.profile.values.security/2000));
  if(!accept)return;
  const offer={id:'o'+w.nextId++,personId:p.id,from:p.employerId,to:f.id,wage,created:w.minute,eta:w.minute+(p.employerId?7:3)*1440,status:'notice'};
  p.notice=offer.id;
  w.offers.push(offer);
  event(w,p.name+' รับข้อเสนอจาก '+f.name+' เริ่มงานหลังแจ้งล่วงหน้า',f.id);
}

function daily(w){
  for(const f of w.firms){
    let due=f.people.reduce((n,id)=>n+person(w,id).wage,0);
    f.paidToday=f.cash>=due;
    if(f.paidToday){
      for(const id of f.people){
        const p=person(w,id);
        transfer(w,f,p,p.wage,'ค่าจ้างรายวัน');
        p.unpaidDays=0;
      }
    }else{
      for(const id of f.people)person(w,id).unpaidDays++;
    }
    if(f.role!=='brand'&&f.raw<100&&!w.shipments.some(s=>s.to===f.id&&s.key==='raw')){
      const q=Math.min(180,w.treasury.stock);
      if(q&&transfer(w,f,w.treasury,q*1200,'วัตถุดิบต้นน้ำ')){
        w.treasury.stock-=q;
        w.shipments.push({id:'s'+w.nextId++,from:'upstream',to:f.id,key:'raw',quantity:q,eta:w.minute+2*1440});
      }
    }
    if(day(w)%14===2+f.index%7)recruit(w,f);
  }
  if(w.settings.market)settleMarket(w);
  for(const f of w.firms){
    f.salesWork=0;
    if(!f.strategy||day(w)%7===f.index%7)reviewStrategy(w,f);
  }
}

function tick(w){
  const hour=Math.floor(w.minute%1440/60);
  if(hour===0)daily(w);
  for(const s of [...w.shipments]){
    if(s.eta<=w.minute){
      const f=firm(w,s.to);
      if(s.key==='raw'){
        f.raw+=s.quantity;
      }else{
        const tLot=w.lots.find(l=>l.shipmentId===s.id&&l.location==='transit');
        if(tLot){
          tLot.location='stock';
          tLot.shipmentId=null;
          f.stock[s.key]=(f.stock[s.key]||0)+s.quantity;
        }else{
          const [kind,lv]=s.key.split(':');
          const seller=firm(w,s.from)||f;
          const sku=s.skuId?skuById(w,s.skuId):ensureSupplierSku(w,seller,kind,Number(lv));
          createLot(w,{sku,ownerId:f.id,location:'stock',quantity:s.quantity,unitPrice:s.unitPrice});
        }
      }
      w.shipments.splice(w.shipments.indexOf(s),1);
    }
  }
  for(const o of w.offers){
    if(o.status==='notice'&&o.eta<=w.minute){
      const p=person(w,o.personId),old=firm(w,p.employerId),f=firm(w,o.to);
      if(old){
        old.people=old.people.filter(id=>id!==p.id);
        const oldProj=w.rndProjects.find(r=>r.firmId===old.id&&r.status==='active'&&r.leadEngineerId===p.id);
        if(oldProj)oldProj.stallReason=`วิศวกรหลัก (${p.name}) ย้ายไป ${f.name} ต้องจัดสรรคนรับช่วงต่อ`;
      }
      p.employerId=f.id;
      p.lastJoined=w.minute;
      p.wage=o.wage;
      p.notice=null;
      f.people.push(p.id);
      o.status='joined';
      event(w,p.name+' เริ่มงานที่ '+f.name+' พร้อมความรู้เดิม (ไม่โอนสิทธิ์ IP ของบริษัทเก่า)',f.id);
    }
  }
  const budgets={};
  for(const p of w.people){
    const f=firm(w,p.employerId);
    let activity=hour<7||hour>=23?'sleep':hour===8||hour===18?'travel':hour===7||hour===12||hour===19?'meal':hour>=9&&hour<18&&f&&f.paidToday?'work':'rest';
    if(activity==='work'&&(p.state.energy<22||p.state.stress>80))activity='rest';
    if(activity==='meal'){if(!transfer(w,p,w.treasury,2000,'ค่าอาหาร'))activity='rest';}
    p.activity=activity;
    p.state=H.tickState(p.profile,p.state,{minutes:60,activity:activity==='travel'?'commute':activity,domain:'cognitive',workload:.75,sleepQuality:1});
    const x=f?30+f.index*65:30;
    p.position={x:activity==='travel'?x-15:activity==='work'?x:20+(hash(p.id)%15)*45,y:activity==='work'?120:activity==='travel'?230:330};
    if(activity==='work'){
      const stage=f.project?.stage;
      const subject=['validation','pilot'].includes(stage)?'quality':stage==='manufacture'?'manufacturing':stage==='research'?'software':f.role==='chip'?'semiconductor':f.role==='camera'?'optics':['battery','ems'].includes(f.role)?'manufacturing':'electronics';
      const skill=p.subjects[subject],factor=(.3+skill/100)*(.45+p.state.focus/180)*(.6+p.profile.personality.conscientiousness/200);
      const amount=60*factor;
      const salesShare=f.role==='brand'?.15:0;
      f.salesWork+=amount*salesShare*(.25+p.subjects.sales/100);
      budgets[f.id]=(budgets[f.id]||0)+amount*(1-salesShare);
      if(salesShare)p.subjects.sales=Math.min(Math.max(p.subjects.sales,p.profile.potential.memory),p.subjects.sales+.006);
      p.workMinutes+=60;
      p.subjects[subject]=Math.min(Math.max(skill,p.profile.potential.memory),skill+.008*(.5+p.profile.aptitudes.memory/100)*(1-skill/110));
    }
  }
  for(const f of w.firms){
    let budget=budgets[f.id]||0;
    if(f.role==='brand'&&budget){
      const spent=research(w,f,budget*.18);
      budget-=spent;
    }
    operate(w,f,budget);
  }
  w.minute+=60;
}

function advance(w,minutes){
  if(!Number.isSafeInteger(minutes)||minutes<0||minutes>1440*3650)throw new Error('ระยะเวลาไม่ถูกต้อง');
  syncAuthorizedFixtureStock(w);
  const target=w.minute+minutes;
  while(Math.floor(w.minute/60)<Math.floor(target/60)){
    const rem=w.minute%60;
    w.minute-=rem;
    tick(w);
  }
  w.minute=target;
  return w;
}

function snapshot(w){
  const result=clone(w);
  result.wip=result.WIP;
  return result;
}

function command(w,c){
  if(!c||typeof c.type!=='string')throw new Error('คำสั่งไม่ถูกต้อง');
  syncAuthorizedFixtureStock(w);
  if(c.type==='grantCash'){
    const f=firm(w,c.firmId);
    if(!f||!Number.isSafeInteger(c.amount)||c.amount<=0||c.amount>100000000000||!Number.isSafeInteger(totalCash(w)+c.amount))throw new Error('บริษัทหรือจำนวนเงินไม่ถูกต้อง');
    f.cash+=c.amount;
    w.editCapital+=c.amount;
    event(w,'Edit Hub เพิ่มทุน '+c.amount+' สตางค์ ให้ '+f.name,f.id);
    return true;
  }
  if(c.type==='cancelRndProject'){
    const f=firm(w,c.firmId);
    if(!f||!f.rndPortfolio?.activeProjectId)throw new Error('ไม่พบโครงการวิจัยที่กำลังดำเนินการ');
    const proj=w.rndProjects.find(r=>r.id===f.rndPortfolio.activeProjectId);
    if(!proj||proj.status!=='active')throw new Error('โครงการไม่อยู่ในสถานะยกเลิกได้');
    proj.status='cancelled';
    proj.stage='cancelled';
    proj.stallReason='ยกเลิกโครงการ — ต้นทุนวิจัยที่จ่ายแล้วเป็นต้นทุนจม (Sunk Cost)';
    f.rndPortfolio.sunkCostSatang+=proj.nreSpentSatang;
    f.rndPortfolio.cancelledProjects.push({id:proj.id,day:day(w),targetKind:proj.targetKind,targetFocus:proj.targetFocus,sunkCostSatang:proj.nreSpentSatang});
    f.rndPortfolio.activeProjectId=null;
    f.research=0;
    event(w,`ยกเลิกโครงการวิจัย ${proj.id} ของ ${f.name} (ต้นทุนจม ${Math.round(proj.nreSpentSatang/100).toLocaleString('th-TH')} บาท)`,f.id);
    return true;
  }
  const p=person(w,c.personId);
  if(!p)throw new Error('ไม่พบบุคคล');
  if(!Number.isFinite(c.level)||c.level<0||c.level>100)throw new Error('ระดับต้องอยู่ระหว่าง 0 ถึง 100');
  if(c.type==='setSubject'){
    if(!SUBJECTS.includes(c.subjectId))throw new Error('ไม่พบวิชา');
    p.subjects[c.subjectId]=c.level;
  }else if(c.type==='setTrait'){
    if(!H.PERSONALITY.includes(c.key))throw new Error('ไม่พบนิสัย');
    const profile=clone(p.profile);
    profile.personality[c.key]=c.level;
    p.profile=H.freezeProfile(profile);
  }else throw new Error('คำสั่งไม่รองรับ');
  event(w,'Edit Hub เปลี่ยนข้อมูลเฉพาะตัวของ '+p.name,p.employerId);
  return true;
}

function traceSkuChain(w,queryId){
  const q=String(queryId||'');
  const sku=w.skus.find(s=>s.id===q||s.code===q);
  const lot=w.lots.find(l=>l.id===q);
  const eng=w.people.find(p=>p.id===q||p.name===q);
  if(eng){
    const ledProjects=w.rndProjects.filter(r=>r.leadEngineerId===eng.id);
    const designedSkus=w.skus.filter(s=>s.qualification?.leadEngineerId===eng.id);
    return {type:'engineer',personId:eng.id,name:eng.name,employerId:eng.employerId,ledProjects,designedSkus};
  }
  const targetSku=sku||(lot?skuById(w,lot.skuId):null);
  if(!targetSku)return {type:'unknown',queryId:q};
  const lots=w.lots.filter(l=>l.skuId===targetSku.id);
  const shipments=w.shipments.filter(s=>s.skuId===targetSku.id);
  const designs=w.designs.filter(d=>Object.values(d.bomSkus||{}).includes(targetSku.id)||(d.prototypeLots||[]).some(pl=>pl.skuId===targetSku.id)||(d.finishedLots||[]).some(fl=>(fl.bomLots||[]).some(bl=>bl.skuId===targetSku.id)));
  return {type:'sku',sku:targetSku,lots,shipments,designs:designs.map(d=>({id:d.id,name:d.name,firmId:d.firmId,produced:d.produced,sold:d.sold}))};
}

function audit(w){
  const errors=[];
  try{
    if(!w||typeof w!=='object')return {ok:false,errors:['malformed world']};
    if(w.schema!==3||w.release!=='0.3.0')errors.push('unsupported schema');
    for(const k of Object.keys(w))if(!WORLD_KEYS.has(k))errors.push('unknown world field '+k);
    if(typeof w.seed!=='string'||!['firms','people','designs','skus','lots','rndProjects','shipments','WIP','offers','events','ledger'].every(k=>Array.isArray(w[k])))throw Error('missing arrays');
    if(!Number.isSafeInteger(w.minute)||w.minute<0)errors.push('invalid time');
    const ids=new Set(w.firms.map(f=>f.id)),pids=new Set(w.people.map(p=>p.id)),dids=new Set(w.designs.map(d=>d.id)),skuIds=new Set(w.skus.map(s=>s.id)),lotIds=new Set(w.lots.map(l=>l.id)),rndIds=new Set(w.rndProjects.map(r=>r.id));
    if(ids.size!==w.firms.length||pids.size!==w.people.length||dids.size!==w.designs.length||skuIds.size!==w.skus.length||lotIds.size!==w.lots.length||rndIds.size!==w.rndProjects.length||!ids.has(w.playerFirmId))errors.push('invalid identities');
    const integer=n=>Number.isSafeInteger(n)&&n>=0;
    for(const a of [w.treasury,w.households,...w.firms,...w.people])if(!integer(a.cash))errors.push('invalid cash '+a.id);
    if(!Array.isArray(w.segments)||w.segments.length!==SEGMENTS.length||w.segments.some((s,i)=>s.id!==SEGMENTS[i].id||s.initialCash!==SEGMENTS[i].initialCash||s.maxPrice!==SEGMENTS[i].maxPrice||s.demand!==SEGMENTS[i].demand||JSON.stringify(s.weights)!==JSON.stringify(SEGMENTS[i].weights)||!integer(s.cash)||!integer(s.purchases)||!integer(s.spent)||s.cash+s.spent!==SEGMENTS[i].initialCash||s.purchases!==w.designs.reduce((n,d)=>n+(d.segmentSales?.[s.id]||0),0)||!integer(s.lastDemand)||!integer(s.lastSales)||!integer(s.unmet)||s.lastSales+s.unmet!==s.lastDemand||!Array.isArray(s.results)||s.results.reduce((n,r)=>n+r.quantity,0)!==s.lastSales||s.results.some(r=>!dids.has(r.designId)||!ids.has(r.firmId)||!integer(r.quantity)||r.quantity===0||!integer(r.price)||r.price===0||r.price>s.maxPrice||w.designs.find(d=>d.id===r.designId)?.firmId!==r.firmId||!Number.isFinite(r.utility)))||w.segments.reduce((n,s)=>n+s.cash,0)!==w.households.cash||w.segments.reduce((n,s)=>n+s.purchases,0)!==w.households.purchases)errors.push('segment budgets');
    if(totalCash(w)!==w.openingCapital+w.editCapital)errors.push('money conservation');
    const raw=w.treasury.stock+w.firms.reduce((n,f)=>n+f.raw,0)+w.shipments.filter(s=>s.key==='raw').reduce((n,s)=>n+s.quantity,0)+w.materials.consumed;
    if(raw!==w.materials.opening)errors.push('raw conservation');
    const components=w.firms.reduce((n,f)=>n+Object.values(f.stock).reduce((a,q)=>a+q,0),0)+w.shipments.filter(s=>s.key!=='raw').reduce((n,s)=>n+s.quantity,0)+w.materials.componentsConsumed;
    if(components!==w.materials.componentOpening+w.firms.filter(f=>f.role!=='brand').reduce((n,f)=>n+f.production,0))errors.push('component conservation');

    for(const s of w.skus){
      if(!s||typeof s.id!=='string'||typeof s.code!=='string'||!ALL_CATEGORIES.includes(s.kind)||!integer(s.level)||s.level>3||!integer(s.revision)||s.revision<1||!ids.has(s.designerId)||!ids.has(s.ipOwnerId)||(s.kind!=='os'&&!ids.has(s.manufacturerId))||typeof s.qualified!=='boolean'||!s.spec||typeof s.spec!=='object')errors.push('invalid sku');
    }
    const shipLotIds=new Set();
    for(const l of w.lots){
      if(!l||typeof l.id!=='string'||!skuIds.has(l.skuId)||!KINDS.includes(l.kind)||!integer(l.level)||l.level>3||!integer(l.revision)||l.revision<1||!ids.has(l.designerId)||!ids.has(l.ipOwnerId)||!ids.has(l.manufacturerId)||!ids.has(l.ownerId)||!['stock','transit'].includes(l.location)||!integer(l.quantity)||l.quantity===0||!integer(l.unitPrice))errors.push('invalid lot');
      const sku=skuById(w,l.skuId);
      if(!sku||sku.kind!==l.kind||sku.level!==l.level||sku.revision!==l.revision)errors.push('lot sku mismatch');
      if(l.location==='transit'){
        if(!l.shipmentId||shipLotIds.has(l.shipmentId)||!w.shipments.some(s=>s.id===l.shipmentId&&s.to===l.ownerId&&s.quantity===l.quantity&&s.skuId===l.skuId))errors.push('invalid transit lot');
        shipLotIds.add(l.shipmentId);
      }
    }
    const stockFromMap=w.firms.reduce((n,f)=>n+Object.values(f.stock||{}).reduce((a,q)=>a+(Number.isSafeInteger(q)?q:0),0),0);
    const stockFromLots=w.lots.filter(l=>l.location==='stock').reduce((n,l)=>n+l.quantity,0);
    if(stockFromMap!==stockFromLots)errors.push('lot stock total mismatch');
    for(const f of w.firms){
      for(const [k,q] of Object.entries(f.stock||{})){
        const [kind,lvStr]=k.split(':');
        const lv=Number(lvStr);
        const lotSum=w.lots.filter(l=>l.ownerId===f.id&&l.location==='stock'&&l.kind===kind&&l.level===lv).reduce((n,l)=>n+l.quantity,0);
        if(q!==lotSum)errors.push('firm lot stock mismatch '+f.id);
      }
    }

    for(const r of w.rndProjects){
      if(!r||typeof r.id!=='string'||!ids.has(r.firmId)||!ALL_CATEGORIES.includes(r.targetKind)||!integer(r.targetLevel)||r.targetLevel>3||!integer(r.targetRevision)||r.targetRevision<1||!['development','prototype_qual','rework','completed','cancelled'].includes(r.stage)||!['active','completed','cancelled'].includes(r.status)||!Number.isFinite(r.workDone)||r.workDone<0||!Number.isFinite(r.workRequired)||r.workRequired<=0||!integer(r.nreSpentSatang)||(r.leadEngineerId!==null&&!pids.has(r.leadEngineerId)))errors.push('invalid rnd project');
    }

    const scan=x=>{if(typeof x==='number'&&!Number.isFinite(x))throw Error('nonfinite');if(x&&typeof x==='object')for(const v of Object.values(x))scan(v);};
    scan(w);
    if(!integer(w.nextId)||!integer(w.treasury.stock)||!integer(w.openingCapital)||!integer(w.editCapital)||!w.settings||typeof w.settings.market!=='boolean'||typeof w.settings.recruitment!=='boolean')errors.push('invalid world fields');
    const batchFirms=new Set(),batchIds=new Set();
    for(const b of w.WIP){
      if(batchFirms.has(b.firmId)||batchIds.has(b.id)||typeof b.id!=='string')errors.push('duplicate WIP');
      batchFirms.add(b.firmId);batchIds.add(b.id);
      const owner=firm(w,b.firmId);if(!owner)continue;
      if(b.kind==='phone'){
        const p=owner.project,d=w.designs.find(d=>d.id===b.designId);
        if(owner.role!=='brand'||!p||!d||d.firmId!==owner.id||p.designId!==b.designId||p.level!==b.level||p.stage!==b.stage||p.batch!==b.quantity||b.inputs!==b.quantity*7||b.required!==1800)errors.push('phone reservation');
        if(b.reservedLots&&(!Array.isArray(b.reservedLots)||b.reservedLots.reduce((n,x)=>n+(x.quantity||0),0)!==b.inputs||b.reservedLots.some(x=>!skuIds.has(x.skuId))))errors.push('phone wip lot reservation');
      }else if(!(OUTPUT[owner.role]||[]).includes(b.kind)||!integer(b.level)||b.level>owner.capability||b.stage!=='manufacture'||b.inputs!==b.quantity||b.quantity!==12||b.required!==240||(b.skuId&&!skuIds.has(b.skuId))){
        errors.push('supplier reservation');
      }
    }
    if(w.materials.consumed!==w.firms.filter(f=>f.role!=='brand').reduce((n,f)=>n+f.production,0)+w.WIP.filter(b=>b.kind!=='phone').reduce((n,b)=>n+b.inputs,0))errors.push('raw work reservations');
    if(w.materials.componentsConsumed!==w.firms.filter(f=>f.role==='brand').reduce((n,f)=>n+f.production*7,0)+w.WIP.filter(b=>b.kind==='phone').reduce((n,b)=>n+b.inputs,0)+w.designs.reduce((n,d)=>n+d.prototypeConsumed*7,0))errors.push('component work reservations');

    for(const f of w.firms){
      if(!Number.isFinite(f.salesWork)||f.salesWork<0||!f.supplyTerms||!integer(f.supplyTerms.priceBps)||f.supplyTerms.priceBps<8000||f.supplyTerms.priceBps>12499||!integer(f.supplyTerms.leadHours)||f.supplyTerms.leadHours<12||f.supplyTerms.leadHours>72||!Array.isArray(f.procurement)||f.procurement.some(r=>!r||typeof r.key!=='string'||!integer(r.needed)||!integer(r.unfilled)||!Array.isArray(r.orders)||!Array.isArray(r.alternatives)||r.orders.some(o=>!ids.has(o.sellerId)||!integer(o.quantity)||!integer(o.unitPrice)||!integer(o.leadMinutes))||r.alternatives.some(o=>!ids.has(o.sellerId)||!integer(o.stock)||!integer(o.unitPrice)||!integer(o.leadMinutes)||!Number.isFinite(o.score))))errors.push('commercial firm');
      if(!f.rndPortfolio||typeof f.rndPortfolio.philosophy!=='string'||!Array.isArray(f.rndPortfolio.completedProjects)||!Array.isArray(f.rndPortfolio.cancelledProjects)||!integer(f.rndPortfolio.sunkCostSatang)||(f.rndPortfolio.activeProjectId!==null&&!rndIds.has(f.rndPortfolio.activeProjectId)))errors.push('invalid rndPortfolio');
      if(f.strategy&&(!SEGMENTS.some(s=>s.id===f.strategy.segmentId)||!integer(f.strategy.level)||f.strategy.level>f.capability||!integer(f.strategy.reviewed)||f.strategy.reviewed>w.minute))errors.push('strategy');
      if(f.project){
        const p=f.project,d=w.designs.find(d=>d.id===p.designId);
        const expected={research:1800*(p.level+1),prototype:600,validation:900,failed:900,procurement:1,pilot:600,manufacture:1200,release:180};
        if(f.role!=='brand'||!d||d.firmId!==f.id||d.level!==p.level||!Number.isFinite(p.required)||p.required<=0||p.required!==expected[p.stage]||(['pilot','manufacture'].includes(p.stage)!==batchFirms.has(f.id)))errors.push('project work contract');
      }
      if(!integer(f.raw)||Object.values(f.stock).some(n=>!integer(n)))errors.push('invalid stock '+f.id);
      if(f.people.some(id=>!pids.has(id)||person(w,id).employerId!==f.id)||new Set(f.people).size!==f.people.length)errors.push('staff references');
      if(!['brand',...Object.keys(OUTPUT)].includes(f.role)||!integer(f.capability)||f.capability>3||!Number.isFinite(f.research)||f.research<0||!integer(f.production))errors.push('invalid firm');
      if(f.project&&(!dids.has(f.project.designId)||!['research','prototype','validation','procurement','pilot','manufacture','release','failed'].includes(f.project.stage)||!Number.isFinite(f.project.work)||f.project.work<0||!integer(f.project.level)||f.project.level>3||!integer(f.project.batch)||f.project.batch<1))errors.push('project reference');
    }
    for(const p of w.people){
      if(typeof p.name!=='string'||!integer(p.wage)||!integer(p.workMinutes)||!integer(p.unpaidDays)||(p.notice!==null&&!w.offers.some(o=>o.id===p.notice&&o.personId===p.id&&o.status==='notice')))errors.push('invalid person');
      if(H.validateProfile(p.profile).length||p.profile.id!==p.id)errors.push('invalid profile');
      if(p.employerId!==null&&(!ids.has(p.employerId)||!firm(w,p.employerId).people.includes(p.id)))errors.push('employment reference');
      if(SUBJECTS.some(s=>!Number.isFinite(p.subjects[s])||p.subjects[s]<0||p.subjects[s]>100))errors.push('invalid subjects');
      if(Object.keys(H.STATE_DEFAULTS).some(k=>!Number.isFinite(p.state[k])||p.state[k]<0||p.state[k]>100))errors.push('invalid human state');
    }
    for(const s of w.shipments){
      if(!ids.has(s.to)||!(ids.has(s.from)||s.from==='upstream')||!integer(s.quantity)||s.quantity===0||!integer(s.eta)||(s.key!=='raw'&&(!integer(s.unitPrice)||s.unitPrice===0||!(OUTPUT[firm(w,s.from)?.role]||[]).includes(s.key.split(':')[0])||(s.skuId&&!skuIds.has(s.skuId))||(s.lotId&&!lotIds.has(s.lotId))))||!(s.key==='raw'||/^(chip|ram|storage|display|camera|battery|enclosure):[0-3]$/.test(s.key)))errors.push('invalid shipment');
    }
    for(const o of w.offers)if(!pids.has(o.personId)||!ids.has(o.to)||!(o.from===null||ids.has(o.from))||!integer(o.wage)||!integer(o.eta)||!['notice','joined'].includes(o.status))errors.push('invalid offer');
    for(const b of w.WIP)if(!ids.has(b.firmId)||!Number.isFinite(b.work)||b.work<0||!integer(b.quantity)||b.quantity===0||!Number.isFinite(b.required)||b.required<=0||!['manufacture','pilot'].includes(b.stage)||(b.kind==='phone'&&!dids.has(b.designId)))errors.push('invalid WIP');
    for(const d of w.designs){
      if(!SEGMENTS.some(s=>s.id===d.targetSegment)||!d.segmentSales||SEGMENTS.some(s=>!integer(d.segmentSales[s.id]))||Object.values(d.segmentSales).reduce((a,n)=>a+n,0)!==d.sold||!integer(d.estimatedUnitCost)||!ids.has(d.firmId)||!d.chip||!Number.isFinite(d.chip.clockGhz)||!d.parts||!KINDS.slice(1).every(k=>d.parts[k]&&typeof d.parts[k]==='object')||!d.evaluation||!d.evaluation.taskScores||['call','web','game'].some(k=>!Number.isFinite(d.evaluation.taskScores[k])||d.evaluation.taskScores[k]<0||d.evaluation.taskScores[k]>100)||!Number.isFinite(d.evaluation.photoLowLightScore)||d.evaluation.photoLowLightScore<0||d.evaluation.photoLowLightScore>100||typeof d.evaluation.compatible!=='boolean'||!Number.isFinite(d.evaluation.batteryHours)||!integer(d.price)||d.price===0||!integer(d.level)||d.level>3||typeof d.released!=='boolean'||![0,1].includes(d.prototypeConsumed)||!integer(d.inventory)||!integer(d.produced)||!integer(d.sold)||d.inventory+d.sold!==d.produced)errors.push('invalid product');
      if(d.bomSkus&&(typeof d.bomSkus!=='object'||Object.values(d.bomSkus).some(id=>!skuIds.has(id))))errors.push('invalid design bomSkus');
    }
  }catch(e){
    errors.push('malformed world');
  }
  return {ok:!errors.length,errors};
}

function serialize(w){
  syncAuthorizedFixtureStock(w);
  const a=audit(w);
  if(!a.ok)throw new Error(a.errors.join(', '));
  return JSON.stringify(w);
}

function deserialize(text){
  if(typeof text!=='string'||text.length>20000000)throw new Error('เซฟไม่ถูกต้อง');
  const w=JSON.parse(text);
  if(w.schema!==3||w.release!=='0.3.0')throw new Error('รองรับเฉพาะเซฟ Silicon & Handset 0.3.0 (ไม่รองรับ 0.2.0 / 0.1.0) — เซฟรุ่นก่อนและ Company ยังอยู่ในที่เดิม');
  const a=audit(w);
  if(!a.ok)throw new Error('เซฟไม่ถูกต้อง: '+a.errors.join(', '));
  for(const p of w.people)p.profile=H.freezeProfile(p.profile);
  return w;
}

return Object.freeze({
  create,
  advance,
  snapshot,
  command,
  serialize,
  deserialize,
  audit,
  supplierQuotes,
  consumerUtility,
  evaluateSkuCompatibility,
  qualifySubstitution,
  traceSkuChain,
  SUBJECTS,
  KINDS,
  ALL_CATEGORIES,
  RND_TARGETS,
  LOT_POLICY
});
});
