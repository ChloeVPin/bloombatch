# Changelog

All notable changes to BloomBatch are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project follows semantic versioning.

## [Unreleased]

## [1.2.0] - 2026-05-07

### Changed
- Rewrote the public documentation set to match the current Tauri + Next.js app.
- Replaced placeholder SVG screenshots in the README with real app screenshots.
- Replaced Vercel/v0 placeholder icons with the real BloomBatch logo and icon set.
- Removed build-time remote font fetching from the Next.js layout.
- Removed the production analytics hook from the desktop shell so the app stays local-first.
- Removed the `ignoreBuildErrors` escape hatch from the Next config.
- Enabled Next.js worker threads so production builds complete cleanly.
- Bumped version to 1.2.0 across `package.json`, `tauri.conf.json`, and `Cargo.toml`.

### Added
- Added `docs/architecture.md` to explain how the app is structured.
- Added `CODE_OF_CONDUCT.md` so the contribution flow has a real policy target.
- Added full Tauri icon set generated from the BloomBatch logo.

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

[Unreleased]: https://github.com/ChloeVPin/bloombatch/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/ChloeVPin/bloombatch/compare/v0.1.0...v1.2.0
[0.1.0]: https://github.com/ChloeVPin/bloombatch/releases/tag/v0.1.0
