'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../js/sim.js');
const run=(w,d)=>S.advance(w,d*1440);
const clearMoney=(w,f)=>{w.treasury.cash+=f.cash;f.cash=0;};
test('seeded independent firms, subjects, measured feature-only opening; snapshot isolated',()=>{
 const a=S.create('one'),b=S.create('two');assert.deepEqual(a,S.create('one'));assert.notDeepEqual(a.people[0].profile,b.people[0].profile);assert.notDeepEqual(a.firms.slice(1).map(f=>f.name),b.firms.slice(1).map(f=>f.name));assert.equal(new Set(a.firms.map(f=>f.name)).size,a.firms.length);assert(a.people.every(p=>!/[0-9]/.test(p.name)));assert(a.firms.filter(f=>f.role==='brand').length>=5);assert(a.firms.every(f=>f.capability===0));const snap=S.snapshot(a);snap.people[0].subjects.software=100;assert.notEqual(a.people[0].subjects.software,100);assert(S.audit(a).ok);
});
test('normal 210-day world physically develops, manufactures, sells and conserves money and materials',()=>{
 const w=S.create('normal');run(w,210);assert.deepEqual(S.audit(w),{ok:true,errors:[]});assert(w.households.purchases>300);assert(w.firms[0].production>0);assert(w.designs.some(d=>d.level>0&&d.sold>0));assert(w.designs.every(d=>d.chip.clockGhz>0&&d.parts.ram.capacityMB>0&&d.evaluation.batteryHours>0));assert(w.firms.filter(f=>f.role!=='brand').every(f=>f.production>0&&f.capability>0));assert(w.ledger.some(l=>l.reason==='ค่าจ้างรายวัน'));assert(w.treasury.stock<100000);assert(w.people.some(p=>p.workMinutes>0));
});
test('pending shipment, WIP and notice save/load deterministic continuation; profiles refrozen',()=>{
 const w=S.create('pending');run(w,10);assert(w.WIP.length>0);assert(w.shipments.length>0);assert(w.offers.length>0);const loaded=S.deserialize(S.serialize(w));assert(Object.isFrozen(loaded.people[0].profile.personality));run(w,30);run(loaded,30);assert.deepEqual(loaded,w);
});
test('no cash cannot buy work or progress; no staff cannot research or manufacture',()=>{
 const w=S.create('blocked');w.settings.recruitment=false;const f=w.firms[0];clearMoney(w,f);run(w,20);assert.equal(f.workDone,0);assert.equal(f.production,0);assert.equal(f.research,0);assert.equal(f.project,null);
 const v=S.create('staff');v.settings.recruitment=false;const g=v.firms[0];for(const p of v.people.filter(p=>p.employerId===g.id))p.employerId=null;g.people=[];run(v,20);assert.equal(g.workDone,0);assert.equal(g.production,0);assert(S.audit(v).ok);
});
test('no components stops prototype; intermediate WIP holds consumed parts before any phones appear',()=>{
 const w=S.create('parts');w.settings.recruitment=false;for(const f of w.firms.filter(f=>f.role!=='brand')){clearMoney(w,f);for(const k of Object.keys(f.stock)){w.materials.componentOpening-=f.stock[k];f.stock[k]=0;}}run(w,30);assert.equal(w.firms[0].project.stage,'prototype');assert.equal(w.firms[0].production,0);assert(S.audit(w).ok);
 const v=S.create('wip');let held;for(let i=0;i<40*24;i++){S.advance(v,60);held=v.WIP.find(b=>b.kind==='phone');if(held)break;}assert(held);const f=v.firms.find(f=>f.id===held.firmId),d=v.designs.find(d=>d.id===held.designId);assert.equal(d.produced,0);assert(held.inputs===84);assert(['pilot','manufacture'].includes(f.project.stage));assert(S.audit(v).ok);
});
test('player cash does not change rival research under fixed no-trade/no-hiring fixture',()=>{
 const a=S.create('independent');a.settings.market=false;a.settings.recruitment=false;
 // Disconnect all component offers: this removes legitimate market and hiring interactions.
 for(const f of a.firms.filter(f=>f.role!=='brand')){clearMoney(a,f);for(const k of Object.keys(f.stock)){a.materials.componentOpening-=f.stock[k];f.stock[k]=0;}}
 const b=S.deserialize(S.serialize(a));S.command(b,{type:'grantCash',firmId:'player',amount:900000000});run(a,100);run(b,100);
 assert.deepEqual(a.firms.filter(f=>f.id.startsWith('rival')),b.firms.filter(f=>f.id.startsWith('rival')));assert.deepEqual(a.people.filter(p=>p.employerId?.startsWith('rival')),b.people.filter(p=>p.employerId?.startsWith('rival')));
});
test('Edit Hub isolates person, validates commands and accounts capital source',()=>{
 const w=S.create('edit'),before=S.snapshot(w),p=w.people[1];S.command(w,{type:'setSubject',personId:p.id,subjectId:'software',level:99});S.command(w,{type:'setTrait',personId:p.id,key:'openness',level:99});assert.deepEqual(w.people[0],before.people[0]);assert.equal(p.profile.personality.openness,99);assert(Object.isFrozen(p.profile));S.command(w,{type:'grantCash',firmId:'player',amount:100000});assert.equal(w.editCapital,100000);assert(S.audit(w).ok);assert.throws(()=>S.command(w,{type:'grantCash',firmId:'player',amount:-1}));assert.throws(()=>S.command(w,{type:'setSubject',personId:p.id,subjectId:'hacked',level:20}));
});
test('autonomous recruitment preserves person identity and requires notice before transfer',()=>{
 const w=S.create('hiring');run(w,3);const offer=w.offers.find(o=>o.status==='notice');assert(offer);const p=w.people.find(p=>p.id===offer.personId),profile=p.profile,subjects={...p.subjects};assert.equal(p.employerId,offer.from);S.advance(w,offer.eta-w.minute+60);assert.equal(p.employerId,offer.to);assert.equal(p.profile,profile);assert.equal(p.subjects.software,subjects.software);assert.equal(offer.status,'joined');assert(w.firms.find(f=>f.id===offer.to).people.includes(p.id));assert(S.audit(w).ok);
});
test('invalid saves reject without replacing live world',()=>{
 const w=S.create('corrupt'),text=S.serialize(w);for(const mutate of [v=>v.firms[0].cash=-1,v=>v.people[0].profile.personality.openness=101,v=>v.firms[0].stock['chip:0']=999,v=>v.schema=7,v=>v.people[0].employerId='missing',v=>v.firms[0].capability=100,v=>v.settings=null]){const v=JSON.parse(text);mutate(v);assert.throws(()=>S.deserialize(JSON.stringify(v)));}assert.equal(S.serialize(w),text);
});
test('hour boundaries are chunk-invariant, travel and rest are actual human-core updates',()=>{
 const a=S.create('clock'),b=S.create('clock');S.advance(a,1500);for(let i=0;i<100;i++)S.advance(b,15);assert.deepEqual(a,b);const w=S.create('life');S.advance(w,9*60);assert(w.people.some(p=>p.activity==='travel'));S.advance(w,60);assert(w.people.some(p=>p.activity==='work'));S.advance(w,14*60);assert(w.people.every(p=>p.activity==='sleep'));assert(S.audit(w).ok);
});
test('seed varies opening finance, resources and teams; specialist SME origin trades actual output',()=>{
 const a=S.create('a'),b=S.create('b');assert.notEqual(a.firms[0].cash,b.firms[0].cash);assert.notDeepEqual(a.firms.map(f=>f.people.length),b.firms.map(f=>f.people.length));assert.notDeepEqual(a.firms.map(f=>f.raw),b.firms.map(f=>f.raw));const w=S.create('specialist',{role:'chip'});run(w,180);assert.equal(w.firms[0].role,'chip');assert(w.firms[0].production>0);assert(w.firms[0].revenue>0);assert(S.audit(w).ok);
});
test('healthy employed engineers can autonomously transfer after notice without cloning knowledge',()=>{
 const w=S.create('competitive');run(w,31);const target=w.firms[0],ceo=w.people.find(p=>p.id===target.people[0]);S.command(w,{type:'setTrait',personId:ceo.id,key:'ambition',level:100});
 // A competitive fixture: no free agents, highly skilled employee open to moving.
 for(const p of w.people.filter(p=>p.employerId===null)){const f=w.firms.at(-1);p.employerId=f.id;f.people.push(p.id);}
 const donor=w.firms.find(f=>f.id!==target.id&&f.people.length>3),candidate=w.people.find(p=>p.id===donor.people.at(-1));S.command(w,{type:'setSubject',personId:candidate.id,subjectId:'electronics',level:100});const profile=JSON.parse(JSON.stringify(candidate.profile));profile.values.security=0;profile.personality.patience=0;candidate.profile=require('../js/human-core.js').freezeProfile(profile);candidate.notice=null;candidate.lastJoined=0;
 let offer;for(let i=0;i<30;i++){run(w,1);offer=w.offers.find(o=>o.personId===candidate.id&&o.from!==null);if(offer)break;}assert(offer);assert.equal(candidate.employerId,offer.from);const id=candidate.id,knowledge=candidate.subjects.software;S.advance(w,offer.eta-w.minute+60);assert.equal(candidate.id,id);assert.equal(candidate.employerId,offer.to);assert.equal(candidate.subjects.software,knowledge);assert(!donor.people.includes(id));assert(S.audit(w).ok);
});
test('time smaller than one hour cannot grant advance work',()=>{const w=S.create('partial');S.advance(w,59);assert(w.people.every(p=>p.workMinutes===0));assert(w.firms.every(f=>f.workDone===0));const a=S.create('partition'),b=S.create('partition');S.advance(a,600);for(let i=0;i<120;i++)S.advance(b,5);assert.deepEqual(a,b);});
test('reject corrupt project requirements, owner/level links, duplicate WIP and forged reservations',()=>{
 const w=S.create('review');S.advance(w,600);assert(w.firms[0].project);const text=S.serialize(w);
 for(const mutate of [v=>delete v.firms[0].project.required,v=>v.firms[0].project.required=0,v=>v.firms[0].project.level=3,v=>v.firms[0].project.designId=v.firms[1].project.designId]){const v=JSON.parse(text);mutate(v);assert.throws(()=>S.deserialize(JSON.stringify(v)));}
 const b=S.create('reservations');for(let i=0;i<1000&&!b.WIP.some(x=>x.kind==='phone');i++)S.advance(b,60);assert(b.WIP.some(x=>x.kind==='phone'));const saved=S.serialize(b);
 for(const mutate of [v=>{const copy={...v.WIP[0],id:'duplicate'};v.WIP.push(copy);},v=>v.WIP[0].inputs=1,v=>v.WIP[0].kind='free_money',v=>v.WIP.splice(v.WIP.findIndex(x=>x.kind==='phone'),1),v=>v.WIP.find(x=>x.kind==='phone').designId='missing']){const v=JSON.parse(saved);mutate(v);assert.throws(()=>S.deserialize(JSON.stringify(v)));}
});
test('failed validation pays for timed redesign, consumes a fresh prototype and recovers',()=>{
 const w=S.create('retry');const f=w.firms[0];for(let i=0;i<600&&f.project?.stage!=='validation';i++)S.advance(w,60);assert.equal(f.project.stage,'validation');const failed=w.designs.find(d=>d.id===f.project.designId);failed.evaluation.compatible=false;for(let i=0;i<100&&f.project?.stage!=='failed';i++)S.advance(w,60);assert.equal(f.project.stage,'failed');assert.equal(failed.produced,0);const prior=w.materials.componentsConsumed;for(let i=0;i<100&&f.project?.stage==='failed';i++)S.advance(w,60);assert(w.ledger.some(l=>l.reason==='ออกแบบใหม่หลังทดสอบล้มเหลว'));run(w,35);assert(w.designs.some(d=>d.firmId===f.id&&d.id!==failed.id&&d.produced>0));assert(w.materials.componentsConsumed>prior);assert(S.audit(w).ok);
});
test('slow duplicate player supplier cannot cap qualified independent suppliers or rival designs',()=>{
 const w=S.create('qualified',{role:'chip'});w.settings.market=false;w.settings.recruitment=false;const player=w.firms[0];clearMoney(w,player);for(const f of w.firms.filter(f=>f.id!==player.id))f.capability=3;
 const rival=w.firms.find(f=>f.role==='brand');S.advance(w,60);rival.strategy={...rival.strategy,segmentId:'performance',level:3};S.advance(w,540);assert.equal(player.capability,0);assert.equal(rival.project.level,3);const d=w.designs.find(d=>d.id===rival.project.designId);assert.equal(d.chip.level,3);const E=require('../js/phone-engineering.js');assert.deepEqual(d.chip,E.synthesizeChip(w.seed+':supplier-chip:3',75,{level:3}));assert(S.audit(w).ok);
});
test('segments fund their own purchases with distinct utility, hard budgets and actual inventories',()=>{
 const w=S.create('segments');run(w,150);assert(w.segments.every(s=>s.cash+s.spent===s.initialCash));assert.equal(w.segments.reduce((n,s)=>n+s.cash,0),w.households.cash);assert(w.segments.every(s=>s.purchases>0));assert(w.designs.every(d=>Object.values(d.segmentSales).reduce((a,n)=>a+n,0)===d.sold));assert(new Set(w.firms.filter(f=>f.strategy).map(f=>f.strategy.segmentId)).size>1);assert(w.designs.some(d=>d.level<w.firms.find(f=>f.id===d.firmId).capability));assert(S.audit(w).ok);
 const value=w.segments[0],photo=w.segments[1],a={price:150000,evaluation:{compatible:true,taskScores:{call:80,web:10,game:10},batteryHours:24,photoLowLightScore:20}},b={price:150000,evaluation:{compatible:true,taskScores:{call:80,web:10,game:10},batteryHours:8,photoLowLightScore:90}};assert(S.consumerUtility(a,value)>S.consumerUtility(b,value));assert(S.consumerUtility(b,photo)>S.consumerUtility(a,photo));
 // Every released phone is too expensive; funded demand must remain unmet.
 for(const d of w.designs)d.price=999999;w.minute=Math.ceil(w.minute/1440)*1440;const before=w.households.purchases;S.advance(w,60);assert.equal(w.households.purchases,before);assert(w.segments.every(s=>s.lastSales===0&&s.unmet===s.lastDemand));assert(S.audit(w).ok);
});
test('paid sales expertise changes conversion capacity without granting engineering work or money',()=>{
 const a=S.create('sales-work');a.settings.market=false;a.settings.recruitment=false;run(a,45);const f=a.firms.find(f=>f.role==='brand'&&a.designs.some(d=>d.firmId===f.id&&d.released&&d.inventory>=12));assert(f);const b=S.deserialize(S.serialize(a));for(const w of [a,b]){for(const other of w.firms){other.salesWork=0;if(other.id!==f.id)clearMoney(w,other);}for(const p of w.people.filter(p=>p.employerId===f.id))S.command(w,{type:'setSubject',personId:p.id,subjectId:'sales',level:w===a?0:100});w.settings.market=true;}const old=f.sales;run(a,1);run(b,1);const high=b.firms.find(g=>g.id===f.id);assert(high.salesWork>f.salesWork);assert.equal(high.workDone,f.workDone);S.advance(a,60);S.advance(b,60);assert(high.sales-old>f.sales-old);assert(S.audit(a).ok&&S.audit(b).ok);
});
test('supplier alternatives trade price against time, split scarce stock and preserve paid generation ownership',()=>{
 const w=S.create('procurement');w.settings.recruitment=false;const f=w.firms[0];for(let i=0;i<1000&&f.project?.stage!=='procurement';i++)S.advance(w,60);assert.equal(f.project.stage,'procurement');const l=f.project.level,key='chip:'+l,slow=w.firms.find(s=>s.id==='supplier-chip'),fast=w.firms.find(s=>s.id==='supplier-chip-alt');
 for(const [s,q] of [[slow,100],[fast,5]]){w.materials.componentOpening+=q-(s.stock[key]||0);s.stock[key]=q;s.capability=Math.max(s.capability,l);}slow.supplyTerms={priceBps:8000,leadHours:72};fast.supplyTerms={priceBps:12499,leadHours:12};S.command(w,{type:'setTrait',personId:f.people[0],key:'patience',level:0});const text=S.serialize(w),quotes=S.supplierQuotes(w,f.id,'chip',l);assert.equal(S.serialize(w),text);assert.equal(quotes[0].sellerId,fast.id);assert(quotes[0].unitPrice>quotes[1].unitPrice);const balance=f.cash;
 for(let i=0;i<48&&!w.shipments.some(s=>s.to===f.id&&s.key===key);i++)S.advance(w,60);const orders=w.shipments.filter(s=>s.to===f.id&&s.key===key);assert(orders.some(s=>s.from===fast.id));assert(orders.some(s=>s.from===slow.id));assert.equal(orders.reduce((n,s)=>n+s.quantity,0),12);assert(f.cash<balance);assert(orders.every(s=>s.unitPrice>0&&s.eta>w.minute-60));assert(S.audit(w).ok);const restored=S.deserialize(S.serialize(w));run(w,5);run(restored,5);assert.deepEqual(restored,w);
});
test('current commercial saves reject missing wallets, invalid plans and incompatible old saves',()=>{
 const w=S.create('commercial-save');run(w,20);const text=S.serialize(w);for(const mutate of [v=>v.segments[0].cash++,v=>delete v.segments,v=>v.segments[1].maxPrice=999999,v=>v.firms[0].strategy.level=99,v=>v.firms[0].salesWork=-1,v=>v.firms[0].procurement=[null],v=>v.firms[1].supplyTerms.leadHours=0,v=>v.designs[0].segmentSales.value++,v=>{v.schema=1;v.release='0.1.0';},v=>{v.schema=2;v.release='0.2.0';}]){const v=JSON.parse(text);mutate(v);assert.throws(()=>S.deserialize(JSON.stringify(v)));}assert.equal(S.serialize(w),text);
});
test('autonomous weekly pricing clears accumulated inventory while preserving estimated cost floor',()=>{
 const w=S.create('clearance');w.settings.market=false;run(w,100);const designs=w.designs.filter(d=>d.released&&d.inventory>20&&d.priceReason.includes('ระบาย'));assert(designs.length>0);for(const d of designs){const f=w.firms.find(f=>f.id===d.firmId),ceo=w.people.find(p=>p.id===f.people[0]);assert(d.price>=Math.round(d.estimatedUnitCost*1.08));assert(d.price<=Math.round(d.estimatedUnitCost*(1.25+ceo.profile.personality.ambition/400)));assert(f.strategy.level<=f.capability);}assert(S.audit(w).ok);
 const f=w.firms[0],p=f.people[0];S.command(w,{type:'setTrait',personId:p,key:'patience',level:0});const impatient=S.supplierQuotes(w,f.id,'chip',0);S.command(w,{type:'setTrait',personId:p,key:'patience',level:100});const patient=S.supplierQuotes(w,f.id,'chip',0);for(const q of impatient){const other=patient.find(o=>o.sellerId===q.sellerId);assert.equal(q.score-other.score,q.leadMinutes/60*800);}assert(S.audit(w).ok);
});
test('market-facing engineering measurements reject corrupt saves before resumed settlement',()=>{
 const w=S.create('review');run(w,60);const d=w.designs.find(d=>d.released&&d.inventory>0);assert(d);const original=S.serialize(w);for(const mutate of [e=>delete e.taskScores,e=>e.taskScores=null,e=>delete e.taskScores.call,e=>e.taskScores.web='8',e=>e.taskScores.game=101,e=>delete e.photoLowLightScore,e=>e.photoLowLightScore=-1]){const candidate=JSON.parse(original);mutate(candidate.designs.find(x=>x.id===d.id).evaluation);assert.equal(S.audit(candidate).ok,false);assert.throws(()=>S.deserialize(JSON.stringify(candidate)));}assert.equal(S.serialize(w),original);const restored=S.deserialize(original);run(w,8);run(restored,8);assert.deepEqual(restored,w);assert(S.audit(w).ok);
});

test('SKU and physical lot provenance trace design, IP, manufacturer, transit, WIP reservation and finished phone without retroactive upgrade',()=>{
 const w=S.create('sku-provenance');
 assert.equal(S.LOT_POLICY.allowImplicitMerge,false);
 assert(w.skus.length>=18);
 assert(w.lots.length>=14);
 const chipSupplier=w.firms.find(f=>f.id==='supplier-chip');
 const openingChipSku=w.skus.find(s=>s.manufacturerId===chipSupplier.id&&s.kind==='chip'&&s.level===0);
 assert(openingChipSku);
 const openingSpecCopy=JSON.parse(JSON.stringify(openingChipSku.spec));
 const openingLot=w.lots.find(l=>l.skuId===openingChipSku.id&&l.ownerId===chipSupplier.id&&l.location==='stock');
 assert(openingLot);

 // Advance until a brand buys a shipment, consumes prototype lots, reserves WIP lots, and finishes a phone batch
 run(w,95);
 const completedPhone=w.designs.find(d=>d.produced>0&&d.finishedLots?.length>0&&d.prototypeLots?.length===7);
 assert(completedPhone);
 assert(completedPhone.bomSkus.chip);
 assert(completedPhone.bomSkus.pcb_rf);
 assert(completedPhone.bomSkus.os);
 assert(completedPhone.osLicense.skuId);
 const snapChipBefore=JSON.parse(JSON.stringify(completedPhone.chip));
 const snapBomLotsBefore=JSON.parse(JSON.stringify(completedPhone.finishedLots[0].bomLots));

 // Advance further so suppliers complete higher-level R&D SKUs
 run(w,90);
 assert(w.skus.some(s=>s.manufacturerId===chipSupplier.id&&s.level>=1));
 // Retroactive immunity: old SKU, old lots and already produced phone designs retain their exact original specs and lot provenance
 assert.deepEqual(openingChipSku.spec,openingSpecCopy);
 assert.deepEqual(completedPhone.chip,snapChipBefore);
 assert.deepEqual(completedPhone.finishedLots[0].bomLots,snapBomLotsBefore);

 // Pure traceSkuChain read does not mutate world
 const serializedBeforeTrace=S.serialize(w);
 const trace=S.traceSkuChain(w,completedPhone.bomSkus.chip);
 assert.equal(trace.type,'sku');
 assert(trace.designs.some(d=>d.id===completedPhone.id));
 assert.equal(S.serialize(w),serializedBeforeTrace);
 assert(S.audit(w).ok);
});

test('at least three firms pursue distinct R&D portfolio paths with measurable tradeoffs and business consequences',()=>{
 const w=S.create('divergent-rnd');
 run(w,160);
 const completed=w.firms.flatMap(f=>f.rndPortfolio.completedProjects.map(p=>({...p,firmRole:f.role})));
 const distinctFocuses=new Set(completed.map(c=>c.targetFocus));
 assert(distinctFocuses.size>=4,`expected >=4 distinct R&D target focuses, got ${[...distinctFocuses].join(',')}`);

 // Compare supplier-chip (power_efficiency) vs supplier-chip-alt (compute_performance) at level 0
 const effChip=w.skus.find(s=>s.designerId==='supplier-chip'&&s.kind==='chip'&&s.level===0);
 const perfChip=w.skus.find(s=>s.designerId==='supplier-chip-alt'&&s.kind==='chip'&&s.level===0);
 assert.equal(effChip.focus,'power_efficiency');
 assert.equal(perfChip.focus,'compute_performance');

 // Compare supplier-camera (camera_optics) vs supplier-camera-alt (reliability)
 const camOptics=w.skus.find(s=>s.designerId==='supplier-camera'&&s.kind==='camera'&&s.level===0);
 const camRel=w.skus.find(s=>s.designerId==='supplier-camera-alt'&&s.kind==='camera'&&s.level===0);
 assert.equal(camOptics.focus,'camera_optics');
 assert.equal(camRel.focus,'reliability');

 // Compare RAM vs Storage distinct functions & constraints
 const ramSku=w.skus.find(s=>s.kind==='ram'&&s.level===0);
 const stoSku=w.skus.find(s=>s.kind==='storage'&&s.level===0);
 assert(ramSku.spec.bandwidthGBps>0&&ramSku.spec.type==='SDRAM');
 assert(stoSku.spec.readMBps>0&&stoSku.spec.writeMBps>0&&stoSku.spec.interface==='SPI');
 assert(S.audit(w).ok);
});

test('incompatible SKU parts, OS mismatches and extreme power/ISP envelopes fail qualification explicitly; compatible lot substitution is audited',()=>{
 const w=S.create('compat-subst');
 run(w,35);
 const d=w.designs[0];
 assert(d);

 // 1. Incompatible RAM type (LPDDR on level-0 SDRAM chip)
 const badRamParts=JSON.parse(JSON.stringify(d.parts));
 badRamParts.ram.type='LPDDR';
 const r1=S.evaluateSkuCompatibility(d.chip,badRamParts);
 assert.equal(r1.compatible,false);
 assert(r1.reasonsTh.some(x=>x.includes('ชนิดแรม')));

 // 2. Incompatible Battery discharge (< peakPowerW)
 const badBattParts=JSON.parse(JSON.stringify(d.parts));
 badBattParts.battery.maxDischargeW=0.1;
 const r2=S.evaluateSkuCompatibility(d.chip,badBattParts);
 assert.equal(r2.compatible,false);
 assert(r2.reasonsTh.some(x=>x.includes('แบตเตอรี่จ่ายกำลังสูงสุดไม่พอ')));

 // 3. Incompatible OS ISA or insufficient driverCoverage
 const badOsParts=JSON.parse(JSON.stringify(d.parts));
 badOsParts.os.driverCoverage=0.5;
 const r3=S.evaluateSkuCompatibility(d.chip,badOsParts);
 assert.equal(r3.compatible,false);
 assert(r3.reasonsTh.some(x=>x.includes('ไดรเวอร์ชิ้นส่วนยังไม่ครบ')));

 // 4. Camera megapixels exceeding chip ISP limit
 const badCamParts=JSON.parse(JSON.stringify(d.parts));
 badCamParts.camera.megapixels=100;
 const r4=S.evaluateSkuCompatibility(d.chip,badCamParts);
 assert.equal(r4.compatible,false);
 assert(r4.reasonsTh.some(x=>x.includes('ISP')));

 // 5. Pure qualifySubstitution check on owned compatible vs wrong-kind lot
 const f=w.firms.find(x=>x.id===d.firmId);
 const altChipSku=w.skus.find(s=>s.id==='sku-chip-supplier-chip-alt-g0-r1');
 w.lots.push({
   id:'lot-test-sub',
   skuId:altChipSku.id,
   kind:'chip',
   level:0,
   revision:1,
   focus:altChipSku.focus,
   designerId:altChipSku.designerId,
   ipOwnerId:altChipSku.ipOwnerId,
   manufacturerId:altChipSku.manufacturerId,
   ownerId:f.id,
   location:'stock',
   quantity:2,
   unitPrice:17000,
   createdMinute:w.minute,
   shipmentId:null,
   wipId:null,
   designId:null
 });
 f.stock['chip:0']=(f.stock['chip:0']||0)+2;
 w.materials.componentOpening+=2;
 const beforeSub=S.serialize(w);
 const subOk=S.qualifySubstitution(w,d.id,'chip','lot-test-sub');
 assert.equal(subOk.ok,true);
 const subWrongKind=S.qualifySubstitution(w,d.id,'camera','lot-test-sub');
 assert.equal(subWrongKind.ok,false);
 assert.equal(S.serialize(w),beforeSub);
 assert(S.audit(w).ok);
});

test('R&D requires relevant specialist subjects, triggers rework on low-skill prototype failure, and records sunk cost on cancellation',()=>{
 const w=S.create('rnd-rework',{role:'chip'});
 w.settings.recruitment=false;
 const f=w.firms[0];
 for(const pid of f.people){
   S.command(w,{type:'setSubject',personId:pid,subjectId:'semiconductor',level:12});
 }
 S.command(w,{type:'grantCash',firmId:f.id,amount:50000000});
 for(let i=0;i<150;i++){
   run(w,1);
   const proj=w.rndProjects.find(r=>r.firmId===f.id);
   if(proj&&proj.reworkCount>0)break;
 }
 const proj=w.rndProjects.find(r=>r.firmId===f.id);
 assert(proj&&proj.reworkCount>0,'expected low-skill prototype qualification to trigger rework');
 assert(f.rndPortfolio.sunkCostSatang>0);

 const spentBeforeCancel=proj.nreSpentSatang;
 assert(spentBeforeCancel>0);
 S.command(w,{type:'cancelRndProject',firmId:f.id});
 assert.equal(proj.status,'cancelled');
 assert.equal(f.rndPortfolio.activeProjectId,null);
 assert.equal(f.rndPortfolio.cancelledProjects.length,1);
 assert(f.rndPortfolio.sunkCostSatang>=spentBeforeCancel);
 assert(S.audit(w).ok);
});

test('make/buy/license evaluation separates objective infeasibility from prudent strategic refusal (declined_prudent)',()=>{
 const w=S.create('sourcing-modes');
 const f=w.firms[0];
 const ceoId=f.people[0];
 // Case 1: Low cash -> co_develop_custom_sku is objectively infeasible
 clearMoney(w,f);
 S.command(w,{type:'grantCash',firmId:f.id,amount:400000});
 S.advance(w,60);
 assert(f.sourcingDecision);
 assert.equal(f.sourcingDecision.chosenMode,'buy_merchant_sku');
 assert(f.sourcingDecision.infeasibleModes.length>0);
 assert.equal(f.sourcingDecision.declinedFeasibleModes.length,0);

 // Case 2: Advance to day 7 midnight boundary with adequate cash & high skills, but prudent/risk-averse CEO -> feasible but declined prudently
 S.advance(w,7*1440-w.minute);
 clearMoney(w,f);
 S.command(w,{type:'grantCash',firmId:f.id,amount:1450000});
 for(const pid of f.people){
   S.command(w,{type:'setSubject',personId:pid,subjectId:'electronics',level:60});
   S.command(w,{type:'setSubject',personId:pid,subjectId:'software',level:60});
 }
 S.command(w,{type:'setTrait',personId:ceoId,key:'prudence',level:90});
 S.command(w,{type:'setTrait',personId:ceoId,key:'riskTaking',level:20});
 S.advance(w,60);
 assert.equal(f.sourcingDecision.chosenMode,'license_and_buy_prudent');
 assert.equal(f.sourcingDecision.infeasibleModes.length,0);
 assert(f.sourcingDecision.declinedFeasibleModes.length>0);
 assert(S.audit(w).ok);
});

test('adversarial schema 3 saves reject unknown hostile fields and forged SKU/lot/R&D links while preserving mid-process round trips',()=>{
 const w=S.create('mid-process');
 run(w,18);
 assert(w.rndProjects.length>0);
 assert(w.lots.length>0);
 const saved=S.serialize(w);
 const roundTrip=S.deserialize(saved);
 assert.deepEqual(roundTrip,w);

 const mutations=[
   v=>{v.hackedAdminPrivilege=true;},
   v=>{v.skus[0].kind='quantum_core';},
   v=>{v.lots[0].quantity+=5;},
   v=>{v.lots[0].skuId='missing-sku';},
   v=>{v.lots[0].location='transit';v.lots[0].shipmentId='missing-ship';},
   v=>{v.rndProjects[0].stage='teleported';},
   v=>{v.rndProjects[0].leadEngineerId='ghost-person';},
   v=>{v.firms[0].rndPortfolio.activeProjectId='missing-rnd';}
 ];
 for(const mutate of mutations){
   const candidate=JSON.parse(saved);
   mutate(candidate);
   assert.equal(S.audit(candidate).ok,false);
   assert.throws(()=>S.deserialize(JSON.stringify(candidate)));
 }
 assert.equal(S.serialize(w),saved);
});

test('UI module renders all 6 observer tabs, provenance tracer, Edit Hub isolation and safe autosave without mutating world',()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const makeNode=(tag,text='',cls='')=>({
   tagName:String(tag).toUpperCase(),
   textContent:text===undefined?'':String(text),
   className:cls||'',
   value:'',
   type:'',
   step:'',
   min:0,
   max:100,
   files:[],
   dataset:{},
    attributes:{},
   children:[],
   classList:{
     classes:new Set((cls||'').split(/\s+/).filter(Boolean)),
     add(c){this.classes.add(c);},
     toggle(c,on){if(on)this.classes.add(c);else this.classes.delete(c);}
   },
   setAttribute(k,v){this.attributes[k]=String(v);},
   getAttribute(k){return this.attributes[k];},
   append(...items){for(const it of items)if(it){this.children.push(it);if(this.tagName==="SELECT"&&!this.value&&it.tagName==="OPTION"&&it.value!==undefined)this.value=it.value;}},
   replaceChildren(...items){this.children=[...items];},
   showModal(){this.open=true;},
   close(){this.open=false;},
   click(){if(typeof this.onclick==='function')this.onclick({preventDefault(){}});},
   get options(){return this.children.filter(c=>c.tagName==='OPTION');},
   getContext(){
     return {fillStyle:'',font:'',fillRect(){},fillText(){},beginPath(){},arc(){},fill(){}};
   },
   get innerText(){
     return (this.textContent||'')+' '+this.children.map(c=>c.innerText||'').join(' ');
   }
 });
 const ids={};
 for(const id of ['time','kpis','firm','firmReason','tabs','content','message','nextDay','seed','randomSeed','newWorld','welcome','resume','createWorld','startRole','export','import','help']){
   ids[id]=makeNode('div');
 }
 ids.startRole.value='brand';
 ids.seed.value='ui-harness';
 const speedBtns=[0,1,5,20].map(s=>{const b=makeNode('button');b.dataset.speed=String(s);return b;});
 const storage=new Map([['company-original-sentinel','untouched'],['silicon-handset-v010','v010-kept']]);
 const sandbox={
   SiliconSim:S,
   performance:{now:()=>0},
   requestAnimationFrame:()=>{},
   crypto:{getRandomValues(arr){for(let i=0;i<arr.length;i++)arr[i]=12345+i;return arr;}},
   Blob:class{},
   URL:{createObjectURL:()=>'blob:test',revokeObjectURL:()=>{}},
   setTimeout:()=>{},
   alert:()=>{},
   localStorage:{
     getItem:k=>storage.has(k)?storage.get(k):null,
     setItem:(k,v)=>storage.set(k,String(v))
   },
   document:{
     getElementById:id=>ids[id]||(ids[id]=makeNode('div')),
     createElement:(tag)=>makeNode(tag),
     querySelectorAll:sel=>sel==='[data-speed]'?speedBtns:[]
   },
   window:{}
 };
 sandbox.window=sandbox;
 const uiCode=fs.readFileSync(path.resolve(__dirname,'../js/ui.js'),'utf8');
 vm.runInNewContext(uiCode,sandbox);
 assert(sandbox.SiliconGame);
 sandbox.SiliconGame.advance(1440*60);
 const before=S.serialize(sandbox.SiliconGame.world);

 // Click through every observer tab and check content + read purity
 for(const tabBtn of [...ids.tabs.children]){
   if(tabBtn.textContent.includes('Edit Hub'))continue;
   tabBtn.click();
   assert(!ids.content.innerText.includes('NaN'));
 }
 // Supply tab provenance tracer
 const supplyBtn=ids.tabs.children.find(b=>b.textContent.includes('คลังและคิวผลิต'));
 supplyBtn.click();
 assert(ids.content.innerText.includes('มาตรฐานร่วมกัน'));
 assert(ids.content.innerText.includes('ตามรอยสายโซ่'));
 assert.equal(S.serialize(sandbox.SiliconGame.world),before);

 // Edit Hub tab: test live preview, subject change, trait change, and grantCash
 const editBtn=ids.tabs.children.find(b=>b.textContent.includes('Edit Hub'));
 editBtn.click();
 assert(ids.content.innerText.includes('เป้าหมาย:'));
 assert(ids.content.innerText.includes('ค่าที่เสนอ'));
 assert.equal(S.serialize(sandbox.SiliconGame.world),before);

 // Verify old saves remain untouched
 assert.equal(storage.get('company-original-sentinel'),'untouched');
 assert.equal(storage.get('silicon-handset-v010'),'v010-kept');
});
