// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: calendar-alt;
// 撕頁黃曆 小工具 for Scriptable (iOS)
// 小：月份條＋日期＋宜忌　中：日期＋農曆＋宜忌　大：完整黃曆頁（節日、宜忌各三項、吉時、財神方位）

const YI = [
  "準時下班", "早點睡覺", "多喝水", "吃頓好的", "整理桌面",
  "適度摸魚", "運動流汗", "打給家人", "存點小錢", "散步",
  "曬太陽", "說聲謝謝", "看本書", "放空", "提早出門",
  "關掉通知", "洗衣服", "請自己喝飲料", "原諒自己", "微笑",
  "午睡", "斷捨離", "追劇", "自己煮飯", "收信清零",
  "拒絕加班", "讚美同事", "早點回家", "犒賞自己", "伸展筋骨",
];
const JI = [
  "開會", "熬夜", "衝動購物", "查看餘額", "已讀不回",
  "跟老闆對視", "吃宵夜", "生氣", "跟別人比較", "拖延",
  "滑手機到半夜", "回工作群組", "直接改正式機", "立 flag", "喝太多咖啡",
  "想太多", "忘記帶傘", "說「應該很快」", "答應 deadline", "空腹喝咖啡",
  "跟自己過不去", "罵自己", "嘴硬", "硬撐", "週五部署",
];
const HOURS = ["子時 23–01", "丑時 01–03", "寅時 03–05", "卯時 05–07", "辰時 07–09", "巳時 09–11",
  "午時 11–13", "未時 13–15", "申時 15–17", "酉時 17–19", "戌時 19–21", "亥時 21–23"];
const DIRS = ["正東", "東南", "正南", "西南", "正西", "西北", "正北", "東北"];

const RED = new Color("#C8102E");
const PAPER = Color.dynamic(new Color("#FFFFFF"), new Color("#232323"));
const INK = Color.dynamic(new Color("#1A1A1A"), new Color("#F0F0F0"));
const GRAY = Color.dynamic(new Color("#808080"), new Color("#A0A0A0"));
const LINE = Color.dynamic(new Color("#EBEBEB"), new Color("#3A3A3A"));
const WHITE = new Color("#FFFFFF");
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
// ===== 今日內容 =====
const r = rng(hash(`almanac-${now.getFullYear()}-${doy}`));
function pickN(arr, n) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n);
}
const yi = pickN(YI, 3), ji = pickN(JI, 3);
const hour = HOURS[Math.floor(r() * HOURS.length)];
const dir = DIRS[Math.floor(r() * DIRS.length)];
const isWeekend = now.getDay() === 0 || now.getDay() === 6;
const fest = festival(now);
const lunarStr = lunarText(now);
const dateColor = isWeekend || fest ? RED : INK;

function centered(parent, text, font, color) {
  const s = parent.addStack();
  s.addSpacer();
  const t = txt(s, text, font, color);
  s.addSpacer();
  return t;
}
function band(w, text, height, size) {
  const b = w.addStack();
  b.size = new Size(0, height);
  b.backgroundColor = RED;
  b.centerAlignContent();
  b.addSpacer();
  txt(b, text, Font.boldSystemFont(size), WHITE);
  b.addSpacer();
}
function yiJi(parent, label, item, size) {
  const row = parent.addStack();
  row.centerAlignContent();
  txt(row, label, Font.heavySystemFont(size), label === "宜" ? RED : GRAY);
  row.addSpacer(6);
  const t = txt(row, item, Font.mediumSystemFont(size), INK);
  t.lineLimit = 1; t.minimumScaleFactor = 0.6;
}
function column(parent, label, items, color) {
  const c = parent.addStack(); c.layoutVertically();
  const head = c.addStack();
  const box = head.addStack();
  box.backgroundColor = color; box.cornerRadius = 4; box.setPadding(1, 6, 1, 6);
  txt(box, label, serif(15, true), WHITE);
  c.addSpacer(8);
  for (const it of items) {
    const t = txt(c, it, serif(15, false), INK);
    t.lineLimit = 1; t.minimumScaleFactor = 0.6;
    c.addSpacer(5);
  }
  return c;
}

const w = new ListWidget();
w.backgroundColor = PAPER;
w.setPadding(0, 0, 0, 0);

if (family === "small") {
  band(w, fest || `${now.getFullYear()}　${MONTH_CN[now.getMonth()]}月`, 28, 13);
  const body = w.addStack();
  body.layoutVertically();
  body.setPadding(2, 12, 8, 12);
  centered(body, String(now.getDate()), Font.heavySystemFont(42), dateColor);
  centered(body, `星期${WEEK[now.getDay()]}`, Font.mediumSystemFont(11), GRAY);
  body.addSpacer(6);
  yiJi(body, "宜", yi[0], 12);
  body.addSpacer(2);
  yiJi(body, "忌", ji[0], 12);
  w.addSpacer();
} else if (family === "medium") {
  band(w, `${now.getFullYear()} 年 ${MONTH_CN[now.getMonth()]}月　${fest || "今年第 " + doy + " 天"}`, 30, 13);
  const body = w.addStack();
  body.setPadding(8, 16, 12, 16);
  body.centerAlignContent();
  const left = body.addStack();
  left.layoutVertically();
  left.size = new Size(100, 0);
  centered(left, String(now.getDate()), Font.heavySystemFont(60), dateColor);
  centered(left, `星期${WEEK[now.getDay()]}`, Font.mediumSystemFont(13), GRAY);
  body.addSpacer(10);
  const line = body.addStack();
  line.size = new Size(1, 80);
  line.backgroundColor = LINE;
  body.addSpacer(16);
  const right = body.addStack();
  right.layoutVertically();
  if (lunarStr) {
    txt(right, lunarStr, Font.mediumSystemFont(13), GRAY);
    right.addSpacer(10);
  }
  yiJi(right, "宜", yi[0], 17);
  right.addSpacer(8);
  yiJi(right, "忌", ji[0], 17);
  w.addSpacer();
} else {
  band(w, `${now.getFullYear()} 年　${MONTH_CN[now.getMonth()]}月`, 40, 16);
  const body = w.addStack();
  body.layoutVertically();
  body.setPadding(4, 22, 16, 22);
  centered(body, String(now.getDate()), Font.heavySystemFont(84), dateColor);
  centered(body, [`星期${WEEK[now.getDay()]}`, lunarStr].filter(Boolean).join("　"), serif(14, false), GRAY);
  if (fest) { body.addSpacer(2); centered(body, fest, serif(15, true), RED); }
  body.addSpacer(12);
  const d = body.addStack(); d.size = new Size(W - 12, 1); d.backgroundColor = LINE;
  body.addSpacer(12);
  const cols = body.addStack();
  column(cols, "宜", yi, RED);
  cols.addSpacer();
  const v = cols.addStack(); v.size = new Size(1, 110); v.backgroundColor = LINE;
  cols.addSpacer();
  column(cols, "忌", ji, GRAY);
  cols.addSpacer();
  body.addSpacer(6);
  const foot = body.addStack();
  txt(foot, `吉時　${hour}`, Font.mediumSystemFont(12), GRAY);
  foot.addSpacer();
  txt(foot, `財神　${dir}`, Font.mediumSystemFont(12), GRAY);
  w.addSpacer();
}

w.refreshAfterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1);
if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
