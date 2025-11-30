use std::time::Duration;

use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use infrastructure::config::Settings;
use infrastructure::database::{create_pool, run_migrations};

mod dto;
mod errors;
mod extractors;
mod handlers;
mod middleware;
mod openapi;
mod routes;
mod server;
mod state;

use server::{create_app, run_server};
use state::AppState;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,tower_http=debug,sqlx=warn".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Starting Rust API Boilerplate...");

    // Load configuration
    let settings = Settings::from_env()?;
    info!("Configuration loaded successfully");
    info!("Environment: {}", settings.app.env);

    // Create database pool
    let db_pool = create_pool(&settings.database.url, settings.database.max_connections).await?;
    info!("Database connection pool created");

    // Run migrations
    run_migrations(&db_pool).await?;
    info!("Database migrations completed");

    // Create application state
    let state = AppState::new(db_pool, settings.clone());
    info!("Application state initialized");

    // Create the application router
    let app = create_app(state);

    // Get server address
    let addr = settings.server_addr();
    let shutdown_timeout = Duration::from_secs(settings.shutdown.timeout_seconds);

    info!("Starting server on {}", addr);

    // Run the server
    run_server(app, &addr, shutdown_timeout).await;

    info!("Server shutdown complete");

    Ok(())
}

