// 按 breathe 课骨架生成课程页 + 按 ch-heart 骨架生成区挑战页
const fs = require('fs');
const path = require('path');
/* 数据文件可用参数指定，便于每天一批：node _template/gen.js _template/data-2026-07-18.js
   不带参数=沿用老的 gen-data.js */
const DATA = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, 'gen-data.js');
const {THEMES, REGION_META, LESSONS, BOSSES} = require(DATA);
const OUT = path.join(__dirname, '..', 'lessons');   // 跟着仓库走，别写死绝对路径

function lessonPage(L){
  const T = THEMES[L.region], R = REGION_META[L.region];
  const binH = b=>`<div class="bin" data-k="${b.k}"><div class="binIco">${b.ico}</div><div class="binName">${b.name}</div><div class="binHint">${b.hint}</div><div class="binDrop"></div></div>`;
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>${L.n} · 知识乐园</title>
<style>
  :root{ --accent:${T.accent}; --bg1:${T.bg1}; --bg2:${T.bg2}; --ink:${T.ink}; --ink2:${T.ink2}; --card:#fff; --shadow:0 10px 30px ${T.sh}; }
  *{box-sizing:border-box; -webkit-tap-highlight-color:transparent; user-select:none;}
  html,body{height:100%; margin:0;}
  body{ font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif; color:var(--ink);
    background:radial-gradient(120% 90% at 50% 0%, var(--bg1) 0%, var(--bg2) 70%, var(--bg2) 100%);
    overflow:hidden; touch-action:manipulation; display:flex; flex-direction:column; height:100vh; }
  .topbar{display:flex; align-items:center; gap:10px; padding:10px 16px;}
  .back{font-size:19px; background:#fff; border:none; border-radius:16px; padding:8px 14px; box-shadow:var(--shadow); color:var(--ink); font-weight:800; cursor:pointer;}
  .title{font-size:clamp(17px,2.8vw,26px); font-weight:900;} .title small{display:block; font-size:12px; color:var(--ink2); font-weight:700;}
  .steps{margin-left:auto; display:flex; gap:8px;} .dot{width:13px; height:13px; border-radius:50%; background:#ffffffb0; transition:.3s;} .dot.on{background:var(--accent); transform:scale(1.2);}
  .scene{flex:1; min-height:0; display:none; flex-direction:column; padding:2px 16px 14px;} .scene.active{display:flex;}
  #s-intro{align-items:center; justify-content:center; text-align:center;}
  .kico{font-size:92px; animation:bob 2.4s ease-in-out infinite;} @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
  .introCard{background:var(--card); border-radius:24px; padding:22px 28px; box-shadow:var(--shadow); max-width:600px; font-size:clamp(15px,2.2vw,19px); font-weight:700; line-height:1.7;} .introCard b{color:var(--accent);}
  .bigbtn{border:none; border-radius:20px; padding:15px 38px; font-size:20px; font-weight:900; color:#fff; background:linear-gradient(160deg,${T.g1},${T.acc2}); box-shadow:var(--shadow); cursor:pointer; letter-spacing:1px; margin-top:18px;} .bigbtn:active{transform:scale(.95);}
  .exTabs{display:flex; gap:10px; justify-content:center; margin-bottom:8px;}
  .exTab{border:none; background:#ffffffcc; color:var(--ink2); font-weight:800; font-size:15px; padding:9px 18px; border-radius:16px; cursor:pointer; box-shadow:var(--shadow);} .exTab.on{background:var(--accent); color:#fff;}
  .exBody{flex:1; min-height:0; display:flex;} .subview{flex:1; min-height:0; display:none; flex-direction:column; align-items:center; justify-content:center; gap:14px;} .subview.on{display:flex;} .exFoot{margin-top:8px;}
  .bigEmo{font-size:56px; animation:bob 2.4s ease-in-out infinite;}
  .orbit{display:flex; flex-wrap:wrap; gap:10px; justify-content:center; max-width:640px;}
  .planet{background:var(--card); border-radius:18px; box-shadow:var(--shadow); padding:10px 8px; width:112px; text-align:center; cursor:pointer; border:3px solid ${T.opb}; transition:.15s;}
  .planet:active{transform:scale(.94);} .planet.seen{border-color:#41c98a; background:#f0fbf4;}
  .planet .pe{font-size:34px;} .planet .pn{font-weight:800; font-size:13px; margin-top:2px;}
  .factBox{background:var(--card); border-radius:18px; box-shadow:var(--shadow); padding:14px 18px; max-width:560px; font-weight:800; font-size:15px; line-height:1.8; min-height:52px; text-align:center;} .factBox b{color:var(--accent);}
  .seqBox{background:var(--card); border-radius:20px; padding:18px 24px; box-shadow:var(--shadow); font-size:19px; text-align:center; max-width:600px; font-weight:900;}
  .seqQ{color:var(--ink2); font-size:18px; font-weight:900;}
  .optRow{display:flex; gap:14px; flex-wrap:wrap; justify-content:center;}
  .optBtn{border:3px solid ${T.opb}; background:${T.opbg}; border-radius:16px; padding:12px 20px; font-size:16px; font-weight:900; cursor:pointer; box-shadow:var(--shadow);} .optBtn:active{transform:scale(.94);}
  .optBtn.right{border-color:#41c98a; background:#e4fbef;} .optBtn.wrong{border-color:#ff8a8a; background:#ffeaea;}
  .roundCap{font-weight:900; color:var(--ink2); font-size:14px; text-align:center; line-height:1.5; max-width:560px;}
  .progDots{display:flex; gap:8px;} .pd{width:10px; height:10px; border-radius:50%; background:${T.opb};} .pd.done{background:var(--accent);}
  .nextHint{background:${T.hint}; border-radius:14px; padding:10px 14px; font-weight:800; color:${T.hintc}; font-size:14px; text-align:center;} .nextHint b{color:var(--accent);}
  .nextBtn{border:none; border-radius:16px; padding:14px; font-size:18px; font-weight:900; color:#fff; width:100%; background:linear-gradient(160deg,${T.g1},${T.acc2}); box-shadow:var(--shadow); cursor:pointer; display:none;} .nextBtn:active{transform:scale(.97);}
  #s-game{align-items:center;} .gameTitle{font-size:clamp(16px,2.4vw,21px); font-weight:900; text-align:center; margin:2px 0 12px;} .gameTitle small{display:block; font-size:13px; color:var(--ink2); font-weight:700; margin-top:2px;}
  .gsub{flex:1; min-height:0; width:100%; display:none; flex-direction:column; align-items:center;} .gsub.on{display:flex;}
  .roundNext{display:none; margin-top:18px; text-align:center;} .roundNext .ok{font-size:18px;font-weight:900;color:#2ba36a;margin-bottom:8px;}
  .bins{display:flex; gap:14px; width:100%; max-width:620px; justify-content:center;}
  .bin{flex:1; background:#ffffffcc; border:4px dashed ${T.opb}; border-radius:20px; padding:12px 8px; text-align:center; min-height:150px; transition:.2s;}
  .bin.over{border-color:var(--accent); background:${T.hint};} .bin.filled{border-style:solid; border-color:#41c98a; background:#e9fbf1;}
  .bin .binIco{font-size:32px;} .bin .binName{font-weight:900; font-size:16px; margin-top:4px;} .bin .binHint{font-size:12px; color:var(--ink2); font-weight:700;}
  .bin .binDrop{margin-top:8px; min-height:60px; display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:4px;}
  .tray{display:flex; gap:12px; margin-top:20px; justify-content:center; flex-wrap:wrap;}
  .item{background:#fff; border-radius:16px; box-shadow:var(--shadow); padding:10px 13px; text-align:center; cursor:grab; touch-action:none; max-width:170px;}
  .item.dragging{cursor:grabbing; transform:scale(1.08) rotate(-3deg); box-shadow:0 18px 36px ${T.sh};}
  .item.placed{cursor:default; box-shadow:none; padding:5px 8px;}
  .item .itName{font-weight:800; font-size:13px; line-height:1.3;} .item.placed .itName{font-size:10px;}
  .qcard{background:var(--card); border-radius:22px; box-shadow:var(--shadow); padding:22px 26px; max-width:600px; width:100%; text-align:center;} .qcard .qico{font-size:44px;} .qcard .qtext{font-size:18px; font-weight:900; margin:8px 0 16px; line-height:1.5;}
  .qtag{display:inline-block; font-size:12px; font-weight:900; padding:3px 10px; border-radius:10px; margin-bottom:6px;} .qtag.sci{background:${T.hint};color:${T.hintc};} .qtag.logic{background:#eef;color:#5a4bd0;} .qtag.en{background:#e3edff;color:#3f7ae0;}
  .qopts{display:flex; flex-direction:column; gap:10px;} .qopt{border:3px solid ${T.opb}; background:${T.opbg}; border-radius:14px; padding:13px; font-size:16px; font-weight:800; color:var(--ink); cursor:pointer; text-align:left;} .qopt.right{border-color:#41c98a; background:#e4fbef;} .qopt.wrong{border-color:#ff8a8a; background:#ffeaea;}
  .qfb{margin-top:12px; font-size:15px; font-weight:700; min-height:22px; line-height:1.5;} .qprog{margin-bottom:12px; font-weight:800; color:var(--ink2);}
  #s-finish{align-items:center; justify-content:center; text-align:center;} .finishCard{background:var(--card); border-radius:26px; padding:26px 34px; box-shadow:var(--shadow); max-width:560px;}
  .medal{font-size:100px; animation:pop .5s ease;} @keyframes pop{0%{transform:scale(0) rotate(-30deg)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
  .finishCard h2{margin:4px 0; font-size:26px;} .medalName{display:inline-block; background:linear-gradient(160deg,${T.g1},${T.acc2}); color:#fff; font-weight:900; font-size:18px; padding:8px 20px; border-radius:18px; margin:8px 0 12px;}
  .finishCard p{color:var(--ink2); font-weight:600; line-height:1.9; margin:0 0 18px; font-size:15px; text-align:left;} .finishCard p b{color:var(--accent);}
  .finishBtns{display:flex; gap:12px; justify-content:center;} .finishBtns button{border:none; border-radius:16px; padding:13px 22px; font-size:16px; font-weight:900; cursor:pointer;} .fb1{background:var(--accent); color:#fff;} .fb2{background:${T.hint}; color:var(--ink);}
  .confetti{position:fixed; inset:0; pointer-events:none; z-index:60;}
</style>
</head>
<body>
  <div class="topbar">
    <button class="back" onclick="location.href='../../index.html'">← 回乐园</button>
    <div class="title">${L.n}<small>${R.name} · ${R.tag}</small></div>
    <div class="steps"><span class="dot on" id="p0"></span><span class="dot" id="p1"></span><span class="dot" id="p2"></span><span class="dot" id="p3"></span></div>
  </div>

  <section class="scene active" id="s-intro">
    <div class="kico">${L.e}</div>
    <div class="introCard">${L.intro}</div>
    <button class="bigbtn" onclick="go('explore')">出发探索 ▶</button>
  </section>

  <section class="scene" id="s-explore">
    <div class="exTabs">
      <button class="exTab on" id="tabA" onclick="switchEx('A')">${L.tabA}</button>
      <button class="exTab" id="tabB" onclick="switchEx('B')">💡 想一想</button>
    </div>
    <div class="exBody">
      <div class="subview on" id="ex-A"></div>
      <div class="subview" id="ex-B"></div>
    </div>
    <div class="exFoot">
      <div class="nextHint" id="nextHint">🔎 把 4 张知识卡都点一点（<span id="cntA">0</span>/4），再答对 3 题（<span id="cntB">0</span>/3），就能去闯关！</div>
      <button class="nextBtn" id="nextBtn" onclick="go('game')">去闯关 ▶</button>
    </div>
  </section>

  <section class="scene" id="s-game">
    <div class="gameTitle" id="gameTitle">🎮 第 1 关 · ${L.g1.title}<small>${L.g1.sub}</small></div>
    <div class="gsub on" id="g-round1">
      <div class="bins">${L.g1.bins.map(binH).join('\n        ')}</div>
      <div class="tray" id="tray"></div>
      <div class="roundNext" id="r1next"><div class="ok">全对啦！🎉</div><button class="bigbtn" onclick="startQuiz()">下一关 ▶</button></div>
    </div>
    <div class="gsub" id="g-quiz">
      <div class="qprog" id="qprog"></div>
      <div class="qcard"><div class="qtag" id="qtag"></div><div class="qico" id="qico">❓</div><div class="qtext" id="qtext"></div><div class="qopts" id="qopts"></div><div class="qfb" id="qfb"></div></div>
    </div>
  </section>

  <section class="scene" id="s-finish">
    <div class="finishCard"><div class="medal">${L.medal}</div><h2>闯关成功！</h2><div class="medalName">🎖 ${L.bn}</div>
      <p>要记住的：<br>${L.sum}</p>
      <div class="finishBtns"><button class="fb2" onclick="location.reload()">再玩一次</button><button class="fb1" onclick="location.href='../../index.html'">回乐园，选下一课</button></div>
    </div>
  </section>
  <canvas class="confetti" id="confetti"></canvas>

<script>
const SCENES=['intro','explore','game','finish'];
function go(name){ document.querySelectorAll('.scene').forEach(s=>s.classList.remove('active')); document.getElementById('s-'+name).classList.add('active'); const idx=SCENES.indexOf(name); SCENES.forEach((_,i)=>document.getElementById('p'+i).classList.toggle('on', i<=idx)); if(name==='finish') celebrate(); }
function switchEx(v){ document.getElementById('ex-A').classList.toggle('on',v==='A'); document.getElementById('ex-B').classList.toggle('on',v==='B'); document.getElementById('tabA').classList.toggle('on',v==='A'); document.getElementById('tabB').classList.toggle('on',v==='B'); }
let doneA=0, doneB=0;
function unlockGame(){ if(doneA>=4 && doneB>=3){ nextHint.style.display='none'; nextBtn.style.display='block'; } }

const CARDS=${JSON.stringify(L.cards)};
function renderA(){ const box=document.getElementById('ex-A');
  box.innerHTML='<div class="bigEmo">${L.e}</div><div class="orbit" id="orbit"></div><div class="factBox" id="factA">👆 点点这 4 张知识卡，看看里面的秘密～</div>';
  const orbit=document.getElementById('orbit');
  CARDS.forEach((p,i)=>{ const d=document.createElement('div'); d.className='planet'; d.dataset.i=i;
    d.innerHTML=\`<div class="pe">\${p.e}</div><div class="pn">\${p.n}</div>\`;
    d.onclick=()=>{ document.getElementById('factA').innerHTML=p.e+' <b>'+p.n+'</b>：'+p.f;
      if(!d.dataset.seen){ d.dataset.seen='1'; d.classList.add('seen'); doneA++; document.getElementById('cntA').textContent=doneA;
        /* 这里必须是 += 追加。写成 = 会把刚显示的第 4 张知识点覆盖掉，那张就永远看不到了 */
        if(doneA>=4) document.getElementById('factA').innerHTML+='<div class="factDone">🎉 4 张知识卡都看完啦！去右边答题吧！</div>'; unlockGame(); } };
    orbit.appendChild(d); });
}
const ROUNDS_B=${JSON.stringify(L.qb.map(r=>({q:r.q,opts:r.opts,ans:0,cap:r.cap})))};
let idxB=0;
function renderB(){ const box=document.getElementById('ex-B');
  if(idxB>=ROUNDS_B.length){ box.innerHTML='<div class="seqBox">🎉 三题都答对啦！</div>'; return; }
  const r=ROUNDS_B[idxB]; if(!r._sh){var _c=r.opts[r.ans]; shuffle(r.opts); r.ans=r.opts.indexOf(_c); r._sh=1;}
  box.innerHTML=\`<div class="progDots">\${ROUNDS_B.map((_,i)=>\`<div class="pd \${i<idxB?'done':''}"></div>\`).join('')}</div>
    <div class="seqQ">想一想～</div><div class="seqBox">\${r.q}</div>
    <div class="optRow" id="optRowB"></div><div class="roundCap" id="capB"></div>\`;
  const row=document.getElementById('optRowB');
  r.opts.forEach((o,i)=>{ const b=document.createElement('div'); b.className='optBtn'; b.textContent=o;
    b.onclick=()=>{ if(b.dataset.locked)return;
      if(i===r.ans){ b.classList.add('right'); b.dataset.locked='1'; document.getElementById('capB').innerHTML='✅ '+r.cap;
        doneB++; document.getElementById('cntB').textContent=doneB; unlockGame(); setTimeout(()=>{ idxB++; renderB(); },1300); }
      else { b.classList.add('wrong'); setTimeout(()=>b.classList.remove('wrong'),400); document.getElementById('capB').textContent='🤔 再想想～'; } };
    row.appendChild(b); });
}
renderA(); renderB();

const ITEMS=${JSON.stringify(L.g1.items)};
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
(function buildSort(){
  const tray=document.getElementById('tray');
  shuffle([...ITEMS]).forEach(it=>{ const d=document.createElement('div'); d.className='item'; d.dataset.k=it.key;
    d.innerHTML=\`<div class="itName">\${it.t}</div>\`; tray.appendChild(d); });
  let active=null,ox=0,oy=0,placed=0; const total=ITEMS.length; const box=document.getElementById('g-round1');
  const binAt=(x,y)=>[...box.querySelectorAll('.bin')].find(b=>{const r=b.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;});
  box.querySelectorAll('.item').forEach(el=>el.addEventListener('pointerdown',e=>{ if(el.dataset.done)return;
    active=el; const r=el.getBoundingClientRect(); ox=e.clientX-r.left; oy=e.clientY-r.top;
    el.style.width=r.width+'px'; el.style.height=r.height+'px'; document.body.appendChild(el);
    el.style.position='fixed'; el.style.zIndex=999; el.classList.add('dragging'); mv(e.clientX,e.clientY); e.preventDefault(); }));
  function mv(x,y){ if(!active)return; active.style.left=(x-ox)+'px'; active.style.top=(y-oy)+'px';
    box.querySelectorAll('.bin').forEach(b=>b.classList.remove('over')); const b=binAt(x,y); if(b)b.classList.add('over'); }
  addEventListener('pointermove',e=>{if(active)mv(e.clientX,e.clientY);});
  addEventListener('pointerup',e=>{ if(!active)return; const el=active; active=null;
    box.querySelectorAll('.bin').forEach(b=>b.classList.remove('over')); const bin=binAt(e.clientX,e.clientY);
    const rst=()=>{el.classList.remove('dragging');['position','left','top','width','height','zIndex'].forEach(p=>el.style[p]='');};
    if(bin&&bin.dataset.k===el.dataset.k){ el.dataset.done='1'; rst(); el.classList.add('placed'); bin.querySelector('.binDrop').appendChild(el); placed++;
      if(placed===total) document.getElementById('r1next').style.display='block'; }
    else { rst(); document.getElementById('tray').appendChild(el); el.animate([{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(0)'}],{duration:260}); } });
})();

const QUIZ=${JSON.stringify(L.quiz)};
let qi=0; function startQuiz(){ document.getElementById('g-round1').classList.remove('on'); document.getElementById('g-quiz').classList.add('on'); document.getElementById('gameTitle').innerHTML='🎮 第 2 关 · 想一想<small>知识 + 逻辑 + 英语</small>'; qi=0; renderQ(); }
function renderQ(){ const it=QUIZ[qi]; qprog.textContent=\`第 \${qi+1} / \${QUIZ.length} 题\`; const tag=document.getElementById('qtag'); tag.className='qtag '+it.tag; tag.textContent=it.tl; qico.textContent=it.ico; qtext.textContent=it.q; qopts.innerHTML=''; qfb.textContent=''; shuffle(it.opts.slice()).forEach(([l,ok])=>{const b=document.createElement('div');b.className='qopt';b.textContent=l;b.onclick=()=>ans(b,ok,it.fb);qopts.appendChild(b);}); }
function ans(el,ok,fb){ if(ok){ el.classList.add('right'); qopts.querySelectorAll('.qopt').forEach(o=>o.style.pointerEvents='none'); qfb.style.color='#2ba36a'; qfb.innerHTML='✅ '+fb; setTimeout(()=>{ qi++; if(qi<QUIZ.length) renderQ(); else go('finish'); },1500);} else { el.classList.add('wrong'); el.style.pointerEvents='none'; qfb.style.color='#e06060'; qfb.textContent='再想想～'; } }

function saveBadge(id,emoji,name){ try{ const k='kidspark_v1'; const d=JSON.parse(localStorage.getItem(k)||'{"badges":{},"days":[]}'); d.badges[id]={emoji,name,date:new Date().toISOString().slice(0,10)}; const t=new Date().toISOString().slice(0,10); if(!d.days.includes(t))d.days.push(t); localStorage.setItem(k,JSON.stringify(d)); }catch(e){} }
function celebrate(){ saveBadge('${L.id}','${L.e}','${L.bn}'); const c=document.getElementById('confetti'), x=c.getContext('2d'); c.width=innerWidth; c.height=innerHeight; const cols=['${T.accent}','#ffd36b','#3aa7ff','#41c98a','#b58bff','#ff8ac0']; const bits=Array.from({length:120},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height,s:6+Math.random()*8,vy:2+Math.random()*4,vx:(Math.random()-.5)*2,col:cols[Math.random()*cols.length|0],rot:Math.random()*7,vr:(Math.random()-.5)*.3}));
  let f=0;(function a(){ x.clearRect(0,0,c.width,c.height); f++; bits.forEach(b=>{b.y+=b.vy;b.x+=b.vx;b.rot+=b.vr;x.save();x.translate(b.x,b.y);x.rotate(b.rot);x.fillStyle=b.col;x.fillRect(-b.s/2,-b.s/2,b.s,b.s);x.restore();}); if(f<220)requestAnimationFrame(a);else x.clearRect(0,0,c.width,c.height);})(); }
if(location.hash){const h=location.hash.slice(1); if(h==='tabB'){go('explore');switchEx('B');} else if(h==='quiz'){go('game');startQuiz();} else if(SCENES.includes(h))go(h);}
</script>
</body>
</html>
`;
}

function bossPage(B){
  const T = THEMES[B.region], R = REGION_META[B.region];
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>${B.n} · 知识乐园</title>
<style>
  :root{ --acc:${T.accent}; --acc2:${T.acc2}; --bg1:${T.bg1}; --bg2:${T.bg2}; --ink:${T.ink}; --ink2:${T.ink2}; --card:#fff; --shadow:0 10px 30px ${T.sh}; }
  *{box-sizing:border-box; -webkit-tap-highlight-color:transparent; user-select:none;}
  html,body{height:100%; margin:0;}
  body{ font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif; color:var(--ink);
    background:radial-gradient(120% 90% at 50% 0%, var(--bg1) 0%, var(--bg2) 70%, var(--bg2) 100%);
    overflow:hidden; touch-action:manipulation; display:flex; flex-direction:column; height:100vh; }
  .topbar{display:flex; align-items:center; gap:10px; padding:10px 16px;}
  .back{font-size:19px; background:#fff; border:none; border-radius:16px; padding:8px 14px; box-shadow:var(--shadow); color:var(--ink); font-weight:800; cursor:pointer;}
  .title{font-size:clamp(17px,2.8vw,24px); font-weight:900;} .title small{display:block; font-size:12px; color:var(--ink2); font-weight:700;}
  .scene{flex:1; min-height:0; display:none; flex-direction:column; align-items:center; justify-content:center; padding:6px 16px 16px; text-align:center;} .scene.active{display:flex;}
  .kico{font-size:96px; animation:bob 2.2s ease-in-out infinite;} @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
  .card{background:var(--card); border-radius:24px; padding:22px 26px; box-shadow:var(--shadow); max-width:600px; width:100%;}
  .introTxt{font-size:clamp(15px,2.2vw,19px); font-weight:700; line-height:1.7;} .introTxt b{color:var(--acc);}
  .bigbtn{border:none; border-radius:20px; padding:15px 40px; font-size:20px; font-weight:900; color:#fff; background:linear-gradient(160deg,var(--acc),var(--acc2)); box-shadow:var(--shadow); cursor:pointer; letter-spacing:1px; margin-top:18px;} .bigbtn:active{transform:scale(.95);}
  .prog{display:flex; align-items:center; justify-content:space-between; width:100%; max-width:600px; margin-bottom:10px; font-weight:900; color:var(--ink2);}
  .stars{font-size:15px; letter-spacing:0;}
  .qtag{display:inline-block; font-size:12px; font-weight:900; padding:3px 10px; border-radius:10px; margin-bottom:8px; background:${T.hint}; color:var(--acc2);}
  .qico{font-size:48px;} .qtext{font-size:20px; font-weight:900; margin:8px 0 16px; line-height:1.5;}
  .qopts{display:flex; flex-direction:column; gap:11px;} .qopt{border:3px solid ${T.opb}; background:${T.opbg}; border-radius:15px; padding:14px; font-size:17px; font-weight:800; color:var(--ink); cursor:pointer; text-align:left;} .qopt:active{transform:scale(.98);}
  .qopt.right{border-color:#41c98a; background:#e4fbef;} .qopt.wrong{border-color:#ff8a8a; background:#ffeaea;}
  .qfb{margin-top:12px; font-size:15px; font-weight:700; min-height:22px; line-height:1.5;}
  .medal{font-size:104px; animation:pop .5s ease;} @keyframes pop{0%{transform:scale(0) rotate(-30deg)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
  h2{margin:6px 0; font-size:26px;} .medalName{display:inline-block; background:linear-gradient(160deg,var(--acc),var(--acc2)); color:#fff; font-weight:900; font-size:18px; padding:8px 20px; border-radius:18px; margin:8px 0 10px;}
  .bigstars{font-size:34px; letter-spacing:3px; margin:6px 0 4px;}
  .resTxt{color:var(--ink2); font-weight:700; font-size:15px; margin:6px 0 16px;}
  .fbtns{display:flex; gap:12px; justify-content:center;} .fbtns button{border:none; border-radius:16px; padding:13px 22px; font-size:16px; font-weight:900; cursor:pointer;} .fb1{background:var(--acc); color:#fff;} .fb2{background:${T.hint}; color:var(--ink);}
  .confetti{position:fixed; inset:0; pointer-events:none; z-index:60;}
</style>
</head>
<body>
  <div class="topbar">
    <button class="back" onclick="location.href='../../index.html'">← 回乐园</button>
    <div class="title">🏆 ${B.n}<small>${R.name} · 高阶挑战</small></div>
  </div>

  <section class="scene active" id="s-intro">
    <div class="kico">🏆</div>
    <div class="card"><div class="introTxt">这是<b>${R.name}</b>的大挑战！把你学过的<b>${B.skills}</b>都用上。答对 <b>8 道</b>就能拿下【<b>${B.bn}</b>】徽章。<br>第一次就答对才得 ⭐，看看你能拿几颗星！</div>
      <button class="bigbtn" onclick="startQuiz()">接受挑战 ▶</button></div>
  </section>

  <section class="scene" id="s-quiz">
    <div class="prog"><span id="pnum"></span><span class="stars" id="pstars"></span></div>
    <div class="card"><div class="qtag" id="qtag">挑战</div><div class="qico" id="qico">❓</div><div class="qtext" id="qtext"></div><div class="qopts" id="qopts"></div><div class="qfb" id="qfb"></div></div>
  </section>

  <section class="scene" id="s-finish">
    <div class="card"><div class="medal" id="medal">🏅</div><h2 id="fhead">挑战成功！</h2>
      <div class="medalName">🎖 ${B.bn}</div>
      <div class="bigstars" id="bigstars"></div><div class="resTxt" id="resTxt"></div>
      <div class="fbtns"><button class="fb2" onclick="location.reload()">再挑战一次</button><button class="fb1" onclick="location.href='../../index.html'">回乐园</button></div>
    </div>
  </section>
  <canvas class="confetti" id="confetti"></canvas>

<script>
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;}
const BADGE={id:'${B.id}', emoji:'${B.e}', name:'${B.bn}'};
const QUIZ=${JSON.stringify(B.quiz)};

let qi=0, wrongThis=0, stars=0;
function show(n){ document.querySelectorAll('.scene').forEach(s=>s.classList.remove('active')); document.getElementById('s-'+n).classList.add('active'); }
function startQuiz(){ qi=0; stars=0; show('quiz'); renderQ(); }
function renderQ(){ const it=QUIZ[qi]; wrongThis=0;
  document.getElementById('pnum').textContent=\`第 \${qi+1} / \${QUIZ.length} 关\`;
  document.getElementById('pstars').textContent='⭐'.repeat(stars)+'☆'.repeat(QUIZ.length-stars);
  document.getElementById('qico').textContent=it.ico; document.getElementById('qtext').textContent=it.q;
  const box=document.getElementById('qopts'); box.innerHTML=''; document.getElementById('qfb').textContent='';
  shuffle(it.opts.slice()).forEach(([l,ok])=>{ const b=document.createElement('div'); b.className='qopt'; b.textContent=l; b.onclick=()=>ans(b,ok,it.fb); box.appendChild(b); });
}
function ans(el,ok,fb){ const fbEl=document.getElementById('qfb');
  if(ok){ el.classList.add('right'); document.querySelectorAll('.qopt').forEach(o=>o.style.pointerEvents='none');
    if(wrongThis===0) stars++;
    fbEl.style.color='#2ba36a'; fbEl.innerHTML='✅ '+fb;
    setTimeout(()=>{ qi++; if(qi<QUIZ.length) renderQ(); else finish(); },1400);
  } else { wrongThis++; el.classList.add('wrong'); el.style.pointerEvents='none'; fbEl.style.color='#e06060'; fbEl.textContent='🤔 再想想～'; }
}
function finish(){ show('finish');
  document.getElementById('bigstars').textContent='⭐'.repeat(stars)+'☆'.repeat(QUIZ.length-stars);
  document.getElementById('resTxt').textContent = stars===QUIZ.length? '太厉害啦！全部一次答对，满星通关！🎉' : \`你拿到了 \${stars} / \${QUIZ.length} 颗星，很棒！再挑战一次能拿满星哦～\`;
  saveBadge(BADGE.id,BADGE.emoji,BADGE.name); celebrate();
}
function saveBadge(id,emoji,name){ try{ const k='kidspark_v1'; const d=JSON.parse(localStorage.getItem(k)||'{"badges":{},"days":[]}'); d.badges[id]={emoji,name,date:new Date().toISOString().slice(0,10)}; const t=new Date().toISOString().slice(0,10); if(!d.days.includes(t))d.days.push(t); localStorage.setItem(k,JSON.stringify(d)); }catch(e){} }
function celebrate(){ const c=document.getElementById('confetti'), x=c.getContext('2d'); c.width=innerWidth; c.height=innerHeight; const cols=['${T.accent}','#ffd36b','#3aa7ff','#41c98a','#b58bff','#ff8ac0']; const bits=Array.from({length:140},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height,s:6+Math.random()*8,vy:2+Math.random()*4,vx:(Math.random()-.5)*2,col:cols[Math.random()*cols.length|0],rot:Math.random()*7,vr:(Math.random()-.5)*.3}));
  let f=0;(function a(){ x.clearRect(0,0,c.width,c.height); f++; bits.forEach(b=>{b.y+=b.vy;b.x+=b.vx;b.rot+=b.vr;x.save();x.translate(b.x,b.y);x.rotate(b.rot);x.fillStyle=b.col;x.fillRect(-b.s/2,-b.s/2,b.s,b.s);x.restore();}); if(f<240)requestAnimationFrame(a);else x.clearRect(0,0,c.width,c.height);})(); }
if(location.hash==='#quiz') startQuiz();
</script>
</body>
</html>
`;
}

let made=0;
for(const L of LESSONS){
  const dir=path.join(OUT, L.id);
  if(fs.existsSync(dir)){ console.error('已存在，跳过防覆盖: '+L.id); continue; }
  fs.mkdirSync(dir); fs.writeFileSync(path.join(dir,'index.html'), lessonPage(L)); made++;
}
for(const B of BOSSES){
  const dir=path.join(OUT, B.id);
  if(fs.existsSync(dir)){ console.error('已存在，跳过防覆盖: '+B.id); continue; }
  fs.mkdirSync(dir); fs.writeFileSync(path.join(dir,'index.html'), bossPage(B)); made++;
}
console.log('生成完成: '+made+' 个页面');

/* 新课必须带上「掌握模式」,否则又退回"选项一个个试出来"(2026-07-16)。
   三个注入脚本都有标记位、重复跑安全,生成后无脑跑一遍即可。 */
if(made){
  const ids=[...LESSONS.map(l=>l.id), ...BOSSES.map(b=>b.id)];
  for(const s of ['inject-mastery.js','inject-explore.js','inject-intro.js','inject-mobile.js','inject-fact.js','inject-emoji.js']){
    try{ require('child_process').execFileSync(process.execPath, [path.join(__dirname,s), ...ids], {stdio:'inherit'}); }
    catch(e){ console.error('⚠️ '+s+' 注入失败,新课会退回可试错的老规则:', e.message); }
  }
}
