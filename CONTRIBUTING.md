# Contributing

Thanks for helping improve BloomBatch.

## Before you start
- Read the README and [BUILD.md](BUILD.md) so you know how the app runs and how it is packaged.
- Read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
- Keep changes focused. Small, reviewable pull requests are easier to merge and less likely to regress the desktop flow.

## Local setup
```bash
npm ci
npm run tauri:dev
```

## Useful checks
```bash
npm run lint
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

## Where to make changes
- `components/bloom-batch/` contains the rename UI and preview flow.
- `components/bloom-batch/rename.ts` contains the pure rename logic.
- `lib/tauri-bridge.ts` contains the browser-safe Tauri wrappers.
- `src-tauri/src/commands.rs` contains the native file operations.
- `app/` contains the Next.js shell and metadata.

## Style expectations
- Prefer clear, direct code.
- Match the existing spacing, radius, and typography before introducing new patterns.
- Keep browser and Tauri behavior aligned.
- Avoid adding dependencies unless they solve a real problem.

## Pull requests
- Describe what changed and why.
- Include the commands you ran to verify the change.
- Attach screenshots when the user interface changed.
- Call out any platform-specific caveats.

## Bug reports
When reporting an issue, include:
- Operating system and version
- BloomBatch version or commit
- Steps to reproduce
- Expected result
- Actual result

## Feature requests
Describe the workflow problem first, then the solution you want. That makes it easier to judge whether a change belongs in the app.
