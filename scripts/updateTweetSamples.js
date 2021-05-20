const fs = require('fs')
const path = require('path')
const got = require('got')
const {CookieJar} = require('tough-cookie')

;(async () => {
	const sampleTweetsPath = path.join(__dirname, '../cypress/fixtures/sampleTweets')
	const cookieJar = new CookieJar()

	await got('http://localhost:5000/twitter/access', {cookieJar})

	for (const tweet of fs.readdirSync(sampleTweetsPath)) {
		const tweetPath = path.join(sampleTweetsPath, tweet)
		const {id} = JSON.parse(fs.readFileSync(tweetPath))
		console.log(`Updating tweet ${id} at ${tweet}`)

		const {post} = await got('http://localhost:5000/twitter/tweets/status/' + id, {
			responseType: 'json',
			resolveBodyOnly: true,
			cookieJar,
		})

		fs.writeFileSync(tweetPath, JSON.stringify(post, null, '\t'))
	}

	console.log('\nDone.')
})()