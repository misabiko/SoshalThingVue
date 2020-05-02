use std::{
	task::{Context, Poll},
	sync::Mutex,
};
use actix_service::{Service, Transform};
use actix_web::{
	dev::{ServiceRequest, ServiceResponse},
	http,
	Error,
	HttpResponse,
};
use futures::future::{ok, Either, Ready};

use crate::state::AppState;

pub struct CheckLogin;

impl<S, B> Transform<S> for CheckLogin
	where
		S: Service<Request=ServiceRequest, Response=ServiceResponse<B>, Error=Error>,
		S::Future: 'static,
{
	type Request = ServiceRequest;
	type Response = ServiceResponse<B>;
	type Error = Error;
	type Transform = CheckLoginMiddleware<S>;
	type InitError = ();
	type Future = Ready<Result<Self::Transform, Self::InitError>>;

	fn new_transform(&self, service: S) -> Self::Future {
		ok(CheckLoginMiddleware { service })
	}
}

pub struct CheckLoginMiddleware<S> {
	service: S,
}

impl<S, B> Service for CheckLoginMiddleware<S>
	where
		S: Service<Request=ServiceRequest, Response=ServiceResponse<B>, Error=Error>,
		S::Future: 'static,
{
	type Request = ServiceRequest;
	type Response = ServiceResponse<B>;
	type Error = Error;
	type Future = Either<S::Future, Ready<Result<Self::Response, Self::Error>>>;

	fn poll_ready(&mut self, ctx: &mut Context) -> Poll<Result<(), Self::Error>> {
		self.service.poll_ready(ctx)
	}

	fn call(&mut self, req: ServiceRequest) -> Self::Future {
		let is_logged_in = if let Some(data) = req.app_data::<Mutex<AppState>>() {
			data.lock().unwrap().token.is_some()
		}else {false};
		println!("is_logged_in: {}", is_logged_in);

		if is_logged_in || req.path() == "/twitter/login" || req.path() == "/twitter/callback" {
			Either::Left(self.service.call(req))
		} else {
			Either::Right(ok(req.into_response(
				HttpResponse::Found()
					.header(http::header::LOCATION, "/twitter/login")
					.finish()
					.into_body(),
			)))
		}
	}
}