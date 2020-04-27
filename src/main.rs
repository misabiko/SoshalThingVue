use actix_files::NamedFile;
use actix_web::{get, App, HttpServer};
use egg_mode;
use serde::Deserialize;
use serde_json;
use std::{fs, io::Result};

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

#[actix_rt::main]
async fn main() -> Result<()> {
	let credentials_json = fs::read_to_string("credentials.json")?;
	let creds : Credentials = serde_json::from_str(&credentials_json).unwrap();
	
	let con_token = egg_mode::KeyPair::new(creds.consumer_key, creds.consumer_secret);
	let access_token = egg_mode::KeyPair::new(creds.access_token, creds.access_token_secret);
	let token = egg_mode::Token::Access {
		consumer: con_token,
		access: access_token,
	};

	let misabiko = egg_mode::user::show("misabiko", &token).await.unwrap();
	println!("{} (@{})", misabiko.name, misabiko.screen_name);
	
	//let request_token = egg_mode::request_token(&con_token, "oob").await.unwrap();
	//let auth_url = egg_mode::authorize_url(&request_token);
	//let verifier = "123456";
	//let (token, user_id, screen_name) = egg_mode::access_token(con_token, &request_token, verifier).await.unwrap();	

	HttpServer::new(|| {
		App::new()
			.service(index_html)
			.service(index_js)
			.service(index_css)
	})
	.bind("127.0.0.1:3000")?
	.run()
	.await
}