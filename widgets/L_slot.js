// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: dice;
// 下班爆分機 小工具 for Scriptable (iOS)
// 老虎機風格的下班倒數：每次更新都會「轉」出新盤面，下班就是你的 Free Game
// 純屬娛樂，沒有任何下注或真錢

// ===== 改成你自己的時間 =====
const WORK_START = [10, 0];  // 上班
const WORK_END = [18, 0];    // 下班
const PAYDAY = 5;            // 每月幾號發薪

// ===== 盤面符號：[符號, 連線時的獎勵文字] =====
const SYMBOLS = [
  ["☕", "咖啡因 +100%"], ["💰", "薪水又近了一天"], ["🍱", "午餐加一顆滷蛋"],
  ["🧋", "全糖加珍珠"], ["💻", "bug 自動消除"], ["🛌", "今晚提早睡"],
  ["🪲", "聖甲蟲保佑準時下班"], ["👁️", "老闆沒看到你摸魚"], ["💎", "今天閃閃發光"],
];
// 倍數球：[倍數, 機率權重, 顏色]
const ORBS = [[2, 40, "#3FA9F5"], [5, 28, "#2ECC71"], [10, 16, "#9B59B6"],
  [50, 9, "#E67E22"], [100, 5, "#E74C3C"], [500, 2, "#F1C40F"]];
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
// ===== 時間 =====
const at = (hm) => { const x = new Date(now); x.setHours(hm[0], hm[1], 0, 0); return x; };
const start = at(WORK_START), end = at(WORK_END);
const day = now.getDay();
const isWeekend = day === 0 || day === 6;
const phase = isWeekend ? "weekend" : now < start ? "before" : now >= end ? "after" : "work";
const toPay = (() => {
  let pay = new Date(now.getFullYear(), now.getMonth(), PAYDAY);
  if (pay < today) pay = new Date(now.getFullYear(), now.getMonth() + 1, PAYDAY);
  return Math.round((pay - today) / 86400000);
})();

// ===== 轉盤：每 10 分鐘一個新盤面 =====
const r = rng(hash(`slot-${Math.floor(Date.now() / 600000)}`));
function spin(cols, rows, orbCount) {
  const cells = [];
  for (let i = 0; i < cols * rows; i++) cells.push({ s: Math.floor(r() * SYMBOLS.length) });
  const total = ORBS.reduce((s, o) => s + o[1], 0);
  const used = new Set();
  for (let k = 0; k < orbCount; k++) {
    let i; do { i = Math.floor(r() * cells.length); } while (used.has(i));
    used.add(i);
    let x = r() * total, orb = ORBS[0];
    for (const o of ORBS) { if ((x -= o[1]) < 0) { orb = o; break; } }
    cells[i] = { orb };
  }
  const counts = {};
  cells.forEach((c) => { if (c.s !== undefined) counts[c.s] = (counts[c.s] || 0) + 1; });
  const best = Number(Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0]);
  const mult = cells.reduce((s, c) => s + (c.orb ? c.orb[0] : 0), 0);
  return { cells, cols, rows, best, bestCount: counts[best], mult };
}

const GOLD = new Color("#FFD86B");
const GOLD2 = new Color("#E3A21A");
const CREAM = new Color("#FFF3D1");
const SOFT = new Color("#FFF3D1", 0.65);

// ===== 繪圖 =====
function background(w, h) {
  const c = new DrawContext();
  c.size = new Size(w, h); c.opaque = true; c.respectScreenScale = true;
  c.setFillColor(new Color("#160A2B")); c.fillRect(new Rect(0, 0, w, h));
  c.setFillColor(new Color("#6B2BD9", 0.35)); c.fillEllipse(new Rect(-w * 0.3, -h * 0.4, w * 1.6, h * 1.2));
  c.setFillColor(new Color("#160A2B", 0.55)); c.fillRect(new Rect(0, h * 0.55, w, h * 0.45));
  // 金色細框
  const p = new Path(); p.addRoundedRect(new Rect(4, 4, w - 8, h - 8), 18, 18);
  c.addPath(p); c.setStrokeColor(new Color("#FFD86B", 0.55)); c.setLineWidth(2); c.strokePath();
  return c.getImage();
}
function board(res, w, h) {
  const { cells, cols, rows, best } = res;
  const c = new DrawContext();
  c.size = new Size(w, h); c.opaque = false; c.respectScreenScale = true;
  const frame = new Path(); frame.addRoundedRect(new Rect(0, 0, w, h), 12, 12);
  c.addPath(frame); c.setFillColor(new Color("#000000", 0.35)); c.fillPath();
  c.addPath(frame); c.setStrokeColor(GOLD2); c.setLineWidth(2); c.strokePath();
  const pad = 6, gap = 4;
  const cw = (w - pad * 2 - gap * (cols - 1)) / cols, ch = (h - pad * 2 - gap * (rows - 1)) / rows;
  const fs = Math.min(cw, ch) * 0.62;
  c.setTextAlignedCenter();
  cells.forEach((cell, i) => {
    const x = pad + (i % cols) * (cw + gap), y = pad + Math.floor(i / cols) * (ch + gap);
    const box = new Path(); box.addRoundedRect(new Rect(x, y, cw, ch), 7, 7);
    if (cell.orb) {
      const d = Math.min(cw, ch) * 0.9;
      c.setFillColor(new Color(cell.orb[2]));
      c.fillEllipse(new Rect(x + (cw - d) / 2, y + (ch - d) / 2, d, d));
      c.setFillColor(new Color("#FFFFFF", 0.35));
      c.fillEllipse(new Rect(x + (cw - d) / 2 + d * 0.18, y + (ch - d) / 2 + d * 0.1, d * 0.4, d * 0.25));
      c.setFont(Font.heavyRoundedSystemFont(d * 0.36));
      c.setTextColor(new Color("#FFFFFF"));
      c.drawTextInRect(`x${cell.orb[0]}`, new Rect(x, y + ch / 2 - d * 0.24, cw, d * 0.5));
    } else {
      const win = cell.s === best;
      c.addPath(box); c.setFillColor(new Color(win ? "#FFD86B" : "#FFFFFF", win ? 0.22 : 0.06)); c.fillPath();
      if (win) { c.addPath(box); c.setStrokeColor(GOLD); c.setLineWidth(1.5); c.strokePath(); }
      c.setFont(Font.systemFont(fs));
      c.drawTextInRect(SYMBOLS[cell.s][0], new Rect(x, y + (ch - fs * 1.2) / 2, cw, fs * 1.3));
    }
  });
  return c.getImage();
}
function goldText(p, s, font, color) {
  const t = txt(p, s, font, color || GOLD);
  t.shadowColor = new Color("#FFB000", 0.7); t.shadowRadius = 4;
  t.lineLimit = 1; t.minimumScaleFactor = 0.5;
  return t;
}
// 倒數：上班中＝Free Game 倒數到下班；下班後＝已爆分多久
function countdown(p, size) {
  const row = p.addStack(); row.bottomAlignContent();
  if (phase === "weekend") { goldText(row, "週末 FREE GAME 中", Font.heavySystemFont(size * 0.6)); return; }
  const d = row.addDate(phase === "before" ? start : end);
  d.applyTimerStyle();
  d.font = Font.heavyMonospacedSystemFont(size);
  d.textColor = CREAM;
  d.shadowColor = new Color("#FFB000", 0.7); d.shadowRadius = 4;
  d.lineLimit = 1; d.minimumScaleFactor = 0.5;
}
const label = { before: "距離開機", work: "FREE GAME 倒數", after: "爆分！已下班", weekend: "免費遊戲進行中" }[phase];

// ===== 組裝 =====
const SIZES = { small: [170, 170], medium: [360, 170], large: [360, 380] };
const [bw, bh] = SIZES[family] || SIZES.large;
const w = new ListWidget();
w.backgroundImage = background(bw, bh);

if (family === "small") {
  const res = spin(4, 3, 2);
  w.setPadding(12, 12, 12, 12);
  goldText(w, label, Font.heavySystemFont(11));
  w.addSpacer(4);
  w.addImage(board(res, 136, 72));
  w.addSpacer();
  countdown(w, 24);
} else if (family === "medium") {
  const res = spin(5, 3, 3);
  w.setPadding(12, 14, 12, 14);
  const row = w.addStack(); row.centerAlignContent();
  row.addImage(board(res, 160, 116));
  row.addSpacer(12);
  const rt = row.addStack(); rt.layoutVertically();
  goldText(rt, "下班爆分機", Font.heavySystemFont(16));
  rt.addSpacer(2);
  txt(rt, label, Font.boldSystemFont(11), SOFT);
  rt.addSpacer(2);
  countdown(rt, 30);
  rt.addSpacer(6);
  const win = txt(rt, `${SYMBOLS[res.best][0]}×${res.bestCount}　${SYMBOLS[res.best][1]}`, Font.semiboldSystemFont(11), CREAM);
  win.lineLimit = 1; win.minimumScaleFactor = 0.6;
} else {
  const res = spin(6, 5, 4);
  w.setPadding(16, 16, 14, 16);
  const top = w.addStack(); top.centerAlignContent();
  goldText(top, "下班爆分機", Font.heavySystemFont(20));
  top.addSpacer();
  txt(top, `總倍數 x${res.mult}`, Font.heavyRoundedSystemFont(14), GOLD).lineLimit = 1;
  w.addSpacer(8);
  w.addImage(board(res, W, 176));
  w.addSpacer(8);
  const win = w.addStack(); win.centerAlignContent();
  goldText(win, `${SYMBOLS[res.best][0]} ×${res.bestCount} 消除！`, Font.heavySystemFont(14));
  win.addSpacer(8);
  const wt = txt(win, `獎勵：${SYMBOLS[res.best][1]}`, Font.semiboldSystemFont(13), CREAM);
  wt.lineLimit = 1; wt.minimumScaleFactor = 0.6;
  w.addSpacer();
  const bottom = w.addStack(); bottom.bottomAlignContent();
  const cd = bottom.addStack(); cd.layoutVertically();
  txt(cd, label, Font.boldSystemFont(11), SOFT);
  countdown(cd, 32);
  bottom.addSpacer();
  const side = bottom.addStack(); side.layoutVertically();
  txt(side, isWeekend ? "週末進行中" : `週末還有 ${6 - day} 天`, Font.semiboldSystemFont(11), SOFT);
  txt(side, toPay === 0 ? "今天發薪 💰" : `發薪還有 ${toPay} 天`, Font.semiboldSystemFont(11), SOFT);
  w.addSpacer(6);
  txt(w, "※ 純屬娛樂，沒有任何下注或真錢", Font.systemFont(9), new Color("#FFF3D1", 0.45));
}

// 每 10 分鐘轉一次新盤面，上下班時間點提早更新
let next = new Date(Date.now() + 10 * 60 * 1000);
for (const t of [start, end]) if (t > now && t < next) next = new Date(t.getTime() + 20000);
w.refreshAfterDate = next;
if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
