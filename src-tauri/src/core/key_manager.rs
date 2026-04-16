use once_cell::sync::OnceCell;
use crate::error::{CodexError, CodexResult};
use std::path::PathBuf;

static KEY: OnceCell<[u8; 32]> = OnceCell::new();
static SALT: OnceCell<[u8; 16]> = OnceCell::new();

pub fn set_key(key: [u8; 32], salt: [u8; 16]) -> CodexResult<()> {
    let _ = KEY.set(key).map_err(|_| CodexError::KeyManagerError("Key already set".to_string()))?;
    let _ = SALT.set(salt).map_err(|_| CodexError::KeyManagerError("Salt already set".to_string()))?;
    Ok(())
}

pub fn get_key() -> CodexResult<&'static [u8; 32]> {
    KEY.get().ok_or_else(|| CodexError::KeyManagerError("Vault not unlocked".to_string()))
}

#[allow(dead_code)]
pub fn get_salt() -> CodexResult<&'static [u8; 16]> {
    SALT.get().ok_or_else(|| CodexError::KeyManagerError("Vault not unlocked".to_string()))
}

pub fn get_salt_path(app_data_dir: &PathBuf) -> PathBuf {
    app_data_dir.join(".salt")
}

pub fn load_or_create_salt(app_data_dir: &PathBuf) -> CodexResult<[u8; 16]> {
    let salt_path = get_salt_path(app_data_dir);
    
    if salt_path.exists() {
        // Load existing salt
        let salt_bytes = std::fs::read(&salt_path)
            .map_err(|e| CodexError::IoError(format!("Failed to read salt: {}", e)))?;
        
        if salt_bytes.len() != 16 {
            return Err(CodexError::ValidationError("Invalid salt file".to_string()));
        }
        
        let mut salt = [0u8; 16];
        salt.copy_from_slice(&salt_bytes);
        Ok(salt)
    } else {
        // Generate new salt
        use rand::RngCore;
        let mut salt = [0u8; 16];
        rand::thread_rng().fill_bytes(&mut salt);
        
        // Save it
        std::fs::write(&salt_path, &salt)
            .map_err(|e| CodexError::IoError(format!("Failed to save salt: {}", e)))?;
        
        Ok(salt)
    }
}
