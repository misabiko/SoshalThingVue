<template lang='pug'>
	#soshalThing.has-text-light
		Sidebar(@new-timeline='newTimeline')
		TimelineContainer(ref='timelineContainer')
</template>

<script lang='ts'>
import {Vue, Component, Ref} from 'vue-property-decorator'
import TimelineContainer from './TimelineContainer';
import Sidebar from './Sidebar';

@Component({
	components: {
		Sidebar,
		TimelineContainer,
	}
})
export default class App extends Vue {
	@Ref() readonly timelineContainer!: TimelineContainer

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
}
</script>

<style lang='sass'>
@use '../variables' as *
@import '~bulma'

#soshalThing
	height: 100vh
	display: flex
	background-color: $bg-color
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale
</style>