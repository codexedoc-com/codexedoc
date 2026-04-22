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

#[tauri::command]
pub async fn reset_vault(
    vault: State<'_, Vault>,
    app_handle: tauri::AppHandle
) -> Result<(), String> {
    // Close the database connection first
    vault.db.close().await;

    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app dir: {}", e))?;

    let salt_path = app_dir.join(".salt");
    let hash_path = app_dir.join(".password_hash");
    let db_path = app_dir.join("notes.db");
    let vault_path = app_dir.join("vault");

    if salt_path.exists() {
        std::fs::remove_file(&salt_path)
            .map_err(|e| format!("Failed to remove salt file: {}", e))?;
    }

    if hash_path.exists() {
        std::fs::remove_file(&hash_path)
            .map_err(|e| format!("Failed to remove password hash: {}", e))?;
    }

    if db_path.exists() {
        std::fs::remove_file(&db_path)
            .map_err(|e| format!("Failed to remove database: {}", e))?;
    }

    if vault_path.exists() {
        std::fs::remove_dir_all(&vault_path)
            .map_err(|e| format!("Failed to remove vault files: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn save_vault_file(id: String, metadata: String, file_data: String) -> Result<(), String> {
    // Decode the base64 file data
    let binary_data = base64_to_bytes(&file_data)
        .map_err(|e| format!("Failed to decode file data: {}", e))?;
    
    crate::core::storage::save_vault_file(&id, &metadata, &binary_data)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_vault_files() -> Result<Vec<(String, String)>, String> {
    let files = crate::core::storage::load_vault_files()
        .map_err(|e| e.to_string())?;
    
    let result: Vec<(String, String)> = files
        .into_iter()
        .map(|(metadata, data)| {
            let base64_data = base64_from_bytes(&data);
            (metadata, base64_data)
        })
        .collect();
    
    Ok(result)
}

#[tauri::command]
pub fn delete_vault_file(id: String) -> Result<(), String> {
    crate::core::storage::delete_vault_file(&id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn health_check(vault: State<'_, Vault>) -> Result<bool, String> {
    // Simple health check to verify vault is initialized and database is accessible
    match vault.db.acquire().await {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Vault not ready: {}", e))
    }
}

// Helper functions for base64 encoding/decoding
fn base64_to_bytes(data: &str) -> Result<Vec<u8>, String> {
    // Extract base64 from data URL format if needed
    let b64_str = if data.contains(",") {
        data.split(',').nth(1).unwrap_or(data)
    } else {
        data
    };
    
    base64_decode(b64_str).map_err(|e| format!("Base64 decode failed: {}", e))
}

fn base64_from_bytes(data: &[u8]) -> String {
    base64_encode(data)
}

fn base64_encode(data: &[u8]) -> String {
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::new();
    
    for chunk in data.chunks(3) {
        let b1 = chunk[0];
        let b2 = chunk.get(1).copied().unwrap_or(0);
        let b3 = chunk.get(2).copied().unwrap_or(0);
        
        let n = ((b1 as u32) << 16) | ((b2 as u32) << 8) | (b3 as u32);
        
        result.push(alphabet.chars().nth(((n >> 18) & 0x3f) as usize).unwrap());
        result.push(alphabet.chars().nth(((n >> 12) & 0x3f) as usize).unwrap());
        
        if chunk.len() > 1 {
            result.push(alphabet.chars().nth(((n >> 6) & 0x3f) as usize).unwrap());
        }
        if chunk.len() > 2 {
            result.push(alphabet.chars().nth((n & 0x3f) as usize).unwrap());
        }
    }
    
    // Add padding
    match data.len() % 3 {
        1 => result.push_str("=="),
        2 => result.push('='),
        _ => {}
    }
    
    result
}

fn base64_decode(data: &str) -> Result<Vec<u8>, String> {
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = Vec::new();
    let data = data.trim_end_matches('=');
    
    let mut buffer = 0u32;
    let mut bits = 0;
    
    for c in data.chars() {
        let val = alphabet.find(c).ok_or_else(|| format!("Invalid base64 character: {}", c))?;
        buffer = (buffer << 6) | (val as u32);
        bits += 6;
        
        if bits >= 8 {
            bits -= 8;
            result.push(((buffer >> bits) & 0xff) as u8);
            buffer &= (1 << bits) - 1;
        }
    }
    
    Ok(result)
}
