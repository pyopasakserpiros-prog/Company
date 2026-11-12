(function(root,factory){
  const node=typeof module==='object'&&module.exports;
  const value=factory(node?require('./phone-engineering.js'):root.CompanyPhoneEngineering,node?require('./phone-talent.js'):root.CompanyPhoneTalent,node?require('./civics.js'):root.CompanyCivics,node?require('./world.js'):root.CompanyWorld);
  if(node)module.exports=value;else root.CompanyPhoneIndustry=value;
})(typeof globalThis!=='undefined'?globalThis:this,function(E,T,C,W){
  'use strict';
  const BRANDS=['siam_tech','titan_elec','asia_autoparts','eastern_auto'];
  const ROLES={
    shenzhen_semi:'chip',
    tokyo_elec:'display',
    pacific_solar:'battery',
    petro_chem_siam:'materials',
    siam_metal:'enclosure',
    singapore_port_3pl:'ems',
    siam_aero_robotics:'fabless_soc',
    apex_ind:'dram_memory',
    solartech_asia:'nand_storage',
    biomed_siam:'camera_module',
    green_power:'battery_pack',
    bharat_biotech_it:'os_platform'
  };
  const INITIAL_ROLE_SETS={
    siam_tech:['brand','os_platform'],
    titan_elec:['brand'],
    asia_autoparts:['brand'],
    eastern_auto:['brand'],
    shenzhen_semi:['chip','wafer_foundry','fabless_soc'],
    tokyo_elec:['display','display_panel','camera_module','dram_memory','nand_storage'],
    pacific_solar:['battery','battery_pack'],
    petro_chem_siam:['materials','pcb_rf','enclosure'],
    siam_metal:['enclosure'],
    singapore_port_3pl:['ems','osat_packaging'],
    siam_aero_robotics:['fabless_soc','camera_module'],
    apex_ind:['dram_memory'],
    solartech_asia:['nand_storage','pcb_rf'],
    biomed_siam:['camera_module'],
    green_power:['battery_pack','display_panel'],
    bharat_biotech_it:['os_platform']
  };
  const STRATEGY_FOCUS={
    siam_tech:'balanced',
    titan_elec:'performance',
    asia_autoparts:'endurance',
    eastern_auto:'camera_compact',
    shenzhen_semi:'foundry_idm',
    tokyo_elec:'high_density',
    pacific_solar:'high_capacity_cell',
    petro_chem_siam:'polymer_substrate',
    siam_metal:'thermal_chassis',
    singapore_port_3pl:'high_yield_osat',
    siam_aero_robotics:'low_power_isp',
    apex_ind:'high_bandwidth_ram',
    solartech_asia:'endurance_storage',
    biomed_siam:'precision_optics',
    green_power:'fast_charge_bms',
    bharat_biotech_it:'lightweight_rtos_open'
  };
  const clone=x=>JSON.parse(JSON.stringify(x));
  const safe=x=>Number.isSafeInteger(x)&&x>=0;
  function hash(s){let n=2166136261;for(const c of String(s)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;}
  function live(w){return w.externalWorld&&w.externalWorld.living;}
  function event(s,day,type,firmId,reasonTh,detail={}){const id='phone-event-'+(++s.sequence);s.events=s.events||[];s.events.unshift({id,day,type,firmId,reasonTh,...detail});s.events.length=Math.min(200,s.events.length);s.news.unshift({id:'phone-news-'+s.sequence,sourceEventId:id,day,type,firmId,headlineTh:reasonTh,reasonTh,...detail});s.news.length=Math.min(100,s.news.length);}
  function flow(f,k){return f.flow[k]||(f.flow[k]={opening:0,produced:0,bought:0,used:0,sold:0});}
  function stock(f,k,n,kind){f.stock[k]=(f.stock[k]||0)+n;flow(f,k)[kind]+=Math.abs(n);}
  function debit(f,n){f.cash-=n;f.payments+=n;f.dailyCost=(f.dailyCost||0)+n;}
  function credit(f,n){f.cash+=n;f.receipts+=n;f.dailyRevenue=(f.dailyRevenue||0)+n;}
  function transfer(a,b,n){if(!safe(n)||a.cash<n)return false;debit(a,n);credit(b,n);return true;}
  function wage(m,f,n){if(!safe(n)||f.cash<n||!m.nations[f.nationId])return false;debit(f,n);f.operatingExpenseSatang=(f.operatingExpenseSatang||0)+n;const h=m.nations[f.nationId];h.householdCash+=n;h.wages+=n;return true;}
  function capability(w,id,subject){
    if(id===w.phoneIndustry?.campusFirmId){
      const key=({
        hardware:'electrical_basics',
        chip:'semiconductor_physics',
        fabless_soc:'semiconductor_physics',
        wafer_foundry:'semiconductor_process',
        osat_packaging:'smt_process',
        dram_memory:'circuit_design',
        nand_storage:'embedded_firmware',
        camera_module:'semiconductor_optics',
        display_panel:'electrical_basics',
        battery_pack:'power_electronics',
        pcb_rf:'smt_process',
        enclosure:'metal_machining',
        os_platform:'software',
        manufacturing:'semiconductor_process'
      })[subject]||subject;
      const direct=Math.max(0,...w.people.filter(p=>p.employed).map(p=>p.education?.subjects?.[key]||0));
      if(direct>0)return direct;
      if(key==='semiconductor_optics')return Math.max(0,...w.people.filter(p=>p.employed).map(p=>Math.min(p.education?.subjects?.electrical_basics||0,p.education?.subjects?.metrology||0)));
      return 0;
    }
    const c=T.capability(w,id,subject);
    return Math.max(0,Math.min(100,Number(typeof c==='number'?c:c&&c.score)||0));
  }
  function roleKinds(role){
    if(role==='display')return ['ram','storage','display','camera'];
    if(role==='battery'||role==='battery_pack')return ['battery'];
    if(role==='enclosure')return ['enclosure'];
    if(role==='materials'||role==='pcb_rf')return ['enclosure','pcb_rf'];
    if(role==='dram_memory')return ['ram'];
    if(role==='nand_storage')return ['storage'];
    if(role==='camera_module')return ['camera'];
    if(role==='display_panel')return ['display'];
    if(role==='os_platform')return ['os'];
    return [];
  }
  function firmProducedKinds(f){
    const roles=Array.isArray(f.roles)&&f.roles.length?f.roles:[f.role];
    const out=new Set();
    for(const r of roles)for(const k of roleKinds(r))out.add(k);
    return [...out];
  }
  function ensure(w){
    if(w.phoneIndustry)return w.phoneIndustry;
    const m=live(w);if(!m)throw new Error('Phone industry requires living world');
    const s=w.phoneIndustry={version:1,lastDay:0,sequence:0,firms:{},designs:[],chips:[],components:[],lots:[],contracts:[],projects:[],cohorts:[],wipBatches:[],foundryOrders:[],channels:[],news:[],events:[],licenses:[],metrics:{completedProjects:0,produced:0,sold:0,returned:0,retired:0,revenueSatang:0,researchSatang:0,wagesSatang:0},inventory:{opening:[]}};
    for(const id of [...BRANDS,...Object.keys(ROLES)])if(m.firms[id]){
      const h=hash(w.seed+':phone:'+id),role=BRANDS.includes(id)?'brand':ROLES[id];
      const roles=INITIAL_ROLE_SETS[id]?[...INITIAL_ROLE_SETS[id]]:[role];
      s.firms[id]={id,role,roles,strategyFocus:STRATEGY_FOCUS[id]||'balanced',level:0,knowledge:0,capacity:2+h%4,reputation:50+h%20,reserveSatang:500000+h%500000,decisionTh:'เริ่มจากเทคโนโลยีฟีเจอร์โฟนที่ทีมรู้จริง',lastWorkDay:0,activeDesignId:null,produced:0,sold:0,revenueSatang:0,researchSatang:0,nreSpentSatang:0,costOfGoodsSatang:0,paidWagesSatang:0,refundSatang:0,dividendsSatang:0,missing:[],researchBranches:role==='chip'||role==='fabless_soc'?['architecture','process','packaging']:role==='display'||role==='display_panel'?['display','memory']:role==='battery'||role==='battery_pack'?['electrochemistry']:role==='brand'?['hardware','software','radio']:['materials','manufacturing']};
    }
    T.ensure(w,s.firms);
    const chip=E.synthesizeChip(w.seed+':opening-chip',Math.min(30,capability(w,'shenzhen_semi','chip')),{level:0,focus:'balanced'});
    chip.id='phone-chip-opening-'+hash(w.seed);chip.ownerId='shenzhen_semi';chip.level=0;s.chips.push(chip);
    const p=E.parts(w.seed+':opening-parts',0);
    for(const [kind,supplierId]of [['ram','tokyo_elec'],['storage','tokyo_elec'],['display','tokyo_elec'],['battery','pacific_solar'],['enclosure','siam_metal'],['camera','tokyo_elec'],['os','siam_tech']]){
      s.components.push({id:'phone-part-'+kind+'-0',kind,supplierId,level:0,spec:clone(p[kind]),licenseSatang:kind==='os'?1200:0,materialGrade:E.roleContract(kind==='ram'?'dram_memory':kind==='storage'?'nand_storage':kind==='camera'?'camera_module':kind==='display'?'display_panel':kind==='battery'?'battery_pack':kind==='os'?'os_platform':'enclosure').qualifiedMaterialGrade});
    }
    // Specialist supplier firms also hold initial feature-phone-grade component blueprints (still 0 physical inventory lots at opening).
    const specialistSeeds=[
      ['ram','apex_ind','phone-part-ram-apex-0'],
      ['storage','solartech_asia','phone-part-storage-solar-0'],
      ['camera','biomed_siam','phone-part-camera-biomed-0'],
      ['camera','siam_aero_robotics','phone-part-camera-aero-0'],
      ['battery','green_power','phone-part-battery-green-0'],
      ['display','green_power','phone-part-display-green-0'],
      ['enclosure','petro_chem_siam','phone-part-enclosure-petro-0'],
      ['pcb_rf','petro_chem_siam','phone-part-pcb_rf-0'],
      ['pcb_rf','solartech_asia','phone-part-pcb_rf-solar-0'],
      ['os','bharat_biotech_it','phone-part-os-bharat-0']
    ];
    for(const [kind,supplierId,partId]of specialistSeeds){
      if(!s.firms[supplierId])continue;
      const alt=E.parts(w.seed+':opening:'+supplierId+':'+kind,0,{capability:capability(w,supplierId,s.firms[supplierId].role)});
      s.components.push({id:partId,kind,supplierId,level:0,spec:clone(alt[kind]),licenseSatang:kind==='os'?1000:0,materialGrade:E.roleContract(s.firms[supplierId].role).qualifiedMaterialGrade});
    }
    event(s,0,'OPENING','shenzhen_semi','เปิดแผนกโทรศัพท์ด้วยความรู้ฟีเจอร์โฟน ไม่มีเครื่องหรือชิ้นส่วนเติมฟรี',{openingKnowledge:true});
    return s;
  }
  function lot(s,ownerId,kind,designId,quantity,unitCostSatang,day,meta={}){
    if(!quantity)return;
    const old=s.lots.find(l=>l.ownerId===ownerId&&l.kind===kind&&l.designId===designId&&l.available>0&&l.day===day);
    if(old){old.quantity+=quantity;old.available+=quantity;old.costSatang+=quantity*unitCostSatang;return old;}
    const l={id:'phone-lot-'+(++s.sequence),ownerId,kind,designId,quantity,available:quantity,reserved:0,used:0,sold:0,costSatang:quantity*unitCostSatang,unitCostSatang,day,...(meta.materialGrade?{materialGrade:meta.materialGrade}:{}),...(meta.sourceDesignId?{sourceDesignId:meta.sourceDesignId}:{}),...(meta.supplierId?{supplierId:meta.supplierId}:{})};
    s.lots.push(l);return l;
  }
  function recordWipBatch(s,firmId,role,kind,designId,quantity,workMinutes,unitCostSatang,day,meta={}){
    s.wipBatches=s.wipBatches||[];
    const batch={
      id:'phone-wip-'+(++s.sequence),
      firmId,
      role,
      kind,
      designId,
      materialGrade:meta.materialGrade||E.roleContract(role).qualifiedMaterialGrade,
      quantity,
      goodUnits:quantity,
      scrapUnits:meta.scrapUnits||0,
      stage:meta.stage||'completed',
      workMinutesDone:Math.round(workMinutes),
      requiredWorkMinutes:Math.round(meta.requiredWorkMinutes||workMinutes),
      inputCostSatang:quantity*unitCostSatang,
      serviceFeeSatang:meta.serviceFeeSatang||0,
      startedDay:day,
      completedDay:meta.stage==='processing'?null:day,
      reasonTh:meta.reasonTh||'แปรรูปผ่านด่านตรวจคุณภาพและรับเข้าคลังล็อตจริง'
    };
    s.wipBatches.unshift(batch);
    if(s.wipBatches.length>160)s.wipBatches.length=160;
    return batch;
  }
  function available(s,ownerId,kind,designId){return s.lots.filter(l=>l.ownerId===ownerId&&l.kind===kind&&(!designId||l.designId===designId)).reduce((a,l)=>a+l.available,0);}
  function consume(s,ownerId,kind,quantity,designId){
    if(available(s,ownerId,kind,designId)<quantity)return false;
    for(const l of s.lots){if(l.ownerId!==ownerId||l.kind!==kind||(designId&&l.designId!==designId))continue;const n=Math.min(quantity,l.available);l.available-=n;l.used+=n;quantity-=n;if(!quantity)break;}return true;
  }
  function unit(w,k){return Math.max(100,Math.round(live(w).markets[k]?.price||w.catalog?.materials[k]?.unitCost||5000));}
  function syncCampusMaterialsIfNeeded(w,s,buyer,k,need){
    if(buyer.id!==s.campusFirmId||!w.inventory?.materials)return;
    const have=buyer.stock[k]||0;
    if(have>=need)return;
    const reserved=w.inventory.reserved?.[k]||0;
    const freeCampus=Math.max(0,(w.inventory.materials[k]||0)-reserved);
    const pull=Math.min(need-have,freeCampus);
    if(pull>0){
      w.inventory.materials[k]-=pull;
      w.inventory.consumed[k]=(w.inventory.consumed[k]||0)+pull;
      if(w.knowledge&&w.knowledge.materialsConsumed)w.knowledge.materialsConsumed[k]=(w.knowledge.materialsConsumed[k]||0)+pull;
      stock(buyer,k,pull,'opening');
    }
  }
  function buyRaw(w,s,buyer,k,need,day){
    const m=live(w);
    syncCampusMaterialsIfNeeded(w,s,buyer,k,need);
    if((buyer.stock[k]||0)>=need)return true;
    if(s.contracts.some(c=>c.status==='shipping'&&c.buyerId===buyer.id&&c.kind==='raw'&&c.materialId===k))return false;
    const sellers=Object.values(m.firms).filter(f=>f.id!==buyer.id&&(f.stock[k]||0)>0).sort((a,b)=>(a.id==='world_exchange')-(b.id==='world_exchange')||a.id.localeCompare(b.id));
    const f=s.firms[buyer.id],price=unit(w,k);let remaining=Math.max(need*3-(buyer.stock[k]||0),1);
    for(const seller of sellers){const route=W.route(m,seller.nationId,buyer.nationId),policy=C.quote(w,seller.nationId,buyer.nationId,k,route),tax=Math.round(price*policy.tariff/100);const q=Math.min(remaining,seller.stock[k],policy.quota,Math.floor(Math.max(0,buyer.cash-f.reserveSatang)/(price+tax)));if(q<=0||policy.blocked)continue;if(!transfer(buyer,seller,q*price))continue;if(tax){debit(buyer,q*tax);m.nations[buyer.nationId].treasury+=q*tax;m.nations[buyer.nationId].taxes+=q*tax;}C.recordTrade(w,seller.nationId,buyer.nationId,k,q,q*price,q*tax);stock(seller,k,-q,'sold');const c={id:'phone-contract-'+(++s.sequence),kind:'raw',materialId:k,sellerId:seller.id,buyerId:buyer.id,quantity:q,unitPriceSatang:price,paidSatang:q*price,day,dueDay:day+route.days,taxSatang:q*tax,policyIds:policy.policyIds,status:'shipping'};s.contracts.push(c);remaining-=q;if(remaining<=0)break;}
    return false;
  }
  function inputs(w,s,f,recipe,day){let ok=true;for(const[k,n]of Object.entries(recipe))if(!buyRaw(w,s,f,k,n,day))ok=false;return ok;}
  function useRaw(f,recipe){for(const[k,n]of Object.entries(recipe))stock(f,k,-n,'used');}
  function deliver(w,s,day){
    for(const c of s.contracts)if(c.status==='shipping'&&day>=c.dueDay){
      if(c.kind==='raw')stock(live(w).firms[c.buyerId],c.materialId,c.quantity,'bought');
      else{
        const source=s.lots.find(l=>l.id===c.sourceLotId);
        if(source){source.reserved-=c.quantity;source.sold+=c.quantity;}
        lot(s,c.buyerId,c.componentKind,c.targetDesignId||c.designId,c.quantity,c.unitPriceSatang+(c.taxPerUnitSatang||0),day,{sourceDesignId:c.designId,supplierId:c.sellerId});
      }
      c.status='delivered';c.deliveredDay=day;
    }
  }
  function isSubstitutableLot(s,kind,targetDesignId,candidateDesignId,chip){
    if(candidateDesignId===targetDesignId)return true;
    if(kind==='chip'){
      const targetChip=s.chips.find(c=>c.id===targetDesignId);
      const candChip=s.chips.find(c=>c.id===candidateDesignId);
      if(!targetChip||!candChip)return false;
      return candChip.isa===targetChip.isa&&candChip.level===targetChip.level&&candChip.memoryType===targetChip.memoryType&&candChip.maxRamMB>=targetChip.maxRamMB&&candChip.maxPixels>=targetChip.maxPixels;
    }
    const targetComp=s.components.find(c=>c.id===targetDesignId);
    const candComp=s.components.find(c=>c.id===candidateDesignId);
    if(!targetComp||!candComp||candComp.kind!==kind)return false;
    if(chip&&!E.isCompatiblePart(chip,kind,candComp.spec))return false;
    return candComp.level===targetComp.level;
  }
  function adoptOwnedCompatibleLot(s,buyerId,kind,designId,need,chip){
    if(available(s,buyerId,kind,designId)>=need)return true;
    for(const l of s.lots){
      if(l.ownerId!==buyerId||l.kind!==kind||l.designId===designId||l.available<=0)continue;
      if(isSubstitutableLot(s,kind,designId,l.designId,chip)){
        l.sourceDesignId=l.sourceDesignId||l.designId;
        l.designId=designId;
        if(available(s,buyerId,kind,designId)>=need)return true;
      }
    }
    return available(s,buyerId,kind,designId)>=need;
  }
  function purchase(w,s,m,buyerId,kind,designId,need,day,chip=null){
    if(adoptOwnedCompatibleLot(s,buyerId,kind,designId,need,chip))return true;
    if(s.contracts.some(c=>c.status==='shipping'&&c.buyerId===buyerId&&c.componentKind===kind&&(c.designId===designId||c.targetDesignId===designId)))return false;
    const buyer=m.firms[buyerId],f=s.firms[buyerId];
    const candidateLots=s.lots.filter(l=>{
      if(l.ownerId===buyerId||l.kind!==kind||l.available<=0||!isSubstitutableLot(s,kind,designId,l.designId,chip))return false;
      const sellerFirm=s.firms[l.ownerId];
      if(sellerFirm&&Array.isArray(sellerFirm.roles)&&sellerFirm.roles.includes('brand')&&l.available<=4)return false;
      return true;
    }).sort((a,b)=>{
      const exactA=a.designId===designId?0:1,exactB=b.designId===designId?0:1;
      const campusA=a.ownerId===s.campusFirmId?0:1,campusB=b.ownerId===s.campusFirmId?0:1;
      return campusA-campusB||exactA-exactB||a.unitCostSatang-b.unitCostSatang||b.available-a.available;
    });
    for(const l of candidateLots){
      const price=Math.max(100,Math.round(l.unitCostSatang*1.25)),seller=m.firms[l.ownerId],commodity=kind==='battery'?'battery':kind==='enclosure'?'metal_sheet':'pcb',route=W.route(m,seller.nationId,buyer.nationId),policy=C.quote(w,seller.nationId,buyer.nationId,commodity,route),tax=Math.round(price*policy.tariff/100);if(policy.blocked)continue;const q=Math.min(policy.quota,Math.max(need*2-available(s,buyerId,kind,designId),0),l.available,Math.floor(Math.max(0,buyer.cash-f.reserveSatang)/(price+tax)));
      if(q<=0||!transfer(buyer,m.firms[l.ownerId],q*price))continue;const vendor=s.firms[l.ownerId];if(vendor){vendor.revenueSatang+=q*price;vendor.sold+=q;vendor.costOfGoodsSatang=(vendor.costOfGoodsSatang||0)+q*l.unitCostSatang;seller.cogsSatang=(seller.cogsSatang||0)+q*l.unitCostSatang;}if(tax){debit(buyer,q*tax);m.nations[buyer.nationId].treasury+=q*tax;m.nations[buyer.nationId].taxes+=q*tax;}C.recordTrade(w,seller.nationId,buyer.nationId,commodity,q,q*price,q*tax);l.available-=q;l.reserved+=q;s.contracts.push({id:'phone-contract-'+(++s.sequence),kind:'component',componentKind:kind,designId:l.designId,targetDesignId:designId,sourceLotId:l.id,sellerId:l.ownerId,buyerId,quantity:q,unitPriceSatang:price,paidSatang:q*price,taxSatang:q*tax,taxPerUnitSatang:tax,policyIds:policy.policyIds,day,dueDay:day+policy.days,status:'shipping'});break;
    }return false;
  }
  function currentDesign(s,id){return s.designs.filter(d=>d.firmId===id).slice(-1)[0];}
  function costOf(s,owner,kind,quantity,id){let total=0;for(const l of s.lots){if(l.ownerId!==owner||l.kind!==kind||l.designId!==id)continue;const q=Math.min(quantity,l.available);quantity-=q;total+=q*l.unitCostSatang;if(!quantity)break;}return total;}
  function selectBestPartForBrand(s,f,kind,maxLevel,chip=null){
    const candidates=s.components.filter(c=>c.kind===kind&&c.level<=maxLevel&&(!chip||E.isCompatiblePart(chip,kind,c.spec)));
    if(!candidates.length)return s.components.filter(c=>c.kind===kind&&c.level<=maxLevel).slice(-1)[0];
    return candidates.sort((a,b)=>{
      const inHouseA=a.supplierId===f.id?1:0,inHouseB=b.supplierId===f.id?1:0;
      const stockA=available(s,a.supplierId,kind,a.id)+available(s,f.id,kind,a.id);
      const stockB=available(s,b.supplierId,kind,b.id)+available(s,f.id,kind,b.id);
      const hasStockA=stockA>0?1:0,hasStockB=stockB>0?1:0;
      return b.level-a.level||inHouseB-inHouseA||hasStockB-hasStockA||stockB-stockA;
    })[0];
  }
  function selectBestChipForBrand(s,f,maxLevel){
    const candidates=s.chips.filter(c=>(c.level||0)<=maxLevel);
    if(!candidates.length)return s.chips.slice(-1)[0];
    return candidates.sort((a,b)=>{
      const inHouseA=a.ownerId===f.id?1:0,inHouseB=b.ownerId===f.id?1:0;
      const stockA=available(s,a.ownerId,'chip',a.id)+available(s,f.id,'chip',a.id);
      const stockB=available(s,b.ownerId,'chip',b.id)+available(s,f.id,'chip',b.id);
      const hasStockA=stockA>0?1:0,hasStockB=stockB>0?1:0;
      return (b.level||0)-(a.level||0)||inHouseB-inHouseA||hasStockB-hasStockA||stockB-stockA;
    })[0];
  }
  function newProject(w,s,f,day){
    const real=live(w).firms[f.id];if(real.cash<f.reserveSatang+100000)return;
    const current=s.designs.find(d=>d.id===f.activeDesignId),isBrand=f.role==='brand';
    if(isBrand&&current&&available(s,f.id,'phone',current.id)>f.capacity*8){f.decisionTh='ชะลอรุ่นใหม่เพราะสต็อกเดิมยังขายไม่หมด';return;}
    if(isBrand&&current&&f.knowledge<2400*(f.level+1))return;
    if(!isBrand&&f.knowledge<3200*(f.level+1))return;if(f.level>=3&&!isBrand)return;
    const isOsVendor=f.role==='os_platform';
    const platform=(isBrand&&current&&!s.components.some(c=>c.kind==='os'&&c.supplierId===f.id&&c.level>0))||isOsVendor;
    const leader=Object.values(w.phoneTalent.people).find(x=>x.employerId===f.id&&x.role==='ceo');const risk=leader?.profile.personality.riskTaking||50;if(current&&day%7!==hash(w.seed+f.id)%7)return;const increment=!current||risk>45||f.knowledge>20000?1:0;
    const hasInitialChipOrPart=f.role==='fabless_soc'?s.chips.some(c=>c.ownerId===f.id):true;
    const level=isBrand&&!current?0:(!hasInitialChipOrPart?0:Math.min(3,f.level+increment));
    const isSemi=f.role==='chip'||f.role==='fabless_soc'||f.role==='wafer_foundry';
    const subject=platform?'software':isSemi?'chip':f.role==='ems'||f.role==='osat_packaging'?'manufacturing':f.role==='enclosure'?'metal_machining':f.role==='camera_module'?'camera_module':f.role==='dram_memory'?'dram_memory':f.role==='nand_storage'?'nand_storage':f.role==='battery_pack'||f.role==='battery'?'battery_pack':'hardware';
    if(level>0&&capability(w,f.id,subject)<22+level*10){f.decisionTh='ยังขาดผู้เชี่ยวชาญสำหรับการวิจัยขั้นถัดไป';return;}
    const reqMin=platform?10000*(level+1):isBrand?5000*(level+1):isSemi?Math.max(14000,12000*(level+1)):12000*(level+1);
    const p={id:'phone-project-'+(++s.sequence),firmId:f.id,type:platform?'platform':isBrand?'handset':isSemi?'semiconductor':'component',subject,level,progress:0,requiredMinutes:reqMin,spentSatang:0,status:'research',startedDay:day,prototypeConsumed:false,reasonTh:'สะสมงานวิศวกรและสร้างต้นแบบจากชิ้นส่วนจริง'};
    s.projects.push(p);event(s,day,'RESEARCH_START',f.id,'ผู้บริหารอนุมัติโครงการจากเงินสำรองและความรู้ของทีม',{projectId:p.id});
  }
  function progress(w,s,f,work,day,allocatedWages=0){
    const real=live(w).firms[f.id];let p=s.projects.find(p=>p.firmId===f.id&&['research','prototype'].includes(p.status));if(!p){newProject(w,s,f,day);p=s.projects.find(p=>p.firmId===f.id&&['research','prototype'].includes(p.status));}if(!p)return 0;
    const wasResearch=p.status==='research';
    const minutes=wasResearch?Math.floor(work*.6):0;
    p.contributors=f.isCampus?w.people.filter(x=>x.employed&&(x.education?.subjects?.electrical_basics>=35||x.education?.subjects?.software>=40||x.education?.subjects?.semiconductor_physics>=35||x.education?.subjects?.circuit_design>=35||x.education?.subjects?.semiconductor_optics>=35||x.education?.subjects?.metal_machining>=35)).map(x=>x.id):(w.phoneTalent?Object.values(w.phoneTalent.people).filter(x=>x.employerId===f.id&&x.role==='engineer').map(x=>x.id):[]);
    if(minutes>0){
      p.progress=Math.min(p.requiredMinutes,p.progress+minutes);
      p.spentSatang+=Math.round(allocatedWages*.6);
      f.knowledge+=minutes;
    }
    if(p.progress<p.requiredMinutes)return minutes;
    p.status='prototype';
    const recipe=p.type==='semiconductor'?{silicon_wafer:1,copper_coil:1}:p.type==='handset'?{pcb:1,polymer_resin:1,battery:1}:{polymer_resin:1,copper_coil:1};
    if(!inputs(w,s,real,recipe,day)){p.reasonTh='รอวัตถุดิบต้นแบบและเวลาส่งมอบ';return minutes;}
    if(p.type==='handset'){
      const chipObj=p.selectedChipId?s.chips.find(c=>c.id===p.selectedChipId):selectBestChipForBrand(s,f,p.level);
      if(!p.selectedChipId){
        p.selectedChipId=chipObj.id;p.selectedParts={};
        for(const kind of ['ram','storage','display','battery','enclosure','camera','os']){
          const chosen=selectBestPartForBrand(s,f,kind,chipObj.level||0,chipObj);
          p.selectedParts[kind]=chosen.id;
        }
      }
      let ready=purchase(w,s,live(w),f.id,'chip',p.selectedChipId,1,day,chipObj);
      for(const kind of ['ram','storage','display','battery','enclosure','camera'])if(!purchase(w,s,live(w),f.id,kind,p.selectedParts[kind],1,day,chipObj))ready=false;
      if(!ready){p.reasonTh='รอชิป แรม และส่วนประกอบตัวอย่างเข้าคลังเพื่อสร้างต้นแบบจริง';return minutes;}
      consume(s,f.id,'chip',1,p.selectedChipId);for(const kind of ['ram','storage','display','battery','enclosure','camera'])consume(s,f.id,kind,1,p.selectedParts[kind]);
    }
    useRaw(real,recipe);p.prototypeConsumed=true;
    if(p.type==='platform'){const spec=E.parts(w.seed+':platform:'+p.id,p.level,{capability:capability(w,f.id,'software')}).os;s.components.push({id:'phone-os-'+(++s.sequence),kind:'os',supplierId:f.id,level:p.level,spec,licenseSatang:1200,materialGrade:'hdi_rf_copper_laminate'});f.level=Math.max(f.level,p.level);p.status='complete';s.metrics.completedProjects++;p.completedDay=day;p.reasonTh='ทีมซอฟต์แวร์ทดสอบแพลตฟอร์มและไดรเวอร์จากต้นแบบจริง';event(s,day,'OS_RELEASE',f.id,p.reasonTh,{projectId:p.id});return minutes;}
    if(p.type==='handset'){
      const chip=s.chips.find(c=>c.id===p.selectedChipId),parts=Object.fromEntries(Object.entries(p.selectedParts).map(([kind,id])=>[kind,clone(s.components.find(c=>c.id===id).spec)])),result=E.evaluate(chip,parts,{ambientC:30});
      if(!result.compatible){p.status='failed';p.reasonTh=(result.reasonsTh||['ไม่ผ่านด่านวิศวกรรม']).join(' • ');event(s,day,'PROTOTYPE_FAILED',f.id,p.reasonTh,{projectId:p.id});return minutes;}
      const id='phone-design-'+(++s.sequence),componentIds={};Object.assign(componentIds,p.selectedParts);
      const d={id,firmId:f.id,nameTh:['อรุณ','สายลม','ธารา','ภูผา','อันดา','นภา'][hash(w.seed+f.id)%6]+' '+['S','M','A','N'][hash(w.seed+f.id+'family')%4]+(s.designs.filter(d=>d.firmId===f.id).length+1),level:p.level,category:parts.os.installableApps?'smart':'feature',predecessorId:currentDesign(s,f.id)?.id||null,chipId:chip.id,parts,componentIds,evaluation:result,priceSatang:Math.max(60000,Math.round((result.costEstimateSatang||60000)*(1.4+(100-real.prudence)/200))),createdDay:day,stage:'pilot',validationMinutes:0,networkCertified:true,radioGeneration:chip.radioGeneration||2,launchedDay:null,produced:0,sold:0,returned:0,revenueSatang:0,costSatang:0,reasonTh:'ผ่านต้นแบบและด่านความเข้ากันได้จากชิ้นส่วนที่มีจริง'};
      d.comparison=d.predecessorId?compare(s.designs.find(x=>x.id===d.predecessorId),d):null;s.designs.push(d);f.activeDesignId=id;
    }else if(p.type==='semiconductor'){
      const chip=E.synthesizeChip(w.seed+':chip:'+p.id,capability(w,f.id,'chip'),{level:p.level,focus:f.strategyFocus==='low_power_isp'?'ai_isp':'balanced'});chip.id='phone-chip-'+(++s.sequence);chip.ownerId=f.id;chip.level=p.level;s.chips.push(chip);
      f.nreSpentSatang=(f.nreSpentSatang||0)+(chip.maskCostSatang||1200000);
    }else{
      const parts=E.parts(w.seed+':parts:'+p.id,p.level,{capability:capability(w,f.id,f.role)});
      const kinds=firmProducedKinds(f).filter(k=>k!=='os');
      for(const kind of kinds)if(parts[kind])s.components.push({id:'phone-part-'+(++s.sequence),kind,supplierId:f.id,level:p.level,spec:clone(parts[kind]),licenseSatang:0,materialGrade:E.roleContract(f.role).qualifiedMaterialGrade});
    }
    f.level=Math.max(f.level,p.level);p.status='complete';s.metrics.completedProjects++;p.completedDay=day;p.reasonTh='ต้นแบบใช้วัตถุดิบจริงและผ่านการทดสอบแล้ว';event(s,day,'RESEARCH_COMPLETE',f.id,'ต้นแบบผ่านการทดสอบ เปิดทางเลือกการผลิตใหม่',{projectId:p.id,level:p.level});
    return minutes;
  }
  function produceChipBatch(w,s,f,minutes,day){
    const m=live(w),real=m.firms[f.id];
    const owned=s.chips.filter(c=>c.ownerId===f.id);
    const needed=new Set([...s.designs.filter(d=>d.stage==='pilot'||available(s,d.firmId,'phone',d.id)<12).map(d=>d.chipId),...s.projects.filter(p=>p.status==='prototype').map(p=>p.selectedChipId)]);
    const chip=owned.filter(c=>needed.has(c.id)&&available(s,f.id,'chip',c.id)<20).sort((a,b)=>available(s,f.id,'chip',a.id)-available(s,f.id,'chip',b.id))[0]||owned.slice(-1)[0];
    if(!chip||available(s,f.id,'chip',chip.id)>200)return;
    const ownsFoundry=(f.roles||[f.role]).includes('wafer_foundry')||f.role==='chip';
    const packager=m.firms.singapore_port_3pl;
    if(ownsFoundry&&(!f.isCampus||w.plant?.machines?.semiconductor_fab?.status==='ready')){
      const recipe={silicon_wafer:1,copper_coil:1};if(!inputs(w,s,real,recipe,day)){f.missing.push('silicon_wafer/copper_coil');return;}
      const y=E.wafer({dieAreaMm2:chip.dieAreaMm2,defectsPerCm2:Math.max(.05,.4-capability(w,f.id,'manufacturing')/250),waferCostSatang:unit(w,'silicon_wafer')+unit(w,'copper_coil'),packCostSatang:200,royaltySatang:0});
      const q=Math.max(0,Math.floor(y.packagedGood||0));if(!q)return;
      const packagingFee=y.goodDies*200;
      const inHouseOsat=(f.roles||[]).includes('osat_packaging');
      if(!inHouseOsat&&(!packager||real.cash<f.reserveSatang+packagingFee||!transfer(real,packager,packagingFee)))return;
      if(!inHouseOsat&&s.firms.singapore_port_3pl){s.firms.singapore_port_3pl.revenueSatang+=packagingFee;s.firms.singapore_port_3pl.produced+=q;}
      useRaw(real,recipe);
      const uCost=Math.max(100,Math.round(y.unitCostSatang||((unit(w,'silicon_wafer')+unit(w,'copper_coil'))/q)));
      lot(s,f.id,'chip',chip.id,q,uCost,day,{materialGrade:'packaged_tested_ic_grade'});
      recordWipBatch(s,f.id,f.role,'chip',chip.id,q,minutes,uCost,day,{materialGrade:'packaged_tested_ic_grade',scrapUnits:y.scrap,serviceFeeSatang:inHouseOsat?0:packagingFee,reasonTh:'เดินสายเวเฟอร์ในโรงหล่อและคัดเกรดชิปผ่าน OSAT'});
      f.produced+=q;
      return;
    }
    // Fabless SoC path: book wafer fabrication at an active wafer foundry (e.g. shenzhen_semi) and packaging at OSAT (singapore_port_3pl).
    const foundryFirm=Object.values(s.firms).find(x=>x.id!==f.id&&((x.roles||[]).includes('wafer_foundry')||x.role==='chip')&&m.firms[x.id]);
    if(!foundryFirm){f.decisionTh='ไม่พบโรงหล่อเวเฟอร์ที่เปิดรับจ้างผลิต';return;}
    const foundryReal=m.firms[foundryFirm.id];
    const foundrySlots=s.foundrySlots?.day===day?s.foundrySlots:(s.foundrySlots={day,used:0});
    if(foundrySlots.used>=Math.max(2,foundryFirm.capacity)){f.decisionTh='รอคิวโรงหล่อเวเฟอร์ที่ถูกจองเต็มในวันนี้';f.missing.push('foundry_slot');return;}
    const recipe={silicon_wafer:1,copper_coil:1};
    // Fabless firm can supply its own wafer inputs or pay foundry for full turnkey wafer + fabrication.
    syncCampusMaterialsIfNeeded(w,s,real,'silicon_wafer',1);
    syncCampusMaterialsIfNeeded(w,s,real,'copper_coil',1);
    const fablessHasRaw=(real.stock.silicon_wafer||0)>=1&&(real.stock.copper_coil||0)>=1;
    const foundryHasRaw=!fablessHasRaw&&inputs(w,s,foundryReal,recipe,day);
    if(!fablessHasRaw&&!foundryHasRaw){
      inputs(w,s,real,recipe,day);
      f.decisionTh='รอแผ่นเวเฟอร์ซิลิคอนและทองแดงสำหรับส่งเข้าโรงหล่อชิป';f.missing.push('silicon_wafer');return;
    }
    const rawCost=unit(w,'silicon_wafer')+unit(w,'copper_coil');
    const foundryFee=Math.round(rawCost*(fablessHasRaw?0.45:1.25))+15000;
    const y=E.wafer({dieAreaMm2:chip.dieAreaMm2,defectsPerCm2:Math.max(.05,.4-capability(w,foundryFirm.id,'manufacturing')/250),waferCostSatang:foundryFee,packCostSatang:200,royaltySatang:0});
    const q=Math.max(0,Math.floor(y.packagedGood||0));if(!q)return;
    const packagingFee=y.goodDies*200;
    if(real.cash<f.reserveSatang+foundryFee+packagingFee){f.decisionTh='รักษาเงินสำรอง รอทุนจ้างโรงหล่อเวเฟอร์และแพ็กเกจ OSAT';return;}
    if(!transfer(real,foundryReal,foundryFee))return;
    if(packager&&!transfer(real,packager,packagingFee))return;
    if(fablessHasRaw)useRaw(real,recipe);else useRaw(foundryReal,recipe);
    foundrySlots.used++;
    foundryFirm.revenueSatang+=foundryFee;foundryFirm.produced+=q;
    if(s.firms.singapore_port_3pl){s.firms.singapore_port_3pl.revenueSatang+=packagingFee;s.firms.singapore_port_3pl.produced+=q;}
    const uCost=Math.max(100,Math.ceil((foundryFee+packagingFee+(fablessHasRaw?rawCost:0))/q));
    lot(s,f.id,'chip',chip.id,q,uCost,day,{materialGrade:'packaged_tested_ic_grade',supplierId:foundryFirm.id});
    s.foundryOrders=s.foundryOrders||[];
    s.foundryOrders.unshift({id:'foundry-order-'+(++s.sequence),day,fablessFirmId:f.id,foundryFirmId:foundryFirm.id,osatFirmId:packager?.id||'singapore_port_3pl',chipId:chip.id,nodeNm:chip.nodeNm,grossDies:y.grossDies,goodDies:y.goodDies,packagedGood:q,aBin:y.aBin,bBin:y.bBin,scrap:y.scrap,foundryFeeSatang:foundryFee,packagingFeeSatang:packagingFee,unitCostSatang:uCost,status:'completed'});
    if(s.foundryOrders.length>120)s.foundryOrders.length=120;
    recordWipBatch(s,f.id,'fabless_soc','chip',chip.id,q,minutes,uCost,day,{materialGrade:'packaged_tested_ic_grade',scrapUnits:y.scrap,serviceFeeSatang:foundryFee+packagingFee,reasonTh:'ส่งแบบชิปจ้างหล่อเวเฟอร์ที่ '+foundryFirm.id+' และประกอบแพ็กเกจ OSAT จนได้ชิปพร้อมขาย'});
    f.produced+=q;
    f.decisionTh='ออกแบบชิป Fabless สั่งหล่อเวเฟอร์และทดสอบแพ็กเกจ OSAT เข้าคลังพร้อมขาย B2B';
  }
  function produce(w,s,f,minutes,day){
    const real=live(w).firms[f.id];if(minutes<10)return;
    const roles=Array.isArray(f.roles)&&f.roles.length?f.roles:[f.role];
    if(roles.includes('chip')||roles.includes('fabless_soc')||roles.includes('wafer_foundry')){
      if(s.chips.some(c=>c.ownerId===f.id))produceChipBatch(w,s,f,minutes,day);
    }
    const parts=s.components.filter(c=>c.supplierId===f.id&&c.kind!=='os').sort((a,b)=>available(s,f.id,a.kind,a.id)-available(s,f.id,b.kind,b.id)||hash(w.seed+day+a.id)-hash(w.seed+day+b.id));
    let remaining=Math.floor(minutes);
    for(const c of parts){
      if(remaining<30)break;
      if(available(s,f.id,c.kind,c.id)>50)continue;
      const baseRecipe=c.kind==='battery'?{battery:1}:c.kind==='display'?{glass_bottle:1,copper_coil:1}:['ram','storage'].includes(c.kind)?{silicon_wafer:1,copper_coil:1}:c.kind==='camera'?((real.stock.optical_lens||0)>=1&&(real.stock.sensor||0)>=1?{optical_lens:1,sensor:1}:{polymer_resin:1,metal_sheet:1}):c.kind==='pcb_rf'?((real.stock.pcb||0)>=1&&(real.stock.copper_coil||0)>=1?{pcb:1,copper_coil:1}:{polymer_resin:1,metal_sheet:1}):{polymer_resin:1,metal_sheet:1};
      const recipe={...baseRecipe};
      let q=Math.min(f.capacity,Math.floor(remaining/30));
      for(const key of Object.keys(recipe)){
        syncCampusMaterialsIfNeeded(w,s,real,key,q*recipe[key]);
        if((real.stock[key]||0)<q*recipe[key])buyRaw(w,s,real,key,q*recipe[key],day);
      }
      q=Math.min(q,...Object.entries(recipe).map(([k,n])=>Math.floor((real.stock[k]||0)/n)));
      if(!q){
        const scaled={...baseRecipe};
        for(const key of Object.keys(scaled))scaled[key]*=Math.max(1,Math.min(f.capacity,2));
        inputs(w,s,real,scaled,day);
        continue;
      }
      for(const key of Object.keys(recipe))recipe[key]*=q;
      if(!inputs(w,s,real,recipe,day))continue;
      useRaw(real,recipe);
      remaining-=q*30;
      const cost=Object.entries(recipe).reduce((a,[k,n])=>a+unit(w,k)*n,0);
      const uCost=Math.ceil(cost/q)+1000;
      lot(s,f.id,c.kind,c.id,q,uCost,day,{materialGrade:c.materialGrade});
      recordWipBatch(s,f.id,f.role,c.kind,c.id,q,q*30,uCost,day,{materialGrade:c.materialGrade,reasonTh:'แปรรูปชิ้นส่วน '+c.kind+' ผ่านการตรวจสอบคุณภาพเข้าคลังล็อต'});
      f.produced+=q;
    }
    if(roles.includes('brand')&&f.activeDesignId)assemble(w,s,f,Math.max(20,remaining||Math.floor(minutes*.5)),day);
  }
  function assemble(w,s,f,minutes,day){
    const m=live(w),real=m.firms[f.id],d=s.designs.find(d=>d.id===f.activeDesignId);if(!d)return;
    const chipObj=s.chips.find(c=>c.id===d.chipId);
    let max=Math.min(f.capacity,Math.floor(minutes/20));if(!max||available(s,f.id,'phone',d.id)>=f.capacity*10)return;
    let ok=purchase(w,s,m,f.id,'chip',d.chipId,max,day,chipObj);for(const k of ['ram','storage','display','battery','enclosure','camera'])if(!purchase(w,s,m,f.id,k,d.componentIds[k],max,day,chipObj))ok=false;
    if(!inputs(w,s,real,{pcb:max,copper_coil:max},day))ok=false;
    max=Math.min(max,available(s,f.id,'chip',d.chipId),...['ram','storage','display','battery','enclosure','camera'].map(k=>available(s,f.id,k,d.componentIds[k])),real.stock.pcb||0,real.stock.copper_coil||0);ok=max>0;
    const slots=s.emsSlots?.day===day?s.emsSlots:(s.emsSlots={day,used:0});if(slots.used+max>(s.firms.singapore_port_3pl?.capacity||1)*6){f.decisionTh='รอคิวสายประกอบ EMS ที่ถูกจองเต็มแล้ว';return;}
    const ems=m.firms.singapore_port_3pl,licenseOwner=m.firms[s.components.find(c=>c.id===d.componentIds.os).supplierId];const fee=2500,license=1200;
    if(!max){f.decisionTh='รอชิ้นส่วนเข้าคลัง';return;}if(!ems||real.cash<f.reserveSatang+max*(fee+license)){f.decisionTh='รักษาเงินสำรอง รอทุนประกอบและค่าลิขสิทธิ์';return;}if(!ok){f.decisionTh='รอชิ้นส่วนเฉพาะแบบและแผงวงจรที่สั่งซื้อ';return;}
    const exactCost=costOf(s,f.id,'chip',max,d.chipId)+['ram','storage','display','battery','enclosure','camera'].reduce((a,k)=>a+costOf(s,f.id,k,max,d.componentIds[k]),0)+max*(unit(w,'pcb')+unit(w,'copper_coil')+fee+license);slots.used+=max;
    consume(s,f.id,'chip',max,d.chipId);for(const k of ['ram','storage','display','battery','enclosure','camera'])consume(s,f.id,k,max,d.componentIds[k]);useRaw(real,{pcb:max,copper_coil:max});transfer(real,ems,max*fee);if(licenseOwner.id!==real.id)transfer(real,licenseOwner,max*license);
    if(s.firms.singapore_port_3pl){s.firms.singapore_port_3pl.revenueSatang+=max*fee;s.firms.singapore_port_3pl.produced+=max;}
    const cost=Math.ceil(exactCost/max);d.actualUnitCostSatang=cost;d.priceSatang=Math.max(d.priceSatang,Math.ceil(cost*(1.2+f.reputation/500)));lot(s,f.id,'phone',d.id,max,cost,day,{materialGrade:'hdi_rf_copper_laminate'});
    recordWipBatch(s,f.id,'brand','phone',d.id,max,max*20,cost,day,{serviceFeeSatang:max*(fee+license),reasonTh:'ประกอบโทรศัพท์จากชิ้นส่วนจริงครบชุดและส่งเข้าสต็อกรอตรวจปล่อย'});
    d.produced+=max;d.costSatang+=max*cost;f.produced+=max;s.metrics.produced+=max;f.decisionTh='ประกอบตามกำลังคนและวัตถุดิบ พร้อมขายจากสต็อกจริง';
  }
  function retail(w,s,f,day){
    if(f.role!=='brand'&&!(f.roles||[]).includes('brand'))return;const m=live(w),real=m.firms[f.id],n=m.nations[real.nationId];
    for(const d of s.designs.filter(d=>d.firmId===f.id)){
      const count=available(s,f.id,'phone',d.id);if(!count)continue;if(d.stage!=='released'){if(d.validationMinutes>=1200&&count>=2&&day-d.createdDay>=7){d.stage='released';d.launchedDay=day;d.networkCertified=true;event(s,day,'LAUNCH',f.id,'ปล่อยขายหลังผลิตนำร่อง ตรวจคุณภาพ และมีเครื่องจริงในคลัง',{designId:d.id});}else continue;}
      if(day-d.launchedDay>14&&count>f.capacity*5)d.priceSatang=Math.max(d.actualUnitCostSatang||30000,Math.round(d.priceSatang*.99));
      const segment=hash(w.seed+':segment:'+day)%3,ev=d.evaluation;const value=segment===0?Math.min(2,ev.batteryHours/24)+ev.taskScores.call/100:segment===1?ev.taskScores.web/40+(d.parts.camera?.megapixels||0)/10:ev.taskScores.game/30+d.parts.storage.capacityMB/2048;const appetite=Math.max(0,Math.floor((value+.5)*Math.max(60000,(d.actualUnitCostSatang||60000)*1.5)/d.priceSatang+(hash(w.seed+':demand:'+f.id+':'+day)%100)/100)),q=Math.min(count,appetite,Math.floor(Math.min(n.householdCash,Math.floor(n.householdCash*.0005))/d.priceSatang));if(!q)continue;
      consume(s,f.id,'phone',q,d.id);const revenue=q*d.priceSatang;n.householdCash-=revenue;n.consumption+=revenue;credit(real,revenue);d.sold+=q;d.revenueSatang+=revenue;f.sold+=q;f.revenueSatang+=revenue;s.metrics.sold+=q;s.metrics.revenueSatang+=revenue;real.cogsSatang=(real.cogsSatang||0)+q*(d.actualUnitCostSatang||0);
      const channelType=d.category==='smart'&&q>=2?'carrier_bundle':q>=2?'retail_distributor':'direct_household';
      const cohort={id:'phone-cohort-'+(++s.sequence),firmId:f.id,designId:d.id,nationId:n.id,quantity:q,active:q,returned:0,retired:0,day,priceSatang:d.priceSatang,lastSupportDay:day,segment:['basic_voice','multimedia','application'][segment],channel:channelType,networkGen:(d.radioGeneration||2)+'G',reasonTh:'เลือกจากราคา แบตเตอรี่ งานที่ใช้ได้ กล้อง และพื้นที่เก็บข้อมูลจริง'};
      s.cohorts.push(cohort);
      s.channels=s.channels||[];
      s.channels.unshift({id:'phone-channel-'+(++s.sequence),day,firmId:f.id,designId:d.id,channelType,quantity:q,revenueSatang:revenue,networkGen:cohort.networkGen,segment:cohort.segment});
      if(s.channels.length>120)s.channels.length=120;
      if(d.sold===q)event(s,day,'LAUNCH_SALES',f.id,'ลูกค้าซื้อโทรศัพท์จากสต็อกจริงและงบครัวเรือน',{designId:d.id,quantity:q});
    }
  }
  function support(w,s,day){
    const m=live(w);for(const c of s.cohorts){if(c.active<=0||day-c.lastSupportDay<30)continue;c.lastSupportDay=day;const f=m.firms[c.firmId],d=s.designs.find(d=>d.id===c.designId),n=m.nations[c.nationId],age=day-c.day;
      if(age>=540){s.metrics.retired+=c.active;c.retired+=c.active;c.active=0;continue;}
      // Warranty is finite. A low per-device monthly hazard depends on measured heat, not a flat cohort refund.
      if(age>365)continue;const heat=Math.max(0,(d.evaluation.surfaceC||30)-43),risk=Math.min(.05,.004+heat*.001),failed=Array.from({length:c.active},(_,i)=>hash(w.seed+c.id+':'+Math.floor(age/30)+':'+i)%100000<risk*100000).filter(Boolean).length,quantity=Math.min(failed,Math.floor(f.cash/c.priceSatang));
      if(quantity){debit(f,quantity*c.priceSatang);n.householdCash+=quantity*c.priceSatang;n.consumption-=quantity*c.priceSatang;c.active-=quantity;c.returned+=quantity;d.returned+=quantity;s.firms[c.firmId].refundSatang=(s.firms[c.firmId].refundSatang||0)+quantity*c.priceSatang;s.metrics.returned+=quantity;s.firms[c.firmId].reputation=Math.max(0,s.firms[c.firmId].reputation-quantity);event(s,day,'WARRANTY',c.firmId,'คืนเงินประกันจากความเสียหายของเครื่องที่ขายแล้ว',{cohortId:c.id,quantity});}
    }
  }
  function compact(s){
    s.contracts=s.contracts.filter(c=>c.status==='shipping').concat(s.contracts.filter(c=>c.status!=='shipping'&&s.lastDay-(c.deliveredDay||c.day)<45).slice(-600));
    const retained=new Set(s.contracts.filter(c=>c.status==='shipping').map(c=>c.sourceLotId));s.lots=s.lots.filter(l=>l.available+l.reserved>0||retained.has(l.id)||s.lastDay-l.day<15);
    // Finished inactive cohorts may be removed; headline counts remain cumulative.
    s.cohorts=s.cohorts.filter(c=>c.active>0||s.lastDay-c.lastSupportDay<60);
    s.projects=s.projects.filter(p=>!['complete','failed'].includes(p.status)||s.lastDay-(p.completedDay||p.startedDay)<90);
  }
  function checkCampusEquipmentReady(w,f){
    if(!f.isCampus)return {ok:true};
    if(f.role==='enclosure'&&(w.plant?.machines?.press?.status!=='ready'||w.plant.machines.press.condition<25)){
      return {ok:false,reasonTh:'เครื่องอัดขึ้นรูปไม่พร้อม ต้องให้ช่างซ่อมก่อนผลิต'};
    }
    const contract=E.roleContract(f.role);
    if(f.role!=="brand")for(const eqId of contract.requiredEquipment||[]){
      const m=w.plant?.machines?.[eqId];
      if(!m||m.status!=='ready'||m.condition<25){
        return {ok:false,reasonTh:`เครื่องจักรหลัก (${eqId}) ไม่พร้อมหรือชำรุด ต้องซ่อมบำรุงก่อนเดินสายการผลิต`};
      }
    }
    if(w.utilities?.brownoutActive&&contract.utilityKw>=2.0){
      return {ok:false,reasonTh:'ระบบไฟฟ้าในนิคมกำลังไฟตก ชะลอการเดินเครื่องความละเอียดสูงชั่วคราว'};
    }
    return {ok:true};
  }
  function step(w,day){
    const s=ensure(w),m=live(w);if(!safe(day)||day<=s.lastDay)return s;
    // A daily call advances one day of work: replaying a timestamp never pays twice.
    s.lastDay=day;deliver(w,s,day);support(w,s,day);
    for(const f of Object.values(s.firms)){
      const real=m.firms[f.id];if(!real)continue;f.missing=[];
      const eqCheck=checkCampusEquipmentReady(w,f);
      if(!eqCheck.ok){s.campusMinutes=0;f.decisionTh=eqCheck.reasonTh;f.missing.push(eqCheck.reasonTh);continue;}
      f.knownNews=s.news.filter(n=>n.firmId===f.id||!['RESEARCH_START','PROTOTYPE_FAILED'].includes(n.type)).slice(0,8).map(n=>n.id);
      if(real.cash<f.reserveSatang+100000){f.decisionTh='พักแผนกเพื่อรักษาเงินสำรอง ไม่มีงานวิจัยหรือการผลิตฟรี';continue;}
      const active=s.projects.find(p=>p.firmId===f.id&&['research','prototype'].includes(p.status));
      const subject=active?.subject||(f.role==='chip'||f.role==='fabless_soc'?'chip':f.role==='ems'||f.role==='osat_packaging'||f.role==='wafer_foundry'?'manufacturing':f.role==='enclosure'?'metal_machining':f.role==='os_platform'?'software':'hardware');
      const work=f.isCampus?{effectiveMinutes:s.campusMinutes||0,wageSatang:0}:T.work(w,f.id,subject,360);if(f.isCampus)s.campusMinutes=0;const cost=Math.max(0,Math.round(work.wageSatang||0));
      if(!wage(m,real,cost)){f.decisionTh='จ่ายค่าจ้างไม่ได้ งานหยุด';continue;}
      f.lastWorkDay=day;f.paidWagesSatang=(f.paidWagesSatang||0)+cost;s.metrics.wagesSatang+=cost;f.researchSatang+=Math.round(cost*.6);s.metrics.researchSatang+=Math.round(cost*.6);
      const minutes=Math.max(0,Number(work.effectiveMinutes??work.minutes)||0);f.knowledge+=Math.floor(minutes*.4);
      const design=s.designs.find(d=>d.id===f.activeDesignId);
      let usedForRndOrPilot=0;
      if(design&&design.stage==='pilot'){
        usedForRndOrPilot=Math.floor(minutes*.6);
        design.validationMinutes+=usedForRndOrPilot;
      }else{
        usedForRndOrPilot=progress(w,s,f,minutes,day,cost)||0;
      }
      const prodMinutes=day===1&&f.id==='tokyo_elec'?minutes*.4:Math.max(minutes*.4,minutes-usedForRndOrPilot);
      produce(w,s,f,prodMinutes,day);retail(w,s,f,day);
    }
    compact(s);return s;
  }
  function enterCampusRole(w,roleId,options={}){
    const s=ensure(w),m=live(w);
    const contract=E.roleContract(roleId);
    const canonical=contract.id;
    const wages=w.people.filter(p=>p.employed).reduce((a,p)=>a+p.pay.dailyWage,0);
    const capital=options.capitalSatang||contract.entryCapitalSatang;
    const id='phone_campus';
    const dayNum=Number.isFinite(options.day)?options.day:Math.max(1,s.lastDay||1);
    if(!s.campusFirmId){
      const template=clone(m.firms.siam_tech);
      Object.assign(template,{id,nationId:'TH',cash:capital,openingCash:0,receipts:capital,payments:0,stock:{},flow:{},capacity:options.capacity||3,output:0,investment:0,reserves:{},crops:{},history:[],missing:[],dailyRevenue:0,dailyCost:0});
      m.firms[id]=template;
      m.playerNetSatang+=capital;
      w.externalWorld.corporations[id]={id,nationId:'TH',nameTh:'แผนก'+contract.nameTh.split(' (')[0]+' ของบริษัทเรา',sector:'electronics',sellsMaterials:[],buysMaterials:[],roles:[canonical==='brand'?'phone_brand':'phone_component_supplier'],relationshipMode:'neutral'};
      s.firms[id]={
        id,
        role:canonical==='fabless_soc'?'fabless_soc':canonical,
        roles:[canonical],
        strategyFocus:options.strategyFocus||'balanced',
        isCampus:true,
        level:0,
        knowledge:0,
        capacity:options.capacity||3,
        reputation:w.reputation||55,
        reserveSatang:wages*30,
        decisionTh:`เปิดสายธุรกิจ ${contract.nameTh} จากความรู้ เครื่องจักร และทุนจริง`,
        lastWorkDay:0,
        activeDesignId:null,
        produced:0,
        sold:0,
        revenueSatang:0,
        researchSatang:0,
        nreSpentSatang:0,
        costOfGoodsSatang:0,
        paidWagesSatang:0,
        refundSatang:0,
        dividendsSatang:0,
        licenseExpenseSatang:0,
        missing:[],
        researchBranches:canonical==='fabless_soc'||canonical==='wafer_foundry'?['architecture','process','packaging']:canonical==='brand'?['hardware','software']:['materials','manufacturing']
      };
      s.campusFirmId=id;
      s.campusMinutes=s.campusMinutes||0;
    }else{
      const f=s.firms[id],real=m.firms[id];
      if(!f.roles)f.roles=[f.role];
      if(!f.roles.includes(canonical))f.roles.push(canonical);
      if(options.addCapitalSatang&&options.addCapitalSatang>0){
        real.cash+=options.addCapitalSatang;
        real.receipts+=options.addCapitalSatang;
        m.playerNetSatang+=options.addCapitalSatang;
      }
      f.decisionTh=`ขยายสายธุรกิจเพิ่มสู่ ${contract.nameTh} เชื่อมซัพพลายเชนภายในและขาย B2B`;
    }
    const f=s.firms[id],real=m.firms[id];
    // License baseline blueprint or register initial design (creates blueprint only, NEVER free physical lots).
    if(canonical==='fabless_soc'||canonical==='wafer_foundry'){
      if(!s.chips.some(c=>c.ownerId===id)){
        const fee=Math.min(contract.licenseFeeSatang||1800000,Math.floor(real.cash*0.2));
        const owner=m.firms.shenzhen_semi;
        if(owner&&fee>0&&transfer(real,owner,fee)){
          f.licenseExpenseSatang=(f.licenseExpenseSatang||0)+fee;
          s.licenses.push({id:'campus-license-'+canonical+'-'+dayNum,buyerId:id,sellerId:owner.id,priceSatang:fee,day:dayNum,rights:canonical+'_architecture_0'});
        }
        const cap=Math.max(42,capability(w,id,'chip'));
        const chip=E.synthesizeChip(w.seed+':campus-chip:'+dayNum,cap,{level:0,focus:'balanced'});
        chip.id='phone-campus-chip-0';chip.ownerId=id;chip.level=0;
        s.chips.push(chip);
      }
    }else if(canonical!=='brand'&&canonical!=='osat_packaging'){
      for(const kind of contract.outputs){
        if(kind==='wafer_die'||kind==='packaged_chip'||kind==='phone')continue;
        if(s.components.some(c=>c.supplierId===id&&c.kind===kind))continue;
        const source=s.components.find(c=>c.kind===kind&&c.level===0)||s.components[0];
        const fee=canonical==='enclosure'?2000000:Math.min(contract.licenseFeeSatang||1500000,Math.floor(real.cash*0.2));
        const owner=m.firms[source?.supplierId||'tokyo_elec'];
        if(owner&&fee>0&&transfer(real,owner,fee)){
          f.licenseExpenseSatang=(f.licenseExpenseSatang||0)+fee;
          s.licenses.push({id:canonical==='enclosure'?'campus-enclosure-license':'campus-license-'+kind+'-'+dayNum,buyerId:id,sellerId:owner.id,priceSatang:fee,day:dayNum,rights:kind+'_design_0'});
        }
        const spec=canonical==='enclosure'&&source?clone(source.spec):E.synthesizeComponent(w.seed+':campus:'+kind,kind,Math.max(42,capability(w,id,canonical)),0);
        s.components.push({
          id:canonical==='enclosure'?'phone-campus-enclosure-0':'phone-campus-'+kind+'-0',
          kind,
          supplierId:id,
          level:0,
          spec,
          licenseSatang:kind==='os'?1200:0,
          materialGrade:contract.qualifiedMaterialGrade
        });
      }
    }
    return f;
  }
  function view(w){
    const s=w.phoneIndustry;if(!s)return null;const m=live(w);
    const campusSubjects={};
    for(const p of w.people||[])if(p.employed)for(const [k,lv]of Object.entries(p.education?.subjects||{}))campusSubjects[k]=Math.max(campusSubjects[k]||0,lv);
    const wages=(w.people||[]).filter(p=>p.employed).reduce((a,p)=>a+(p.pay?.dailyWage||0),0);
    const ceo=(w.people||[]).find(p=>p.employed&&p.role==='coordinator');
    const roleFeasibility=Object.keys(E.ROLE_CONTRACTS).map(roleId=>E.evaluateRoleFeasibility({
      subjects:campusSubjects,
      machines:w.plant?.machines||{},
      cashSatang:w.finance?.cash||0,
      wageReserveSatang:wages*60,
      riskTaking:ceo?.profile?.personality?.riskTaking??50,
      prudence:ceo?.profile?.personality?.prudence??50,
      brownoutActive:Boolean(w.utilities?.brownoutActive)
    },roleId));
    return clone({
      ...s,
      roleContracts:Object.values(E.ROLE_CONTRACTS),
      materialGrades:Object.values(E.MATERIAL_GRADES),
      roleFeasibility,
      firms:Object.values(s.firms).map(f=>({
        ...f,
        roles:Array.isArray(f.roles)&&f.roles.length?f.roles:[f.role],
        roleNameTh:E.roleContract(f.role).nameTh,
        nameTh:w.externalWorld.corporations[f.id]?.nameTh||f.id,
        cashSatang:m.firms[f.id]?.cash||0,
        rawStock:clone(m.firms[f.id]?.stock||{}),
        capability:{
          hardware:capability(w,f.id,'hardware'),
          chip:capability(w,f.id,'chip'),
          manufacturing:capability(w,f.id,'manufacturing'),
          software:capability(w,f.id,'os_platform'),
          optics:capability(w,f.id,'camera_module'),
          memory:capability(w,f.id,'dram_memory')
        }
      })),
      headlineMetrics:{
        ...s.metrics,
        activeInstalled:s.cohorts.reduce((a,c)=>a+c.active,0),
        retailStock:s.lots.filter(l=>l.kind==='phone').reduce((a,l)=>a+l.available,0),
        pendingContracts:s.contracts.filter(c=>c.status==='shipping').length,
        activeWipBatches:(s.wipBatches||[]).length,
        foundryOrdersCount:(s.foundryOrders||[]).length
      },
      talent:T.view(w)
    });
  }
  function compare(a,b){const diff=(x,y)=>(y||0)-(x||0);return {cpuThroughput:diff(a.evaluation.cpuThroughput,b.evaluation.cpuThroughput),ramMB:diff(a.parts.ram.capacityMB,b.parts.ram.capacityMB),storageMB:diff(a.parts.storage.capacityMB,b.parts.storage.capacityMB),cameraQuality:diff(a.evaluation.cameraQuality,b.evaluation.cameraQuality),batteryHours:diff(a.evaluation.batteryHours,b.evaluation.batteryHours),web:diff(a.evaluation.taskScores.web,b.evaluation.taskScores.web),game:diff(a.evaluation.taskScores.game,b.evaluation.taskScores.game),priceSatang:diff(a.priceSatang,b.priceSatang)};}
  function validate(w){
    const s=w.phoneIndustry;if(!s)return [];const errors=[],m=live(w);
    if(!s||s.version!==1||!safe(s.lastDay)||!safe(s.sequence)||!s.firms||!['designs','chips','components','lots','contracts','projects','cohorts','news','licenses'].every(k=>Array.isArray(s[k])))return ['invalid phone industry structure'];
    for(const key of ['designs','chips','components','lots','contracts','projects','cohorts'])if(new Set(s[key].map(x=>x&&x.id)).size!==s[key].length)errors.push('phone duplicate '+key);
    const ids=key=>new Set(s[key].map(x=>x.id)),designs=ids('designs'),chips=ids('chips'),components=ids('components');
    for(const f of Object.values(s.firms))if(!f||!m?.firms[f.id]||!safe(f.capacity)||!safe(f.level)||f.level>3||!safe(f.knowledge)||!safe(f.reserveSatang))errors.push('phone firm structure');
    for(const l of s.lots)if(!l||!m?.firms[l.ownerId]||!['quantity','available','reserved','used','sold','costSatang','unitCostSatang','day'].every(k=>safe(l[k]))||l.quantity!==l.available+l.reserved+l.used+l.sold||!(l.kind==='phone'?designs.has(l.designId):l.kind==='chip'?chips.has(l.designId):components.has(l.designId)))errors.push('phone lot conservation');
    for(const c of s.contracts)if(!c||!m?.firms[c.buyerId]||!m?.firms[c.sellerId]||!safe(c.quantity)||c.quantity<1||!safe(c.paidSatang)||!safe(c.unitPriceSatang)||c.paidSatang!==c.quantity*c.unitPriceSatang||!safe(c.dueDay)||!['shipping','delivered'].includes(c.status)||(c.kind==='component'&&c.status==='shipping'&&!s.lots.some(l=>l.id===c.sourceLotId&&l.reserved>=c.quantity)))errors.push('phone contract');
    for(const p of s.projects)if(!p||!s.firms[p.firmId]||!safe(p.level)||!safe(p.progress)||!safe(p.requiredMinutes)||p.progress>p.requiredMinutes||!safe(p.spentSatang)||!['research','prototype','complete','failed'].includes(p.status))errors.push('phone project');
    for(const c of s.chips)if(!c||!['cores','clockGhz','nodeNm','dieAreaMm2','maxRamMB','maxPixels'].every(k=>Number.isFinite(c[k])&&c[k]>0))errors.push('phone chip specification');
    for(const d of s.designs)if(!d||!s.firms[d.firmId]||!chips.has(d.chipId)||!safe(d.priceSatang)||d.priceSatang<1||!d.componentIds||!Object.values(d.componentIds).every(id=>components.has(id))||!d.evaluation?.compatible)errors.push('phone design');
    for(const c of s.cohorts)if(!c||!designs.has(c.designId)||!m?.nations[c.nationId]||!['quantity','active','returned','retired','priceSatang','day'].every(k=>safe(c[k]))||c.quantity!==c.active+c.returned+c.retired)errors.push('phone cohort');
    if(!s.metrics||Object.values(s.metrics).some(n=>!safe(n)))errors.push('phone metrics');
    return errors;
  }
  function requestEntry(w,hooks){
    ensure(w);const reasonsTh=[];const cash=w.finance?.cash??0;
    const roleId=hooks?.roleId||'brand';
    const contract=E.roleContract(roleId);
    const minCash=hooks?.minimumCashSatang||contract.entryCapitalSatang||500000000;
    if(cash<minCash)reasonsTh.push(`${contract.nameTh} ต้องมีทุนอย่างน้อย ${Math.round(minCash/100).toLocaleString()} บาทหลังเงินสำรอง`);
    if(!hooks||typeof hooks.enter!=='function')reasonsTh.push('ต้องเชื่อมบัญชี พนักงาน และโรงงานจริงก่อนเข้าธุรกิจ');
    if(reasonsTh.length)return {ok:false,reasonsTh,routeTh:'เริ่มจากซ่อม คัดเกรด หรือผลิตชิ้นส่วนเฉพาะทางเพื่อสะสมทุนและความรู้'};
    return hooks.enter(w,{minimumCashSatang:minCash,roleId:contract.id,requiresEngineering:true});
  }
  return Object.freeze({ensure,step,view,validate,requestEntry,enterCampusRole,compare});
});
