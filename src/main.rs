use actix_files::NamedFile;
use actix_web::{
    get,
    middleware::Logger,
    web,
    App,
    HttpServer,
    HttpResponse,
};
use egg_mode::{
    self,
    search::{self, ResultType},
    service::{self, SearchMethod},
    tweet::Tweet,
};
use env_logger::Env;
use serde::{Serialize, Deserialize};
use std::{fs, io::Result};
use chrono::{DateTime, Utc, NaiveDateTime};

#[derive(Deserialize, Debug)]
struct Credentials {
    consumer_key: String,
    consumer_secret: String,
    access_token: String,
    access_token_secret: String,
}

#[get("/")]
async fn index_html() -> Result<NamedFile> {
    println!("index_html!");
    NamedFile::open("dist/index.html")
}

#[get("/index.js")]
async fn index_js() -> Result<NamedFile> {
    println!("index_js!");
    NamedFile::open("dist/index.js")
}

#[get("/index.css")]
async fn index_css() -> Result<NamedFile> {
    println!("index_css!");
    NamedFile::open("dist/index.css")
}

#[derive(Deserialize, Debug)]
struct Endpoint {
    subject: String,
    action: String,
}

impl ToString for Endpoint {
    fn to_string(&self) -> String {
        format!("{}/{}", self.subject, self.action)
    }
}

#[derive(Deserialize)]
struct SearchQuery {
    q: String,
}

async fn search_tweets(
    (data, query): (web::Data<AppState>, web::Query<SearchQuery>),
) -> HttpResponse {
    let rl_status = service::rate_limit_status(&data.token)
        .await
        .unwrap()
        .search[&SearchMethod::Search]
        .rate_limit_status;
    println!("Remaining: {}", rl_status.remaining);

    if rl_status.remaining < 100 {
        let duration = DateTime::<Utc>::from_utc(NaiveDateTime::from_timestamp(rl_status.reset as i64, 0), Utc) - Utc::now();
        println!("Rate limit reached. Reset in {} minutes.", duration.num_minutes());
        HttpResponse::Ok().json("[]")
    } else {
        let result = search::search(query.q.to_string())
            .result_type(ResultType::Recent)
            .count(10)
            .call(&data.token)
            .await
            .unwrap();

        let mut v = Vec::<PostData>::new();

        for i in &result.statuses {
            v.push(PostData::from(i));
        }

        HttpResponse::Ok().json(v)
    }
}

struct AppState {
    token: egg_mode::Token,
}

fn get_token() -> Result<egg_mode::Token> {
    let credentials_json = fs::read_to_string("credentials.json")?;
    let creds: Credentials = serde_json::from_str(&credentials_json).unwrap();
    let con_token = egg_mode::KeyPair::new(creds.consumer_key, creds.consumer_secret);
    let access_token = egg_mode::KeyPair::new(creds.access_token, creds.access_token_secret);
    Ok(egg_mode::Token::Access {
        consumer: con_token,
        access: access_token,
    })
}

#[derive(Serialize, Debug)]
struct PostData {
    id: String,
    creationTime: DateTime<Utc>,
    authorName: String,
    authorHandle: String,
    authorAvatar: String,
    text: String,
    images: Option<Vec<String>>,
    liked: bool,
    reposted: bool,
}

impl From<&Tweet> for PostData {
    fn from(tweet: &Tweet) -> Self {
        let user = tweet.user.as_ref();
        let images = match &tweet.entities.media {
            Some(media_entities) => Some(media_entities.iter().map(|media_entity| media_entity.media_url.clone()).collect()),
            None => None,
        };

        PostData {
            id: tweet.id.to_string(),
            creationTime: tweet.created_at,
            authorName: if let Some(u) = user {u.name.clone()}else {String::new()},
            authorHandle: if let Some(u) = user {u.screen_name.clone()}else {String::new()},
            authorAvatar: if let Some(u) = user {u.profile_image_url.clone()}else {String::new()},
            text: tweet.text.clone(),
            images,
            liked: tweet.favorited.unwrap_or_default(),
            reposted: tweet.retweeted.unwrap_or_default(),
        }
    }
}

#[actix_rt::main]
async fn main() -> Result<()> {
    env_logger::from_env(Env::default().default_filter_or("info")).init();

    HttpServer::new(|| {
        App::new()
            .data(AppState {
                token: get_token().unwrap(),
            })
            .wrap(Logger::default())
            .service(index_html)
            .service(index_js)
            .service(index_css)
            .route("/twitter/tweets/search", web::get().to(search_tweets))
    })
        .bind("127.0.0.1:3000")?
        .run()
        .await
}

/* #[cfg(test)]
mod tests {
	use super::*;
	use actix_web::test;

	#[actix_rt::test]
	async fn test_get_tweets() {
		let resp = get_tweets(web::Data::new(AppState {token: get_token().unwrap()}), web::Path::<Endpoint>::from(
			Endpoint {subject: String::from("tweets"), action: String::from("search")}
		)).await;
		assert_eq!(resp, "tweets/search");
	}

	#[actix_rt::test]
	async fn test_integration_get_tweets() {
		let mut app = test::init_service(
			App::new().data(AppState {token: get_token().unwrap()}).route("/twitter/tweets/{subject}/{action}", web::get().to(get_tweets))
		).await;
		let req = test::TestRequest::with_uri("/twitter/tweets/search/tweets").to_request();
		let resp = test::call_service(&mut app, req).await;
		assert_eq!(resp.status(), http::StatusCode::OK);
	}
} */
