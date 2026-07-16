/* 探索环节(ROUNDS_A/B、makeMini)的判错也改成"答错必讲解+锁读秒"(2026-07-16)
 * 探索是「学」的环节:答错给讲解、锁 3 秒逼她读、划掉错选项,但不做重考(卡死会让娃放弃)。
 * 「考」在闯关 quiz,那里已由 inject-mastery.js 做了错题重考。
 * 用法:node _template/inject-explore.js [课程id...]
 */
const fs = require('fs');
const path = require('path');

const LESSONS = path.join(__dirname, '..', 'lessons');
const MARK = '/* ===== 探索判错 v1 ===== */';

const HELPER = `
${MARK}
/* 探索题答错:划掉错选项 + 讲解 + 锁 3 秒读完再选 */
function _mzMini(el, cap, capEl, fallback){
  if(el.dataset.dead) return;
  el.classList.add('wrong'); el.dataset.dead='1'; el.style.pointerEvents='none'; el.style.opacity='.4';
  var sibs = el.parentElement ? el.parentElement.children : [];
  for(var i=0;i<sibs.length;i++){ if(!sibs[i].dataset.dead) sibs[i].style.pointerEvents='none'; }
  var msg = cap || fallback || '';
  if(capEl){
    capEl.innerHTML = '❌ 不对哦～<br><span style="color:#4a5058;font-weight:700">💡 '+msg+'</span>'
      + '<br><span class="_mzT2" style="color:#9aa0a8;font-size:13px;font-weight:700">读一读，<b>3</b> 秒后再选…</span>';
  }
  var n=3, t=setInterval(function(){
    n--;
    var tk = capEl && capEl.querySelector('._mzT2');
    if(n>0){ if(tk) tk.innerHTML='读一读，<b>'+n+'</b> 秒后再选…'; return; }
    clearInterval(t);
    for(var j=0;j<sibs.length;j++){ if(!sibs[j].dataset.dead) sibs[j].style.pointerEvents=''; }
    if(tk) tk.innerHTML='👆 再选一次';
  },1000);
}
`;

// else { b.classList.add('wrong'); setTimeout(()=>b.classList.remove('wrong'),400); <capEl>.textContent='<提示>'; }
const RE = /else\s*\{\s*b\.classList\.add\('wrong'\);\s*setTimeout\(\(\)=>b\.classList\.remove\('wrong'\),\s*400\);\s*(?:(document\.getElementById\('[A-Za-z0-9_]+'\))|([A-Za-z_$][\w$]*))?\s*(?:\.(?:textContent|innerHTML)\s*=\s*(['"])((?:(?!\3).)*)\3\s*;)?\s*\}/g;

const only = process.argv.slice(2);
let done = 0, skip = 0, hits = 0, miss = 0;

for (const d of fs.readdirSync(LESSONS)) {
  if (only.length && !only.includes(d)) continue;
  const f = path.join(LESSONS, d, 'index.html');
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, 'utf8');
  if (s.includes(MARK)) { skip++; continue; }

  let n = 0;
  s = s.replace(RE, (m, byId, byVar, _q, msg) => {
    const capEl = byId || byVar || 'null';
    const fb = (msg || '').replace(/'/g, "\\'");
    n++;
    return `else { _mzMini(b, (typeof r!=='undefined'&&r&&r.cap)?r.cap:'', ${capEl}, '${fb}'); }`;
  });

  if (!n) { miss++; continue; }
  const i = s.lastIndexOf('</script>');
  if (i < 0) { miss++; continue; }
  s = s.slice(0, i) + HELPER + '\n' + s.slice(i);
  fs.writeFileSync(f, s, 'utf8');
  done++; hits += n;
}
console.log(`探索判错注入:${done} 课(共 ${hits} 处)  已存在跳过:${skip}  无匹配:${miss}`);
