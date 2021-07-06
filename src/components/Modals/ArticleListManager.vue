<template>
	<div class='modal is-active' @click='$event.target.classList.contains("modal")  && (modal = undefined)'>
		<div class='modal-background'/>
		<div class='modal-content'>
			<div class='card'>
				<header class='card-header'>
					<p class='card-header-title'>
						Manage Article Lists
					</p>
					<button class='card-header-icon' aria-label='more options' @click='modal = undefined'>
						<span class='icon'>
							<FontAwesomeIcon icon='times' aria-hidden='true'/>
						</span>
					</button>
				</header>
				<div class='card-content'>
					<div class='field'>
						<label class='label'>List</label>
						<div class='control'>
							<div class='select'>
								<select v-model='editedListName'>
									<option v-for='(list, listName) in articleLists' :value='listName'>
										{{ listName }}
									</option>
								</select>
							</div>
						</div>
						<div class='control' v-if='editedListName'>
							<div class='select is-multiple'>
								<select multiple size='5' v-model='editedListArticles'>
									<option v-for='(a, i) in articleLists[editedListName]' :value='i'>
										{{ services[a.serviceIndex].name }}: {{ a.articleId }}
									</option>
								</select>
							</div>
						</div>
					</div>
					<div class='field'>
						<div class='control'>
							<label class='radio'>
								<input
									type='radio'
									:value='SelectionMode.ServiceArticles'
									v-model='selectionMode'
								/>
								Service Articles
							</label>
							<label class='radio'>
								<input
									type='radio'
									:value='SelectionMode.EndpointArticles'
									v-model='selectionMode'
								/>
								Endpoint Articles
							</label>
							<label class='radio'>
								<input
									type='radio'
									:value='SelectionMode.EndpointPage'
									v-model='selectionMode'
								/>
								Endpoint Pages
							</label>
						</div>
					</div>
					<div class='field'>
						<label class='label'>Service Articles</label>
						<div class='control'>
							<div class='select'>
								<select v-model='serviceIndex'>
									<option v-for='(s, i) in services' :value='i'>
										{{ s.name }}
									</option>
								</select>
							</div>
						</div>
						<div class='control' v-if='selectionMode === SelectionMode.ServiceArticles'>
							<div class='select is-multiple' v-if='Object.keys(service.articles).length'>
								<select multiple size='5' v-model='serviceArticles'>
									<option v-for='(a, id) in service.articles' :value='id'>
										{{ id }}
									</option>
								</select>
							</div>
							<span v-else>
								{{ service.name }} doesn't have any articles.
							</span>
						</div>
					</div>
					<div class='field'
						 v-if='selectionMode !== SelectionMode.ServiceArticles && services[serviceIndex].endpoints.length'>
						<label class='label'>Endpoint Articles</label>
						<div class='control'>
							<div class='select'>
								<select v-model='endpointIndex'>
									<option v-for='(e, i) in service.endpoints' :value='i'>
										{{ e.name }}
									</option>
								</select>
							</div>
						</div>
						<div class='control'
							 v-if='selectionMode === SelectionMode.EndpointPage && endpointLoadedPages && endpointLoadedPages.length'>
							<div class='select'>
								<select v-model='selectedPage'>
									<option v-for='page in endpointLoadedPages' :value='page'>
										{{ page }}
									</option>
								</select>
							</div>
						</div>
					</div>
				</div>
				<footer class='card-footer'>
					<button class='button card-footer-item' @click='addArticles(false)'>
						Add
					</button>
					<button class='button card-footer-item' @click='addArticles(true)'>
						Add Missing
					</button>
					<button class='button card-footer-item' @click='removeArticles'>
						Remove
					</button>
					<button class='button card-footer-item' @click='articleLists[editedListName] = []'>
						Clear
					</button>
				</footer>
			</div>
		</div>
	</div>
</template>

<script lang='ts'>
import {computed, defineComponent, onBeforeUpdate, ref} from 'vue'
import {PagedEndpoint, Service} from '@/services'
import {articleLists} from '@/data/articleLists'
import {modal} from '@/composables/ModalManager'

export enum SelectionMode {
	ServiceArticles,
	EndpointArticles,
	EndpointPage,
}

export default defineComponent({
	setup() {
		const editedListName = ref(Object.keys(articleLists)[0])
		onBeforeUpdate(() => {
			if (!editedListName.value)
				editedListName.value = Object.keys(articleLists)[0]
		})

		const editedListArticles = ref([])

		const selectionMode = ref<SelectionMode>(SelectionMode.ServiceArticles)

		const serviceIndex = ref(0)
		const service = computed(() => Service.instances[serviceIndex.value])
		const serviceArticles = ref([])

		const endpointIndex = ref(0)
		const endpoint = computed(() => service.value?.endpoints[endpointIndex.value])
		const selectedPage = ref<undefined | number>(undefined)
		const endpointLoadedPages = computed(() => {
			if (endpoint.value instanceof PagedEndpoint) {
				const loadedPages = Object.keys(endpoint.value.loadedPages)
				if (selectedPage.value === undefined && loadedPages.length)
					selectedPage.value = parseInt(loadedPages[0])
				return loadedPages
			}else
				return undefined
		})

		function addArticles(ignoreIncluded : boolean) {
			switch (selectionMode.value) {
				case SelectionMode.ServiceArticles:
					articleLists.value[editedListName.value].push(...serviceArticles.value
						.filter((id : string) => !ignoreIncluded || !articleLists.value[editedListName.value].find(a => a.articleId === id))
						.map(id => {
							return {articleId: id, serviceIndex: serviceIndex.value}
						}),
					)
					break
				case SelectionMode.EndpointArticles:
					break
				case SelectionMode.EndpointPage:
					if (selectedPage.value !== undefined)
						articleLists.value[editedListName.value].push(...(endpoint.value as PagedEndpoint).loadedPages[selectedPage.value]
							.filter((id : string) => !ignoreIncluded || !articleLists.value[editedListName.value].find(a => a.articleId === id))
							.map((id : string) => {
								return {articleId: id, serviceIndex: serviceIndex.value}
							}),
						)
					break
			}
		}

		function removeArticles() {
			for (const i of editedListArticles.value)
				articleLists.value[editedListName.value].splice(i, 1)

			editedListArticles.value = []
		}

		return {
			modal,
			articleLists,
			editedListName,
			editedListArticles,
			SelectionMode,
			selectionMode,
			services: Service.instances,
			serviceIndex,
			service,
			serviceArticles,
			endpointIndex,
			endpoint,
			endpointLoadedPages,
			selectedPage,
			addArticles,
			removeArticles,
		}
	},
})
</script>

<style scoped lang='sass'>
@use '../../sass/core' as *
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