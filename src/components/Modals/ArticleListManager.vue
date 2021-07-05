<template>
	<div class='modal is-active' @click='$emit($event.target.classList.contains("modal") ? "close" : "")'>
		<div class='modal-background'/>
		<div class='modal-content'>
			<div class='card'>
				<header class='card-header'>
					<p class='card-header-title'>
						Manage Article Lists
					</p>
					<button class='card-header-icon' aria-label='more options' @click='$emit("close")'>
						<span class='icon'>
							<FontAwesomeIcon icon='times' aria-hidden='true'/>
						</span>
					</button>
				</header>
				<div class='card-content'>
				</div>
				<footer class='card-footer'>
				</footer>
			</div>
		</div>
	</div>
</template>

<script lang='ts'>
import {defineComponent, ref} from 'vue'

export const articleLists = ref<{ [id : string] : { serviceIndex : number, articleId : string }[] }>({})

export function getNewId() {
	let id = 0
	while (articleLists.value.hasOwnProperty('generated' + id))
		id++

	return 'generated' + id
}

export default defineComponent({
	emits: ['close'],
})
</script>

<style scoped lang='sass'>

</style>