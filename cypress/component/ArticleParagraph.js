import {mount} from "cypress-vue-unit-test";
import ArticleParagraph from "../../src/client/components/ArticleParagraph";

function mountParagraph(fixture) {
	cy.fixture('sampleTweets/' + fixture).then(postData => {
		mount(ArticleParagraph, {
			propsData: {
				text: postData.text,
				userMentions: postData.userMentions,
				hashtags: postData.hashtags,
				images: postData.images,
				video: postData.video,
			}
		})
	})
}

describe('ArticleParagraph', () => {
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

	it("shouldn't give an undefined element", () => {
		mountParagraph('tweetElUndefined')
	})

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

	it('should remove url for multiple images', () => {
		mountParagraph('tweetFourImages')

		cy.get('.articleParagraph')
			.children().should('have.length', 1)
	})

	it('should remove the other video url?', () => {
		mountParagraph('tweetVideo2')

		cy.get('.articleParagraph')
			.children().should('have.length', 1)
	})

	it.only('should leave nothing on media post without message', () => {
		mountParagraph('tweetOnlyImage')

		cy.get('.articleParagraph')
			.children().should('have.length', 0)
	})
})