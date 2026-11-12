'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../js/sim'),P=require('../js/plant'),W=require('../js/world'),E=require('../js/economy'),Save=require('../js/save'),prepare=require('./knowledge-fixtures.cjs');
const make=seed=>S.create(seed,{autonomous:false});
function hooks(w){let seq=0;return {pay:(n,ref)=>E.post(w.finance,{id:'testplant:'+w.clock.absoluteMinute+':'+(++seq),kind:'equipment',delta:-n,reference:ref,at:w.clock.absoluteMinute}),claim:p=>{if(p.taskId&&w.jobs[p.taskId])w.jobs[p.taskId].assignee=null;p.taskId=null;},walk:(p,s)=>{p.position={...s.access};p.path=[];}};}
function advanceClock(w){w.clock.absoluteMinute+=5;w.clock.tick++;}
test('42 products have valid process routes with real equipment, work fractions and distinct waiting/thermal requirements',()=>{
 const w=make('routes');for(const p of Object.values(w.catalog.products)){const steps=P.route(p);assert.ok(steps.length>=3);assert.ok(Math.abs(steps.reduce((a,s)=>a+s.share,0)-1)<1e-8);for(const s of steps)assert.ok(P.SPECS[s.equipment]);}
 assert.ok(P.route(w.catalog.products.artisan_bakery).some(s=>s.temperatureC===180));assert.ok(P.route(w.catalog.products.probiotic_yogurt_cup).some(s=>s.holdMinutes>=180));
 assert.equal(Object.keys(P.serviceEquipment).length,10);assert.ok(P.businessReady(w,'software'));assert.ok(P.businessReady(w,'freight'));assert.equal(P.businessReady(w,'cold_storage_3pl'),false);
});
test('missing machinery blocks production, equipment purchase charges money and installation needs a qualified worker',()=>{
 const w=make('equipment');const before=w.finance.cash;assert.ok(P.request(w,'mixer',hooks(w)));assert.equal(w.finance.cash,before-P.SPECS.mixer.cost);assert.equal(w.plant.machines.mixer.status,'installing');
 for(const p of w.people){p.atWork=true;p.path=[];p.education.subjects.maintenance=0;p.education.subjects.electrical_basics=0;}
 P.maintain(w,hooks(w));assert.equal(w.plant.maintenance[0].progress,0);
 const p=w.people.find(p=>p.role==='engineer');p.education.subjects.maintenance=80;p.position={...w.layout.stations.assembly1.access};
 S.advance(w,w.plant.machines.mixer.availableAt-w.clock.absoluteMinute);p.atWork=true;p.path=[];p.position={...w.layout.stations.assembly1.access};
 for(let i=0;i<20;i++){P.maintain(w,hooks(w));advanceClock(w);}
 assert.equal(w.plant.machines.mixer.status,'ready');assert.deepEqual(S.audit(w),[]);assert.deepEqual(Save.validate(w),[]);
});
test('repair needs family-specific spare parts and technical skill; a broken machine does not repair for free',()=>{
 const w=make('repair'),m=w.plant.machines.electronics_bench;m.condition=10;P.review(w,hooks(w));assert.equal(m.status,'maintenance');
 const p=w.people.find(p=>p.role==='engineer');p.atWork=true;p.education.subjects.maintenance=90;p.position={...w.layout.stations.assembly1.access};
 const part='wire_harness';w.inventory.opening[part]-=w.inventory.materials[part];w.inventory.materials[part]=0;
 P.maintain(w,hooks(w));assert.equal(w.plant.maintenance[0].progress,0);
 S.command(w,{type:'directorEdit',action:'grantMaterial',materialId:part,quantity:1});
 for(let i=0;i<30;i++){P.maintain(w,hooks(w));advanceClock(w);}
 assert.equal(m.status,'ready');assert.ok(m.condition>=90);assert.equal(w.inventory.materials[part],0);assert.deepEqual(S.audit(w),[]);
});
test('passive machine processing needs elapsed time and target temperature, and survives save/load',()=>{
 const w=make('oven');prepare(w,{products:['artisan_bakery']});const o=Object.values(w.offers)[0];o.productId='artisan_bakery';o.quantity=1;const accepted=S.command(w,{type:'acceptOffer',offerId:o.id});assert.ok(accepted.ok);
 const j=Object.values(w.jobs).find(j=>j.kind==='assembly'),u=w.units[j.unitId],person=w.people[3];
 let out=P.labor(w,j,person,999,5);j.progress+=out.delta;out=P.labor(w,j,person,999,5);j.progress+=out.delta;
 assert.equal(u.process.phase,'machine');const index=u.process.index;for(let i=0;i<3;i++)P.tick(w,5);assert.equal(u.process.index,index,'wall clock cannot advance passive holds');
 for(let i=0;i<10;i++){advanceClock(w);P.tick(w,5);}assert.equal(u.process.index,2);
 out=P.labor(w,j,person,999,5);j.progress=Math.min(j.required,j.progress+out.delta);assert.equal(u.process.phase,'machine');assert.ok(w.plant.machines.oven.temperatureC<180);
 const loaded=Save.deserialize(Save.serialize(w));for(let i=0;i<30;i++){advanceClock(w);advanceClock(loaded);P.tick(w,5);P.tick(loaded,5);}assert.deepEqual(w,loaded);assert.equal(u.process.phase,'complete');assert.ok(w.plant.energyKwh>0);assert.deepEqual(S.audit(w),[]);
});
test('buyers reserve real funds; escrow payment and release preserve global cash without creating sales',()=>{
 const w=make('escrow'),buyer=w.externalWorld.living.firms.cp_health,before=buyer.cash,sales=w.finance.totals.sales;
 assert.ok(W.reserveCommercial(w,'escrow-test','firm',buyer.id,100000));assert.equal(buyer.cash,before-100000);assert.equal(w.finance.totals.sales,sales);assert.deepEqual(W.validate(w),[]);
 assert.ok(W.payCommercial(w,'escrow-test',30000));assert.ok(!W.payCommercial(w,'escrow-test',80000));W.closeCommercial(w,'escrow-test');assert.equal(buyer.cash,before-30000);assert.deepEqual(W.validate(w),[]);
 const n=w.externalWorld.living.nations.TH,treasury=n.treasury;assert.ok(W.reserveCommercial(w,'gov-test','government','TH',50000));assert.equal(n.treasury,treasury-50000);W.closeCommercial(w,'gov-test');assert.equal(n.treasury,treasury);assert.deepEqual(W.validate(w),[]);
});
test('large B2B contract is a bounded delivery schedule backed by buyer cash, not 1000 simultaneous units',()=>{
 const w=make('large-contract');S.command(w,{type:'directorEdit',action:'grantCash',amount:100000000});S.advance(w,13*1440+150);
 w.status='running';w.policies.autoAccept=true;for(const p of w.people){p.atWork=true;p.path=[];}
 w.metrics.ordersPaid=6;w.production.shipped.speaker=24;w.production.completed.speaker=24;
 S.evaluateCommercialSales(w);const c=Object.values(w.commerce.contracts).find(c=>c.kind==='b2b_supply');assert.ok(c);assert.equal(c.quantity,120);assert.equal(c.ordered,0);assert.equal(c.paidSatang,0);
 S.evaluateCommercialSales(w);assert.ok(c.ordered>0&&c.ordered<=80);assert.ok(Object.keys(w.units).length<120);assert.ok(w.externalWorld.living.commercialEscrows[c.id].balance<c.quantity*c.unitPrice);assert.deepEqual(S.commercialAudit(w),[]);assert.deepEqual(W.validate(w),[]);
});
test('plant and contract corruption are rejected without overwriting a running game',()=>{
 const w=make('badplant');w.plant.machines.test_rig.condition=-1;assert.ok(Save.validate(w).length>0);
 const x=make('badenergy');x.plant.energyKwh=-1;assert.ok(Save.validate(x).length>0);
});
test('government procurement requires documented quality, contract knowledge, reputation and budget',()=>{
 const w=make('public-procurement');S.command(w,{type:'directorEdit',action:'grantCash',amount:100000000});S.advance(w,13*1440+150);w.status='running';w.policies.autoAccept=true;w.reputation=80;
 for(const p of w.people){p.atWork=true;p.path=[];p.education.subjects.quality_documentation=60;p.education.subjects.contract_management=60;}
 w.metrics.ordersPaid=6;w.production.shipped.speaker=24;w.production.completed.speaker=24;
 const treasury=w.externalWorld.living.nations.TH.treasury;
 S.evaluateCommercialSales(w);const c=Object.values(w.commerce.contracts).find(c=>c.kind==='public_procurement');assert.ok(c);assert.equal(c.buyerType,'government');assert.equal(w.externalWorld.living.nations.TH.treasury,treasury-c.quantity*c.unitPrice);
 S.evaluateCommercialSales(w);const o=w.orders[c.currentOrderId];assert.equal(o.deposit,0);assert.equal(o.paymentMinutes,10080);assert.ok(o.quantity<c.quantity);assert.deepEqual(S.commercialAudit(w),[]);assert.deepEqual(W.validate(w),[]);
});
test('expensive equipment cannot be bought solely because there is cash and a speculative input demand',()=>{
 const w=make('speculative-fab');S.command(w,{type:'directorEdit',action:'grantCash',amount:1000000000});const cash=w.finance.cash;
 assert.equal(P.request(w,'semiconductor_fab',hooks(w)),false);assert.equal(w.finance.cash,cash);assert.ok(!w.plant.machines.semiconductor_fab);
});
test('warehouse sales ship existing units, settle escrow and return price adjustments without double income',()=>{
 const w=make('warehouse-fulfillment');S.command(w,{type:'directorEdit',action:'grantCash',amount:50000000});S.advance(w,120);for(const p of w.people)p.atWork=true;w.policies.autoAccept=true;S.planStockProduction(w);w.policies.autoAccept=false;
 S.advance(w,1440*4);const stock=S.productionView(w).find(x=>x.id==='speaker');assert.ok(stock.stock>=2);
 w.policies.autoAccept=true;for(const p of w.people)p.atWork=true;S.evaluateCommercialSales(w);const c=Object.values(w.commerce.contracts).find(c=>c.kind==='warehouse');assert.ok(c);
 const started=w.production.started.speaker;S.evaluateCommercialSales(w);const o=w.orders[c.currentOrderId];assert.ok(o);assert.equal(w.production.started.speaker,started);assert.equal(Object.values(w.units).filter(u=>u.orderId===o.id).length,o.quantity);
 S.advance(w,1440*12);assert.equal(w.orders[o.id].status,'paid');assert.equal(c.delivered,c.quantity);assert.equal(c.status,'completed');assert.equal(w.externalWorld.living.commercialEscrows[c.id].balance,0);assert.deepEqual(S.audit(w),[]);assert.deepEqual(Save.validate(w),[]);
});
