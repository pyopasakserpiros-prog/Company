'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../js/sim'),W=require('../js/world'),Save=require('../js/save'),API=require('../js/api');
function fresh(seed='living-world'){return S.create(seed,{autonomous:false});}
function step(w,d){W.step(w,d);S.recomputeGeopoliticalMultipliers(w);assert.deepEqual(W.validate(w),[]);}
test('world accounts balance through 180 days, finite input/output histories, and save continuation',()=>{
 const w=fresh();for(let d=1;d<=180;d++)step(w,d);
 assert.equal(Object.keys(w.externalWorld.living.nations).length,12);
 assert.equal(Object.keys(w.externalWorld.living.firms).length,28);
 assert.ok(w.externalWorld.living.history.length<=60);assert.ok(w.externalWorld.living.journal.length<=160);
 const loaded=Save.deserialize(Save.serialize(w));assert.deepEqual(loaded,w);
 for(let d=181;d<=200;d++){step(w,d);step(loaded,d);}assert.deepEqual(loaded,w);
});
test('same seed yields identical world; repeat day and snapshot reads cannot move money or time',()=>{
 const a=fresh(),b=fresh();for(let d=1;d<=15;d++){step(a,d);step(b,d);}assert.deepEqual(a,b);
 const before=JSON.stringify(a);W.step(a,15);assert.equal(JSON.stringify(a),before);
 const app=API.create('world-snapshot');const saved=app.save();for(let i=0;i<5;i++)app.snapshot();assert.equal(app.save(),saved);
});
test('no capital suspends a company and no inventory prevents recipe output',()=>{
 const w=fresh(),m=w.externalWorld.living,f=m.firms.siam_metal;
 f.cash=0;f.openingCash=0;f.payments=0;step(w,1);assert.equal(f.status,'suspended');assert.equal(f.output,0);
 const x=fresh('no-input'),g=x.externalWorld.living.firms.shenzhen_semi;
 x.externalWorld.corporations[g.id].sellsMaterials=['microchip'];g.technology=95;
 for(const [k,q]of Object.entries(g.stock)){g.stock[k]=0;g.flow[k].used+=q;}
 step(x,1);assert.equal(g.output,0);assert.ok(g.missing.length>0);
});
test('bilateral trade transfers cash, debits seller stock, keeps paid goods in transit then delivers',()=>{
 const w=fresh(),m=w.externalWorld.living;step(w,1);assert.ok(m.shipments.length>0);
 const shipment={...m.shipments[0]},f=m.firms[shipment.buyerId],before=f.flow[shipment.materialId].bought;
 assert.ok(shipment.dueDay>1);assert.ok(shipment.cost>0);
 for(let d=2;d<=shipment.dueDay;d++)step(w,d);
 assert.ok(f.flow[shipment.materialId].bought>=before+shipment.quantity);
 assert.ok(!m.shipments.find(s=>s.id===shipment.id));
});
test('inflation, unemployment and treasury drive distinct policy choices, leaders wait for terms',()=>{
 const w=fresh(),m=w.externalWorld.living;m.nations.US.inflation=12;m.nations.JP.unemployment=14;
 step(w,14);assert.equal(m.nations.US.policy,'tightening');assert.equal(m.nations.JP.policy,'stimulus');
 assert.equal(m.nations.US.term,0);assert.equal(w.externalWorld.geopolitics.nations.US.regimeChangeCount,0);
 const n=m.nations.US;n.nextElectionDay=15;n.approval=10;step(w,15);assert.equal(n.term,1);assert.equal(w.externalWorld.geopolitics.nations.US.regimeChangeCount,1);
});
test('conflict originates in bilateral state and changes routes; treaty has a smaller tariff',()=>{
 const w=fresh(),m=w.externalWorld.living,r=m.relations.find(r=>r.a==='TH'&&r.b==='CN'||r.a==='CN'&&r.b==='TH');
 r.tension=99;r.trust=5;r.reviewDay=1;step(w,1);assert.equal(r.status,'war');
 const war=W.route(m,'CN','TH');assert.ok(war.days>5);assert.ok(war.tariff>=22);
 r.status='treaty';r.tension=10;const treaty=W.route(m,'CN','TH');assert.ok(treaty.tariff<war.tariff);assert.ok(treaty.days<war.days);
});
test('scarcity prices have causal supply/demand evidence and policy effects never compound on repeated recompute',()=>{
 const w=fresh();step(w,1);const k=w.externalWorld.living.markets.microchip;
 assert.ok(k.reasonTh.includes('หน่วย'));const price=w.externalWorld.geopolitics.materialSpotPrices.microchip;
 S.recomputeGeopoliticalMultipliers(w);assert.equal(w.externalWorld.geopolitics.materialSpotPrices.microchip,price);
});
test('player procurement consumes finite external stock; exhaustion rejects without charging',()=>{
 const w=fresh(),m=w.externalWorld.living,k='pcb',before=m.firms.world_exchange.stock[k];
 const r=S.command(w,{type:'buyMaterials',materialId:k,quantity:200});assert.equal(r.ok,true);
 assert.equal(m.firms.world_exchange.stock[k],before-200);assert.deepEqual(S.audit(w),[]);
 for(const f of Object.values(m.firms))if(f.stock[k]){f.flow[k].used+=f.stock[k];f.stock[k]=0;}
 const cash=w.finance.cash;const rejected=S.command(w,{type:'buyMaterials',materialId:k,quantity:1});assert.equal(rejected.ok,false);assert.equal(w.finance.cash,cash);
});
test('B2B buyer must have money and gets physical material; failed buyer changes no stock',()=>{
 const w=fresh(),f=w.externalWorld.living.firms.green_power;
 S.command(w,{type:'directorEdit',action:'grantMaterial',materialId:'cathode_electrolyte',quantity:4});
 const stock=f.stock.cathode_electrolyte||0,cash=f.cash;
 const r=S.command(w,{type:'sellMaterialB2B',materialId:'cathode_electrolyte',quantity:2,buyerCorpId:'green_power'});assert.equal(r.ok,true);assert.equal(f.stock.cathode_electrolyte,stock+2);assert.equal(f.cash,cash-r.revenueSatang);assert.deepEqual(S.audit(w),[]);
 f.payments+=f.cash;f.cash=0;const before=w.inventory.materials.cathode_electrolyte;
 assert.equal(S.command(w,{type:'sellMaterialB2B',materialId:'cathode_electrolyte',quantity:1,buyerCorpId:'green_power'}).ok,false);assert.equal(w.inventory.materials.cathode_electrolyte,before);
});
test('agriculture consumes seeds water and fertilizer, waits for growth, and produces replacement seed',()=>{
 const w=fresh(),m=w.externalWorld.living,f=m.firms.thai_organic;
 const crop=require('../js/data').AGRICULTURE_CROPS.jasmine_rice;
 w.externalWorld.corporations[f.id].sellsMaterials=['paddy_grain'];
 f.stock.paddy_grain=0;f.flow.paddy_grain={opening:0,produced:0,bought:0,used:0,sold:0};
 const seed=f.stock[crop.seedMaterialId],water=f.stock.raw_water_m3;step(w,1);
 assert.ok(f.crops.paddy_grain);assert.equal(f.flow.paddy_grain.produced,0);assert.ok(f.stock[crop.seedMaterialId]<seed);assert.ok(f.stock.raw_water_m3<water);
 step(w,2);step(w,3);assert.ok(f.flow.paddy_grain.produced>0);assert.ok(f.flow[crop.seedMaterialId].produced>0);
});
test('malformed external balances, references and market prices are rejected by save validation',()=>{
 for(const mutate of [w=>w.externalWorld.living.firms.siam_metal.cash=-1,w=>w.externalWorld.living.markets.pcb.price=-1,w=>w.externalWorld.living.relations[0].a='missing',w=>w.externalWorld.living.firms.siam_metal.capacity=NaN]){
  const w=fresh();mutate(w);assert.ok(Save.validate(w).length>0);
 }
});
test('multi-seed full company simulation reconciles player and world ledgers after 35 days',()=>{
 for(const seed of ['world-a','world-b','world-c']){const w=S.create(seed,{autonomous:true});for(let d=1;d<=35;d++){S.advance(w,1440);assert.deepEqual(S.audit(w),[]);assert.deepEqual(Save.validate(w),[]);}}
});
test('manual crisis has bilateral effects and expires; commodity production shock affects its actual country',()=>{
 const w=fresh(),m=w.externalWorld.living;
 S.command(w,{type:'triggerGeopoliticalEvent',eventId:'superpower_chip_embargo'});
 const r=m.relations.find(r=>r.a==='US'&&r.b==='CN'||r.a==='CN'&&r.b==='US');assert.equal(r.status,'sanctions');
 const until=r.scenarioUntil;for(let d=1;d<=until;d++)step(w,d);assert.equal(r.scenarioUntil,0);
 S.command(w,{type:'triggerGeopoliticalEvent',eventId:'australia_pilbara_cyclone_iron_shock'});assert.ok(m.shocks.find(s=>s.nations.includes('AU')&&s.outputMultiplier<1));
});
test('limited raw reserves deplete; recipe outputs and byproducts follow catalog quantities',()=>{
 const w=fresh(),m=w.externalWorld.living,f=m.firms.regional_US;
 f.reserves.silica_bauxite_ore=1;step(w,1);assert.equal(f.reserves.silica_bauxite_ore,0);assert.equal(f.flow.silica_bauxite_ore.produced,1);
 const x=fresh('recipe-yields'),g=x.externalWorld.living.firms.shenzhen_semi;x.externalWorld.corporations[g.id].sellsMaterials=['pcb'];g.technology=95;
 step(x,1);assert.equal(g.flow.pcb.produced,g.flow.copper_coil.used*2);assert.ok(g.flow.pcb.produced>0);
});
