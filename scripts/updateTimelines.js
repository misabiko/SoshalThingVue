const fs = require('fs')
const path = require('path')
const ts = require('typescript')

;(async () => {
	const timelinesPath = path.join(__dirname, process.argv[2]);
	if (!timelinesPath) {
		console.error(`Did not receive a valid path: "${timelinesPath}"`)
		return
	}

	eval((await ts.transpileModule(
		await fs.promises.readFile(path.join(__dirname, '../src/core/Timeline.ts'), 'utf8'),
		JSON.parse(await fs.promises.readFile(path.join(__dirname, '../tsconfig.json'), 'utf8')),
	)).outputText)

	const timelines = JSON.parse(await fs.promises.readFile(timelinesPath, 'utf8'))
		.map(timeline => {
			const combinedTimeline = {
				...exports.defaultTimeline,
				...timeline,
				options: {
					...exports.defaultTimeline.options,
					...timeline.options,
				},
			};
			delete combinedTimeline.id;
			return combinedTimeline;
		});

	await fs.promises.writeFile(timelinesPath, JSON.stringify(timelines));

	console.log(`Updated timeline at "${timelinesPath}"`)
})()