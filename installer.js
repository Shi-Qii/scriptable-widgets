// 日曆小工具安裝器：執行後選一個版本，自動建立腳本
const REPO = "Shi-Qii/scriptable-widgets";
const R = `https://raw.githubusercontent.com/${REPO}/main/`;
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
  d.message = `「${x.name}」已加入，回主畫面長按新增小工具，Script 選它就好`;
  d.addAction("好");
  await d.present();
}
