const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
				options: {appendTsSuffixTo: [/\.vue$/]}
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.sass$/,
				use: [
					'vue-style-loader',
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							publicPath: '/public/',
						},
					},
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
							implementation: require('sass'),
							sassOptions: {
								indentedSyntax: true
							}
						}
					}
				]
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
		],
	},
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: 'style.css',
		}),
	],
};

module.exports = [serverConfig, clientConfig];