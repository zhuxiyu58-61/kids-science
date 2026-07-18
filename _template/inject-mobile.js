/* 手机端(iPhone 13 / 390px)排版修正(2026-07-18)
 * iPhone 13 实测三个毛病:
 *   1. 知识卡 .planet 固定 112px,390px 屏一行正好放 3 张,第 4 张单独一行;
 *      卡名还会从词中间断("第一步：求一份" 断成 "第一步：求一/份")。→ 窄屏改 2×2 网格。
 *   2. .subview 垂直居中,内容短时上下各留一大片空白。→ 窄屏顶到上面。
 *   3. 通关页按钮被压得断行("再玩一/次"、"回乐园，选下一/课")。→ nowrap + 收紧内边距。
 *
 * 只加 CSS,不碰任何 id / JS / saveBadge —— 娃的 localStorage 进度完全不受影响。
 * 有标记位,重复跑安全。
 * 用法:node _template/inject-mobile.js [课程id...]   不带参数=全站
 */
const fs = require('fs');
const path = require('path');

const LESSONS = path.join(__dirname, '..', 'lessons');
const MARK = '/* ===== 手机端排版修正 v1 ===== */';

const CSS = `
${MARK}
.finishBtns button{white-space:nowrap;}
@media (max-width:430px){
  /* 4 张知识卡排成 2×2,卡名不再从词中间断 */
  .orbit{display:grid; grid-template-columns:repeat(2,1fr); gap:10px; width:100%; max-width:340px;}
  .planet{width:auto;}
  /* 内容顶到上面,别垂直居中留一大片空白 */
  .subview{justify-content:flex-start; padding-top:4px;}
  /* 通关页两个按钮各占一行宽度的一半,不断行 */
  .finishBtns button{padding:13px 14px; font-size:15px;}
}
`;

const only = process.argv.slice(2);
let done = 0, skip = 0, miss = 0;

for (const d of fs.readdirSync(LESSONS)) {
  if (only.length && !only.includes(d)) continue;
  const f = path.join(LESSONS, d, 'index.html');
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, 'utf8');
  if (s.includes(MARK)) { skip++; continue; }
  const i = s.lastIndexOf('</style>');
  if (i < 0) { miss++; continue; }
  s = s.slice(0, i) + CSS + s.slice(i);
  fs.writeFileSync(f, s, 'utf8');
  done++;
}
console.log(`手机端排版注入:${done} 课  已存在跳过:${skip}  无 style:${miss}`);
