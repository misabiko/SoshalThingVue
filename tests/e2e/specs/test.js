// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
    cy.get('#timelineContainer').children().should('have.length', 0)
  })
})

//TEST masonryContainer width with regular, maintTimeline and squeezeMainTimeline