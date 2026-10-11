# Gazi Md Emon — Video Editor Portfolio (3D Gallery)

Vite + React + TypeScript + Three.js (React Three Fiber) + Tailwind + Framer Motion.

## Run
    npm install
    npm run dev

## Build / deploy
    npm run build
    npm run preview
- Netlify: build `npm run build`, publish `dist`
- Vercel: auto-detected (vercel.json handles SPA routing)

## Your media = folders (no code, no URL lists)
- Portrait photo:  `src/media/portrait.jpg` (jpg/png/webp)
- Hero showreel:   `src/media/showreel.mp4`
- Videos gallery:  `src/media/videos/*.mp4`
- Stills gallery:  `src/media/images/*.jpg`
- Before/After:    `src/media/beforeafter/<name>/before.jpg + after.jpg`

Naming: `01-brand-film.mp4` → ordered first, titled "Brand Film".
The number prefix controls order. Titles/descriptions are optional —
match the `file` name in `src/content.json` galleries to override.
Video thumbnails are captured automatically from the first frame.

Use .mp4 (H.264). Export web-sized files, e.g.:
    ffmpeg -i raw.mp4 -vcodec libx264 -crf 26 -vf scale=-2:720 -movflags +faststart out.mp4

Text, contact info, bio and pricing all live in `src/content.json`.
Dev server picks up new files instantly; run `npm run build` before deploying.
Optional: drop a 1200x630 `public/og-image.jpg` for social previews.
