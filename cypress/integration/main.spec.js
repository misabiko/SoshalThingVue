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
})