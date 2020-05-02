mod state;
mod check_login;
mod common;
mod twitter;

use actix_files::NamedFile;
use actix_web::{
	get,
	middleware::Logger,
	web,
	App,
	HttpServer,
};
use env_logger::Env;
use std::{io::Result, sync::Mutex};

#[get("/")]
async fn index_html() -> Result<NamedFile> {
	NamedFile::open("dist/index.html")
}

#[get("/index.js")]
async fn index_js() -> Result<NamedFile> {
	NamedFile::open("dist/index.js")
}

#[get("/index.css")]
async fn index_css() -> Result<NamedFile> {
	NamedFile::open("dist/index.css")
}

#[actix_rt::main]
async fn main() -> Result<()> {
	env_logger::from_env(Env::default().default_filter_or("info")).init();
	let data = web::Data::new(Mutex::new(twitter::get_preauth_state().await?));

	HttpServer::new(move || {
		App::new()
			.wrap(Logger::default())
			.app_data(data.clone())
			.service(index_html)
			.service(index_js)
			.service(index_css)
			.service(
				web::scope("/twitter")
					.route("/tweets/search", web::get().to(twitter::search_tweets))
					.service(twitter::login)
					.service(twitter::callback)
			)

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
