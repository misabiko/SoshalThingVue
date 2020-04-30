use actix_files::NamedFile;
use actix_web::{get, middleware::Logger, web, App, HttpServer, HttpResponse};
use egg_mode::{
	self,
	search::{self, ResultType},
	service::{self, SearchMethod},
	tweet::Tweet,
	user::TwitterUser,
};
use env_logger::Env;
use serde::Deserialize;
use serde_json::json;
use std::{
	fs,
	io::Result,
	time::{Duration, Instant},
};

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

/* impl Responder for Vec<Tweet> {
	type Error = Error;
	type Future = Ready<Result<HttpResponse>>;

	fn respond_to(self, _req: &HttpRequest) -> Self::Future {
		let body = serde_json::to_string(&self).unwrap();

		ready(Ok(HttpResponse::Ok()
			.content_type("application/json")
			.body(body)))
	}
}

impl Serialize for Tweet {
	fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
	where
		S: Serializer,
	{
		let mut s = serializer.serialize_struct("Person", 3)?;
		s.serialize_field("name", &self.name)?;
		s.serialize_field("age", &self.age)?;
		s.serialize_field("phones", &self.phones)?;
		s.end()
	}
} */

/* async fn get_tweets(data: web::Data<AppState>, endpoint: web::Path<Endpoint>) -> web::Json<Vec<Tweet>> {
	let rl_status = service::rate_limit_status(&data.token).await.unwrap()
		.search[&SearchMethod::Search].rate_limit_status;
	println!("Remaining: {}", rl_status.remaining);
	let duration = Duration::from_secs(rl_status.reset as u64) - Instant::now().elapsed();
	println!("Reset in {:.2} minutes.", duration.as_secs_f32() / 60.0);

	/* if rl_status.remaining < 100 {
		//let duration = Duration::from_secs(rl_status.reset as u64) - Instant::now().elapsed();
		//println!("Rate limit reached. Reset in {:.2} minutes.", duration.as_secs_f32() / 60.0);
	}else {
	} */
	web::Json(Vec::<Tweet>::new())
} */

/* async fn search_tweets((data, query): (web::Data<AppState>, web::Query<String>)) -> String {
	let rl_status = service::rate_limit_status(&data.token).await.unwrap()
		.search[&SearchMethod::Search].rate_limit_status;
	println!("Remaining: {}", rl_status.remaining);
	let duration = Duration::from_secs(rl_status.reset as u64) - Instant::now().elapsed();
	println!("Reset in {:.2} minutes.", duration.as_secs_f32() / 60.0);

	if rl_status.remaining < 100 {
		//let duration = Duration::from_secs(rl_status.reset as u64) - Instant::now().elapsed();
		//println!("Rate limit reached. Reset in {:.2} minutes.", duration.as_secs_f32() / 60.0);
		web::Json(Vec::<Tweet>::new())
	}else {
		web::Json(search::search(query.to_string())
		.result_type(ResultType::Recent)
		.count(3)
		.call(&data.token)
		.await
		.unwrap()
		.statuses)
	}
} */

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
	let duration = Duration::from_secs(rl_status.reset as u64) - Instant::now().elapsed();
	println!("Reset in {:.2} minutes.", duration.as_secs_f32() / 60.0);

	println!("{:?}", query.q);

	if rl_status.remaining < 100 {
		//let duration = Duration::from_secs(rl_status.reset as u64) - Instant::now().elapsed();
		//println!("Rate limit reached. Reset in {:.2} minutes.", duration.as_secs_f32() / 60.0);
		HttpResponse::Ok().json("[]")
	} else {
		let result = search::search(query.q.to_string())
			.result_type(ResultType::Recent)
			.count(3)
			.call(&data.token)
			.await
			.unwrap();

		let resp = HttpResponse::Ok().json(
			&result
				.statuses
				.iter()
				.map(tweet_to_json)
				.collect::<Vec<serde_json::Value>>(),
		);
		println!("{:?}", resp);
		resp
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

fn tweet_to_json(tweet: &Tweet) -> serde_json::Value {
	json!({
		"text": tweet.text,
		"id": tweet.id,
		"created_at": tweet.created_at,
		"user": if let Some(user) = &tweet.user {twitter_user_to_json(&user)}else {json!(false)},
		//"source": tweet.source,
		"favorite_count": tweet.favorite_count,
		"retweet_count": tweet.retweet_count,
		"lang": tweet.lang,
		"coordinates": tweet.coordinates,
		//"place": tweet.place,
		"display_text_range": tweet.display_text_range,
		"truncated": tweet.truncated,
		"favorited": tweet.favorited,
		"retweeted": tweet.retweeted,
	})
}

fn twitter_user_to_json(user: &TwitterUser) -> serde_json::Value {
	json!({
		"id": user.id,
		"screen_name": user.screen_name,
		"name": user.name,
		"verified": user.verified,
		"protected": user.protected,
		"description": user.description,
		"location": user.location,
		"url": user.url,
		"statuses_count": user.statuses_count,
		"friends_count": user.friends_count,
		"followers_count": user.followers_count,
		"favourites_count": user.favourites_count,
		"listed_count": user.listed_count,
		"profile_image_url": user.profile_image_url,
		"profile_image_url_https": user.profile_image_url_https,
		"profile_banner_url": user.profile_banner_url,
	})
}

#[actix_rt::main]
async fn main() -> Result<()> {
	/* let token = get_token().unwrap();
	let result = search::search("@misabiko")
		.result_type(ResultType::Recent)
		.count(3)
		.call(&token)
		.await
		.unwrap();
	println!(
		"{}",
		serde_json::to_string_pretty(
			&result.statuses
				.iter()
				.map(tweet_to_json)
				.collect::<Vec<serde_json::Value>>()
		)
		.unwrap()
	);

	println!(
		"{:?}",
		service::rate_limit_status(&token).await.unwrap().search
	); */
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
		//.route("/twitter/tweets/{subject}/{action}", web::get().to(get_tweets))
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
