/* 给「今日大挑战」的 QBANK 每个区各补 2 道题（全部出自第四批新课）。
 * 用法：node _template/patch-daily-x4.js [--dry]
 * 幂等：按题干判重，已经有的不会再插一遍。
 */
const fs = require('fs');
const path = require('path');

const F = path.join(__dirname, '..', 'lessons', 'daily', 'index.html');
const dry = process.argv.includes('--dry');
let html = fs.readFileSync(F, 'utf8');

const ADD = {
 nature: [
  `{ico:'🥄',q:'铁勺放在热汤里，勺柄也会烫，靠的是？',opts:[['挨着一点点传过去',1],['太阳照过来',0]],fb:'贴着传叫传导，金属最快。'}`,
  `{ico:'🎈',q:'把空杯子竖着倒扣按进水里，杯底的纸会？',opts:[['还是干的',1],['马上湿透',0]],fb:'杯里的空气占着地方，水进不来。'}`],
 art: [
  `{ico:'🎭',q:'京剧脸谱里黑脸代表？',opts:[['正直、不讲情面',1],['胆小',0]],fb:'最有名的黑脸是包公。'}`,
  `{ico:'🗿',q:'欣赏一件雕塑，正确的做法是？',opts:[['围着它走一圈看每一面',1],['只站正面看',0]],fb:'立体作品每个角度都是作品。'}`],
 world: [
  `{ico:'🧱',q:'长城主要挡的是？',opts:[['北边骑兵的马',1],['天上的鸟',0]],fb:'人翻得过墙，马翻不过去。'}`,
  `{ico:'⛵',q:'远去的船总是哪部分先看不见？',opts:[['船身',1],['桅杆',0]],fb:'说明海面是弯的。'}`],
 bio: [
  `{ico:'👁️',q:'关了灯什么也看不见，说明眼睛？',opts:[['自己不发光，要靠光进来',1],['坏掉了',0]],fb:'眼睛是收光的，不是发光的。'}`,
  `{ico:'🔴',q:'血里负责把氧气送到全身的是？',opts:[['红细胞',1],['白细胞',0]],fb:'白细胞负责打细菌。'}`],
 game: [
  `{ico:'💾',q:'游戏没存档就关机，进度会？',opts:[['丢掉，内存里的东西断电就没',1],['自动保留',0]],fb:'要写进硬盘或服务器才留得住。'}`,
  `{ico:'📶',q:'联机游戏卡顿，主要因为？',opts:[['消息在你和服务器之间跑要时间',1],['屏幕太亮',0]],fb:'这段时间叫延迟。'}`],
 logic: [
  `{ico:'🤝',q:'5 个人两两握手，一共握几次？',opts:[['10 次',1],['20 次',0]],fb:'5×4÷2＝10，要去掉重复。'}`,
  `{ico:'🥞',q:'一次烙 2 张、每面 3 分钟，烙 3 张饼最快要？',opts:[['9 分钟',1],['12 分钟',0]],fb:'中途换饼，三轮都装满。'}`],
 space: [
  `{ico:'☀️',q:'阳光从太阳跑到地球大约要？',opts:[['8 分多钟',1],['一瞬间',0]],fb:'光很快，但太阳实在太远。'}`,
  `{ico:'🗑️',q:'太空垃圾很危险，主要因为？',opts:[['速度极快，一小块也能打穿卫星',1],['它有毒',0]],fb:'轨道上约每秒 8 公里。'}`],
 math: [
  `{ico:'🚆',q:'车长 100 米，完全通过 200 米的桥要跑？',opts:[['300 米',1],['200 米',0]],fb:'桥长＋车长，车尾出桥才算过完。'}`,
  `{ico:'🔗',q:'12 人爱苹果、10 人爱香蕉、4 人两样都爱，一共几人？',opts:[['18 人',1],['22 人',0]],fb:'两边相加，减去重叠。'}`],
 animal: [
  `{ico:'🐜',q:'昆虫有几条腿？',opts:[['6 条',1],['8 条',0]],fb:'蜘蛛 8 条腿，不算昆虫。'}`,
  `{ico:'🐟',q:'鱼在水里靠什么呼吸？',opts:[['鳃',1],['肺',0]],fb:'鲸和海豚用肺，它们不是鱼。'}`],
 tech: [
  `{ico:'📺',q:'屏幕上每个点由哪三种颜色的小灯组成？',opts:[['红、绿、蓝',1],['红、黄、蓝',0]],fb:'那是光的三原色。'}`,
  `{ico:'🔋',q:'电池凸起的那一头是？',opts:[['正极',1],['负极',0]],fb:'平的那头才是负极。'}`],
 life: [
  `{ico:'🧼',q:'洗手打上肥皂要搓多久？',opts:[['大约 20 秒',1],['3 秒就够',0]],fb:'差不多是唱两遍生日歌。'}`,
  `{ico:'🍳',q:'油锅着火了应该？',opts:[['盖上锅盖并关火',1],['泼一盆水',0]],fb:'泼水会让火焰炸开。'}`],
 heart: [
  `{ico:'🤝',q:'下面哪句才是真道歉？',opts:[['对不起，我不该抢你的书',1],['对不起，但是你先惹我的',0]],fb:'一个"但是"就把道歉抵消了。'}`,
  `{ico:'🛡️',q:'被同学反复欺负，应该？',opts:[['告诉老师和爸妈',1],['一个人偷偷忍着',0]],fb:'求助不是打小报告。'}`],
 plant: [
  `{ico:'🌵',q:'仙人掌的刺其实是？',opts:[['变形的叶子',1],['花',0]],fb:'变成刺能少丢水。'}`,
  `{ico:'🌞',q:'窗边的花歪向窗户，是因为？',opts:[['背光那一侧长得更快',1],['花想往外看',0]],fb:'两边长得不一样快，茎就弯了。'}`],
 chinese: [
  `{ico:'🔀',q:'"长大"的"长"读什么？',opts:[['zhǎng',1],['cháng',0]],fb:'表示生长、年纪读 zhǎng。'}`,
  `{ico:'🧧',q:'对联最基本的规矩是？',opts:[['上下联字数一样多',1],['必须写在红纸上',0]],fb:'字数不等，就不是对联。'}`],
 food: [
  `{ico:'♨️',q:'普通锅里的水最高能烧到？',opts:[['大约 100℃',1],['200℃',0]],fb:'开了以后温度就不再升。'}`,
  `{ico:'🦷',q:'吃糖为什么会蛀牙？',opts:[['嘴里的细菌吃糖后产酸腐蚀牙齿',1],['糖太硬把牙磨坏',0]],fb:'真凶是细菌产的酸。'}`],
 math2: [
  `{ico:'⚖️',q:'1 千克等于多少克？',opts:[['1000 克',1],['100 克',0]],fb:'千就是 1000。'}`,
  `{ico:'📐',q:'把一个角的两条边都延长，角会？',opts:[['一点没变',1],['变大一倍',0]],fb:'角只看张开的程度。'}`],
 globe: [
  `{ico:'🧭',q:'南极和北极最根本的区别是？',opts:[['南极是大陆，北极是海',1],['南极面积更大',0]],fb:'一个是陆，一个是浮着海冰的海。'}`,
  `{ico:'⛰️',q:'地球陆地最高的地方是？',opts:[['珠穆朗玛峰',1],['泰山',0]],fb:'约 8848 米。'}`],
 festival: [
  `{ico:'🏮',q:'元宵节是农历哪一天？',opts:[['正月十五',1],['八月十五',0]],fb:'八月十五是中秋。'}`,
  `{ico:'🗓️',q:'闰年的 2 月有几天？',opts:[['29 天',1],['28 天',0]],fb:'平年 2 月才是 28 天。'}`],
 material: [
  `{ico:'🧲',q:'磁铁能吸住下面哪一个？',opts:[['铁钉',1],['铝制易拉罐',0]],fb:'铝和铜都吸不住。'}`,
  `{ico:'💎',q:'天然材料里最硬的是？',opts:[['金刚石',1],['钢',0]],fb:'玻璃刀的刀头就用它。'}`],
 earth: [
  `{ico:'🏞️',q:'山里河流切出来的谷多是什么形状？',opts:[['V 形',1],['U 形',0]],fb:'U 形是冰川磨出来的。'}`,
  `{ico:'☁️',q:'空气里含量最多的气体是？',opts:[['氮气',1],['氧气',0]],fb:'氮约 78%，氧约 21%。'}`],
};

/* 找到 QBANK 里某个区的数组，返回它右中括号的下标（做括号配平，别被字符串里的括号骗了） */
function findArrayEnd(s, from) {
  let i = s.indexOf('[', from), depth = 0, inStr = null;
  for (let j = i; j < s.length; j++) {
    const c = s[j];
    if (inStr) { if (c === '\\') { j++; continue; } if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) return j; }
  }
  return -1;
}

const qbStart = html.indexOf('const QBANK=');
if (qbStart < 0) { console.error('❌ 找不到 QBANK'); process.exit(1); }

let added = 0, skipped = 0;
for (const key of Object.keys(ADD)) {
  const keyRe = new RegExp('\\n\\s*' + key + ':\\s*\\[');
  const m = html.slice(qbStart).match(keyRe);
  if (!m) { console.error('❌ QBANK 里找不到区 ' + key); continue; }
  const at = qbStart + m.index;
  const end = findArrayEnd(html, at);
  if (end < 0) { console.error('❌ ' + key + ' 的数组括号配不平'); continue; }
  const body = html.slice(at, end);
  const fresh = ADD[key].filter(line => {
    const q = line.match(/q:'([^']*)'/)[1];
    if (body.includes(q)) { skipped++; return false; }
    return true;
  });
  if (!fresh.length) continue;
  html = html.slice(0, end) + ',\n  ' + fresh.join(',\n  ') + html.slice(end);
  added += fresh.length;
  console.log(`  ${key}: +${fresh.length} 题`);
}

console.log(`\n合计新增 ${added} 题，跳过（已存在）${skipped} 题`);
if (dry) { console.log('--dry 模式，没有写文件'); process.exit(0); }
if (added) { fs.writeFileSync(F, html, 'utf8'); console.log('已写回 lessons/daily/index.html'); }
