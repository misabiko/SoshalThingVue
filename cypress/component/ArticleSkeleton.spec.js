import {mount} from "cypress-vue-unit-test";
import ArticleParagraph from "../../src/client/components/ArticleParagraph";

describe('ArticleParagraph', () => {
	it('should replace whole text with user mention anchor', () => {
		cy.fixture('tweetWholeUserMention').then(postData => {
			mount(ArticleParagraph, {
				propsData: {
					text: postData.text,
					userMentions: postData.userMentions,
				}
			})
		})

		cy.get('.articleParagraph')
			.children().should('have.length', 1)
			.should('match', 'a.articleUserMention')
			.contains('@RaksorToviks')
	})

	it('should replace the start mention with user mention anchor', () => {
		cy.fixture('tweetStartUserMention').then(postData => {
			mount(ArticleParagraph, {
				propsData: {
					text: postData.text,
					userMentions: postData.userMentions,
				}
			})
		})

		cy.get('.articleParagraph')
			.children().should('have.length', 2)

		cy.get('.articleParagraph > span')
			.should('have.text', " that's awesome!!! i kinda want to try it!!")
			.should('not.have.text', 'misabiko')

		cy.get('.articleParagraph > a.articleUserMention')
			.should('have.text', '@misabiko')
	})

	it('should replace the two middle mentions with user mention anchors', () => {
		cy.fixture('tweetTwoCenterUserMentionsOneLinkEnd').then(postData => {
			mount(ArticleParagraph, {
				propsData: {
					text: postData.text,
					userMentions: postData.userMentions,
				}
			})
		})

		cy.get('.articleParagraph > span')
			.should('have.length', 3)

		cy.get('.articleParagraph > a.articleUserMention')
			.should('have.length', 2)
			.should('not.have.text', 'ToxicxEternity')
			.should('not.have.text', 'HomykSmash')
	})

	it("shouldn't give an undefined element", () => {
		cy.fixture('tweetElUndefined').then(postData => {
			mount(ArticleParagraph, {
				propsData: {
					text: postData.text,
					userMentions: postData.userMentions,
				}
			})
		})
	})
})