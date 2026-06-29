# Portfolio Go-Live — Design Spec

**Date:** 2026-06-29
**Owner:** Mohamed Ali Ghouila
**Project:** `~/Desktop/Claude_Design-Portfolio/03-Swiss-Grid` (the chosen design direction)
**Goal:** Ship the Swiss-Grid portfolio publicly **this week**, with real case studies built from the Cases-revised slide guides + Claude Code's embedded review notes — designed to read high-end and human, not AI-generated.

---

## 1. Decisions locked (from brainstorming)

| Decision | Choice |
|---|---|
| Design direction | **03-Swiss-Grid** |
| Case content source | `Cases-revised/files/*.md` slide guides (each already contains Claude Code's review as **"Adjust & improve"** notes, `⟦FILL⟧` markers, and "Recommended slot" rankings) |
| Case format | **Native, editorial HTML/CSS case pages** — *supersedes the earlier "embed Figma prototype" idea.* No Figma build, no iframes. |
| Visual approach | **Editorial / diagram-led.** Reasoning is the hero. Real HTML/CSS diagrams + pull-quotes. **No fabricated product screenshots, no invented metrics.** Real screens dropped in later. |
| Framing | **Truthful.** Concept work labeled as concept; no unsourced metrics — show "what I'd measure" instead; right-sized roles. |
| Launch scope | **4 cases now**, VIER Design System deferred to a later pass. |
| Hosting | **Netlify** — drag-and-drop deploy, free `*.netlify.app` subdomain now, attach a custom domain later with zero rebuild. |

---

## 2. Case mapping (proposed — confirm)

| # | Site slot (current title) | Real case | Status | Priority |
|---|---|---|---|---|
| 01 | Improving user's autonomy | **Smart Repayment Guard** | Concept / **proposal — not shipped** | 2 |
| 02 | Funnel optimisation | **easyCredit credit funnel** | Shipped | **1 (lead)** |
| 03 | 0 → 1 solution | **VIER Unified Portal** | Shipped | 3 |
| 04 | A shared product language | **VIER Design System** | Shipped | **Deferred** (later pass) |
| 05 | *(new slot)* Predictive maintenance | **DriveRadar (SEW-Eurodrive)** | Shipped, craft case | 4 |

Notes:
- VIER Portal and VIER Design System are **two separate cases** (per owner). Portal ships now; DS later.
- The slide guides' "Recommended slot #1/#2/#3" rankings were tuned for **one specific job (Miro Growth & Monetisation)**. For a **general public portfolio**, framing is broadened — keep the senior signals (reframes, trade-offs, "what I'd measure"), drop Miro-specific positioning.
- Homepage `index.html` currently lists 4 cases. Adding DriveRadar = a 5th `article.case` entry + a 5th detail page.

---

## 3. Architecture

### 3.1 Site structure (after launch)
```
03-Swiss-Grid/
  index.html              # homepage — real copy, 5 case entries, no placeholders
  case-funnel.html        # easyCredit        (slot 02, lead)
  case-autonomy.html      # Smart Repayment Guard (slot 01, proposal)
  case-platform.html      # VIER Portal       (slot 03)
  case-driveradar.html    # DriveRadar        (slot 05, NEW)
  case-design-system.html # VIER DS           (slot 04, DEFERRED — stub/"in progress")
  css/main.css, css/case.css
  js/main.js, js/case.js
```

### 3.2 Case-page template (one reusable structure)
Every case page is the same editorial spine, populated per case. Sections map directly to the slide-guide slides:

1. **Cover** — title, one-line sub, tags (`Client · Domain · Type`), role line, and an honesty badge where needed (`Concept / Proposal`, `Shipped`).
2. **Problem + reframe** — the consequence first, then the senior reframe as a pull-quote.
3. **The spine** — the case's core idea as a built diagram (3-tier model / tension axis / hypothesis statement).
4. **Evidence** — quant + qual, each sourced or honestly labeled. Funnel/stat blocks as CSS, not images.
5. **Options explored** — the killed-directions comparison table (easyCredit centrepiece; generalize to others).
6. **Solution** — annotated description; real screens *if available*, else a clean schematic/wireframe block clearly styled as a diagram (never passed off as a shipped screenshot).
7. **Trade-off** — what it won **and what it cost** (the guides insist on naming the cost).
8. **Outcome / what I'd measure** — real result if defensible, otherwise the explicit measurement plan, labeled "hypotheses / projected."
9. **Reflection / risk I'd flag** — the self-aware close.

Pages scale section count to each guide's length (easyCredit 8, Repayment Guard 9, VIER 9, DriveRadar 7).

### 3.3 Reusable diagram components (HTML/CSS, no images)
These carry the "evidence" without screenshots and are the craft surface that makes the site feel designed:
- **Tension axis** (paternalistic ↔ complicit, target zone marked) — Repayment Guard.
- **3-tier model** (Fleet/Asset/Signal, one question per level) — DriveRadar.
- **Options-killed table** (Explored / Verdict, losers at equal weight) — easyCredit centrepiece, reused.
- **Funnel / stat block** (drop-off stage highlighted) — easyCredit.
- **Hypothesis metric tree** (clearly labeled projected) — Repayment Guard, easyCredit.
- **State sequence** (4-stage flow as annotated steps) — Repayment Guard.
- **Pull-quote / reframe** block — all cases.
- **Before/after split** — DriveRadar, easyCredit (uses real art only if supplied; otherwise schematic).

---

## 4. Content rules (truthful framing — non-negotiable)

- **Smart Repayment Guard**: cover badge **"Concept / stakeholder proposal — not shipped."** Outcome section = test plan, labeled hypotheses. Never implied as live.
- **easyCredit**: the **12% drop-off must be sourced** (tool + window) or stated as "pre-redesign drop-off, internal funnel analysis." Outcome: real post-launch number **if defensible**, else honest instrumentation-gap + A/B plan. No invented lift.
- **DriveRadar**: right-sized role ("Product/UI designer, owned asset-overview/detail/measurement views"). State designed improvement plainly; **no invented percentage.**
- **VIER Portal**: role honest about ownership vs. eng-led pieces (e.g. "owned IA + portal UX; founded the DS; specced SSO UX, eng led SSO").
- Homepage `Numbers` section (`8+ yrs`, `12+ products`, etc.): replace every `tbd` with a confirmed figure or remove that stat. No placeholder ships.
- All `⟦FILL⟧` facts come from the owner before publish (see §8). Nothing is invented to fill them.

---

## 5. "Not AI-generated" design principles

The homepage already establishes a strong Swiss-editorial system (Archivo + Space Grotesk + Space Mono, grid frame, mono labels, restrained blue accent). Case pages inherit it and earn distinctiveness through:
- **Typographic hierarchy over decoration** — big confident headlines, generous whitespace, asymmetric grid.
- **Real diagrams, not stock/AI imagery** — the components in §3.3 are bespoke and content-specific.
- **Editorial rhythm** — pull-quotes, numbered sections (`A. / B. / C.`), mono captions; varied section layouts (not the same card repeated).
- **Intentional restraint** — one accent colour, no gradients-for-the-sake-of, no generic hero blobs.
- Apply the `high-end-visual-design` and `frontend-design` skills during build (implementation phase, not now).

---

## 6. Hosting & deploy (Netlify)

- **Launch:** drag the `03-Swiss-Grid` folder onto netlify.com → live on `https://<name>.netlify.app`. No git, no terminal required by owner.
- **Self-contained check:** site must run as pure static files (it does — Google Fonts via CDN is fine; verify no broken relative paths).
- **Custom domain later:** buy a real domain when ready (~€10/yr, e.g. `magdesign.de` / `.design`); attach in Netlify (free, auto-HTTPS). **Zero rebuild.** Avoid free throwaway domains (.tk etc.).
- **Updates:** re-drag the folder to redeploy. Optional later: connect a git repo for auto-deploy.

---

## 7. Workstreams & sequence

**Critical path is content, not code** — the build is largely done; the work is writing real copy + building diagram components + deploy.

1. **Content pass (owner + me)** — owner supplies `⟦FILL⟧` facts (§8); I draft real prose from the slide guides in owner's voice, owner verifies.
2. **Homepage cleanup (me)** — strip every `tbd`/`draft`/`20XX`; real hero, About dates, Numbers, CV PDF link; add DriveRadar as 5th case entry.
3. **Case template + diagram components (me)** — build the reusable spine + §3.3 components.
4. **Build 4 case pages (me)** — easyCredit → Repayment Guard → VIER Portal → DriveRadar.
5. **Review gate (owner)** — click-test, read every case, confirm truthful framing & facts.
6. **Deploy (owner clicks, me guides)** — Netlify drag-drop → public URL.
7. **Post-launch** — VIER Design System case; real screens swapped in; custom domain.

---

## 8. Open `⟦FILL⟧` items needed from owner before publish

- **Roles** (one honest line each): easyCredit, Repayment Guard, VIER Portal, DriveRadar.
- **easyCredit:** analytics tool + window for the 12%; the n=6 test observation; real post-launch outcome **or** confirmation to show the A/B plan instead.
- **DriveRadar:** constraints worked within (component lib / SEW brand / live-data limits); honest impact statement; still in production? assets/sites monitored?
- **VIER Portal:** confirm discovery numbers' sources (5 workshops / 18 interviews / etc.); the IA decision (launcher vs. workspace) in owner's words.
- **Repayment Guard:** evidence basis (heuristic analysis + churn themes, no testing yet?); the one risk to flag.
- **Homepage:** real experience dates (TeamBank/VIER/SAP/SEW); confirm Numbers figures (years, products); CV PDF to link.
- **Any real screenshots/exports** that exist for any case (optional — pages work without them).

---

## 9. Out of scope (this launch)

- VIER Design System case page (deferred).
- Building anything in Figma / embedding Figma prototypes.
- Custom domain purchase/setup (post-launch).
- Git/CI auto-deploy (optional later).
- Reworking the other directions (01-Paper-Editorial, 02-Noir-Glass, magdesign-portfolio).

---

## 10. Risks

- **`⟦FILL⟧` facts not ready in time** → blocks truthful copy. Mitigation: pages degrade to honest "what I'd measure" framing; never invent.
- **Missing screens make a case feel thin** → mitigated by diagram-led components doing the evidentiary work; the cases are argument-led by design.
- **Placeholder leakage** → final pass greps the whole site for `tbd`/`draft`/`20XX`/`⟦` before deploy; zero may remain.
- **Miro-specific framing bleeding into a general portfolio** → broaden positioning during the content pass.
