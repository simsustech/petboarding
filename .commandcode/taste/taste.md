# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# env
- Validate mandatory environment variables at startup and throw descriptive errors when they are undefined. Confidence: 0.75
- Use env.read() from @vitrify/tools/env instead of raw process.env, since process.env may not be available in ESM contexts. Confidence: 0.85
- Use VITE_LANG (e.g. "en-US") for locale instead of LANG (e.g. "en_US.UTF-8") to avoid platform-dependent format issues. Confidence: 0.70
- When calling read() from @vitrify/tools/env, pass the unprefixed key (e.g. read('LANG')) so it can auto-fallback to the VITE_-prefixed version (VITE_LANG). Passing read('VITE_LANG') causes a nonsensical VITE_VITE_LANG fallback. Confidence: 0.70
- NTFY_HOST should be set without the https:// protocol prefix (e.g., "ntfy.example.com"), since the code constructs the full URL with `https://${NTFY_HOST}`. Confidence: 0.65

# code-style
- Use a config/ directory (not env/) for configuration module files like env.ts and postgres.ts. Confidence: 0.65

# git
- When staging partial changes from files with mixed concerns, use git add -p to selectively stage only relevant hunks rather than staging entire files. Confidence: 0.70
- When using git add -p, try the s (split) command to break hunks into smaller pieces before resorting to manual file editing workarounds. Confidence: 0.70
- After staging changes with git add -p, verify that all related dependencies (e.g. imports for newly added functions) are also staged and not missed. Confidence: 0.70

# docker
See [docker/taste.md](docker/taste.md)
# workflow
See [workflow/taste.md](workflow/taste.md)
# documentation
- Keep AGENTS.md compact and clean — avoid verbose examples, long file lists, or feature-specific details that will quickly become stale. Keep strategies concise and essential. Confidence: 0.70
- Maintain a human-readable CHANGELOG.md as the main changelog file for the repository, separate from automated change-tracking. Confidence: 0.85

# security
- Never expose environment variable values in plain text in conversation or committed files. Environment variables exist precisely to keep secrets out of plain text. This includes ALL env var values, not just tokens/passwords. Confidence: 0.90
- When documenting environment variables (e.g., in AGENTS.md), use generic placeholders like `ntfy.example.com` or `<token>` instead of the actual env var values as examples. Even seemingly non-sensitive values like hostnames should not be committed. Confidence: 0.80

# workflow
- When a generated script (.sh file) exists in the project for a task, use that script instead of manually re-crafting the equivalent commands. The script is the single source of truth. Confidence: 0.70
- For SigMap, use the per-module strategy (not full or hot-cold) to split context across module-specific files. Confidence: 0.75
- For SigMap, use standard config without any adapter (do not use --adapter codex or any other adapter). Confidence: 0.80

# vue
- Avoid using getCurrentInstance() in application code — it is an internal API intended for official Vue libraries, not userland code. It was mistakenly documented in early v3 docs but is no longer considered a public API. Confidence: 0.85
- When a child component needs to detect whether a parent is listening to an event, pass the handler function as a prop (e.g., `:on-open-customer="openCustomer"`) and check `!!props.onOpenCustomer` in the child, rather than using boolean flags or getCurrentInstance(). Confidence: 0.70

# e2e-testing
- When e2e tests need bulk data (e.g., for pagination testing), seed the data programmatically beforehand (via API calls or DB seeding) rather than creating it through repeated browser form interactions. Confidence: 0.70
- Vacation date ranges cannot overlap — each vacation must have a unique, non-overlapping date range. When seeding multiple vacations, ensure sequential non-overlapping date ranges. Confidence: 0.75

# dates
- Use date-fns for generating date sequences and intervals instead of manual string arithmetic. Confidence: 0.80

# sigmap
See [sigmap/taste.md](sigmap/taste.md)
