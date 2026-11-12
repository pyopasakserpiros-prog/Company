# Presentation API — Company Campus

CompanyAPI.create(seed, { autonomous: true }) สร้างเกมที่เปิดระบบอัตโนมัติ snapshot() และ subscribe() ส่งสำเนา frozen; UI ไม่แก้ world หรือเรียก RNG จำลอง การวาด Canvas ใช้ข้อมูลจาก snapshot และเวลาวาดแยกจากเวลา simulation

snapshot.people มี id, role, roleName, profile, state, affect, skills, activity, position, path, buildingId, isIndoors และ visual. profile มาจากแกนมนุษย์ที่ล็อก การแก้ตัวละครเฉพาะรายผ่าน directorEdit สร้าง profile ที่ตรวจและ freeze ใหม่

snapshot.campus.buildings แสดงอาคาร ระดับ 1–3 ตำแหน่ง ผู้ใช้งานและสถานะงาน; campus.facilityDecision แสดงการประเมินล่าสุดของ CEO และ campus.trainingMinutes คือเวลาฝึกที่ศูนย์ฝึกจริง. gate เป็นทางเข้า ไม่อัปเกรด

Simulation จัดการ CEO ลงทุนอาคารจากเงินสำรองและภาระงาน ต้นทุนบันทึกใน ledger ประเภท equipment. ระดับโรงงาน/คลัง/HQ/วิจัยส่งผลต่อความเร็วงาน ระดับโรงอาหาร/สวนส่งผลต่อการพัก ระดับศูนย์ฝึกส่งผลต่อการฝึกที่สถานีฝึก

UI แสดงข้อมูลและส่งคำสั่ง Edit Hub สำหรับเสกวัตถุดิบ แก้ชื่อ นิสัย ค่านิยม ฟื้นฟู หรือฝึกทักษะตัวละคร; ปุ่มควบคุมเวลา/กล้องเป็นการดู simulation ไม่มีปุ่มให้ผู้เล่นอนุมัติออเดอร์หรือสั่ง CEO ลงทุน

layout เป็นกริดการเดินและสถานีที่ simulation ใช้จริง ส่วนภาพอาคารและประตูสร้างจากข้อมูล presentation: ยังไม่ใช่ระบบจำลองภายในอาคารหรือระบบชนผนังเต็มรูปแบบ อย่าอ้างว่ารองรับสิ่งเหล่านี้แล้ว

## Learned knowledge / company inspection

`companyKnowledge` exposes subjects, subjectSpecs, tiers, people with subjectInsights, projects, operationReadiness, serviceReadiness and per-product coverage/reasons. `people[].education` is personal learned state; `catalog.products[].readiness` is current operational eligibility. `research.points` is a legacy statistic, never a substitute for readiness.

Commands: `beginKnowledgeProject {targetId, kind:"product"|"material"}`, `acquireTechnologyLicense {targetId,kind}`, and sandbox `directorEdit {action:"setSubject",personId,subjectId,level:0..100}`. UI remains observational for normal operations. Read [system contract](LEARNED_KNOWLEDGE_SYSTEM.md) and [subject authoring template](templates/KNOWLEDGE_SUBJECT_TEMPLATE.md).

## Living world v2.4.0

Snapshot `externalWorld.living` includes nations, firms, relations, shipments, markets, journal, history and playerNetSatang. These are frozen cloned state, never mutate them from UI. `World.ensure/step/apply/validate` own the simulation contract; `S.worldAudit(w)` is public diagnostics. `buyMaterials` can return `worldSupplyUnavailable` without charging. `sellMaterialB2B` can return `buyerCannotPay`. Read [world system](LIVING_WORLD_SYSTEM.md) for units, cash/material equations and boundaries. World screen `renderWorldSheet` observes six categories and preserves selected entity IDs while refreshing.
