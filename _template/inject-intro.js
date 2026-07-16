/* 开场(片头)不许秒跳(2026-07-16)
 * 现象:娃每节课片头直接点过,直奔知识点。
 * 做法:开场按钮先灰掉读秒(按开场文字长度 3~6 秒),文案提示"先读一读",读完才亮。
 *      不改 HTML,注入 IIFE 在运行时接管按钮(145 课结构统一:#s-intro 内一个 .bigbtn)。
 * 用法:node _template/inject-intro.js [课程id...]
 */
const fs = require('fs');
const path = require('path');

const LESSONS = path.join(__dirname, '..', 'lessons');
const MARK = '/* ===== 开场读秒 v1 ===== */';

const PATCH = `
${MARK}
(function(){
  var sec = document.getElementById('s-intro');
  var btn = sec && sec.querySelector('.bigbtn');
  if(!btn) return;
  var card = sec.querySelector('.introCard');
  var len = card ? (card.innerText||'').replace(/\\s/g,'').length : 60;
  var n = Math.max(3, Math.min(6, Math.round(len/18)));   /* 3~6 秒,按开场文字长短 */
  var orig = btn.textContent, css = btn.style.cssText;
  btn.disabled = true; btn.style.opacity = '.4'; btn.style.cursor = 'default';
  var tip = document.createElement('div');
  tip.style.cssText = 'margin:10px auto 0;color:#9aa0a8;font-size:14px;font-weight:800;';
  tip.innerHTML = '👀 先读一读上面这段…';
  btn.insertAdjacentElement('afterend', tip);
  btn.textContent = orig + '（' + n + '）';
  var t = setInterval(function(){
    n--;
    if(n>0){ btn.textContent = orig + '（' + n + '）'; return; }
    clearInterval(t);
    btn.disabled = false; btn.style.cssText = css; btn.textContent = orig;
    tip.remove();
  },1000);
})();
`;

const only = process.argv.slice(2);
let done = 0, skip = 0, miss = 0;

for (const d of fs.readdirSync(LESSONS)) {
  if (only.length && !only.includes(d)) continue;
  const f = path.join(LESSONS, d, 'index.html');
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, 'utf8');
  if (s.includes(MARK)) { skip++; continue; }
  if (!/id="s-intro"/.test(s)) { miss++; continue; }
  const i = s.lastIndexOf('</script>');
  if (i < 0) { miss++; continue; }
  s = s.slice(0, i) + PATCH + '\n' + s.slice(i);
  fs.writeFileSync(f, s, 'utf8');
  done++;
}
console.log(`开场读秒注入:${done} 课  跳过:${skip}  无 intro:${miss}`);
