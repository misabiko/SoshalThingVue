const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const serverConfig = {
	mode: 'development',
	target: 'node',
	node: {__dirname: false},
	entry: path.resolve(__dirname, 'src', 'server.ts'),
	output: {
		filename: 'server.js',
		path: path.resolve(__dirname, 'dist'),
	},
	resolve: {
		extensions: ['*', '.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				exclude: '/node_modules/',
			},
		],
	},
};

const clientConfig = {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: path.resolve(__dirname, 'src', 'index.ts'),
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist'),
	},
	resolve: {
		extensions: ['*', '.vue', '.tsx', '.ts', '.js'],
		alias: {
			vue: 'vue/dist/vue.js'
		},
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: '/node_modules/',
				options: { appendTsSuffixTo: [/\.vue$/] }
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.sass$/,
				use: [
					'vue-style-loader',
					'css-loader',
					{
						loader: 'sass-loader',
						options: {
							indentedSyntax: true,
							sassOptions: {
								indentedSyntax: true
							}
						}
					}
				]
			},
		],
	},
	plugins: [
		new VueLoaderPlugin(),
	],
};

module.exports = [serverConfig, clientConfig];