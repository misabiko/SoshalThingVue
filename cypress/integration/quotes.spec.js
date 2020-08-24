describe('Quotes', () => {
	it("quotes show up well", () => {
		cy.request('twitter/access')

		cy.request({
			url: 'twitter/tweets/search',
			qs: {
				q: 'from:misabiko #soshalTest'
			}
		}).its('body').then($timelinePayload => {
			cy.fixture('quoteTimeline').then($timelines => {
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
								json: () => $timelines
							})
						stub.withArgs('/twitter/tweets/search?q=from%3Amisabiko%20%23soshalTest')
							.resolves({
								ok: true,
								json: () => $timelinePayload
							})
					},
				})
			})
		})

		cy.get('.timeline').should('have.length', 1)
			.first()
			.get('.refreshTimeline')
			.click()

		cy.get('.timelinePosts').children('.quote')
	})
})