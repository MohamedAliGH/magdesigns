# Portfolio Deploy + easyCredit Case Study — Design Spec

**Date:** 2026-07-13
**Owner:** Mohamed Ali Ghouila
**Project:** `~/Desktop/Claude_Design-Portfolio/03-Swiss-Grid`
**Goal:** Deploy the portfolio publicly on GitHub Pages and ship the first real case study (easyCredit, Figma deck V4 "real story") as the live slide deck on `case-funnel.html`.

**Supersedes:** the hosting choice (Netlify) and case-page content format (native HTML/CSS diagrams) in `2026-06-29-portfolio-go-live-design.md`. Case pages pivoted since then to **vertical slide-deck shells** fed by Figma exports (see [[project-design-portfolio]]); this spec reflects that current direction. Everything else in the 06-29 spec not touched here (site structure, design principles) still stands.

---

## 1. Decisions locked (from brainstorming)

| Decision | Choice |
|---|---|
| Hosting | **GitHub Pages**, deployed from `main` branch, repo root |
| Repo name | **`magdesign-portfolio`** → live at `https://mohamedalighouila.github.io/magdesign-portfolio/` (unrelated to the stale local scaffold dir of the same name — that dir is not this repo) |
| Repo visibility | **Public** — free GitHub Pages requires a public repo (Pro/Team needed for private-repo Pages, owner does not have it) |
| Case-study versioning | **Branch per case study** (`case/<name>`) — build + verify on branch, merge to `main` to go live |
| First case study | **easyCredit, Figma deck V4** ("real story" / progressive-disclosure thesis, `ms6a8Br6n28g6BJDZBdyIH` §992:2). Pending FILL items already resolved by owner. |
| Slide export method | **Figma MCP** (`get_metadata` + `get_screenshot`) run by Claude — no manual export needed from owner |

---

## 2. Case mapping

easyCredit maps to the existing `case-funnel.html` slot (CASES entry in `build-cases.js`, currently placeholder/hand-written steps). V4 deck slides become that page's real content, same mechanism DriveRadar already uses (`img/decks/driveradar/` + `slides-manifest.json`).

One inconsistency to resolve during wiring: `build-cases.js` meta line lists Role as **"Sr. Product Designer"**; the V4 cover chip says **"Product Designer"**. Reconcile to one before publish.

---

## 3. Architecture

### 3.1 Local slide storage
```
03-Swiss-Grid/img/decks/
├─ slides-manifest.json         # add "easycredit" block
├─ driveradar/                  # existing, unchanged
│  └─ 01-cover.png … 06-outcome.png
└─ easycredit/                  # NEW
   └─ 01-cover.png … NN-outcome.png   (count = actual V4 slide count in §992:2)
```

`slides-manifest.json` gains an `easycredit` entry mirroring the `driveradar` shape: `section` node ID, ordered `slides[]` of `{ node, file }`. Same `fileKey` (`ms6a8Br6n28g6BJDZBdyIH`) already recorded.

### 3.2 Export flow (Claude-run, via Figma MCP)
1. `get_metadata` on §992:2 → enumerate V4 slide node IDs in order.
2. `get_screenshot` per node, `maxDimension: 2400`.
3. Save PNGs into `img/decks/easycredit/` with numbered, labeled filenames (`01-cover.png`, `02-problem.png`, …).
4. Append the `easycredit` block to `slides-manifest.json`.

### 3.3 Wiring into the site
- Add `slides: [...]` array to the `case-funnel` CASES entry in `build-cases.js` (one `{ file, label }` per exported PNG; `label` feeds the floating TOC), mirroring how `case-driveradar` is wired.
- Once `slides` is present, the page renders the deck instead of the placeholder/hand-written steps — the old prose (e.g. the `12%` stat block) stops rendering. No manual deletion needed; the template branches on presence of `c.slides`.
- Fix the Role meta inconsistency (§2).
- Run `node build-cases.js` → regenerates all 5 case pages + bumps the `?v=hash` cache-bust.
- Serve locally (`python3 -m http.server 4180`) and click through the funnel case page before merging.

---

## 4. Git / deploy workflow

```
main                       ← always mirrors the live site; GitHub Pages serves from here
└─ case/easycredit-v4      ← this case: export slides, wire page, verify locally
      ↓ merge to main when verified
main redeploys automatically (GitHub Pages rebuilds on push to the Pages source branch)
```

**Sequence:**
1. Commit current uncommitted work on `go-live` (edits only — no reset/worktree ops, per existing safety rule) before branching further, so nothing in flight is lost.
2. Create GitHub repo `magdesign-portfolio` (public), add as `origin`.
3. Push `main`. Repo Settings → Pages → source = `main` / root. Site live at `https://mohamedalighouila.github.io/magdesign-portfolio/`.
4. Branch `case/easycredit-v4` off `main`.
5. Do the export + wiring (§3) on that branch. Verify locally.
6. Merge `case/easycredit-v4` → `main` → push → Pages auto-redeploys.
7. Optional: tag the merge commit (e.g. `v1.0-easycredit`) as a named rollback point.

**Future case studies** repeat steps 4–7 with a new branch name per case. Site-wide changes (CSS, homepage copy) get their own `chore/<what>` branch, same merge-to-main-deploys flow.

**Rollback:** `git revert` the merge commit, or reset the Pages-serving branch to an earlier tag.

---

## 5. Out of scope (this pass)

- Custom domain (can attach a `CNAME` to GitHub Pages later, zero rebuild).
- Exporting/wiring any deck other than easyCredit V4.
- Resolving the V3-vs-V4 "which is canonical" question beyond this decision (V4 ships; V3 stays in Figma for comparison, untouched).
- CI/build automation beyond GitHub Pages' built-in redeploy-on-push.

---

## 6. Risks

- **Repo is public** → source (HTML/CSS/JS/images) is visible to anyone. No secrets live in this repo; acceptable for a portfolio.
- **Slide export drift** → if the Figma deck changes after export, PNGs go stale silently. Mitigation: `slides-manifest.json`'s own note documents the re-export procedure (re-run `get_screenshot` per node, overwrite the file).
- **Role-line inconsistency** (§2) ships if missed — flagged explicitly here so the wiring step catches it.
