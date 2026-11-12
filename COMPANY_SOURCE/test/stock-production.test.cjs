const test=require('node:test'),assert=require('node:assert/strict'),S=require('../js/sim'),Save=require('../js/save');
test('stock batch uses capital and physical stock without customer deposits, and preserves save audit',()=>{
 const w=S.create('stock',{autonomous:false});S.command(w,{type:'directorEdit',action:'grantCash',amount:50000000});S.advance(w,120);for(const p of w.people)p.atWork=true;w.policies.autoAccept=true;
 const sales=w.finance.totals.sales;S.planStockProduction(w);assert.ok(Object.values(w.orders).some(o=>o.stockBatch));assert.equal(w.finance.totals.sales,sales);assert.deepEqual(Save.validate(w),[]);
 S.advance(w,1440*3);assert.deepEqual(S.audit(w),[]);assert.deepEqual(Save.validate(w),[]);assert.deepEqual(Save.deserialize(Save.serialize(w)),w);
});
