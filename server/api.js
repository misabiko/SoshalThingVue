const http = require('http');
const Twit = require('twit');
const fs = require('fs');
const credentialsPath = __dirname + '/credentials.json';

const clog = str => console.log("[Server] " + str);
const cerror = str => console.error("[Server] " + str);

let twitterResetTime;
let twitterRemaining = 15;

if (!fs.existsSync(credentialsPath)) {
	cerror("You need to add credentials.json for Twit options.");
	process.exit(1);
}

const T = new Twit(JSON.parse(fs.readFileSync(credentialsPath, 'utf8')));

clog("Booting server...");

http.createServer((request, response) => {
	//https://stackoverflow.com/a/56780570/2692695
	let splitURL = request.url.split('?');
	let params = Array.from(new URLSearchParams(splitURL[1])).reduce((o, i) => ({ ...o, [i[0]]: isNaN(i[1]) ? i[1] : parseInt(i[1]) }), {});

	if (params)
		clog("Params: " + JSON.stringify(params));

	if (!twitterRemaining && (twitterResetTime - Date.now()) < 0)
		cerror("Rate limit reached. Reset in " + ((twitterResetTime - Date.now()) / 60000) + " minutes.");
	else
		T.get(splitURL[0].substr(1), params)
			.then(twitResp => {
				response.writeHead(200, {
					"Content-Type": "application/json",
					"Access-Control-Allow-Origin": "*"
				});
				response.write(JSON.stringify(twitResp.data));

				clog("Remaining calls: " + twitResp.resp.headers["x-rate-limit-remaining"]);
				twitterResetTime = new Date(1000 * parseInt(twitResp.resp.headers["x-rate-limit-reset"]));
				twitterRemaining = parseInt(twitResp.resp.headers["x-rate-limit-remaining"]);
				clog((Math.round((twitterResetTime - Date.now()) / 600) / 100) + " minutes until reset.");
				response.end();

				console.log("");
			})
			.catch(error => {
				cerror("Error on Twitter request.");
				console.dir(error);
			})

}).listen(43043);


clog("Booted up!");