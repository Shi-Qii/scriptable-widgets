// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: plane;
// 旅行曆 小工具 for Scriptable (iOS)
// 每天一個世界景點：照片＋介紹自動從維基百科抓取（開放授權），點小工具可開啟完整條目
// 小：照片＋地名　中：照片＋地名＋兩行介紹　大：照片＋日期＋地名＋完整介紹
// 需要網路；當天抓過一次會存在手機裡，之後不用再抓

// ===== 景點清單：[國家, 顯示名稱, 中文維基條目, 英文維基條目, 備用簡介] =====
const PLACES = [
  ["法國", "艾菲爾鐵塔", "埃菲尔铁塔", "Eiffel Tower", "1889 年為萬國博覽會建造，高約 330 公尺，是巴黎最著名的地標。"],
  ["美國", "自由女神像", "自由女神像", "Statue of Liberty", "法國贈送給美國的禮物，1886 年在紐約港落成。"],
  ["日本", "富士山", "富士山", "Mount Fuji", "日本最高峰，海拔 3,776 公尺，是日本的象徵之一。"],
  ["中國", "萬里長城", "长城", "Great Wall of China", "綿延上萬公里的古代防禦工事，橫跨中國北方。"],
  ["秘魯", "馬丘比丘", "马丘比丘", "Machu Picchu", "15 世紀印加帝國建在安地斯山脊上的古城。"],
  ["印度", "泰姬瑪哈陵", "泰姬陵", "Taj Mahal", "蒙兀兒皇帝為紀念亡妻而建的白色大理石陵墓。"],
  ["埃及", "吉薩金字塔", "吉萨金字塔群", "Giza pyramid complex", "古埃及法老的陵墓群，已有四千多年歷史。"],
  ["澳洲", "雪梨歌劇院", "悉尼歌剧院", "Sydney Opera House", "帆船造型的表演藝術中心，1973 年啟用。"],
  ["西班牙", "聖家堂", "圣家堂", "Sagrada Família", "高第設計的教堂，從 1882 年動工至今仍在興建。"],
  ["柬埔寨", "吳哥窟", "吴哥窟", "Angkor Wat", "世界最大的宗教建築群之一，柬埔寨國旗上的圖案。"],
  ["約旦", "佩特拉", "佩特拉", "Petra", "在玫瑰色岩壁上直接雕鑿出來的古城。"],
  ["義大利", "羅馬競技場", "古罗马斗兽场", "Colosseum", "古羅馬最大的圓形劇場，可容納約五萬名觀眾。"],
  ["義大利", "比薩斜塔", "比萨斜塔", "Leaning Tower of Pisa", "因地基鬆軟而傾斜的鐘樓，成為世界知名景點。"],
  ["希臘", "聖托里尼", "圣托里尼岛", "Santorini", "愛琴海上的火山島，以白牆藍頂的房子聞名。"],
  ["德國", "新天鵝堡", "新天鹅堡", "Neuschwanstein Castle", "19 世紀巴伐利亞國王路德維希二世建造的夢幻城堡。"],
  ["美國", "大峽谷", "大峡谷", "Grand Canyon", "科羅拉多河經過數百萬年切割出的壯觀峽谷。"],
  ["美國、加拿大", "尼加拉瀑布", "尼亚加拉瀑布", "Niagara Falls", "橫跨美加邊境的大瀑布群。"],
  ["阿根廷、巴西", "伊瓜蘇瀑布", "伊瓜苏瀑布", "Iguazu Falls", "由兩百多道瀑布組成的壯觀瀑布群。"],
  ["玻利維亞", "烏尤尼鹽沼", "乌尤尼盐沼", "Salar de Uyuni", "世界最大的鹽沼，雨季時地面倒映天空，被稱為天空之鏡。"],
  ["英國", "巨石陣", "巨石阵", "Stonehenge", "史前時代留下的環狀巨石遺跡，至今用途仍是謎。"],
  ["英國", "大笨鐘", "大本钟", "Big Ben", "倫敦西敏宮的鐘樓，倫敦最具代表性的地標之一。"],
  ["法國", "聖米歇爾山", "圣米歇尔山", "Mont-Saint-Michel", "被潮汐環繞的小島，島頂是一座中世紀修道院。"],
  ["日本", "伏見稻荷大社", "伏见稻荷大社", "Fushimi Inari-taisha", "以綿延山間的千本鳥居聞名的神社。"],
  ["台灣", "太魯閣", "太鲁阁国家公园", "Taroko National Park", "立霧溪切割大理石岩層形成的壯麗峽谷。"],
  ["台灣", "日月潭", "日月潭", "Sun Moon Lake", "台灣最大的天然淡水湖，湖景隨四季變化。"],
  ["韓國", "景福宮", "景福宫", "Gyeongbokgung", "朝鮮王朝的正宮，位於首爾市中心。"],
  ["印尼", "婆羅浮屠", "婆罗浮屠", "Borobudur", "世界最大的佛教寺廟遺址之一，建於九世紀。"],
  ["越南", "下龍灣", "下龙湾", "Hạ Long Bay", "上千座石灰岩島嶼散布在翡翠色的海面上。"],
  ["土耳其", "卡帕多奇亞", "卡帕多细亚", "Cappadocia", "以奇岩地貌和清晨滿天的熱氣球聞名。"],
  ["挪威", "蓋倫格峽灣", "盖朗厄尔峡湾", "Geirangerfjord", "被列為世界遺產的峽灣，兩側是陡峭山壁與瀑布。"],
  ["俄羅斯", "聖瓦西里主教座堂", "圣瓦西里主教座堂", "Saint Basil's Cathedral", "紅場旁色彩繽紛、有洋蔥頂的教堂。"],
  ["捷克", "查理大橋", "查理大桥", "Charles Bridge", "橫跨伏爾塔瓦河，布拉格最古老的石橋。"],
  ["荷蘭", "小孩堤防風車群", "小孩堤防", "Kinderdijk", "18 世紀建造的風車群，用來排水治水。"],
  ["瑞士", "馬特洪峰", "马特洪峰", "Matterhorn", "金字塔形的阿爾卑斯名峰，橫跨瑞士和義大利。"],
  ["巴西", "救世基督像", "救世基督像", "Christ the Redeemer (statue)", "矗立在山頂、俯瞰里約熱內盧的巨大雕像。"],
  ["紐西蘭", "米佛峽灣", "米佛峡湾", "Milford Sound", "冰河切割出的峽灣，常年雲霧繚繞。"],
  ["澳洲", "大堡礁", "大堡礁", "Great Barrier Reef", "世界最大的珊瑚礁系統，從太空都看得到。"],
  ["坦尚尼亞", "吉力馬札羅山", "乞力马扎罗山", "Mount Kilimanjaro", "非洲最高峰，山頂終年積雪。"],
  ["美國", "金門大橋", "金门大桥", "Golden Gate Bridge", "舊金山的紅色懸索橋，1937 年通車。"],
  ["加拿大", "露易絲湖", "路易丝湖", "Lake Louise", "洛磯山脈中的翡翠色冰河湖。"],
  ["摩洛哥", "舍夫沙萬", "舍夫沙万", "Chefchaouen", "整座城漆成藍色的山城。"],
  ["中國", "張家界", "张家界国家森林公园", "Zhangjiajie National Forest Park", "數千座石英砂岩峰林拔地而起。"],
  ["日本", "姬路城", "姬路城", "Himeji Castle", "又稱白鷺城，日本保存最完整的古城之一。"],
  ["義大利", "威尼斯", "威尼斯", "Venice", "建在潟湖上的水都，以運河和貢多拉聞名。"],
  ["墨西哥", "奇琴伊察", "奇琴伊察", "Chichen Itza", "馬雅文明的古城遺址，以羽蛇神金字塔聞名。"],
  ["智利", "復活節島", "复活节岛", "Easter Island", "太平洋上的孤島，散布著巨大的摩艾石像。"],
  ["美國", "時代廣場", "时代广场", "Times Square", "紐約霓虹看板最密集的路口，跨年倒數的舞台。"],
];
// ===== 共用：農曆、節日、固定亂數 =====
function cnDay(n) {
  const d = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  if (n <= 10) return "初" + d[n];
  if (n < 20) return "十" + d[n - 10];
  if (n === 20) return "二十";
  if (n < 30) return "廿" + d[n - 20];
  return "三十";
}
function lunarParts(date) {
  try {
    const parts = new Intl.DateTimeFormat("zh-TW-u-ca-chinese", { month: "long", day: "numeric" }).formatToParts(date);
    let m = "", d = NaN;
    for (const p of parts) {
      if (p.type === "month") m = p.value;
      if (p.type === "day") d = parseInt(p.value, 10);
    }
    return m && !isNaN(d) ? { m, d } : null;
  } catch (e) { return null; }
}
function lunarText(date) {
  const l = lunarParts(date);
  return l ? `農曆${l.m}${cnDay(l.d)}` : "";
}
function festival(date) {
  const SOLAR = { "1/1": "元旦", "2/14": "情人節", "2/28": "和平紀念日", "3/8": "婦女節",
    "4/4": "兒童節", "5/1": "勞動節", "9/28": "教師節", "10/10": "國慶日", "12/25": "聖誕節" };
  const LUNAR = { "正月1": "春節", "正月15": "元宵", "五月5": "端午", "七月7": "七夕",
    "七月15": "中元", "八月15": "中秋", "九月9": "重陽" };
  const l = lunarParts(date);
  if (l && LUNAR[l.m + l.d]) return LUNAR[l.m + l.d];
  const t = lunarParts(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));
  if (t && t.m === "正月" && t.d === 1) return "除夕";
  return SOLAR[`${date.getMonth() + 1}/${date.getDate()}`] || "";
}
function hash(s) {
  let h = 2166136261;
  for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// 宋體（iOS 沒有時會自動退回系統字體）
function serif(size, bold) { return new Font(bold ? "STSongti-TC-Bold" : "STSongti-TC-Regular", size); }
function txt(p, s, font, color) {
  const t = p.addText(String(s)); t.font = font; t.textColor = color; return t;
}
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const doy = Math.round((today - new Date(now.getFullYear(), 0, 1)) / 86400000) + 1;
const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const MONTH_CN = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
const family = config.widgetFamily || "large";
const W = 300; // 中、大尺寸內容寬度
const WHITE = new Color("#FFFFFF");
const SOFT = new Color("#FFFFFF", 0.85);
const FAINT = new Color("#FFFFFF", 0.6);
const SIZES = { small: [170, 170], medium: [360, 170], large: [360, 380] };

const [country, placeName, zhTitle, enTitle, blurb] = PLACES[(doy - 1) % PLACES.length];
const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

// ===== 快取 =====
const fm = FileManager.local();
const dir = fm.joinPath(fm.documentsDirectory(), "travel-calendar");
if (!fm.fileExists(dir)) fm.createDirectory(dir, true);
const jsonPath = fm.joinPath(dir, "today.json");
const imgPath = fm.joinPath(dir, "today.jpg");

async function summary(lang, title) {
  try {
    const req = new Request(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    req.headers = { "Accept-Language": lang === "zh" ? "zh-tw" : "en" };
    req.timeoutInterval = 12;
    const j = await req.loadJSON();
    if (!j || !j.title || (j.status && j.status >= 400)) return null;
    return j;
  } catch (e) { return null; }
}
async function loadImage(url) {
  if (!url) return null;
  const big = url.replace(/\/\d+px-/, "/1000px-");
  for (const u of big !== url ? [big, url] : [url]) {
    try { const img = await new Request(u).loadImage(); if (img) return img; } catch (e) {}
  }
  return null;
}
function cleanExtract(s) {
  if (!s) return "";
  let t = s;
  for (let i = 0; i < 3; i++) t = t.replace(/（[^（）]*）/g, "").replace(/\([^()]*\)/g, "");
  t = t.replace(/\s+/g, " ").trim();
  if (t.length <= 110) return t;
  const cut = t.slice(0, 110);
  const end = cut.lastIndexOf("。");
  return end > 40 ? cut.slice(0, end + 1) : cut + "……";
}
async function fetchToday() {
  const zh = await summary("zh", zhTitle);
  const en = (zh && (zh.originalimage || zh.thumbnail)) ? null : await summary("en", enTitle);
  const src = zh && (zh.originalimage || zh.thumbnail) ? zh : en;
  const imgUrl = src ? (src.thumbnail || src.originalimage).source : null;
  const img = await loadImage(imgUrl);
  const text = zh && zh.type !== "disambiguation" ? cleanExtract(zh.extract) : "";
  const url = (zh || en) && (zh || en).content_urls ? (zh || en).content_urls.mobile.page : null;
  if (!img && !text) return null;
  const data = { key, text: text || blurb, url };
  fm.writeString(jsonPath, JSON.stringify(data));
  if (img) fm.writeImage(imgPath, img);
  else if (fm.fileExists(imgPath)) fm.remove(imgPath);
  return data;
}

let data = null, stale = false;
if (fm.fileExists(jsonPath)) {
  try { const c = JSON.parse(fm.readString(jsonPath)); if (c.key === key) data = c; } catch (e) {}
}
if (!data) data = await fetchToday();
if (!data) { stale = true; data = { key, text: blurb, url: null }; }
const photo = !stale && fm.fileExists(imgPath) ? fm.readImage(imgPath) : null;

// ===== 背景：照片鋪滿＋上下漸層壓暗，讓白字清楚 =====
function background(img, w, h) {
  const ctx = new DrawContext();
  ctx.size = new Size(w, h);
  ctx.opaque = true;
  ctx.respectScreenScale = true;
  if (img) {
    const s = Math.max(w / img.size.width, h / img.size.height);
    const dw = img.size.width * s, dh = img.size.height * s;
    ctx.drawImageInRect(img, new Rect((w - dw) / 2, (h - dh) / 2, dw, dh));
  } else {
    ctx.setFillColor(new Color("#2B4C7E"));
    ctx.fillRect(new Rect(0, 0, w, h));
  }
  const steps = 48;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const a = t < 0.25 ? 0.38 * (1 - t / 0.25) : 0.8 * Math.pow((t - 0.25) / 0.75, 1.5);
    ctx.setFillColor(new Color("#000000", a));
    ctx.fillRect(new Rect(0, h * t, w, h / steps + 1));
  }
  return ctx.getImage();
}
function shadowed(p, s, font, color) {
  const t = txt(p, s, font, color);
  t.shadowColor = new Color("#000000", 0.5);
  t.shadowRadius = 3;
  return t;
}
function tag(p, s, size) {
  const b = p.addStack();
  b.backgroundColor = new Color("#FFFFFF", 0.22);
  b.cornerRadius = 8;
  b.setPadding(3, 8, 3, 8);
  txt(b, s, Font.semiboldSystemFont(size), WHITE);
}

const w = new ListWidget();
const [bw, bh] = SIZES[family] || SIZES.large;
w.backgroundImage = background(photo, bw, bh);
if (data.url) w.url = data.url;
const dateStr = `${now.getMonth() + 1}月${now.getDate()}日`;

if (family === "small") {
  w.setPadding(12, 14, 12, 14);
  shadowed(w, `${dateStr} 星期${WEEK[now.getDay()]}`, Font.boldSystemFont(12), WHITE);
  w.addSpacer();
  shadowed(w, country, Font.semiboldSystemFont(11), SOFT);
  const n = shadowed(w, placeName, serif(18, true), WHITE);
  n.minimumScaleFactor = 0.6; n.lineLimit = 2;
} else if (family === "medium") {
  w.setPadding(14, 16, 14, 16);
  const top = w.addStack(); top.centerAlignContent();
  shadowed(top, `${dateStr}　星期${WEEK[now.getDay()]}`, Font.boldSystemFont(13), WHITE);
  top.addSpacer();
  tag(top, `✈ ${country}`, 11);
  w.addSpacer();
  const n = shadowed(w, placeName, serif(22, true), WHITE);
  n.lineLimit = 1; n.minimumScaleFactor = 0.6;
  w.addSpacer(2);
  const d = shadowed(w, data.text, Font.mediumSystemFont(12), SOFT);
  d.lineLimit = 2;
} else {
  w.setPadding(18, 18, 16, 18);
  const top = w.addStack(); top.centerAlignContent();
  const dt = top.addStack(); dt.layoutVertically();
  shadowed(dt, dateStr, serif(22, true), WHITE);
  shadowed(dt, `星期${WEEK[now.getDay()]}　${lunarText(now)}`, Font.mediumSystemFont(12), SOFT);
  top.addSpacer();
  tag(top, `✈ ${country}`, 12);
  w.addSpacer();
  shadowed(w, `${country}｜${placeName}`, serif(24, true), WHITE).minimumScaleFactor = 0.6;
  w.addSpacer(6);
  const d = shadowed(w, data.text, Font.mediumSystemFont(13), SOFT);
  d.lineLimit = 5; d.minimumScaleFactor = 0.8;
  w.addSpacer(8);
  const f = w.addStack();
  shadowed(f, stale ? "沒有網路，顯示簡短介紹" : "圖文：維基百科（CC BY-SA）", Font.systemFont(9), FAINT);
  f.addSpacer();
  shadowed(f, `第 ${doy} 站`, Font.semiboldSystemFont(10), FAINT);
}

// 正常是隔天更新；抓取失敗就 30 分鐘後重試
w.refreshAfterDate = stale
  ? new Date(Date.now() + 30 * 60 * 1000)
  : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1);
if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
