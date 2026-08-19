---
'@petboarding/app': patch
---

fix: restore clickable Quasar dropdown options inside dialogs

Quasar's QDialog menu portal uses the `all-pointer-events` class, but the CSS rule was never generated because `@unocss/preset-wind4`'s `all` scope variant consumes the `all-` prefix, so the preset rule never matched. This made select dropdown options (e.g. Gender) unclickable — a `q-field__bottom` element intercepted pointer events.

Fixed by emitting `.all-pointer-events { pointer-events: all !important }` as a preflight in `unocss-preset-quasar` (bypasses token matching) and linking the local preset into the build.

Also ports slimfact's local-package linking strategy into the Dockerfile (copy local packages into the workspace glob + inject `link:` overrides + `--no-frozen-lockfile`) so the app build resolves the linked `unocss-preset-quasar` instead of the published registry version, and aligns unocss to 66.8.0.
