const http = require('http');
const Twit = require('twit');
const fs = require('fs');
const credentialsPath = __dirname + '/../credentials.json';

const clog = str => console.log("[Server] " + str);
const cerror = str => console.error("[Server] " + str);

let twitter = {};

function requestTweets(response, endpoint, params) {
	console.log(endpoint);
	if (twitter.hasOwnProperty(endpoint) && !twitter[endpoint].remaining && (twitter[endpoint].resetTime - Date.now()) >= 0)
		cerror("Rate limit reached. Reset in " + ((twitter[endpoint].resetTime - Date.now()) / 60000) + " minutes.");
	else
		T.get(endpoint, params)
			.then(twitResp => {
				response.writeHead(200, {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*"
				});
				response.write(JSON.stringify(twitResp.data));

				clog("Remaining calls: " + twitResp.resp.headers["x-rate-limit-remaining"]);

				if (!twitter.hasOwnProperty(endpoint))
					twitter[endpoint] = {};
				twitter[endpoint].resetTime = new Date(1000 * parseInt(twitResp.resp.headers["x-rate-limit-reset"]));
				twitter[endpoint].remaining = parseInt(twitResp.resp.headers["x-rate-limit-remaining"]);
				clog((Math.round((twitter[endpoint].resetTime - Date.now()) / 600) / 100) + " minutes until reset.");
				response.end();

				console.log("");
			})
			.catch(error => {
				cerror("Error on Twitter request.");
				console.dir(error);
			});
}

if (!fs.existsSync(credentialsPath)) {
	cerror("You need to add credentials.json for Twit options.");
	process.exit(1);
}

const T = new Twit(JSON.parse(fs.readFileSync(credentialsPath, 'utf8')));

clog("Booting server...");

http.createServer((request, response) => {
	clog(request.url);

	//https://stackoverflow.com/a/56780570/2692695
	let splitURL = request.url.split('?');
	let params = Array.from(new URLSearchParams(splitURL[1])).reduce((o, i) => ({ ...o, [i[0]]: i[1]}), {});

	if (params)
		clog("Params: " + JSON.stringify(params));

	if (request.url.startsWith("/querytweets")) {
		requestTweets(response, splitURL[0].substr(13), params);
		return;
	}

	if (request.url.startsWith("/like")) {
		const url = request.url.substring(5);

		if (!params.id) {
			cerror("You need to add the tweet's id in parameter.");
			return;
		}
		const endpoint = splitURL[0].substr(6);

		T.post(endpoint, params).then(twitResp => {
			response.writeHead(200, {
				"Access-Control-Allow-Origin": "*"
			});
			response.end();

			console.log("");
		})
			.catch(error => {
				cerror("Error on Twitter request.");
				console.dir(error);
			});
		return;
	}
}).listen(43043);


clog("Booted up!");