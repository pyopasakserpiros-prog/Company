# รับช่วง Company v2.6.0

ฐานc2609be ผู้ใช้สั่งทำการผลิต/คลัง/การขายต่อ และกำชับเครื่องมือธุรกิจ/บทบาทช่าง อ่านAGENTS→project status→PLANT_AND_COMMERCIAL_SYSTEM→รายงานv2.6.0→source/testsก่อนเริ่มทุกครั้ง

plant.jsเป็นโมดูลใหม่หลังworldก่อนsim ระบบเครื่องทำเองอยู่P.tick กำลังคนอยู่P.labor/P.maintain; simเป็นเจ้าของledger/knowledge/เวลา สัญญารวมอยู่w.commerce เงินกันอยู่externalWorld.living.commercialEscrows ห้ามรับรู้สัญญาทั้งก้อนเป็นsales ห้ามมอบเครื่องให้NPCฟรีเมื่อยังไม่มีทุน/ช่าง/วิชา

ส่วนที่ทำแล้วและขอบเขตอยู่ในstatus ไม่สั่งเริ่มแพตช์ใหม่โดยอัตโนมัติ ข้อเสนอสำคัญ: timedbatchสำหรับสูตรแปรรูป40สูตร (ตอนนี้ยังbatch APIทันทีหลังgateเครื่อง), รถส่งเครื่อง/ช่างรับเหมา, อะไหล่เฉพาะเครื่อง, ระบบประมูลแข่งขันและหลักประกัน, การยุติ/ปรับโครงสร้างสัญญาที่ส่งไม่ไหว สิ่งเหล่านี้ยังไม่มี ต้องเสนอภายใต้คำสั่งผู้ใช้ก่อนอ้างว่าสำเร็จ

พรอมต์พร้อมใช้: ตรวจsourceและรายงานล่าสุดด้วยตนเอง คิดสร้างสรรค์ต่อจากเป้าหมายผู้เล่นที่ชอบสังเกตNPC อย่าเพิ่มแค่ชื่อ/ตัวเลขโดยไม่มีผล บันทึกสิ่งแก้ทุกครั้ง อัปเดตstatus/docs/skillsและตรวจZIPฉบับสุดท้ายรวมsource/hidden skillsก่อนส่ง ไม่แก้AGENTSหรือHuman Coreโดยไม่ได้รับอนุญาต

คำสั่งตรวจในCOMPANY_SOURCE: npm test, npm run check, npm run build, npm run test:browser, node tools/benchmark.cjs อ่านtest/plant-and-commercial.test.cjsและcampus-browserก่อนเปลี่ยนสัญญา
