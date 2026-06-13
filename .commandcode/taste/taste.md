# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# env
- Validate mandatory environment variables at startup and throw descriptive errors when they are undefined. Confidence: 0.75
- Use env.read() from @vitrify/tools/env instead of raw process.env, since process.env may not be available in ESM contexts. Confidence: 0.85
- Use VITE_LANG (e.g. "en-US") for locale instead of LANG (e.g. "en_US.UTF-8") to avoid platform-dependent format issues. Confidence: 0.70
- When calling read() from @vitrify/tools/env, pass the unprefixed key (e.g. read('LANG')) so it can auto-fallback to the VITE_-prefixed version (VITE_LANG). Passing read('VITE_LANG') causes a nonsensical VITE_VITE_LANG fallback. Confidence: 0.70

# code-style
- Use a config/ directory (not env/) for configuration module files like env.ts and postgres.ts. Confidence: 0.65

# git
- When staging partial changes from files with mixed concerns, use git add -p to selectively stage only relevant hunks rather than staging entire files. Confidence: 0.70
- When using git add -p, try the s (split) command to break hunks into smaller pieces before resorting to manual file editing workarounds. Confidence: 0.70
- After staging changes with git add -p, verify that all related dependencies (e.g. imports for newly added functions) are also staged and not missed. Confidence: 0.70

# docker
- When using docker compose up, avoid --build (it can use stale cache). Instead, precede with "docker compose -f [file] build --no-cache" and run the up command without --build. Confidence: 0.60

# workflow
- When making file changes, store a recap of changes (file location, line numbers, and change description) in a temporary tracking file to answer questions about changes without rescanning everything. Confidence: 0.85

