# Changes: verify 2026-10-05 handoffs — commit uncommitted work + fix md2 field padding (2026-10-05)

Verification pass over the 8 handoffs in `~/.pi/plans/2026-10-05/`, then committing the
work they left uncommitted and one spec-driven fix found while running the harness.

## Verification result

- **Conflicts:** none. No unmerged paths or conflict markers in any repo; `git diff --check`
  clean; ADR numbers unique (0001–0014).
- The handoffs' blocker (repo-wide `oxfmt --check` failing on the foreign ADR 0010) was
  already cleared.
- **petboarding e2e** (reset + owned stack, linked local preset): 104 passed / 4 skipped / 0 failed.
- **preset unit:** 364/364. **quasar-components e2e:** 6/6.
- **harness full suite:** 636 passed / 5 failed — all 5 pre-existing (`class-coverage` 2 known
  classes; q-btn screenshot drifts). The md2 q-select arrow tests now pass (see fix below).

## New commits

### `unocss-preset-quasar` (branch main)
| Commit | Description |
|--------|-------------|
| `a271681` | fix(preset): render QCheckbox's check, state layer and icon mode correctly |
| `d9d78ae` | fix(preset): stop reserving the select arrow's clearance twice |
| `540d6dd` | fix(preset): give the standard field the underline container's corners |
| `143a2ee` | fix(preset): stop hiding placeholders unconditionally, emit the q-placeholder restore |
| `3af72d1` | fix(preset): pad the standard and outlined field controls 12px in every style |

### `quasar-testing-harness` (branch rules)
| Commit | Description |
|--------|-------------|
| `029946d4` | chore(harness): bump dev dependencies and refresh the minimumReleaseAge list |
| `61a50f38` | test(harness): add the date-input placeholder fixture and guard |

### `quasar-components` (branch main)
| Commit | Description |
|--------|-------------|
| `bd6b1c07` | fix(components): keep DateInput segment placeholders visible under preset CSS |

Each publishable change carries its changeset in the same commit (`pnpm changeset status` correct
in preset + components; harness is not a changesets repo). Left untracked on purpose: the harness
`tmp-*.mjs` / `pb-open.mjs` throwaway probes.

## Modified files (this verification session's own edits)
| File | Change |
|------|--------|
| `unocss-preset-quasar/packages/preset/src/components/field/rules.ts` | `--standard` and `--outlined .q-field__control` `padding-inline`: `var(--q-space-md)` → `var(--q-field-padding-x)` (12px in md2/md3, 0 unstyled) |
| `unocss-preset-quasar/.changeset/standard-field-inline-padding.md` | new changeset (patch) |

## Why the md2 fix
The reference (`specs/reference/raw/reference-bundle.css.txt`) states
`.q-field--standard .q-field__control { padding-inline: 12px }` and the same for `--outlined`,
and its `quasar-style-md2` block carries no field rule (so md2 inherits 12px). The preset used
the general spacing scale `var(--q-space-md)` — 12px in md3 but **8px in md2** — so a trailing
marginal (the q-select dropdown arrow) sat 8px from the edge instead of 12px. The guard
`quasar-testing-harness/tests/preset-fixes.spec.ts` (asserting 12px) was correct; the preset was
wrong. Filled keeps `--q-space-lg` (16px), which already matches the reference.
