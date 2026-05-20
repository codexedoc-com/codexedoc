use std::fs;
use std::path::PathBuf;
use crate::error::{CodexError, CodexResult};

static mut APP_DATA_DIR: Option<PathBuf> = None;

pub fn init_storage(app_data_dir: PathBuf) {
    unsafe {
        APP_DATA_DIR = Some(app_data_dir);
    }
}

pub fn get_vault_dir() -> CodexResult<PathBuf> {
    unsafe {
        let path = APP_DATA_DIR
            .as_ref()
            .ok_or_else(|| CodexError::StorageError("Storage not initialized".to_string()))?
            .join("vault");
        
        fs::create_dir_all(&path)
            .map_err(|e| CodexError::IoError(format!("Failed to create vault dir: {}", e)))?;
        
        Ok(path)
    }
}

pub fn get_notes_dir() -> CodexResult<PathBuf> {
    let mut path = get_vault_dir()?;
    path.push("notes");

    fs::create_dir_all(&path)
        .map_err(|e| CodexError::IoError(format!("Failed to create notes dir: {}", e)))?;
    
    Ok(path)
}

pub fn save_note_file(id: &str, data: &[u8]) -> CodexResult<()> {
    let mut path = get_notes_dir()?;
    path.push(format!("{}.cdx", id));

    fs::write(path, data)
        .map_err(|e| CodexError::StorageError(format!("Failed to save note: {}", e)))
}

pub fn load_note_file(id: &str) -> CodexResult<Vec<u8>> {
    let mut path = get_notes_dir()?;
    path.push(format!("{}.cdx", id));

    fs::read(path)
        .map_err(|e| CodexError::StorageError(format!("Failed to load note: {}", e)))
}

pub fn delete_note_file(id: &str) -> CodexResult<()> {
    let mut path = get_notes_dir()?;
    path.push(format!("{}.cdx", id));

    if path.exists() {
        fs::remove_file(path)
            .map_err(|e| CodexError::StorageError(format!("Failed to delete note file: {}", e)))?;
    }

    Ok(())
}

pub fn get_files_dir() -> CodexResult<PathBuf> {
    let mut path = get_vault_dir()?;
    path.push("files");

    fs::create_dir_all(&path)
        .map_err(|e| CodexError::IoError(format!("Failed to create files dir: {}", e)))?;
    
    Ok(path)
}

pub fn save_vault_file(id: &str, data: &[u8]) -> CodexResult<()> {
    let mut path = get_files_dir()?;
    path.push(format!("{}.cdx", id));

    fs::write(path, data)
        .map_err(|e| CodexError::StorageError(format!("Failed to save file: {}", e)))
}

pub fn load_vault_file(id: &str) -> CodexResult<Vec<u8>> {
    let mut path = get_files_dir()?;
    path.push(format!("{}.cdx", id));

    fs::read(path)
        .map_err(|e| CodexError::StorageError(format!("Failed to load file: {}", e)))
}

pub fn delete_vault_file(id: &str) -> CodexResult<()> {
    let mut path = get_files_dir()?;
    path.push(format!("{}.cdx", id));

    if path.exists() {
        fs::remove_file(path)
            .map_err(|e| CodexError::StorageError(format!("Failed to delete file: {}", e)))?;
    }

    Ok(())
}
