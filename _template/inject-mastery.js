/* 批量注入「掌握模式」到所有课的闯关 quiz(2026-07-16)
 * 目的:娃靠试错点选项通关。根因=答错免费+讲解只给答对的人+答对1.3秒自动翻页。
 * 做法:在每课 </script> 前追加新版 ans()/renderQ 辅助,靠"同作用域后声明覆盖先声明"接管旧逻辑,
 *      不改动原课任何一行代码(145 课的 ans 有多种写法,正则改风险太大)。
 * 用法:node _template/inject-mastery.js [课程id...]   不带参数=全站
 */
const fs = require('fs');
const path = require('path');

const LESSONS = path.join(__dirname, '..', 'lessons');
const MARK = '/* ===== 掌握模式 v1 ===== */';

const PATCH = `
${MARK}
/* 答错必讲解+锁读秒;答对手动翻页;错题末尾重考到会。覆盖上面的 ans()。 */
var _mzRetry=[], _mzFirst={}, _mzR2=0, _mzLock=0;
function _mzOpts(){ return document.querySelectorAll('#qopts .qopt'); }
function _mzSetLock(on){ _mzOpts().forEach(function(o){ if(!o.dataset.dead) o.style.pointerEvents = on?'none':''; }); }
function _mzBtn(txt,cb){
  var f=document.getElementById('qfb');
  var b=document.createElement('button');
  b.textContent=txt;
  b.style.cssText='display:block;margin:14px auto 2px;border:none;border-radius:14px;padding:11px 26px;font-size:16px;font-weight:900;color:#fff;cursor:pointer;background:var(--accent,var(--acc,#2b7de9));';
  b.onclick=cb; f.appendChild(b);
}
function _mzStarNote(){
  if(typeof stars!=='undefined') return;  /* 挑战课自带星级,不重复插 */
  var n=QUIZ.length, got=0; for(var k in _mzFirst){ if(_mzFirst[k]) got++; }
  var card=document.querySelector('.finishCard'); if(!card) return;
  if(card.querySelector('._mzStar')) return;
  var d=document.createElement('div'); d.className='_mzStar';
  d.style.cssText='margin:2px 0 12px;font-weight:900;font-size:15px;line-height:1.6;';
  if(got>=n){ d.style.color='#e8a51b'; d.innerHTML='⭐⭐⭐ 满星通关！'+n+' 题全部<b>一次就答对</b>，是真的懂了！'; }
  else { d.style.color='#8a8f98'; d.innerHTML='⭐ 一次答对 <b>'+got+'/'+n+'</b> 题<br><span style="font-size:13px;font-weight:700">有 '+(n-got)+' 题是重做才对的，下次争取一遍过～</span>'; }
  var h=card.querySelector('h2'); if(h) h.insertAdjacentElement('afterend',d); else card.prepend(d);
}
function _mzFin(){ _mzStarNote(); if(typeof finish==='function') finish(); else go('finish'); }
function _mzMark(){ var p=document.getElementById('qprog'); if(p) p.textContent='🔁 错题重考 · 还剩 '+_mzRetry.length+' 题'; }
function _mzRetryCard(){
  var ico=document.getElementById('qico'), tx=document.getElementById('qtext');
  if(ico) ico.textContent='🔁';
  if(tx) tx.innerHTML='刚才有 <b>'+_mzRetry.length+'</b> 题答错了。<br>再考一遍，真会了才算过！';
  document.getElementById('qopts').innerHTML='';
  var p=document.getElementById('qprog'); if(p) p.textContent='错题重考';
  var f=document.getElementById('qfb'); f.style.color='#8a8f98'; f.innerHTML='';
  _mzBtn('好，再来一遍 ▶', function(){ qi=_mzRetry[0]; renderQ(); _mzMark(); });
}
function _mzAdvance(){
  if(!_mzR2){
    qi++;
    if(qi<QUIZ.length){ renderQ(); return; }
    if(_mzRetry.length){ _mzR2=1; _mzRetryCard(); return; }
    _mzFin(); return;
  }
  _mzRetry.shift();
  if(_mzRetry.length){ qi=_mzRetry[0]; renderQ(); _mzMark(); return; }
  _mzFin();
}
function ans(el,ok,fb){
  if(_mzLock) return;
  var f=document.getElementById('qfb'), idx=qi;
  if(!ok){
    if(_mzFirst[idx]===undefined) _mzFirst[idx]=0;
    if(!_mzR2 && _mzRetry.indexOf(idx)<0) _mzRetry.push(idx);
    el.classList.add('wrong'); el.dataset.dead='1'; el.style.pointerEvents='none'; el.style.opacity='.4';
    _mzLock=1; _mzSetLock(true);
    f.style.color='#e06060';
    f.innerHTML='❌ 不对哦～<br><span style="color:#4a5058;font-weight:700">💡 '+fb+'</span><br><span class="_mzTick" style="color:#9aa0a8;font-size:13px;font-weight:700">读一读上面这句，<b>3</b> 秒后再选一次…</span>';
    var n=3, t=setInterval(function(){
      n--; var tk=document.querySelector('._mzTick');
      if(n>0){ if(tk) tk.innerHTML='读一读上面这句，<b>'+n+'</b> 秒后再选一次…'; return; }
      clearInterval(t); _mzLock=0; _mzSetLock(false);
      if(tk) tk.innerHTML='👆 现在再选一次';
    },1000);
    return;
  }
  if(_mzFirst[idx]===undefined){ _mzFirst[idx]=1; if(typeof stars!=='undefined') stars++; }
  el.classList.add('right'); _mzSetLock(true);
  f.style.color='#2ba36a'; f.innerHTML='✅ '+fb;
  var last = _mzR2 ? (_mzRetry.length<=1) : (qi>=QUIZ.length-1 && !_mzRetry.length);
  _mzBtn(last?'我懂了，完成 ▶':'我懂了，下一题 ▶', _mzAdvance);
}
`;

const only = process.argv.slice(2);
let done = 0, skip = 0, miss = 0;

for (const d of fs.readdirSync(LESSONS)) {
  if (only.length && !only.includes(d)) continue;
  const f = path.join(LESSONS, d, 'index.html');
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, 'utf8');

  if (s.includes(MARK)) { skip++; continue; }
  // 必需的接入点:旧 ans / QUIZ / renderQ / qfb
  if (!/function ans\(el,ok,fb\)/.test(s) || !/\bQUIZ\s*=/.test(s) || !/function renderQ\(/.test(s) || !s.includes('id="qfb"')) {
    console.log('  跳过(结构不符):', d); miss++; continue;
  }
  const i = s.lastIndexOf('</script>');
  if (i < 0) { console.log('  跳过(无script):', d); miss++; continue; }

  s = s.slice(0, i) + PATCH + '\n' + s.slice(i);
  fs.writeFileSync(f, s, 'utf8');
  done++;
}
console.log(`注入完成:${done} 课  已存在跳过:${skip}  结构不符:${miss}`);
