/* ============ SWISS — case study scroll-spy ============ */
/* Drives the floating "On this page" nav. Observer-based, no scroll
   listeners. Runs alongside main.js (reveals, clock, burger, counters). */
(()=>{
  'use strict';
  const flat=document.documentElement.classList.contains('flat');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches||flat;
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];

  const items=$$('.toc__item');
  if(!items.length)return;

  // smooth-scroll on click (honour reduced motion)
  items.forEach(a=>a.addEventListener('click',e=>{
    const sec=document.getElementById(a.getAttribute('href').slice(1));
    if(!sec)return;
    e.preventDefault();
    sec.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
    history.replaceState(null,'',a.getAttribute('href'));
  }));

  if(!('IntersectionObserver' in window)){items[0].classList.add('active');return;}

  // scroll-spy: highlight the topmost section currently in the viewport band
  const map=new Map();
  items.forEach(a=>{
    const sec=document.getElementById(a.getAttribute('href').slice(1));
    if(sec)map.set(sec,a);
  });
  const visible=new Set();
  const setActive=()=>{
    let best=null,bestTop=Infinity;
    visible.forEach(sec=>{
      const t=sec.getBoundingClientRect().top;
      if(t<bestTop){bestTop=t;best=sec;}
    });
    if(!best)return;
    items.forEach(a=>a.classList.remove('active'));
    map.get(best)?.classList.add('active');
  };
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{e.isIntersecting?visible.add(e.target):visible.delete(e.target);});
    setActive();
  },{rootMargin:'-45% 0px -45% 0px',threshold:0});
  map.forEach((_a,sec)=>io.observe(sec));
  items[0].classList.add('active'); // first item lit on load
})();
