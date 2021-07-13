describe('SoshalThing', () => {
	it('visits the app root url', () => {
		cy.visit('/')
		cy.get('#timelineContainer').children().should('have.length', 0)
	})

	it('adds a new timeline', () => {
		cy.get('#addTimelineButton').click()
	})
})

//TEST masonryContainer width with regular, maintTimeline and squeezeMainTimeline