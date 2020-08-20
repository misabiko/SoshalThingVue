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
});