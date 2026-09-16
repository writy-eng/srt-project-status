# สถานะโครงการถไฟ

Public editorial dashboard for SRT double-track project status.

The poster overlays live monthly / weekly percentages on the printed template. Progress is pulled from the bundled sheet snapshot (`src/data/progress.json`) and can be refreshed with **ดึงชีต**.

## Stack

- TanStack Start + React 19 + Vite
- Tailwind v4
- Zustand
- `xlsx` for sheet parsing

## Run

```bash
npm install
npm run dev
```

App: `http://localhost:8080`

```bash
npm run build
```

## Notes

- Poster art and icons live in `public/` (`poster-base.jpg`, `icon-crane.png`, `icon-train.png`, `srt-logo.png`).
- Overlay positions are pixel-locked to the current poster template.
- The Dropbox sheet URL is used only by the server-side pull helper. It is not linked in the UI.
