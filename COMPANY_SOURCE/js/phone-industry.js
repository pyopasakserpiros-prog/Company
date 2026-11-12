(function(root,factory){
  const node=typeof module==='object'&&module.exports;
  const value=factory(node?require('./phone-engineering.js'):root.CompanyPhoneEngineering,node?require('./phone-talent.js'):root.CompanyPhoneTalent,node?require('./civics.js'):root.CompanyCivics,node?require('./world.js'):root.CompanyWorld);
  if(node)module.exports=value;else root.CompanyPhoneIndustry=value;
})(typeof globalThis!=='undefined'?globalThis:this,function(E,T,C,W){
  'use strict';
  const BRANDS=['siam_tech','titan_elec','asia_autoparts','eastern_auto'];
  const ROLES={shenzhen_semi:'chip',tokyo_elec:'display',pacific_solar:'battery',petro_chem_siam:'materials',siam_metal:'enclosure',singapore_port_3pl:'ems'};
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
  function capability(w,id,subject){if(id===w.phoneIndustry?.campusFirmId){const key=({hardware:'electrical_basics',chip:'semiconductor_physics',manufacturing:'semiconductor_process'})[subject]||subject;return Math.max(0,...w.people.filter(p=>p.employed).map(p=>p.education?.subjects?.[key]||0));}const c=T.capability(w,id,subject);return Math.max(0,Math.min(100,Number(typeof c==='number'?c:c&&c.score)||0));}
  function ensure(w){
    if(w.phoneIndustry)return w.phoneIndustry;
    const m=live(w);if(!m)throw new Error('Phone industry requires living world');
    const s=w.phoneIndustry={version:1,lastDay:0,sequence:0,firms:{},designs:[],chips:[],components:[],lots:[],contracts:[],projects:[],cohorts:[],news:[],events:[],licenses:[],metrics:{completedProjects:0,produced:0,sold:0,returned:0,retired:0,revenueSatang:0,researchSatang:0,wagesSatang:0},inventory:{opening:[]}};
    for(const id of [...BRANDS,...Object.keys(ROLES)])if(m.firms[id]){
      const h=hash(w.seed+':phone:'+id),role=BRANDS.includes(id)?'brand':ROLES[id];
      s.firms[id]={id,role,level:0,knowledge:0,capacity:2+h%4,reputation:50+h%20,reserveSatang:500000+h%500000,decisionTh:'เริ่มจากเทคโนโลยีฟีเจอร์โฟนที่ทีมรู้จริง',lastWorkDay:0,activeDesignId:null,produced:0,sold:0,revenueSatang:0,researchSatang:0,missing:[],researchBranches:role==='chip'?['architecture','process','packaging']:role==='display'?['display','memory']:role==='battery'?['electrochemistry']:role==='brand'?['hardware','software','radio']:['materials','manufacturing']};
    }
    T.ensure(w,s.firms);
    const chip=E.synthesizeChip(w.seed+':opening-chip',Math.min(30,capability(w,'shenzhen_semi','chip')),{level:0});
    chip.id='phone-chip-opening-'+hash(w.seed);chip.ownerId='shenzhen_semi';chip.level=0;s.chips.push(chip);
    const p=E.parts(w.seed+':opening-parts',0);
    for(const [kind,supplierId]of [['ram','tokyo_elec'],['storage','tokyo_elec'],['display','tokyo_elec'],['battery','pacific_solar'],['enclosure','siam_metal'],['camera','tokyo_elec'],['os','siam_tech']])s.components.push({id:'phone-part-'+kind+'-0',kind,supplierId,level:0,spec:clone(p[kind]),licenseSatang:kind==='os'?1200:0});
    event(s,0,'OPENING','shenzhen_semi','เปิดแผนกโทรศัพท์ด้วยความรู้ฟีเจอร์โฟน ไม่มีเครื่องหรือชิ้นส่วนเติมฟรี',{openingKnowledge:true});
    return s;
  }
  function lot(s,ownerId,kind,designId,quantity,unitCostSatang,day){
    if(!quantity)return;
    const old=s.lots.find(l=>l.ownerId===ownerId&&l.kind===kind&&l.designId===designId&&l.available>0&&l.day===day);
    if(old){old.quantity+=quantity;old.available+=quantity;old.costSatang+=quantity*unitCostSatang;return old;}
    const l={id:'phone-lot-'+(++s.sequence),ownerId,kind,designId,quantity,available:quantity,reserved:0,used:0,sold:0,costSatang:quantity*unitCostSatang,unitCostSatang,day};s.lots.push(l);return l;
  }
  function available(s,ownerId,kind,designId){return s.lots.filter(l=>l.ownerId===ownerId&&l.kind===kind&&(!designId||l.designId===designId)).reduce((a,l)=>a+l.available,0);}
  function consume(s,ownerId,kind,quantity,designId){
    if(available(s,ownerId,kind,designId)<quantity)return false;
    for(const l of s.lots){if(l.ownerId!==ownerId||l.kind!==kind||(designId&&l.designId!==designId))continue;const n=Math.min(quantity,l.available);l.available-=n;l.used+=n;quantity-=n;if(!quantity)break;}return true;
  }
  function unit(w,k){return Math.max(100,Math.round(live(w).markets[k]?.price||w.catalog?.materials[k]?.unitCost||5000));}
  function buyRaw(w,s,buyer,k,need,day){
    const m=live(w);if((buyer.stock[k]||0)>=need)return true;
    if(s.contracts.some(c=>c.status==='shipping'&&c.buyerId===buyer.id&&c.kind==='raw'&&c.materialId===k))return false;
    const sellers=Object.values(m.firms).filter(f=>f.id!==buyer.id&&(f.stock[k]||0)>0).sort((a,b)=>(a.id==='world_exchange')-(b.id==='world_exchange')||a.id.localeCompare(b.id));
    const f=s.firms[buyer.id],price=unit(w,k);let remaining=Math.max(need*3-(buyer.stock[k]||0),1);
    for(const seller of sellers){const route=W.route(m,seller.nationId,buyer.nationId),policy=C.quote(w,seller.nationId,buyer.nationId,k,route),tax=Math.round(price*policy.tariff/100);const q=Math.min(remaining,seller.stock[k],policy.quota,Math.floor(Math.max(0,buyer.cash-f.reserveSatang)/(price+tax)));if(q<=0||policy.blocked)continue;if(!transfer(buyer,seller,q*price))continue;if(tax){debit(buyer,q*tax);m.nations[buyer.nationId].treasury+=q*tax;m.nations[buyer.nationId].taxes+=q*tax;}C.recordTrade(w,seller.nationId,buyer.nationId,k,q,q*price,q*tax);stock(seller,k,-q,'sold');const c={id:'phone-contract-'+(++s.sequence),kind:'raw',materialId:k,sellerId:seller.id,buyerId:buyer.id,quantity:q,unitPriceSatang:price,paidSatang:q*price,day,dueDay:day+route.days,taxSatang:q*tax,policyIds:policy.policyIds,status:'shipping'};s.contracts.push(c);remaining-=q;if(remaining<=0)break;}
    return false;
  }
  function inputs(w,s,f,recipe,day){let ok=true;for(const[k,n]of Object.entries(recipe))if(!buyRaw(w,s,f,k,n,day))ok=false;return ok;}
  function useRaw(f,recipe){for(const[k,n]of Object.entries(recipe))stock(f,k,-n,'used');}
  function deliver(w,s,day){for(const c of s.contracts)if(c.status==='shipping'&&day>=c.dueDay){if(c.kind==='raw')stock(live(w).firms[c.buyerId],c.materialId,c.quantity,'bought');else{const source=s.lots.find(l=>l.id===c.sourceLotId);source.reserved-=c.quantity;source.sold+=c.quantity;lot(s,c.buyerId,c.componentKind,c.designId,c.quantity,c.unitPriceSatang+(c.taxPerUnitSatang||0),day);}c.status='delivered';c.deliveredDay=day;}}
  function purchase(w,s,m,buyerId,kind,designId,need,day){
    if(available(s,buyerId,kind,designId)>=need)return true;
    if(s.contracts.some(c=>c.status==='shipping'&&c.buyerId===buyerId&&c.componentKind===kind&&c.designId===designId))return false;
    const buyer=m.firms[buyerId],f=s.firms[buyerId];
    for(const l of s.lots.filter(l=>l.ownerId!==buyerId&&l.kind===kind&&l.designId===designId&&l.available>0)){
      const price=Math.max(100,Math.round(l.unitCostSatang*1.25)),seller=m.firms[l.ownerId],commodity=kind==='battery'?'battery':kind==='enclosure'?'metal_sheet':'pcb',route=W.route(m,seller.nationId,buyer.nationId),policy=C.quote(w,seller.nationId,buyer.nationId,commodity,route),tax=Math.round(price*policy.tariff/100);if(policy.blocked)continue;const q=Math.min(policy.quota,Math.max(need*2-available(s,buyerId,kind,designId),0),l.available,Math.floor(Math.max(0,buyer.cash-f.reserveSatang)/(price+tax)));
      if(q<=0||!transfer(buyer,m.firms[l.ownerId],q*price))continue;const vendor=s.firms[l.ownerId];if(vendor){vendor.revenueSatang+=q*price;vendor.sold+=q;vendor.costOfGoodsSatang=(vendor.costOfGoodsSatang||0)+q*l.unitCostSatang;seller.cogsSatang=(seller.cogsSatang||0)+q*l.unitCostSatang;}if(tax){debit(buyer,q*tax);m.nations[buyer.nationId].treasury+=q*tax;m.nations[buyer.nationId].taxes+=q*tax;}C.recordTrade(w,seller.nationId,buyer.nationId,commodity,q,q*price,q*tax);l.available-=q;l.reserved+=q;s.contracts.push({id:'phone-contract-'+(++s.sequence),kind:'component',componentKind:kind,designId,sourceLotId:l.id,sellerId:l.ownerId,buyerId,quantity:q,unitPriceSatang:price,paidSatang:q*price,taxSatang:q*tax,taxPerUnitSatang:tax,policyIds:policy.policyIds,day,dueDay:day+policy.days,status:'shipping'});break;
    }return false;
  }
  function currentDesign(s,id){return s.designs.filter(d=>d.firmId===id).slice(-1)[0];}
  function costOf(s,owner,kind,quantity,id){let total=0;for(const l of s.lots){if(l.ownerId!==owner||l.kind!==kind||l.designId!==id)continue;const q=Math.min(quantity,l.available);quantity-=q;total+=q*l.unitCostSatang;if(!quantity)break;}return total;}
  function partSet(s,level){const out={};for(const k of ['ram','storage','display','battery','enclosure','camera','os']){const p=s.components.filter(p=>p.kind===k&&p.level<=level).sort((a,b)=>b.level-a.level)[0];out[k]=clone(p.spec);}return out;}
  function newProject(w,s,f,day){
    const real=live(w).firms[f.id];if(real.cash<f.reserveSatang+100000)return;
    const current=s.designs.find(d=>d.id===f.activeDesignId),isBrand=f.role==='brand';
    if(isBrand&&current&&available(s,f.id,'phone',current.id)>f.capacity*8){f.decisionTh='ชะลอรุ่นใหม่เพราะสต็อกเดิมยังขายไม่หมด';return;}
    if(isBrand&&current&&f.knowledge<2400*(f.level+1))return;
    if(!isBrand&&f.knowledge<3200*(f.level+1))return;if(f.level>=3&&!isBrand)return;
    const platform=isBrand&&current&&!s.components.some(c=>c.kind==='os'&&c.supplierId===f.id&&c.level>0);const leader=Object.values(w.phoneTalent.people).find(x=>x.employerId===f.id&&x.role==='ceo');const risk=leader?.profile.personality.riskTaking||50;if(current&&day%7!==hash(w.seed+f.id)%7)return;const increment=!current||risk>45||f.knowledge>20000?1:0;const level=isBrand&&!current?0:Math.min(3,f.level+increment),subject=platform?'software':f.role==='chip'?'chip':f.role==='ems'?'manufacturing':f.role==='enclosure'?'metal_machining':'hardware';
    if(level>0&&capability(w,f.id,subject)<22+level*10){f.decisionTh='ยังขาดผู้เชี่ยวชาญสำหรับการวิจัยขั้นถัดไป';return;}
    const p={id:'phone-project-'+(++s.sequence),firmId:f.id,type:platform?'platform':isBrand?'handset':f.role==='chip'?'semiconductor':'component',subject,level,progress:0,requiredMinutes:(platform?10000:isBrand?5000:12000)*(level+1),spentSatang:0,status:'research',startedDay:day,prototypeConsumed:false,reasonTh:'สะสมงานวิศวกรและสร้างต้นแบบจากชิ้นส่วนจริง'};
    s.projects.push(p);event(s,day,'RESEARCH_START',f.id,'ผู้บริหารอนุมัติโครงการจากเงินสำรองและความรู้ของทีม',{projectId:p.id});
  }
  function progress(w,s,f,work,day,allocatedWages=0){
    const real=live(w).firms[f.id];let p=s.projects.find(p=>p.firmId===f.id&&['research','prototype'].includes(p.status));if(!p){newProject(w,s,f,day);p=s.projects.find(p=>p.firmId===f.id&&['research','prototype'].includes(p.status));}if(!p)return;
    const minutes=Math.floor(work*.6);p.contributors=f.isCampus?w.people.filter(x=>x.employed&&(x.education?.subjects?.electrical_basics>=35||x.education?.subjects?.software>=40)).map(x=>x.id):(w.phoneTalent?Object.values(w.phoneTalent.people).filter(x=>x.employerId===f.id&&x.role==='engineer').map(x=>x.id):[]);p.progress=Math.min(p.requiredMinutes,p.progress+minutes);p.spentSatang+=Math.round(allocatedWages*.6);f.knowledge+=minutes;
    if(p.progress<p.requiredMinutes)return;p.status='prototype';
    const recipe=p.type==='semiconductor'?{silicon_wafer:1,copper_coil:1}:p.type==='handset'?{pcb:1,polymer_resin:1,battery:1}:{polymer_resin:1,copper_coil:1};
    if(!inputs(w,s,real,recipe,day)){p.reasonTh='รอวัตถุดิบต้นแบบและเวลาส่งมอบ';return;}
    if(p.type==='handset'){
      if(!p.selectedChipId){const chip=s.chips.filter(c=>(c.level||0)<=p.level).slice(-1)[0];p.selectedChipId=chip.id;p.selectedParts={};for(const kind of ['ram','storage','display','battery','enclosure','camera','os'])p.selectedParts[kind]=s.components.filter(c=>c.kind===kind&&c.level<=(chip.level||0)).slice(-1)[0].id;}
      let ready=purchase(w,s,live(w),f.id,'chip',p.selectedChipId,1,day);for(const kind of ['ram','storage','display','battery','enclosure','camera'])if(!purchase(w,s,live(w),f.id,kind,p.selectedParts[kind],1,day))ready=false;
      if(!ready){p.reasonTh='รอชิป แรม และส่วนประกอบตัวอย่างเข้าคลังเพื่อสร้างต้นแบบจริง';return;}
      consume(s,f.id,'chip',1,p.selectedChipId);for(const kind of ['ram','storage','display','battery','enclosure','camera'])consume(s,f.id,kind,1,p.selectedParts[kind]);
    }
    useRaw(real,recipe);p.prototypeConsumed=true;
    if(p.type==='platform'){const spec=E.parts(w.seed+':platform:'+p.id,p.level).os;s.components.push({id:'phone-os-'+(++s.sequence),kind:'os',supplierId:f.id,level:p.level,spec,licenseSatang:1200});p.status='complete';s.metrics.completedProjects++;p.completedDay=day;p.reasonTh='ทีมซอฟต์แวร์ทดสอบแพลตฟอร์มและไดรเวอร์จากต้นแบบจริง';event(s,day,'OS_RELEASE',f.id,p.reasonTh,{projectId:p.id});return;}
    if(p.type==='handset'){
      const chip=s.chips.find(c=>c.id===p.selectedChipId),parts=Object.fromEntries(Object.entries(p.selectedParts).map(([kind,id])=>[kind,clone(s.components.find(c=>c.id===id).spec)])),result=E.evaluate(chip,parts,{ambientC:30});
      if(!result.compatible){p.status='failed';p.reasonTh=(result.reasonsTh||['ไม่ผ่านด่านวิศวกรรม']).join(' • ');event(s,day,'PROTOTYPE_FAILED',f.id,p.reasonTh,{projectId:p.id});return;}
      const id='phone-design-'+(++s.sequence),componentIds={};Object.assign(componentIds,p.selectedParts);
      const d={id,firmId:f.id,nameTh:['อรุณ','สายลม','ธารา','ภูผา','อันดา','นภา'][hash(w.seed+f.id)%6]+' '+['S','M','A','N'][hash(w.seed+f.id+'family')%4]+(s.designs.filter(d=>d.firmId===f.id).length+1),level:p.level,category:parts.os.installableApps?'smart':'feature',predecessorId:currentDesign(s,f.id)?.id||null,chipId:chip.id,parts,componentIds,evaluation:result,priceSatang:Math.max(60000,Math.round((result.costEstimateSatang||60000)*(1.4+(100-real.prudence)/200))),createdDay:day,stage:'pilot',validationMinutes:0,launchedDay:null,produced:0,sold:0,returned:0,revenueSatang:0,costSatang:0,reasonTh:'ผ่านต้นแบบและด่านความเข้ากันได้จากชิ้นส่วนที่มีจริง'};
      d.comparison=d.predecessorId?compare(s.designs.find(x=>x.id===d.predecessorId),d):null;s.designs.push(d);f.activeDesignId=id;
    }else if(p.type==='semiconductor'){
      const chip=E.synthesizeChip(w.seed+':chip:'+p.id,capability(w,f.id,'chip'),{level:p.level});chip.id='phone-chip-'+(++s.sequence);chip.ownerId=f.id;chip.level=p.level;s.chips.push(chip);
    }else{
      const parts=E.parts(w.seed+':parts:'+p.id,p.level);const kinds=f.role==='display'?['ram','storage','display','camera']:f.role==='battery'?['battery']:f.role==='enclosure'||f.role==='materials'?['enclosure']:[];
      for(const kind of kinds)s.components.push({id:'phone-part-'+(++s.sequence),kind,supplierId:f.id,level:p.level,spec:clone(parts[kind]),licenseSatang:0});
    }
    f.level=Math.max(f.level,p.level);p.status='complete';s.metrics.completedProjects++;p.completedDay=day;p.reasonTh='ต้นแบบใช้วัตถุดิบจริงและผ่านการทดสอบแล้ว';event(s,day,'RESEARCH_COMPLETE',f.id,'ต้นแบบผ่านการทดสอบ เปิดทางเลือกการผลิตใหม่',{projectId:p.id,level:p.level});
  }
  function produce(w,s,f,minutes,day){
    const real=live(w).firms[f.id];if(minutes<10)return;
    if(f.role==='brand')return assemble(w,s,f,minutes,day);
    const parts=s.components.filter(c=>c.supplierId===f.id&&c.kind!=='os').sort((a,b)=>available(s,f.id,a.kind,a.id)-available(s,f.id,b.kind,b.id)||hash(w.seed+day+a.id)-hash(w.seed+day+b.id));
    if(f.role==='chip'){
      const owned=s.chips.filter(c=>c.ownerId===f.id),needed=new Set([...s.designs.filter(d=>d.stage==='pilot'||available(s,d.firmId,'phone',d.id)<12).map(d=>d.chipId),...s.projects.filter(p=>p.status==='prototype').map(p=>p.selectedChipId)]);const chip=owned.filter(c=>needed.has(c.id)&&available(s,f.id,'chip',c.id)<20).sort((a,b)=>available(s,f.id,'chip',a.id)-available(s,f.id,'chip',b.id))[0]||owned.slice(-1)[0];if(!chip||available(s,f.id,'chip',chip.id)>200)return;
      const recipe={silicon_wafer:1,copper_coil:1};if(!inputs(w,s,real,recipe,day))return;
      const y=E.wafer({dieAreaMm2:chip.dieAreaMm2,defectsPerCm2:Math.max(.05,.4-capability(w,f.id,'manufacturing')/250),waferCostSatang:unit(w,'silicon_wafer')+unit(w,'copper_coil'),packCostSatang:200,royaltySatang:0});
      const q=Math.max(0,Math.floor(y.packagedGood||0));if(!q)return;const packagingFee=y.goodDies*200,packager=live(w).firms.singapore_port_3pl;if(!packager||real.cash<f.reserveSatang+packagingFee||!transfer(real,packager,packagingFee))return;useRaw(real,recipe);lot(s,f.id,'chip',chip.id,q,Math.max(100,Math.round(y.unitCostSatang||((unit(w,'silicon_wafer')+unit(w,'copper_coil'))/q))),day);f.produced+=q;return;
    }
    let remaining=Math.floor(minutes);for(const c of parts){if(remaining<30)break;if(available(s,f.id,c.kind,c.id)>50)continue;
      const recipe=c.kind==='battery'?{battery:1}:c.kind==='display'?{glass_bottle:1,copper_coil:1}:['ram','storage'].includes(c.kind)?{silicon_wafer:1,copper_coil:1}: {polymer_resin:1,metal_sheet:1};
      let q=Math.min(f.capacity,Math.floor(remaining/30));for(const key of Object.keys(recipe))if((real.stock[key]||0)<q*recipe[key])buyRaw(w,s,real,key,q*recipe[key],day);q=Math.min(q,...Object.entries(recipe).map(([k,n])=>Math.floor((real.stock[k]||0)/n)));if(!q)continue;for(const key of Object.keys(recipe))recipe[key]*=q;if(!inputs(w,s,real,recipe,day))continue;useRaw(real,recipe);remaining-=q*30;const cost=Object.entries(recipe).reduce((a,[k,n])=>a+unit(w,k)*n,0);lot(s,f.id,c.kind,c.id,q,Math.ceil(cost/q)+1000,day);f.produced+=q;
    }
  }
  function assemble(w,s,f,minutes,day){
    const m=live(w),real=m.firms[f.id],d=s.designs.find(d=>d.id===f.activeDesignId);if(!d)return;
    let max=Math.min(f.capacity,Math.floor(minutes/20));if(!max||available(s,f.id,'phone',d.id)>=f.capacity*10)return;
    let ok=purchase(w,s,m,f.id,'chip',d.chipId,max,day);for(const k of ['ram','storage','display','battery','enclosure','camera'])if(!purchase(w,s,m,f.id,k,d.componentIds[k],max,day))ok=false;
    if(!inputs(w,s,real,{pcb:max,copper_coil:max},day))ok=false;
    max=Math.min(max,available(s,f.id,'chip',d.chipId),...['ram','storage','display','battery','enclosure','camera'].map(k=>available(s,f.id,k,d.componentIds[k])),real.stock.pcb||0,real.stock.copper_coil||0);ok=max>0;
    const slots=s.emsSlots?.day===day?s.emsSlots:(s.emsSlots={day,used:0});if(slots.used+max>(s.firms.singapore_port_3pl?.capacity||1)*4){f.decisionTh='รอคิวสายประกอบ EMS ที่ถูกจองเต็มแล้ว';return;}
    const ems=m.firms.singapore_port_3pl,licenseOwner=m.firms[s.components.find(c=>c.id===d.componentIds.os).supplierId];const fee=2500,license=1200;
    if(!max){f.decisionTh='รอชิ้นส่วนเข้าคลัง';return;}if(!ems||real.cash<f.reserveSatang+max*(fee+license)){f.decisionTh='รักษาเงินสำรอง รอทุนประกอบและค่าลิขสิทธิ์';return;}if(!ok){f.decisionTh='รอชิ้นส่วนเฉพาะแบบและแผงวงจรที่สั่งซื้อ';return;}
    const exactCost=costOf(s,f.id,'chip',max,d.chipId)+['ram','storage','display','battery','enclosure','camera'].reduce((a,k)=>a+costOf(s,f.id,k,max,d.componentIds[k]),0)+max*(unit(w,'pcb')+unit(w,'copper_coil')+fee+license);slots.used+=max;
    consume(s,f.id,'chip',max,d.chipId);for(const k of ['ram','storage','display','battery','enclosure','camera'])consume(s,f.id,k,max,d.componentIds[k]);useRaw(real,{pcb:max,copper_coil:max});transfer(real,ems,max*fee);if(licenseOwner.id!==real.id)transfer(real,licenseOwner,max*license);
    const cost=Math.ceil(exactCost/max);d.actualUnitCostSatang=cost;d.priceSatang=Math.max(d.priceSatang,Math.ceil(cost*(1.2+f.reputation/500)));lot(s,f.id,'phone',d.id,max,cost,day);d.produced+=max;d.costSatang+=max*cost;f.produced+=max;s.metrics.produced+=max;f.decisionTh='ประกอบตามกำลังคนและวัตถุดิบ พร้อมขายจากสต็อกจริง';
  }
  function retail(w,s,f,day){
    if(f.role!=='brand')return;const m=live(w),real=m.firms[f.id],n=m.nations[real.nationId];
    for(const d of s.designs.filter(d=>d.firmId===f.id)){
      const count=available(s,f.id,'phone',d.id);if(!count)continue;if(d.stage!=='released'){if(d.validationMinutes>=1200&&count>=2&&day-d.createdDay>=7){d.stage='released';d.launchedDay=day;event(s,day,'LAUNCH',f.id,'ปล่อยขายหลังผลิตนำร่อง ตรวจคุณภาพ และมีเครื่องจริงในคลัง',{designId:d.id});}else continue;}
      if(day-d.launchedDay>14&&count>f.capacity*5)d.priceSatang=Math.max(d.actualUnitCostSatang||30000,Math.round(d.priceSatang*.99));
      const segment=hash(w.seed+':segment:'+day)%3,ev=d.evaluation;const value=segment===0?Math.min(2,ev.batteryHours/24)+ev.taskScores.call/100:segment===1?ev.taskScores.web/40+(d.parts.camera?.megapixels||0)/10:ev.taskScores.game/30+d.parts.storage.capacityMB/2048;const appetite=Math.max(0,Math.floor((value+.5)*Math.max(60000,(d.actualUnitCostSatang||60000)*1.5)/d.priceSatang+(hash(w.seed+':demand:'+f.id+':'+day)%100)/100)),q=Math.min(count,appetite,Math.floor(Math.min(n.householdCash,Math.floor(n.householdCash*.0005))/d.priceSatang));if(!q)continue;
      consume(s,f.id,'phone',q,d.id);const revenue=q*d.priceSatang;n.householdCash-=revenue;n.consumption+=revenue;credit(real,revenue);d.sold+=q;d.revenueSatang+=revenue;f.sold+=q;f.revenueSatang+=revenue;s.metrics.sold+=q;s.metrics.revenueSatang+=revenue;real.cogsSatang=(real.cogsSatang||0)+q*(d.actualUnitCostSatang||0);
      s.cohorts.push({id:'phone-cohort-'+(++s.sequence),firmId:f.id,designId:d.id,nationId:n.id,quantity:q,active:q,returned:0,retired:0,day,priceSatang:d.priceSatang,lastSupportDay:day,segment:['basic_voice','multimedia','application'][segment],reasonTh:'เลือกจากราคา แบตเตอรี่ งานที่ใช้ได้ กล้อง และพื้นที่เก็บข้อมูลจริง'});
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
  function step(w,day){
    const s=ensure(w),m=live(w);if(!safe(day)||day<=s.lastDay)return s;
    // A daily call advances one day of work: replaying a timestamp never pays twice.
    s.lastDay=day;deliver(w,s,day);support(w,s,day);
    for(const f of Object.values(s.firms)){
      const real=m.firms[f.id];if(!real)continue;f.missing=[];if(f.isCampus&&f.role==='enclosure'&&(w.plant?.machines?.press?.status!=='ready'||w.plant.machines.press.condition<25)){s.campusMinutes=0;f.decisionTh='เครื่องอัดขึ้นรูปไม่พร้อม ต้องให้ช่างซ่อมก่อนผลิต';continue;}f.knownNews=s.news.filter(n=>n.firmId===f.id||!['RESEARCH_START','PROTOTYPE_FAILED'].includes(n.type)).slice(0,8).map(n=>n.id);
      if(real.cash<f.reserveSatang+100000){f.decisionTh='พักแผนกเพื่อรักษาเงินสำรอง ไม่มีงานวิจัยหรือการผลิตฟรี';continue;}
      const active=s.projects.find(p=>p.firmId===f.id&&['research','prototype'].includes(p.status));const subject=active?.subject||(f.role==='chip'?'chip':f.role==='ems'?'manufacturing':f.role==='enclosure'?'metal_machining':'hardware');const work=f.isCampus?{effectiveMinutes:s.campusMinutes||0,wageSatang:0}:T.work(w,f.id,subject,360);if(f.isCampus)s.campusMinutes=0;const cost=Math.max(0,Math.round(work.wageSatang||0));
      if(!wage(m,real,cost)){f.decisionTh='จ่ายค่าจ้างไม่ได้ งานหยุด';continue;}
      f.lastWorkDay=day;f.paidWagesSatang=(f.paidWagesSatang||0)+cost;s.metrics.wagesSatang+=cost;f.researchSatang+=Math.round(cost*.6);s.metrics.researchSatang+=Math.round(cost*.6);
      const minutes=Math.max(0,Number(work.effectiveMinutes??work.minutes)||0);f.knowledge+=Math.floor(minutes*.4);const design=s.designs.find(d=>d.id===f.activeDesignId);if(design&&design.stage==='pilot')design.validationMinutes+=Math.floor(minutes*.6);else progress(w,s,f,minutes,day,cost);produce(w,s,f,minutes*.4,day);retail(w,s,f,day);
    }
    compact(s);return s;
  }
  function view(w){
    const s=w.phoneIndustry;if(!s)return null;const m=live(w);return clone({...s,firms:Object.values(s.firms).map(f=>({...f,nameTh:w.externalWorld.corporations[f.id]?.nameTh||f.id,cashSatang:m.firms[f.id]?.cash||0,rawStock:clone(m.firms[f.id]?.stock||{}),capability:{hardware:capability(w,f.id,'hardware'),chip:capability(w,f.id,'chip'),manufacturing:capability(w,f.id,'manufacturing')}})),headlineMetrics:{...s.metrics,activeInstalled:s.cohorts.reduce((a,c)=>a+c.active,0),retailStock:s.lots.filter(l=>l.kind==='phone').reduce((a,l)=>a+l.available,0),pendingContracts:s.contracts.filter(c=>c.status==='shipping').length},talent:T.view(w)});
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
    if(cash<500000000)reasonsTh.push('แบรนด์โทรศัพท์ต้องมีทุนอย่างน้อย 5 ล้านบาทหลังเงินสำรอง');
    if(!hooks||typeof hooks.enter!=='function')reasonsTh.push('ต้องเชื่อมบัญชี พนักงาน และโรงงานจริงก่อนเข้าธุรกิจ');
    if(reasonsTh.length)return {ok:false,reasonsTh,routeTh:'เริ่มจากซ่อม คัดเกรด หรือรับจ้างประกอบเพื่อสะสมทุนและความรู้'};
    return hooks.enter(w,{minimumCashSatang:500000000,requiresEngineering:true});
  }
  return Object.freeze({ensure,step,view,validate,requestEntry,compare});
});
