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

	return {
		file: `dist/${format}/jsep.${type}.js`,
		name: "jsep",
		format,
		sourcemap: type !== "esm",
		exports: "named", /** Disable warning for default imports */
		plugins: [
			minify? terser(terserConfig) : undefined
		]
	};
}

export default {
	input: "src/jsep.js",
	output: [
		bundle("esm"),
		bundle("esm.min"),
		bundle("iife"),
		bundle("iife.min"),
		bundle("cjs"),
		bundle("cjs.min"),
	],
	plugins: [
		replace({
			"<%= version %>": version,

			// Options:
			preventAssignment: false,
			delimiters: ['', ''],
		})
	]
};
