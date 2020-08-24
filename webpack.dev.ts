import {merge} from 'webpack-merge';
// @ts-ignore
import common from './webpack.common';

export default common.map(config => merge(config, {
	mode: 'development',
}));