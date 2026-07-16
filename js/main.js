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

  // SRG card-02: rate-sheet reveal synced to the recording's own clock (drift-proof).
  // The recording settles on the chosen rate (283€/36mo) at 10.5s of 14.858s; the sheet
  // slides up just after and drops when the video loops back to 0.
  $$('.device__sheet').forEach(sheet=>{
    const vid=sheet.parentElement?.querySelector('video');
    if(reduce||!vid){sheet.classList.add('up');return;}
    const AT=10.7;
    vid.addEventListener('timeupdate',()=>sheet.classList.toggle('up',vid.currentTime>=AT));
  });

  // clock + year
  const fmt=new Intl.DateTimeFormat('de-DE',{hour:'2-digit',minute:'2-digit',timeZone:'Europe/Berlin'});
  const tickC=()=>$$('[data-clock]').forEach(e=>e.textContent=fmt.format(new Date()));
  tickC();setInterval(tickC,30000);
  $$('[data-year]').forEach(e=>e.textContent=new Date().getFullYear());
})();
