(function(){'use strict';const G=SiliconSim,$=id=>document.getElementById(id),el=(tag,text,cls)=>{const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x;},cash=n=>'฿'+Math.round((Number(n)||0)/100).toLocaleString('th-TH'),roles={brand:'แบรนด์โทรศัพท์',chip:'ชิปประมวลผล',memory:'หน่วยความจำ',camera:'กล้องและออปติก',display:'หน้าจอ',battery:'แบตเตอรี่',ems:'รับจ้างประกอบ'},subjects={software:'ซอฟต์แวร์',electronics:'อิเล็กทรอนิกส์',quality:'ตรวจคุณภาพ',semiconductor:'สารกึ่งตัวนำ',optics:'ออปติก',manufacturing:'กระบวนการผลิต',sales:'การค้า'},traits={riskTaking:'การยอมรับความเสี่ยง',prudence:'ความรอบคอบ',ambition:'ความทะเยอทะยาน',openness:'การเปิดรับสิ่งใหม่',conscientiousness:'ความรับผิดชอบ'},focusNames={power_efficiency:'ประหยัดพลังงาน/ลดความร้อน',compute_performance:'ประสิทธิภาพประมวลผลสูงสุด',cost_yield:'ลดต้นทุนและเพิ่มอัตราของดี',camera_optics:'ออปติกส์และประมวลผลภาพแสงน้อย',memory_bandwidth:'แบนด์วิดท์หน่วยความจำ/ความเร็วอ่านเขียน',thermal_envelope:'โครงสร้างระบายความร้อนและบอร์ด RF',battery_life:'ความจุพลังงานและ BMS',reliability:'ความทนทานและเสถียรภาพ',os_platform:'เคอร์เนล ไดรเวอร์ และแพลตฟอร์ม OS',balanced:'สมดุลมาตรฐาน',baseline:'มาตรฐานอุตสาหกรรมเริ่มต้น'};
const SAVE_KEY='silicon-handset-v030';
let autoSaveEnabled=true,world,speed=0,tab='campus',selected='player',carry=0,last=performance.now(),saveClock=0,traceTarget='',editState={personId:null,subjectId:null,traitKey:'riskTaking',cashBaht:'100000',proposedSubject:null,proposedTrait:null};
function fresh(seed,role='brand'){autoSaveEnabled=true;world=G.create(seed,{role});selected=world.playerFirmId;speed=0;carry=0;render();}
function load(text){const next=G.deserialize(text);autoSaveEnabled=true;world=next;selected=world.playerFirmId;speed=0;carry=0;render();}
try{
  const s30=localStorage.getItem(SAVE_KEY);
  const s20=localStorage.getItem('silicon-handset-v020');
  if(s30!==null){
    load(s30);
  }else if(s20!==null){
    load(s20);
  }else{
    fresh('แสงแรก');
  }
}catch(e){
  fresh('แสงแรก');
  autoSaveEnabled=false;
  message('หยุดบันทึกอัตโนมัติเพื่อรักษาไฟล์เดิม โหลดเซฟอัตโนมัติไม่ได้: '+e.message+' — เก็บเซฟเดิมไว้แล้ว');
}
function stat(card,label,value){const r=el('div',undefined,'stat');r.append(el('span',label),el('b',String(value??'—')));card.append(r);}
function card(grid,title,tag){const c=el('article',undefined,'card');if(tag)c.append(el('span',tag,'tag'));c.append(el('h3',title));grid.append(c);return c;}
function message(s){$('message').textContent=s;}
function act(c){try{const r=G.command(world,c);message((r===true||r?.ok)?'บันทึกการทดลองแล้ว — เฝ้าดูการตัดสินใจของ NPC ต่อได้':r?.reason||r?.reasonTh||'เงื่อนไขไม่ถูกต้อง');render();}catch(e){message(e.message);}}
const segmentName=id=>({value:'ใช้คุ้มค่าและแบตอึด',photo:'ถ่ายภาพและสื่อสาร',performance:'แอปและประสิทธิภาพ'})[id]||id;
const kindName=k=>({chip:'ชิป CPU/SoC',ram:'หน่วยความจำ RAM (Volatile)',storage:'สตอเรจแฟลช (Non-Volatile)',camera:'โมดูลกล้องและออปติก',display:'แผงหน้าจอและทัช',battery:'แบตเตอรี่และวงจร BMS',enclosure:'ตัวถังและโครงระบายความร้อน',pcb_rf:'บอร์ด HDI และวงจร RF',os:'ระบบปฏิบัติการและไดรเวอร์ BSP',raw:'วัตถุดิบแปรรูปต้นน้ำ',phone:'โทรศัพท์สำเร็จรูป'})[k]||k;
function plan(c,f){
  if(f.rndPortfolio){
    stat(c,'แนวทางพอร์ตวิจัย',focusNames[f.rndPortfolio.philosophy]||f.rndPortfolio.philosophy);
  }
  if(f.strategy){
    stat(c,'ตลาดเป้าหมาย',segmentName(f.strategy.segmentId));
    c.append(el('p',f.strategy.reason,'notice'));
    stat(c,'ทบทวนแผนล่าสุด','วันที่ '+(Math.floor(f.strategy.reviewed/1440)+1));
    stat(c,'แรงงานขายที่สะสม',Math.floor(f.salesWork/25)+' โอกาสขาย');
  }
  if(f.sourcingDecision){
    stat(c,'ทางเลือกจัดหา/พัฒนา',({buy_merchant_sku:'ซื้อล็อต SKU ตลาด',license_and_buy_prudent:'ซื้อล็อตมาตรฐาน (สงวนเงินสด)',co_develop_custom_sku:'วิจัยร่วมและสั่งผลิตล็อตเฉพาะทาง'})[f.sourcingDecision.chosenMode]||f.sourcingDecision.chosenMode);
    if(f.sourcingDecision.declinedFeasibleModes?.length){
      c.append(el('small',f.sourcingDecision.declinedFeasibleModes[0].reasonTh));
    }else if(f.sourcingDecision.infeasibleModes?.length){
      c.append(el('small',f.sourcingDecision.infeasibleModes[0].reasonTh));
    }
  }
}
function render(){
  const v=G.snapshot(world),f=v.firms.find(x=>x.id===selected)||v.firms[0];
  selected=f.id;
  $('time').textContent=`วันที่ ${Math.floor(v.minute/1440)+1} · ${String(Math.floor(v.minute%1440/60)).padStart(2,'0')}:${String(v.minute%60).padStart(2,'0')} น.`;
  document.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('active',Number(b.dataset.speed)===speed));
  const ours=v.firms.find(x=>x.id===v.playerFirmId);
  $('kpis').replaceChildren();
  for(const[label,val]of[['เงินสดบริษัทเรา',cash(ours.cash)],['บริษัทในอุตสาหกรรม',v.firms.length+' แห่ง'],['รหัสชิ้นส่วน / รุ่นมือถือ',v.skus.length+' SKU · '+v.designs.length+' รุ่น'],['ผู้คนที่มีตัวตน',v.people.length+' คน']]){
    const k=el('div',undefined,'kpi');k.append(el('span',label),el('strong',val));$('kpis').append(k);
  }
  $('firm').replaceChildren();
  for(const firm of v.firms){
    const o=el('option',(firm.id===v.playerFirmId?'★ ':'')+firm.name+' · '+(roles[firm.role]||firm.role));
    o.value=firm.id;$('firm').append(o);
  }
  $('firm').value=selected;
  $('firmReason').textContent=({research:'กำลังวิจัย',prototype:'สร้างต้นแบบ',validation:'ทดสอบต้นแบบ',procurement:'รอชิ้นส่วนเข้าคลัง',pilot:'ผลิตนำร่อง',manufacture:'ประกอบและตรวจคุณภาพ',release:'เตรียมวางจำหน่าย'})[f.decision]||f.decision||'กำลังประเมินทุน ความรู้ และความพร้อม';
  $('tabs').replaceChildren();
  for(const[id,name]of[['campus','🏢 ผู้คนและบริษัท'],['market','🌍 ตลาดและคู่แข่ง'],['products','📱 รุ่นและสเปก'],['supply','📦 คลังและคิวผลิต'],['chronicle','📜 เหตุการณ์'],['edit','🧪 Edit Hub']]){
    const b=el('button',name,id===tab?'active':'');
    b.onclick=()=>{tab=id;if(id==='edit')speed=0;render();};
    $('tabs').append(b);
  }
  const body=$('content');
  body.replaceChildren();
  const grid=el('div',undefined,'grid');

  if(tab==='campus'){
    const canvas=el('canvas',undefined,'campus');canvas.width=1000;canvas.height=400;body.append(canvas);drawCampus(canvas,v,f);body.append(grid);
    let c=card(grid,f.name,roles[f.role]||f.role);
    stat(c,'เงินสด',cash(f.cash));
    stat(c,f.role==='brand'?'แบบโทรศัพท์':'ขอบเขตเทคโนโลยี',f.role==='brand'?(f.products||[]).length:f.capability);
    stat(c,'แผนปัจจุบัน',f.decision||'รักษากิจการ');
    plan(c,f);
    if(f.project){
      stat(c,'โครงการผลิตภัณฑ์',({research:'วิจัยออกแบบ',prototype:'สร้างต้นแบบ',validation:'ทดสอบต้นแบบ',procurement:'รอชิ้นส่วน',pilot:'ผลิตนำร่อง',manufacture:'ประกอบและตรวจคุณภาพ',release:'เตรียมเปิดตัว',failed:'ต้นแบบไม่ผ่าน'})[f.project.stage]||'วิจัยและทดสอบ');
      stat(c,'งานที่ทำแล้ว',Math.round(f.project.work||0)+' / '+Math.round(f.project.required||0)+' นาทีวิศวกรรม');
    }
    const activeRnd=v.rndProjects?.find(r=>r.id===f.rndPortfolio?.activeProjectId);
    if(activeRnd){
      const lead=v.people.find(p=>p.id===activeRnd.leadEngineerId);
      stat(c,'โครงการวิจัยเฉพาะทาง',`${kindName(activeRnd.targetKind)} G${activeRnd.targetLevel} Rev.${activeRnd.targetRevision}`);
      stat(c,'เป้าหมายวิศวกรรม',focusNames[activeRnd.targetFocus]||activeRnd.targetFocus);
      stat(c,'หัวหน้าทีมวิจัย',lead?lead.name:'รอจัดสรรวิศวกร');
      stat(c,'ความคืบหน้าวิจัย',`${Math.round(activeRnd.workDone)} / ${Math.round(activeRnd.workRequired)} นาที · NRE ${cash(activeRnd.nreSpentSatang)}`);
      if(activeRnd.stallReason)c.append(el('small',activeRnd.stallReason));
    }else if(f.rndPortfolio?.lastBlockReason){
      c.append(el('small','สถานะวิจัย: '+f.rndPortfolio.lastBlockReason));
    }
    for(const p of v.people.filter(x=>x.employerId===f.id)){
      c=card(grid,p.name,p.role==='ceo'?'ผู้บริหาร (CEO)':'วิศวกร');
      stat(c,'กำลังทำ',({sleep:'นอน',travel:'เดินทาง',meal:'รับประทานอาหาร',work:'ทำงาน',rest:'พักผ่อน'})[p.activity]||'พัก');
      stat(c,'ค่าจ้างรายวัน',cash(p.wage));
      stat(c,'พลังงาน / ความเครียด',`${Math.round(p.state?.energy??0)} / ${Math.round(p.state?.stress??0)}`);
      stat(c,'นิสัยเสี่ยง / รอบคอบ',`${Math.round(p.profile?.personality?.riskTaking||0)} / ${Math.round(p.profile?.personality?.prudence||0)}`);
      for(const[k,n]of Object.entries(p.subjects||{}))stat(c,subjects[k]||k,Math.round(typeof n==='number'?n:n.level||0)+'/100');
    }
  }

  if(tab==='market'){
    body.append(el('p','คู่แข่งพัฒนาตามบุคลากร เงิน พอร์ตวิจัย และล็อตชิ้นส่วนของตัวเอง อาจนำหรือแพ้เราได้ไกล ไม่มีการปรับความเก่งตามเรา','notice'),grid);
    for(const segment of v.segments){
      const c=card(grid,segment.name,'กลุ่มผู้ซื้อ');
      stat(c,'เงินคงเหลือ',cash(segment.cash));
      stat(c,'งบสูงสุดต่อเครื่อง',cash(segment.maxPrice));
      stat(c,'ซื้อสะสม',segment.purchases+' เครื่อง');
      stat(c,'ต้องการ / ได้ซื้อ รอบล่าสุด',segment.lastDemand+' / '+segment.lastSales);
      stat(c,'ยังไม่ได้ซื้อ',segment.unmet+' คน');
      c.append(el('small','ต้องมีสินค้าในงบ ตรงการใช้งาน และทีมขายพร้อม กลุ่มแอปต้องมีคะแนนเว็บอย่างน้อย 8'));
      for(const r of segment.results)stat(c,v.designs.find(d=>d.id===r.designId)?.name||r.designId,r.quantity+' เครื่อง · '+cash(r.price));
    }
    for(const x of v.firms){
      const c=card(grid,x.name,roles[x.role]||x.role);
      stat(c,'เงินสด',cash(x.cash));
      stat(c,'ทีมงาน',v.people.filter(p=>p.employerId===x.id).length+' คน');
      stat(c,'SKU ที่ออกแบบเอง',v.skus.filter(s=>s.designerId===x.id).length+' รหัส');
      stat(c,'แบบสินค้า',(x.products||[]).length);
      c.append(el('p',x.decision||'กำลังดำเนินงาน'));
      plan(c,x);
      const b=el('button','ติดตามบริษัทนี้');
      b.onclick=()=>{selected=x.id;tab='campus';render();};
      c.append(b);
    }
  }

  if(tab==='products'){
    body.append(grid);
    for(const d of v.designs){
      const c=card(grid,d.name||d.nameTh||'แบบโทรศัพท์',v.firms.find(x=>x.id===d.firmId)?.name||'');
      const e=d.evaluation||{},p=d.parts||{},chip=d.chip||{};
      const chipSku=v.skus.find(s=>s.id===d.bomSkus?.chip),camSku=v.skus.find(s=>s.id===d.bomSkus?.camera),ramSku=v.skus.find(s=>s.id===d.bomSkus?.ram),stoSku=v.skus.find(s=>s.id===d.bomSkus?.storage),encSku=v.skus.find(s=>s.id===d.bomSkus?.enclosure);
      stat(c,'สถานะ',d.released?'วางจำหน่าย':e.compatible?'พัฒนาและทดสอบ':'ไม่ผ่านความเข้ากันได้');
      stat(c,'ราคา',cash(d.price||d.priceSatang));
      stat(c,'ออกแบบสำหรับ',segmentName(d.targetSegment));
      stat(c,'จุดเน้นวิศวกรรม',focusNames[d.focus]||d.focus||'สมดุล');
      stat(c,'ต้นทุนต่อเครื่องที่ประเมิน',cash(d.estimatedUnitCost));
      c.append(el('p',d.priceReason));
      for(const [id,n] of Object.entries(d.segmentSales))stat(c,'ขายให้ '+segmentName(id),n+' เครื่อง');
      stat(c,'ผลิต / ขาย / คงเหลือ',`${d.produced||0} / ${d.sold||0} / ${d.inventory||0}`);
      stat(c,'CPU SKU',`${chipSku?.code||'SoC'} · ${chip.cores||1} คอร์ ${chip.clockGhz||0} GHz (${chip.loadW||0}W)`);
      stat(c,'RAM SKU (Volatile)',`${ramSku?.code||'RAM'} · ${p.ram?.capacityMB||0} MB ${p.ram?.type||''} (${p.ram?.bandwidthGBps||0} GB/s)`);
      stat(c,'Storage SKU (Flash)',`${stoSku?.code||'NAND'} · ${p.storage?.capacityMB||0} MB ${p.storage?.interface||''} (อ่าน ${p.storage?.readMBps||0} MB/s)`);
      stat(c,'กล้องและเลนส์',`${camSku?.code||'CAM'} · ${p.camera?.megapixels||0} MP f/${p.camera?.fNumber||2.8} (แสงน้อย ${e.photoLowLightScore||0})`);
      stat(c,'แบตเตอรี่ / พีคไฟ',`${Number(e.batteryHours||0).toFixed(1)} ชม. · ${p.battery?.wh||0} Wh (จ่ายสูงสุด ${p.battery?.maxDischargeW||0}W / ใช้พีค ${e.peakPowerW||0}W)`);
      stat(c,'ตัวถัง / บอร์ด RF',`${encSku?.code||'ENC'} · Rth ${p.enclosure?.rth||0} °C/W · สัญญาณ RF ${Math.round((p.pcb_rf?.signalIntegrity||0.8)*100)}%`);
      stat(c,'แพลตฟอร์ม OS',`${d.osLicense?.code||p.os?.id||'RTOS'} (${d.osLicense?.licenseMode||'open_rtos'}) · Overhead ${Math.round((p.os?.overhead||0)*100)}%`);
      stat(c,'โทร / เว็บ / เกม',`${e.taskScores?.call||0} / ${e.taskScores?.web||0} / ${e.taskScores?.game||0}`);
      stat(c,'ผิวเครื่องขณะโหลด',`${Number(e.surfaceC||0).toFixed(1)} °C`);
      if(d.prototypeLots?.length)stat(c,'ล็อตต้นแบบที่ใช้',d.prototypeLots.map(l=>l.sourceLotId).slice(0,3).join(', ')+(d.prototypeLots.length>3?'…':''));
      if(d.finishedLots?.length)stat(c,'ล็อตเครื่องสำเร็จรูป',d.finishedLots.map(l=>`${l.lotId}(${l.remaining}/${l.quantity})`).join(', '));
      if(d.substitutions?.length)stat(c,'การทดแทน SKU ที่รับรองแล้ว',d.substitutions.length+' รายการ');
      c.append(el('small',(e.bottleneckSummaryTh||'ผลประมาณจากแบบจำลอง')+' • ค่าสเปกเป็นประมาณการแบบจำลองภายใต้ภาระงานเดียวกัน รุ่นใหม่อาจไม่ได้ดีกว่าทุกด้าน'));
    }
    if(!v.designs.length)body.append(el('div','ยังไม่มีรุ่นสำเร็จ — ทีมต้องวิจัย จัดซื้อล็อตชิ้นส่วน และทดสอบก่อน','empty'));
  }

  if(tab==='supply'){
    body.append(el('p','ชิ้นส่วนแยกตามรหัส SKU, Revision และล็อตผลิตจริงโดยใช้อินเทอร์เฟซมาตรฐานร่วมกัน: ติดตามผู้ออกแบบ เจ้าของสิทธิ์ ผู้ผลิต และล็อตที่ถูกจองใน BOM ได้ครบถ้วน','notice'));
    const traceBar=el('div',undefined,'toolbar');
    const traceLabel=el('label','ตามรอยสายโซ่ SKU / วิศวกร ');
    const traceSelect=el('select');
    traceSelect.setAttribute('aria-label','ตามรอยสายโซ่ SKU หรือวิศวกร');
    for(const s of v.skus){
      const o=el('option',`[SKU] ${s.code} · ${s.name}`);
      o.value=s.id;traceSelect.append(o);
    }
    for(const p of v.people){
      const o=el('option',`[คน] ${p.name} · ${v.firms.find(x=>x.id===p.employerId)?.name||'อิสระ'}`);
      o.value=p.id;traceSelect.append(o);
    }
    if(traceTarget&&[...traceSelect.options].some(o=>o.value===traceTarget))traceSelect.value=traceTarget;
    else traceTarget=traceSelect.value;
    traceSelect.onchange=()=>{traceTarget=traceSelect.value;render();};
    traceLabel.append(traceSelect);
    traceBar.append(traceLabel);
    body.append(traceBar,grid);

    if(traceTarget&&G.traceSkuChain){
      const tr=G.traceSkuChain(v,traceTarget);
      if(tr.type==='sku'){
        const tc=card(grid,`สายโซ่ ${tr.sku.code}`,'Provenance');
        stat(tc,'ชื่อ SKU',tr.sku.name);
        stat(tc,'ผู้ออกแบบ / เจ้าของ IP',`${v.firms.find(x=>x.id===tr.sku.designerId)?.name||tr.sku.designerId} (${tr.sku.licenseMode})`);
        stat(tc,'ผู้ผลิตล็อต',tr.sku.isSoftware?'ซอฟต์แวร์ไลเซนส์ (ไม่ใช้วัตถุดิบแร่)':(v.firms.find(x=>x.id===tr.sku.manufacturerId)?.name||tr.sku.manufacturerId));
        stat(tc,'จุดเน้นวิศวกรรม',focusNames[tr.sku.focus]||tr.sku.focus);
        stat(tc,'ล็อตในระบบ / ระหว่างขนส่ง',`${tr.lots.length} ล็อต / ${tr.shipments.length} รายการส่ง`);
        stat(tc,'รุ่นมือถือที่ใช้ SKU นี้',tr.designs.length?tr.designs.map(d=>`${d.name} (ผลิต ${d.produced}/ขาย ${d.sold})`).join(', '):'ยังไม่มีรุ่นที่นำไปประกอบ');
      }else if(tr.type==='engineer'){
        const tc=card(grid,`ผลงานของ ${tr.name}`,'Engineer Trace');
        stat(tc,'สังกัดปัจจุบัน',v.firms.find(x=>x.id===tr.employerId)?.name||'วิศวกรอิสระ');
        stat(tc,'โครงการวิจัยที่นำทีม',tr.ledProjects.length+' โครงการ');
        stat(tc,'SKU ที่ผ่านการรับรอง',tr.designedSkus.length?tr.designedSkus.map(s=>s.code).join(', '):'กำลังพัฒนา');
      }
    }

    const rawCard=card(grid,'วัตถุดิบและพอร์ตวิจัยของ '+f.name,'กำลังพัฒนา');
    stat(rawCard,'วัตถุดิบต้นน้ำที่มี',f.raw||0);
    stat(rawCard,'ระดับเทคโนโลยีหลัก',f.capability||0);
    stat(rawCard,'แนวทางวิจัยหลัก',focusNames[f.rndPortfolio?.philosophy]||f.rndPortfolio?.philosophy||'สมดุล');
    stat(rawCard,'โครงการวิจัยสำเร็จ / ยกเลิก',`${f.rndPortfolio?.completedProjects?.length||0} / ${f.rndPortfolio?.cancelledProjects?.length||0}`);
    stat(rawCard,'ต้นทุนจมสะสม (Sunk Cost)',cash(f.rndPortfolio?.sunkCostSatang||0));
    stat(rawCard,'ยอดผลิตสะสม',f.production||0);
    stat(rawCard,f.role==='brand'?'เครื่องที่ขายแล้ว':'รายรับจากชิ้นส่วน',f.role==='brand'?(f.sales||0):cash(f.revenue));

    const c=card(grid,'คลังสรุปและล็อตจริงของ '+f.name,'Inventory & Lots');
    for(const[k,n]of Object.entries(f.stock||{})){
      stat(c,kindName(k.split(':')[0])+' · รุ่น '+k.split(':')[1],n+' ชิ้น');
    }
    const ownedLots=v.lots.filter(l=>l.ownerId===f.id&&l.location==='stock');
    for(const l of ownedLots.slice(0,12)){
      const s=v.skus.find(x=>x.id===l.skuId);
      stat(c,`ล็อต ${l.id} (${s?.code||l.skuId})`,`${l.quantity} ชิ้น · ผลิตโดย ${v.firms.find(x=>x.id===l.manufacturerId)?.name||l.manufacturerId} · ${cash(l.unitPrice)}/ชิ้น`);
    }

    for(const item of f.procurement){
      const q=card(grid,item.key,'การจัดซื้อรอบล่าสุด');
      stat(q,'ยังจัดหาไม่ได้',item.unfilled);
      q.append(el('p',item.reason));
      for(const offer of item.alternatives)stat(q,`${v.firms.find(x=>x.id===offer.sellerId)?.name||offer.sellerId} (${offer.skuCode||offer.key})`,cash(offer.unitPrice)+' / ชิ้น · '+offer.leadMinutes/60+' ชม. · มี '+offer.stock);
      for(const order of item.orders)stat(q,`สั่งซื้อ ${order.skuCode||item.key} จาก ${v.firms.find(x=>x.id===order.sellerId)?.name}`,`${order.quantity} ชิ้น (ล็อต ${order.lotId||'—'})`);
    }
    for(const x of [...(v.shipments||[]),...(v.wip||v.WIP||[])].filter(x=>x.firmId===f.id||x.buyerId===f.id||x.ownerId===f.id||x.to===f.id)){
      const box=card(grid,(x.skuCode?`${x.kind} · ${x.skuCode}`:x.kind||x.type||'งานระหว่างทำ'),'Transit / WIP');
      for(const[k,n]of Object.entries(x))if(['from','key','skuCode','lotId','unitPrice','stage','quantity','eta','work','required'].includes(k))stat(box,({from:'ผู้ขาย',key:'ชิ้นส่วนและรุ่น',skuCode:'รหัส SKU',lotId:'รหัสล็อตขนส่ง',unitPrice:'ราคาต่อชิ้น (สตางค์)',eta:'กำหนดรับ (นาทีโลก)',work:'ทำแล้ว (นาทีวิศวกรรม)',stage:'ขั้นตอน',quantity:'จำนวน',required:'งานที่ต้องใช้'})[k],k==='from'?(v.firms.find(f=>f.id===n)?.name||'ต้นน้ำ'):k==='work'?Math.round(n):n);
    }
  }

  if(tab==='chronicle'){
    for(const e of [...v.events].reverse().slice(0,100)){
      const row=el('div',undefined,'event');
      row.append(el('small','วันที่ '+(e.day!=null?e.day+1:Math.floor((e.minute||0)/1440)+1)),el('div',e.text||e.reasonTh||e.message||''));
      body.append(row);
    }
    if(!v.events.length)body.append(el('div','โลกเพิ่งเริ่มต้น เรื่องราวจะเกิดจากการกระทำจริง','empty'));
  }

  if(tab==='edit'){
    body.append(el('p','การทดลองเปลี่ยนเงื่อนไข ไม่ใช่คำสั่งบริหาร NPC ยังคงตัดสินใจเองตามสถานะและข้อจำกัดจริง เงินที่เพิ่มบันทึกแยกในบัญชีทุนทดลอง (Provenance)','notice'),grid);
    const c=card(grid,'เพิ่มทุนให้ '+f.name,'การทดลอง');
    c.classList.add('edit');
    stat(c,'เป้าหมายบริษัท',f.name+' ('+(roles[f.role]||f.role)+')');
    stat(c,'เงินสดปัจจุบัน',cash(f.cash));
    stat(c,'ทุนทดลองสะสมทั้งโลก',cash(v.editCapital||0));
    const cashPreview=el('p',undefined,'edit-current');
    const l=el('label','จำนวนเงินบาท');
    const inp=el('input');
    inp.type='number';inp.min=1;inp.max=100000000;inp.value=editState.cashBaht||'100000';
    const syncCashPreview=()=>{
      editState.cashBaht=inp.value;
      const addSatang=Math.round((Number(inp.value)||0)*100);
      cashPreview.textContent=`ค่าปัจจุบัน: ${cash(f.cash)} → ค่าที่เสนอหลังเพิ่มทุน: ${cash(f.cash+Math.max(0,addSatang))} (บันทึกที่มา: Edit Hub Capital)`;
    };
    inp.oninput=syncCashPreview;
    syncCashPreview();
    l.append(inp);
    c.append(cashPreview,l);
    const b=el('button','เพิ่มเงินทุน (ทดลอง)');
    b.onclick=()=>act({type:'grantCash',firmId:f.id,amount:Math.round(Number(inp.value)*100)});
    c.append(b);

    const pc=card(grid,'ความรู้และนิสัยรายบุคคล','Provenance & Isolation');
    pc.classList.add('edit');
    const sel=el('select');
    sel.setAttribute('aria-label','บุคคลที่ทดลอง');
    for(const p of v.people){
      const o=el('option',p.name+' · '+(v.firms.find(x=>x.id===p.employerId)?.name||'รอย้ายงาน'));
      o.value=p.id;sel.append(o);
    }
    if(v.people.some(p=>p.id===editState.personId))sel.value=editState.personId;
    else editState.personId=sel.value;
    const currentTarget=el('p',undefined,'notice');
    pc.append(currentTarget,sel);

    const sub=el('select');
    sub.setAttribute('aria-label','วิชาที่ทดลอง');
    for(const k of new Set(v.people.flatMap(p=>Object.keys(p.subjects||{})))){
      const o=el('option',subjects[k]||k);
      o.value=k;sub.append(o);
    }
    if([...sub.options].some(o=>o.value===editState.subjectId))sub.value=editState.subjectId;
    else editState.subjectId=sub.value;
    const subjectCurrent=el('p',undefined,'edit-current');
    pc.append(subjectCurrent);
    const lv=el('input');
    lv.step='any';lv.type='number';lv.min=0;lv.max=100;lv.value=60;
    lv.setAttribute('aria-label','ระดับความรู้');
    pc.append(sub,lv);
    const sb=el('button','ปรับความรู้ (ทดลอง)');
    sb.onclick=()=>act({type:'setSubject',personId:sel.value,subjectId:sub.value,level:Number(lv.value)});
    pc.append(sb);

    const tr=el('select');
    tr.setAttribute('aria-label','นิสัยที่ทดลอง');
    for(const[k,n]of Object.entries(traits)){
      const o=el('option',n);
      o.value=k;tr.append(o);
    }
    tr.value=editState.traitKey;
    const traitCurrent=el('p',undefined,'edit-current');
    pc.append(traitCurrent);
    const tv=el('input');
    tv.step='any';tv.type='number';tv.min=0;tv.max=100;tv.value=60;
    tv.setAttribute('aria-label','ค่านิสัย');
    const tb=el('button','ปรับนิสัย (ทดลอง)');
    tb.onclick=()=>act({type:'setTrait',personId:sel.value,key:tr.value,level:Number(tv.value)});
    pc.append(tr,tv,tb);

    const sync=()=>{
      const p=v.people.find(p=>p.id===sel.value);
      if(!p)return;
      editState.personId=p.id;
      editState.subjectId=sub.value;
      editState.traitKey=tr.value;
      currentTarget.textContent='เป้าหมาย: '+p.name+' ('+p.id+') · สังกัด: '+(v.firms.find(f=>f.id===p.employerId)?.name||'วิศวกรอิสระ')+' · แยกเฉพาะบุคคล ไม่กระทบคนอื่น';
      const a=p.subjects[sub.value]||0,bVal=p.profile.personality[tr.value]||0;
      lv.value=a;
      tv.value=bVal;
      subjectCurrent.textContent='ความรู้ปัจจุบัน: '+(subjects[sub.value]||sub.value)+' '+Number(a).toFixed(2)+'/100 → ค่าที่เสนอ: '+Number(lv.value).toFixed(2)+'/100';
      traitCurrent.textContent='นิสัยปัจจุบัน: '+traits[tr.value]+' '+Number(bVal).toFixed(2)+'/100 → ค่าที่เสนอ: '+Number(tv.value).toFixed(2)+'/100';
    };
    lv.oninput=()=>{
      const p=v.people.find(p=>p.id===sel.value);if(!p)return;
      const a=p.subjects[sub.value]||0;
      subjectCurrent.textContent='ความรู้ปัจจุบัน: '+(subjects[sub.value]||sub.value)+' '+Number(a).toFixed(2)+'/100 → ค่าที่เสนอ: '+Number(lv.value||0).toFixed(2)+'/100';
    };
    tv.oninput=()=>{
      const p=v.people.find(p=>p.id===sel.value);if(!p)return;
      const bVal=p.profile.personality[tr.value]||0;
      traitCurrent.textContent='นิสัยปัจจุบัน: '+traits[tr.value]+' '+Number(bVal).toFixed(2)+'/100 → ค่าที่เสนอ: '+Number(tv.value||0).toFixed(2)+'/100';
    };
    sel.onchange=sync;sub.onchange=sync;tr.onchange=sync;sync();
  }
}
function drawCampus(canvas,v,f){
  const c=canvas.getContext('2d');
  c.fillStyle='#203a35';c.fillRect(0,0,1000,400);
  const areas=[['สำนักงาน',30,35],['ห้องวิจัย SKU',350,35],['โรงงานและคลังล็อต',670,35],['พื้นที่พักผ่อน',350,245]];
  c.font='18px system-ui';
  for(const[label,x,y]of areas){
    c.fillStyle='#2f5050';c.fillRect(x,y,270,110);
    c.fillStyle='#a8c9bf';c.fillRect(x+8,y+8,254,25);
    c.fillStyle='#152b2b';c.fillText(label,x+22,y+28);
  }
  c.fillStyle='#46604f';c.fillRect(0,190,1000,28);
  const people=v.people.filter(p=>p.employerId===f.id);
  people.forEach((p,i)=>{
    const state=({sleep:'นอน',travel:'เดินทาง',meal:'รับประทานอาหาร',work:'ทำงาน',rest:'พักผ่อน'})[p.activity]||'พัก',working=/work|research|assembl|test|ทำ|วิจัย|ผลิต/.test(state),rest=/rest|sleep|off|พัก/.test(state),a=rest?areas[3]:working?areas[1]:areas[0],x=a[1]+25+(i%6)*40,y=(p.position?.y===230?195:a[2]+60)+Math.floor(i/6)*26;
    c.fillStyle=rest?'#8ab9af':'#e9c67a';c.beginPath();c.arc(x,y,7,0,7);c.fill();
    c.font='12px system-ui';c.fillStyle='#edf1dc';c.fillText(p.name.slice(0,9),x-15,y+23);
  });
  c.fillStyle='#d1dfca';c.font='15px system-ui';
  c.fillText('ผังการทำกิจกรรม • '+f.name+' • แนวทางวิจัย: '+(focusNames[f.rndPortfolio?.philosophy]||f.rndPortfolio?.philosophy||'สมดุล'),30,385);
}
$('firm').onchange=()=>{selected=$('firm').value;render();};
document.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>{speed=Number(b.dataset.speed);render();});
$('nextDay').onclick=()=>{speed=0;G.advance(world,1440);render();};
const randomSeed=()=>{const n=new Uint32Array(2);crypto.getRandomValues(n);$('seed').value=Array.from(n,x=>x.toString(36)).join('-');};
$('randomSeed').onclick=randomSeed;
$('newWorld').onclick=()=>{speed=0;randomSeed();$('welcome').showModal();};
$('resume').onclick=()=>$('welcome').close();
$('createWorld').onsubmit=e=>{e.preventDefault();fresh($('seed').value,$('startRole').value);$('welcome').close();message('เริ่มโลกใหม่แล้ว — แต่ละบริษัทมีทีม ทุน พอร์ตวิจัย และล็อตชิ้นส่วนของตัวเอง');};
$('export').onclick=()=>{const blob=new Blob([G.serialize(world)],{type:'application/json'}),a=el('a');a.href=URL.createObjectURL(blob);a.download='Silicon-Handset-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
$('import').onchange=async()=>{try{const file=$('import').files[0];if(file){load(await file.text());message('โหลดโลกแล้ว');}}catch(e){message('โหลดไม่ได้: '+e.message+' — โลกเดิมยังอยู่');}$('import').value='';};
$('help').onclick=()=>{alert('คุณเป็นผู้สังเกตการณ์\n\nเริ่มจากหยุดเวลา เลือกบริษัทและดูคน ความรู้ พอร์ตวิจัย ล็อตชิ้นส่วน SKU และแผน จากนั้นเดินเวลาและตามเหตุการณ์\n\nทุกบริษัทมีบุคลากรและทรัพยากรของตนเอง ไม่มีระบบช่วยให้คู่แข่งตามทันเรา\n\nEdit Hub ใช้ทดลองเปลี่ยนทุน ความรู้ และนิสัย แล้วดูผล เซฟของเกมนี้แยกจาก Company');};
function frame(t){
  const dt=Math.min(1,(t-last)/1000);last=t;carry+=dt*2*speed;
  if(carry>=5){const n=Math.floor(carry/5)*5;carry-=n;G.advance(world,n);render();}
  saveClock+=dt;
  if(saveClock>=10&&autoSaveEnabled){
    saveClock=0;
    try{localStorage.setItem(SAVE_KEY,G.serialize(world));}catch(e){message('บันทึกอัตโนมัติไม่ได้: '+e.message);}
  }
  requestAnimationFrame(frame);
}
window.SiliconGame={get world(){return world;},snapshot:()=>G.snapshot(world),advance:n=>{G.advance(world,n);render();},load,render};
render();
requestAnimationFrame(frame);
if(!localStorage.getItem(SAVE_KEY)&&!localStorage.getItem('silicon-handset-v020')){randomSeed();$('welcome').showModal();}
})();
