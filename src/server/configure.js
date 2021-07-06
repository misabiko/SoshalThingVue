const Twitter = require('twitter-lite')
const morgan = require('morgan')
const got = require('got')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const connectMemoryStore = require('memorystore')
const passport = require('passport')
const {Strategy: TwitterStrategy} = require('passport-twitter')

function parseQueryErrors(e, res, next) {
	console.error('Parsing errors:')
	let response = {}

	if ('errors' in e) {
		for (const error of e.errors)
			console.error(error)
		response = {...response, ...e}
	}else {
		console.error(e)
		response.errors = [e]
	}

	if (response.errors?.find(err => err.code))
		res.json(e)
	else
		next(e)
}

function objectifyResponse(response) {
	if (!response._headers)
		return response

	if (response.statuses) {
		response._headers = Object.fromEntries(response._headers.entries())
		return response
	}

	return {
		statuses: Array.isArray(response) ? response : [response],
		_headers: Object.fromEntries(response._headers.entries())
	}
}

function logRateLimit(response) {
	console.log(`\nRate: ${response._headers.get('x-rate-limit-remaining')} / ${response._headers.get('x-rate-limit-limit')}`)
	const reset = response._headers.get('x-rate-limit-reset')
	const delta = (reset * 1000) - Date.now()
	console.log(`Reset: ${Math.ceil(delta / 1000 / 60)} minutes`)
}

function preventUnauthorized(req, res, next) {
	if (req.user)
		next()
	else
		res.sendStatus(401)
}

module.exports = app => {
	const MemoryStore = connectMemoryStore(session)

	app.use(morgan('dev'))
	app.use(cookieParser())
	app.use(session({
		cookie: {maxAge: 86400000},
		store: new MemoryStore({
			checkPeriod: 86400000,
		}),
		secret: 'ehyAv3bH2AwKMMWiOgOeNlOYg',
		resave: false,
		saveUninitialized: true,
		//cookie: {secure: true},	TODO Implement HTTPS
	}))
	app.use(passport.initialize())
	app.use(passport.session())

	let credentials, clientV1, clientV2, authUser

	passport.serializeUser(function(user, cb) {
		cb(null, user.id)
	})

	passport.deserializeUser(function(id, cb) {
		if (!authUser)
			cb(new Error(`User login data hasn't been initialized.`))
		else if (id !== authUser.id)
			cb(new Error(`"${id}" isn't a valid user id.`))
		else
			cb(null, authUser)
	})

	try {
		credentials = require('../../credentials.json')

		clientV1 = new Twitter({
			consumer_key: credentials.consumer_key,
			consumer_secret: credentials.consumer_secret,
		})

		clientV2 = new Twitter({
			version: '2',
			extension: false,
			//consumer_key: credentials.consumer_key,
			//consumer_secret: credentials.consumer_secret,
			bearer_token: credentials.bearer_token,
		})

		passport.use(new TwitterStrategy({
				consumerKey: credentials.consumer_key,
				consumerSecret: credentials.consumer_secret,
				callbackURL: 'http://localhost:8080/twitter/callback',
			},
			function(access_token_key, access_token_secret, profile, cb) {
				try {
					clientV1 = new Twitter({
						consumer_key: credentials.consumer_key,
						consumer_secret: credentials.consumer_secret,
						access_token_key,
						access_token_secret,
					})

					clientV2 = new Twitter({
						version: '2',
						extension: false,
						consumer_key: credentials.consumer_key,
						consumer_secret: credentials.consumer_secret,
						access_token_key,
						access_token_secret,
					})

					authUser = {
						id: profile.id,
						username: profile.username,
					}

					console.log('Twitter Login: ', authUser)

					cb(null, authUser)
				}catch (e) {
					cb(e)
				}
			}))
	}catch (e) {
		console.error("Please include a 'credentials.json' file with {consumer_key, consumer_secret, access_key, access_secret}\n", e)
		process.exit(1)
	}

	app.get('/twitter/login',
		passport.authenticate('twitter')
	)

	app.get('/twitter/callback',
		passport.authenticate('twitter', {
			successRedirect: '/',
			//failureRedirect: '/' TODO Have a way to signal failure
		})
	)

	app.route('/twitter/v1/:endpoint1/:endpoint2')
		.get(async (req, res, next) => {
			try {
				const response = await clientV1.get(`${req.params.endpoint1}/${req.params.endpoint2}`, {
					...req.query,
				})

				logRateLimit(response)
				res.json(objectifyResponse(response))
			}catch (e) {
				parseQueryErrors(e, res, next)
			}
		})
		.post(async (req, res, next) => {
			try {
				const response = await clientV1.post(`${req.params.endpoint1}/${req.params.endpoint2}`, {
					...req.query,
				})

				logRateLimit(response)
				res.json(objectifyResponse(response))
			}catch (e) {
				parseQueryErrors(e, res, next)
			}
		})

	app.route('/twitter/v2/:endpoint1/:endpoint2')
		.get(async (req, res, next) => {
			try {
				const response = await clientV2.get(`${req.params.endpoint1}/${req.params.endpoint2}`, {
					...req.query,
				})

				logRateLimit(response)
				res.json(objectifyResponse(response))
			}catch (e) {
				parseQueryErrors(e, res, next)
			}
		})
		.post(async (req, res, next) => {
			try {
				const response = await clientV2.post(`${req.params.endpoint1}/${req.params.endpoint2}`, {
					...req.query,
				})

				logRateLimit(response)
				res.json(objectifyResponse(response))
			}catch (e) {
				parseQueryErrors(e, res, next)
			}
		})

	app.get('/twitter/users/:id', async (req, res, next) => {
		try {
			const response = await clientV2.get(`users/${req.params.id}/tweets`, {...req.query})

			logRateLimit(response)
			res.json(response)
		}catch (e) {
			parseQueryErrors(e, res, next)
		}
	})

	app.get('/twitter/search', async (req, res, next) => {
		try {
			const response = await clientV2.get('tweets/search/recent', {...req.query})

			logRateLimit(response)
			res.json(response)
		}catch (e) {
			parseQueryErrors(e, res, next)
		}
	})

	app.post('/twitter/like', async (req, res, next) => {
		try {
			const response = await clientV2.post(`users/${req.user.id}/likes`, {...req.query})	//TODO Needs Content-Type: JSON

			logRateLimit(response)
			res.json(response)
		}catch (e) {
			parseQueryErrors(e, res, next)
		}
	})

	app.delete('/twitter/like', async (req, res, next) => {
		try {
			const response = await clientV2.delete(`users/${req.user.id}/likes/${req.query.tweet_id}`, {...req.query})

			logRateLimit(response)
			res.json(response)
		}catch (e) {
			parseQueryErrors(e, res, next)
		}
	})

	app.post('/twitter/retweet', async (req, res, next) => {
		try {
			const response = await clientV1.post('statuses/retweet', {...req.query})

			await res.json(response)
		}catch (e) {
			parseQueryErrors(e, res, next)
		}
	})

	app.get('/generic/redirect', async (req, res, next) => {
		try {
			console.log("Redirect: " + req.params[0])

			const response = await got(req.params[0])
			res.send(response.body)
		}catch (err) {
			console.error(err)
			next(err)
		}
	})

	app.get('/generic/json/*', async (req, res, next) => {
		try {
			const url = `${req.params[0]}?${new URLSearchParams([...Object.entries(req.query)]).toString()}`
			console.log(`Querying JSON: ${url}`)

			const body = await got(url).json()
			res.send(body)
		}catch (err) {
			console.error(err)
			next(err)
		}
	})
}