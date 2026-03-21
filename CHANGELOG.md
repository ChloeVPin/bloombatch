# Changelog

## Version 1.1.0
*March 21, 2026*

**What's New**
- Added a full CLI mode (`info`, `preview`, `apply`, `rename`, `selftest`) for headless automation and CI workflows.
- Added robust rename preflight checks for invalid names, reserved Windows names, path separator safety, and existing-file conflicts.
- Added two-phase rename execution with rollback to safely handle swaps/cycles and reduce partial-rename risk.
- Added conflict notes in preview so rename blockers are explicit.
- Added a frameless custom titlebar with integrated minimize/maximize/close controls.
- Added smoother titlebar control icons and window-state-aware maximize/restore behavior.
- Added backend and CLI test coverage for preview/apply/conflict/swap scenarios.

**Updated**
- Bumped frontend package version to `1.1.0`.
- Updated frontend dependencies, including `tailwindcss`, `@tailwindcss/vite`, and `lucide-react`.
- Refreshed Go module dependencies and lockfiles, then revalidated builds and vulnerability scans.

## Version 1.0.0
*February 11, 2026*

Initial release of bloombatch.

**What's New**
- Bulk file renaming with live preview
- Drag and drop file support
- Multiple rename rules (prefix, suffix, find/replace, numbering, case change)
- Conflict detection to prevent duplicate filenames
- Clean pastel pink interface
- Native Windows application

---

*This changelog follows a simple format. Each version will list what's new, what's fixed, and what's changed.*
