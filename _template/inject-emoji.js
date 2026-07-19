/* 把 Unicode 12.0+ 的新 emoji 换成老版本通用字符(2026-07-19)
 * 起因:娃的设备字体旧,新 emoji 显示成豆腐块。之前手工换过 🪐🪵🪤🫙🧍,
 *      但全站扫下来还有 22 个,而且我自己新写的课又引进了几个(🫀🫁🪜🪢🪞)。
 *      索性做成脚本,以后每次生成完自动跑一遍,杜绝再混进来。
 * 覆盖范围:lessons/*.html + index.html + _template/*.js(数据文件里的也换,免得重新生成又回来)
 * 用法:node _template/inject-emoji.js          全站替换
 *      node _template/inject-emoji.js --check  只检查不改(有残留则退出码 1)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* 新 emoji → 老的通用替代。选替代时优先保住原来的意思。 */
const MAP = {
  '🦪':'💎',  // 牡蛎→宝石(深海珍珠)
  '🫀':'❤️',  // 心脏器官→红心
  '🩹':'💊',  // 创可贴→药
  '🪢':'🧶',  // 绳结→毛线
  '🪜':'📶',  // 梯子→阶梯状信号格
  '🪨':'🗿',  // 石头→石像
  '🧑':'👤',  // 中性人→人形剪影
  '🧗':'🏃',  // 攀岩→跑步
  '🧘':'😌',  // 打坐→放松脸
  '🫁':'💨',  // 肺→气
  '🦿':'🦵',  // 机械腿→腿
  '🦫':'🐿️',  // 河狸→花栗鼠
  '🪙':'💰',  // 硬币→钱袋
  '🪶':'🕊️',  // 羽毛→鸽子
  '🥺':'😢',  // 恳求脸→哭脸
  '🪂':'☂️',  // 降落伞→伞
  '🪁':'🎈',  // 风筝→气球
  '🦾':'💪',  // 机械臂→手臂
  '🧒':'👦',  // 儿童→男孩
  '🪞':'🖼️',  // 镜子→带框的画
  '🫗':'💧',  // 倒水→水滴
  '🪄':'✨',  // 魔法棒→闪光
  '🪓':'🔨',  // 斧头→锤子
  '🫧':'🔵',  // 气泡(U14)→蓝圆
  '🧎':'🙇',  // 跪姿人(U12)→弯腰的人
};
/* 检测用:Unicode 12.0+ 常见新增段。
   注意 1F9CD-1F9CF(🧍🧎🧏)才是 Unicode 12 新增;
   1F9D0(🧐)、1F9D1(🧑)、1F9D2(🧒) 是 Unicode 10 的老字,区间别划到那边去,否则误报。*/
const NEW_RE = /[\u{1FA70}-\u{1FAFF}\u{1F9CD}-\u{1F9CF}\u{1F90C}-\u{1F90E}\u{1F971}\u{1F972}\u{1F97A}\u{1F9A3}-\u{1F9AF}\u{1F9BB}-\u{1F9BF}]/gu;

const files = [];
files.push(path.join(ROOT, 'index.html'));
const L = path.join(ROOT, 'lessons');
for (const d of fs.readdirSync(L)) {
  const f = path.join(L, d, 'index.html');
  if (fs.existsSync(f)) files.push(f);
}
const T = path.join(ROOT, '_template');
for (const d of fs.readdirSync(T)) {
  if (d.endsWith('.js') && d !== 'inject-emoji.js') files.push(path.join(T, d));
}

const checkOnly = process.argv.includes('--check');
let changedFiles = 0, changedCount = 0;
const leftover = {};

for (const f of files) {
  let s = fs.readFileSync(f, 'utf8');
  const orig = s;
  if (!checkOnly) {
    for (const [a, b] of Object.entries(MAP)) {
      if (s.includes(a)) { changedCount += s.split(a).length - 1; s = s.split(a).join(b); }
    }
    if (s !== orig) { fs.writeFileSync(f, s, 'utf8'); changedFiles++; }
  }
  const rest = s.match(NEW_RE);
  if (rest) [...new Set(rest)].forEach(c => (leftover[c] = leftover[c] || []).push(path.basename(path.dirname(f))));
}

if (checkOnly) {
  const k = Object.keys(leftover);
  if (!k.length) { console.log('✅ 没有 Unicode 12+ 新 emoji'); process.exit(0); }
  console.log(`❌ 还有 ${k.length} 个新 emoji 未替换:`);
  k.forEach(c => console.log(`  ${c} U+${c.codePointAt(0).toString(16).toUpperCase()} 出现在 ${leftover[c].slice(0,6).join(',')}`));
  process.exit(1);
}
console.log(`新 emoji 替换:${changedFiles} 个文件  共 ${changedCount} 处`);
const k = Object.keys(leftover);
if (k.length) {
  console.log(`⚠️ 还有 ${k.length} 个没在替换表里,需要手动补 MAP:`);
  k.forEach(c => console.log(`  ${c} U+${c.codePointAt(0).toString(16).toUpperCase()} 出现在 ${leftover[c].slice(0,6).join(',')}`));
}
