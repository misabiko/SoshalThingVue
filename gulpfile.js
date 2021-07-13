const {src, dest, series, parallel} = require('gulp')
const header = require('gulp-header')
const rename = require('gulp-rename')
const fs = require('fs')
//const path = require('path')
const {spawn} = require('child_process')
const ts = require('gulp-typescript')

const hostPages = []

function buildHosts() {
	const hostSources = ['src/hostpages/**.*ts']

	/*const extensionIndex = process.argv.indexOf('--extension')
	if (extensionIndex > -1) {
		hostSources.push(path.join(process.cwd(), process.argv[extensionIndex + 1], 'hostpages/!**.*ts'))
	}*/

	return src(hostSources)
		.pipe(ts({
			"strict": true,
			"baseUrl": ".",
			"paths": {
				"@/*": [
					"src/*"
				]
			},
			"lib": [
				"esnext",
				"dom",
				"dom.iterable",
				"scripthost"
			]
		}))
		.pipe(dest('dist/hostpages'))
}

/*async function indexHosts() {
	const hostDir = './dist/hostpages/'
	for (const host of fs.readdirSync(hostDir)) {
		if (host === 'pageinfo.js')
			continue

		try {
			const hostMatch = (await import(hostDir + host))?.default?.default?.map(host => host.urlMatch)
			if (hostMatch)
				hostPages.push(...hostMatch)
		}catch (e) {
			console.error(`Failed to import "${host}": ${e}`)
		}
	}
}*/
async function indexHosts() {
	const hostMatches = (await import('./dist/hostpages/index.js'))?.default?.default?.map(host => host.urlMatch)

	if (hostMatches?.length)
		hostPages.push(...hostMatches)
}

function build(cb) {
	const cmd = spawn('npx', ['vue-cli-service', 'build', '--target', 'lib', '--inline-vue', '--name', 'favviewer', 'src/favviewer.ts'], {
		stdio: 'inherit',
		shell: true
	})
	cmd.on('error', (err) => {
		console.error('Failed to start vue-cli-service build.');
		console.error(err);
	});
	cmd.on('close', function(code) {
		console.log('vue-cli-service build exited with code ' + code);
		cb(code)
	});
}

function packUserscript() {
	let matches = ''
	for (const url of hostPages)
		matches += `\n// @match        ${url}`

	const favCSS = fs.readFileSync('dist/favviewer.css')

	const rawHeader = `// ==UserScript==
// @name         SoshalThing
// @version      0.0.1
// @description  Injects timelines into a various websites
// @author       misabiko
// @require      https://unpkg.com/vue${matches}
// ==/UserScript==

const favCSS = \`${favCSS}\`;
`

	return src('dist/favviewer.umd.js')
		.pipe(header(rawHeader))
		.pipe(rename({basename: 'favviewer', extname: '.user.js'}))
		.pipe(dest('dist/'))
}

exports.default = series(
	parallel(
		series(buildHosts, indexHosts),
		build
	),
	packUserscript
)