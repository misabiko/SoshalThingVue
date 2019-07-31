const http = require('http');
const Twit = require('twit');
const fs = require('fs');
const credentialsPath = __dirname + '/credentials.json';

const log = str => console.log("[Server] " + str);
const error = str => console.error("[Server] " + str);

if (!fs.existsSync(credentialsPath)) {
	error("You need to add credentials.json for Twit options.");
	process.exit(1);
}

const T = new  Twit(JSON.parse(fs.readFileSync(credentialsPath, 'utf8')));

log("Booting server...");

http.createServer((request, response) => {
	//https://stackoverflow.com/a/56780570/2692695
	let splitURL = request.url.split('?');
	let params = Array.from(new URLSearchParams(splitURL[1])).reduce((o, i) => ({ ...o, [i[0]]: isNaN(i[1]) ? i[1] : parseInt(i[1]) }), {});

	log(JSON.stringify(params));
	T.get(splitURL[0].substr(1), params, function(err, data, res) {
		if (err) {
			error("Error on Twitter request.");
			console.dir(err);
			return;
		}

		response.writeHeader(200, {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*"
		});
		response.write(JSON.stringify(data));
		response.end();
	});

}).listen(43043);