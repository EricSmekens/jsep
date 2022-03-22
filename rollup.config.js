import { terser } from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';
import del from 'rollup-plugin-delete';

const { version: pkgVersion } = require('./package.json');

const version = process.env.NEXT_VERSION || pkgVersion;

export const terserConfig = {
	compress: true,
	mangle: true
};

export function bundle(type, name = 'jsep') {
	let minify = false;
	let format = type.replace(".min", () => {
		minify = true;
		return "";
	});

	let suffix = `.${type}`.replace(".esm", "");
	let folder = format === 'esm' ? '' : `${format}/`;

	return {
		file: `dist/${folder}${name}${suffix}.js`,
		name,
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
		input: "src/index.js",
		output: [
			bundle("esm"),
			bundle("esm.min"),
		],
		plugins: [
			del({ targets: 'dist/*' }),
			versionPlugin,
		],
	},
	{
		input: "src/index.js",
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
