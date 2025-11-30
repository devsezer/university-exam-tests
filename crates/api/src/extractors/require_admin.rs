use axum::extract::FromRequestParts;
use axum::http::request::Parts;

use crate::errors::AppError;
use crate::extractors::CurrentUser;
use crate::state::AppState;

/// Extractor that requires the current user to be an admin.
/// Returns 403 Forbidden if the user is not an admin.
pub struct RequireAdmin(pub CurrentUser);

impl FromRequestParts<AppState> for RequireAdmin {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let current_user = CurrentUser::from_request_parts(parts, state).await?;

        if !current_user.is_admin() {
            return Err(AppError::Forbidden);
        }

        Ok(RequireAdmin(current_user))
    }
}

