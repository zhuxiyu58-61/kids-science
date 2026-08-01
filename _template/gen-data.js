// 第四批扩课（2026-08-01）：20 个区各 +5 课，共 100 课，不新增区挑战。
// 内容按区拆成独立文件 data-x4-<区key>.js，配色和区名统一从 themes-all.js 取，免得抄错。
// 上一批（世界之窗/节日与历法/材料变变变/地球奥秘）已归档在 data-globe/festival/material/earth.js，
// 更早的批次在 data-batch*.js、data-b2-*.js、data-space-15.js、data-2026-07-18.js，
// 需要重新生成哪一批，把对应文件 require 进来即可。
const parts = [
  require('./data-x4-nature.js'),
  require('./data-x4-art.js'),
  require('./data-x4-world.js'),
  require('./data-x4-bio.js'),
  require('./data-x4-game.js'),
  require('./data-x4-logic.js'),
  require('./data-x4-space.js'),
  require('./data-x4-math.js'),
  require('./data-x4-animal.js'),
  require('./data-x4-tech.js'),
  require('./data-x4-life.js'),
  require('./data-x4-heart.js'),
  require('./data-x4-plant.js'),
  require('./data-x4-chinese.js'),
  require('./data-x4-food.js'),
  require('./data-x4-math2.js'),
  require('./data-x4-globe.js'),
  require('./data-x4-festival.js'),
  require('./data-x4-material.js'),
  require('./data-x4-earth.js'),
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
