# bloombatch

A simple, polished bulk file renaming tool for Windows — built with [Wails](https://wails.io/) + Go.

![Windows](https://img.shields.io/badge/platform-Windows-blue)

## What it does

bloombatch lets you rename multiple files at once using a set of composable rules. You see a live preview of every change before anything touches your disk.

**Supported rename rules:**

- **Add prefix** — prepend text to filenames
- **Add suffix** — append text to filenames
- **Find & replace** — swap text within filenames
- **Auto-number** — add sequential numbers (e.g. `001_`, `002_`, …)
- **Change case** — convert filenames to lowercase or UPPERCASE

## How to use it

1. **Add files** — drag and drop files into the window, or click **Browse** to pick them
2. **Add rules** — click the rule buttons (Prefix, Suffix, Replace, Number, Case) on the right panel
3. **Preview** — the file list updates in real time to show what each file will be renamed to
4. **Rename** — click **Rename Files** when you're happy with the preview

Conflicts (two files ending up with the same name) are detected and highlighted — the rename button stays disabled until conflicts are resolved.

## How to build and run

### Prerequisites

- [Go 1.21+](https://go.dev/dl/)
- [Node.js 18+](https://nodejs.org/)
- [Wails CLI v2](https://wails.io/docs/gettingstarted/installation)

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### Development

```bash
wails dev
```

This starts a live-reloading dev server. Frontend changes hot-reload instantly.

### Production build

```bash
wails build
```

The compiled executable will be at `build/bin/bloombatch.exe`.

## Project structure

```
bloombatch/
├── app.go              # Go backend — file operations, rename logic
├── main.go             # Wails app entry point and window config
├── wails.json          # Wails project configuration
├── frontend/
│   ├── src/
│   │   ├── App.tsx     # Main React UI component
│   │   ├── style.css   # Tailwind CSS + pastel pink theme
│   │   └── main.tsx    # React entry point
│   └── wailsjs/        # Auto-generated Wails bindings
└── build/
    └── bin/            # Compiled output
```

## Design

- Pastel pink color theme with soft gradients
- Clean single-window layout — files on the left, rules on the right
- Rounded corners, generous spacing, clear typography
- No modals, no clutter, no accounts, no telemetry

## Technical details

- **Backend:** Go — handles filesystem operations, rename preview generation, and conflict detection
- **Frontend:** React + TypeScript + Tailwind CSS v4 + Lucide icons
- **Framework:** Wails v2 — native Windows WebView2 wrapper
- **Local only** — no cloud services, no network requests
