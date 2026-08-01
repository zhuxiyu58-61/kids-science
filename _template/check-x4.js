/* 第四批扩课数据体检（跑 gen.js 之前先跑这个）
 * 用法：node _template/check-x4.js
 * 检查项：
 *   1. id 有没有和已有 lessons/ 目录撞车、批次内部有没有重复
 *   2. 必填字段齐不齐（gen.js 用到的 13 个）
 *   3. cards=4 / qb=3 / quiz=4 / g1.items=6 / g1.bins=2 条数
 *   4. 数据契约：qb[].opts 三项、quiz[].opts 有且只有一个 1、g1 item.key 必须在 bins 里
 *   5. region 是不是 20 个区之一、THEMES/REGION_META 有没有这个区
 *   6. Unicode 12+ 新 emoji（娃的旧字体显示成豆腐块）
 */
const fs = require('fs');
const path = require('path');

const {THEMES, REGION_META, LESSONS, BOSSES} = require('./gen-data.js');
const LROOT = path.join(__dirname, '..', 'lessons');
const existing = new Set(fs.readdirSync(LROOT));
const KEYS = ['nature','art','world','bio','game','logic','space','math','animal','tech','life','heart','plant','chinese','food','math2','globe','festival','material','earth'];

/* 和 inject-emoji.js 的 NEW_RE 保持一致，另加几个 Unicode 12/13 里常被误用的单字 */
const NEW_RE = /[\u{1FA70}-\u{1FAFF}\u{1F9CD}-\u{1F9CF}\u{1F90C}-\u{1F90E}\u{1F971}\u{1F972}\u{1F97A}\u{1F9A3}-\u{1F9AF}\u{1F9BB}-\u{1F9BF}\u{1F6D5}-\u{1F6D7}\u{1F6DD}-\u{1F6DF}]/gu;
/* MAP 里已经有替换规则的不算问题——生成后 inject-emoji 会自动换掉 */
const MAPPED = new Set(Object.keys(require('fs').readFileSync(path.join(__dirname,'inject-emoji.js'),'utf8')
  .match(/'[^']'\s*:\s*'[^']*'/g) ? {} : {}));
const injSrc = fs.readFileSync(path.join(__dirname, 'inject-emoji.js'), 'utf8');
const mapped = new Set();
for (const m of injSrc.matchAll(/'([^']+)'\s*:\s*'([^']*)',\s*\/\//g)) mapped.add(m[1]);

const errs = [], warns = [];
const seen = new Set();

function walkStrings(o, cb, p) {
  if (typeof o === 'string') return cb(o, p);
  if (Array.isArray(o)) return o.forEach((v, i) => walkStrings(v, cb, p + '[' + i + ']'));
  if (o && typeof o === 'object') for (const k of Object.keys(o)) walkStrings(o[k], cb, p + '.' + k);
}

const REQ = ['id','region','e','n','bn','medal','intro','tabA','cards','qb','g1','quiz','sum'];
for (const L of LESSONS) {
  const at = 'LESSON ' + (L.id || '(无 id)');
  for (const f of REQ) if (L[f] === undefined || L[f] === '') errs.push(`${at}: 缺字段 ${f}`);
  if (existing.has(L.id)) errs.push(`${at}: id 和已有目录 lessons/${L.id} 撞车`);
  if (seen.has(L.id)) errs.push(`${at}: 批次内部 id 重复`);
  seen.add(L.id);
  if (!KEYS.includes(L.region)) errs.push(`${at}: region「${L.region}」不在 20 个区里`);
  if (!THEMES[L.region]) errs.push(`${at}: THEMES 里没有 ${L.region}`);
  if (!REGION_META[L.region]) errs.push(`${at}: REGION_META 里没有 ${L.region}`);

  if ((L.cards || []).length !== 4) errs.push(`${at}: cards 应为 4 条，实际 ${(L.cards||[]).length}`);
  (L.cards || []).forEach((c, i) => { if (!c.e || !c.n || !c.f) errs.push(`${at}: cards[${i}] 缺 e/n/f`); });

  if ((L.qb || []).length !== 3) errs.push(`${at}: qb 应为 3 条，实际 ${(L.qb||[]).length}`);
  (L.qb || []).forEach((q, i) => {
    if (!q.q || !q.cap) errs.push(`${at}: qb[${i}] 缺 q/cap`);
    if (!Array.isArray(q.opts) || q.opts.length !== 3) errs.push(`${at}: qb[${i}] opts 应为 3 项`);
    /* 契约：qb 的 opts[0] 必须是正确答案（页面自己 shuffle） */
    if (new Set(q.opts).size !== (q.opts || []).length) errs.push(`${at}: qb[${i}] 选项有重复`);
  });

  if ((L.quiz || []).length !== 4) errs.push(`${at}: quiz 应为 4 条，实际 ${(L.quiz||[]).length}`);
  (L.quiz || []).forEach((q, i) => {
    if (!q.tag || !q.tl || !q.ico || !q.q || !q.fb) errs.push(`${at}: quiz[${i}] 缺 tag/tl/ico/q/fb`);
    if (!['sci','logic','en'].includes(q.tag)) warns.push(`${at}: quiz[${i}] tag「${q.tag}」没有对应的样式类，chip 会没底色`);
    const right = (q.opts || []).filter(o => o[1] === 1).length;
    if (right !== 1) errs.push(`${at}: quiz[${i}] 正确答案有 ${right} 个（必须正好 1 个）`);
    if ((q.opts || []).length !== 3) errs.push(`${at}: quiz[${i}] opts 应为 3 项`);
  });

  const g = L.g1 || {};
  if (!g.title || !g.sub) errs.push(`${at}: g1 缺 title/sub`);
  if ((g.bins || []).length !== 2) errs.push(`${at}: g1.bins 应为 2 个`);
  if ((g.items || []).length !== 6) errs.push(`${at}: g1.items 应为 6 个，实际 ${(g.items||[]).length}`);
  const binKeys = new Set((g.bins || []).map(b => b.k));
  (g.items || []).forEach((it, i) => {
    if (!binKeys.has(it.key)) errs.push(`${at}: g1.items[${i}].key「${it.key}」不在 bins ${[...binKeys]} 里`);
    if (!it.t) errs.push(`${at}: g1.items[${i}] 缺 t`);
  });
  const cnt = {}; (g.items || []).forEach(it => cnt[it.key] = (cnt[it.key] || 0) + 1);
  for (const k of binKeys) if (cnt[k] !== 3) warns.push(`${at}: g1 两个筐不是各 3 项（${k}=${cnt[k] || 0}）`);

  walkStrings(L, (s, p) => {
    const hit = [...new Set(s.match(NEW_RE) || [])].filter(c => !mapped.has(c));
    if (hit.length) errs.push(`${at}${p}: 有未收录的新 emoji ${hit.join(' ')}（旧字体会显示成豆腐块）`);
  }, '');
}

/* 按区统计 */
const byRegion = {};
LESSONS.forEach(L => byRegion[L.region] = (byRegion[L.region] || 0) + 1);
console.log('本批共 ' + LESSONS.length + ' 课，' + Object.keys(byRegion).length + ' 个区：');
console.log('  ' + KEYS.map(k => k + '=' + (byRegion[k] || 0)).join('  '));
console.log('BOSSES: ' + BOSSES.length + ' 个（本批不新增区挑战）');

if (warns.length) { console.log('\n⚠️  提醒 ' + warns.length + ' 条：'); warns.forEach(w => console.log('  ' + w)); }
if (errs.length) { console.log('\n❌ 错误 ' + errs.length + ' 条：'); errs.forEach(e => console.log('  ' + e)); process.exit(1); }
console.log('\n✅ 数据体检通过');
