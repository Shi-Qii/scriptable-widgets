# 📱 iPhone 日曆小工具

免費的 iPhone 主畫面小工具，12 種風格，每個都支援小、中、大三種尺寸。

## 3 步驟安裝

**1. 下載 [Scriptable](https://apps.apple.com/app/scriptable/id1405459188)**（免費）

**2. 複製下面的安裝碼** 👇 點程式碼框右上角的複製按鈕

```js
const REPO = "Shi-Qii/scriptable-widgets";
const R = `https://raw.githubusercontent.com/${REPO}/main/`;
if (config.runsInWidget) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#0B0B0B");
  const t = w.addText("⚠️ 這是安裝器");
  t.font = Font.boldSystemFont(15); t.textColor = new Color("#FFD23F");
  w.addSpacer(6);
  const m = w.addText("長按 →「編輯小工具」→ Script 改選你裝好的風格");
  m.font = Font.systemFont(12); m.textColor = Color.white(); m.minimumScaleFactor = 0.6;
  Script.setWidget(w);
  Script.complete();
} else {
  const list = await new Request(R + "widgets.json").loadJSON();
  const a = new Alert();
  a.title = "要安裝哪一個？";
  list.forEach(x => a.addAction(x.name));
  a.addCancelAction("取消");
  const i = await a.presentSheet();
  if (i >= 0) {
    const x = list[i];
    const code = await new Request(R + x.file).loadString();
    const fm = FileManager[module.filename.includes("Mobile Documents") ? "iCloud" : "local"]();
    const dir = module.filename.replace(/\/[^\/]*$/, "");
    fm.writeString(`${dir}/${x.name}.js`, code);
    const d = new Alert();
    d.title = "安裝完成 🎉";
    d.message = `回主畫面長按新增小工具，Script 選「${x.name}」（不是選安裝器喔）`;
    d.addAction("好");
    await d.present();
  }
}
```

打開 Scriptable，按右上角 **＋**，長按貼上，按右下角 **▶**，選喜歡的風格。

**3. 加到主畫面**

主畫面長按空白處 → 左上角 **＋** → 找 Scriptable → 選大小加入。
長按小工具 →「編輯小工具」→ Script 選剛剛裝的風格（⚠️ 不要選安裝器）。

> 想換風格或拿更新：回 Scriptable 再執行一次安裝器就好。

## 有哪些

| 風格 | 說明 |
|---|---|
| K 下班倒數・黑底終端機 | 黑底螢光字，終端機風格的下班倒數 |
| J 下班倒數・工程師版 | 藍色系終端機風格，狀態碼和 commit message |
| I 下班倒數・特賣版 | 把下班做成限時特賣，一天換六種配色 |
| L 下班爆分機 | 老虎機風格，每 10 分鐘轉一次新盤面，下班就是你的 Free Game |
| E 下班倒數・簡約版 | 深藍簡約，倒數、週末和發薪日 |
| F 今日人設 | 每天抽一張角色卡，有 SSR |
| D 今日運勢 | 籤等、四種運勢、幸運食物 |
| B 撕頁黃曆 | 紅色撕頁日曆，每天的宜與忌，節日自動顯示 |
| A 厭世一句 | 每天一句厭世幹話 |
| C 英文一句 | 英文句子、中文翻譯、今日單字 |
| H 旅行曆 | 每天一個世界景點，照片自動更新（需要網路） |
| G 今年進度 | 一年 365 個點，看今年過了多少 |

## 自訂

- **下班倒數系列**：打開腳本，開頭幾行可以改上下班時間、午休時間和發薪日（預設 10:00–18:00）
- **今日運勢、今日人設**：「編輯小工具」的 Parameter 填名字，每個人抽到的不一樣
- **句子、宜忌等內容**：都在腳本最上面的清單，自己增減就好

## 注意

- 重新安裝同一個風格會覆蓋你改過的內容，改之前可以先複製一份
- 旅行曆的照片與介紹來自維基百科，依 CC BY-SA 授權使用
- 老虎機風格純屬娛樂，沒有任何下注或真錢

免費分享，歡迎自己改著玩。
