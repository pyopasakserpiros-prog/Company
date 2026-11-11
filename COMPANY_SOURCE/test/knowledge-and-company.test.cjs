'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../js/sim'),D=require('../js/data'),H=require('../js/human-core'),Save=require('../js/save'),API=require('../js/api');
const prepare=require('./knowledge-fixtures.cjs');
const grant=(w)=>S.command(w,{type:'directorEdit',action:'grantCash',amount:50000000});

test('170 learned subjects have valid weighted human aptitudes, acyclic prerequisites, business coverage and no core changes',()=>{
 const w=S.create('subjects'),v=S.companyKnowledgeView(w);
 assert.equal(Object.keys(S.SUBJECTS).length,170);
 for(const id of Object.keys(S.SUBJECTS)) {
  const spec=S.subjectSpec(id);assert.ok(spec.effectTh&&spec.category);
  assert.ok(Math.abs(Object.values(spec.aptitudes).reduce((a,b)=>a+b,0)-1)<1e-9);
  for(const axis of Object.keys(spec.aptitudes)) assert.ok(Object.hasOwn(w.people[0].profile.aptitudes,axis),axis);
  const seen=new Set();let at=id;
  while(S.SUBJECT_PREREQUISITES[at]) {assert.ok(!seen.has(at));seen.add(at);at=S.SUBJECT_PREREQUISITES[at];assert.ok(S.SUBJECTS[at]);}
 }
 for(const p of v.products) assert.ok(p.coverage.length>=3&&p.coverage.every(c=>c.nameTh));
 assert.equal(v.serviceReadiness.length,Object.keys(D.INDUSTRIAL_SERVICES).length);
 for(const s of v.serviceReadiness) assert.ok(s.coverage.length>=3&&s.coverage.length<=5);
 assert.equal(H.VERSION,'1.0.0');
});

test('cash and 5000 pooled research points cannot unlock industries, processes or software',()=>{
 const w=S.create('no-global-unlock');grant(w);
 S.command(w,{type:'directorEdit',action:'grantResearch',points:5000});
 assert.deepEqual(w.research.unlocked,['speaker']);
 assert.equal(S.productReadiness(w,'medical_saline_iv').ready,false);
 assert.equal(S.materialReady(w,'microchip'),false);
 assert.equal(S.startSoftwareProject(w).code,'missingSubject');
 assert.equal(S.startServiceOrder(w,'toll_smelting_extrusion').code,'missingSubject');
 assert.deepEqual(S.audit(w),[]);assert.deepEqual(Save.validate(w),[]);
});

test('different people cover required subjects; knowledge is lost operationally when the sole specialist leaves',()=>{
 const w=S.create('team-coverage');grant(w);
 prepare(w,{products:['artisan_bakery'],subjects:[]});
 const req=S.productRequirements(w,'artisan_bakery');
 for(const p of w.people) for(const id of Object.keys(req)) delete p.education.subjects[id];
 let i=0;for(const [id,n] of Object.entries(req)) w.people[i++%w.people.length].education.subjects[id]=n;
 assert.equal(S.productReadiness(w,'artisan_bakery').ready,true);
 const specialist=w.people.find(p=>p.education.subjects.bakery);
 specialist.employed=false;
 assert.equal(S.productReadiness(w,'artisan_bakery').ready,false);
 assert.equal(w.knowledge.projects['product:artisan_bakery'].status,'qualified');
});

test('real research requires hours, elapsed days, sample inputs, cash and independent QA; saves preserve the project',()=>{
 const w=S.create('project-proof');grant(w);
 assert.equal(S.beginKnowledgeProject(w,'braided_fast_charge_kit').ok,true);
 const project=w.knowledge.projects['product:braided_fast_charge_kit'];
 const expert=w.people.find(p=>p.role==='engineer'),qa=w.people.find(p=>p.role==='inspector');
 for(const [id,n] of Object.entries(project.requirements)) expert.education.subjects[id]=n+10;
 const before=w.finance.cash;let count=0;
 // Same-day repeated completions cannot exceed 8 hours.
 for(let i=0;i<20;i++) S.knowledgeWork(w,expert,{id:'proof-'+count++,knowledgeProjectId:project.id,researchSubject:S.researchDisciplines(project).find(id=>(project.disciplineMinutes?.[id] || 0)<project.requiredMinutes/S.researchDisciplines(project).length),elapsedMinutes:120});
 assert.equal(project.workMinutes,480);assert.ok(w.finance.cash<before);
 assert.notEqual(project.status,'qualified');
 // No input sample means progress stops at prototype, rather than inventing materials.
 for(let d=2;d<25;d++) {w.clock.absoluteMinute=d*1440;for(let i=0;i<4;i++) S.knowledgeWork(w,expert,{id:'proof-'+count++,knowledgeProjectId:project.id,researchSubject:S.researchDisciplines(project).find(id=>(project.disciplineMinutes?.[id] || 0)<project.requiredMinutes/S.researchDisciplines(project).length),elapsedMinutes:120});}
 assert.ok(project.workMinutes<project.requiredMinutes);assert.equal(project.prototypeConsumed,undefined);
 for(const [id,q] of Object.entries(w.catalog.products[project.targetId].bom)) S.command(w,{type:'directorEdit',action:'grantMaterial',materialId:id,quantity:q*20});
 for(let d=25;d<90&&project.status!=='qualified';d++) {
  w.clock.absoluteMinute=d*1440;
  for(let i=0;i<4;i++) S.knowledgeWork(w,expert,{id:'proof-'+count++,knowledgeProjectId:project.id,researchSubject:S.researchDisciplines(project).find(id=>(project.disciplineMinutes?.[id] || 0)<project.requiredMinutes/S.researchDisciplines(project).length),elapsedMinutes:120});
  if(project.workMinutes>=project.requiredMinutes) for(let i=0;i<2;i++) S.knowledgeWork(w,qa,{id:'qa-'+count++,validationProjectId:project.id,elapsedMinutes:120});
 }
 assert.equal(project.status,'qualified');assert.ok(project.qaMinutes>=240);assert.ok(!project.contributors[qa.id]);
 assert.ok(Object.values(w.knowledge.materialsConsumed).some(n=>n>0));
 w.clock.tick=(w.clock.absoluteMinute-540)/5;w.lastSettledDay=Math.floor(w.clock.absoluteMinute/1440);
 assert.deepEqual(S.audit(w),[]);assert.deepEqual(Save.validate(w),[]);
 w.clock.tick=(w.clock.absoluteMinute-540)/5;w.lastSettledDay=Math.floor(w.clock.absoluteMinute/1440);
 const reloaded=Save.deserialize(Save.serialize(w));assert.deepEqual(reloaded.knowledge,w.knowledge);
 assert.equal(S.productReadiness(reloaded,project.targetId).ready,true);
});

test('aptitude components, fatigue and applied experience change learning and work without instant genius',()=>{
 const w=S.create('learning');const low=structuredClone(w.people[0]),high=structuredClone(w.people[0]);
 for(const p of [low,high]) {p.education.subjects.mathematics=25;p.education.subjects.accounting=40;}
 for(const axis of Object.keys(S.subjectSpec('mathematics').aptitudes)) {low.profile.aptitudes[axis]=20;high.profile.aptitudes[axis]=95;}
 low.profile.aptitudes.learningSpeed=20;high.profile.aptitudes.learningSpeed=95;
 S.learnSubject(low,'mathematics',480,true);S.learnSubject(high,'mathematics',480,true);
 assert.ok(high.education.subjects.mathematics>low.education.subjects.mathematics);assert.ok(high.education.subjects.mathematics<40);
 const rested=S.subjectPerformance(high,'mathematics');high.state.energy=5;high.state.stress=95;
 assert.ok(S.subjectPerformance(high,'mathematics')<rested);
 high.education.subjects.mathematics=79.99;S.learnSubject(high,'mathematics',48000,true);assert.equal(high.education.subjects.mathematics,80);
 high.education.subjects.advanced_math=0;S.learnSubject(high,'advanced_math',480,true);assert.equal(high.education.subjects.advanced_math,0);
});

test('legacy point-unlocked saves archive claims, preserve existing contracts and reject malformed learned state',()=>{
 const old=S.create('legacy-subjects');old.research.points=5000;old.research.unlocked=Object.keys(old.catalog.products);delete old.knowledge;
 for(const p of old.people) delete p.education;
 const w=Save.deserialize(JSON.stringify(old));assert.equal(w.research.unlocked.length,1);assert.equal(w.knowledge.historicalBlueprints.length,42);
 assert.deepEqual(S.audit(w),[]);assert.deepEqual(Save.validate(w),[]);
 const bad=JSON.parse(Save.serialize(w));bad.people[0].education.subjects.mathematics=-1;
 assert.throws(()=>Save.deserialize(JSON.stringify(bad)),/invalid learned subjects/);
 const p=w.people[0],peer=w.people[1];const peerBefore=JSON.stringify(peer.education);
 assert.equal(S.command(w,{type:'directorEdit',action:'setSubject',personId:p.id,subjectId:'mathematics',level:95}).ok,true);
 assert.equal(JSON.stringify(peer.education),peerBefore);
});

test('nine-day autonomous worlds do not unlock every field; save/load continuation remains deterministic',()=>{
 for(const seed of ['limited-a','limited-b','limited-c']) {
  const w=S.create(seed,{autonomous:true});grant(w);S.advance(w,1440*9);
  assert.ok(w.research.unlocked.length<5);assert.deepEqual(S.audit(w),[]);assert.deepEqual(Save.validate(w),[]);
  const loaded=Save.deserialize(Save.serialize(w));S.advance(w,120);S.advance(loaded,120);
  assert.equal(Save.serialize(w),Save.serialize(loaded));
 }
 const v=API.create('observability').snapshot();assert.equal(v.companyKnowledge.subjectSpecs.length,170);assert.ok(v.companyKnowledge.products[0].coverage.length);
});

test('buying expensive technology is a target-specific transfer project, not instant knowledge',()=>{
 const w=S.create('paid-technology');
 const poor=S.acquireTechnologyLicense(w,'solid_state_powerwall');assert.equal(poor.ok,false);assert.equal(poor.code,'insufficientLicenseCapital');
 grant(w);const before=w.finance.cash;
 const result=S.acquireTechnologyLicense(w,'solid_state_powerwall');assert.equal(result.ok,true);
 const p=w.knowledge.projects[result.projectId];
 assert.equal(w.finance.cash,before-result.costSatang);assert.ok(result.costSatang>0);
 assert.equal(p.route,'licensed_transfer');assert.ok(p.minDays>=10);
 assert.equal(S.productReadiness(w,'solid_state_powerwall').ready,false);
 assert.ok(!w.research.unlocked.includes('solid_state_powerwall'));
 assert.equal(S.acquireTechnologyLicense(w,'lamp').code,'researchCapacityFull');
 assert.deepEqual(S.audit(w),[]);assert.deepEqual(Save.validate(w),[]);
});

test('farming and office work require transferable learned subjects, including basic processes',()=>{
 const w=S.create('operation-gates');
 assert.equal(S.operationReadiness(w,'agriculture').ready,false);
 assert.equal(S.plantCropPlot(w,'unknown').code,'missingAgricultureSubjects');
 assert.equal(S.materialReady(w,'nitrogen_ammonia'),false);
 prepare(w,{subjects:['agriculture','chemical_processing']});
 assert.equal(S.operationReadiness(w,'agriculture').ready,true);
 assert.equal(S.operationReadiness(w,'harvest').ready,true);
 assert.equal(S.materialReady(w,'nitrogen_ammonia'),true);
 assert.ok(S.companyKnowledgeView(w).operationReadiness.find(o=>o.id==='freight'));
});

test('a subject unused by the company remains learnable, belongs to the person and can be studied after work',()=>{
 const w=S.create('personal-learning'),p=w.people[0];
 S.command(w,{type:'directorEdit',action:'grantPersonWallet',personId:p.id,amount:100000});
 p.education.interests=['household_budgeting'];p.education.subjects.household_budgeting=5;
 const before=p.education.subjects.household_budgeting,cash=w.finance.cash,wallet=p.pay.wallet;
 let studied=false;
 for(let d=0;d<10&&!studied;d++) {w.clock.absoluteMinute=d*1440+1200;studied=S.personalStudyTick(w,p);}
 assert.equal(studied,true);assert.ok(p.education.subjects.household_budgeting>before);
 assert.equal(w.finance.cash,cash);assert.ok(p.pay.wallet<wallet);
 assert.equal(p.pay.wallet+p.pay.outsideSpending,p.pay.totalPaid);
 assert.equal(S.companyKnowledgeView(w).products.some(r=>Object.hasOwn(r.requirements,'household_budgeting')),false);
});

test('learned proficiency changes real assembly time for the same worker and locked human profile',()=>{
 const results=[];
 for(const level of [30,85]) {
  const w=S.create('work-level-proof'),p=w.people.find(p=>p.role==='assembler');
  p.education.subjects.embedded_iot=level;
  for(const q of w.people) if(q.id!==p.id&&q.role==='assembler') q.employed=false;
  assert.equal(S.command(w,{type:'acceptOffer',offerId:Object.keys(w.offers)[0]}).ok,true);
  S.advance(w,400);
  const task=w.history.tasks.find(t=>t.kind==='assembly'&&t.personId===p.id);assert.ok(task);
  results.push({at:task.at,profile:JSON.stringify(p.profile)});assert.deepEqual(S.audit(w),[]);
 }
 assert.equal(results[0].profile,results[1].profile);assert.ok(results[1].at<results[0].at);
});

test('actual geopolitical sector demand changes which industry the board chooses to study',()=>{
 for(const industry of ['food','tech']) {
  const w=S.create('market-research',{autonomous:true});grant(w);prepare(w,{subjects:Object.keys(S.SUBJECTS)});
  const ceo=w.people.find(p=>p.role==='coordinator');ceo.profile=structuredClone(ceo.profile);ceo.profile.personality.riskTaking=50;
  w.clock.absoluteMinute=9*1440+640;w.externalWorld.assetPortfolio.supplyChainStrategy='asset_light';
  for(const key of Object.keys(w.externalWorld.geopolitics.sectorDemandMultipliers)) w.externalWorld.geopolitics.sectorDemandMultipliers[key]=.8;
  w.externalWorld.geopolitics.sectorDemandMultipliers[industry==='tech' ? 'electronics' : industry]=1.6;
  S.reviewKnowledge(w);const project=Object.values(w.knowledge.projects)[0];assert.ok(project);
  const chosen=w.catalog.products[project.targetId].industry;assert.equal(chosen==='tech' ? 'electronics' : chosen,industry==='tech' ? 'electronics' : industry);
 }
});
