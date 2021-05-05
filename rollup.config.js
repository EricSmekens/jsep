import { terser } from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';

const { version } = require('./package.json');

const terserConfig = {
	compress: true,
	mangle: true
};

function bundle(type) {
	let minify = false;
	let format = type.replace(".min", () => {
		minify = true;
		return "";
	});

	let suffix = `.${type}`.replace(".esm", "");
	let folder = format === 'esm' ? '' : `${format}/`;

	return {
		file: `dist/${folder}/jsep${suffix}.js`,
		name: "jsep",
		format,
		sourcemap: type !== "esm",
		exports: format === 'esm' ? 'named' : 'default',
		plugins: [
			minify? terser(terserConfig) : undefined,
		]
	};
}

const versionPlugin = replace({
	"<%= version %>": version,

	// Options:
	preventAssignment: false,
	delimiters: ['', ''],
});

export default [
	{
		input: "src/jsep.js",
		output: [
			bundle("esm"),
			bundle("esm.min"),
		],
		plugins: [
			versionPlugin,
		],
	},
	{
		input: "src/jsep.js",
		output: [
			bundle("iife"),
			bundle("iife.min"),
			bundle("cjs"),
			bundle("cjs.min"),
		],
		plugins: [
			versionPlugin,
			replace({
				'export class Jsep': 'class Jsep', // single default export
				preventAssignment: false,
			}),
		],
	},
];
