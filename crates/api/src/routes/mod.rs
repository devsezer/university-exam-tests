mod auth_routes;
mod health_routes;
mod test_routes;

pub use auth_routes::auth_routes;
pub use health_routes::health_routes;
pub use test_routes::{admin_test_routes, test_routes};

