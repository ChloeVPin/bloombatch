/**
 * Thin, typed wrappers around Tauri IPC calls.
 *
 * All imports from @tauri-apps/* are done dynamically so this module is
 * safe to import in browser builds — functions simply no-op when Tauri
 * is not present.
 */

import type { DroppedFile } from "@/components/bloom-batch/rename"

// ── Environment detection ─────────────────────────────────────────────────

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}

// ── Shared types ──────────────────────────────────────────────────────────

export interface RenameOp {
  from: string
  new_name: string
}

export interface FailedOp {
  from: string
  reason: string
}

export interface RenameResult {
  succeeded: string[]
  failed: FailedOp[]
}

// ── Commands ──────────────────────────────────────────────────────────────

/**
 * Ask the Rust backend to rename files on disk.
 * Only ops where `from` is a non-empty path are sent.
 */
export async function renameFiles(renames: RenameOp[]): Promise<RenameResult> {
  const { invoke } = await import("@tauri-apps/api/core")
  return invoke<RenameResult>("rename_files", { renames })
}

/**
 * Open the OS file-picker dialog and return file descriptors with real paths.
 */
export async function openFilesDialog(): Promise<DroppedFile[]> {
  const { invoke } = await import("@tauri-apps/api/core")
  const entries = await invoke<Array<{ path: string; name: string; size: number }>>(
    "open_files_dialog"
  )
  return entries.map((e) => ({ name: e.name, path: e.path, size: e.size }))
}

// ── Window controls ───────────────────────────────────────────────────────

export async function minimizeWindow(): Promise<void> {
  if (!isTauri()) return
  const { getCurrentWindow } = await import("@tauri-apps/api/window")
  await getCurrentWindow().minimize()
}

export async function toggleMaximizeWindow(): Promise<void> {
  if (!isTauri()) return
  const { getCurrentWindow } = await import("@tauri-apps/api/window")
  await getCurrentWindow().toggleMaximize()
}

export async function closeWindow(): Promise<void> {
  if (!isTauri()) return
  const { getCurrentWindow } = await import("@tauri-apps/api/window")
  await getCurrentWindow().close()
}

/**
 * Register a window-level Tauri drag-drop listener and return an unsubscribe
 * function.  Paths dropped anywhere on the window are forwarded via `onDrop`.
 */
export async function listenFileDrop(
  onDrop: (files: DroppedFile[]) => void
): Promise<() => void> {
  const { getCurrentWebview } = await import("@tauri-apps/api/webview")
  const unlisten = await getCurrentWebview().onDragDropEvent((event) => {
    if (event.payload.type !== "drop") return
    const files: DroppedFile[] = event.payload.paths.map((p) => ({
      name: p.replace(/.*[/\\]/, ""),
      path: p,
      size: 0,
    }))
    if (files.length > 0) onDrop(files)
  })
  return unlisten
}
