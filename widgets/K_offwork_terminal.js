// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: terminal;
// 下班倒數・黑底終端機版 小工具 for Scriptable (iOS)
// 終端機風格：指令列、註解、HTTP 狀態碼、ASCII 進度條、每天一則 commit message
// 黑底＋視窗標題列＋掃描線＋螢光字發光，字的顏色依時段變化

// ===== 改成你自己的時間 =====
const WORK_START = [10, 0];  // 上班
const LUNCH = [12, 0];       // 午休開始
const LUNCH_END = [14, 0];   // 午休結束
const WORK_END = [18, 0];    // 下班
const PAYDAY = 5;            // 每月幾號發薪

// ===== 字體：menlo（經典終端機，預設）／courier（復古打字機）／sf（iOS 系統等寬） =====
const FONT_STYLE = "menlo";

// ===== 各時段：[背景, 亮色, 狀態碼, 註解] =====
const PHASES = {
  before:  ["#0B0B0B", "#9AA0A6", "503 尚未上線", "// 系統開機中，再睡五分鐘"],
  morning: ["#0B0B0B", "#39FF6A", "102 處理中", "// TODO: 先撐到午餐"],
  lunch:   ["#0B0B0B", "#5FF2D4", "200 午休中", "// break; 吃飯最大"],
  noon:    ["#0B0B0B", "#39FF6A", "202 撐住中", "// while (!下班) 撐住();"],
  final:   ["#0B0B0B", "#FFD23F", "429 太想下班", "// 最後一小時，git stash 一切"],
  after:   ["#0B0B0B", "#4DE3FF", "200 OK 已下班", "// 自由已部署到 production"],
  weekend: ["#0B0B0B", "#FF7AD9", "418 我是茶壺", "// 週末模式 ON，今天不上班"],
};
// 每天一則 commit message
const COMMITS = [
  "今天也活下來了", "fix: 修好昨天的自己", "feat: 新增下班功能", "refactor: 重構心情",
  "chore: 記得喝水", "docs: 補上今天的藉口", "revert: 撤回想辭職的念頭", "perf: 午餐吃快一點",
  "test: 測試老闆的耐心", "hotfix: 再一杯咖啡", "WIP: 人生", "merge: 工作與生活（衝突中）",
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
// ===== 時間與時段 =====
const at = (hm) => { const x = new Date(now); x.setHours(hm[0], hm[1], 0, 0); return x; };
const start = at(WORK_START), end = at(WORK_END), lunch = at(LUNCH), lunchEnd = at(LUNCH_END);
const lastHour = new Date(end.getTime() - 3600000);
const day = now.getDay();
const isWeekend = day === 0 || day === 6;
let phase;
if (isWeekend) phase = "weekend";
else if (now < start) phase = "before";
else if (now >= end) phase = "after";
else if (now >= lastHour) phase = "final";
else if (now >= lunch && now < lunchEnd) phase = "lunch";
else if (now < lunch) phase = "morning";
else phase = "noon";

let [bgHex, accHex, status, comment] = PHASES[phase];
if (day === 5 && !isWeekend && phase !== "after") comment = "// 週五：明天起 cron 停機兩天";
const toPay = (() => {
  let pay = new Date(now.getFullYear(), now.getMonth(), PAYDAY);
  if (pay < today) pay = new Date(now.getFullYear(), now.getMonth() + 1, PAYDAY);
  return Math.round((pay - today) / 86400000);
})();
const toWeekend = isWeekend ? 0 : 6 - day;
const workP = phase === "after" || phase === "weekend" ? 1 : phase === "before" ? 0 : Math.min(1, Math.max(0, (now - start) / (end - start)));
const commit = COMMITS[(doy - 1) % COMMITS.length];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dateStr = `${now.getMonth() + 1}/${now.getDate()} ${DOW[day]}`;

const WHITE = new Color("#E8E8E8");
const DIM = new Color("#FFFFFF", 0.42);
const ACC = new Color(accHex);
const FONTS = {
  menlo: ["Menlo-Regular", "Menlo-Bold"],
  courier: ["CourierNewPSMT", "CourierNewPS-BoldMT"],
};
const mono = (size, weight) => {
  const f = FONTS[FONT_STYLE];
  if (f) return new Font(weight ? f[1] : f[0], size);
  if (weight === "heavy") return Font.heavyMonospacedSystemFont(size);
  if (weight === "bold") return Font.boldMonospacedSystemFont(size);
  return Font.regularMonospacedSystemFont(size);
};

// 背景：純黑＋淡淡掃描線，像老式螢幕
function background(w, h) {
  const c = new DrawContext();
  c.size = new Size(w, h); c.opaque = true; c.respectScreenScale = true;
  c.setFillColor(new Color(bgHex)); c.fillRect(new Rect(0, 0, w, h));
  c.setFillColor(new Color("#FFFFFF", 0.03));
  for (let y = 0; y < h; y += 3) c.fillRect(new Rect(0, y, w, 1));
  return c.getImage();
}
// 螢光發光效果
function glow(t, strength) {
  t.shadowColor = new Color(accHex, strength || 0.6);
  t.shadowRadius = 4;
  return t;
}
// 視窗標題列：紅黃綠三顆點＋標題
function titleBar(p, size, title) {
  const row = p.addStack(); row.centerAlignContent();
  for (const hex of ["#FF5F57", "#FEBC2E", "#28C840"]) {
    const d = row.addStack(); d.size = new Size(size, size); d.cornerRadius = size / 2;
    d.backgroundColor = new Color(hex);
    row.addSpacer(size * 0.6);
  }
  row.addSpacer();
  if (title) { const t = txt(row, title, mono(size, "bold"), DIM); t.lineLimit = 1; t.minimumScaleFactor = 0.7; }
  return row;
}
// ASCII 進度條：[████████░░░░] 62%
function asciiBar(p, cells, size) {
  const filled = Math.round(workP * cells);
  const row = p.addStack(); row.centerAlignContent();
  txt(row, "[", mono(size, "bold"), DIM);
  if (filled > 0) glow(txt(row, "█".repeat(filled), mono(size, "bold"), ACC), 0.5);
  if (cells - filled > 0) txt(row, "░".repeat(cells - filled), mono(size, "bold"), DIM);
  txt(row, phase === "weekend" ? "] OFF" : `] ${Math.floor(workP * 100)}%`, mono(size, "bold"), WHITE);
}
function prompt(p, size, short) {
  const row = p.addStack(); row.centerAlignContent();
  const a = txt(row, short ? "$ " : "~ $ ", mono(size, "bold"), ACC);
  const b = txt(row, short ? "./下班" : "./下班.sh", mono(size, "bold"), WHITE);
  const c = glow(txt(row, "▍", mono(size, "bold"), ACC));
  for (const t of [a, b, c]) { t.lineLimit = 1; t.minimumScaleFactor = 0.7; }
  return row;
}
// 倒數：上面一行是變數名稱，下面是大數字
function timer(p, size, showLabel) {
  if (showLabel) {
    const name = phase === "before" ? "boot_in" : phase === "after" ? "free_for" : phase === "weekend" ? "mode" : "time_left";
    const l = p.addStack();
    txt(l, name, mono(size * 0.26, "bold"), ACC);
    txt(l, " =", mono(size * 0.26, "bold"), DIM);
    p.addSpacer(2);
  }
  const row = p.addStack(); row.bottomAlignContent();
  if (phase === "weekend") {
    const t = glow(txt(row, "weekend", mono(size * 0.8, "heavy"), ACC), 0.7);
    t.lineLimit = 1; t.minimumScaleFactor = 0.5;
  } else {
    const d = row.addDate(phase === "before" ? start : end);
    d.applyTimerStyle();
    d.font = mono(size, "heavy");
    d.textColor = ACC;
    glow(d, 0.7);
    d.lineLimit = 1;
    d.minimumScaleFactor = 0.4;
  }
}
function log(p, s, size, color) {
  const t = txt(p, s, mono(size), color || WHITE);
  t.lineLimit = 1; t.minimumScaleFactor = 0.6;
  return t;
}

// ===== 組裝 =====
const SIZES = { small: [170, 170], medium: [360, 170], large: [360, 380] };
const [bw, bh] = SIZES[family] || SIZES.large;
const w = new ListWidget();
w.backgroundImage = background(bw, bh);

if (family === "small") {
  w.setPadding(12, 12, 12, 12);
  titleBar(w, 7, "");
  w.addSpacer(8);
  const top = prompt(w, 12, true);
  top.addSpacer();
  txt(top, status.split(" ")[0], mono(12, "heavy"), ACC);
  w.addSpacer();
  timer(w, 30, false);
  w.addSpacer(6);
  asciiBar(w, 8, 11);
  w.addSpacer();
  log(w, comment, 10, DIM);
} else if (family === "medium") {
  w.setPadding(12, 16, 14, 16);
  titleBar(w, 8, `zsh — ${dateStr}`);
  w.addSpacer(6);
  prompt(w, 13, false);
  w.addSpacer();
  timer(w, 44, true);
  w.addSpacer(6);
  const b = w.addStack(); b.centerAlignContent();
  asciiBar(b, 14, 13);
  b.addSpacer();
  txt(b, status.split(" ")[0], mono(13, "heavy"), ACC);
} else {
  w.setPadding(14, 18, 16, 18);
  titleBar(w, 10, `zsh — ${dateStr}`);
  w.addSpacer(10);
  prompt(w, 15, false);
  w.addSpacer(6);
  log(w, comment, 13, DIM);
  w.addSpacer();
  timer(w, 62, true);
  w.addSpacer(10);
  asciiBar(w, 18, 15);
  w.addSpacer();
  const sep = w.addStack(); sep.size = new Size(W, 1); sep.backgroundColor = new Color("#FFFFFF", 0.15);
  w.addSpacer(10);
  const s = w.addStack();
  log(s, "> status: ", 12, DIM);
  glow(log(s, status, 12, ACC), 0.5);
  w.addSpacer(4);
  log(w, toPay === 0 ? "> 發薪日：balance += salary 🎉" : `> weekend ${isWeekend ? "is now" : "in " + toWeekend + "d"} | payday in ${toPay}d`, 12);
  w.addSpacer(4);
  log(w, `> git commit -m "${commit}"`, 12);
}

// 時段切換點到了就提早更新，平常 10 分鐘一次
let next = new Date(Date.now() + 10 * 60 * 1000);
for (const t of [start, lunch, lunchEnd, lastHour, end]) if (t > now && t < next) next = new Date(t.getTime() + 20000);
w.refreshAfterDate = next;
if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
