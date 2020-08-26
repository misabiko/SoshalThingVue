import {mount} from "cypress-vue-unit-test";
import ArticleParagraph from "../../src/client/components/ArticleParagraph";

function mountParagraph(fixture) {
	cy.fixture('sampleTweets/' + fixture).then(postData => {
		mount(ArticleParagraph, {
			propsData: {
				articleId: postData.id,
				text: postData.text,
				userMentions: postData.userMentions,
				hashtags: postData.hashtags,
				externalLinks: postData.externalLinks,
				images: postData.images,
				video: postData.video,
			}
		})
	})
}

describe('ArticleParagraph', () => {
	describe('User Mentions', () => {
		it('should replace whole text with user mention anchor', () => {
			mountParagraph('tweetWholeUserMention')

			cy.get('.articleParagraph')
				.children().should('have.length', 1)
				.should('match', 'a.articleUserMention')
				.contains('@RaksorToviks')
		})

		it('should replace the start mention with user mention anchor', () => {
			mountParagraph('tweetStartUserMention')

			cy.get('.articleParagraph')
				.children().should('have.length', 2)

			cy.get('.articleParagraph > span')
				.should('have.text', " that's awesome!!! i kinda want to try it!!")
				.should('not.have.text', 'misabiko')

			cy.get('.articleParagraph > a.articleUserMention')
				.should('have.text', '@misabiko')
		})

		it('should replace the two middle mentions with user mention anchors', () => {
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
		it("shouldn't give an undefined element", () => {
			mountParagraph('tweetElUndefined')
		})
	})

	describe('Media URLs', () => {
		it('should remove the image url', () => {
			mountParagraph('tweetImage')

			cy.get('.articleParagraph')
				.children().should('have.length', 2)

			cy.get('.articleParagraph > span')
				.should('have.text', 'Yeaaa I tried this out ')
				.should('not.have.text', '#artstylebend')

			cy.get('.articleParagraph > a.articleHashtag')
				.should('have.text', '#artstylebend')
		})

		it('should remove the video url', () => {
			mountParagraph('tweetVideo')

			cy.get('.articleParagraph')
				.children().should('have.length', 1)

			cy.get('.articleParagraph > span')
				.should('have.text', 'Using animated UVs and shape keys to animate the eyes this time around 🙏')
		})

		it('should remove the other video url?', () => {
			mountParagraph('tweetVideo2')

			cy.get('.articleParagraph')
				.children().should('have.length', 2)
		})

		it('should remove url for multiple images', () => {
			mountParagraph('tweetFourImages')

			cy.get('.articleParagraph')
				.children().should('have.length', 1)
		})

		it('should leave nothing on media post without message', () => {
			mountParagraph('tweetOnlyImage')

			cy.get('.articleParagraph')
				.children().should('have.length', 0)
		})
	})

	describe('External Links', () => {
		it('should replace external links with ', () => {
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

		it('should replace external link at the end, and remove media url', () => {
			mountParagraph('tweetExternalLinkEnd')

			cy.get('.articleParagraph')
				.children().should('have.length', 2)

			cy.get('.articleParagraph > span')
				.should('have.text', 'Key Animation: Yoshimichi Kameda (亀田 祥倫)\nAnime: Iron Man: Rise of Technovore (アイアンマン：ライズ・オブ・テクノヴォア) (2013)\n\n')

			cy.get('a.articleExternalLink')
				.should('have.text', 'sakugabooru.com/post/show/1278…')
		})

		it('should handle ending hashtags properly with an external link and media', () => {
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
	})
})