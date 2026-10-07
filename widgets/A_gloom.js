// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: comment;
// 厭世一句 小工具 for Scriptable (iOS)
// 小：日期＋一句　中：日期欄＋一句＋農曆　大：完整日曆頁（月份、農曆、第幾天、大日期、一句、厭世指數、今日解藥）

// ===== 句子清單：依「今年第幾天」輪流，寫滿 365 句就一天一句不重複 =====
const QUOTES = [
  "今天的我，也在努力假裝很努力。", "薪水是精神賠償金，不是報酬。",
  "只要不看帳戶餘額，我就還是有錢人。", "鬧鐘響的那一刻，是一天中最想辭職的時候。",
  "計畫趕不上變化，變化趕不上我的拖延。", "減肥最難的不是運動，是運動完的那頓宵夜。",
  "能用錢解決的問題都不是問題，問題是沒錢。", "我不是懶，我是在省電模式。",
  "程式能跑就不要動，人生也是。", "星期一的我，是跟星期五的我借來的。",
  "努力不一定會成功，但不努力真的很舒服。", "早睡早起身體好，可惜我兩個都做不到。",
  "人生就像 bug，你以為修好了，其實只是還沒觸發。", "今天也是靠咖啡因維持人形的一天。",
  "我的目標很簡單：活著下班。", "想太多會累，所以我決定不想。",
  "錢包跟體重，永遠只有錢包在瘦。", "會議很多，結論很少。",
  "明天的事明天再煩，今天先煩今天的。", "沒有過不去的坎，只有不想過的週一。",
  "我的優點是有自知之明，缺點是知道了也不改。", "週末不是用來休息的，是用來補眠的。",
  "有些事不是不做，是在等它自己消失。", "天塌下來，有主管先頂著。",
  "嘆氣不會讓日子變好，但嘆完會舒服一點。", "想要的很多，願意早起的很少。",
  "今天不想努力了，明天再說，明天也再說。", "把今天過好，就已經贏過一半的人了。",
  "下班後的時間，才是真正屬於自己的人生。", "慢慢來比較快，但老闆不這麼想。",
  "我很忙，忙著思考要不要開始忙。", "成年人的崩潰，都是從「收到」開始的。",
  "冰箱打開又關上，是我今天最規律的運動。", "我的存款跟我的耐心一樣，月底就見底。",
  "人生沒有白走的路，但有很多走錯的。", "我不是路痴，我只是在探索新路線。",
  "說好的早睡，是明天的事。", "願望清單越來越長，購物車越來越滿。",
  "別人在進步，我在進步的路上休息。", "今天的煩惱，留給明天的我處理。",
  "最遠的距離，是床到辦公室。", "我對工作很認真，認真地想下班。",
  "所有的「馬上好」，都不是馬上。", "我的計畫很完美，執行的是另一個人。",
  "生活不只眼前的苟且，還有下週的苟且。", "我不挑食，我只挑好吃的。",
  "年紀越大越明白，睡覺是最好的投資。", "做人要有夢想，做夢比較快。",
  "今天也是平凡的一天，平凡到有點想放假。", "我的手機電量，比我的精神還充足。",
  "每天都在學習新東西，比如新的藉口。", "我沒有拖延症，我只是很會排優先順序，排到最後。",
  "人生的意義，可能就在下一餐。", "工作是為了生活，但生活都拿去工作了。",
  "只要我不讀訊息，問題就不存在。", "我的情緒很穩定，穩定地想放假。",
  "沒有什麼事是一杯手搖解決不了的，如果有就兩杯。", "加油，離下次放假又近了一天。",
  "今天的努力，是為了明天可以理直氣壯地偷懶。", "活著就好，其他都是加分題。",
];
// 今日解藥：每天一個小建議
const REMEDY = [
  "下班吃頓好的", "早點睡", "喝一杯全糖的", "散步十分鐘", "關掉群組通知",
  "聽一首喜歡的歌", "對自己說辛苦了", "準時下班", "曬一下太陽", "買個小東西犒賞自己",
  "傳訊息給好朋友", "整理一下桌面", "伸個懶腰", "不要看工作訊息", "洗個熱水澡",
];

// ===== 顏色 =====
const BG = Color.dynamic(new Color("#FFFDF7"), new Color("#1C1C1E"));
const INK = Color.dynamic(new Color("#222222"), new Color("#F2F2F2"));
const SUB = Color.dynamic(new Color("#8A8A8A"), new Color("#9A9A9A"));
const LINE = Color.dynamic(new Color("#E6E0D4"), new Color("#3A3A3C"));
const ACCENT = new Color("#D9453B");
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
const quote = QUOTES[(doy - 1) % QUOTES.length];
const r = rng(hash(`gloom-${now.getFullYear()}-${doy}`));
const level = 1 + Math.floor(r() * 5);
const remedy = REMEDY[Math.floor(r() * REMEDY.length)];
const lunarStr = lunarText(now);
const fest = festival(now);
const left = Math.round((new Date(now.getFullYear() + 1, 0, 1) - today) / 86400000) - 1;

function center(p, s, font, color) {
  const row = p.addStack(); row.addSpacer();
  const t = txt(row, s, font, color); t.centerAlignText();
  row.addSpacer();
  return t;
}
function divider(p, width) {
  const d = p.addStack(); d.size = new Size(width, 1); d.backgroundColor = LINE;
}

const w = new ListWidget();
w.backgroundColor = BG;

if (family === "small") {
  w.setPadding(14, 16, 14, 16);
  const h = w.addStack();
  txt(h, `${now.getMonth() + 1}/${now.getDate()} 星期${WEEK[now.getDay()]}`, Font.boldSystemFont(13), ACCENT);
  w.addSpacer(8);
  const q = txt(w, quote, serif(16, true), INK);
  q.minimumScaleFactor = 0.6;
  w.addSpacer();
  txt(w, fest || `第${doy}天`, Font.mediumSystemFont(11), fest ? ACCENT : SUB);
} else if (family === "medium") {
  w.setPadding(14, 16, 14, 16);
  const row = w.addStack(); row.centerAlignContent();
  const l = row.addStack(); l.layoutVertically(); l.size = new Size(72, 0);
  txt(l, `${MONTH_CN[now.getMonth()]}月`, serif(14, false), SUB);
  txt(l, String(now.getDate()).padStart(2, "0"), serif(44, true), ACCENT);
  txt(l, `星期${WEEK[now.getDay()]}`, serif(13, false), INK);
  row.addSpacer(10);
  const line = row.addStack(); line.size = new Size(1, 86); line.backgroundColor = LINE;
  row.addSpacer(14);
  const rt = row.addStack(); rt.layoutVertically();
  const q = txt(rt, quote, serif(17, true), INK);
  q.minimumScaleFactor = 0.6;
  rt.addSpacer(8);
  const meta = txt(rt, [fest, lunarStr, `第${doy}天`].filter(Boolean).join("　"), Font.systemFont(11), fest ? ACCENT : SUB);
  meta.lineLimit = 1; meta.minimumScaleFactor = 0.7;
} else {
  w.setPadding(18, 20, 18, 20);
  // 頂部資訊列：月份｜星期＋農曆｜第幾天
  const top = w.addStack(); top.centerAlignContent();
  txt(top, `${MONTH_CN[now.getMonth()]}月`, serif(15, true), INK);
  top.addSpacer();
  const mid = top.addStack(); mid.layoutVertically();
  center(mid, `星期${WEEK[now.getDay()]}`, serif(12, false), SUB);
  center(mid, lunarStr, serif(12, false), SUB);
  top.addSpacer();
  txt(top, String(doy), serif(15, true), INK);
  w.addSpacer(8);
  divider(w, W);
  w.addSpacer();
  center(w, String(now.getDate()).padStart(2, "0"), serif(64, true), ACCENT);
  if (fest) center(w, fest, serif(14, true), ACCENT);
  w.addSpacer(10);
  const q = center(w, quote, serif(21, true), INK);
  q.minimumScaleFactor = 0.6; q.lineLimit = 4;
  w.addSpacer();
  divider(w, W);
  w.addSpacer(10);
  const b = w.addStack(); b.centerAlignContent();
  txt(b, "厭世指數 ", Font.mediumSystemFont(12), SUB);
  txt(b, "●".repeat(level) + "○".repeat(5 - level), Font.mediumSystemFont(12), ACCENT);
  b.addSpacer();
  txt(b, `今年還剩 ${left} 天`, Font.mediumSystemFont(12), SUB);
  w.addSpacer(4);
  const rm = w.addStack();
  txt(rm, "今日解藥 ", Font.mediumSystemFont(12), SUB);
  txt(rm, remedy, Font.semiboldSystemFont(12), INK);
}

w.refreshAfterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 1);
if (config.runsInWidget) Script.setWidget(w);
else await w.presentLarge();
Script.complete();
