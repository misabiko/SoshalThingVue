<template lang='pug'>
	Post(
		v-if='isPost'
		:key='article.id'
		:postId='article.id'
		@remove='removeArticle($event)'
	)
	Repost(
		v-else
		:key='article.id'
		:repostId='article.id'
		@remove='removeArticle($event)'
	)
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import Post from './Post.vue';
import Repost from './Repost.vue';
import {Article, ArticleType} from '../../core/PostData';

@Component({components: {Post, Repost}})
export default class ArticleComponent extends Vue {
	@Prop({type: Object, required: true})
	readonly article!: Article;

	get isPost() {
		return this.article.type === ArticleType.Post;
	}
}
</script>

<style scoped lang='sass'>

</style>