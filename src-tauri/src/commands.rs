use tauri::State;
use tauri::Manager;
use std::path::PathBuf;

use crate::core::{
    encryption::EncryptionManager,
    key_manager::set_key,
    vault::Vault,
    models::NoteMeta,
};

pub fn vault_exists(app_data_dir: &PathBuf) -> bool {
    let salt_path = app_data_dir.join(".salt");
    let hash_path = app_data_dir.join(".password_hash");
    salt_path.exists() && hash_path.exists()
}

#[tauri::command]
pub fn check_vault_exists(app_handle: tauri::AppHandle) -> Result<bool, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app dir: {}", e))?;

    Ok(vault_exists(&app_dir))
}

#[tauri::command]
pub fn setup_vault(password: String, app_handle: tauri::AppHandle) -> Result<bool, String> {
    // Check password strength
    if !is_password_strong(&password) {
        return Err("Password does not meet requirements".to_string());
    }

    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app dir: {}", e))?;

    // Check if vault already exists
    if vault_exists(&app_dir) {
        return Err("Vault already exists".to_string());
    }

    // Hash the password for storage
    let password_hash = EncryptionManager::hash_password(&password)
        .map_err(|e| format!("Failed to hash password: {}", e))?;

    // Save password hash
    let hash_path = app_dir.join(".password_hash");
    std::fs::write(&hash_path, password_hash)
        .map_err(|e| format!("Failed to save password hash: {}", e))?;

    // Load or create salt (this creates it if it doesn't exist)
    let salt = crate::core::key_manager::load_or_create_salt(&app_dir)
        .map_err(|e| format!("Failed to create salt: {}", e))?;

    // Derive key from password
    let key = EncryptionManager::derive_key(&password, &salt)
        .map_err(|e| format!("Failed to derive key: {}", e))?;

    // Set the key and salt in memory
    set_key(key, salt)
        .map_err(|e| format!("Failed to set key: {}", e))?;

    Ok(true)
}

fn is_password_strong(password: &str) -> bool {
    if password.len() < 12 {
        return false;
    }
    if !password.chars().any(|c| c.is_uppercase()) {
        return false;
    }
    if !password.chars().any(|c| c.is_lowercase()) {
        return false;
    }
    if !password.chars().any(|c| c.is_numeric()) {
        return false;
    }
    if !password.chars().any(|c| "!@#$%^&*()_+-=[]{}';:\"\\|,.<>/?".contains(c)) {
        return false;
    }
    true
}

#[tauri::command]
pub fn unlock(password: String, app_handle: tauri::AppHandle) -> Result<bool, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app dir: {}", e))?;

    // Check if vault exists first
    if !vault_exists(&app_dir) {
        return Err("Vault does not exist. Please create one first.".to_string());
    }

    // Load and verify password hash
    let hash_path = app_dir.join(".password_hash");
    let stored_hash = std::fs::read_to_string(&hash_path)
        .map_err(|e| format!("Failed to read password hash: {}", e))?;

    // Verify the password
    if !EncryptionManager::verify_password(&password, &stored_hash)
        .map_err(|e| format!("Password verification failed: {}", e))? {
        return Err("Invalid password".to_string());
    }

    // Load the existing salt (don't create if doesn't exist)
    let salt_path = crate::core::key_manager::get_salt_path(&app_dir);
    let salt_bytes = std::fs::read(&salt_path)
        .map_err(|e| format!("Failed to read salt: {}", e))?;

    if salt_bytes.len() != 16 {
        return Err("Invalid salt file".to_string());
    }

    let mut salt = [0u8; 16];
    salt.copy_from_slice(&salt_bytes);

    // Derive key from password
    let key = EncryptionManager::derive_key(&password, &salt)
        .map_err(|e| format!("Failed to derive key: {}", e))?;

    // Set the key and salt in memory
    set_key(key, salt)
        .map_err(|e| format!("Failed to set key: {}", e))?;

    Ok(true)
}

#[tauri::command]
pub async fn create_note(
    vault: State<'_, Vault>,
    title: String,
    content: String,
) -> Result<String, String> {
    vault
        .create_note(title, content)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn list_notes(
    vault: State<'_, Vault>
) -> Result<Vec<NoteMeta>, String> {
    vault
        .list_notes()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_note_meta(
    vault: State<'_, Vault>,
    id: String
) -> Result<NoteMeta, String> {
    vault
        .get_note_meta(id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn load_note(
    vault: State<'_, Vault>,
    id: String,
) -> Result<String, String> {
    vault
        .load_note(id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_note(
    vault: State<'_, Vault>,
    id: String,
    title: String,
    content: String,
) -> Result<(), String> {
    vault
        .update_note(id, title, content)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_note(
    vault: State<'_, Vault>,
    id: String,
) -> Result<(), String> {
    vault
        .delete_note(id)
        .await
        .map_err(|e| e.to_string())
}
