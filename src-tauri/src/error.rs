use std::fmt;

#[derive(Debug)]
pub enum CodexError {
    EncryptionFailed(String),
    DecryptionFailed(String),
    StorageError(String),
    DatabaseError(String),
    KeyManagerError(String),
    NotFound(String),
    ValidationError(String),
    IoError(String),
}

impl fmt::Display for CodexError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            CodexError::EncryptionFailed(msg) => write!(f, "Encryption failed: {}", msg),
            CodexError::DecryptionFailed(msg) => write!(f, "Decryption failed: {}", msg),
            CodexError::StorageError(msg) => write!(f, "Storage error: {}", msg),
            CodexError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            CodexError::KeyManagerError(msg) => write!(f, "Key manager error: {}", msg),
            CodexError::NotFound(msg) => write!(f, "Not found: {}", msg),
            CodexError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            CodexError::IoError(msg) => write!(f, "IO error: {}", msg),
        }
    }
}

impl std::error::Error for CodexError {}

// Conversions from other error types
impl From<sqlx::Error> for CodexError {
    fn from(err: sqlx::Error) -> Self {
        CodexError::DatabaseError(err.to_string())
    }
}

impl From<std::io::Error> for CodexError {
    fn from(err: std::io::Error) -> Self {
        CodexError::IoError(err.to_string())
    }
}

impl From<std::string::FromUtf8Error> for CodexError {
    fn from(err: std::string::FromUtf8Error) -> Self {
        CodexError::DecryptionFailed(err.to_string())
    }
}

pub type CodexResult<T> = Result<T, CodexError>;
