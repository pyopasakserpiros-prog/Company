(function(root,factory){const v=factory();if(typeof module==='object'&&module.exports)module.exports=v;else root.CompanyPhoneEngineering=v;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
// Pure deterministic engineering estimates. Power W, capacity MB/Wh, area mm², costs integer satang.
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const num=(v,d=0,a=0,b=1e9)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,a,b):d;
const round=v=>Math.round(v*10000)/10000;
const money=v=>Math.round(clamp(v,0,Number.MAX_SAFE_INTEGER));
function rng(seed){let h=2166136261;for(const c of String(seed)){h=Math.imul(h^c.charCodeAt(0),16777619);}return()=>{h+=0x6D2B79F5;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
function synthesizeChip(seed,capability=40,options={}){
 options=options||{};const r=rng(seed),c=num(capability,40,0,100),level=Math.floor(num(options.level,0,0,6)),q=.85+r()*.3;
 const nodeNm=num(options.nodeNm,Math.max(22,130/Math.pow(1.35,level)),10,350),cores=level?Math.min(8,1+level+Math.floor(r()*2)):1;
 const clockGhz=round((.18+c*.005+level*.22)*q),dieAreaMm2=round((12+cores*8+level*7)*(nodeNm/130)**1.5*(1.15-c*.003)*(.9+r()*.2));
 const loadW=round((.22+cores*clockGhz*.5)*(nodeNm/130)**.65*(1.15-c*.003));
 return{id:'chip-'+String(seed).replace(/[^a-zA-Z0-9_-]/g,'_').slice(0,48)+'-'+level+'-'+Math.floor(r()*1e6),isa:'arm32',cores,clockGhz,nodeNm:round(nodeNm),dieAreaMm2,ipcIndex:round(.65+c/120),gpuGflops:level?round(cores*clockGhz*(8+c/20)):0,memoryType:level?'LPDDR':'SDRAM',maxRamMB:level?128*2**level:32,maxPixels:level?320*480*2**(level-1):240*320,radioGeneration:Math.min(5,2+Math.floor(level/2)),idleW:round(loadW*.055),loadW,peakW:round(loadW*1.35),level};
}
function parts(seed,level=0){
 const r=rng(seed),l=Math.floor(num(level,0,0,6)),width=l?240+80*l:128+Math.floor(r()*3)*16,height=l?320+160*l:160+Math.floor(r()*3)*16;
 return{camera:{megapixels:l?2*2**l:.3,sensorAreaMm2:2+l*2,processingQuality:.4+l*.1},ram:{type:l?'LPDDR':'SDRAM',capacityMB:l?64*2**l:8+Math.floor(r()*3)*8,bandwidthGBps:round((l?.6+l*.8:.08)*(.9+r()*.2))},storage:{readMBps:round((l?30+l*25:8)*(.85+r()*.3)),capacityMB:l?512*2**l:16+Math.floor(r()*4)*8,interface:l?'eMMC':'SPI'},display:{pixels:width*height,width,height,watts:round((.12+l*.25)*(.85+r()*.3)),interface:l?'MIPI':'RGB'},battery:{wh:round((3.5+l*2)*(.85+r()*.3)),maxDischargeW:round(3+l*2+r())},enclosure:{material:l?'aluminium_graphite':'polymer',rth:round((l?3.3:5)*(.9+r()*.2))},os:{id:l?'open_mobile':'embedded_rtos',isa:'arm32',minRamMB:l?64:4,installableApps:!!l,apiLevel:l,version:1+l,driverCoverage:1,overhead:l?round(.16/(1+l*.2)):.03}};
}
function evaluate(chip,p,options={}){
 chip=chip||{};p=p||{};options=options||{};const reasonsTh=[],bad=s=>reasonsTh.push(s),ram=p.ram||{},storage=p.storage||{},display=p.display||{},battery=p.battery||{},enclosure=p.enclosure||{},os=p.os||{};
 const required=[chip.cores,chip.clockGhz,chip.nodeNm,chip.dieAreaMm2,chip.maxRamMB,chip.maxPixels,ram.capacityMB,ram.bandwidthGBps,storage.capacityMB,display.pixels,display.width,display.height,battery.wh,battery.maxDischargeW,enclosure.rth];
 if(required.some(v=>typeof v!=='number'||!Number.isFinite(v)||v<=0))bad('ข้อมูลชิ้นส่วนหรือหน่วยไม่ถูกต้อง');
 if([chip.idleW,chip.loadW,chip.peakW,display.watts,os.overhead,os.minRamMB,os.driverCoverage].some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0))bad('ข้อมูลพลังงานหรือระบบปฏิบัติการไม่ถูกต้อง');
 if(!chip.isa||!os.id||chip.isa!==os.isa)bad('ระบบปฏิบัติการไม่รองรับชุดคำสั่งของชิป');
 if(!chip.memoryType||ram.type!==chip.memoryType)bad('ชนิดแรมไม่ตรงกับตัวควบคุมหน่วยความจำ');
 if(num(ram.capacityMB)>num(chip.maxRamMB))bad('ความจุแรมเกินขีดจำกัดของชิป');
 if(num(ram.capacityMB)<num(os.minRamMB))bad('แรมไม่พอสำหรับระบบปฏิบัติการ');
 if(num(display.pixels)>num(chip.maxPixels)||display.pixels!==display.width*display.height)bad('ความละเอียดจอไม่ตรงกับขีดจำกัดของชิป');
 if(num(os.driverCoverage,0,0,1)<.95)bad('ไดรเวอร์ชิ้นส่วนยังไม่ครบ');

 if(storage.interface!==(num(chip.level)>0?'eMMC':'SPI')||display.interface!==(num(chip.level)>0?'MIPI':'RGB'))bad('อินเทอร์เฟซจอหรือหน่วยเก็บข้อมูลไม่รองรับ');
 const idle=num(chip.idleW),load=Math.max(idle,num(chip.loadW)),peak=Math.max(load,num(chip.peakW)),screen=num(display.watts),overhead=num(os.overhead,0,0,1),aux=.035+num(ram.capacityMB)*.00007;
 const duties={standby:[.01,.01],call:[.32,.12],web:[.55,.8],game:[.95,1],mixed:[.24,.35]},d=Object.hasOwn(duties,options.workload)?duties[options.workload]:duties.mixed;
 const averagePowerW=round(Math.max(.0001,(idle+(load-idle)*d[0]+screen*d[1]+aux)*(1+overhead))),peakPowerW=round((peak+screen+aux)*(1+overhead));
 if(num(battery.maxDischargeW)<peakPowerW)bad('แบตเตอรี่จ่ายกำลังสูงสุดไม่พอ');
 const ambient=num(options.ambientC,30,-50,80),rth=num(enclosure.rth,5,.01,100),surfaceC=round(ambient+peakPowerW*rth),budget=Math.max(0,(43-ambient)/rth),sustainedFactor=round(Math.min(1,(budget/Math.max(.0001,peakPowerW))**.8));
 const compatible=!reasonsTh.length,compute=num(chip.cores)*num(chip.clockGhz)*num(chip.ipcIndex,1,.1,4)*sustainedFactor/(1+overhead),memory=Math.min(1,num(ram.bandwidthGBps)/.6),score=v=>compatible?round(clamp(v,0,100)):0;
 const taskScores={call:score(65+compute*25),web:score((os.installableApps?compute*40*memory:compute*8)*Math.min(1,Math.max(0,ram.capacityMB-os.minRamMB)/64)*Math.min(1,(storage.readMBps||8)/30)),game:score((os.installableApps?compute*25*memory:compute*4)*Math.min(1,Math.max(0,ram.capacityMB-os.minRamMB)/128)*Math.min(1,153600/Math.max(1,display.pixels)))};
 const silicon=wafer({dieAreaMm2:num(chip.dieAreaMm2,25,.01,1e6)}).unitCostSatang;
 return{compatible,reasonsTh,batteryHours:round(num(battery.wh)*.92/averagePowerW),averagePowerW,peakPowerW,surfaceC,sustainedFactor,taskScores,cpuThroughput:round(compute),ramCapacityMB:ram.capacityMB,storageCapacityMB:storage.capacityMB,cameraQuality:round((p.camera?.megapixels||0)*(.5+(p.camera?.sensorAreaMm2||0)/10)*(p.camera?.processingQuality||.4)),osOverhead:overhead,costEstimateSatang:money(silicon+num(ram.capacityMB)*35+num(storage.capacityMB)*3+num(display.pixels)*.08+num(battery.wh)*1800+(enclosure.material==='polymer'?4500:9500)+12000)};
}
function wafer(options={}){
 options=options||{};const diameterMm=num(options.diameterMm,200,0,1000),area=num(options.dieAreaMm2,25,.0001,1e6),defects=num(options.defectsPerCm2,.1,0,1e6),packYield=num(options.packYield,.98,0,1),bin=num(options.binAFraction,.8,0,1);
 const grossDies=Math.floor(clamp(Math.PI*(diameterMm/2)**2/area-Math.PI*diameterMm/Math.sqrt(2*area),0,1e9)),x=area/100*defects,dieYield=x===0?1:(-Math.expm1(-x)/x)**2,goodDies=Math.round(grossDies*dieYield),packagedGood=Math.floor(goodDies*packYield),aBin=Math.floor(packagedGood*bin),bBin=packagedGood-aBin,scrap=grossDies-packagedGood;
 // All wafer and attempted packaging spend is borne by sellable dies, including failed packages.
 const total=num(options.waferCostSatang,3000000,0,1e12)+goodDies*num(options.packCostSatang,1200,0,1e12)+packagedGood*num(options.royaltySatang,400,0,1e12);
 return{grossDies,dieYield,goodDies,packagedGood,aBin,bBin,scrap,unitCostSatang:packagedGood?money(Math.ceil(total/packagedGood)):0};
}
return{synthesizeChip,parts,evaluate,wafer};
});
