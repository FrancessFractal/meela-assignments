use std::env;

use log::info;
use poem::{
    EndpointExt, Route, Server,
    endpoint::{StaticFileEndpoint, StaticFilesEndpoint},
    error::ResponseError,
    get, handler,
    http::StatusCode,
    listener::TcpListener,
    web::{Data, Json, Path},
};
use serde::Serialize;
use serde::Deserialize;
use sqlx::SqlitePool;

#[derive(Debug, thiserror::Error)]
enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Sqlx(#[from] sqlx::Error),
    #[error(transparent)]
    Var(#[from] std::env::VarError),
    #[error(transparent)]
    Dotenv(#[from] dotenv::Error)
}

impl ResponseError for Error {
    fn status(&self) -> StatusCode {
        StatusCode::INTERNAL_SERVER_ERROR
    }
}

async fn init_pool() -> Result<SqlitePool, Error> {
    let pool = SqlitePool::connect(&env::var("DATABASE_URL")?).await?;
    Ok(pool)
}

#[derive(Serialize)]
struct ApplicationStatusResponse {
    current_page: String,
    application_submitted: bool,
    patient_age: Option<String>,
    patient_gender: Option<String>,
    therapist_minority_competence: Vec<String>,
}

#[handler]
async fn get_application_status(
    Data(pool): Data<&SqlitePool>,
    Path(id): Path<i16>,
) -> Result<Json<ApplicationStatusResponse>, Error> {
    info!("get_application_status called with id: {}", id);

    let application = sqlx::query!("select application_submitted, current_page, patient_age, patient_gender from applications where id=$1", id)
        .fetch_one(pool)
        .await?;

    let therapist_minority_competence = sqlx::query!(
            "select name from therapist_minority_competence_responses where application_id = $1",
            id
        )
        .fetch_all(pool)
        .await?
        .iter()
        .map(|record| record.name.clone())
        .collect();

    Ok(Json(ApplicationStatusResponse {
        current_page: application.current_page,
        application_submitted: application.application_submitted > 0,
        patient_age: application.patient_age,
        patient_gender: application.patient_gender,
        therapist_minority_competence,
    }))
}


#[derive(Serialize)]
struct ApplicationBasicInfo {
    application_id: i64,
    current_page: String,
    application_submitted: bool,
}

#[derive(Serialize)]
struct ApplicationListResponse {
    applications: Vec<ApplicationBasicInfo>,
}

#[handler]
async fn get_application_list(
    Data(pool): Data<&SqlitePool>,
) -> Result<Json<ApplicationListResponse>, Error> {
    info!("get_application_list called");

    let applications = sqlx::query!("select id, current_page, application_submitted from applications")
        .fetch_all(pool)
        .await?;

    Ok(Json(ApplicationListResponse {
        applications: applications.iter().map(|application| ApplicationBasicInfo {
            application_id: application.id,
            application_submitted: application.application_submitted > 0,
            current_page: application.current_page.clone()
        }).collect(),
    }))
}

#[derive(Deserialize)]
struct UpdateApplicationPayload {
    current_page: Option<String>,
    application_submitted: Option<bool>,
    patient_age: Option<String>,
    patient_gender: Option<String>,
    therapist_minority_competence_responses: Option<Vec<String>>,
}

#[handler]
async fn update(
    Data(pool): Data<&SqlitePool>,
    Path(id): Path<i16>,
    data: Json<UpdateApplicationPayload>,
) -> Result<(), Error> {
    info!("Updating application with id: {}", id);
    let mut tx = pool.begin().await?;

    if let Some(current_page) = &data.current_page {
        let query = sqlx::query!(
            "update applications set current_page=$2 where id=$1",
            id,
            current_page
        );
        query.execute(&mut *tx).await?;
    }

    if let Some(application_submitted) = &data.application_submitted {
        let query = sqlx::query!(
            "update applications set application_submitted=$2 where id=$1",
            id,
            application_submitted,
        );
        query.execute(&mut *tx).await?;
    }

    if let Some(patient_age) = &data.patient_age {
        let query = sqlx::query!(
            "update applications set patient_age=$2 where id=$1",
            id,
            patient_age
        );
        query.execute(&mut *tx).await?;
    }

    if let Some(patient_gender) = &data.patient_gender {
        let query = sqlx::query!(
            "update applications set patient_gender=$2 where id=$1",
            id,
            patient_gender
        );
        query.execute(&mut *tx).await?;
    }

    if let Some(values) = &data.therapist_minority_competence_responses {
        let query = sqlx::query!(
            "delete from therapist_minority_competence_responses where application_id=$1",
            id,
        );
        query.execute(&mut *tx).await?;

        for value in values {
            let query = sqlx::query!(
                "insert into therapist_minority_competence_responses (application_id, name) values($1, $2)",
                id,
                value
            );
            query.execute(&mut *tx).await?;
        }
    }

    let _ = tx.commit().await;
    Ok(())
}



#[derive(Serialize)]
struct CreatedApplicationResponse {
    application_id: i64,
}
#[handler]
async fn create(
    Data(pool): Data<&SqlitePool>,
) -> Result<Json<CreatedApplicationResponse>, Error> {
    info!("Creating a new application");
    let mut tx = pool.begin().await?;

    let query = sqlx::query!(
            "insert into applications (id) values (null)",
        );
    let result = query.execute(&mut *tx).await?;

    let _ = tx.commit().await;
    Ok(Json(CreatedApplicationResponse { application_id: result.last_insert_rowid()}))
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    dotenv::dotenv()?;
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    info!("Initialize db pool");
    let pool = init_pool().await?;
    let app = Route::new()
        .at("/api/application", get(get_application_list).post(create))
        .at("/api/application/:id",
            get(get_application_status)
                .patch(update)
        )
        .at("/favicon.ico", StaticFileEndpoint::new("www/favicon.ico"))
        .nest("/static/", StaticFilesEndpoint::new("www"))
        .at("*", StaticFileEndpoint::new("www/index.html"))
        .data(pool);
    Server::new(TcpListener::bind("0.0.0.0:3005"))
        .run(app)
        .await?;

    Ok(())
}
