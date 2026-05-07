mod commands;

use commands::{open_files_dialog, rename_files};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![rename_files, open_files_dialog])
        .run(tauri::generate_context!())
        .expect("error while running BloomBatch");
}
