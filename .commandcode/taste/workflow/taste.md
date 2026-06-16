# workflow
- When making code changes, work in small batches and run quality checks between each batch to keep changes manageable and catch regressions early. Confidence: 0.70
- When working through a planned batch of changes, continue autonomously through all steps without pausing or waiting for prompts — only stop when hitting a blocker, an ambiguous decision, or when quality checks need to run. Confidence: 0.70
- When making file changes, proactively store a recap of changes (file location, line numbers, and change description) in a temporary tracking file — do this automatically without waiting to be asked. Confidence: 0.95
- After completing every task, send a recap notification via ntfy.sh on topic "cmd" using the scripts/ntfy.sh wrapper script instead of raw curl. Confidence: 0.85
- Quality checks must always include running Playwright e2e tests (not just lint/format/build). Follow the full quality check sequence from AGENTS.md including Docker test environment setup and `pnpm run test:e2e`. Confidence: 0.90
- Do not dismiss skipped e2e tests — investigate and fix them before continuing with other work, even if they appear to be conditionally skipped due to data/seeding issues. Confidence: 0.75
- Use sigmap (https://github.com/manojmallick/sigmap) for the project. Save the usage strategy to AGENTS.md. Confidence: 0.60
- At the start of every new session, remind the user to run the session in tmux. Confidence: 0.85
