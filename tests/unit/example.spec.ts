import {expect} from 'chai'
import {shallowMount} from '@vue/test-utils'
import tweet from '../fixtures/tweet_4photos_1hashtag.json'
import {parseGenericTweet, TwitterV1Tweet} from '@/data/TwitterV1'
import {TweetArticle} from '@/services/twitter'

/*describe('HelloWorld.vue', () => {
	it('renders props.msg when passed', () => {
		const msg = 'new message'
		const wrapper = shallowMount(HelloWorld, {
			props: {msg},
		})
		expect(wrapper.text()).to.include(msg)
	})
})*/

describe('Twitter', () => {
	describe('V1', () => {
		it('removes media urls', () => {
			const {articles} = parseGenericTweet(tweet as unknown as TwitterV1Tweet)
			const parsedTweet = articles[0] as TweetArticle

			expect(parsedTweet.text).to.be('今週だけどね #今月描いた絵を晒そう')
		})
	})
})