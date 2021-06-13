const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const configure = require('./configure')

const app = express()
const port = process.env.PORT || 5000
//const icoPath = path.join('dist', 'favicon.ico')

app.use(express.static('dist'))
//app.use(favicon(icoPath))
app.use('/main.js', express.static(path.join(__dirname, 'index.js')))
app.use('/style.css', express.static(path.join(__dirname, 'style.css')))

app.use(function(err, req, res, _next) {
	console.error(err.stack)
	res.status(500).send('Something broke!')
})

configure(app)

if (process.platform === "win32") {
	var rl = require("readline").createInterface({
		input: process.stdin,
		output: process.stdout
	})

	rl.on("SIGINT", function() {
		process.emit("SIGINT")
	})
}

process.on("SIGINT", function() {
	//graceful shutdown
	process.exit()
})

app.listen(port, () => console.log(`Listening at http://localhost:${port}`))