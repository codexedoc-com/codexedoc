use std::fs;
use std::path::PathBuf;
use std::sync::OnceLock;
use crate::error::{CodexError, CodexResult};

static APP_DATA_DIR: OnceLock<PathBuf> = OnceLock::new();

pub fn init_storage(app_data_dir: PathBuf) {
    let _ = APP_DATA_DIR.set(app_data_dir);
}

pub fn get_vault_dir() -> CodexResult<PathBuf> {
    let path = APP_DATA_DIR
        .get()
        .ok_or_else(|| CodexError::StorageError("Storage not initialized".to_string()))?
        .join("vault");
    
    fs::create_dir_all(&path)
        .map_err(|e| CodexError::IoError(format!("Failed to create vault dir: {}", e)))?;
    
    Ok(path)
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

pub fn get_files_metadata_dir() -> CodexResult<PathBuf> {
    let mut path = get_files_dir()?;
    path.push("metadata");

    fs::create_dir_all(&path)
        .map_err(|e| CodexError::IoError(format!("Failed to create files metadata dir: {}", e)))?;
    
    Ok(path)
}

pub fn get_files_data_dir() -> CodexResult<PathBuf> {
    let mut path = get_files_dir()?;
    path.push("data");

    fs::create_dir_all(&path)
        .map_err(|e| CodexError::IoError(format!("Failed to create files data dir: {}", e)))?;
    
    Ok(path)
}

pub fn save_vault_file(id: &str, metadata: &str, file_data: &[u8]) -> CodexResult<()> {
    // Save metadata as JSON
    let mut metadata_path = get_files_metadata_dir()?;
    metadata_path.push(format!("{}.json", id));

    fs::write(&metadata_path, metadata)
        .map_err(|e| CodexError::StorageError(format!("Failed to save vault file metadata: {}", e)))?;

    // Save binary file data
    let mut data_path = get_files_data_dir()?;
    data_path.push(id);

    fs::write(&data_path, file_data)
        .map_err(|e| CodexError::StorageError(format!("Failed to save vault file data: {}", e)))?;

    Ok(())
}

pub fn load_vault_files() -> CodexResult<Vec<(String, Vec<u8>)>> {
    let metadata_path = get_files_metadata_dir()?;
    let data_path = get_files_data_dir()?;
    
    let mut files = Vec::new();
    
    if metadata_path.exists() {
        for entry in fs::read_dir(&metadata_path)
            .map_err(|e| CodexError::StorageError(format!("Failed to read files metadata dir: {}", e)))? {
            let entry = entry
                .map_err(|e| CodexError::StorageError(format!("Failed to read file entry: {}", e)))?;
            let file_path = entry.path();
            
            if file_path.extension().map_or(false, |ext| ext == "json") {
                let file_name = file_path.file_stem()
                    .and_then(|name| name.to_str())
                    .map(|s| s.to_string());
                
                if let Some(id) = file_name {
                    let metadata = fs::read_to_string(&file_path)
                        .map_err(|e| CodexError::StorageError(format!("Failed to read metadata file: {}", e)))?;
                    
                    let mut data_file_path = data_path.clone();
                    data_file_path.push(&id);
                    
                    if data_file_path.exists() {
                        let data = fs::read(&data_file_path)
                            .map_err(|e| CodexError::StorageError(format!("Failed to read file data: {}", e)))?;
                        files.push((metadata, data));
                    }
                }
            }
        }
    }

    Ok(files)
}

pub fn delete_vault_file(id: &str) -> CodexResult<()> {
    // Delete metadata
    let mut metadata_path = get_files_metadata_dir()?;
    metadata_path.push(format!("{}.json", id));

    if metadata_path.exists() {
        fs::remove_file(&metadata_path)
            .map_err(|e| CodexError::StorageError(format!("Failed to delete metadata file: {}", e)))?;
    }

    // Delete data
    let mut data_path = get_files_data_dir()?;
    data_path.push(id);

    if data_path.exists() {
        fs::remove_file(&data_path)
            .map_err(|e| CodexError::StorageError(format!("Failed to delete file data: {}", e)))?;
    }

    Ok(())
}

// OLD FUNCTIONS - KEEP FOR BACKWARDS COMPATIBILITY (kept for reference only, use new ones above)
pub fn save_vault_file_legacy(id: &str, data: &str) -> CodexResult<()> {
    let mut path = get_files_dir()?;
    path.push(format!("{}.json", id));

    fs::write(path, data)
        .map_err(|e| CodexError::StorageError(format!("Failed to save vault file: {}", e)))
}

pub fn load_vault_files_legacy() -> CodexResult<Vec<String>> {
    let path = get_files_dir()?;
    
    let mut files = Vec::new();
    
    if path.exists() {
        for entry in fs::read_dir(&path)
            .map_err(|e| CodexError::StorageError(format!("Failed to read files dir: {}", e)))? {
            let entry = entry
                .map_err(|e| CodexError::StorageError(format!("Failed to read file entry: {}", e)))?;
            let file_path = entry.path();
            
            if file_path.extension().map_or(false, |ext| ext == "json") {
                let data = fs::read_to_string(&file_path)
                    .map_err(|e| CodexError::StorageError(format!("Failed to read file: {}", e)))?;
                files.push(data);
            }
        }
    }

    Ok(files)
}

pub fn delete_vault_file_legacy(id: &str) -> CodexResult<()> {
    let mut path = get_files_dir()?;
    path.push(format!("{}.json", id));

    if path.exists() {
        fs::remove_file(path)
            .map_err(|e| CodexError::StorageError(format!("Failed to delete vault file: {}", e)))?;
    }

    Ok(())
}
