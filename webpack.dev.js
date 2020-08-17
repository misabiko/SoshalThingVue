const {merge} = require('webpack-merge');
const common = require('./webpack.common');

const serverConfig = {
	mode: 'development',
};

const clientConfig = {
	mode: 'development',
	devtool: 'inline-source-map',
};

module.exports = [
	merge(common[0], serverConfig),
	merge(common[1], clientConfig)
];