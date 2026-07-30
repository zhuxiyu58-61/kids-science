/* 修复:点第 4 张知识卡时看不到知识点(2026-07-19)
 * 现象:前 3 张点了都显示内容,点到第 4 张只显示"🎉 4 张知识卡都看完啦!",那张的知识点被吞了。
 * 根因:模板里 onclick 先把知识点写进 #factA,紧接着 if(doneA>=4) 又把整个 innerHTML 覆盖成完成语。
 *      最后一张卡的内容因此永远看不到——而且它常常是这一课最关键的一条。
 * 做法:把"覆盖"改成"追加",知识点留着,完成语作为一行小字接在下面。
 *      全站 99 课约 30 种不同完成语,用正则统一改,顺带兼容 doneA>=8 的太阳系那一课。
 * 用法:node _template/inject-fact.js [课程id...]   不带参数=全站
 */
const fs = require('fs');
const path = require('path');

const LESSONS = path.join(__dirname, '..', 'lessons');
/* 匹配:if(doneA>=N) document.getElementById('factA').innerHTML='完成语' */
const RE = /if\(doneA>=(\d+)\)\s*document\.getElementById\('factA'\)\.innerHTML\s*=\s*'((?:[^'\\]|\\.)*)'/g;

const only = process.argv.slice(2);
let fixed = 0, already = 0, miss = 0, hits = 0;

for (const d of fs.readdirSync(LESSONS)) {
  if (only.length && !only.includes(d)) continue;
  const f = path.join(LESSONS, d, 'index.html');
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, 'utf8');
  if (!/doneA>=\d+/.test(s)) { miss++; continue; }
  if (s.includes(".innerHTML+='<div class=\"factDone\"")) { already++; continue; }
  let n = 0;
  s = s.replace(RE, (m, num, msg) => {
    n++;
    return `if(doneA>=${num}) document.getElementById('factA').innerHTML+='<div class="factDone">${msg}</div>'`;
  });
  if (!n) { miss++; continue; }
  hits += n; fixed++;
  fs.writeFileSync(f, s, 'utf8');
}
console.log(`知识卡完成语改追加:${fixed} 课(共 ${hits} 处)  已修过:${already}  无匹配:${miss}`);
