// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: tags;
// 下班倒數・限時特賣版 小工具 for Scriptable (iOS)
// 把下班做成一場「限時特賣」：文案、配色、貼紙每個時段都會換
// 藍色系：上班前淡藍 → 上午天空藍 → 午休湖水綠 → 下午鈷藍 → 最後一小時電光藍 → 下班後深夜藍 → 週末長春花藍

// ===== 改成你自己的時間 =====
const WORK_START = [10, 0];  // 上班
const LUNCH = [12, 0];       // 午休開始
const LUNCH_END = [14, 0];   // 午休結束
const WORK_END = [18, 0];    // 下班
const PAYDAY = 5;            // 每月幾號發薪

// ===== 各時段的配色 =====
const THEMES = {
  before:  { bg: "#CDE8FF", ink: "#0B2545", pill: "#0B2545", pillInk: "#FFFFFF", pop: "#FFE45C" },
  morning: { bg: "#7CC8FF", ink: "#0B2545", pill: "#0B2545", pillInk: "#7CC8FF", pop: "#FFE45C" },
  lunch:   { bg: "#3FD0D4", ink: "#062A30", pill: "#062A30", pillInk: "#3FD0D4", pop: "#FFFFFF" },
  noon:    { bg: "#2F6BFF", ink: "#FFFFFF", pill: "#FFFFFF", pillInk: "#2F6BFF", pop: "#FFE45C" },
  final:   { bg: "#1238D6", ink: "#FFFFFF", pill: "#E8FF3C", pillInk: "#1238D6", pop: "#E8FF3C" },
  after:   { bg: "#0A1A3F", ink: "#FFFFFF", pill: "#4DE3FF", pillInk: "#0A1A3F", pop: "#4DE3FF" },
  weekend: { bg: "#6E8BFF", ink: "#FFFFFF", pill: "#FFFFFF", pillInk: "#3A55D8", pop: "#FFE45C" },
};

// ===== 文案：[標籤, 標題第一行, 標題第二行, 副標] =====
const COPY = {
  before:  ["尚未開賣", "距離上班", "還有一點點", "再賴五分鐘，不算遲到"],
  morning: ["早鳥時段", "今日自由", "預購中", "下班準時到貨，先撐到午餐"],
  lunch:   ["午間快閃", "午休限定", "吃飽再戰", "這段時間，誰都不能打擾你"],
  noon:    ["下午特賣", "下班倒數", "限時搶購", "自由庫存有限，撐住別放棄"],
  final:   ["最後一小時", "最後衝刺！", "錯過再等明天", "現在開始收東西，不算早退吧"],
  after:   ["今日完售", "自由已到貨", "請盡情使用", "工作訊息已讀不回，完全合法"],
  weekend: ["週末限定", "全館休息", "自由無限暢飲", "今天不用倒數，好好浪費時間"],
};
// 底部的廣告小字，每天換一句
const FINE_PRINT = [
  "※ 加班不在本活動範圍內", "※ 自由不可兌換現金", "※ 下班後回訊息，恕不退款",
  "※ 本優惠每天限量一份", "※ 開會時間不列入計算", "※ 摸魚請適量，祝您愉快",
  "※ 數量有限，下班請盡早離場", "※ 週一不適用快樂保證",
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

const T = THEMES[phase];
let [tagText, head1, head2, sub] = COPY[phase];
const toPay = (() => {
  let pay = new Date(now.getFullYear(), now.getMonth(), PAYDAY);
  if (pay < today) pay = new Date(now.getFullYear(), now.getMonth() + 1, PAYDAY);
  return Math.round((pay - today) / 86400000);
})();
if (day === 5 && !isWeekend) { tagText = "週五加碼"; if (phase !== "after") sub = "買一送二：再撐一下，送你兩天週末"; }
if (toPay === 0) tagText = "發薪日";
const toWeekend = isWeekend ? 0 : 6 - day;
const workP = Math.min(1, Math.max(0, (now - start) / (end - start)));
const pctText = phase === "weekend" ? "OFF" : phase === "before" ? "0%" : `${Math.floor(workP * 100)}%`;
const pctLabel = phase === "weekend" ? "全館休息" : phase === "after" ? "完售" : phase === "lunch" ? "午休中" : "已上班";
const fine = FINE_PRINT[(doy - 1) % FINE_PRINT.length];
const workdaysLeft = (() => {
  let n = (!isWeekend && now < end) ? 1 : 0;
  const d = new Date(today); d.setDate(d.getDate() + 1);
  while (d.getFullYear() === now.getFullYear()) { if (d.getDay() % 6 !== 0) n++; d.setDate(d.getDate() + 1); }
  return n;
})();

const C = (hex, a) => new Color(hex, a === undefined ? 1 : a);
const INK = C(T.ink);

// ===== 繪圖 =====
function ctxOf(w, h, opaque) {
  const c = new DrawContext(); c.size = new Size(w, h); c.opaque = !!opaque; c.respectScreenScale = true; return c;
}
// 背景：底色＋兩顆大圓＋淡淡斜線紋理
function background(w, h) {
  const c = ctxOf(w, h, true);
  c.setFillColor(C(T.bg)); c.fillRect(new Rect(0, 0, w, h));
  c.setFillColor(C("#FFFFFF", 0.16)); c.fillEllipse(new Rect(w * 0.55, -h * 0.35, w * 0.75, w * 0.75));
  c.setFillColor(C("#000000", 0.07)); c.fillEllipse(new Rect(-w * 0.25, h * 0.6, w * 0.6, w * 0.6));
  c.setFillColor(C("#FFFFFF", 0.07));
  for (let x = -h; x < w; x += 18) {
    const p = new Path();
    p.addLines([new Point(x, h), new Point(x + 6, h), new Point(x + 6 + h, 0), new Point(x + h, 0)]);
    p.closeSubpath(); c.addPath(p); c.fillPath();
  }
  return c.getImage();
}
// 爆炸貼紙（廣告常見的星形徽章），中間寫百分比
function starburst(size, big, small) {
  const c = ctxOf(size, size);
  const cx = size / 2, cy = size / 2, n = 14, r1 = size / 2, r2 = size / 2 * 0.84;
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI * i) / n - Math.PI / 2, r = i % 2 === 0 ? r1 : r2;
    pts.push(new Point(cx + r * Math.cos(a), cy + r * Math.sin(a)));
  }
  const p = new Path(); p.addLines(pts); p.closeSubpath();
  c.addPath(p); c.setFillColor(C(T.pop)); c.fillPath();
  c.setTextAlignedCenter();
  c.setTextColor(C("#1B1B1B"));
  c.setFont(Font.heavyRoundedSystemFont(size * 0.27));
  c.drawTextInRect(big, new Rect(0, size * 0.27, size, size * 0.34));
  c.setFont(Font.boldSystemFont(size * 0.12));
  c.drawTextInRect(small, new Rect(0, size * 0.6, size, size * 0.16));
  return c.getImage();
}
// 粗進度條：外框＋斜紋填色
function chunkyBar(progress, w, h) {
  const c = ctxOf(w, h);
  const r = h / 2;
  const track = new Path(); track.addRoundedRect(new Rect(0, 0, w, h), r, r);
  c.addPath(track); c.setFillColor(C(T.ink, 0.15)); c.fillPath();
  const fw = Math.max(h, w * progress);
  if (progress > 0) {
    const fill = new Path(); fill.addRoundedRect(new Rect(0, 0, fw, h), r, r);
    c.addPath(fill); c.setFillColor(C(T.pill)); c.fillPath();
    c.setFillColor(C(T.pillInk, 0.25));
    for (let x = -h; x < fw - h; x += 10) {
      const s = new Path();
      s.addLines([new Point(x, h), new Point(x + 4, h), new Point(x + 4 + h, 0), new Point(x + h, 0)]);
      s.closeSubpath(); c.addPath(s); c.fillPath();
    }
  }
  return c.getImage();
}

// ===== 元件 =====
function tag(p, s, size) {
  const b = p.addStack();
  b.backgroundColor = C(T.pill); b.cornerRadius = 6; b.setPadding(2, 8, 2, 8);
  txt(b, s, Font.heavySystemFont(size), C(T.pillInk));
}
// 倒數膠囊：上班中＝距離下班；上班前＝距離上班；下班後＝已經自由多久（正數計時）
function countdownPill(p, size) {
  const pill = p.addStack();
  pill.backgroundColor = C(T.pill); pill.cornerRadius = size * 0.45;
  pill.setPadding(size * 0.18, size * 0.45, size * 0.18, size * 0.45);
  pill.centerAlignContent();
  if (phase === "weekend") {
    txt(pill, "全天候自由", Font.heavySystemFont(size * 0.8), C(T.pillInk));
    return;
  }
  const label = phase === "before" ? "上班" : phase === "after" ? "已自由" : "剩";
  txt(pill, label + " ", Font.heavySystemFont(size * 0.45), C(T.pillInk, 0.8));
  const d = pill.addDate(phase === "before" ? start : end);
  d.applyTimerStyle();
  d.font = Font.heavyMonospacedSystemFont(size);
  d.textColor = C(T.pillInk);
  d.minimumScaleFactor = 0.5;
}
function sticker(p, big, small) {
  const s = p.addStack(); s.layoutVertically();
  s.backgroundColor = C("#FFFFFF"); s.cornerRadius = 12;
  s.borderColor = C("#1B1B1B"); s.borderWidth = 2;
  s.setPadding(5, 10, 5, 10);
  txt(s, big, Font.heavyRoundedSystemFont(17), C("#1B1B1B"));
  txt(s, small, Font.boldSystemFont(10), C("#1B1B1B", 0.6));
}

// ===== 組裝 =====
const SIZES = { small: [170, 170], medium: [360, 170], large: [360, 380] };
const [bw, bh] = SIZES[family] || SIZES.large;
const w = new ListWidget();
w.backgroundImage = background(bw, bh);
const dateStr = `${now.getMonth() + 1}/${now.getDate()} 週${WEEK[day]}`;

if (family === "small") {
  w.setPadding(12, 12, 12, 12);
  const top = w.addStack(); top.centerAlignContent();
  tag(top, tagText, 10);
  top.addSpacer();
  txt(top, pctText, Font.heavyRoundedSystemFont(13), INK);
  w.addSpacer(6);
  const h = txt(w, head1, Font.heavySystemFont(20), INK);
  h.lineLimit = 1; h.minimumScaleFactor = 0.6;
  w.addSpacer();
  countdownPill(w, 20);
  w.addSpacer(8);
  w.addImage(chunkyBar(phase === "after" ? 1 : workP, 130, 10));
} else if (family === "medium") {
  w.setPadding(14, 16, 14, 12);
  const row = w.addStack(); row.centerAlignContent();
  const left = row.addStack(); left.layoutVertically();
  const t = left.addStack(); t.centerAlignContent();
  tag(t, tagText, 11);
  t.addSpacer(8);
  txt(t, dateStr, Font.boldSystemFont(11), C(T.ink, 0.7));
  left.addSpacer(4);
  const h = txt(left, `${head1} ${head2}`, Font.heavySystemFont(22), INK);
  h.lineLimit = 1; h.minimumScaleFactor = 0.6;
  left.addSpacer(8);
  countdownPill(left, 26);
  left.addSpacer(8);
  left.addImage(chunkyBar(phase === "after" ? 1 : workP, 200, 10));
  row.addSpacer();
  row.addImage(starburst(96, pctText, pctLabel));
} else {
  w.setPadding(18, 18, 14, 18);
  const top = w.addStack(); top.centerAlignContent();
  tag(top, tagText, 13);
  top.addSpacer();
  txt(top, dateStr, Font.heavySystemFont(13), INK);
  w.addSpacer(8);
  const hero = w.addStack(); hero.centerAlignContent();
  const hl = hero.addStack(); hl.layoutVertically();
  const a = txt(hl, head1, Font.heavySystemFont(34), INK); a.lineLimit = 1; a.minimumScaleFactor = 0.6;
  const b = txt(hl, head2, Font.heavySystemFont(34), INK); b.lineLimit = 1; b.minimumScaleFactor = 0.6;
  hero.addSpacer();
  hero.addImage(starburst(92, pctText, pctLabel));
  w.addSpacer(4);
  txt(w, sub, Font.boldSystemFont(13), C(T.ink, 0.8)).lineLimit = 1;
  w.addSpacer();
  countdownPill(w, 40);
  w.addSpacer(10);
  w.addImage(chunkyBar(phase === "after" ? 1 : workP, W, 16));
  w.addSpacer(3);
  const tl = w.addStack();
  const pad = (n) => String(n).padStart(2, "0");
  txt(tl, `${pad(WORK_START[0])}:${pad(WORK_START[1])} 開賣`, Font.boldSystemFont(10), C(T.ink, 0.7));
  tl.addSpacer();
  txt(tl, `${pad(WORK_END[0])}:${pad(WORK_END[1])} 自由到貨`, Font.boldSystemFont(10), C(T.ink, 0.7));
  w.addSpacer();
  const st = w.addStack();
  sticker(st, isWeekend ? "就是今天" : `${toWeekend} 天`, isWeekend ? "週末" : "週末倒數");
  st.addSpacer();
  sticker(st, toPay === 0 ? "今天！" : `${toPay} 天`, "發薪倒數");
  st.addSpacer();
  sticker(st, `${workdaysLeft} 天`, "今年剩餘工作日");
  w.addSpacer(8);
  txt(w, fine, Font.mediumSystemFont(10), C(T.ink, 0.65));
}

// 時段切換點到了就提早更新，平常 10 分鐘一次
let next = new Date(Date.now() + 10 * 60 * 1000);
for (const t of [start, lunch, lunchEnd, lastHour, end]) if (t > now && t < next) next = new Date(t.getTime() + 20000);
w.refreshAfterDate = next;
if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
