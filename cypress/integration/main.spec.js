describe('SoshalThing', () => {
	it("shouldn't auto refresh")

	it('get indicator that session is active')

	describe('Timelines', () => {
		it("post don't get added twice", () => {
			cy.request('twitter/access')

			cy.request('twitter/tweets/home_timeline').its('body').then($timelinePayload => {
				cy.fixture('manyTimelines').then($timelines => {
					cy.visit('/', {
						onBeforeLoad(win) {
							const stub = cy.stub(win, 'fetch')
							stub.withArgs('/checkLogins')
								.resolves({
									ok: true,
									json: () => ({
										Twitter: true,
										Mastodon: false,
										Pixiv: false,
									}),
								})
							stub.withArgs('/timelines')
								.resolves({
									ok: true,
									json: () => [$timelines[0]]
								})
							stub.withArgs('/twitter/tweets/home_timeline')
								.resolves({
									ok: true,
									json: () => $timelinePayload
								})
						},
					})
				})
			})

			cy.get('.timeline').first()
				.get('.timelinePosts')
				.children().then($children => {
				cy.get('.timeline').first()
					.get('.refreshTimeline')
					.click()

				cy.get('.timeline').first()
					.get('.timelinePosts')
					.children().should('have.length', $children.length)
			})
		})
	})

	describe('Articles', () => {
		it('skip lines should render correctly'/*, () => {
			cy.getQuoteTimeline()

			cy.get('.article').contains('\n')
		}*/)

		describe('Quotes', () => {
			it("quotes show up well", () => {
				cy.getQuoteTimeline()

				cy.get('.timelinePosts').children('.quote')
					.each(quoteElement => {
						const quotedText = quoteElement.find('.quotedPost > p').first().text()

						cy.wrap(quoteElement).find('.content > p')
							.should('not.have.text', quotedText)
					})

				//cy.get('.repost').contains('quoted test tweet')
			})
		})
	})
})