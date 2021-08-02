import { terser } from "rollup-plugin-terser";
import replace from '@rollup/plugin-replace';
import del from 'rollup-plugin-delete';

const { version } = require('./package.json');

const terserConfig = {
	compress: true,
	mangle: true
};

function bundle(type, name = 'jsep') {
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
	...[
		'jsepArrow',
		'jsepAssignment',
		'jsepComment',
		'jsepNew',
		'jsepObject',
		'jsepRegex',
		'jsepSpread',
		'jsepTemplateLiteral',
	].map(name => ({
		input: `src/plugins/${name}.js`,
		output: [
			bundle('esm', name),
			bundle('esm.min', name),
			bundle('iife', name),
			bundle('iife.min', name),
			bundle('cjs', name),
			bundle('cjs.min', name),
		],
	})),
];
