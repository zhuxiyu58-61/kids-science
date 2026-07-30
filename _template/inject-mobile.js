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
/* 用起止标记包住，重跑时整块替换而不是重复追加，方便以后继续加规则 */
const S = '/* ===== 手机端排版修正 start ===== */';
const E = '/* ===== 手机端排版修正 end ===== */';
const OLD_V1 = '/* ===== 手机端排版修正 v1 ===== */';   // 第一版没有 end 标记，单独兼容

const CSS = `
${S}
.finishBtns button{white-space:nowrap;}
/* 知识卡全看完的提示,接在知识点下面而不是盖掉它 */
.factDone{margin-top:9px; padding-top:8px; border-top:1px dashed rgba(0,0,0,.13); font-size:13.5px; opacity:.85;}
/* 课名长的时候(如"望远镜看到的是过去")标题会把「回乐园」挤成两行 */
.back{white-space:nowrap;}
.title{min-width:0;}
@media (max-width:430px){
  /* 4 张知识卡排成 2×2,卡名不再从词中间断 */
  .orbit{display:grid; grid-template-columns:repeat(2,1fr); gap:10px; width:100%; max-width:340px;}
  .planet{width:auto;}
  /* 内容顶到上面,别垂直居中留一大片空白 */
  .subview{justify-content:flex-start; padding-top:4px;}
  /* 通关页两个按钮各占一行宽度的一半,不断行 */
  .finishBtns button{padding:13px 14px; font-size:15px;}
  /* 长课名缩一号字,尽量不换行 */
  .topbar .title{font-size:16px;}
  .back{font-size:17px; padding:8px 11px;}
}
${E}
`;

const only = process.argv.slice(2);
let add = 0, upd = 0, miss = 0;

for (const d of fs.readdirSync(LESSONS)) {
  if (only.length && !only.includes(d)) continue;
  const f = path.join(LESSONS, d, 'index.html');
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, 'utf8');

  if (s.includes(S) && s.includes(E)) {              // 有完整起止标记 → 整块替换
    s = s.slice(0, s.indexOf(S)) + CSS.trim() + s.slice(s.indexOf(E) + E.length);
    upd++;
  } else if (s.includes(OLD_V1)) {                   // 第一版：从旧标记删到 </style> 前
    const a = s.indexOf(OLD_V1), b = s.lastIndexOf('</style>');
    if (b < a) { miss++; continue; }
    s = s.slice(0, a) + CSS.trim() + '\n' + s.slice(b);
    upd++;
  } else {
    const i = s.lastIndexOf('</style>');
    if (i < 0) { miss++; continue; }
    s = s.slice(0, i) + CSS + s.slice(i);
    add++;
  }
  fs.writeFileSync(f, s, 'utf8');
}
console.log(`手机端排版:新增 ${add} 课  更新 ${upd} 课  无 style:${miss}`);
