# Build Guide

This repository builds a Next.js frontend plus a Tauri 2 desktop shell.

## Prerequisites
- Node.js 20 or newer
- Rust stable toolchain
- The platform libraries required by Tauri and the native WebView on your operating system

Check the toolchain first:
```bash
node --version
npm --version
cargo --version
```

## Platform notes

### Windows
- Install the Visual C++ Build Tools or Visual Studio 2022 with the C++ desktop workload.
- WebView2 is already present on current Windows releases. If you are on a minimal image, install the Evergreen runtime.

### macOS
- Install the Xcode Command Line Tools:
```bash
xcode-select --install
```
- For universal releases, add the Intel target before building:
```bash
rustup target add x86_64-apple-darwin
```

### Linux
Install the WebKit and native build packages for your distribution. Common Debian / Ubuntu packages include:
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libxdo-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

Fedora / RHEL:
```bash
sudo dnf install -y \
  webkit2gtk4.1-devel \
  openssl-devel \
  libxdo-devel \
  libappindicator-gtk3-devel \
  librsvg2-devel \
  gcc
```

Arch:
```bash
sudo pacman -S --needed \
  webkit2gtk-4.1 \
  base-devel \
  curl \
  wget \
  file \
  openssl \
  libxdo \
  libayatana-appindicator \
  librsvg
```

## Development build
```bash
npm ci
npm run tauri:dev
```

This starts the Next.js dev server, compiles the Rust backend, and opens the native app window.

## Frontend build
```bash
npm run build
```

This writes the static Next.js export to `out/`. Tauri uses that output during desktop builds.

## Desktop build
```bash
npm run tauri:build
```

Tauri packages the frontend export with the Rust backend and writes bundles to:
`src-tauri/target/release/bundle/`

Expected outputs include:
- Windows: `.msi` and `.exe`
- macOS: `.dmg` and `.app`
- Linux: `.AppImage`, `.deb`, and `.rpm`

## Rust checks
```bash
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
```

## JavaScript checks
```bash
npm run lint
npm run build
```

## Troubleshooting
- If the build complains about WebView libraries, install the platform package listed above and retry.
- If the Rust toolchain is missing, run `rustup update stable`.
- If a port is already in use during development, stop the process using it and retry `npm run tauri:dev`.
- This repository no longer depends on remote fonts during build, so a production build should not require network access after dependencies are installed.
- If `next build` fails on Windows with `spawn EPERM`, keep `experimental.workerThreads` enabled in `next.config.mjs` so Next uses thread workers instead of forked child processes.
