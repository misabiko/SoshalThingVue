<template>
	<Sidebar></Sidebar>
	<TimelineContainer timelines='[]'></TimelineContainer>
</template>

<script lang="ts">
import {defineComponent} from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import TimelineContainer from '@/components/TimelineContainer.vue'

export default defineComponent({
	components: {TimelineContainer, Sidebar},
})
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
