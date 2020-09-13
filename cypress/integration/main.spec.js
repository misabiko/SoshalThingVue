describe('SoshalThing', () => {
	it("enabled as false shouldn't auto refresh", () => {
		cy.route2('/timelines', {fixture: 'timelines/disabledTimelines'})

		cy.route2('/checkLogins', {Twitter: true})

		cy.visit('/')

		cy.get('.timeline').should('have.length', 2)
			.each($timeline => {
				expect($timeline.find('.article').length).be.equal(0)
			})
	})

	it("enabled as true should auto refresh", () => {
		cy.route2('/checkLogins', {Twitter: true})

		cy.route2('/timelines', {fixture: 'timelines/manyTimelines'})

		cy.visit('/')

		cy.route2(/\/twitter\/tweets\/home_timeline.*/, {fixture: 'timelinePayloads/home_timeline'})

		cy.get('.timeline').should('have.length', 10)
	})

	it('get indicator that session is active')

	describe('Timelines', () => {
		it("post don't get added twice", () => {
			cy.route2('/timelines', {fixture: 'timelines/homeTimeline'})

			cy.route2('/checkLogins', {Twitter: true})

			cy.route2('/twitter/tweets/home_timeline', {fixture: 'timelinePayloads/home_timeline'}).as('home_timeline')

			cy.visit('/')

			cy.wait('@home_timeline')
			cy.wait(1000)

			cy.get('.timelineArticles').first()
				.children().then($children => {
				cy.get('.timeline').first()
					.get('.refreshTimeline')
					.click()

				cy.get('.timelineArticles').first()
					.children().should('have.length', $children.length)
			})
		})

		it("doesn't refresh when over rate limit", () => {
			const response = {
				rateLimitStatus: {
					remaining: 0,
					limit: 15,
					reset: Date.now() + 300000
				},
				posts: [],
				reposts: [],
				quotes: [],
				timelinePosts: {
					newArticles: []
				}
			};
			cy.route2('/timelines', {fixture: 'timelines/homeTimeline'})

			cy.route2('/checkLogins', {Twitter: true})

			cy.route2(/\/twitter\/tweets\/home_timeline.*/, response)

			cy.visit('/')
		})

		it("adding new timelines works well", () => {
			const response = {
				rateLimitStatus: {
					remaining: 15,
					limit: 15,
					reset: Date.now() + 300000
				},
				posts: [],
				reposts: [],
				quotes: [],
				timelinePosts: {
					newArticles: []
				}
			};
			cy.route2('/timelines', {fixture: 'timelines/homeTimeline'})

			cy.route2('/checkLogins', {Twitter: true})

			cy.route2(/\/twitter\/tweets\/home_timeline.*/, response)

			cy.visit('/')

			cy.get('.timeline').should('have.length', 1)

			cy.get('#newTimelineSidebar').click()

			cy.get('.timeline').should('have.length', 2)
		})
	})

	describe('Articles', () => {
		it('skip lines should render correctly')

		describe('Quotes', () => {
			it("quotes show up well", () => {
				cy.getPayload('timelinePayloads/searchQuotes').then($payload => {
					cy.route2('/timelines', {fixture: 'timelines/quoteTimeline'})

					cy.route2('/checkLogins', {Twitter: true})

					cy.route2(/\/twitter\/tweets\/search.*/, $payload)

					cy.visit('/')

					cy.get('.timeline').should('have.length', 1)
						.first()
						.get('.refreshTimeline')
						.click()

					cy.get('.timelineArticles').children('.quote')
						.each($quoteElement => {
							const quotedText = $quoteElement.find('.quotedPost > p').first().text()

							cy.wrap($quoteElement).find('.content > p')
								.should('not.have.text', quotedText)
						})
				})
			})
		})
	})
})