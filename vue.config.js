const configureAPI = require('./src/server/configure')

module.exports = {
	pages: {
		index: {
			entry: 'src/main.ts',
			title: 'SoshalThing',
		},
	},
	devServer: {
		before: configureAPI,
		disableHostCheck: true
	}
}