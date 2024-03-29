use std::fmt;
use warp::reject::Reject;

use serde_derive::Serialize;
use std::convert::Infallible;
use warp::{Rejection, Reply};

#[derive(Debug)]
pub enum ErrorType {
    NotFound,
    Internal,
    BadRequest,
    UsernameAlreadyExists,
    EmailAlreadyExists,
    InvalidUsername,
    InvalidPassword,
    FailedToSearch,
    FailedToGetMovieDetails,
    FailedToGetPersonDetails,
    InvalidJwtToken,
    WSClientNotRegistered,
    WSClientAlreadyRegisted,
    ReviewNotFound,
    InvalidListOwnership,
    DuplicateListItem,
    WatchlistNotFound,
    NoListIdProvided,
    UserDoesntOwnReview,
    UserDoesntOwnRating,
    UserDoesntOwnComment,
    UserDoesntOwnItem,
}

#[derive(Debug)]
pub struct AppError {
    pub err_type: ErrorType,
    pub message: String,
}

impl AppError {
    pub fn new(message: &str, err_type: ErrorType) -> AppError {
        AppError {
            message: message.to_string(),
            err_type,
        }
    }

    pub fn to_http_status(&self) -> warp::http::StatusCode {
        match self.err_type {
            ErrorType::NotFound => warp::http::StatusCode::NOT_FOUND,
            ErrorType::Internal => {
                warp::http::StatusCode::INTERNAL_SERVER_ERROR
            }
            ErrorType::BadRequest => warp::http::StatusCode::BAD_REQUEST,
            ErrorType::UsernameAlreadyExists => {
                warp::http::StatusCode::CONFLICT
            }
            ErrorType::EmailAlreadyExists => warp::http::StatusCode::CONFLICT,
            ErrorType::InvalidUsername => warp::http::StatusCode::NOT_FOUND,
            ErrorType::InvalidPassword => warp::http::StatusCode::NOT_FOUND,
            ErrorType::FailedToSearch => warp::http::StatusCode::BAD_REQUEST,
            ErrorType::FailedToGetMovieDetails => {
                warp::http::StatusCode::BAD_REQUEST
            }
            ErrorType::FailedToGetPersonDetails => {
                warp::http::StatusCode::BAD_REQUEST
            }
            ErrorType::InvalidJwtToken => warp::http::StatusCode::UNAUTHORIZED,
            ErrorType::WSClientNotRegistered => {
                warp::http::StatusCode::UNAUTHORIZED
            }
            ErrorType::WSClientAlreadyRegisted => {
                warp::http::StatusCode::CONFLICT
            }
            ErrorType::ReviewNotFound => warp::http::StatusCode::NOT_FOUND,
            ErrorType::InvalidListOwnership => {
                warp::http::StatusCode::UNAUTHORIZED
            }
            ErrorType::DuplicateListItem => warp::http::StatusCode::CONFLICT,
            ErrorType::WatchlistNotFound => warp::http::StatusCode::NOT_FOUND,
            ErrorType::NoListIdProvided => warp::http::StatusCode::BAD_REQUEST,
            ErrorType::UserDoesntOwnReview => {
                warp::http::StatusCode::UNAUTHORIZED
            }
            ErrorType::UserDoesntOwnRating => {
                warp::http::StatusCode::UNAUTHORIZED
            }
            ErrorType::UserDoesntOwnComment => {
                warp::http::StatusCode::UNAUTHORIZED
            }
            ErrorType::UserDoesntOwnItem => {
                warp::http::StatusCode::UNAUTHORIZED
            }
        }
    }

    pub fn from_diesel_err(
        err: diesel::result::Error,
        context: &str,
    ) -> AppError {
        AppError::new(
            format!("{}: {}", context, err.to_string()).as_str(),
            match err {
                diesel::result::Error::DatabaseError(db_err, _) => match db_err
                {
                    diesel::result::DatabaseErrorKind::UniqueViolation => {
                        ErrorType::BadRequest
                    }
                    _ => ErrorType::Internal,
                },
                diesel::result::Error::NotFound => ErrorType::NotFound,
                // Here we can handle other cases if needed
                _ => ErrorType::Internal,
            },
        )
    }
}

impl std::error::Error for AppError {}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl Reject for AppError {}
#[derive(Serialize)]
struct ErrorMessage {
    code: u16,
    message: String,
}

pub async fn handle_rejection(
    err: Rejection,
) -> Result<impl Reply, Infallible> {
    let code;
    let message;

    if err.is_not_found() {
        code = warp::http::StatusCode::NOT_FOUND;
        message = "Not Found";
    } else if let Some(app_err) = err.find::<AppError>() {
        code = app_err.to_http_status();
        message = app_err.message.as_str();
    } else if let Some(_) = err.find::<warp::reject::InvalidHeader>() {
        code = warp::http::StatusCode::UNAUTHORIZED;
        message = "Must be logged in";
    } else if let Some(_) =
        err.find::<warp::filters::body::BodyDeserializeError>()
    {
        code = warp::http::StatusCode::BAD_REQUEST;
        message = "Invalid Body";
    } else if let Some(_) = err.find::<warp::reject::MethodNotAllowed>() {
        code = warp::http::StatusCode::METHOD_NOT_ALLOWED;
        message = "Method Not Allowed";
    } else {
        // In case we missed something - log and respond with 500
        eprintln!("unhandled rejection: {:?}", err);
        code = warp::http::StatusCode::INTERNAL_SERVER_ERROR;
        message = "Unhandled rejection";
    }

    let json = warp::reply::json(&ErrorMessage {
        code: code.as_u16(),
        message: message.into(),
    });

    Ok(warp::reply::with_status(json, code))
}
