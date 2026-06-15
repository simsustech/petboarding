# sigmap
- Only use SigMap v7 or newer. Versions older than v7 should not be used. Confidence: 0.85
- Let SigMap generate its own config via `npx sigmap --init` instead of manually writing gen-context.config.json. Confidence: 0.70
- Enable monorepo mode in SigMap config (`"monorepo": true`). Confidence: 0.65
- Keep SigMap context up to date: either launch `sigmap --watch` in a subprocess (preferred) or run `npx sigmap` manually after changes. Confidence: 0.70
- Gitignore SigMap context output files (.contextignore, .github/context*.md) — they should be regenerated at the start of each session. Track gen-context.config.json (the SigMap config) in version control. Confidence: 0.85
- Gitignore only sub-package AGENTS.md files (e.g., `packages/**/AGENTS.md`), but keep the root AGENTS.md tracked — the root file is a committed project file with instructions. Confidence: 0.80
