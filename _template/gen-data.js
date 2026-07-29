// 第三批扩课：🌏 世界之窗 / 🏮 节日与历法 / 🧪 材料变变变 / 🌋 地球奥秘
// 每区 8 课 + 1 区挑战。内容按区拆成独立文件，方便单独改、单独复核。
// 上一批（植物花园/语文诗词园/美食科学厨房/数学勇士营）已归档在
// data-b2-plant-chinese-food-math2.js，需要重新生成那批时把它 require 进来即可。
const parts = [
  require('./data-globe.js'),
  require('./data-festival.js'),
  require('./data-material.js'),
  require('./data-earth.js'),
];

const THEMES = {}, REGION_META = {};
let LESSONS = [], BOSSES = [];
for (const p of parts) {
  Object.assign(THEMES, p.THEMES);
  Object.assign(REGION_META, p.REGION_META);
  LESSONS = LESSONS.concat(p.LESSONS);
  BOSSES = BOSSES.concat(p.BOSSES);
}

module.exports = {THEMES, REGION_META, LESSONS, BOSSES};
