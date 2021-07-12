<template>
	<div class='field'>
		<label class='label'>Service</label>
		<div class='control'>
			<div class='select'>
				<select v-model='modelValue.serviceName'>
					<option v-for='(s, name) in services' :value='name'>
						{{ name }}
					</option>
				</select>
			</div>
		</div>
	</div>
	<div class='field' v-if='Object.values(service.endpointTypes).length && Object.keys(service.endpoints).length'>
		<div class='control'>
			<input type='checkbox' v-model='newEndpoint'/>
			New Endpoint?
		</div>
	</div>
	<template v-if='endpointOptions && (!Object.keys(service.endpoints).length || newEndpoint)'>
		<div class='field'>
			<label class='label'>Endpoint Type</label>
			<div class='control'>
				<div class='select'>
					<select v-model='endpointOptions.endpointType'>
						<option v-for='(e, i) in service.endpointTypes' :value='i'>
							{{ i }}
						</option>
					</select>
				</div>
			</div>
		</div>
		<template v-if='endpointOptionComponent'>
			<component
				:is='endpointOptionComponent'
				:endpointOptions='endpointOptions'
				@changeOptions='endpointOptions = $event'
			/>
		</template>
	</template>
	<div class='field' v-else-if='Object.keys(service.endpoints).length'>
		<label class='label'>Endpoint</label>
		<div class='control'>
			<div class='select'>
				<select v-model='modelValue.endpointName'>
					<option v-for='(e, opts) in service.endpoints' :value='opts'>
						{{ e.name }}
					</option>
				</select>
			</div>
		</div>
		<fieldset disabled v-if='endpointOptionComponent'>
			<component
				:is='endpointOptionComponent'
				:endpointOptions='service.endpoints[modelValue.endpointName].getKeyOptions()'
			/>
		</fieldset>
	</div>
	<div class='field' v-else>
		<label class='label'>Endpoint</label>
		No endpoints to choose from.
	</div>
</template>

<script lang='ts'>
import {computed, defineComponent, PropType, ref, watch} from 'vue'
import {Service} from '@/services'
import {TimelineData} from '@/data/timelines'

export default defineComponent({
	props: {
		modelValue: {
			type: Object as PropType<TimelineData>,
			required: true,
		},
	},
	emits: ['update:modelValue'],

	setup(props, {emit}) {
		const service = computed(() => Service.instances[props.modelValue.serviceName])

		const endpointOptions = computed<any>({
			get: () => props.modelValue.endpointOptions,
			set: val => {
				emit('update:modelValue', {
					...props.modelValue,
					endpointOptions: val,
				})
			}
		})
		const newEndpoint = ref(!!endpointOptions.value)
		const endpointOptionComponent = computed(() => {
			if (endpointOptions.value?.endpointType && Object.keys(service.value.endpointTypes).length)
				return service.value.endpointTypes[endpointOptions.value.endpointType]?.optionComponent
		})

		watch(
			service,
			(newService, oldService) => {
				if (newService.name !== oldService.name) {
					if (Object.keys(newService.endpoints).length)
						props.modelValue.endpointName = Object.keys(newService.endpoints)[Object.keys(newService.endpoints).length - 1]
					else {
						props.modelValue.endpointName = undefined
						const endpointTypes = Object.keys(service.value.endpointTypes)
						endpointOptions.value = endpointTypes.length ? {endpointType: endpointTypes[0]} : undefined
					}
				}
			}
		)
		watch(
			newEndpoint,
			(value, oldValue) => {
				if (value && value != oldValue)
					endpointOptions.value = {endpointType: Object.keys(service.value.endpointTypes)[0]}
			},
		)

		return {
			service,
			services: Service.instances,
			newEndpoint,
			endpointOptions,
			endpointOptionComponent,
		}
	}
})
</script>

<style scoped lang='sass'>

</style>