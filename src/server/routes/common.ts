import fs from 'fs';
import path from 'path';
import {Request, Response, Router} from 'express';
import {Twitter} from './twitter';
import {defaultTimeline, TimelineData} from '../../core/Timeline';

export namespace Common {
	function combineDefault(timelines : TimelineData[]) : TimelineData[] {
		return timelines.map(timeline => {
			const combinedTimeline = {
				...defaultTimeline,
				...timeline,
				options: {
					...defaultTimeline.options,
					...timeline.options,
				},
			};
			delete combinedTimeline.id;
			return combinedTimeline;
		});
	}

	async function saveTimelines(newTimelines : TimelineData[], force = false) {
		const stringified = JSON.stringify(newTimelines);

		if (force || JSON.stringify(timelines) !== stringified) {
			console.log(`Saving new timeline settings "${timelinesPath}"...`);
			await fs.promises.writeFile(timelinesPath, stringified);
		}else
			console.log('No changes in timeline settings, ignoring...');
	}

	async function checkLogins(_req : Request, res : Response) {
		await res.json({
			Twitter: Twitter.checkLogin(),
		});
	}

	async function getTimelines(_req : Request, res : Response) {
		try {
			const timelines = JSON.parse(await fs.promises.readFile(timelinesPath, 'utf8'));

			if (timelines instanceof Array) {
				await res.json(combineDefault(timelines));
			}else
				await res.json([]);
		}catch (e) {
			if (e.code === 'ENOENT') {
				console.log(`Couldn't read "${timelinesPath}", loading default timelines.`);
				timelines = [{
					...defaultTimeline,
					name: 'Home',
					service: 'Twitter',
					endpoint: 'home_timeline',
				}];

				await saveTimelines(timelines, true);
				await res.json(timelines);
			}else
				throw e;
		}
	}

	async function updateTimelines(req : Request, res : Response) {
		if (req.body instanceof Array) {
			await saveTimelines(combineDefault(req.body));

			await res.sendStatus(200);
		}else
			res.sendStatus(400);
	}

	const timelinesPath = process.env.SOSHAL_TIMELINE_PATH || path.join(__dirname, 'timelines.json');
	let timelines : TimelineData[];

	export const router = Router();

	router.get('/checklogins', checkLogins);
	router.route('/timelines')
		.get(getTimelines)
		.post(updateTimelines);
}