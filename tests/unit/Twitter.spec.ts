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
			const nowTweet : TweetArticle = {
				...baseTweet,
				creationDate: new Date(),
			}
			service.updateArticle(nowTweet)

			const wrapper = mount(TweetArticleComponent, {
				props: {
					onArticleClick: () => {},
					article: nowTweet,
				},
				global: {
					components: {FontAwesomeIcon}
				}
			})

			const timestamp = wrapper.get('.timestamp > small')
			expect(timestamp.text()).to.be.equal('just now')
		})
	})
})