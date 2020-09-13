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

Cypress.Commands.add('getPayload', fixture => {
	cy.fixture(fixture).then($payload => {
		$payload.rateLimitStatus.reset = Date.now() + 300000
		return $payload
	})
})

Cypress.Commands.add('stubEndpoint', endpoint => {
	cy.route2(endpoint, {
		rateLimitStatus: {
			remaining: 15,
			limit: 15,
			reset: Date.now() + 300000
		},
		posts: [],
		reposts: [],
		quotes: [],
		timelinePosts: {newArticles: []}
	})
})