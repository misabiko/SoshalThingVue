describe('UI', () => {
	it('should have buttons', () => {
		cy.visit('/')

		cy.get('button.expandSidebar').should('exist')
		cy.get('button.addTimeline').should('exist')
	})

	describe('Login', () => {
		it('shows the twitter login button', () => {
			cy.visit('/')

			cy.get('.expandSidebar').click()

			cy.get('.sidebarMenu')
				.contains('Twitter')
				.contains('Login')
				.should('have.attr', 'href', '/twitter/login')
		})

		it("doesn't show the login button when logged in", () => {
			cy.visit('/', {
				onBeforeLoad(win) {
					cy.stub(win, 'fetch').withArgs('/checkLogins')
						.resolves({
							ok: true,
							json: () => ({
								Twitter: true,
								Mastodon: false,
								Pixiv: false,
							}),
						})
				},
			})

			cy.get('.expandSidebar').click()

			cy.get('.sidebarMenu')
				.contains('Twitter')
				.should('not.contain', 'Login')
		})
	})
})