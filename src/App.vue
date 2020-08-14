<template>
	<div id='soshalThing'>
		<Sidebar></Sidebar>
		<TimelineContainer></TimelineContainer>
	</div>
</template>

<script>
import TimelineContainer from "./components/TimelineContainer";
import Sidebar from "./components/Sidebar";

export default {
	components: {
		TimelineContainer,
		Sidebar
	}
}
</script>

<style lang='sass'>
@use 'variables' as *

#soshalThing
	color: white
	background-color: $bg-color
	height: 100vh
	overflow-x: scroll
	overflow-y: hidden
</style>