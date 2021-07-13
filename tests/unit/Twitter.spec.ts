import './setup'
import {expect} from 'chai'
import tweet from '../fixtures/tweet_4photos_1hashtag.json'
import {parseGenericTweet, TwitterV1Tweet} from '@/data/TwitterV1'
import {TweetArticle, TwitterService} from '@/services/twitter'
import {mount} from '@vue/test-utils'
import TweetArticleComponent from '@/components/Articles/TweetArticle.vue'
import {Service} from '@/services'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'

describe('Twitter', () => {
	let service : TwitterService
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
			const {articles} = parseGenericTweet(tweet as unknown as TwitterV1Tweet)
			const parsedTweet = articles[0] as TweetArticle	//TODO Save article as fixture
			for (const a of articles)
				service.updateArticle(a)

			const onArticleClick = () => {}

			const wrapper = mount(TweetArticleComponent, {
				props: {
					onArticleClick,
					article: parsedTweet,
				},
				global: {
					components: {FontAwesomeIcon}
				}
			})

			const timestamp = wrapper.get('.timestamp > small')
			expect(timestamp.text()).to.be.equal('now')
		})
	})
})