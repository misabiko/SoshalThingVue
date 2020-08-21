describe('Twitter', () => {
	it('retweeted tweets ids included in posts', function() {
		cy.request('twitter/access')

		cy.request('twitter/tweets/home_timeline').its('body')
			.should(homePayload => {
				const postIds = homePayload.posts.map(post => post.id)
				const repostedIds = homePayload.reposts.map(repost => repost.repostedId)

				expect(postIds).to.include.all.members(repostedIds)
			})
	})

	it('should include quotes', function() {
		cy.request('twitter/access')

		cy.request({
			url: 'twitter/tweets/search',
			qs: {
				q: 'from:misabiko #soshalTest'
			}
		}).its('body')
			.should(searchPayload => {
			expect(searchPayload).to.have.property('quotes')
			expect(searchPayload.quotes).to.not.be.empty
		})
	})
})