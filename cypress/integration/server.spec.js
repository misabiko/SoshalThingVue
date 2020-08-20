describe('Twitter', () => {
	it('retweeted tweets ids included in posts', () => {
		cy.request('twitter/access')

		cy.request('twitter/tweets/home_timeline')
			.should(response => {
				const postIds = response.body.posts.map(post => post.id)
				const repostedIds = response.body.reposts.map(repost => repost.repostedId)

				expect(postIds).to.include.all.members(repostedIds)
			})
	})
})