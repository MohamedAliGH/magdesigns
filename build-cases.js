/* Generates the four Swiss-Grid case-study pages from one template.
   Run with:  node build-cases.js   (from the 03-Swiss-Grid directory)

   Each page carries placeholder artboards and a fixed, Notion-style
   floating side-nav (.toc) that scroll-spies through the case sections. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/* cache-busting: version query derived from the actual asset bytes, so browsers
   refetch css/js only when they change (fixes stale-CSS across browsers/CDNs) */
const readAsset = (p) => fs.readFileSync(path.join(__dirname, p), 'utf8');
const assetHash = crypto.createHash('md5')
  .update(readAsset('css/main.css') + readAsset('css/case.css') + readAsset('js/main.js') + readAsset('js/case.js'))
  .digest('hex').slice(0, 8);
const v = `?v=${assetHash}`;

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
const tocItems = (items) => `
  <nav class="toc" aria-label="On this page">
    <span class="toc__cap">On this page</span>
    ${items.map((s, i) => `<a class="toc__item" href="#${s.id}"><span class="toc__dash" aria-hidden="true"></span><span class="toc__text"><span class="toc__no">${String(i + 1).padStart(2, '0')}</span><span class="toc__label">${s.label}</span></span></a>`).join('\n    ')}
  </nav>`;
const toc = tocItems(SECTIONS);

const head = (c) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${c.title} — Mohamed Ali Ghouila</title>
<meta name="description" content="${c.desc}" />
<link rel="icon" href="favicon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Space+Grotesk:wght@400;500&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="css/main.css${v}" />
<link rel="stylesheet" href="css/case.css${v}" />
<script>document.documentElement.classList.add('js');
if(new URLSearchParams(location.search).has('flat'))document.documentElement.classList.add('flat');</script>
</head>
<body>
<a class="skip" href="#overview">Skip to content</a>

<div class="frame">

<header class="top">
  <a class="top__brand" href="index.html#top">Mag<i>designs</i>®</a>
  <nav class="top__nav" aria-label="Primary">
    <a href="index.html#work">Work</a><a href="index.html#numbers">Numbers</a><a href="index.html#about">About</a><a href="index.html#contact">Contact</a>
  </nav>
  <div class="top__meta"></div>
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

/* full-width slide-by-slide reader — real exported Figma deck slides.
   A case with a `slides` array renders its deck instead of the editorial sections.
   To re-sync images after editing the Figma deck: re-export the node IDs listed in
   img/decks/slides-manifest.json (Figma MCP get_screenshot -> curl into the same paths).

   Optional `deviceVideos` on a slide overlays one or more looping screen-recordings on
   top of the static slide image, each positioned to exactly cover a device mockup baked
   into that image. These are the ORIGINAL screen-recording source files (dropped in
   locally, transcoded HEVC->H.264 via `avconvert -p PresetHighestQuality` and fast-start
   remuxed) — not Figma's own video/motion export, which only ever produced a frozen
   first-frame + low-res proxy for pasted video content (a real platform limitation, not
   a bug in our export code — confirmed across two independent slides). `left/top/width/
   height` are % of the slide image's box; `radius` is the device's corner radius
   expressed as `h% / v%` (Figma's px radius divided by the device's own width/height) —
   both computed from get_metadata's absolute node geometry, not eyeballed. */
const slidesReader = (c) => `
  <section class="deck" aria-label="${c.title} — deck">
    ${c.slides.map((s, i) => `<figure class="slide" id="slide-${i + 1}" data-r>
      <div class="slide__media">
        <img class="slide__img" src="${s.src}" alt="${s.alt}" width="1920" height="1080" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async" />
        ${(s.deviceVideos || []).map(dv => `<div class="slide__device" style="left:${dv.left};top:${dv.top};width:${dv.width};height:${dv.height};border-radius:${dv.radius}">
          <video src="${dv.src}" poster="${dv.poster}" ${dv.once ? 'data-once muted playsinline preload="auto"' : 'autoplay muted loop playsinline'}></video>${(dv.sheets || []).map(sh => `
          <img class="device__sheet" src="${sh.src}" data-at="${sh.at}"${sh.until ? ` data-until="${sh.until}"` : ''} alt="${sh.alt}">`).join('')}
        </div>`).join('')}
      </div>
      <figcaption class="slide__cap"><span class="slide__no">${String(i + 1).padStart(2, '0')}</span><span>${s.label}</span></figcaption>
    </figure>`).join('\n    ')}
  </section>`;

/* placeholder deck — every case renders as a vertical slide reader; cases without
   exported Figma slides yet show numbered 16:9 placeholder frames in the same layout,
   so real exports drop straight in later (replace with a `slides` array like DriveRadar). */
const DECK_STEPS = ['Problem', 'Evidence', 'Approach', 'The design', 'Outcome', 'Reflection'];
const placeholderReader = (c, steps) => `
  <section class="deck" aria-label="${c.title} — deck (slides in progress)">
    ${steps.map((label, i) => `<figure class="slide slide--ph" id="slide-${i + 1}" data-r aria-label="${label} — slide pending">
      <div class="slide__frame"><span class="slide__phnum" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span></div>
    </figure>`).join('\n    ')}
  </section>`;

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
    meta: [['Role', 'Product Designer'], ['Client', 'easyCredit'], ['Domain', 'Fintech · CRO'], ['Type', 'Shipped']],
    slides: [
      {src: 'img/decks/easycredit/01-cover.png',    label: 'Cover',            alt: 'easyCredit case cover — reducing abandonment in a high-stakes credit funnel, without increasing perceived effort',
        deviceVideos: [{src: 'img/decks/easycredit/01-cover-device.mp4', poster: 'img/decks/easycredit/01-cover-device-poster.png',
          left: '72.9167%', top: '11.2963%', width: '21.0417%', height: '77.4074%', radius: '11.39% / 5.5%'}]},
      {src: 'img/decks/easycredit/02-problem.png',  label: 'The problem',      alt: 'The problem — a carousel at the front door hid the journey users had committed to; two walls users weren\'t warned of, income/pay-slip upload at Step 1 and IDnow verification at Step 4',
        deviceVideos: [
          {src: 'img/decks/easycredit/02-problem-phone1.mp4', poster: 'img/decks/easycredit/02-problem-phone1-poster.png',
            left: '17.3958%', top: '51.9074%', width: '11.0938%', height: '42.5926%', radius: '11.27% / 5.22%'},
          {src: 'img/decks/easycredit/02-problem-phone2.mp4', poster: 'img/decks/easycredit/02-problem-phone2-poster.png',
            left: '45.3646%', top: '51.8519%', width: '11.0938%', height: '42.6852%', radius: '11.27% / 5.21%'},
        ]},
      {src: 'img/decks/easycredit/03-reframe.png',  label: 'The reframe',      alt: 'The reframe — not a styling problem, a pacing problem: remove the friction that can be removed, disclose the friction that can\'t progressively'},
      {src: 'img/decks/easycredit/04-evidence.png', label: 'Evidence',         alt: 'Evidence — two friction points from the carousel entry point, tracked at the pay-slip upload step and the IDnow legitimation hand-off'},
      {src: 'img/decks/easycredit/05-options.png',  label: 'Options explored', alt: 'Three directions explored — enhanced carousel and full-screen stepper discarded, vertical disclosure cards shipped'},
      {src: 'img/decks/easycredit/06-solution.png', label: 'The solution',     alt: 'The solution — vertical disclosure cards on an existing design-system component, reusing the IBAN income pull to remove Step 1 friction'},
      {src: 'img/decks/easycredit/07-tradeoff.png', label: 'The trade-off',    alt: 'The trade-off — real friction removed by reuse at Step 1, inherent KYC friction at Step 4 paced through progressive disclosure instead of shown up front'},
      {src: 'img/decks/easycredit/08-outcome.png',  label: 'Outcome',          alt: 'Outcome — the disclosure-card flow shipped with no before/after conversion figure yet; the stage-completion experiment proposed next'},
    ],
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
    slides: [
      {src: 'img/decks/repayment-guard/01-cover.png',       label: 'Cover',               alt: 'Cover — Smart Repayment Guard, concept / proposal, not shipped; a context-aware safety layer that surfaces the future cost of a withdrawal without blocking the user'},
      {src: 'img/decks/repayment-guard/02-problem.png',     label: 'The problem',         alt: 'The problem — good at “how much can I take?”, silent on “should I?”; the dangerous moment is the repeat withdrawal under stress, not the credit application'},
      {src: 'img/decks/repayment-guard/03-reframe.png',     label: 'The reframe',         alt: 'The reframe — a trust problem, not a compliance problem, positioned between paternalistic blocking and complicit non-intervention, aiming to warn without blocking'},
      {src: 'img/decks/repayment-guard/04-principles.png',  label: 'Principles',          alt: 'Principles — based on heuristic analysis of the withdrawal flow plus churn/support signals, with three commitments: context, foresight, and choice'},
      {src: 'img/decks/repayment-guard/05-solution.png',    label: 'Solution overview',   alt: 'Solution overview — a four-stage flow: risk detection, future snapshot, soft alternatives, and acknowledgement, with the user and system action at each stage'},
      {src: 'img/decks/repayment-guard/06-intervention.png',label: 'The intervention',    alt: 'The intervention — a future-snapshot overlay on a real easyCredit Plus payout screen shows the rate rising from 157€ to 283€ (+126€) after the payout, with softer alternatives offered',
        deviceVideos: [{src: 'img/decks/repayment-guard/06-intervention-device.mp4', poster: 'img/decks/repayment-guard/06-intervention-device-poster.png',
          // rect = the slide art's full bezel hole (measured: 1324,168 -> 357x743 px of 1920x1080);
          // the video letterboxes inside it on white (object-fit:contain in case.css) so nothing is
          // cropped and the sheets span the full screen width, flush with the baked bezel
          left: '68.9583%', top: '15.5556%', width: '18.5938%', height: '68.7963%', radius: '8.96% / 4.30%',
          // deck-node-68:2 sequence, played ONCE per viewport entry (video freezes on its last
          // frame at 14.858s): drag settles 10.5s -> rate-impact sheet holds ~4.8s -> confirm
          // sheet replaces it at 15.5s and stays. Scrolling away/back restarts the sequence.
          once: true,
          sheets: [
            {src: 'img/decks/repayment-guard/rate-sheet.png',    at: 10.7, until: 15.5, alt: 'Your rate after this payout — 157€ rises to 283€, +126€ for 36 months'},
            {src: 'img/decks/repayment-guard/confirm-sheet.png', at: 15.5,              alt: 'Please confirm payout — I understand the impact on my monthly finances'},
          ]}]},
      {src: 'img/decks/repayment-guard/07-tradeoff.png',    label: 'The trade-off',       alt: 'The trade-off — long-term growth over short-term conversion; a smaller withdrawal today favors a retained, higher-value customer tomorrow'},
      {src: 'img/decks/repayment-guard/08-measure.png',     label: 'How we would measure',alt: 'How we would measure — projected targets and a test plan, not results, tracking late-payment rate, trust/NPS delta, churn after payout peaks, and payout-frequency stability'},
      {src: 'img/decks/repayment-guard/09-watch.png',       label: 'What I would watch',  alt: 'What I would watch — the risk threshold is a designer\'s assumption, not a tested rule, so Risk and Data would co-own it before launch'},
    ],
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
    file: 'case-job-kompass.html',
    num: '03', kicker: 'Job-Kompass · Career tech',
    kind: 'Prototype — in build',
    title: 'A calmer way through the job hunt',
    gTitle: 'A calmer way through the <em>job hunt</em>',
    desc: 'Job-Kompass: an AI-native companion for anxious job seekers in the German market — built solo from discovery to running code, honest about what its AI can’t know.',
    role: 'Solo — research, product, design, and build, end to end.',
    tags: 'Job-Kompass · Career tech · AI-native product',
    lede: 'Ten of ten surveyed job seekers were tracking applications with no dedicated tool, and zero of ten would trust a bare match score. The response replaces the score with a reasoned, plain-language read, and treats applying, watching, deciding later, and declining as four equally valid outcomes.',
    meta: [['Role', 'Product Designer'], ['Client', 'Self-directed'], ['Domain', 'Career tech'], ['Type', 'Prototype — in build']],
    slides: [
      {src: 'img/decks/job-kompass/01-cover.png',         label: 'Cover',                      alt: 'Job-Kompass case cover — a calmer way through the job hunt; prototype in build, solo research, product, design, and build'},
      {src: 'img/decks/job-kompass/02-problem.png',       label: 'The problem, from research', alt: 'The problem, from research — 10 of 10 surveyed job seekers track applications with no dedicated tool, 0 of 10 would trust a bare match score, and two interviews surfaced two different jobs to be done; the paralysis sits between finding a job and deciding whether to apply'},
      {src: 'img/decks/job-kompass/03-thesis.png',        label: 'The thesis',                 alt: 'The thesis — warmth lives in copy and pacing, not in a character; the product never pressures, treats all four decision outcomes as equally valid, and works one session at a time'},
      {src: 'img/decks/job-kompass/04-directions.png',    label: 'Discovery → directions',     alt: 'Discovery to directions — three live prototypes tested three ideas; the score-free reasoning read and the one-workspace direction carried forward, the guided cover-letter session is not yet built'},
      {src: 'img/decks/job-kompass/05-core-loop.png',     label: 'The core loop',              alt: 'The core loop — capture a job posting, read a section-by-section reasoned fit assessment with no score, and record a decision; the full loop now runs end to end'},
      {src: 'img/decks/job-kompass/06-ai-trust.png',      label: 'Trust mechanics',            alt: 'Designing for an AI you can’t fully trust — a plain-language read instead of a score, a permanent non-dismissible AI-generated disclosure, and failure states specced as next, not yet built'},
      {src: 'img/decks/job-kompass/07-built-honest.png',  label: 'Built to stay honest',       alt: 'Built to stay honest — design principles enforced as CI checks with tests written to fail first, every change following the same plan, spec, build, and critical-review process'},
      {src: 'img/decks/job-kompass/08-first-contact.png', label: 'First contact with users',   alt: 'First contact with users — two guided sessions scored against pass/fail bars set in advance; what held, a score-versus-reasoning A/B split down the middle, and a miss recorded honestly'},
      {src: 'img/decks/job-kompass/09-status.png',        label: 'Status & next',              alt: 'Status and what happens next — the core loop runs end to end today, a content-complete MVP targeted for 2026-07-25, zero outcome metrics claimed by principle, and what is still to be tested'},
    ],
  },
  {
    file: 'case-platform.html',
    num: '04', kicker: 'VIER · Enterprise SaaS',
    kind: 'Shipped',
    title: 'From six products to one operational hub',
    gTitle: "Six products that behaved like <em>six startups</em>",
    desc: "Turning a fragmented enterprise ecosystem into one operational hub — and founding the design system that outlived the portal itself.",
    role: 'Owned IA and portal UX; founded the design system; specified the SSO UX (engineering led SSO).',
    tags: 'VIER · Enterprise SaaS (B2B)',
    lede: 'Six products — routing, analytics, forecasting, monitoring, bots, ticketing — each its own island: multiple logins, manually stitched KPIs, tickets in separate environments. The obvious read was "inconsistent UI." It was infrastructure.',
    meta: [['Role', 'Sr. Product Designer'], ['Client', 'VIER'], ['Domain', 'Enterprise SaaS'], ['Type', 'Shipped']],
    // VIER deck V3, Figma section node 1743:2 — exported 2026-07-16 as 10 slide PNGs
    slides: [
      {src: 'img/decks/vier/01-cover.png',         label: 'Cover',              alt: 'Six products that behaved like six startups — turning a fragmented enterprise ecosystem into one operational hub, and founding the design system that outlived the portal'},
      {src: 'img/decks/vier/02-problem.png',       label: 'The problem',        alt: 'Fragmentation looked like UX, it was infrastructure — six products (routing, analytics, forecasting, monitoring, bots, ticketing), each its own island: multiple logins, manually stitched KPIs, tickets in separate environments; no shared authentication, IA, or component language'},
      {src: 'img/decks/vier/03-discovery.png',     label: 'Discovery',          alt: 'Grounded in research, not assumption — 11 user interviews and 28 internal stakeholder interviews plus 5 workshops and 4 journey maps; users worked across 4.2 systems on average and lost about 45 minutes a day; the recurring request: "I just want everything in one place"; 5 personas mapped'},
      {src: 'img/decks/vier/04-strategy.png',      label: 'Strategy',           alt: 'Unify, Simplify, Empower — three infrastructure layers, not three screens: single sign-on at the base, one IA and shared component language above it, one operational home view on top; users touch the top layer, the leverage was at the base'},
      {src: 'img/decks/vier/05-ia.png',            label: 'Information architecture', alt: 'The real work was the IA — an app-launcher model (rejected: silos one click away) weighed against a workspace model (chosen: status, tickets, analytics on home), validated in journey maps; customer-portal sitemap as evidence'},
      {src: 'img/decks/vier/06-tradeoff.png',      label: 'The trade-off',      alt: 'A heavier home, chosen on purpose — the workspace model costs a denser home view, more to load on first paint, and more upfront IA work; accepted for what a launcher grid could never do: status, tickets, and analytics visible without a click'},
      {src: 'img/decks/vier/07-shipped.png',       label: 'From wireframe to shipped', alt: 'From wireframe to shipped — the validated IA shipped almost unchanged: same zones, same hierarchy, production polish; unify (one login, one product switcher), simplify (one navigation across former islands), empower (live stats and tickets on home)'},
      {src: 'img/decks/vier/08-outcome.png',       label: 'Outcome',            alt: 'One hub, and a design system that outlived it — logins per day 6 to 1 via SSO, manually stitched KPIs to one operational home, tickets to one queue, design system founded; plus a proposed measurement plan, not instrumented at time of writing'},
      {src: 'img/decks/vier/09-design-system.png', label: 'Design system',      alt: 'The system that outlived the portal — 40+ documented components, color and type foundations, light/dark theming, documented as a live styleguide; the portal was retired, the system remains live and maintained'},
      {src: 'img/decks/vier/10-reflection.png',    label: 'Reflection',         alt: 'The highest-leverage decision was made above the screen — single sign-on became the most significant usability improvement because design sat in the architecture room, not because of visual design'},
    ],
    sections: {
      context: {
        lede: 'Fragmentation looked like a UX problem. The cause was no shared authentication, no shared information architecture, no shared component language — so every fix was local and the experience kept drifting apart.',
        reframe: 'The biggest usability win — single sign-on — was an <em>infrastructure</em> decision, made because design was in architecture conversations it is usually not invited to.',
      },
      research: {
        lede: 'Grounded in research, not assumption. The recurring line across nearly every interview: "I just want everything in one place."',
        html: statBlock([
          {big:'11', label:'User interviews', note:'+ 28 stakeholder interviews, 5 workshops, 4 journey maps'},
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
    num: '05', kicker: 'DriveRadar · SEW-Eurodrive',
    kind: 'Shipped',
    title: 'Predictive maintenance, legible at a glance',
    gTitle: "A factory’s failing machinery, <em>legible at a glance</em>",
    desc: 'Redesigning the condition-monitoring platform engineers use to catch a gearbox failure before it stops a production line.',
    role: 'Product / UI designer — owned the asset-overview, asset-detail, and measurement views.',
    tags: 'DriveRadar · SEW-Eurodrive · B2B SaaS / IoT',
    lede: "All the data, almost none of the legibility. A map and table where every asset looked equal; failing units didn’t stand out. A missed warning isn’t bad UX — it’s a stopped production line.",
    meta: [['Role', 'Product / UI Designer'], ['Client', 'SEW-Eurodrive'], ['Domain', 'B2B · IoT'], ['Type', 'Shipped']],
    slides: [
      {src: 'img/decks/driveradar/01-cover.png',    label: 'Cover',     alt: 'DriveRadar case cover — a factory\'s failing machinery, legible at a glance'},
      {src: 'img/decks/driveradar/02-problem.png',  label: 'Problem',   alt: 'The problem — all the data, almost none of the legibility; reframe: design around the decision, not the data'},
      {src: 'img/decks/driveradar/03-model.png',    label: 'The model', alt: 'Three questions in the order an engineer asks them — Fleet, Asset, Signal'},
      {src: 'img/decks/driveradar/04-craft.png',    label: 'The craft', alt: 'From can you read this spectrum to is it trending toward the red line — rapid prototyping in ProtoPie'},
      {src: 'img/decks/driveradar/05-tradeoff.png', label: 'Trade-off', alt: 'The trade-off — severity over completeness'},
      {src: 'img/decks/driveradar/06-outcome.png',  label: 'Outcome',   alt: 'Outcome — from an undifferentiated table to a severity-sorted view'},
    ],
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
];

/* ---------- page template ---------- */
function page(c, idx) {
  const next = CASES[(idx + 1) % CASES.length];
  const S = c.sections || {};                 // defensive: old entries have no .sections yet
  const kind = c.kind || 'Shipped';
  const role = c.role || '';
  const tags = c.tags || c.kicker || '';
  const concept = /concept/i.test(kind);
  const hasSlides = Array.isArray(c.slides) && c.slides.length > 0;
  const steps = c.deckSteps || DECK_STEPS;                 // placeholder slide labels
  /* every case is now a vertical slide deck: real exports if present, else placeholders */
  const deckToc = [{ id: 'overview', label: 'Overview' }].concat(
    hasSlides
      ? c.slides.map((s, i) => ({ id: 'slide-' + (i + 1), label: s.label }))
      : steps.map((l, i) => ({ id: 'slide-' + (i + 1), label: l }))
  );
  const block = id => {                        // renders lede + optional reframe pull-quote + optional component html
    const s = S[id] || {};
    return `${s.lede ? lede(s.lede) : ''}`
      + `${s.reframe ? `<div class="pq pad" data-r><p>${s.reframe}</p></div>` : ''}`
      + `${s.html || ''}`;
  };
  return `${head(c)}

<main id="top" class="cpage">
${tocItems(deckToc)}

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

  ${hasSlides ? slidesReader(c) : placeholderReader(c, steps)}

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
    <p>© <span data-year>2026</span> Mohamed Ali Ghouila — Magdesigns®</p>
    <p>Designed to be essential. Nothing more.</p>
    <a href="#top">Back to top ↑</a>
  </footer>
</main>
</div>

<script src="js/main.js${v}" defer></script>
<script src="js/case.js${v}" defer></script>
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
