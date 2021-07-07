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
										{{ a.serviceName }}: {{ a.articleId }}
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
									:value='SelectionMode.EndpointLoadedPages'
									v-model='selectionMode'
								/>
								Endpoint Loaded Pages
							</label>
							<label class='radio'>
								<input
									type='radio'
									:value='SelectionMode.EndpointNewPages'
									v-model='selectionMode'
								/>
								Endpoint New Pages
							</label>
						</div>
					</div>
					<div class='field'>
						<label class='label'>Service Articles</label>
						<div class='control'>
							<div class='select'>
								<select v-model='serviceName'>
									<option v-for='(s, name) in services' :value='name'>
										{{ name }}
									</option>
								</select>
							</div>
						</div>
						<div class='control' v-if='selectionMode === SelectionMode.ServiceArticles'>
							<div class='select is-multiple' v-if='Object.keys(service.articles.value).length'>
								<select multiple size='5' v-model='selectedArticles'>
									<option v-for='(a, id) in service.articles.value' :value='id'>
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
						 v-if='selectionMode !== SelectionMode.ServiceArticles && Object.keys(services[serviceName].endpoints).length'>
						<label class='label'>Endpoint Articles</label>
						<div class='control'>
							<div class='select'>
								<select v-model='endpointName'>
									<option v-for='(e, opts) in service.endpoints' :value='opts'>
										{{ e.name }}
									</option>
								</select>
							</div>
						</div>
						<div class='control' v-if='endpoint && selectionMode === SelectionMode.EndpointArticles'>
							<div class='select is-multiple' v-if='Object.keys(endpoint.articles).length'>
								<select multiple size='5' v-model='selectedArticles'>
									<option v-for='(a, id) in service.articles.value' :value='id'>
										{{ id }}
									</option>
								</select>
							</div>
							<span v-else>
								{{ endpoint.name }} doesn't have any articles.
							</span>
						</div>
						<div class='control'
							 v-if='selectionMode === SelectionMode.EndpointLoadedPages && endpointLoadedPages && endpointLoadedPages.length'>
							<div class='select'>
								<select v-model='selectedPage'>
									<option v-for='page in endpointLoadedPages' :value='page'>
										{{ page }}
									</option>
								</select>
							</div>
						</div>
						<div class='control'
							 v-else-if='selectionMode === SelectionMode.EndpointNewPages && endpointRemainingPages && endpointRemainingPages.length'>
							<div class='select'>
								<select v-model='selectedPage'>
									<option v-for='page in endpointRemainingPages' :value='page'>
										{{ page }}
									</option>
								</select>
							</div>
						</div>
						<div class='control' v-if='endpoint && selectionMode === SelectionMode.EndpointArticles'>
							<div class='select is-multiple' v-if='Object.keys(endpoint.articles).length'>
								<select multiple size='5' v-model='selectedArticles'>
									<option v-for='(a, id) in service.articles.value' :value='id'>
										{{ id }}
									</option>
								</select>
							</div>
							<span v-else>
								{{ endpoint.name }} doesn't have any articles.
							</span>
						</div>
						<div class='control'
							 v-else-if='selectionMode === SelectionMode.EndpointNewPages && endpointRemainingPages && endpointRemainingPages.length'>
							<div class='select'>
								<select v-model='selectedPage'>
									<option v-for='page in endpointRemainingPages' :value='page'>
										{{ page }}
									</option>
								</select>
							</div>
						</div>
					</div>
				</div>
				<footer class='card-footer'>
					<button class='button card-footer-item' @click='addArticles(false)' :disabled='!editedListName'>
						Add
					</button>
					<button class='button card-footer-item' @click='addArticles(true)' :disabled='!editedListName'>
						Add Missing
					</button>
					<button class='button card-footer-item' @click='removeArticles' :disabled='!editedListName'>
						Remove
					</button>
					<button class='button card-footer-item' @click='articleLists[editedListName] = []' :disabled='!editedListName'>
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
import {articleLists, saveLists} from '@/data/articleLists'
import {modal} from '@/composables/ModalManager'

enum SelectionMode {
	ServiceArticles,
	EndpointArticles,
	EndpointLoadedPages,
	EndpointNewPages,
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

		const serviceName = ref(Object.keys(Service.instances)[0])
		const service = computed(() => Service.instances[serviceName.value])
		const selectedArticles = ref([])

		const endpointName = ref(Object.keys(service.value.endpoints)[0])
		const endpoint = computed(() => service.value?.endpoints[endpointName.value])
		const selectedPage = ref<undefined | number>(undefined)
		const endpointLoadedPages = computed(() => {
			if (endpoint.value instanceof PagedEndpoint) {
				const loadedPages = Object.keys(endpoint.value.loadedPages.value)
				if (selectedPage.value === undefined && loadedPages.length)
					selectedPage.value = parseInt(loadedPages[0])
				return loadedPages
			}else
				return undefined
		})

		async function addArticles(ignoreIncluded : boolean) {
			switch (selectionMode.value) {
				case SelectionMode.ServiceArticles:
				case SelectionMode.EndpointArticles:
					articleLists.value[editedListName.value].push(...selectedArticles.value
						.filter((id : string) => !ignoreIncluded || !articleLists.value[editedListName.value].find(a => a.articleId === id))
						.map(id => {
							return {articleId: id, serviceName: serviceName.value}
						}),
					)
					break
				case SelectionMode.EndpointLoadedPages:
					if (selectedPage.value !== undefined)
						articleLists.value[editedListName.value].push(...(endpoint.value as PagedEndpoint).loadedPages.value[selectedPage.value]
							.filter((id : string) => !ignoreIncluded || !articleLists.value[editedListName.value].find(a => a.articleId === id))
							.map((id : string) => {
								return {articleId: id, serviceName: serviceName.value}
							}),
						)
					break
				case SelectionMode.EndpointNewPages:
					if (selectedPage.value !== undefined) {
						const articles = await service.value.getNewArticles(endpoint.value, {pageNum: selectedPage.value})
						console.dir((endpoint.value as PagedEndpoint)?.remainingPages.value)
						articleLists.value[editedListName.value].push(...articles
							.filter((id : string) => !ignoreIncluded || !articleLists.value[editedListName.value].find(a => a.articleId === id))
							.map((id : string) => {
								return {articleId: id, serviceName: serviceName.value}
							}),
						)
					}
					break
			}

			saveLists()
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
			serviceName,
			service,
			selectedArticles,
			endpointName,
			endpoint,
			endpointLoadedPages,
			endpointRemainingPages: (endpoint.value as PagedEndpoint)?.remainingPages,
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