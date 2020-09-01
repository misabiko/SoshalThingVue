<template lang='pug'>
	#soshalThing
		Sidebar(@new-timeline='newTimeline')
		TimelineContainer(ref='timelineContainer')
		b-modal(:active.sync='isPostModalActive')
			PostCard
</template>

<script lang='ts'>
import {Vue, Component, Ref, Watch} from 'vue-property-decorator'
import TimelineContainer from './TimelineContainer';
import Sidebar from './Sidebar';
import Post from './Articles/Post.vue';
import {Mutation, State} from 'vuex-class';
import {ExpandedPost, SoshalState} from '../store';
import PostCard from './Articles/PostCard.vue';

@Component({
	components: {Post, Sidebar, TimelineContainer, PostCard}
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

		for (const service in json) if (json.hasOwnProperty(service))
			(this.$store.state as SoshalState).services[service].loggedIn = json[service];
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
@use '../bulma_overrides' as *

#soshalThing
	height: 100vh
	display: flex
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale
</style>