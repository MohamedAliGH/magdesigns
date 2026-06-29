# Portfolio Go-Live Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the 03-Swiss-Grid portfolio publicly this week with real, editorial, diagram-led case studies (easyCredit, Smart Repayment Guard, VIER Portal, DriveRadar) built from the Cases-revised slide guides — zero placeholders, truthful framing — and deploy to Netlify.

**Architecture:** The 4 case pages are **generated** by `build-cases.js` (a `CASES` data array + a `page()` template). All case content and structure changes happen in `build-cases.js`, then `node build-cases.js` regenerates the `case-*.html` files. New bespoke diagram components are CSS added to `css/case.css`. The homepage `index.html` is hand-edited (not generated). No Figma, no iframes, no fabricated screenshots — evidence is carried by typographic HTML/CSS diagrams.

**Tech Stack:** Static HTML/CSS/vanilla JS. Node.js (for the build script only — no dependencies, uses built-in `fs`/`path`). Google Fonts via CDN. Netlify static hosting.

## Global Constraints

- **Build command:** `node build-cases.js` (run from `03-Swiss-Grid/`) regenerates all case pages. Never hand-edit `case-*.html` — edits go in `build-cases.js`.
- **Design tokens (from `css/main.css` `:root`, use these — never hardcode):** `--bg`, `--ink`, `--ink-soft`, `--ink-faint`, `--rule`, `--rule-soft`, `--blue`, `--gut` (gutter), `--f-disp` (Archivo), `--f-mono` (Space Mono), `--ease`, `--ease-q`.
- **Brand strings (verbatim):** `Mohamed Ali Ghouila`, `Magdesign®`, email `elghouilamed@gmail.com`, LinkedIn `https://www.linkedin.com/in/mohamedalighouila`, tagline `Designed to be essential. Nothing more.`
- **Zero-placeholder rule:** No `tbd`, `draft`, `20XX`, `XX`, or `⟦` may appear in any shipped `.html`. The build must not inject any. Audit command (defined in Task 1) must return zero matches before deploy.
- **Truthful-framing rule:** Smart Repayment Guard is labeled `Concept / proposal — not shipped`. No invented metrics. Where a real number isn't owner-confirmed, the copy states the measurement plan ("what I'd measure"), never a fabricated lift. Roles are right-sized per the slide guides.
- **Existing toc anchors are fixed** (`#overview #context #research #approach #solution #outcome #reflection`) — `js/case.js` scroll-spy keys off them. Keep these 7 IDs; only relabel via the `SECTIONS` array. Do not rename IDs.
- **Accessibility/perf baseline already present:** `data-r` reveal hooks, `prefers-reduced-motion`, `?flat` mode, `.skip` link, `aria-*`. New components must keep these working (decorative glyphs `aria-hidden`, real headings semantic).

---

### Task 1: Version-control safety net + placeholder audit tool

**Files:**
- Create: `03-Swiss-Grid/.gitignore`
- Create: (git repo init in `03-Swiss-Grid/`)

**Interfaces:**
- Produces: a clean git baseline so every later task commits; the **audit command** every later task uses for verification.

- [ ] **Step 1: Initialize git and ignore noise**

```bash
cd /Users/mohamedalighouila/Desktop/Claude_Design-Portfolio/03-Swiss-Grid
git init
printf "node_modules/\n.DS_Store\n*.log\n" > .gitignore
```

- [ ] **Step 2: Baseline commit of the current (placeholder) state**

```bash
git add -A
git commit -m "chore: baseline Swiss-Grid portfolio before go-live content pass"
```

- [ ] **Step 3: Define + run the placeholder audit (must currently FIND matches — proves it works)**

Run:
```bash
grep -rnoE 'tbd|draft|20XX|[^A-Za-z]XX[^A-Za-z]|⟦' --include='*.html' . | head
```
Expected now: MANY matches (the current placeholder pages). This is the command later tasks must drive to **zero** for shipped pages.

- [ ] **Step 4: Confirm the build script runs clean on the baseline**

Run: `node build-cases.js`
Expected: prints `wrote case-autonomy.html` … `wrote case-design-system.html`, no errors.

- [ ] **Step 5: Commit (nothing to commit if build output unchanged — skip if clean)**

```bash
git add -A && git commit -m "chore: confirm build script runs" || echo "no changes"
```

---

### Task 2: Case template overhaul — editorial spine, real content fields, zero placeholders (build-cases.js)

Rewrite the `page()` template and the per-case data model so pages render **real prose** in an editorial spine and inject **no** placeholders. Wire **easyCredit** (`case-funnel.html`) fully as the reference case (prose only — bespoke diagrams come in Task 3).

**Files:**
- Modify: `03-Swiss-Grid/build-cases.js` (the `SECTIONS`, `lede`, per-case `CASES` entry for funnel, and `page()` template; remove the `ph()` helper usage)
- Test: regenerated `03-Swiss-Grid/case-funnel.html`

**Interfaces:**
- Consumes: existing partials `head(c)`, `shead(h2,no,label)`, design tokens.
- Produces: new per-case content fields consumed by Tasks 3–6:
  - `c.kind` — string badge label (`'Shipped'` | `'Concept / proposal — not shipped'`)
  - `c.role` — string (honest role line)
  - `c.tags` — string (`'Client · Domain · Type'`)
  - `c.meta` — array of `[label, value]` (no placeholders)
  - `c.sections` — object keyed by anchor id (`overview/context/research/approach/solution/outcome/reflection`), each `{ lede: string, html?: string }` where `html` is pre-built component markup (added Task 3+).
- Produces template helper `section(id, h2, no, label, body)` reused by all cases.

- [ ] **Step 1: Add a verification check (the page must end placeholder-free)**

This task's "test" is the audit on the regenerated funnel page. Define the per-file check:
```bash
grep -noE 'tbd|draft|20XX|[^A-Za-z]XX[^A-Za-z]|⟦' case-funnel.html
```
Expected after this task: **no output** (exit 1).

- [ ] **Step 2: Simplify the `lede` helper and add `badge` (keep `ph` for now)**

In `build-cases.js`, replace the `lede` helper (line ~93) with the single-arg form below and add `badge`. **Do NOT delete the `ph` helper yet** — the not-yet-migrated entries (autonomy/platform/design-system) still reference it in their data, so removing it now would throw `ReferenceError` at load. `ph` becomes dead code once all entries are migrated; remove it in Task 9.
```js
/* no placeholder injection in new content — content is real or honestly framed */
const lede = (txt) => `<div class="cs__lede pad" data-r><p>${txt}</p></div>`;
const badge = (label, concept) =>
  `<span class="cbadge${concept ? ' cbadge--concept' : ''}">${label}</span>`;
```

- [ ] **Step 3: Add the reusable `section()` helper (place above `page()`)**

```js
/* one case section: Swiss head + optional lede + body markup */
const section = (id, h2, no, label, body) => `
  <section class="cs" id="${id}">
    ${shead(h2, no, label)}
    ${body}
  </section>`;
```

- [ ] **Step 4: Rewrite the funnel (`case-funnel.html`) CASES entry — and reorder it to be FIRST in the array**

The `next` case is `CASES[(idx+1) % length]`, so array order must equal display-number order or the "Next case" links count backwards. **Move the funnel object to be the first element of `CASES`.** Target final order (DriveRadar inserted in Task 6): `funnel, autonomy, platform, driveradar, design-system`.

Replace the `case-funnel.html` object with (prose drafted from `Cases-revised/files/case-03-easyCredit-slide-guide.md`; **owner-confirm facts** are written as honest, publishable copy — see note):
```js
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
    },
    approach: {
      lede: 'I explored three directions and killed two — an enhanced carousel (more controls, same comprehension problem), a full-screen stepper (hid the full journey, the exact problem, and needed custom components), and vertical disclosure cards (all steps visible, details on demand). The cards shipped.',
    },
    solution: {
      lede: 'Every step visible at a glance, details on demand. Vertical disclosure cards: 100% of steps shown immediately, each expanding for detail only when needed — scroll-based, keyboard- and screen-reader-accessible, no swipe to discover.',
    },
    outcome: {
      lede: 'Shipped to production on an existing design-system component — faster to ship, lower to maintain, accessible by inheritance. The pre-redesign drop-off concentrated at the carousel step; the post-launch result is being instrumented, so this case states the measurement plan rather than a lift it cannot yet defend honestly.',
    },
    reflection: {
      lede: 'The trade-off I chose: visibility over visual novelty. A carousel looks more modern; honest visibility serves the brand better, because "easy" is a core value and a transparent funnel makes it literal. What I would measure next: stage-completion rate of this variant against the carousel in a holdout split, with time-to-first-doubt as a secondary signal.',
    },
  },
},
```
> **Owner-confirm for funnel (swap into fields above when available, no page placeholder needed):** the 12% drop-off figure + analytics tool/window; the exact n=6 observation; the real post-launch number. Until provided, the copy above is fully truthful and publishable.

- [ ] **Step 5: Rewrite the `page()` template body to use the editorial spine**

Replace the `page()` function (lines ~181–290) with the **defensive** version below. It must NOT crash when an entry still has the old shape (autonomy/platform/design-system before their tasks): missing `sections`/`kind`/`role`/`tags` fall back to empty/defaults, so every page builds at every task boundary. Section h2s are neutral so they fit all five cases.
```js
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
  ${section('outcome',    'Outcome &amp; <em>what I’d measure</em>', c.num + '.5', 'Outcome', block('outcome'))}
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
```
> Because old entries render empty sections (no crash, no placeholders in the *new* markup) but their `meta` still calls `ph()` → those pages will contain "tbd" until Tasks 4/5/7 migrate them. That's fine: Task 2 only audits `case-funnel.html`; the whole-site audit is Task 9, after every entry is migrated.

- [ ] **Step 6: Add minimal CSS for the cover badge + pull-quote (append to `css/case.css`)**

```css
/* ===== go-live: cover role + badge + pull-quote ===== */
.chero__role{margin-top:1.6rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap;
  font:400 .92rem/1.5 var(--f-disp);color:var(--ink-soft);max-width:60ch}
.cbadge{font:700 .6rem/1 var(--f-mono);letter-spacing:.14em;text-transform:uppercase;
  color:var(--bg);background:var(--ink);padding:.45rem .6rem}
.cbadge--concept{background:var(--blue)}
.pq{padding-block:1.4rem 2rem}
.pq p{font-family:var(--f-disp);font-weight:500;font-style:italic;
  font-size:clamp(1.3rem,3vw,2rem);line-height:1.25;letter-spacing:-.01em;max-width:24ch;color:var(--ink)}
.pq em{color:var(--blue);font-style:italic}
```

- [ ] **Step 7: Build and verify the funnel page is real + placeholder-free**

Run:
```bash
node build-cases.js && grep -noE 'tbd|draft|20XX|[^A-Za-z]XX[^A-Za-z]|⟦' case-funnel.html ; echo "exit=$?"
```
Expected: build prints `wrote …`; grep prints nothing and `exit=1` (no matches).

- [ ] **Step 8: Eyeball the render**

Run: `open case-funnel.html`
Expected: hero shows title + `Shipped` badge + role; 6 sections with real prose + the reframe pull-quote; toc scroll-spy highlights as you scroll; next-case points to case 02; no grey placeholder boards, no "tbd/draft".

- [ ] **Step 9: Commit**

```bash
git add build-cases.js css/case.css case-funnel.html case-autonomy.html case-platform.html case-design-system.html
git commit -m "feat: editorial case template + easyCredit content, remove placeholders"
```

---

### Task 3: Bespoke diagram component library (build-cases.js partials + case.css)

Add content-specific HTML/CSS components that carry evidence without screenshots, and apply easyCredit's: options-killed table, evidence stat block, hypothesis metric tree.

**Files:**
- Modify: `03-Swiss-Grid/build-cases.js` (add partial builders; populate funnel `sections[*].html`)
- Modify: `03-Swiss-Grid/css/case.css` (component styles)

**Interfaces:**
- Produces (consumed by Tasks 4–6): partial builders
  - `optsTable(rows)` — `rows: [{name, explored, verdict, won:boolean}]`
  - `statBlock(stats)` — `stats: [{big, label, note?}]`
  - `metricTree(title, nodes)` — `nodes: [{metric, role}]`, rendered labeled "projected / hypotheses"
  - `axis(leftLabel, rightLabel, zoneLabel)` — tension axis with marked target zone
  - `tiers(rows)` — `rows: [{level, question}]` three-level model
  - `seq(stages)` — `stages: [{n, user, system}]` four-stage flow table
  - `cards(items)` — `items: [{h, p}]` principle cards
  - `schematic(title, note)` — clearly-labeled non-photographic diagram frame (NOT a fake screenshot)

- [ ] **Step 1: Add the partial builders to `build-cases.js` (above `page()`)**

```js
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
```

- [ ] **Step 2: Populate easyCredit's `sections[*].html` with the components**

In the funnel CASES entry, add `html` fields:
```js
// research.html:
"html": statBlock([
  {big:'12%', label:'Lost at the carousel step', note:'pre-redesign funnel analysis'},
  {big:'n=6', label:'Moderated usability sessions', note:'why the drop-off happened'},
  {big:'WCAG', label:'Carousel fails discoverability + keyboard/SR support'},
]),
// approach.html:
"html": optsTable([
  {name:'Enhanced carousel', explored:'Arrows, dots, auto-scroll previews, callouts', verdict:'Did not fix accessibility; complexity without comprehension'},
  {name:'Full-screen stepper', explored:'One step per screen, linear wizard', verdict:'Hid the full journey — the exact problem; raised perceived effort; needed custom components'},
  {name:'Vertical disclosure cards', explored:'All steps visible; details on demand', verdict:'Solved discoverability and accessibility; reused a DS component', won:true},
]),
// outcome.html:
"html": metricTree('How I’d prove it', [
  {metric:'Stage-completion rate', role:'primary — variant vs. carousel, holdout split'},
  {metric:'Time-to-first-doubt', role:'secondary — momentum signal'},
  {metric:'Accessibility conformance', role:'keyboard + screen-reader pass'},
]),
```
> In the object these are real JS (no quotes around keys); the quoted form above is shorthand — write `html: statBlock([...])` etc.

- [ ] **Step 3: Append component CSS to `css/case.css`**

```css
/* ===== go-live: evidence components ===== */
.opts{display:flex;flex-direction:column;gap:1px;background:var(--rule);border-block:1px solid var(--rule);margin-block:1.6rem}
.opts__row{display:grid;grid-template-columns:1.1fr 1.6fr 1.3fr;gap:1px;background:var(--rule)}
.opts__row>*{background:var(--bg);padding:1.2rem var(--gut)}
.opts__row--won .opts__verdict{color:var(--blue);font-weight:500}
.opts__name{font:700 .8rem/1.4 var(--f-disp);text-transform:uppercase;letter-spacing:.02em;display:flex;flex-direction:column;gap:.5rem}
.opts__flag{font:700 .55rem/1 var(--f-mono);letter-spacing:.14em;color:var(--bg);background:var(--blue);padding:.3rem .5rem;align-self:flex-start}
.opts__explored,.opts__verdict{font-size:.88rem;line-height:1.5;color:var(--ink-soft)}
.statblock{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--rule);border-block:1px solid var(--rule);margin-block:1.6rem}
.statblock__item{background:var(--bg);padding:1.8rem var(--gut);display:flex;flex-direction:column;gap:.5rem}
.statblock__item b{font:800 clamp(2rem,5vw,3.4rem)/1 var(--f-disp);font-stretch:125%;color:var(--ink)}
.statblock__item span{font-size:.9rem;color:var(--ink-soft)}
.statblock__item small{font:400 .7rem/1.4 var(--f-mono);letter-spacing:.06em;color:var(--ink-faint)}
.mtree{margin-block:1.4rem}
.mtree__cap{font:400 .68rem/1 var(--f-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:1rem}
.mtree__cap i{color:var(--blue);font-style:normal}
.mtree__list{display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule)}
.mtree__list li{background:var(--bg);padding:1.1rem var(--gut);display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.mtree__list b{font-size:.95rem}
.mtree__list span{font-size:.85rem;color:var(--ink-soft)}
.axis{margin-block:1.6rem}
.axis__bar{position:relative;height:2px;background:var(--rule);margin:2.4rem 0 .8rem}
.axis__zone{position:absolute;left:38%;width:24%;top:-9px;height:20px;border:1.5px solid var(--blue);background:rgba(31,61,255,.06)}
.axis__zonelab{position:absolute;left:50%;top:-1.7rem;transform:translateX(-50%);white-space:nowrap;
  font:700 .6rem/1 var(--f-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--blue)}
.axis__ends{display:flex;justify-content:space-between;font:400 .8rem/1 var(--f-mono);letter-spacing:.04em;color:var(--ink-soft)}
.tiers{display:flex;flex-direction:column;gap:1px;background:var(--rule);border-block:1px solid var(--rule);margin-block:1.6rem}
.tiers__row{background:var(--bg);padding:1.4rem var(--gut);display:flex;align-items:baseline;gap:1.2rem;flex-wrap:wrap}
.tiers__no{font:700 .7rem/1 var(--f-mono);color:var(--blue)}
.tiers__row b{font:700 .95rem/1 var(--f-disp);text-transform:uppercase;min-width:7ch}
.tiers__q{font-size:.95rem;color:var(--ink-soft);font-style:italic}
.seq{display:flex;flex-direction:column;gap:1px;background:var(--rule);border-block:1px solid var(--rule);margin-block:1.6rem}
.seq__row{background:var(--bg);padding:1.2rem var(--gut);display:grid;grid-template-columns:auto 1fr 1fr;gap:1.2rem;align-items:start}
.seq__n{font:800 1.1rem/1 var(--f-disp);color:var(--blue)}
.seq__c b{font:700 .58rem/1 var(--f-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);display:block;margin-bottom:.4rem}
.seq__c p{font-size:.88rem;line-height:1.5;color:var(--ink-soft)}
.pcards{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--rule);border-block:1px solid var(--rule);margin-block:1.6rem}
.pcard{background:var(--bg);padding:1.6rem var(--gut)}
.pcard h4{font:700 .8rem/1 var(--f-disp);text-transform:uppercase;letter-spacing:.02em;color:var(--blue);margin-bottom:.7rem}
.pcard p{font-size:.88rem;line-height:1.55;color:var(--ink-soft)}
.schem{margin-block:1.6rem}
.schem__frame{aspect-ratio:16/9;display:grid;place-items:center;position:relative;
  background-color:#EAEAE5;background-image:repeating-linear-gradient(45deg,rgba(12,12,12,.045) 0 1px,transparent 1px 10px);border:1px solid var(--rule)}
.schem__tag{position:absolute;top:.85rem;left:.9rem;font:400 .56rem/1 var(--f-mono);letter-spacing:.16em;text-transform:uppercase;color:var(--ink-faint);border:1px dashed var(--ink-faint);padding:.3rem .5rem}
.schem__title{font-size:1rem;color:var(--ink-soft);max-width:34ch;text-align:center;padding:1.5rem}
.schem figcaption{padding:.9rem .1rem .2rem;font-size:.85rem;color:var(--ink-faint)}
@media(max-width:820px){
  .opts__row,.statblock,.seq__row,.pcards{grid-template-columns:1fr}
  .opts__row>*{border-bottom:0}
}
```

- [ ] **Step 4: Build and verify**

Run:
```bash
node build-cases.js && grep -ncE 'opts__row|statblock__item|mtree__list' case-funnel.html && grep -noE 'tbd|draft|20XX|⟦' case-funnel.html ; echo "exit=$?"
```
Expected: build OK; first grep prints a count > 0 (components present); placeholder grep prints nothing, `exit=1`.

- [ ] **Step 5: Eyeball + commit**

Run: `open case-funnel.html`
Expected: Evidence shows the 3-stat block; Approach shows the options table with the "Shipped" row highlighted blue; Outcome shows the hypothesis metric tree labeled "projected / hypotheses". Then:
```bash
git add build-cases.js css/case.css case-*.html
git commit -m "feat: bespoke evidence components + wire easyCredit diagrams"
```

---

### Task 4: Smart Repayment Guard content (case-autonomy.html)

Concept/proposal case — strongest monetisation-psychology thinking. Uses the tension axis, principle cards, and the four-state sequence.

**Files:**
- Modify: `03-Swiss-Grid/build-cases.js` (the `case-autonomy.html` CASES entry)

**Interfaces:**
- Consumes: `axis`, `cards`, `seq`, `metricTree` from Task 3; template from Task 2.

- [ ] **Step 1: Replace the `case-autonomy.html` CASES entry**

Prose from `case-04-smart-repayment-guard-slide-guide.md`:
```js
{
  file: 'case-autonomy.html',
  num: '02', kicker: 'eC+ · Fintech',
  kind: 'Concept / proposal — not shipped',
  title: 'Smart Repayment Guard',
  gTitle: 'Smart Repayment <em>Guard</em>',
  desc: 'A context-aware intervention that helps customers avoid financial overextension — without blocking them, and without being paternalistic. A concept / stakeholder proposal.',
  role: 'Senior Product Designer — self-directed, end to end.',
  tags: 'eC+ · Fintech · Concept proposal',
  lede: 'The product is good at “how much can I take?” and silent on “should I?”. The dangerous moment isn’t applying for credit — it’s the repeat withdrawal under stress. This proposes a context-aware safety layer that surfaces the future cost of a withdrawal without blocking the user.',
  meta: [['Role', 'Sr. Product Designer'], ['Client', 'eC+'], ['Domain', 'Fintech'], ['Type', 'Concept / proposal']],
  sections: {
    context: {
      lede: 'The product shows the money is available and processes it; weeks later — a missed payment, difficulty, regret-driven churn. Betting that long-term trust compounds into retention faster than a marginally higher withdrawal rate.',
      reframe: 'A <em>trust</em> problem, not a compliance problem — help users make the decision they’d thank us for later, rather than block the ones a rule flags.',
      html: axis('Complicit (don’t intervene)', 'Paternalistic (block)', 'Target: warn, don’t block'),
    },
    research: {
      lede: 'Honest about its basis: this rests on a heuristic analysis of the live withdrawal flow plus themes from churn and support signals — no user testing yet. The first recommended step is five to eight moderated reactions before any engineering. The commitments it would hold:',
      html: cards([
        {h:'Context', p:'Intervene only at the right moment — no nagging on safe withdrawals.'},
        {h:'Foresight', p:'Show the concrete future cost, not an abstract warning.'},
        {h:'Choice', p:'Warn, don’t block. This is the line between a safety layer and a compliance pop-up.'},
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
      lede: 'The intervention, state by state: a silent pass on safe withdrawals (proving the no-nagging principle), a future-snapshot that makes the cost concrete, soft alternatives, and an explicit acknowledgement. The future-snapshot is the emotional core — the moment an abstract risk becomes a number the user feels.',
      html: schematic('Four states — risk detection · future snapshot · soft alternatives · acknowledgement', 'Designed states; high-fidelity screens to follow. Shown as schematic, not a shipped screenshot.'),
    },
    outcome: {
      lede: 'A proposal stands on reasoning, not borrowed data — so this is framed as projected targets and a test plan, never results. Long-term sustainable growth over short-term conversion: a user who takes €300 instead of €500, or delays a week, is a smaller transaction today and a retained, higher-lifetime-value customer tomorrow.',
      html: metricTree('How we’d measure it', [
        {metric:'Late-payment rate', role:'primary — Guard cohort vs. holdout'},
        {metric:'Trust / NPS delta', role:'secondary'},
        {metric:'Churn after payout peaks', role:'secondary'},
        {metric:'Payout-frequency stability', role:'guardrail'},
      ]),
    },
    reflection: {
      lede: 'The risk I’d flag to stakeholders: the risk-detection threshold is currently a designer’s assumption, not a tested rule — get it wrong and we nag safe users or miss risky ones. I’d want Risk and Data to co-own that threshold with me before launch. Naming that openly is what makes this judgement, not a sales pitch.',
    },
  },
},
```

- [ ] **Step 2: Build and verify**

Run:
```bash
node build-cases.js && grep -nc 'cbadge--concept' case-autonomy.html && grep -noE 'tbd|draft|20XX|⟦' case-autonomy.html ; echo "exit=$?"
```
Expected: build OK; concept-badge count = 1; placeholder grep empty, `exit=1`.

- [ ] **Step 3: Eyeball + commit**

Run: `open case-autonomy.html`
Expected: hero shows blue `Concept / proposal — not shipped` badge; tension axis renders with the target zone marked; principle cards; four-state sequence; "projected / hypotheses" metric tree. Then:
```bash
git add build-cases.js case-*.html
git commit -m "feat: Smart Repayment Guard case content (concept, truthful framing)"
```

---

### Task 5: VIER Portal content (case-platform.html)

The 0→1 systems case. Uses the discovery stat block, three-pillar strategy cards, and an IA before/after schematic.

**Files:**
- Modify: `03-Swiss-Grid/build-cases.js` (the `case-platform.html` CASES entry)

**Interfaces:**
- Consumes: `statBlock`, `cards`, `schematic` from Task 3.

- [ ] **Step 1: Replace the `case-platform.html` CASES entry**

Prose from `case-01-vier-slide-guide.md`:
```js
{
  file: 'case-platform.html',
  num: '03', kicker: 'VIER · Enterprise SaaS',
  kind: 'Shipped',
  title: 'From five products to one operational hub',
  gTitle: 'Five products that behaved like <em>five startups</em>',
  desc: 'Turning a fragmented enterprise ecosystem into one operational hub — and founding the design system that outlived the portal itself.',
  role: 'Owned IA + portal UX; founded the design system; specced the SSO UX (engineering led SSO).',
  tags: 'VIER · Enterprise SaaS (B2B)',
  lede: 'Six products — routing, analytics, forecasting, monitoring, bots, ticketing — each its own island: multiple logins, manually stitched KPIs, tickets in separate environments. The obvious read was “inconsistent UI.” It was infrastructure.',
  meta: [['Role', 'Sr. Product Designer'], ['Client', 'VIER'], ['Domain', 'Enterprise SaaS'], ['Type', 'Shipped']],
  sections: {
    context: {
      lede: 'Fragmentation looked like a UX problem. The cause was no shared authentication, no shared information architecture, no shared component language — so every fix was local and the experience kept drifting apart.',
      reframe: 'The biggest usability win — single sign-on — was an <em>infrastructure</em> decision, made because design was in architecture conversations it is usually not invited to.',
    },
    research: {
      lede: 'Grounded in research, not assumption. The recurring line across nearly every interview: “I just want everything in one place.”',
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
      lede: 'A unified portal: one login, one IA, a workspace home that surfaces what was previously stitched together by hand. The component language that built it became the design system — the part of this work that outlived the portal itself.',
      html: schematic('Unified workspace dashboard + the IA that replaced the launcher model', 'Information-architecture schematic — launcher model vs. the workspace model that shipped.'),
    },
    outcome: {
      lede: 'One hub replacing the manual stitching across six tools, and a design system adopted beyond the portal. The headline figures (adoption, time saved) are owner-confirmed operational metrics; until verified here, the case states the structural outcome rather than a number it cannot source.',
    },
    reflection: {
      lede: 'The transferable principle: the highest-leverage design decision was the one made above the screen. Being in the architecture room is what let a design call (SSO) become the product’s biggest usability win — that influence is what “senior” means in practice.',
    },
  },
},
```
> **Owner-confirm for VIER:** source of each discovery number; real adoption/time-saved metrics for the Outcome. Copy above is truthful without them.

- [ ] **Step 2: Build, verify, commit**

Run:
```bash
node build-cases.js && grep -noE 'tbd|draft|20XX|⟦' case-platform.html ; echo "exit=$?"
open case-platform.html
```
Expected: placeholder grep empty (`exit=1`); render shows stat block (18 / 4.2 / ~45min), three pillar cards, IA schematic.
```bash
git add build-cases.js case-*.html
git commit -m "feat: VIER Portal case content"
```

---

### Task 6: DriveRadar — new 5th case (case-driveradar.html)

Craft case (SEW). Adds a new file. Uses the three-tier model and a before/after schematic.

**Files:**
- Modify: `03-Swiss-Grid/build-cases.js` (append a new CASES entry)

**Interfaces:**
- Consumes: `tiers`, `schematic`, `statBlock` from Task 3. The build loop already writes every entry in `CASES` and links `next` cyclically — adding an entry auto-creates the file and wires the rotation.

- [ ] **Step 1: Insert a new CASES entry — positioned BEFORE the design-system entry**

Final array order must be `funnel, autonomy, platform, driveradar, design-system` so the `num` values (01–05) match array order and the next-case rotation flows forward. Insert this object immediately before the `case-design-system.html` entry (prose from `case-02-driveradar-slide-guide.md`):
```js
{
  file: 'case-driveradar.html',
  num: '04', kicker: 'DriveRadar · SEW-Eurodrive',
  kind: 'Shipped',
  title: 'Predictive maintenance, legible at a glance',
  gTitle: 'A factory’s failing machinery, <em>legible at a glance</em>',
  desc: 'Redesigning the condition-monitoring platform engineers use to catch a gearbox failure before it stops a production line.',
  role: 'Product / UI designer — owned the asset-overview, asset-detail, and measurement views.',
  tags: 'DriveRadar · SEW-Eurodrive · B2B SaaS / IIoT',
  lede: 'All the data, almost none of the legibility. A map and table where every asset looked equal; failing units didn’t stand out. A missed warning isn’t bad UX — it’s a stopped production line.',
  meta: [['Role', 'Product / UI Designer'], ['Client', 'SEW-Eurodrive'], ['Domain', 'B2B · IIoT'], ['Type', 'Shipped']],
  sections: {
    context: {
      lede: 'The platform was built around the data the sensors produce, not the decision the operator has to make. Raw vibration plots — accurate, but unreadable at a glance; every measurement at the same visual weight; no hierarchy of concern.',
      reframe: 'Design around the <em>decision</em>, not the data — demote the spectrum so a failing gearbox surfaces.',
    },
    research: {
      lede: 'For a metric-light craft case the visuals are the proof. The redesign reorganises three levels of the product, each answering exactly one question and handing off cleanly to the next.',
      html: tiers([
        {level:'Fleet', question:'“Where do I look?” — which assets have alerts, ranked by severity.'},
        {level:'Asset', question:'“What’s wrong with this machine?” — health → measurements → components → service.'},
        {level:'Signal', question:'“Is this getting worse?” — one measurement trended against its threshold.'},
      ]),
    },
    approach: {
      lede: 'Asset detail reorganised around the operator’s mental model of the machine: availability up top, then key measurements as scannable states (“everything is fine” vs. a flagged value), then components with vibration status, then service info — a 3D model anchoring the operator in the physical machine.',
      html: schematic('Severity-sorted fleet overview + asset-detail hierarchy of concern', 'Before/after schematic — undifferentiated map-and-table vs. severity-sorted overview.'),
    },
    solution: {
      lede: 'From “can you read this spectrum?” to “is it trending toward the red line?” Raw vibration plots became a clean time-series with the threshold line and week/month/year ranges. The specialist’s spectral detail still exists — it moved one click deeper.',
    },
    outcome: {
      lede: 'The honest framing for a craft case: rather than invent a percentage, state the designed improvement plainly — fleet triage moved from scanning an undifferentiated table to a single severity-sorted view. The number worth instrumenting next is time-to-locate a flagged asset, old versus new.',
    },
    reflection: {
      lede: 'The decisions made under constraint: severity over completeness (a specialist’s raw reading is one click deeper — the right call, since triage is many users every day and deep analysis is few users occasionally), and readable trend over raw fidelity. What I’d sharpen: validate alert thresholds and colour categories with the engineers who live in alarm fatigue.',
    },
  },
},
```
> **Owner-confirm for DriveRadar:** the real constraints worked within (component library / SEW brand / live-data limits); still in production? assets/sites monitored?

- [ ] **Step 2: Build and verify the new file exists + is clean**

Run:
```bash
node build-cases.js && ls -1 case-driveradar.html && grep -noE 'tbd|draft|20XX|⟦' case-driveradar.html ; echo "exit=$?"
```
Expected: `wrote case-driveradar.html` appears; file lists; placeholder grep empty (`exit=1`).

- [ ] **Step 3: Verify next-case rotation flows forward**

Run: `grep -o 'Next case study — [0-9]*' case-*.html | sort -u`
Expected: the set `01, 02, 03, 04, 05` each appears once — funnel→02, autonomy→03, platform→04, driveradar→05, design-system→01 (wraps). No number points backward. (DriveRadar is `04`; design-system `05` is the deferred stub from Task 7.)

- [ ] **Step 4: Eyeball + commit**

Run: `open case-driveradar.html`
Expected: three-tier model (Fleet/Asset/Signal) with one question each; before/after schematic; honest "designed improvement" outcome (no invented %). Then:
```bash
git add build-cases.js case-*.html
git commit -m "feat: add DriveRadar as 5th case (craft, honest framing)"
```

---

### Task 7: Defer VIER Design System honestly (case-design-system.html)

The DS case is deferred. It must not ship as a placeholder page, and the next-case rotation must not link to a placeholder. Convert its CASES entry to a minimal, honest "in progress" page and remove it from the homepage work list (homepage handled in Task 8).

**Files:**
- Modify: `03-Swiss-Grid/build-cases.js` (the `case-design-system.html` entry → in-progress content)

**Interfaces:**
- Consumes: template from Task 2. Produces a clean standalone page with no placeholders.

- [ ] **Step 1: Replace the `case-design-system.html` CASES entry with honest in-progress content**

```js
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
```

- [ ] **Step 2: Build and verify clean**

Run:
```bash
node build-cases.js && grep -noE 'tbd|draft|20XX|⟦' case-design-system.html ; echo "exit=$?"
```
Expected: placeholder grep empty (`exit=1`). Page reads as an honest "in progress" entry, not a placeholder skeleton.

- [ ] **Step 3: Commit**

```bash
git add build-cases.js case-*.html
git commit -m "feat: VIER design system as honest in-progress page (deferred)"
```

---

### Task 8: Homepage rebuild (index.html) — real content, real case list, zero placeholders

The homepage is hand-edited. Replace every placeholder with real content, fix the case list (5 entries with real titles, DriveRadar added, links correct), real experience dates, real numbers, CV link.

**Files:**
- Modify: `03-Swiss-Grid/index.html`

**Interfaces:**
- Consumes: nothing from build script (separate file). Must keep `data-r`, `data-count`, `data-clock`, `data-year`, `.case__head`/`aria-controls` hooks working (driven by `js/main.js`).

- [ ] **Step 1: Replace the 4 case articles with 5 real entries**

In `index.html`, replace the four `<article class="case">` blocks (lines ~81–162) so each `case__title`, `case__desc`, `case__yr`, the A/B/C grid copy, and the `case__open` href match the real cases. Use the titles + ledes from Tasks 2/4/5/6/7 and these hrefs/order:
1. `case-funnel.html` — "Removing friction from a high-stakes credit funnel" — `Fintech — Shipped`
2. `case-autonomy.html` — "Smart Repayment Guard" — `Fintech — Concept`
3. `case-platform.html` — "From five products to one operational hub" — `Enterprise SaaS — Shipped`
4. `case-driveradar.html` — "Predictive maintenance, legible at a glance" — `B2B / IIoT — Shipped`
5. `case-design-system.html` — "A shared product language" — `Design system — In progress`

Remove every `<i class="ph" …>tbd</i>` / `draft` marker and the fake `2024 tbd` style years (use the honest type label instead of a year, or a confirmed year). Update the section count label `(01) — Case index, 4 entries` → `5 entries`. Each accordion keeps a unique `aria-controls`/`id` (`c1`…`c5`).

- [ ] **Step 2: Fix the Numbers section (line ~173–178)**

Replace placeholder figures with confirmed values, or drop a stat. Remove all `<i class="ph">`. Suggested honest set (owner confirms the two flagged):
- `data-count="4"` Companies & clients — `TeamBank / VIER / SAP / SEW` (factual, keep)
- `data-count="3"` Focus disciplines — `B2C / B2B / Design systems` (factual, keep)
- Years in product design — owner-confirmed integer (replace `8` if needed; remove the `tbd`).
- Products shipped — owner-confirmed integer, or replace this stat with `5` (case studies on this site) labeled "Case studies" to avoid an unverifiable "12+".

- [ ] **Step 3: Fix the About / experience block (lines ~201–211)**

- Replace `Direct download coming here tbd` and the tooling `tbd`: either link a real CV PDF (`href="MohamedAliGhouila-CV.pdf"` if the owner drops one in the folder) or change the button to the existing mailto request and delete the "coming here" line.
- Replace all `20XX–XX tbd` experience dates with real ranges for TeamBank / VIER / SAP·openSAP / SEW. Remove every `<i class="ph">`.

- [ ] **Step 4: Update `<title>`/meta description if client names need adjusting**

Keep `Mohamed Ali Ghouila — Senior Product Designer`; ensure the description's client list is accurate.

- [ ] **Step 5: Verify the homepage is placeholder-free and links resolve**

Run:
```bash
grep -noE 'tbd|draft|20XX|[^A-Za-z]XX[^A-Za-z]|⟦' index.html ; echo "exit=$?"
grep -oE 'case-[a-z-]+\.html' index.html | sort -u
for f in $(grep -oE 'case-[a-z-]+\.html' index.html | sort -u); do test -f "$f" && echo "OK $f" || echo "MISSING $f"; done
```
Expected: first grep empty (`exit=1`); the 5 case files all print `OK` (none MISSING).

- [ ] **Step 6: Eyeball + commit**

Run: `open index.html`
Expected: 5 cases listed with real titles + correct accordions; Numbers/About/experience all real; no "tbd/draft". Counters animate, clock ticks. Then:
```bash
git add index.html
git commit -m "feat: real homepage content, 5-case index incl. DriveRadar, zero placeholders"
```

---

### Task 9: Site-wide audit + QA pass

Final correctness gate before deploy: zero placeholders anywhere, all internal links resolve, render check across pages and mobile width, reduced-motion + flat mode sane.

**Files:**
- (No new files — verification + any small fixes surfaced.)

- [ ] **Step 1: Whole-site placeholder audit (the Global Constraint gate)**

Run:
```bash
grep -rnoE 'tbd|draft|20XX|[^A-Za-z]XX[^A-Za-z]|⟦|Lorem|placeholder' --include='*.html' . ; echo "exit=$?"
```
Expected: **no output**, `exit=1`. If anything prints, fix it in `build-cases.js` (for case pages) or `index.html`, rebuild, re-run.

- [ ] **Step 2: Link integrity across all pages**

Run:
```bash
for p in index.html case-*.html; do
  for l in $(grep -oE '(href|src)="[^"#:]+\.(html|css|js|pdf)"' "$p" | sed -E 's/.*="([^"]+)".*/\1/' | sort -u); do
    test -f "$l" || echo "$p → MISSING $l"
  done
done; echo "done"
```
Expected: only `done` (no MISSING lines). A missing CV PDF is acceptable only if Task 8 chose the mailto path (then no PDF href exists).

- [ ] **Step 3: Render check — desktop, mobile width, flat mode**

Run: `open index.html case-funnel.html case-autonomy.html case-platform.html case-driveradar.html case-design-system.html`
Then in the browser: resize to ~375px (mobile) — confirm the options table, stat block, sequence, and hero meta stack to one column (Task 3 + case.css media queries); load `case-funnel.html?flat` — confirm content shows without reveal animations.
Expected: no horizontal scroll; all components legible; toc hidden under 1200px (by design).

- [ ] **Step 4: Accessibility sanity**

Confirm: every decorative glyph/arrow is `aria-hidden`, each case page has one `<h1>`, the concept badge text is real text (screen-reader reads "Concept / proposal — not shipped"), skip link targets `#overview`.
Run: `grep -c '<h1' case-funnel.html` → expected `1`.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A && git commit -m "fix: QA pass — placeholder audit, links, responsive" || echo "clean, nothing to fix"
```

---

### Task 10: Editable 16:9 case decks in Figma (gates launch)

**Goal:** A separate, editable Figma file holding one 16:9 presentation deck per shipped case, mirroring the **finalized** web-page content (built after Tasks 2–8 lock the copy, so decks reflect final wording). Owner wants these editable so they can restyle/modify case studies independently of the code.

**Tooling & execution:** Figma MCP. **MANDATORY skill order:** load `figma-create-new-file` BEFORE any `create_new_file` call; load `figma-use` (and `figma-use-slides` if the owner picks native Figma Slides) BEFORE any `use_figma` call; use `figma-generate-design` for layout. This task is **executed by the controller via the Figma skills with per-deck checkpoints — NOT via the code implementer/reviewer loop** (design-tool work, not code; no git diff to review).

- [ ] **Step 1: Confirm the Figma target with the owner**
  Default: one new Figma **design file**, one **page per case**, **16:9 frames** per slide (most editable; supports components/auto-layout/variables; exports to PDF/deck). Alternative: native **Figma Slides**. Confirm before building.

- [ ] **Step 2: Build shared foundations first (so decks are editable + consistent)**
  Type scale (Archivo / Space Grotesk / Space Mono), colour styles from the site tokens (`--ink`, `--blue`, `--bg`, rules), and reusable slide templates: cover, section-statement, pull-quote, stat block, options table, sequence, metric tree. Components + variables, not one-off frames.

- [ ] **Step 3: Build one deck per case, mirroring the slide-guide structure**
  Cases: easyCredit, Smart Repayment Guard, VIER Portal, DriveRadar (VIER DS optional). Per deck, follow the source guide's slide order (cover → problem+reframe → evidence → options/approach → solution → trade-off → outcome/what-I'd-measure → reflection). Target lengths from the guides (easyCredit 8, Repayment Guard 9, VIER 9, DriveRadar 7).

- [ ] **Step 4: Carry the truthful framing into the slides**
  Concept/proposal label on Smart Repayment Guard's cover; no fabricated metrics; projected numbers labeled "hypotheses"; right-sized roles. Same rules as the web pages.

- [ ] **Step 5: Verify each deck is genuinely editable**
  Text is live text layers (not flattened/rasterised), templates are reusable components, styles are shared. Confirm frames render at 16:9. Capture the Figma share link.

- [ ] **Step 6: Owner checkpoint**
  Walk the owner through the decks; get approval. This gates Task 11 (deploy) per the owner's "before launch" decision.

---

### Task 11: Netlify deploy + go-live

Ship to a public URL. Runs after Task 10 decks are approved (owner chose "Figma before launch"). Owner performs the drop; this task prepares the folder and gives exact steps.

**Files:**
- Create: `03-Swiss-Grid/netlify.toml` (optional but tidy — sets publish dir for drag-drop clarity)

- [ ] **Step 1: Final build so generated files are current**

Run: `node build-cases.js`
Expected: all 6 case files written with no errors.

- [ ] **Step 2: Add a minimal `netlify.toml`**

```toml
# Static site — no build step (case pages are pre-generated by build-cases.js).
[build]
  publish = "."
```

- [ ] **Step 3: Confirm the site works as pure static files (no server needed)**

Run: `open index.html` and click through to two case studies and back.
Expected: relative links work from `file://` (they do — all links are relative). Google Fonts load over the network; everything else is local.

- [ ] **Step 4: Deploy (owner action — two options)**

- **Drag-and-drop (fastest):** go to https://app.netlify.com/drop and drag the `03-Swiss-Grid` folder onto it → live at `https://<random-name>.netlify.app`. Rename the site under Site settings → Domain management.
- **Git-connected (auto-deploy on push):** push this repo to GitHub, then in Netlify "Add new site → Import from Git", pick the repo, publish dir `.`, no build command. Future updates deploy on `git push`.

- [ ] **Step 5: Post-deploy smoke test**

Open the live `*.netlify.app` URL on desktop and phone. Confirm: homepage loads, all 5 case links open, fonts render, no mixed-content warnings, no 404s.
Expected: site is live and navigable.

- [ ] **Step 6: Commit deploy config**

```bash
git add netlify.toml && git commit -m "chore: netlify deploy config"
```

- [ ] **Step 7: (Later, not blocking) custom domain**

When a domain is purchased: Netlify → Domain management → Add custom domain → follow DNS records → HTTPS auto-provisions. Zero rebuild. Avoid free throwaway TLDs.

---

## Post-launch backlog (out of scope for this week)

- Replace schematics with real product screens as they’re produced (swap the `schematic(...)` calls for an image partial).
- Full VIER Design System case (promote from the in-progress page).
- Fill owner-confirm facts (easyCredit 12% source + real outcome; VIER discovery sources + adoption metrics; DriveRadar constraints/scale) — edit the relevant `CASES` fields and rebuild.
- Custom domain + optional git-connected auto-deploy.

## Owner-confirm facts (gather in parallel; none block launch — copy is truthful without them)

- **easyCredit:** analytics tool + window for the 12%; the n=6 observation; real post-launch number.
- **VIER Portal:** source of each discovery stat (18 interviews / 4.2 systems / ~45 min); real adoption/time-saved metric.
- **DriveRadar:** constraints worked within; in production? assets/sites monitored.
- **Smart Repayment Guard:** confirm evidence basis line; the stakeholder risk line.
- **Homepage:** real experience date ranges (TeamBank / VIER / SAP·openSAP / SEW); confirmed "years" + "products" figures; CV PDF (or use mailto).
