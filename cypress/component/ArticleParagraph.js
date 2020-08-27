import {mount} from "cypress-vue-unit-test";
import ArticleParagraph from "../../src/client/components/ArticleParagraph";

function mountParagraph(fixture) {
	cy.fixture('sampleTweets/' + fixture).then(postData => {
		mount(ArticleParagraph, {
			propsData: {
				articleId: postData.id,
				postData,
			}
		})
	})
}

function mountParagraphRequest(tweetId) {
	cy.request('twitter/access')

	cy.request('twitter/tweets/status/' + tweetId).its('body').then(statusResponse => {
		mount(ArticleParagraph, {
			propsData: {
				articleId: statusResponse.post.id,
				postData: statusResponse.post,
			}
		})
	})
}

describe('ArticleParagraph', () => {
	describe('User Mentions', () => {
		it('tweetWholeUserMention', () => {
			mountParagraph('tweetWholeUserMention')

			cy.get('.articleParagraph')
				.children().should('have.length', 1)
				.should('match', 'a.articleUserMention')
				.contains('@RaksorToviks')
		})

		it('tweetStartUserMention', () => {
			mountParagraph('tweetStartUserMention')

			cy.get('.articleParagraph')
				.children().should('have.length', 2)

			cy.get('.articleParagraph > span')
				.should('have.text', " that's awesome!!! i kinda want to try it!!")
				.should('not.have.text', 'misabiko')

			cy.get('.articleParagraph > a.articleUserMention')
				.should('have.text', '@misabiko')
		})

		it('tweetTwoCenterUserMentionsOneLinkEnd', () => {
			mountParagraph('tweetTwoCenterUserMentionsOneLinkEnd')

			cy.get('.articleParagraph > span')
				.should('have.length', 3)

			cy.get('.articleParagraph > a.articleUserMention')
				.should('have.length', 2)
				.should('not.have.text', 'ToxicxEternity')
				.should('not.have.text', 'HomykSmash')
		})
	})

	describe('Hashtags', () => {
		it("tweetElUndefined", () => {
			mountParagraph('tweetElUndefined')
		})

		it.only('hashtags in middle', () => {
			mountParagraphRequest('1298893373206671360')

			cy.get('.articleParagraph')
				.children().should('have.length', 14)

			cy.get('.articleParagraph > span')
				.should('have.length', 7)
				.should('not.have.text', '#')
				.first().should('have.text', 'We just wanted to say thank you! For continuing to play & support us! 💛💙💜 Our leaderboards continue to grow and Mount Frosty gets bigger!\n\n')

			cy.get('a.articleHashtag')
				.should('have.length', 7)
		})
	})

	describe('Media URLs', () => {
		it('tweetImage', () => {
			mountParagraph('tweetImage')

			cy.get('.articleParagraph')
				.children().should('have.length', 2)

			cy.get('.articleParagraph > span')
				.should('have.text', 'Yeaaa I tried this out ')
				.should('not.have.text', '#artstylebend')

			cy.get('.articleParagraph > a.articleHashtag')
				.should('have.text', '#artstylebend')
		})

		it('tweetVideo', () => {
			mountParagraph('tweetVideo')

			cy.get('.articleParagraph')
				.children().should('have.length', 1)

			cy.get('.articleParagraph > span')
				.should('have.text', 'Using animated UVs and shape keys to animate the eyes this time around 🙏')
		})

		it('tweetVideo2', () => {
			mountParagraph('tweetVideo2')

			cy.get('.articleParagraph')
				.children().should('have.length', 2)
		})

		it('tweetFourImages', () => {
			mountParagraph('tweetFourImages')

			cy.get('.articleParagraph')
				.children().should('have.length', 1)
		})

		it('tweetOnlyImage', () => {
			mountParagraph('tweetOnlyImage')

			cy.get('.articleParagraph')
				.children().should('have.length', 0)
		})
	})

	describe('External Links', () => {
		it('tweetLinks', () => {
			mountParagraph('tweetLinks')

			cy.get('.articleParagraph')
				.children().should('have.length', 4)

			cy.get('.articleParagraph > span')
				.should('have.length', 2)
				.first().should('have.text', '投稿しました～✨\nFALL GUYSで叫び倒すバーチャルYoutuber達\nYoutube：\n')

			cy.get('.articleParagraph > span').eq(1)
				.should('have.text', '\nニコニコ動画：\n')

			cy.get('a.articleExternalLink')
				.should('have.length', 2)
				.first().should('have.text', 'youtube.com/watch?v=VCY3Xm…')

			cy.get('a.articleExternalLink')
				.eq(1).should('have.text', 'nicovideo.jp/watch/sm374166…')
		})

		it('tweetExternalLinkEnd', () => {
			mountParagraph('tweetExternalLinkEnd')

			cy.get('.articleParagraph')
				.children().should('have.length', 2)

			cy.get('.articleParagraph > span')
				.should('have.text', 'Key Animation: Yoshimichi Kameda (亀田 祥倫)\nAnime: Iron Man: Rise of Technovore (アイアンマン：ライズ・オブ・テクノヴォア) (2013)\n\n')

			cy.get('a.articleExternalLink')
				.should('have.text', 'sakugabooru.com/post/show/1278…')
		})

		it('tweetExternalLinksWithEndHashtags', () => {
			mountParagraph('tweetExternalLinksWithEndHashtags')

			cy.get('.articleParagraph')
				.children().should('have.length', 8)

			cy.get('.articleParagraph > span')
				.should('have.length', 4)

			cy.get('a.articleExternalLink')
				.should('have.text', 'play.google.com/store/apps/det…')

			cy.get('a.articleHashtag')
				.should('have.length', 3)
		})

		it('tweetYoutubeEnd', () => {
			mountParagraph('tweetYoutubeEnd')

			cy.get('.articleParagraph')
				.children().should('have.length', 18)

			cy.get('.articleParagraph > span')
				.should('have.length', 9)

			cy.get('a.articleExternalLink')
				.should('have.length', 2)

			cy.get('a.articleHashtag')
				.should('have.length', 7)
		})
	})
})