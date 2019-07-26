const http = require('http');
const Twit = require('twit');
const fs = require('fs');

const T = new  Twit(JSON.parse(fs.readFileSync(__dirname + '/credentials.json', 'utf8')));

console.log("Booting server...");

http.createServer((request, response) => {
	//https://stackoverflow.com/a/56780570/2692695
	let splitURL = request.url.split('?');
	let params = Array.from(new URLSearchParams(splitURL[1])).reduce((o, i) => ({ ...o, [i[0]]: isNaN(i[1]) ? i[1] : parseInt(i[1]) }), {});

	console.log(JSON.stringify(params));
	T.get(splitURL[0].substr(1), params, function(err, data, res) {
		if (err) {
			console.error("Error on Twitter request.");
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