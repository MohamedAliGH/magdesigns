# Case-study artboard templates — Swiss-Grid

1440-wide artboard templates that match the Swiss-Grid portfolio, for building
case studies. Two sets:

| File | What it is |
|---|---|
| `case-deck.html` | **7-frame case deck** — Cover → Context → Research → Approach → The design → Outcome → Reflection. A ready-to-fill story arc that mirrors the live case pages (`../case-*.html`). |
| `layout-masters.html` | **7 reusable layout masters** — Cover, Section divider, Text + image, Full-bleed, Three columns, Metrics, Pull quote. |

Both reuse the portfolio tokens (`../css/main.css`, `../css/case.css` — the same
`.board`, `.nums`, `.cnext`, `.btn`, `.ph` building blocks the live pages use) plus
`templates.css` (the drafting canvas, artboard surfaces and print rules). All copy
is placeholder — the dashed `edit` chips and `Drop artwork · placeholder` frames
mark what to replace.

## Deliverables produced
- **PDF:** `case-deck-template.pdf`, `layout-masters-template.pdf` — one artboard per page (7 pages each).
- **Figma:** captured into the section **`Claude_swiss-case-templates`** on the
  *Casestudies template/01* page, beside the Noir-Glass section, as fully editable
  frames with real text + the actual web fonts and clean nested auto-layout (not
  flattened images): <https://www.figma.com/design/vNmDz965mFosjrfE3wDEYk?node-id=1455-2>

## Editing
Content is generated from `build-templates.js` (single source of truth). Edit the
`deckFrames` / `masterFrames` data there, then regenerate:

```bash
node templates/build-templates.js     # run from the 03-Swiss-Grid directory
```

## Re-export PDF (Chrome headless)
```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="$(pwd)/templates"
"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --user-data-dir="$(mktemp -d)" --virtual-time-budget=12000 \
  --print-to-pdf="$DIR/case-deck-template.pdf" "file://$DIR/case-deck.html"
```
Run one render at a time, each with its own fresh `--user-data-dir`. Repeat for
`layout-masters.html`.

Notes baked into the templates so the PDF stays "one artboard per page":
- Each file injects its own `@page` size in `<head>` — `deckPageHeight` /
  `masterPageHeight` in `build-templates.js` (page width is the 1440px artboard).
  If you add taller content, bump that value until the PDF page count is 7 again.
- `templates.css` re-asserts the desktop board grid inside `@media print`, because
  Chrome's print pipeline evaluates `max-width` media against a narrow viewport and
  would otherwise trip `case.css`'s responsive breakpoints (reflowing the artboards
  taller). The artboards are a fixed 1440px, so they always use the desktop grid.

## Re-push to Figma
The pages include the Figma capture script (inert unless opened with a
`#figmacapture=…` hash). To re-capture after edits, in Claude Code:
*"capture templates/case-deck.html into my Figma file"* — or use the capture
toolbar that appears in the browser after the first capture.

Manual flow:
1. Serve the site: `python3 -m http.server 8753` (from `03-Swiss-Grid`).
2. Capture at a **≥1440px viewport** (e.g. headless Chrome `--window-size=1600,1200`,
   or a wide browser window) so the fixed-width artboards don't hit `case.css`'s
   responsive breakpoints during capture.
3. Open `http://localhost:8753/templates/<page>.html#figmacapture=<id>&figmaendpoint=<…>&figmadelay=3500`
   (the `figmadelay=3500` lets the Google web fonts load before the capture).
