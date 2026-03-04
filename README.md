<div align="center">
  <img src=".github/logo.png" alt="bloombatch logo" width="96" />

  # bloombatch

  Bulk file renaming for Windows, simple UI, live preview, no clutter.

  ![platform](https://img.shields.io/badge/platform-Windows-4A86CF?style=flat-square)
  ![stack](https://img.shields.io/badge/stack-Wails%20%2B%20Go%20%2B%20React-EAB9C9?style=flat-square)
</div>

## Why bloombatch

bloombatch helps you rename many files at once without guessing what will happen. You build rename rules, see the preview instantly, then apply changes when it looks right.

## Features

- Drag and drop files, or browse manually
- Live rename preview before writing to disk
- Composable rules:
  - Prefix
  - Suffix
  - Find and replace
  - Auto-numbering
  - Case transform (lowercase/UPPERCASE)
- Conflict detection, rename action stays blocked until conflicts are fixed
- Local-only app, no accounts, no telemetry

## Quick start

### Requirements

- Go `1.21+`
- Node.js `18+`
- Wails CLI `v2`

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### Run in development

```bash
wails dev
```

### Build executable

```bash
wails build
```

Output:

- `build/bin/bloombatch.exe`

## Usage

1. Add files by dragging into the app or using **Browse**.
2. Add one or more rename rules from the right panel.
3. Confirm the preview list.
4. Click **Rename Files**.

## Tech stack

- Backend: Go
- Frontend: React + TypeScript + Tailwind CSS
- Desktop shell: Wails (WebView2 on Windows)

## Project structure

```text
bloombatch/
├─ app.go
├─ main.go
├─ wails.json
├─ frontend/
│  ├─ src/
│  │  ├─ App.tsx
│  │  ├─ main.tsx
│  │  └─ style.css
│  └─ wailsjs/
└─ build/
```

## License

[MIT](LICENSE)
