use std::net::SocketAddr;
use std::time::Duration;

use axum::Router;
use tokio::net::TcpListener;
use tokio::signal;
use tracing::info;

use crate::state::AppState;

/// Runs the HTTP server with graceful shutdown support.
pub async fn run_server(app: Router, addr: &str, shutdown_timeout: Duration) {
    let listener = TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");

    info!("Server listening on {}", addr);

    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .with_graceful_shutdown(shutdown_signal(shutdown_timeout))
    .await
    .expect("Server error");
}

/// Signal handler for graceful shutdown.
async fn shutdown_signal(timeout: Duration) {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("Failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    info!(
        "Shutdown signal received, starting graceful shutdown (timeout: {:?})...",
        timeout
    );

    // Give in-flight requests time to complete
    tokio::time::sleep(Duration::from_secs(1)).await;

    info!("Graceful shutdown complete");
}

/// Creates the application router with all routes.
pub fn create_app(state: AppState) -> Router {
    use crate::openapi::ApiDoc;
    use crate::routes;
    use tower_http::{
        compression::CompressionLayer,
        cors::{Any, CorsLayer},
        trace::TraceLayer,
    };
    use utoipa::OpenApi;
    use utoipa_swagger_ui::SwaggerUi;

    // Build CORS layer
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build the router
    Router::new()
        .merge(routes::health_routes())
        .merge(routes::auth_routes())
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(CompressionLayer::new())
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state)
}

