import path from 'path';
import {VueLoaderPlugin} from 'vue-loader';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {Configuration} from 'webpack';
//import nodeExternals from 'webpack-node-externals';

const serverConfig = <Configuration>{
	target: 'node',
	node: {__dirname: false},
	//externals: [nodeExternals()],
	entry: path.resolve(__dirname, 'src', 'server', 'server.ts'),
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

const clientConfig = <Configuration>{
	entry: path.resolve(__dirname, 'src', 'client', 'index.ts'),
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
				test: /\.scss$/,
				use: [
					'style-loader',
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
							implementation: import('sass'),
						}
					}
				],
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.pug$/,
				loader: 'pug-plain-loader',
			}
		],
	},
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: 'style.css',
		}),
	],
};

export default [serverConfig, clientConfig] as Configuration[];