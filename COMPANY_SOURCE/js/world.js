(function(root,factory){
  const value=factory(typeof module==="object"&&module.exports?require('./data.js'):root.CompanyData);
  if(typeof module==="object"&&module.exports) module.exports=value; else root.CompanyWorld=value;
})(typeof globalThis!=="undefined"?globalThis:this,function(D){
  'use strict';
  const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)), round=x=>Math.round(x*100)/100;
  function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  const profiles={
    TH:[3,5,50,58,'food','ศูนย์การผลิตอาหาร ยานยนต์ และการค้าภูมิภาค'],
    US:[3,4,74,76,'software','ซอฟต์แวร์ อากาศยานและตลาดผู้บริโภคกำลังซื้อสูง'],
    CN:[2,5,82,60,'electronics','ฐานผลิตอิเล็กทรอนิกส์และวัสดุอุตสาหกรรม'],
    JP:[1,3,88,82,'automotive','เครื่องจักรแม่นยำและยานยนต์ ใช้วัตถุดิบนำเข้า'],
    EU:[2,4,80,88,'energy','เทคโนโลยีสะอาด มาตรฐานคุณภาพและบริการ'],
    ME:[4,6,45,38,'energy','พลังงานและปิโตรเคมี พึ่งพาอาหารนำเข้า'],
    RU_EE:[5,7,52,35,'energy','แร่ พลังงาน ธัญพืชและปุ๋ย'],
    ASEAN:[3,5,46,52,'food','เกษตร แรงงานและเครือข่ายอุตสาหกรรมภูมิภาค'],
    ID:[4,5,48,50,'energy','นิกเกิล ปาล์มและตลาดหมู่เกาะ'],
    AU:[2,4,70,78,'automotive','เหมืองแร่และวัตถุดิบส่งออก'],
    IN:[4,6,68,57,'software','ซอฟต์แวร์ ยา และตลาดภายในขนาดใหญ่'],
    SG:[2,3,90,85,'fleet','ท่าเรือ คลังสินค้าและบริการการค้าระหว่างประเทศ']
  };
  function record(w,day,type,headlineTh,meaningTh,details={}){
    const m=w.externalWorld.living;
    const e={id:'world-'+(++m.sequence),day,at:Math.max(0,(day-1)*1440),category:type,badgeTh:'🌍 โลกภายนอก',headlineTh,meaningTh,priceImpactSummaryTh:details.impactTh||meaningTh,isMajor:!!details.major,...details};
    w.externalWorld.worldChronicle.unshift(e);w.externalWorld.worldChronicle.length=Math.min(120,w.externalWorld.worldChronicle.length);
    m.journal.unshift(e);m.journal.length=Math.min(160,m.journal.length);return e;
  }
  function guessNation(c){
    if(c.nationId&&profiles[c.nationId])return c.nationId;
    const s=c.id+' '+(c.originTh||'');
    for(const [rx,id] of [[/shenzhen|china|จีน|เซิน/, 'CN'],[/tokyo|japan|ญี่ปุ่น|โตเกียว/,'JP'],[/indonesia|อินโด/,'ID'],[/austral|ออสเตรเลีย/,'AU'],[/india|อินเดีย/,'IN'],[/singapore|สิงคโปร์/,'SG'],[/euro|เยอร|ยุโรป/,'EU'],[/american|usa|สหรัฐ/,'US']])if(rx.test(s))return id;
    return 'TH';
  }
  function ensure(w){
    const e=w.externalWorld;if(e.living)return e.living;
    const m=e.living={version:1,lastDay:0,sequence:0,nations:{},firms:{},relations:[],shipments:[],markets:{},journal:[],history:[],playerNetSatang:0,shocks:[]};
    e.worldChronicle=e.worldChronicle||[];e.ecosystemFeed=[];e.b2bMaterialDemands=[];
    for(const [id,n] of Object.entries(e.geopolitics.nations)){
      const p=profiles[id]||profiles.TH,h=hash(w.seed+':nation:'+id);
      m.nations[id]={id,descriptionTh:p[5],specialty:p[4],technology:p[2],infrastructure:p[3],inflation:p[0],unemployment:p[1],approval:58+(h%17),stability:72,gdpIndex:100,interestRate:3,policy:'balanced',policyReasonTh:'รักษาเสถียรภาพและเงินสำรอง',lastReviewDay:0,nextElectionDay:120+h%121,term:0,treasury:5000000000,openingTreasury:5000000000,taxes:0,spending:0,householdCash:3000000000,openingHouseholdCash:3000000000,wages:0,consumption:0,transfers:0,dailyDemand:0,dailyOutput:0};
    }
    // Opening actors and stocks are scenario endowments; subsequent operations never refill them for free.
    const regional={US:['silica_bauxite_ore','crude_petro_feedstock'],EU:['copper_iron_ore'],ME:['crude_petro_feedstock'],RU_EE:['phosphate_potash_rock','iron_ore'],ASEAN:['raw_water_m3','ambient_air_gas']};
    for(const [nid,outputs] of Object.entries(regional)){
      const id='regional_'+nid;
      if(!e.corporations[id]) e.corporations[id]={id,nationId:nid,nameTh:'เครือข่ายอุตสาหกรรม '+e.geopolitics.nations[nid].shortNameTh,symbol:nid+'-IND',sector:profiles[nid][4],sectorTh:'อุตสาหกรรมทรัพยากร',originTh:e.geopolitics.nations[nid].nameTh,cashMillionBaht:120,roles:['supplier','client'],sellsMaterials:outputs,buysMaterials:['pack_carton'],relationshipMode:'neutral',trustScore:55};
    }
    if(!e.corporations.world_exchange)e.corporations.world_exchange={id:'world_exchange',nationId:'SG',nameTh:'ตลาดค้าส่งสำรองระหว่างประเทศ (คลังไทย)',symbol:'EXCH',sector:'fleet',sectorTh:'ค้าส่งและคลังสำรอง',originTh:'สำนักงานใหญ่สิงคโปร์ / คลังสำรองประเทศไทย',cashMillionBaht:500,roles:['supplier'],sellsMaterials:Object.keys(w.catalog.materials),buysMaterials:[],relationshipMode:'neutral',trustScore:60};
    for(const [id,c] of Object.entries(e.corporations||{})) initFirm(w,id,c);
    const ids=Object.keys(m.nations);
    for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
      const h=hash(w.seed+':relation:'+ids[i]+ids[j]);
      m.relations.push({id:ids[i]+'-'+ids[j],a:ids[i],b:ids[j],tension:10+h%36,trust:45+h%36,status:'peace',sinceDay:1,reviewDay:14+h%15,treatyUntil:0,reasonTh:'ค้าขายตามปกติ ยังไม่มีข้อพิพาทรุนแรง'});
    }
    for(const [id,mat] of Object.entries(w.catalog.materials))m.markets[id]={id,price:mat.unitCost,multiplier:1,supply:0,demand:0,traded:0,shortage:0,reasonTh:'ราคาเริ่มต้น รอข้อมูลการซื้อขาย'};
    if(e.geopolitics.activeEvent)scenario(w,e.geopolitics.activeEvent.id,1,e.geopolitics.activeEvent.durationDays||5);
    return m;
  }
  function initFirm(w,id,c){
    const m=w.externalWorld.living,h=hash(w.seed+':firm:'+id),nationId=guessNation(c),cash=Math.max(0,Math.round((c.cashMillionBaht??100)*100000000));
    const stock={},flow={};
    const materials=new Set([...(c.sellsMaterials||[]),...(c.buysMaterials||[])]);
    for(const out of c.sellsMaterials||[])for(const k of Object.keys(D.MATERIAL_RECIPES[out]?.inputs||{}))materials.add(k);
    for(const out of c.sellsMaterials||[]){const crop=Object.values(D.AGRICULTURE_CROPS||{}).find(q=>q.harvestMaterialId===out);if(crop){materials.add(crop.seedMaterialId);materials.add('raw_water_m3');materials.add('npk_fertilizer');}}
    for(const k of materials)if(w.catalog.materials[k]){stock[k]=id==='world_exchange'?500:12+h%12;flow[k]={opening:stock[k],produced:0,bought:0,used:0,sold:0};}
    m.firms[id]={id,nationId,cash,openingCash:cash,receipts:0,payments:0,stock,flow,capacity:4+h%6,utilization:0,technology:Math.round(m.nations[nationId].technology*.5+(48+h%45)*.5),risk:20+h%65,prudence:25+(h>>>8)%60,priceFactor:1,consecutiveLossDays:0,status:'operating',strategy:'maintain',decisionTh:'รักษากำลังผลิตและเงินสำรอง',dailyRevenue:0,dailyCost:0,profit:0,investment:0,lastInvestmentDay:0,output:0,missing:[],reserves:{},crops:{},history:[],lastReviewDay:0};
    for(const out of c.sellsMaterials||[])if(!D.MATERIAL_RECIPES[out])m.firms[id].reserves[out]=5000+h%10000;
    return m.firms[id];
  }
  function flow(f,k){return f.flow[k]||(f.flow[k]={opening:0,produced:0,bought:0,used:0,sold:0});}
  function addStock(f,k,n,kind){f.stock[k]=(f.stock[k]||0)+n;flow(f,k)[kind]+=Math.abs(n);}
  function receipt(f,n){f.cash+=n;f.receipts+=n;f.dailyRevenue+=n;}
  function payment(f,n){f.cash-=n;f.payments+=n;f.dailyCost+=n;}
  function route(m,a,b){
    const r=m.relations.find(r=>(r.a===a&&r.b===b)||(r.a===b&&r.b===a));
    const na=m.nations[a],nb=m.nations[b];
    return {status:r?.status||'peace',tariff:a===b?0:(r?.status==='war'?22:r?.status==='sanctions'?14:r?.status==='treaty'?0:3)+Math.max(0,nb.tariffModPct||0),days:a===b?1:Math.ceil(2+(100-(na.infrastructure+nb.infrastructure)/2)/25+(r?.tension||0)/20+(r?.status==='war'?7:0)),risk:r?.tension||0};
  }
  function trade(w,seller,buyer,k,qty,day){
    const m=ensure(w),r=route(m,seller.nationId,buyer.nationId),unit=Math.round(m.markets[k].price*seller.priceFactor),tariff=Math.round(unit*r.tariff/100);
    qty=Math.min(qty,seller.stock[k]||0,Math.floor(buyer.cash/(unit+tariff)));
    if(qty<=0||r.status==='war'&&r.risk>=90)return 0;
    const cost=qty*unit,tax=qty*tariff;
    payment(buyer,cost+tax);receipt(seller,cost);m.nations[buyer.nationId].treasury+=tax;m.nations[buyer.nationId].taxes+=tax;
    addStock(seller,k,-qty,'sold');
    m.shipments.push({id:'shipment-'+(++m.sequence),sellerId:seller.id,buyerId:buyer.id,materialId:k,quantity:qty,cost,tariff:tax,departedDay:day,dueDay:day+r.days,originalDueDay:day+r.days,delayed:false,routeStatus:r.status});
    const relation=m.relations.find(x=>x.a===seller.nationId&&x.b===buyer.nationId||x.b===seller.nationId&&x.a===buyer.nationId);
    if(relation)relation.trust=round(clamp(relation.trust+.04,0,100));
    m.markets[k].traded+=qty;
    record(w,day,'INTER_CORP_SUPPLY',`${w.externalWorld.corporations[seller.id].nameTh} ส่ง ${w.catalog.materials[k].nameTh} ให้ ${w.externalWorld.corporations[buyer.id].nameTh}`,`ส่ง ${qty} หน่วย • ชำระ ${(cost+tax)/100} บาท • ถึงวันที่ ${day+r.days}`,{actorCorpId:seller.id,targetCorpId:buyer.id,materialId:k,quantity:qty,cost,tariff:tax});
    return qty;
  }
  function deliver(w,day){
    const m=ensure(w);
    for(const s of m.shipments){
      const seller=m.firms[s.sellerId],buyer=m.firms[s.buyerId],r=route(m,seller.nationId,buyer.nationId);
      if(!s.delayed&&r.status==='war'&&day<s.dueDay){s.dueDay+=7;s.delayed=true;record(w,day,'LOGISTICS',`การขนส่ง ${s.id} ล่าช้าจากความขัดแย้ง`,`กำหนดใหม่วันที่ ${s.dueDay}`,{shipmentId:s.id});}
      if(day>=s.dueDay)addStock(buyer,s.materialId,s.quantity,'bought');
    }
    m.shipments=m.shipments.filter(s=>day<s.dueDay);
  }
  function operate(w,f,day){
    const m=ensure(w),c=w.externalWorld.corporations[f.id],n=m.nations[f.nationId];
    f.dailyRevenue=0;f.dailyCost=0;f.output=0;f.missing=[];
    const reserve=Math.round(15000*(1+f.prudence/50)*Math.max(1,f.capacity));
    if(f.cash<reserve){f.status='suspended';f.decisionTh='หยุดผลิตเพื่อรักษาเงินสด: เงินไม่พอทุนหมุนเวียน';f.utilization=0;return;}
    f.status='operating';
    const overhead=Math.min(f.cash,Math.round(600*f.capacity));payment(f,overhead);n.householdCash+=overhead;n.wages+=overhead;
    const outputs=(c.sellsMaterials||[]).filter(k=>m.markets[k]);
    if(f.id==='world_exchange'){f.utilization=0;f.decisionTh='ค้าส่งจากสต็อกสำรองจำกัด รับซื้อเพื่อเติมคลังเมื่อมีผู้ผลิตขาย';return;}
    for(const k of outputs){
      const recipe=D.MATERIAL_RECIPES[k],mat=w.catalog.materials[k],crop=Object.values(D.AGRICULTURE_CROPS||{}).find(q=>q.harvestMaterialId===k),inputs=recipe?.inputs||{},current=f.stock[k]||0;
      if(!recipe&&!mat.isTrueNaturalResource){
        if(crop){
          const growing=f.crops[k];
          if(growing&&day>=growing.dueDay){
            const gross=crop.baseGrossYield||crop.baseHarvestYield||10,seed=Math.max(2,Math.floor(gross*.25));
            addStock(f,k,gross-seed,'produced');addStock(f,crop.seedMaterialId,seed,'produced');f.output+=gross-seed;n.dailyOutput+=gross-seed;delete f.crops[k];
          }
          if(!f.crops[k]&&current<f.capacity*6){
            const seed=crop.seedRequired||crop.seedPerPlot||2,water=crop.waterRequired||crop.waterPerCycle||2;
            if((f.stock[crop.seedMaterialId]||0)>=seed&&(f.stock.raw_water_m3||0)>=water&&(f.stock.npk_fertilizer||0)>=1){
              addStock(f,crop.seedMaterialId,-seed,'used');addStock(f,'raw_water_m3',-water,'used');addStock(f,'npk_fertilizer',-1,'used');f.crops[k]={dueDay:day+Math.max(2,Math.ceil(crop.growthMinutes/1440)),seed,water};
            }else f.missing.push('พันธุ์ น้ำ หรือปุ๋ยสำหรับ '+mat.nameTh);
          }
        }else f.missing.push('ยังไม่มีวงจรผลิตต้นทาง '+mat.nameTh);
        continue;
      }
      if(current>=f.capacity*6)continue;
      const knowledgeNeed=recipe?40+(w.catalog.materials[k].tier||1)*10:30;
      if(f.technology<knowledgeNeed){f.missing.push('เทคโนโลยี '+w.catalog.materials[k].nameTh);continue;}
      let qty=Math.max(0,Math.floor(f.capacity*m.shocks.filter(s=>s.nations.includes(f.nationId)).reduce((a,s)=>a*s.outputMultiplier,1)));
      for(const [ik,q]of Object.entries(inputs))qty=Math.min(qty,Math.floor((f.stock[ik]||0)/q));
      if(!recipe)qty=Math.min(qty,mat.resourceClass==='environmental_flow'?Math.max(0,Math.floor(f.capacity*n.infrastructure/100)):f.reserves[k]||0);
      qty=Math.min(qty,Math.floor(Math.max(0,f.cash-reserve)/(Math.max(100,Math.round(w.catalog.materials[k].unitCost*.18)))));
      if(qty<=0){f.missing.push(w.catalog.materials[k].nameTh);continue;}
      const expense=qty*Math.max(100,Math.round(w.catalog.materials[k].unitCost*.18));payment(f,expense);n.householdCash+=expense;n.wages+=expense;
      for(const [ik,q]of Object.entries(inputs))addStock(f,ik,-qty*q,'used');
      if(!recipe&&mat.resourceClass!=='environmental_flow')f.reserves[k]-=qty;
      const produced=recipe?.outputs||{[k]:1};
      for(const [ok,oq] of Object.entries(produced))if(m.markets[ok])addStock(f,ok,qty*oq,'produced');
      f.output+=qty;n.dailyOutput+=qty;
    }
    // Downstream aggregate production uses real purchased inputs and domestic buyers' finite cash.
    if(!outputs.length){
      const inputs=(c.buysMaterials||[]).filter(k=>m.markets[k]);
      const usable=inputs.filter(k=>(f.stock[k]||0)>0);
      if(usable.length>=Math.min(2,inputs.length)&&usable.length){
        const batch=usable.slice(0,Math.min(3,usable.length)),value=batch.reduce((a,k)=>a+m.markets[k].price,0);
        const revenue=Math.round(value*1.65*clamp(n.gdpIndex/100,.65,1.3)),wage=Math.round(value*.2);
        if(n.householdCash>=revenue&&f.cash>=reserve+wage){
          payment(f,wage);n.householdCash+=wage;n.wages+=wage;
          for(const k of batch)addStock(f,k,-1,'used');
          n.householdCash-=revenue;n.consumption+=revenue;receipt(f,revenue);f.output++;n.dailyOutput++;
        }
      }else f.missing=inputs.filter(k=>!(f.stock[k]>0)).map(k=>w.catalog.materials[k].nameTh);
    }
    // Domestic demand is a bounded residual sector, not an unlimited buyer.
    for(const k of outputs){
      const demand=Math.max(0,Math.round((2+n.gdpIndex/50)*(n.policy==='stimulus'?1.15:1)/(1+n.interestRate/30)));
      const price=Math.round(m.markets[k].price*f.priceFactor),qty=Math.min(demand,f.stock[k]||0,Math.floor(n.householdCash/price));
      m.markets[k].demand+=demand;
      if(qty>0){n.householdCash-=qty*price;n.consumption+=qty*price;receipt(f,qty*price);addStock(f,k,-qty,'sold');m.markets[k].traded+=qty;}
    }
    f.utilization=round(Math.min(1,f.output/Math.max(1,f.capacity*Math.max(1,outputs.length))));
  }
  function reviewFirm(w,f,day){
    const m=ensure(w),n=m.nations[f.nationId];f.profit=f.dailyRevenue-f.dailyCost;
    if(f.profit>0){const tax=Math.min(f.cash,Math.round(f.profit*.15));payment(f,tax);n.treasury+=tax;n.taxes+=tax;f.profit-=tax;}
    f.consecutiveLossDays=f.profit<0?f.consecutiveLossDays+1:0;
    if(day-f.lastReviewDay>=7){
      f.lastReviewDay=day;
      const retained=f.cash,buffer=15000*f.capacity*(15+f.prudence/5),investment=f.capacity*100000;
      if(f.cash<buffer){f.strategy='cash';f.decisionTh='สะสมเงินสด: เงินต่ำกว่าเงินสำรองตามความระมัดระวังของผู้บริหาร';}
      else if(f.missing.length&&f.technology<85&&f.cash>buffer+investment){
        payment(f,investment);n.householdCash+=investment;n.wages+=investment;f.technology=Math.min(95,f.technology+2);f.investment+=investment;f.strategy='research';f.decisionTh='พัฒนาเทคโนโลยีทีละขั้น: มีข้อจำกัดความรู้และเงินสำรองเพียงพอ';
      }else if(f.utilization>.72&&f.profit>0&&f.risk>45&&f.cash>buffer+investment&&day-f.lastInvestmentDay>=28){
        payment(f,investment);n.householdCash+=investment;n.wages+=investment;f.capacity++;f.investment+=investment;f.lastInvestmentDay=day;f.strategy='expand';f.decisionTh='ขยายกำลังผลิต: ใช้งานสูง มีกำไร และเหลือทุนหมุนเวียน';
      }else if(f.utilization<.35&&f.consecutiveLossDays>=7){f.priceFactor=round(clamp(f.priceFactor-.03,.85,1.2));f.strategy='restructure';f.decisionTh='ลดราคาและชะลอการลงทุน: สต็อกค้างและขาดทุนต่อเนื่อง';}
      else{f.strategy='maintain';f.decisionTh='คงกิจการและประเมินตลาด: ยังไม่มีผลตอบแทนพอชดเชยความเสี่ยง';}
      record(w,day,'CORP_DECISION',`${w.externalWorld.corporations[f.id].nameTh}: ${f.decisionTh}`,`เงินก่อนพิจารณา ${retained/100} บาท • เงินสำรอง ${buffer/100} บาท • กำลังผลิต ${Math.round(f.utilization*100)}%`,{actorCorpId:f.id,strategy:f.strategy});
    }
    f.history.push({day,cash:f.cash,profit:f.profit,output:f.output,utilization:f.utilization});if(f.history.length>30)f.history.shift();
    const c=w.externalWorld.corporations[f.id];c.cashMillionBaht=round(f.cash/100000000);c.lastActionTh=f.decisionTh;c.lastActionDay=day;
  }
  function nationalReview(w,day){
    const m=ensure(w);
    for(const n of Object.values(m.nations)){
      const fs=Object.values(m.firms).filter(f=>f.nationId===n.id),util=fs.length?fs.reduce((a,f)=>a+f.utilization,0)/fs.length:.6;
      const priceMean=Object.values(m.markets).reduce((a,k)=>a+k.multiplier,0)/Math.max(1,Object.keys(m.markets).length);
      n.inflation=round(clamp(n.inflation*.96+(priceMean-1)*.6-(n.interestRate-3)*.008,-2,25));
      n.unemployment=round(clamp(n.unemployment*.98+(1-util)*.16-(n.policy==='stimulus'?.04:0),1,30));
      n.gdpIndex=round(clamp(n.gdpIndex+(util-.6)*.12-(n.inflation>8?.08:0),55,155));
      n.approval=round(clamp(n.approval+(.06-Math.max(0,n.inflation-3)*.025-Math.max(0,n.unemployment-6)*.015),5,95));
      n.stability=round(clamp(50+n.approval*.5-n.unemployment,15,95));
      if(day-n.lastReviewDay>=14){
        n.lastReviewDay=day;const prior=n.policy;
        n.policy=n.inflation>5?'tightening':n.unemployment>7?'stimulus':n.treasury<n.openingTreasury*.35?'austerity':'balanced';
        n.interestRate=round(n.policy==='tightening'?clamp(n.interestRate+.5,1,10):n.policy==='stimulus'?clamp(n.interestRate-.25,1,10):n.interestRate);
        n.policyReasonTh=n.policy==='tightening'?`ลดแรงกดดันเงินเฟ้อ ${n.inflation}%`:n.policy==='stimulus'?`เพิ่มอุปสงค์และจ้างงาน: ว่างงาน ${n.unemployment}%`:n.policy==='austerity'?'สงวนเงินคลังเพื่อรักษาความสามารถจ่าย':'รักษาเสถียรภาพการค้าและการจ้างงาน';
        if(prior!==n.policy)record(w,day,'GOVERNMENT',`${w.externalWorld.geopolitics.nations[n.id].nameTh}: ปรับนโยบายเศรษฐกิจ`,n.policyReasonTh,{nationId:n.id,policy:n.policy,major:true});
      }
      const spending=Math.min(n.treasury,Math.round(n.openingTreasury*(n.policy==='stimulus'?.00025:n.policy==='austerity'?.00004:.0001)));
      n.treasury-=spending;n.spending+=spending;n.householdCash+=spending;n.transfers+=spending;
      if(day>=n.nextElectionDay){
        const nat=w.externalWorld.geopolitics.nations[n.id],spec=D.GLOBAL_NATIONS[n.id],regimes=spec.regimes||[];
        const replace=n.approval<45;n.term++;n.nextElectionDay=day+180;
        if(replace&&regimes.length>1){const idx=regimes.findIndex(r=>r.id===nat.activeRegimeId),r=regimes[(idx+1)%regimes.length];Object.assign(nat,{activeRegimeId:r.id,activeRegimeNameTh:r.nameTh,leaderStyleTh:r.leaderStyleTh,materialMods:{...r.materialMods},sectorDemandMods:{...r.sectorDemandMods},tariffModPct:r.tariffModPct||0,fxModPct:r.fxModPct||0,lastChangedDay:day,regimeChangeCount:(nat.regimeChangeCount||0)+1});n.approval=52;}
        record(w,day,'GOVERNMENT',`${nat.nameTh}: ทบทวนผู้นำตามวาระ`,replace?'ความนิยมต่ำ เกิดการเปลี่ยนขั้วนโยบาย':'คงแนวนโยบายเดิมจากผลการบริหาร',{nationId:n.id,major:true});
      }
    }
  }
  function diplomacy(w,day){
    const m=ensure(w);
    for(const r of m.relations){
      if(r.scenarioUntil && day>=r.scenarioUntil){r.status=r.priorStatus;r.tension=r.priorTension;r.scenarioUntil=0;record(w,day,'DIPLOMACY',`สิ้นสุดมาตรการชั่วคราว ${r.id}`,'กลับสู่เงื่อนไขความสัมพันธ์ก่อนมาตรการ',{relationId:r.id});}
      if(day<r.reviewDay)continue;r.reviewDay=day+14;
      const a=m.nations[r.a],b=m.nations[r.b],old=r.status;
      const instability=Math.max(0,50-a.stability)+Math.max(0,50-b.stability);
      const scarcity=Object.values(m.markets).filter(k=>k.shortage>30).length/Math.max(1,Object.keys(m.markets).length);
      const stress=Math.max(0,a.inflation-5)+Math.max(0,b.inflation-5)+scarcity*8;
      r.tension=round(clamp(r.tension+stress*.3+instability*.06-(r.trust-45)*.12-(r.status==='war'?8:1),0,100));
      if(r.tension>=85){r.status='war';r.trust=Math.max(0,r.trust-10);r.reasonTh='ข้อพิพาทรุนแรงสะสม ทรัพยากรตึงตัวและเสถียรภาพต่ำ';}
      else if(r.status==='war'&&r.tension<65){r.status='sanctions';r.reasonTh='ลดระดับการสู้รบ แต่ยังจำกัดการค้า';}
      else if(r.tension>=65){r.status='sanctions';r.reasonTh='ความตึงเครียดสูง ใช้มาตรการจำกัดการค้า';}
      else if(r.trust>=65&&r.tension<30){r.status='treaty';r.treatyUntil=day+90;r.reasonTh='ความเชื่อมั่นสูงและผลประโยชน์การค้าร่วมกัน';}
      else if(r.status==='treaty'&&day>=r.treatyUntil||r.status==='sanctions'&&r.tension<45){r.status='peace';r.reasonTh='ประเมินเงื่อนไขใหม่ กลับมาค้าตามปกติ';}
      if(old!==r.status){r.sinceDay=day;record(w,day,'DIPLOMACY',`${w.externalWorld.geopolitics.nations[r.a].shortNameTh} ↔ ${w.externalWorld.geopolitics.nations[r.b].shortNameTh}: ${statusName(r.status)}`,r.reasonTh,{relationId:r.id,major:true});}
    }
  }
  function statusName(s){return {peace:'สัมพันธ์ปกติ',treaty:'ข้อตกลงการค้า',sanctions:'จำกัดการค้า',war:'ความขัดแย้งติดอาวุธ'}[s]||s;}
  function step(w,day){
    const m=ensure(w);if(day<=m.lastDay)return false;m.lastDay=day;
    m.shocks=m.shocks.filter(s=>day<s.untilDay);
    for(const [id,c]of Object.entries(w.externalWorld.corporations))if(!m.firms[id])initFirm(w,id,c);
    for(const n of Object.values(m.nations)){n.dailyDemand=0;n.dailyOutput=0;}
    for(const k of Object.values(m.markets)){k.supply=0;k.demand=0;k.traded=0;}
    deliver(w,day);
    for(const f of Object.values(m.firms))operate(w,f,day);
    // Buyers reserve capital and buy only their actual input gaps, including recipe inputs.
    for(const buyer of Object.values(m.firms)){
      const c=w.externalWorld.corporations[buyer.id],needs={};
      for(const k of c.buysMaterials||[])needs[k]=buyer.capacity*3;
      if(buyer.id==='world_exchange')for(const k of Object.keys(m.markets))needs[k]=20;
      for(const out of c.sellsMaterials||[]){const crop=Object.values(D.AGRICULTURE_CROPS||{}).find(q=>q.harvestMaterialId===out);if(crop){needs[crop.seedMaterialId]=4;needs.raw_water_m3=6;needs.npk_fertilizer=3;}}
      for(const out of c.sellsMaterials||[])for(const [k,q]of Object.entries(D.MATERIAL_RECIPES[out]?.inputs||{}))needs[k]=Math.max(needs[k]||0,buyer.capacity*q*3);
      let deals=0;
      for(const [k,target]of Object.entries(needs)){
        if(!m.markets[k])continue;
        const inbound=m.shipments.filter(s=>s.buyerId===buyer.id&&s.materialId===k).reduce((a,s)=>a+s.quantity,0),gap=Math.max(0,target-(buyer.stock[k]||0)-inbound);
        m.markets[k].demand+=gap;m.nations[buyer.nationId].dailyDemand+=gap;if(!gap||deals>=3)continue;
        const seller=Object.values(m.firms).filter(f=>f.id!==buyer.id&&(w.externalWorld.corporations[f.id].sellsMaterials||[]).includes(k)&&(f.stock[k]||0)>0).sort((a,b)=>{
          const ar=route(m,a.nationId,buyer.nationId),br=route(m,b.nationId,buyer.nationId);
          return a.priceFactor*(1+ar.tariff/100)+ar.days*.03+(95-a.technology)*.001-(b.priceFactor*(1+br.tariff/100)+br.days*.03+(95-b.technology)*.001)||a.id.localeCompare(b.id);
        })[0];
        const available=Math.max(0,buyer.cash-15000*buyer.capacity*(15+buyer.prudence/5)),affordable=Math.floor(available/(m.markets[k].price*1.25));
        if(seller&&trade(w,seller,buyer,k,Math.min(gap,affordable,12),day))deals++;
      }
    }
    for(const f of Object.values(m.firms)){reviewFirm(w,f,day);for(const k of w.externalWorld.corporations[f.id].sellsMaterials||[])if(m.markets[k])m.markets[k].supply+=f.stock[k]||0;}
    for(const k of Object.values(m.markets)){
      const base=w.catalog.materials[k.id].unitCost,pressure=(k.demand-k.supply)/Math.max(10,k.demand+k.supply);
      k.multiplier=round(clamp(k.multiplier*.9+(1+pressure*.65)*.1,.65,1.8));k.price=Math.max(1,Math.round(base*k.multiplier));k.shortage=Math.max(0,k.demand-k.supply);
      k.reasonTh=k.shortage>0?`คำขอซื้อ ${k.demand} หน่วย สูงกว่าสต็อกเสนอขาย ${k.supply} หน่วย`:`สต็อกเสนอขาย ${k.supply} หน่วย เทียบความต้องการ ${k.demand} หน่วย`;
    }
    for(const f of Object.values(m.firms)){
      const c=w.externalWorld.corporations[f.id],peers=Object.values(m.firms).filter(x=>w.externalWorld.corporations[x.id].sector===c.sector),total=peers.reduce((a,x)=>a+x.dailyRevenue,0);
      if(total>0)c.marketSharePct=round(f.dailyRevenue/total*100);
      const comp=w.externalWorld.competitors?.[f.id];if(comp)comp.marketSharePct=c.marketSharePct;
    }
    nationalReview(w,day);diplomacy(w,day);
    const e=w.externalWorld;
    e.ecosystemFeed=m.journal.filter(j=>['INTER_CORP_SUPPLY','CORP_DECISION'].includes(j.category)).slice(0,40).map(j=>({...j,type:j.category,impactTh:j.meaningTh}));
    e.b2bMaterialDemands=[];
    for(const f of Object.values(m.firms))for(const k of e.corporations[f.id].buysMaterials||[]){
      const market=m.markets[k];if(!market)continue;
      const inbound=m.shipments.filter(s=>s.buyerId===f.id&&s.materialId===k).reduce((a,s)=>a+s.quantity,0),gap=Math.max(0,f.capacity*3-(f.stock[k]||0)-inbound);
      if(!gap||f.cash<market.price)continue;
      e.b2bMaterialDemands.push({id:`world-demand-${day}-${f.id}-${k}`,day,buyerCorpId:f.id,buyerNameTh:e.corporations[f.id].nameTh,materialId:k,materialNameTh:w.catalog.materials[k].nameTh,tier:w.catalog.materials[k].tier||0,unitPriceSatang:Math.round(market.price*1.15),recommendedQty:Math.min(gap,12,Math.floor(f.cash/(market.price*1.15))),reasonTh:`ขาดวัตถุดิบจริง ${gap} หน่วย • ${f.decisionTh}`});
    }
    e.b2bMaterialDemands=e.b2bMaterialDemands.slice(0,30);
    m.history.push({day,traded:Object.values(m.markets).reduce((a,k)=>a+k.traded,0),activeFirms:Object.values(m.firms).filter(f=>f.status==='operating').length,conflicts:m.relations.filter(r=>r.status==='war').length});if(m.history.length>60)m.history.shift();
    return true;
  }
  function apply(w){
    const m=ensure(w),geo=w.externalWorld.geopolitics;
    for(const k of Object.values(m.markets)){
      const mult=round(clamp((geo.materialPriceMultipliers[k.id]||1)*k.multiplier,.5,3));geo.materialPriceMultipliers[k.id]=mult;geo.materialSpotPrices[k.id]=Math.round(w.catalog.materials[k.id].unitCost*mult);
    }
    for(const [sector,old]of Object.entries(geo.sectorDemandMultipliers)){
      const ns=Object.values(m.nations).filter(n=>n.specialty===sector);if(ns.length)geo.sectorDemandMultipliers[sector]=round(clamp(old*ns.reduce((a,n)=>a+n.gdpIndex/100*(n.policy==='stimulus'?1.08:n.policy==='tightening'?.94:1),0)/ns.length,.6,1.8));
    }
    for(const corridor of Object.values(geo.tradeCorridors)){
      const ids=corridor.nations,rs=m.relations.filter(r=>ids.includes(r.a)&&ids.includes(r.b));
      const severity=rs.some(r=>r.status==='war')?2:rs.some(r=>r.status==='sanctions')?1:0;
      corridor.livingStatus=severity===2?'war':severity===1?'sanctions':rs.some(r=>r.status==='treaty')?'treaty':'peace';
      corridor.leadTimeMod=round(clamp(corridor.leadTimeMod*(1+severity*.25),.7,2.5));corridor.tariffPct+=severity*5;
      if(severity)corridor.status='restricted';
    }
    const th=m.nations.TH;
    if(th){w.externalWorld.government.nameTh={balanced:'รักษาเสถียรภาพเศรษฐกิจ',stimulus:'กระตุ้นเศรษฐกิจและจ้างงาน',tightening:'ควบคุมเงินเฟ้อ',austerity:'รักษาฐานะการคลัง'}[th.policy];Object.assign(w.externalWorld.government,{activePolicyId:th.policy,summaryTh:th.policyReasonTh,demandMultiplier:round(clamp(th.gdpIndex/100*(th.policy==='stimulus'?1.08:1),.7,1.3)),corporateTaxPct:15,lastUpdatedDay:m.lastDay});}
    geo.applySpotPriceToPO=true;
    for(const n of Object.values(m.nations))n.tariffModPct=geo.nations[n.id]?.tariffModPct||0;
  }
  function scenario(w,eventId,day,duration){
    const m=ensure(w),pairs={red_sea_blockade_war:['US','ME','war'],black_sea_grain_fertilizer_war:['EU','RU_EE','war'],superpower_chip_embargo:['US','CN','sanctions'],asean_jp_eu_free_trade_pact:['ASEAN','JP','treaty'],apac_robotics_semi_alliance:['CN','JP','treaty'],singapore_asean_coldchain_corridor:['SG','ASEAN','treaty']};
    const p=pairs[eventId];
    if(p){const r=m.relations.find(r=>r.a===p[0]&&r.b===p[1]||r.a===p[1]&&r.b===p[0]);if(r){if(!r.scenarioUntil){r.priorStatus=r.status;r.priorTension=r.tension;}r.status=p[2];r.tension=p[2]==='war'?95:p[2]==='sanctions'?75:15;r.scenarioUntil=day+duration;r.sinceDay=day;r.reasonTh='มาตรการจากสถานการณ์ '+eventId;}}
    const affected={el_nino_agri_drought:['TH','ASEAN','ID'],australia_pilbara_cyclone_iron_shock:['AU'],indonesia_nickel_bauxite_ban:['ID']};
    if(affected[eventId]){m.shocks=m.shocks.filter(s=>s.id!==eventId);m.shocks.push({id:eventId,nations:affected[eventId],untilDay:day+duration,outputMultiplier:.6});}
  }
  function quote(w,k,qty,preferredId){
    const m=ensure(w),candidate=Object.values(m.firms).filter(f=>(w.externalWorld.corporations[f.id].sellsMaterials||[]).includes(k)&&(f.stock[k]||0)>=qty);
    candidate.sort((a,b)=>(a.id===preferredId?-100:0)+(a.id==='world_exchange'?30:0)+route(m,a.nationId,'TH').days-((b.id===preferredId?-100:0)+(b.id==='world_exchange'?30:0)+route(m,b.nationId,'TH').days)||a.id.localeCompare(b.id));
    const f=candidate.find(f=>route(m,f.nationId,'TH').status!=='war');if(!f)return null;
    const r=route(m,f.nationId,'TH');return {supplierId:f.id,days:f.id==='world_exchange'?1:r.days,unitPrice:Math.round((w.externalWorld.geopolitics.materialSpotPrices[k]||m.markets[k].price)*f.priceFactor*(1+(f.id==='world_exchange'?0:r.tariff)/100))};
  }
  function sellToPlayer(w,sellerId,k,qty,cost){
    const m=ensure(w),f=m.firms[sellerId];if(!f||(f.stock[k]||0)<qty)return false;
    const r=route(m,f.nationId,'TH'),tax=f.id==='world_exchange'?0:Math.round(cost*r.tariff/(100+r.tariff));
    addStock(f,k,-qty,'sold');receipt(f,cost-tax);m.nations.TH.treasury+=tax;m.nations.TH.taxes+=tax;m.playerNetSatang+=cost;return true;
  }
  function receivePlayerSale(w,buyerId,k,qty,cost){
    const m=ensure(w),f=m.firms[buyerId];if(!f||f.cash<cost)return false;
    payment(f,cost);addStock(f,k,qty,'bought');m.playerNetSatang-=cost;return true;
  }
  function validate(w){
    const m=w.externalWorld?.living;if(!m)return [];const errors=[],safe=n=>Number.isSafeInteger(n)&&n>=0;
    if(m.version!==1||!safe(m.lastDay)||!safe(m.sequence)||!m.nations||!m.firms||!m.markets||!Array.isArray(m.relations)||!Array.isArray(m.shipments))return ['invalid living world structure'];
    for(const f of Object.values(m.firms)){
      if(!f || typeof f!=="object"){errors.push('world firm missing');continue;}
      if(!safe(f.capacity)||f.capacity<1||f.capacity>10000||!Number.isFinite(f.technology)||f.technology<0||f.technology>100||!Number.isFinite(f.risk)||f.risk<0||f.risk>100||!Number.isFinite(f.prudence)||f.prudence<0||f.prudence>100||!Number.isFinite(f.priceFactor)||f.priceFactor<.5||f.priceFactor>2||!Array.isArray(f.history)||f.history.length>30)errors.push('world firm parameters '+f.id);
      if(!safe(f.cash)||!safe(f.openingCash)||!safe(f.receipts)||!safe(f.payments)||f.cash!==f.openingCash+f.receipts-f.payments)errors.push('world firm cash '+f.id);
      if(!m.nations[f.nationId]||!Number.isFinite(f.capacity)||f.capacity<1||!f.flow||!f.stock){errors.push('world firm structure '+f.id);continue;}
      for(const [k,x]of Object.entries(f.flow))if(!safe(f.stock[k])||Object.values(x).some(v=>!safe(v))||f.stock[k]!==x.opening+x.produced+x.bought-x.used-x.sold)errors.push('world stock '+f.id+':'+k);
    }
    for(const n of Object.values(m.nations))if(!Number.isFinite(n.inflation)||n.inflation < -2||n.inflation>25||!Number.isFinite(n.unemployment)||n.unemployment<1||n.unemployment>30||!safe(n.treasury)||!safe(n.householdCash)||n.treasury!==n.openingTreasury+n.taxes-n.spending||n.householdCash!==n.openingHouseholdCash+n.wages+n.transfers-n.consumption)errors.push('world national accounts '+n.id);
    for(const k of Object.values(m.markets))if(!Number.isFinite(k.price)||k.price<1||!Number.isFinite(k.multiplier)||k.multiplier<.5||k.multiplier>3)errors.push('world market '+k.id);
    for(const r of m.relations)if(!m.nations[r.a]||!m.nations[r.b]||!['peace','treaty','sanctions','war'].includes(r.status)||!Number.isFinite(r.tension)||r.tension<0||r.tension>100)errors.push('world relation '+r.id);
    if(new Set(m.shipments.map(s=>s.id)).size!==m.shipments.length)errors.push('world duplicate shipment');
    for(const s of m.shipments)if(!m.firms[s.sellerId]||!m.firms[s.buyerId]||!m.markets[s.materialId]||!safe(s.quantity)||s.quantity<1||!safe(s.dueDay))errors.push('world shipment '+s.id);
    const actual=Object.values(m.firms).reduce((a,f)=>a+f.cash,0)+Object.values(m.nations).reduce((a,n)=>a+n.treasury+n.householdCash,0);
    const opening=Object.values(m.firms).reduce((a,f)=>a+f.openingCash,0)+Object.values(m.nations).reduce((a,n)=>a+n.openingTreasury+n.openingHouseholdCash,0);
    if(actual!==opening+m.playerNetSatang)errors.push('world total cash conservation');
    return errors;
  }
  return Object.freeze({ensure,step,apply,validate,receivePlayerSale,quote,scenario,sellToPlayer,route,statusName});
});
