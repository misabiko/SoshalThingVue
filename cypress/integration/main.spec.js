describe('SoshalThing', () => {
	before('loading the page', () => {
		cy.visit('/')
	})

	it("shouldn't auto refresh")

	it('should have buttons', () => {
		cy.get('button.expandSidebar').should('exist')
		cy.get('button.addTimeline').should('exist')
	})

	it('sets auth cookie when logging in via form submission', () => {
		//TODO isn't logged in
		cy.getCookies()

		cy.get('.expandSidebar').click()

		cy.get('.sidebarMenu')
			.contains('Twitter')
			.contains('Login')
			.click()
	})

	/*it('successfully loads', () => {
		cy.visit('/')
	})*/
})