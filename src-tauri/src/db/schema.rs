use sqlx::{SqlitePool, Executor};

pub async fn init_db(pool: &SqlitePool) {
    pool.execute(
        r#"
        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        "#
    )
    .await
    .unwrap();
}