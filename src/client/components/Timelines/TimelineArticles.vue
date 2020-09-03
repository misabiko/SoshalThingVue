<script lang='ts'>
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
import ArticleGeneric from '../Articles/ArticleGeneric.vue';
import {Article} from '../../../core/PostData';
import {Service} from '../../services/service';
import {State} from 'vuex-class';
import moment from 'moment';
import {CreateElement} from 'vue';

@Component({components: {ArticleGeneric}})
export default class TimelineArticles extends Vue {
	@Prop({type: Number, required: true})
	readonly columns! : number;
	@Prop({type: Array, required: true})
	readonly articles! : Article[];
	@Prop({type: Object, required: true})
	readonly service! : Service;
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
	firstVisibleArticleIndex = 0;

	render(createElement : CreateElement) {
		let children;

		const articles = this.articles.map(article => createElement(
			ArticleGeneric, {
				key: article.id,
				props: {
					service: this.service,
					article,
					timelineHidden: this.hiddens.has(article.id),
					timelineCompactOverride: this.compactOverrides.hasOwnProperty(article.id) ? this.compactOverrides[article.id] : 0,
					compactMedia: this.compactMedia,
				},
				on: {
					remove: ($event : any) => this.$emit('remove-article', $event),
					'set-hidden': this.onHiddenChange,
					'set-compact-override': this.onCompactOverrideChange,
				},
			},
		));

		if (this.columns === 1) {
			const label = createElement('div', {
					staticClass: 'timelineArticlesLabel',
					staticStyle: {
						position: 'sticky',
						top: 0,
						'background-color': 'black',
					},
				}, [
					createElement('p', {
							staticStyle: {
								'text-align': 'center',
							},
						}, `Showing ${this.articles.length > this.timelineArticleRadius ? this.timelineArticleRadius : this.articles.length} articles, first article: ${this.firstVisibleArticleIndex}`,
					),
				],
			);

			children = [label, ...articles];
		}else
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
				wheel: ($event : WheelEvent) => this.$emit('wheel', $event),
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
		this.firstVisibleArticleIndex = this.getFirstVisibleArticleIndex();

		if (this.articles.length - this.firstVisibleArticleIndex <= this.timelineArticleRadius)
			this.$emit('load-bottom');
	}

	getFirstVisibleArticleIndex() : number {
		for (const articleEl of this.$el.querySelectorAll('.article'))
			if (articleEl.getBoundingClientRect().bottom >= 0)
				return this.articles.findIndex(article => article.id === articleEl.getAttribute('article-id'));

		return 0;
	}

	get partialArticles() : Article[] {
		return this.articles.slice(Math.max(0, this.firstVisibleArticleIndex - this.timelineArticleRadius), this.firstVisibleArticleIndex + this.timelineArticleRadius);
	}

	@Watch('scrolling')
	onScrollChange(newScrolling : boolean) {
		if (newScrolling)
			this.autoScroll(false);
		else
			this.stopScroll();
	}
}
</script>

<style scoped lang='sass'>
.timelineArticles
	overflow-y: scroll
	overflow-x: hidden
	flex-grow: 1
	height: 100%

article.article.firstArticle
	background-color: blue
</style>