use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri_plugin_dialog::DialogExt;

// ── Types ────────────────────────────────────────────────────────────────────

/// A single rename operation sent from the frontend.
#[derive(Debug, Deserialize)]
pub struct RenameOp {
    /// Full filesystem path of the source file.
    pub from: String,
    /// New filename only (the parent directory stays the same).
    pub new_name: String,
}

#[derive(Debug, Serialize)]
pub struct RenameResult {
    pub succeeded: Vec<String>,
    pub failed: Vec<FailedOp>,
}

#[derive(Debug, Serialize)]
pub struct FailedOp {
    pub from: String,
    pub reason: String,
}

/// Metadata returned after the file-picker dialog closes.
#[derive(Debug, Serialize)]
pub struct FileEntry {
    pub path: String,
    pub name: String,
    pub size: u64,
}

// ── Commands ─────────────────────────────────────────────────────────────────

/// Rename files on disk.  Each op moves `from` → `parent(from) / new_name`.
/// Returns which operations succeeded and which failed (instead of bailing
/// early) so the UI can report partial success.
#[tauri::command]
pub fn rename_files(renames: Vec<RenameOp>) -> Result<RenameResult, String> {
    let mut succeeded = Vec::new();
    let mut failed = Vec::new();

    for op in renames {
        let src = PathBuf::from(&op.from);

        let dst = match src.parent() {
            Some(parent) => parent.join(&op.new_name),
            None => PathBuf::from(&op.new_name),
        };

        match std::fs::rename(&src, &dst) {
            Ok(_) => succeeded.push(op.from),
            Err(e) => failed.push(FailedOp {
                from: op.from,
                reason: e.to_string(),
            }),
        }
    }

    Ok(RenameResult { succeeded, failed })
}

/// Open the OS file-picker dialog and return metadata for every chosen file.
/// Blocking variant is safe inside a Tauri command (runs on the thread-pool).
#[tauri::command]
pub fn open_files_dialog(app: tauri::AppHandle) -> Result<Vec<FileEntry>, String> {
    let responses = app.dialog().file().blocking_pick_files();

    let entries = match responses {
        None => vec![],
        Some(paths) => paths
            .into_iter()
            .filter_map(|fp| {
                let path: PathBuf = fp.into_path().ok()?;
                let name = path
                    .file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                let size = std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
                Some(FileEntry {
                    path: path.to_string_lossy().to_string(),
                    name,
                    size,
                })
            })
            .collect(),
    };

    Ok(entries)
}
