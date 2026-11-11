'use strict';
const fs=require('node:fs'),path=require('node:path');
const S=require('../js/sim'),D=require('../js/data'),API=require('../js/api');
const w=S.create('curriculum-doc'),v=API.create('curriculum-labels').snapshot();
const labels=Object.fromEntries(v.catalog.dimensions.aptitudes.map(a=>[a.id,a.nameTh]));
const usage={},add=(req,label)=>{for(const id of Object.keys(req)) (usage[id] ||= []).push(label);};
const services=S.companyKnowledgeView(w).serviceReadiness;
for(const p of Object.values(w.catalog.products)) add(S.productRequirements(w,p.id),p.nameTh);
for(const r of Object.values(D.MATERIAL_RECIPES)) add(S.materialRequirements(w,r.id),r.nameTh);
for(const service of services) add(Object.fromEntries(service.coverage.map(c=>[c.id,c.level])),service.nameTh);
for(const [id,req] of Object.entries(S.OPERATIONS_SUBJECTS)) add(req,({software:'พัฒนาซอฟต์แวร์',freight:'รับงานขนส่ง',agriculture:'เพาะปลูก',harvest:'เก็บเกี่ยว',livestock:'ดูแลปศุสัตว์'})[id]);
for(const [id,pre] of Object.entries(S.SUBJECT_PREREQUISITES)) (usage[pre] ||= []).push(`พื้นฐานของ ${S.SUBJECTS[id]}`);
let text=`# ทะเบียนวิชาและความรู้ที่ธุรกิจใช้\n\nสร้างจาก source v${S.RELEASE_VERSION} มี ${Object.keys(S.SUBJECTS).length} วิชา ทุกวิชาเรียนได้และเป็นความรู้ส่วนบุคคล แม้ยังไม่มีงานที่ใช้ในบริษัท ไม่มีสถานะล็อกตามธุรกิจ\n\n[แหล่งค้นคว้า](research/KNOWLEDGE_CURRICULUM_SOURCES.md) · [คู่มือระบบ](LEARNED_KNOWLEDGE_SYSTEM.md) · [เทมเพลตเพิ่มวิชา](templates/KNOWLEDGE_SUBJECT_TEMPLATE.md)\n\nอัปเดตทะเบียนด้วย node COMPANY_SOURCE/tools/knowledge-catalog.cjs น้ำหนักเป็นสูตรเกม ไม่ใช่ค่าน้ำหนักที่แหล่งหลักสูตรรับรอง\n\n`;
// Keep this generated reference deterministic; it never writes simulation state.
text+='| ID / วิชา | หมวด / วิชาก่อนหน้า | องค์ประกอบความถนัด | ตัวอย่างการใช้ในเกม |\n|---|---|---|---|\n';
for(const id of Object.keys(S.SUBJECTS)) {
 const s=S.subjectSpec(id);
 text+=`| ${id} — ${s.nameTh} | ${s.category}${s.prerequisite ? ` / ${S.SUBJECTS[s.prerequisite]} ${s.prerequisiteLevel}` : ''} | ${Object.entries(s.aptitudes).map(([a,n])=>`${labels[a] || a} ${Math.round(n*100)}%`).join(', ')} | ${(usage[id] || []).slice(0,2).join('; ') || 'ยังไม่มีงานบริษัทที่ผูกโดยตรง; ยังมีและเรียนรู้ได้'} |\n`;
}
const reqText=req=>Object.entries(req).map(([id,n])=>`${S.SUBJECTS[id]} ${n}`).join(' • ');
text+='\n## สินค้า\n\nยังต้องมีกระบวนการเฉพาะสินค้าที่ผ่านรับรองและความพร้อมด้านอื่น ไม่ใช่มีวิชาครบแล้วได้สินค้าฟรี\n\n| สินค้า | วิชาที่ต้องใช้ร่วม |\n|---|---|\n';
for(const p of Object.values(w.catalog.products)) text+=`| ${p.nameTh} | ${reqText(S.productRequirements(w,p.id))} |\n`;
text+='\n## กระบวนการวัตถุดิบ\n\n| ผลผลิต | วิชาที่ต้องใช้ร่วม |\n|---|---|\n';
for(const r of Object.values(D.MATERIAL_RECIPES)) text+=`| ${w.catalog.materials[r.id].nameTh} | ${reqText(S.materialRequirements(w,r.id))} |\n`;
text+='\n## ธุรกิจบริการ\n\n| บริการ | วิชาที่ต้องใช้ร่วม |\n|---|---|\n';
for(const s of services) text+=`| ${s.nameTh} | ${s.coverage.map(r=>`${r.nameTh} ${r.level}`).join(' • ')} |\n`;
text+='\n## งานอื่น\n\n| งาน | วิชาที่ต้องใช้ร่วม |\n|---|---|\n';
for(const [id,req] of Object.entries(S.OPERATIONS_SUBJECTS)) text+=`| ${id} | ${reqText(req)} |\n`;
const target=path.resolve(__dirname,'../../docs/company/KNOWLEDGE_SUBJECT_CATALOG.md');
fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);
console.log(`Updated ${Object.keys(S.SUBJECTS).length} subjects and business requirements: ${target}`);
