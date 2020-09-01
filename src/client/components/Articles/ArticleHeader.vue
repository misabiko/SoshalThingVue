<template lang='pug'>
	.articleHeader
		a.names(:href='service.getUserURL(handle)' target='_blank' rel='noopener noreferrer')
			strong {{ userName }}
			small {{'@' + handle}}
		span.timestamp: small(:title='creationTimeLong') {{ creationTimeShort }}
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import {Service} from '../../services/service';
import moment from 'moment';

moment.defineLocale('twitter', {
	relativeTime: {
		future: "in %s",
		past:   "%s ago",
		s  : 'a few seconds',
		ss : '%ds',
		m:  "a minute",
		mm: "%dm",
		h:  "an hour",
		hh: "%dh",
		d:  "a day",
		dd: "%dd",
		M:  "a month",
		MM: "%dm",
		y:  "a year",
		yy: "%dy"
	}
});
//TODO Fix locale not switching back
moment().locale('en');

@Component
export default class ArticleHeader extends Vue {
	@Prop({type: Object, required: true})
	readonly service!: Service;
	@Prop({type: String, required: true})
	readonly handle!: string;
	@Prop({type: String, required: true})
	readonly userName!: string;
	@Prop({type: String, required: true})
	readonly creationTime!: string;

	get creationTimeShort() : string {
		const t = moment(this.creationTime).locale('twitter').fromNow(true);
		moment().locale('en');
		return  t;
	}

	get creationTimeLong() : string {
		return moment(this.creationTime).fromNow();
	}
}
</script>

<style scoped lang='sass'>
@use '../../bulma_overrides' as *

.articleHeader *
	vertical-align: middle

	small
		color: $light

.names
	text-overflow: ellipsis
	white-space: nowrap
	overflow: hidden
	display: inline-block
	max-width: 300px

	strong
		margin-right: 0.5rem
		color: $white-ter

	&:hover > *
		text-decoration: underline

.timestamp
	float: right
</style>