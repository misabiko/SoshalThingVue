describe('UI', () => {
	beforeEach(() => {
		cy.route2('/timelines', {fixture: 'timelines/homeTimeline'})

		cy.stubEndpoint(/\/twitter\/tweets.*/)
	})

	it('should have buttons', () => {
		cy.visit('/')

		cy.get('button#expandSidebar').should('exist')

		cy.get('button#newTimelineSidebar').should('exist')
	})

	describe('Login', () => {
		it('shows the twitter login button', () => {
			cy.visit('/')

			cy.get('#expandSidebar').click()

			cy.get('.sidebarMenu')
				.contains('Twitter')
				.contains('Login')
				.should('have.attr', 'href', '/twitter/login')
		})

		it("doesn't show the login button when logged in", () => {
			cy.route2('/checkLogins', {Twitter: true})

			cy.visit('/')

			cy.get('#expandSidebar').click()

			cy.get('.sidebarMenu')
				.contains('Twitter')
				.should('not.contain', 'Login')
		})
	})
})