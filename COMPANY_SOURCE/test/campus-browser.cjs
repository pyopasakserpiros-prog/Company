"use strict";
// Run with npm run test:campus after installing Playwright and Chromium.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
let server, browser, address;

test.before(async () => {
  server = http.createServer((req, res) => {
    const file = path.resolve(root, "." + decodeURIComponent(new URL(req.url, "http://local").pathname));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    fs.readFile(file, (err, data) => {
      if (err) return res.writeHead(404).end();
      res.setHeader("Content-Type", file.endsWith(".html") ? "text/html; charset=utf-8" : file.endsWith(".css") ? "text/css" : "text/javascript");
      res.end(data);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  address = "http://127.0.0.1:" + server.address().port;
  const executablePath = process.env.CHROMIUM_PATH || (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
  browser = await chromium.launch({ headless: true, executablePath, args: ["--no-sandbox"] });
});
test.after(async () => {
  if (browser) await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});

async function openGame(viewport = { width: 390, height: 844 }, file = "index.html") {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, isMobile: viewport.width < 600, hasTouch: viewport.width < 600 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = CanvasRenderingContext2D.prototype.scale;
    CanvasRenderingContext2D.prototype.scale = function (x, y) {
      if (this.canvas.id === "map") window.__mapZoom = x;
      return original.call(this, x, y);
    };
  });
  const response = await page.goto(address + "/" + file);
  assert.equal(response.status(), 200);
  await page.waitForFunction(() => window.CompanyDebug && window.__mapZoom);
  await page.locator('#startup-business').selectOption('cable_workshop');
  await page.locator('#startup-confirm').click();
  await page.evaluate(()=>CompanyDebug.app.setSpeed(0));
  return { page, errors };
}

test("mobile selection card can be closed and remains closed as the simulation updates", async () => {
  const { page, errors } = await openGame();
  try {
    await page.evaluate(() => CompanyDebug.openPersonSheet(CompanyDebug.app.snapshot().people[0].id));
    await page.locator("#shClose").click();
    if (process.env.COMPANY_SCREENSHOTS_DIR) {
      fs.mkdirSync(process.env.COMPANY_SCREENSHOTS_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.COMPANY_SCREENSHOTS_DIR, "mobile-selection.png") });
    }
    const close = page.getByRole("button", { name: "ปิดข้อมูลตัวละคร" });
    assert.equal(await close.count(), 1, "selection card must have its own close button");
    await close.click();
    assert.equal(await page.locator("#selInfo").isVisible(), false);
    await page.evaluate(() => CompanyDebug.app.advance(5));
    await page.waitForTimeout(250);
    assert.equal(await page.locator("#selInfo").isVisible(), false);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test("zoom buttons and two-finger pinch change the actual canvas camera", async () => {
  const { page, errors } = await openGame();
  try {
    const initial = await page.evaluate(() => window.__mapZoom);
    await page.locator("#fZoomIn").click();
    await page.waitForFunction((z) => window.__mapZoom > z, initial);
    const afterButton = await page.evaluate(() => window.__mapZoom);
    await page.evaluate(() => {
      const canvas = document.querySelector("#map");
      const send = (type, id, x, y) => canvas.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: id, pointerType: "touch", clientX: x, clientY: y }));
      send("pointerdown", 31, 120, 400); send("pointerdown", 32, 220, 400);
      send("pointermove", 32, 280, 400);
      send("pointerup", 31, 120, 400); send("pointerup", 32, 280, 400);
    });
    await page.waitForTimeout(120);
    const afterPinch = await page.evaluate(() => window.__mapZoom);
    assert.ok(afterPinch > afterButton, "spreading two fingers should zoom in");
    await page.evaluate(() => {
      const canvas = document.querySelector("#map");
      const send = (type, id, x, y) => canvas.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId: id, pointerType: "touch", clientX: x, clientY: y }));
      send("pointerdown", 41, 100, 400); send("pointerdown", 42, 260, 400);
      send("pointermove", 42, 200, 400);
      send("pointerup", 41, 100, 400); send("pointerup", 42, 200, 400);
    });
    await page.waitForTimeout(120);
    assert.ok(await page.evaluate(() => window.__mapZoom) < afterPinch, "pinching fingers together should zoom out");
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test("company management is observational while Edit Hub can grant an item to stock", async () => {
  const { page, errors } = await openGame();
  try {
    await page.locator('#hudBottom [data-nav="policy"]').click();
    assert.equal(await page.locator("#shBody input, #shBody select").count(), 0, "CEO policy and finance should be read-only");
    await page.locator('#hudBottom [data-nav="campus"]').click();
    await page.getByRole("button", { name: "การขยายนิคมและสถานี" }).click();
    assert.equal(await page.getByRole("button", { name: /ขยายที่ดินนิคม/ }).count(), 0);
    await page.locator('#hudBottom [data-nav="menu"]').click();
    await page.getByRole("button", { name: /ศูนย์แก้ไข \(Edit Hub\)/ }).click();
    await page.getByLabel("เลือกวัตถุดิบ").selectOption("pcb");
    await page.getByLabel("จำนวนวัตถุดิบ").fill("7");
    const before = await page.evaluate(() => CompanyDebug.app.snapshot().inventory.materials.pcb);
    await page.getByRole("button", { name: "เสกวัตถุดิบ" }).click();
    const after = await page.evaluate(() => CompanyDebug.app.snapshot().inventory.materials.pcb);
    assert.equal(after, before + 7);
    assert.equal(await page.getByLabel("เลือกตัวละคร").count(), 1);
    const personId = await page.evaluate(() => CompanyDebug.app.snapshot().people[1].id);
    await page.getByLabel("เลือกตัวละคร").selectOption(personId);
    await page.getByLabel("เลือกนิสัยหรือค่านิยม").selectOption("personality:sociability");
    await page.getByLabel("ค่านิสัยหรือค่านิยม").fill("72");
    await page.getByRole("button", { name: "บันทึกนิสัยหรือค่านิยม" }).click();
    assert.equal(await page.evaluate((id) => CompanyDebug.app.snapshot().people.find((p) => p.id === id).profile.personality.sociability, personId), 72);
    assert.equal(await page.getByRole("button", { name: /อัดฉีดทุน|เพิ่มแต้มวิจัย|ตั้งชื่อเสียง/ }).count(), 0);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test("CEO upgrade is reflected in the building sheet and visibly changes the building", async () => {
  const { page, errors } = await openGame({ width: 1280, height: 800 });
  try {
    const changed = await page.evaluate(() => {
      const app = CompanyDebug.app;
      app.dispatch({ type: "directorEdit", action: "grantCash", amount: 50000000 });
      app.dispatch({ type: "setPolicy", key: "autoAccept", value: true });
      app.advance(1505);
      return app.snapshot().campus.buildings.find((b) => b.level > 1);
    });
    assert.ok(changed, "CEO must invest when adequately funded");
    if (process.env.COMPANY_SCREENSHOTS_DIR) {
      fs.mkdirSync(process.env.COMPANY_SCREENSHOTS_DIR, { recursive: true });
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(process.env.COMPANY_SCREENSHOTS_DIR, "desktop-after-upgrade.png") });
    }
    await page.evaluate((id) => CompanyDebug.openBuildingSheet(id), changed.id);
    assert.match(await page.locator("#shBody").innerText(), /ระดับ 2/);
    const different = await page.evaluate((id) => {
      const snap = JSON.parse(JSON.stringify(CompanyDebug.app.snapshot()));
      snap.people = [];
      const canvas = document.createElement("canvas");
      canvas.style.width = "1280px"; canvas.style.height = "800px";
      document.body.append(canvas);
      const renderer = CampusRender.createRenderer(canvas, null);
      const building = snap.campus.buildings.find((b) => b.id === id);
      building.level = 1; renderer.render(snap, 1000, {});
      const oldImage = canvas.toDataURL();
      building.level = 3; renderer.render(snap, 1000, {});
      const changedImage = canvas.toDataURL();
      canvas.remove();
      return oldImage !== changedImage;
    }, changed.id);
    assert.equal(different, true);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test("a new company runs and fulfills orders without player management commands", async () => {
  const { page, errors } = await openGame();
  try {
    const result = await page.evaluate(() => {
      const app = CompanyDebug.app;
      const before = app.save();
      for (let i = 0; i < 10; i++) app.snapshot();
      const snapshotPure = before === app.save();
      app.advance(12 * 1440);
      const view = app.snapshot();
      return { orders: view.orders.length, paid: view.company.metrics.ordersPaid, audit: app.audit(), snapshotPure };
    });
    assert.ok(result.orders > 0 && result.paid > 0, "NPCs should accept and complete at least one order");
    assert.equal(result.snapshotPure, true);
    assert.deepEqual(result.audit, []);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test("desktop and standalone build boot without uncaught errors", async () => {
  for (const file of ["index.html", "CompanyFoundation_single.html"]) {
    const { page, errors } = await openGame({ width: 1280, height: 800 }, file);
    try {
      assert.ok(await page.locator("#map").isVisible());
      await page.waitForTimeout(300);
      if (process.env.COMPANY_SCREENSHOTS_DIR) {
        fs.mkdirSync(process.env.COMPANY_SCREENSHOTS_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.COMPANY_SCREENSHOTS_DIR, "desktop-" + file + ".png") });
      }
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  }
});

test("portrait camera fits the entire campus and can zoom out beyond the old clamp",async()=>{
 const {page,errors}=await openGame({width:390,height:844});
 try {
  await page.locator('#fHome').click();await page.waitForTimeout(100);
  const c=await page.evaluate(()=>CompanyDebug.getCamera());
  assert.ok(c.zoom<.45);assert.ok(c.bounds.worldW*c.zoom<=c.viewportWidth);assert.ok(c.bounds.worldH*c.zoom<=c.viewportHeight-200);
  for(let i=0;i<8;i++) await page.locator('#fZoomOut').click();
  const out=await page.evaluate(()=>CompanyDebug.getCamera());assert.ok(out.zoom<c.zoom);assert.ok(out.zoom>=out.minimumZoom);
  assert.deepEqual(errors,[]);
 } finally {await page.close();}
});

test("company tabs expose team coverage, learned subjects and assets on a phone",async()=>{
 const {page,errors}=await openGame();
 try {
  await page.locator('[data-nav="company"]').click();
  await page.getByRole('button',{name:'องค์ความรู้ / R&D',exact:true}).click();
  await page.getByRole('button',{name:'สารบัญวิชา',exact:true}).click();
  assert.ok((await page.locator('#shBody').innerText()).includes('170 วิชา'));
  await page.getByLabel('หมวดวิชา').selectOption('คณิตศาสตร์');
  assert.ok((await page.locator('#shBody').innerText()).includes('คณิตศาสตร์ขั้นสูง'));
  for(const name of ['ธุรกิจ / สินค้า','บอร์ด / แผน','โครงสร้าง / คน','ทรัพย์สิน / ทรัพยากร']) {
   await page.getByRole('button',{name,exact:true}).click();assert.ok((await page.locator('#shBody').innerText()).length>20);
  }
  if(process.env.COMPANY_SCREENSHOTS_DIR) await page.screenshot({path:path.join(process.env.COMPANY_SCREENSHOTS_DIR,'company-panel.png')});
  assert.deepEqual(errors,[]);
 } finally {await page.close();}
});

test("character knowledge tab shows personal subjects at Lv4 and Lv5",async()=>{
 const {page,errors}=await openGame();
 try {
  await page.evaluate(()=>{
   const id=CompanyDebug.app.snapshot().people[0].id;
   for(const [subjectId,level] of [['algorithms',85],['mathematics',95]]) CompanyDebug.app.dispatch({type:'directorEdit',action:'setSubject',personId:id,subjectId,level});
   CompanyDebug.refresh();CompanyDebug.openPersonSheet(id);
  });
  await page.getByRole('button',{name:'ความรู้',exact:true}).click();
  const text=await page.locator('#shBody').innerText();
  assert.ok(text.includes('อัลกอริทึมและการวิเคราะห์ประสิทธิภาพ · Lv4'));assert.ok(text.includes('คณิตศาสตร์พื้นฐาน · Lv5'));
  if(process.env.COMPANY_SCREENSHOTS_DIR) await page.screenshot({path:path.join(process.env.COMPANY_SCREENSHOTS_DIR,'character-knowledge.png')});
  assert.deepEqual(errors,[]);
 } finally {await page.close();}
});

test("World UI opens six categories and drills into governments, firms, materials and diplomacy on mobile",async()=>{
 const {page,errors}=await openGame();
 try{
  await page.evaluate(()=>{CompanyDebug.app.advance(1440*2);CompanyDebug.app.setSpeed(0);});
  await page.locator('[data-nav="world"]').click();
  await page.getByRole('button',{name:'ประเทศ / รัฐบาล',exact:true}).click();
  await page.getByLabel('เลือกประเทศ',{exact:true}).selectOption('US');
  await page.getByLabel('เลือกประเทศ',{exact:true}).blur();
  assert.ok((await page.locator('#shBody').innerText()).includes('เงินเฟ้อ'));
  await page.getByRole('button',{name:'บริษัทภายนอก',exact:true}).click();
  await page.getByLabel('เลือกบริษัทภายนอก').selectOption('siam_metal');
  await page.getByLabel('เลือกบริษัทภายนอก').blur();
  assert.ok((await page.locator('#shBody').innerText()).includes('กำลังผลิต'));
  if(process.env.COMPANY_SCREENSHOTS_DIR)await page.screenshot({path:path.join(process.env.COMPANY_SCREENSHOTS_DIR,'world-company.png')});
  await page.getByRole('button',{name:'ตลาด / วัตถุดิบ',exact:true}).click();
  await page.getByLabel('เลือกวัตถุดิบโลก').selectOption('microchip');await page.getByLabel('เลือกวัตถุดิบโลก').blur();
  assert.ok((await page.locator('#shBody').innerText()).includes('ผู้ขาย'));
  await page.getByRole('button',{name:'การทูต / เส้นทาง',exact:true}).click();assert.ok(await page.getByLabel('เลือกความสัมพันธ์ระหว่างประเทศ').count());
  await page.getByRole('button',{name:'พงศาวดารโลก',exact:true}).click();assert.ok((await page.locator('#shBody').innerText()).includes('ส่ง'));
  assert.deepEqual(errors,[]);
 }finally{await page.close();}
});
test("standalone World screen renders actual world without mutating save state",async()=>{
 const {page,errors}=await openGame({width:1280,height:800},'Company_single.html');
 try{
  await page.evaluate(()=>CompanyDebug.app.setSpeed(0));const before=await page.evaluate(()=>CompanyDebug.app.save());
  await page.locator('[data-nav="world"]').click();assert.ok((await page.locator('#shTitle').innerText()).includes('โลก'));
  await page.getByRole('button',{name:'ภาพรวม',exact:true}).click();assert.ok((await page.locator('#shBody').innerText()).includes('28 บริษัท'));
  assert.equal(await page.evaluate(()=>CompanyDebug.app.save()),before);assert.deepEqual(errors,[]);
 }finally{await page.close();}
});

test('mobile machinery and commercial contract tabs expose actual equipment state without management duties',async()=>{
 const {page,errors}=await openGame();try{
  await page.evaluate(()=>CompanyDebug.app.setSpeed(0));const saved=await page.evaluate(()=>CompanyDebug.app.save());
  await page.locator('[data-nav="company"]').click();await page.getByRole('button',{name:'เครื่องจักร / งานช่าง',exact:true}).click();
  assert.ok((await page.locator('#shBody').innerText()).includes('สถานีบัดกรี'));assert.ok((await page.locator('#shBody').innerText()).includes('สภาพ'));
  if(process.env.COMPANY_SCREENSHOTS_DIR)await page.screenshot({path:path.join(process.env.COMPANY_SCREENSHOTS_DIR,'plant-machinery.png')});
  await page.getByRole('button',{name:'ฝ่ายขาย / สัญญา',exact:true}).click();assert.ok((await page.locator('#shBody').innerText()).includes('กันเงิน'));
  assert.equal(await page.evaluate(()=>CompanyDebug.app.save()),saved);assert.deepEqual(errors,[]);
 }finally{await page.close();}
});

test('SME chooser pauses initial time, starts chosen business and exposes paid capital on mobile',async()=>{
 const {page,errors}=await openGame();try{
  await page.evaluate(()=>CompanyDebug.showBusinessChooser('chooser-v290'));
  const before=await page.evaluate(()=>CompanyDebug.app.snapshot().time.absoluteMinute);await page.waitForTimeout(1700);assert.equal(await page.evaluate(()=>CompanyDebug.app.snapshot().time.absoluteMinute),before);
  assert.equal(await page.locator('#startup-business option').count(),6);
  await page.locator('#startup-business').selectOption('food_kitchen');assert.ok((await page.locator('#business-chooser').innerText()).includes('ครัวน้ำพริก'));
  if(process.env.COMPANY_SCREENSHOTS_DIR)await page.screenshot({path:path.join(process.env.COMPANY_SCREENSHOTS_DIR,'sme-chooser.png')});
  await page.locator('#startup-confirm').click();await page.evaluate(()=>CompanyDebug.app.setSpeed(0));const snap=await page.evaluate(()=>CompanyDebug.app.snapshot());assert.equal(snap.startup.profileId,'food_kitchen');assert.equal(snap.people.length,4);
  await page.locator('[data-nav="company"]').click();assert.ok((await page.locator('#shBody').innerText()).includes('ทุนผู้ก่อตั้ง'));assert.ok((await page.locator('#shBody').innerText()).includes('เช่าพื้นที่'));
  assert.deepEqual(errors,[]);
 }finally{await page.close();}
});
test('country ministry and NPC news are observable and opening panels does not change simulation',async()=>{
 const {page,errors}=await openGame();try{
  await page.evaluate(()=>{CompanyDebug.app.advance(1440*4);CompanyDebug.app.setSpeed(0);CompanyDebug.refresh();});
  const before=await page.evaluate(()=>CompanyDebug.app.save());await page.locator('[data-nav="world"]').click();await page.getByRole('button',{name:'ประเทศ / รัฐบาล',exact:true}).click();await page.getByLabel('เลือกประเทศ',{exact:true}).selectOption('TH');await page.getByLabel('เลือกประเทศ',{exact:true}).blur();
  const text=await page.locator('#shBody').innerText();assert.ok(text.includes('ผู้นำและวาระ'));assert.ok(text.includes('กระทรวงพาณิชย์'));assert.ok(!text.includes('undefined'));assert.ok(!text.includes('NaN'));if(process.env.COMPANY_SCREENSHOTS_DIR)await page.screenshot({path:path.join(process.env.COMPANY_SCREENSHOTS_DIR,'phone-products.png')});
  if(process.env.COMPANY_SCREENSHOTS_DIR)await page.screenshot({path:path.join(process.env.COMPANY_SCREENSHOTS_DIR,'government-ministry.png')});
  await page.evaluate(()=>CompanyDebug.openPersonSheet(CompanyDebug.app.snapshot().people[0].id));await page.getByRole('button',{name:'ข่าวที่รับรู้',exact:true}).click();assert.ok((await page.locator('#shBody').innerText()).includes('ข่าวที่ตัวละครรับรู้'));assert.equal(await page.evaluate(()=>CompanyDebug.app.save()),before);assert.deepEqual(errors,[]);
 }finally{await page.close();}
});

test("phone industry mobile inspection has six read-only tabs and preserves saved world", async () => {
  const { page, errors } = await openGame();
  try {
    await page.evaluate(() => CompanyDebug.app.setSpeed(0));
    const before = await page.evaluate(() => CompanyDebug.app.save());
    await page.locator('[data-nav="phoneIndustry"]').click();
    await page.waitForFunction(() => document.querySelector('#shTitle').textContent.includes('อุตสาหกรรมโทรศัพท์'));
    assert.equal(await page.locator('#shTabs button').count(), 6);
    for (let i = 0; i < 6; i++) {
      await page.locator('#shTabs button').nth(i).click();
      assert.ok((await page.locator('#shBody').innerText()).length > 20);
      assert.equal(await page.locator('#shBody input, #shBody textarea').count(), 0);
    }
    await page.evaluate(() => { CompanyDebug.openPhoneIndustry(); CompanyDebug.refresh(); });
    assert.equal(await page.evaluate(() => CompanyDebug.app.save()), before);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    assert.equal(overflow, false);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test("standalone phone industry snapshot inspection stays read-only", async () => {
  const standalone=path.resolve(root,"../Company_single.html");
  // The standalone is served from the source root by the delivery build.
  const sourceStandalone=path.resolve(root,"Company_single.html");
  const file=fs.existsSync(sourceStandalone)?"Company_single.html":null;
  if (!file) return;
  const {page,errors}=await openGame({width:390,height:844},file);
  try {
    const before=await page.evaluate(()=>CompanyDebug.app.save());
    await page.evaluate(()=>CompanyDebug.openPhoneIndustry());
    for(let i=0;i<6;i++)await page.locator('#shTabs button').nth(i).click();
    assert.equal(await page.evaluate(()=>CompanyDebug.app.save()),before);
    assert.deepEqual(errors,[]);
  } finally {await page.close();}
});

test('phone designs expose measurable hardware, owned stock and read-only EditHub experiments',async()=>{
 const {page,errors}=await openGame();try{
  await page.evaluate(()=>{const app=CompanyDebug.app;app.dispatch({type:'continueEndless'});for(let d=0;d<60;d++){if(app.snapshot().status!=='running')app.dispatch({type:'continueEndless'});app.advance(1440);}app.setSpeed(0);CompanyDebug.refresh();CompanyDebug.openPhoneIndustry();});
  await page.getByRole('button',{name:'สินค้า / R&D',exact:true}).click();const text=await page.locator('#shBody').innerText();assert.ok(text.includes('GHz'));assert.ok(text.includes('RAM'));assert.ok(text.includes('แบต'));assert.ok(!text.includes('undefined'));assert.ok(!text.includes('NaN'));if(process.env.COMPANY_SCREENSHOTS_DIR)await page.screenshot({path:path.join(process.env.COMPANY_SCREENSHOTS_DIR,'phone-products.png')});
  await page.getByRole('button',{name:'Edit Hub — ทดลองเปลี่ยนเงื่อนไข',exact:true}).click();const before=await page.evaluate(()=>CompanyDebug.app.snapshot().phoneIndustry.firms[0].cashSatang);await page.getByLabel('จำนวนเงินบาทที่เพิ่ม').fill('1000');await page.getByRole('button',{name:'เพิ่มเงินทุน (ทดลอง)',exact:true}).click();assert.equal(await page.evaluate(()=>CompanyDebug.app.snapshot().phoneIndustry.firms[0].cashSatang),before+100000);await page.getByRole('button',{name:'ปิดการทดลอง',exact:true}).click();await page.getByRole('button',{name:'ซัพพลายเชน',exact:true}).click();if(process.env.COMPANY_SCREENSHOTS_DIR)await page.screenshot({path:path.join(process.env.COMPANY_SCREENSHOTS_DIR,'phone-stock.png')});await page.getByRole('button',{name:'บุคลากร',exact:true}).click();assert.ok((await page.locator('#shBody').innerText()).includes('ค่าจ้างต่อวัน'));assert.deepEqual(errors,[]);
 }finally{await page.close();}
});
