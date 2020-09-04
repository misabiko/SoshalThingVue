<script lang='ts'>
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
import {Article, ArticleType} from '../../../core/PostData';
import {Service} from '../../services/service';
import {State} from 'vuex-class';
import {CreateElement} from 'vue';
import {VNode, VNodeData} from 'vue/types/vnode';
import Post from '../Articles/Post.vue';
import Repost from '../Articles/Repost.vue';
import Quote from '../Articles/Quote.vue';

@Component
export default class TimelineArticles extends Vue {
	@Prop({type: Number, required: true})
	readonly columns! : number;
	@Prop({type: Array, required: true})
	readonly articles! : Article[];
	@Prop({type: Object, required: true})
	readonly service! : Service;
	@Prop({type: Boolean, required: true})
	readonly enabled! : boolean;
	@Prop({type: Boolean, required: true})
	readonly compactMedia! : boolean;
	@Prop({type: Boolean})
	readonly scrolling! : boolean;

	@State timelineArticleRadius! : number;

	hiddens = new Set<string>();
	compactOverrides = {} as { [id : string] : number };
	scrollDirection = false;
	scrollRequestId = 0;
	scrollSpeed = 3;
	partialArticles = [] as Article[];
	topArticleId = this.articles.length ? this.articles[0].id : '';
	bottomArticleId = this.articles.length ?
		(
			this.articles.length > this.timelineArticleRadius * 3 ?
				this.articles[this.timelineArticleRadius * 3].id :
				this.articles[this.articles.length - 1].id
		) : '';
	//The index we're waiting to be available
	loadingTopIndex = null as number | null;
	loadingBottomIndex = null as number | null;

	firstArticleVisible = 0;

	mounted() {
		this.loadingBottomIndex = this.timelineArticleRadius * 2 - 1;
		this.updatePartialArticles();
	}

	articleFactory(createElement : CreateElement, article : Article) : VNode {
		const data : VNodeData = {
			key: article.id,
			props: {
				service: this.service,
				articleId: article.id,
				timelineHidden: this.hiddens.has(article.id),
				timelineCompactOverride: this.compactOverrides.hasOwnProperty(article.id) ? this.compactOverrides[article.id] : 0,
				compactMedia: this.compactMedia,
			},
			on: {
				remove: ($event : any) => this.$emit('remove-article', $event),
				'set-hidden': this.onHiddenChange,
				'set-compact-override': this.onCompactOverrideChange,
			},
		};

		switch (article.type) {
			case ArticleType.Post:
				return createElement(Post, data);
			case ArticleType.Repost:
				return createElement(Repost, data);
			case ArticleType.Quote:
				return createElement(Quote, data);
		}
	}

	render(createElement : CreateElement) {
		let children;

		const articles = this.partialArticles.map(article => this.articleFactory(createElement, article));
		const bottomLoading = createElement('div', {
			staticClass: 'bottomLoader'
		}, [createElement(
			'b-loading', {
				props: {
					active: this.isLoadingBottom,
					'is-full-page': false,
				},
			},
		)]);

		if (this.columns === 1)
			children = [...articles, bottomLoading];
		else
			children = [
				createElement('masonry', {
					props: {
						cols: this.columns,
					},
				}, articles),
			];

		return createElement('div', {
			staticClass: 'timelineArticles',
			key: this.columns,
			on: {
				scroll: this.onScroll,
			},
		}, children);
	}

	autoScroll(scrollUp : boolean) {
		this.scrollDirection = scrollUp;
		this.stopScroll();
		const scrollStep = () => {
			if ((this.scrollDirection && this.$el.scrollTop > 0) ||
				(!this.scrollDirection && this.$el.scrollTop < this.$el.scrollHeight - window.innerHeight))
				this.$el.scrollBy(0, this.scrollDirection ? -this.scrollSpeed : this.scrollSpeed);
			else
				this.scrollDirection = !this.scrollDirection;
			this.scrollRequestId = window.requestAnimationFrame(scrollStep);
		};
		this.scrollRequestId = window.requestAnimationFrame(scrollStep);
		this.addScrollStopper();
	}

	stopScroll() {
		window.cancelAnimationFrame(this.scrollRequestId);
		this.scrollRequestId = 0;
	}

	addScrollStopper() {
		window.addEventListener('mousedown', () => {
			this.stopScroll();
			this.$emit('update:scrolling', false);
		}, {
			once: true,
		});
	}

	onHiddenChange({hidden, id} : { hidden : boolean, id : string }) {
		if (hidden)
			this.hiddens.add(id);
		else
			this.hiddens.delete(id);
	}

	onCompactOverrideChange({compactOverride, id} : { compactOverride : number, id : string }) {
		if (compactOverride)
			this.compactOverrides[id] = compactOverride;
		else
			delete this.compactOverrides[id];
	}

	onScroll() {
		const firstVisibleId = this.getVisibleArticles()[0];
		const firstVisibleIndex = this.partialArticles.findIndex(article => article.id === firstVisibleId);

		//if partial articles left less than radius
		//update partialArticles with
		if (!this.loadingBottomIndex && this.partialArticles.length - firstVisibleIndex <= this.timelineArticleRadius)
			this.decrementBottom();
	}

	getArticleIndex(id : string) : number {
		return this.articles.findIndex(article => article.id === id);
	}

	getVisibleArticles() : string[] {
		const articles : string[] = [];

		const {top, bottom} = this.$el.getBoundingClientRect();
		for (const articleEl of this.$el.querySelectorAll('.article')) {
			const rect = articleEl.getBoundingClientRect();
			if (rect.bottom >= top) {
				if (rect.top <= bottom) {
					const id = articleEl.getAttribute('article-id');
					if (id)
						articles.push(id);
				}else
					break;	//Since querySelector returns in order, no need to look at the rest
			}
		}

		return articles;
	}

	getTopIndex() : number {
		let topIndex = this.topArticleId ? this.getArticleIndex(this.topArticleId) : 0;
		if (topIndex < 0)
			topIndex = 0;

		return topIndex;
	}

	getBottomIndex(topIndex? : number) : number {
		const loadingBottomIndex = this.loadingBottomIndex;
		if (loadingBottomIndex) {
			if (this.articles.length > loadingBottomIndex) {
				this.loadingBottomIndex = null;
				return loadingBottomIndex;
			}else
				return this.articles.length - 1;
		}

		let bottomIndex = this.bottomArticleId ? this.getArticleIndex(this.bottomArticleId) : -1;
		if (bottomIndex < 0)
			bottomIndex = Math.min((topIndex === undefined ? this.getTopIndex() : topIndex) + this.timelineArticleRadius * 3, this.articles.length - 1);

		return bottomIndex;
	}

	decrementBottom() {
		const topIndex = this.getTopIndex();
		const b = this.getBottomIndex(topIndex);

		let bottomIndex = b + 20;
		if (bottomIndex >= this.articles.length) {
			this.loadingBottomIndex = bottomIndex;
			this.$emit('load-bottom');
			bottomIndex = this.articles.length - 1;
		}

		this.bottomArticleId = this.articles[bottomIndex].id;
		this.partialArticles = this.articles.slice(topIndex, bottomIndex);
	}

	updatePartialArticles() {
		if (!this.articles.length) {
			this.topArticleId = '';
			this.bottomArticleId = '';
			this.partialArticles = [];
			return;
		}

		const topIndex = this.getTopIndex();
		const bottomIndex = this.getBottomIndex(topIndex);

		this.topArticleId = this.articles[topIndex].id;
		this.bottomArticleId = this.articles[bottomIndex].id;
		this.partialArticles = this.articles.slice(topIndex, bottomIndex);

		if (this.loadingBottomIndex)
			this.$emit('load-bottom');
	}

	get isLoadingBottom() {
		return this.enabled && !!this.loadingBottomIndex;
	}

	@Watch('scrolling')
	onScrollChange(newScrolling : boolean) {
		if (newScrolling)
			this.autoScroll(false);
		else
			this.stopScroll();
	}

	@Watch('articles')
	onArticlesChange() {
		this.updatePartialArticles();
	}
}
</script>

<style scoped lang='sass'>
@use '../../bulma_overrides' as *

.timelineArticles
	overflow-y: scroll
	overflow-x: hidden
	flex-grow: 1
	height: 100%

.bottomLoader
	position: relative

.bottomLoader > .loading-overlay
	height: 100px
	border-radius: 0 0 8px 8px
</style>