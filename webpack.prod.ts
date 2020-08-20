import {merge} from 'webpack-merge';
import common from './webpack.common';

export default common.map(config => merge(config, {
	mode: 'production',
}));