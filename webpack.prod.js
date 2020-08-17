const {merge} = require('webpack-merge');
const common = require('./webpack.common');

module.exports = common.map(config => merge(config, {
	mode: 'production',
}));