// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: language;
// 英文一句 小工具 for Scriptable (iOS)
// 小：日期＋英文＋中文　中：同上加大　大：英文＋中文＋今日單字，背景漸層每個月換一組

// ===== [英文, 中文, 今日單字, 詞性與意思] =====
const QUOTES = [
  ["Small steps still move you forward.", "小小步也是在前進。", "forward", "adv. 向前"],
  ["You don't have to do it all today.", "不用今天就全部做完。", "today", "n. 今天"],
  ["Rest is part of the work.", "休息也是工作的一部分。", "rest", "n. 休息"],
  ["Be kind to yourself today.", "今天對自己好一點。", "kind", "adj. 仁慈的、體貼的"],
  ["Done is better than perfect.", "完成比完美更重要。", "perfect", "adj. 完美的"],
  ["Slow progress is still progress.", "慢慢進步也是進步。", "progress", "n. 進步"],
  ["One thing at a time.", "一次做好一件事。", "at a time", "phr. 一次"],
  ["It's okay to start again.", "重新開始也沒關係。", "again", "adv. 再一次"],
  ["Drink some water and take a breath.", "喝點水，深呼吸。", "breath", "n. 呼吸"],
  ["Today is a good day to try.", "今天很適合試試看。", "try", "v. 嘗試"],
  ["You're doing better than you think.", "你做得比你以為的還好。", "better", "adj. 更好的"],
  ["Every expert was once a beginner.", "每個高手都曾是新手。", "beginner", "n. 初學者"],
  ["Make today a little lighter.", "讓今天輕鬆一點。", "lighter", "adj. 更輕鬆的"],
  ["Focus on what you can control.", "專注在你能控制的事。", "control", "v. 控制"],
  ["A short walk can change your mood.", "散個步就能換個心情。", "mood", "n. 心情"],
  ["Learn one new thing today.", "今天學一件新東西。", "learn", "v. 學習"],
  ["Say thank you more often.", "多說謝謝。", "often", "adv. 經常"],
  ["Your pace is your own.", "你的步調屬於你自己。", "pace", "n. 步調"],
  ["Good things take time.", "好事需要時間。", "take time", "phr. 需要時間"],
  ["Keep going, even if it's slow.", "就算慢，也繼續走。", "keep going", "phr. 繼續前進"],
  ["Leave work at work.", "工作留在公司就好。", "leave", "v. 留下"],
  ["Mistakes mean you're trying.", "犯錯代表你有在嘗試。", "mistake", "n. 錯誤"],
  ["Sleep is a superpower.", "睡飽就是超能力。", "superpower", "n. 超能力"],
  ["Be curious, not worried.", "保持好奇，不必擔心。", "curious", "adj. 好奇的"],
  ["Start where you are.", "從你現在的位置開始。", "start", "v. 開始"],
  ["Less scrolling, more living.", "少滑手機，多過生活。", "scroll", "v. 滑動（螢幕）"],
  ["Tiny habits, big changes.", "小習慣，大改變。", "habit", "n. 習慣"],
  ["Celebrate small wins.", "為小小的勝利慶祝。", "celebrate", "v. 慶祝"],
  ["Tomorrow is a fresh page.", "明天又是新的一頁。", "fresh", "adj. 新的、清新的"],
  ["Breathe in, let it go.", "吸口氣，放下它。", "let go", "phr. 放手"],
];
// 每個月一組漸層 [上, 下]
const GRADIENTS = [
  ["#5B7DB1", "#2E3F6E"], ["#E58FA6", "#9B5DA8"], ["#7CC6A4", "#3A8C8C"],
  ["#F6B98A", "#E07A7A"], ["#8FD0E8", "#4A7FC1"], ["#F2C85B", "#E07B3A"],
  ["#5FC3D9", "#2B6CB0"], ["#F28C7A", "#B4527A"], ["#E3A857", "#9C5B3A"],
  ["#F28C7A", "#7B6CC4"], ["#B08968", "#6F4E37"], ["#6C7AA8", "#2F2F5A"],
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
const SOFT = new Color("#FFFFFF", 0.82);
const FAINT = new Color("#FFFFFF", 0.3);
const MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const [en, zh, word, meaning] = QUOTES[(doy - 1) % QUOTES.length];
const georgia = (size, style) => new Font(style ? `Georgia-${style}` : "Georgia", size);

function shadowed(p, s, font, color) {
  const t = txt(p, s, font, color);
  t.shadowColor = new Color("#000000", 0.18);
  t.shadowRadius = 2;
  return t;
}

const w = new ListWidget();
const g = new LinearGradient();
const [c1, c2] = GRADIENTS[now.getMonth()];
g.colors = [new Color(c1), new Color(c2)];
g.locations = [0, 1];
w.backgroundGradient = g;

if (family === "small") {
  w.setPadding(14, 16, 14, 16);
  shadowed(w, `${MON[now.getMonth()].slice(0, 3)} ${now.getDate()}`, Font.boldSystemFont(12), SOFT);
  w.addSpacer();
  const q = shadowed(w, en, georgia(17, "Bold"), WHITE);
  q.minimumScaleFactor = 0.55;
  w.addSpacer(4);
  const c = shadowed(w, zh, Font.mediumSystemFont(11), SOFT);
  c.minimumScaleFactor = 0.7;
} else if (family === "medium") {
  w.setPadding(14, 18, 14, 18);
  const top = w.addStack();
  shadowed(top, `${DAY[now.getDay()]}, ${MON[now.getMonth()]} ${now.getDate()}`, Font.boldSystemFont(13), SOFT);
  top.addSpacer();
  shadowed(top, word, georgia(13, "Italic"), SOFT);
  w.addSpacer();
  const q = shadowed(w, en, georgia(22, "Bold"), WHITE);
  q.minimumScaleFactor = 0.55;
  w.addSpacer(6);
  const c = shadowed(w, zh, Font.mediumSystemFont(14), SOFT);
  c.minimumScaleFactor = 0.7;
  w.addSpacer();
} else {
  w.setPadding(20, 20, 20, 20);
  const top = w.addStack();
  const d = top.addStack(); d.layoutVertically();
  shadowed(d, DAY[now.getDay()], georgia(15, "Italic"), SOFT);
  shadowed(d, `${MON[now.getMonth()]} ${now.getDate()}`, georgia(26, "Bold"), WHITE);
  top.addSpacer();
  shadowed(top, `Day ${doy}`, Font.semiboldSystemFont(12), SOFT);
  w.addSpacer();
  const q = shadowed(w, en, georgia(30, "Bold"), WHITE);
  q.minimumScaleFactor = 0.5; q.lineLimit = 4;
  w.addSpacer(10);
  shadowed(w, zh, Font.mediumSystemFont(16), SOFT);
  w.addSpacer();
  const line = w.addStack(); line.size = new Size(W, 1); line.backgroundColor = FAINT;
  w.addSpacer(12);
  shadowed(w, "今日單字", Font.semiboldSystemFont(11), SOFT);
  w.addSpacer(2);
  const wr = w.addStack(); wr.bottomAlignContent();
  shadowed(wr, word, georgia(22, "Bold"), WHITE);
  wr.addSpacer(10);
  shadowed(wr, meaning, Font.mediumSystemFont(13), SOFT);
}

w.refreshAfterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1);
if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
