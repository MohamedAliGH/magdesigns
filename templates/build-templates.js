/* Generates the artboard-template canvases (1440-wide) for the Swiss-Grid
   case studies. Single source of truth — edit the frame data below, then:
     node templates/build-templates.js     (from the 03-Swiss-Grid directory)
   Emits templates/case-deck.html and templates/layout-masters.html. */
const fs = require('fs');
const path = require('path');

/* placeholder "edit" chip (reuses .ph from main.css) */
const ph = t => `<i class="ph" title="${t}">edit</i>`;

/* placeholder artboard (reuses .board / .boards from case.css) */
const board = b => `<figure class="board${b.span ? ` board--${b.span}` : ''}">
            <div class="board__frame board__ar${b.ar ? `--${b.ar}` : ''}">
              <span class="board__dim" aria-hidden="true">${b.dim || '1440 × 900'}</span>
              <div class="board__center">
                <span class="board__glyph" aria-hidden="true">${b.glyph || '+'}</span>
                <p class="board__name">${b.name}</p>
                <span class="board__tag">${b.tag || 'Drop artwork · placeholder'}</span>
              </div>
            </div>
            ${b.cap ? `<figcaption class="board__cap"><b>${b.capt || 'Fig.'}</b>${b.cap}</figcaption>` : ''}
          </figure>`;
const boards = arr => `<div class="boards">\n            ${arr.map(board).join('\n            ')}\n          </div>`;

/* frame wrapper: label + artboard surface */
const frame = (name, dims, inner, abClass = '') => `
  <section class="tframe">
    <p class="tframe__name"><b>${name}</b><span>${dims}</span></p>
    <div class="ab ${abClass}">
      <div class="ab__in">
        ${inner}
      </div>
    </div>
  </section>`;

/* One uniform print page per file (one artboard per page). The page height is
   set ≥ the tallest frame as it lays out in Chrome's print pipeline — which runs
   a hair taller than on-screen, so this value is verified empirically against the
   rendered PDF page count (must be 7), not just measured. Bump it if you add
   taller content; see templates/README.md → "re-export PDF". */
const printCSS = pageHeight => `<style>
@media print{ @page{ size:1440px ${pageHeight}px; margin:0 } }
</style>`;

const page = (title, sub, intro, metaLine, frames, pageHeight) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} — magdesign templates</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Space+Grotesk:wght@400;500&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="../css/main.css" />
<link rel="stylesheet" href="../css/case.css" />
<link rel="stylesheet" href="templates.css" />
${printCSS(pageHeight)}
<!-- Figma capture: inert unless opened with #figmacapture=... (see templates/README.md) -->
<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>
</head>
<body class="tpl">
  <header class="cv-head">
    <span class="label">magdesign · Swiss-Grid — case-study templates</span>
    <h1>${sub}</h1>
    <p>${intro}</p>
    <p class="meta">${metaLine}</p>
  </header>
${frames.join('\n')}
</body>
</html>
`;

/* ---------------- DECK : 7 section artboards ---------------- */
/* Mirrors the live Swiss case pages: Overview · Context · Research · Approach ·
   The design · Outcome · Reflection. */
const deckFrames = [
  /* 1 — COVER / OVERVIEW */
  frame('01 · Cover', '1440 × 1024', `
        <div class="ab-nav">
          <span class="ab-nav__brand">Mag<i>design</i>®</span>
          <span class="ab-nav__links"><span>Work</span><span>Numbers</span><span>About</span><span>Contact</span></span>
          <span class="ab-nav__cta">Get in touch <span class="orb" aria-hidden="true">↗</span></span>
        </div>
        <p class="label">Case NN · Discipline — Domain ${ph('e.g. Case 01 · B2C · Fintech')}</p>
        <h1 style="margin-top:1.4rem">Case study <em>title goes here</em></h1>
        <p class="ab__lede">One-sentence promise of the case — the problem you solved and the value created, in plain language. ${ph('replace with real lede')}</p>
        <dl class="ab-meta">
          <div><dt>Role</dt><dd>Sr. Product Designer</dd></div>
          <div><dt>Year</dt><dd>20XX ${ph('year')}</dd></div>
          <div><dt>Domain</dt><dd>Industry / platform ${ph('domain')}</dd></div>
          <div><dt>Outcome</dt><dd>Headline result ${ph('metric')}</dd></div>
        </dl>`),

  /* 2 — CONTEXT & CHALLENGE */
  frame('02 · Context & challenge', '1440 × 1280', `
        <div class="ab__head">
          <span class="label">NN.1 — Context</span>
          <h2>The <em>challenge</em></h2>
          <p class="ab__intro">Set the scene in two or three sentences: the business context, the user pain, and the constraint that made this hard. ${ph('replace copy')}</p>
        </div>
        <div class="ab-cols">
          <div><h4><i>A.</i>Challenge</h4><p>What was broken and why it mattered. ${ph('draft')}</p></div>
          <div><h4><i>B.</i>Approach</h4><p>The strategic bet you made. ${ph('draft')}</p></div>
          <div><h4><i>C.</i>Outcome</h4><p>The result, ideally with a number. ${ph('metric')}</p></div>
        </div>
        ${boards([
    { span: 7, ar: 'wide', name: 'Problem framing — context board', dim: '1600 × 900', glyph: '◷' },
    { span: 5, ar: 'wide', name: 'Constraints & stakeholders', dim: '1280 × 720', glyph: '⊕' },
  ])}`),

  /* 3 — RESEARCH & DISCOVERY */
  frame('03 · Research & discovery', '1440 × 1180', `
        <div class="ab__head">
          <span class="label">NN.2 — Discovery</span>
          <h2>Research &amp; <em>discovery</em></h2>
          <p class="ab__intro">How you learned what you learned — methods, who you spoke to, and the single insight that reframed the problem. ${ph('replace copy')}</p>
        </div>
        ${boards([
    { span: 4, ar: 'sq', name: 'Synthesis — affinity map', dim: '1024 × 1024', glyph: '⊛' },
    { span: 4, ar: 'sq', name: 'Journey — current state', dim: '1024 × 1024', glyph: '⇉' },
    { span: 4, ar: 'sq', name: 'Key insight — evidence', dim: '1024 × 1024', glyph: '✦' },
  ])}`),

  /* 4 — APPROACH */
  frame('04 · Approach', '1440 × 1120', `
        <div class="ab__head">
          <span class="label">NN.3 — Strategy</span>
          <h2>The <em>approach</em></h2>
          <p class="ab__intro">The design strategy and the principles that guided every decision from here on. ${ph('replace copy')}</p>
        </div>
        ${boards([
    { span: 6, ar: 'wide', name: 'Concept exploration — sketches', dim: '1600 × 900', glyph: '✎' },
    { span: 6, ar: 'wide', name: 'Wireframes — low fidelity', dim: '1600 × 900', glyph: '▥' },
  ])}`),

  /* 5 — THE DESIGN (showcase) */
  frame('05 · The design — showcase', '1440 × 1480', `
        <div class="ab__head">
          <span class="label">NN.4 — Outcome design</span>
          <h2>The <em>design</em></h2>
          <p class="ab__intro">The hero of the case. Lead with the strongest screen, then supporting flows and details. ${ph('replace copy')}</p>
        </div>
        ${boards([
    { span: 8, ar: 'wide', name: 'Key screen — primary flow', dim: '1440 × 810', glyph: '◫', cap: 'Lead with your strongest artboard.', capt: 'Fig. 1' },
    { span: 4, ar: 'tall', name: 'Mobile / detail state', dim: '390 × 844', glyph: '◔', cap: 'Supporting view.', capt: 'Fig. 2' },
    { span: 6, name: 'Secondary flow', dim: '1280 × 800', glyph: '▦', cap: 'The next-most-important moment.', capt: 'Fig. 3' },
    { span: 6, name: 'Detail / component', dim: '1280 × 800', glyph: '◧', cap: 'Zoom into the craft.', capt: 'Fig. 4' },
  ])}`),

  /* 6 — OUTCOME & METRICS */
  frame('06 · Outcome & metrics', '1440 × 880', `
        <div class="ab__head">
          <span class="label">NN.5 — Impact</span>
          <h2>Outcome &amp; <em>impact</em></h2>
          <p class="ab__intro">Quantify the result. Pair each number with a one-line caption so it reads on its own. ${ph('replace copy')}</p>
        </div>
        <div class="nums">
          <div class="num"><b>00<sup>%</sup></b><span>Primary metric ${ph('metric')}</span></div>
          <div class="num"><b>0.0<sup>×</sup></b><span>Efficiency / speed ${ph('metric')}</span></div>
          <div class="num"><b>00</b><span>Adoption / reach ${ph('metric')}</span></div>
          <div class="num"><b>00<sup>+</sup></b><span>Qualitative signal ${ph('metric')}</span></div>
        </div>`),

  /* 7 — REFLECTION / NEXT */
  frame('07 · Reflection & next', '1440 × 900', `
        <div class="ab__head">
          <span class="label">NN.6 — Reflection</span>
          <h2>What I’d <em>carry forward</em></h2>
          <p class="ab__intro">A short, honest reflection: what worked, what you’d change, and the principle this project reinforced. ${ph('replace copy')}</p>
        </div>
        <div class="ab-next">
          <div>
            <p class="cnext__lab">Next case study — NN</p>
            <span class="cnext__title">Next case title<span class="orb" aria-hidden="true">→</span></span>
          </div>
          <span class="btn">All work <span aria-hidden="true">↗</span></span>
        </div>
        <div class="ab-foot"><span>magdesign · case study</span><span>NN / 07</span></div>`),
];

/* ---------------- MASTERS : 7 reusable layouts ---------------- */
const masterFrames = [
  frame('Master · Cover', '1440 × 1024', `
        <p class="label">Kicker — label ${ph('kicker')}</p>
        <h1 style="margin-top:1.4rem">Big display <em>headline</em></h1>
        <p class="ab__lede">Supporting lede, one or two lines. ${ph('lede')}</p>
        <dl class="ab-meta">
          <div><dt>Label</dt><dd>Value</dd></div>
          <div><dt>Label</dt><dd>Value</dd></div>
          <div><dt>Label</dt><dd>Value</dd></div>
        </dl>`),

  frame('Master · Section divider', '1440 × 760', `
        <div class="ab-divider">
          <span class="label">Section ${ph('NN')}</span>
          <p class="big">NN</p>
          <h2>Section <em>title</em></h2>
          <p class="ab__intro">Optional one-line summary of what this section covers.</p>
        </div>`),

  frame('Master · Text + image', '1440 × 820', `
        <div class="ab-split">
          <div>
            <span class="label">Label</span>
            <h2>Heading for <em>this block</em></h2>
            <p>Body copy explaining the idea shown alongside. Keep it readable — aim for under ~55 characters per line. ${ph('copy')}</p>
            <ul>
              <li>Supporting point one ${ph('edit')}</li>
              <li>Supporting point two ${ph('edit')}</li>
              <li>Supporting point three ${ph('edit')}</li>
            </ul>
          </div>
          ${board({ ar: 'wide', name: 'Image / artboard', dim: '1280 × 800', glyph: '❖' })}
        </div>`),

  frame('Master · Full-bleed image', '1440 × 900', `
        ${board({ ar: 'wide', name: 'Full-bleed artboard', dim: '1440 × 810', glyph: '❖', cap: 'Edge-to-edge hero image with a caption underneath.', capt: 'Fig.' })}`,
    'ab-bleed'),

  frame('Master · Three columns', '1440 × 760', `
        <div class="ab__head"><span class="label">Label</span><h2 style="font-size:2.4rem">Three-column <em>layout</em></h2></div>
        ${boards([
    { span: 4, ar: 'sq', name: 'Column one', dim: '1024 × 1024', glyph: '①' },
    { span: 4, ar: 'sq', name: 'Column two', dim: '1024 × 1024', glyph: '②' },
    { span: 4, ar: 'sq', name: 'Column three', dim: '1024 × 1024', glyph: '③' },
  ])}`),

  frame('Master · Metrics', '1440 × 640', `
        <div class="ab__head"><span class="label">Impact</span><h2 style="font-size:2.4rem">Numbers that <em>matter</em></h2></div>
        <div class="nums">
          <div class="num"><b>00<sup>%</sup></b><span>Metric caption ${ph('metric')}</span></div>
          <div class="num"><b>0.0<sup>×</sup></b><span>Metric caption ${ph('metric')}</span></div>
          <div class="num"><b>00</b><span>Metric caption ${ph('metric')}</span></div>
          <div class="num"><b>00<sup>+</sup></b><span>Metric caption ${ph('metric')}</span></div>
        </div>`),

  frame('Master · Pull quote', '1440 × 680', `
        <figure class="ab-quote">
          <span class="mark" aria-hidden="true">“</span>
          <blockquote>A short, powerful quote from a stakeholder or user that <em>validates the work.</em></blockquote>
          <figcaption><b>Name Surname ${ph('name')}</b><span>Role · Company</span></figcaption>
        </figure>`),
];

/* Uniform print page height per file — verified to give exactly 7 PDF pages
   (one artboard per page) with the tallest frame fitting. */
const deckPageHeight = 1500;     // tallest = "The design — showcase" (~1429 in print)
const masterPageHeight = 980;    // tallest = "Full-bleed image" (~916 in print)

/* ---------------- write ---------------- */
const outDir = __dirname;
fs.writeFileSync(path.join(outDir, 'case-deck.html'),
  page('Case deck', 'Case-study deck — <em>7 artboards</em>',
    'A complete, ready-to-fill case-study story arc. Each frame is a 1440-wide artboard matching the Swiss-Grid portfolio and mirroring the live case pages. Replace the “edit” chips and drop your artwork into the placeholder frames.',
    '7 frames · 1440 px wide · Archivo / Space Grotesk / Space Mono · electric-blue accent', deckFrames, deckPageHeight), 'utf8');

fs.writeFileSync(path.join(outDir, 'layout-masters.html'),
  page('Layout masters', 'Reusable layout masters — <em>7 layouts</em>',
    'Swappable building blocks to assemble any case study: cover, section divider, text + image, full-bleed, three columns, metrics and pull quote. Same tokens, infinitely recombinable.',
    '7 masters · 1440 px wide · drop-in placeholders', masterFrames, masterPageHeight), 'utf8');

console.log('wrote templates/case-deck.html and templates/layout-masters.html');
