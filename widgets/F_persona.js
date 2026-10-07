// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: user-astronaut;
// 今日人設 小工具 for Scriptable (iOS)
// 每天一張角色卡：稀有度、人設、能力值、技能、弱點、今日台詞
// 「編輯小工具」的 Parameter 填名字，每個人抽到的不一樣

const ROLES = [
  "會議室裡的盆栽", "默默充電的行動電源", "飲水機旁的哲學家",
  "被遺忘在冰箱的便當", "永遠在讀取中的進度條", "群組裡的已讀機器",
  "電梯裡最安靜的人", "一隻假裝在工作的企鵝", "便利商店的集點卡",
  "剛搖好的珍奶", "週一早上的鬧鐘", "沒帶傘的路人甲",
  "印表機卡紙專家", "自帶 BGM 的主角", "辦公室的冷氣遙控器",
  "一顆很有想法的滷蛋", "正在更新的電腦", "迷路的外送員",
  "會說話的計算機", "沒電的藍牙耳機", "宇宙派來的觀察員",
  "情緒穩定的水豚", "關東煮裡的蘿蔔", "低調的掃地機器人",
  "準時下班的傳說", "抽屜裡的備用充電線", "「最終版_v3」檔案",
  "夜市的彈珠台", "公園裡的鴿子領袖", "剛出爐的菠蘿麵包",
];
const SKILLS = [
  "隱形術", "秒回訊息", "把事情拖到明天", "在會議中保持清醒",
  "一眼看出誰要請客", "準時下班", "讓 bug 自己消失", "靠一杯咖啡撐一天",
  "找到最短的結帳隊伍", "假裝很忙", "把任何話題轉到食物", "三秒入睡",
  "記住所有人的生日", "用貼圖結束對話", "找到停車位",
];
const WEAK = [
  "看到甜點", "被叫全名", "星期一", "長輩圖", "沒有 Wi-Fi",
  "突然的電話", "「可以幫我看一下嗎」", "冷氣太冷", "排隊",
  "手機剩 5% 電", "忘記密碼", "「我們來對一下」", "下午三點的睏意",
  "打折", "貓",
];
const LINES = [
  "我不是在發呆，我在讀取。", "先吃飯，其他的等等再說。", "這個我下午再處理。",
  "沒事，我很好，真的。", "讓我想想……好，我不想了。", "我只是看起來很忙。",
  "等我喝完這杯再說。", "人生苦短，先點飲料。", "我的電量只剩 20%。",
  "不要問，問就是在努力。", "下班之後我是另一個人。", "今天的我，限量供應。",
  "這不是 bug，是特色。", "我先躺一下，馬上回來。", "再五分鐘就好。",
  "冷靜，這只是星期幾而已。", "我在等奇蹟，順便等下班。", "好啊，都可以，隨便。",
];
const STATS = ["戰鬥力", "摸魚力", "社交力", "飢餓度"];
// 稀有度：[名稱, 機率權重]
const RARITY = [["SSR", 5], ["SR", 15], ["R", 35], ["N", 45]];
// 每天的配色：[背景, 深色主色]
const THEMES = [
  ["#FFD6A5", "#8A4B0F"], ["#CAFFBF", "#1F6B2A"], ["#9BF6FF", "#005F66"],
  ["#BDB2FF", "#3B2391"], ["#FFC6FF", "#7E1F8C"], ["#FDFFB6", "#6B6400"],
  ["#A0C4FF", "#173F85"], ["#FFADAD", "#9C1C1C"],
];
const GOLD = "#C9971C";

// ===== 依日期＋名字產生固定亂數 =====
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
const now = new Date();
const name = (args.widgetParameter || "").trim();
const r = rng(hash(`persona-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${name}`));
const pick = (arr) => arr[Math.floor(r() * arr.length)];
function pickRarity() {
  let x = r() * RARITY.reduce((s, v) => s + v[1], 0);
  for (const [k, wt] of RARITY) { if ((x -= wt) < 0) return k; }
  return "N";
}
const role = pick(ROLES), skill = pick(SKILLS), weak = pick(WEAK), line = pick(LINES);
const [bgHex, mainHex] = pick(THEMES);
const rarity = pickRarity();
const boost = { SSR: 30, SR: 18, R: 8, N: 0 }[rarity];
const stats = STATS.map((s) => [s, Math.min(99, 10 + boost + Math.floor(r() * (90 - boost)))]);

const BG = new Color(bgHex);
const MAIN = new Color(mainHex);
const INK = new Color("#1A1A1A");
const SUB = new Color("#1A1A1A", 0.6);
const TRACK = new Color("#1A1A1A", 0.12);
const WHITE = new Color("#FFFFFF");

// ===== 元件 =====
function txt(p, s, font, color) {
  const t = p.addText(s); t.font = font; t.textColor = color; return t;
}
function badge(p, size) {
  const b = p.addStack();
  b.backgroundColor = rarity === "SSR" ? new Color(GOLD) : MAIN;
  b.cornerRadius = 6;
  b.setPadding(2, 7, 2, 7);
  txt(b, rarity, Font.heavyRoundedSystemFont(size), WHITE);
}
function bar(v, width, height) {
  const c = new DrawContext();
  c.size = new Size(width, height); c.opaque = false; c.respectScreenScale = true;
  const bg = new Path(); bg.addRoundedRect(new Rect(0, 0, width, height), height / 2, height / 2);
  c.addPath(bg); c.setFillColor(TRACK); c.fillPath();
  const fg = new Path(); fg.addRoundedRect(new Rect(0, 0, Math.max(height, width * v / 100), height), height / 2, height / 2);
  c.addPath(fg); c.setFillColor(MAIN); c.fillPath();
  return c.getImage();
}
function headerRow(w, fontSize) {
  const h = w.addStack(); h.centerAlignContent();
  txt(h, name ? `今天的 ${name} 是` : "今天的你是", Font.boldSystemFont(fontSize), SUB);
  h.addSpacer();
  badge(h, fontSize);
}
function infoLine(p, label, value, size) {
  const s = p.addStack();
  txt(s, label + "　", Font.boldSystemFont(size), MAIN);
  const t = txt(s, value, Font.mediumSystemFont(size), INK);
  t.lineLimit = 1; t.minimumScaleFactor = 0.6;
}

// ===== 組裝 =====
const W = 300;
const w = new ListWidget();
w.backgroundColor = BG;
const family = config.widgetFamily || "large";

if (family === "small") {
  w.setPadding(14, 14, 14, 14);
  headerRow(w, 11);
  w.addSpacer(6);
  const t = txt(w, role, Font.heavySystemFont(20), INK);
  t.minimumScaleFactor = 0.5; t.lineLimit = 3;
  w.addSpacer();
  infoLine(w, "技能", skill, 11);
} else if (family === "medium") {
  w.setPadding(14, 16, 14, 16);
  headerRow(w, 12);
  w.addSpacer(4);
  const t = txt(w, role, Font.heavySystemFont(26), INK);
  t.minimumScaleFactor = 0.5; t.lineLimit = 1;
  w.addSpacer();
  infoLine(w, "技能", skill, 13);
  w.addSpacer(2);
  infoLine(w, "弱點", weak, 13);
  w.addSpacer(6);
  const q = txt(w, `「${line}」`, Font.italicSystemFont(12), SUB);
  q.lineLimit = 1; q.minimumScaleFactor = 0.7;
} else {
  w.setPadding(18, 18, 18, 18);
  headerRow(w, 13);
  w.addSpacer(6);
  const t = txt(w, role, Font.heavySystemFont(30), INK);
  t.minimumScaleFactor = 0.5; t.lineLimit = 2;
  w.addSpacer();
  for (const [label, v] of stats) {
    const row = w.addStack(); row.centerAlignContent();
    const l = row.addStack(); l.size = new Size(52, 0);
    txt(l, label, Font.semiboldSystemFont(12), SUB); l.addSpacer();
    row.addSpacer(6);
    row.addImage(bar(v, W - 52 - 6 - 6 - 30 - 6, 8));
    row.addSpacer(6);
    const n = row.addStack(); n.size = new Size(30, 0); n.addSpacer();
    txt(n, String(v), Font.boldRoundedSystemFont(13), INK);
    w.addSpacer(6);
  }
  w.addSpacer();
  infoLine(w, "技能", skill, 14);
  w.addSpacer(4);
  infoLine(w, "弱點", weak, 14);
  w.addSpacer();
  const box = w.addStack();
  box.backgroundColor = new Color("#FFFFFF", 0.55);
  box.cornerRadius = 12;
  box.setPadding(10, 12, 10, 12);
  const q = txt(box, `「${line}」`, Font.semiboldSystemFont(14), INK);
  q.lineLimit = 2; q.minimumScaleFactor = 0.7;
  box.addSpacer();
}

w.refreshAfterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1);
if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
