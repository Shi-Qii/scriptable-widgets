// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: clock;
// 下班倒數 小工具 for Scriptable (iOS)
// 小：倒數＋週末／發薪　中：再加狀態語和進度條　大：再加本週進度、今天已工作時間、今年剩餘工作日

// ===== 改成你自己的時間 =====
const WORK_START = [9, 0];   // 上班 09:00
const WORK_END = [18, 0];    // 下班 18:00
const PAYDAY = 5;            // 每月幾號發薪

// ===== 外觀 =====
const BG = new Color("#14213D");
const ACCENT = new Color("#FCA311");
const WHITE = new Color("#FFFFFF");
const SOFT = new Color("#FFFFFF", 0.62);
const CHIP = new Color("#FFFFFF", 0.08);
const TRACK = new Color("#FFFFFF", 0.15);

// ===== 時間計算 =====
const now = new Date();
const day = now.getDay();
const isWeekend = day === 0 || day === 6;
const at = (d, hm) => { const x = new Date(d); x.setHours(hm[0], hm[1], 0, 0); return x; };
const start = at(now, WORK_START);
const end = at(now, WORK_END);
const working = !isWeekend && now >= start && now < end;
const beforeWork = !isWeekend && now < start;
const afterWork = !isWeekend && now >= end;
const dayP = Math.min(1, Math.max(0, (now - start) / (end - start)));
const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const pad = (n) => String(n).padStart(2, "0");
const hm = (a) => `${pad(a[0])}:${pad(a[1])}`;

const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const toWeekend = isWeekend ? 0 : 6 - day;
function daysToPayday() {
  let pay = new Date(now.getFullYear(), now.getMonth(), PAYDAY);
  if (pay < today) pay = new Date(now.getFullYear(), now.getMonth() + 1, PAYDAY);
  return Math.round((pay - today) / 86400000);
}
const toPay = daysToPayday();
function workdaysLeft() {
  let n = (!isWeekend && now < end) ? 1 : 0;
  const d = new Date(today);
  d.setDate(d.getDate() + 1);
  while (d.getFullYear() === now.getFullYear()) {
    if (d.getDay() !== 0 && d.getDay() !== 6) n++;
    d.setDate(d.getDate() + 1);
  }
  return n;
}
function quip() {
  if (isWeekend) return "週末快樂，今天不用倒數";
  if (afterWork) return "下班了，工作留在公司";
  if (beforeWork) return "還沒上班，再賴一下";
  const h = now.getHours();
  if (h < 12) return "撐到午餐就好";
  if (h < 13) return "午休時間，好好吃飯";
  if (dayP < 0.85) return "下午也要撐住";
  return "最後衝刺！";
}
const head = day === 5 && !afterWork ? "今天星期五！" : `${now.getMonth() + 1}/${now.getDate()} 星期${WEEK[day]}`;

// ===== 繪圖 =====
function newCtx(w, h) {
  const c = new DrawContext();
  c.size = new Size(w, h); c.opaque = false; c.respectScreenScale = true;
  return c;
}
function rr(c, x, y, w, h, r, color) {
  const p = new Path(); p.addRoundedRect(new Rect(x, y, w, h), r, r);
  c.addPath(p); c.setFillColor(color); c.fillPath();
}
function bar(progress, width, height) {
  const c = newCtx(width, height);
  rr(c, 0, 0, width, height, height / 2, TRACK);
  if (progress > 0) rr(c, 0, 0, Math.max(height, width * progress), height, height / 2, ACCENT);
  return c.getImage();
}
// 本週一到五，每天一格
function weekStrip(width) {
  const gap = 6, cellH = 22, labelH = 15;
  const cw = (width - gap * 4) / 5;
  const c = newCtx(width, cellH + 4 + labelH);
  c.setFont(Font.mediumSystemFont(11));
  c.setTextAlignedCenter();
  for (let i = 0; i < 5; i++) {
    const wd = i + 1, x = i * (cw + gap);
    rr(c, x, 0, cw, cellH, 6, TRACK);
    let f = 0;
    if (isWeekend || wd < day) f = 1;
    else if (wd === day) f = afterWork ? 1 : dayP;
    if (f > 0) rr(c, x, 0, Math.max(6, cw * f), cellH, 6, ACCENT);
    c.setTextColor(wd === day ? ACCENT : SOFT);
    c.drawTextInRect(WEEK[wd], new Rect(x, cellH + 4, cw, labelH));
  }
  return c.getImage();
}
function txt(p, s, font, color) {
  const t = p.addText(s); t.font = font; t.textColor = color; return t;
}
function stat(p, num, label, bg) {
  const s = p.addStack(); s.layoutVertically();
  if (bg) { s.backgroundColor = CHIP; s.cornerRadius = 10; s.setPadding(6, 10, 6, 10); }
  txt(s, String(num), Font.boldRoundedSystemFont(bg ? 18 : 17), WHITE);
  txt(s, label, Font.mediumSystemFont(10), SOFT);
  return s;
}
const payLabel = toPay === 0 ? ["今天", "發薪日！"] : [toPay, "天後發薪"];
const weekLabel = isWeekend ? ["0", "正在週末"] : [toWeekend, "天後週末"];

// 主要區塊：倒數或狀態
function mainBlock(w, timerSize, statusSize) {
  if (working || beforeWork) {
    txt(w, beforeWork ? "距離上班" : "距離下班", Font.mediumSystemFont(12), SOFT);
    const d = w.addDate(beforeWork ? start : end);
    d.applyTimerStyle();
    d.font = Font.heavyMonospacedSystemFont(timerSize);
    d.textColor = WHITE;
    d.minimumScaleFactor = 0.6;
  } else {
    txt(w, isWeekend ? "週末" : "已下班", Font.heavySystemFont(statusSize), ACCENT);
  }
}

// ===== 組裝 =====
const W = 300;
const w = new ListWidget();
w.backgroundColor = BG;
const family = config.widgetFamily || "large";

if (family === "small") {
  w.setPadding(14, 14, 14, 14);
  txt(w, head, Font.boldSystemFont(12), day === 5 ? ACCENT : SOFT);
  w.addSpacer();
  mainBlock(w, 26, 28);
  w.addSpacer(6);
  w.addImage(bar(working ? dayP : (afterWork || isWeekend ? 1 : 0), 128, 8));
  w.addSpacer();
  const r = w.addStack();
  stat(r, weekLabel[0], weekLabel[1], false);
  r.addSpacer();
  stat(r, payLabel[0], payLabel[1], false);
} else if (family === "medium") {
  w.setPadding(14, 16, 14, 16);
  const top = w.addStack();
  txt(top, head, Font.boldSystemFont(12), day === 5 ? ACCENT : SOFT);
  top.addSpacer();
  txt(top, quip(), Font.mediumSystemFont(12), ACCENT);
  w.addSpacer();
  const row = w.addStack(); row.bottomAlignContent();
  const left = row.addStack(); left.layoutVertically();
  mainBlock(left, 36, 34);
  row.addSpacer();
  const right = row.addStack(); right.layoutVertically();
  stat(right, weekLabel[0], weekLabel[1], true);
  right.addSpacer(6);
  stat(right, payLabel[0], payLabel[1], true);
  w.addSpacer(8);
  w.addImage(bar(working ? dayP : (afterWork || isWeekend ? 1 : 0), W, 8));
} else {
  w.setPadding(18, 16, 18, 16);
  const top = w.addStack();
  txt(top, head, Font.boldSystemFont(13), day === 5 ? ACCENT : SOFT);
  top.addSpacer();
  txt(top, quip(), Font.semiboldSystemFont(13), ACCENT);
  w.addSpacer();
  mainBlock(w, 50, 48);
  w.addSpacer(8);
  w.addImage(bar(working ? dayP : (afterWork || isWeekend ? 1 : 0), W, 12));
  w.addSpacer(4);
  const t = w.addStack();
  txt(t, hm(WORK_START), Font.mediumSystemFont(10), SOFT);
  t.addSpacer();
  txt(t, hm(WORK_END), Font.mediumSystemFont(10), SOFT);
  if (working) {
    w.addSpacer(6);
    const mins = Math.floor((now - start) / 60000);
    txt(w, `今天已經上班 ${Math.floor(mins / 60)} 小時 ${mins % 60} 分`, Font.mediumSystemFont(12), SOFT);
  }
  w.addSpacer();
  txt(w, "這週", Font.boldSystemFont(12), SOFT);
  w.addSpacer(6);
  w.addImage(weekStrip(W));
  w.addSpacer();
  const r = w.addStack();
  stat(r, weekLabel[0], weekLabel[1], true);
  r.addSpacer();
  stat(r, payLabel[0], payLabel[1], true);
  r.addSpacer();
  stat(r, workdaysLeft(), "今年剩餘工作日", true);
}

// 更新時間：最晚 15 分鐘，遇到上下班時間點就提早更新
let next = new Date(Date.now() + 15 * 60 * 1000);
for (const t of [start, end]) if (t > now && t < next) next = new Date(t.getTime() + 30000);
w.refreshAfterDate = next;
if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
