describe('Twitter', () => {
	it('posts are included once only', () => {
		cy.request('twitter/access')

		cy.request('twitter/tweets/home_timeline').its('body')
			.should(homePayload => {
				expect(homePayload).to.have.property('posts')

				const postIds = homePayload.posts.map(post => post.id);
				expect(postIds.length).to.be.equal(new Set(postIds).size)
			})

		cy.request({
			url: 'twitter/tweets/search',
			qs: {
				q: 'from:misabiko #soshalTest'
			}
		}).its('body')
			.should(searchPayload => {
				expect(searchPayload).to.have.property('posts')

				const postIds = searchPayload.posts.map(post => post.id);
				expect(postIds.length).to.be.equal(new Set(postIds).size)
			})
	})

	it('retweeted tweets ids included in posts', () => {
		cy.request('twitter/access')

		cy.request('twitter/tweets/home_timeline').its('body')
			.should(homePayload => {
				const postIds = homePayload.posts.map(post => post.id)
				const repostedIds = homePayload.reposts.map(repost => repost.repostedId)

				expect(postIds).to.include.all.members(repostedIds)
			})
	})

	it('should include quotes', () => {
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