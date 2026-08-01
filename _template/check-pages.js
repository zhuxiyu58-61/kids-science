/* 生成后的页面体检（零依赖，直接 node 跑）：
 *   node _template/check-pages.js            检查 gen-data.js 当前这批
 * 查 CARDS=4 / ITEMS=6 / QUIZ=4 且每题只有一个正确答案 / 拖拽筐 2 个 / item.key 在筐里 /
 * 三条注入链（掌握模式·探索判错·开场读秒）的标记都在。
 * 🔴 坑：知识卡和拖拽项是 JS 运行时生成的，页面里没有 class="planet"/class="item" 字面量，
 *      直接 grep 类名会得到假 0（曾把 100 页全判成 0 张卡，jsdom 实跑才证伪）。所以这里查数据数组。
 */
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const {LESSONS} = require(path.join(ROOT, '_template/gen-data.js'));

/* 注入脚本自己的标记位，从源码里读，别手抄 */
const MARKS = {};
for (const [name, file] of [['掌握模式','inject-mastery.js'],['探索判错','inject-explore.js'],['开场读秒','inject-intro.js'],['手机端排版','inject-mobile.js'],['知识卡完成语','inject-fact.js']]) {
  const src = fs.readFileSync(path.join(ROOT, '_template', file), 'utf8');
  const m = src.match(/const MARK\w* = '([^']+)'/);
  if (m) MARKS[name] = m[1];
}
console.log('注入标记：', JSON.stringify(MARKS, null, 1));

let bad = 0;
const grab = (s, name) => {
  const m = s.match(new RegExp('const ' + name + '=(\\[[\\s\\S]*?\\]);'));
  return m ? vm.runInNewContext('(' + m[1] + ')') : null;
};

for (const L of LESSONS) {
  const f = path.join(ROOT, 'lessons', L.id, 'index.html');
  const s = fs.readFileSync(f, 'utf8');
  const err = m => { bad++; console.log('[FAIL] ' + L.id + ': ' + m); };

  const CARDS = grab(s, 'CARDS'), ITEMS = grab(s, 'ITEMS'), QUIZ = grab(s, 'QUIZ');
  if (!CARDS || CARDS.length !== 4) err('CARDS ' + (CARDS ? CARDS.length : '缺失'));
  if (!ITEMS || ITEMS.length !== 6) err('ITEMS ' + (ITEMS ? ITEMS.length : '缺失'));
  if (!QUIZ || QUIZ.length !== 4) err('QUIZ ' + (QUIZ ? QUIZ.length : '缺失'));
  if (QUIZ) QUIZ.forEach((q, i) => {
    const r = q.opts.filter(o => o[1] === 1).length;
    if (r !== 1) err('QUIZ[' + i + '] 正确答案 ' + r + ' 个');
    if (q.opts.length !== 3) err('QUIZ[' + i + '] 选项 ' + q.opts.length + ' 个');
  });
  if ((s.match(/class="bin"/g) || []).length !== 2) err('拖拽筐数不对');
  /* ITEMS 的 key 必须都在两个筐里 */
  const binKeys = [...s.matchAll(/data-k="([^"]+)"/g)].map(m => m[1]);
  if (ITEMS) ITEMS.forEach((it, i) => { if (!binKeys.includes(it.k ?? it.key)) err('ITEMS[' + i + '] key 不在筐里'); });

  for (const [name, mark] of Object.entries(MARKS)) if (!s.includes(mark)) err('缺注入：' + name);
}
console.log('\n检查 ' + LESSONS.length + ' 页，失败 ' + bad + ' 条');
process.exit(bad ? 1 : 0);
