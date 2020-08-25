<template lang='pug'>
	Post(
		v-if='isPost'
		:key='article.id'
		:postId='article.id'
		:compact-media='compactMedia'
		@remove='removeArticle($event)'
	)
	Repost(
		v-else-if='isRepost'
		:key='article.id'
		:repostId='article.id'
		:compact-media='compactMedia'
		@remove='removeArticle($event)'
	)
	Quote(
		v-else
		:key='article.id'
		:quoteId='article.id'
		:compact-media='compactMedia'
		@remove='removeArticle($event)'
	)
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import Post from './Post.vue';
import Repost from './Repost.vue';
import Quote from './Quote.vue';
import {Article, ArticleType} from '../../core/PostData';

@Component({components: {Post, Repost, Quote}})
export default class ArticleGeneric extends Vue {
	@Prop({type: Object, required: true})
	readonly article!: Article;
	@Prop({type: Boolean})
	readonly compactMedia!: boolean;

	//TODO Redo with render function
	get isPost() {
		return this.article.type === ArticleType.Post;
	}

	get isRepost() {
		return this.article.type === ArticleType.Repost;
	}
}
</script>

<style scoped lang='sass'>

</style>