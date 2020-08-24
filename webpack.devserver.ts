import path from "path";
// @ts-ignore
import {clientConfig} from './webpack.common';
import {merge} from 'webpack-merge';
import {Configuration} from 'webpack';
import configure from './src/server/configure';

export default merge(clientConfig, <Configuration>{
	mode: 'development',
	devServer: {
		contentBase: path.resolve(__dirname, 'public'),
		before: configure,
		port: 3000,
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	}
});