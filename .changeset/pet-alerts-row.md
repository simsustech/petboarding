---
'@petboarding/app': patch
'@petboarding/api': patch
---

Pet-card alerts: the window is on screen, and each control acts on its own alert.

- An alert is now a row — status tile, condition, window — instead of a strip of chips. A closed window renders as the locale's own range (`Jan 5 – 12, 2024` / `5–12 jan 2024`), an open end reads `Since`/`Until`, and an alert with no window reads `Ongoing`. The dates were previously readable only inside the delete confirmation, so an expired alert looked live. The window wraps rather than eliding (the app's own wrap rule for a dated label in a dense row).
- The delete control is no longer a 48×48 button inside a 16px chip. It was taller than the chip it sat in, so consecutive alerts' buttons overlapped and clicking the × painted on "Aggressive" opened **"Diabetic"**'s confirmation. Delete is now a labelled row action, and the condition itself is the edit affordance — a real button with an `aria-label`, which also wires the previously unused `employee.updateAlert` mutation so a window can be corrected instead of deleted and re-created.
- The status tile is a 40% tonal tint of the condition's hue under an ink glyph, not a solid 400-shade chip under white text. White measured 1.53:1 on yellow and 2.77:1 on red; a *solid* fill under ink measures 6.19:1 in light but **2.14:1 in dark**, because the fill is fixed while the ink token flips with the scheme. The tint lets the scheme's own surface carry it: 10.7:1 light, 6.6:1 dark.
- Every control in the block gained an accessible name (row edit, delete, add).
- `PET_ALERT_FILL_CLASSES` keeps the four tile classes as literals so UnoCSS generates them, and `PetAlertRow` types a row from the model. The API's `Pet.alerts` shape now carries `id`, which the delete and update endpoints always required.
- The alert form resets between opens, refuses a reversed window, and uses the localized required-field message.

Guarded by `packages/api/tests/e2e/frontend/pet-alerts.spec.ts` (windows rendered and not elided, no control inside the status shape, every control named, no overlapping controls, all four contrast pairs ≥4.5:1 in **both** schemes, and each row's × opening its own confirmation).
