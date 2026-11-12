(function (root, factory) {
  "use strict";
  const value = factory(
    typeof module === "object" && module.exports
      ? require("./human-core.js")
      : root.CompanyCore,
  );
  if (typeof module === "object" && module.exports) module.exports = value;
  else root.CompanyData = value;
})(typeof globalThis !== "undefined" ? globalThis : this, function (H) {
  "use strict";
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const idPattern = /^[a-z][a-zA-Z0-9_-]{0,63}$/;
  const validId = (id) =>
    typeof id === "string" &&
    idPattern.test(id) &&
    !["constructor", "prototype"].includes(id);
  const deepFreeze = (o) => {
    Object.values(o).forEach((v) => {
      if (v && typeof v === "object") deepFreeze(v);
    });
    return Object.freeze(o);
  };

  // Multi-nationality demographic & name pools researched from authentic regional registries
  const NATIONALITIES = deepFreeze({
    TH: {
      id: "TH",
      nameTh: "ไทย",
      nameEn: "Thai",
      flag: "🇹🇭",
      codeTh: "TH · ไทย",
      hometowns: ["นนทบุรี", "สมุทรปราการ", "ปทุมธานี", "ชลบุรี", "เชียงใหม่", "ขอนแก่น", "นครราชสีมา", "ระยอง", "พระนครศรีอยุธยา", "ฉะเชิงเทรา"],
      educations: [
        "ปวส. เทคนิคอุตสาหกรรมและเมคคาทรอนิกส์",
        "ปริญญาตรี วิศวกรรมอุตสาหการและระบบการผลิต",
        "ปริญญาตรี บริหารธุรกิจและการจัดการซัพพลายเชน",
        "ปวส. ช่างกลโรงงานและควบคุมคุณภาพมาตรฐานสากล",
        "ปริญญาตรี บัญชีต้นทุนและการเงินธุรกิจอุตสาหกรรม"
      ],
      roleWeight: { sales: 0.72, admin: 0.78, engineer: 0.52, assembler: 0.58, inspector: 0.62, logistics: 0.64, coordinator: 0.72 }
    },
    JP: {
      id: "JP",
      nameTh: "ญี่ปุ่น",
      nameEn: "Japanese",
      flag: "🇯🇵",
      codeTh: "JP · ญี่ปุ่น",
      hometowns: ["โอซาก้า", "นาโกย่า", "โยโกฮาม่า", "ฟุกุโอกะ", "เกียวโต", "ฮามามัตสึ"],
      educations: [
        "สถาบันเทคโนโลยีแห่งโตเกียว (Monozukuri & Lean QC)",
        "ปริญญาตรี วิศวกรรมไมโครอิเล็กทรอนิกส์และยานยนต์ (Nagoya)",
        "ผู้เชี่ยวชาญมาตรฐาน Kaizen, 5S & IPC-A-610"
      ],
      roleWeight: { sales: 0.05, admin: 0.04, engineer: 0.18, assembler: 0.04, inspector: 0.14, logistics: 0.03, coordinator: 0.08 }
    },
    CN: {
      id: "CN",
      nameTh: "จีน",
      nameEn: "Chinese",
      flag: "🇨🇳",
      codeTh: "CN · จีน",
      hometowns: ["เซินเจิ้น", "ซูโจว", "กวางโจว", "เซี่ยงไฮ้", "ตงกวน", "หางโจว"],
      educations: [
        "วิศวกรรมฮาร์ดแวร์และซัพพลายเชนอุตสาหกรรม (Shenzhen)",
        "ปริญญาตรี วิศวกรรมระบบอัตโนมัติและพลังงานสะอาด",
        "การจัดการโลจิสติกส์และจัดซื้อชิ้นส่วนระดับโลก"
      ],
      roleWeight: { sales: 0.08, admin: 0.06, engineer: 0.14, assembler: 0.08, inspector: 0.08, logistics: 0.08, coordinator: 0.08 }
    },
    VN: {
      id: "VN",
      nameTh: "เวียดนาม",
      nameEn: "Vietnamese",
      flag: "🇻🇳",
      codeTh: "VN · เวียดนาม",
      hometowns: ["บั๊กนิญ", "ไฮฟอง", "ดานัง", "โฮจิมินห์", "ฮานอย", "บิ่ญเซือง"],
      educations: [
        "เทคนิคการประกอบ SMT และสายการผลิตความแม่นยำสูง (Bac Ninh)",
        "ปริญญาตรี วิศวกรรมไฟฟ้าและตรวจสอบคุณภาพผลิตภัณฑ์",
        "ประกาศนียบัตรวิชาชีพชั้นสูง ช่างเทคนิคอุตสาหกรรม"
      ],
      roleWeight: { sales: 0.04, admin: 0.04, engineer: 0.08, assembler: 0.14, inspector: 0.1, logistics: 0.1, coordinator: 0.04 }
    },
    MM: {
      id: "MM",
      nameTh: "เมียนมา",
      nameEn: "Myanmar",
      flag: "🇲🇲",
      codeTh: "MM · เมียนมา",
      hometowns: ["ย่างกุ้ง", "มัณฑะเลย์", "พะโค", "เมาะลำเลิง", "ตองยี"],
      educations: [
        "ใบรับรองช่างประกอบชิ้นส่วนอุตสาหกรรมและคลังสินค้า",
        "เทคนิคการประกอบละเอียดและการแพ็กกิ้งมาตรฐานส่งออก",
        "วิชาชีพช่างเทคนิคสายการผลิตและตรวจสอบเบื้องต้น"
      ],
      roleWeight: { sales: 0.02, admin: 0.02, engineer: 0.02, assembler: 0.14, inspector: 0.04, logistics: 0.13, coordinator: 0.03 }
    },
    EN: {
      id: "EN",
      nameTh: "สากล (ตะวันตก)",
      nameEn: "International",
      flag: "🇬🇧",
      codeTh: "EN · สากล",
      hometowns: ["ลอนดอน", "ซานโฮเซ", "ซิดนีย์", "แมนเชสเตอร์", "มิวนิก", "ซูริก"],
      educations: [
        "B.Eng. Embedded Systems & Industrial Automation",
        "B.Sc. Global Supply Chain & B2B Key Account Management",
        "M.Eng. Reliability Engineering & Six Sigma Black Belt"
      ],
      roleWeight: { sales: 0.09, admin: 0.06, engineer: 0.06, assembler: 0.02, inspector: 0.02, logistics: 0.02, coordinator: 0.05 }
    }
  });

  const NAME_POOLS = deepFreeze({
    TH: {
      maleFirst: [
        "ธนกฤต", "กิตติพงศ์", "ณัฐวุฒิ", "ศุภชัย", "ภูริพัฒน์", "ชยุต",
        "ภาคิน", "วรเมธ", "ธีรภัทร", "ปิยะพงษ์", "จิรายุ", "กัมปนาท",
        "อัครเดช", "พีรวิชญ์", "นรภัทร", "ศรัณย์", "พงศกร", "อนุชา",
        "ธนดล", "กฤตภาส", "ชานนท์", "ปรเมศวร์", "สิรภพ", "เจตนิพัทธ์"
      ],
      femaleFirst: [
        "กมลชนก", "พิมพ์ชนก", "ณัฐธิดา", "ศิริพร", "ชลธิชา", "กัญญาณัฐ",
        "ภัทรวดี", "วรัญญา", "อารยา", "สุภัสสรา", "นันท์นภัส", "ปภาวรินท์",
        "พิชญาภา", "รุ่งทิวา", "ธัญชนก", "อัญชลี", "ลลิตา", "มนัสนันท์",
        "ชนัญชิดา", "ปุณยนุช", "กานต์สินี", "แพรวพรรณ", "ญาดา", "เขมิกา"
      ],
      surnames: [
        "วงศ์สุวรรณ", "เจริญสุข", "ศรีสวัสดิ์", "เกียรติไพศาล", "รัตนโชติ",
        "พงษ์พานิช", "อัครเดชา", "วัฒนากุล", "โชติบริบูรณ์", "ตั้งเจริญ",
        "พิทักษ์สิน", "ธนากิจ", "ศิริวงศ์", "เลิศวิไล", "กิจเจริญ",
        "บุญญะริทธิ์", "สมบูรณ์ผล", "สุวรรณภูมิ", "จรัสแสง", "นิคมรัตน์",
        "วิริยะกิจ", "มหาดำรงค์", "เปี่ยมสุข", "สกุลไทย", "ทรัพย์ทวี"
      ],
      nicknamesMale: ["ภัทร", "ต้น", "กานต์", "ธีร์", "ภูมิ", "นนท์", "เจ", "อาร์ต", "แบงค์", "ก้อง", "เอิร์ธ", "ท็อป", "บอส", "พีท", "มาร์ค", "โอม", "คิว", "กาย"],
      nicknamesFemale: ["มิน", "น้ำ", "อิง", "ป่าน", "แพร", "ฟ้า", "เมย์", "โบว์", "พลอย", "มายด์", "เนย", "พิม", "เฟิร์น", "จูน", "เบลล์", "ออม", "ครีม", "กวาง"]
    },
    JP: {
      maleFirst: ["ฮารุโตะ (Haruto)", "เร็น (Ren)", "ทาคุมิ (Takumi)", "เคนจิ (Kenji)", "โซตะ (Sota)", "ไดกิ (Daiki)", "ยูโตะ (Yuto)", "นาโอกิ (Naoki)"],
      femaleFirst: ["ฮิมาริ (Himari)", "อาโออิ (Aoi)", "ยุย (Yui)", "ซากุระ (Sakura)", "มิโอะ (Mio)", "ริน (Rin)", "อายากะ (Ayaka)", "นานามิ (Nanami)"],
      surnames: ["ซาโต้ (Sato)", "ซูซูกิ (Suzuki)", "ทาคาฮาชิ (Takahashi)", "ทานากะ (Tanaka)", "วาตานาเบะ (Watanabe)", "อิโต้ (Ito)", "ยามามาโตะ (Yamamoto)", "โคบายาชิ (Kobayashi)"],
      nicknamesMale: ["เคน", "ทาคุ", "เร็น", "ฮารุ", "โซตะ", "ได"],
      nicknamesFemale: ["อาโออิ", "ยุย", "มิโอะ", "ริน", "ซากุระ", "นานะ"]
    },
    CN: {
      maleFirst: ["เหว่ย (Wei)", "ฮ่าวหราน (Haoran)", "จื้อหาว (Zihao)", "หมิงเจ๋อ (Mingze)", "เจี้ยนหัว (Jianhua)", "จวิ้นเจี๋ย (Junjie)", "อี้เฉิน (Yichen)", "ข่าย (Kai)"],
      femaleFirst: ["จื่อหาน (Zihan)", "อี้หนัว (Yinuo)", "ซินอี้ (Xinyi)", "เหม่ยหลิง (Meiling)", "เสี่ยวเหวิน (Xiaowen)", "เจียอี้ (Jiayi)", "หยูถง (Yutong)", "หลิน (Lin)"],
      surnames: ["หวัง (Wang)", "หลี่ (Li)", "จาง (Zhang)", "หลิว (Liu)", "เฉิน (Chen)", "หยาง (Yang)", "หวง (Huang)", "จ้าว (Zhao)"],
      nicknamesMale: ["เหว่ย", "ฮ่าว", "หมิง", "เจี้ยน", "ข่าย"],
      nicknamesFemale: ["หลิน", "เหม่ย", "ซิน", "เหวิน", "เจีย"]
    },
    VN: {
      maleFirst: ["มินห์ กวาน (Minh Quan)", "ฮว่าง นาม (Hoang Nam)", "ดึ๊ก อันห์ (Duc Anh)", "แทงห์ ตุง (Thanh Tung)", "กวาง ฮุย (Quang Huy)", "บ๋าว ลอง (Bao Long)"],
      femaleFirst: ["ถวิ ลินห์ (Thuy Linh)", "บิช หง็อก (Bich Ngoc)", "ไม อันห์ (Mai Anh)", "แทงห์ ห่า (Thanh Ha)", "ฟือง เถ่า (Phuong Thao)", "ลาน อันห์ (Lan Anh)"],
      surnames: ["เหงียน (Nguyen)", "เจิ่น (Tran)", "เล (Le)", "ฝ่าม (Pham)", "ฮหว่าง (Hoang)", "หวู (Vu)", "ดัง (Dang)", "บุ่ย (Bui)"],
      nicknamesMale: ["กวาน", "นาม", "ฮุย", "ตุง", "ลอง"],
      nicknamesFemale: ["ลินห์", "หง็อก", "ไม", "ห่า", "เถ่า"]
    },
    MM: {
      maleFirst: ["อ่อง จอ (Aung Kyaw)", "มิน ตัน (Min Thant)", "หม่อง ซอ (Maung Zaw)", "โก โก (Ko Ko)", "เท็ต แนง (Htet Naing)", "ซอ ลวิน (Zaw Lwin)"],
      femaleFirst: ["เม ตะซิน (May Thazin)", "ขิ่น ซู (Khin Su)", "เอ มิ (Aye Mi)", "นันท์ ซานดาร์ (Nand Sandar)", "ซู มยัต (Su Myat)", "พยู ซิน (Phyu Sin)"],
      surnames: ["สายช่างย่างกุ้ง", "สายเทคนิคมัณฑะเลย์", "สายงานพะโค", "สายอุตสาหกรรมเมียนมา"],
      nicknamesMale: ["อ่อง", "หม่อง", "ซอ", "เท็ต", "โก"],
      nicknamesFemale: ["เม", "ขิ่น", "เอ", "ซู", "พยู"]
    },
    EN: {
      maleFirst: ["อเล็กซานเดอร์ (Alexander)", "เจมส์ (James)", "โอลิเวอร์ (Oliver)", "ลูคัส (Lucas)", "แดเนียล (Daniel)", "มาร์คัส (Marcus)"],
      femaleFirst: ["ชาร์ล็อตต์ (Charlotte)", "เอมิลี่ (Emily)", "โซเฟีย (Sophia)", "คลาร่า (Clara)", "เอเลน่า (Elena)", "ฮันนาห์ (Hannah)"],
      surnames: ["สมิธ (Smith)", "จอห์นสัน (Johnson)", "มิลเลอร์ (Miller)", "แอนเดอร์สัน (Anderson)", "เทย์เลอร์ (Taylor)", "คลาร์ก (Clark)"],
      nicknamesMale: ["อเล็กซ์", "เจมส์", "ลุค", "แดน", "มาร์ค"],
      nicknamesFemale: ["เอมี่", "โซฟี", "คลาร่า", "เอเลน", "ฮันนาห์"]
    }
  });

  const STARTER_IDENTITIES = deepFreeze({
    "employee-1": { nationality: "TH", gender: "F", age: 27, firstName: "มินตรา", lastName: "วงศ์สุวรรณ", educationTh: "ปริญญาตรี บริหารธุรกิจและการตลาดอุตสาหกรรม B2B (ม.เกษตรฯ)", hometownTh: "นนทบุรี" },
    "employee-2": { nationality: "TH", gender: "M", age: 29, firstName: "ภัทรพล", lastName: "เจริญสุข", educationTh: "ปริญญาตรี การจัดการซัพพลายเชนและบัญชีต้นทุน", hometownTh: "สมุทรปราการ" },
    "employee-3": { nationality: "JP", gender: "F", age: 31, firstName: "นานามิ (Nanami)", lastName: "ทาคาฮาชิ (Takahashi)", educationTh: "วิศวกรรมระบบอุตสาหกรรมและนวัตกรรม (Osaka Institute of Tech)", hometownTh: "โอซาก้า" },
    "employee-4": { nationality: "TH", gender: "M", age: 24, firstName: "ต้นกล้า", lastName: "ศรีสวัสดิ์", educationTh: "ปวส. เทคนิคการผลิตและเมคคาทรอนิกส์โรงงาน", hometownTh: "ชลบุรี" },
    "employee-5": { nationality: "VN", gender: "F", age: 23, firstName: "ถวิ ลินห์ (Thuy Linh)", lastName: "เหงียน (Nguyen)", educationTh: "เทคนิคสายการผลิตอัตโนมัติและการประกอบความแม่นยำสูง (Bac Ninh)", hometownTh: "บั๊กนิญ" },
    "employee-6": { nationality: "TH", gender: "M", age: 30, firstName: "กานต์ชนก", lastName: "เกียรติไพศาล", educationTh: "ปริญญาตรี วิศวกรรมควบคุมคุณภาพ มาตรฐาน ISO 9001 & IQC", hometownTh: "ปทุมธานี" },
    "employee-7": { nationality: "MM", gender: "F", age: 25, firstName: "เม ตะซิน (May Thazin)", lastName: "สายเทคนิคย่างกุ้ง", educationTh: "วิชาชีพการจัดการคลังสินค้าและฟลีทขนส่งส่งออก", hometownTh: "ย่างกุ้ง" },
    "employee-8": { nationality: "CN", gender: "M", age: 34, firstName: "จื้อหาว (Zihao)", lastName: "เฉิน (Chen)", educationTh: "ปริญญาโท บริหารอุตสาหกรรมและกลยุทธ์องค์กร (Shenzhen Tech)", hometownTh: "เซินเจิ้น" }
  });

  // Real-World Corporate Organizational Divisions (สายงานหลัก 3 สายงาน)
  const CORPORATE_DIVISIONS = deepFreeze({
    executive: {
      id: "executive",
      nameTh: "สายงานบริหารสูงสุดและกลยุทธ์องค์กร (CEO & Executive Strategy Division)",
      zoneId: "office",
      icon: "👑",
      roles: ["coordinator"],
      descriptionTh: "กำหนดเข็มทิศกลยุทธ์ประจำสัปดาห์ บริหารเงินทุน ชำระหนี้ ขยายอาคาร/ที่ดิน สรรหาบุคลากร และอนุมัติเลื่อนตำแหน่ง"
    },
    office: {
      id: "office",
      nameTh: "สายงานพาณิชย์ การเงิน และวิจัยในออฟฟิศ (Commercial, Finance & R&D Office Division)",
      zoneId: "office",
      icon: "🏢",
      roles: ["sales", "admin", "engineer"],
      descriptionTh: "เจรจาดีลธุรกิจกับบริษัทคู่ค้า B2B จัดซื้อวัตถุดิบต้นน้ำ บริหารบัญชี/ใบแจ้งหนี้ และวิจัยพัฒนาแบบแปลนสินค้าใหม่"
    },
    factory: {
      id: "factory",
      nameTh: "สายงานปฏิบัติการโรงงานและโลจิสติกส์ (Manufacturing Plant & Supply Chain Division)",
      zoneId: "factory",
      icon: "🏭",
      roles: ["assembler", "inspector", "logistics"],
      descriptionTh: "เดินเครื่องสายการผลิต ประกอบชิ้นงาน ตรวจสอบคุณภาพ QC/QA แพ็กสินค้าลงกล่อง และปล่อยรถบรรทุกจัดส่งลูกค้า"
    }
  });

  const ROLE_DEPARTMENTS = deepFreeze({
    coordinator: {
      roleId: "coordinator",
      divisionId: "executive",
      divisionNameTh: "สายงานบริหารสูงสุดและทรัพยากรบุคคล (Executive & HR Division)",
      departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร (CEO & Corporate HR Department)",
      zoneTh: "อาคารสำนักงานใหญ่ (Office HQ)",
      coreDutiesTh: "กำหนดกลยุทธ์บริษัท บริหารสภาพคล่อง ลงทุนก่อสร้างอาคาร คัดเลือกคนเข้าทำงาน และประเมินเลื่อนขั้น"
    },
    sales: {
      roleId: "sales",
      divisionId: "office",
      divisionNameTh: "สายงานพาณิชย์และบริหารในออฟฟิศ (Commercial & Office Division)",
      departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B (Commercial & B2B Sales Department)",
      zoneTh: "อาคารสำนักงานใหญ่ (Office HQ)",
      coreDutiesTh: "ติดต่อบริษัทคู่ค้า เจรจาต่อรองราคาขาย เงื่อนไขมัดจำ และคัดเลือกคำสั่งซื้อที่ทำกำไรสูงสุด"
    },
    admin: {
      roleId: "admin",
      divisionId: "office",
      divisionNameTh: "สายงานพาณิชย์และบริหารในออฟฟิศ (Commercial & Office Division)",
      departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน (Procurement & Finance Department)",
      zoneTh: "อาคารสำนักงานใหญ่ / คลังวัตถุดิบ",
      coreDutiesTh: "วางแผนสั่งซื้อวัตถุดิบจากซัพพลายเออร์ ออกใบ PO สร้างเครดิตการค้า และวางบิลเรียกเก็บเงินลูกค้า (Invoice)"
    },
    engineer: {
      roleId: "engineer",
      divisionId: "office",
      divisionNameTh: "สายงานวิจัยพัฒนาและวิศวกรรม (R&D & Engineering Division)",
      departmentTh: "ฝ่ายวิจัยผลิตภัณฑ์และวิศวกรรมระบบ (R&D & Process Engineering Department)",
      zoneTh: "อาคารแล็บวิจัย (R&D Lab) & โรงงาน",
      coreDutiesTh: "วิจัยปลดล็อกสินค้าอุตสาหกรรมใหม่ ปรับปรุงกระบวนการผลิต และซ่อมบำรุงเครื่องจักรเชิงป้องกัน"
    },
    assembler: {
      roleId: "assembler",
      divisionId: "factory",
      divisionNameTh: "สายงานปฏิบัติการโรงงานผลิต (Manufacturing Operations Division)",
      departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน (Production & Assembly Department)",
      zoneTh: "อาคารโรงงานผลิต (Production Lines A/B/C/D)",
      coreDutiesTh: "เบิกวัตถุดิบตามสูตร BOM เดินเครื่องจักรประกอบชิ้นงาน และแก้ไขงานซ่อม (Rework)"
    },
    inspector: {
      roleId: "inspector",
      divisionId: "factory",
      divisionNameTh: "สายงานปฏิบัติการโรงงานผลิต (Manufacturing Operations Division)",
      departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (Quality Control & Assurance Department)",
      zoneTh: "แท่นตรวจมาตรฐานโรงงาน & ห้องแล็บ QA",
      coreDutiesTh: "ตรวจสอบความสมบูรณ์ของชิ้นงาน คัดกรองของเสียก่อนส่งมอบ และรักษามาตรฐานชื่อเสียงบริษัท"
    },
    logistics: {
      roleId: "logistics",
      divisionId: "factory",
      divisionNameTh: "สายงานปฏิบัติการโรงงานและคลังสินค้า (Warehouse & Fleet Division)",
      departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง (Warehouse & Outbound Logistics Department)",
      zoneTh: "อาคารคลังสินค้าและศูนย์กระจายสินค้าส่งออก",
      coreDutiesTh: "ตรวจรับวัตถุดิบเข้าคลัง แพ็กสินค้าสำเร็จรูปลงหีบห่อ และจัดส่งขึ้นรถบรรทุกไปถึงบริษัทลูกค้า"
    }
  });

  // 4-Tier Multi-Branch Organizational Hierarchy Tree:
  // Tier 1: Division (สายงาน) -> Tier 2: Department (ฝ่าย) -> Tier 3: Section (แผนก) -> Tier 4: Group/Line (กลุ่มงาน/ไลน์ย่อย)
  const ORG_TREE = deepFreeze({
    coordinator: {
      divisionId: "executive",
      divisionNameTh: "สายงานบริหารสูงสุดและกลยุทธ์องค์กร",
      departments: [
        {
          id: "dept_ceo_office",
          nameTh: "ฝ่ายสำนักประธานบริหารและกลยุทธ์องค์กร",
          sections: [
            {
              id: "sec_strategy",
              nameTh: "แผนกวางแผนกลยุทธ์และนักลงทุนสัมพันธ์",
              groups: [
                { id: "grp_corp_plan", nameTh: "กลุ่มยุทธศาสตร์นิคมและการลงทุน" },
                { id: "grp_board_gov", nameTh: "กลุ่มกำกับกิจการและบริหารความเสี่ยง" }
              ]
            },
            {
              id: "sec_hr_org",
              nameTh: "แผนกทรัพยากรบุคคลและพัฒนาองค์กร",
              groups: [
                { id: "grp_recruitment", nameTh: "กลุ่มสรรหาว่าจ้างและประเมินผล" },
                { id: "grp_welfare", nameTh: "กลุ่มสวัสดิการและวัฒนธรรมองค์กร" }
              ]
            }
          ]
        }
      ]
    },
    sales: {
      divisionId: "office",
      divisionNameTh: "สายงานพาณิชย์และบริหารสำนักงาน",
      departments: [
        {
          id: "dept_commercial_b2b",
          nameTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B",
          sections: [
            {
              id: "sec_domestic_b2b",
              nameTh: "แผนกขายลูกค้าองค์กรและอุตสาหกรรมในประเทศ",
              groups: [
                { id: "grp_sales_tech", nameTh: "กลุ่มลูกค้าสมาร์ตเทคและอิเล็กทรอนิกส์" },
                { id: "grp_sales_auto", nameTh: "กลุ่มลูกค้ายานยนต์ EV และพลังงาน" }
              ]
            },
            {
              id: "sec_export_trade",
              nameTh: "แผนกการค้าส่งออกและพันธมิตรข้ามชาติ",
              groups: [
                { id: "grp_sales_apac", nameTh: "กลุ่มคู่ค้าส่งออกญี่ปุ่น-เอเชียแปซิฟิก" },
                { id: "grp_sales_key", nameTh: "กลุ่มบริหารสัญญาเมกะโปรเจกต์ B2B" }
              ]
            }
          ]
        }
      ]
    },
    admin: {
      divisionId: "office",
      divisionNameTh: "สายงานพาณิชย์และบริหารสำนักงาน",
      departments: [
        {
          id: "dept_procurement_fin",
          nameTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน",
          sections: [
            {
              id: "sec_procurement",
              nameTh: "แผนกจัดซื้อวัตถุดิบและบริหารซัพพลายเออร์",
              groups: [
                { id: "grp_proc_semi", nameTh: "กลุ่มจัดซื้อเซมิคอนดักเตอร์และโลหะ" },
                { id: "grp_proc_bio", nameTh: "กลุ่มจัดซื้อสารสกัดและบรรจุภัณฑ์" }
              ]
            },
            {
              id: "sec_finance_acct",
              nameTh: "แผนกบัญชีต้นทุน การเงิน และเร่งรัดหนี้สิน",
              groups: [
                { id: "grp_acct_ar", nameTh: "กลุ่มวางบิล Invoice และบริหารลูกหนี้" },
                { id: "grp_acct_cost", nameTh: "กลุ่มบัญชีต้นทุนและงบการเงินนิคม" }
              ]
            }
          ]
        }
      ]
    },
    engineer: {
      divisionId: "office",
      divisionNameTh: "สายงานวิจัยพัฒนาและวิศวกรรมอุตสาหกรรม",
      departments: [
        {
          id: "dept_rnd_engineering",
          nameTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ",
          sections: [
            {
              id: "sec_product_rnd",
              nameTh: "แผนกวิจัยและออกแบบผลิตภัณฑ์ใหม่ (R&D)",
              groups: [
                { id: "grp_rnd_elec", nameTh: "กลุ่มวิจัยสมาร์ตดีไวซ์และเซนเซอร์ AI" },
                { id: "grp_rnd_green", nameTh: "กลุ่มวิจัยพลังงานสะอาดและชีวภาพ" }
              ]
            },
            {
              id: "sec_maint_automation",
              nameTh: "แผนกวิศวกรรมระบบและซ่อมบำรุงเครื่องกล",
              groups: [
                { id: "grp_maint_pm", nameTh: "กลุ่มซ่อมบำรุงเชิงป้องกัน (PM Workshop)" },
                { id: "grp_automation_line", nameTh: "กลุ่มวิศวกรรมหุ่นยนต์และสายพานอัตโนมัติ" }
              ]
            }
          ]
        }
      ]
    },
    assembler: {
      divisionId: "factory",
      divisionNameTh: "สายงานปฏิบัติการโรงงานและซัพพลายเชน",
      departments: [
        {
          id: "dept_manufacturing",
          nameTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน",
          sections: [
            {
              id: "sec_line_a",
              nameTh: "แผนกสายการผลิตหลักที่ 1 (Main Line A)",
              groups: [
                { id: "grp_line_a1", nameTh: "กลุ่มประกอบแผงวงจร SMT-A1", lineId: "lineA" },
                { id: "grp_line_a2", nameTh: "กลุ่มประกอบตัวถังและกลไก A2", lineId: "lineA" }
              ]
            },
            {
              id: "sec_line_b",
              nameTh: "แผนกสายการผลิตอัจฉริยะที่ 2 (Smart Line B)",
              groups: [
                { id: "grp_line_b1", nameTh: "กลุ่มประกอบความแม่นยำสูง B1", lineId: "lineB" },
                { id: "grp_line_b2", nameTh: "กลุ่มเทคนิคปรับแต่งและงานซ่อม Rework B2", lineId: "lineB" }
              ]
            },
            {
              id: "sec_line_c",
              nameTh: "แผนกสายการผลิตอัตโนมัติที่ 3 (Mega Line C)",
              groups: [
                { id: "grp_line_c1", nameTh: "กลุ่มหุ่นยนต์ประกอบความเร็วสูง C1", lineId: "lineC" },
                { id: "grp_line_c2", nameTh: "กลุ่มขึ้นรูปโลหะและเมคคาทรอนิกส์ C2", lineId: "lineC" }
              ]
            },
            {
              id: "sec_line_d",
              nameTh: "แผนกสายการผลิตปลอดเชื้อและพลังงานที่ 4 (Clean & HV Line D)",
              groups: [
                { id: "grp_line_d1", nameTh: "กลุ่มสกัดและบรรจุคลีนรูมปลอดเชื้อ D1", lineId: "lineD" },
                { id: "grp_line_d2", nameTh: "กลุ่มประกอบเซลล์พลังงานแรงดันสูง D2", lineId: "lineD" }
              ]
            }
          ]
        }
      ]
    },
    inspector: {
      divisionId: "factory",
      divisionNameTh: "สายงานปฏิบัติการโรงงานและซัพพลายเชน",
      departments: [
        {
          id: "dept_quality_assurance",
          nameTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)",
          sections: [
            {
              id: "sec_inline_qc",
              nameTh: "แผนกควบคุมคุณภาพในสายการผลิต (IQC & IPQC)",
              groups: [
                { id: "grp_qc_iqc", nameTh: "กลุ่มตรวจรับวัตถุดิบต้นน้ำ (IQC)" },
                { id: "grp_qc_ipqc", nameTh: "กลุ่มตรวจคุณภาพระหว่างสายพาน (IPQC)" }
              ]
            },
            {
              id: "sec_final_qa",
              nameTh: "แผนกประกันคุณภาพส่งออกและห้องแล็บมาตรฐาน (OQA & ISO)",
              groups: [
                { id: "grp_qa_oqa", nameTh: "กลุ่มตรวจรับรองสินค้าก่อนส่งออก (OQA)" },
                { id: "grp_qa_isolab", nameTh: "กลุ่มปฏิบัติการทดสอบความทนทาน ISO/IEC" }
              ]
            }
          ]
        }
      ]
    },
    logistics: {
      divisionId: "factory",
      divisionNameTh: "สายงานปฏิบัติการโรงงานและซัพพลายเชน",
      departments: [
        {
          id: "dept_warehouse_logistics",
          nameTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง",
          sections: [
            {
              id: "sec_warehouse_ops",
              nameTh: "แผนกคลังวัตถุดิบและบรรจุภัณฑ์สำเร็จรูป",
              groups: [
                { id: "grp_wh_raw", nameTh: "กลุ่มคลังวัตถุดิบและไซโลต้นน้ำ" },
                { id: "grp_wh_pack", nameTh: "กลุ่มสายพานแพ็กกิ้งและคลังสินค้าพร้อมส่ง" }
              ]
            },
            {
              id: "sec_dispatch_fleet",
              nameTh: "แผนกศูนย์กระจายสินค้าและฟลีทขนส่ง B2B",
              groups: [
                { id: "grp_fleet_b2b", nameTh: "กลุ่มปล่อยรถบรรทุกส่งออกลูกค้าองค์กร" },
                { id: "grp_fleet_route", nameTh: "กลุ่มบริหารเส้นทางและพิธีการศุลกากร" }
              ]
            }
          ]
        }
      ]
    }
  });

  // 10-Level Realistic Corporate & Factory Job Grade Hierarchy (Lv.1 / G1 to Lv.10 / G10)
  // Research-grounded from manufacturing & corporate hierarchy standards:
  // Lv.1 Operator/Staff -> Lv.2 Senior -> Lv.3 Group/Line Leader -> Lv.4 Section Supervisor/Foreman ->
  // Lv.5 Asst. Dept Manager -> Lv.6 Department Manager -> Lv.7 Deputy Division Director ->
  // Lv.8 Division Director / Plant Manager -> Lv.9 EVP / C-Suite -> Lv.10 CEO / Managing Director
  const LEVEL_TIERS = deepFreeze({
    1: { level: 1, gradeCode: "G1", tierNameTh: "พนักงานปฏิบัติการระดับต้น (Operational Staff / Jr. Operator)", chainRoleTh: "ผู้ปฏิบัติงานหน้างาน", reportsToLevel: 3 },
    2: { level: 2, gradeCode: "G2", tierNameTh: "พนักงานชำนาญการ / อาวุโส (Senior Specialist / Skilled Tech)", chainRoleTh: "พี่เลี้ยงและผู้ชำนาญการเฉพาะทาง", reportsToLevel: 3 },
    3: { level: 3, gradeCode: "G3", tierNameTh: "หัวหน้ากลุ่มงาน / หัวหน้าชุดในไลน์ผลิต (Group / Line Leader)", chainRoleTh: "หัวหน้ากลุ่มย่อย คุมทีม 4-6 คน", reportsToLevel: 4 },
    4: { level: 4, gradeCode: "G4", tierNameTh: "หัวหน้าหมวด / หัวหน้ากะสายการผลิต (Section Supervisor / Shift Foreman)", chainRoleTh: "หัวหน้าหมวด/หัวหน้ากะ คุมหลายกลุ่มงาน", reportsToLevel: 5 },
    5: { level: 5, gradeCode: "G5", tierNameTh: "รองหัวหน้าแผนก / ผู้ช่วยผู้จัดการแผนก (Assistant Department Manager)", chainRoleTh: "รองหัวหน้าแผนก ช่วยบริหารแผนก", reportsToLevel: 6 },
    6: { level: 6, gradeCode: "G6", tierNameTh: "หัวหน้าแผนก / ผู้จัดการแผนก (Department Manager)", chainRoleTh: "หัวหน้าแผนก คุมทุกกลุ่มในแผนก", reportsToLevel: 7 },
    7: { level: 7, gradeCode: "G7", tierNameTh: "รองหัวหน้าฝ่าย / รองผู้อำนวยการฝ่าย (Deputy Division Director / Deputy Plant Mgr)", chainRoleTh: "รองหัวหน้าฝ่าย กำกับหลายแผนก", reportsToLevel: 8 },
    8: { level: 8, gradeCode: "G8", tierNameTh: "หัวหน้าฝ่าย / ผู้อำนวยการฝ่าย / ผู้จัดการโรงงาน (Division Director / Plant GM)", chainRoleTh: "หัวหน้าฝ่าย/ผู้จัดการโรงงาน คุมทั้งฝ่าย", reportsToLevel: 9 },
    9: { level: 9, gradeCode: "G9", tierNameTh: "รองกรรมการผู้จัดการใหญ่ / ผู้บริหาร C-Suite (EVP / Chief Officer)", chainRoleTh: "ผู้บริหารสูงสุดสายงาน (C-Level / EVP)", reportsToLevel: 10 },
    10: { level: 10, gradeCode: "G10", tierNameTh: "ประธานเจ้าหน้าที่บริหารสูงสุด (Chief Executive Officer - CEO)", chainRoleTh: "ผู้นำสูงสุดขององค์กร (CEO)", reportsToLevel: 10 }
  });

  const CAREER_LADDERS = deepFreeze({
    sales: [
      { level: 1, gradeCode: "G1", titleTh: "เจ้าหน้าที่ฝ่ายขาย B2B ระดับต้น (Jr. B2B Sales Representative)", badge: "Lv.1", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "ติดต่อลูกค้าองค์กรและจัดทำใบเสนอราคาเบื้องต้น", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0 },
      { level: 2, gradeCode: "G2", titleTh: "เจ้าหน้าที่บริหารลูกค้าองค์กรอาวุโส (Sr. Key Account Executive)", badge: "Lv.2", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "เจรจาต่อรองราคาขายและเงื่อนไขมัดจำกับคู่ค้ารายใหญ่", minTasks: 2, minSkill: 48, minTenureDays: 2, wageBonus: 3500, mentorPower: 0.1 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มงานขายอุตสาหกรรม (B2B Sales Group Leader)", badge: "Lv.3", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "นำกลุ่มย่อยทีมขาย B2B ดูแลโควตาลูกค้าประจำกลุ่ม", minTasks: 5, minSkill: 54, minTenureDays: 4, wageBonus: 5500, mentorPower: 0.16 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดการค้าและลูกค้าสัมพันธ์ (Commercial Section Supervisor)", badge: "Lv.4", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "กำกับหมวดงานขายและประเมินผลงานหัวหน้ากลุ่มขาย", minTasks: 9, minSkill: 58, minTenureDays: 6, wageBonus: 8000, mentorPower: 0.22 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกขายและพัฒนาธุรกิจ (Asst. Commercial Sales Manager)", badge: "Lv.5", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "ช่วยบริหารแผนกขาย B2B และตรวจสอบสัญญาการค้า", minTasks: 13, minSkill: 61, minTenureDays: 9, wageBonus: 10500, mentorPower: 0.27 },
      { level: 6, gradeCode: "G6", titleTh: "หัวหน้าแผนกขายและการพาณิชย์ (Commercial Sales Department Manager)", badge: "Lv.6", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "บริหารแผนกขายทั้งหมด อนุมัติส่วนลดและประเมินเลื่อนขั้นในแผนก", minTasks: 18, minSkill: 64, minTenureDays: 12, wageBonus: 13500, mentorPower: 0.32 },
      { level: 7, gradeCode: "G7", titleTh: "รองผู้อำนวยการฝ่ายพาณิชย์และส่งออก (Deputy Commercial Director)", badge: "Lv.7", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "กำกับดูแลทั้งแผนกขายในประเทศและแผนกส่งออก", minTasks: 24, minSkill: 67, minTenureDays: 15, wageBonus: 17000, mentorPower: 0.37 },
      { level: 8, gradeCode: "G8", titleTh: "ผู้อำนวยการฝ่ายการพาณิชย์ (Commercial Division Director)", badge: "Lv.8", division: "office", departmentTh: "ฝ่ายการพาณิชย์และพัฒนาธุรกิจ B2B", dutyTh: "บริหารสายงานพาณิชย์ทั้งหมดและกำหนดเป้ายอดขายรายไตรมาส", minTasks: 30, minSkill: 70, minTenureDays: 19, wageBonus: 21000, mentorPower: 0.42 },
      { level: 9, gradeCode: "G9", titleTh: "รองกรรมการผู้จัดการใหญ่สายพาณิชย์ (EVP & Chief Commercial Officer - CCO)", badge: "Lv.9", division: "executive", departmentTh: "คณะผู้บริหารระดับสูงสายพาณิชย์", dutyTh: "กำหนดยุทธศาสตร์การตลาดระดับประเทศและดีลพันธมิตรข้ามชาติ", minTasks: 38, minSkill: 74, minTenureDays: 24, wageBonus: 26000, mentorPower: 0.48 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสายพาณิชย์และองค์กร (President & Co-CEO)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดสายพาณิชย์และยุทธศาสตร์การเติบโตของเครือบริษัท", minTasks: 48, minSkill: 78, minTenureDays: 30, wageBonus: 32000, mentorPower: 0.55 }
    ],
    admin: [
      { level: 1, gradeCode: "G1", titleTh: "เจ้าหน้าที่จัดซื้อและบัญชีระดับต้น (Jr. Procurement & Accounting Staff)", badge: "Lv.1", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "ออกใบสั่งซื้อ PO และจัดทำใบแจ้งหนี้วางบิลลูกค้า", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0 },
      { level: 2, gradeCode: "G2", titleTh: "นักวางแผนซัพพลายเชนและบัญชีอาวุโส (Sr. Supply Chain & Finance Specialist)", badge: "Lv.2", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "บริหารสต็อกวัตถุดิบต้นน้ำและเจรจาเครดิตซัพพลายเออร์", minTasks: 2, minSkill: 48, minTenureDays: 2, wageBonus: 3500, mentorPower: 0.1 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มงานจัดซื้อและบัญชี (Procurement & Accounting Group Leader)", badge: "Lv.3", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "คุมกลุ่มงานออกใบสั่งซื้อ PO และตรวจสอบความถูกต้องของใบแจ้งหนี้", minTasks: 5, minSkill: 54, minTenureDays: 4, wageBonus: 5500, mentorPower: 0.16 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดซัพพลายเชนและงบประมาณ (Supply Chain Section Supervisor)", badge: "Lv.4", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "กำกับหมวดจัดซื้อและหมวดบัญชีต้นทุน ควบคุมสภาพคล่องรายวัน", minTasks: 9, minSkill: 58, minTenureDays: 6, wageBonus: 8000, mentorPower: 0.22 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกจัดซื้อและการเงิน (Asst. Procurement & Finance Manager)", badge: "Lv.5", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "ช่วยผู้จัดการแผนกบริหารสัญญาซัพพลายเออร์และวงเงินสินเชื่อ", minTasks: 13, minSkill: 61, minTenureDays: 9, wageBonus: 10500, mentorPower: 0.27 },
      { level: 6, gradeCode: "G6", titleTh: "หัวหน้าแผนกจัดซื้อและบัญชีการเงิน (Supply Chain & Finance Dept Manager)", badge: "Lv.6", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "บริหารแผนกจัดซื้อและบัญชี อนุมัติงบสั่งซื้อล็อตใหญ่และประเมินทีม", minTasks: 18, minSkill: 64, minTenureDays: 12, wageBonus: 13500, mentorPower: 0.32 },
      { level: 7, gradeCode: "G7", titleTh: "รองผู้อำนวยการฝ่ายการเงินและซัพพลายเชน (Deputy Finance & SCM Director)", badge: "Lv.7", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "กำกับดูแลทั้งแผนกจัดซื้อและแผนกบัญชีการเงินของบริษัท", minTasks: 24, minSkill: 67, minTenureDays: 15, wageBonus: 17000, mentorPower: 0.37 },
      { level: 8, gradeCode: "G8", titleTh: "ผู้อำนวยการฝ่ายการเงินและซัพพลายเชน (Finance & Supply Chain Director)", badge: "Lv.8", division: "office", departmentTh: "ฝ่ายจัดซื้อ ซัพพลายเชน และบัญชีการเงิน", dutyTh: "บริหารโครงสร้างต้นทุน งบดุล และเครือข่ายซัพพลายเออร์ทั้งหมด", minTasks: 30, minSkill: 70, minTenureDays: 19, wageBonus: 21000, mentorPower: 0.42 },
      { level: 9, gradeCode: "G9", titleTh: "รองกรรมการผู้จัดการใหญ่สายการเงิน (EVP & Chief Financial Officer - CFO)", badge: "Lv.9", division: "executive", departmentTh: "คณะผู้บริหารระดับสูงสายการเงิน", dutyTh: "บริหารความเสี่ยงทางการเงิน การลงทุนขยายนิคม และการเตรียม IPO", minTasks: 38, minSkill: 74, minTenureDays: 24, wageBonus: 26000, mentorPower: 0.48 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสายการเงินและองค์กร (President & CFO Executive)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดด้านยุทธศาสตร์การเงินและธรรมาภิบาลขององค์กร", minTasks: 48, minSkill: 78, minTenureDays: 30, wageBonus: 32000, mentorPower: 0.55 }
    ],
    engineer: [
      { level: 1, gradeCode: "G1", titleTh: "วิศวกรวิจัยและกระบวนการผลิตระดับต้น (Jr. R&D & Process Engineer)", badge: "Lv.1", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "วิจัยพัฒนาผลิตภัณฑ์ใหม่และดูแลความพร้อมเครื่องจักร", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0.05 },
      { level: 2, gradeCode: "G2", titleTh: "วิศวกรระบบและเครื่องกลอาวุโส (Sr. Industrial & R&D Engineer)", badge: "Lv.2", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "พัฒนาแบบแปลนขั้นสูงและซ่อมบำรุงเชิงป้องกัน (PM)", minTasks: 2, minSkill: 50, minTenureDays: 2, wageBonus: 4500, mentorPower: 0.12 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มวิศวกรรมและวิจัย (Engineering & R&D Group Leader)", badge: "Lv.3", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "นำกลุ่มย่อยวิศวกรวิจัยและกลุ่มซ่อมบำรุงเครื่องจักรโรงงาน", minTasks: 5, minSkill: 55, minTenureDays: 4, wageBonus: 6500, mentorPower: 0.18 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดวิศวกรรมและนวัตกรรม (Engineering Section Supervisor)", badge: "Lv.4", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "กำกับหมวดวิจัยผลิตภัณฑ์และหมวดวิศวกรรมระบบอัตโนมัติ", minTasks: 9, minSkill: 59, minTenureDays: 6, wageBonus: 9000, mentorPower: 0.24 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกวิจัยและวิศวกรรม (Asst. R&D & Engineering Manager)", badge: "Lv.5", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "ช่วยบริหารแผนก R&D และวางมาตรฐานกระบวนการผลิต 5 ระบบ", minTasks: 13, minSkill: 62, minTenureDays: 9, wageBonus: 11500, mentorPower: 0.29 },
      { level: 6, gradeCode: "G6", titleTh: "หัวหน้าแผนกวิจัยและวิศวกรรม (R&D & Engineering Dept Manager)", badge: "Lv.6", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "บริหารแผนกวิจัยและซ่อมบำรุง อนุมัติสิทธิบัตรและประเมินวิศวกร", minTasks: 18, minSkill: 65, minTenureDays: 12, wageBonus: 14500, mentorPower: 0.34 },
      { level: 7, gradeCode: "G7", titleTh: "รองผู้อำนวยการฝ่ายเทคโนโลยีและวิศวกรรม (Deputy Engineering Director)", badge: "Lv.7", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "กำกับดูแลแล็บวิจัยและโรงซ่อมบำรุงเครื่องกลทั้งนิคม", minTasks: 24, minSkill: 68, minTenureDays: 15, wageBonus: 18000, mentorPower: 0.39 },
      { level: 8, gradeCode: "G8", titleTh: "ผู้อำนวยการฝ่ายวิจัยและวิศวกรรม (Engineering & R&D Division Director)", badge: "Lv.8", division: "office", departmentTh: "ฝ่ายวิจัยพัฒนาและวิศวกรรมระบบ", dutyTh: "บริหารสายงานวิศวกรรมและวางผังเทคโนโลยีสายการผลิตใหม่", minTasks: 30, minSkill: 71, minTenureDays: 19, wageBonus: 22500, mentorPower: 0.44 },
      { level: 9, gradeCode: "G9", titleTh: "รองกรรมการผู้จัดการใหญ่สายเทคโนโลยี (EVP & Chief Technology Officer - CTO)", badge: "Lv.9", division: "executive", departmentTh: "คณะผู้บริหารระดับสูงสายเทคโนโลยี", dutyTh: "ขับเคลื่อนนวัตกรรมองค์กรและระบบโรงงานอัจฉริยะครบวงจร", minTasks: 38, minSkill: 75, minTenureDays: 24, wageBonus: 27500, mentorPower: 0.5 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสายเทคโนโลยีและนวัตกรรม (President & Chief Scientist)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดด้านวิศวกรรมและเทคโนโลยีอุตสาหกรรมระดับประเทศ", minTasks: 48, minSkill: 79, minTenureDays: 30, wageBonus: 34000, mentorPower: 0.56 }
    ],
    assembler: [
      { level: 1, gradeCode: "G1", titleTh: "พนักงานฝ่ายผลิตหน้าไลน์ (Production Line Operator)", badge: "Lv.1", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "เบิกวัตถุดิบตาม BOM เดินเครื่องจักรและประกอบชิ้นงานหน้าไลน์", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0 },
      { level: 2, gradeCode: "G2", titleTh: "ช่างเทคนิคสายการผลิตชำนาญการ (Sr. Line Technician)", badge: "Lv.2", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "คุมเครื่องจักรความแม่นยำสูง แก้ไขงาน Rework และสอนงานช่างใหม่", minTasks: 3, minSkill: 48, minTenureDays: 2, wageBonus: 3500, mentorPower: 0.12 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มในไลน์ผลิต (Production Line Group Leader)", badge: "Lv.3", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "คุมกลุ่มย่อยในสายพานการผลิต ตรวจสอบจังหวะงานและช่วยลูกทีมหน้าไลน์", minTasks: 6, minSkill: 54, minTenureDays: 4, wageBonus: 5500, mentorPower: 0.18 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดและหัวหน้ากะสายการผลิต (Production Shift Foreman / Supervisor)", badge: "Lv.4", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "ควบคุมโควตาการผลิตประจำกะ ดูแลความปลอดภัย และประเมินหัวหน้ากลุ่ม", minTasks: 10, minSkill: 58, minTenureDays: 6, wageBonus: 8000, mentorPower: 0.24 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกสายการผลิต (Asst. Production Department Manager)", badge: "Lv.5", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "ช่วยผู้จัดการแผนกบริหารตารางเดินเครื่องจักรและเกลี่ยกำลังคนระหว่างไลน์", minTasks: 14, minSkill: 61, minTenureDays: 9, wageBonus: 10500, mentorPower: 0.29 },
      { level: 6, gradeCode: "G6", titleTh: "หัวหน้าแผนกการผลิตประจำไลน์ (Production Department Manager)", badge: "Lv.6", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "บริหารแผนกสายการผลิต (Line A/B/C/D) และอนุมัติเลื่อนตำแหน่งในแผนก", minTasks: 19, minSkill: 64, minTenureDays: 12, wageBonus: 13500, mentorPower: 0.34 },
      { level: 7, gradeCode: "G7", titleTh: "รองหัวหน้าฝ่ายการผลิต / รองผู้จัดการโรงงาน (Deputy Plant & Production Director)", badge: "Lv.7", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "กำกับดูแลทุกแผนกสายการผลิตและประสานงานกับฝ่าย QC/คลังสินค้า", minTasks: 25, minSkill: 67, minTenureDays: 15, wageBonus: 17000, mentorPower: 0.39 },
      { level: 8, gradeCode: "G8", titleTh: "หัวหน้าฝ่ายการผลิต / ผู้จัดการโรงงาน (Plant General Manager / Production Director)", badge: "Lv.8", division: "factory", departmentTh: "ฝ่ายการผลิตและวิศวกรรมสายพาน", dutyTh: "ผู้บัญชาการสูงสุดในโรงงาน คุมทุกอาคารการผลิตและกำหนดโหมดเดินเครื่อง", minTasks: 32, minSkill: 70, minTenureDays: 19, wageBonus: 21500, mentorPower: 0.45 },
      { level: 9, gradeCode: "G9", titleTh: "รองกรรมการผู้จัดการใหญ่สายอุตสาหกรรม (EVP of Manufacturing Operations)", badge: "Lv.9", division: "executive", departmentTh: "คณะผู้บริหารระดับสูงสายโรงงาน", dutyTh: "บริหารเครือข่ายโรงงานทั้งนิคมและวางยุทธศาสตร์การแตกไลน์ผลิตใหม่", minTasks: 40, minSkill: 74, minTenureDays: 24, wageBonus: 26500, mentorPower: 0.5 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสายปฏิบัติการโรงงาน (President of Industrial Operations)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดสายอุตสาหกรรมการผลิตของเครือบริษัท", minTasks: 50, minSkill: 78, minTenureDays: 30, wageBonus: 32500, mentorPower: 0.55 }
    ],
    inspector: [
      { level: 1, gradeCode: "G1", titleTh: "เจ้าหน้าที่ตรวจสอบคุณภาพหน้าไลน์ (QC Line Inspector)", badge: "Lv.1", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "ตรวจสอบคุณภาพชิ้นงานหน้าไลน์และคัดแยกของเสียส่งซ่อม", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0 },
      { level: 2, gradeCode: "G2", titleTh: "ผู้ตรวจสอบมาตรฐานคุณภาพอาวุโส (Sr. QA/IQC Auditor)", badge: "Lv.2", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "ตรวจรับรองมาตรฐานสินค้าสำเร็จรูปและตรวจรับวัตถุดิบ IQC", minTasks: 3, minSkill: 48, minTenureDays: 2, wageBonus: 3500, mentorPower: 0.12 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มตรวจสอบคุณภาพประจำไลน์ (QC Group Leader)", badge: "Lv.3", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "คุมกลุ่มผู้ตรวจ QC ประจำสายพานและสอบเทียบเครื่องมือวัด", minTasks: 6, minSkill: 54, minTenureDays: 4, wageBonus: 5500, mentorPower: 0.18 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดควบคุมคุณภาพกะการผลิต (QC Shift Supervisor)", badge: "Lv.4", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "กำกับหมวดตรวจคุณภาพประจำกะและอนุมัติปล่อยล็อตสินค้าผ่านเกณฑ์", minTasks: 10, minSkill: 58, minTenureDays: 6, wageBonus: 8000, mentorPower: 0.24 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกควบคุมและประกันคุณภาพ (Asst. QC/QA Department Manager)", badge: "Lv.5", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "ช่วยบริหารแผนก QC/QA และวิเคราะห์สาเหตุของเสียร่วมกับวิศวกร", minTasks: 14, minSkill: 61, minTenureDays: 9, wageBonus: 10500, mentorPower: 0.29 },
      { level: 6, gradeCode: "G6", titleTh: "หัวหน้าแผนกควบคุมและประกันคุณภาพ (QC/QA Department Manager)", badge: "Lv.6", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "บริหารแผนกคุณภาพ กำกับมาตรฐาน Zero-Defect และประเมินทีม QC", minTasks: 19, minSkill: 64, minTenureDays: 12, wageBonus: 13500, mentorPower: 0.34 },
      { level: 7, gradeCode: "G7", titleTh: "รองผู้อำนวยการฝ่ายประกันคุณภาพ (Deputy Quality Assurance Director)", badge: "Lv.7", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "กำกับดูแลทั้งแผนก IQC/IPQC และห้องแล็บทดสอบมาตรฐานส่งออก", minTasks: 25, minSkill: 67, minTenureDays: 15, wageBonus: 17000, mentorPower: 0.39 },
      { level: 8, gradeCode: "G8", titleTh: "ผู้อำนวยการฝ่ายประกันคุณภาพและมาตรฐานสากล (Quality Assurance Director)", badge: "Lv.8", division: "factory", departmentTh: "ฝ่ายควบคุมและประกันคุณภาพ (QC/QA)", dutyTh: "บริหารระบบมาตรฐาน ISO/IPC ทั้งนิคมและรับรองคุณภาพระดับโลก", minTasks: 32, minSkill: 70, minTenureDays: 19, wageBonus: 21000, mentorPower: 0.44 },
      { level: 9, gradeCode: "G9", titleTh: "รองกรรมการผู้จัดการใหญ่สายคุณภาพและความยั่งยืน (EVP & Chief Quality Officer)", badge: "Lv.9", division: "executive", departmentTh: "คณะผู้บริหารระดับสูงสายคุณภาพ", dutyTh: "กำหนดนโยบายคุณภาพสูงสุดและธรรมาภิบาลสิ่งแวดล้อม ESG", minTasks: 40, minSkill: 74, minTenureDays: 24, wageBonus: 26000, mentorPower: 0.49 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสายมาตรฐานและคุณภาพองค์กร (President of Quality & ESG)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดด้านมาตรฐานคุณภาพและความเชื่อมั่นระดับนานาชาติ", minTasks: 50, minSkill: 78, minTenureDays: 30, wageBonus: 32000, mentorPower: 0.55 }
    ],
    logistics: [
      { level: 1, gradeCode: "G1", titleTh: "เจ้าหน้าที่คลังสินค้าและแพ็กกิ้ง (Warehouse & Packing Operator)", badge: "Lv.1", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "ตรวจรับวัตถุดิบเข้าคลังและแพ็กสินค้าสำเร็จรูปลงหีบห่อ", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0 },
      { level: 2, gradeCode: "G2", titleTh: "เจ้าหน้าที่ควบคุมสต็อกและจัดส่งอาวุโส (Sr. Dispatch & Inventory Specialist)", badge: "Lv.2", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "บริหารคิวรถขนส่งขาออกและควบคุมบัญชีสต็อกสินค้าสำเร็จรูป", minTasks: 3, minSkill: 48, minTenureDays: 2, wageBonus: 3500, mentorPower: 0.11 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มคลังสินค้าและแพ็กกิ้ง (Warehouse & Packing Group Leader)", badge: "Lv.3", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "คุมกลุ่มงานแพ็กกิ้งและกลุ่มท่าเทียบรถรับ-ส่งสินค้า", minTasks: 6, minSkill: 54, minTenureDays: 4, wageBonus: 5500, mentorPower: 0.17 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดคลังสินค้าและปล่อยรถขนส่ง (Warehouse & Fleet Supervisor)", badge: "Lv.4", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "กำกับหมวดคลังวัตถุดิบและหมวดปล่อยขบวนรถบรรทุกส่งออก", minTasks: 10, minSkill: 58, minTenureDays: 6, wageBonus: 8000, mentorPower: 0.23 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกคลังสินค้าและโลจิสติกส์ (Asst. Warehouse & Logistics Manager)", badge: "Lv.5", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "ช่วยผู้จัดการแผนกวางแผนเส้นทางรถบรรทุกและบริหารพื้นที่ไซโล", minTasks: 14, minSkill: 61, minTenureDays: 9, wageBonus: 10500, mentorPower: 0.28 },
      { level: 6, gradeCode: "G6", titleTh: "หัวหน้าแผนกคลังสินค้าและฟลีทขนส่ง (Warehouse & Fleet Dept Manager)", badge: "Lv.6", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "บริหารแผนกคลังสินค้าและศูนย์ส่งออก อนุมัติขบวนรถและประเมินทีม", minTasks: 19, minSkill: 64, minTenureDays: 12, wageBonus: 13500, mentorPower: 0.33 },
      { level: 7, gradeCode: "G7", titleTh: "รองผู้อำนวยการฝ่ายโลจิสติกส์และกระจายสินค้า (Deputy Logistics Director)", badge: "Lv.7", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "กำกับดูแลคลังวัตถุดิบต้นน้ำและศูนย์กระจายสินค้าส่งออกทั้งหมด", minTasks: 25, minSkill: 67, minTenureDays: 15, wageBonus: 17000, mentorPower: 0.38 },
      { level: 8, gradeCode: "G8", titleTh: "ผู้อำนวยการฝ่ายคลังพัสดุและโลจิสติกส์ (Logistics & Distribution Director)", badge: "Lv.8", division: "factory", departmentTh: "ฝ่ายคลังพัสดุและโลจิสติกส์จัดส่ง", dutyTh: "บริหารเครือข่ายโลจิสติกส์และฟลีทขนส่งทั่วประเทศของนิคม", minTasks: 32, minSkill: 70, minTenureDays: 19, wageBonus: 21000, mentorPower: 0.43 },
      { level: 9, gradeCode: "G9", titleTh: "รองกรรมการผู้จัดการใหญ่สายซัพพลายเชน (EVP & Chief Supply Chain Officer - CSCO)", badge: "Lv.9", division: "executive", departmentTh: "คณะผู้บริหารระดับสูงสายโลจิสติกส์", dutyTh: "กำหนดยุทธศาสตร์ห่วงโซ่อุปทานโลกและศูนย์กระจายสินค้าอัจฉริยะ", minTasks: 40, minSkill: 74, minTenureDays: 24, wageBonus: 26000, mentorPower: 0.48 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสายซัพพลายเชนและโลจิสติกส์ (President of Global Logistics)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดด้านเครือข่ายซัพพลายเชนและการค้าระหว่างประเทศ", minTasks: 50, minSkill: 78, minTenureDays: 30, wageBonus: 32000, mentorPower: 0.55 }
    ],
    coordinator: [
      { level: 1, gradeCode: "G1", titleTh: "เจ้าหน้าที่ประสานงานบริหารและทรัพยากรบุคคล (HR & Corporate Coordinator)", badge: "Lv.1", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "ประสานงานระหว่างออฟฟิศกับโรงงานและดูแลสวัสดิการพนักงาน", minTasks: 0, minSkill: 0, minTenureDays: 0, wageBonus: 0, mentorPower: 0.08 },
      { level: 2, gradeCode: "G2", titleTh: "นักบริหารทรัพยากรบุคคลและกลยุทธ์อาวุโส (Sr. HR & Corporate Planner)", badge: "Lv.2", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "คัดกรองผู้สมัครงาน ประเมินความพึงพอใจ และวางแผนกำลังคน", minTasks: 2, minSkill: 50, minTenureDays: 2, wageBonus: 4500, mentorPower: 0.15 },
      { level: 3, gradeCode: "G3", titleTh: "หัวหน้ากลุ่มงานสรรหาและพัฒนาบุคลากร (HR & Talent Group Leader)", badge: "Lv.3", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "นำกลุ่มงานบริหารบุคคลและศูนย์ฝึกอบรมพัฒนาทักษะ", minTasks: 5, minSkill: 55, minTenureDays: 4, wageBonus: 6500, mentorPower: 0.21 },
      { level: 4, gradeCode: "G4", titleTh: "หัวหน้าหมวดบริหารงานบุคคลและปฏิบัติการ (HR & Operations Supervisor)", badge: "Lv.4", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "กำกับหมวดงานบุคคลและประสานแผนปฏิบัติการประจำสัปดาห์", minTasks: 9, minSkill: 59, minTenureDays: 6, wageBonus: 9000, mentorPower: 0.27 },
      { level: 5, gradeCode: "G5", titleTh: "รองหัวหน้าแผนกทรัพยากรบุคคลและกลยุทธ์ (Asst. HR & Strategy Manager)", badge: "Lv.5", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "ช่วยบริหารแผนกบุคคล โครงสร้างค่าจ้าง และสวัสดิการนิคม", minTasks: 13, minSkill: 62, minTenureDays: 9, wageBonus: 11500, mentorPower: 0.32 },
      { level: 6, gradeCode: "G6", titleTh: "ผู้จัดการแผนกทรัพยากรบุคคลและพัฒนาองค์กร (HR & Organization Dept Manager)", badge: "Lv.6", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "บริหารแผนกทรัพยากรบุคคลและกลั่นกรองบัญชีเลื่อนขั้นประจำวัน", minTasks: 18, minSkill: 65, minTenureDays: 12, wageBonus: 14500, mentorPower: 0.37 },
      { level: 7, gradeCode: "G7", titleTh: "รองผู้อำนวยการฝ่ายบริหารและทรัพยากรบุคคล (Deputy Corporate & HR Director)", badge: "Lv.7", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "กำกับดูแลแผนกกลยุทธ์และแผนกทรัพยากรบุคคลทั้งองค์กร", minTasks: 24, minSkill: 68, minTenureDays: 15, wageBonus: 18500, mentorPower: 0.42 },
      { level: 8, gradeCode: "G8", titleTh: "ผู้อำนวยการฝ่ายบริหารและปฏิบัติการองค์กร (Corporate Operations Director)", badge: "Lv.8", division: "executive", departmentTh: "ฝ่ายสำนักประธานบริหารและพัฒนาองค์กร", dutyTh: "บูรณาการการทำงานระหว่างสายงานออฟฟิศและสายงานโรงงาน", minTasks: 30, minSkill: 71, minTenureDays: 19, wageBonus: 23000, mentorPower: 0.47 },
      { level: 9, gradeCode: "G9", titleTh: "กรรมการผู้จัดการและประธานเจ้าหน้าที่ปฏิบัติการ (Managing Director & COO)", badge: "Lv.9", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "กำกับดูแลทุกสายงานและบริหารการขยายตัวของนิคมอุตสาหกรรม", minTasks: 38, minSkill: 75, minTenureDays: 24, wageBonus: 28000, mentorPower: 0.52 },
      { level: 10, gradeCode: "G10", titleTh: "ประธานเจ้าหน้าที่บริหารสูงสุด (Chief Executive Officer - CEO)", badge: "Lv.10", division: "executive", departmentTh: "สำนักประธานบริหารสูงสุด", dutyTh: "ผู้นำสูงสุดขององค์กร กำหนดวิสัยทัศน์ การลงทุนก่อสร้างอาคาร และอนุมัติผู้บริหารระดับสูง", minTasks: 48, minSkill: 79, minTenureDays: 30, wageBonus: 35000, mentorPower: 0.6 }
    ]
  });

  // 5 Distinct Industrial Production Modes (การแตกไลน์และรูปแบบการผลิตเฉพาะทาง 5 ระบบ)
  const PRODUCTION_MODES = deepFreeze({
    smt_precision: {
      id: "smt_precision",
      nameTh: "สายประกอบไมโครอิเล็กทรอนิกส์ความแม่นยำสูง (SMT Surface-Mount Precision)",
      shortNameTh: "ประกอบวงจร SMT",
      icon: "🔬",
      preferredLines: ["lineA", "lineB"],
      speedModifier: 1.0,
      qualityBonus: 0.03,
      wearRate: 0.9,
      keyAptitudes: ["precision", "analytical"],
      descriptionTh: "ใช้หัววางชิปความละเอียดสูงและกล้อง AOI ตรวจจับจุดบัดกรี เหมาะกับอุปกรณ์สมาร์ตเทคและเซนเซอร์"
    },
    cnc_mechanical: {
      id: "cnc_mechanical",
      nameTh: "สายขึ้นรูปโลหะและประกอบกลไกหนัก (CNC Machining & Mechatronics)",
      shortNameTh: "กลไกหนัก CNC",
      icon: "⚙️",
      preferredLines: ["lineA", "lineC"],
      speedModifier: 1.04,
      qualityBonus: 0.01,
      wearRate: 1.15,
      keyAptitudes: ["dexterity", "stamina"],
      descriptionTh: "ใช้เครื่องกลึง CNC และแขนกลประกอบโครงสร้างโลหะทนแรงบิดสูง เหมาะกับชิ้นส่วนยานยนต์และโรโบติกส์"
    },
    cleanroom_batch: {
      id: "cleanroom_batch",
      nameTh: "สายสกัดและบรรจุปลอดเชื้อแบบล็อต (Cleanroom Sterile Batch Line)",
      shortNameTh: "คลีนรูมปลอดเชื้อ",
      icon: "🧪",
      preferredLines: ["lineB", "lineD"],
      speedModifier: 1.12,
      qualityBonus: 0.04,
      wearRate: 0.75,
      keyAptitudes: ["attention", "precision"],
      descriptionTh: "ควบคุมความดันอากาศและอุณหภูมิปลอดเชื้อ มาตรฐาน GMP/HACCP เหมาะกับอาหารเสริมและชีวภาพ"
    },
    high_voltage_cell: {
      id: "high_voltage_cell",
      nameTh: "สายประกอบเซลล์พลังงานและทดสอบแรงดันสูง (High-Voltage Power Integration)",
      shortNameTh: "เซลล์พลังงาน HV",
      icon: "⚡",
      preferredLines: ["lineC", "lineD"],
      speedModifier: 0.96,
      qualityBonus: 0.05,
      wearRate: 1.1,
      keyAptitudes: ["controlPrecision", "composure"],
      descriptionTh: "เชื่อมต่อโมดูลกักเก็บพลังงานและอินเวอร์เตอร์แรงดันสูง พร้อมห้องทดสอบการคายประจุนิรภัย"
    },
    automated_modular: {
      id: "automated_modular",
      nameTh: "สายประกอบโมดูลอัตโนมัติความเร็วสูง (High-Speed Automated Modular Line)",
      shortNameTh: "โมดูลอัตโนมัติ",
      icon: "🤖",
      preferredLines: ["lineB", "lineC", "lineD"],
      speedModifier: 1.15,
      qualityBonus: 0.02,
      wearRate: 1.0,
      keyAptitudes: ["organization", "dexterity"],
      descriptionTh: "สายพานโมดูลาร์ความเร็วสูงที่สลับรุ่นการผลิตได้ยืดหยุ่น รองรับคำสั่งซื้อ B2B ล็อตใหญ่"
    },
    milling_refining: {
      id: "milling_refining",
      nameTh: "สายโม่บด สกัดบริสุทธิ์ และแปรรูปวัตถุดิบกลางน้ำ (Continuous Milling & Refining)",
      shortNameTh: "โรงโม่/สกัดกลางน้ำ",
      icon: "🌾",
      preferredLines: ["lineA", "lineB", "lineD"],
      speedModifier: 1.14,
      qualityBonus: 0.03,
      wearRate: 0.85,
      keyAptitudes: ["attention", "stamina"],
      descriptionTh: "แปรรูปผลผลิตต้นน้ำ (ข้าวเปลือก ปาล์มดิบ อ้อย น้ำยาง แร่ซิลิกา) ให้เป็นวัตถุดิบกลางน้ำคุณภาพสูงและผลิตภัณฑ์สกัดบริสุทธิ์"
    },
    continuous_food_bake: {
      id: "continuous_food_bake",
      nameTh: "สายอบเบเกอรี่และแปรรูปอาหารต่อเนื่อง (Continuous Tunnel Oven & Food Line)",
      shortNameTh: "สายอบเบเกอรี่/อาหาร",
      icon: "🍞",
      preferredLines: ["lineA", "lineB", "lineD"],
      speedModifier: 1.16,
      qualityBonus: 0.04,
      wearRate: 0.82,
      keyAptitudes: ["tasteSmell", "dexterity"],
      descriptionTh: "เตาอบอุโมงค์ความร้อนคงที่และสายพานแปรรูปอาหารต่อเนื่อง เหมาะสำหรับขนมปังโฮลเกรน เบเกอรี่ และอาหารพร้อมทาน"
    },
    semiconductor_fab: {
      id: "semiconductor_fab",
      nameTh: "ห้องปฏิบัติการหลอมเวเฟอร์และชิปนาโน (Semiconductor Wafer Fab & Nano Line)",
      shortNameTh: "แฟบเซมิคอนดักเตอร์",
      icon: "💎",
      preferredLines: ["lineB", "lineC", "lineD"],
      speedModifier: 0.95,
      qualityBonus: 0.06,
      wearRate: 1.05,
      keyAptitudes: ["analytical", "precision"],
      descriptionTh: "กระบวนการลิโธกราฟีและประกอบชิปความละเอียดระดับนาโนเมตรจากแผ่นซิลิคอนเวเฟอร์และแร่บริสุทธิ์"
    }
  });

  // 3 Corporate Supply Chain & Make-or-Buy Strategies (วิสัยทัศน์การจัดหาวัตถุดิบและบูรณาการแนวดิ่ง)
  const SUPPLY_CHAIN_STRATEGIES = deepFreeze({
    asset_light: {
      id: "asset_light",
      nameTh: "กลยุทธ์ตัวเบา ซื้อวัตถุดิบสำเร็จรูป (Asset-Light / Pure Outsourcing)",
      shortNameTh: "ซื้อสำเร็จรูป (Asset-Light)",
      icon: "🛒",
      descTh: "ไม่เน้นถือครองไร่หรือเดินสายแปรรูปกลางน้ำ สั่งซื้อแป้ง น้ำมัน ชิป และวัตถุดิบจากซัพพลายเออร์ทั้งหมดเพื่อรักษาเงินสดสำรอง"
    },
    balanced_hybrid: {
      id: "balanced_hybrid",
      nameTh: "กลยุทธ์ผสมผสาน แปรรูปเสริมคู่ขนานตลาด (Balanced Make & Buy Hybrid)",
      shortNameTh: "ผสมผสาน (Hybrid Make-or-Buy)",
      icon: "⚖️",
      descTh: "แปรรูปวัตถุดิบจากสินทรัพย์ภายนอกที่มีอยู่เพื่อลดต้นทุน และสั่งซื้อส่วนที่ขาดจากซัพพลายเออร์ควบคู่กันอย่างยืดหยุ่น"
    },
    vertical_integration: {
      id: "vertical_integration",
      nameTh: "กลยุทธ์บูรณาการแนวดิ่ง ต้นน้ำ-กลางน้ำ-ปลายน้ำ (Full Vertical Integration)",
      shortNameTh: "กินรวบห่วงโซ่ (Vertical Integration)",
      icon: "🏭",
      descTh: "มุ่งลงทุนสินทรัพย์ต้นน้ำ (ไร่ข้าว สวนปาล์ม เหมืองแร่) และเดินเครื่องโรงโม่/โรงกลั่นกลางน้ำเต็มพิกัดเพื่อพึ่งพาตนเองและทำกำไรสูงสุด"
    }
  });

  // Resource Origin & Classification Taxonomy (Chapter 23: แยกประเภททรัพยากรและแหล่งกำเนิดออกจากลำดับการแปรรูป)
  const RESOURCE_CLASSES = deepFreeze({
    natural_deposit: {
      id: "natural_deposit",
      nameTh: "แหล่งแร่และธรณีวิทยาธรรมชาติ (Finite Natural Deposit)",
      isTrueNaturalResource: true,
      stockBehavior: "finite_depletable",
      descTh: "ทรัพยากรธรรมชาติใต้ดินที่มีปริมาณสำรองจำกัด (แร่ซิลิกา แร่บ็อกไซต์ แร่เหล็ก/ทองแดง แร่ลิเธียม หินฟอสเฟต ปิโตรเลียมดิบ) ขุดแล้วปริมาณสำรองลดลงจริง"
    },
    environmental_flow: {
      id: "environmental_flow",
      nameTh: "แหล่งทรัพยากรหมุนเวียนและกระแสธรรมชาติ (Environmental Flow)",
      isTrueNaturalResource: true,
      stockBehavior: "flow_rate_limited",
      descTh: "ทรัพยากรธรรมชาติที่ไหลเข้าตามสภาพแวดล้อมและจำกัดด้วยกำลังเครื่องสูบ/แปลงพลังงาน (น้ำดิบ พลังงานแสงอาทิตย์/ลม อากาศ)"
    },
    biological_seed: {
      id: "biological_seed",
      nameTh: "เมล็ดพันธุ์และต้นพันธุ์ชีวภาพ (Biological Seed & Propagule)",
      isTrueNaturalResource: false,
      stockBehavior: "biological_cycle",
      descTh: "เมล็ดพันธุ์ข้าว ท่อนพันธุ์อ้อย ต้นกล้าปาล์ม/ไม้เศรษฐกิจ และเมล็ดถั่วเหลือง ต้องหักใช้จริงเมื่อปลูกลงแปลงและคัดเก็บจากผลผลิตที่ยังงอกได้"
    },
    agricultural_crop: {
      id: "agricultural_crop",
      nameTh: "ผลผลิตชีวภาพจากการเพาะปลูก ป่าปลูก และปศุสัตว์ (Cultivated Biological Output)",
      isTrueNaturalResource: false,
      stockBehavior: "cultivated_harvest",
      descTh: "ข้าวเปลือก ลำอ้อยสด ทะลายปาล์ม ถั่วเหลือง น้ำนมโคสด น้ำยางพารา และท่อนไม้ปลูก เกิดจากวงจรเพาะปลูก/เลี้ยงดูที่ใช้เวลา น้ำ ปุ๋ย และแรงงาน ไม่ใช่ทรัพยากรธรรมชาติ T0 ฟรี"
    },
    soil_input: {
      id: "soil_input",
      nameTh: "ปุ๋ยและธาตุอาหารบำรุงดินจากกระบวนการผลิต (Manufactured Soil Nutrient)",
      isTrueNaturalResource: false,
      stockBehavior: "manufactured_input",
      descTh: "ปุ๋ยเคมี N-P-K จากแร่ฟอสเฟต/โพแทช และปุ๋ยหมักอินทรีย์จากรำข้าว/แกลบ/เศษพืช ใช้เติมธาตุอาหารในดินที่ถูกดึงไปทุกการเก็บเกี่ยว"
    },
    byproduct_waste: {
      id: "byproduct_waste",
      nameTh: "ผลพลอยได้และวัสดุหมุนเวียนจากกระบวนการแปรรูป (Process Byproduct)",
      isTrueNaturalResource: false,
      stockBehavior: "byproduct_recovery",
      descTh: "รำข้าวและแกลบจากการสีข้าวเปลือก ใช้เป็นอาหารสัตว์ฟาร์มโคนมหรือหมักเป็นปุ๋ยอินทรีย์คืนสู่แปลงเกษตร"
    },
    refined_material: {
      id: "refined_material",
      nameTh: "วัตถุดิบแปรรูปขั้นต้น (First-Stage Refined Material)",
      isTrueNaturalResource: false,
      stockBehavior: "industrial_refined",
      descTh: "ข้าวสารขัดสี แป้งโม่ น้ำตาลทราย น้ำมันปาล์มบริสุทธิ์ แผ่นโลหะ ขดลวดทองแดง เม็ดพลาสติก กล่องลูกฟูก ขวดแก้ว และแท่งซิลิคอน MG-Si"
    },
    intermediate_part: {
      id: "intermediate_part",
      nameTh: "วัสดุวิศวกรรมและกึ่งสำเร็จรูปขั้นกลาง (Midstream Intermediate)",
      isTrueNaturalResource: false,
      stockBehavior: "industrial_intermediate",
      descTh: "โดว์ขนมปัง หัวเชื้อโพรไบโอติกส์ ซองฟอยล์ ตัวถัง ชุดสายไฟ ครีบระบายความร้อน เลนส์ออปติคัล สารแคโทด และแผ่นซิลิคอนเวเฟอร์"
    },
    high_tech_component: {
      id: "high_tech_component",
      nameTh: "ชิ้นส่วนอิเล็กทรอนิกส์และโมดูลไฮเทค (Tech-Gated Component)",
      isTrueNaturalResource: false,
      stockBehavior: "tech_gated_component",
      descTh: "ดอกลำโพง แผงวงจร PCB โมดูล LED เซนเซอร์ MEMS โซลาร์เซลล์ แบตเตอรี่ลิเธียม ชิปไมโครโพรเซสเซอร์ และชิปกำลังไฟฟ้า IGBT"
    },
    operational_consumable: {
      id: "operational_consumable",
      nameTh: "เชื้อเพลิงและอะไหล่สิ้นเปลืองสำหรับกองรถและเครื่องจักร (Fleet & Plant Consumable)",
      isTrueNaturalResource: false,
      stockBehavior: "operational_consumable",
      descTh: "น้ำมันดีเซลหมุนเร็ว B7 และยางรถบรรทุกเรเดียล ใช้เดินรถขนส่งตามระยะทางจริงและเปลี่ยนตามสภาพสึกหรอ"
    }
  });

  // 4 Agricultural Crop Lifecycles (8-Stage Cultivation Engine: เตรียมดิน -> ปลูกหักเมล็ด -> ดูแลน้ำ/ปุ๋ย -> เก็บเกี่ยว -> คัดเมล็ดพันธุ์ -> พักดิน/ปลูกรอบถัดไป)
  const AGRICULTURE_CROPS = deepFreeze({
    winter_wheat: {
      id: "winter_wheat",
      nameTh: "ข้าวสาลีอบขนมปัง (Bread Wheat)",
      icon: "🌾",
      assetId: "jasmine_rice_farm",
      seedMaterialId: "wheat_seed",
      seedPerPlot: 2,
      waterPerCycle: 2,
      fertilizerPerCycle: 1,
      growthMinutes: 720,
      harvestMaterialId: "wheat_grain",
      baseHarvestYield: 7,
      seedSaveDefaultRatio: 0.25,
      byproductMaterialId: "rice_bran_husk",
      byproductYield: 1,
      forbiddenSeedIds: ["wheat_flour", "artisan_flour", "milled_rice", "bakery_dough_butter"],
    },
    jasmine_rice: {
      id: "jasmine_rice",
      nameTh: "นาข้าวหอมมะลิทุ่งกุลาร้องไห้ (8 ขั้นตอนวงจรเพาะปลูก)",
      icon: "🌾",
      assetId: "jasmine_rice_farm",
      seedMaterialId: "rice_seed",
      seedRequired: 2,
      waterRequired: 2,
      nutrientDrainPerCycle: 22,
      moistureDrainPerCycle: 20,
      growthMinutes: 1440,
      harvestMaterialId: "paddy_grain",
      baseGrossYield: 12,
      byproductMaterialId: "rice_bran_husk",
      byproductYield: 2,
      defaultSeedSaveRatio: 0.25,
      forbiddenSeedIds: ["milled_rice", "artisan_flour", "bakery_dough_butter"],
      cycleDescTh: "ที่ดินแปลงนา + เมล็ดพันธุ์ข้าว (rice_seed) + น้ำดิบ + ปุ๋ยธาตุอาหาร ➔ เก็บเกี่ยวข้าวเปลือก (paddy_grain) ➔ คัด 25% เก็บเป็นเมล็ดพันธุ์รอบถัดไป และส่งที่เหลือเข้าโรงสีเป็นข้าวสาร (milled_rice) + รำข้าว/แกลบ (rice_bran_husk) ➔ โม่เป็นแป้ง (artisan_flour)"
    },
    sugarcane: {
      id: "sugarcane",
      nameTh: "ไร่อ้อยปลอดการเผา (ปลูกด้วยท่อนพันธุ์อ้อยสด)",
      icon: "🎋",
      assetId: "sugarcane_estate",
      seedMaterialId: "cane_stalk_seed",
      seedRequired: 2,
      waterRequired: 2,
      nutrientDrainPerCycle: 24,
      moistureDrainPerCycle: 18,
      growthMinutes: 1440,
      harvestMaterialId: "raw_cane",
      baseGrossYield: 12,
      byproductMaterialId: "organic_compost",
      byproductYield: 2,
      defaultSeedSaveRatio: 0.25,
      forbiddenSeedIds: ["refined_sugar_syrup", "raw_extract"],
      cycleDescTh: "แปลงไร่อ้อย + ท่อนพันธุ์อ้อย (cane_stalk_seed) + น้ำดิบ + ปุ๋ย ➔ เก็บเกี่ยวลำอ้อยสด (raw_cane) ➔ คัดท่อนพันธุ์ปลูกรอบหน้า และส่งอ้อยเข้าโรงหีบเคี่ยวเป็นน้ำตาลบริสุทธิ์ (refined_sugar_syrup)"
    },
    oil_palm: {
      id: "oil_palm",
      nameTh: "สวนปาล์มน้ำมันสุราษฎร์ธานี (ปลูกด้วยต้นกล้าปาล์มพันธุ์ดี)",
      icon: "🌴",
      assetId: "palm_oil_plantation",
      seedMaterialId: "palm_seedling",
      seedRequired: 2,
      waterRequired: 2,
      nutrientDrainPerCycle: 20,
      moistureDrainPerCycle: 18,
      growthMinutes: 1440,
      harvestMaterialId: "crude_palm",
      baseGrossYield: 12,
      byproductMaterialId: "organic_compost",
      byproductYield: 2,
      defaultSeedSaveRatio: 0.25,
      forbiddenSeedIds: ["refined_palm_oil", "diesel_liter"],
      cycleDescTh: "แปลงสวนปาล์ม + ต้นกล้าปาล์ม (palm_seedling) + น้ำดิบ + ปุ๋ย ➔ เก็บเกี่ยวทะลายปาล์มสด (crude_palm) ➔ กลั่นเป็นน้ำมันปาล์มบริสุทธิ์/เนยขาว (refined_palm_oil) และไบโอดีเซล"
    },
    soy_herb: {
      id: "soy_herb",
      nameTh: "แปลงถั่วเหลืองและสมุนไพรออร์แกนิก (พืชตระกูลถั่วบำรุงดิน)",
      icon: "🌿",
      assetId: "organic_herb_orchard",
      seedMaterialId: "soybean_seed",
      seedRequired: 2,
      waterRequired: 2,
      nutrientDrainPerCycle: 14,
      moistureDrainPerCycle: 16,
      growthMinutes: 1440,
      harvestMaterialId: "soybean_crop",
      baseGrossYield: 10,
      byproductMaterialId: "organic_compost",
      byproductYield: 2,
      defaultSeedSaveRatio: 0.25,
      forbiddenSeedIds: ["raw_extract", "probiotic_culture"],
      cycleDescTh: "แปลงเกษตรอินทรีย์ + เมล็ดพันธุ์ถั่วเหลือง/สมุนไพร (soybean_seed) + น้ำดิบ + ปุ๋ยหมัก ➔ เก็บเกี่ยวผลผลิต (soybean_crop) ➔ คัดพันธุ์และส่งสกัดสุญญากาศเป็นสารสกัดเข้มข้น (raw_extract)"
    }
  });

  // Pillar 1 Business Expansion (Chapter 19): Fleet Freight Transport Vehicles & Route Graph
  const FLEET_VEHICLES = deepFreeze({
    dry_6w: {
      id: "dry_6w",
      nameTh: "รถบรรทุกตู้ทึบ 6 ล้อ (Dry Cargo Box Truck)",
      icon: "🚚",
      purchaseCost: 3500000, // ฿35,000 in game satang scale
      dailyLeaseCost: 180000, // ฿1,800/day
      leaseDepositSatang: 900000, // 5-day lease deposit (฿9,000)
      maxWeightKg: 6500,
      maxVolumeM3: 28,
      baseLitersPerKm: 0.18,
      supportedCargoTypes: ["dry", "general", "packaging"],
      speedKmPerHour: 60,
      maintenanceCost: 350000,
      descTh: "รถบรรทุกตู้ทึบมาตรฐานสำหรับงานเหมาคันโรงงานถึงโรงงานและขนส่งร่วมหลายลูกค้า"
    },
    reefer_6w: {
      id: "reefer_6w",
      nameTh: "รถบรรทุกห้องเย็นควบคุมอุณหภูมิ (Cold-Chain Reefer Truck)",
      icon: "❄️",
      purchaseCost: 4800000, // ฿48,000 in game satang scale
      dailyLeaseCost: 250000,
      leaseDepositSatang: 1250000, // 5-day lease deposit (฿12,500)
      maxWeightKg: 6000,
      maxVolumeM3: 24,
      baseLitersPerKm: 0.24,
      supportedCargoTypes: ["cold_chain", "food", "biomed", "dry"],
      speedKmPerHour: 58,
      maintenanceCost: 480000,
      descTh: "รถห้องเย็นพร้อมเซนเซอร์บันทึกอุณหภูมิสำหรับขนส่งเบเกอรี่ นมสด และเวชภัณฑ์ (ใช้น้ำมันทำความเย็นเพิ่ม)"
    },
    heavy_10w: {
      id: "heavy_10w",
      nameTh: "รถหัวลากและหางพ่วงบรรทุกหนัก 10 ล้อ (Heavy Flatbed & Trailer)",
      icon: "🚛",
      purchaseCost: 6500000, // ฿65,000 in game satang scale
      dailyLeaseCost: 340000,
      leaseDepositSatang: 1700000, // 5-day lease deposit (฿17,000)
      maxWeightKg: 16000,
      maxVolumeM3: 54,
      baseLitersPerKm: 0.29,
      supportedCargoTypes: ["heavy_machinery", "ore_metal", "dry", "general"],
      speedKmPerHour: 52,
      maintenanceCost: 650000,
      descTh: "รถบรรทุกหนักสำหรับขนส่งแร่ แผ่นโลหะ แบตเตอรี่ EV และเครื่องจักรอุตสาหกรรม"
    }
  });

  const FREIGHT_ROUTES = deepFreeze([
    {
      id: "route_eec_bkk",
      nameTh: "นิคมลาดกระบัง ➔ ศูนย์กระจายสินค้าบางนา-ตราด (ไป-กลับ)",
      originTh: "นิคมลาดกระบัง กรุงเทพฯ",
      destinationTh: "ศูนย์กระจายสินค้าบางนา-ตราด",
      pickupEmptyKm: 15,
      outboundLoadedKm: 105,
      backhaulEmptyKm: 120,
      tollFeeSatang: 20000, // ฿200
      baseRateSatang: 450000, // ฿4,500 (ตรงตามตัวอย่างบทที่ 19: 120 กม. ไป + 120 กม. กลับเปล่า)
      cargoType: "dry",
      cargoNameTh: "ชิ้นส่วนอิเล็กทรอนิกส์และพัสดุโรงงาน",
      weightKg: 4200,
      volumeM3: 18,
      cargoValueSatang: 18000000,
      clientCorpId: "metro_retail"
    },
    {
      id: "route_chacheongsao_rayong",
      nameTh: "นิคมอมตะชลบุรี ➔ นิคมอีสเทิร์นซีบอร์ด ระยอง",
      originTh: "นิคมอมตะซิตี้ ชลบุรี",
      destinationTh: "นิคมอีสเทิร์นซีบอร์ด ระยอง",
      pickupEmptyKm: 20,
      outboundLoadedKm: 95,
      backhaulEmptyKm: 115,
      tollFeeSatang: 24000,
      baseRateSatang: 520000,
      cargoType: "ore_metal",
      cargoNameTh: "แผ่นโลหะขึ้นรูปและชุดสายไฟยานยนต์ EV",
      weightKg: 9500,
      volumeM3: 32,
      cargoValueSatang: 32000000,
      clientCorpId: "asia_autoparts"
    },
    {
      id: "route_pathum_bkk_cold",
      nameTh: "อุทยานวิทยาศาสตร์ ปทุมธานี ➔ เครือโรงพยาบาลและเชนอาหารกรุงเทพฯ",
      originTh: "ปทุมธานี",
      destinationTh: "กรุงเทพฯ ชั้นใน",
      pickupEmptyKm: 18,
      outboundLoadedKm: 82,
      backhaulEmptyKm: 100,
      tollFeeSatang: 18000,
      baseRateSatang: 580000,
      cargoType: "cold_chain",
      cargoNameTh: "โภชนเภสัชและโดว์ครัวซองต์แช่แข็งควบคุมอุณหภูมิ",
      weightKg: 3800,
      volumeM3: 16,
      cargoValueSatang: 26000000,
      clientCorpId: "cp_health"
    },
    {
      id: "route_ayutthaya_laemchabang",
      nameTh: "นิคมโรจนะ อยุธยา ➔ ท่าเรือแหลมฉบัง ชลบุรี",
      originTh: "นิคมโรจนะ อยุธยา",
      destinationTh: "ท่าเรือแหลมฉบัง ชลบุรี",
      pickupEmptyKm: 25,
      outboundLoadedKm: 165,
      backhaulEmptyKm: 190,
      tollFeeSatang: 35000,
      baseRateSatang: 790000,
      cargoType: "dry",
      cargoNameTh: "เซนเซอร์หุ่นยนต์และอุปกรณ์ส่งออกญี่ปุ่น",
      weightKg: 5400,
      volumeM3: 22,
      cargoValueSatang: 45000000,
      clientCorpId: "tokyo_elec"
    },
    {
      id: "route_eec_singapore_feeder",
      nameTh: "นิคมแหลมฉบัง ➔ ท่าเรือฟีดเดอร์สิงคโปร์-จูร่ง (คอนเทนเนอร์ห้องเย็นข้ามชาติ)",
      originTh: "ท่าเรือแหลมฉบัง ชลบุรี",
      destinationTh: "ศูนย์กระจายสินค้าท่าเรือจูร่ง-สิงคโปร์",
      pickupEmptyKm: 20,
      outboundLoadedKm: 130,
      backhaulEmptyKm: 150,
      tollFeeSatang: 28000,
      baseRateSatang: 680000,
      cargoType: "cold_chain",
      cargoNameTh: "เวชภัณฑ์ปลอดเชื้อและอาหารพรีเมียมส่งออกฮับสิงคโปร์",
      weightKg: 4600,
      volumeM3: 20,
      cargoValueSatang: 38000000,
      clientCorpId: "singapore_port_3pl"
    },
    {
      id: "route_maptaphut_metal_heavy",
      nameTh: "ท่าเรือมาบตาพุด ➔ โรงถลุงและนิคมอมตะชลบุรี (ขนส่งแร่และเหล็กโครงสร้างหนัก)",
      originTh: "ท่าเรืออุตสาหกรรมมาบตาพุด ระยอง",
      destinationTh: "นิคมอมตะซิตี้ ชลบุรี",
      pickupEmptyKm: 18,
      outboundLoadedKm: 112,
      backhaulEmptyKm: 130,
      tollFeeSatang: 30000,
      baseRateSatang: 740000,
      cargoType: "ore_metal",
      cargoNameTh: "แร่บ็อกไซต์ เหล็กกล้าแผ่นรีดร้อน และโปรไฟล์อะลูมิเนียม",
      weightKg: 12500,
      volumeM3: 42,
      cargoValueSatang: 42000000,
      clientCorpId: "siam_metal"
    }
  ]);

  // Pillar 2 Business Expansion (Chapter 20): Software House, Custom Dev & 8 SaaS Applications
  const SOFTWARE_APPS = deepFreeze({
    pos_retail: {
      id: "pos_retail",
      nameTh: "ระบบหน้าร้านและตัดสต็อกอัจฉริยะ (Smart POS & Offline Sync)",
      icon: "🖥️",
      targetSector: "food",
      targetClients: ["cp_health", "metro_retail", "siam_naturals"],
      contractPriceSatang: 12000000, // ฿120,000 (ตรงตามตัวอย่างบทที่ 20: มัดจำ 30% / รับมอบทดสอบ 40% / เปิดใช้ 30%)
      devWorkMinutes: 120,
      qaWorkMinutes: 45,
      computeCostSatang: 500000, // ฿5,000
      saasMonthlyFeePerUserSatang: 60000, // ฿600/บัญชี/รอบ
      serverUsersPerUnit: 25,
      internalBenefitTh: "เชื่อมระบบขายและตัดสต็อกอัตโนมัติ เพิ่มความแม่นยำการประเมินดีลฝ่ายขาย +5%",
      descTh: "ระบบขายหน้าร้าน ตัดสต็อกแบบออฟไลน์แล้วซิงก์ขึ้นคลาวด์ เหมาะสำหรับเชนร้านอาหารและค้าปลีก"
    },
    queue_booking: {
      id: "queue_booking",
      nameTh: "แอปจองคิวและบริหารตารางนัดหมาย (Smart Slot & Queue Manager)",
      icon: "📅",
      targetSector: "biomed",
      targetClients: ["biomed_siam", "cp_health"],
      contractPriceSatang: 11000000,
      devWorkMinutes: 110,
      qaWorkMinutes: 40,
      computeCostSatang: 450000,
      saasMonthlyFeePerUserSatang: 55000,
      serverUsersPerUnit: 30,
      internalBenefitTh: "จัดคิวท่าเทียบรถและตารางนัดหมายลูกค้า ลดเวลารอคิวหน้าคลัง",
      descTh: "ระบบจองคิวตาม capacity รายเวลา เก็บมัดจำและป้องกันคิวชนสำหรับคลินิกและศูนย์บริการ"
    },
    tms_fleet: {
      id: "tms_fleet",
      nameTh: "แพลตฟอร์มบริหารกองรถขนส่งและหลักฐานส่งของ (Fleet TMS & e-POD)",
      icon: "🚛",
      targetSector: "general",
      targetClients: ["metro_retail", "asia_autoparts", "siam_metal"],
      contractPriceSatang: 15000000,
      devWorkMinutes: 140,
      qaWorkMinutes: 50,
      computeCostSatang: 600000,
      saasMonthlyFeePerUserSatang: 75000,
      serverUsersPerUnit: 20,
      internalBenefitTh: "เมื่อติดตั้งใช้เองในบริษัท ช่วยลดระยะทางวิ่งรถเปล่าและประหยัดน้ำมันกองรถขนส่ง -8%",
      descTh: "ระบบจัดเที่ยวรถ จองคนขับ คำนวณเชื้อเพลิงขาไป-ขากลับ และบันทึกหลักฐานส่งมอบ e-POD"
    },
    wms_warehouse: {
      id: "wms_warehouse",
      nameTh: "ระบบบริหารคลังสินค้า บาร์โค้ด และล็อตวัตถุดิบ (Smart WMS & Lot Tracker)",
      icon: "📦",
      targetSector: "tech",
      targetClients: ["siam_tech", "tokyo_elec", "metro_retail"],
      contractPriceSatang: 14000000,
      devWorkMinutes: 130,
      qaWorkMinutes: 45,
      computeCostSatang: 550000,
      saasMonthlyFeePerUserSatang: 70000,
      serverUsersPerUnit: 22,
      internalBenefitTh: "เมื่อติดตั้งใช้เองในคลังสินค้า ช่วยเพิ่มความเร็วงานแพ็กกิ้งและตรวจรับพัสดุ +8%",
      descTh: "ระบบระบุตำแหน่งพาเลท บาร์โค้ด และอายุเก็บเมล็ดพันธุ์/วัตถุดิบตามล็อตจริง"
    },
    hr_payroll: {
      id: "hr_payroll",
      nameTh: "ระบบบริหารงานบุคคล กะทำงาน และเงินเดือน (Enterprise HRIS & Payroll)",
      icon: "👥",
      targetSector: "multi",
      targetClients: ["apex_ind", "titan_elec", "siam_tech"],
      contractPriceSatang: 13500000,
      devWorkMinutes: 125,
      qaWorkMinutes: 45,
      computeCostSatang: 500000,
      saasMonthlyFeePerUserSatang: 65000,
      serverUsersPerUnit: 25,
      internalBenefitTh: "เมื่อติดตั้งใช้เอง ช่วยลดเวลาจัดการเอกสารฝ่ายบุคคลและเพิ่มความพึงพอใจพนักงาน",
      descTh: "ระบบคำนวณกะทำงาน ค่าล่วงเวลา OT โบนัสผลงาน และสิทธิ์การเข้าถึงข้อมูลพนักงาน"
    },
    doc_procurement: {
      id: "doc_procurement",
      nameTh: "ระบบใบขอซื้อ อนุมัติงบ และเอกสารดิจิทัล (e-Procurement & Audit Trail)",
      icon: "📑",
      targetSector: "automotive",
      targetClients: ["siam_metal", "eastern_auto", "petro_chem_siam"],
      contractPriceSatang: 12500000,
      devWorkMinutes: 115,
      qaWorkMinutes: 40,
      computeCostSatang: 480000,
      saasMonthlyFeePerUserSatang: 62000,
      serverUsersPerUnit: 25,
      internalBenefitTh: "เมื่อติดตั้งใช้เอง ช่วยเร่งความเร็วการออกใบสั่งซื้อ PO และวางบิล Invoice +10%",
      descTh: "ระบบตรวจสอบใบขอซื้อ อนุมัติหลายระดับ และเก็บประวัติการแก้ไขเพื่อการตรวจสอบบัญชี"
    },
    field_service: {
      id: "field_service",
      nameTh: "แอปบริหารงานช่างซ่อมบำรุงและสอบเทียบภาคสนาม (Field Service & PM App)",
      icon: "🛠️",
      targetSector: "energy",
      targetClients: ["green_power", "pacific_solar", "solartech_asia"],
      contractPriceSatang: 14500000,
      devWorkMinutes: 135,
      qaWorkMinutes: 45,
      computeCostSatang: 580000,
      saasMonthlyFeePerUserSatang: 72000,
      serverUsersPerUnit: 20,
      internalBenefitTh: "เมื่อติดตั้งใช้เอง ช่วยลดอัตราการสึกหรอของเครื่องจักรโรงงานและรถบรรทุก -6%",
      descTh: "แอปจัดตารางทีมช่าง เบิกอะไหล่ บันทึกรูปหลักฐานก่อน-หลังซ่อม และใบรับรองการสอบเทียบ"
    },
    ai_doc_assistant: {
      id: "ai_doc_assistant",
      nameTh: "ผู้ช่วย AI ค้นหาเอกสารวิศวกรรมและคู่มือโรงงาน (Enterprise RAG AI Assistant)",
      icon: "🤖",
      targetSector: "aerospace_robotics",
      targetClients: ["siam_aero_robotics", "tokyo_elec", "biomed_siam"],
      contractPriceSatang: 18500000,
      devWorkMinutes: 160,
      qaWorkMinutes: 60,
      computeCostSatang: 850000,
      saasMonthlyFeePerUserSatang: 95000,
      serverUsersPerUnit: 15,
      internalBenefitTh: "เมื่อติดตั้งใช้เอง ช่วยวิศวกรค้นหาคู่มือและงานวิจัย R&D ได้เร็วขึ้น (+แต้มวิจัย +10%)",
      descTh: "ระบบค้นหาเอกสารภายในตามสิทธิ์พร้อมอ้างอิงแหล่งที่มา มีการคิดโควตา API และแจ้งเตือนเมื่อคำถามอยู่นอกขอบเขตข้อมูล"
    }
  });

  // 4 Distinct Factory Sector Process & Business Models (ผ่าตัดธุรกิจโรงงานเดิมให้แต่ละอุตสาหกรรมมีโปรเซส ความเสี่ยง และโมเดลธุรกิจของตัวเองจริง)
  const SECTOR_PROCESS_MODELS = deepFreeze({
    food_bakery_batch: {
      id: "food_bakery_batch",
      nameTh: "โมเดลธุรกิจอาหารสด เบเกอรี่ และเครื่องดื่ม (Batch Fermentation, Shelf-Life & Cold-Chain Consignment)",
      icon: "🍞",
      industries: ["food"],
      stagesTh: [
        "1. ชั่งตวงและนวดผสมแบตช์ (Batch Mixing & Kneading)",
        "2. หมักโดว์/พาสเจอร์ไรซ์และอบอุโมงค์ความร้อน (Fermentation & Tunnel Baking)",
        "3. ตรวจวัดความชื้น เชื้อจุลินทรีย์ และชิมรสชาติ (Food Safety & Sensory QC)",
        "4. ซีลสุญญากาศ/คุมอุณหภูมิและประทับวันหมดอายุ (Cold-Seal & Shelf-Life Stamp)"
      ],
      shelfLifeDaysBase: 3,
      shelfLifeDaysColdChain: 7,
      freshnessDecayPerDay: 28,
      freshnessDecayColdChain: 10,
      freshBonusThresholdPct: 80,
      freshPriceBonusPct: 0.06,
      staleMarkdownPct: 0.12,
      uniqueMechanismTh: "ผลิตเป็นแบตช์เตาอบ มีค่าความสด (freshnessPct 100%➔0%) และวันหมดอายุจริง หากค้างคลังจนหมดอายุจะบูดเสีย (Spoilage) ต้องตัดเป็นของเสียและนำไปหมักปุ๋ยอินทรีย์ หากส่งมอบตอนสดใหม่ได้โบนัสราคา +6% แต่ถ้าใกล้หมดอายุถูกหัก Markdown -12%"
    },
    electronics_smt_rma: {
      id: "electronics_smt_rma",
      nameTh: "โมเดลธุรกิจอิเล็กทรอนิกส์และเซมิคอนดักเตอร์ (SMT Pick-and-Place, Firmware Revision & Post-Sale RMA Warranty)",
      icon: "🔌",
      industries: ["tech"],
      stagesTh: [
        "1. วางชิป SMT และบัดกรีเตา Reflow (SMT Pick-and-Place & Reflow)",
        "2. แฟลชเฟิร์มแวร์และประกอบตัวถัง (Firmware Flash & Enclosure)",
        "3. ทดสอบจ่ายไฟ Burn-in และสแกนวงจร AOI/ICT (Burn-In & ICT Test)",
        "4. แพ็กถุงกันไฟฟ้าสถิต ESD และยิงเลข Serial (ESD Serialization Pack)"
      ],
      warrantyPeriodDays: 14,
      baseRmaRiskPct: 0.08,
      rmaRepairMaterialId: "pcb",
      rmaCashCompensationSatang: 35000,
      uniqueMechanismTh: "มีรุ่นฮาร์ดแวร์/เฟิร์มแวร์ (Revision) และเมื่อส่งมอบแล้วสินค้าจะเข้าสู่พูลรับประกันหลังการขาย (Active Warranty Pool) หากคุณภาพคาบเส้นจะเกิดใบเคลมประกัน RMA ที่ต้องใช้วิศวกรและอะไหล่ซ่อมเคลมหรือชดเชยเงินให้ลูกค้า"
    },
    automotive_oem_tooling: {
      id: "automotive_oem_tooling",
      nameTh: "โมเดลธุรกิจยานยนต์ EV พลังงาน และเครื่องจักรกลหนัก (CNC Die Tooling Changeover & HV Dyno Certification)",
      icon: "⚡",
      industries: ["automotive", "energy", "aerospace_robotics"],
      stagesTh: [
        "1. ตั้งแม่พิมพ์ปั๊มโลหะและสอบเทียบแขนกล CNC (Die Tooling Setup & Changeover)",
        "2. เชื่อมเลเซอร์เซลล์แรงดันสูงและประกอบชุดส่งกำลัง (HV Cell & Powertrain Integration)",
        "3. ทดสอบฉนวนแรงดันสูง Dielectric และขึ้นแท่น Dyno (HV Safety & Dyno Stress Test)",
        "4. ตีลังเหล็กและล็อกโช้คกันกระแทกส่งมอบ OEM (Heavy OEM Crate Rigging)"
      ],
      changeoverCostSatang: 45000,
      changeoverPenaltyMinutes: 15,
      sameModelRhythmBonusPct: 0.12,
      uniqueMechanismTh: "สายการผลิตจำแม่พิมพ์ (Tooling Jig) ของรุ่นสินค้าที่กำลังผลิต หากสลับไปผลิตรุ่นอื่นต้องเสียเวลาและต้นทุนตั้งแม่พิมพ์ใหม่ (Changeover Cost) แต่หากเดินสายพานรุ่นเดิมต่อเนื่องจะได้โบนัสความเร็ว +12%"
    },
    biomed_sterile_lot: {
      id: "biomed_sterile_lot",
      nameTh: "โมเดลธุรกิจชีวการแพทย์และโภชนเภสัชคลีนรูม (Aseptic Formulation, Clinical Assay & Lot Quarantine Release)",
      icon: "🧬",
      industries: ["biomed"],
      stagesTh: [
        "1. เตรียมสารชีวภาพในห้องคลีนรูมแรงดันบวก (ISO Class-5 Sterile Formulation)",
        "2. บรรจุปลอดเชื้อและประกอบไบโอเซนเซอร์ (Aseptic Clinical Filling)",
        "3. เพาะเชื้อตรวจการปนเปื้อนและวัดความแม่นยำคลินิก (Microbial & Potency Assay)",
        "4. กักกันตรวจปล่อยล็อตและติดฉลากควบคุม Lot (Quarantine Release & Lot Seal)"
      ],
      minSterilityScore: 70,
      clinicalPremiumPct: 0.09,
      uniqueMechanismTh: "ต้องควบคุมดัชนีความปลอดเชื้อของคลีนรูม (Sterility Index) ทุกแบตช์ต้องผ่านการกักกันตรวจปล่อยล็อต (Lot Quarantine) หากห้องแล็บปนเปื้อนต้องทำลายล็อตนั้นทิ้งทันที แต่เมื่อผ่านใบรับรองคลินิกจะได้ราคาพรีเมียมการแพทย์ +9%"
    }
  });

  // Chapter 21: 3 Distinct B2B Industrial Service Business Models (แล็บสอบเทียบ ISO, ทีมช่างซ่อมบำรุง SLA นอกสถานที่, และโรงงานรีไซเคิลกากอุตสาหกรรม)
  const INDUSTRIAL_SERVICES = deepFreeze({
    calibration_lab: {
      id: "calibration_lab",
      nameTh: "บริการห้องแล็บสอบเทียบเครื่องมือวัดและรับรองมาตรฐาน ISO/IEC 17025",
      shortNameTh: "แล็บสอบเทียบ ISO (Calibration Lab)",
      icon: "🔬",
      requiredRole: "inspector",
      fallbackRole: "engineer",
      stages: ["intake_logged", "lab_calibrating", "certificate_issued", "returned_and_billed"],
      stagesTh: [
        "1. รับมอบเครื่องมือวัดของลูกค้าเข้าทะเบียนฝากสอบเทียบ (Instrument Custody Intake)",
        "2. เดินเครื่องสอบเทียบค่าความคลาดเคลื่อนในห้องแล็บควบคุมอุณหภูมิ (Precision Reference Calibration)",
        "3. ทวนสอบผลและออกใบรับรองมาตรฐาน ISO/IEC (Calibration Certificate Issuance)",
        "4. ส่งคืนเครื่องมือให้ลูกค้าและเรียกเก็บค่าธรรมเนียมสอบเทียบ (Custody Return & Billing)"
      ],
      serviceFeeSatang: 380000, // ฿3,800 per batch of instruments
      labConsumableCostSatang: 45000,
      requiredMinutes: 60,
      sparePartInputs: {},
      recoveredOutputs: {},
      clientCorps: ["tokyo_elec", "biomed_siam", "siam_aero_robotics", "asia_autoparts"],
      descTh: "รับเครื่องมือวัดและเซนเซอร์จากโรงงานลูกค้ามาสอบเทียบความแม่นยำในแล็บ (เครื่องมือลูกค้าเป็นทรัพย์สินฝากสอบเทียบ แยกจากสต็อกบริษัท) ออกใบรับรองและรับค่าบริการ"
    },
    field_maintenance: {
      id: "field_maintenance",
      nameTh: "บริการทีมวิศวกรซ่อมบำรุงเครื่องจักรนอกสถานที่ตามสัญญา SLA (Field Maintenance & Overhaul)",
      shortNameTh: "ทีมช่างซ่อมบำรุงนอกสถานที่ (Field SLA)",
      icon: "🛠️",
      requiredRole: "engineer",
      fallbackRole: "assembler",
      stages: ["sla_dispatched", "parts_allocated", "onsite_overhaul", "sla_settled"],
      stagesTh: [
        "1. รับใบแจ้งซ่อมด่วนและล็อกเวลา SLA กับโรงงานลูกค้า (SLA Dispatch Ticket)",
        "2. เบิกอะไหล่จริงจากคลังบริษัท (แผ่นโลหะ/ชุดสายไฟ) และจัดชุดเครื่องมือ (Spare Parts Allocation)",
        "3. ส่งวิศวกรเดินทางไปซ่อมบำรุงและตั้งศูนย์เครื่องจักรหน้างาน (On-Site Overhaul & Alignment)",
        "4. เดินเครื่องทดสอบผ่านเกณฑ์ รับเงินค่าบริการตาม SLA (SLA Verification & Settlement)"
      ],
      serviceFeeSatang: 640000, // ฿6,400 per SLA field overhaul
      labConsumableCostSatang: 60000,
      slaPenaltySatang: 140000,
      requiredMinutes: 90,
      sparePartInputs: { metal_sheet: 1, wire_harness: 1 },
      recoveredOutputs: {},
      clientCorps: ["siam_metal", "eastern_auto", "green_power", "pacific_solar"],
      descTh: "ส่งทีมวิศวกรพร้อมเบิกอะไหล่จริงจากคลังไปซ่อมเครื่องจักรที่โรงงานลูกค้า หากส่งมอบทันเวลาได้รับเงินเต็มจำนวน หากล่าช้าเกิน SLA ถูกหักค่าปรับ"
    },
    battery_second_life_lab: {
      id: "battery_second_life_lab",
      nameTh: "บริการห้องแล็บคัดเกรดแบตเตอรี่ใช้แล้วและประกอบชุดกักเก็บ Second-Life (Battery SOH Lab)",
      shortNameTh: "แล็บแบตเตอรี่ Second-Life (Battery SOH)",
      icon: "🔋",
      domainId: "power_electronics",
      requiredRole: "engineer",
      fallbackRole: "inspector",
      stages: ["pack_custody_intake", "soh_cell_grading", "module_rebalancing", "certified_return_or_recycle"],
      stagesTh: [
        "1. รับฝากแพ็กแบตเตอรี่เก่าของลูกค้าเข้าทะเบียน Custody (Pack Custody Intake)",
        "2. วัดความจุ SOH และความต้านทานภายในรายเซลล์ (Cell SOH Grading)",
        "3. คัดแยกโมดูลที่ผ่านเกณฑ์ความจุ >=80% และส่งเซลล์เสื่อมไปบำบัด (Rebalancing & Reject Separation)",
        "4. ออกใบรับรอง SOH ส่งคืนลูกค้าพร้อมรับค่าบริการและกู้คืนโลหะจากเซลล์เสื่อม",
      ],
      serviceFeeSatang: 520000,
      labConsumableCostSatang: 55000,
      requiredMinutes: 80,
      sparePartInputs: { wire_harness: 1 },
      recoveredOutputs: { metal_sheet: 1, copper_coil: 1 },
      clientCorps: ["eastern_auto", "green_power", "pacific_solar", "siam_aero_robotics"],
      descTh: "รับแพ็กแบตเตอรี่เก่าของลูกค้ามาตรวจสุขภาพ SOH รายเซลล์ในแล็บ (แยก Custody ไม่ปนสต็อกบริษัท) คัดโมดูลที่ยังใช้งานได้ปลอดภัยและแยกเซลล์เสื่อมสกัดโลหะคืนโดยไม่เสกเซลล์เสียเป็นของใหม่ฟรี",
    },
    returnable_pallet_pool: {
      id: "returnable_pallet_pool",
      nameTh: "บริการให้เช่าพาเลตและบรรจุภัณฑ์หมุนเวียนมาตรฐานส่งออก (Returnable Pallet & Crate Pool)",
      shortNameTh: "ให้เช่าพาเลตหมุนเวียน (Pallet Pool)",
      icon: "📦",
      domainId: "fleet_coldchain",
      requiredRole: "logistics",
      fallbackRole: "assembler",
      stages: ["pool_allocation", "client_dispatch", "return_inspection_wash", "damage_settlement"],
      stagesTh: [
        "1. เบิกบรรจุภัณฑ์/พาเลตจากพูลและติดแท็กติดตาม (Pool Asset Allocation)",
        "2. จัดส่งให้โรงงานลูกค้าใช้หมุนเวียนขนส่งสินค้า (Client Pool Dispatch)",
        "3. รับคืน ล้างทำความสะอาด อบฆ่าเชื้อ และตรวจสภาพ (Return Wash & Inspection)",
        "4. ซ่อมแซมพาเลตที่สึกหรอและเรียกเก็บค่าเช่าตามรอบพร้อมค่าชดเชยสูญหาย",
      ],
      serviceFeeSatang: 360000,
      labConsumableCostSatang: 35000,
      requiredMinutes: 65,
      sparePartInputs: { pack_carton: 1 },
      recoveredOutputs: {},
      clientCorps: ["cp_health", "metro_retail", "siam_food_bev", "thai_agri_mill"],
      descTh: "นำบรรจุภัณฑ์และพาเลตมาตรฐานออกให้บริษัทคู่ค้าเช่าหมุนเวียน ต้องเบิกบรรจุภัณฑ์จริงจากคลังและมีขั้นตอนรับคืน ล้าง ซ่อมแซมตามรอบใช้งาน",
    },
    cold_storage_3pl: {
      id: "cold_storage_3pl",
      nameTh: "บริการคลังสินค้าควบคุมอุณหภูมิและรับฝากสินค้า B2B (Cold-Storage & 3PL Custody Hub)",
      shortNameTh: "คลังห้องเย็นรับฝาก 3PL (Cold Storage)",
      icon: "❄️",
      domainId: "fleet_coldchain",
      requiredRole: "logistics",
      fallbackRole: "inspector",
      stages: ["cold_custody_intake", "temperature_monitored_storage", "fifo_pick_pack", "dispatch_and_billing"],
      stagesTh: [
        "1. รับมอบสินค้าควบคุมอุณหภูมิของลูกค้าเข้าทะเบียนฝากแยกอิสระ (3PL Cold Custody Intake)",
        "2. จัดเก็บในห้องเย็นพร้อมบันทึกกราฟอุณหภูมิต่อเนื่อง (Monitored Cold Storage)",
        "3. คัดหยิบตามลำดับวันหมดอายุ FEFO/FIFO และแพ็กเตรียมส่ง (FEFO Pick & Pack)",
        "4. ส่งมอบคืนลูกค้าและวางบิลค่าเช่าพื้นที่ห้องเย็นและค่าบริการหยิบแพ็ก",
      ],
      serviceFeeSatang: 460000,
      labConsumableCostSatang: 48000,
      requiredMinutes: 70,
      sparePartInputs: { pack_carton: 1 },
      recoveredOutputs: {},
      clientCorps: ["cp_health", "biomed_siam", "siam_food_bev", "metro_retail"],
      descTh: "ให้บริการรับฝากและบริหารคลังห้องเย็นแก่ลูกค้าอาหารและเวชภัณฑ์ โดยแยกทะเบียนสินค้าฝากของลูกค้าออกจากสต็อกบริษัท 100%",
    },
    industrial_recycling: {
      id: "industrial_recycling",
      nameTh: "บริการรับบำบัดของเสียและรีไซเคิลกากอุตสาหกรรมหมุนเวียน (Eco Waste Treatment & Material Recovery)",
      shortNameTh: "รีไซเคิลกากอุตสาหกรรม (Eco Recycling)",
      icon: "♻️",
      requiredRole: "logistics",
      fallbackRole: "assembler",
      stages: ["waste_collected", "sorting_and_treatment", "material_recovered", "eco_settled"],
      stagesTh: [
        "1. รับกากอุตสาหกรรม เศษโลหะ และเศษกระดาษจากโรงงานคู่ค้า (Industrial Waste Intake)",
        "2. คัดแยก บดย่อย และบำบัดด้วยน้ำดิบ/พลังงานสะอาด (Sorting, Washing & Treatment)",
        "3. หลอมและอัดก้อนคืนสภาพเป็นวัตถุดิบหมุนเวียนเข้าคลังจริง (Secondary Material Recovery)",
        "4. ออกใบรับรองการจัดการของเสียสีเขียว (ESG Certificate) และรับค่าบริการบำบัด"
      ],
      serviceFeeSatang: 320000, // ฿3,200 treatment fee + recovered materials!
      labConsumableCostSatang: 50000,
      requiredMinutes: 75,
      sparePartInputs: { raw_water_m3: 1 },
      recoveredOutputs: { metal_sheet: 1, pack_carton: 2, organic_compost: 1 },
      clientCorps: ["cp_health", "metro_retail", "siam_tech", "petro_chem_siam"],
      descTh: "รับบำบัดกากของเสียจากบริษัทคู่ค้าโดยใช้น้ำดิบและกระบวนการคัดแยก ได้ทั้งเงินค่าบริการบำบัด และได้แผ่นโลหะรีไซเคิล กล่องกระดาษ และปุ๋ยหมักกลับเข้าคลังจริง!"
    },
    energy_epc_install: {
      id: "energy_epc_install",
      nameTh: "บริการรับเหมาติดตั้งโซลาร์รูฟท็อปและระบบกักเก็บพลังงาน B2B (Turnkey Solar & Storage EPC)",
      shortNameTh: "รับเหมาติดตั้งโซลาร์/กริด EPC",
      icon: "☀️",
      domainId: "power_electronics",
      requiredRole: "engineer",
      fallbackRole: "assembler",
      stages: ["site_engineering_survey", "mounting_and_wiring", "grid_sync_commissioning", "epc_handover_settled"],
      stagesTh: [
        "1. สำรวจโครงสร้างหลังคาโรงงานลูกค้าและคำนวณโหลดไฟฟ้า (Site Engineering Survey)",
        "2. เบิกแผงโซลาร์เซลล์ รางอะลูมิเนียม และชุดสายไฟไปติดตั้งหน้างาน (Mounting & HV Wiring)",
        "3. ทดสอบขนานไฟเข้าสมาร์ตกริดและตรวจวัดค่าความปลอดภัย (Grid Sync & Commissioning)",
        "4. ส่งมอบใบรับรองวิศวกรรม EPC และรับชำระค่าบริการเหมาโครงการ (EPC Handover & Settlement)"
      ],
      serviceFeeSatang: 920000, // ฿9,200 turnkey EPC project fee
      labConsumableCostSatang: 85000,
      slaPenaltySatang: 180000,
      slaPenaltyPct: 0.2,
      requiredMinutes: 95,
      sparePartInputs: { solar_cell: 1, aluminum_extrusion_profile: 1, wire_harness: 1 },
      fallbackSparePartInputs: { solar_cell: 1, metal_sheet: 1, wire_harness: 1 },
      recoveredOutputs: {},
      clientCorps: ["green_power", "metro_retail", "cp_health", "singapore_port_3pl"],
      descTh: "ส่งทีมวิศวกรพร้อมเบิกแผงโซลาร์เซลล์ รางอะลูมิเนียมอัดรีด และชุดสายไฟจากคลังไปติดตั้งระบบผลิตไฟฟ้าสะอาดที่โรงงานลูกค้า สร้างรายได้โครงการ EPC มาร์จิ้นสูงและยกระดับชื่อเสียง ESG"
    },
    b2b_technical_academy: {
      id: "b2b_technical_academy",
      nameTh: "บริการศูนย์ฝึกอบรมและรับรองมาตรฐานช่างเทคนิคอุตสาหกรรม B2B (Industrial Technical Academy)",
      shortNameTh: "ศูนย์ฝึกอบรมช่างเทคนิค B2B (Tech Academy)",
      icon: "🎓",
      domainId: "embedded_iot",
      requiredRole: "coordinator",
      fallbackRole: "inspector",
      stages: ["curriculum_enrollment", "workshop_simulation", "skill_certification_exam", "academy_settled"],
      stagesTh: [
        "1. ลงทะเบียนทีมช่างของบริษัทคู่ค้าเข้าหลักสูตรมาตรฐานอุตสาหกรรม (Curriculum Enrollment)",
        "2. ฝึกปฏิบัติการหน้าเครื่องจักรและห้องแล็บสอบเทียบด้วยชุดคู่มือฝึกอบรม (Workshop Simulation)",
        "3. สอบวัดผลทักษะวิชาชีพและออกใบรับรองมาตรฐานฝีมือแรงงาน (Skill Certification Exam)",
        "4. ส่งมอบผลการฝึกอบรมแก่บริษัทลูกค้าและรับค่าธรรมเนียมหลักสูตร (Academy Billing)"
      ],
      serviceFeeSatang: 440000, // ฿4,400 B2B training & certification fee
      labConsumableCostSatang: 40000,
      requiredMinutes: 60,
      sparePartInputs: { pack_carton: 1 },
      recoveredOutputs: {},
      clientCorps: ["asia_autoparts", "siam_tech", "bharat_biotech_it", "nusantara_nickel"],
      descTh: "เปิดศูนย์ฝึกอบรมของบริษัทรับจัดหลักสูตรยกระดับฝีมือช่างและวิศวกรให้แก่บริษัทคู่ค้าในนิคม ใช้ชุดเอกสารคู่มือ (pack_carton) และผู้เชี่ยวชาญสร้างรายได้บริการพร้อมเพิ่มความเชื่อใจคู่ค้า"
    },
    wholesale_distribution: {
      id: "wholesale_distribution",
      nameTh: "ศูนย์ค้าส่งและกระจายวัตถุดิบอุตสาหกรรม B2B (Industrial Wholesale & Lot Distribution)",
      shortNameTh: "ค้าส่งและกระจายวัตถุดิบ B2B (Wholesale Hub)",
      icon: "📦",
      domainId: "fleet_coldchain",
      requiredRole: "logistics",
      fallbackRole: "sales",
      stages: ["lot_allocation_qc", "warehouse_staging", "regional_dispatch", "wholesale_settled"],
      stagesTh: [
        "1. คัดเกรดและจัดสรรล็อตวัตถุดิบอุตสาหกรรมจากคลังพร้อมตรวจสภาพ (Lot Allocation & QC)",
        "2. แพ็กบรรจุหีบห่อมาตรฐานส่งออกและจัดเตรียมเอกสาร B2B (Warehouse Staging)",
        "3. กระจายสินค้าส่งมอบให้โรงงานลูกค้าตามระเบียงการค้า (Regional Lot Dispatch)",
        "4. วางบิลและตัดบัญชีต้นทุนจัดเก็บ/ขนส่งสุทธิ (Wholesale Settlement)"
      ],
      serviceFeeSatang: 740000,
      labConsumableCostSatang: 65000,
      slaPenaltySatang: 150000,
      slaPenaltyPct: 0.2,
      requiredMinutes: 75,
      sparePartInputs: { pack_carton: 2, metal_sheet: 1 },
      fallbackSparePartInputs: { pack_carton: 2 },
      recoveredOutputs: {},
      clientCorps: ["metro_retail", "singapore_port_3pl", "siam_tech", "cp_health"],
      descTh: "บริหารสต็อกวัตถุดิบและบรรจุภัณฑ์ล็อตใหญ่เพื่อกระจายส่งต่อให้โรงงานลูกค้า B2B คิดค่าบริการจัดหา คัดเกรด และหีบห่อ พร้อมกติกาป้องกันการซื้อขายวนกับคู่ค้ารายเดิม"
    },
    toll_smelting_extrusion: {
      id: "toll_smelting_extrusion",
      nameTh: "บริการรับจ้างถลุงโลหะและรีดโพรไฟล์ตามสั่ง (Contract Toll Smelting & Extrusion)",
      shortNameTh: "รับจ้างถลุงแร่และรีดอะลูมิเนียม (Toll Smelting)",
      icon: "🔥",
      domainId: "metal_machining",
      requiredRole: "assembler",
      fallbackRole: "engineer",
      stages: ["ore_custody_intake", "smelting_extrusion_run", "slag_separation_qc", "toll_settled"],
      stagesTh: [
        "1. รับฝากล็อตแร่/แท่งบิลเล็ตของลูกค้าเข้าบัญชี Custody แยกจากสต็อกบริษัท (Client Ore Custody Intake)",
        "2. เดินเตาถลุงด้วยถ่านโค้กฟลักซ์และอัดรีดขึ้นรูปตามสเปกลูกค้า (Smelting & Extrusion Run)",
        "3. แยกกากตะกรันเตาถลุง (mineral_slag_mud) และตรวจสอบความแข็งแรงโลหะ (Slag Separation & QC)",
        "4. ส่งมอบโลหะแปรรูปคืนลูกค้าและรับค่าจ้างถลุง (Toll Smelting Settlement)"
      ],
      serviceFeeSatang: 860000,
      labConsumableCostSatang: 75000,
      slaPenaltySatang: 180000,
      slaPenaltyPct: 0.2,
      requiredMinutes: 90,
      sparePartInputs: { coke_reducing_flux: 1, raw_water_m3: 1 },
      fallbackSparePartInputs: { raw_water_m3: 1 },
      recoveredOutputs: { mineral_slag_mud: 1 },
      clientCorps: ["nusantara_nickel", "pilbara_resources", "asia_autoparts", "siam_metal"],
      descTh: "รับแร่หรือแท่งอะลูมินาของลูกค้ามาถลุงและอัดรีดด้วยเตาของโรงงาน (แยกบัญชี Custody 100%) ใช้ถ่านโค้กฟลักซ์และน้ำดิบจริง พร้อมเกิดกากตะกรัน (mineral_slag_mud) เข้าคลังเพื่อนำไปบำบัดต่อ"
    }
  });

  // Master Overview of All 8 Distinct Business Models in Siam Enterprise v1.2.0
  const BUSINESS_PROCESS_MODELS = deepFreeze([
    {
      id: "model_1_food_bakery",
      nameTh: "1. ธุรกิจอาหารสด เบเกอรี่ และเครื่องดื่ม (Batch Baking & Cold-Chain Shelf-Life Model)",
      icon: "🍞",
      processFlowTh: "ชั่งตวงผสมแบตช์ ➔ หมักโดว์/พาสเจอร์ไรซ์/อบเตาอุโมงค์ ➔ ตรวจเชื้อและชิมรสชาติ ➔ ซีลสุญญากาศประทับวันหมดอายุ ➔ ส่งมอบเชนค้าปลีกก่อนหมดอายุ",
      uniqueMechanicsTh: "มีความสด (freshnessPct) ลดลงรายวัน หากค้างสต็อกจนหมดอายุจะบูดเสียจริงและกลายเป็นปุ๋ยหมัก หากมีคลังห้องเย็นยืดอายุได้ 2 เท่า ส่งของสดใหม่ได้โบนัส +6%",
      revenueAndRiskTh: "รายได้จากการขายล็อตสดและสัญญาส่งรายวัน • ความเสี่ยงคือของบูดเสียคาคลังหรือโดนหักราคา Markdown เมื่อความสดต่ำ"
    },
    {
      id: "model_2_electronics_semicon",
      nameTh: "2. ธุรกิจอิเล็กทรอนิกส์และเซมิคอนดักเตอร์ (SMT Fabrication, Firmware Revision & RMA Warranty Model)",
      icon: "🔌",
      processFlowTh: "ถลุงซิลิกา/ดึงเวเฟอร์ ➔ วางชิป SMT & บัดกรี Reflow ➔ แฟลชเฟิร์มแวร์ ➔ ทดสอบไฟ Burn-in/ICT ➔ แพ็กกันไฟฟ้าสถิต ESD ➔ ดูแลรับประกันหลังการขาย (RMA Pool)",
      uniqueMechanicsTh: "สินค้าที่ส่งมอบแล้วเข้าสู่พูลรับประกัน 14 วัน หากผลิตด้วยเครื่องจักรโทรมหรือคุณภาพคาบเส้น ลูกค้าจะส่งเคลม RMA ต้องเบิกแผงวงจรซ่อมหรือจ่ายเงินชดเชย",
      revenueAndRiskTh: "อัตรากำไรต่อชิ้นสูงแต่ต้องใช้แต้มวิจัย R&D ปลดล็อกชิ้นส่วน T3 • ความเสี่ยงคือภาระเคลมประกัน RMA หลังขาย"
    },
    {
      id: "model_3_automotive_ev",
      nameTh: "3. ธุรกิจยานยนต์ EV พลังงาน และเครื่องจักรกลหนัก (OEM Tooling Changeover & HV Dyno Model)",
      icon: "⚡",
      processFlowTh: "ตั้งแม่พิมพ์ปั๊มโลหะ CNC (Tooling Setup) ➔ เชื่อมเซลล์แบตแรงดันสูงและชุดส่งกำลัง ➔ ทดสอบฉนวน Dielectric & แท่น Dyno ➔ ตีลังเหล็กส่งมอบบริษัทรถยนต์ OEM",
      uniqueMechanicsTh: "แต่ละไลน์ผลิตจดจำแม่พิมพ์รุ่นปัจจุบัน หากสลับรุ่นสินค้าไปมาต้องเสียเวลาและต้นทุนตั้งแม่พิมพ์ใหม่ (Changeover Cost) แต่ถ้าผลิตล็อตรุ่นเดิมต่อเนื่องจะได้โบนัสความเร็ว +12%",
      revenueAndRiskTh: "มูลค่าสัญญาต่อออเดอร์สูงมาก • ความเสี่ยงคือต้นทุนสลับแม่พิมพ์บ่อยและการตกเกณฑ์ความปลอดภัยแรงดันสูง"
    },
    {
      id: "model_4_biomed_sterile",
      nameTh: "4. ธุรกิจชีวการแพทย์และโภชนเภสัชคลีนรูม (Aseptic Formulation & Lot Quarantine Model)",
      icon: "🧬",
      processFlowTh: "เตรียมหัวเชื้อในคลีนรูมปลอดเชื้อ ➔ บรรจุระดับคลินิก ➔ เพาะเชื้อตรวจการปนเปื้อนในแล็บ ➔ กักกันตรวจปล่อยรายล็อต (Lot Quarantine Release) ➔ ส่งมอบโรงพยาบาล",
      uniqueMechanicsTh: "มีดัชนีความปลอดเชื้อ (Sterility Index) ทุกแบตช์ต้องผ่านการตรวจปล่อยล็อต หากปนเปื้อนต้องคัดทิ้งยกล็อต แต่ถ้าผ่านใบรับรองคลินิกจะได้ค่าพรีเมียมการแพทย์ +9%",
      revenueAndRiskTh: "ราคาขายพรีเมียมสูงสุดในกลุ่มสินค้าผลิต • ความเสี่ยงคือการปนเปื้อนในคลีนรูมทำให้เสียวัตถุดิบยกล็อต"
    },
    {
      id: "model_5_upstream_resources",
      nameTh: "5. ธุรกิจต้นน้ำแท้จริง: นาข้าว 8 ขั้นตอน, ปศุสัตว์โคนม, เหมืองแร่สำรองจำกัด และป่าปลูก 3 ช่วงอายุ",
      icon: "🌾",
      processFlowTh: "[เกษตร] เตรียมดิน ➔ หักเมล็ดปลูก ➔ ให้น้ำ/ปุ๋ย ➔ เก็บเกี่ยว ➔ คัดพันธุ์ 25% ➔ สีข้าว/โม่แป้ง | [ปศุสัตว์] ให้อาหาร+น้ำ ➔ รีดนมสด+หมักมูลสัตว์ | [เหมือง] สำรวจ ➔ ขุดด้วยดีเซล ➔ แต่งแร่แยกกากแร่ | [ป่าปลูก] ตัดไม้โตเต็มวัย ➔ ปลูกกล้าไม้ทดแทน 3 ชั้นอายุ",
      uniqueMechanicsTh: "แยกแหล่งกำเนิดธรรมชาติแท้จริง (T0_NATURAL) ออกจากผลผลิตชีวภาพ ห้ามใช้ข้าวสารหรือแป้งเป็นเมล็ดพันธุ์ เหมืองขุดแล้วแร่ลดลงจริง ป่าตัดแล้วต้องรอโต",
      revenueAndRiskTh: "ลดต้นทุนวัตถุดิบโรงงานและขายส่งวัตถุดิบ B2B ได้ • ความเสี่ยงคือเมล็ดหมด ขาดน้ำ ดินเสื่อม ฝูงสัตว์ขาดอาหาร หรือสายแร่หมด"
    },
    {
      id: "model_6_fleet_transport",
      nameTh: "6. ธุรกิจขนส่งด้วยกองรถ B2B (9-Stage Fleet Dispatch, Cargo Custody & Backhaul Matching Model)",
      icon: "🚛",
      processFlowTh: "รับคำขอ ➔ ประเมินระยะไป-กลับรถเปล่า ➔ จองรถ+คนขับ+ช่องโหลด ➔ รับฝากของลูกค้าเข้า Custody ➔ วิ่งขาไปหักดีเซล+ค่าผ่านทาง ➔ ส่งมอบเซ็น e-POD ➔ วางบิล ➔ วิ่งรถกลับพร้อมจับคู่งานขากลับ (Backhaul Match) ➔ ตรวจเช็ก/ซ่อมบำรุง",
      uniqueMechanicsTh: "แยกรถตู้ทึบ รถห้องเย็น (มีบันทึกอุณหภูมิ) และรถพ่วงหนัก สินค้าลูกค้าแยกจากสต็อกบริษัท รถที่จ่ายเงินแล้วยังไม่ว่างทันทีจนกว่าจะวิ่งกลับถึงลานจอด และจับคู่งานขากลับเพื่อลดเที่ยวรถเปล่าได้",
      revenueAndRiskTh: "สร้างกระแสเงินสดจากค่าระวางขนส่งและงานขากลับ • ความเสี่ยงคือค่าน้ำมันขากลับรถเปล่า รถเสียกลางทาง และยางสึกหรอ"
    },
    {
      id: "model_7_software_saas",
      nameTh: "7. ธุรกิจพัฒนาซอฟต์แวร์รับจ้างและแอปสมาชิก SaaS (Milestone Dev, QA Defect Queue & Cloud MRR Model)",
      icon: "💻",
      processFlowTh: "[รับจ้าง] สำรวจความต้องการ ➔ สัญญามัดจำ 30% (Unearned Deposit) ➔ ออกแบบ ➔ เขียนโค้ดจองโต๊ะ ➔ ทดสอบ QA/แก้บั๊ก ➔ ลูกค้าตรวจ UAT 40% ➔ Deploy 30% | [SaaS] พัฒนา MVP ➔ หา Lead ➔ แปลงเป็นสมาชิก ➔ ดูแล Cloud Server/Support ➔ ตัดรอบบิลตามผู้ใช้จริง",
      uniqueMechanicsTh: "เงินมัดจำ 30% ไม่นับเป็นกำไรจนกว่าจะส่งมอบผ่าน QA และเวอร์ชันตรงสัญญา แอป SaaS ที่ไม่มีผู้ใช้จริงจะไม่สร้างรายได้ฟรี และเมื่อผู้ใช้เกินความจุเซิร์ฟเวอร์จะเกิดอาการระบบอืด/ลูกค้ายกเลิก (Churn)",
      revenueAndRiskTh: "รายได้ก้อนใหญ่ตามงวดงานและรายได้ประจำรายรอบ (MRR) • ความเสี่ยงคือบั๊กค้าง งานแก้ Technical Debt และลูกค้ายกเลิกสมาชิก"
    },
    {
      id: "model_8_industrial_services",
      nameTh: "8. ธุรกิจบริการวิศวกรรม สอบเทียบแล็บ ISO ซ่อมบำรุงภาคสนาม และรีไซเคิลกากอุตสาหกรรม (B2B Service Model)",
      icon: "🔬",
      processFlowTh: "[แล็บสอบเทียบ] รับเครื่องมือลูกค้าเข้า Custody ➔ วัดค่าเทียบมาตรฐาน ➔ ออกใบรับรอง ISO | [ทีมช่าง SLA] รับแจ้งซ่อม ➔ เบิกอะไหล่จริง ➔ ส่งวิศวกรซ่อมหน้างานทัน SLA | [รีไซเคิล] รับกากของเสีย ➔ คัดแยกบำบัดด้วยน้ำดิบ ➔ คืนสภาพเป็นแผ่นโลหะ/กล่อง/ปุ๋ยเข้าคลังจริง",
      uniqueMechanicsTh: "ใช้ความเชี่ยวชาญของวิศวกร/QC และอาคารแล็บ/โรงซ่อม/โรงน้ำ สร้างรายได้บริการ B2B พร้อมหมุนเวียนกากอุตสาหกรรมกลับมาเป็นวัตถุดิบตั้งต้น",
      revenueAndRiskTh: "สร้างรายได้บริการมาร์จิ้นสูงและได้วัตถุดิบรีไซเคิลเข้าคลัง • ความเสี่ยงคือการส่งงานซ่อมล่าช้าเกิน SLA หรือขาดอะไหล่ซ่อมบำรุง"
    }
  ]);

  // Complete True-Resource Origin -> Extraction/Cultivation -> Midstream -> Downstream Reference Table (Chapter 23 Section 9)
  const CAPABILITY_DOMAINS = Object.freeze({
    food_fermentation: {
      id: "food_fermentation",
      nameTh: "เทคโนโลยีอาหาร การหมักชีวภาพ และโคลด์เชน",
      icon: "🥖",
      relatedIndustries: ["food"],
      baseLevel: 25,
      descTh: "ความสามารถด้านการโม่แป้ง หมักโดว์/โพรไบโอติกส์ อบความร้อน และควบคุมอายุเก็บรักษาอาหารสด",
    },
    metal_machining: {
      id: "metal_machining",
      nameTh: "โลหะวิทยา แม่พิมพ์ Die & Jig และเครื่องจักรกลหนัก",
      icon: "🦾",
      relatedIndustries: ["automotive"],
      baseLevel: 20,
      descTh: "ความสามารถด้านการถลุงแร่ ขึ้นรูปแผ่นโลหะ พันขดลวดมอเตอร์ และตั้งจิ๊กประกอบยานยนต์",
    },
    power_electronics: {
      id: "power_electronics",
      nameTh: "วิศวกรรมไฟฟ้ากำลัง อินเวอร์เตอร์ และกักเก็บพลังงานแบตเตอรี่",
      icon: "⚡",
      relatedIndustries: ["energy", "automotive"],
      baseLevel: 20,
      descTh: "ความสามารถด้านวงจรแปลงไฟแรงดันสูง การประกอบแพ็กแบตเตอรี่ LFP/Solid-State และการทดสอบความปลอดภัย",
    },
    embedded_iot: {
      id: "embedded_iot",
      nameTh: "ระบบสมองกลฝังตัว แผงวงจร SMT และอุปกรณ์ IoT อุตสาหกรรม",
      icon: "🔬",
      relatedIndustries: ["electronics"],
      baseLevel: 30,
      descTh: "ความสามารถด้านการวางชิป SMT แฟลชเฟิร์มแวร์ ทดสอบ Burn-In และซ่อมบำรุงบอร์ด RMA",
    },
    semiconductor_optics: {
      id: "semiconductor_optics",
      nameTh: "เซมิคอนดักเตอร์ เลนส์ออปติคัล และหุ่นยนต์อัตโนมัติ",
      icon: "🤖",
      relatedIndustries: ["electronics", "automotive"],
      baseLevel: 10,
      descTh: "ความสามารถขั้นสูงด้านเวเฟอร์ซิลิคอน ชิปประมวลผล AI เลนส์ความละเอียดสูง และหุ่นยนต์ AGV/UAV",
    },
    biomed_sterile: {
      id: "biomed_sterile",
      nameTh: "ชีวการแพทย์ คลีนรูมปลอดเชื้อ ISO Class-5 และเวชภัณฑ์คลินิก",
      icon: "🧬",
      relatedIndustries: ["biomed", "food"],
      baseLevel: 15,
      descTh: "ความสามารถด้านการบำบัดน้ำบริสุทธิ์เภสัชกรรม การบรรจุปลอดเชื้อ และการตรวจรับรอง Clinical COA",
    },
    software_cloud: {
      id: "software_cloud",
      nameTh: "วิศวกรรมซอฟต์แวร์ สถาปัตยกรรมคลาวด์ และระบบ SaaS B2B",
      icon: "💻",
      relatedIndustries: ["software"],
      baseLevel: 25,
      descTh: "ความสามารถด้านการออกแบบซอฟต์แวร์องค์กร การทดสอบ QA อัตโนมัติ และการดูแลเซิร์ฟเวอร์ SaaS",
    },
    fleet_coldchain: {
      id: "fleet_coldchain",
      nameTh: "วิศวกรรมโลจิสติกส์ กองรถขนส่งควบคุมอุณหภูมิ และคลัง 3PL",
      icon: "🚛",
      relatedIndustries: ["fleet", "service"],
      baseLevel: 25,
      descTh: "ความสามารถด้านการบริหารกองรถบรรทุก การวางแผนเที่ยววิ่ง Backhaul และคลังสินค้าห้องเย็น 3PL",
    },
    agri_soil_science: {
      id: "agri_soil_science",
      nameTh: "เกษตรศาสตร์ เมล็ดพันธุ์ ปศุสัตว์โคนม และธรณีวิทยาเหมืองแร่",
      icon: "🌾",
      relatedIndustries: ["upstream"],
      baseLevel: 25,
      descTh: "ความสามารถด้านการคัดเมล็ดพันธุ์ ดูแลธาตุอาหารดิน N-P-K การเลี้ยงโคนม และการสำรวจสายแร่",
    },
  });

  const PRODUCT_FAMILIES = Object.freeze({
    smart_audio_lighting: {
      id: "smart_audio_lighting",
      nameTh: "ตระกูลอุปกรณ์เสียงและแสงสว่างอัจฉริยะ (Smart Audio & LED Systems)",
      domainId: "embedded_iot",
      sharedToolingGroup: "smt_light_jig",
      products: ["speaker", "lamp"],
    },
    industrial_iot: {
      id: "industrial_iot",
      nameTh: "ตระกูลเกตเวย์ มิเตอร์ และดาต้าล็อกเกอร์อุตสาหกรรม (Industrial IoT & Telemetry)",
      domainId: "embedded_iot",
      sharedToolingGroup: "smt_iot_jig",
      products: ["iotController", "smartMeter", "cold_chain_temp_logger", "braided_fast_charge_kit"],
    },
    ai_vision_edge: {
      id: "ai_vision_edge",
      nameTh: "ตระกูลกล้อง Machine Vision และโมดูลประมวลผล AI Edge",
      domainId: "semiconductor_optics",
      sharedToolingGroup: "clean_optics_jig",
      products: ["visionCamera", "ai_edge_module"],
    },
    ev_powertrain: {
      id: "ev_powertrain",
      nameTh: "ตระกูลระบบขับเคลื่อน เซนเซอร์ และช่วงล่างยานยนต์ไฟฟ้า (EV Powertrain & Chassis)",
      domainId: "metal_machining",
      sharedToolingGroup: "heavy_ev_jig",
      products: ["autoSensor", "evController", "batteryPack", "ev_suspension_kit", "ev_traction_motor", "ev_battery_tray_assembly"],
    },
    robotics_automation: {
      id: "robotics_automation",
      nameTh: "ตระกูลแขนกลเซอร์โว หุ่นยนต์คลังสินค้า AGV และโดรนขนส่งหนัก",
      domainId: "semiconductor_optics",
      sharedToolingGroup: "robotics_cell_jig",
      products: ["servoActuator", "warehouse_agv_bot", "autonomous_cargo_drone"],
    },
    herbal_functional_bev: {
      id: "herbal_functional_bev",
      nameTh: "ตระกูลเครื่องดื่มสมุนไพรและช็อตสกัดเข้มข้น (Herbal & Functional Beverages)",
      domainId: "food_fermentation",
      sharedToolingGroup: "liquid_bottling_line",
      products: ["herbalDrink", "functionalShot", "premium_cooking_oil"],
    },
    bakery_grain: {
      id: "bakery_grain",
      nameTh: "ตระกูลขนมปังโฮลเกรน ครัวซองต์เนยสด บิสกิตข้าวสาลี และอาหารพร้อมทาน",
      domainId: "food_fermentation",
      sharedToolingGroup: "tunnel_oven_line",
      products: ["artisan_bakery", "pastry_croissant_box", "wheat_grain_biscuit", "ready_meal_box", "artisan_chili_paste_jar"],
    },
    dairy_fermented: {
      id: "dairy_fermented",
      nameTh: "ตระกูลผลิตภัณฑ์นมโคแท้ โยเกิร์ตหมักเชื้อสด และโปรตีนจากพืช",
      domainId: "food_fermentation",
      sharedToolingGroup: "dairy_cold_line",
      products: ["dairy_protein_shake", "probiotic_yogurt_cup", "energyProtein", "plant_based_meat"],
    },
    clinical_sterile: {
      id: "clinical_sterile",
      nameTh: "ตระกูลเวชภัณฑ์ปลอดเชื้อ น้ำเกลือการแพทย์ และเครื่องมือแพทย์ ICU",
      domainId: "biomed_sterile",
      sharedToolingGroup: "iso5_cleanroom_line",
      products: ["probioticElixir", "synbiotic_medical_drink", "sterile_wound_dressing", "medical_saline_iv", "vital_signs_monitor"],
    },
    clean_energy_grid: {
      id: "clean_energy_grid",
      nameTh: "ตระกูลโซลาร์เซลล์ อินเวอร์เตอร์ ตู้ชาร์จไว DC และตู้กักเก็บพลังงาน LFP/Solid-State",
      domainId: "power_electronics",
      sharedToolingGroup: "power_cabinet_line",
      products: ["solarCharger", "homeInverter", "evFastCharger", "lfp_grid_rack", "solid_state_powerwall", "solar_mounting_rail_kit", "industrial_switchgear_cabinet", "high_nickel_nmc_module"],
    },
  });

  const TRUE_RESOURCE_CHAIN_TABLE = deepFreeze([
    {
      chainId: "rice_bakery_chain",
      nameTh: "สายข้าวหอมมะลิ ➔ ข้าวสาร/รำข้าว ➔ แป้งโม่ ➔ เบเกอรี่",
      trueNaturalSourceTh: "ที่ดินแปลงนา (ดิน+ธาตุอาหาร) + น้ำดิบธรรมชาติ (raw_water_m3) + แสงแดด",
      propaguleOrDepositTh: "เมล็ดพันธุ์ข้าวหอมมะลิ (rice_seed) จากคลังพันธุ์หรือคัดจากข้าวเปลือกรอบก่อน",
      cultivationOrExtractionTh: "เพาะปลูก 8 ขั้นตอน (เตรียมดิน ➔ ปลูกหักเมล็ด ➔ ดูแลน้ำ/ปุ๋ย ➔ เก็บเกี่ยวข้าวเปลือก paddy_grain ➔ คัดเก็บพันธุ์ 25%)",
      midstreamProcessingTh: "สีข้าวเปลือกเป็นข้าวสาร (milled_rice) + รำข้าว/แกลบ (rice_bran_husk) ➔ โม่ข้าวสารเป็นแป้ง (artisan_flour) ➔ นวดโดว์เนย (bakery_dough_butter)",
      downstreamProductTh: "ขนมปังโฮลเกรน (artisan_bakery), ครัวซองต์ส่งออก (pastry_croissant_box), อาหารพร้อมทาน (ready_meal_box)",
      simulationScopeNoteTh: "จำลองครบทั้งแปลงนา น้ำ ธาตุอาหารดิน การหักเมล็ด การคัดข้าวเปลือกเป็นพันธุ์ และการห้ามใช้ข้าวสาร/แป้งปลูก"
    },
    {
      chainId: "sugarcane_syrup_chain",
      nameTh: "สายอ้อยปลอดการเผา ➔ น้ำตาลบริสุทธิ์/ไซรัป ➔ เครื่องดื่มและเบเกอรี่",
      trueNaturalSourceTh: "ที่ดินแปลงไร่อ้อย + น้ำดิบธรรมชาติ (raw_water_m3) + ปุ๋ยแร่ฟอสเฟต/โพแทช",
      propaguleOrDepositTh: "ท่อนพันธุ์อ้อยสดคัดตาพันธุ์ดี (cane_stalk_seed)",
      cultivationOrExtractionTh: "ปลูกท่อนพันธุ์อ้อย ดูแลน้ำและปุ๋ย เก็บเกี่ยวลำอ้อยสด (raw_cane) และคัดท่อนพันธุ์ไว้ปลูกรอบถัดไป",
      midstreamProcessingTh: "หีบอ้อยสดและเคี่ยวเป็นน้ำตาลทรายบริสุทธิ์/ไซรัป (refined_sugar_syrup) + กากชานอ้อยหมักปุ๋ย (organic_compost)",
      downstreamProductTh: "ขนมปังโฮลเกรน, ครัวซองต์เนยสด, เครื่องดื่มเวย์โปรตีน (dairy_protein_shake)",
      simulationScopeNoteTh: "น้ำตาลไม่ใช่ T0 แท้จริง ต้องผ่านการปลูกอ้อยและหีบเคี่ยว หรือซื้อจากโรงหีบสหกรณ์"
    },
    {
      chainId: "palm_olein_biodiesel_chain",
      nameTh: "สายปาล์มน้ำมัน ➔ น้ำมันปาล์มบริสุทธิ์/เนยขาว & ไบโอดีเซล",
      trueNaturalSourceTh: "ที่ดินแปลงสวนปาล์ม + น้ำดิบธรรมชาติ (raw_water_m3) + ธาตุอาหารดิน",
      propaguleOrDepositTh: "ต้นกล้าปาล์มน้ำมันพันธุ์ดี (palm_seedling)",
      cultivationOrExtractionTh: "ปลูกและดูแลแปลงปาล์ม ใช้น้ำและปุ๋ย เก็บเกี่ยวทะลายปาล์มสด (crude_palm)",
      midstreamProcessingTh: "กลั่นทะลายปาล์มสดเป็นน้ำมันปาล์มบริสุทธิ์ (refined_palm_oil) และกลั่นร่วมกับปิโตรเลียมเป็นน้ำมันดีเซล B7 (diesel_liter)",
      downstreamProductTh: "น้ำมันปรุงอาหารโอเลอิน (premium_cooking_oil), โดว์เพสตรี้, เชื้อเพลิงกองรถขนส่ง B2B",
      simulationScopeNoteTh: "เชื่อมผลผลิตปาล์มเข้าสู่ทั้งสายอาหารและเชื้อเพลิงกองรถขนส่งของบริษัท"
    },
    {
      chainId: "dairy_soy_biomed_chain",
      nameTh: "สายฟาร์มโคนม & แปลงถั่วเหลืองสมุนไพร ➔ โพรไบโอติกส์ & โภชนเภสัช",
      trueNaturalSourceTh: "ที่ดินแปลงเกษตร + น้ำดิบธรรมชาติ (raw_water_m3)",
      propaguleOrDepositTh: "ฝูงโคนมแม่พันธุ์ + เมล็ดพันธุ์ถั่วเหลือง/สมุนไพร (soybean_seed)",
      cultivationOrExtractionTh: "เลี้ยงโคนมด้วยรำข้าว/ถั่วเหลืองและน้ำดิบได้น้ำนมโคสด (fresh_milk_soy) • เพาะปลูกถั่วเหลือง/สมุนไพรได้ (soybean_crop)",
      midstreamProcessingTh: "หมักน้ำนมโคสดเป็นหัวเชื้อโพรไบโอติกส์ (probiotic_culture) • สกัดถั่วเหลือง/สมุนไพรเป็นสารสกัดเข้มข้น (raw_extract)",
      downstreamProductTh: "เครื่องดื่มสมุนไพร (herbalDrink), ซองเจลโพรไบโอติกส์ (probioticElixir), โภชนเภสัชซินไบโอติกส์ (synbiotic_medical_drink)",
      simulationScopeNoteTh: "แยกน้ำนมโคสด (fresh_milk_soy) ออกจากถั่วเหลืองเพาะปลูก (soybean_crop) และไม่เสกหัวเชื้อฟรีจากฟาร์ม"
    },
    {
      chainId: "forestry_pulp_carton_chain",
      nameTh: "สายป่าปลูกไม้เศรษฐกิจหมุนเวียน ➔ เยื่อและกล่องกระดาษลูกฟูก",
      trueNaturalSourceTh: "ที่ดินป่าปลูก + น้ำดิบธรรมชาติ (raw_water_m3)",
      propaguleOrDepositTh: "กล้าไม้เศรษฐกิจหมุนเวียน (palm_seedling) และสต็อกต้นไม้โตเต็มวัย (treeStock)",
      cultivationOrExtractionTh: "ตัดไม้เศรษฐกิจได้ท่อนไม้ซุง (timber_bamboo_log) โดยสต็อกต้นไม้ลดลงจริง และต้องปลูกกล้าไม้ทดแทนรอรอบโต",
      midstreamProcessingTh: "ต้มเยื่อไม้ซุงกับน้ำดิบและขึ้นรูปเป็นกล่องกระดาษลูกฟูก (pack_carton)",
      downstreamProductTh: "บรรจุภัณฑ์สำหรับสินค้าส่งออกทุกหมวด และขายส่ง B2B ให้ศูนย์ค้าส่ง",
      simulationScopeNoteTh: "ป่าปลูกไม่เสกกล่องกระดาษสำเร็จรูปเข้าคลังฟรี ต้องตัดไม้ ปลูกทดแทน และเดินเครื่องแปรรูปกล่อง"
    },
    {
      chainId: "silica_semicon_glass_chain",
      nameTh: "สายเหมืองทรายควอตซ์ซิลิกา ➔ แก้วบรรจุภัณฑ์ & แท่งซิลิคอน ➔ เวเฟอร์ ➔ ชิปนาโน",
      trueNaturalSourceTh: "แหล่งแร่ทรายควอตซ์ซิลิกาธรรมชาติ (silica_bauxite_ore) ที่มีปริมาณสำรองจำกัด (reserveRemaining)",
      propaguleOrDepositTh: "ปริมาณสำรองแร่ในเหมือง (Finite Deposit) ขุดแล้วลดลงจริงและเกิดกากแร่ (tailings)",
      cultivationOrExtractionTh: "ขุดและแต่งแร่ทรายควอตซ์ซิลิกา (silica_bauxite_ore) โดยใช้พลังงานและค่าบำรุงรักษาเหมือง",
      midstreamProcessingTh: "หลอมเป็นขวดแก้ว (glass_bottle) ➔ เลนส์ (optical_lens) หรือถลุงเตาอาร์กเป็นแท่งซิลิคอน MG-Si (metallurgical_silicon) ➔ ดึงผลึกเวเฟอร์ (silicon_wafer) ➔ ชิป (microchip)",
      downstreamProductTh: "กล้อง AI (visionCamera), โมดูล AI Edge (ai_edge_module), โดรนขนส่ง (autonomous_cargo_drone)",
      simulationScopeNoteTh: "แยกทรายควอตซ์ซิลิกา (silica_bauxite_ore) ออกจากแร่บ็อกไซต์ (bauxite_ore) และเหมืองไม่แจกชิป/เวเฟอร์ฟรี"
    },
    {
      chainId: "ore_metal_ev_battery_chain",
      nameTh: "สายเหมืองแร่เหล็ก-ทองแดง-บ็อกไซต์-ลิเธียม ➔ โลหะแผ่น/ขดลวด/แบตเตอรี่ ➔ ยานยนต์ EV",
      trueNaturalSourceTh: "แหล่งแร่ทองแดง/เหล็ก (copper_iron_ore), แร่บ็อกไซต์ (bauxite_ore), และแร่ลิเธียม (lithium_brine_ore)",
      propaguleOrDepositTh: "ปริมาณสำรองแร่โลหะและน้ำเกลือแร่ลิเธียมในสัมปทานเหมือง",
      cultivationOrExtractionTh: "ขุดแร่ดิบจากเหมืองตามกำลังเครื่องจักรและปริมาณสำรองคงเหลือ",
      midstreamProcessingTh: "ถลุงเป็นแผ่นโลหะ (metal_sheet), ขดลวดทองแดง (copper_coil), สารแคโทดลิเธียม (cathode_electrolyte) ➔ แบตเตอรี่ (battery)",
      downstreamProductTh: "ชุดควบคุม EV (evController), แพ็กแบตเตอรี่ (batteryPack), ตู้ชาร์จไว (evFastCharger), Powerwall",
      simulationScopeNoteTh: "การซื้อเหมืองได้เฉพาะแร่ดิบจากการขุดจริง ต้องผ่านโรงถลุงก่อนจึงจะได้แผ่นโลหะและขดลวดทองแดง"
    },
    {
      chainId: "phosphate_compost_fertilizer_chain",
      nameTh: "สายหินฟอสเฟต/แร่โพแทช & รำข้าวแกลบ ➔ ปุ๋ยเคมี N-P-K & ปุ๋ยหมักอินทรีย์",
      trueNaturalSourceTh: "แหล่งหินฟอสเฟตและแร่โพแทชธรรมชาติ (phosphate_potash_rock) + น้ำดิบ (raw_water_m3)",
      propaguleOrDepositTh: "แร่ฟอสเฟต/โพแทชจากเหมือง และผลพลอยได้รำข้าว/แกลบ (rice_bran_husk) จากโรงสี",
      cultivationOrExtractionTh: "ขุดแร่แม่ปุ๋ยจากเหมือง หรือรวบรวมรำข้าว/แกลบจากการสีข้าวเปลือก",
      midstreamProcessingTh: "สังเคราะห์ปุ๋ยธาตุอาหารหลัก (npk_fertilizer) หรือหมักปุ๋ยอินทรีย์ชีวภาพ (organic_compost)",
      downstreamProductTh: "เติมธาตุอาหารในแปลงเกษตรทั้ง 4 สายเพื่อรักษาระดับผลผลิตในรอบปลูกถัดไป หรือขายส่งสหกรณ์เกษตร B2B",
      simulationScopeNoteTh: "ปิดลูปธาตุอาหารดินตามบทที่ 23: ปุ๋ยไม่ใช่วัตถุเสกฟรี แต่มีวัตถุดิบ ต้นทุน และกระบวนการผลิตจริง"
    },
    {
      chainId: "bauxite_alumina_steel_slag_chain",
      nameTh: "สายแร่บ็อกไซต์ & แร่เหล็ก + ถ่านโค้กฟลักซ์ ➔ อะลูมินาบิลเล็ต/เหล็กกล้าแผ่น + กากตะกรันโคลนแดง ➔ โปรไฟล์อะลูมิเนียม/รางโซลาร์/ถาดแบต EV",
      trueNaturalSourceTh: "แหล่งแร่บ็อกไซต์ (bauxite_ore) และแร่เหล็กธรรมชาติ (iron_ore) จากเหมืองลพบุรี/ออสเตรเลีย/อินโดนีเซีย",
      propaguleOrDepositTh: "ปริมาณสำรองแร่จำกัดในเหมือง (reserveRemaining) + ถ่านโค้กและหินปูนฟลักซ์ลดออกไซด์ (coke_reducing_flux)",
      cultivationOrExtractionTh: "ขุดแร่บ็อกไซต์และแร่เหล็กจากเหมืองตามกำลังเครื่องจักร",
      midstreamProcessingTh: "สกัด Bayer/Hall-Héroult เป็นแท่งอะลูมินาบิลเล็ต (alumina_billet) และถลุงแร่เหล็กด้วยโค้กเป็นเหล็กกล้าแผ่น (structural_steel_plate) โดยเกิดกากโคลนแดง/ตะกรันเตาถลุง (mineral_slag_mud) ที่ต้องบำบัดหรือรีไซเคิล ➔ อัดรีดเป็นโปรไฟล์อะลูมิเนียม (aluminum_extrusion_profile)",
      downstreamProductTh: "ชุดรางโซลาร์รูฟท็อป (solar_mounting_rail_kit), ถาดแบตเตอรี่ EV (ev_battery_tray_assembly), ตู้สวิตช์เกียร์ (industrial_switchgear_cabinet), โมดูลแบต NMC (high_nickel_nmc_module)",
      simulationScopeNoteTh: "ปิดช่องโหว่แร่บ็อกไซต์และแร่เหล็กค้างคลัง: ถลุงด้วยถ่านโค้กฟลักซ์ตามหลักเคมีโลหะวิทยาจริง เกิดกากตะกรันจริง และต่อยอดเป็นสินค้าปลายน้ำได้ครบวงจร"
    }
  ]);

  // 12 External Assets & Concessions (ปรับปรุงตามบทที่ 23: แยกสถานะแปลงเกษตร เหมืองแร่มีปริมาณสำรองจำกัด ป่าไม้ต้องปลูกทดแทน และไม่เสกสินค้าแปรรูปสำเร็จเข้าคลังฟรี)
  const EXTERNAL_ASSETS = deepFreeze({
    jasmine_rice_farm: {
      id: "jasmine_rice_farm",
      nameTh: "ไร่ข้าวหอมมะลิและธัญพืชอินทรีย์ทุ่งกุลาร้องไห้",
      shortNameTh: "ไร่ข้าวหอมมะลิ/ธัญพืช",
      category: "agro_upstream",
      categoryNameTh: "เกษตรกรรมและอาหารต้นน้ำ",
      resourceType: "agricultural_plot",
      cropId: "jasmine_rice",
      locationTh: "ร้อยเอ็ด / สุรินทร์",
      icon: "🌾",
      cost: 2200000,
      dailyUpkeep: 15000,
      dailyDividend: 45000,
      starterSeeds: { rice_seed: 6, raw_water_m3: 6, organic_compost: 2 },
      harvestYields: { paddy_grain: 8 },
      linkedChainId: "chain_grain_flour_bakery",
      operationalEffectsTh: [
        "เปิดแปลงนาข้าวหอมมะลิ (8 ขั้นตอนเพาะปลูก): ใช้เมล็ดพันธุ์ข้าว (rice_seed) + น้ำดิบ + ธาตุอาหารดิน เพาะปลูกและเก็บเกี่ยวข้าวเปลือก (paddy_grain)",
        "คัดข้าวเปลือกที่เก็บเกี่ยวได้ 25% เก็บเป็นเมล็ดพันธุ์รอบถัดไป และส่งส่วนที่เหลือสีเป็นข้าวสาร (milled_rice) + รำข้าว (rice_bran_husk) เพื่อโม่แป้งเบเกอรี่",
        "ส่งข้าวหอมมะลิสดใหม่เข้าโรงอาหารพนักงาน ช่วยเพิ่มขวัญกำลังใจ (Morale) +1 ทุกวัน"
      ],
      moraleBonusDaily: 1,
      esgBonus: 1
    },
    palm_oil_plantation: {
      id: "palm_oil_plantation",
      nameTh: "สวนปาล์มน้ำมันและมะพร้าวอุตสาหกรรมสุราษฎร์ธานี",
      shortNameTh: "สวนปาล์มน้ำมันสุราษฎร์ฯ",
      category: "agro_upstream",
      categoryNameTh: "เกษตรกรรมและอาหารต้นน้ำ",
      resourceType: "agricultural_plot",
      cropId: "oil_palm",
      locationTh: "สุราษฎร์ธานี / กระบี่",
      icon: "🌴",
      cost: 2500000,
      dailyUpkeep: 18000,
      dailyDividend: 52000,
      starterSeeds: { palm_seedling: 6, raw_water_m3: 6, npk_fertilizer: 2 },
      harvestYields: { crude_palm: 8 },
      linkedChainId: "chain_palm_oil_refinery",
      operationalEffectsTh: [
        "เปิดแปลงสวนปาล์มน้ำมัน: ใช้ต้นกล้าปาล์ม (palm_seedling) + น้ำดิบ + ปุ๋ยบำรุงดิน เพาะปลูกและเก็บเกี่ยวทะลายปาล์มสด (crude_palm)",
        "ป้อนโรงกลั่นกลางน้ำสกัดเป็นน้ำมันปาล์มบริสุทธิ์ (refined_palm_oil) และน้ำมันดีเซลหมุนเร็ว B7 (diesel_liter) สำหรับกองรถขนส่ง",
        "ช่วยลดภาระค่าเชื้อเพลิงและเร่งความเร็วงานจัดส่ง (Shipping) +6%"
      ],
      shippingSpeedBonus: 0.06,
      esgBonus: 1
    },
    sugarcane_estate: {
      id: "sugarcane_estate",
      nameTh: "ไร่อ้อยปลอดการเผาและแปลงท่อนพันธุ์นครปฐม",
      shortNameTh: "ไร่อ้อยปลอดการเผา",
      category: "agro_upstream",
      categoryNameTh: "เกษตรกรรมและอาหารต้นน้ำ",
      resourceType: "agricultural_plot",
      cropId: "sugarcane",
      locationTh: "นครปฐม / กาญจนบุรี",
      icon: "🎋",
      cost: 2000000,
      dailyUpkeep: 14000,
      dailyDividend: 40000,
      starterSeeds: { cane_stalk_seed: 6, raw_water_m3: 6, organic_compost: 2 },
      harvestYields: { raw_cane: 8 },
      linkedChainId: "chain_cane_sugar_ferment",
      operationalEffectsTh: [
        "เปิดแปลงไร่อ้อยปลอดการเผา: ใช้ท่อนพันธุ์อ้อย (cane_stalk_seed) + น้ำดิบ + ปุ๋ย เพาะปลูกและเก็บเกี่ยวลำอ้อยสด (raw_cane) พร้อมคัดท่อนพันธุ์ปลูกรอบถัดไป",
        "ป้อนโรงหีบและเคี่ยวกลางน้ำผลิตน้ำตาลทรายบริสุทธิ์และไซรัป (refined_sugar_syrup) ใช้ในเบเกอรี่และเครื่องดื่ม",
        "เชื้อเพลิงชีวมวลจากใบและชานอ้อยช่วยลดค่าเช่าและสาธารณูปโภครายวันของนิคมลง 8%"
      ],
      rentReductionPct: 0.08,
      esgBonus: 1
    },
    smart_dairy_farm: {
      id: "smart_dairy_farm",
      nameTh: "ฟาร์มโคนมและปศุสัตว์อัจฉริยะสระบุรี",
      shortNameTh: "ฟาร์มโคนมอัจฉริยะ",
      category: "agro_upstream",
      categoryNameTh: "เกษตรกรรมและอาหารต้นน้ำ",
      resourceType: "livestock_herd",
      initialHerdCount: 24,
      locationTh: "มวกเหล็ก สระบุรี",
      icon: "🐄",
      cost: 2800000,
      dailyUpkeep: 20000,
      dailyDividend: 58000,
      starterSeeds: { rice_bran_husk: 6, raw_water_m3: 6 },
      harvestYields: { fresh_milk_soy: 6, organic_compost: 2 },
      linkedChainId: "chain_dairy_probiotic_bio",
      operationalEffectsTh: [
        "ดูแลฝูงโคนม 24 ตัวด้วยอาหารสัตว์ (รำข้าว/ถั่วเหลือง) และน้ำดิบ เพื่อรีดน้ำนมโคสดแท้ (fresh_milk_soy) และได้มูลโคหมักปุ๋ยอินทรีย์ (organic_compost)",
        "ส่งน้ำนมโคสดเข้าห้องแล็บคลีนรูมเพื่อหมักบ่มเป็นหัวเชื้อโพรไบโอติกส์ (probiotic_culture) โดยไม่เสกหัวเชื้อสำเร็จรูปฟรี",
        "เสริมโภชนาการนมสดในโรงอาหาร ฟื้นฟูพลังงาน (Energy) พนักงานทุกคน +2 หน่วยทุกสิ้นวัน"
      ],
      energyBonusDaily: 2,
      esgBonus: 1
    },
    organic_herb_orchard: {
      id: "organic_herb_orchard",
      nameTh: "สวนถั่วเหลืองและสมุนไพรออร์แกนิกเชียงใหม่",
      shortNameTh: "สวนถั่วเหลือง/สมุนไพร",
      category: "agro_upstream",
      categoryNameTh: "เกษตรกรรมและอาหารต้นน้ำ",
      resourceType: "agricultural_plot",
      cropId: "soy_herb",
      locationTh: "แม่ริม เชียงใหม่",
      icon: "🌿",
      cost: 2400000,
      dailyUpkeep: 16000,
      dailyDividend: 48000,
      starterSeeds: { soybean_seed: 6, raw_water_m3: 6, organic_compost: 2 },
      harvestYields: { soybean_crop: 6 },
      linkedChainId: "chain_herb_botanical_extract",
      operationalEffectsTh: [
        "เปิดแปลงถั่วเหลืองและสมุนไพรออร์แกนิก: ใช้เมล็ดพันธุ์ (soybean_seed) + น้ำดิบ + ปุ๋ยหมัก เก็บเกี่ยวผลผลิต (soybean_crop) และช่วยตรึงไนโตรเจนฟื้นฟูดิน",
        "ส่งผลผลิตสมุนไพรและถั่วเหลืองเข้าโรงสกัดสุญญากาศเพื่อผลิตสารสกัดเข้มข้น (raw_extract) ป้อนสายอาหารสุขภาพและโภชนเภสัช",
        "เพิ่มโอกาสผ่าน QC ของสินค้ากลุ่มอาหารและสุขภาพ +4% และยกระดับชื่อเสียงองค์กรสีเขียว +2"
      ],
      foodQaBonus: 0.04,
      esgBonus: 2
    },
    rubber_polymer_estate: {
      id: "rubber_polymer_estate",
      nameTh: "สวนยางพาราและแปลงไม้ยางอุตสาหกรรมระยอง",
      shortNameTh: "สวนยางพารา/น้ำยางสด",
      category: "materials_mining",
      categoryNameTh: "เหมืองแร่ วัสดุศาสตร์ และป่าไม้",
      resourceType: "plantation_tapping",
      initialTreeStock: 160,
      locationTh: "นิคมพัฒนา ระยอง",
      icon: "🌳",
      cost: 3000000,
      dailyUpkeep: 22000,
      dailyDividend: 64000,
      starterSeeds: { palm_seedling: 4, raw_water_m3: 4 },
      harvestYields: { natural_latex: 7 },
      linkedChainId: "chain_latex_polymer_compound",
      operationalEffectsTh: [
        "ดูแลแปลงต้นยางพาราโตเต็มวัย 160 ต้น กรีดน้ำยางพาราสด (natural_latex) เข้าคลังตามสภาพความชื้นดินและแรงงานดูแล",
        "ส่งน้ำยางพาราสดเข้าโรงสังเคราะห์คอมปาวด์เพื่อแปรรูปเป็นเม็ดโพลีเมอร์เรซิน (polymer_resin) และยางรถบรรทุกเรเดียล (truck_tire)",
        "ซีลยางเกรดอุตสาหกรรมช่วยลดอัตราการสึกหรอของเครื่องจักรโรงงานลง 12%"
      ],
      wearReductionPct: 0.12,
      esgBonus: 1
    },
    silica_copper_mine: {
      id: "silica_copper_mine",
      nameTh: "สัมปทานเหมืองแร่ควอตซ์ซิลิกา บ็อกไซต์ ทองแดง และฟอสเฟต",
      shortNameTh: "เหมืองแร่ซิลิกา/โลหะ/ฟอสเฟต",
      category: "materials_mining",
      categoryNameTh: "เหมืองแร่ วัสดุศาสตร์ และป่าไม้",
      resourceType: "finite_mine",
      initialReserveUnits: 420,
      oreGrade: 0.9,
      locationTh: "ลพบุรี / ตาก",
      icon: "⛏️",
      cost: 3800000,
      dailyUpkeep: 28000,
      dailyDividend: 82000,
      starterSeeds: {},
      harvestYields: { silica_bauxite_ore: 4, bauxite_ore: 3, iron_ore: 2, copper_iron_ore: 4, lithium_brine_ore: 2, phosphate_potash_rock: 2 },
      linkedChainId: "chain_silica_wafer_semicon",
      operationalEffectsTh: [
        "ขุดแร่ธรรมชาติต้นน้ำแท้จริงจากแหล่งสัมปทานที่มีปริมาณสำรองจำกัด (420 หน่วย): ทรายควอตซ์ซิลิกา, แร่บ็อกไซต์, แร่ทองแดง/เหล็ก, แร่ลิเธียม และหินฟอสเฟต",
        "ทุกการขุดจะหักปริมาณสำรองแร่คงเหลือ (reserveRemaining) และเกิดกากแร่ (tailings) — ไม่แจกแผ่นโลหะหรือชิปสำเร็จรูปฟรี ต้องส่งเข้าโรงถลุงแปรรูปต่อ!",
        "ลดการพึ่งพาการนำเข้าแร่ดิบจากต่างประเทศสำหรับสายเซมิคอนดักเตอร์ ยานยนต์ EV และโรงงานปุ๋ย"
      ],
      esgBonus: 0
    },
    forestry_pulp_mill: {
      id: "forestry_pulp_mill",
      nameTh: "สวนป่าปลูกไม้เศรษฐกิจหมุนเวียนและแปลงเพาะชำกล้าไม้",
      shortNameTh: "ป่าปลูกไม้เศรษฐกิจหมุนเวียน",
      category: "materials_mining",
      categoryNameTh: "เหมืองแร่ วัสดุศาสตร์ และป่าไม้",
      resourceType: "renewable_forest",
      initialTreeStock: 120,
      locationTh: "ปราจีนบุรี / สระแก้ว",
      icon: "🌲",
      cost: 2100000,
      dailyUpkeep: 15000,
      dailyDividend: 42000,
      starterSeeds: { palm_seedling: 6, raw_water_m3: 6 },
      harvestYields: { timber_bamboo_log: 6 },
      linkedChainId: "chain_forestry_pulp_packaging",
      operationalEffectsTh: [
        "บริหารสต็อกต้นไม้เศรษฐกิจหมุนเวียน (120 ต้น): การตัดไม้ได้ท่อนไม้ซุง (timber_bamboo_log) ทำให้สต็อกต้นไม้ลดลงจริง และต้องใช้กล้าไม้ + น้ำดิบปลูกทดแทนตามรอบเวลา",
        "ส่งท่อนไม้ซุงเข้าโรงเยื่อกระดาษแปรรูปเป็นกล่องบรรจุภัณฑ์ (pack_carton) โดยไม่เสกกล่องสำเร็จรูปฟรีจากป่า",
        "ช่วยเร่งความเร็วงานแพ็กกิ้งในคลังสินค้า +12% และเพิ่มชื่อเสียง ESG +2"
      ],
      packingSpeedBonus: 0.12,
      esgBonus: 2
    },
    offsite_solar_wind_farm: {
      id: "offsite_solar_wind_farm",
      nameTh: "ทุ่งกังหันลม โซลาร์ฟาร์ม และสถานีสูบน้ำดิบธรรมชาติ",
      shortNameTh: "โซลาร์ฟาร์ม & สถานีน้ำดิบ",
      category: "energy_infra",
      categoryNameTh: "พลังงานและโครงสร้างพื้นฐาน",
      resourceType: "environmental_flow",
      dailyWaterFlowCap: 10,
      locationTh: "ชัยภูมิ / นครราชสีมา",
      icon: "🌬️",
      cost: 3400000,
      dailyUpkeep: 18000,
      dailyDividend: 75000,
      starterSeeds: { raw_water_m3: 10 },
      harvestYields: { raw_water_m3: 8 },
      linkedChainId: null,
      operationalEffectsTh: [
        "แหล่งพลังงานหมุนเวียนและสถานีสูบน้ำดิบธรรมชาติ (Environmental Flow): สูบน้ำดิบ (raw_water_m3) เข้าคลังตามขีดจำกัดกำลังเครื่องสูบและสภาพอากาศ (สูงสุด 8–12 หน่วย/วัน)",
        "จ่ายกระแสไฟฟ้าสะอาดเข้าสายส่งนิคม ลดภาระค่าเช่าและค่าไฟฟ้ารายวัน (rentDaily) ลง 28% และเร่งความเร็วผลิต +6%",
        "เพิ่มความพร้อมเข้าตลาดหลักทรัพย์ (IPO Readiness) +6%"
      ],
      rentReductionPct: 0.28,
      productionSpeedBonus: 0.06,
      esgBonus: 3
    },
    deepsea_port_terminal: {
      id: "deepsea_port_terminal",
      nameTh: "ท่าเทียบเรือคอนเทนเนอร์และคลังทัณฑ์บนแหลมฉบัง",
      shortNameTh: "ท่าเทียบเรือแหลมฉบัง",
      category: "logistics_commercial",
      categoryNameTh: "โลจิสติกส์และเครือข่ายการค้า",
      resourceType: "logistics_infrastructure",
      locationTh: "ท่าเรือแหลมฉบัง ชลบุรี",
      icon: "🚢",
      cost: 4200000,
      dailyUpkeep: 26000,
      dailyDividend: 90000,
      harvestYields: {},
      linkedChainId: null,
      operationalEffectsTh: [
        "ทางด่วนศุลกากรและท่าเทียบเรือส่วนตัว ลดเวลารอวัตถุดิบขาเข้า (Lead Time) จากทุกซัพพลายเออร์ลง 30%",
        "เพิ่มขนาดขบวนรถบรรทุกขนส่งประจำนิคม +4 คันทันที และเพิ่มโอกาสได้งานขนส่งเหมาคัน B2B",
        "เพิ่มอำนาจต่อรองราคาขายส่งออก B2B +4% สำหรับทุกออเดอร์"
      ],
      leadTimeReductionPct: 0.3,
      fleetBonus: 4,
      pricePremiumBonus: 0.04,
      esgBonus: 1
    },
    cold_chain_hub: {
      id: "cold_chain_hub",
      nameTh: "ศูนย์กระจายสินค้าห้องเย็นและฟลีทรถควบคุมอุณหภูมิ",
      shortNameTh: "คลังห้องเย็น Cold Chain",
      category: "logistics_commercial",
      categoryNameTh: "โลจิสติกส์และเครือข่ายการค้า",
      resourceType: "logistics_infrastructure",
      locationTh: "บางนา-ตราด สมุทรปราการ",
      icon: "❄️",
      cost: 2900000,
      dailyUpkeep: 20000,
      dailyDividend: 62000,
      harvestYields: {},
      linkedChainId: null,
      operationalEffectsTh: [
        "รักษาความสดของเมล็ดพันธุ์ ข้าวสาร แป้ง นมสด สมุนไพร และเบเกอรี่ เพิ่มโอกาสผ่าน QC สินค้าหมวดอาหาร +6%",
        "เพิ่มขบวนรถห้องเย็น +3 คัน และยืดเวลาส่งมอบออเดอร์ (Deadline) ให้ยาวขึ้น +1 วัน",
        "รองรับงานรับจ้างขนส่งควบคุมอุณหภูมิ (Cold-Chain Freight) มูลค่าสูง"
      ],
      foodQaBonus: 0.06,
      fleetBonus: 3,
      deadlineBonusDays: 1,
      esgBonus: 1
    },
    retail_flagship_network: {
      id: "retail_flagship_network",
      nameTh: "เครือข่ายโชว์รูมและแฟรนไชส์ร้านค้าปลีก-ส่งทั่วประเทศ",
      shortNameTh: "เครือข่ายโชว์รูม/ร้านค้าปลีก",
      category: "logistics_commercial",
      categoryNameTh: "โลจิสติกส์และเครือข่ายการค้า",
      resourceType: "commercial_network",
      locationTh: "กรุงเทพฯ และหัวเมืองใหญ่ 12 สาขา",
      icon: "🏪",
      cost: 3600000,
      dailyUpkeep: 24000,
      dailyDividend: 85000,
      harvestYields: {},
      linkedChainId: null,
      operationalEffectsTh: [
        "บูรณาการปลายน้ำ (Forward Integration): ขายตรงถึงตลาดปลายทาง เพิ่มราคาขายต่อหน่วย (unitPrice) +7%",
        "เพิ่มสัดส่วนเงินมัดจำรับล่วงหน้าเมื่อปิดดีล (Deposit) จาก 30% เป็น 40% และเพิ่มยอดผู้สมัครแอป SaaS ของบริษัท",
        "ขยายส่วนแบ่งการตลาดของบริษัท (Market Share) +3.5% ทันที"
      ],
      pricePremiumBonus: 0.07,
      depositPctBonus: 0.1,
      marketShareBonus: 3.5,
      esgBonus: 1
    }
  });

  // 5-Tier Material & Product Value Chain Architecture (แยก T0 ต้นน้ำธรรมชาติแท้จริง ออกจากผลผลิตชีวภาพ/เกษตร และการแปรรูป T1-T4 ตามบทที่ 23)
  const MATERIAL_TIERS = deepFreeze({
    0: {
      tier: 0,
      code: "T0_NATURAL",
      nameTh: "ขั้นที่ 0: ทรัพยากรธรรมชาติต้นน้ำแท้จริง (แร่ หิน ทราย น้ำดิบ ปิโตรเลียมดิบ • ห้ามมีข้าว น้ำตาล แป้ง กระดาษ หรือน้ำนมในขั้นนี้)",
      shortNameTh: "T0 · ทรัพยากรธรรมชาติแท้จริง (True Natural Source)",
      badgeTh: "T0 · ธรรมชาติแท้",
      craftable: false,
      sellableB2B: true
    },
    1: {
      tier: 1,
      code: "T1_BIO_AND_REFINED",
      nameTh: "ขั้นที่ 1: เมล็ดพันธุ์ ผลผลิตเพาะปลูก/ปศุสัตว์ และวัตถุดิบแปรรูปขั้นต้น (เพาะปลูกในแปลงเกษตร หรือสี/โม่/หีบ/ถลุงจาก T0)",
      shortNameTh: "T1 · ผลผลิตชีวภาพ & แปรรูปขั้นต้น (Cultivated & Stage-1 Refined)",
      badgeTh: "T1 · ชีวภาพ/แปรรูปต้น",
      craftable: true,
      sellableB2B: true
    },
    2: {
      tier: 2,
      code: "T2_INTERMEDIATE",
      nameTh: "ขั้นที่ 2: วัสดุวิศวกรรมและกึ่งสำเร็จรูปขั้นกลาง (แปรรูปต่อจาก T1 • ใช้ประกอบชิ้นส่วนหรือขาย B2B ได้)",
      shortNameTh: "T2 · วัสดุขั้นที่ 2 (Advanced Intermediate)",
      badgeTh: "T2 · วัสดุขั้นกลาง",
      craftable: true,
      sellableB2B: true
    },
    3: {
      tier: 3,
      code: "T3_COMPONENT",
      nameTh: "ขั้นที่ 3: ชิ้นส่วนอิเล็กทรอนิกส์และโมดูลไฮเทค (ต้นเกมต้องซื้อ เมื่อมีทุนและแต้มวิจัย R&D ถึงเกณฑ์จึงผลิตเองและขาย B2B ได้)",
      shortNameTh: "T3 · ชิ้นส่วนไฮเทค (Tech-Gated Component)",
      badgeTh: "T3 · ชิ้นส่วนไฮเทค",
      craftable: true,
      sellableB2B: true
    },
    4: {
      tier: 4,
      code: "T4_PRODUCT",
      nameTh: "ขั้นที่ 4: สินค้าอุตสาหกรรมสำเร็จรูปและบริการปลายน้ำ (ส่งมอบดีล B2B กองรถขนส่ง และซอฟต์แวร์ SaaS)",
      shortNameTh: "T4 · สินค้าสำเร็จรูป (Finished Product)",
      badgeTh: "T4 · สินค้าปลายน้ำ",
      craftable: true,
      sellableB2B: true
    }
  });

  // 32 Multi-Stage Material & Component Recipes (ครอบคลุมการสีข้าว โม่แป้ง ผลิตปุ๋ย N-P-K หมักปุ๋ยอินทรีย์ กลั่นดีเซล หล่อยางรถบรรทุก และแปรรูป T1-T3)
  const MATERIAL_RECIPES = deepFreeze({
    // === TIER 1: Grain Milling, Soil Fertilizer, Fuel, Tire & First-Stage Refining ===
    milled_rice: {
      id: "milled_rice",
      outputMaterialId: "milled_rice",
      nameTh: "สีข้าวเปลือกหอมมะลิเป็นข้าวสารขัดสีและรำข้าว/แกลบ (Cultivated Crop ➔ Milled Rice + Bran)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { paddy_grain: 2 },
      outputs: { milled_rice: 2, rice_bran_husk: 1 },
      b2bSellPrice: 3800,
      chainPathTh: "เมล็ดพันธุ์ข้าว (rice_seed) ➔ แปลงนา ➔ ข้าวเปลือก (paddy_grain) ➔ ข้าวสาร (milled_rice) + รำข้าว/แกลบ (rice_bran_husk)"
    },
    artisan_flour: {
      id: "artisan_flour",
      outputMaterialId: "artisan_flour",
      nameTh: "โม่ข้าวสารและธัญพืชเป็นแป้งโม่ละเอียดเกรดเบเกอรี่ (Milled Rice ➔ Artisan Flour)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { milled_rice: 2 },
      fallbackRawInputs: { paddy_grain: 2 },
      outputs: { artisan_flour: 2 },
      b2bSellPrice: 5500,
      chainPathTh: "ข้าวเปลือก (paddy_grain) ➔ สีเป็นข้าวสาร (milled_rice) ➔ โม่เป็นแป้งละเอียด (artisan_flour) ➔ โดว์เนยสด (T2) / ขนมปังโฮลเกรน (T4)"
    },
    nitrogen_ammonia: {
      id: "nitrogen_ammonia",
      nameTh: "กระบวนการแยกก๊าซไนโตรเจนจากอากาศและสังเคราะห์แอมโมเนีย (Haber-Bosch N-Feedstock)",
      tier: 1,
      domainId: "agri_soil_science",
      inputs: { ambient_air_gas: 1, raw_water_m3: 1 },
      outputs: { nitrogen_ammonia: 2 },
      requiredPlot: "refineryMill",
      minResearch: 0,
      capitalRequirement: 100000,
      b2bSellPrice: 3900,
      descTh: "แยกก๊าซไนโตรเจน (N2) จากอากาศและไฮโดรเจน (H2) จากน้ำดิบด้วยพลังงานไฟฟ้า สังเคราะห์เป็นแอมโมเนียแม่ปุ๋ยไนโตรเจนแท้",
    },
    npk_fertilizer: {
      id: "npk_fertilizer",
      nameTh: "กระบวนการผสมแม่ปุ๋ยธาตุอาหารหลักครบสูตร N-P-K (Nitrogen + Phosphate + Potash)",
      tier: 1,
      domainId: "agri_soil_science",
      inputs: { nitrogen_ammonia: 1, phosphate_potash_rock: 1 },
      fallbackRawInputs: { ambient_air_gas: 1, phosphate_potash_rock: 1, raw_water_m3: 1 },
      outputs: { npk_fertilizer: 3 },
      requiredPlot: "refineryMill",
      minResearch: 0,
      capitalRequirement: 120000,
      b2bSellPrice: 3600,
      descTh: "ผสมแม่ปุ๋ยไนโตรเจน (N จากแอมโมเนียสังเคราะห์) เข้ากับฟอสเฟตและโพแทช (P-K จากหินแร่ธรรมชาติ) ได้ปุ๋ย N-P-K ×3 กระสอบโดยไม่เสกธาตุ N จากหินฟอสเฟตเปล่า",
    },
    wheat_flour: {
      id: "wheat_flour",
      nameTh: "กระบวนการโม่และร่อนแป้งสาลีกลูเตนสูงเกรดเบเกอรี่",
      tier: 1,
      domainId: "food_fermentation",
      inputs: { wheat_grain: 2 },
      outputs: { wheat_flour: 3, rice_bran_husk: 1 },
      requiredPlot: "refineryMill",
      minResearch: 0,
      capitalRequirement: 120000,
      b2bSellPrice: 5800,
      descTh: "โม่ข้าวสาลีเมล็ดเต็ม (wheat_grain) ได้แป้งสาลีกลูเตนสูงสำหรับอบขนมปัง/บิสกิต และได้รำสาลีเป็นอาหารสัตว์",
    },
    pharma_saline_water: {
      id: "pharma_saline_water",
      nameTh: "กระบวนการกรองน้ำบริสุทธิ์ RO/DI และเตรียมสารละลายปลอดเชื้อระดับเภสัชกรรม",
      tier: 1,
      domainId: "biomed_sterile",
      inputs: { raw_water_m3: 2 },
      outputs: { pharma_saline_water: 2 },
      requiredPlot: "waterPlant",
      minResearch: 15,
      capitalRequirement: 160000,
      b2bSellPrice: 6400,
      descTh: "บำบัดน้ำดิบผ่านเมมเบรน RO/DI หลายชั้นและฆ่าเชื้อสำหรับผลิตน้ำเกลือทางการแพทย์และชุดทำแผลปลอดเชื้อ",
    },
    organic_compost: {
      id: "organic_compost",
      outputMaterialId: "organic_compost",
      nameTh: "หมักรำข้าว แกลบ และเศษพืชกับน้ำดิบเป็นปุ๋ยหมักอินทรีย์ชีวภาพ (Byproduct ➔ Compost)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { rice_bran_husk: 1, raw_water_m3: 1 },
      outputs: { organic_compost: 2 },
      b2bSellPrice: 2100,
      chainPathTh: "รำข้าว/แกลบจากโรงสี (rice_bran_husk) + น้ำดิบ (T0) ➔ ปุ๋ยหมักอินทรีย์ (organic_compost) ➔ ฟื้นฟูดินแปลงเกษตร"
    },
    diesel_liter: {
      id: "diesel_liter",
      outputMaterialId: "diesel_liter",
      nameTh: "กลั่นสารตั้งต้นปิโตรเลียมและปาล์มเป็นน้ำมันดีเซลหมุนเร็ว B7 (T0/Crop ➔ Fleet Fuel)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { crude_petro_feedstock: 1, crude_palm: 1 },
      outputs: { diesel_liter: 3 },
      b2bSellPrice: 4100,
      chainPathTh: "ปิโตรเลียมดิบ (T0) + ปาล์มสด (Crop) ➔ น้ำมันดีเซล B7 (diesel_liter) ➔ เติมกองรถบรรทุกรับจ้างขนส่ง B2B"
    },
    truck_tire: {
      id: "truck_tire",
      outputMaterialId: "truck_tire",
      nameTh: "หล่อและวัลคาไนซ์น้ำยางพาราสดกับโครงเหล็กเป็นยางรถบรรทุกเรเดียล (Crop+T1 ➔ Fleet Tire)",
      tier: 1,
      minResearch: 10,
      capitalRequirement: 1000000,
      inputs: { natural_latex: 2, metal_sheet: 1 },
      outputs: { truck_tire: 2 },
      b2bSellPrice: 8200,
      chainPathTh: "น้ำยางพาราสด (natural_latex) + แผ่นโลหะ (metal_sheet) ➔ ยางรถบรรทุกเรเดียล (truck_tire) ➔ ซ่อมบำรุงกองรถขนส่ง"
    },
    refined_palm_oil: {
      id: "refined_palm_oil",
      outputMaterialId: "refined_palm_oil",
      nameTh: "กลั่นทะลายปาล์มสดเป็นน้ำมันปาล์มบริสุทธิ์และเนยขาว (Cultivated Crop ➔ T1)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { crude_palm: 2 },
      outputs: { refined_palm_oil: 2 },
      b2bSellPrice: 5900,
      chainPathTh: "ต้นกล้าปาล์ม ➔ ทะลายปาล์มสด (crude_palm) ➔ น้ำมันบริสุทธิ์/เนยขาว (T1) ➔ โดว์เนยสด (T2) / น้ำมันโอเลอิน (T4)"
    },
    refined_sugar_syrup: {
      id: "refined_sugar_syrup",
      outputMaterialId: "refined_sugar_syrup",
      nameTh: "หีบอ้อยสดและเคี่ยวเป็นน้ำตาลทรายบริสุทธิ์/ไซรัป (Cultivated Crop ➔ T1)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { raw_cane: 2 },
      outputs: { refined_sugar_syrup: 2 },
      b2bSellPrice: 5000,
      chainPathTh: "ท่อนพันธุ์อ้อย ➔ ลำอ้อยสด (raw_cane) ➔ น้ำตาล/ไซรัปบริสุทธิ์ (T1) ➔ เบเกอรี่/เครื่องดื่มโปรตีน (T4)"
    },
    raw_extract: {
      id: "raw_extract",
      outputMaterialId: "raw_extract",
      nameTh: "สกัดสุญญากาศถั่วเหลือง สมุนไพร และอ้อยเป็นสารสกัดเข้มข้น (Cultivated Crop ➔ T1)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { raw_cane: 1, fresh_milk_soy: 1 },
      fallbackRawInputs: { soybean_crop: 2 },
      outputs: { raw_extract: 2 },
      b2bSellPrice: 4600,
      chainPathTh: "ถั่วเหลือง/สมุนไพรเพาะปลูก (soybean_crop) + อ้อยสด ➔ สารสกัดสมุนไพร/โปรตีน (T1) ➔ โภชนเภสัช (T4)"
    },
    coke_reducing_flux: {
      id: "coke_reducing_flux",
      outputMaterialId: "coke_reducing_flux",
      nameTh: "เผาถ่านโค้กโลหะวิทยาและบดหินปูนฟลักซ์สำหรับเตาถลุงเหล็ก-อะลูมินา (T0/Log ➔ Reducing Flux T1)",
      tier: 1,
      domainId: "metal_machining",
      minResearch: 0,
      capitalRequirement: 80000,
      inputs: { crude_petro_feedstock: 1, timber_bamboo_log: 1 },
      fallbackRawInputs: { timber_bamboo_log: 2 },
      outputs: { coke_reducing_flux: 3 },
      b2bSellPrice: 3500,
      chainPathTh: "ปิโตรเลียมดิบ/ท่อนไม้เศรษฐกิจ ➔ ถ่านโค้กและฟลักซ์ลดออกไซด์ (coke_reducing_flux) ➔ ใช้ถลุงแร่เหล็กและบ็อกไซต์"
    },
    alumina_billet: {
      id: "alumina_billet",
      outputMaterialId: "alumina_billet",
      nameTh: "สกัดแร่บ็อกไซต์ด้วยกระบวนการ Bayer & แยกด้วยไฟฟ้า Hall-Héroult เป็นแท่งอะลูมินาบิลเล็ต (Bauxite T0 ➔ Alumina Billet T1 + Red Mud)",
      tier: 1,
      domainId: "metal_machining",
      chainId: "chain_bauxite_aluminum_extrusion",
      minResearch: 15,
      capitalRequirement: 1400000,
      inputs: { bauxite_ore: 2, coke_reducing_flux: 1, raw_water_m3: 1 },
      fallbackRawInputs: { bauxite_ore: 2, raw_water_m3: 1 },
      outputs: { alumina_billet: 2, mineral_slag_mud: 1 },
      b2bSellPrice: 7800,
      chainPathTh: "แร่บ็อกไซต์ (bauxite_ore) + โค้กฟลักซ์ + น้ำดิบ ➔ แท่งอะลูมินาบิลเล็ต (alumina_billet) + กากโคลนแดง (mineral_slag_mud) ➔ โปรไฟล์อะลูมิเนียมอัดรีด (T2)"
    },
    structural_steel_plate: {
      id: "structural_steel_plate",
      outputMaterialId: "structural_steel_plate",
      nameTh: "ถลุงแร่เหล็กในเตาพ่นลมร้อนด้วยถ่านโค้กฟลักซ์และรีดร้อนเป็นเหล็กกล้าแผ่นโครงสร้าง (Iron Ore T0 ➔ Structural Steel T1 + Slag)",
      tier: 1,
      domainId: "metal_machining",
      chainId: "chain_ore_smelting_metal",
      minResearch: 15,
      capitalRequirement: 1400000,
      inputs: { iron_ore: 2, coke_reducing_flux: 1 },
      fallbackRawInputs: { iron_ore: 2 },
      outputs: { structural_steel_plate: 2, mineral_slag_mud: 1 },
      b2bSellPrice: 8400,
      chainPathTh: "แร่เหล็ก (iron_ore) + ถ่านโค้กฟลักซ์ (coke_reducing_flux) ➔ เหล็กกล้าแผ่นโครงสร้าง (structural_steel_plate) + ตะกรันเตาถลุง (mineral_slag_mud)"
    },
    nickel_cobalt_matte: {
      id: "nickel_cobalt_matte",
      outputMaterialId: "nickel_cobalt_matte",
      nameTh: "สกัดความดันสูง HPAL แร่โลหะและลิเธียมเป็นนิกเกิล-โคบอลต์แมตต์เกรดแบตเตอรี่ (T0 Ore ➔ Battery Nickel Matte T1)",
      tier: 1,
      domainId: "power_electronics",
      minResearch: 25,
      capitalRequirement: 1800000,
      inputs: { copper_iron_ore: 1, lithium_brine_ore: 1, coke_reducing_flux: 1 },
      fallbackRawInputs: { copper_iron_ore: 1, lithium_brine_ore: 1 },
      outputs: { nickel_cobalt_matte: 2, mineral_slag_mud: 1 },
      b2bSellPrice: 8900,
      chainPathTh: "แร่โลหะ/นิกเกิล + แร่ลิเธียม + ฟลักซ์ ➔ นิกเกิล-โคบอลต์แมตต์ (nickel_cobalt_matte) ➔ โมดูลแบตเตอรี่ NMC-811 (T4)"
    },
    metal_sheet: {
      id: "metal_sheet",
      outputMaterialId: "metal_sheet",
      nameTh: "ถลุงและรีดแร่เหล็ก-ทองแดง-บ็อกไซต์เป็นแผ่นโลหะขึ้นรูป (T0 Ore ➔ T1)",
      tier: 1,
      domainId: "metal_machining",
      chainId: "chain_ore_smelting_metal",
      minResearch: 15,
      capitalRequirement: 1500000,
      inputs: { copper_iron_ore: 2 },
      fallbackRawInputs: { iron_ore: 2 },
      outputs: { metal_sheet: 2 },
      b2bSellPrice: 9100,
      chainPathTh: "แร่เหล็ก/ทองแดง/บ็อกไซต์จากเหมือง (T0) ➔ แผ่นโลหะขึ้นรูป (T1) ➔ ตัวถัง/ฮีตซิงก์ (T2) ➔ ยานยนต์ EV (T4)"
    },
    copper_coil: {
      id: "copper_coil",
      outputMaterialId: "copper_coil",
      nameTh: "ถลุงแร่และรีดเส้นลวดเป็นขดลวดทองแดงบริสุทธิ์ (T0 Ore ➔ T1)",
      tier: 1,
      minResearch: 15,
      capitalRequirement: 1500000,
      inputs: { copper_iron_ore: 2 },
      outputs: { copper_coil: 2 },
      b2bSellPrice: 7200,
      chainPathTh: "แร่ทองแดงดิบจากเหมือง (T0) ➔ ขดลวดทองแดง (T1) ➔ ชุดสายไฟ (T2) / แผงวงจร PCB (T3)"
    },
    polymer_resin: {
      id: "polymer_resin",
      outputMaterialId: "polymer_resin",
      nameTh: "สังเคราะห์น้ำยางสดและสารปิโตรเคมีเป็นเม็ดโพลีเมอร์เรซิน (Crop/T0 ➔ T1)",
      tier: 1,
      minResearch: 10,
      capitalRequirement: 1200000,
      inputs: { natural_latex: 2 },
      outputs: { polymer_resin: 2 },
      b2bSellPrice: 5300,
      chainPathTh: "น้ำยางพาราสด (natural_latex) / ปิโตรเลียม (T0) ➔ เม็ดพลาสติกเรซิน (T1) ➔ ตัวถัง/ชุดสายไฟ (T2)"
    },
    pack_carton: {
      id: "pack_carton",
      outputMaterialId: "pack_carton",
      nameTh: "ต้มเยื่อท่อนไม้ปลูกและขึ้นรูปเป็นกล่องกระดาษลูกฟูกมาตรฐาน (Forestry Log ➔ T1)",
      tier: 1,
      minResearch: 0,
      capitalRequirement: 0,
      inputs: { timber_bamboo_log: 2 },
      outputs: { pack_carton: 3 },
      b2bSellPrice: 2700,
      chainPathTh: "กล้าไม้ ➔ ท่อนไม้จากป่าปลูกหมุนเวียน (timber_bamboo_log) ➔ เยื่อและกล่องลูกฟูก (pack_carton) ➔ สินค้าส่งออกทุกหมวด (T4)"
    },
    glass_bottle: {
      id: "glass_bottle",
      outputMaterialId: "glass_bottle",
      nameTh: "หลอมทรายควอตซ์ซิลิกาธรรมชาติเป็นขวดแก้วสุญญากาศและหลอดแก้ว (T0 Ore ➔ T1)",
      tier: 1,
      minResearch: 10,
      capitalRequirement: 1000000,
      inputs: { silica_bauxite_ore: 1 },
      outputs: { glass_bottle: 2 },
      b2bSellPrice: 3300,
      chainPathTh: "ทรายควอตซ์ซิลิกาธรรมชาติ (T0) ➔ แก้วบริสุทธิ์/ขวดสุญญากาศ (T1) ➔ เลนส์ออปติคัล (T2)"
    },
    metallurgical_silicon: {
      id: "metallurgical_silicon",
      outputMaterialId: "metallurgical_silicon",
      nameTh: "ถลุงทรายควอตซ์ซิลิกาด้วยเตาอาร์กไฟฟ้าเป็นแท่งซิลิคอนบริสุทธิ์ MG-Si (T0 Ore ➔ T1)",
      tier: 1,
      minResearch: 35,
      capitalRequirement: 2000000,
      inputs: { silica_bauxite_ore: 2 },
      outputs: { metallurgical_silicon: 2 },
      b2bSellPrice: 6900,
      chainPathTh: "ทรายควอตซ์ซิลิกาธรรมชาติ (T0) ➔ แท่งซิลิคอน MG-Si (T1) ➔ ซิลิคอนเวเฟอร์ (T2) ➔ ชิปไมโครโพรเซสเซอร์ (T3)"
    },

    // === TIER 2: Second-Stage Advanced Intermediates (Crafted from Tier 1 Inputs) ===
    bakery_dough_butter: {
      id: "bakery_dough_butter",
      outputMaterialId: "bakery_dough_butter",
      nameTh: "นวดหมักแป้งโม่ละเอียดและเนยปาล์มบริสุทธิ์เป็นโดว์ขนมปังและเนยเพสตรี้ (T1 ➔ T2)",
      tier: 2,
      minResearch: 25,
      capitalRequirement: 1200000,
      inputs: { artisan_flour: 1, refined_palm_oil: 1 },
      outputs: { bakery_dough_butter: 2 },
      b2bSellPrice: 7400,
      chainPathTh: "ข้าวเปลือก ➔ ข้าวสาร ➔ แป้ง (T1) + เนยปาล์ม (T1) ➔ โดว์ขนมปัง/เนยเพสตรี้ (T2) ➔ ครัวซองต์ส่งออก (T4)"
    },
    probiotic_culture: {
      id: "probiotic_culture",
      outputMaterialId: "probiotic_culture",
      nameTh: "หมักบ่มน้ำนมโคสดจากฟาร์มเป็นหัวเชื้อจุลินทรีย์โพรไบโอติกส์ (Livestock Milk ➔ T2)",
      tier: 2,
      minResearch: 30,
      capitalRequirement: 1500000,
      inputs: { fresh_milk_soy: 2 },
      outputs: { probiotic_culture: 2 },
      b2bSellPrice: 6600,
      chainPathTh: "อาหารสัตว์+น้ำ ➔ น้ำนมโคสด (fresh_milk_soy) ➔ หัวเชื้อโพรไบโอติกส์ (T2) ➔ โภชนเภสัชซินไบโอติกส์ (T4)"
    },
    foil_pouch: {
      id: "foil_pouch",
      outputMaterialId: "foil_pouch",
      nameTh: "เคลือบลามิเนตแผ่นโลหะและเรซินเป็นซองฟอยล์สุญญากาศเกรดการแพทย์ (T1 ➔ T2)",
      tier: 2,
      minResearch: 25,
      capitalRequirement: 1200000,
      inputs: { metal_sheet: 1, polymer_resin: 1 },
      outputs: { foil_pouch: 4 },
      b2bSellPrice: 3000,
      chainPathTh: "แร่โลหะ + น้ำยางพารา ➔ แผ่นโลหะ + เรซิน (T1) ➔ ซองฟอยล์สุญญากาศ (T2)"
    },
    casing: {
      id: "casing",
      outputMaterialId: "casing",
      nameTh: "ฉีดขึ้นรูปเรซินและพับแผ่นโลหะเป็นตัวถังอุปกรณ์มาตรฐาน (T1 ➔ T2)",
      tier: 2,
      minResearch: 30,
      capitalRequirement: 1500000,
      inputs: { polymer_resin: 1, metal_sheet: 1 },
      outputs: { casing: 2 },
      b2bSellPrice: 6500,
      chainPathTh: "แร่โลหะ + น้ำยางพารา ➔ แผ่นโลหะ + เรซิน (T1) ➔ ตัวถังอุตสาหกรรม (T2)"
    },
    wire_harness: {
      id: "wire_harness",
      outputMaterialId: "wire_harness",
      nameTh: "หุ้มฉนวนเรซินและเข้าหัวขดลวดทองแดงเป็นชุดสายไฟแรงดันต่ำ (T1 ➔ T2)",
      tier: 2,
      minResearch: 35,
      capitalRequirement: 1500000,
      inputs: { copper_coil: 1, polymer_resin: 1 },
      outputs: { wire_harness: 2 },
      b2bSellPrice: 5900,
      chainPathTh: "แร่ทองแดง + น้ำยางพารา ➔ ขดลวดทองแดง + เรซิน (T1) ➔ ชุดสายไฟ (T2)"
    },
    aluminum_extrusion_profile: {
      id: "aluminum_extrusion_profile",
      outputMaterialId: "aluminum_extrusion_profile",
      nameTh: "อัดรีดแท่งอะลูมินาบิลเล็ตและชุบอโนไดซ์เป็นโปรไฟล์อะลูมิเนียมโครงสร้างเบา (Alumina Billet T1 ➔ Extrusion Profile T2)",
      tier: 2,
      domainId: "metal_machining",
      chainId: "chain_bauxite_aluminum_extrusion",
      minResearch: 35,
      capitalRequirement: 1800000,
      inputs: { alumina_billet: 2, polymer_resin: 1 },
      fallbackRawInputs: { metal_sheet: 2, polymer_resin: 1 },
      outputs: { aluminum_extrusion_profile: 3 },
      b2bSellPrice: 9600,
      chainPathTh: "แร่บ็อกไซต์ (T0) ➔ แท่งอะลูมินาบิลเล็ต (T1) ➔ โปรไฟล์อะลูมิเนียมอัดรีด (T2) ➔ รางโซลาร์รูฟท็อป & ถาดแบตเตอรี่ EV (T4)"
    },
    heat_sink: {
      id: "heat_sink",
      outputMaterialId: "heat_sink",
      nameTh: "กลึง CNC แผ่นโลหะ/แท่งอะลูมินาและท่อทองแดงเป็นครีบระบายความร้อนอะลูมิเนียม (T1 ➔ T2)",
      tier: 2,
      domainId: "metal_machining",
      minResearch: 40,
      capitalRequirement: 1800000,
      inputs: { metal_sheet: 1, copper_coil: 1 },
      fallbackRawInputs: { alumina_billet: 1, copper_coil: 1 },
      outputs: { heat_sink: 3 },
      b2bSellPrice: 5300,
      chainPathTh: "แร่บ็อกไซต์/โลหะ (T0) ➔ แท่งอะลูมินา/แผ่นโลหะ + ทองแดง (T1) ➔ ครีบระบายความร้อน (T2)"
    },
    optical_lens: {
      id: "optical_lens",
      outputMaterialId: "optical_lens",
      nameTh: "เจียระไนแก้วควอตซ์และเคลือบโพลีเมอร์เป็นเลนส์ออปติคัลความละเอียดสูง (T1 ➔ T2)",
      tier: 2,
      minResearch: 75,
      capitalRequirement: 2200000,
      inputs: { glass_bottle: 2, polymer_resin: 1 },
      outputs: { optical_lens: 2 },
      b2bSellPrice: 8500,
      chainPathTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แก้วบริสุทธิ์ (T1) ➔ เลนส์ออปติคัล (T2) ➔ กล้อง AI / เครื่องมือแพทย์ (T4)"
    },
    cathode_electrolyte: {
      id: "cathode_electrolyte",
      outputMaterialId: "cathode_electrolyte",
      nameTh: "สกัดแร่ลิเธียม นิกเกิลแมตต์ และทองแดงเป็นสารแคโทดและอิเล็กโทรไลต์แบตเตอรี่ (T0+T1 ➔ T2)",
      tier: 2,
      domainId: "power_electronics",
      minResearch: 85,
      capitalRequirement: 2500000,
      inputs: { lithium_brine_ore: 2, copper_coil: 1 },
      fallbackRawInputs: { nickel_cobalt_matte: 1, lithium_brine_ore: 1 },
      outputs: { cathode_electrolyte: 2 },
      b2bSellPrice: 8900,
      chainPathTh: "แร่ลิเธียม (T0) + นิกเกิลแมตต์/ทองแดง (T1) ➔ แคโทดและอิเล็กโทรไลต์ (T2) ➔ แบตเตอรี่ลิเธียม (T3)"
    },
    silicon_wafer: {
      id: "silicon_wafer",
      outputMaterialId: "silicon_wafer",
      nameTh: "หลอมผลึกเดี่ยว Czochralski และตัดแท่งซิลิคอน MG-Si เป็นแผ่นซิลิคอนเวเฟอร์ (T1 ➔ T2)",
      tier: 2,
      minResearch: 65,
      capitalRequirement: 2600000,
      inputs: { metallurgical_silicon: 2 },
      outputs: { silicon_wafer: 2 },
      b2bSellPrice: 10400,
      chainPathTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แท่งซิลิคอน MG-Si (T1) ➔ แผ่นซิลิคอนเวเฟอร์ (T2) ➔ ชิปนาโน (T3)"
    },

    // === TIER 3: Tech-Gated Sub-Assemblies & High-Tech Components ===
    driver: {
      id: "driver",
      outputMaterialId: "driver",
      nameTh: "พันขดลวดเสียงและประกอบแม่เหล็กเป็นดอกลำโพงความแม่นยำสูง (T1+T2 ➔ T3)",
      tier: 3,
      minResearch: 95,
      capitalRequirement: 2800000,
      inputs: { copper_coil: 1, casing: 1 },
      outputs: { driver: 2 },
      b2bSellPrice: 7900,
      chainPathTh: "แร่โลหะ (T0) ➔ ขดลวดทองแดง (T1) + ตัวถัง (T2) ➔ ดอกลำโพง (T3) ➔ ลำโพงบลูทูธ (T4)"
    },
    pcb: {
      id: "pcb",
      outputMaterialId: "pcb",
      nameTh: "กัดลายทองแดงบนแผ่นไฟเบอร์เรซินเป็นแผงวงจรพิมพ์หลายชั้น PCB (T1 ➔ T3)",
      tier: 3,
      minResearch: 105,
      capitalRequirement: 3000000,
      inputs: { copper_coil: 1, polymer_resin: 1 },
      outputs: { pcb: 2 },
      b2bSellPrice: 11800,
      chainPathTh: "แร่ทองแดง + น้ำยาง/เรซิน ➔ แผงวงจรพิมพ์ PCB (T3) ➔ ชิปและอิเล็กทรอนิกส์ทุกชนิด (T4)"
    },
    led: {
      id: "led",
      outputMaterialId: "led",
      nameTh: "ตัดแผ่นซิลิคอนเวเฟอร์และครอบเลนส์เป็นโมดูลแสง SMD LED (T2 ➔ T3)",
      tier: 3,
      minResearch: 135,
      capitalRequirement: 3400000,
      inputs: { silicon_wafer: 1, optical_lens: 1 },
      outputs: { led: 2 },
      b2bSellPrice: 9800,
      chainPathTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แท่งซิลิคอน (T1) ➔ เวเฟอร์ + เลนส์ (T2) ➔ โมดูลแสง LED (T3)"
    },
    sensor: {
      id: "sensor",
      outputMaterialId: "sensor",
      nameTh: "สร้างวงจร MEMS บนแผ่นเวเฟอร์พร้อมชุดสายไฟเป็นเซนเซอร์อัจฉริยะ (T2 ➔ T3)",
      tier: 3,
      minResearch: 150,
      capitalRequirement: 3600000,
      inputs: { silicon_wafer: 1, wire_harness: 1 },
      outputs: { sensor: 2 },
      b2bSellPrice: 8000,
      chainPathTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แท่งซิลิคอน (T1) ➔ เวเฟอร์ + สายไฟ (T2) ➔ เซนเซอร์ MEMS (T3)"
    },
    solar_cell: {
      id: "solar_cell",
      outputMaterialId: "solar_cell",
      nameTh: "เคลือบสารกึ่งตัวนำบนซิลิคอนเวเฟอร์และกระจกนิรภัยเป็นเซลล์แสงอาทิตย์ (T1+T2 ➔ T3)",
      tier: 3,
      minResearch: 180,
      capitalRequirement: 4000000,
      inputs: { silicon_wafer: 1, glass_bottle: 1, copper_coil: 1 },
      outputs: { solar_cell: 2 },
      b2bSellPrice: 11200,
      chainPathTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แท่งซิลิคอน (T1) ➔ เวเฟอร์ (T2) ➔ แผงโซลาร์เซลล์ (T3)"
    },
    battery: {
      id: "battery",
      outputMaterialId: "battery",
      nameTh: "ประกอบสารแคโทดลิเธียม ซองฟอยล์ และแผ่นโลหะเป็นโมดูลแบตเตอรี่ลิเธียม (T1+T2 ➔ T3)",
      tier: 3,
      minResearch: 210,
      capitalRequirement: 4500000,
      inputs: { cathode_electrolyte: 1, metal_sheet: 1, foil_pouch: 1 },
      outputs: { battery: 2 },
      b2bSellPrice: 12600,
      chainPathTh: "แร่ลิเธียม (T0) ➔ แคโทดอิเล็กโทรไลต์ (T2) ➔ โมดูลแบตเตอรี่ลิเธียม (T3) ➔ แพ็กแบต EV/โดรน (T4)"
    },
    microchip: {
      id: "microchip",
      outputMaterialId: "microchip",
      nameTh: "ฉายแสงลิโธกราฟีระดับนาโนบนแผ่นซิลิคอนเวเฟอร์และแผง PCB เป็นชิปไมโครโพรเซสเซอร์ (T2+T3 ➔ T3)",
      tier: 3,
      minResearch: 250,
      capitalRequirement: 5200000,
      inputs: { silicon_wafer: 1, pcb: 1 },
      outputs: { microchip: 2 },
      b2bSellPrice: 11600,
      chainPathTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แท่งซิลิคอน MG-Si (T1) ➔ ซิลิคอนเวเฟอร์ (T2) ➔ ชิปไมโครโพรเซสเซอร์ (T3)"
    },
    power_inverter_ic: {
      id: "power_inverter_ic",
      outputMaterialId: "power_inverter_ic",
      nameTh: "ประกอบเวเฟอร์ซิลิคอนคาร์ไบด์เข้ากับฮีตซิงก์และขดลวดเป็นชิปกำลังไฟฟ้า IGBT (T1+T2 ➔ T3)",
      tier: 3,
      minResearch: 290,
      capitalRequirement: 5800000,
      inputs: { silicon_wafer: 1, heat_sink: 1, copper_coil: 1 },
      outputs: { power_inverter_ic: 2 },
      b2bSellPrice: 12800,
      chainPathTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แท่งซิลิคอน (T1) ➔ เวเฟอร์ + ฮีตซิงก์ (T2) ➔ ชิป IGBT แรงดันสูง (T3)"
    }
  });

  // 12 Multi-Stage Production Chains (ห่วงโซ่การผลิตแบบลูกโซ่หลายระดับ: T0 ➔ T1 ➔ T2 ➔ T3 ➔ T4)
  const PRODUCTION_CHAINS = deepFreeze({
    chain_grain_flour_bakery: {
      id: "chain_grain_flour_bakery",
      nameTh: "ห่วงโซ่ข้าวและธัญพืช › โรงโม่แป้ง › ขนมปังโฮลเกรนและอาหารพร้อมทาน",
      shortNameTh: "ข้าวเปลือก (T0) ➔ แป้งโม่ละเอียด (T1) ➔ ขนมปัง (T4)",
      icon: "🍞",
      sector: "food",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "jasmine_rice_farm",
      upstreamAssetNameTh: "ไร่ข้าวหอมมะลิและธัญพืชอินทรีย์",
      inputs: { paddy_grain: 2 },
      outputs: { artisan_flour: 2 },
      batchesPerDayBase: 4,
      downstreamProducts: ["artisan_bakery", "ready_meal_box", "plant_based_meat", "pastry_croissant_box"],
      makeOrBuyNoteTh: "โม่แป้งเองจากข้าวเปลือก (ต้นทุน ฿36/ชุด) เพื่อใช้ผลิตขนมปังหรือขายแป้งส่ง B2B (฿55/ชิ้น) หรือซื้อแป้งสำเร็จรูปจากตลาด"
    },
    chain_palm_oil_refinery: {
      id: "chain_palm_oil_refinery",
      nameTh: "ห่วงโซ่สวนปาล์ม › โรงกลั่นน้ำมันบริสุทธิ์/เนยขาว › เบเกอรี่และน้ำมันโอเลอิน",
      shortNameTh: "ปาล์มดิบ (T0) ➔ น้ำมันบริสุทธิ์/เนยขาว (T1) ➔ เบเกอรี่/น้ำมันพืช (T4)",
      icon: "🌴",
      sector: "food",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "palm_oil_plantation",
      upstreamAssetNameTh: "สวนปาล์มน้ำมันสุราษฎร์ธานี",
      inputs: { crude_palm: 2 },
      outputs: { refined_palm_oil: 2 },
      batchesPerDayBase: 4,
      downstreamProducts: ["artisan_bakery", "premium_cooking_oil", "ready_meal_box", "plant_based_meat"],
      makeOrBuyNoteTh: "สกัดน้ำมันปาล์มบริสุทธิ์/เนยขาวเองจากผลปาล์มสด ใช้ทำเบเกอรี่หรือขายส่งโรงงานอาหาร B2B (฿59/ชิ้น)"
    },
    chain_flour_butter_dough: {
      autoRun: false,
      id: "chain_flour_butter_dough",
      nameTh: "ห่วงโซ่ขั้นที่ 2: แป้งโม่ละเอียด + เนยขาวปาล์ม › ห้องหมักโดว์ › โดว์ขนมปังและเนยเพสตรี้พร้อมอบ",
      shortNameTh: "แป้ง (T1) + เนยปาล์ม (T1) ➔ โดว์ขนมปัง/เพสตรี้ (T2) ➔ ครัวซองต์ส่งออก (T4)",
      icon: "🥐",
      sector: "food",
      tierStep: "T1 ➔ T2",
      minResearch: 25,
      upstreamAssetId: "jasmine_rice_farm",
      upstreamAssetNameTh: "ไร่ข้าวหอมมะลิ + สวนปาล์มน้ำมัน",
      inputs: { artisan_flour: 1, refined_palm_oil: 1 },
      outputs: { bakery_dough_butter: 2 },
      batchesPerDayBase: 3,
      downstreamProducts: ["pastry_croissant_box", "artisan_bakery"],
      makeOrBuyNoteTh: "แปรรูปขั้นที่ 2 ผสมแป้งและเนยเป็นโดว์แช่แข็งส่งขายเชนเบเกอรี่ B2B (฿74/ชิ้น) หรืออบเป็นครัวซองต์พรีเมียม"
    },
    chain_cane_sugar_ferment: {
      id: "chain_cane_sugar_ferment",
      nameTh: "ห่วงโซ่ไร่อ้อย › โรงหีบและเคี่ยวไซรัป › เบเกอรี่และเครื่องดื่มสุขภาพ",
      shortNameTh: "อ้อยสด (T0) ➔ น้ำตาล/ไซรัปบริสุทธิ์ (T1) ➔ เบเกอรี่/เครื่องดื่ม (T4)",
      icon: "🎋",
      sector: "food",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "sugarcane_estate",
      upstreamAssetNameTh: "ไร่อ้อยและโรงหีบน้ำตาลต้นน้ำ",
      inputs: { raw_cane: 2 },
      outputs: { refined_sugar_syrup: 2 },
      batchesPerDayBase: 4,
      downstreamProducts: ["artisan_bakery", "dairy_protein_shake", "pastry_croissant_box"],
      makeOrBuyNoteTh: "เคี่ยวน้ำตาลและไซรัปเองจากอ้อยสด ใช้ในโรงงานหรือขายส่ง B2B ให้บริษัทเครื่องดื่มภายนอก"
    },
    chain_dairy_probiotic_bio: {
      id: "chain_dairy_probiotic_bio",
      nameTh: "ห่วงโซ่ฟาร์มโคนม › ห้องหมักหัวเชื้อชีวภาพ › นมโปรตีนและโภชนเภสัชการแพทย์",
      shortNameTh: "น้ำนมดิบ/ถั่วเหลือง (T0) ➔ หัวเชื้อโพรไบโอติกส์ (T2) ➔ ซินไบโอติกส์ (T4)",
      icon: "🥛",
      sector: "biomed",
      tierStep: "T0 ➔ T2",
      minResearch: 0,
      upstreamAssetId: "smart_dairy_farm",
      upstreamAssetNameTh: "ฟาร์มโคนมและเกษตรโปรตีนอัจฉริยะ",
      inputs: { fresh_milk_soy: 2 },
      outputs: { probiotic_culture: 2 },
      batchesPerDayBase: 3,
      downstreamProducts: ["dairy_protein_shake", "probioticElixir", "synbiotic_medical_drink"],
      makeOrBuyNoteTh: "เพาะหัวเชื้อโพรไบโอติกส์จากน้ำนมดิบ ป้อนสายไบโอเมดหรือขายหัวเชื้อให้บริษัทยา B2B (฿66/ชิ้น)"
    },
    chain_herb_botanical_extract: {
      id: "chain_herb_botanical_extract",
      nameTh: "ห่วงโซ่สวนสมุนไพร › โรงสกัดสุญญากาศ › เครื่องดื่มสมุนไพรและโภชนเภสัช",
      shortNameTh: "สมุนไพรสด/อ้อย (T0) ➔ สารสกัดเข้มข้น (T1) ➔ เครื่องดื่มสุขภาพ (T4)",
      icon: "🌿",
      sector: "food",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "organic_herb_orchard",
      upstreamAssetNameTh: "สวนสมุนไพรออร์แกนิกเชียงใหม่",
      inputs: { raw_cane: 1, fresh_milk_soy: 1 },
      outputs: { raw_extract: 2 },
      batchesPerDayBase: 3,
      downstreamProducts: ["herbalDrink", "energyProtein", "functionalShot", "plant_based_meat", "synbiotic_medical_drink"],
      makeOrBuyNoteTh: "สกัดสารสำคัญจากสมุนไพรและธัญพืช ใช้ผลิตอาหารอนาคตหรือขายสารสกัดให้คู่ค้า B2B"
    },
    chain_latex_polymer_compound: {
      id: "chain_latex_polymer_compound",
      nameTh: "ห่วงโซ่สวนยางพารา › โรงสังเคราะห์คอมปาวด์ › ช่วงล่าง EV และเรซินวิศวกรรม",
      shortNameTh: "น้ำยางสด (T0) ➔ เม็ดโพลีเมอร์เรซิน (T1) ➔ ช่วงล่าง EV/โดรน (T4)",
      icon: "🛞",
      sector: "automotive",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "rubber_polymer_estate",
      upstreamAssetNameTh: "สวนยางพาราและโพลีเมอร์ระยอง",
      inputs: { natural_latex: 2 },
      outputs: { polymer_resin: 2 },
      batchesPerDayBase: 3,
      downstreamProducts: ["ev_suspension_kit", "visionCamera", "autonomous_cargo_drone"],
      makeOrBuyNoteTh: "สังเคราะห์เม็ดพลาสติกเรซินและยางวิศวกรรมเองจากสวนยางพารา หรือขายเม็ดเรซินให้โรงงานภายนอก"
    },
    chain_ore_smelting_metal: {
      id: "chain_ore_smelting_metal",
      nameTh: "ห่วงโซ่เหมืองแร่ › โรงถลุงเหล็กกล้า แผ่นโลหะ และขดลวดทองแดง › โครงสร้างยานยนต์และตู้สวิตช์เกียร์",
      shortNameTh: "แร่เหล็ก/ทองแดงดิบ (T0) ➔ เหล็กกล้าแผ่น + แผ่นโลหะ + ขดลวดทองแดง (T1)",
      icon: "🔩",
      sector: "automotive",
      tierStep: "T0 ➔ T1",
      minResearch: 15,
      upstreamAssetId: "silica_copper_mine",
      upstreamAssetNameTh: "สัมปทานเหมืองแร่ซิลิกาและทองแดง",
      inputs: { copper_iron_ore: 2 },
      outputs: { metal_sheet: 1, copper_coil: 1 },
      batchesPerDayBase: 3,
      downstreamProducts: ["evController", "servoActuator", "ev_suspension_kit", "industrial_switchgear_cabinet", "autonomous_cargo_drone"],
      makeOrBuyNoteTh: "ถลุงแร่ทองแดงและเหล็กดิบจากเหมืองเป็นแผ่นโลหะ เหล็กกล้าแผ่น และขดลวดทองแดง ลดการนำเข้าโลหะจากตลาด"
    },
    chain_bauxite_aluminum_extrusion: {
      id: "chain_bauxite_aluminum_extrusion",
      nameTh: "ห่วงโซ่แร่บ็อกไซต์ › โรงสกัดอะลูมินาบิลเล็ตและอัดรีดโปรไฟล์อะลูมิเนียม › รางโซลาร์และถาดแบตเตอรี่ EV",
      shortNameTh: "แร่บ็อกไซต์ (T0) ➔ อะลูมินาบิลเล็ต (T1) ➔ โปรไฟล์อะลูมิเนียมอัดรีด (T2)",
      icon: "🏗️",
      sector: "energy",
      tierStep: "T0 ➔ T1 ➔ T2",
      minResearch: 15,
      upstreamAssetId: "silica_copper_mine",
      upstreamAssetNameTh: "สัมปทานเหมืองแร่บ็อกไซต์และโลหะ",
      inputs: { bauxite_ore: 2, raw_water_m3: 1 },
      outputs: { alumina_billet: 2, mineral_slag_mud: 1 },
      batchesPerDayBase: 3,
      downstreamProducts: ["solar_mounting_rail_kit", "ev_battery_tray_assembly", "high_nickel_nmc_module"],
      makeOrBuyNoteTh: "สกัดแร่บ็อกไซต์เป็นแท่งอะลูมินาและอัดรีดเป็นโปรไฟล์อะลูมิเนียม (฿96/ชิ้น) ป้อนสายรางโซลาร์และถาดแบต EV โดยเกิดกากโคลนแดงที่สามารถส่งรีไซเคิลเป็นปุ๋ย/วัสดุรองพื้นได้"
    },
    chain_silica_mg_silicon: {
      autoRun: false,
      id: "chain_silica_mg_silicon",
      nameTh: "ห่วงโซ่เซมิคอนดักเตอร์ ขั้นที่ 1: ทรายควอตซ์ซิลิกา › เตาหลอมอาร์กไฟฟ้า › แท่งซิลิคอนบริสุทธิ์ MG-Si",
      shortNameTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แท่งซิลิคอนบริสุทธิ์ MG-Si (T1)",
      icon: "🪨",
      sector: "tech",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "silica_copper_mine",
      upstreamAssetNameTh: "สัมปทานเหมืองแร่ควอตซ์ซิลิกา",
      inputs: { silica_bauxite_ore: 2 },
      outputs: { metallurgical_silicon: 2, silicon_wafer: 2 },
      batchesPerDayBase: 3,
      downstreamProducts: ["ai_edge_module", "vital_signs_monitor", "autonomous_cargo_drone"],
      makeOrBuyNoteTh: "ถลุงทรายควอตซ์ซิลิกาเป็นแท่งซิลิคอนบริสุทธิ์ (T1) และดึงผลึกเวเฟอร์ (T2) ส่งขายโรงงานชิปหรือใช้ผลิตเอง"
    },
    chain_silica_wafer_semicon: {
      id: "chain_silica_wafer_semicon",
      nameTh: "ห่วงโซ่เหมืองซิลิกา › โรงถลุงแท่งซิลิคอน MG-Si และดึงผลึกซิลิคอนเวเฟอร์ › ชิป AI Edge & โซลาร์",
      shortNameTh: "ทรายควอตซ์ซิลิกา (T0) ➔ แท่งซิลิคอน (T1) ➔ ซิลิคอนเวเฟอร์ (T2)",
      icon: "💎",
      sector: "tech",
      tierStep: "T0 ➔ T1 ➔ T2",
      minResearch: 0,
      upstreamAssetId: "silica_copper_mine",
      upstreamAssetNameTh: "สัมปทานเหมืองแร่ซิลิกาและทองแดง",
      inputs: { silica_bauxite_ore: 2 },
      outputs: { metallurgical_silicon: 2, silicon_wafer: 2 },
      batchesPerDayBase: 3,
      downstreamProducts: ["ai_edge_module", "vital_signs_monitor", "autonomous_cargo_drone"],
      makeOrBuyNoteTh: "ดึงผลึกแท่งซิลิคอน MG-Si เป็นแผ่นซิลิคอนเวเฟอร์ขัดเงา (ขายส่ง B2B ได้ ฿104/แผ่น หรือนำไปผลิตชิป T3)"
    },
    chain_wafer_microchip_fab: {
      autoRun: false,
      id: "chain_wafer_microchip_fab",
      nameTh: "ห่วงโซ่เซมิคอนดักเตอร์ ขั้นที่ 3: แผ่นซิลิคอนเวเฟอร์ + PCB › ห้องคลีนรูมลิโธกราฟี › ชิปไมโครโพรเซสเซอร์ (ต้องมี R&D 250+)",
      shortNameTh: "ซิลิคอนเวเฟอร์ (T2) + PCB (T3) ➔ ชิปไมโครโพรเซสเซอร์ (T3) ➔ AI/โดรน (T4)",
      icon: "🧠",
      sector: "tech",
      tierStep: "T2 ➔ T3",
      minResearch: 250,
      upstreamAssetId: "silica_copper_mine",
      upstreamAssetNameTh: "เหมืองซิลิกา + แล็บวิจัยเซมิคอนดักเตอร์",
      inputs: { silicon_wafer: 1, pcb: 1 },
      outputs: { microchip: 2 },
      batchesPerDayBase: 2,
      downstreamProducts: ["iotController", "smartMeter", "visionCamera", "ai_edge_module", "vital_signs_monitor", "autonomous_cargo_drone"],
      makeOrBuyNoteTh: "ต้นเกมยังผลิตชิปเองไม่ได้ต้องซื้อจากเซินเจิ้น เมื่อสะสมแต้มวิจัย R&D ครบ 250 แต้มจึงผลิตชิปใช้เองและขายส่ง B2B ได้!"
    },
    chain_forestry_pulp_packaging: {
      id: "chain_forestry_pulp_packaging",
      nameTh: "ห่วงโซ่ป่าปลูกเศรษฐกิจ › โรงเยื่อกระดาษลูกฟูก › กล่องบรรจุภัณฑ์ป้อนทุกสายพาน",
      shortNameTh: "ไม้เศรษฐกิจ/เส้นใย (T0) ➔ กล่องบรรจุภัณฑ์ (T1) ➔ สินค้าส่งออกทุกชนิด (T4)",
      icon: "📦",
      sector: "general",
      tierStep: "T0 ➔ T1",
      minResearch: 0,
      upstreamAssetId: "forestry_pulp_mill",
      upstreamAssetNameTh: "ป่าปลูกไม้เศรษฐกิจและโรงเยื่อกระดาษ",
      inputs: { timber_bamboo_log: 2 },
      outputs: { pack_carton: 3 },
      batchesPerDayBase: 3,
      downstreamProducts: ["artisan_bakery", "herbalDrink", "ready_meal_box", "premium_cooking_oil", "pastry_croissant_box"],
      makeOrBuyNoteTh: "ผลิตกล่องลูกฟูกและบรรจุภัณฑ์เองจากป่าปลูกและเยื่อชานอ้อย หรือขายส่งกล่องให้โรงงานข้างเคียง"
    }
  });

  // 3 Plant-Wide Production Regimes (โหมดควบคุมจังหวะการเดินเครื่องของโรงงาน)
  const PRODUCTION_REGIMES = deepFreeze({
    craft_precision: {
      id: "craft_precision",
      nameTh: "โหมดประณีตไร้ของเสีย (Zero-Defect Craftsmanship)",
      speedMultiplier: 0.94,
      qaBonus: 0.07,
      wearMultiplier: 0.8,
      descTh: "เน้นความละเอียดทุกขั้นตอน ลดความเร็วสายพานลงเล็กน้อยแต่เพิ่มอัตราผ่าน QC สูงสุด"
    },
    lean_balanced: {
      id: "lean_balanced",
      nameTh: "โหมดสมดุลมาตรฐานลีน (Lean Manufacturing Balance)",
      speedMultiplier: 1.0,
      qaBonus: 0.02,
      wearMultiplier: 1.0,
      descTh: "เดินเครื่องตามจังหวะ Takt Time มาตรฐาน สมดุลทั้งความเร็ว คุณภาพ และอายุเครื่องจักร"
    },
    mass_throughput: {
      id: "mass_throughput",
      nameTh: "โหมดเร่งกำลังผลิตล็อตใหญ่ (High-Throughput Mass Production)",
      speedMultiplier: 1.14,
      qaBonus: -0.02,
      wearMultiplier: 1.25,
      descTh: "เร่งความเร็วสายพานเต็มพิกัดเพื่อส่งมอบออเดอร์เร่งด่วน เครื่องจักรสึกหรอเร็วขึ้น"
    }
  });

  // 12 Constructible Greenfield Industrial Estate Expansion Plots across the 56x34 Campus
  const EXPANSION_PLOTS = deepFreeze({
    rawDepot: {
      id: "rawDepot",
      nameTh: "คลังวัตถุดิบต้นน้ำและท่าตรวจรับ IQC",
      shortNameTh: "คลังวัตถุดิบ (Raw Depot)",
      subtitleTh: "ไซโลเก็บวัตถุดิบ • ท่าเทียบรถซัพพลายเออร์ • ตรวจรับ IQC",
      icon: "🏗️",
      category: "logistics",
      cost: 1800000,
      minDay: 4,
      minStaff: 6,
      footprint: { x: 17, y: 15, width: 4, height: 5 },
      doorCell: { x: 19, y: 20 },
      benefitTh: "เพิ่มสถานีจัดซื้อ/รับของความจุสูง เร่งความเร็วออกใบ PO และรับวัตถุดิบ +20%",
      stations: [
        { id: "admin_depot", kind: "admin", x: 18, y: 17, ax: 18, ay: 18, capacity: 12 },
        { id: "receiving_depot", kind: "receiving", x: 20, y: 18, ax: 20, ay: 19, capacity: 12 }
      ]
    },
    prodLineB: {
      id: "prodLineB",
      nameTh: "อาคารสายการผลิตที่ 2 (Smart Line B)",
      shortNameTh: "ไลน์ผลิต 2 (Line B)",
      subtitleTh: "สายพานประกอบอัจฉริยะ SMT • แท่นตรวจ QC ประจำไลน์ B",
      icon: "⚙️",
      category: "production",
      cost: 2400000,
      minDay: 5,
      minStaff: 9,
      footprint: { x: 34, y: 2, width: 5, height: 9 },
      doorCell: { x: 36, y: 11 },
      benefitTh: "เปิดสายการผลิตที่ 2 (Smart Line B) เพิ่มความจุช่างประกอบ +24 คน และ QC +10 คน เร่งความเร็วผลิต +15%",
      stations: [
        { id: "assembly_b1", kind: "assembly", x: 35, y: 4, ax: 35, ay: 5, capacity: 12 },
        { id: "assembly_b2", kind: "assembly", x: 37, y: 4, ax: 37, ay: 5, capacity: 12 },
        { id: "quality_b1", kind: "quality", x: 36, y: 8, ax: 36, ay: 9, capacity: 10 }
      ]
    },
    dispatchHub: {
      id: "dispatchHub",
      nameTh: "ศูนย์กระจายสินค้าและท่าปล่อยรถส่งออก",
      shortNameTh: "ศูนย์ส่งออก (Dispatch Hub)",
      subtitleTh: "สายพานแพ็กกิ้งอัตโนมัติ • ท่าปล่อยรถบรรทุกส่งออก B2B",
      icon: "🚛",
      category: "logistics",
      cost: 2000000,
      minDay: 6,
      minStaff: 10,
      footprint: { x: 33, y: 18, width: 6, height: 4 },
      doorCell: { x: 35, y: 22 },
      benefitTh: "เพิ่มสถานีแพ็กและท่าปล่อยรถความจุสูง เร่งความเร็วแพ็กและส่งออก +25% พร้อมเพิ่มฟลีทรถขนส่ง",
      stations: [
        { id: "packing_hub", kind: "packing", x: 34, y: 19, ax: 34, ay: 20, capacity: 18 },
        { id: "shipping_hub", kind: "shipping", x: 37, y: 19, ax: 37, ay: 20, capacity: 16 }
      ]
    },
    execAnnex: {
      id: "execAnnex",
      nameTh: "ศูนย์พาณิชย์และห้องเจรจาธุรกิจ B2B",
      shortNameTh: "ศูนย์การค้า B2B (Trade Center)",
      subtitleTh: "ห้องรับรองคู่ค้า • ทีมขายองค์กร • ฝ่ายการเงินและนักลงทุนสัมพันธ์",
      icon: "🏛️",
      category: "office",
      cost: 1600000,
      minDay: 5,
      minStaff: 8,
      footprint: { x: 10, y: 2, width: 3, height: 5 },
      doorCell: { x: 11, y: 7 },
      benefitTh: "เพิ่มสถานีฝ่ายขายและบัญชี B2B ความจุสูง เพิ่มอำนาจต่อรองราคาขายกับลูกค้า +6%",
      stations: [
        { id: "sales_annex", kind: "sales", x: 11, y: 4, ax: 11, ay: 5, capacity: 14 },
        { id: "admin_annex", kind: "admin", x: 12, y: 8, ax: 12, ay: 9, capacity: 14 }
      ]
    },
    maintWorkshop: {
      id: "maintWorkshop",
      nameTh: "โรงซ่อมบำรุงเครื่องกลและวิศวกรรม",
      shortNameTh: "โรงซ่อมบำรุง (Maintenance)",
      subtitleTh: "ศูนย์ซ่อมบำรุงเชิงป้องกัน • ห้องสอบเทียบเครื่องมือวัด",
      icon: "🛠️",
      category: "engineering",
      cost: 1500000,
      minDay: 6,
      minStaff: 8,
      footprint: { x: 17, y: 11, width: 4, height: 3 },
      doorCell: { x: 19, y: 14 },
      benefitTh: "ลดอัตราการสึกหรอของเครื่องจักรโรงงานลง 35% และเพิ่มสถานีวิศวกรรมซ่อมบำรุง",
      stations: [
        { id: "research_maint", kind: "research", x: 19, y: 12, ax: 19, ay: 13, capacity: 12 }
      ]
    },
    prodLineC: {
      id: "prodLineC",
      nameTh: "อาคารสายการผลิตอัตโนมัติที่ 3 (Mega Line C)",
      shortNameTh: "ไลน์ผลิต 3 (Mega Line C)",
      subtitleTh: "โรงงานระบบอัตโนมัติและ CNC ความจุสูง • รองรับพนักงาน 200-500 คน",
      icon: "🤖",
      category: "production",
      cost: 3500000,
      minDay: 8,
      minStaff: 16,
      footprint: { x: 17, y: 2, width: 4, height: 8 },
      doorCell: { x: 19, y: 10 },
      benefitTh: "เปิดสายการผลิตที่ 3 (Mega Line C) เพิ่มความจุช่างประกอบ +60 คน และ QC +25 คน เร่งความเร็วผลิต +20%",
      stations: [
        { id: "assembly_c1", kind: "assembly", x: 18, y: 4, ax: 18, ay: 5, capacity: 30 },
        { id: "assembly_c2", kind: "assembly", x: 20, y: 4, ax: 20, ay: 5, capacity: 30 },
        { id: "quality_c1", kind: "quality", x: 19, y: 8, ax: 19, ay: 9, capacity: 25 }
      ]
    },
    solarPlant: {
      id: "solarPlant",
      nameTh: "สถานีพลังงานแสงอาทิตย์และหม้อแปลงนิคม",
      shortNameTh: "โซลาร์ฟาร์ม (Solar Grid)",
      subtitleTh: "ผลิตไฟฟ้าสะอาดใช้ในนิคม • ลดค่าโสหุ้ยรายวัน • เพิ่มคะแนน ESG",
      icon: "☀️",
      category: "utility",
      cost: 2200000,
      minDay: 7,
      minStaff: 10,
      footprint: { x: 9, y: 8, width: 3, height: 3 },
      doorCell: { x: 10, y: 11 },
      benefitTh: "ลดภาระค่าเช่าและสาธารณูปโภครายวันลง 20% และเพิ่มโบนัสชื่อเสียงบริษัทสีเขียว",
      stations: []
    },
    dormitory: {
      id: "dormitory",
      nameTh: "หอพักพนักงานและลานจอดรถนิคม",
      shortNameTh: "หอพัก/ลานจอดรถ (Dorm & Park)",
      subtitleTh: "ที่พักสวัสดิการพนักงาน • ลานจอดรถมอเตอร์ไซค์และรถยนต์ส่วนตัว",
      icon: "🏘️",
      category: "welfare",
      cost: 1400000,
      minDay: 5,
      minStaff: 8,
      footprint: { x: 5, y: 17, width: 6, height: 5 },
      doorCell: { x: 8, y: 22 },
      benefitTh: "เพิ่มความจุจุดพักผ่อนและโรงอาหารรองรับพนักงานระดับร้อยคน พร้อมฟื้นฟูกำลังใจรายวัน",
      stations: [
        { id: "lounge_dorm", kind: "lounge", x: 7, y: 19, ax: 7, ay: 20, capacity: 45 },
        { id: "meal_dorm", kind: "meal", x: 9, y: 19, ax: 9, ay: 20, capacity: 45 }
      ]
    },
    prodLineD: {
      id: "prodLineD",
      nameTh: "อาคารสายการผลิตคลีนรูมและพลังงานที่ 4 (Cleanroom & HV Line D)",
      shortNameTh: "ไลน์ผลิต 4 (Clean & HV Line D)",
      subtitleTh: "สายพานคลีนรูมปลอดเชื้อ & ห้องประกอบเซลล์พลังงานแรงดันสูงบนที่ดินขยายใหม่",
      icon: "⚡",
      category: "production",
      cost: 4200000,
      minDay: 10,
      minStaff: 22,
      footprint: { x: 42, y: 2, width: 9, height: 9 },
      doorCell: { x: 46, y: 11 },
      benefitTh: "เปิดสายการผลิตที่ 4 บนที่ดินฝั่งตะวันออก เพิ่มความจุช่างประกอบ +70 คน และ QC +30 คน เร่งความเร็วผลิต +25%",
      stations: [
        { id: "assembly_d1", kind: "assembly", x: 44, y: 4, ax: 44, ay: 5, capacity: 35 },
        { id: "assembly_d2", kind: "assembly", x: 48, y: 4, ax: 48, ay: 5, capacity: 35 },
        { id: "quality_d1", kind: "quality", x: 46, y: 8, ax: 46, ay: 9, capacity: 30 }
      ]
    },
    qaLab: {
      id: "qaLab",
      nameTh: "ศูนย์ปฏิบัติการทดสอบมาตรฐานสากลและแล็บวิจัย (ISO/IEC QA & R&D Center)",
      shortNameTh: "ศูนย์แล็บ ISO/QA (QA & R&D Lab)",
      subtitleTh: "ห้องทดสอบความทนทาน • ห้องแล็บวิจัยขั้นสูง • รับรองมาตรฐานส่งออกโลก",
      icon: "🔬",
      category: "engineering",
      cost: 2800000,
      minDay: 9,
      minStaff: 14,
      footprint: { x: 42, y: 13, width: 8, height: 6 },
      doorCell: { x: 45, y: 19 },
      benefitTh: "เพิ่มโอกาสผ่าน QC +6% เพิ่มความเร็ววิจัย R&D +20% และเพิ่มสถานีตรวจคุณภาพ/วิจัยความจุสูง",
      stations: [
        { id: "quality_lab1", kind: "quality", x: 44, y: 15, ax: 44, ay: 16, capacity: 24 },
        { id: "research_lab1", kind: "research", x: 47, y: 15, ax: 47, ay: 16, capacity: 18 }
      ]
    },
    waterPlant: {
      id: "waterPlant",
      nameTh: "โรงบำบัดน้ำเสียและระบบสาธารณูปโภคหมุนเวียน (Eco Water & Utility Plant)",
      shortNameTh: "โรงบำบัดน้ำ/ยูทิลิตี้ (Eco Utility)",
      subtitleTh: "ระบบน้ำหมุนเวียนโรงงาน • บำบัดของเสียสีเขียว • รองรับสายคลีนรูมและเคมี",
      icon: "💧",
      category: "utility",
      cost: 2500000,
      minDay: 9,
      minStaff: 12,
      footprint: { x: 42, y: 22, width: 9, height: 7 },
      doorCell: { x: 46, y: 29 },
      benefitTh: "ลดค่าบำรุงรักษาและสาธารณูปโภคเพิ่มเติม ยกระดับชื่อเสียง ESG +3 และเพิ่มความเสถียรสายการผลิต",
      stations: []
    },
    expoHall: {
      id: "expoHall",
      nameTh: "ศูนย์แสดงสินค้าอุตสาหกรรมและสถาบันฝึกอบรม (Corporate Expo & Academy)",
      shortNameTh: "ศูนย์เอ็กซ์โป/สถาบัน (Expo & Academy)",
      subtitleTh: "ฮอลล์จัดแสดงผลิตภัณฑ์ B2B • หอประชุมวิชาการและพัฒนาผู้นำ 10 ระดับ",
      icon: "🌐",
      category: "office",
      cost: 3000000,
      minDay: 11,
      minStaff: 18,
      footprint: { x: 4, y: 25, width: 9, height: 6 },
      doorCell: { x: 8, y: 25 },
      benefitTh: "ดึงดูดดีล B2B มูลค่าสูงขึ้น +8% และเพิ่มความเร็วการเรียนรู้ในศูนย์ฝึกอบรม +25%",
      stations: [
        { id: "sales_expo", kind: "sales", x: 6, y: 27, ax: 6, ay: 28, capacity: 20 },
        { id: "training_expo", kind: "training", x: 10, y: 27, ax: 10, ay: 28, capacity: 28 }
      ]
    },
    refineryMill: {
      id: "refineryMill",
      nameTh: "โรงโม่แป้งและโรงกลั่นสกัดวัตถุดิบกลางน้ำ (Midstream Milling & Refinery Plant)",
      shortNameTh: "โรงโม่/โรงกลั่นกลางน้ำ (Refinery Mill)",
      subtitleTh: "โม่ข้าวเปลือกเป็นแป้ง • กลั่นปาล์มดิบเป็นน้ำมันบริสุทธิ์ • หลอมซิลิคอนเวเฟอร์",
      icon: "🌾",
      category: "production",
      cost: 2600000,
      minDay: 6,
      minStaff: 10,
      footprint: { x: 21, y: 24, width: 9, height: 6 },
      doorCell: { x: 25, y: 24 },
      benefitTh: "เพิ่มกำลังการแปรรูปวัตถุดิบกลางน้ำในห่วงโซ่ลูกโซ่ +100% ต่อวัน และเพิ่มสถานีรับของ/ประกอบแปรรูป",
      stations: [
        { id: "assembly_mill1", kind: "assembly", x: 23, y: 26, ax: 23, ay: 27, capacity: 24 },
        { id: "receiving_mill1", kind: "receiving", x: 27, y: 26, ax: 27, ay: 27, capacity: 18 }
      ]
    },
    bakeryPlant: {
      id: "bakeryPlant",
      nameTh: "โรงอบเบเกอรี่และแปรรูปอาหารครบวงจร (Automated Bakery & Food Plant)",
      shortNameTh: "โรงอบเบเกอรี่/อาหาร (Bakery Plant)",
      subtitleTh: "เตาอบอุโมงค์ต่อเนื่อง • สายพานขนมปังโฮลเกรน อาหารพร้อมทาน และแพ็กกิ้งอาหาร",
      icon: "🍞",
      category: "production",
      cost: 2900000,
      minDay: 7,
      minStaff: 12,
      footprint: { x: 31, y: 24, width: 9, height: 6 },
      doorCell: { x: 35, y: 24 },
      benefitTh: "เร่งความเร็วการผลิตสินค้ากลุ่มเบเกอรี่และอาหารแปรรูป +20% พร้อมเพิ่มสถานีประกอบและแพ็กกิ้งความจุสูง",
      stations: [
        { id: "assembly_bake1", kind: "assembly", x: 33, y: 26, ax: 33, ay: 27, capacity: 28 },
        { id: "packing_bake1", kind: "packing", x: 37, y: 26, ax: 37, ay: 27, capacity: 24 }
      ]
    }
  });

  // External World & Living Off-Site Corporate Ecosystem Blueprint (16 บริษัทภายนอกที่มีชีวิตชีวา เป็นทั้งคู่ค้า ซัพพลายเออร์ พันธมิตร และคู่แข่งกันเอง)
  const GLOBAL_NATIONS = deepFreeze({
    TH: {
      id: "TH",
      flag: "🇹🇭",
      nameTh: "ราชอาณาจักรไทย (ฐานที่ตั้งนิคมอุตสาหกรรม & ศูนย์กลางอาเซียน)",
      shortNameTh: "ไทย (Thailand)",
      bloc: "ASEAN",
      defaultRegimeId: "boi_coalition",
      regimes: [
        {
          id: "boi_coalition",
          nameTh: "รัฐบาลผสมส่งเสริมการลงทุนอุตสาหกรรมเป้าหมาย (BOI Smart Industrial Coalition)",
          leaderStyleTh: "สายส่งเสริมการลงทุนและส่งออก",
          tariffModPct: 0,
          fxModPct: 0,
          materialMods: { paddy_grain: 0.96, raw_cane: 0.96, natural_latex: 0.95 },
          sectorDemandMods: { electronics: 1.06, automotive: 1.06, food: 1.05 },
          summaryTh: "ลดภาษีนิติบุคคล สนับสนุนการตั้งโรงงานแปรรูปและส่งออกสินค้าอุตสาหกรรม",
        },
        {
          id: "green_populist",
          nameTh: "รัฐบาลเกษตรสีเขียวและยกระดับสวัสดิการแรงงาน (Green Agri & Welfare Government)",
          leaderStyleTh: "สายประชานิยมสีเขียวและพยุงราคาพืชผล",
          tariffModPct: 2,
          fxModPct: -2,
          materialMods: { paddy_grain: 1.18, raw_cane: 1.15, crude_palm: 1.16, wheat_grain: 1.12, organic_compost: 0.9 },
          sectorDemandMods: { food: 1.14, biomed: 1.12, energy: 1.1 },
          summaryTh: "ประกันราคาพืชผลเกษตรทำให้ราคาข้าวเปลือก อ้อย และปาล์มสูงขึ้น (+15~18%) พร้อมหนุนตลาดอาหารและสุขภาพ",
        },
        {
          id: "technocrat_infra",
          nameTh: "รัฐบาลเทคโนแครตเร่งระเบียงเศรษฐกิจพิเศษ EEC & ดิจิทัล (EEC Technocrat Administration)",
          leaderStyleTh: "สายเทคโนแครตและโครงสร้างพื้นฐานไฮเทค",
          tariffModPct: -3,
          fxModPct: 1,
          materialMods: { silicon_wafer: 0.94, pcb: 0.95, diesel_liter: 0.95 },
          sectorDemandMods: { electronics: 1.12, software: 1.15, fleet: 1.1 },
          summaryTh: "ลดต้นทุนโลจิสติกส์และภาษีนำเข้าชิ้นส่วนอิเล็กทรอนิกส์ พร้อมเร่งดีมานด์ซอฟต์แวร์และระบบอัตโนมัติ",
        },
      ],
    },
    US: {
      id: "US",
      flag: "🇺🇸",
      nameTh: "สหรัฐอเมริกา (มหาอำนาจเทคโนโลยี AI ตลาดทุน และการบริโภค)",
      shortNameTh: "สหรัฐฯ (USA)",
      bloc: "WESTERN_ALLIANCE",
      defaultRegimeId: "free_trade_tech",
      regimes: [
        {
          id: "free_trade_tech",
          nameTh: "รัฐบาลเสรีการค้าและพันธมิตรซัพพลายเชนเทคโนโลยี (Global Tech & Free Trade Admin)",
          leaderStyleTh: "สายโลกาภิวัตน์และนวัตกรรมเปิด",
          tariffModPct: 0,
          fxModPct: 0,
          materialMods: { microchip: 1.0, silicon_wafer: 1.0, optical_lens: 1.0 },
          sectorDemandMods: { electronics: 1.08, software: 1.1, biomed: 1.06 },
          summaryTh: "ส่งเสริมการค้าข้ามชาติและการสั่งซื้ออุปกรณ์สมาร์ตเทคและซอฟต์แวร์จากภูมิภาคอาเซียน",
        },
        {
          id: "america_first_tariff",
          nameTh: "รัฐบาลอเมริกาต้องมาก่อนและกำแพงภาษีนำเข้า (America-First Protectionist Admin)",
          leaderStyleTh: "สายชาตินิยมทางเศรษฐกิจและตั้งกำแพงภาษี",
          tariffModPct: 14,
          fxModPct: 8,
          materialMods: { microchip: 1.28, silicon_wafer: 1.22, power_inverter_ic: 1.24, sensor: 1.18 },
          sectorDemandMods: { electronics: 0.94, automotive: 0.95, food: 1.06 },
          summaryTh: "ตั้งกำแพงภาษีนำเข้าและจำกัดการส่งออกชิปขั้นสูง ทำให้ราคาชิปไมโครโพรเซสเซอร์และเวเฟอร์ในตลาดโลกพุ่งขึ้น +22~28%",
        },
        {
          id: "green_new_deal",
          nameTh: "รัฐบาลอัดฉีดพลังงานสะอาดและยานยนต์ไฟฟ้า (Clean Energy Supercycle Admin)",
          leaderStyleTh: "สายอัดฉีดงบพลังงานสีเขียวและลดคาร์บอน",
          tariffModPct: -2,
          fxModPct: -3,
          materialMods: { solar_cell: 1.18, battery: 1.2, copper_coil: 1.14 },
          sectorDemandMods: { energy: 1.25, automotive: 1.2, electronics: 1.08 },
          summaryTh: "ทุ่มงบอุดหนุนโซลาร์เซลล์ ตู้กักเก็บพลังงาน และยานยนต์ไฟฟ้า ดันดีมานด์และราคาขายหมวดพลังงานสะอาดพุ่ง +20~25%",
        },
      ],
    },
    CN: {
      id: "CN",
      flag: "🇨🇳",
      nameTh: "สาธารณรัฐประชาชนจีน (มหาอำนาจแร่หายาก แบตเตอรี่ และโรงงานโลก)",
      shortNameTh: "จีน (China)",
      bloc: "BRICS_EURASIA",
      defaultRegimeId: "belt_and_road_expansion",
      regimes: [
        {
          id: "belt_and_road_expansion",
          nameTh: "คณะกรรมการยุทธศาสตร์เส้นทางสายไหมและส่งออกชิ้นส่วน (Belt & Road Industrial Drive)",
          leaderStyleTh: "สายขยายเครือข่ายโลจิสติกส์และซัพพลายเชน",
          tariffModPct: -2,
          fxModPct: 0,
          materialMods: { pcb: 0.94, casing: 0.94, metal_sheet: 0.95, glass_bottle: 0.95 },
          sectorDemandMods: { fleet: 1.1, food: 1.08, electronics: 1.05 },
          summaryTh: "ส่งออกชิ้นส่วนพื้นฐานในราคาประหยัดและรับซื้อสินค้าเกษตรแปรรูปจากไทยเพิ่มขึ้น",
        },
        {
          id: "strategic_resource_control",
          nameTh: "คณะกรรมการควบคุมโควตาส่งออกแร่หายาก ลิเธียม และซิลิคอน (Strategic Mineral Export Control)",
          leaderStyleTh: "สายความมั่นคงทางทรัพยากรและเทคโนโลยี",
          tariffModPct: 10,
          fxModPct: 4,
          materialMods: {
            lithium_brine_ore: 1.38,
            cathode_electrolyte: 1.35,
            metallurgical_silicon: 1.32,
            silicon_wafer: 1.26,
            battery: 1.28,
            solar_cell: 1.24,
          },
          sectorDemandMods: { energy: 1.12, automotive: 1.1 },
          summaryTh: "จำกัดโควตาส่งออกแร่ลิเธียม แคโทด และแท่งซิลิคอนบริสุทธิ์ ทำให้ราคาวัตถุดิบแบตเตอรี่และโซลาร์ในตลาดโลกพุ่ง +26~38%!",
        },
        {
          id: "domestic_consumption_drive",
          nameTh: "คณะกรรมการกระตุ้นการบริโภคภายในและนำเข้าอาหารพรีเมียม (Domestic Prosperity Stimulus)",
          leaderStyleTh: "สายกระตุ้นกำลังซื้อและนำเข้าอาหารสุขภาพ",
          tariffModPct: -4,
          fxModPct: 2,
          materialMods: { milled_rice: 1.15, refined_sugar_syrup: 1.14, fresh_milk_soy: 1.12 },
          sectorDemandMods: { food: 1.22, biomed: 1.16 },
          summaryTh: "เปิดตลาดนำเข้าอาหารเบเกอรี่ เครื่องดื่มสมุนไพร โยเกิร์ต และโภชนเภสัชจากอาเซียนในราคาพรีเมียม (+16~22%)",
        },
      ],
    },
    JP: {
      id: "JP",
      flag: "🇯🇵",
      nameTh: "ญี่ปุ่น (พันธมิตรยานยนต์ หุ่นยนต์ความแม่นยำสูง และออปติคัล)",
      shortNameTh: "ญี่ปุ่น (Japan)",
      bloc: "WESTERN_ALLIANCE",
      defaultRegimeId: "asean_monozukuri_pact",
      regimes: [
        {
          id: "asean_monozukuri_pact",
          nameTh: "รัฐบาลพันธมิตรฐานการผลิตยานยนต์และหุ่นยนต์อาเซียน (ASEAN-Japan Monozukuri Pact)",
          leaderStyleTh: "สายพันธมิตรอุตสาหกรรมระยะยาว",
          tariffModPct: -3,
          fxModPct: 0,
          materialMods: { optical_lens: 0.96, wire_harness: 0.96 },
          sectorDemandMods: { automotive: 1.14, electronics: 1.1 },
          summaryTh: "ร่วมทุนและสั่งซื้อชิ้นส่วนยานยนต์ EV หุ่นยนต์คลังสินค้า AGV และแขนกลเซอร์โวจากโรงงานไทยอย่างต่อเนื่อง",
        },
        {
          id: "semi_revival_act",
          nameTh: "รัฐบาลยุทธศาสตร์ฟื้นฟูเซมิคอนดักเตอร์และโรโบติกส์แห่งชาติ (Silicon & Robotics Revival Act)",
          leaderStyleTh: "สายลงทุนเทคโนโลยีขั้นสูง",
          tariffModPct: 0,
          fxModPct: 3,
          materialMods: { optical_lens: 1.16, sensor: 1.15, silicon_wafer: 1.12 },
          sectorDemandMods: { electronics: 1.18, automotive: 1.16, service: 1.12 },
          summaryTh: "เร่งกว้านซื้อเซนเซอร์ เลนส์ออปติคัล และบริการสอบเทียบ ISO มาตรฐานสูง ดันราคาขายกลุ่มสมองกลและหุ่นยนต์สูงขึ้น",
        },
      ],
    },
    EU: {
      id: "EU",
      flag: "🇪🇺",
      nameTh: "สหภาพยุโรป (ผู้นำมาตรฐานสิ่งแวดล้อม CBAM และเวชภัณฑ์คลีนรูม)",
      shortNameTh: "สหภาพยุโรป (EU)",
      bloc: "WESTERN_ALLIANCE",
      defaultRegimeId: "strict_cbam_esg",
      regimes: [
        {
          id: "strict_cbam_esg",
          nameTh: "คณะกรรมาธิการบังคับใช้ภาษีคาร์บอนข้ามพรมแดน (Strict CBAM & Green ESG Mandate)",
          leaderStyleTh: "สายควบคุมคาร์บอนและมาตรฐานสิ่งแวดล้อม",
          tariffModPct: 6,
          fxModPct: 2,
          materialMods: { iron_ore: 1.18, copper_iron_ore: 1.16, bauxite_ore: 1.15, organic_compost: 0.92 },
          sectorDemandMods: { energy: 1.18, biomed: 1.12, service: 1.15 },
          summaryTh: "เก็บค่าธรรมเนียมคาร์บอนกับแร่โลหะและปิโตรเคมี (+15~18%) แต่ให้โบนัสราคาซื้อแก่โรงงานที่มีโซลาร์ฟาร์มและบริการรีไซเคิล",
        },
        {
          id: "energy_medical_security",
          nameTh: "คณะกรรมาธิการความมั่นคงทางพลังงานและเวชภัณฑ์ยุโรป (EU Energy & Clinical Security Pact)",
          leaderStyleTh: "สายสำรองพลังงานและเวชภัณฑ์",
          tariffModPct: -2,
          fxModPct: 4,
          materialMods: { pharma_saline_water: 1.16, foil_pouch: 1.12, cathode_electrolyte: 1.15 },
          sectorDemandMods: { biomed: 1.24, energy: 1.22 },
          summaryTh: "เร่งนำเข้าชุดทำแผลปลอดเชื้อ น้ำเกลือการแพทย์ เครื่องวัดสัญญาณชีพ และตู้กักเก็บพลังงานสำรอง (+22~24%)",
        },
      ],
    },
    ME: {
      id: "ME",
      flag: "🇸🇦",
      nameTh: "กลุ่มประเทศตะวันออกกลางและโอเปก (ศูนย์กลางพลังงานและเส้นทางเดินเรือทะเลแดง)",
      shortNameTh: "ตะวันออกกลาง (OPEC+)",
      bloc: "ENERGY_CORRIDOR",
      defaultRegimeId: "opec_balanced_output",
      regimes: [
        {
          id: "opec_balanced_output",
          nameTh: "มติโอเปกรักษาเสถียรภาพกำลังการผลิตน้ำมันดิบโลก (OPEC+ Balanced Production)",
          leaderStyleTh: "สายรักษาสมดุลราคาพลังงาน",
          tariffModPct: 0,
          fxModPct: 0,
          materialMods: { crude_petro_feedstock: 1.0, diesel_liter: 1.0, polymer_resin: 1.0 },
          sectorDemandMods: { fleet: 1.04, food: 1.05 },
          summaryTh: "ราคาน้ำมันดิบและดีเซลขนส่งอยู่ในเกณฑ์มีเสถียรภาพ เอื้อต่อการเดินรถขนส่ง B2B",
        },
        {
          id: "opec_supply_cut",
          nameTh: "มติโอเปกลดกำลังการผลิตน้ำมันดิบเชิงยุทธศาสตร์ (OPEC+ Deep Supply Cut)",
          leaderStyleTh: "สายจำกัดอุปทานยกระดับราคาน้ำมัน",
          tariffModPct: 4,
          fxModPct: 5,
          materialMods: { crude_petro_feedstock: 1.36, diesel_liter: 1.32, polymer_resin: 1.25, truck_tire: 1.15 },
          sectorDemandMods: { energy: 1.2, fleet: 1.12 },
          summaryTh: "ราคาน้ำมันดิบ ดีเซลหมุนเร็ว และเม็ดพลาสติกพุ่งขึ้น +25~36% ส่งผลให้ต้นทุนเชื้อเพลิงขนส่งและมูลค่าโซลาร์เซลล์สูงขึ้น",
        },
      ],
    },
    RU_EE: {
      id: "RU_EE",
      flag: "🇺🇦",
      nameTh: "ภูมิภาคยูเรเซียและทะเลดำ (แหล่งส่งออกข้าวสาลีและแร่แม่ปุ๋ยโลก)",
      shortNameTh: "ยูเรเซีย/ทะเลดำ",
      bloc: "BRICS_EURASIA",
      defaultRegimeId: "grain_fertilizer_corridor",
      regimes: [
        {
          id: "grain_fertilizer_corridor",
          nameTh: "ข้อตกลงเปิดระเบียงเดินเรือส่งออกธัญพืชและแม่ปุ๋ยโลก (Black Sea Grain & Fertilizer Corridor)",
          leaderStyleTh: "สายเปิดเส้นทางส่งออกสินค้าเกษตร",
          tariffModPct: 0,
          fxModPct: 0,
          materialMods: { wheat_grain: 1.0, wheat_flour: 1.0, phosphate_potash_rock: 1.0, npk_fertilizer: 1.0 },
          sectorDemandMods: { food: 1.04 },
          summaryTh: "อุปทานข้าวสาลีและแร่ฟอสเฟต/โพแทชในตลาดโลกไหลเวียนตามปกติ",
        },
        {
          id: "sanctions_export_ban",
          nameTh: "มาตรการคว่ำบาตรและระงับส่งออกแร่แม่ปุ๋ย-ข้าวสาลี (Fertilizer & Grain Export Embargo)",
          leaderStyleTh: "สายปิดกั้นการส่งออกทรัพยากรเกษตร",
          tariffModPct: 8,
          fxModPct: 4,
          materialMods: {
            phosphate_potash_rock: 1.4,
            nitrogen_ammonia: 1.32,
            npk_fertilizer: 1.36,
            wheat_grain: 1.34,
            wheat_flour: 1.3,
          },
          sectorDemandMods: { food: 1.18 },
          summaryTh: "ราคาหินฟอสเฟต/โพแทช ปุ๋ย N-P-K และข้าวสาลีโลกพุ่งขึ้น +30~40% ทำให้ไร่ข้าวไทยและโรงงานปุ๋ยในประเทศมีมูลค่าสูงขึ้นมาก!",
        },
      ],
    },
    ASEAN: {
      id: "ASEAN",
      flag: "🌏",
      nameTh: "ประชาคมเศรษฐกิจอาเซียนและลุ่มน้ำโขง (CLMVT Supply Chain Ring)",
      shortNameTh: "อาเซียน (ASEAN)",
      bloc: "ASEAN",
      defaultRegimeId: "asean_single_window",
      regimes: [
        {
          id: "asean_single_window",
          nameTh: "ข้อตกลงศุลกากรอิเล็กทรอนิกส์และการค้าเสรีอาเซียน (ASEAN Single Window & ATIGA)",
          leaderStyleTh: "สายบูรณาการซัพพลายเชนภูมิภาค",
          tariffModPct: -5,
          fxModPct: 0,
          materialMods: { timber_bamboo_log: 0.95, pack_carton: 0.95, natural_latex: 0.96 },
          sectorDemandMods: { fleet: 1.15, food: 1.1, electronics: 1.08, service: 1.1 },
          summaryTh: "ลดเวลาขนส่งข้ามพรมแดนและภาษีศุลกากรเป็น 0% กระตุ้นงานกองรถขนส่ง B2B และการค้าส่งวัตถุดิบในภูมิภาค",
        },
        {
          id: "border_quota_control",
          nameTh: "มาตรการควบคุมโควตาสินค้าเกษตรและด่านชายแดนเข้มงวด (Regional Border & Quota Tightening)",
          leaderStyleTh: "สายปกป้องเกษตรกรและอุตสาหกรรมในประเทศ",
          tariffModPct: 7,
          fxModPct: 2,
          materialMods: { paddy_grain: 1.16, soybean_crop: 1.15, timber_bamboo_log: 1.14 },
          sectorDemandMods: { food: 1.08, fleet: 0.96 },
          summaryTh: "เข้มงวดการนำเข้าพืชผลเกษตรหน้าด่าน ทำให้ราคาวัตถุดิบเกษตรในประเทศสูงขึ้นและเพิ่มความสำคัญของการมีไร่นาของตนเอง",
        },
      ],
    },
    ID: {
      id: "ID",
      flag: "🇮🇩",
      nameTh: "สาธารณรัฐอินโดนีเซีย (มหาอำนาจแร่นิกเกิล บ็อกไซต์ และปาล์มน้ำมันหมู่เกาะ)",
      shortNameTh: "อินโดนีเซีย (Indonesia)",
      bloc: "ASEAN",
      defaultRegimeId: "downstream_mineral_mandate",
      regimes: [
        {
          id: "downstream_mineral_mandate",
          nameTh: "รัฐบาลยุทธศาสตร์แปรรูปแร่ในประเทศและจำกัดส่งออกแร่ดิบ (Hilirisasi Mineral Mandate)",
          leaderStyleTh: "สายชาตินิยมทรัพยากรและบังคับตั้งโรงถลุง",
          tariffModPct: 8,
          fxModPct: 2,
          materialMods: { bauxite_ore: 1.32, nickel_cobalt_matte: 1.28, alumina_billet: 1.22, crude_palm: 0.94 },
          sectorDemandMods: { automotive: 1.14, energy: 1.16, service: 1.12 },
          summaryTh: "จำกัดการส่งออกแร่บ็อกไซต์และนิกเกิลดิบเพื่อดึงดูดห่วงโซ่แบตเตอรี่ EV ทำให้ราคาแร่บ็อกไซต์และนิกเกิลแมตต์ในตลาดโลกปรับตัวสูงขึ้น (+22~32%)"
        },
        {
          id: "archipelago_maritime_open",
          nameTh: "รัฐบาลเปิดเสรีการค้าทางทะเลและพันธมิตรพลังงานอาเซียน (Archipelago Maritime Free Trade)",
          leaderStyleTh: "สายเสรีการค้าหมู่เกาะและส่งออกวัตถุดิบ",
          tariffModPct: -3,
          fxModPct: -1,
          materialMods: { bauxite_ore: 0.92, nickel_cobalt_matte: 0.94, crude_palm: 0.92, refined_palm_oil: 0.95 },
          sectorDemandMods: { food: 1.12, fleet: 1.14, energy: 1.1 },
          summaryTh: "ผ่อนคลายโควตาส่งออกแร่บ็อกไซต์ นิกเกิล และน้ำมันปาล์มดิบสู่โรงงานในไทย พร้อมเพิ่มคำสั่งซื้ออุปกรณ์โซลาร์และอาหารแปรรูป"
        }
      ]
    },
    AU: {
      id: "AU",
      flag: "🇦🇺",
      nameTh: "เครือรัฐออสเตรเลีย (ผู้ส่งออกแร่เหล็กพิลบารา ลิเธียมสปอดูมีน และถ่านโค้กโลหะวิทยา)",
      shortNameTh: "ออสเตรเลีย (Australia)",
      bloc: "WESTERN_ALLIANCE",
      defaultRegimeId: "pilbara_mining_boom",
      regimes: [
        {
          id: "pilbara_mining_boom",
          nameTh: "รัฐบาลส่งเสริมการส่งออกเหมืองแร่พิลบาราและพันธมิตรแปซิฟิก (Pilbara Resource Export Pact)",
          leaderStyleTh: "สายเปิดเสรีเหมืองแร่และส่งออกทรัพยากร",
          tariffModPct: -3,
          fxModPct: 0,
          materialMods: { iron_ore: 0.93, lithium_brine_ore: 0.94, bauxite_ore: 0.95, coke_reducing_flux: 0.94 },
          sectorDemandMods: { automotive: 1.08, energy: 1.12, fleet: 1.08 },
          summaryTh: "เดินเครื่องท่าเรือส่งออกแร่เหล็กพิลบารา แร่ลิเธียม และถ่านโค้กโลหะวิทยาเต็มกำลัง ช่วยลดต้นทุนโรงถลุงเหล็กและอะลูมิเนียมในเอเชีย"
        },
        {
          id: "carbon_royalty_levy",
          nameTh: "รัฐบาลจัดเก็บค่าภาคหลวงคาร์บอนเหมืองแร่และฟื้นฟูสิ่งแวดล้อม (Mining Royalty & Climate Levy)",
          leaderStyleTh: "สายควบคุมคาร์บอนต้นน้ำและขึ้นค่าภาคหลวงแร่",
          tariffModPct: 5,
          fxModPct: 3,
          materialMods: { iron_ore: 1.28, coke_reducing_flux: 1.3, lithium_brine_ore: 1.22, structural_steel_plate: 1.18 },
          sectorDemandMods: { energy: 1.22, service: 1.16 },
          summaryTh: "เก็บค่าภาคหลวงคาร์บอนจากเหมืองแร่เหล็กและถ่านโค้ก ทำให้ราคาแร่เหล็กและโค้กฟลักซ์ตลาดโลกพุ่งขึ้น (+22~30%) แต่เร่งดีมานด์อุปกรณ์โซลาร์และตู้แบตเตอรี่"
        }
      ]
    },
    IN: {
      id: "IN",
      flag: "🇮🇳",
      nameTh: "สาธารณรัฐอินเดีย (ตลาดโครงสร้างพื้นฐานพลังงาน ชีวเภสัชกรรม และวิศวกรรมซอฟต์แวร์)",
      shortNameTh: "อินเดีย (India)",
      bloc: "BRICS_EURASIA",
      defaultRegimeId: "make_in_india_infra",
      regimes: [
        {
          id: "make_in_india_infra",
          nameTh: "รัฐบาลเร่งอภิมหาโครงการสมาร์ตกริดและโครงสร้างพื้นฐานแห่งชาติ (National Grid & Infra Push)",
          leaderStyleTh: "สายลงทุนเมกะโปรเจกต์ไฟฟ้าและอุตสาหกรรม",
          tariffModPct: 2,
          fxModPct: 1,
          materialMods: { structural_steel_plate: 1.16, copper_coil: 1.14, aluminum_extrusion_profile: 1.15 },
          sectorDemandMods: { energy: 1.24, electronics: 1.16, service: 1.18 },
          summaryTh: "ทุ่มงบขยายสายส่งไฟฟ้าและโซลาร์ฟาร์มทั่วประเทศ ดันความต้องการตู้สวิตช์เกียร์ รางโซลาร์ อินเวอร์เตอร์ และบริการ EPC พุ่งสูง (+18~24%)"
        },
        {
          id: "pharma_digital_corridor",
          nameTh: "รัฐบาลพันธมิตรชีวเภสัชกรรมและซอฟต์แวร์อินโด-แปซิฟิก (Bio-Pharma & IT Corridor)",
          leaderStyleTh: "สายส่งออกเวชภัณฑ์และเทคโนโลยีสารสนเทศ",
          tariffModPct: -4,
          fxModPct: -1,
          materialMods: { pharma_saline_water: 0.94, raw_extract: 0.95, wheat_grain: 0.95 },
          sectorDemandMods: { biomed: 1.22, software: 1.24, food: 1.12 },
          summaryTh: "เชื่อมระเบียงการค้าเวชภัณฑ์ปลอดเชื้อและซอฟต์แวร์องค์กรกับไทย กระตุ้นยอดสั่งซื้อเครื่องมือแพทย์และโครงการพัฒนาซอฟต์แวร์ B2B"
        }
      ]
    },
    SG: {
      id: "SG",
      flag: "🇸🇬",
      nameTh: "สาธารณรัฐสิงคโปร์ (ศูนย์กลางการเงิน ท่าเรือถ่ายลำสินค้า คลังห้องเย็น 3PL และคลาวด์อาเซียน)",
      shortNameTh: "สิงคโปร์ (Singapore)",
      bloc: "ASEAN",
      defaultRegimeId: "global_maritime_fin_hub",
      regimes: [
        {
          id: "global_maritime_fin_hub",
          nameTh: "รัฐบาลศูนย์กลางท่าเรืออัจฉริยะและการค้าเสรีการเงินโลก (Smart Maritime & FinTech Hub)",
          leaderStyleTh: "สายการค้าเสรี โลจิสติกส์ความเร็วสูง และคลาวด์",
          tariffModPct: -6,
          fxModPct: -2,
          materialMods: { pack_carton: 0.96, foil_pouch: 0.96 },
          sectorDemandMods: { fleet: 1.22, software: 1.2, food: 1.16, biomed: 1.15 },
          summaryTh: "ลดต้นทุนธุรกรรมและเปิดช่องทางด่วนเรือฟีดเดอร์แหลมฉบัง–สิงคโปร์ กระตุ้นดีมานด์คลังห้องเย็น 3PL ซอฟต์แวร์ SaaS และอาหารพรีเมียม"
        },
        {
          id: "green_straits_regulation",
          nameTh: "รัฐบาลมาตรฐานเดินเรือสีเขียวและคาร์บอนต่ำแห่งช่องแคบมะละกา (Green Straits & ESG Finance)",
          leaderStyleTh: "สายการเงินสีเขียวและมาตรฐานความยั่งยืนเข้มงวด",
          tariffModPct: -2,
          fxModPct: 2,
          materialMods: { diesel_liter: 1.14, aluminum_extrusion_profile: 1.12, solar_cell: 1.14 },
          sectorDemandMods: { energy: 1.2, service: 1.22, biomed: 1.18 },
          summaryTh: "ให้สินเชื่อดอกเบี้ยต่ำและโบนัสราคาแก่ซัพพลายเออร์ที่มีการบำบัดกากอุตสาหกรรม รีไซเคิล และรับเหมาติดตั้งโซลาร์ EPC"
        }
      ]
    }
  });

  const GEOPOLITICAL_EVENTS = deepFreeze({
    red_sea_blockade_war: {
      id: "red_sea_blockade_war",
      category: "war_conflict",
      badgeTh: "⚔️ สงครามและการปิดล้อมทางทะเล",
      titleTh: "สงครามความมั่นคงและการปิดล้อมเส้นทางเดินเรือทะเลแดง–คลองสุเอซ",
      regionTh: "ตะวันออกกลาง / เส้นทางเดินเรือเอเชีย-ยุโรป",
      durationDays: 5,
      oilMultiplier: 1.35,
      freightRateMultiplier: 1.24,
      leadTimeMultiplier: 1.25,
      fxDeltaBaht: 1.4,
      materialMods: {
        crude_petro_feedstock: 1.38,
        diesel_liter: 1.34,
        polymer_resin: 1.26,
        foil_pouch: 1.16,
      },
      sectorDemandMods: { energy: 1.22, fleet: 1.18, food: 1.12 },
      stockMods: { GREEN: 4.2, AUTO: -2.1, TECH: -1.4 },
      chronicleTh: "เกิดการปะทะทางทหารและปิดล้อมเส้นทางเดินเรือขนส่งน้ำมันในทะเลแดง เรือสินค้าต้องอ้อมแหลมกู๊ดโฮป ส่งผลให้ราคาน้ำมันดิบ ดีเซล และค่าระวางขนส่งโลกพุ่งสูงขึ้นทันที!",
      strategicAdviceTh: "ต้นทุนดีเซลและเม็ดพลาสติกสูงขึ้น ควรใช้โซลาร์ฟาร์ม/ผลิตไบโอดีเซลเอง หรือรับงานขนส่ง B2B ที่ปรับขึ้นค่าระวางตามตลาด",
    },
    black_sea_grain_fertilizer_war: {
      id: "black_sea_grain_fertilizer_war",
      category: "war_conflict",
      badgeTh: "⚔️ สงครามภูมิภาค & วิกฤตอาหารโลก",
      titleTh: "สงครามปิดล้อมท่าเรือทะเลดำ ระงับการส่งออกข้าวสาลีและแร่แม่ปุ๋ยโลก",
      regionTh: "ยุโรปตะวันออก / ทะเลดำ",
      durationDays: 5,
      oilMultiplier: 1.15,
      freightRateMultiplier: 1.12,
      leadTimeMultiplier: 1.15,
      fxDeltaBaht: 0.9,
      materialMods: {
        wheat_grain: 1.42,
        wheat_flour: 1.36,
        phosphate_potash_rock: 1.38,
        nitrogen_ammonia: 1.3,
        npk_fertilizer: 1.35,
        paddy_grain: 1.22,
        milled_rice: 1.24,
        artisan_flour: 1.22,
      },
      sectorDemandMods: { food: 1.26, biomed: 1.1 },
      stockMods: { FOOD: 5.4, SET_IND: 1.2 },
      chronicleTh: "ความขัดแย้งทางทหารในภูมิภาคทะเลดำทำให้ท่าเรือส่งออกข้าวสาลีและแร่ปุ๋ยฟอสเฟต/โพแทชถูกปิดกั้น ราคาปุ๋ย N-P-K และแป้งสาลีโลกพุ่งทะยาน ขณะที่ทั่วโลกหันมาสั่งซื้อข้าวและเบเกอรี่จากไทยเพิ่มขึ้นอย่างหนัก!",
      strategicAdviceTh: "โอกาสทองของธุรกิจเกษตร โรงสีข้าว และเบเกอรี่ไทย! การผลิตปุ๋ยหมักชีวภาพและปุ๋ย N-P-K ใช้เองจะช่วยประหยัดต้นทุนได้มหาศาล",
    },
    superpower_chip_embargo: {
      id: "superpower_chip_embargo",
      category: "trade_war",
      badgeTh: "⚡ สงครามเทคโนโลยี & คว่ำบาตรชิป",
      titleTh: "มหาอำนาจประกาศมาตรการคว่ำบาตรและจำกัดการส่งออกชิป AI & เครื่องจักรเวเฟอร์",
      regionTh: "แปซิฟิก / สหรัฐฯ–เอเชียตะวันออก",
      durationDays: 5,
      oilMultiplier: 1.0,
      freightRateMultiplier: 1.08,
      leadTimeMultiplier: 1.2,
      fxDeltaBaht: 1.1,
      materialMods: {
        silicon_wafer: 1.36,
        microchip: 1.42,
        power_inverter_ic: 1.38,
        optical_lens: 1.25,
        sensor: 1.22,
        pcb: 1.18,
      },
      sectorDemandMods: { electronics: 1.22, software: 1.18 },
      stockMods: { TECH: -3.2, SET_IND: 1.5 },
      chronicleTh: "สงครามเทคโนโลยีทวีความรุนแรง มหาอำนาจสั่งห้ามส่งออกชิปประมวลผลระดับนาโนและแผ่นซิลิคอนเวเฟอร์ ทำให้ราคาชิปในตลาดโลกพุ่ง +36~42% แต่ลูกค้า B2B หันมาจ้างโรงงานในไทยประกอบอุปกรณ์ IoT และ AI Edge แทน!",
      strategicAdviceTh: "หากบริษัทมีแต้มวิจัย R&D สูงพอ การถลุงซิลิคอนและผลิตเวเฟอร์/ชิปเองในโรงงานจะสร้างกำไรจากการขาย B2B ได้สูงสุด",
    },
    us_regime_tariff_shift: {
      id: "us_regime_tariff_shift",
      category: "regime_change",
      badgeTh: "🗳️ เปลี่ยนรัฐบาลมหาอำนาจ",
      titleTh: "สหรัฐฯ เปลี่ยนขั้วรัฐบาลใหม่ ประกาศขึ้นกำแพงภาษีนำเข้าและดึงฐานการผลิตกลับประเทศ",
      regionTh: "อเมริกาเหนือ / การค้าโลก",
      durationDays: 6,
      triggerNationId: "US",
      triggerRegimeId: "america_first_tariff",
      oilMultiplier: 1.05,
      freightRateMultiplier: 1.1,
      leadTimeMultiplier: 1.12,
      fxDeltaBaht: 1.5,
      materialMods: {
        microchip: 1.26,
        silicon_wafer: 1.2,
        metal_sheet: 1.18,
        copper_coil: 1.16,
      },
      sectorDemandMods: { electronics: 0.95, automotive: 0.96, food: 1.1, service: 1.14 },
      stockMods: { TECH: -1.8, AUTO: -1.5, FOOD: 2.1 },
      chronicleTh: "ผลการเลือกตั้งและการเปลี่ยนรัฐบาลใหม่ของสหรัฐฯ นำไปสู่การประกาศกำแพงภาษีนำเข้าชุดใหม่ ส่งผลให้ค่าเงินดอลลาร์แข็งค่าและราคาชิ้นส่วนอิเล็กทรอนิกส์นำเข้าสูงขึ้น",
      strategicAdviceTh: "กระจายตลาดสู่คู่ค้าอาเซียน/ญี่ปุ่น/จีน และเพิ่มสัดส่วนการใช้วัตถุดิบที่แปรรูปเองในประเทศ",
    },
    global_green_supercycle_election: {
      id: "global_green_supercycle_election",
      category: "regime_change",
      badgeTh: "🗳️ เปลี่ยนรัฐบาล & พันธมิตรสีเขียว",
      titleTh: "กลุ่มประเทศมหาอำนาจเปลี่ยนรัฐบาลสู่พันธมิตรอัดฉีดงบพลังงานสะอาดและ EV โลก",
      regionTh: "ยุโรป–อเมริกาเหนือ–เอเชีย",
      durationDays: 6,
      triggerNationId: "US",
      triggerRegimeId: "green_new_deal",
      oilMultiplier: 0.92,
      freightRateMultiplier: 1.02,
      leadTimeMultiplier: 0.98,
      fxDeltaBaht: -0.6,
      materialMods: {
        solar_cell: 1.22,
        battery: 1.25,
        cathode_electrolyte: 1.2,
        copper_coil: 1.15,
        crude_petro_feedstock: 0.9,
      },
      sectorDemandMods: { energy: 1.28, automotive: 1.24, service: 1.16 },
      stockMods: { GREEN: 6.5, AUTO: 4.1 },
      chronicleTh: "รัฐบาลชุดใหม่ของชาติมหาอำนาจลงนามงบประมาณอุดหนุนพลังงานสะอาดและรถยนต์ไฟฟ้าครั้งประวัติศาสตร์ ส่งผลให้ความต้องการแผงโซลาร์ อินเวอร์เตอร์ ตู้แบตเตอรี่ LFP/Solid-State และมอเตอร์ EV พุ่งทะยานทั่วโลก!",
      strategicAdviceTh: "เร่งเดินสายพานผลิตสินค้าหมวดพลังงานสะอาด ยานยนต์ EV และเปิดแล็บคัดเกรดแบตเตอรี่ Second-Life รับดีมานด์ตลาดโลก",
    },
    china_rare_earth_quota_shift: {
      id: "china_rare_earth_quota_shift",
      category: "regime_change",
      badgeTh: "🗳️ นโยบายทรัพยากรจีน",
      titleTh: "รัฐบาลจีนประกาศปรับโควตาส่งออกแร่ลิเธียม แคโทด และซิลิคอนบริสุทธิ์เพื่อความมั่นคงแห่งชาติ",
      regionTh: "เอเชียตะวันออก",
      durationDays: 5,
      triggerNationId: "CN",
      triggerRegimeId: "strategic_resource_control",
      oilMultiplier: 1.02,
      freightRateMultiplier: 1.06,
      leadTimeMultiplier: 1.15,
      fxDeltaBaht: 0.7,
      materialMods: {
        lithium_brine_ore: 1.38,
        cathode_electrolyte: 1.35,
        metallurgical_silicon: 1.32,
        bauxite_ore: 1.22,
        battery: 1.26,
      },
      sectorDemandMods: { energy: 1.16, automotive: 1.15 },
      stockMods: { GREEN: 2.4, AUTO: 1.8 },
      chronicleTh: "ทางการปักกิ่งประกาศจำกัดโควตาส่งออกแร่ลิเธียมและแท่งซิลิคอนบริสุทธิ์ ส่งผลให้ราคาสารแคโทดและโมดูลแบตเตอรี่ในตลาดโลกปรับตัวขึ้น +26~38% ทันที",
      strategicAdviceTh: "การลงทุนในสัมปทานเหมืองแร่และบริการรีไซเคิล/แล็บแบตเตอรี่ Second-Life จะช่วยลดการพึ่งพาวัตถุดิบนำเข้าได้โดยตรง",
    },
    asean_jp_eu_free_trade_pact: {
      id: "asean_jp_eu_free_trade_pact",
      category: "international_cooperation",
      badgeTh: "🤝 สนธิสัญญาความร่วมมือระหว่างประเทศ",
      titleTh: "ลงนามสนธิสัญญาการค้าเสรีและระเบียงโลจิสติกส์ดิจิทัล อาเซียน–ญี่ปุ่น–สหภาพยุโรป",
      regionTh: "อาเซียน–ญี่ปุ่น–ยุโรป",
      durationDays: 6,
      triggerNationId: "ASEAN",
      triggerRegimeId: "asean_single_window",
      oilMultiplier: 0.98,
      freightRateMultiplier: 1.14,
      leadTimeMultiplier: 0.85,
      fxDeltaBaht: -0.5,
      materialMods: {
        pcb: 0.92,
        optical_lens: 0.92,
        wire_harness: 0.94,
        pack_carton: 1.1,
      },
      sectorDemandMods: { electronics: 1.16, automotive: 1.18, food: 1.15, fleet: 1.2 },
      stockMods: { SET_IND: 4.5, TECH: 3.8, AUTO: 3.5, FOOD: 3.2 },
      chronicleTh: "ชาติสมาชิกอาเซียน ญี่ปุ่น และสหภาพยุโรปบรรลุข้อตกลงเปิดระเบียงการค้าเสรี ลดภาษีศุลกากรเป็นศูนย์และเชื่อมโยงระบบศุลกากรดิจิทัล ลดเวลาจัดส่งวัตถุดิบลง 15% และเพิ่มคำสั่งซื้อสินค้า B2B ทุกหมวด!",
      strategicAdviceTh: "จังหวะเหมาะที่สุดในการเร่งรับออเดอร์ส่งออก ขยายกองรถขนส่ง B2B และให้เช่าพาเลตหมุนเวียนรับปริมาณการค้าที่เพิ่มขึ้น",
    },
    global_food_medical_accord: {
      id: "global_food_medical_accord",
      category: "international_cooperation",
      badgeTh: "🤝 ความร่วมมือด้านสุขภาพและอาหารโลก",
      titleTh: "องค์การอนามัยและอาหารโลกเปิดกองทุนจัดซื้อเวชภัณฑ์ปลอดเชื้อและอาหารสุขภาพจากไทย",
      regionTh: "ทั่วโลก / สหประชาชาติ",
      durationDays: 5,
      triggerNationId: "EU",
      triggerRegimeId: "energy_medical_security",
      oilMultiplier: 1.0,
      freightRateMultiplier: 1.08,
      leadTimeMultiplier: 0.95,
      fxDeltaBaht: 0.2,
      materialMods: {
        pharma_saline_water: 1.2,
        probiotic_culture: 1.18,
        raw_extract: 1.16,
        foil_pouch: 1.15,
      },
      sectorDemandMods: { biomed: 1.28, food: 1.22 },
      stockMods: { FOOD: 4.8, SET_IND: 2.6 },
      chronicleTh: "ความร่วมมือระหว่างประเทศด้านสาธารณสุขและความมั่นคงทางอาหาร อนุมัติงบจัดซื้อชุดทำแผลปลอดเชื้อ น้ำเกลือทางการแพทย์ เครื่องมอนิเตอร์ ICU โยเกิร์ตโพรไบโอติกส์ และอาหารพร้อมทานจากฐานการผลิตในไทยล็อตใหญ่!",
      strategicAdviceTh: "ดูแลดัชนีความปลอดเชื้อคลีนรูม ISO Class-5 ให้เกิน 90% และเปิดห้องเย็น Cold-Chain เพื่อรับโบนัสราคาสินค้าเวชภัณฑ์และอาหารสด",
    },
    el_nino_agri_drought: {
      id: "el_nino_agri_drought",
      category: "climate_shock",
      badgeTh: "🌊 วิกฤตสภาพภูมิอากาศโลก",
      titleTh: "ปรากฏการณ์เอลนีโญรุนแรงและคลื่นความร้อนกระทบผลผลิตเกษตรเอเชียตะวันออกเฉียงใต้",
      regionTh: "เอเชียตะวันออกเฉียงใต้",
      durationDays: 5,
      oilMultiplier: 1.04,
      freightRateMultiplier: 1.05,
      leadTimeMultiplier: 1.08,
      fxDeltaBaht: 0.6,
      materialMods: {
        raw_water_m3: 1.35,
        paddy_grain: 1.28,
        milled_rice: 1.25,
        raw_cane: 1.26,
        crude_palm: 1.24,
        soybean_crop: 1.22,
        fresh_milk_soy: 1.2,
      },
      sectorDemandMods: { food: 1.18, energy: 1.14 },
      stockMods: { FOOD: 2.5, GREEN: 3.1 },
      chronicleTh: "คลื่นความร้อนและภัยแล้งเอลนีโญทำให้ปริมาณน้ำธรรมชาติลดลงและราคาผลผลิตการเกษตรในตลาดโลกปรับตัวสูงขึ้น +20~28% โรงงานที่มีระบบบำบัดน้ำหมุนเวียนและแปลงเกษตรที่มีระบบชลประทานจะได้เปรียบอย่างมาก",
      strategicAdviceTh: "สำรองน้ำดิบ (raw_water_m3) และใช้บริการรีไซเคิล/บำบัดน้ำเพื่อประคองความชื้นในแปลงเกษตรไม่ให้ผลผลิตตก",
    },
    global_port_congestion_crisis: {
      id: "global_port_congestion_crisis",
      category: "supply_chain_shock",
      badgeTh: "🚢 วิกฤตโลจิสติกส์และท่าเรือโลก",
      titleTh: "วิกฤตตู้คอนเทนเนอร์ขาดแคลนและท่าเรือขนส่งสินค้าหลักของโลกแออัดหนัก",
      regionTh: "เส้นทางเดินเรือแปซิฟิก–ยุโรป–แหลมฉบัง",
      durationDays: 5,
      oilMultiplier: 1.08,
      freightRateMultiplier: 1.28,
      leadTimeMultiplier: 1.22,
      fxDeltaBaht: 0.8,
      materialMods: {
        pack_carton: 1.24,
        timber_bamboo_log: 1.18,
        diesel_liter: 1.14,
      },
      sectorDemandMods: { fleet: 1.26, service: 1.2 },
      stockMods: { SET_IND: 1.9, TECH: -1.1 },
      chronicleTh: "ความแออัดของท่าเรือน้ำลึกทั่วโลกทำให้ตู้คอนเทนเนอร์และพาเลตหมุนเวียนขาดแคลน ค่าระวางรถบรรทุกขนส่ง B2B และบริการคลังห้องเย็น 3PL ปรับตัวสูงขึ้นกว่า +25%!",
      strategicAdviceTh: "ขยายกองรถบรรทุก จับคู่งานขากลับ (Backhaul Matching) และเปิดบริการให้เช่าพาเลตหมุนเวียน / คลังห้องเย็น 3PL เพื่อทำกำไรจากค่าระวางที่พุ่งสูง",
    },
    apac_robotics_semi_alliance: {
      id: "apac_robotics_semi_alliance",
      category: "international_cooperation",
      badgeTh: "🤝 พันธมิตรหุ่นยนต์และเซมิคอนดักเตอร์",
      titleTh: "ก่อตั้งเครือข่ายพันธมิตรหุ่นยนต์อุตสาหกรรมและเซมิคอนดักเตอร์เอเชียแปซิฟิก (APAC Automation Pact)",
      regionTh: "ไทย–ญี่ปุ่น–ไต้หวัน–สิงคโปร์",
      durationDays: 6,
      triggerNationId: "JP",
      triggerRegimeId: "semi_revival_act",
      oilMultiplier: 1.0,
      freightRateMultiplier: 1.04,
      leadTimeMultiplier: 0.9,
      fxDeltaBaht: -0.3,
      materialMods: {
        silicon_wafer: 0.92,
        sensor: 0.94,
        optical_lens: 0.94,
      },
      sectorDemandMods: { automotive: 1.22, electronics: 1.2, software: 1.16 },
      stockMods: { TECH: 5.2, AUTO: 4.4 },
      chronicleTh: "เครือข่ายอุตสาหกรรมเอเชียแปซิฟิกจับมือถ่ายทอดมาตรฐานหุ่นยนต์และเปิดโควตาแผ่นเวเฟอร์ราคาพิเศษให้โรงงานพันธมิตร พร้อมสั่งซื้อหุ่นยนต์ AGV แขนกลเซอร์โว และโดรนขนส่งหนักเพิ่ม +20%!",
      strategicAdviceTh: "เร่งวิจัยและเดินเครื่องสายพานหุ่นยนต์ AGV, แขนกลเซอร์โว และโมดูล AI Edge ป้อนกลุ่มพันธมิตรญี่ปุ่นและอาเซียน",
    },
    global_cyber_cloud_alert: {
      id: "global_cyber_cloud_alert",
      category: "tech_shock",
      badgeTh: "⚡ วิกฤตไซเบอร์ & เปลี่ยนผ่านดิจิทัล",
      titleTh: "คลื่นการโจมตีแรนซัมแวร์โลกบีบให้องค์กรเร่งเปลี่ยนผ่านสู่ซอฟต์แวร์คลาวด์และระบบตรวจสอบย้อนกลับ",
      regionTh: "โครงข่ายดิจิทัลทั่วโลก",
      durationDays: 5,
      oilMultiplier: 1.0,
      freightRateMultiplier: 1.0,
      leadTimeMultiplier: 1.0,
      fxDeltaBaht: 0.1,
      materialMods: {
        microchip: 1.14,
        pcb: 1.12,
      },
      sectorDemandMods: { software: 1.32, service: 1.22, electronics: 1.15 },
      stockMods: { TECH: 4.6, SET_IND: 2.1 },
      chronicleTh: "เหตุการณ์โจมตีไซเบอร์ต่อระบบซัพพลายเชนแบบเก่าทั่วโลก ทำให้บริษัทคู่ค้า B2B เร่งสั่งพัฒนาซอฟต์แวร์องค์กร (POS, WMS, TMS, e-Procurement, AI Assistant) และสมัครสมาชิก SaaS เพิ่มขึ้นอย่างก้าวกระโดด!",
      strategicAdviceTh: "มอบหมายวิศวกรซอฟต์แวร์เปิดพัฒนา MVP แอปพลิเคชันใหม่และแปลง Lead ลูกค้าเข้าสู่ระบบสมาชิก SaaS รายรอบ",
    },
    indonesia_nickel_bauxite_ban: {
      id: "indonesia_nickel_bauxite_ban",
      category: "trade_war",
      badgeTh: "⛏️ ระงับส่งออกแร่ดิบอาเซียน",
      titleTh: "อินโดนีเซียประกาศระงับส่งออกแร่บ็อกไซต์และนิกเกิลดิบ บังคับใช้โควตาโรงถลุงในภูมิภาค",
      regionTh: "อินโดนีเซีย / ทะเลชวา–อาเซียน",
      durationDays: 5,
      triggerNationId: "ID",
      triggerRegimeId: "downstream_mineral_mandate",
      oilMultiplier: 1.04,
      freightRateMultiplier: 1.12,
      leadTimeMultiplier: 1.16,
      fxDeltaBaht: 0.5,
      materialMods: {
        bauxite_ore: 1.38,
        alumina_billet: 1.3,
        nickel_cobalt_matte: 1.35,
        aluminum_extrusion_profile: 1.25,
        cathode_electrolyte: 1.22
      },
      sectorDemandMods: { automotive: 1.2, energy: 1.22, service: 1.15 },
      stockMods: { AUTO: 3.4, GREEN: 3.8, SET_IND: 1.6 },
      chronicleTh: "รัฐบาลจาการ์ตาบังคับใช้มาตรการห้ามส่งออกแร่บ็อกไซต์และนิกเกิลดิบที่ยังไม่ผ่านการถลุง ส่งผลให้ราคาแร่บ็อกไซต์ แท่งอะลูมินา และนิกเกิลแมตต์ในตลาดเอเชียพุ่งสูงขึ้น +25~38% โรงงานที่มีเหมืองแร่หรือเตาถลุงอะลูมินา/โปรไฟล์อะลูมิเนียมของตนเองทำกำไรจากส่วนต่างราคาได้มหาศาล!",
      strategicAdviceTh: "เดินเครื่องถลุงแร่บ็อกไซต์เป็นแท่งอะลูมินาบิลเล็ต (alumina_billet) และอัดรีดโปรไฟล์อะลูมิเนียม (aluminum_extrusion_profile) ใช้ผลิตถาดแบต EV / รางโซลาร์ หรือขายส่ง B2B"
    },
    australia_pilbara_cyclone_iron_shock: {
      id: "australia_pilbara_cyclone_iron_shock",
      category: "climate_shock",
      badgeTh: "🌪️ พายุไซโคลนถล่มท่าเรือแร่เหล็ก",
      titleTh: "พายุไซโคลนรุนแรงพัดถล่มท่าเรือส่งออกแร่เหล็กและลิเธียมภูมิภาคพิลบารา ออสเตรเลียตะวันตก",
      regionTh: "ออสเตรเลียตะวันตก / มหาสมุทรอินเดีย",
      durationDays: 5,
      triggerNationId: "AU",
      triggerRegimeId: "carbon_royalty_levy",
      oilMultiplier: 1.06,
      freightRateMultiplier: 1.18,
      leadTimeMultiplier: 1.2,
      fxDeltaBaht: 0.7,
      materialMods: {
        iron_ore: 1.4,
        coke_reducing_flux: 1.32,
        structural_steel_plate: 1.34,
        metal_sheet: 1.24,
        lithium_brine_ore: 1.26
      },
      sectorDemandMods: { energy: 1.18, automotive: 1.16, fleet: 1.15 },
      stockMods: { SET_IND: 2.8, AUTO: -1.2, GREEN: 2.9 },
      chronicleTh: "พายุไซโคลนระดับ 4 ทำให้ท่าเรือส่งออกแร่เหล็กและถ่านโค้กในพิลบาราต้องหยุดเดินเรือชั่วคราว ราคาแร่เหล็ก (iron_ore) และเหล็กกล้าแผ่นโครงสร้าง (structural_steel_plate) พุ่งขึ้นกว่า +34~40%!",
      strategicAdviceTh: "ใช้แร่เหล็กจากสัมปทานเหมืองในประเทศถลุงเป็นเหล็กกล้าแผ่นโครงสร้างและประกอบตู้สวิตช์เกียร์/รางโซลาร์ขายทำกำไร"
    },
    singapore_asean_coldchain_corridor: {
      id: "singapore_asean_coldchain_corridor",
      category: "international_cooperation",
      badgeTh: "🚢 ระเบียงโคลด์เชนและท่าเรือด่วน",
      titleTh: "สิงคโปร์–ไทย เปิดช่องทางด่วนเรือฟีดเดอร์ห้องเย็นและคลังทัณฑ์บนดิจิทัลเชื่อมแหลมฉบัง–จูร่ง",
      regionTh: "ช่องแคบมะละกา / แหลมฉบัง–สิงคโปร์",
      durationDays: 6,
      triggerNationId: "SG",
      triggerRegimeId: "global_maritime_fin_hub",
      oilMultiplier: 0.97,
      freightRateMultiplier: 1.22,
      leadTimeMultiplier: 0.84,
      fxDeltaBaht: -0.4,
      materialMods: {
        pack_carton: 0.94,
        foil_pouch: 0.94,
        pharma_saline_water: 1.14,
        bakery_dough_butter: 1.18
      },
      sectorDemandMods: { fleet: 1.28, food: 1.24, biomed: 1.22, software: 1.2 },
      stockMods: { FOOD: 4.6, SET_IND: 3.9, TECH: 3.2 },
      chronicleTh: "การท่าเรือสิงคโปร์และนิคมแหลมฉบังเปิดระบบศุลกากรอิเล็กทรอนิกส์เชื่อมกองรถห้องเย็นและเรือฟีดเดอร์ ลดเวลานำเข้าวัตถุดิบลง 16% พร้อมอัดฉีดค่าระวางงานขนส่งห้องเย็น คลัง 3PL และคำสั่งซื้ออาหาร/เวชภัณฑ์ส่งออก!",
      strategicAdviceTh: "จัดหารถห้องเย็น (reefer_6w) รับงานสายแหลมฉบัง–สิงคโปร์ และเปิดบริการคลังห้องเย็น 3PL / ซอฟต์แวร์ WMS & TMS"
    },
    india_apac_clean_grid_pharma_boom: {
      id: "india_apac_clean_grid_pharma_boom",
      category: "international_cooperation",
      badgeTh: "⚡ เมกะโปรเจกต์สมาร์ตกริด & เวชภัณฑ์เอเชีย",
      titleTh: "อินเดียและกลุ่มประเทศเอเชียใต้เปิดประมูลเมกะโปรเจกต์สมาร์ตกริด โซลาร์รูฟท็อป และเวชภัณฑ์ปลอดเชื้อ",
      regionTh: "อินเดีย / อ่าวเบงกอล–อาเซียน",
      durationDays: 6,
      triggerNationId: "IN",
      triggerRegimeId: "make_in_india_infra",
      oilMultiplier: 1.02,
      freightRateMultiplier: 1.1,
      leadTimeMultiplier: 0.94,
      fxDeltaBaht: -0.2,
      materialMods: {
        aluminum_extrusion_profile: 1.24,
        structural_steel_plate: 1.22,
        solar_cell: 1.2,
        nickel_cobalt_matte: 1.18
      },
      sectorDemandMods: { energy: 1.3, biomed: 1.24, service: 1.25 },
      stockMods: { GREEN: 5.8, FOOD: 3.1, SET_IND: 3.4 },
      chronicleTh: "อินเดียเร่งขยายโครงข่ายไฟฟ้าพลังงานสะอาดและโรงพยาบาลภูมิภาค เปิดประมูลชุดรางโซลาร์รูฟท็อป ตู้สวิตช์เกียร์ โมดูลแบตเตอรี่ NMC และบริการรับเหมาติดตั้ง EPC ล็อตใหญ่จากฐานการผลิตในไทย!",
      strategicAdviceTh: "ผลิตชุดรางโซลาร์ (solar_mounting_rail_kit), ตู้สวิตช์เกียร์ (industrial_switchgear_cabinet) และรับงานบริการติดตั้งโซลาร์ EPC (energy_epc_install)"
    }
  });

  // Regional Trade Corridors & Dynamic Tariff/Freight/Demand Transmission (Era 2.1.0)
  const SME_GROWTH_STAGES = deepFreeze([
    {
      id: "stage_1_micro_workshop",
      order: 1,
      badgeTh: "🌱 ระยะที่ 1/6",
      nameTh: "ห้องแถวและเวิร์กช็อปตั้งต้น (Micro SME Workshop)",
      minEmployees: 4,
      minOrdersPaid: 0,
      minReputation: 0,
      minPlotsOrAssets: 0,
      creditLimitMult: 1.0,
      b2bTrustBonus: 0,
      summaryTh: "กิจการขนาดเล็กช่วงก่อตั้ง พึ่งพาการหมุนเงินสดรายวันจากออเดอร์ล็อตเล็ก CEO และพนักงานช่วยกันลุยงานหน้างานเพื่อประคองสภาพคล่อง"
    },
    {
      id: "stage_2_registered_sme",
      order: 2,
      badgeTh: "🏭 ระยะที่ 2/6",
      nameTh: "โรงงาน SME มาตรฐานจดทะเบียน (Registered Industrial SME)",
      minEmployees: 8,
      minOrdersPaid: 2,
      minReputation: 47,
      minPlotsOrAssets: 0,
      creditLimitMult: 1.25,
      b2bTrustBonus: 2,
      summaryTh: "ผ่านพ้นช่วงตั้งไข่ มีประวัติส่งมอบออเดอร์ตรงเวลา เริ่มแยกแผนกออฟฟิศ/โรงงานชัดเจน และพร้อมเปิดบริการ B2B หรือเช่ารถขนส่งคันแรก"
    },
    {
      id: "stage_3_midcap_manufacturer",
      order: 3,
      badgeTh: "⚙️ ระยะที่ 3/6",
      nameTh: "บริษัทผู้ผลิตขนาดกลางหลายสายพาน (Multi-Line Mid-Cap)",
      minEmployees: 12,
      minOrdersPaid: 5,
      minReputation: 52,
      minPlotsOrAssets: 1,
      creditLimitMult: 1.6,
      b2bTrustBonus: 5,
      summaryTh: "มีอาคารส่วนต่อขยายหรือสินทรัพย์ธุรกิจเสริม ทีม R&D เริ่มปลดล็อกสินค้าเทคโนโลยีกลางน้ำ และบริหารจัดการหลายโมเดลธุรกิจควบคู่กัน"
    },
    {
      id: "stage_4_supply_chain_group",
      order: 4,
      badgeTh: "🚢 ระยะที่ 4/6",
      nameTh: "เครือข่ายซัพพลายเชนครบวงจร (Integrated Supply Chain Group)",
      minEmployees: 24,
      minOrdersPaid: 12,
      minReputation: 60,
      minPlotsOrAssets: 2,
      creditLimitMult: 2.1,
      b2bTrustBonus: 8,
      summaryTh: "เชื่อมโยงวัตถุดิบต้นน้ำ การแปรรูปกลางน้ำ กองรถขนส่ง และบริการวิศวกรรมเข้าด้วยกัน พร้อมค้าขายข้ามประเทศตามระเบียงการค้าภูมิภาค"
    },
    {
      id: "stage_5_public_pcl",
      order: 5,
      badgeTh: "🏛️ ระยะที่ 5/6",
      nameTh: "บริษัทมหาชนจำกัด (Public Company Limited — PCL)",
      minEmployees: 50,
      minOrdersPaid: 22,
      minReputation: 70,
      minPlotsOrAssets: 4,
      creditLimitMult: 3.0,
      b2bTrustBonus: 12,
      summaryTh: "องค์กรธรรมาภิบาลระดับมหาชน ฐานะการเงินแข็งแกร่ง ดึงดูดบุคลากรเกรดเอและเป็นพันธมิตรหลักของบริษัทข้ามชาติ"
    },
    {
      id: "stage_6_regional_conglomerate",
      order: 6,
      badgeTh: "👑 ระยะที่ 6/6",
      nameTh: "กลุ่มบริษัทอุตสาหกรรมระดับภูมิภาค (ASEAN Industrial Conglomerate)",
      minEmployees: 100,
      minOrdersPaid: 40,
      minReputation: 80,
      minPlotsOrAssets: 6,
      creditLimitMult: 4.5,
      b2bTrustBonus: 18,
      summaryTh: "อาณาจักรธุรกิจครบวงจรทั้ง 8 โมเดลอุตสาหกรรม มีเครือข่ายบริษัทลูก/พันธมิตร Spin-off และความยืดหยุ่นสูงต่อวิกฤตภูมิรัฐศาสตร์โลก"
    }
  ]);

  const SME_MILESTONE_CATALOG = deepFreeze([
    { id: "first_order_paid", icon: "💰", titleTh: "รับเงินสดก้อนแรกจากการส่งมอบออเดอร์ B2B สำเร็จ", descTh: "พิสูจน์ว่าสายการผลิตและฝ่ายขายสามารถเปลี่ยนวัตถุดิบเป็นเงินสดจริงก้อนแรกได้" },
    { id: "first_research_unlock", icon: "🔬", titleTh: "ทีมวิจัย R&D ปลดล็อกแบบแปลนสินค้าใหม่ชิ้นแรก", descTh: "ก้าวแรกจากการรับจ้างผลิตพื้นฐานสู่การมีทรัพย์สินทางปัญญาของบริษัทเอง" },
    { id: "first_debt_repaid", icon: "🏦", titleTh: "ชำระคืนเงินต้นหนี้ธนาคารก้อนแรกสำเร็จ", descTh: "ผู้บริหารนำเงินสดส่วนเกินเหนือเงินสำรองมาลดภาระดอกเบี้ยรายวัน" },
    { id: "debt_free_turnaround", icon: "🦅", titleTh: "ปลอดหนี้ธนาคาร 100% (Debt-Free Turnaround)", descTh: "บริษัทไถ่ถอนหนี้เงินกู้ตั้งต้นครบทุกบาท กระแสเงินสดจากการดำเนินงานเป็นอิสระเต็มตัว" },
    { id: "team_double_digits", icon: "👥", titleTh: "ขยายทีมงานทะลุ 10 คน ก้าวพ้นกิจการห้องแถว", descTh: "โครงสร้างองค์กรเริ่มมีหัวหน้ากลุ่มและแผนกเฉพาะทางรองรับปริมาณงานที่เพิ่มขึ้น" },
    { id: "first_plot_constructed", icon: "🏗️", titleTh: "ก่อสร้างอาคารส่วนต่อขยายแห่งแรกในนิคม", descTh: "ขยายพื้นที่กายภาพของโรงงานเพื่อเพิ่มสถานีทำงานและปลดล็อกคอขวดกำลังผลิต" },
    { id: "first_fleet_truck", icon: "🚛", titleTh: "มีรถบรรทุกขนส่งคันแรกในกองรถบริษัท", descTh: "เริ่มบริหารโลจิสติกส์และรับงานขนส่ง B2B ด้วยกองรถของตนเอง" },
    { id: "first_b2b_service", icon: "🛠️", titleTh: "เปิดรับใบงานธุรกิจบริการวิศวกรรม/ค้าส่ง B2B งานแรก", descTh: "แตกไลน์รายได้สู่ธุรกิจบริการที่ใช้ความเชี่ยวชาญของทีมช่างและวิศวกร" },
    { id: "first_external_asset", icon: "🌾", titleTh: "เข้าถือครองสินทรัพย์ต้นน้ำนอกนิคมแห่งแรก", descTh: "สร้างความมั่นคงทางทรัพยากรด้วยการมีแหล่งผลิตวัตถุดิบต้นน้ำของบริษัทเอง" },
    { id: "first_green_utility_offset", icon: "☀️", titleTh: "ผลิตพลังงานโซลาร์/น้ำรีไซเคิลช่วยลดบิลค่าไฟ-ค่าน้ำโรงงาน", descTh: "เปลี่ยนโสหุ้ยสาธารณูปโภครายสัปดาห์ให้ลดลงด้วยโครงสร้างพื้นฐานสีเขียว" },
    { id: "first_employee_car", icon: "🚗", titleTh: "พนักงานคนแรกเก็บเงินเดือนถอยรถส่วนตัวมาจอดหน้าบริษัท", descTh: "ความมั่งคั่งของบริษัทส่งผ่านสู่คุณภาพชีวิตจริงของพนักงานจนลานจอดรถเริ่มคึกคัก" },
    { id: "first_alumni_spinoff", icon: "🚀", titleTh: "อดีตพนักงานอาวุโสก่อตั้งกิจการ SME Spin-off ในระบบนิเวศตลาด", descTh: "บุคลากรที่เติบโตจากบริษัทออกไปตั้งกิจการคู่ค้าหรือคู่แข่งรายใหม่ในตลาดจริง" }
  ]);

  const UTILITY_TARIFFS = deepFreeze({
    baseKwhPerBuildingLevel: 18,
    kwhPerActiveFactoryLine: 42,
    kwhPerCleanroomOrRefineryPlot: 55,
    kwhPerOtHour: 14,
    rateSatangPerKwh: 420,
    peakOtRateSatangPerKwh: 580,
    solarPlotOffsetKwhDaily: 145,
    offsiteSolarOffsetKwhPerLevelDaily: 210,
    waterM3PerEmployeeAtWork: 0.45,
    waterM3PerFactoryLine: 4.5,
    rateSatangPerWaterM3: 1850,
    waterPlantOffsetM3Daily: 18,
    billingIntervalDays: 7
  });

  const AFTER_WORK_CLUBS = deepFreeze([
    {
      id: "club_courtyard_running",
      nameTh: "ชมรมวิ่งและฟิตเนสสวนหย่อมนิคม (Campus Running Club)",
      icon: "🏃",
      locationBuildingId: "courtyard",
      energyDelta: 4,
      burnoutDelta: -6,
      stressDelta: -4,
      moraleDelta: 3,
      summaryTh: "พนักงานสายรักสุขภาพออกวิ่งรอบสวนหย่อมหลังเลิกงาน ลดความเหนื่อยล้าสะสมและเพิ่มความสดชื่น"
    },
    {
      id: "club_canteen_friday_social",
      nameTh: "วงสังสรรค์และหมูกระทะลานโรงอาหาร (Canteen Evening Social)",
      icon: "🍲",
      locationBuildingId: "canteen",
      energyDelta: 2,
      burnoutDelta: -4,
      stressDelta: -8,
      moraleDelta: 6,
      summaryTh: "พนักงานต่างแผนกล้อมวงพูดคุยและทานมื้อเย็นร่วมกัน สร้างความไว้ใจข้ามสายงานและลดความตึงเครียด"
    },
    {
      id: "club_rnd_boardgame_tech",
      nameTh: "ชมรมบอร์ดเกมและแลกเปลี่ยนเทคนิค (R&D Tech & Strategy Circle)",
      icon: "🎲",
      locationBuildingId: "rnd",
      energyDelta: 1,
      burnoutDelta: -3,
      stressDelta: -4,
      moraleDelta: 4,
      xpBonus: 18,
      summaryTh: "วิศวกรและฝ่ายออฟฟิศลับสมองด้วยเกมวางแผนและแชร์เทคนิคแก้คอขวดงานผลิต"
    }
  ]);

  const CULTURE_GOSSIP_TOPICS = deepFreeze([
    {
      id: "gossip_booming_orders",
      badgeTh: "💬 ข่าวดีข้างตู้กดน้ำ",
      topicTh: "ยอดส่งมอบและเงินสดบริษัทกำลังโตต่อเนื่อง ลุ้นโบนัสรอบหน้า!",
      moraleDelta: 3,
      stressDelta: -2
    },
    {
      id: "gossip_tight_runway",
      badgeTh: "💬 เสียงกระซิบการเงิน",
      topicTh: "กระแสเงินสดสำรองเริ่มตึงตัว ช่วงนี้ต้องช่วยกันประหยัดวัตถุดิบและลดของเสีย",
      moraleDelta: -2,
      stressDelta: 3
    },
    {
      id: "gossip_aging_machines",
      badgeTh: "💬 เสียงบ่นหน้าไลน์ผลิต",
      topicTh: "เครื่องจักรโรงงานเริ่มสึกหรอและร้อนจัด อยากให้ทีมช่างเร่งซ่อมบำรุงก่อนพัง",
      moraleDelta: -2,
      stressDelta: 2
    },
    {
      id: "gossip_merit_culture",
      badgeTh: "💬 ชื่นชมผู้บริหาร",
      topicTh: "การเลื่อนขั้นและให้รางวัลรอบล่าสุดโปร่งใส คนตั้งใจทำงานรู้สึกมีอนาคต",
      moraleDelta: 4,
      stressDelta: -2
    },
    {
      id: "gossip_favoritism_concern",
      badgeTh: "💬 ข่าวลือเรื่องเส้นสาย",
      topicTh: "มีเสียงวิจารณ์เรื่องการเลื่อนตำแหน่งข้ามหัวคนที่ทำผลงานหนักในแผนก",
      moraleDelta: -4,
      stressDelta: 4
    },
    {
      id: "gossip_utility_green_pride",
      badgeTh: "💬 ความภูมิใจนิคมสีเขียว",
      topicTh: "ระบบโซลาร์และบำบัดน้ำของโรงงานช่วยเซฟค่าไฟค่าน้ำได้จริง แถมอากาศในนิคมดีขึ้นมาก",
      moraleDelta: 3,
      stressDelta: -1
    }
  ]);

  const TRADE_CORRIDORS = deepFreeze({
    corridor_asean_landbridge: {
      id: "corridor_asean_landbridge",
      nameTh: "ระเบียงเศรษฐกิจทางบกและท่าเรือฟีดเดอร์อาเซียน (CLMVT–Singapore Smart Corridor)",
      icon: "🚛",
      nations: ["TH", "ASEAN", "SG"],
      primarySectors: ["fleet", "food", "service"],
      keyMaterials: ["paddy_grain", "milled_rice", "pack_carton", "diesel_liter"],
      baseTariffPct: 0,
      baseLeadTimeMod: 0.9,
      descTh: "เชื่อมนิคมอุตสาหกรรมไทยสู่ด่านชายแดนอาเซียนและท่าเรือถ่ายลำสินค้าสิงคโปร์ ส่งผลโดยตรงต่อค่าระวางกองรถขนส่ง B2B คลังห้องเย็น 3PL และการส่งออกอาหาร"
    },
    corridor_indo_australia_mineral: {
      id: "corridor_indo_australia_mineral",
      nameTh: "ระเบียงทรัพยากรแร่โลหะและแบตเตอรี่แปซิฟิกใต้ (Indonesia–Australia Mineral & EV Belt)",
      icon: "⛏️",
      nations: ["ID", "AU", "TH"],
      primarySectors: ["automotive", "energy"],
      keyMaterials: ["bauxite_ore", "iron_ore", "lithium_brine_ore", "coke_reducing_flux", "alumina_billet", "structural_steel_plate", "nickel_cobalt_matte", "aluminum_extrusion_profile"],
      baseTariffPct: 3,
      baseLeadTimeMod: 1.0,
      descTh: "เส้นทางลำเลียงแร่บ็อกไซต์ แร่เหล็ก ลิเธียม และถ่านโค้กโลหะวิทยาเข้าสู่โรงถลุงและสายการผลิตถาดแบตเตอรี่ EV / รางโซลาร์ในไทย"
    },
    corridor_east_asia_tech_express: {
      id: "corridor_east_asia_tech_express",
      nameTh: "ระเบียงเซมิคอนดักเตอร์และหุ่นยนต์เอเชียตะวันออก (Japan–China–Taiwan Tech Corridor)",
      icon: "🔬",
      nations: ["JP", "CN", "US"],
      primarySectors: ["electronics", "automotive", "software"],
      keyMaterials: ["silica_bauxite_ore", "metallurgical_silicon", "silicon_wafer", "microchip", "pcb", "optical_lens", "sensor"],
      baseTariffPct: 4,
      baseLeadTimeMod: 0.95,
      descTh: "เส้นทางซัพพลายเชนแผ่นเวเฟอร์ ชิปประมวลผล เลนส์ออปติคัล และหุ่นยนต์ความแม่นยำสูง อ่อนไหวต่อสงครามเทคโนโลยีและกำแพงภาษี"
    },
    corridor_india_eu_green_pharma: {
      id: "corridor_india_eu_green_pharma",
      nameTh: "ระเบียงพลังงานสะอาดและเวชภัณฑ์อินโด-ยุโรป (India–Middle East–EU Green & Clinical Corridor)",
      icon: "🌍",
      nations: ["IN", "ME", "EU", "RU_EE"],
      primarySectors: ["energy", "biomed", "food"],
      keyMaterials: ["pharma_saline_water", "probiotic_culture", "solar_cell", "power_inverter_ic", "phosphate_potash_rock", "npk_fertilizer"],
      baseTariffPct: 5,
      baseLeadTimeMod: 1.05,
      descTh: "เส้นทางส่งออกเวชภัณฑ์ปลอดเชื้อ ตู้กักเก็บพลังงาน และนำเข้าแร่แม่ปุ๋ย/น้ำมันดิบ อ่อนไหวต่อมาตรการคาร์บอน CBAM และความมั่นคงทางทะเล"
    }
  });

  const EXTERNAL_WORLD_DEFAULTS = deepFreeze({
    corporations: [
      {
        id: "siam_tech",
        nameTh: "บมจ. สยามเทค โฮลดิ้งส์",
        symbol: "STECH",
        sector: "tech",
        sectorTh: "เทคโนโลยีและสมาร์ตดีไวซ์",
        originTh: "กรุงเทพฯ / นิคมลาดกระบัง",
        tierTh: "องค์กรมหาชน (SET100)",
        roles: ["client", "partner", "competitor"],
        relationshipMode: "cordial",
        baseTrust: 58,
        marketSharePct: 14.5,
        strength: 66,
        cashMillionBaht: 420,
        pricePremium: 0.05,
        paymentDays: 1,
        sellsMaterials: ["pcb", "casing", "led"],
        buysMaterials: ["silicon_wafer", "microchip", "pcb", "sensor", "optical_lens", "heat_sink"],
        buysProducts: ["speaker", "lamp", "iotController", "smartMeter", "visionCamera", "ai_edge_module"],
        rivalsWith: ["titan_elec", "tokyo_elec", "shenzhen_semi"],
        alliesWith: ["metro_retail", "green_power"],
        strategyTh: "ขยายแพลตฟอร์มสมาร์ตโฮมและ AI Edge พร้อมรับซื้อแผ่นเวเฟอร์และชิปจากโรงงานพันธมิตรในไทย"
      },
      {
        id: "shenzhen_semi",
        nameTh: "บจก. เซินเจิ้น เซมิคอนดักเตอร์ แอนด์ ฟาวน์ดรี",
        symbol: "SZSEMI",
        sector: "tech",
        sectorTh: "เซมิคอนดักเตอร์และชิ้นส่วนอิเล็กทรอนิกส์",
        originTh: "เซินเจิ้น / ท่าเรือแหลมฉบัง",
        tierTh: "ฟาวน์ดรีข้ามชาติระดับโลก",
        roles: ["supplier", "client", "competitor"],
        relationshipMode: "neutral",
        baseTrust: 52,
        marketSharePct: 16.0,
        strength: 74,
        cashMillionBaht: 680,
        pricePremium: 0.06,
        paymentDays: 1,
        sellsMaterials: ["pcb", "microchip", "led", "sensor", "heat_sink", "optical_lens", "power_inverter_ic", "silica_bauxite_ore", "metallurgical_silicon", "silicon_wafer"],
        buysMaterials: ["silica_bauxite_ore", "metallurgical_silicon", "silicon_wafer", "copper_coil"],
        buysProducts: ["ai_edge_module", "visionCamera"],
        rivalsWith: ["tokyo_elec", "titan_elec"],
        alliesWith: ["pacific_solar"],
        strategyTh: "ขายชิปและเวเฟอร์ให้โรงงานตั้งต้น แต่พร้อมรับซื้อแท่งซิลิคอนบริสุทธิ์ MG-Si และแข่งประมูลดีล AI"
      },
      {
        id: "tokyo_elec",
        nameTh: "บจก. โตเกียว อิเล็กทรอนิกส์ แอนด์ โรโบติกส์ (ประเทศไทย)",
        symbol: "TKELEC",
        sector: "tech",
        sectorTh: "อิเล็กทรอนิกส์ความแม่นยำสูงและหุ่นยนต์",
        originTh: "โอซาก้า / นิคมโรจนะ อยุธยา",
        tierTh: "คู่ค้าส่งออกญี่ปุ่น (JCCI)",
        roles: ["client", "partner", "supplier"],
        relationshipMode: "partner",
        baseTrust: 64,
        marketSharePct: 12.0,
        strength: 70,
        cashMillionBaht: 540,
        pricePremium: 0.08,
        paymentDays: 1,
        sellsMaterials: ["optical_lens", "sensor", "microchip", "driver"],
        buysMaterials: ["silicon_wafer", "metallurgical_silicon", "heat_sink", "wire_harness", "pcb"],
        buysProducts: ["iotController", "autoSensor", "smartMeter", "visionCamera", "servoActuator", "autonomous_cargo_drone"],
        rivalsWith: ["shenzhen_semi", "titan_elec"],
        alliesWith: ["asia_autoparts", "siam_aero_robotics"],
        strategyTh: "เน้นมาตรฐาน Zero-Defect ญี่ปุ่น รับซื้อชิ้นส่วนความแม่นยำสูงและโดรนขนส่งอุตสาหกรรม"
      },
      {
        id: "titan_elec",
        nameTh: "บมจ. ไททัน อิเล็กทรอนิกส์ อินดัสทรี",
        symbol: "TITAN",
        sector: "tech",
        sectorTh: "อิเล็กทรอนิกส์และอุปกรณ์สมาร์ตเทค",
        originTh: "สมุทรปราการ / บางปู",
        tierTh: "เจ้าตลาดสายพานล็อตใหญ่",
        roles: ["competitor", "client"],
        relationshipMode: "rival",
        baseTrust: 42,
        marketSharePct: 13.5,
        strength: 68,
        cashMillionBaht: 390,
        pricePremium: 0.02,
        paymentDays: 1,
        sellsMaterials: ["casing", "driver"],
        buysMaterials: ["pcb", "copper_coil", "polymer_resin", "pack_carton"],
        buysProducts: ["speaker", "lamp"],
        rivalsWith: ["siam_tech", "tokyo_elec", "apex_ind"],
        alliesWith: ["siam_metal"],
        strategyTh: "ทุ่มกำลังการผลิตขนาดใหญ่ตัดราคาคู่แข่ง แต่ยังต้องสั่งซื้อแผงวงจร PCB และขดลวดทองแดงจากตลาด"
      },
      {
        id: "asia_autoparts",
        nameTh: "บจก. เอเชีย ออโต้พาร์ท แอนด์ อีวี โมบิลิตี้",
        symbol: "ASIAEV",
        sector: "automotive",
        sectorTh: "ยานยนต์ไฟฟ้าและชิ้นส่วน OEM",
        originTh: "นิคมอีสเทิร์นซีบอร์ด ระยอง",
        tierTh: "ผู้ผลิตยานยนต์ OEM ระดับภูมิภาค",
        roles: ["client", "partner", "competitor"],
        relationshipMode: "cordial",
        baseTrust: 56,
        marketSharePct: 11.5,
        strength: 65,
        cashMillionBaht: 510,
        pricePremium: 0.06,
        paymentDays: 1,
        sellsMaterials: ["metal_sheet", "wire_harness"],
        buysMaterials: ["polymer_resin", "metal_sheet", "copper_coil", "wire_harness", "battery", "cathode_electrolyte"],
        buysProducts: ["autoSensor", "evController", "batteryPack", "servoActuator", "ev_suspension_kit", "ev_battery_tray_assembly", "high_nickel_nmc_module"],
        rivalsWith: ["eastern_auto", "apex_ind"],
        alliesWith: ["tokyo_elec", "siam_metal"],
        strategyTh: "ขยายฐานประกอบรถยนต์ไฟฟ้า EV ใน EEC รับซื้อทั้งชุดควบคุม EV แพ็กแบตเตอรี่ และเม็ดโพลีเมอร์"
      },
      {
        id: "eastern_auto",
        nameTh: "บจก. อีสเทิร์น ออโต้เทค แอนด์ เมคคาทรอนิกส์",
        symbol: "EAUTO",
        sector: "automotive",
        sectorTh: "ชิ้นส่วนยานยนต์และระบบส่งกำลัง",
        originTh: "แหลมฉบัง ชลบุรี",
        tierTh: "คู่แข่งสายยานยนต์",
        roles: ["competitor", "client", "supplier"],
        relationshipMode: "rival",
        baseTrust: 45,
        marketSharePct: 10.5,
        strength: 64,
        cashMillionBaht: 350,
        pricePremium: 0.04,
        paymentDays: 1,
        sellsMaterials: ["wire_harness", "casing", "heat_sink"],
        buysMaterials: ["metal_sheet", "copper_coil", "polymer_resin", "sensor"],
        buysProducts: ["autoSensor", "ev_suspension_kit"],
        rivalsWith: ["asia_autoparts", "siam_metal"],
        alliesWith: ["petro_chem_siam"],
        strategyTh: "แข่งขันประมูลงานชิ้นส่วนยานยนต์กับเอเชียออโต้พาร์ท และรับซื้อแผ่นโลหะรีดเย็นจากโรงถลุง"
      },
      {
        id: "siam_metal",
        nameTh: "บจก. สยามเมทัล แอนด์ ฮาร์เนส อินดัสทรี",
        symbol: "SMETAL",
        sector: "automotive",
        sectorTh: "ถลุงโลหะ ขดลวดทองแดง และเหมืองแร่",
        originTh: "นิคมอมตะซิตี้ ชลบุรี / ลพบุรี",
        tierTh: "ซัพพลายเออร์โลหะหลัก",
        roles: ["supplier", "client", "partner"],
        relationshipMode: "cordial",
        baseTrust: 58,
        marketSharePct: 7.5,
        strength: 60,
        cashMillionBaht: 320,
        pricePremium: 0.03,
        paymentDays: 1,
        sellsMaterials: ["copper_iron_ore", "iron_ore", "bauxite_ore", "coke_reducing_flux", "alumina_billet", "structural_steel_plate", "aluminum_extrusion_profile", "silica_bauxite_ore", "lithium_brine_ore", "metal_sheet", "copper_coil", "casing", "driver", "wire_harness", "heat_sink", "polymer_resin", "natural_latex"],
        buysMaterials: ["copper_iron_ore", "iron_ore", "bauxite_ore", "alumina_billet", "structural_steel_plate", "aluminum_extrusion_profile", "metallurgical_silicon", "polymer_resin"],
        buysProducts: ["servoActuator", "smartMeter", "industrial_switchgear_cabinet", "ev_battery_tray_assembly"],
        rivalsWith: ["eastern_auto"],
        alliesWith: ["asia_autoparts", "titan_elec"],
        strategyTh: "จำหน่ายแร่ดิบและโลหะขึ้นรูปทุกชนิด พร้อมรับซื้อแขนกลเซอร์โวไปอัปเกรดโรงถลุง"
      },
      {
        id: "cp_health",
        nameTh: "บมจ. เจริญผล ฟู้ดแอนด์เฮลท์ โกลบอล",
        symbol: "CPFH",
        sector: "food",
        sectorTh: "อุตสาหกรรมอาหาร เบเกอรี่ และค้าปลีก",
        originTh: "กรุงเทพฯ / นครปฐม",
        tierTh: "เครือเกษตรและอาหารครบวงจร",
        roles: ["client", "partner", "supplier"],
        relationshipMode: "partner",
        baseTrust: 62,
        marketSharePct: 12.5,
        strength: 69,
        cashMillionBaht: 610,
        pricePremium: 0.05,
        paymentDays: 0,
        sellsMaterials: ["paddy_grain", "crude_palm", "raw_cane", "fresh_milk_soy", "artisan_flour", "refined_palm_oil", "refined_sugar_syrup"],
        buysMaterials: ["artisan_flour", "refined_palm_oil", "refined_sugar_syrup", "bakery_dough_butter", "probiotic_culture", "foil_pouch", "pack_carton"],
        buysProducts: ["artisan_bakery", "pastry_croissant_box", "plant_based_meat", "premium_cooking_oil", "ready_meal_box", "dairy_protein_shake", "herbalDrink", "energyProtein", "functionalShot", "probioticElixir"],
        rivalsWith: ["siam_naturals", "metro_retail"],
        alliesWith: ["thai_organic", "biomed_siam"],
        strategyTh: "รับซื้อทั้งแป้งโม่ละเอียด โดว์เนยสด น้ำมันปาล์มบริสุทธิ์ และสินค้าเบเกอรี่/โปรตีนจากพืชไปวางจำหน่ายทั่วเอเชีย"
      },
      {
        id: "thai_organic",
        nameTh: "สหกรณ์เกษตรอินทรีย์และโรงโม่แป้งสยาม",
        symbol: "THORG",
        sector: "food",
        sectorTh: "เกษตรต้นน้ำ สมุนไพร และบรรจุภัณฑ์",
        originTh: "เชียงใหม่ / สุรินทร์ / สุราษฎร์ธานี",
        tierTh: "เครือข่ายสหกรณ์ต้นน้ำ",
        roles: ["supplier", "client", "partner"],
        relationshipMode: "cordial",
        baseTrust: 60,
        marketSharePct: 6.0,
        strength: 54,
        cashMillionBaht: 210,
        pricePremium: 0.03,
        paymentDays: 0,
        sellsMaterials: ["paddy_grain", "crude_palm", "raw_cane", "fresh_milk_soy", "natural_latex", "timber_bamboo_log", "raw_extract", "glass_bottle", "pack_carton", "probiotic_culture", "foil_pouch", "artisan_flour", "refined_palm_oil", "refined_sugar_syrup", "bakery_dough_butter"],
        buysMaterials: ["pack_carton", "glass_bottle", "foil_pouch", "artisan_flour"],
        buysProducts: ["solarCharger", "herbalDrink", "premium_cooking_oil"],
        rivalsWith: ["siam_naturals"],
        alliesWith: ["cp_health"],
        strategyTh: "แหล่งวัตถุดิบเกษตรต้นน้ำที่ใหญ่ที่สุดในประเทศ พร้อมรับซื้อบรรจุภัณฑ์และเครื่องชาร์จโซลาร์สำหรับฟาร์ม"
      },
      {
        id: "siam_naturals",
        nameTh: "บมจ. สยามเนเชอรัล ฟู้ดส์ แอนด์ เบเกอรี่",
        symbol: "SNAT",
        sector: "food",
        sectorTh: "อาหารแปรรูปและเครื่องดื่มสุขภาพ",
        originTh: "ปทุมธานี / พระนครศรีอยุธยา",
        tierTh: "คู่แข่งสายอาหารสุขภาพ",
        roles: ["competitor", "client"],
        relationshipMode: "rival",
        baseTrust: 46,
        marketSharePct: 9.0,
        strength: 58,
        cashMillionBaht: 290,
        pricePremium: 0.03,
        paymentDays: 1,
        sellsMaterials: ["artisan_flour", "refined_sugar_syrup"],
        buysMaterials: ["artisan_flour", "refined_palm_oil", "bakery_dough_butter", "raw_extract", "glass_bottle", "pack_carton"],
        buysProducts: ["artisan_bakery", "pastry_croissant_box", "plant_based_meat"],
        rivalsWith: ["cp_health", "thai_organic"],
        alliesWith: ["metro_retail"],
        strategyTh: "แข่งแย่งพื้นที่เชลฟ์อาหารสุขภาพกับเจริญผล แต่หากผลิตแป้งและโดว์ไม่ทันจะสั่งซื้อจากโรงโม่ของเรา"
      },
      {
        id: "green_power",
        nameTh: "บจก. กรีนพาวเวอร์ โซลูชั่นส์ เอเชีย",
        symbol: "GPWR",
        sector: "energy",
        sectorTh: "พลังงานสะอาดและสมาร์ตกริด",
        originTh: "ชัยภูมิ / กรุงเทพฯ",
        tierTh: "พันธมิตรพลังงานสะอาด BOI",
        roles: ["client", "partner", "competitor"],
        relationshipMode: "partner",
        baseTrust: 57,
        marketSharePct: 8.5,
        strength: 62,
        cashMillionBaht: 460,
        pricePremium: 0.07,
        paymentDays: 1,
        sellsMaterials: ["solar_cell"],
        buysMaterials: ["solar_cell", "battery", "cathode_electrolyte", "power_inverter_ic", "silicon_wafer", "copper_coil"],
        buysProducts: ["solarCharger", "homeInverter", "batteryPack", "evFastCharger", "solid_state_powerwall", "smartMeter", "solar_mounting_rail_kit", "industrial_switchgear_cabinet", "high_nickel_nmc_module"],
        rivalsWith: ["solartech_asia"],
        alliesWith: ["pacific_solar", "siam_tech"],
        strategyTh: "ลงทุนเมกะโปรเจกต์โซลาร์ฟาร์มและสถานีชาร์จ EV รับซื้อทั้งเซลล์แสงอาทิตย์ แบตเตอรี่ และตู้ Powerwall"
      },
      {
        id: "pacific_solar",
        nameTh: "บจก. แปซิฟิก โซลาร์ แอนด์ ลิเธียม เพาเวอร์",
        symbol: "PSOLAR",
        sector: "energy",
        sectorTh: "เหมืองลิเธียม โซลาร์เซลล์ และแบตเตอรี่",
        originTh: "นิคมอีสเทิร์นซีบอร์ด ระยอง",
        tierTh: "ซัพพลายเออร์พลังงานและแร่แบตเตอรี่",
        roles: ["supplier", "client", "partner"],
        relationshipMode: "cordial",
        baseTrust: 53,
        marketSharePct: 7.0,
        strength: 61,
        cashMillionBaht: 380,
        pricePremium: 0.05,
        paymentDays: 1,
        sellsMaterials: ["lithium_brine_ore", "cathode_electrolyte", "solar_cell", "battery", "power_inverter_ic", "copper_coil"],
        buysMaterials: ["metallurgical_silicon", "silicon_wafer", "cathode_electrolyte", "heat_sink"],
        buysProducts: ["homeInverter", "solid_state_powerwall"],
        rivalsWith: ["solartech_asia"],
        alliesWith: ["green_power", "shenzhen_semi"],
        strategyTh: "นำเข้าแร่ลิเธียมและผลิตเซลล์พลังงาน พร้อมรับซื้อแผ่นซิลิคอนเวเฟอร์และสารแคโทดจากโรงงานในไทย"
      },
      {
        id: "solartech_asia",
        nameTh: "บจก. โซลาร์เทค เอเชีย แอนด์ เพาเวอร์กริด",
        symbol: "STECH-E",
        sector: "energy",
        sectorTh: "พลังงานแสงอาทิตย์และอินเวอร์เตอร์",
        originTh: "ฉะเชิงเทรา",
        tierTh: "คู่แข่งสายพลังงานสะอาด",
        roles: ["competitor", "client"],
        relationshipMode: "rival",
        baseTrust: 44,
        marketSharePct: 7.5,
        strength: 62,
        cashMillionBaht: 310,
        pricePremium: 0.04,
        paymentDays: 1,
        sellsMaterials: ["heat_sink"],
        buysMaterials: ["silicon_wafer", "solar_cell", "battery", "power_inverter_ic"],
        buysProducts: ["solarCharger", "evFastCharger"],
        rivalsWith: ["green_power", "pacific_solar"],
        alliesWith: ["apex_ind"],
        strategyTh: "แข่งขันประมูลโครงการโซลาร์รูฟท็อปกับกรีนพาวเวอร์ และรับซื้อชิปกำลังไฟฟ้า IGBT ไปประกอบ"
      },
      {
        id: "biomed_siam",
        nameTh: "บมจ. สยามไบโอเมด แอนด์ เมดิคัล ดีไวซ์",
        symbol: "SBIOMED",
        sector: "biomed",
        sectorTh: "เครื่องมือแพทย์และโภชนเภสัชชีวภาพ",
        originTh: "อุทยานวิทยาศาสตร์ ปทุมธานี",
        tierTh: "เครือโรงพยาบาลและนวัตกรรมการแพทย์",
        roles: ["client", "partner", "supplier"],
        relationshipMode: "partner",
        baseTrust: 61,
        marketSharePct: 6.5,
        strength: 63,
        cashMillionBaht: 490,
        pricePremium: 0.09,
        paymentDays: 1,
        sellsMaterials: ["probiotic_culture", "raw_extract", "foil_pouch", "optical_lens"],
        buysMaterials: ["probiotic_culture", "raw_extract", "optical_lens", "sensor", "microchip", "foil_pouch", "glass_bottle"],
        buysProducts: ["synbiotic_medical_drink", "vital_signs_monitor", "probioticElixir", "functionalShot"],
        rivalsWith: ["apex_ind"],
        alliesWith: ["cp_health", "tokyo_elec"],
        strategyTh: "จ่ายราคาพรีเมียมสูงสุดสำหรับเครื่องมอนิเตอร์สัญญาณชีพ โภชนเภสัชซินไบโอติกส์ และหัวเชื้อชีวภาพบริสุทธิ์"
      },
      {
        id: "siam_aero_robotics",
        nameTh: "บจก. สยาม แอโรสเปซ แอนด์ ออโตโนมัส โรโบติกส์",
        symbol: "SAERO",
        sector: "aerospace_robotics",
        sectorTh: "อากาศยานไร้คนขับและหุ่นยนต์อุตสาหกรรม",
        originTh: "นิคมการบินภาคตะวันออก อู่ตะเภา",
        tierTh: "ผู้นำดีพเทคและโลจิสติกส์ทางอากาศ",
        roles: ["client", "partner", "competitor"],
        relationshipMode: "cordial",
        baseTrust: 59,
        marketSharePct: 5.5,
        strength: 67,
        cashMillionBaht: 530,
        pricePremium: 0.1,
        paymentDays: 1,
        sellsMaterials: ["sensor", "casing"],
        buysMaterials: ["microchip", "battery", "sensor", "optical_lens", "polymer_resin", "copper_coil", "pcb"],
        buysProducts: ["autonomous_cargo_drone", "servoActuator", "ai_edge_module", "visionCamera"],
        rivalsWith: ["apex_ind", "titan_elec"],
        alliesWith: ["tokyo_elec", "green_power"],
        strategyTh: "พัฒนาฝูงโดรนขนส่งและแขนกลอัจฉริยะในเขต EEC รับซื้อชิป แบตเตอรี่ลิเธียม และโดรนสำเร็จรูปราคาสูง"
      },
      {
        id: "petro_chem_siam",
        nameTh: "บมจ. มาบตาพุด ปิโตรเคมี แอนด์ โพลีเมอร์",
        symbol: "MPETRO",
        sector: "automotive",
        sectorTh: "ปิโตรเคมี เม็ดพลาสติก และวัสดุศาสตร์",
        originTh: "นิคมมาบตาพุด ระยอง",
        tierTh: "ผู้ผลิตปิโตรเคมีต้นน้ำ-กลางน้ำ",
        roles: ["supplier", "client", "competitor"],
        relationshipMode: "neutral",
        baseTrust: 54,
        marketSharePct: 6.0,
        strength: 65,
        cashMillionBaht: 580,
        pricePremium: 0.04,
        paymentDays: 1,
        sellsMaterials: ["crude_petro_feedstock", "natural_latex", "polymer_resin", "foil_pouch", "pack_carton", "timber_bamboo_log"],
        buysMaterials: ["natural_latex", "polymer_resin", "refined_palm_oil", "foil_pouch"],
        buysProducts: ["premium_cooking_oil", "smartMeter", "iotController"],
        rivalsWith: ["thai_organic"],
        alliesWith: ["eastern_auto", "apex_ind"],
        strategyTh: "ป้อนสารตั้งต้นปิโตรเคมีและเม็ดเรซินให้โรงงานทั่วประเทศ และรับซื้อน้ำมันปาล์มบริสุทธิ์ไปผลิตไบโอพลาสติก"
      },
      {
        id: "metro_retail",
        nameTh: "บมจ. นครหลวง ดิสทริบิวชั่น แอนด์ โลจิสติกส์",
        symbol: "METRO",
        sector: "general",
        sectorTh: "ศูนย์ค้าส่งและเครือข่ายกระจายสินค้า",
        originTh: "กรุงเทพฯ / บางนา-ตราด",
        tierTh: "ศูนย์ค้าส่งทั่วประเทศ",
        roles: ["client", "partner"],
        relationshipMode: "cordial",
        baseTrust: 54,
        marketSharePct: 5.0,
        strength: 56,
        cashMillionBaht: 410,
        pricePremium: 0.03,
        paymentDays: 0,
        sellsMaterials: ["pack_carton", "glass_bottle", "foil_pouch"],
        buysMaterials: ["pack_carton", "foil_pouch", "glass_bottle", "artisan_flour", "refined_sugar_syrup"],
        buysProducts: ["speaker", "lamp", "herbalDrink", "solarCharger", "probioticElixir", "artisan_bakery", "pastry_croissant_box", "ready_meal_box"],
        rivalsWith: ["cp_health"],
        alliesWith: ["siam_naturals", "siam_tech"],
        strategyTh: "รับซื้อสินค้าอุปโภคบริโภคและบรรจุภัณฑ์ล็อตใหญ่ด้วยเงินสดทันใจ (COD) เพื่อกระจายสู่ร้านค้าทั่วประเทศ"
      },
      {
        id: "apex_ind",
        nameTh: "บมจ. เอเพ็กซ์ อินดัสเตรียล โฮลดิ้งส์ กรุ๊ป",
        symbol: "APEX",
        sector: "multi",
        sectorTh: "กลุ่มอุตสาหกรรมข้ามชาติครบวงจร",
        originTh: "กรุงเทพฯ / ชลบุรี",
        tierTh: "คู่แข่งกลุ่มทุนยักษ์ใหญ่",
        roles: ["competitor", "client"],
        relationshipMode: "rival",
        baseTrust: 40,
        marketSharePct: 11.0,
        strength: 74,
        cashMillionBaht: 750,
        pricePremium: 0.05,
        paymentDays: 1,
        sellsMaterials: ["metal_sheet", "casing"],
        buysMaterials: ["silicon_wafer", "microchip", "battery", "power_inverter_ic", "cathode_electrolyte"],
        buysProducts: ["ai_edge_module", "solid_state_powerwall", "autonomous_cargo_drone"],
        rivalsWith: ["siam_tech", "asia_autoparts", "biomed_siam", "siam_aero_robotics"],
        alliesWith: ["solartech_asia", "petro_chem_siam"],
        strategyTh: "กลุ่มทุนใหญ่ที่แข่งขันในหลายอุตสาหกรรม แต่ยังต้องพึ่งพาการสั่งซื้อแผ่นเวเฟอร์และชิปขั้นสูงจากผู้ผลิตที่มีแล็บ R&D"
      },
      {
        id: "nusantara_nickel",
        nameTh: "บจก. นูซันตารา นิกเกิล แอนด์ อะลูมินา อินโดนีเซีย",
        symbol: "NUSAN",
        sector: "energy",
        sectorTh: "เหมืองนิกเกิล บ็อกไซต์ และวัสดุแบตเตอรี่อาเซียน",
        originTh: "สุลาเวสี อินโดนีเซีย / ท่าเรือแหลมฉบัง",
        tierTh: "ยักษ์ใหญ่แร่แบตเตอรี่และอะลูมินาอาเซียน",
        roles: ["supplier", "client", "partner"],
        relationshipMode: "cordial",
        baseTrust: 57,
        marketSharePct: 8.0,
        strength: 66,
        cashMillionBaht: 520,
        pricePremium: 0.06,
        paymentDays: 1,
        sellsMaterials: ["bauxite_ore", "nickel_cobalt_matte", "alumina_billet", "coke_reducing_flux", "crude_palm", "copper_iron_ore"],
        buysMaterials: ["alumina_billet", "aluminum_extrusion_profile", "structural_steel_plate", "cathode_electrolyte"],
        buysProducts: ["solar_mounting_rail_kit", "industrial_switchgear_cabinet", "high_nickel_nmc_module", "evFastCharger"],
        rivalsWith: ["pacific_solar", "siam_metal"],
        alliesWith: ["green_power", "asia_autoparts"],
        strategyTh: "ป้อนแร่บ็อกไซต์และนิกเกิลแมตต์จากอินโดนีเซีย พร้อมรับซื้อโปรไฟล์อะลูมิเนียม ตู้สวิตช์เกียร์ และโมดูลแบต NMC ไปขยายนิคมถลุงแร่"
      },
      {
        id: "pilbara_resources",
        nameTh: "บจก. พิลบารา ไอรอน แอนด์ ลิเธียม รีซอร์สเซส (ออสเตรเลีย)",
        symbol: "PILBARA",
        sector: "automotive",
        sectorTh: "เหมืองแร่เหล็ก ถ่านโค้กฟลักซ์ และลิเธียมออสเตรเลีย",
        originTh: "พอร์ตเฮดแลนด์ ออสเตรเลีย / ท่าเรือมาบตาพุด",
        tierTh: "ผู้ส่งออกแร่เหล็กและลิเธียมระดับโลก",
        roles: ["supplier", "client", "partner"],
        relationshipMode: "cordial",
        baseTrust: 60,
        marketSharePct: 9.5,
        strength: 71,
        cashMillionBaht: 640,
        pricePremium: 0.07,
        paymentDays: 1,
        sellsMaterials: ["iron_ore", "bauxite_ore", "lithium_brine_ore", "coke_reducing_flux", "structural_steel_plate", "silica_bauxite_ore"],
        buysMaterials: ["structural_steel_plate", "aluminum_extrusion_profile", "truck_tire", "wire_harness"],
        buysProducts: ["ev_battery_tray_assembly", "industrial_switchgear_cabinet", "warehouse_agv_bot", "autonomous_cargo_drone"],
        rivalsWith: ["siam_metal"],
        alliesWith: ["tokyo_elec", "siam_aero_robotics"],
        strategyTh: "ส่งออกแร่เหล็กพิลบารา แร่ลิเธียม และถ่านโค้กฟลักซ์เกรดพรีเมียม และสั่งซื้อหุ่นยนต์ AGV ตู้สวิตช์เกียร์ และถาดแบตเตอรี่ EV ไปใช้ในเหมืองอัตโนมัติ"
      },
      {
        id: "bharat_biotech_it",
        nameTh: "บมจ. ภารตะ ไบโอเทค แอนด์ สมาร์ตกริด ซิสเต็มส์",
        symbol: "BHARAT",
        sector: "biomed",
        sectorTh: "เวชภัณฑ์คลีนรูม สมาร์ตกริด และซอฟต์แวร์เอเชียใต้",
        originTh: "ไฮเดอราบัด & มุมไบ อินเดีย",
        tierTh: "พันธมิตรเวชภัณฑ์และโครงข่ายไฟฟ้าอินเดีย",
        roles: ["client", "partner", "competitor"],
        relationshipMode: "partner",
        baseTrust: 59,
        marketSharePct: 7.5,
        strength: 64,
        cashMillionBaht: 480,
        pricePremium: 0.08,
        paymentDays: 1,
        sellsMaterials: ["pharma_saline_water", "raw_extract", "wheat_grain"],
        buysMaterials: ["pharma_saline_water", "probiotic_culture", "aluminum_extrusion_profile", "structural_steel_plate", "solar_cell"],
        buysProducts: ["sterile_wound_dressing", "medical_saline_iv", "vital_signs_monitor", "solar_mounting_rail_kit", "industrial_switchgear_cabinet", "lfp_grid_rack"],
        rivalsWith: ["apex_ind"],
        alliesWith: ["biomed_siam", "green_power"],
        strategyTh: "นำเข้าชุดรางโซลาร์ ตู้สวิตช์เกียร์ และเวชภัณฑ์ปลอดเชื้อจากไทยไปป้อนโครงการโรงพยาบาลและสมาร์ตกริดทั่วเอเชียใต้"
      },
      {
        id: "singapore_port_3pl",
        nameTh: "บจก. สิงคโปร์ สเตรทส์ พอร์ต แอนด์ โคลด์เชน 3PL",
        symbol: "SGPORT",
        sector: "general",
        sectorTh: "ท่าเรือคอนเทนเนอร์ คลังห้องเย็น 3PL และการค้าข้ามชาติ",
        originTh: "ท่าเรือจูร่ง สิงคโปร์ / แหลมฉบัง",
        tierTh: "ฮับโลจิสติกส์และเทรดดิ้งอาเซียน",
        roles: ["client", "partner", "supplier"],
        relationshipMode: "partner",
        baseTrust: 63,
        marketSharePct: 8.5,
        strength: 68,
        cashMillionBaht: 590,
        pricePremium: 0.08,
        paymentDays: 0,
        sellsMaterials: ["foil_pouch", "pack_carton", "diesel_liter", "microchip", "silicon_wafer"],
        buysMaterials: ["bakery_dough_butter", "milled_rice", "alumina_billet", "aluminum_extrusion_profile", "nickel_cobalt_matte"],
        buysProducts: ["pastry_croissant_box", "probiotic_yogurt_cup", "cold_chain_temp_logger", "solar_mounting_rail_kit", "high_nickel_nmc_module"],
        rivalsWith: ["metro_retail"],
        alliesWith: ["cp_health", "siam_tech"],
        strategyTh: "รับซื้ออาหารแช่แข็ง เวชภัณฑ์ ดาต้าล็อกเกอร์ห้องเย็น และโมดูลพลังงานด้วยเงินสดทันใจ (COD) เพื่อกระจายผ่านฮับท่าเรือสิงคโปร์"
      }
    ],
    clients: [
      { id: "siam_tech", nameTh: "บมจ. สยามเทค โฮลดิ้งส์", sector: "tech", tierTh: "องค์กรมหาชน (SET100)", baseTrust: 55, pricePremium: 0.04, paymentDays: 1, preferredProducts: ["speaker", "lamp", "braided_fast_charge_kit", "iotController", "smartMeter", "visionCamera", "ai_edge_module"] },
      { id: "asia_autoparts", nameTh: "บจก. เอเชีย ออโต้พาร์ท แอนด์ อีวี", sector: "automotive", tierTh: "ผู้ผลิตยานยนต์ OEM", baseTrust: 52, pricePremium: 0.06, paymentDays: 1, preferredProducts: ["autoSensor", "evController", "batteryPack", "servoActuator", "ev_suspension_kit"] },
      { id: "cp_health", nameTh: "บมจ. เจริญผล ฟู้ดแอนด์เฮลท์", sector: "food", tierTh: "เครือค้าปลีกและสุขภาพ", baseTrust: 56, pricePremium: 0.03, paymentDays: 0, preferredProducts: ["artisan_bakery", "pastry_croissant_box", "plant_based_meat", "premium_cooking_oil", "ready_meal_box", "dairy_protein_shake", "herbalDrink", "energyProtein", "functionalShot", "probioticElixir"] },
      { id: "green_power", nameTh: "บจก. กรีนพาวเวอร์ โซลูชั่นส์ เอเชีย", sector: "energy", tierTh: "พันธมิตรพลังงานสะอาด BOI", baseTrust: 50, pricePremium: 0.07, paymentDays: 1, preferredProducts: ["solarCharger", "homeInverter", "batteryPack", "evFastCharger", "solid_state_powerwall"] },
      { id: "tokyo_elec", nameTh: "บจก. โตเกียว อิเล็กทรอนิกส์ (ประเทศไทย)", sector: "tech", tierTh: "คู่ค้าส่งออกญี่ปุ่น", baseTrust: 60, pricePremium: 0.08, paymentDays: 1, preferredProducts: ["iotController", "autoSensor", "smartMeter", "visionCamera", "servoActuator", "autonomous_cargo_drone"] },
      { id: "metro_retail", nameTh: "บมจ. นครหลวง ดิสทริบิวชั่น", sector: "general", tierTh: "ศูนย์ค้าส่งทั่วประเทศ", baseTrust: 48, pricePremium: 0.02, paymentDays: 0, preferredProducts: ["speaker", "lamp", "braided_fast_charge_kit", "artisan_chili_paste_jar", "herbalDrink", "solarCharger", "probioticElixir", "artisan_bakery", "pastry_croissant_box"] },
      { id: "biomed_siam", nameTh: "บมจ. สยามไบโอเมด แอนด์ เมดิคัล ดีไวซ์", sector: "biomed", tierTh: "เครือโรงพยาบาลและนวัตกรรมการแพทย์", baseTrust: 61, pricePremium: 0.09, paymentDays: 1, preferredProducts: ["synbiotic_medical_drink", "vital_signs_monitor", "probioticElixir", "functionalShot"] },
      { id: "siam_aero_robotics", nameTh: "บจก. สยาม แอโรสเปซ แอนด์ ออโตโนมัส โรโบติกส์", sector: "aerospace_robotics", tierTh: "ผู้นำดีพเทคและโลจิสติกส์ทางอากาศ", baseTrust: 59, pricePremium: 0.1, paymentDays: 1, preferredProducts: ["autonomous_cargo_drone", "servoActuator", "ai_edge_module", "visionCamera"] },
      { id: "nusantara_nickel", nameTh: "บจก. นูซันตารา นิกเกิล แอนด์ อะลูมินา", sector: "energy", tierTh: "ยักษ์ใหญ่แร่แบตเตอรี่อาเซียน", baseTrust: 57, pricePremium: 0.06, paymentDays: 1, preferredProducts: ["solar_mounting_rail_kit", "industrial_switchgear_cabinet", "high_nickel_nmc_module", "evFastCharger"] },
      { id: "pilbara_resources", nameTh: "บจก. พิลบารา ไอรอน แอนด์ ลิเธียม รีซอร์สเซส", sector: "automotive", tierTh: "เหมืองแร่เหล็กและลิเธียมออสเตรเลีย", baseTrust: 60, pricePremium: 0.07, paymentDays: 1, preferredProducts: ["ev_battery_tray_assembly", "industrial_switchgear_cabinet", "warehouse_agv_bot", "autonomous_cargo_drone"] },
      { id: "bharat_biotech_it", nameTh: "บมจ. ภารตะ ไบโอเทค แอนด์ สมาร์ตกริด", sector: "biomed", tierTh: "พันธมิตรเวชภัณฑ์และสมาร์ตกริดอินเดีย", baseTrust: 59, pricePremium: 0.08, paymentDays: 1, preferredProducts: ["sterile_wound_dressing", "medical_saline_iv", "vital_signs_monitor", "solar_mounting_rail_kit", "industrial_switchgear_cabinet", "lfp_grid_rack"] },
      { id: "singapore_port_3pl", nameTh: "บจก. สิงคโปร์ สเตรทส์ พอร์ต แอนด์ โคลด์เชน", sector: "general", tierTh: "ฮับโลจิสติกส์และเทรดดิ้งอาเซียน", baseTrust: 63, pricePremium: 0.08, paymentDays: 0, preferredProducts: ["pastry_croissant_box", "probiotic_yogurt_cup", "cold_chain_temp_logger", "solar_mounting_rail_kit", "high_nickel_nmc_module"] }
    ],
    suppliers: [
      { id: "shenzhen_semi", nameTh: "บจก. เซินเจิ้น เซมิคอนดักเตอร์ ซัพพลาย", originTh: "เซินเจิ้น / ท่าเรือแหลมฉบัง", specialtyTh: "แผงวงจร ชิป เลนส์ออปติคัล เวเฟอร์ และแร่ซิลิกา", materials: ["pcb", "microchip", "led", "sensor", "heat_sink", "optical_lens", "power_inverter_ic", "silica_bauxite_ore", "metallurgical_silicon", "silicon_wafer"], baseTrust: 50, creditTermsTh: "COD / Net 7" },
      { id: "siam_metal", nameTh: "บจก. สยามเมทัล แอนด์ ฮาร์เนส อินดัสทรี", originTh: "นิคมอมตะซิตี้ ชลบุรี", specialtyTh: "แร่เหล็ก-ทองแดง แผ่นโลหะ เหล็กกล้า อะลูมิเนียม และชุดสายไฟ", materials: ["copper_iron_ore", "iron_ore", "silica_bauxite_ore", "bauxite_ore", "coke_reducing_flux", "alumina_billet", "structural_steel_plate", "nickel_cobalt_matte", "aluminum_extrusion_profile", "lithium_brine_ore", "phosphate_potash_rock", "casing", "driver", "metal_sheet", "wire_harness", "heat_sink", "copper_coil", "polymer_resin", "natural_latex", "truck_tire"], baseTrust: 55, creditTermsTh: "Net 7" },
      { id: "nusantara_nickel", nameTh: "บจก. นูซันตารา นิกเกิล แอนด์ อะลูมินา อินโดนีเซีย", originTh: "สุลาเวสี / แหลมฉบัง", specialtyTh: "แร่บ็อกไซต์ นิกเกิล-โคบอลต์แมตต์ แท่งอะลูมินา และปาล์มดิบ", materials: ["bauxite_ore", "nickel_cobalt_matte", "alumina_billet", "coke_reducing_flux", "crude_palm", "copper_iron_ore"], baseTrust: 57, creditTermsTh: "Net 7" },
      { id: "pilbara_resources", nameTh: "บจก. พิลบารา ไอรอน แอนด์ ลิเธียม รีซอร์สเซส", originTh: "พิลบารา ออสเตรเลีย / มาบตาพุด", specialtyTh: "แร่เหล็กธรรมชาติ แร่ลิเธียม ถ่านโค้กฟลักซ์ และเหล็กกล้าแผ่น", materials: ["iron_ore", "bauxite_ore", "lithium_brine_ore", "coke_reducing_flux", "structural_steel_plate", "silica_bauxite_ore"], baseTrust: 60, creditTermsTh: "Net 14" },
      { id: "thai_organic", nameTh: "สหกรณ์เกษตรอินทรีย์และสารสกัดไทย", originTh: "นครปฐม / เชียงใหม่", specialtyTh: "ผลผลิตเกษตรต้นน้ำ แป้งโม่ โดว์เนย สารสกัด และบรรจุภัณฑ์", materials: ["rice_seed", "cane_stalk_seed", "palm_seedling", "soybean_seed", "raw_water_m3", "npk_fertilizer", "organic_compost", "paddy_grain", "milled_rice", "rice_bran_husk", "crude_palm", "raw_cane", "soybean_crop", "fresh_milk_soy", "timber_bamboo_log", "raw_extract", "glass_bottle", "pack_carton", "probiotic_culture", "foil_pouch", "artisan_flour", "refined_palm_oil", "refined_sugar_syrup", "bakery_dough_butter"], baseTrust: 58, creditTermsTh: "COD / Net 7" },
      { id: "pacific_solar", nameTh: "บจก. แปซิฟิก โซลาร์ แอนด์ ลิเธียม เพาเวอร์", originTh: "นิคมอีสเทิร์นซีบอร์ด ระยอง", specialtyTh: "แร่ลิเธียม แคโทดอิเล็กโทรไลต์ แผงโซลาร์เซลล์ และแบตเตอรี่", materials: ["lithium_brine_ore", "cathode_electrolyte", "solar_cell", "battery", "power_inverter_ic", "copper_coil"], baseTrust: 48, creditTermsTh: "Net 14" },
      { id: "petro_chem_siam", nameTh: "บมจ. มาบตาพุด ปิโตรเคมี แอนด์ โพลีเมอร์", originTh: "นิคมมาบตาพุด ระยอง", specialtyTh: "สารตั้งต้นปิโตรเคมี น้ำยางพารา เม็ดพลาสติกเรซิน และฟอยล์", materials: ["crude_petro_feedstock", "diesel_liter", "truck_tire", "natural_latex", "polymer_resin", "foil_pouch", "pack_carton", "timber_bamboo_log", "raw_water_m3"], baseTrust: 54, creditTermsTh: "Net 7" }
    ],
    competitors: [
      { id: "titan_elec", nameTh: "บมจ. ไททัน อิเล็กทรอนิกส์", sector: "tech", sectorTh: "อิเล็กทรอนิกส์และสมาร์ตเทค", marketSharePct: 22.0, strength: 68, strategyTh: "เน้นกำลังการผลิตขนาดใหญ่และตัดราคา" },
      { id: "eastern_auto", nameTh: "บจก. อีสเทิร์น ออโต้เทค", sector: "automotive", sectorTh: "ชิ้นส่วนยานยนต์และ EV", marketSharePct: 19.0, strength: 64, strategyTh: "เน้นมาตรฐาน QC เข้มงวดและสัญญาระยะยาว" },
      { id: "siam_naturals", nameTh: "บมจ. สยามเนเชอรัล ฟู้ดส์", sector: "food", sectorTh: "อาหารและเครื่องดื่มสุขภาพ", marketSharePct: 18.0, strength: 58, strategyTh: "เน้นกระจายสินค้าไวและออกสินค้าใหม่ต่อเนื่อง" },
      { id: "solartech_asia", nameTh: "บจก. โซลาร์เทค เอเชีย", sector: "energy", sectorTh: "พลังงานสะอาดและโซลาร์", marketSharePct: 16.5, strength: 62, strategyTh: "เน้นนวัตกรรม R&D และสิทธิประโยชน์ BOI" },
      { id: "apex_ind", nameTh: "บมจ. เอเพ็กซ์ อินดัสเตรียล กรุ๊ป", sector: "multi", sectorTh: "กลุ่มอุตสาหกรรมครบวงจร", marketSharePct: 14.5, strength: 74, strategyTh: "เน้นดึงตัวช่างฝีมือและแย่งประมูลดีล B2B" }
    ],
    governmentPolicies: [
      { id: "boi_smart_industry", nameTh: "บัตรส่งเสริมการลงทุน BOI อุตสาหกรรมเป้าหมาย", summaryTh: "ลดภาระภาษีนิติบุคคลและหนุนการวิจัย R&D อุตสาหกรรมอัจฉริยะ (+แต้มวิจัยไวขึ้น)", corporateTaxPct: 10, demandMultiplier: 1.08, greenBonus: 0 },
      { id: "export_stimulus", nameTh: "มาตรการกระตุ้นการส่งออกและโลจิสติกส์ EEC", summaryTh: "บริษัทคู่ค้า B2B สั่งซื้อล็อตใหญ่ขึ้นและจ่ายชำระเงินเร็วขึ้น", corporateTaxPct: 15, demandMultiplier: 1.15, greenBonus: 0 },
      { id: "green_esg_subsidy", nameTh: "มาตรการสนับสนุนโรงงานสีเขียวและพลังงานสะอาด (ESG)", summaryTh: "อุดหนุนสินค้ากลุ่มพลังงานสะอาด/เกษตรอินทรีย์ และเพิ่มชื่อเสียงองค์กรรักษ์โลก", corporateTaxPct: 12, demandMultiplier: 1.1, greenBonus: 2 },
      { id: "labor_welfare_push", nameTh: "นโยบายยกระดับคุณภาพชีวิตและทักษะแรงงานอุตสาหกรรม", summaryTh: "ส่งเสริมการฝึกอบรมทักษะในศูนย์ฝึกและเพิ่มขวัญกำลังใจพนักงานเมื่อมีสวัสดิการ", corporateTaxPct: 15, demandMultiplier: 1.04, greenBonus: 0 },
      { id: "industrial_stability", nameTh: "นโยบายรักษาเสถียรภาพเศรษฐกิจและซัพพลายเชน", summaryTh: "ตรึงราคาวัตถุดิบต้นน้ำและส่งเสริมสินเชื่อดอกเบี้ยต่ำสำหรับโรงงาน", corporateTaxPct: 15, demandMultiplier: 1.05, greenBonus: 0 }
    ],
    stockIndices: [
      { id: "SET_IND", symbol: "SET-IND", nameTh: "ดัชนีอุตสาหกรรมรวม (Siam Industrial Index)", baseValue: 1420.0 },
      { id: "TECH", symbol: "SIAM-TECH", nameTh: "กลุ่มเซมิคอนดักเตอร์ อิเล็กทรอนิกส์ และ AI", baseValue: 860.0 },
      { id: "AUTO", symbol: "SIAM-AUTO", nameTh: "กลุ่มยานยนต์ไฟฟ้า EV และโรโบติกส์", baseValue: 740.0 },
      { id: "FOOD", symbol: "SIAM-AGRO", nameTh: "กลุ่มเกษตรแปรรูป เบเกอรี่ และไบโอเมด", baseValue: 690.0 },
      { id: "GREEN", symbol: "SIAM-ESG", nameTh: "กลุ่มพลังงานสะอาดและแบตเตอรี่โซลิดสเตต", baseValue: 910.0 }
    ],
    ceoDirectives: [
      { id: "sales_blitz", nameTh: "ลุยยอดขายและขยายฐานคู่ค้า B2B (Commercial Blitz)", descTh: "เน้นเจรจาปิดดีล B2B ราคาดีและเร่งส่งมอบออเดอร์ลูกค้า" },
      { id: "cash_shield", nameTh: "รัดเข็มขัดรักษาสภาพคล่อง (Cash Runway Shield)", descTh: "สำรองกระแสเงินสด สั่งวัตถุดิบแบบ Just-in-Time และเร่งเก็บเงิน Invoice" },
      { id: "zero_defect", nameTh: "มาตรฐานช่างฝีมือไร้ของเสีย (Zero-Defect Quality)", descTh: "เน้นความประณีตในสายการผลิตและการตรวจ QC ลดอัตราของเสีย" },
      { id: "wellness_care", nameTh: "ดูแลบุคลากรและสร้างขวัญกำลังใจ (People & Retention)", descTh: "ป้องกันภาวะหมดไฟ สนับสนุนการพักผ่อนและรั้งตัวคนเก่ง" },
      { id: "rnd_sprint", nameTh: "เร่งเครื่องวิจัยและแตกไลน์อุตสาหกรรม (R&D Innovation Sprint)", descTh: "ทุ่มทรัพยากรวิจัยปลดล็อกการผลิตชิ้นส่วนไฮเทค (Tier 3) และสินค้าใหม่" },
      { id: "scale_expansion", nameTh: "ขยายอาณาจักรนิคมและกำลังการผลิต (Industrial Scale-Up)", descTh: "ลงทุนก่อสร้างอาคารใหม่ ขยายไลน์การผลิต และขายวัตถุดิบกลางน้ำส่ง B2B" }
    ]
  });

  const MOTIVE_FACTOR_LABELS = deepFreeze({
    effort: "ความทุ่มเทและแรงกายที่ใช้",
    delay: "ความเร่งด่วนของงานที่ค้าง",
    skillFit: "ความถนัดตรงสายงาน",
    change: "ความท้าทายและการปรับเปลี่ยน",
    risk: "การบริหารความเสี่ยง",
    hunger: "การเติมพลังด้วยมื้ออาหาร",
    social: "การพูดคุยและเชื่อมสัมพันธ์กับทีม",
    voice: "การสะท้อนปัญหาและออกความเห็น",
    craft: "ความประณีตและการสร้างผลงานด้วยฝีมือ",
    duty: "ความรับผิดชอบต่อหน้าที่และออเดอร์",
    routine: "ความคุ้นเคยและระเบียบแบบแผน",
    help: "การช่วยเหลือเกื้อกูลเพื่อนร่วมทีม",
    novelty: "การคิดค้นและเรียนรู้สิ่งใหม่",
    energy: "การฟื้นฟูพลังงานร่างกาย",
    stress: "การผ่อนคลายความเครียดสะสม",
    health: "การดูแลสุขภาพร่างกาย",
    burnout: "การป้องกันภาวะหมดไฟ",
    focus: "สมาธิและความต่อเนื่องในการทำงาน",
    mood: "อารมณ์และขวัญกำลังใจ",
    achievement: "คุณค่าความสำเร็จในงาน",
    security: "คุณค่าความมั่นคงปลอดภัย",
    income: "คุณค่ารายได้และผลตอบแทน",
    autonomy: "คุณค่าความเป็นอิสระในการทำงาน",
    fairness: "คุณค่าความเป็นธรรมในองค์กร",
    belonging: "คุณค่าการเป็นส่วนหนึ่งของทีม",
    learning: "คุณค่าการเรียนรู้และพัฒนาตน",
    meaning: "คุณค่าความหมายของงานที่ทำ",
    workLifeBalance: "คุณค่าสมดุลชีวิตและการพักผ่อน",
    recognition: "คุณค่าการได้รับการยอมรับและเกียรติภูมิ",
    family: "คุณค่าการดูแลครอบครัว",
    comfort: "คุณค่าคุณภาพชีวิตและความเป็นอยู่",
    humility: "ความถ่อมตน",
    optimism: "การมองโลกในแง่บวก",
    care: "ความเอื้ออาทรต่อผู้อื่น",
    stewardship: "ความรับผิดชอบต่อส่วนรวม",
    influence: "การมีบทบาทกำหนดทิศทาง",
    tradition: "การเคารพธรรมเนียมปฏิบัติ",
    variety: "ความหลากหลายของประสบการณ์",
    craftsmanship: "คุณค่าของฝีมือและความประณีต",
    sociability: "นิสัยชอบเข้าสังคม",
    conscientiousness: "นิสัยรับผิดชอบและมีวินัย",
    agreeableness: "นิสัยให้ความร่วมมือ",
    openness: "นิสัยเปิดรับสิ่งใหม่",
    riskTaking: "นิสัยกล้าตัดสินใจเสี่ยง",
    stressReactivity: "ความไวต่อความกดดัน",
    assertiveness: "ความกล้าแสดงออก",
    patience: "ความอดทนและใจเย็น",
    integrity: "ความซื่อสัตย์สุจริต",
    adaptability: "ความยืดหยุ่นในการปรับตัว",
    ambition: "แรงผลักดันและความทะเยอทะยาน",
    prudence: "ความรอบคอบก่อนลงมือ"
  });

  function hashStr(str) {
    let h = 2166136261 >>> 0;
    const s = String(str || "");
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function pickDet(arr, seedStr) {
    if (!arr || !arr.length) return "";
    return arr[hashStr(seedStr) % arr.length];
  }

  function getCareerStep(roleId, level) {
    const ladder = CAREER_LADDERS[roleId] || CAREER_LADDERS.assembler;
    const lv = Math.max(1, Math.min(ladder.length, Number(level) || 1));
    return ladder[lv - 1] || ladder[0];
  }

  function getNextCareerStep(roleId, level) {
    const ladder = CAREER_LADDERS[roleId] || CAREER_LADDERS.assembler;
    const lv = Math.max(1, Number(level) || 1);
    return lv < ladder.length ? ladder[lv] : null;
  }

  // Assign every employee to a specific 4-Tier Organizational Unit (Division -> Department -> Section -> Group/Line)
  function resolveOrgAssignment(roleId, level = 1, personId = "employee-1", constructedPlots = []) {
    const tree = ORG_TREE[roleId] || ORG_TREE.assembler;
    const dept = tree.departments[0];
    const sections = dept.sections || [];
    const h = hashStr(`${personId}:${roleId}`);

    let chosenSection = sections[0];
    if (roleId === "assembler" && sections.length >= 4) {
      // Map assembler sections to unlocked production lines when available
      const activeSecs = [sections[0]];
      if (constructedPlots.includes("prodLineB")) activeSecs.push(sections[1]);
      if (constructedPlots.includes("prodLineC")) activeSecs.push(sections[2]);
      if (constructedPlots.includes("prodLineD")) activeSecs.push(sections[3]);
      chosenSection = activeSecs[h % activeSecs.length] || sections[0];
    } else if (sections.length > 1) {
      chosenSection = sections[h % sections.length];
    }

    const groups = (chosenSection && chosenSection.groups) || [{ id: "grp_default", nameTh: "กลุ่มปฏิบัติการหลัก" }];
    const chosenGroup = groups[(h >>> 3) % groups.length] || groups[0];
    const tierSpec = LEVEL_TIERS[Math.max(1, Math.min(10, Number(level) || 1))] || LEVEL_TIERS[1];

    return {
      divisionId: tree.divisionId,
      divisionNameTh: tree.divisionNameTh,
      departmentId: dept.id,
      departmentNameTh: dept.nameTh,
      sectionId: chosenSection ? chosenSection.id : "sec_main",
      sectionNameTh: chosenSection ? chosenSection.nameTh : dept.nameTh,
      groupId: chosenGroup.id,
      groupNameTh: chosenGroup.nameTh,
      lineId: chosenGroup.lineId || null,
      gradeCode: tierSpec.gradeCode,
      tierNameTh: tierSpec.tierNameTh,
      chainRoleTh: tierSpec.chainRoleTh,
      reportsToLevel: tierSpec.reportsToLevel,
      orgPathTh: `${dept.nameTh} › ${chosenSection ? chosenSection.nameTh : ""} › ${chosenGroup.nameTh}`
    };
  }

  function createIdentity(seed, personId, baseName, roleId = "assembler") {
    const pid = String(personId || "employee-1");
    const preset = STARTER_IDENTITIES[pid];
    if (preset) {
      const nat = NATIONALITIES[preset.nationality] || NATIONALITIES.TH;
      const genderSymbol = preset.gender === "F" ? "♀" : "♂";
      const genderTh = preset.gender === "F" ? "หญิง" : "ชาย";
      const nickname = baseName || pid;
      const fullName = `${preset.firstName} ${preset.lastName}`;
      return {
        nationality: nat.id,
        nationalityTh: nat.nameTh,
        flag: nat.flag,
        codeTh: nat.codeTh,
        gender: preset.gender,
        genderTh,
        genderSymbol,
        age: preset.age,
        firstName: preset.firstName,
        lastName: preset.lastName,
        nickname,
        fullName,
        displayName: `${fullName} (${nickname})`,
        educationTh: preset.educationTh,
        hometownTh: preset.hometownTh
      };
    }

    const key = `${seed}:${pid}:${roleId}`;
    const h1 = hashStr(key + ":nat");
    const natOrder = ["TH", "JP", "CN", "VN", "MM", "EN"];
    let acc = 0;
    const roll = (h1 % 1000) / 1000;
    let chosenNatId = "TH";
    for (const nid of natOrder) {
      const w = (NATIONALITIES[nid].roleWeight && NATIONALITIES[nid].roleWeight[roleId]) || 0.05;
      acc += w;
      if (roll <= acc) {
        chosenNatId = nid;
        break;
      }
    }
    const nat = NATIONALITIES[chosenNatId] || NATIONALITIES.TH;
    const pool = NAME_POOLS[chosenNatId] || NAME_POOLS.TH;
    const gender = hashStr(key + ":gender") % 2 === 0 ? "M" : "F";
    const genderTh = gender === "F" ? "หญิง" : "ชาย";
    const genderSymbol = gender === "F" ? "♀" : "♂";
    const baseAgeMin = roleId === "engineer" || roleId === "coordinator" ? 25 : 21;
    const age = baseAgeMin + (hashStr(key + ":age") % 19);
    const firstName = pickDet(gender === "F" ? pool.femaleFirst : pool.maleFirst, key + ":first");
    const lastName = pickDet(pool.surnames, key + ":last");
    const nickname = baseName || pickDet(gender === "F" ? pool.nicknamesFemale : pool.nicknamesMale, key + ":nick");
    const fullName = `${firstName} ${lastName}`;
    return {
      nationality: nat.id,
      nationalityTh: nat.nameTh,
      flag: nat.flag,
      codeTh: nat.codeTh,
      gender,
      genderTh,
      genderSymbol,
      age,
      firstName,
      lastName,
      nickname,
      fullName,
      displayName: `${fullName} (${nickname})`,
      educationTh: pickDet(nat.educations, key + ":edu"),
      hometownTh: pickDet(nat.hometowns, key + ":home")
    };
  }

  function translateMotiveFactor(factor, extraLabels = {}) {
    const raw = String(factor || "").trim();
    if (!raw) return "ความเหมาะสมตามสถานการณ์";
    if (MOTIVE_FACTOR_LABELS[raw]) return MOTIVE_FACTOR_LABELS[raw];
    if (extraLabels && extraLabels[raw]) return extraLabels[raw];

    const parts = raw.split(":");
    const prefix = parts.length > 1 ? parts[0] : "";
    const key = parts.length > 1 ? parts.slice(1).join(":") : raw;

    if (MOTIVE_FACTOR_LABELS[key]) return MOTIVE_FACTOR_LABELS[key];
    if (extraLabels && extraLabels[key]) {
      return prefix === "value" ? `คุณค่า${extraLabels[key]}` : extraLabels[key];
    }
    return "ดุลยพินิจตามความเหมาะสมของงาน";
  }

  const INDUSTRY_SKILL_TEMPLATES = deepFreeze({
    software: {
      id: "software",
      nameTh: "วิศวกรรมซอฟต์แวร์และระบบ",
      aptitudes: {
        analytical: 0.45,
        memory: 0.2,
        learningSpeed: 0.2,
        precision: 0.15,
      },
    },
    construction: {
      id: "construction",
      nameTh: "งานก่อสร้างและโครงสร้าง",
      aptitudes: {
        strength: 0.35,
        stamina: 0.3,
        spatial: 0.2,
        dexterity: 0.15,
      },
    },
    architecture: {
      id: "architecture",
      nameTh: "สถาปัตยกรรมและผังโครงสร้าง",
      aptitudes: {
        spatial: 0.4,
        creativity: 0.3,
        analytical: 0.2,
        precision: 0.1,
      },
    },
    driving: {
      id: "driving",
      nameTh: "การขับขี่และควบคุมยานพาหนะ",
      aptitudes: {
        spatial: 0.35,
        composure: 0.25,
        sensory: 0.2,
        dexterity: 0.2,
      },
    },
    design: {
      id: "design",
      nameTh: "การออกแบบและสุนทรียศาสตร์",
      aptitudes: {
        creativity: 0.45,
        sensory: 0.3,
        spatial: 0.15,
        emotionalInsight: 0.1,
      },
    },
    customerCare: {
      id: "customerCare",
      nameTh: "บริการและดูแลลูกค้า",
      aptitudes: {
        emotionalInsight: 0.4,
        communication: 0.35,
        composure: 0.25,
      },
    },
    aerospaceEngineering: {
      id: "aerospaceEngineering",
      nameTh: "วิศวกรรมอวกาศ",
      aptitudes: {
        analytical: 0.25,
        numerical: 0.2,
        spatial: 0.2,
        problemSensitivity: 0.15,
        precision: 0.2,
      },
    },
    missionControl: {
      id: "missionControl",
      nameTh: "ควบคุมภารกิจและระบบวิกฤต",
      aptitudes: {
        attention: 0.25,
        uncertaintyReasoning: 0.25,
        composure: 0.2,
        communication: 0.15,
        problemSensitivity: 0.15,
      },
    },
    automotiveEngineering: {
      id: "automotiveEngineering",
      nameTh: "ออกแบบระบบยานยนต์",
      aptitudes: {
        analytical: 0.3,
        spatial: 0.25,
        numerical: 0.2,
        creativity: 0.15,
        precision: 0.1,
      },
    },
    vehicleMaintenance: {
      id: "vehicleMaintenance",
      nameTh: "วิเคราะห์และซ่อมยานยนต์",
      aptitudes: {
        problemSensitivity: 0.25,
        dexterity: 0.25,
        hearing: 0.15,
        visualAcuity: 0.15,
        analytical: 0.2,
      },
    },
    financialAnalysis: {
      id: "financialAnalysis",
      nameTh: "วิเคราะห์การเงินและการลงทุน",
      aptitudes: {
        numerical: 0.35,
        uncertaintyReasoning: 0.3,
        analytical: 0.2,
        verbal: 0.15,
      },
    },
    riskManagement: {
      id: "riskManagement",
      nameTh: "บริหารความเสี่ยง",
      aptitudes: {
        uncertaintyReasoning: 0.35,
        problemSensitivity: 0.25,
        numerical: 0.2,
        composure: 0.2,
      },
    },
    animalHusbandry: {
      id: "animalHusbandry",
      nameTh: "ดูแลและสังเกตพฤติกรรมสัตว์",
      aptitudes: {
        attention: 0.2,
        emotionalInsight: 0.2,
        problemSensitivity: 0.2,
        dexterity: 0.15,
        sensory: 0.15,
        stamina: 0.1,
      },
    },
    veterinaryCare: {
      id: "veterinaryCare",
      nameTh: "ความรู้และหัตถการสัตวแพทย์",
      aptitudes: {
        analytical: 0.2,
        memory: 0.2,
        dexterity: 0.2,
        precision: 0.2,
        problemSensitivity: 0.2,
      },
    },
    foodPreparation: {
      id: "foodPreparation",
      nameTh: "ประกอบอาหารและควบคุมรสชาติ",
      aptitudes: {
        tasteSmell: 0.25,
        dexterity: 0.2,
        organization: 0.15,
        creativity: 0.15,
        colorDiscrimination: 0.1,
        coordination: 0.15,
      },
    },
    foodSafety: {
      id: "foodSafety",
      nameTh: "สุขอนามัยและความปลอดภัยอาหาร",
      aptitudes: {
        problemSensitivity: 0.25,
        precision: 0.25,
        attention: 0.2,
        memory: 0.15,
        sensory: 0.15,
      },
    },
    structuralEngineering: {
      id: "structuralEngineering",
      nameTh: "วิศวกรรมโครงสร้าง",
      aptitudes: {
        numerical: 0.25,
        spatial: 0.25,
        analytical: 0.3,
        problemSensitivity: 0.2,
      },
    },
    heavyEquipment: {
      id: "heavyEquipment",
      nameTh: "ควบคุมเครื่องจักรหนัก",
      aptitudes: {
        controlPrecision: 0.3,
        reactionSpeed: 0.2,
        spatial: 0.2,
        coordination: 0.15,
        attention: 0.15,
      },
    },
    fieldConstruction: {
      id: "fieldConstruction",
      nameTh: "งานก่อสร้างภาคสนาม",
      aptitudes: {
        strength: 0.2,
        stamina: 0.2,
        balance: 0.2,
        flexibility: 0.15,
        coordination: 0.15,
        spatial: 0.1,
      },
    },
    medicine: {
      id: "medicine",
      nameTh: "ความรู้และดูแลสุขภาพ",
      aptitudes: {
        analytical: 0.25,
        memory: 0.25,
        problemSensitivity: 0.2,
        emotionalInsight: 0.15,
        precision: 0.15,
      },
    },
    law: {
      id: "law",
      nameTh: "กฎหมายและการให้เหตุผล",
      aptitudes: {
        verbal: 0.35,
        analytical: 0.25,
        memory: 0.2,
        communication: 0.2,
      },
    },
    education: {
      id: "education",
      nameTh: "การสอนและอธิบาย",
      aptitudes: {
        verbal: 0.2,
        communication: 0.25,
        emotionalInsight: 0.25,
        speechClarity: 0.15,
        organization: 0.15,
      },
    },
    agriculture: {
      id: "agriculture",
      nameTh: "เพาะปลูกและดูแลระบบเกษตร",
      aptitudes: {
        problemSensitivity: 0.2,
        organization: 0.2,
        sensory: 0.2,
        stamina: 0.2,
        analytical: 0.2,
      },
    },
    creativeProduction: {
      id: "creativeProduction",
      nameTh: "ผลิตสื่อและศิลปะ",
      aptitudes: {
        creativity: 0.3,
        colorDiscrimination: 0.2,
        hearing: 0.15,
        communication: 0.2,
        sensory: 0.15,
      },
    },
    logisticsPlanning: {
      id: "logisticsPlanning",
      nameTh: "วางแผนโลจิสติกส์",
      aptitudes: {
        organization: 0.3,
        numerical: 0.2,
        spatial: 0.2,
        attention: 0.15,
        perceptualSpeed: 0.15,
      },
    },
    energyOperations: {
      id: "energyOperations",
      nameTh: "ปฏิบัติการพลังงานและระบบสาธารณูปโภค",
      aptitudes: {
        attention: 0.25,
        controlPrecision: 0.2,
        problemSensitivity: 0.2,
        composure: 0.2,
        reactionSpeed: 0.15,
      },
    },
  });

  // Headcount Quota Limits across all 10 Career Levels (Scales realistically from 5 to 500 NPCs)
  const CAREER_QUOTAS = deepFreeze({
    1: { level: 1, gradeCode: "G1", nameTh: "พนักงานปฏิบัติการระดับต้น (Operator/Staff)", quotaType: "unlimited" },
    2: { level: 2, gradeCode: "G2", nameTh: "พนักงานชำนาญการ/อาวุโส (Senior/Specialist)", maxRatio: 0.45, minDeptSize: 2 },
    3: { level: 3, gradeCode: "G3", nameTh: "หัวหน้ากลุ่มในไลน์ผลิต/กลุ่มงาน (Group/Line Leader)", baseSlots: 1, expandThreshold: 4, spanOfControl: 5 },
    4: { level: 4, gradeCode: "G4", nameTh: "หัวหน้าหมวด/หัวหน้ากะ (Section Supervisor/Foreman)", baseSlots: 1, expandThreshold: 8, spanOfControl: 8 },
    5: { level: 5, gradeCode: "G5", nameTh: "รองหัวหน้าแผนก (Asst. Department Manager)", baseSlots: 1, expandThreshold: 10, spanOfControl: 10 },
    6: { level: 6, gradeCode: "G6", nameTh: "หัวหน้าแผนก/ผู้จัดการแผนก (Department Manager)", baseSlots: 1, expandThreshold: 12, spanOfControl: 14 },
    7: { level: 7, gradeCode: "G7", nameTh: "รองหัวหน้าฝ่าย/รองผู้จัดการโรงงาน (Deputy Division Director)", baseSlots: 1, expandThreshold: 16, spanOfControl: 20 },
    8: { level: 8, gradeCode: "G8", nameTh: "หัวหน้าฝ่าย/ผู้อำนวยการฝ่าย/ผู้จัดการโรงงาน (Division Director/Plant GM)", baseSlots: 1, expandThreshold: 20, spanOfControl: 28 },
    9: { level: 9, gradeCode: "G9", nameTh: "รองกรรมการผู้จัดการใหญ่ C-Suite (EVP/CCO/CFO/CTO/COO)", baseSlots: 1, expandThreshold: 28, spanOfControl: 40 },
    10: { level: 10, gradeCode: "G10", nameTh: "ประธานเจ้าหน้าที่บริหารสูงสุด (Chief Executive Officer - CEO)", baseSlots: 1, maxCompanyWide: 1 }
  });

  // 5-Person Lean Startup Roster (สำหรับเริ่มตั้งบริษัทขนาดเล็ก 5 คน แล้วค่อยเติบโตสู่ระดับ 100-500 คน)
  const LEAN_STARTERS = deepFreeze([
    { name: "ธีร์", role: "coordinator", dailyWage: 35000 }, // CEO & ผู้ก่อตั้ง
    { name: "มิน", role: "sales", dailyWage: 38000 },        // ฝ่ายขาย B2B (ออฟฟิศ)
    { name: "ภัทร", role: "admin", dailyWage: 35000 },       // ฝ่ายจัดซื้อและบัญชี (ออฟฟิศ)
    { name: "ต้น", role: "assembler", dailyWage: 40000 },    // ช่างฝ่ายผลิต (โรงงาน)
    { name: "กานต์", role: "inspector", dailyWage: 36000 },  // ฝ่าย QC และช่วยงานคลัง (โรงงาน)
  ]);

  const defaults = {
    version: "1.2.0",
    skills: {
      sales: {
        id: "sales",
        nameTh: "การขายและเจรจาธุรกิจ B2B",
        aptitudes: {
          communication: 0.55,
          emotionalInsight: 0.25,
          organization: 0.1,
          composure: 0.1,
        },
      },
      admin: {
        id: "admin",
        nameTh: "จัดซื้อ บัญชี และซัพพลายเชน",
        aptitudes: { organization: 0.5, precision: 0.3, memory: 0.2 },
      },
      engineering: {
        id: "engineering",
        nameTh: "วิศวกรรม วิจัย และซ่อมบำรุง",
        aptitudes: {
          analytical: 0.4,
          creativity: 0.3,
          learningSpeed: 0.2,
          spatial: 0.1,
        },
      },
      assembly: {
        id: "assembly",
        nameTh: "การผลิตและประกอบชิ้นงาน",
        aptitudes: {
          dexterity: 0.45,
          precision: 0.25,
          stamina: 0.2,
          spatial: 0.1,
        },
      },
      quality: {
        id: "quality",
        nameTh: "ควบคุมและประกันคุณภาพ (QC/QA)",
        aptitudes: { precision: 0.5, analytical: 0.3, sensory: 0.2 },
      },
      logistics: {
        id: "logistics",
        nameTh: "คลังสินค้าและโลจิสติกส์ขนส่ง",
        aptitudes: {
          organization: 0.45,
          stamina: 0.25,
          strength: 0.15,
          spatial: 0.15,
        },
      },
      leadership: {
        id: "leadership",
        nameTh: "ภาวะผู้นำและบริหารองค์กร",
        aptitudes: {
          communication: 0.35,
          emotionalInsight: 0.35,
          organization: 0.15,
          composure: 0.15,
        },
      },
    },
    materials: {
      // === TIER 0: True Natural Primary Resources (7 ชนิด — ทรัพยากรธรรมชาติแท้จริงก่อนการเพาะปลูกหรือแปรรูป: แร่ หิน ทราย น้ำดิบ ปิโตรเลียมดิบ) ===
      silica_bauxite_ore: { id: "silica_bauxite_ore", nameTh: "ทรายควอตซ์ซิลิกาธรรมชาติจากแหล่งแร่ (SiO2 Ore)", unitCost: 3000, leadMinutes: 1440, tier: 0, tierCode: "T0_NATURAL", resourceClass: "natural_deposit", resourceOrigin: "mine_deposit", isTrueNaturalResource: true, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 3900 },
      bauxite_ore: { id: "bauxite_ore", nameTh: "แร่บ็อกไซต์อะลูมิเนียมธรรมชาติจากเหมือง (Alumina Ore)", unitCost: 2800, leadMinutes: 1440, tier: 0, tierCode: "T0_NATURAL", resourceClass: "natural_deposit", resourceOrigin: "mine_deposit", isTrueNaturalResource: true, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 3600 },
      copper_iron_ore: { id: "copper_iron_ore", nameTh: "แร่ทองแดงธรรมชาติคัดเกรดจากแหล่งธรณีวิทยา (CuFeS2 Copper Ore)", unitCost: 2600, leadMinutes: 1440, tier: 0, tierCode: "T0_NATURAL", resourceClass: "natural_deposit", resourceOrigin: "mine_deposit", isTrueNaturalResource: true, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 3400 },
      lithium_brine_ore: { id: "lithium_brine_ore", nameTh: "แร่ลิเธียมสปอดูมีนและน้ำเกลือแร่ธรรมชาติ", unitCost: 3600, leadMinutes: 1440, tier: 0, tierCode: "T0_NATURAL", resourceClass: "natural_deposit", resourceOrigin: "mine_deposit", isTrueNaturalResource: true, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 4700 },
      phosphate_potash_rock: { id: "phosphate_potash_rock", nameTh: "หินฟอสเฟตและแร่โพแทชธรรมชาติ (แร่แม่ปุ๋ยต้นน้ำ)", unitCost: 1800, leadMinutes: 1440, tier: 0, tierCode: "T0_NATURAL", resourceClass: "natural_deposit", resourceOrigin: "mine_deposit", isTrueNaturalResource: true, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 2400 },
      crude_petro_feedstock: { id: "crude_petro_feedstock", nameTh: "น้ำมันดิบธรรมชาติจากแหล่งปิโตรเลียม (Crude Oil Feedstock — ต้องกลั่นก่อนใช้)", unitCost: 2200, leadMinutes: 720, tier: 0, tierCode: "T0_NATURAL", resourceClass: "natural_deposit", resourceOrigin: "geological_well", isTrueNaturalResource: true, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 2900 },
      raw_water_m3: { id: "raw_water_m3", nameTh: "น้ำดิบธรรมชาติจากแหล่งน้ำผิวดินและบาดาล (ลบ.ม.)", unitCost: 600, leadMinutes: 360, tier: 0, tierCode: "T0_NATURAL", resourceClass: "environmental_flow", resourceOrigin: "water_intake", isTrueNaturalResource: true, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 900 },
      ambient_air_gas: { id: "ambient_air_gas", nameTh: "อากาศบริสุทธิ์สำหรับโรงแยกก๊าซอุตสาหกรรม (N2/O2 Feedstock)", unitCost: 500, leadMinutes: 240, tier: 0, tierCode: "T0_NATURAL", resourceClass: "environmental_flow", resourceOrigin: "air_separation", isTrueNaturalResource: true, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 800 },
      iron_ore: { id: "iron_ore", nameTh: "แร่เหล็กธรรมชาติคัดเกรดจากเหมือง (Fe2O3 Iron Ore)", unitCost: 2300, leadMinutes: 600, tier: 0, tierCode: "T0_NATURAL", resourceClass: "natural_mineral", resourceOrigin: "mining_extraction", isTrueNaturalResource: true, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 3200 },
      wheat_seed: { id: "wheat_seed", nameTh: "เมล็ดพันธุ์ข้าวสาลีคัดเกรดพร้อมงอก (ใช้เพาะปลูกในแปลงข้าวสาลี)", unitCost: 1700, leadMinutes: 480, tier: 1, tierCode: "T1_REFINED", resourceClass: "biological_seed", resourceOrigin: "seed_propagation", isTrueNaturalResource: false, isSeed: true, cropId: "winter_wheat", craftable: false, canPlantCrop: true, minResearch: 0, b2bSellPrice: 2400 },
      wheat_grain: { id: "wheat_grain", nameTh: "ข้าวสาลีเมล็ดเต็มจากการเพาะปลูก (โม่เป็นแป้งสาลีกลูเตนเบเกอรี่)", unitCost: 2300, leadMinutes: 540, tier: 1, tierCode: "T1_REFINED", resourceClass: "harvested_crop", resourceOrigin: "crop_cultivation", isTrueNaturalResource: false, craftable: false, canPlantCrop: false, canSaveSeed: true, seedMaterialId: "wheat_seed", minResearch: 0, b2bSellPrice: 3200 },
      nitrogen_ammonia: { id: "nitrogen_ammonia", nameTh: "ก๊าซไนโตรเจนและแอมโมเนียสังเคราะห์ (NH3 แม่ปุ๋ย N ต้นทาง)", unitCost: 2800, leadMinutes: 480, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "industrial_refining", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 0, b2bSellPrice: 3900 },
      wheat_flour: { id: "wheat_flour", nameTh: "แป้งสาลีกลูเตนสูงสำหรับเบเกอรี่และเพสตรี้ (โม่จากข้าวสาลี • ห้ามใช้ปลูก!)", unitCost: 4200, leadMinutes: 540, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "industrial_refining", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, cannotPlantAsSeed: true, minResearch: 0, b2bSellPrice: 5800 },
      pharma_saline_water: { id: "pharma_saline_water", nameTh: "น้ำบริสุทธิ์เภสัชกรรม RO/DI และสารละลายปลอดเชื้อ (Pharma Grade)", unitCost: 4600, leadMinutes: 540, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "industrial_refining", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 15, b2bSellPrice: 6400 },

      // === TIER 1A: Biological Seeds & Propagules (4 ชนิด — เมล็ดพันธุ์และต้นพันธุ์ชีวภาพสำหรับเพาะปลูกในแปลงเกษตร) ===
      rice_seed: { id: "rice_seed", nameTh: "เมล็ดพันธุ์ข้าวหอมมะลิคัดเกรดพร้อมงอก (ใช้เพาะปลูกในแปลงนา)", unitCost: 1400, leadMinutes: 720, tier: 1, tierCode: "T1_BIO_SEED", resourceClass: "biological_seed", resourceOrigin: "seed_selection", isTrueNaturalResource: false, craftable: false, canPlantCrop: true, targetCropId: "jasmine_rice", minResearch: 0, b2bSellPrice: 1900 },
      cane_stalk_seed: { id: "cane_stalk_seed", nameTh: "ท่อนพันธุ์อ้อยสดคัดตาพันธุ์ดี (ใช้เพาะปลูกในแปลงอ้อย)", unitCost: 1200, leadMinutes: 720, tier: 1, tierCode: "T1_BIO_SEED", resourceClass: "biological_seed", resourceOrigin: "seed_selection", isTrueNaturalResource: false, craftable: false, canPlantCrop: true, targetCropId: "sugarcane", minResearch: 0, b2bSellPrice: 1650 },
      palm_seedling: { id: "palm_seedling", nameTh: "ต้นกล้าปาล์มน้ำมันและกล้าไม้เศรษฐกิจ (ใช้ปลูกในแปลงสวน/ป่าปลูก)", unitCost: 1500, leadMinutes: 720, tier: 1, tierCode: "T1_BIO_SEED", resourceClass: "biological_seed", resourceOrigin: "seed_selection", isTrueNaturalResource: false, craftable: false, canPlantCrop: true, targetCropId: "oil_palm", minResearch: 0, b2bSellPrice: 2000 },
      soybean_seed: { id: "soybean_seed", nameTh: "เมล็ดพันธุ์ถั่วเหลืองและสมุนไพรออร์แกนิก (ใช้เพาะปลูกและบำรุงดิน)", unitCost: 1300, leadMinutes: 720, tier: 1, tierCode: "T1_BIO_SEED", resourceClass: "biological_seed", resourceOrigin: "seed_selection", isTrueNaturalResource: false, craftable: false, canPlantCrop: true, targetCropId: "soy_herb", minResearch: 0, b2bSellPrice: 1800 },

      // === TIER 1B: Cultivated Agricultural, Livestock & Plantation Outputs (7 ชนิด — เกิดจากวงจรเพาะปลูก/ปศุสัตว์ ไม่ใช่ทรัพยากรธรรมชาติ T0!) ===
      paddy_grain: { id: "paddy_grain", nameTh: "ข้าวเปลือกหอมมะลิจากการเพาะปลูก (คัดเก็บเป็นเมล็ดพันธุ์ได้ / สีเป็นข้าวสารได้)", unitCost: 1800, leadMinutes: 720, tier: 1, tierCode: "T1_CULTIVATED_CROP", resourceClass: "agricultural_crop", resourceOrigin: "agricultural_cycle", isTrueNaturalResource: false, craftable: false, canPlantCrop: false, canSaveAsSeed: true, seedMaterialId: "rice_seed", minResearch: 0, b2bSellPrice: 2300 },
      crude_palm: { id: "crude_palm", nameTh: "ทะลายปาล์มน้ำมันสดจากการเพาะปลูก (สกัดเป็นน้ำมันปาล์มบริสุทธิ์)", unitCost: 2000, leadMinutes: 720, tier: 1, tierCode: "T1_CULTIVATED_CROP", resourceClass: "agricultural_crop", resourceOrigin: "agricultural_cycle", isTrueNaturalResource: false, craftable: false, canPlantCrop: false, canSaveAsSeed: true, seedMaterialId: "palm_seedling", minResearch: 0, b2bSellPrice: 2600 },
      raw_cane: { id: "raw_cane", nameTh: "ลำอ้อยสดจากการเพาะปลูก (คัดท่อนพันธุ์ได้ / หีบเป็นน้ำตาลได้)", unitCost: 1600, leadMinutes: 720, tier: 1, tierCode: "T1_CULTIVATED_CROP", resourceClass: "agricultural_crop", resourceOrigin: "agricultural_cycle", isTrueNaturalResource: false, craftable: false, canPlantCrop: false, canSaveAsSeed: true, seedMaterialId: "cane_stalk_seed", minResearch: 0, b2bSellPrice: 2100 },
      soybean_crop: { id: "soybean_crop", nameTh: "เมล็ดถั่วเหลืองสดจากการเพาะปลูก (คัดเมล็ดพันธุ์ได้ / สกัดโปรตีนและน้ำมันถั่วเหลือง)", unitCost: 1900, leadMinutes: 720, tier: 1, tierCode: "T1_CULTIVATED_CROP", resourceClass: "agricultural_crop", resourceOrigin: "agricultural_cycle", isTrueNaturalResource: false, craftable: false, canPlantCrop: false, canSaveAsSeed: true, seedMaterialId: "soybean_seed", minResearch: 0, b2bSellPrice: 2500 },
      fresh_milk_soy: { id: "fresh_milk_soy", nameTh: "น้ำนมโคสดแท้จากฟาร์มปศุสัตว์ (ผลิตจากการเลี้ยงฝูงโคนมด้วยอาหารและน้ำ)", unitCost: 2200, leadMinutes: 720, tier: 1, tierCode: "T1_CULTIVATED_CROP", resourceClass: "agricultural_crop", resourceOrigin: "livestock_husbandry", isTrueNaturalResource: false, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 2800 },
      natural_latex: { id: "natural_latex", nameTh: "น้ำยางพาราสดจากการกรีดสวนยางปลูก (ต้องดูแลแปลงยาง)", unitCost: 2400, leadMinutes: 720, tier: 1, tierCode: "T1_CULTIVATED_CROP", resourceClass: "agricultural_crop", resourceOrigin: "plantation_tapping", isTrueNaturalResource: false, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 3100 },
      timber_bamboo_log: { id: "timber_bamboo_log", nameTh: "ท่อนไม้เศรษฐกิจจากการตัดป่าปลูกหมุนเวียน (ตัดแล้วต้องปลูกทดแทน)", unitCost: 1400, leadMinutes: 720, tier: 1, tierCode: "T1_CULTIVATED_CROP", resourceClass: "agricultural_crop", resourceOrigin: "forestry_rotation", isTrueNaturalResource: false, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 1900 },

      // === TIER 1C & 1D: Milled Rice, Byproducts, Soil Fertilizers, Fleet Consumables & First-Stage Refined Materials (16 ชนิด) ===
      milled_rice: { id: "milled_rice", nameTh: "ข้าวสารหอมมะลิขัดสี (สีจากข้าวเปลือก • ห้ามใช้ปลูกเป็นเมล็ดพันธุ์!)", unitCost: 2900, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "rice_milling", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 0, b2bSellPrice: 3800 },
      rice_bran_husk: { id: "rice_bran_husk", nameTh: "รำข้าวและแกลบจากการสีข้าว (ผลพลอยได้ใช้หมักปุ๋ยและเลี้ยงโคนม)", unitCost: 900, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "byproduct_waste", resourceOrigin: "rice_milling", isTrueNaturalResource: false, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 1300 },
      npk_fertilizer: { id: "npk_fertilizer", nameTh: "ปุ๋ยธาตุอาหารหลัก N-P-K (ผลิตจากหินฟอสเฟต/โพแทชและน้ำดิบ)", unitCost: 2400, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "soil_input", resourceOrigin: "fertilizer_synthesis", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 0, b2bSellPrice: 3200 },
      organic_compost: { id: "organic_compost", nameTh: "ปุ๋ยหมักอินทรีย์ชีวภาพ (หมักจากรำข้าว/แกลบและน้ำดิบ)", unitCost: 1500, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "soil_input", resourceOrigin: "compost_fermentation", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 0, b2bSellPrice: 2100 },
      diesel_liter: { id: "diesel_liter", nameTh: "น้ำมันดีเซลหมุนเร็ว B7/ไบโอดีเซล (เชื้อเพลิงกองรถขนส่งและเครื่องจักร)", unitCost: 3200, leadMinutes: 360, tier: 1, tierCode: "T1_REFINED", resourceClass: "operational_consumable", resourceOrigin: "fuel_refining", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 0, b2bSellPrice: 4100 },
      truck_tire: { id: "truck_tire", nameTh: "ยางรถบรรทุกเรเดียลเสริมใยเหล็ก (อะไหล่กองรถขนส่ง B2B)", unitCost: 6200, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "operational_consumable", resourceOrigin: "tire_vulcanizing", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 10, b2bSellPrice: 8200 },
      artisan_flour: { id: "artisan_flour", nameTh: "แป้งข้าวหอมและแป้งธัญพืชโม่ละเอียด (แปรรูป T1 • ห้ามใช้ปลูกเป็นเมล็ดพันธุ์!)", unitCost: 4200, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "grain_grinding", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 0, b2bSellPrice: 5500 },
      refined_palm_oil: { id: "refined_palm_oil", nameTh: "น้ำมันปาล์มบริสุทธิ์และเนยขาวเบเกอรี่ (แปรรูป T1)", unitCost: 4500, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "oil_refining", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 0, b2bSellPrice: 5900 },
      refined_sugar_syrup: { id: "refined_sugar_syrup", nameTh: "น้ำตาลทรายบริสุทธิ์และไซรัปกลูโคส (แปรรูป T1)", unitCost: 3800, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "sugar_milling", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 0, b2bSellPrice: 5000 },
      raw_extract: { id: "raw_extract", nameTh: "สารสกัดสมุนไพรและโปรตีนถั่วเหลืองเข้มข้น (แปรรูป T1)", unitCost: 3500, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "vacuum_extraction", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 0, b2bSellPrice: 4600 },
      coke_reducing_flux: { id: "coke_reducing_flux", nameTh: "ถ่านโค้กโลหะวิทยาและหินปูนฟลักซ์ลดออกไซด์ (Metallurgical Coke & Limestone Flux T1)", unitCost: 2600, leadMinutes: 540, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "coke_calcination", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 0, b2bSellPrice: 3500 },
      alumina_billet: { id: "alumina_billet", nameTh: "แท่งอะลูมินาบริสุทธิ์และบิลเล็ตอะลูมิเนียม (Bayer Alumina & Hall-Héroult Billet T1)", unitCost: 5800, leadMinutes: 960, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "bayer_smelting", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 15, b2bSellPrice: 7800 },
      structural_steel_plate: { id: "structural_steel_plate", nameTh: "เหล็กกล้าแผ่นรีดร้อนโครงสร้างกำลังสูง (High-Strength Structural Steel Plate T1)", unitCost: 6200, leadMinutes: 960, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "blast_furnace", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 15, b2bSellPrice: 8400 },
      mineral_slag_mud: { id: "mineral_slag_mud", nameTh: "กากตะกรันเตาถลุงและโคลนแดงบอกไซต์ (Red Mud & Smelting Slag Byproduct — ต้องบำบัดหรือรีไซเคิล)", unitCost: 800, leadMinutes: 480, tier: 1, tierCode: "T1_REFINED", resourceClass: "byproduct_waste", resourceOrigin: "smelting_slag", isTrueNaturalResource: false, craftable: false, canPlantCrop: false, minResearch: 0, b2bSellPrice: 1200 },
      nickel_cobalt_matte: { id: "nickel_cobalt_matte", nameTh: "นิกเกิล-โคบอลต์แมตต์เกรดแบตเตอรี่ความบริสุทธิ์สูง (Battery-Grade Nickel-Cobalt Matte T1)", unitCost: 6600, leadMinutes: 1080, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "hpal_leaching", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 25, b2bSellPrice: 8900 },
      metal_sheet: { id: "metal_sheet", nameTh: "แผ่นโลหะและอะลูมิเนียมขึ้นรูป (แปรรูป T1)", unitCost: 7000, leadMinutes: 1440, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "ore_smelting", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 15, b2bSellPrice: 9100 },
      copper_coil: { id: "copper_coil", nameTh: "ขดลวดทองแดงเหนี่ยวนำเกรดอุตสาหกรรม (แปรรูป T1)", unitCost: 5500, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "ore_smelting", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 15, b2bSellPrice: 7200 },
      polymer_resin: { id: "polymer_resin", nameTh: "เม็ดพลาสติกวิศวกรรมและเรซินทนความร้อน (แปรรูป T1)", unitCost: 4000, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "polymer_synthesis", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 10, b2bSellPrice: 5300 },
      pack_carton: { id: "pack_carton", nameTh: "กล่องกระดาษลูกฟูกและบรรจุภัณฑ์มาตรฐาน (แปรรูป T1)", unitCost: 2000, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "pulp_converting", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 0, b2bSellPrice: 2700 },
      glass_bottle: { id: "glass_bottle", nameTh: "ขวดแก้วสุญญากาศและหลอดแก้วควอตซ์ (แปรรูป T1)", unitCost: 2500, leadMinutes: 720, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "glass_furnace", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 10, b2bSellPrice: 3300 },
      metallurgical_silicon: { id: "metallurgical_silicon", nameTh: "แท่งซิลิคอนบริสุทธิ์เกรดโลหะวิทยา MG-Si (แปรรูป T1)", unitCost: 5200, leadMinutes: 1440, tier: 1, tierCode: "T1_REFINED", resourceClass: "refined_material", resourceOrigin: "arc_furnace", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 35, b2bSellPrice: 6900 },

      // === TIER 2: Second-Stage Advanced Intermediates (9 ชนิด) ===
      bakery_dough_butter: { id: "bakery_dough_butter", nameTh: "โดว์ขนมปังหมักยีสต์และเนยเพสตรี้พร้อมอบ (กลางน้ำ T2)", unitCost: 5600, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", resourceClass: "intermediate_part", resourceOrigin: "dough_fermentation", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 25, b2bSellPrice: 7400 },
      probiotic_culture: { id: "probiotic_culture", nameTh: "หัวเชื้อจุลินทรีย์ชีวภาพและวิตามินสกัดเย็น (กลางน้ำ T2)", unitCost: 5000, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", resourceClass: "intermediate_part", resourceOrigin: "bio_fermentation", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 30, b2bSellPrice: 6600 },
      foil_pouch: { id: "foil_pouch", nameTh: "ซองฟอยล์สุญญากาศเกรดการแพทย์และอาหาร (กลางน้ำ T2)", unitCost: 2200, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", resourceClass: "intermediate_part", resourceOrigin: "foil_lamination", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 25, b2bSellPrice: 3000 },
      casing: { id: "casing", nameTh: "ตัวถังและโครงสร้างคอมโพสิต (กลางน้ำ T2)", unitCost: 5000, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", resourceClass: "intermediate_part", resourceOrigin: "cnc_molding", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 30, b2bSellPrice: 6500 },
      wire_harness: { id: "wire_harness", nameTh: "ชุดสายไฟแรงดันต่ำและขั้วต่อ (กลางน้ำ T2)", unitCost: 4500, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", resourceClass: "intermediate_part", resourceOrigin: "harness_crimping", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 35, b2bSellPrice: 5900 },
      aluminum_extrusion_profile: { id: "aluminum_extrusion_profile", nameTh: "โปรไฟล์อะลูมิเนียมอัดรีดชุบอโนไดซ์และรางโครงสร้างเบา (Anodized Aluminum Extrusion Profile T2)", unitCost: 7200, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", resourceClass: "intermediate_part", resourceOrigin: "cnc_extrusion", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 35, b2bSellPrice: 9600 },
      heat_sink: { id: "heat_sink", nameTh: "ครีบระบายความร้อนอะลูมิเนียม (กลางน้ำ T2)", unitCost: 4000, leadMinutes: 720, tier: 2, tierCode: "T2_INTERMEDIATE", resourceClass: "intermediate_part", resourceOrigin: "cnc_extrusion", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 40, b2bSellPrice: 5300 },
      optical_lens: { id: "optical_lens", nameTh: "เลนส์ออปติคัลและกระจกแซฟไฟร์ความละเอียดสูง (กลางน้ำ T2)", unitCost: 6500, leadMinutes: 1440, tier: 2, tierCode: "T2_INTERMEDIATE", resourceClass: "intermediate_part", resourceOrigin: "optics_polishing", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 75, b2bSellPrice: 8500 },
      cathode_electrolyte: { id: "cathode_electrolyte", nameTh: "สารแคโทดลิเธียมและอิเล็กโทรไลต์บริสุทธิ์ (กลางน้ำ T2)", unitCost: 6800, leadMinutes: 1440, tier: 2, tierCode: "T2_INTERMEDIATE", resourceClass: "intermediate_part", resourceOrigin: "battery_chemistry", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 85, b2bSellPrice: 8900 },
      silicon_wafer: { id: "silicon_wafer", nameTh: "แผ่นซิลิคอนเวเฟอร์เกรดเซมิคอนดักเตอร์ (กลางน้ำ T2)", unitCost: 7800, leadMinutes: 1440, tier: 2, tierCode: "T2_INTERMEDIATE", resourceClass: "intermediate_part", resourceOrigin: "ingot_slicing", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 65, b2bSellPrice: 10400 },

      // === TIER 3: Tech-Gated Sub-Assemblies & High-Tech Components (8 ชนิด) ===
      driver: { id: "driver", nameTh: "ดอกลำโพงและแอคชูเอเตอร์เสียง (ชิ้นส่วน T3)", unitCost: 6000, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", resourceClass: "high_tech_component", resourceOrigin: "acoustic_assembly", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 95, b2bSellPrice: 7900 },
      pcb: { id: "pcb", nameTh: "แผงวงจรพิมพ์หลายชั้น PCB (ชิ้นส่วน T3)", unitCost: 9000, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", resourceClass: "high_tech_component", resourceOrigin: "pcb_etching", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 105, b2bSellPrice: 11800 },
      led: { id: "led", nameTh: "โมดูลแสง SMD LED (ชิ้นส่วน T3)", unitCost: 7500, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", resourceClass: "high_tech_component", resourceOrigin: "opto_packaging", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 135, b2bSellPrice: 9800 },
      sensor: { id: "sensor", nameTh: "เซ็นเซอร์อัจฉริยะ MEMS/LiDAR (ชิ้นส่วน T3)", unitCost: 6000, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", resourceClass: "high_tech_component", resourceOrigin: "mems_fab", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 150, b2bSellPrice: 8000 },
      solar_cell: { id: "solar_cell", nameTh: "แผงโซลาร์เซลล์ประสิทธิภาพสูง (ชิ้นส่วน T3)", unitCost: 8500, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", resourceClass: "high_tech_component", resourceOrigin: "pv_coating", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 180, b2bSellPrice: 11200 },
      battery: { id: "battery", nameTh: "โมดูลแบตเตอรี่ลิเธียมความปลอดภัยสูง (ชิ้นส่วน T3)", unitCost: 9500, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", resourceClass: "high_tech_component", resourceOrigin: "cell_stacking", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 210, b2bSellPrice: 12600 },
      microchip: { id: "microchip", nameTh: "ชิปไมโครโพรเซสเซอร์ระดับนาโน (ชิ้นส่วน T3)", unitCost: 8500, leadMinutes: 720, tier: 3, tierCode: "T3_COMPONENT", resourceClass: "high_tech_component", resourceOrigin: "lithography_fab", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 250, b2bSellPrice: 11600 },
      power_inverter_ic: { id: "power_inverter_ic", nameTh: "ชิปควบคุมกำลังไฟฟ้า IGBT แรงดันสูง (ชิ้นส่วน T3)", unitCost: 9500, leadMinutes: 1440, tier: 3, tierCode: "T3_COMPONENT", resourceClass: "high_tech_component", resourceOrigin: "sic_module_fab", isTrueNaturalResource: false, craftable: true, canPlantCrop: false, minResearch: 290, b2bSellPrice: 12800 },
    },
    products: {
      speaker: {
        id: "speaker",
        nameTh: "ลำโพงบลูทูธ",
        bom: { pcb: 1, casing: 1, driver: 1 },
        assemblyMinutes: 40,
        qaMinutes: 12,
        packingMinutes: 6,
        priceMin: 75000,
        priceMax: 90000,
        researchRequired: 0,
        visualKey: "product.speaker",
        industry: "tech",
        industryNameTh: "เครื่องใช้ไฟฟ้าและเทคโนโลยี",
        productionMode: "smt_precision",
        preferredLine: "lineA"
      },
      lamp: {
        id: "lamp",
        nameTh: "โคมไฟปรับแสง",
        bom: { pcb: 1, casing: 1, led: 2, sensor: 1 },
        assemblyMinutes: 55,
        qaMinutes: 15,
        packingMinutes: 8,
        priceMin: 120000,
        priceMax: 145000,
        researchRequired: 300,
        visualKey: "product.lamp",
        industry: "tech",
        industryNameTh: "เครื่องใช้ไฟฟ้าและเทคโนโลยี",
        productionMode: "automated_modular",
        preferredLine: "lineA"
      },
      iotController: {
        id: "iotController",
        nameTh: "กล่องควบคุม IoT อุตสาหกรรม",
        bom: { pcb: 1, casing: 1, microchip: 1, sensor: 1 },
        assemblyMinutes: 45,
        qaMinutes: 15,
        packingMinutes: 8,
        priceMin: 110000,
        priceMax: 135000,
        researchRequired: 160,
        visualKey: "product.iotController",
        industry: "tech",
        industryNameTh: "เทคโนโลยีและระบบอัจฉริยะ",
        productionMode: "smt_precision",
        preferredLine: "lineB"
      },
      smartMeter: {
        id: "smartMeter",
        nameTh: "มิเตอร์ไฟฟ้าอัจฉริยะ Smart Grid",
        bom: { pcb: 1, microchip: 1, sensor: 1, casing: 1, wire_harness: 1 },
        assemblyMinutes: 50,
        qaMinutes: 18,
        packingMinutes: 8,
        priceMin: 130000,
        priceMax: 160000,
        researchRequired: 200,
        visualKey: "product.smartMeter",
        industry: "tech",
        industryNameTh: "เทคโนโลยีและระบบอัจฉริยะ",
        productionMode: "automated_modular",
        preferredLine: "lineB"
      },
      visionCamera: {
        id: "visionCamera",
        nameTh: "กล้อง AI ตรวจสอบคุณภาพอุตสาหกรรม (Machine Vision)",
        bom: { pcb: 1, microchip: 1, optical_lens: 2, polymer_resin: 1 },
        assemblyMinutes: 52,
        qaMinutes: 20,
        packingMinutes: 8,
        priceMin: 145000,
        priceMax: 180000,
        researchRequired: 280,
        visualKey: "product.visionCamera",
        industry: "tech",
        industryNameTh: "เทคโนโลยีและระบบอัจฉริยะ",
        productionMode: "smt_precision",
        preferredLine: "lineB"
      },
      autoSensor: {
        id: "autoSensor",
        nameTh: "โมดูลเซนเซอร์ตรวจจับยานยนต์",
        bom: { pcb: 1, metal_sheet: 1, wire_harness: 1, sensor: 1 },
        assemblyMinutes: 50,
        qaMinutes: 20,
        packingMinutes: 8,
        priceMin: 135000,
        priceMax: 165000,
        researchRequired: 140,
        visualKey: "product.autoSensor",
        industry: "automotive",
        industryNameTh: "ยานยนต์และชิ้นส่วนกลไก",
        productionMode: "cnc_mechanical",
        preferredLine: "lineA"
      },
      evController: {
        id: "evController",
        nameTh: "ชุดควบคุมมอเตอร์ไฟฟ้า EV",
        bom: { pcb: 1, metal_sheet: 2, wire_harness: 2, casing: 1 },
        assemblyMinutes: 65,
        qaMinutes: 25,
        packingMinutes: 10,
        priceMin: 180000,
        priceMax: 220000,
        researchRequired: 240,
        visualKey: "product.evController",
        industry: "automotive",
        industryNameTh: "ยานยนต์และชิ้นส่วนกลไก",
        productionMode: "cnc_mechanical",
        preferredLine: "lineC"
      },
      batteryPack: {
        id: "batteryPack",
        nameTh: "แพ็กแบตเตอรี่โมดูลยานยนต์ EV",
        bom: { battery: 2, metal_sheet: 1, wire_harness: 2, heat_sink: 1 },
        assemblyMinutes: 70,
        qaMinutes: 25,
        packingMinutes: 12,
        priceMin: 210000,
        priceMax: 260000,
        researchRequired: 360,
        visualKey: "product.batteryPack",
        industry: "automotive",
        industryNameTh: "ยานยนต์และชิ้นส่วนกลไก",
        productionMode: "high_voltage_cell",
        preferredLine: "lineD"
      },
      servoActuator: {
        id: "servoActuator",
        nameTh: "แขนกลเซอร์โวมอเตอร์ความแม่นยำสูง (Robotic Servo)",
        bom: { metal_sheet: 2, copper_coil: 2, microchip: 1, wire_harness: 1 },
        assemblyMinutes: 60,
        qaMinutes: 22,
        packingMinutes: 10,
        priceMin: 175000,
        priceMax: 215000,
        researchRequired: 320,
        visualKey: "product.servoActuator",
        industry: "automotive",
        industryNameTh: "ยานยนต์และชิ้นส่วนกลไก",
        productionMode: "cnc_mechanical",
        preferredLine: "lineC"
      },
      herbalDrink: {
        id: "herbalDrink",
        nameTh: "เครื่องดื่มสมุนไพรอัดขวดสุญญากาศ",
        bom: { raw_extract: 2, glass_bottle: 2, pack_carton: 1 },
        assemblyMinutes: 25,
        qaMinutes: 18,
        packingMinutes: 12,
        priceMin: 95000,
        priceMax: 115000,
        researchRequired: 80,
        visualKey: "product.herbalDrink",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเครื่องดื่มสุขภาพ",
        productionMode: "cleanroom_batch",
        preferredLine: "lineA"
      },
      energyProtein: {
        id: "energyProtein",
        nameTh: "โปรตีนอัดแท่งเสริมพลังงาน",
        bom: { raw_extract: 3, pack_carton: 2 },
        assemblyMinutes: 30,
        qaMinutes: 15,
        packingMinutes: 10,
        priceMin: 110000,
        priceMax: 130000,
        researchRequired: 180,
        visualKey: "product.energyProtein",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเครื่องดื่มสุขภาพ",
        productionMode: "cleanroom_batch",
        preferredLine: "lineB"
      },
      functionalShot: {
        id: "functionalShot",
        nameTh: "เครื่องดื่มสกัดเข้มข้นบูสต์ภูมิคุ้มกัน",
        bom: { raw_extract: 3, glass_bottle: 2, pack_carton: 1 },
        assemblyMinutes: 28,
        qaMinutes: 20,
        packingMinutes: 10,
        priceMin: 125000,
        priceMax: 150000,
        researchRequired: 260,
        visualKey: "product.functionalShot",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเครื่องดื่มสุขภาพ",
        productionMode: "cleanroom_batch",
        preferredLine: "lineD"
      },
      probioticElixir: {
        id: "probioticElixir",
        nameTh: "ซองเจลโพรไบโอติกส์และวิตามินสกัดเย็น (Bio-Gel Elixir)",
        bom: { probiotic_culture: 2, raw_extract: 1, foil_pouch: 2, pack_carton: 1 },
        assemblyMinutes: 32,
        qaMinutes: 20,
        packingMinutes: 10,
        priceMin: 135000,
        priceMax: 165000,
        researchRequired: 290,
        visualKey: "product.probioticElixir",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเครื่องดื่มสุขภาพ",
        productionMode: "cleanroom_batch",
        preferredLine: "lineD"
      },
      solarCharger: {
        id: "solarCharger",
        nameTh: "เครื่องชาร์จโซลาร์พกพา",
        bom: { solar_cell: 1, battery: 1, casing: 1, pcb: 1 },
        assemblyMinutes: 45,
        qaMinutes: 18,
        packingMinutes: 8,
        priceMin: 160000,
        priceMax: 195000,
        researchRequired: 220,
        visualKey: "product.solarCharger",
        industry: "energy",
        industryNameTh: "พลังงานสะอาดและรักษ์โลก",
        productionMode: "automated_modular",
        preferredLine: "lineB"
      },
      homeInverter: {
        id: "homeInverter",
        nameTh: "อินเวอร์เตอร์แปลงไฟโซลาร์รูฟท็อป",
        bom: { solar_cell: 1, pcb: 1, microchip: 1, heat_sink: 2, metal_sheet: 1 },
        assemblyMinutes: 60,
        qaMinutes: 22,
        packingMinutes: 10,
        priceMin: 195000,
        priceMax: 240000,
        researchRequired: 340,
        visualKey: "product.homeInverter",
        industry: "energy",
        industryNameTh: "พลังงานสะอาดและรักษ์โลก",
        productionMode: "high_voltage_cell",
        preferredLine: "lineC"
      },
      evFastCharger: {
        id: "evFastCharger",
        nameTh: "ตู้ชาร์จรถยนต์ไฟฟ้าความเร็วสูง (DC SuperCharger Cabinet)",
        bom: { power_inverter_ic: 2, copper_coil: 2, metal_sheet: 2, heat_sink: 2, wire_harness: 1 },
        assemblyMinutes: 75,
        qaMinutes: 26,
        packingMinutes: 12,
        priceMin: 240000,
        priceMax: 295000,
        researchRequired: 400,
        visualKey: "product.evFastCharger",
        industry: "energy",
        industryNameTh: "พลังงานสะอาดและรักษ์โลก",
        productionMode: "high_voltage_cell",
        preferredLine: "lineD"
      },
      artisan_bakery: {
        id: "artisan_bakery",
        familyId: "bakery_grain",
        nameTh: "ขนมปังโฮลเกรนและเบเกอรี่อบสดพรีเมียม (Artisan Whole-Grain Bakery)",
        bom: { artisan_flour: 2, refined_palm_oil: 1, refined_sugar_syrup: 1, pack_carton: 1 },
        assemblyMinutes: 30,
        qaMinutes: 12,
        packingMinutes: 8,
        priceMin: 98000,
        priceMax: 122000,
        researchRequired: 25,
        visualKey: "product.artisan_bakery",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเบเกอรี่ครบวงจร",
        productionMode: "continuous_food_bake",
        preferredLine: "lineA",
        chainId: "chain_grain_flour_bakery"
      },
      premium_cooking_oil: {
        id: "premium_cooking_oil",
        nameTh: "น้ำมันปาล์มโอเลอินบริสุทธิ์และไบโอเอสเทอร์ (Refined Olein & Bio-Ester)",
        bom: { refined_palm_oil: 2, glass_bottle: 2, pack_carton: 1 },
        assemblyMinutes: 28,
        qaMinutes: 14,
        packingMinutes: 8,
        priceMin: 92000,
        priceMax: 114000,
        researchRequired: 60,
        visualKey: "product.premium_cooking_oil",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเบเกอรี่ครบวงจร",
        productionMode: "milling_refining",
        preferredLine: "lineB",
        chainId: "chain_palm_oil_refinery"
      },
      ready_meal_box: {
        id: "ready_meal_box",
        nameTh: "ชุดอาหารพร้อมทานและพาสต้าธัญพืชพรีเมียม (Gourmet Ready Meal Box)",
        bom: { artisan_flour: 1, refined_palm_oil: 1, raw_extract: 1, foil_pouch: 2, pack_carton: 1 },
        assemblyMinutes: 35,
        qaMinutes: 15,
        packingMinutes: 10,
        priceMin: 118000,
        priceMax: 145000,
        researchRequired: 150,
        visualKey: "product.ready_meal_box",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเบเกอรี่ครบวงจร",
        productionMode: "continuous_food_bake",
        preferredLine: "lineB",
        chainId: "chain_grain_flour_bakery"
      },
      dairy_protein_shake: {
        id: "dairy_protein_shake",
        nameTh: "เครื่องดื่มเวย์โปรตีนและนมธัญพืชยูเอชที (Smart Dairy Protein Shake)",
        bom: { probiotic_culture: 1, refined_sugar_syrup: 1, glass_bottle: 2, pack_carton: 1 },
        assemblyMinutes: 28,
        qaMinutes: 16,
        packingMinutes: 8,
        priceMin: 105000,
        priceMax: 128000,
        researchRequired: 120,
        visualKey: "product.dairy_protein_shake",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเครื่องดื่มสุขภาพ",
        productionMode: "cleanroom_batch",
        preferredLine: "lineD",
        chainId: "chain_dairy_probiotic_bio"
      },
      ev_suspension_kit: {
        id: "ev_suspension_kit",
        nameTh: "ชุดยางแท่นเครื่องและโช้คอัพไฮดรอลิก EV (EV Elastomer & Suspension Kit)",
        bom: { polymer_resin: 2, metal_sheet: 2, copper_coil: 1, wire_harness: 1 },
        assemblyMinutes: 55,
        qaMinutes: 20,
        packingMinutes: 10,
        priceMin: 168000,
        priceMax: 205000,
        researchRequired: 210,
        visualKey: "product.ev_suspension_kit",
        industry: "automotive",
        industryNameTh: "ยานยนต์และชิ้นส่วนกลไก",
        productionMode: "cnc_mechanical",
        preferredLine: "lineC",
        chainId: "chain_latex_polymer_compound"
      },
      ai_edge_module: {
        id: "ai_edge_module",
        nameTh: "โมดูลประมวลผลชิป AI Edge อุตสาหกรรม (Industrial AI Edge Blade)",
        bom: { silicon_wafer: 2, pcb: 1, microchip: 1, copper_coil: 1, heat_sink: 1 },
        assemblyMinutes: 65,
        qaMinutes: 24,
        packingMinutes: 10,
        priceMin: 215000,
        priceMax: 265000,
        researchRequired: 350,
        visualKey: "product.ai_edge_module",
        industry: "tech",
        industryNameTh: "เทคโนโลยีและเซมิคอนดักเตอร์",
        productionMode: "semiconductor_fab",
        preferredLine: "lineD",
        chainId: "chain_silica_wafer_semicon"
      },
      pastry_croissant_box: {
        id: "pastry_croissant_box",
        nameTh: "ครัวซองต์เนยสดและเพสตรี้แช่แข็งเกรดส่งออก (Artisan Butter Croissant Box)",
        bom: { bakery_dough_butter: 2, refined_sugar_syrup: 1, foil_pouch: 1, pack_carton: 1 },
        assemblyMinutes: 32,
        qaMinutes: 14,
        packingMinutes: 8,
        priceMin: 112000,
        priceMax: 138000,
        researchRequired: 385,
        visualKey: "product.pastry_croissant_box",
        industry: "food",
        industryNameTh: "อาหารแปรรูปและเบเกอรี่ครบวงจร",
        productionMode: "continuous_food_bake",
        preferredLine: "lineA",
        chainId: "chain_flour_butter_dough"
      },
      plant_based_meat: {
        id: "plant_based_meat",
        nameTh: "เนื้อจากพืชและโปรตีนเกษตรพรีเมียม (Future Plant-Based Protein)",
        bom: { artisan_flour: 1, refined_palm_oil: 1, raw_extract: 2, foil_pouch: 1, pack_carton: 1 },
        assemblyMinutes: 36,
        qaMinutes: 16,
        packingMinutes: 9,
        priceMin: 128000,
        priceMax: 158000,
        researchRequired: 395,
        visualKey: "product.plant_based_meat",
        industry: "food",
        industryNameTh: "อาหารแห่งอนาคตและโปรตีนทางเลือก",
        productionMode: "continuous_food_bake",
        preferredLine: "lineB",
        chainId: "chain_grain_flour_bakery"
      },
      synbiotic_medical_drink: {
        id: "synbiotic_medical_drink",
        nameTh: "โภชนเภสัชซินไบโอติกส์และภูมิคุ้มกันทางการแพทย์ (Clinical Synbiotic Nutra)",
        bom: { probiotic_culture: 2, raw_extract: 2, glass_bottle: 2, foil_pouch: 1 },
        assemblyMinutes: 38,
        qaMinutes: 22,
        packingMinutes: 10,
        priceMin: 155000,
        priceMax: 192000,
        researchRequired: 410,
        visualKey: "product.synbiotic_medical_drink",
        industry: "biomed",
        industryNameTh: "ชีวการแพทย์และโภชนเภสัช (Bio-Med)",
        productionMode: "cleanroom_batch",
        preferredLine: "lineD",
        chainId: "chain_dairy_probiotic_bio"
      },
      vital_signs_monitor: {
        id: "vital_signs_monitor",
        nameTh: "เครื่องมอนิเตอร์สัญญาณชีพผู้ป่วยอัจฉริยะ (ICU Vital Signs Monitor)",
        bom: { microchip: 1, sensor: 2, optical_lens: 1, pcb: 1, casing: 1 },
        assemblyMinutes: 58,
        qaMinutes: 24,
        packingMinutes: 10,
        priceMin: 198000,
        priceMax: 245000,
        researchRequired: 430,
        visualKey: "product.vital_signs_monitor",
        industry: "biomed",
        industryNameTh: "เครื่องมือแพทย์และไบโอเซนเซอร์ (Bio-Med)",
        productionMode: "cleanroom_batch",
        preferredLine: "lineD",
        chainId: "chain_wafer_microchip_fab"
      },
      autonomous_cargo_drone: {
        id: "autonomous_cargo_drone",
        nameTh: "โดรนขนส่งสินค้าอุตสาหกรรมอัตโนมัติ (Autonomous Heavy Cargo UAV)",
        bom: { microchip: 2, battery: 2, copper_coil: 2, polymer_resin: 2, sensor: 2 },
        assemblyMinutes: 72,
        qaMinutes: 26,
        packingMinutes: 12,
        priceMin: 255000,
        priceMax: 315000,
        researchRequired: 450,
        visualKey: "product.autonomous_cargo_drone",
        industry: "aerospace_robotics",
        industryNameTh: "อากาศยานไร้คนขับและหุ่นยนต์อัตโนมัติ",
        productionMode: "cnc_mechanical",
        preferredLine: "lineC",
        chainId: "chain_wafer_microchip_fab"
      },
      probiotic_yogurt_cup: {
        id: "probiotic_yogurt_cup",
        nameTh: "โยเกิร์ตโพรไบโอติกส์หมักเชื้อสดถ้วยแช่เย็น (Live-Culture Probiotic Yogurt)",
        familyId: "dairy_fermented",
        tierStage: "established",
        domainId: "food_fermentation",
        industry: "food",
        industryNameTh: "อาหารและเครื่องดื่มเพื่อสุขภาพ",
        productionMode: "cleanroom_batch",
        bom: { fresh_milk_soy: 1, probiotic_culture: 1, refined_sugar_syrup: 1, pack_carton: 1 },
        assemblyMinutes: 28,
        qaMinutes: 14,
        packingMinutes: 10,
        priceMin: 34000,
        priceMax: 48000,
        researchRequired: 25,
      },
      wheat_grain_biscuit: {
        id: "wheat_grain_biscuit",
        nameTh: "บิสกิตข้าวสาลีโฮลเกรนอบกรอบเกรดพรีเมียม (Whole-Wheat Digestive Biscuit)",
        familyId: "bakery_grain",
        tierStage: "early",
        domainId: "food_fermentation",
        industry: "food",
        industryNameTh: "อาหารและเครื่องดื่มเพื่อสุขภาพ",
        productionMode: "continuous_food_bake",
        bom: { wheat_flour: 2, refined_sugar_syrup: 1, refined_palm_oil: 1, pack_carton: 1 },
        assemblyMinutes: 26,
        qaMinutes: 12,
        packingMinutes: 10,
        priceMin: 32000,
        priceMax: 45000,
        researchRequired: 15,
      },
      sterile_wound_dressing: {
        id: "sterile_wound_dressing",
        nameTh: "ชุดทำแผลและผ้าก๊อซเวชภัณฑ์ปลอดเชื้อมาตรฐานโรงพยาบาล (Sterile Wound Care Kit)",
        familyId: "clinical_sterile",
        tierStage: "established",
        domainId: "biomed_sterile",
        industry: "biomed",
        industryNameTh: "ชีวการแพทย์และเวชภัณฑ์คลีนรูม",
        productionMode: "cleanroom_batch",
        bom: { pharma_saline_water: 1, raw_extract: 1, foil_pouch: 2, pack_carton: 1 },
        assemblyMinutes: 30,
        qaMinutes: 18,
        packingMinutes: 12,
        priceMin: 42000,
        priceMax: 58000,
        researchRequired: 35,
      },
      medical_saline_iv: {
        id: "medical_saline_iv",
        nameTh: "น้ำเกลือทางการแพทย์และสารละลายปราศจากเชื้อ (Clinical Isotonic Saline IV)",
        familyId: "clinical_sterile",
        tierStage: "established",
        domainId: "biomed_sterile",
        industry: "biomed",
        industryNameTh: "ชีวการแพทย์และเวชภัณฑ์คลีนรูม",
        productionMode: "cleanroom_batch",
        bom: { pharma_saline_water: 2, glass_bottle: 1, foil_pouch: 1 },
        assemblyMinutes: 28,
        qaMinutes: 18,
        packingMinutes: 10,
        priceMin: 38000,
        priceMax: 54000,
        researchRequired: 30,
      },
      cold_chain_temp_logger: {
        id: "cold_chain_temp_logger",
        nameTh: "โมดูลวัดและบันทึกอุณหภูมิห้องเย็นอัจฉริยะ (Cold-Chain IoT Temp Data Logger)",
        familyId: "industrial_iot",
        tierStage: "established",
        domainId: "embedded_iot",
        industry: "electronics",
        industryNameTh: "อิเล็กทรอนิกส์และระบบสมองกลฝังตัว",
        productionMode: "smt_precision",
        bom: { pcb: 1, sensor: 1, battery: 1, casing: 1 },
        assemblyMinutes: 34,
        qaMinutes: 16,
        packingMinutes: 10,
        priceMin: 56000,
        priceMax: 76000,
        researchRequired: 40,
      },
      ev_traction_motor: {
        id: "ev_traction_motor",
        nameTh: "มอเตอร์ขับเคลื่อนยานยนต์ไฟฟ้ากำลังสูง (EV Permanent-Magnet Traction Motor)",
        familyId: "ev_powertrain",
        tierStage: "advanced",
        domainId: "metal_machining",
        industry: "automotive",
        industryNameTh: "ยานยนต์ไฟฟ้าและฮาร์ดแวร์ขนส่ง",
        productionMode: "high_voltage_cell",
        bom: { copper_coil: 2, metal_sheet: 2, wire_harness: 1, heat_sink: 1 },
        assemblyMinutes: 48,
        qaMinutes: 20,
        packingMinutes: 14,
        priceMin: 68000,
        priceMax: 92000,
        researchRequired: 75,
      },
      lfp_grid_rack: {
        id: "lfp_grid_rack",
        nameTh: "ตู้กักเก็บพลังงานแบตเตอรี่ LFP มาตรฐานโรงงาน (Industrial LFP Battery Rack)",
        familyId: "clean_energy_grid",
        tierStage: "advanced",
        domainId: "power_electronics",
        industry: "energy",
        industryNameTh: "พลังงานสะอาดและกริดอัจฉริยะ",
        productionMode: "high_voltage_cell",
        bom: { battery: 2, cathode_electrolyte: 1, pcb: 1, metal_sheet: 2 },
        assemblyMinutes: 52,
        qaMinutes: 22,
        packingMinutes: 15,
        priceMin: 82000,
        priceMax: 112000,
        researchRequired: 95,
      },
      warehouse_agv_bot: {
        id: "warehouse_agv_bot",
        nameTh: "หุ่นยนต์รถลากคลังสินค้าอัตโนมัติ AGV (Autonomous Warehouse AGV Robot)",
        familyId: "robotics_automation",
        tierStage: "advanced",
        domainId: "semiconductor_optics",
        industry: "automotive",
        industryNameTh: "หุ่นยนต์และระบบอัตโนมัติอุตสาหกรรม",
        productionMode: "high_voltage_cell",
        bom: { pcb: 1, sensor: 1, battery: 1, metal_sheet: 2, wire_harness: 1 },
        assemblyMinutes: 54,
        qaMinutes: 22,
        packingMinutes: 15,
        priceMin: 88000,
        priceMax: 120000,
        researchRequired: 110,
      },
      solid_state_powerwall: {
        id: "solid_state_powerwall",
        nameTh: "ตู้กักเก็บพลังงานโซลิดสเตตระดับโรงงาน (Solid-State Grid Powerwall)",
        bom: { power_inverter_ic: 2, battery: 2, cathode_electrolyte: 2, metal_sheet: 2, heat_sink: 2 },
        assemblyMinutes: 78,
        qaMinutes: 28,
        packingMinutes: 12,
        priceMin: 275000,
        priceMax: 340000,
        researchRequired: 470,
        visualKey: "product.solid_state_powerwall",
        industry: "energy",
        industryNameTh: "พลังงานสะอาดและกักเก็บพลังงานขั้นสูง",
        productionMode: "high_voltage_cell",
        preferredLine: "lineD",
        chainId: "chain_silica_wafer_semicon"
      },
      solar_mounting_rail_kit: {
        id: "solar_mounting_rail_kit",
        nameTh: "ชุดรางอะลูมิเนียมอัดรีดและโครงยึดโซลาร์รูฟท็อปทนการกัดกร่อน (Anodized Solar Mounting Rail Kit)",
        familyId: "clean_energy_grid",
        tierStage: "established",
        domainId: "metal_machining",
        industry: "energy",
        industryNameTh: "พลังงานสะอาดและกริดอัจฉริยะ",
        productionMode: "cnc_mechanical",
        preferredLine: "lineC",
        chainId: "chain_bauxite_aluminum_extrusion",
        bom: { aluminum_extrusion_profile: 2, structural_steel_plate: 1, pack_carton: 1 },
        assemblyMinutes: 38,
        qaMinutes: 16,
        packingMinutes: 10,
        priceMin: 64000,
        priceMax: 84000,
        researchRequired: 35
      },
      ev_battery_tray_assembly: {
        id: "ev_battery_tray_assembly",
        nameTh: "ถาดโครงสร้างอะลูมิเนียมกันกระแทกและเพลตหล่อเย็นแพ็กแบตเตอรี่ EV (EV Extruded Battery Tray & Cold-Plate)",
        familyId: "ev_powertrain",
        tierStage: "established",
        domainId: "metal_machining",
        industry: "automotive",
        industryNameTh: "ยานยนต์ไฟฟ้าและฮาร์ดแวร์ขนส่ง",
        productionMode: "cnc_mechanical",
        preferredLine: "lineC",
        chainId: "chain_bauxite_aluminum_extrusion",
        bom: { aluminum_extrusion_profile: 2, structural_steel_plate: 1, heat_sink: 1, polymer_resin: 1 },
        assemblyMinutes: 46,
        qaMinutes: 18,
        packingMinutes: 12,
        priceMin: 86000,
        priceMax: 112000,
        researchRequired: 55
      },
      industrial_switchgear_cabinet: {
        id: "industrial_switchgear_cabinet",
        nameTh: "ตู้สวิตช์เกียร์เหล็กกล้าและรางบัสบาร์ทองแดงควบคุมกำลังไฟฟ้าโรงงาน (HV Industrial Switchgear & Busbar Cabinet)",
        familyId: "clean_energy_grid",
        tierStage: "advanced",
        domainId: "power_electronics",
        industry: "energy",
        industryNameTh: "พลังงานสะอาดและกริดอัจฉริยะ",
        productionMode: "high_voltage_cell",
        preferredLine: "lineC",
        chainId: "chain_ore_smelting_metal",
        bom: { structural_steel_plate: 2, copper_coil: 2, wire_harness: 1, pcb: 1 },
        assemblyMinutes: 50,
        qaMinutes: 20,
        packingMinutes: 12,
        priceMin: 98000,
        priceMax: 128000,
        researchRequired: 80
      },
      high_nickel_nmc_module: {
        id: "high_nickel_nmc_module",
        nameTh: "โมดูลแบตเตอรี่ลิเธียมนิกเกิลความหนาแน่นพลังงานสูง NMC-811 (High-Nickel NMC-811 EV Module)",
        familyId: "clean_energy_grid",
        tierStage: "advanced",
        domainId: "power_electronics",
        industry: "energy",
        industryNameTh: "พลังงานสะอาดและกริดอัจฉริยะ",
        productionMode: "high_voltage_cell",
        preferredLine: "lineD",
        chainId: "chain_bauxite_aluminum_extrusion",
        bom: { nickel_cobalt_matte: 1, cathode_electrolyte: 1, aluminum_extrusion_profile: 1, foil_pouch: 1 },
        assemblyMinutes: 56,
        qaMinutes: 22,
        packingMinutes: 12,
        priceMin: 125000,
        priceMax: 162000,
        researchRequired: 145
      },
      braided_fast_charge_kit: {
        id: "braided_fast_charge_kit",
        nameTh: "ชุดสายชาร์จถักอุตสาหกรรมและอะแดปเตอร์ชาร์จไว GaN 65W (SME Fast-Turnover Tech Kit)",
        familyId: "iot_telemetry",
        tierStage: "starter",
        domainId: "embedded_iot",
        industry: "tech",
        industryNameTh: "อิเล็กทรอนิกส์และสมาร์ตเทค",
        productionMode: "smt_precision",
        preferredLine: "lineA",
        bom: { pcb: 1, casing: 1, wire_harness: 1 },
        assemblyMinutes: 24,
        qaMinutes: 8,
        packingMinutes: 5,
        priceMin: 64000,
        priceMax: 82000,
        researchRequired: 10
      },
      artisan_chili_paste_jar: {
        id: "artisan_chili_paste_jar",
        nameTh: "น้ำพริกคั่วสมุนไพรโบราณและหอมเจียวกรอบบรรจุขวดแก้ว B2B (SME Starter Kitchen Line)",
        familyId: "bakery_grain",
        tierStage: "starter",
        domainId: "food_fermentation",
        industry: "food",
        industryNameTh: "อาหารและเครื่องดื่มสุขภาพ",
        productionMode: "cleanroom_batch",
        preferredLine: "lineD",
        bom: { raw_extract: 1, refined_palm_oil: 1, glass_bottle: 1 },
        assemblyMinutes: 20,
        qaMinutes: 7,
        packingMinutes: 5,
        priceMin: 52000,
        priceMax: 68000,
        researchRequired: 12
      }
    },
    roles: {
      sales: { nameTh: "ฝ่ายขาย B2B", skill: "sales", division: "office" },
      admin: { nameTh: "จัดซื้อและบัญชี", skill: "admin", division: "office" },
      engineer: { nameTh: "วิศวกร R&D", skill: "engineering", division: "office" },
      assembler: { nameTh: "ช่างฝ่ายผลิต", skill: "assembly", division: "factory" },
      inspector: { nameTh: "ตรวจคุณภาพ QC", skill: "quality", division: "factory" },
      logistics: { nameTh: "คลังและจัดส่ง", skill: "logistics", division: "factory" },
      coordinator: { nameTh: "ผู้บริหาร/CEO", skill: "leadership", division: "executive" },
    },
    taskKinds: {},
    starters: [
      { name: "มิน", role: "sales", dailyWage: 38000 },
      { name: "ภัทร", role: "admin", dailyWage: 35000 },
      { name: "น้ำ", role: "engineer", dailyWage: 42000 },
      { name: "ต้น", role: "assembler", dailyWage: 40000 },
      { name: "อิง", role: "assembler", dailyWage: 40000 },
      { name: "กานต์", role: "inspector", dailyWage: 36000 },
      { name: "ป่าน", role: "logistics", dailyWage: 36000 },
      { name: "ธีร์", role: "coordinator", dailyWage: 35000 },
    ],
    rules: {
      initialCash: 12000000,
      initialDebt: 6000000,
      rentDaily: 80000,
      interestDaily: 0.0002,
      minimumWage: 28000,
      creditLimit: 20000000,
      paydayInterval: 7,
      maxActiveOrders: 12,
      maxUnits: 160,
      scenarioDays: 90,
      winCash: 6000000,
      winReputation: 60,
      hireFee: 300000,
      maxPeople: 500,
    },
    initialStock: {
      pcb: 30,
      ambient_air_gas: 16,
      iron_ore: 8,
      coke_reducing_flux: 4,
      alumina_billet: 2,
      structural_steel_plate: 2,
      mineral_slag_mud: 0,
      nickel_cobalt_matte: 0,
      aluminum_extrusion_profile: 0,
      wheat_seed: 6,
      wheat_grain: 6,
      nitrogen_ammonia: 6,
      wheat_flour: 6,
      pharma_saline_water: 6,
      casing: 30,
      driver: 30,
      led: 0,
      sensor: 0,
      metal_sheet: 0,
      wire_harness: 0,
      microchip: 0,
      raw_extract: 0,
      glass_bottle: 0,
      pack_carton: 0,
      solar_cell: 0,
      battery: 0,
      heat_sink: 0,
      copper_coil: 0,
      optical_lens: 0,
      polymer_resin: 0,
      probiotic_culture: 0,
      foil_pouch: 0,
      power_inverter_ic: 0,
      silica_bauxite_ore: 0,
      bauxite_ore: 0,
      copper_iron_ore: 0,
      lithium_brine_ore: 0,
      phosphate_potash_rock: 0,
      crude_petro_feedstock: 0,
      raw_water_m3: 8,
      rice_seed: 4,
      cane_stalk_seed: 2,
      palm_seedling: 2,
      soybean_seed: 2,
      paddy_grain: 0,
      crude_palm: 0,
      raw_cane: 0,
      soybean_crop: 0,
      fresh_milk_soy: 0,
      natural_latex: 0,
      timber_bamboo_log: 0,
      milled_rice: 0,
      rice_bran_husk: 0,
      npk_fertilizer: 2,
      organic_compost: 2,
      diesel_liter: 6,
      truck_tire: 2,
      artisan_flour: 0,
      refined_palm_oil: 0,
      refined_sugar_syrup: 0,
      metallurgical_silicon: 0,
      bakery_dough_butter: 0,
      cathode_electrolyte: 0,
      silicon_wafer: 0,
    },
  };
  function registerSkill(c, spec) {
    if (!spec || !validId(spec.id) || c.skills[spec.id])
      throw new TypeError("invalid/duplicate skill id");
    H.createSkill(H.createProfile("validation", "person"), spec);
    if (typeof spec.nameTh !== "string" || !spec.nameTh)
      throw new TypeError("skill needs name");
    c.skills[spec.id] = clone(spec);
    return c;
  }
  function registerRole(c, spec) {
    if (
      !spec ||
      !validId(spec.id) ||
      c.roles[spec.id] ||
      typeof spec.nameTh !== "string" ||
      !spec.nameTh ||
      !Object.hasOwn(c.skills, spec.skill)
    )
      throw new TypeError("invalid role specification");
    c.roles[spec.id] = { nameTh: spec.nameTh, skill: spec.skill };
    return c;
  }
  function registerMaterial(c, spec) {
    if (
      !spec ||
      !validId(spec.id) ||
      c.materials[spec.id] ||
      typeof spec.nameTh !== "string" ||
      !spec.nameTh ||
      !Number.isSafeInteger(spec.unitCost) ||
      spec.unitCost < 1 ||
      spec.unitCost > 1e9 ||
      !Number.isSafeInteger(spec.leadMinutes) ||
      spec.leadMinutes < 5 ||
      spec.leadMinutes > 1440 * 30
    )
      throw new TypeError("invalid material specification");
    c.materials[spec.id] = clone(spec);
    if (!Object.hasOwn(c.initialStock, spec.id)) c.initialStock[spec.id] = 0;
    return c;
  }
  function registerProduct(c, spec) {
    if (
      !spec ||
      !validId(spec.id) ||
      c.products[spec.id] ||
      typeof spec.nameTh !== "string" ||
      !spec.nameTh ||
      !spec.bom ||
      typeof spec.bom !== "object" ||
      Array.isArray(spec.bom) ||
      !Object.keys(spec.bom).length
    )
      throw new TypeError("invalid product specification");
    for (const [m, n] of Object.entries(spec.bom))
      if (
        !Object.hasOwn(c.materials, m) ||
        !Number.isSafeInteger(n) ||
        n < 1 ||
        n > 1000
      )
        throw new TypeError("invalid BOM material: " + m);
    for (const k of [
      "assemblyMinutes",
      "qaMinutes",
      "packingMinutes",
      "priceMin",
      "priceMax",
    ])
      if (
        !Number.isSafeInteger(spec[k]) ||
        spec[k] < 1 ||
        spec[k] > (k.startsWith("price") ? 1e12 : 100000)
      )
        throw new TypeError("invalid product field: " + k);
    const bomCost = Object.entries(spec.bom).reduce(
      (sum, [id, n]) => sum + c.materials[id].unitCost * n,
      0,
    );
    if (!Number.isSafeInteger(bomCost) || Object.keys(spec.bom).length > 64)
      throw new TypeError("unsafe BOM cost");
    if (
      spec.priceMin > spec.priceMax ||
      !Number.isFinite(spec.researchRequired ?? 0) ||
      (spec.researchRequired ?? 0) < 0
    )
      throw new TypeError("invalid product price/research");
    c.products[spec.id] = {
      ...clone(spec),
      researchRequired: spec.researchRequired ?? 0,
      visualKey: spec.visualKey || "product." + spec.id,
      productionMode: spec.productionMode || "smt_precision",
      preferredLine: spec.preferredLine || "lineA",
    };
    return c;
  }
  function validateTaskKind(c, spec) {
    const allowedStations = new Set([
      "assembly",
      "quality",
      "packing",
      "shipping",
      "admin",
      "research",
      "sales",
      "manager",
    ]);
    if (
      !spec ||
      !validId(spec.id) ||
      typeof spec.nameTh !== "string" ||
      !spec.nameTh ||
      typeof spec.skill !== "string" ||
      !Object.hasOwn(c.skills, spec.skill) ||
      !allowedStations.has(spec.stationKind) ||
      !Number.isSafeInteger(spec.requiredMinutes) ||
      spec.requiredMinutes < 5 ||
      spec.requiredMinutes > 1440 ||
      spec.requiredMinutes % 5 !== 0
    )
      throw new TypeError("invalid task kind specification");
    if (spec.impacts !== undefined) {
      if (
        !spec.impacts ||
        typeof spec.impacts !== "object" ||
        Array.isArray(spec.impacts)
      )
        throw new TypeError("invalid task impacts");
      for (const [k, v] of Object.entries(spec.impacts))
        if (typeof v !== "number" || !Number.isFinite(v) || v < -2 || v > 2)
          throw new TypeError("invalid task impact " + k);
    }
    for (const [k, min, max] of [
      ["researchPoints", 0, 1000],
      ["reputationDelta", -10, 10],
      ["workload", 0, 2],
      ["hazard", 0, 1],
      ["complexity", 0, 1],
    ])
      if (
        spec[k] !== undefined &&
        (typeof spec[k] !== "number" ||
          !Number.isFinite(spec[k]) ||
          spec[k] < min ||
          spec[k] > max)
      )
        throw new TypeError("invalid task effect " + k);
    if (
      spec.revenue !== undefined &&
      (!Number.isSafeInteger(spec.revenue) ||
        spec.revenue < 0 ||
        spec.revenue > 1e9)
    )
      throw new TypeError("invalid task revenue");
    if (
      spec.domain !== undefined &&
      !["cognitive", "physical", "social", "creative", "balanced"].includes(
        spec.domain,
      )
    )
      throw new TypeError("invalid task domain");
  }
  function registerTaskKind(c, spec) {
    if (!c.taskKinds || typeof c.taskKinds !== "object") c.taskKinds = {};
    if (spec && Object.hasOwn(c.taskKinds, spec.id))
      throw new TypeError("duplicate task kind");
    validateTaskKind(c, spec);
    c.taskKinds[spec.id] = {
      ...clone(spec),
      researchPoints: spec.researchPoints ?? 0,
      reputationDelta: spec.reputationDelta ?? 0,
      revenue: spec.revenue ?? 0,
      domain: spec.domain || "balanced",
      workload: spec.workload ?? 1,
      hazard: spec.hazard ?? 0,
      complexity: spec.complexity ?? 0.5,
    };
    return c;
  }
  function validateCatalog(c) {
    const e = [];
    if (
      !c ||
      typeof c !== "object" ||
      !c.skills ||
      !c.materials ||
      !c.products ||
      !c.roles ||
      !c.rules ||
      !c.initialStock
    )
      return ["catalog missing top-level sections"];
    for (const [id, s] of Object.entries(c.skills)) {
      if (!validId(id) || id !== s?.id) e.push("invalid skill " + id);
      else
        try {
          H.createSkill(H.createProfile("validate", "p"), s);
        } catch (err) {
          e.push(err.message);
        }
    }
    for (const [id, m] of Object.entries(c.materials))
      if (
        !validId(id) ||
        id !== m?.id ||
        !Number.isSafeInteger(m.unitCost) ||
        m.unitCost < 1 ||
        m.unitCost > 1e9 ||
        !Number.isSafeInteger(m.leadMinutes) ||
        m.leadMinutes < 5
      )
        e.push("invalid material " + id);
    for (const [id, p] of Object.entries(c.products)) {
      if (
        !validId(id) ||
        id !== p?.id ||
        typeof p.bom !== "object" ||
        Array.isArray(p.bom) ||
        !p.bom ||
        !Object.keys(p.bom).length
      ) {
        e.push("invalid product " + id);
        continue;
      }
      for (const [mat, n] of Object.entries(p.bom))
        if (
          !Object.hasOwn(c.materials, mat) ||
          !Number.isSafeInteger(n) ||
          n < 1
        )
          e.push("invalid BOM " + id);
      for (const k of [
        "assemblyMinutes",
        "qaMinutes",
        "packingMinutes",
        "priceMin",
        "priceMax",
      ])
        if (
          !Number.isSafeInteger(p[k]) ||
          p[k] < 1 ||
          p[k] > (k.startsWith("price") ? 1e12 : 100000)
        )
          e.push("invalid " + id + "." + k);
      const bomCost = Object.entries(p.bom).reduce(
        (sum, [id, n]) => sum + (c.materials[id]?.unitCost || 0) * n,
        0,
      );
      if (!Number.isSafeInteger(bomCost) || Object.keys(p.bom).length > 64)
        e.push("unsafe BOM economics " + id);
      if (
        p.priceMin > p.priceMax ||
        !Number.isFinite(p.researchRequired) ||
        p.researchRequired < 0
      )
        e.push("invalid product economics " + id);
    }
    for (const [id, n] of Object.entries(c.initialStock))
      if (!Object.hasOwn(c.materials, id) || !Number.isSafeInteger(n) || n < 0)
        e.push("invalid stock " + id);
    for (const [id, r] of Object.entries(c.roles))
      if (
        !validId(id) ||
        ["constructor", "prototype"].includes(id) ||
        !r ||
        !Object.hasOwn(c.skills, r.skill)
      )
        e.push("invalid role " + id);
    if (c.taskKinds !== undefined) {
      if (
        !c.taskKinds ||
        typeof c.taskKinds !== "object" ||
        Array.isArray(c.taskKinds)
      )
        e.push("invalid taskKinds");
      else
        for (const [id, t] of Object.entries(c.taskKinds)) {
          try {
            if (id !== t.id) throw new TypeError("mismatched task id");
            validateTaskKind(c, t);
          } catch (_) {
            e.push("invalid taskKind " + id);
          }
        }
    }
    if (c.lifeGoals !== undefined) {
      try {
        H.deriveAspirations(
          H.createProfile("validate", "p"),
          H.STATE_DEFAULTS,
          { goalSpecs: c.lifeGoals },
        );
      } catch (_) {
        e.push("invalid life goals");
      }
    }
    for (const [k, v] of Object.entries(c.rules))
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0)
        e.push("invalid rule " + k);
    for (const skill of [
      "sales",
      "admin",
      "engineering",
      "assembly",
      "quality",
      "logistics",
      "leadership",
    ])
      if (!Object.hasOwn(c.skills, skill))
        e.push("required skill " + skill + " missing");
    if (
      !Array.isArray(c.starters) ||
      !c.starters.length ||
      c.starters.length > 600
    )
      e.push("invalid starters");
    else
      for (const s of c.starters)
        if (
          !s ||
          typeof s.name !== "string" ||
          !Object.hasOwn(c.roles, s.role) ||
          !Number.isSafeInteger(s.dailyWage) ||
          s.dailyWage < c.rules.minimumWage
        )
          e.push("invalid starter");
    for (const [k, min, max] of [
      ["initialCash", 0, 1e12],
      ["initialDebt", 0, 1e12],
      ["rentDaily", 0, 1e9],
      ["minimumWage", 1, 1e7],
      ["creditLimit", 0, 1e12],
      ["paydayInterval", 1, 30],
      ["maxActiveOrders", 1, 200],
      ["maxUnits", 1, 4000],
      ["scenarioDays", 1, 365],
      ["winCash", 0, 1e12],
      ["winReputation", 0, 100],
      ["hireFee", 0, 1e9],
      ["maxPeople", 1, 600],
    ])
      if (
        !Number.isSafeInteger(c.rules[k]) ||
        c.rules[k] < min ||
        c.rules[k] > max
      )
        e.push("invalid rule " + k);
    if (
      typeof c.rules.interestDaily !== "number" ||
      !Number.isFinite(c.rules.interestDaily) ||
      c.rules.interestDaily < 0 ||
      c.rules.interestDaily > 0.1
    )
      e.push("invalid interest rate");
    return e;
  }
  return Object.freeze({
    VERSION: "2.6.0",
    RELEASE_VERSION: "2.6.0",
    RESOURCE_CLASSES,
    AGRICULTURE_CROPS,
    FLEET_VEHICLES,
    FREIGHT_ROUTES,
    SOFTWARE_APPS,
    SECTOR_PROCESS_MODELS,
    INDUSTRIAL_SERVICES,
    BUSINESS_PROCESS_MODELS,
    CAPABILITY_DOMAINS,
    PRODUCT_FAMILIES,
    GLOBAL_NATIONS,
    GEOPOLITICAL_EVENTS,
    TRADE_CORRIDORS,
    SME_GROWTH_STAGES,
    SME_MILESTONE_CATALOG,
    UTILITY_TARIFFS,
    AFTER_WORK_CLUBS,
    CULTURE_GOSSIP_TOPICS,
    TRUE_RESOURCE_CHAIN_TABLE,
    MATERIAL_TIERS,
    MATERIAL_RECIPES,
    NATIONALITIES,
    NAME_POOLS,
    STARTER_IDENTITIES,
    CORPORATE_DIVISIONS,
    ROLE_DEPARTMENTS,
    ORG_TREE,
    LEVEL_TIERS,
    CAREER_QUOTAS,
    CAREER_LADDERS,
    PRODUCTION_MODES,
    PRODUCTION_REGIMES,
    SUPPLY_CHAIN_STRATEGIES,
    EXTERNAL_ASSETS,
    PRODUCTION_CHAINS,
    EXPANSION_PLOTS,
    EXTERNAL_WORLD_DEFAULTS,
    LEAN_STARTERS,
    MOTIVE_FACTOR_LABELS,
    INDUSTRY_SKILL_TEMPLATES,
    getCareerStep,
    getNextCareerStep,
    resolveOrgAssignment,
    createIdentity,
    translateMotiveFactor,
    createCatalog: () => clone(defaults),
    validateCatalog,
    registerSkill,
    registerRole,
    registerMaterial,
    registerProduct,
    registerTaskKind,
  });
});
