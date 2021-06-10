<template>
	<Sidebar></Sidebar>
	<TimelineContainer timelines='[]'></TimelineContainer>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import TimelineContainer from '@/components/TimelineContainer.vue'
import {TimelineData} from '@/data/timelines'

export default defineComponent({
	components: {TimelineContainer, Sidebar},
	setup() {

	}
})
</script>

<style lang="sass">
@import "sass"

</style>
