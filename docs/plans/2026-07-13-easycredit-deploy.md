# Portfolio Deploy + easyCredit V4 Case Study — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the `03-Swiss-Grid` portfolio to GitHub Pages (public repo `magdesigns`) and ship easyCredit deck V4 as the real slide deck on `case-funnel.html`.

**Architecture:** Reconcile the working tree, fast-forward `main` to the current content, push to a new public GitHub repo, enable Pages. Then, on a dedicated branch, export the 8 easyCredit V4 slides from Figma via MCP, wire them into `case-funnel`'s existing `slides` mechanism (same one `case-driveradar` already uses), and merge to `main` to go live.

**Tech Stack:** Static HTML/CSS/JS site, Node-based static build script (`build-cases.js`), Figma MCP (`get_screenshot`/`get_metadata`), git, GitHub Pages.

**No unit-test framework exists in this repo** (it's a static content site, not an application). "Verification" steps below use real shell commands (git status, curl, JSON parsing, visual check) instead of a test runner — same rigor, different tool.

## Global Constraints

- Design spec: `docs/specs/2026-07-13-easycredit-deploy-design.md` (approved).
- Repo name: `magdesigns`. GitHub user: `MohamedAliGH`. Live URL: `https://MohamedAliGH.github.io/magdesigns/`.
- Repo visibility: **public** (free GitHub Pages requires it — no GitHub Pro).
- Branch-per-case-study: `main` always mirrors the live site; each case ships from its own `case/<name>` branch merged to `main`.
- **Never use `git reset --hard`, `git worktree`, or any destructive git op in this plan or in any subagent executing it.** Edits + regular commits only.
- Figma source: fileKey `ms6a8Br6n28g6BJDZBdyIH`, section `992:2` ("easyCredit — Deck (V4 · real story)"), export at `maxDimension: 2400`.
- Role-line fix: `build-cases.js` case-funnel `meta` currently says `'Sr. Product Designer'`; V4 deck's own cover chip says `'Product Designer'`. Fix to `'Product Designer'` so the site and the deck agree (scope limited to this one `meta` field — not the separate prose `role:` field, which the spec didn't flag).
- No fabricated facts/metrics anywhere (existing project rule — nothing in this plan invents numbers).

---

### Task 1: Reconcile the working tree on `go-live`

**Files:**
- Modify: `.gitignore`
- Stage (already-tracked, modified): `build-cases.js`, `case-autonomy.html`, `case-design-system.html`, `case-driveradar.html`, `case-funnel.html`, `case-platform.html`, `css/case.css`, `css/main.css`, `index.html`
- Stage (currently untracked, real site assets): `css/preview.css`, `img/cases/easycredit.jpg`, `img/cases/vier-ds.jpg`, `img/cases/vier-portal.jpg`, `img/decks/driveradar/01-cover.png` … `06-outcome.png`, `img/decks/slides-manifest.json`, `img/home/portrait-cut.png`, `img/home/portrait.jpg`
- Leave untracked, ignored (dev iteration artifacts, not shipped): `css/case.css.bak`, `css/main.css.bak`, `index.html.bak`, `index-hover.html`, `index-open.html`

**Interfaces:** None (no code interfaces — pure repo hygiene).

- [ ] **Step 1: Confirm current branch and starting state**

Run: `cd ~/Desktop/Claude_Design-Portfolio/03-Swiss-Grid && git branch --show-current`
Expected: `go-live`

- [ ] **Step 2: Add dev-artifact ignore rules**

Edit `.gitignore` (currently `node_modules/`, `.DS_Store`, `*.log`) — append:

```
*.bak
index-hover.html
index-open.html
```

- [ ] **Step 3: Verify the untracked-file list matches expectations**

Run: `git status --short`
Expected output — every line either starts with ` M` (modified/tracked) for the 9 tracked files listed above, or `??` only for: `css/preview.css`, `img/` (the whole new dir). The three `.bak` files and `index-hover.html`/`index-open.html` must now be **absent** from the output (ignored). If any other unexpected file appears, stop and investigate before continuing — do not blanket-stage.

- [ ] **Step 4: Stage the real files**

Run:
```bash
git add .gitignore build-cases.js case-autonomy.html case-design-system.html \
  case-driveradar.html case-funnel.html case-platform.html \
  css/case.css css/main.css css/preview.css index.html img/
```

- [ ] **Step 5: Verify staged content**

Run: `git status --short`
Expected: every remaining line starts with `M ` or `A ` (staged). No `??` lines remain.

- [ ] **Step 6: Commit**

```bash
git commit -m "$(cat <<'EOF'
chore: sync go-live working tree before deploy setup

Stage real site assets (decks, portraits, case thumbnails, preview
styles) accumulated during the content pass; ignore local dev/backup
artifacts (.bak files, hover/open A-B experiment copies) that were
never meant to ship.
EOF
)"
```

- [ ] **Step 7: Verify clean tree**

Run: `git status --short`
Expected: empty output.

---

### Task 2: Fast-forward `main` to `go-live`

**Files:** none (branch pointer move only).

**Interfaces:** Consumes: Task 1's commit (must exist on `go-live` first).

- [ ] **Step 1: Confirm `main` has no unique commits**

Run: `git log go-live..main --oneline`
Expected: empty output (confirms `main` is a strict ancestor of `go-live`, so a fast-forward is safe and lossless).

- [ ] **Step 2: Switch to `main` and fast-forward**

```bash
git checkout main
git merge go-live --ff-only
```
Expected: `Fast-forward` message, no conflicts. If git refuses (non-fast-forward), STOP — this means `main` diverged since the check in Step 1; do not force-merge, investigate first.

- [ ] **Step 3: Verify**

Run: `git log --oneline -1`
Expected: shows the `chore: sync go-live working tree before deploy setup` commit as tip of `main`.

---

### Task 3: Create GitHub repo, push, enable Pages

**Files:** none.

**Interfaces:** Consumes: `main` branch from Task 2, containing the full working site.

- [ ] **Step 1 (manual, owner does this in a browser):** Go to github.com → New repository → name `magdesigns` → **Public** → do **not** initialize with README/.gitignore/license (avoids an unrelated initial commit that would conflict with the push below) → Create repository.

- [ ] **Step 2: Add the remote**

```bash
git remote add origin https://github.com/MohamedAliGH/magdesigns.git
```

- [ ] **Step 3: Push `main`**

```bash
git push -u origin main
```
Expected: push succeeds, output includes `branch 'main' set up to track 'origin/main'`.

- [ ] **Step 4 (manual, owner does this in a browser):** On the new repo's GitHub page → Settings → Pages → under "Build and deployment", Source = "Deploy from a branch" → Branch = `main`, folder = `/ (root)` → Save.

- [ ] **Step 5: Verify Pages is live**

Run (retry with a short wait if it 404s — first Pages build can take a minute or two):
```bash
sleep 60 && curl -s -o /dev/null -w "%{http_code}\n" https://MohamedAliGH.github.io/magdesigns/
```
Expected: `200`

---

### Task 4: Export easyCredit V4 slides from Figma

**Files:**
- Create: `img/decks/easycredit/01-cover.png`, `02-problem.png`, `03-reframe.png`, `04-evidence.png`, `05-options.png`, `06-solution.png`, `07-tradeoff.png`, `08-outcome.png`
- Modify: `img/decks/slides-manifest.json`

**Interfaces:**
- Consumes: `main` branch (post-Task 3), Figma MCP tools `mcp__figma__get_screenshot` (params: `fileKey`, `nodeId`, `maxDimension`).
- Produces: 8 PNGs at the paths above + a manifest `easycredit` block, consumed by Task 5's `slides` array.

Node-ID → file mapping (confirmed via `get_metadata` on `ms6a8Br6n28g6BJDZBdyIH` / `992:2`):

| Node | Slide name | File |
|---|---|---|
| `992:3` | 01 — Cover | `img/decks/easycredit/01-cover.png` |
| `992:17` | 02 — The problem | `img/decks/easycredit/02-problem.png` |
| `992:58` | 03 — The reframe | `img/decks/easycredit/03-reframe.png` |
| `992:65` | 04 — Evidence | `img/decks/easycredit/04-evidence.png` |
| `992:122` | 05 — Options explored | `img/decks/easycredit/05-options.png` |
| `992:148` | 06 — The solution | `img/decks/easycredit/06-solution.png` |
| `992:183` | 07 — The trade-off | `img/decks/easycredit/07-tradeoff.png` |
| `992:198` | 08 — Outcome | `img/decks/easycredit/08-outcome.png` |

- [ ] **Step 1: Branch off `main`**

```bash
git checkout main
git checkout -b case/easycredit-v4
mkdir -p img/decks/easycredit
```

- [ ] **Step 2: Export each of the 8 slides**

For each row in the table above, call the MCP tool:

```
mcp__figma__get_screenshot(
  fileKey: "ms6a8Br6n28g6BJDZBdyIH",
  nodeId: "<Node from table>",
  maxDimension: 2400
)
```

This returns a short-lived URL + a ready-to-run `curl` command. Run that `curl` command, redirecting output to the matching file path from the table (e.g. `curl -s "<returned-url>" -o img/decks/easycredit/01-cover.png`). Repeat for all 8 nodes.

- [ ] **Step 3: Verify all 8 files downloaded correctly**

```bash
ls -la img/decks/easycredit/
file img/decks/easycredit/*.png
```
Expected: 8 files listed; `file` reports `PNG image data` for every one (not `HTML document` or `0 bytes`, which would mean the curl grabbed an error page instead of the image).

- [ ] **Step 4: Add the `easycredit` block to the manifest**

Read the current `img/decks/slides-manifest.json`, then add a sibling entry to `"decks"` next to `"driveradar"`:

```json
"easycredit": {
  "section": "992:2",
  "slides": [
    { "node": "992:3",   "file": "img/decks/easycredit/01-cover.png" },
    { "node": "992:17",  "file": "img/decks/easycredit/02-problem.png" },
    { "node": "992:58",  "file": "img/decks/easycredit/03-reframe.png" },
    { "node": "992:65",  "file": "img/decks/easycredit/04-evidence.png" },
    { "node": "992:122", "file": "img/decks/easycredit/05-options.png" },
    { "node": "992:148", "file": "img/decks/easycredit/06-solution.png" },
    { "node": "992:183", "file": "img/decks/easycredit/07-tradeoff.png" },
    { "node": "992:198", "file": "img/decks/easycredit/08-outcome.png" }
  ]
}
```

- [ ] **Step 5: Verify the manifest is valid JSON**

```bash
python3 -c "import json; json.load(open('img/decks/slides-manifest.json'))" && echo OK
```
Expected: `OK`

- [ ] **Step 6: Commit**

```bash
git add img/decks/easycredit img/decks/slides-manifest.json
git commit -m "feat: export easyCredit V4 deck slides from Figma"
```

---

### Task 5: Wire easyCredit slides into `case-funnel`, fix Role, regenerate

**Files:**
- Modify: `build-cases.js:191` (Role meta), `build-cases.js` (add `slides` array to the `case-funnel` CASES entry, after `meta:` at line 191, before `sections: {` at line 192)
- Generated (by `node build-cases.js`, do not hand-edit): `case-funnel.html`, and the other 4 `case-*.html` files (the build script regenerates all of them together)

**Interfaces:**
- Consumes: Task 4's 8 files in `img/decks/easycredit/`. Consumes the existing `slidesReader(c)` renderer at `build-cases.js:160-166`, which activates whenever `c.slides` is a non-empty array (checked at `build-cases.js:402`, `hasSlides = Array.isArray(c.slides) && c.slides.length > 0`) — this is the same mechanism `case-driveradar`'s entry already uses (`build-cases.js:336-343`).
- Produces: `case-funnel.html` regenerated with the real deck; nothing downstream depends on this beyond the deployed page itself.

Each slide object shape (matches the existing `case-driveradar` entry exactly): `{ src: string, label: string, alt: string }`.

- [ ] **Step 1: Fix the Role meta**

In `build-cases.js`, change line 191 from:
```js
meta: [['Role', 'Sr. Product Designer'], ['Client', 'easyCredit'], ['Domain', 'Fintech · CRO'], ['Type', 'Shipped']],
```
to:
```js
meta: [['Role', 'Product Designer'], ['Client', 'easyCredit'], ['Domain', 'Fintech · CRO'], ['Type', 'Shipped']],
```

- [ ] **Step 2: View the exported `02-problem.png` to write its alt text**

Open `img/decks/easycredit/02-problem.png` (its Figma metadata came back with no readable text layers, unlike the other 7 slides — so its content must be read from the rendered image, not guessed). Write one factual sentence describing what's actually visible, in the same style as the other 7 alt strings in Step 3 below (concise, drawn only from what's on the slide, no invented numbers).

- [ ] **Step 3: Add the `slides` array**

In `build-cases.js`, immediately after line 191 (the `meta:` line just edited) and before line 192 (`sections: {`), insert:

```js
    slides: [
      {src: 'img/decks/easycredit/01-cover.png',    label: 'Cover',            alt: 'easyCredit case cover — reducing abandonment in a high-stakes credit funnel, without increasing perceived effort'},
      {src: 'img/decks/easycredit/02-problem.png',  label: 'The problem',      alt: '<the sentence written in Step 2>'},
      {src: 'img/decks/easycredit/03-reframe.png',  label: 'The reframe',      alt: 'The reframe — not a styling problem, a pacing problem: remove the friction that can be removed, disclose the friction that can\'t progressively'},
      {src: 'img/decks/easycredit/04-evidence.png', label: 'Evidence',         alt: 'Evidence — two friction points from the carousel entry point, tracked at the pay-slip upload step and the IDnow legitimation hand-off'},
      {src: 'img/decks/easycredit/05-options.png',  label: 'Options explored', alt: 'Three directions explored — enhanced carousel and full-screen stepper discarded, vertical disclosure cards shipped'},
      {src: 'img/decks/easycredit/06-solution.png', label: 'The solution',     alt: 'The solution — vertical disclosure cards on an existing design-system component, reusing the IBAN income pull to remove Step 1 friction'},
      {src: 'img/decks/easycredit/07-tradeoff.png', label: 'The trade-off',    alt: 'The trade-off — real friction removed by reuse at Step 1, inherent KYC friction at Step 4 paced through progressive disclosure instead of shown up front'},
      {src: 'img/decks/easycredit/08-outcome.png',  label: 'Outcome',          alt: 'Outcome — the disclosure-card flow shipped with no before/after conversion figure yet; the stage-completion experiment proposed next'},
    ],
```

Replace `<the sentence written in Step 2>` with the actual sentence from Step 2 before saving.

- [ ] **Step 4: Regenerate the case pages**

```bash
node build-cases.js
```
Expected: exits 0, no errors printed. (If the script logs progress per file, confirm `case-funnel.html` is listed.)

- [ ] **Step 5: Verify the generated page references all 8 images**

```bash
grep -c "img/decks/easycredit/" case-funnel.html
```
Expected: `8`

- [ ] **Step 6: Serve locally and manually verify**

```bash
python3 -m http.server 4180 &
```
Open `http://localhost:4180/case-funnel.html` in a browser. Scroll through all 8 slides; confirm each image loads (no broken-image icons) and matches the corresponding Figma slide. Confirm the page's Role/meta line now reads "Product Designer" (not "Sr. Product Designer"). Then stop the server:
```bash
kill %1
```

- [ ] **Step 7: Commit**

```bash
git add build-cases.js case-funnel.html case-autonomy.html case-design-system.html case-driveradar.html case-platform.html
git commit -m "feat: wire easyCredit V4 deck into case-funnel, align Role meta with deck"
```

(All 5 `case-*.html` files are staged because `build-cases.js` regenerates them together and bumps their shared `?v=` cache-bust hash — only `case-funnel.html`'s content meaningfully changed.)

---

### Task 6: Merge to `main`, push, tag, verify live

**Files:** none (merge + push only).

**Interfaces:** Consumes: `case/easycredit-v4` branch from Task 5, verified locally.

- [ ] **Step 1: Merge**

```bash
git checkout main
git merge case/easycredit-v4 --no-ff -m "merge: ship easyCredit V4 case study"
```
Expected: merge succeeds (no conflicts expected — `main` has not diverged since Task 4 branched off it).

- [ ] **Step 2: Push and tag**

```bash
git push origin main
git tag v1.0-easycredit
git push origin v1.0-easycredit
```

- [ ] **Step 3: Verify the live site**

```bash
sleep 60 && curl -s https://MohamedAliGH.github.io/magdesigns/case-funnel.html | grep -c "img/decks/easycredit/"
```
Expected: `8`

- [ ] **Step 4: Manual final check (owner)**

Open `https://MohamedAliGH.github.io/magdesigns/case-funnel.html` and `https://MohamedAliGH.github.io/magdesigns/` in a browser. Confirm: the funnel case shows the real 8-slide deck; the homepage's easyCredit card links to it correctly; no other case page regressed.
