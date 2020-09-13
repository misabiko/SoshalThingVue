<template lang='pug'>
	#soshalThing
		Sidebar(@new-timeline='newTimeline')
		TimelineContainer(ref='timelineContainer')
		MainModal
</template>

<script lang='ts'>
import {Vue, Component, Ref} from 'vue-property-decorator';
import {State} from 'vuex-class';
import TimelineContainer from './Timelines/TimelineContainer.vue';
import Sidebar from './Sidebar';
import MainModal from './MainModal.vue';
import {Service} from '../services/service';

@Component({
	components: {Sidebar, TimelineContainer, MainModal},
})
export default class App extends Vue {
	@Ref() readonly timelineContainer! : TimelineContainer;

	@State services!: { [name : string] : Service }

	mounted() {
		this.checkLogins();
	}

	async checkLogins() {
		const json = await fetch('/checkLogins')
			.then(response => response.json());

		for (const service in json) if (json.hasOwnProperty(service))
			this.services[service].loggedIn = json[service];
	}

	newTimeline() : void {
		this.timelineContainer.addTimeline();
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