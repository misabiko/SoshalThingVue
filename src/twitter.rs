use actix_web::{web, get, HttpResponse, http};
use egg_mode::{
	self,
	search::{self, ResultType},
	service::{self, SearchMethod, TweetMethod},
	tweet::{self, Tweet},
};
use chrono::{DateTime, Utc, NaiveDateTime};
use serde::{Serialize, Deserialize};
use std::{io::Result, sync::Mutex};
use crate::state::AppState;
use crate::common::PostData;

#[derive(Deserialize, Debug)]
struct Credentials {
	consumer_key: String,
	consumer_secret: String,
	access_token: String,
	access_token_secret: String,
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
			authorName: if let Some(u) = user { u.name.clone() } else { String::new() },
			authorHandle: if let Some(u) = user { u.screen_name.clone() } else { String::new() },
			authorAvatar: if let Some(u) = user { u.profile_image_url.clone() } else { String::new() },
			text: tweet.text.clone(),
			images,
			liked: tweet.favorited.unwrap_or_default(),
			reposted: tweet.retweeted.unwrap_or_default(),
		}
	}
}

#[derive(Deserialize, Debug)]
pub struct TwitterAuth {
	oauth_token: String,
	oauth_verifier: String,
}

#[derive(Serialize)]
enum LoginPayload {
	PreAuth {
		auth_url: String,
	},
	LoggedIn,
}

#[get("/login")]
pub async fn login(data: web::Data<Mutex<AppState>>) -> Result<HttpResponse> {
	let data = data.lock().unwrap();
	if data.token.is_some() {
		Ok(HttpResponse::Ok().json(
			LoginPayload::LoggedIn
		))
	} else {
		Ok(HttpResponse::Ok().json(
			LoginPayload::PreAuth {
				auth_url: egg_mode::authenticate_url(&data.request_token)
			}
		))
	}
}

#[get("callback")]
pub async fn callback((data, web::Query(auth)): (web::Data<Mutex<AppState>>, web::Query<TwitterAuth>)) -> Result<HttpResponse> {
	let mut data = data.lock().unwrap();
	let (token, _user_id, _screen_name) = egg_mode::access_token(data.con_token.clone(), &data.request_token, auth.oauth_verifier).await.unwrap();
	data.token = Some(token);

	//TODO return 200
	Ok(HttpResponse::Found()
		.header(http::header::LOCATION, "/")
		.finish()
		.into_body())
}

/*pub async fn get_rl_status(token: &egg_mode::Token) -> egg_mode::Response<RateLimitStatus> {
	if let Ok(rl_status) = service::rate_limit_status(&token).await {
		rl_status
	}else {
		Err(std::io::Error("Failed to query rate limit status"))
	}
}*/

#[derive(Deserialize)]
pub struct SearchQuery {
	q: String,
}

pub async fn search_tweets(
	(data, query): (web::Data<Mutex<AppState>>, web::Query<SearchQuery>),
) -> Result<web::Json<Vec<PostData>>> {
	let data = data.lock().unwrap();
	let token = match &data.token {
		Some(token) => token,
		None => panic!("User not authenticated."),
	};

	if let Ok(rl_status) = service::rate_limit_status(&token).await {
		let rl_status = rl_status.search[&SearchMethod::Search].rate_limit_status;
		println!("Remaining: {}", rl_status.remaining);

		if rl_status.remaining < 5 {
			let duration = DateTime::<Utc>::from_utc(NaiveDateTime::from_timestamp(rl_status.reset as i64, 0), Utc) - Utc::now();
			println!("Rate limit reached. Reset in {} minutes.", duration.num_minutes());
			Ok(web::Json(Vec::<PostData>::new()))
		} else {
			let result = search::search(query.q.to_string())
				.result_type(ResultType::Recent)
				.count(10)
				.call(token)
				.await
				.unwrap();

			let mut v = Vec::<PostData>::new();

			for i in &result.statuses {
				v.push(PostData::from(i));
			}

			Ok(web::Json(v))
		}
	} else {
		println!("Failed to query rate limit status");
		Ok(web::Json(Vec::<PostData>::new()))
	}
}

pub async fn home_timeline(data: web::Data<Mutex<AppState>>) -> Result<web::Json<Vec<PostData>>> {
	let data = data.lock().unwrap();
	let token = match &data.token {
		Some(token) => token,
		None => panic!("User not authenticated."),
	};

	if let Ok(rl_status) = service::rate_limit_status(&token).await {
		let rl_status = rl_status.tweet[&TweetMethod::HomeTimeline].rate_limit_status;
		println!("Home timeline remaining: {}", rl_status.remaining);

		if rl_status.remaining < 5 {
			let duration = DateTime::<Utc>::from_utc(NaiveDateTime::from_timestamp(rl_status.reset as i64, 0), Utc) - Utc::now();
			println!("Rate limit reached for home timeline. Reset in {} minutes.", duration.num_minutes());
			Ok(web::Json(Vec::<PostData>::new()))
		} else {
			let timeline = tweet::home_timeline(&token);

			let (_timeline, feed) = timeline.start().await.unwrap();

			let mut v = Vec::<PostData>::new();
			for tweet in &*feed {
				v.push(PostData::from(tweet));
			}
			Ok(web::Json(v))
		}
	} else {
		println!("Failed to query rate limit status");
		Ok(web::Json(Vec::<PostData>::new()))
	}
}

pub async fn get_preauth_state() -> Result<AppState> {
	let credentials_json = std::fs::read_to_string("credentials.json")?;
	let creds: Credentials = serde_json::from_str(&credentials_json).unwrap();
	let con_token = egg_mode::KeyPair::new(creds.consumer_key, creds.consumer_secret);

	let request_token = egg_mode::request_token(&con_token, "http://127.0.0.1:3000/twitter/callback").await.unwrap();

	Ok(AppState {
		con_token,
		request_token,
		token: None,
	})
}