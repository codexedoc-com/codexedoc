use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct NoteMeta {
    pub id: String,
    pub title: String,
    pub created_at: i64,
    pub updated_at: i64,
}