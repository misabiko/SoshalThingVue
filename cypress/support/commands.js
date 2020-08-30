// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('getTimelines', ({timelines, fetchStubs}) => {
	cy.request('twitter/access')
	cy.visit('/', {
		onBeforeLoad(win) {
			const stub = cy.stub(win, 'fetch')
			stub.withArgs('/checkLogins')
				.resolves({
					ok: true,
					json: () => ({Twitter: true}),
				})
			if (timelines)
				stub.withArgs('/timelines')
					.resolves({
						ok: true,
						json: () => Array.isArray(timelines) ? timelines : [timelines]
					})
			if (fetchStubs)
				fetchStubs(stub)
		},
	})
})

Cypress.Commands.add('getHomeTimeline', () => {
	cy.request('twitter/tweets/home_timeline').its('body')
		.then($timelinePayload => {
			cy.fixture('manyTimelines').then($timelines => cy.getTimelines({
				timelines: $timelines[0],
				fetchStubs: stub => {
					stub.withArgs('/twitter/tweets/home_timeline')
						.resolves({
							ok: true,
							json: () => $timelinePayload
						})
				}
			}))
		})
})

Cypress.Commands.add('getQuoteTimeline', () => {
	cy.request({
		url: 'twitter/tweets/search',
		qs: {
			q: 'from:misabiko #soshalTest'
		}
	}).its('body').then($timelinePayload => {
		cy.fixture('quoteTimeline').then(timelines => cy.getTimelines({
			timelines,
			fetchStubs:
				stub => {
					stub.withArgs('/twitter/tweets/search?q=from%3Amisabiko%20%23soshalTest')
						.resolves({
							ok: true,
							json: () => $timelinePayload
						})
				}
		}))
	})
})