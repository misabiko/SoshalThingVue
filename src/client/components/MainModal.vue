<template lang='pug'>
	b-modal(:active.sync='active')
		PostCard(v-if="currentModal === 'PostCard'")
		.selectId.box(v-if="currentModal === 'SearchId'")
			b-field
				b-input(v-model='searchInput' placeholder='Tweet Id' type='search' expanded)
				p.control: b-button(@click='searchId' type='is-primary') Search
</template>

<script lang='ts'>
import {Vue, Component, Watch} from 'vue-property-decorator';
import PostCard from './Articles/PostCard.vue';
import {ExpandedPost} from '../store';
import {Mutation, State} from 'vuex-class';
import TwitterService from '../services/twitter';

@Component({components: {PostCard}})
export default class MainModal extends Vue {
	@State expandedPost! : ExpandedPost;
	@State currentModal! : string;
	@Mutation clearModal! : () => void;

	active = false;
	searchInput = '';

	clear() {
		this.clearModal();
		this.active = false;
	}

	async searchId() {
		try{
			const payload = await fetch('/twitter/tweets/status/' + this.searchInput).then(response => response.json());
			const service : TwitterService = (this.$store.state as any).services.Twitter;
			if (payload.post)
				service.addOrUpdatePosts(payload.post);
			if (payload.repost)
				service.addOrUpdatePosts(payload.repost);
			if (payload.quote)
				service.addOrUpdatePosts(payload.quote);

			this.$store.commit('expandPost', {
				service,
				id: payload.post.id,
				selectedMedia: 0,
			})
		}catch (e) {
			console.dir(e);
		}
	}

	@Watch('active')
	onActiveChange(active : boolean) {
		if (!active)
			this.clear();
	}

	@Watch('currentModal')
	onModalChanged(modal : string) {
		if (modal.length)
			this.active = true;
	}
}
</script>

<style scoped lang='sass'>

</style>