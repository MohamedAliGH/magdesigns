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
  { id: 'context',    label: 'Context' },
  { id: 'research',   label: 'Research' },
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

const lede = (txt, draft = true) => `<div class="cs__lede pad" data-r><p>${txt}${draft ? ' ' + ph('Draft — replace with real copy') : ''}</p></div>`;

/* ---------- per-case content ---------- */
const CASES = [
  {
    file: 'case-autonomy.html',
    num: '01', kicker: 'B2C · Fintech',
    title: 'Improving user’s autonomy',
    gTitle: 'Improving user’s <em>autonomy</em>',
    desc: 'Preventing financial overextension while preserving user autonomy — a B2C fintech case study.',
    lede: 'Preventing financial overextension while preserving the user’s sense of control — protection that informs rather than polices.',
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
    file: 'case-funnel.html',
    num: '02', kicker: 'B2C · Conversion',
    title: 'Funnel optimisation',
    gTitle: 'Funnel <em>optimisation</em>',
    desc: 'Strategic optimisation of a high-stakes, regulated financial conversion funnel — a B2C case study.',
    lede: 'A regulated product where you can’t cut steps — drop-off had to be solved with clarity, not shortcuts.',
    meta: [['Role', 'Sr. Product Designer'], ['Year', '2023 ' + ph('Placeholder — confirm year')], ['Domain', 'Conversion / CRO'], ['Outcome', '↗ Completion ' + ph('Placeholder — verify metric')]],
    challenge: 'In a regulated product the steps are fixed by law. Drop-off had to be addressed without removing a single required field.',
    approach: 'Instrumented every step, then redesigned the riskiest transitions with progressive disclosure and honest progress.',
    outcome: 'A calmer funnel that converts without pressure tactics.',
    research: 'Funnel analytics, session replays and a step-by-step friction audit to rank where users abandoned and why.',
    designIntro: 'Before / after of the highest-abandonment transitions, plus the instrumentation that drove the redesign.',
    designBoards: [
      { span: 12, ar: 'ultra', name: 'Funnel map — drop-off heat overlay', dim: '1920 × 820', glyph: '▤', cap: 'Where users leave, ranked by step.', capTitle: 'Fig. 1' },
      { span: 4, ar: 'tall', name: 'Step 3 — before', dim: '390 × 844', glyph: '△', cap: 'Original high-friction screen.', capTitle: 'Fig. 2' },
      { span: 4, ar: 'tall', name: 'Step 3 — after', dim: '390 × 844', glyph: '▽', cap: 'Progressive disclosure applied.', capTitle: 'Fig. 3' },
      { span: 4, ar: 'tall', name: 'Honest progress indicator', dim: '390 × 844', glyph: '◓', cap: 'Real progress, no dark patterns.', capTitle: 'Fig. 4' },
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

  return `${head(c)}

<main id="top" class="cpage">
${toc}

  <!-- OVERVIEW / HERO -->
  <section class="chero" id="overview">
    <div class="chero__top pad">
      <a class="chero__back" href="index.html#work" data-r>← All work</a>
      <p class="mono mono--soft chero__tag" data-r>Case ${c.num} · ${c.kicker}</p>
      <h1 data-r>${c.gTitle}</h1>
      <p class="chero__lede" data-r>${c.lede}</p>
    </div>
    <dl class="chero__meta" data-r>
      ${c.meta.map(m => `<div><dt>${m[0]}</dt><dd>${m[1]}</dd></div>`).join('\n      ')}
    </dl>
    <div class="chero__cover pad" data-r>
      ${boards([{ ar: 'wide', name: 'Cover artboard — case hero', dim: '2400 × 1350', glyph: '❖' }])}
    </div>
  </section>

  <!-- CONTEXT & CHALLENGE -->
  <section class="cs" id="context">
    ${shead('The <em>challenge</em>', c.num + '.1', 'Context')}
    ${lede(c.challenge)}
    <div class="cs__cols" data-r>
      <div class="cs__col"><h4><i>A.</i>Challenge</h4><p>${c.challenge} ${ph('Draft — replace with real copy')}</p></div>
      <div class="cs__col"><h4><i>B.</i>Approach</h4><p>${c.approach} ${ph('Draft — replace with real copy')}</p></div>
      <div class="cs__col"><h4><i>C.</i>Outcome</h4><p>${c.outcome} ${ph('Placeholder — metrics')}</p></div>
    </div>
    <div class="cs__boards pad" data-r>${boards([
    { span: 7, ar: 'wide', name: 'Problem framing — context board', dim: '1600 × 900', glyph: '◷' },
    { span: 5, ar: 'wide', name: 'Constraints & stakeholders', dim: '1280 × 720', glyph: '⊕' },
  ])}</div>
  </section>

  <!-- RESEARCH -->
  <section class="cs" id="research">
    ${shead('Research &amp; <em>discovery</em>', c.num + '.2', 'Discovery')}
    ${lede(c.research)}
    <div class="cs__boards pad" data-r>${boards([
    { span: 4, ar: 'sq', name: 'Research synthesis — affinity map', dim: '1024 × 1024', glyph: '⊛' },
    { span: 4, ar: 'sq', name: 'User journey — current state', dim: '1024 × 1024', glyph: '⇉' },
    { span: 4, ar: 'sq', name: 'Key insight — evidence board', dim: '1024 × 1024', glyph: '✦' },
  ])}</div>
  </section>

  <!-- APPROACH -->
  <section class="cs" id="approach">
    ${shead('The <em>approach</em>', c.num + '.3', 'Strategy')}
    ${lede(c.approach)}
    <div class="cs__boards pad" data-r>${boards([
    { span: 6, ar: 'wide', name: 'Concept exploration — sketches', dim: '1600 × 900', glyph: '✎' },
    { span: 6, ar: 'wide', name: 'Wireframes — low fidelity', dim: '1600 × 900', glyph: '▥' },
  ])}</div>
  </section>

  <!-- THE DESIGN -->
  <section class="cs" id="solution">
    ${shead('The <em>design</em>', c.num + '.4', 'Outcome design')}
    ${lede(c.designIntro)}
    <div class="cs__boards pad" data-r>${boards(c.designBoards)}</div>
  </section>

  <!-- OUTCOME -->
  <section class="cs" id="outcome">
    ${shead('Outcome &amp; <em>impact</em>', c.num + '.5', 'Impact')}
    ${lede(c.outcome, false)}
    <div class="nums" data-r>
      <div class="num"><b><span data-count="0">0</span></b><span>Primary metric ${ph('Placeholder — add metric')}</span></div>
      <div class="num"><b><span data-count="0">0</span></b><span>Secondary metric ${ph('Placeholder — add metric')}</span></div>
      <div class="num"><b><span data-count="0">0</span></b><span>Adoption / reach ${ph('Placeholder — add metric')}</span></div>
      <div class="num"><b><span data-count="0">0</span></b><span>Qualitative signal ${ph('Placeholder — add metric')}</span></div>
    </div>
  </section>

  <!-- REFLECTION -->
  <section class="cs" id="reflection">
    ${shead('What I’d <em>carry forward</em>', c.num + '.6', 'Reflection')}
    ${lede('A short reflection on what worked, what I’d change, and the principle this project reinforced.')}
  </section>

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
