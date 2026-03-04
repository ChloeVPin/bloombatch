<<<<<<< HEAD
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
=======
<div align="center">

<img src="https://raw.githubusercontent.com/ChloeVPin/bloombatch/master/.github/logo.png" alt="bloombatch" width="120"/>

# bloombatch

*bulk file renaming made simple*

![version](https://img.shields.io/badge/version-1.0.0-e8b4c8?style=flat-square)
![platform](https://img.shields.io/badge/platform-windows-f5dce8?style=flat-square)
![license](https://img.shields.io/badge/license-proprietary-c48da6?style=flat-square)

[Download](https://github.com/ChloeVPin/bloombatch/releases/latest) • [Report Issue](https://github.com/ChloeVPin/bloombatch/issues)

</div>

---

## About

bloombatch is a simple, polished bulk file renaming tool for Windows. Rename multiple files at once with live preview, drag-and-drop support, and composable rename rules.

Built with Wails + Go for a native Windows experience with a clean, pastel pink interface.

## Download

Head over to the [Releases](https://github.com/ChloeVPin/bloombatch/releases) page to download the latest version.

**Current version:** 1.0.0  
**File:** bloombatch.exe

## Features

- Drag and drop files or browse to select
- Live preview of all changes before renaming
- Multiple rename rules that work together:
  - Add prefix or suffix
  - Find and replace text
  - Auto-number files sequentially
  - Change case (lowercase/UPPERCASE)
- Conflict detection (prevents duplicate names)
- Clean, distraction-free interface
- No installation required - just run the exe

## How to Use

1. **Add files** - Drag files into the window or click Browse
2. **Add rules** - Click rule buttons (Prefix, Suffix, Replace, Number, Case)
3. **Preview** - See exactly what each file will be renamed to
4. **Rename** - Click Rename Files when ready

The app will prevent you from renaming if there are any conflicts (duplicate names).

## Requirements

- Windows 10 or newer (64-bit)
- WebView2 (usually pre-installed on Windows 11)

## A Note About Source Code

bloombatch is currently closed-source. This repository hosts releases and provides a space for updates and support. The source code is not available publicly at this time.

## License

Proprietary software. All rights reserved.

## Contact

Questions or feedback? Reach out at **chloevalesquez@gmail.com**

---

<div align="center">

*made by chloe*

</div>
>>>>>>> 22adc249c83ac92919b11937b4a55db3bce183c9
