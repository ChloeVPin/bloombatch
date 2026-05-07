# Security Policy

BloomBatch is intended to be a local-first desktop application. File operations happen on the user's machine and are limited to the files the user explicitly chooses.

## Supported versions
- The latest released version receives security fixes.
- Older versions are not guaranteed to receive patches.

## Reporting a vulnerability
Use a private GitHub security advisory for this repository. Do not open a public issue for a security problem.

If a private advisory is not available in your GitHub UI, contact the repository owner through the private channel listed on the profile or organization settings.

Include:
- A short description of the issue
- The affected version or commit
- Clear reproduction steps
- The impact you expect
- Any proof-of-concept you are comfortable sharing privately

## What is in scope
- Path handling and rename logic
- Tauri IPC boundaries
- File picker and file system operations
- Bundled frontend assets
- Release packaging and update paths

## What is not in scope
- Operating system or WebView vulnerabilities that must be fixed upstream
- User mistakes, such as renaming the wrong file manually
- Social engineering or account compromise outside the app

## Current design notes
- The app does not depend on remote fonts during build.
- The shipped desktop path does not rely on analytics or other third-party network calls.
- The Tauri backend only mutates files after explicit user action.
- No credentials, secrets, or backend APIs are required to use the app.

## Future changes
If a future release adds networking, authentication, sync, or remote storage, document the new data flow here and add a tighter threat model before shipping.
