// Established-company fixture for tests of manufacturing/accounting, not tests of entry gates.
// These workers and audited processes existed before day one of the scenario.
const S=require('../js/sim');
module.exports=function prepare(w,{products=[],materials=[],subjects=[]}={}) {
  S.ensureKnowledge(w);
  const definitions=S.companyKnowledgeView(w).subjects;
  const teach=(req)=>{for(const p of w.people) for(const id of Object.keys(req)) p.education.subjects[id]=80;};
  teach(Object.fromEntries(subjects.map(id=>[id,80])));
  for(const service of S.companyKnowledgeView(w).serviceReadiness) if(subjects.includes(service.coverage[0]?.id)) teach(Object.fromEntries(service.coverage.map(r=>[r.id,r.level])));
  for(const req of Object.values(S.OPERATIONS_SUBJECTS)) if(subjects.includes(Object.keys(req)[0])) teach(req);
  for(const [kind,ids] of [['product',products],['material',materials]]) for(const id of ids) {
    const req=kind==="product" ? S.productRequirements(w,id) : S.materialRequirements(w,id); teach(req);
    const subject=kind==='product' ? S.productReadiness(w,id).subject : Object.keys(req)[0];
    w.knowledge.projects[`${kind}:${id}`]={id:`${kind}:${id}`,targetId:id,kind,subject,requirements:req,nameTh:id,status:'qualified',requiredLevel:40,startedDay:-30,minDays:21,qualifiedDay:1,requiredMinutes:6000,workMinutes:6000,spentSatang:0,qaMinutes:240,prototypeConsumed:true,contributors:{historicalExpert:6000},reviewerId:'historicalReviewer',lastReasonTh:'Established process fixture'};
    if(kind==='product'&&!w.research.unlocked.includes(id)) w.research.unlocked.push(id);
  }
};
