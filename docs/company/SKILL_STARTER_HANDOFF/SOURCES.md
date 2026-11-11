# แหล่งสกิลและเอกสารที่ใช้เสนอชุดตั้งต้น

ตรวจ URL จริงวันที่ 11 พฤศจิกายน 2026 ทั้ง 8 แหล่งตอบ HTTP 200 ดู source-checks.json การเปิด URL สำเร็จไม่เท่ากับรับรองว่าสกิลถูกทดสอบกับ Company แล้ว

## สกิลสาธารณะที่พบจริง

1. **Anthropic — skill-creator**: https://github.com/anthropics/skills/tree/main/skills/skill-creator
   - ไฟล์ที่อ่าน: https://raw.githubusercontent.com/anthropics/skills/main/skills/skill-creator/SKILL.md
   - ใช้เป็นแนวทางยกระดับร่าง วัดว่าเอเจนต์เลือกใช้ถูกสถานการณ์ ทดลองโจทย์และปรับสกิล อย่าลอกขั้นตอนเฉพาะ Claude หรือเครื่องมือที่ Gemini ไม่มี
2. **Anthropic — webapp-testing**: https://github.com/anthropics/skills/tree/main/skills/webapp-testing
   - ไฟล์ที่อ่าน: https://raw.githubusercontent.com/anthropics/skills/main/skills/webapp-testing/SKILL.md
   - ใช้แนวตรวจ UI/console/screenshot และ browser automation โครงการ Company มี Node Playwright อยู่แล้ว ไม่จำเป็นต้องเปลี่ยนเป็น Python ตามตัวอย่างของต้นฉบับ
3. **obra/superpowers — systematic-debugging**: https://github.com/obra/superpowers/tree/main/skills/systematic-debugging
   - ไฟล์ที่อ่าน: https://raw.githubusercontent.com/obra/superpowers/main/skills/systematic-debugging/SKILL.md
   - ใช้แนวหาสาเหตุจริงก่อนแก้ โดยเฉพาะ NPC ไม่ทำงาน เงินไม่ตรง และ planner ที่ไม่มี call-site

## เอกสารประกอบ ไม่ใช่สกิลที่ติดตั้งสำเร็จรูป

4. **Agent Skills specification**: https://agentskills.io/specification
   - โครงสร้างโฟลเดอร์ SKILL.md, frontmatter, supporting references และข้อมูลช่วยค้นพบสกิล
5. **Game Programming Patterns — Update Method**: https://gameprogrammingpatterns.com/update-method.html
   - การแยกงานของตัวละคร/โลกในลูปอัปเดต ข้อจำกัดเรื่องลำดับและการเกิดผลจริง
6. **Gaffer On Games — Fix Your Timestep!**: https://gafferongames.com/post/fix_your_timestep/
   - แนวคิดเวลาจำลองและเวลาวาดภาพ ให้เทียบกับ fixed-tick driver ที่ Company มีอยู่ ไม่ย้าย stack ตามตัวอย่างโดยไม่จำเป็น
7. **MDN — Optimizing canvas**: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas
   - แนววัดและลดภาระ Canvas; ผูกกับ renderer/zoom/culling จริงและวัด FPS แยกจาก benchmark simulation
8. **Playwright — Best Practices**: https://playwright.dev/docs/best-practices
   - แนว locator/wait/assertion ที่ดูจากพฤติกรรมและการตรวจหน้าเว็บจริง ใช้ร่วมกับ Canvas screenshots เมื่อ DOM อย่างเดียวไม่พอ

## ข้อมูลเฉพาะ Company ที่ต้องเป็นแหล่งหลัก

ฐานตรวจ main v1.2.0 source commit 6e21b8d1052bbd7cbaec918f5f2c5b298699b9ca; เอกสาร repo ที่ใช้จัดชุดถึง f496b0bbc8687a0d8ef9f1181bbe284e47290b2c โค้ดที่ Gemini มีอาจเปลี่ยนแล้ว ให้ตรวจจริงก่อนเขียน master

อ่าน AGENTS.md, project status, API/specs และไฟล์ที่แต่ละร่างระบุใน ZIP เกมปัจจุบัน ห้ามใช้เกมเก่า JHEvo เป็นแหล่ง API/สูตร/ระบบ Company โดยตรง โครงแบ่งหมวดจากรูปเป็นเพียงแรงบันดาลใจ ไม่ต้องใส่ combat หรือระบบที่เกมนี้ไม่มี

เราเชื่อม URL และสรุปแนวทางด้วยข้อความใหม่ ไม่ได้บรรจุสกิลสาธารณะทั้งชุดในแพ็ก หาก Gemini จะคัดลอกไฟล์หรือแจกต่อ ต้องตรวจ license ของแหล่งนั้นก่อนและคงเครดิตที่จำเป็น
