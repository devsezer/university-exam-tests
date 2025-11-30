mod auth_routes;
mod health_routes;
mod role_routes;
mod test_routes;
mod user_routes;

pub use auth_routes::auth_routes;
pub use health_routes::health_routes;
pub use role_routes::admin_role_routes;
pub use test_routes::{admin_test_routes, test_routes};
pub use user_routes::admin_user_routes;

