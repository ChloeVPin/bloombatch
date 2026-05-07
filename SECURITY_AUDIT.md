# Security Audit

**Audit date:** 2026-05-07  
**Scope:** repository source, desktop build config, and shipped documentation  
**Result:** no high-risk issues found in the current local-first implementation

## What was reviewed

- `app/` for root layout, metadata, and runtime behavior
- `components/` for the rename UI and preview flow
- `lib/` for Tauri bridge code
- `src-tauri/src/` for Rust file operations and file picker commands
- `package.json`, `next.config.mjs`, `src-tauri/tauri.conf.json`, and the related build config
- Top-level markdown files, including README, BUILD, SECURITY, CONTRIBUTING, and the changelog

## Findings

### Secrets and credentials
- No API keys found
- No tokens or passwords found
- No database credentials found
- No private certificates found
- No hard-coded personal paths found

### External services
- The shipped desktop path does not depend on remote fonts.
- The shipped desktop path does not use analytics or telemetry.
- No remote API calls are required for normal rename operations.

### File system behavior
- Rename operations are performed in Rust with `std::fs::rename`.
- The user selects files explicitly before any mutation.
- The app does not crawl directories or perform wildcard-based destructive operations.
- Partial success is reported per file instead of aborting the whole batch.

### Tauri boundary
- IPC calls are wrapped in a small browser-safe bridge.
- The frontend only invokes native commands when the user takes an explicit action.

### Build and release posture
- The Next.js layout no longer fetches remote fonts during build.
- `ignoreBuildErrors` is no longer masking type issues in the production build.
- `npm run build`, `npm run lint`, and `cargo check --manifest-path src-tauri/Cargo.toml` all pass in this checkout.

## Residual risks

- `tauri.conf.json` currently leaves CSP disabled. That is acceptable for the present local-first desktop flow, but it should be revisited if any remote content is added later.
- `std::fs::rename` is the right primitive here, but users still need to choose the correct files. Rename mistakes are only as safe as the selected inputs.
- Release packaging should be re-verified on each supported platform before publishing installers.

## Recommended release checks

1. Run `npm run build`.
2. Run `npm run lint`.
3. Run `cargo check --manifest-path src-tauri/Cargo.toml`.
4. Run `npm run tauri:build` on each target platform that will ship.
5. Smoke test drag and drop, file dialog import, preview rendering, partial success, and the success screen.

## Follow-up

Update this report whenever the app starts using remote services, additional IPC commands, or new file system capabilities.
