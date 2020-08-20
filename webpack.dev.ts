import {merge} from 'webpack-merge';
import common from './webpack.common';
import {Configuration} from 'webpack';

const serverConfig = <Configuration>{
	mode: 'development',
};

const clientConfig = <Configuration>{
	mode: 'development',
	devtool: 'inline-source-map',
};

export default [
	merge(common[0], serverConfig),
	merge(common[1], clientConfig)
];