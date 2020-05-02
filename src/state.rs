use egg_mode::Token;

pub struct AppState {
	pub con_token: egg_mode::KeyPair,
	pub request_token: egg_mode::KeyPair,
	pub token: Option<Token>,
}