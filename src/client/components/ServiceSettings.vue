<template lang='pug'>
	.box {{ service.name }}
		div(v-for='endpoint in service.endpoints' :key='endpoint.name')
			p {{ endpoint.name }}
			b-progress(:value='endpoint.rateLimitStatus.remaining' :max='endpoint.rateLimitStatus.limit' show-value)
				span {{ endpoint.rateLimitStatus.remaining }} / {{ endpoint.rateLimitStatus.limit }}
			p Reset {{ toRelative(endpoint.rateLimitStatus.reset) }}
		.level(v-if='!service.loggedIn')
			.level-left
			.level-right
				a.button.level-item(:href='service.loginHref') Login
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import moment from 'moment';
import {Service} from '../services/service';

@Component
export default class ServiceSettings extends Vue {
	@Prop({type: Object, required: true})
	readonly service! : Service;

	toRelative(time : number) : string {
		return moment.unix(time).fromNow();
	}
};
</script>