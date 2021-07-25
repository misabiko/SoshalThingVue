import './setup'
import {expect} from 'chai'
import tweet from '../fixtures/tweet_4photos_1hashtag.json'
import {parseGenericTweet, TwitterV1Tweet} from '@/data/TwitterV1'
import {TweetArticle, TwitterArticle, TwitterArticleType, TwitterService} from '@/services/twitter'
import {mount} from '@vue/test-utils'
import TweetArticleComponent from '@/components/Articles/TweetArticle.vue'
import {Service} from '@/services'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

describe('Twitter', () => {
	let service : TwitterService

	const baseTwitterArticle : TwitterArticle = {
		type: TwitterArticleType.Tweet,
		id: '0',
		creationDate: new Date(),
		author: {
			id: '0',
			name: 'Author Name',
			handle: 'authorHandle',
			avatarURL: 'https://pbs.twimg.com/profile_images/1351332299468632065/3e1qrbOZ_bigger.jpg'
		},
		queried: true,
		hidden: false,
		index: 0,
	}

	const baseTweet : TweetArticle = {
		...baseTwitterArticle,
		type: TwitterArticleType.Tweet,
		text: 'Tweet text',
		media: [],
		liked: false,
		likeCount: 0,
		reposted: false,
		repostCount: 0,
	}

	before(function() {
		service = Service.addService(new TwitterService()) as TwitterService
	})

	after(() => {
		delete Service.instances.Twitter
	})

	describe('V1', () => {
		it('removes media urls', () => {
			const {articles} = parseGenericTweet(tweet as unknown as TwitterV1Tweet)
			const parsedTweet = articles[0] as TweetArticle

			expect(parsedTweet.text).to.be.equal('今週だけどね\n#今月描いた絵を晒そう')
		})
	})

	describe('TweetArticle', () => {
		it('renders the timestamp', () => {
			const tweets : {[timestamp : string]: TweetArticle } = {
				'just now': {
					...baseTweet,
					id: 'timestamptjust now',
					creationDate: new Date(),
				},
				'1s': {
					...baseTweet,
					id: 'timestampt1s',
					creationDate: new Date(Date.now() - 1000),
				},
				'1m': {
					...baseTweet,
					id: 'timestampt1m',
					creationDate: new Date(Date.now() - 60 * 1000),
				},
				'1h': {
					...baseTweet,
					id: 'timestampt1h',
					creationDate: new Date(Date.now() - 60 * 60 * 1000),
				},
				'1d': {
					...baseTweet,
					id: 'timestampt1d',
					creationDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
				},
				'Jan 1': {
					...baseTweet,
					id: 'timestamptJan 1',
					creationDate: new Date('01 Jan 2021'),
				},
			}

			for (const [timestampStr, article] of Object.entries(tweets)) {
				service.updateArticle(article)

				const wrapper = mount(TweetArticleComponent, {
					props: {
						onArticleClick: () => {},
						article,
					},
					global: {
						components: {FontAwesomeIcon},
					},
				})

				const timestamp = wrapper.get('.timestamp > small')
				expect(timestamp.text()).to.be.equal(timestampStr)
			}
		})
	})
})