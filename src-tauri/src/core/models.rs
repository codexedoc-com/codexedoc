use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct NoteMeta {
    pub id: String,
    pub title: String,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Serialize, Deserialize)]
pub struct FileMeta {
    pub id: String,
    pub filename: String,
    pub size: i64,
    pub created_at: i64,
    pub updated_at: i64,
}