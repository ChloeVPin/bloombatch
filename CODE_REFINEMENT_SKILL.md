# Code Refinement Guide

This repository is a Tauri 2 desktop app with a Next.js frontend and a Rust backend. Use this guide to keep refinements accurate, small, and release-ready.

## Core principles
- Keep the UI and the rename flow aligned with the existing design direction.
- Favor the smallest fix that solves the actual problem.
- Do not invent features or behavior that the code does not implement.
- Keep the app local-first unless a new requirement explicitly adds networking.
- Remove secrets, dead code, stale links, and misleading release copy.

## Current stack
- Frontend shell: Next.js 16, React 19, TypeScript 5.7
- Desktop shell: Tauri 2
- Native layer: Rust 2021
- Styling: Tailwind CSS 4 with shadcn/ui
- File picker and rename backend: `src-tauri/src/commands.rs`
- Rename preview logic: `components/bloom-batch/rename.ts`

## Safe edit zones
- `app/` for layout, metadata, and global shell behavior
- `components/bloom-batch/` for the rename UI and preview flow
- `lib/tauri-bridge.ts` for browser-safe IPC wrappers
- `src-tauri/src/` for file system and dialog commands
- Markdown files for release documentation and project policy

## Change rules
- Preserve component boundaries unless a change genuinely needs a refactor.
- Keep browser and Tauri behavior in sync.
- Use clear names and simple control flow.
- Avoid adding dependencies unless they remove real friction or risk.
- Prefer documented design tokens and existing component patterns over one-off styling.

## Verification checklist
- `npm run build`
- `npm run lint`
- `cargo check --manifest-path src-tauri/Cargo.toml`
- `npm run tauri:build` on the target platform when release packaging changes

## Documentation rules
- The README must describe the current product, not a future roadmap.
- SECURITY.md should describe the current attack surface, not wishful policy.
- BUILD.md should match the real build flow and not promise unverified output.
- CHANGELOG.md should record the actual changes that shipped or are queued.

## When making a release-facing change
- Update the docs that describe the change.
- Verify the build path.
- Re-read the changed files for consistency before finishing.
