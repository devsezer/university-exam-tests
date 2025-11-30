use sqlx::postgres::{PgPool, PgPoolOptions};
use std::time::Duration;
use tracing::info;

/// Type alias for the PostgreSQL connection pool.
pub type DatabasePool = PgPool;

/// Creates a new PostgreSQL connection pool.
///
/// # Arguments
///
/// * `database_url` - The PostgreSQL connection string
/// * `max_connections` - Maximum number of connections in the pool
///
/// # Returns
///
/// A configured connection pool ready for use.
pub async fn create_pool(
    database_url: &str,
    max_connections: u32,
) -> Result<DatabasePool, sqlx::Error> {
    info!(
        "Creating database connection pool with max_connections={}",
        max_connections
    );

    let pool = PgPoolOptions::new()
        .max_connections(max_connections)
        .min_connections(1)
        .acquire_timeout(Duration::from_secs(5))
        .idle_timeout(Duration::from_secs(600))
        .max_lifetime(Duration::from_secs(1800))
        .connect(database_url)
        .await?;

    info!("Database connection pool created successfully");

    Ok(pool)
}

/// Runs database migrations.
pub async fn run_migrations(pool: &DatabasePool) -> Result<(), sqlx::migrate::MigrateError> {
    info!("Running database migrations...");
    sqlx::migrate!("../../migrations").run(pool).await?;
    info!("Database migrations completed successfully");
    Ok(())
}

