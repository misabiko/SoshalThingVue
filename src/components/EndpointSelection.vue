<template>
	<div class='field'>
		<label class='label'>Service</label>
		<div class='control'>
			<div class='select'>
				<select v-model='modelValue.serviceIndex'>
					<option v-for='(s, i) in services' :value='i'>
						{{ s.name }}
					</option>
				</select>
			</div>
		</div>
	</div>
	<div class='field' v-if='Object.values(service.endpointTypes).length && service.endpoints.length'>
		<div class='control'>
			<input type='checkbox' v-model='newEndpoint'/>
			New Endpoint?
		</div>
	</div>
	<template v-if='endpointOptions && (!service.endpoints.length || newEndpoint)'>
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
		<component
			v-if='service.endpointTypes[endpointOptions.endpointType]'
			:is='service.endpointTypes[endpointOptions.endpointType].optionComponent'
			:endpointOptions='endpointOptions'
			@changeOptions='endpointOptions = $event'
		/>
	</template>
	<div class='field' v-else-if='service.endpoints.length'>
		<label class='label'>Endpoint</label>
		<div class='control'>
			<div class='select'>
				<select v-model='modelValue.endpointIndex'>
					<option v-for='(e, i) in service.endpoints' :value='i'>
						{{ e.name }}
					</option>
				</select>
			</div>
		</div>
	</div>
	<div class='field' v-else>
		<label class='label'>Endpoint</label>
		No endpoints to choose from.
	</div>
</template>

<script lang='ts'>
import {computed, defineComponent, PropType, ref, watch} from 'vue'
import {Service} from '@/services'
import {TimelineDataSerialized} from '@/App.vue'

export default defineComponent({
	props: {
		service: {
			type: Object as PropType<Service>,
			required: true,
		},
		modelValue: {
			type: Object as PropType<TimelineDataSerialized>,
			required: true,
		},
	},
	emits: ['update:modelValue'],

	setup(props, {emit}) {
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

		watch(
			() => props.service,
			(newService, oldService) => {
				if (newService.name !== oldService.name)
					endpointOptions.value = undefined
			}
		)
		watch(
			newEndpoint,
			(value, oldValue) => {
				if (value && value != oldValue)
					endpointOptions.value = {endpointType: Object.keys(props.service.endpointTypes)[0]}
			},
		)

		return {
			services: Service.instances,
			newEndpoint,
			endpointOptions,
		}
	}
})
</script>

<style scoped lang='sass'>

</style>