<template lang='pug'>
	#soshalThing
		Sidebar(@new-timeline='newTimeline')
		TimelineContainer(ref='timelineContainer')
		b-modal(:active.sync='isPostModalActive')
			.card
				.card-image: figure.image.is-4by3
					img
				.card-content: Post(:postId='expandedPost.id' :show-media='false')
</template>

<script lang='ts'>
import {Vue, Component, Ref, Watch} from 'vue-property-decorator'
import TimelineContainer from './TimelineContainer';
import Sidebar from './Sidebar';
import Post from './Post.vue';
import {Mutation, State} from 'vuex-class';
import {ExpandedPost} from '../store';

@Component({
	components: {
		Post,
		Sidebar,
		TimelineContainer,
	}
})
export default class App extends Vue {
	@Ref() readonly timelineContainer!: TimelineContainer

	@State expandedPost!: ExpandedPost;
	@Mutation clearExpandedPost!: () => void;

	isPostModalActive = false;

	mounted() {
		this.checkLogins();
	}

	async checkLogins() {
		const json = await fetch('/checkLogins')
			.then(response => response.json());

		this.$store.commit('updateLogins', json);
	}

	newTimeline() : void {
		this.timelineContainer.addTimeline();
	}

	@Watch('isPostModalActive')
	onPostModalChanged(isActive: boolean) {
		if (!isActive)
			this.clearExpandedPost();
	}

	@Watch('expandedPost')
	onExpandedPostChanged(post: ExpandedPost) {
		this.isPostModalActive = !!post.id.length;
	}
}
</script>

<style scoped lang='sass'>
@use '../variables' as *

#soshalThing
	height: 100vh
	display: flex
	background-color: $bg-color
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale
</style>