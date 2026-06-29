/* Generates the four Swiss-Grid case-study pages from one template.
   Run with:  node build-cases.js   (from the 03-Swiss-Grid directory)

   Each page carries placeholder artboards and a fixed, Notion-style
   floating side-nav (.toc) that scroll-spies through the case sections. */
const fs = require('fs');
const path = require('path');

/* ---------- shared partials ---------- */

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
    num: '02', kicker: 'eC+ · Fintech',
    kind: 'Concept / proposal — not shipped',
    title: 'Smart Repayment Guard',
    gTitle: 'Smart Repayment <em>Guard</em>',
    desc: 'A context-aware intervention that helps customers avoid financial overextension — without blocking them, and without being paternalistic. A concept / stakeholder proposal.',
    role: 'Senior Product Designer — self-directed, end to end.',
    tags: 'eC+ · Fintech · Concept proposal',
    lede: "The product is good at “how much can I take?” and silent on “should I?”. The dangerous moment isn’t applying for credit — it’s the repeat withdrawal under stress. This proposes a context-aware safety layer that surfaces the future cost of a withdrawal without blocking the user.",
    meta: [['Role', 'Sr. Product Designer'], ['Client', 'eC+'], ['Domain', 'Fintech'], ['Type', 'Concept / proposal']],
    sections: {
      context: {
        lede: "The product shows the money is available and processes it; weeks later — a missed payment, difficulty, regret-driven churn. Betting that long-term trust compounds into retention faster than a marginally higher withdrawal rate.",
        reframe: "A <em>trust</em> problem, not a compliance problem — help users make the decision they’d thank us for later, rather than block the ones a rule flags.",
        html: axis("Complicit (don't intervene)", "Paternalistic (block)", "Target: warn, don't block"),
      },
      research: {
        lede: 'Honest about its basis: this rests on a heuristic analysis of the live withdrawal flow plus themes from churn and support signals — no user testing yet. The first recommended step is five to eight moderated reactions before any engineering. The commitments it would hold:',
        html: cards([
          {h:'Context', p:'Intervene only at the right moment — no nagging on safe withdrawals.'},
          {h:'Foresight', p:'Show the concrete future cost, not an abstract warning.'},
          {h:'Choice', p:"Warn, don’t block. This is the line between a safety layer and a compliance pop-up."},
        ]),
      },
      approach: {
        lede: 'A bottom sheet that activates only in high-risk moments, detected from recent behaviour and remaining buffer. It shows concrete future impact before commitment, offers softer alternatives, and asks for an explicit, informed acknowledgement.',
        html: seq([
          {n:'1', user:'Enters a €500 payout', system:'Checks frequency + buffer, assesses risk'},
          {n:'2', user:'Reads the future snapshot', system:'Shows +€48/mo, flags reduced flexibility'},
          {n:'3', user:'Weighs softer options', system:'Suggests €300, offers delay, proposes a split'},
          {n:'4', user:'Confirms an informed choice', system:'Requires explicit acknowledgement, then processes'},
        ]),
      },
      solution: {
        lede: "The intervention, state by state: a silent pass on safe withdrawals (proving the no-nagging principle), a future-snapshot that makes the cost concrete, soft alternatives, and an explicit acknowledgement. The future-snapshot is the emotional core — the moment an abstract risk becomes a number the user feels.",
        html: schematic('Four states — risk detection · future snapshot · soft alternatives · acknowledgement', 'Designed states; high-fidelity screens to follow. Shown as schematic, not a shipped screenshot.'),
      },
      outcome: {
        lede: "A proposal stands on reasoning, not borrowed data — so this is framed as projected targets and a test plan, never results. Long-term sustainable growth over short-term conversion: a user who takes €300 instead of €500, or delays a week, is a smaller transaction today and a retained, higher-lifetime-value customer tomorrow.",
        html: metricTree("How we’d measure it", [
          {metric:'Late-payment rate', role:'primary — Guard cohort vs. holdout'},
          {metric:'Trust / NPS delta', role:'secondary'},
          {metric:'Churn after payout peaks', role:'secondary'},
          {metric:'Payout-frequency stability', role:'guardrail'},
        ]),
      },
      reflection: {
        lede: "The risk I’d flag to stakeholders: the risk-detection threshold is currently a designer’s assumption, not a tested rule — get it wrong and we nag safe users or miss risky ones. I’d want Risk and Data to co-own that threshold with me before launch. Naming that openly is what makes this judgement, not a sales pitch.",
      },
    },
  },
  {
    file: 'case-platform.html',
    num: '03', kicker: 'VIER · Enterprise SaaS',
    kind: 'Shipped',
    title: 'From five products to one operational hub',
    gTitle: "Five products that behaved like <em>five startups</em>",
    desc: "Turning a fragmented enterprise ecosystem into one operational hub — and founding the design system that outlived the portal itself.",
    role: 'Owned IA + portal UX; founded the design system; specced the SSO UX (engineering led SSO).',
    tags: 'VIER · Enterprise SaaS (B2B)',
    lede: 'Six products — routing, analytics, forecasting, monitoring, bots, ticketing — each its own island: multiple logins, manually stitched KPIs, tickets in separate environments. The obvious read was "inconsistent UI." It was infrastructure.',
    meta: [['Role', 'Sr. Product Designer'], ['Client', 'VIER'], ['Domain', 'Enterprise SaaS'], ['Type', 'Shipped']],
    sections: {
      context: {
        lede: 'Fragmentation looked like a UX problem. The cause was no shared authentication, no shared information architecture, no shared component language — so every fix was local and the experience kept drifting apart.',
        reframe: 'The biggest usability win — single sign-on — was an <em>infrastructure</em> decision, made because design was in architecture conversations it is usually not invited to.',
      },
      research: {
        lede: 'Grounded in research, not assumption. The recurring line across nearly every interview: "I just want everything in one place."',
        html: statBlock([
          {big:'18', label:'User interviews', note:'+ 5 workshops, 4 journey maps'},
          {big:'4.2', label:'Systems per user, on average'},
          {big:'~45min', label:'Lost per day navigating between tools'},
        ]),
      },
      approach: {
        lede: 'Three pillars — and the real work underneath them was the information architecture: I weighed an app-launcher model (a grid of products that kept silos one click away) against a workspace model that surfaced status, tickets, and analytics on the home view. I chose the workspace and validated the structure in journey maps.',
        html: cards([
          {h:'Unify', p:'One SSO access point — the infrastructure decision that made everything else possible.'},
          {h:'Simplify', p:'Intelligent defaults and a single information architecture across former islands.'},
          {h:'Empower', p:'Real-time visibility and control from one operational home view.'},
        ]),
      },
      solution: {
        lede: "A unified portal: one login, one IA, a workspace home that surfaces what was previously stitched together by hand. The component language that built it became the design system — the part of this work that outlived the portal itself.",
        html: schematic('Unified workspace dashboard + the IA that replaced the launcher model', 'Information-architecture schematic — launcher model vs. the workspace model that shipped.'),
      },
      outcome: {
        lede: 'One hub replacing the manual stitching across six tools, and a design system adopted beyond the portal. The headline figures (adoption, time saved) are owner-confirmed operational metrics; until verified here, the case states the structural outcome rather than a number it cannot source.',
      },
      reflection: {
        lede: "The transferable principle: the highest-leverage design decision was the one made above the screen. Being in the architecture room is what let a design call (SSO) become the product's biggest usability win — that influence is what \"senior\" means in practice.",
      },
    },
  },
  {
    file: 'case-driveradar.html',
    num: '04', kicker: 'DriveRadar · SEW-Eurodrive',
    kind: 'Shipped',
    title: 'Predictive maintenance, legible at a glance',
    gTitle: "A factory’s failing machinery, <em>legible at a glance</em>",
    desc: 'Redesigning the condition-monitoring platform engineers use to catch a gearbox failure before it stops a production line.',
    role: 'Product / UI designer — owned the asset-overview, asset-detail, and measurement views.',
    tags: 'DriveRadar · SEW-Eurodrive · B2B SaaS / IIoT',
    lede: "All the data, almost none of the legibility. A map and table where every asset looked equal; failing units didn’t stand out. A missed warning isn’t bad UX — it’s a stopped production line.",
    meta: [['Role', 'Product / UI Designer'], ['Client', 'SEW-Eurodrive'], ['Domain', 'B2B · IIoT'], ['Type', 'Shipped']],
    sections: {
      context: {
        lede: 'The platform was built around the data the sensors produce, not the decision the operator has to make. Raw vibration plots — accurate, but unreadable at a glance; every measurement at the same visual weight; no hierarchy of concern.',
        reframe: 'Design around the <em>decision</em>, not the data — demote the spectrum so a failing gearbox surfaces.',
      },
      research: {
        lede: 'For a metric-light craft case the visuals are the proof. The redesign reorganises three levels of the product, each answering exactly one question and handing off cleanly to the next.',
        html: tiers([
          {level: 'Fleet', question: '"Where do I look?" — which assets have alerts, ranked by severity.'},
          {level: 'Asset', question: '"What\'s wrong with this machine?" — health → measurements → components → service.'},
          {level: 'Signal', question: '"Is this getting worse?" — one measurement trended against its threshold.'},
        ]),
      },
      approach: {
        lede: "Asset detail reorganised around the operator’s mental model of the machine: availability up top, then key measurements as scannable states (“everything is fine” vs. a flagged value), then components with vibration status, then service info — a 3D model anchoring the operator in the physical machine.",
        html: schematic('Severity-sorted fleet overview + asset-detail hierarchy of concern', 'Before/after schematic — undifferentiated map-and-table vs. severity-sorted overview.'),
      },
      solution: {
        lede: 'From “can you read this spectrum?” to “is it trending toward the red line?” Raw vibration plots became a clean time-series with the threshold line and week/month/year ranges. The specialist’s spectral detail still exists — it moved one click deeper.',
      },
      outcome: {
        lede: 'The honest framing for a craft case: rather than invent a percentage, state the designed improvement plainly — fleet triage moved from scanning an undifferentiated table to a single severity-sorted view. The number worth instrumenting next is time-to-locate a flagged asset, old versus new.',
      },
      reflection: {
        lede: "The decisions made under constraint: severity over completeness (a specialist’s raw reading is one click deeper — the right call, since triage is many users every day and deep analysis is few users occasionally), and readable trend over raw fidelity. What I’d sharpen: validate alert thresholds and colour categories with the engineers who live in alarm fatigue.",
      },
    },
  },
  {
    file: 'case-design-system.html',
    num: '05', kicker: 'VIER · Design system',
    kind: 'In progress',
    title: 'A shared product language',
    gTitle: 'A shared product <em>language</em>',
    desc: 'The VIER design system — token-first foundations, documented components, and a contribution model. Full case study in progress.',
    role: 'Founded and scaled the design system across the VIER product suite.',
    tags: 'VIER · Design system',
    lede: 'The component language founded during the VIER portal work grew into a design system that outlived the portal itself — token-first foundations, components documented with real product scenarios, and a contribution model engineers actually use. The full case study is being written up.',
    meta: [['Role', 'Sr. Product Designer'], ['Client', 'VIER'], ['Domain', 'Design systems'], ['Type', 'In progress']],
    sections: {
      context: { lede: 'Several products, several teams, one brand — and a UI that had drifted apart. The goal: consistency from a system, not from policing. A detailed write-up of the foundations, component model, and adoption is in progress; see the VIER Portal case for the systems thinking it grew from.' },
      research: { lede: 'A cross-product UI audit catalogued the drift; interviews with the designers and engineers who would adopt the system shaped its contribution model.' },
      approach: { lede: 'Token-first foundations, components documented with real scenarios, and a contribution path that made adoption easier than divergence.' },
      solution: { lede: 'One system, every product — a coherent language across the suite. Full visuals and specifics are being prepared for this page.' },
      outcome: { lede: 'Faster delivery and a consistent experience across the suite; the system outlived the portal that prompted it. Specific adoption metrics will be added here once verified.' },
      reflection: { lede: 'Consistency scales when it is the easy path. The system worked because contributing to it cost less than working around it.' },
    },
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
