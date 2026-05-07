# Changelog

All notable changes to BloomBatch are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project follows semantic versioning.

## [Unreleased]

### Changed
- 2026-05-07: rewrote the public documentation set to match the current Tauri + Next.js app instead of stale release copy.
- 2026-05-07: added static README visuals under `public/screenshots/` so the repository has real preview assets.
- 2026-05-07: removed build-time remote font fetching from the Next.js layout.
- 2026-05-07: removed the production analytics hook from the desktop shell so the app stays local-first.
- 2026-05-07: removed the `ignoreBuildErrors` escape hatch from the Next config.
- 2026-05-07: enabled Next.js worker threads so production builds complete cleanly on this checkout.

### Added
- 2026-05-07: added `docs/architecture.md` to explain how the app is structured.
- 2026-05-07: added `CODE_OF_CONDUCT.md` so the contribution flow has a real policy target.

## [0.1.0] - 2026-05-07

### Added
- Drag and drop file loading directly onto the app window.
- Native file picker integration through Tauri.
- Live rename preview before changes are applied.
- Find and replace rules for filenames.
- Prefix and suffix rules.
- Sequential numbering with configurable start, padding, separator, and position.
- Case transforms for lowercase, uppercase, and title case.
- Collision warnings in the preview list.
- Partial-success rename reporting.
- A custom frameless titlebar with native window controls.
- Cross-platform Tauri packaging for Windows, macOS, and Linux.
- MIT licensing and the initial open-source documentation set.

[Unreleased]: https://github.com/chloevalesquez/bloombatch/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/chloevalesquez/bloombatch/releases/tag/v0.1.0
