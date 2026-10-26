# Changes: picker polish pass (2026-10-08)

Final pass on the critique follow-up (after the document pass `f47bdf511`). The
critique's backlog had already been closed by the tool — `critique-storage latest`
exits 2 for this target, meaning the snapshot's fingerprint no longer matches the
heavily-revised component, so its backlog is recorded closed. This pass therefore
followed the polish reference on its own terms: evidence from using the feature,
triage, then a clean diff.

## Evidence (walked the path, desktop + mobile, mouse + keyboard)

| Check | Result |
|---|---|
| Page hint | `Click on a pet, then choose a kennel or the waiting list.` |
| Dialog title | `Place name3` (names the subject) |
| Level 1 | `Waiting list 0` · `Main building 10` |
| Level 2 | summary `9 of 10 free`; legend present; rows `1 Free` · `2 3 · Fair name4 las… 2x` · `3 Free` |
| Hover on a row | `rgba(0,0,0,0)` (neutral row — colour lives on the chip, as designed) |
| **Keyboard focus ring** | `pickerWaitlist` and `pickerBuilding1` both `:focus-visible` with `solid 2px rgb(0,105,109)` = `#00696d`, the MD3 **primary** token ✓ |
| Back / Escape | returns to level 1 / closes ✓ |
| Mobile 375 | `scrollWidth === innerWidth === 375`, rows 56px ✓ |
| Console errors | none ✓ |

**Correction to an earlier claim.** The audit pass recorded the focus-ring finding as fixed while its measurement had actually landed on the dialog's ✕ `q-btn`, not on a row. This pass measured it properly with real key presses: the ring **does** apply to rows (`solid 2px` primary). Programmatic `.focus()` returns `solid 0px` because it correctly does *not* match `:focus-visible` — an artifact of the measurement method, not a defect.

## Triage outcome

1. **Broken/blocked/inaccessible** — none found. The tab-order step onto the page behind the dialog (`desktop`) is the documented shared-`ResponsiveDialog` behaviour, awaiting an upstream fix per ADR 002.
2. **Missing states** — none: success/error/undo, empty-building, escape/overlay/back all verified in the harden and audit passes.
3. **Flow, hierarchy, drift** — consistent with the neighbouring surfaces; the rating ramp is now a documented token family (document pass).
4. **Visual/motion inconsistencies** — none found in the walk.
5. **Code and asset cleanup** — done below.

## Cleanup (source diff)

- Verified every symbol added across these passes is referenced (`tintForRating`, `ratingBand`, `ratingOf`, `occupantsOf`, `visibleOccupants`, `hiddenOccupantCount`, `moreOccupantsText`, `freeSummaryText`, `legendText`, `kennelAriaLabel`, `asElement`, `isCurrent`, `waitingCount`, `selectedBuilding`, `backRef`, `firstRowRef`; page: `assigning`, `closePickerAndNotify`, `pickerTitle`, `onSelectKennel`, `openPicker`) — no dead code left behind.
- Removed the reverted focus-on-open experiment from the working tree (recorded in `2026-10-08-kennel-picker-design-tokens.md`).
- No temporary artifacts inside the repo; `/tmp` probe scripts are outside it.

## Verification
- Gates: `pnpm run lint`=0 · `pnpm run format:check`=0 · `PI_RTK_BYPASS=1 pnpm run build`=0 · full `pnpm run test:e2e` = **119 passed / 3 skipped / 0 failed**.
- **Flake note (verified, not assumed)**: a first full run showed 3 failures (`openingtimes` delete, `palette` dark contrast, `mobile-shell` width). None of the three specs reference the picker, `PetChip`, or `kennelLayout`; all 18 of their tests passed in isolation (1.1m), and the next full run on a fresh stack was green. Classified as load/ordering flakes in a 12.5-minute serial run on a contended box, not regressions.

Commit: see `git log -1` (`feat/kennel-layout-picker` branch).
