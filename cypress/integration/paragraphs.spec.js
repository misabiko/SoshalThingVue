import {ArticleType} from "../../src/core/PostData";

describe('Paragraphs', () => {
	it('should parse the paragraph twice for the same post', () => {
		cy.request('twitter/access')

		const timelines = [
			{
				id: 0,
				name: "Timeline #1",
				service: "Twitter",
				endpoint: "search",
				autoRefresh: false,
				enabled: true,
				compactMedia: false,
				options: {"q": "bloop"},
				refreshRate: 60000
			}, {
				id: 1,
				name: "Timeline #2",
				service: "Twitter",
				endpoint: "search",
				autoRefresh: false,
				enabled: true,
				compactMedia: true,
				options: {"q": "bloop"},
				refreshRate: 60000
			}
		];

		const posts = [{
			id: "1298698906885292039",
			creationTime: "Wed Aug 26 19:08:42 +0000 2020",
			authorName: "randomsakuga",
			authorHandle: "randomsakuga",
			authorAvatar: "https://pbs.twimg.com/profile_images/840302059362615296/TaVA2uei_normal.jpg",
			text: "Genga:\n\nhttps://t.co/ezjKExEZmh https://t.co/mmutxM9A5K",
			video: {
				type: "gif",
				url: "https://pbs.twimg.com/tweet_video_thumb/EgXnoSoXgAEOKTK.jpg",
				sizes: {
					thumb: {w: 150, h: 150, resize: "crop"},
					small: {w: 646, h: 532, resize: "fit"},
					medium: {w: 646, h: 532, resize: "fit"},
					large: {w: 646, h: 532, resize: "fit"}
				},
				aspectRatio: [17, 14],
				variants: [{
					url: "https://video.twimg.com/tweet_video/EgXnoSoXgAEOKTK.mp4",
					contentType: "video/mp4",
					bitrate: 0
				}],
				autoplay: true,
				indices: [32, 54]
			},
			liked: false,
			reposted: false,
			likeCount: 696,
			repostCount: 138,
			userMentions: [],
			hashtags: [],
			externalLinks: [{
				truncatedURL: "sakugabooru.com/post/show/4020",
				fullURL: "https://www.sakugabooru.com/post/show/4020",
				indices: [8, 30]
			}]
		}];

		const services = {
			Twitter: true,
			Mastodon: false,
			Pixiv: false,
		};

		cy.visit('/', {
			onBeforeLoad(win) {
				const stub = cy.stub(win, 'fetch')
				stub.withArgs('/checkLogins')
					.resolves({
						ok: true,
						json: () => services,
					})
				stub.withArgs('/timelines')
					.resolves({
						ok: true,
						json: () => timelines
					})
				stub.withArgs('/twitter/tweets/search?q=bloop')
					.resolves({
						ok: true,
						json: () => ({
							services,
							posts,
							reposts: [],
							quotes: [],
							timelinePosts: {
								newArticles: [{
									type: ArticleType.Post,
									id: '1298698906885292039',
								}]
							},
						})
					})
			},
		})
	})
})