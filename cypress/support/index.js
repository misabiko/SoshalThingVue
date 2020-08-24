// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
// Alternatively you can use CommonJS syntax:
// require('./commands')

import 'cypress-vue-unit-test/dist/support'

Cypress.Commands.add('getQuoteTimeline', () => {
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
})
