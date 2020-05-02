use serde::Serialize;
use chrono::{DateTime, Utc};

#[allow(non_snake_case)]
#[derive(Serialize, Debug)]
pub struct PostData {
	pub id: String,
	pub creationTime: DateTime<Utc>,
	pub authorName: String,
	pub authorHandle: String,
	pub authorAvatar: String,
	pub text: String,
	pub images: Option<Vec<String>>,
	pub liked: bool,
	pub reposted: bool,
}