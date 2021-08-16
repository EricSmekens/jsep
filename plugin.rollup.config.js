import del from 'rollup-plugin-delete';
import { bundle } from './rollup.config.js';

const name = 'index';
export default [
	{
		input: "src/index.js",
		output: [
			bundle("esm", name),
			bundle("esm.min", name),
			bundle("iife", name),
			bundle("iife.min", name),
			bundle("cjs", name),
			bundle("cjs.min", name),
		],
		plugins: [
			del({ targets: 'dist/*' }),
		],
	},
];
