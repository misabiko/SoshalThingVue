import { createApp } from 'vue'
import App from './App.vue'
import {Service} from '@/services'
import pages from '@/hostpages'
import {PixivFollowPage, PixivUserPage} from '@/hostpages/pixiv'
import {PixivService} from '@/services/pixiv'
import {PageInfo} from '@/hostpages/pageinfo'

(async () => {
	let page : PageInfo | undefined
	for (const p of pages)
		if (location.href.match(p.urlRegex)) {
			try {
				console.log(`Creating host page "${p.pageInfo.name}"`)
				// @ts-ignore
				page = new p.pageInfo(favCSS)
				await page.waitUntilInjectable()

				console.log(`Injecting Soshal in host page "${p.pageInfo.name}"`)
				page.inject()
			}catch (err) {
				console.error(`Failed to inject ${p.pageInfo.name}:`, err)
			}
			break
		}

	(globalThis as any).services = Service.instances

	if (page instanceof PixivFollowPage || page instanceof PixivUserPage)
		Service.instances.push(new PixivService(page))

	await Service.initLocalStorage()

	createApp(App, {pageInfo: page}).mount('#favviewer')
})()