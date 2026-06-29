/* Generates the four Swiss-Grid case-study pages from one template.
   Run with:  node build-cases.js   (from the 03-Swiss-Grid directory)

   Each page carries placeholder artboards and a fixed, Notion-style
   floating side-nav (.toc) that scroll-spies through the case sections. */
const fs = require('fs');
const path = require('path');

/* ---------- shared partials ---------- */
const ph = t => `<i class="ph" title="${t}">${t.startsWith('Placeholder') ? 'tbd' : 'draft'}</i>`;

/* the floating "On this page" navigation (same on every case) */
const SECTIONS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'context',    label: 'Problem' },
  { id: 'research',   label: 'Evidence' },
  { id: 'approach',   label: 'Approach' },
  { id: 'solution',   label: 'The design' },
  { id: 'outcome',    label: 'Outcome' },
  { id: 'reflection', label: 'Reflection' },
];
const toc = `
  <nav class="toc" aria-label="On this page">
    <span class="toc__cap">On this page</span>
    ${SECTIONS.map((s, i) => `<a class="toc__item" href="#${s.id}"><span class="toc__dash" aria-hidden="true"></span><span class="toc__text"><span class="toc__no">${String(i + 1).padStart(2, '0')}</span><span class="toc__label">${s.label}</span></span></a>`).join('\n    ')}
  </nav>`;

const head = (c) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${c.title} — Mohamed Ali Ghouila</title>
<meta name="description" content="${c.desc}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Space+Grotesk:wght@400;500&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/main.css" />
<link rel="stylesheet" href="css/case.css" />
<script>document.documentElement.classList.add('js');
if(new URLSearchParams(location.search).has('flat'))document.documentElement.classList.add('flat');</script>
</head>
<body>
<a class="skip" href="#overview">Skip to content</a>

<div class="frame">

<header class="top">
  <a class="top__brand" href="index.html#top">Mag<i>design</i>®</a>
  <nav class="top__nav" aria-label="Primary">
    <a href="index.html#work">Work</a><a href="index.html#numbers">Numbers</a><a href="index.html#about">About</a><a href="index.html#contact">Contact</a>
  </nav>
  <div class="top__meta"><span class="dot" aria-hidden="true"></span>Germany — <span data-clock>--:--</span> CET</div>
  <button class="top__burger" type="button" aria-expanded="false" aria-controls="menu" data-burger>
    <span></span><span></span><span class="visually-hidden">Menu</span>
  </button>
</header>

<div class="menu" id="menu">
  <nav aria-label="Mobile">
    <a href="index.html#work" data-mlink><span><sup>01</sup>Work</span></a>
    <a href="index.html#numbers" data-mlink><span><sup>02</sup>Numbers</span></a>
    <a href="index.html#about" data-mlink><span><sup>03</sup>About</span></a>
    <a href="index.html#contact" data-mlink><span><sup>04</sup>Contact</span></a>
  </nav>
  <footer class="menu__foot">
    <a href="mailto:elghouilamed@gmail.com">elghouilamed@gmail.com</a>
    <a href="https://www.linkedin.com/in/mohamedalighouila" target="_blank" rel="noopener">LinkedIn ↗</a>
  </footer>
</div>`;

/* a single placeholder artboard */
const board = (b) => `<figure class="board${b.span ? ` board--${b.span}` : ''}" data-r>
        <div class="board__frame board__ar${b.ar ? `--${b.ar}` : ''}">
          <span class="board__dim" aria-hidden="true">${b.dim || '1440 × 900'}</span>
          <div class="board__center">
            <span class="board__glyph" aria-hidden="true">${b.glyph || '+'}</span>
            <p class="board__name">${b.name}</p>
            <span class="board__tag">Artboard · placeholder</span>
          </div>
        </div>
        ${b.cap ? `<figcaption class="board__cap"><b>${b.capTitle || 'Fig.'}</b>${b.cap}</figcaption>` : ''}
      </figure>`;

const boards = (arr) => `<div class="boards">\n      ${arr.map(board).join('\n      ')}\n      </div>`;

/* a section with the standard Swiss head (h2 + numbered mono label) */
const shead = (h2, no, label) => `<header class="shead">
      <h2>${h2}</h2>
      <span class="mono">(${no}) — ${label}</span>
    </header>`;

/* no placeholder injection in new content — content is real or honestly framed */
const lede = (txt) => `<div class="cs__lede pad" data-r><p>${txt}</p></div>`;
const badge = (label, concept) =>
  `<span class="cbadge${concept ? ' cbadge--concept' : ''}">${label}</span>`;

/* one case section: Swiss head + optional lede + body markup */
const section = (id, h2, no, label, body) => `
  <section class="cs" id="${id}">
    ${shead(h2, no, label)}
    ${body}
  </section>`;

/* ---------- bespoke evidence components (no screenshots, no fake data) ---------- */
const optsTable = (rows) => `<div class="opts pad" data-r>
  ${rows.map(r => `<div class="opts__row${r.won ? ' opts__row--won' : ''}">
    <div class="opts__name">${r.name}${r.won ? '<span class="opts__flag">Shipped</span>' : ''}</div>
    <div class="opts__explored">${r.explored}</div>
    <div class="opts__verdict">${r.won ? '✓ ' : '✗ '}${r.verdict}</div>
  </div>`).join('\n  ')}
</div>`;

const statBlock = (stats) => `<div class="statblock pad" data-r>
  ${stats.map(s => `<div class="statblock__item"><b>${s.big}</b><span>${s.label}</span>${s.note ? `<small>${s.note}</small>` : ''}</div>`).join('\n  ')}
</div>`;

const metricTree = (title, nodes) => `<div class="mtree pad" data-r>
  <p class="mtree__cap">${title} — <i>projected / hypotheses</i></p>
  <ul class="mtree__list">
    ${nodes.map(n => `<li><b>${n.metric}</b><span>${n.role}</span></li>`).join('\n    ')}
  </ul>
</div>`;

const axis = (l, r, zone) => `<div class="axis pad" data-r>
  <div class="axis__bar"><span class="axis__zone"><span class="axis__zonelab">${zone}</span></span></div>
  <div class="axis__ends"><span>${l}</span><span>${r}</span></div>
</div>`;

const tiers = (rows) => `<ol class="tiers pad" data-r>
  ${rows.map((t, i) => `<li class="tiers__row"><span class="tiers__no">${String(i + 1).padStart(2, '0')}</span><b>${t.level}</b><span class="tiers__q">${t.question}</span></li>`).join('\n  ')}
</ol>`;

const seq = (stages) => `<div class="seq pad" data-r>
  ${stages.map(s => `<div class="seq__row"><span class="seq__n">${s.n}</span><div class="seq__c"><b>User</b><p>${s.user}</p></div><div class="seq__c"><b>System</b><p>${s.system}</p></div></div>`).join('\n  ')}
</div>`;

const cards = (items) => `<div class="pcards pad" data-r>
  ${items.map(c => `<div class="pcard"><h4>${c.h}</h4><p>${c.p}</p></div>`).join('\n  ')}
</div>`;

const schematic = (title, note) => `<figure class="schem pad" data-r>
  <div class="schem__frame"><span class="schem__tag">Schematic</span><p class="schem__title">${title}</p></div>
  ${note ? `<figcaption>${note}</figcaption>` : ''}
</figure>`;

/* ---------- per-case content ---------- */
const CASES = [
  {
    file: 'case-funnel.html',
    num: '01', kicker: 'Fintech · Web app',
    kind: 'Shipped',
    title: 'Removing friction from a high-stakes credit funnel',
    gTitle: 'Removing friction from a <em>high-stakes</em> credit funnel',
    desc: 'Replacing a hidden-step carousel with a fully visible, accessible credit application — shipped on existing design-system components.',
    role: 'Senior Product Designer — owned the audit, exploration, n=6 usability test, and shipped design.',
    tags: 'easyCredit · Fintech · Web app',
    lede: 'A carousel was hiding the journey users had already committed to. The fix was not a restyle — it was making the full path honest and visible, without adding or removing a single required step.',
    meta: [['Role', 'Sr. Product Designer'], ['Client', 'easyCredit'], ['Domain', 'Fintech · CRO'], ['Type', 'Shipped']],
    sections: {
      context: {
        lede: 'Steps lived behind a horizontal swipe; discoverability relied on a gesture many users never made. People committed, then discovered more steps late — and that surprise broke momentum at the worst point in a high-anxiety flow.',
        reframe: 'Not a styling problem — a trust problem. Hidden effort costs <em>belief</em>, and belief is what carries a user through a high-stakes flow.',
      },
      research: {
        lede: 'Three inputs, not a pattern preference: a funnel audit located the drop-off precisely at the carousel step; a small moderated test explained why; and a WCAG review confirmed carousels score poorly on discoverability, keyboard, and screen-reader support.',
        html: statBlock([
          {big:'12%', label:'Lost at the carousel step', note:'pre-redesign funnel analysis'},
          {big:'n=6', label:'Moderated usability sessions', note:'why the drop-off happened'},
          {big:'WCAG', label:'Carousel fails discoverability + keyboard/SR support'},
        ]),
      },
      approach: {
        lede: 'I explored three directions and killed two — an enhanced carousel (more controls, same comprehension problem), a full-screen stepper (hid the full journey, the exact problem, and needed custom components), and vertical disclosure cards (all steps visible, details on demand). The cards shipped.',
        html: optsTable([
          {name:'Enhanced carousel', explored:'Arrows, dots, auto-scroll previews, callouts', verdict:'Did not fix accessibility; complexity without comprehension'},
          {name:'Full-screen stepper', explored:'One step per screen, linear wizard', verdict:'Hid the full journey — the exact problem; raised perceived effort; needed custom components'},
          {name:'Vertical disclosure cards', explored:'All steps visible; details on demand', verdict:'Solved discoverability and accessibility; reused a DS component', won:true},
        ]),
      },
      solution: {
        lede: 'Every step visible at a glance, details on demand. Vertical disclosure cards: 100% of steps shown immediately, each expanding for detail only when needed — scroll-based, keyboard- and screen-reader-accessible, no swipe to discover.',
      },
      outcome: {
        lede: 'Shipped to production on an existing design-system component — faster to ship, lower to maintain, accessible by inheritance. The pre-redesign drop-off concentrated at the carousel step; the post-launch result is being instrumented, so this case states the measurement plan rather than a lift it cannot yet defend honestly.',
        html: metricTree("How I’d prove it", [
          {metric:'Stage-completion rate', role:'primary — variant vs. carousel, holdout split'},
          {metric:'Time-to-first-doubt', role:'secondary — momentum signal'},
          {metric:'Accessibility conformance', role:'keyboard + screen-reader pass'},
        ]),
      },
      reflection: {
        lede: 'The trade-off I chose: visibility over visual novelty. A carousel looks more modern; honest visibility serves the brand better, because "easy" is a core value and a transparent funnel makes it literal. What I would measure next: stage-completion rate of this variant against the carousel in a holdout split, with time-to-first-doubt as a secondary signal.',
      },
    },
  },
  {
    file: 'case-autonomy.html',
    num: '02', kicker: 'B2C · Fintech',
    title: "Improving user's autonomy",
    gTitle: "Improving user's <em>autonomy</em>",
    desc: 'Preventing financial overextension while preserving user autonomy — a B2C fintech case study.',
    lede: "Preventing financial overextension while preserving the user's sense of control — protection that informs rather than polices.",
    meta: [['Role', 'Sr. Product Designer'], ['Year', '2024 ' + ph('Placeholder — confirm year')], ['Domain', 'Consumer fintech'], ['Outcome', '↘ Overextension ' + ph('Placeholder — add metric')]],
    challenge: 'Flexible credit makes it easy to borrow and hard to stay in control. The brief: protection without paternalism.',
    approach: 'Limits reframed as a tool the user owns — self-set thresholds, progressive friction, language that informs rather than warns.',
    outcome: 'Lower risky usage with the perceived sense of autonomy preserved.',
    research: 'Interviews, support-ticket analysis and spend-pattern review to locate the moments where control quietly slips away.',
    designIntro: 'The core flows where autonomy is made visible and adjustable by the user.',
    designBoards: [
      { span: 8, ar: 'wide', name: 'Self-set limit — onboarding flow', dim: '1440 × 810', glyph: '◫', cap: 'User defines their own threshold during setup.', capTitle: 'Fig. 1' },
      { span: 4, ar: 'tall', name: 'Limit reached — informative state', dim: '390 × 844', glyph: '◔', cap: 'Mobile alert, framed as information.', capTitle: 'Fig. 2' },
      { span: 6, ar: null, name: 'Progressive-friction confirm step', dim: '1280 × 800', glyph: '◀', cap: 'Friction scales with risk.', capTitle: 'Fig. 3' },
      { span: 6, ar: null, name: 'Spend overview — control dashboard', dim: '1280 × 800', glyph: '▦', cap: 'A calm, glanceable view of headroom.', capTitle: 'Fig. 4' },
    ],
  },
  {
    file: 'case-platform.html',
    num: '03', kicker: 'B2B · Platform',
    title: '0 → 1 solution',
    gTitle: '0 → 1 <em>solution</em>',
    desc: 'Unifying a fragmented enterprise ecosystem into a scalable operational hub — a B2B 0→1 case study.',
    lede: 'Operations lived across disconnected tools. The goal: one scalable hub, designed from workflows rather than features.',
    meta: [['Role', 'Sr. Product Designer'], ['Year', '2022–23 ' + ph('Placeholder — confirm years')], ['Domain', 'Enterprise platform'], ['Outcome', 'n tools → 1 hub ' + ph('Placeholder — verify')]],
    challenge: 'Operations lived across disconnected tools — duplicated data, duplicated work, no shared source of truth.',
    approach: 'Started from workflows, not features: shadowed operators and designed a modular IA that scales by composition.',
    outcome: 'A 0→1 hub adopted as the foundation for the product line.',
    research: 'On-site operator shadowing, tool inventory and a workflow-mapping workshop to surface the real (not documented) process.',
    designIntro: 'The information architecture and the core operational surfaces of the unified hub.',
    designBoards: [
      { span: 7, ar: 'wide', name: 'Information architecture map', dim: '1600 × 900', glyph: '⊞', cap: 'Modular IA that scales by composition.', capTitle: 'Fig. 1' },
      { span: 5, ar: 'wide', name: 'Workflow-mapping artefact', dim: '1280 × 720', glyph: '⇄', cap: 'Synthesised from operator shadowing.', capTitle: 'Fig. 2' },
      { span: 12, ar: 'ultra', name: 'Operational hub — primary dashboard', dim: '1920 × 820', glyph: '▦', cap: 'One source of truth across former tools.', capTitle: 'Fig. 3' },
      { span: 6, ar: null, name: 'Modular module — detail view', dim: '1440 × 900', glyph: '◧', cap: 'Composable building block.', capTitle: 'Fig. 4' },
      { span: 6, ar: null, name: 'Cross-tool data model', dim: '1440 × 900', glyph: '⊟', cap: 'Unified entities, deduplicated.', capTitle: 'Fig. 5' },
    ],
  },
  {
    file: 'case-design-system.html',
    num: '04', kicker: 'Design Systems',
    title: 'A shared product language',
    gTitle: 'A shared product <em>language</em>',
    desc: 'Building and scaling a design system across an enterprise product suite — a design-systems case study.',
    lede: 'Several products, one brand — and a UI that had drifted apart. Consistency from a system, not from policing.',
    meta: [['Role', 'Sr. Product Designer'], ['Year', '2021–24 ' + ph('Placeholder — confirm years')], ['Domain', 'Design systems'], ['Outcome', 'One system, every product ' + ph('Placeholder — coverage')]],
    challenge: 'Several products, one brand — and a UI that had drifted apart. Consistency needed to come from a system, not policing.',
    approach: 'Token-first foundations, components documented with real scenarios, and a contribution model engineers actually use.',
    outcome: 'Faster delivery and a coherent experience across the whole suite.',
    research: 'A cross-product UI audit cataloguing drift, plus interviews with the designers and engineers who would adopt the system.',
    designIntro: 'Foundations, components and the documentation that lets teams adopt without policing.',
    designBoards: [
      { span: 4, ar: 'sq', name: 'Token foundations — colour & type', dim: '1024 × 1024', glyph: '◑', cap: 'Token-first foundations.', capTitle: 'Fig. 1' },
      { span: 8, ar: 'wide', name: 'Component library — overview', dim: '1920 × 1080', glyph: '▦', cap: 'Documented with real scenarios.', capTitle: 'Fig. 2' },
      { span: 6, ar: null, name: 'Component spec — anatomy & states', dim: '1440 × 900', glyph: '◳', cap: 'Every variant and state defined.', capTitle: 'Fig. 3' },
      { span: 6, ar: null, name: 'Contribution model diagram', dim: '1440 × 900', glyph: '⇲', cap: 'How engineers add to the system.', capTitle: 'Fig. 4' },
    ],
  },
];

/* ---------- page template ---------- */
function page(c, idx) {
  const next = CASES[(idx + 1) % CASES.length];
  const S = c.sections || {};                 // defensive: old entries have no .sections yet
  const kind = c.kind || 'Shipped';
  const role = c.role || '';
  const tags = c.tags || c.kicker || '';
  const concept = /concept/i.test(kind);
  const block = id => {                        // renders lede + optional reframe pull-quote + optional component html
    const s = S[id] || {};
    return `${s.lede ? lede(s.lede) : ''}`
      + `${s.reframe ? `<div class="pq pad" data-r><p>${s.reframe}</p></div>` : ''}`
      + `${s.html || ''}`;
  };
  return `${head(c)}

<main id="top" class="cpage">
${toc}

  <!-- OVERVIEW / HERO -->
  <section class="chero" id="overview">
    <div class="chero__top pad">
      <a class="chero__back" href="index.html#work" data-r>← All work</a>
      <p class="mono mono--soft chero__tag" data-r>${tags}</p>
      <h1 data-r>${c.gTitle}</h1>
      <p class="chero__lede" data-r>${c.lede}</p>
      ${role ? `<p class="chero__role" data-r>${badge(kind, concept)}<span>${role}</span></p>` : ''}
    </div>
    <dl class="chero__meta" data-r>
      ${c.meta.map(m => `<div><dt>${m[0]}</dt><dd>${m[1]}</dd></div>`).join('\n      ')}
    </dl>
  </section>

  ${section('context',    'The <em>problem</em>',                c.num + '.1', 'Problem',     block('context'))}
  ${section('research',   'Evidence &amp; <em>discovery</em>',   c.num + '.2', 'Evidence',    block('research'))}
  ${section('approach',   'The <em>approach</em>',               c.num + '.3', 'Approach',    block('approach'))}
  ${section('solution',   'The <em>design</em>',                 c.num + '.4', 'Solution',    block('solution'))}
  ${section('outcome',    "Outcome &amp; <em>what I'd measure</em>", c.num + '.5', 'Outcome', block('outcome'))}
  ${section('reflection', 'Trade-off &amp; <em>reflection</em>', c.num + '.6', 'Reflection',  block('reflection'))}

  <!-- NEXT CASE -->
  <section class="cnext">
    <div class="cnext__row" data-r>
      <div>
        <p class="cnext__lab">Next case study — ${next.num}</p>
        <a class="cnext__title" href="${next.file}">${next.title}<span class="orb" aria-hidden="true">→</span></a>
      </div>
      <a class="cnext__all" href="index.html#work">All work <span aria-hidden="true">↗</span></a>
    </div>
  </section>

  <footer class="cfoot">
    <p>© <span data-year>2026</span> Mohamed Ali Ghouila — Magdesign®</p>
    <p>Designed to be essential. Nothing more.</p>
    <a href="#top">Back to top ↑</a>
  </footer>
</main>
</div>

<script src="js/main.js" defer></script>
<script src="js/case.js" defer></script>
</body>
</html>
`;
}

/* ---------- write files ---------- */
CASES.forEach((c, i) => {
  const out = path.join(__dirname, c.file);
  fs.writeFileSync(out, page(c, i), 'utf8');
  console.log('wrote', c.file);
});
