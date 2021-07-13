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
	},
	chainWebpack: (config) => {
		if (process.env.NODE_ENV === 'test') {
			const sassRule = config.module.rule('sass');
			sassRule.uses.clear();
			sassRule
				.use('null-loader')
				.loader('null-loader');
		}
	},
}