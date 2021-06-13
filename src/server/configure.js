const Twitter = require('twitter-lite')
const morgan = require('morgan')

let credentials
try {
	credentials = require('../../credentials.json')
}catch (e) {
	console.error("Please include a 'credentials.json' file with {consumer_key, consumer_secret, access_key, access_secret}\n", e)
	process.exit(1)
}

function parseQueryErrors(e, next) {
	if ('errors' in e) {
		for (const error of e.errors)
			console.error(error)
	}else
		console.error(e)

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
		statuses: response,
		_headers: Object.fromEntries(response._headers.entries())
	}
}

function logRateLimit(response) {
	console.log(`\nRate: ${response._headers.get('x-rate-limit-remaining')} / ${response._headers.get('x-rate-limit-limit')}`)
	const reset = response._headers.get('x-rate-limit-reset')
	const delta = (reset * 1000) - Date.now()
	console.log(`Reset: ${Math.ceil(delta / 1000 / 60)} minutes`)
}

module.exports = app => {
	app.use(morgan('dev'))

	const clientV1 = new Twitter({
		consumer_key: credentials.consumer_key,
		consumer_secret: credentials.consumer_secret,
		//access_token_key: credentials.access_key,
		//access_token_secret: credentials.access_secret,
	})

	const clientV2 = new Twitter({
		version: "2",
		extension: false,
		//consumer_key: credentials.consumer_key,
		//consumer_secret: credentials.consumer_secret,
		bearer_token: credentials.bearer_token,
	})

	app.route('/twitter/v1/:endpoint1/:endpoint2')
		.get(async (req, res, next) => {
			try {
				const response = await clientV1.get(`${req.params.endpoint1}/${req.params.endpoint2}`, {
					...(req.query),
				})

				logRateLimit(response)
				res.json(objectifyResponse(response))
			}catch (e) {
				parseQueryErrors(e, next)
			}
		})
		.post(async (req, res, next) => {
			try {
				const response = await clientV1.post(`${req.params.endpoint1}/${req.params.endpoint2}`, {
					...(req.query),
				})

				logRateLimit(response)
				res.json(objectifyResponse(response))
			}catch (e) {
				parseQueryErrors(e, next)
			}
		})

	app.route('/twitter/v2/:endpoint1/:endpoint2')
		.get(async (req, res, next) => {
			try {
				const response = await clientV2.get(`${req.params.endpoint1}/${req.params.endpoint2}`, {
					...(req.query),
				})

				logRateLimit(response)
				res.json(objectifyResponse(response))
			}catch (e) {
				parseQueryErrors(e, next)
			}
		})
		.post(async (req, res, next) => {
			try {
				const response = await clientV2.post(`${req.params.endpoint1}/${req.params.endpoint2}`, {
					...(req.query),
				})

				logRateLimit(response)
				res.json(objectifyResponse(response))
			}catch (e) {
				parseQueryErrors(e, next)
			}
		})

	app.route('/twitter/users/:id')
		.get(async (req, res, next) => {
			try {
				const response = await clientV2.get(`users/${req.params.id}/tweets`, {...(req.query)})

				logRateLimit(response)
				res.json(response)
			}catch (e) {
				parseQueryErrors(e, next)
			}
		})
}