use uuid::Uuid;
use chrono::Utc;
use sqlx::{Row, SqlitePool};
use crate::core::models::NoteMeta;
use crate::error::{CodexError, CodexResult};

use super::encryption::EncryptionManager;
use super::storage::{save_note_file, load_note_file, delete_note_file};
use super::key_manager::get_key;

pub struct Vault {
    pub db: SqlitePool,
}

impl Vault {
    pub fn new(db: SqlitePool) -> Self {
        Self { db }
    }

    pub async fn create_note(&self, title: String, content: String) -> CodexResult<String> {
        let id = Uuid::new_v4().to_string();
        let key = get_key()?;

        let encrypted = EncryptionManager::encrypt(key, content.as_bytes())?;
        save_note_file(&id, &encrypted)?;

        let now = Utc::now().timestamp();

        sqlx::query(
            "INSERT INTO notes (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)"
        )
        .bind(&id)
        .bind(&title)
        .bind(now)
        .bind(now)
        .execute(&self.db)
        .await?;

        Ok(id)
    }

    pub async fn list_notes(&self) -> CodexResult<Vec<NoteMeta>> {
        let rows = sqlx::query(
            "SELECT id, title, created_at, updated_at FROM notes ORDER BY updated_at DESC"
        )
        .fetch_all(&self.db)
        .await?;

        Ok(rows
            .into_iter()
            .map(|row| {
                let id: String = row.get("id");
                let title: String = row.get("title");
                let created_at: i64 = row.get("created_at");
                let updated_at: i64 = row.get("updated_at");

                NoteMeta {
                    id,
                    title,
                    created_at,
                    updated_at,
                }
            })
            .collect())
    }

    pub fn load_note(&self, id: String) -> CodexResult<String> {
        let key = get_key()?;

        let encrypted = load_note_file(&id)?;
        let decrypted = EncryptionManager::decrypt(key, &encrypted)?;

        String::from_utf8(decrypted)
            .map_err(|e| CodexError::DecryptionFailed(format!("UTF8 decode failed: {}", e)))
    }

    pub async fn update_note(&self, id: String, title: String, content: String) -> CodexResult<()> {
        let key = get_key()?;

        let encrypted = EncryptionManager::encrypt(key, content.as_bytes())?;
        save_note_file(&id, &encrypted)?;

        let now = Utc::now().timestamp();

        sqlx::query(
            "UPDATE notes SET title = ?, updated_at = ? WHERE id = ?"
        )
        .bind(&title)
        .bind(now)
        .bind(&id)
        .execute(&self.db)
        .await?;

        Ok(())
    }

    pub async fn get_note_meta(&self, id: String) -> CodexResult<NoteMeta> {
        let row = sqlx::query(
            "SELECT id, title, created_at, updated_at FROM notes WHERE id = ?"
        )
        .bind(&id)
        .fetch_one(&self.db)
        .await?;

        Ok(NoteMeta {
            id: row.get("id"),
            title: row.get("title"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    pub async fn delete_note(&self, id: String) -> CodexResult<()> {
        // delete encrypted file
        delete_note_file(&id)?;

        // delete metadata
        sqlx::query("DELETE FROM notes WHERE id = ?")
            .bind(&id)
            .execute(&self.db)
            .await?;

        Ok(())
    }
}
