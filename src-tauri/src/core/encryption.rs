use aes_gcm::{Aes256Gcm, Key, Nonce};
use aes_gcm::aead::{Aead, KeyInit};
use argon2::{Argon2, password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString}};
use rand::RngCore;
use crate::error::{CodexError, CodexResult};

pub struct EncryptionManager;

impl EncryptionManager {
    pub fn derive_key(password: &str, salt: &[u8; 16]) -> CodexResult<[u8; 32]> {
        let mut key = [0u8; 32];
        let argon2 = Argon2::default();

        argon2
            .hash_password_into(password.as_bytes(), salt, &mut key)
            .map_err(|e| CodexError::EncryptionFailed(format!("Key derivation failed: {}", e)))?;

        Ok(key)
    }

    pub fn hash_password(password: &str) -> CodexResult<String> {
        let salt = SaltString::generate(&mut rand::thread_rng());
        let argon2 = Argon2::default();

        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| CodexError::EncryptionFailed(format!("Password hashing failed: {}", e)))?;

        Ok(password_hash.to_string())
    }

    pub fn verify_password(password: &str, hash: &str) -> CodexResult<bool> {
        let parsed_hash = PasswordHash::new(hash)
            .map_err(|e| CodexError::EncryptionFailed(format!("Invalid password hash: {}", e)))?;

        let argon2 = Argon2::default();
        Ok(argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok())
    }

    pub fn encrypt(key: &[u8; 32], plaintext: &[u8]) -> CodexResult<Vec<u8>> {
        let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));

        let mut nonce_bytes = [0u8; 12];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = cipher
            .encrypt(nonce, plaintext)
            .map_err(|e| CodexError::EncryptionFailed(format!("Encryption failed: {}", e)))?;

        // Prepend nonce to ciphertext
        Ok([nonce_bytes.to_vec(), ciphertext].concat())
    }

    pub fn decrypt(key: &[u8; 32], data: &[u8]) -> CodexResult<Vec<u8>> {
        if data.len() < 12 {
            return Err(CodexError::DecryptionFailed("Data too short".to_string()));
        }

        let (nonce_bytes, ciphertext) = data.split_at(12);

        let cipher = Aes256Gcm::new(Key::<Aes256Gcm>::from_slice(key));
        let nonce = Nonce::from_slice(nonce_bytes);

        cipher
            .decrypt(nonce, ciphertext)
            .map_err(|e| CodexError::DecryptionFailed(format!("Decryption failed: {}", e)))
    }
}
