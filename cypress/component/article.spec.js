import {mount} from 'cypress-vue-unit-test'
import Quote from '../../src/client/components/Quote.vue'
import Vuex from "vuex";
import {ServiceStatuses} from "../../src/core/ServerResponses";
import {Article, ArticleType, PostData, QuoteData, RepostData} from "../../src/core/PostData";
import {ExpandedPost, Logins} from "../../src/client/store";

describe('Quote component', () => {
	/*
	ArticleComponent(
		v-for='article in articles'
		:key='article.id'
		:article='article'
		@remove='removeArticle($event)'
	)
	*/

	/*
	Repost(
		v-else
		:key='article.id'
		:repostId='article.id'
		@remove='removeArticle($event)'
	)
	*/

	it('works', () => {
		const store = new Vuex.Store({
			state: {
				posts : {},
				quotes: {},
			},
			getters: {
				getPost: state => id => state.posts[id],
				getRepost: state => id => state.reposts[id],
				getQuote: state => id => state.quotes[id],
				getArticleData: state => article => {
					if (article.type === 0)
						return state.posts[article.id];
					else
						return state.reposts[article.id];
				},
			},
			//mutations,
			//actions,
		});

		mount(Quote, {
			propsData: {
				quoteId: '1296589955129577472'
			},
			store,
			computed: {
				quoteData() {
					return store.getters.getQuote('1296589955129577472');
				}
			}
		})

		cy.contains('quoted test tweet')
	})
})