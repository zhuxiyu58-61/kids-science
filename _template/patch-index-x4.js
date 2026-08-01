/* 把第四批 100 课插进主页 index.html 的 REGIONS 里（插在每个区的区挑战之前）。
 * 用法：node _template/patch-index-x4.js          真改
 *      node _template/patch-index-x4.js --dry     只看会改什么
 * 幂等：已经有这个 id 的行就跳过，重复跑不会插第二遍。
 */
const fs = require('fs');
const path = require('path');
const {LESSONS} = require('./gen-data.js');

const IDX = path.join(__dirname, '..', 'index.html');
const dry = process.argv.includes('--dry');
let html = fs.readFileSync(IDX, 'utf8');

/* 按区分组，保持数据文件里的顺序 */
const byRegion = {};
for (const L of LESSONS) (byRegion[L.region] = byRegion[L.region] || []).push(L);

/* 主页 lessons 行的写法：{id:'xxx', e:'😀', n:'名字', bn:'徽章名'} —— 对齐用空格，这里按最长的一列补齐 */
function lineFor(list) {
  const wId = Math.max(...list.map(l => l.id.length)) + 2;   // 含两个引号
  return list.map(l => {
    const idCell = ("'" + l.id + "',").padEnd(wId + 1);
    return `     {id:${idCell} e:'${l.e}', n:'${l.n}', bn:'${l.bn}'},`;
  }).join('\n');
}

let added = 0, skipped = 0;
for (const key of Object.keys(byRegion)) {
  const list = byRegion[key].filter(l => {
    if (new RegExp("\\{id:'" + l.id + "'").test(html)) { skipped++; return false; }
    return true;
  });
  if (!list.length) continue;
  const bossRe = new RegExp("^([ \\t]*)\\{id:'ch-" + key + "',[^\\n]*boss:true\\},?$", 'm');
  const m = html.match(bossRe);
  if (!m) { console.error('❌ 找不到 ch-' + key + ' 的区挑战行，跳过'); continue; }
  html = html.replace(bossRe, lineFor(list) + '\n' + m[0]);
  added += list.length;
  console.log(`  ${key}: 插入 ${list.length} 课（在 ch-${key} 之前）`);
}

console.log(`\n合计新增 ${added} 课，跳过（已存在）${skipped} 课`);
if (dry) { console.log('--dry 模式，没有写文件'); process.exit(0); }
if (added) { fs.writeFileSync(IDX, html, 'utf8'); console.log('已写回 index.html'); }
