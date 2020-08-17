import fs from 'fs';
import path from 'path';
import {Request, Response, Router} from 'express';
import {Twitter} from './twitter';
import {TimelineData} from '../../core/Timeline';

export namespace Common {
	async function saveTimelines(timelines : TimelineData[]) {
		await fs.promises.writeFile(timelinesPath, JSON.stringify(timelines));
	}

	async function checkLogins(_req : Request, res : Response) {
		await res.json({
			Twitter: Twitter.checkLogin(),
			Mastodon: false,
			Pixiv: false,
		})
	}

	async function getTimelines(_req : Request, res : Response) {
		try {
			const timelines = JSON.parse(await fs.promises.readFile(timelinesPath, 'utf8'));
			console.dir(timelines);
			if (timelines instanceof Array)
				await res.json(timelines);
			else
				await res.json([]);
		}catch (e) {
			if (e.code === 'ENOENT') {
				console.log(`Couldn't read "${timelinesPath}", loading default timelines.`);
				const timelines : TimelineData[] = [{
					id: 0,
					name: 'Home',
					service: 'Twitter',
					endpoint: 'home_timeline'
				}];

				await saveTimelines(timelines);
				await res.json(timelines);
			}else
				throw e;
		}
	}

	async function updateTimelines(req : Request, res : Response) {
		console.dir(req.body);
		if (req.body.timelines instanceof Array) {
			await saveTimelines(req.body);

			await res.sendStatus(200);
		}else
			res.sendStatus(400);
	}

	const timelinesPath = path.join(__dirname, 'timelines.json');

	export const router = Router();

	router.get('/checklogins', checkLogins);
	router.route('/timelines')
		.get(getTimelines)
		.post(updateTimelines);
}