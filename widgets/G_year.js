// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: chart-bar;
// 今年進度條 小工具 for Scriptable (iOS)
// 小：今年 %＋12 個月格子　中：今年＋月／週　大：一年 365 個點＋季／月／週／今天

const dark = Device.isUsingDarkAppearance();
const BG = Color.dynamic(new Color("#F2F4F7"), new Color("#141414"));
const INK = Color.dynamic(new Color("#141414"), new Color("#F2F4F7"));
const SUB = Color.dynamic(new Color("#6B7280"), new Color("#9CA3AF"));
const FILL = new Color("#2FA36B");
// 畫在圖片裡的顏色沒辦法自動跟隨深淺模式，所以另外判斷
const TRACK_IMG = new Color(dark ? "#2C2C2C" : "#DDE1E7");
const TODAY = new Color("#E4572E");

// ===== 進度計算 =====
const now = new Date();
const y = now.getFullYear();
const m = now.getMonth();
const span = (a, b) => Math.min(1, Math.max(0, (now - a) / (b - a)));
const today = new Date(y, m, now.getDate());
const yearP = span(new Date(y, 0, 1), new Date(y + 1, 0, 1));
const q = Math.floor(m / 3);
const quarterP = span(new Date(y, q * 3, 1), new Date(y, q * 3 + 3, 1));
const monthP = span(new Date(y, m, 1), new Date(y, m + 1, 1));
const monday = new Date(y, m, now.getDate() - ((now.getDay() + 6) % 7));
const weekP = span(monday, new Date(monday.getTime() + 7 * 86400000));
const dayP = span(today, new Date(y, m, now.getDate() + 1));
const doy = Math.round((today - new Date(y, 0, 1)) / 86400000) + 1;
const left = Math.round((new Date(y + 1, 0, 1) - today) / 86400000) - 1;
const pct = (p) => `${Math.floor(p * 100)}%`;

function tagline(p) {
  if (p < 0.25) return "還來得及，一切都還來得及";
  if (p < 0.5) return "過一半之前還有救";
  if (p < 0.75) return "下半場，加油";
  if (p < 0.9) return "年初的目標……還記得嗎";
  return "明年再說吧";
}

// ===== 繪圖工具 =====
function bar(progress, width, height) {
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  const r = height / 2;
  const bg = new Path(); bg.addRoundedRect(new Rect(0, 0, width, height), r, r);
  ctx.addPath(bg); ctx.setFillColor(TRACK_IMG); ctx.fillPath();
  const fg = new Path(); fg.addRoundedRect(new Rect(0, 0, Math.max(height, width * progress), height), r, r);
  ctx.addPath(fg); ctx.setFillColor(FILL); ctx.fillPath();
  return ctx.getImage();
}
// 12 個月格子（小尺寸用）：過完的月份填滿，這個月填一部分
function monthGrid(width, compact) {
  const cols = compact ? 6 : 12, rows = compact ? 2 : 1;
  const gap = compact ? 4 : 5, cellH = compact ? 16 : 26;
  const cellW = (width - gap * (cols - 1)) / cols;
  const ctx = new DrawContext();
  ctx.size = new Size(width, rows * cellH + (rows - 1) * gap);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  for (let i = 0; i < 12; i++) {
    const x = (i % cols) * (cellW + gap), yy = Math.floor(i / cols) * (cellH + gap);
    const cell = new Path(); cell.addRoundedRect(new Rect(x, yy, cellW, cellH), 4, 4);
    ctx.addPath(cell); ctx.setFillColor(TRACK_IMG); ctx.fillPath();
    const f = i < m ? 1 : i === m ? monthP : 0;
    if (f > 0) {
      const p = new Path(); p.addRoundedRect(new Rect(x, yy, Math.max(4, cellW * f), cellH), 4, 4);
      ctx.addPath(p); ctx.setFillColor(FILL); ctx.fillPath();
    }
  }
  return ctx.getImage();
}
// 一年 365 個點：過去的天數填色，今天特別標示
function yearDots(width) {
  const total = Math.round((new Date(y + 1, 0, 1) - new Date(y, 0, 1)) / 86400000);
  const cols = 28, cell = width / cols, dot = cell - 3.5;
  const rowsN = Math.ceil(total / cols);
  const ctx = new DrawContext();
  ctx.size = new Size(width, rowsN * cell);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  for (let i = 0; i < total; i++) {
    const x = (i % cols) * cell, yy = Math.floor(i / cols) * cell;
    ctx.setFillColor(i < doy - 1 ? FILL : i === doy - 1 ? TODAY : TRACK_IMG);
    ctx.fillEllipse(new Rect(x, yy, dot, dot));
  }
  return ctx.getImage();
}
function txt(p, s, font, color) {
  const t = p.addText(s); t.font = font; t.textColor = color; return t;
}
// 一列：固定寬度標籤＋進度條＋固定寬度百分比，確保每列對齊
function row(parent, label, p, totalW, barH) {
  const LABEL_W = 48, PCT_W = 42, GAP = 8;
  const r = parent.addStack(); r.centerAlignContent();
  const l = r.addStack(); l.size = new Size(LABEL_W, 0);
  txt(l, label, Font.mediumSystemFont(12), SUB); l.addSpacer();
  r.addSpacer(GAP);
  r.addImage(bar(p, totalW - LABEL_W - PCT_W - GAP * 2, barH));
  r.addSpacer(GAP);
  const pc = r.addStack(); pc.size = new Size(PCT_W, 0); pc.addSpacer();
  txt(pc, pct(p), Font.semiboldSystemFont(12), INK);
}
function header(w, big) {
  const top = w.addStack(); top.bottomAlignContent();
  txt(top, pct(yearP), Font.heavySystemFont(big ? 56 : 40), INK);
  top.addSpacer(10);
  const col = top.addStack(); col.layoutVertically();
  txt(col, `${y} 還剩 ${left} 天`, Font.boldSystemFont(big ? 15 : 13), INK);
  const tg = txt(col, tagline(yearP), Font.mediumSystemFont(12), SUB);
  tg.lineLimit = 1; tg.minimumScaleFactor = 0.7;
  if (big) col.addSpacer(8); else col.addSpacer(4);
}

// ===== 組裝 =====
const W = 300; // 中、大尺寸的內容寬度
const w = new ListWidget();
w.backgroundColor = BG;
const family = config.widgetFamily || "large";

if (family === "small") {
  w.setPadding(14, 14, 14, 14);
  txt(w, `${y} 已經過了`, Font.boldSystemFont(11), SUB);
  txt(w, pct(yearP), Font.heavySystemFont(40), INK);
  w.addSpacer();
  w.addImage(monthGrid(130, true));
  w.addSpacer();
  txt(w, `還剩 ${left} 天`, Font.semiboldSystemFont(12), INK);
} else if (family === "medium") {
  w.setPadding(14, 16, 14, 16);
  header(w, false);
  w.addSpacer(6);
  w.addImage(bar(yearP, W, 10));
  w.addSpacer(8);
  row(w, "這個月", monthP, W, 6);
  w.addSpacer(4);
  row(w, "這週", weekP, W, 6);
} else {
  w.setPadding(18, 16, 18, 16);
  header(w, true);
  w.addSpacer(10);
  w.addImage(yearDots(W));
  w.addSpacer(6);
  const leg = w.addStack();
  txt(leg, `今天是第 ${doy} 天`, Font.semiboldSystemFont(11), FILL);
  leg.addSpacer();
  txt(leg, "一個點就是一天", Font.mediumSystemFont(11), SUB);
  w.addSpacer();
  row(w, "這一季", quarterP, W, 8);
  w.addSpacer(7);
  row(w, "這個月", monthP, W, 8);
  w.addSpacer(7);
  row(w, "這週", weekP, W, 8);
  w.addSpacer(7);
  row(w, "今天", dayP, W, 8);
}

w.refreshAfterDate = new Date(Date.now() + 60 * 60 * 1000);
if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
