// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod core;
mod db;
mod error;

use core::vault::Vault;
use core::storage::init_storage;
use db::schema::init_db;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle().clone();

            tauri::async_runtime::spawn(async move {
                // ✅ Use Tauri app data directory (CORRECT way)
                let app_dir = app_handle
                    .path()
                    .app_data_dir()
                    .expect("failed to get app data dir");

                // Create folder if missing
                std::fs::create_dir_all(&app_dir)
                    .expect("failed to create app dir");

                // Initialize storage with app dir
                init_storage(app_dir.clone());

                let db_path = app_dir.join("notes.db");

                // Use proper SQLite URL format with create mode
                let db_url = format!("sqlite://{}?mode=rwc", db_path.to_string_lossy());

                let db = sqlx::SqlitePool::connect(&db_url)
                    .await
                    .expect("Failed to connect to DB");

                init_db(&db).await;

                let vault = Vault::new(db);

                // Store globally
                app_handle.manage(vault);
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::check_vault_exists,
            commands::setup_vault,
            commands::unlock,
            commands::create_note,
            commands::list_notes,
            commands::get_note_meta,
            commands::load_note,
            commands::update_note,
            commands::delete_note,
            commands::save_vault_file,
            commands::list_files,
            commands::get_file_meta,
            commands::load_file,
            commands::delete_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}