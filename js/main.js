(()=>{
  'use strict';
  const flat=document.documentElement.classList.contains('flat');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches||flat;
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];

  // reveals (+ hero mask lines via .in on h1)
  const rs=$$('[data-r]');
  if(reduce||!('IntersectionObserver' in window)){rs.forEach(e=>e.classList.add('in'));}
  else{
    const io=new IntersectionObserver(es=>es.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}
    }),{rootMargin:'0px 0px -10% 0px',threshold:.05});
    rs.forEach(e=>io.observe(e));
  }

  // mobile menu
  const menu=document.getElementById('menu');
  const burger=document.querySelector('[data-burger]');
  let open=false;
  const setMenu=v=>{open=v;burger.setAttribute('aria-expanded',String(v));menu.classList.toggle('open',v);document.body.style.overflow=v?'hidden':'';};
  burger?.addEventListener('click',()=>setMenu(!open));
  $$('[data-mlink]').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open)setMenu(false);});

  // case accordions
  $$('.case__head').forEach(btn=>{
    const body=document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click',()=>{
      const o=btn.getAttribute('aria-expanded')==='true';
      btn.setAttribute('aria-expanded',String(!o));
      body.classList.toggle('open',!o);
    });
  });

  // counters
  const run=el=>{
    const t=parseInt(el.dataset.count,10)||0;
    if(reduce){el.textContent=t;return;}
    let s=null;const d=1400;
    const tick=ts=>{if(s===null)s=ts;const p=Math.min((ts-s)/d,1);
      el.textContent=Math.round((1-Math.pow(1-p,5))*t);
      if(p<1)requestAnimationFrame(tick);};
    requestAnimationFrame(tick);
  };
  const cs=$$('[data-count]');
  if('IntersectionObserver' in window&&!reduce){
    const cio=new IntersectionObserver(es=>es.forEach(e=>{
      if(e.isIntersecting){run(e.target);cio.unobserve(e.target);}
    }),{threshold:.6});
    cs.forEach(e=>cio.observe(e));
  }else cs.forEach(run);

  // SRG sheet reveals synced to the recording's own clock (drift-proof).
  // Each sheet slides up at data-at (default 10.7s — just after the rate choice settles)
  // and drops at data-until, so a later sheet replaces an earlier one instead of stacking.
  // Loop mode (homepage teaser): video loops, sheets simply follow currentTime.
  // Once mode (case slide, video[data-once]): plays once per viewport entry and freezes on
  // its last frame; sheet times past the video end fire on timers (timeupdate stops after
  // `ended`). Scrolling away pauses it; scrolling back restarts the whole sequence.
  const sheetDevs=new Set($$('.device__sheet').map(s=>s.parentElement));
  sheetDevs.forEach(dev=>{
    const vid=dev.querySelector('video');
    const sheets=$$('.device__sheet',dev);
    if(reduce||!vid){sheets.forEach(s=>s.classList.add('up'));return;}
    const t0=sh=>parseFloat(sh.dataset.at)||10.7;
    const t1=sh=>parseFloat(sh.dataset.until)||Infinity;
    const apply=t=>sheets.forEach(sh=>sh.classList.toggle('up',t>=t0(sh)&&t<t1(sh)));
    vid.addEventListener('timeupdate',()=>apply(vid.currentTime));
    if(!vid.hasAttribute('data-once'))return;
    let timers=[];
    const clear=()=>{timers.forEach(clearTimeout);timers=[];};
    vid.addEventListener('ended',()=>{
      const D=vid.duration;
      const marks=new Set();
      sheets.forEach(sh=>[t0(sh),t1(sh)].forEach(m=>{if(isFinite(m)&&m>=D)marks.add(m);}));
      clear();
      timers=[...marks].sort((a,b)=>a-b).map(m=>setTimeout(()=>apply(m),(m-D)*1000));
    });
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(es=>es.forEach(e=>{
        if(e.isIntersecting){clear();apply(0);try{vid.currentTime=0;}catch(_){/* not loaded yet */}vid.play().catch(()=>{});}
        else vid.pause();
      }),{threshold:.35});
      io.observe(dev);
    }else vid.play().catch(()=>{});
  });

  // clock + year
  const fmt=new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Berlin'});
  const tickC=()=>$$('[data-clock]').forEach(e=>e.textContent=fmt.format(new Date()));
  tickC();setInterval(tickC,30000);
  $$('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
})();
