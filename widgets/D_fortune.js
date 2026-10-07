// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: star;
// 今日運勢 小工具 for Scriptable (iOS)
// 「編輯小工具」的 Parameter 填名字，每個人抽到的不一樣
// 小：籤等＋建議　中：籤等＋建議＋幸運色、數字、貴人　大：完整籤紙（四種運勢星等、幸運物）

const LEVELS = [["大吉", 2], ["中吉", 4], ["小吉", 5], ["吉", 5], ["末吉", 3], ["凶", 1]];
const ADVICE = [
  "適合摸魚，但不要被抓到", "適合早點下班", "會有人請你喝飲料",
  "適合買一杯全糖的", "今天說的話特別有份量", "適合整理桌面，順便整理人生",
  "會議會比預期短", "適合主動傳訊息給朋友", "今天的午餐會特別好吃",
  "適合拒絕不合理的要求", "購物車先別結帳", "會收到意外的好消息",
  "適合早睡，明天會感謝你", "今天的 bug 會自己現形", "遇到排隊選左邊那條",
  "適合運動，流汗會很爽", "靈感特別多，記得寫下來", "適合請自己吃點好的",
  "出門記得帶傘，以防萬一", "適合當個安靜的觀察者", "今天適合說「好啊」",
  "適合學一個新東西", "主管今天心情不錯", "適合把拖很久的事做完",
];
const COLORS = [
  ["薄荷綠", "#7FD6B0"], ["奶茶色", "#C9A27E"], ["天空藍", "#7DB8F0"],
  ["櫻花粉", "#F4A7B9"], ["檸檬黃", "#F3D35B"], ["薰衣草紫", "#B49BE0"],
  ["橘子橙", "#F39A4B"], ["純白", "#FFFFFF"], ["酒紅", "#A63446"],
];
const FOODS = ["珍珠奶茶", "雞排", "滷肉飯", "牛肉麵", "鹽酥雞", "蛋餅", "臭豆腐", "芒果冰",
  "小籠包", "水煎包", "豆花", "肉圓", "蚵仔煎", "麻辣燙", "便當"];
const SIGNS = ["牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座", "處女座",
  "天秤座", "天蠍座", "射手座", "摩羯座", "水瓶座", "雙魚座"];
const ASPECTS = ["工作運", "財運", "感情運", "健康運"];
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
const BG = new Color("#7E1A1A");
const GOLD = new Color("#F3C969");
const DIM = new Color("#F3C969", 0.3);
const CREAM = new Color("#FFF4DC");
const SOFT = new Color("#FFF4DC", 0.7);
const CHIP = new Color("#FFFFFF", 0.08);

const name = (args.widgetParameter || "").trim();
const r = rng(hash(`${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${name}`));
const pick = (arr) => arr[Math.floor(r() * arr.length)];
function pickLevel() {
  let x = r() * LEVELS.reduce((s, l) => s + l[1], 0);
  for (const [lv, wt] of LEVELS) { if ((x -= wt) < 0) return lv; }
  return LEVELS[0][0];
}
const level = pickLevel();
const advice = pick(ADVICE);
const [colorName, colorHex] = pick(COLORS);
const luckyNum = 1 + Math.floor(r() * 99);
const sign = pick(SIGNS);
const food = pick(FOODS);
const base = { "大吉": 4, "中吉": 3, "小吉": 3, "吉": 2, "末吉": 2, "凶": 1 }[level];
const stars = ASPECTS.map((a) => [a, Math.min(5, base + Math.floor(r() * 2))]);
const dateStr = `${now.getMonth() + 1}/${now.getDate()} 星期${WEEK[now.getDay()]}`;
const title = name ? `${name} 的今日籤` : "今日運勢";

function stamp(p, size) {
  const box = p.addStack();
  box.borderColor = GOLD; box.borderWidth = 3; box.cornerRadius = 8;
  box.setPadding(6, 12, 6, 12);
  txt(box, level, serif(size, true), GOLD);
}
function colorDot(p, size) {
  const row = p.addStack(); row.centerAlignContent();
  txt(row, "幸運色 ", Font.mediumSystemFont(size), SOFT);
  const dot = row.addStack(); dot.size = new Size(size - 1, size - 1); dot.cornerRadius = size / 2;
  dot.backgroundColor = new Color(colorHex);
  txt(row, ` ${colorName}`, Font.mediumSystemFont(size), CREAM);
}
function starRow(p, label, n) {
  const row = p.addStack(); row.centerAlignContent();
  const l = row.addStack(); l.size = new Size(56, 0);
  txt(l, label, serif(14, true), CREAM); l.addSpacer();
  txt(row, "★".repeat(n), Font.systemFont(15), GOLD);
  txt(row, "★".repeat(5 - n), Font.systemFont(15), DIM);
}
function chip(p, label, value) {
  const s = p.addStack(); s.layoutVertically();
  s.backgroundColor = CHIP; s.cornerRadius = 10; s.setPadding(6, 10, 6, 10);
  txt(s, label, Font.mediumSystemFont(10), SOFT);
  const v = txt(s, value, Font.boldSystemFont(14), CREAM);
  v.lineLimit = 1; v.minimumScaleFactor = 0.6;
  return s;
}

const w = new ListWidget();
w.backgroundColor = BG;

if (family === "small") {
  w.setPadding(14, 16, 14, 16);
  txt(w, title, Font.boldSystemFont(12), SOFT);
  w.addSpacer(6);
  stamp(w, 26);
  w.addSpacer(8);
  const a = txt(w, advice, Font.mediumSystemFont(13), CREAM);
  a.minimumScaleFactor = 0.6;
  w.addSpacer();
} else if (family === "medium") {
  w.setPadding(14, 16, 14, 16);
  const row = w.addStack(); row.centerAlignContent();
  const left = row.addStack(); left.layoutVertically();
  txt(left, dateStr, Font.boldSystemFont(12), SOFT);
  left.addSpacer(6);
  stamp(left, 34);
  row.addSpacer(18);
  const right = row.addStack(); right.layoutVertically();
  txt(right, title, Font.boldSystemFont(12), GOLD);
  right.addSpacer(4);
  const a = txt(right, advice, serif(17, true), CREAM);
  a.minimumScaleFactor = 0.6;
  right.addSpacer(8);
  colorDot(right, 12);
  right.addSpacer(2);
  txt(right, `幸運數字 ${luckyNum}　貴人 ${sign}`, Font.mediumSystemFont(12), SOFT);
} else {
  w.setPadding(18, 20, 18, 20);
  const top = w.addStack(); top.centerAlignContent();
  txt(top, title, Font.boldSystemFont(13), GOLD);
  top.addSpacer();
  txt(top, dateStr, Font.mediumSystemFont(12), SOFT);
  w.addSpacer();
  const mid = w.addStack(); mid.centerAlignContent();
  stamp(mid, 44);
  mid.addSpacer(18);
  const a = txt(mid, advice, serif(19, true), CREAM);
  a.minimumScaleFactor = 0.6; a.lineLimit = 3;
  w.addSpacer();
  for (const [label, n] of stars) { starRow(w, label, n); w.addSpacer(6); }
  w.addSpacer();
  const chips = w.addStack();
  chip(chips, "幸運數字", String(luckyNum));
  chips.addSpacer();
  chip(chips, "幸運食物", food);
  chips.addSpacer();
  chip(chips, "今日貴人", sign);
  w.addSpacer(8);
  colorDot(w, 12);
}

w.refreshAfterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1);
if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
