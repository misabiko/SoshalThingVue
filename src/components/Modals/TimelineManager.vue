<template>
	<div class='modal is-active' @click='$event.target.classList.contains("modal")  && (modal = undefined)'>
		<div class='modal-background'/>
		<div class='modal-content'>
			<div class='card'>
				<header class='card-header'>
					<p class='card-header-title'>
						Manage Timelines
					</p>
					<button class='card-header-icon' aria-label='more options' @click='modal = undefined'>
						<span class='icon'>
							<FontAwesomeIcon icon='times' aria-hidden='true'/>
						</span>
					</button>
				</header>
				<div class='card-content'>
					<div class='field'>
						<label class='label'>Upload timelines</label>
						<div class='control file'>
							<label class='file-label'>
								<input class='file-input' type='file' @change='receiveFile'>
								<span class='file-cta'>
									  <span class='file-icon'>
										  <FontAwesomeIcon icon='upload' aria-hidden='true'/>
									  </span>
									  <span class='file-label'>
										  Choose a file…
									  </span>
								</span>
							</label>
						</div>
					</div>
					<div class='control'>
						<a class='button' :href='timelineDataStr' download='timelines.json'>
							<span class='icon'>
								<FontAwesomeIcon icon='download'/>
							</span>
							<span>Download</span>
						</a>
					</div>
				</div>
				<footer class='card-footer'>
				</footer>
			</div>
		</div>
	</div>
</template>

<script lang='ts'>
import {computed, defineComponent, PropType} from 'vue'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faDownload, faTimes, faUpload} from '@fortawesome/free-solid-svg-icons'
import {TimelineData} from '@/data/timelines'

library.add(faTimes, faUpload, faDownload)

export default defineComponent({
	props: {
		timelines: {
			type: Array as PropType<TimelineData[]>,
			requried: true,
		}
	},

	setup(props, {emit}) {
		async function receiveFile(event : Event) {
			emit('changeTimelines', await new Promise((resolve, reject) => {
				const files = (event.target as HTMLInputElement).files
				if (!files?.length || !files[0])
					return reject(new Error('No files found.'))

				const fileReader = new FileReader()
				fileReader.onload = event => {
					if (!event.target?.result)
						return reject(new Error('Failed to parse json file'))
					else
						return resolve(JSON.parse(event.target.result as string))
				}
				fileReader.onerror = error => reject(error)
				fileReader.readAsText(files[0])
			}))
		}

		const timelineDataStr = computed(() => 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(props.timelines, null, '\t')))

		return {receiveFile, timelineDataStr}
	},
})
</script>

<style scoped lang='sass'>
@use '~@/sass/core' as *
@import "~bulma/sass/utilities/mixins"

.modal.is-active
	overflow: auto

.modalButtons
	position: fixed
	bottom: 20%
	left: 50%
	width: 0
	overflow: visible
	display: flex
	opacity: 0.5
	justify-content: center

	&:hover
		opacity: unset

//TODO Remove this when bulma is updated?
.card-header-icon
	background: 0 0
	border: 0
</style>