// 日曆小工具安裝器：在 Scriptable 裡按 ▶ 執行，不要放進小工具
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
