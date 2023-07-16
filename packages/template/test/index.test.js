import jsep from '../../../src/index.js';
import templateLiteral from '../src/index.js';
import {testParser, resetJsepDefaults} from '../../../test/test_utils.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugin:Template Literal', (qunit) => {
		qunit.before(() => jsep.plugins.register(templateLiteral));
		qunit.after(resetJsepDefaults);

		test('should parse basic template literal expression', (assert) => {
			testParser('`hi ${name}`', {
				type: 'TemplateLiteral',
				quasis: [
					{
						type: 'TemplateElement',
						value: {
							raw: 'hi ',
							cooked: 'hi ',
						},
						tail: false,
					},
					{
						type: 'TemplateElement',
						value: {
							raw: '',
							cooked: '',
						},
						tail: true,
					},
				],
				expressions: [
					{
						type: 'Identifier',
						name: 'name',
					},
				],
			}, assert);
		});

		test('should parse tagged, nested template literal expression', (assert) => {
			testParser('abc`token ${`nested ${`deeply` + "str"} blah`}`', {
				type: 'TaggedTemplateExpression',
				tag: {
					type: 'Identifier',
					name: 'abc',
				},
				quasi: {
					type: 'TemplateLiteral',
					quasis: [
						{
							type: 'TemplateElement',
							value: {
								raw: 'token ',
								cooked: 'token ',
							},
							tail: false,
						},
						{
							type: 'TemplateElement',
							value: {
								raw: '',
								cooked: '',
							},
							tail: true,
						},
					],
					expressions: [
						{
							type: 'TemplateLiteral',
							quasis: [
								{
									type: 'TemplateElement',
									value: {
										raw: 'nested ',
										cooked: 'nested ',
									},
									tail: false,
								},
								{
									type: 'TemplateElement',
									value: {
										raw: ' blah',
										cooked: ' blah',
									},
									tail: true,
								},
							],
							expressions: [
								{
									type: 'BinaryExpression',
									operator: '+',
									left: {
										type: 'TemplateLiteral',
										quasis: [
											{
												type: 'TemplateElement',
												value: {
													raw: 'deeply',
													cooked: 'deeply',
												},
												tail: true,
											},
										],
										expressions: [],
									},
									right: {
										type: 'Literal',
										value: 'str',
										raw: '"str"',
									},
								},
							],
						},
					],
				},
			}, assert);
		});

		test('should parse String.raw tagged, nested template literal expression', (assert) => {
			testParser('String.raw`token ${`nested ${`deeply` + "str"} blah`}`', {
				type: 'TaggedTemplateExpression',
				tag: {
					type: "MemberExpression",
					computed: false,
					object: {
						type: "Identifier",
						name: "String"
					},
					property: {
						type: "Identifier",
						name:"raw"
					}
				},
				quasi: {
					type: 'TemplateLiteral',
					quasis: [
						{
							type: 'TemplateElement',
							value: {
								raw: 'token ',
								cooked: 'token ',
							},
							tail: false,
						},
						{
							type: 'TemplateElement',
							value: {
								raw: '',
								cooked: '',
							},
							tail: true,
						},
					],
					expressions: [
						{
							type: 'TemplateLiteral',
							quasis: [
								{
									type: 'TemplateElement',
									value: {
										raw: 'nested ',
										cooked: 'nested ',
									},
									tail: false,
								},
								{
									type: 'TemplateElement',
									value: {
										raw: ' blah',
										cooked: ' blah',
									},
									tail: true,
								},
							],
							expressions: [
								{
									type: 'BinaryExpression',
									operator: '+',
									left: {
										type: 'TemplateLiteral',
										quasis: [
											{
												type: 'TemplateElement',
												value: {
													raw: 'deeply',
													cooked: 'deeply',
												},
												tail: true,
											},
										],
										expressions: [],
									},
									right: {
										type: 'Literal',
										value: 'str',
										raw: '"str"',
									},
								},
							],
						},
					],
				},
			}, assert);
		});		

		test('should parse multiple vars within template literal expression', (assert) => {
			testParser('`hi ${last}, ${first} ${middle}!`', {
				type: 'TemplateLiteral',
				quasis: [
					{
						type: 'TemplateElement',
						value: {
							raw: 'hi ',
							cooked: 'hi ',
						},
						tail: false,
					},
					{
						type: 'TemplateElement',
						value: {
							raw: ', ',
							cooked: ', ',
						},
						tail: false,
					},
					{
						type: 'TemplateElement',
						value: {
							raw: ' ',
							cooked: ' ',
						},
						tail: false,
					},
					{
						type: 'TemplateElement',
						value: {
							raw: '!',
							cooked: '!',
						},
						tail: true,
					},
				],
				expressions: [
					{
						type: 'Identifier',
						name: 'last',
					},
					{
						type: 'Identifier',
						name: 'first',
					},
					{
						type: 'Identifier',
						name: 'middle',
					},
				],
			}, assert);
		});

		test('should handle cooked (escaped) chars', (assert) => {
			testParser('`hi\\n\t`', {
				type: 'TemplateLiteral',
				quasis: [
					{
						type: 'TemplateElement',
						value: {
							raw: 'hi\\n\t',
							cooked: 'hi\n\t',
						},
						tail: true,
					},
				],
				expressions: [],
			}, assert);
		});

		[
			'`a\nbc${ b ? 1 : 2 }`', // mixed template/ternary
		].forEach(expr => test(`should not throw an error on expression ${expr}`, (assert) => {
			testParser(expr, {}, assert);
		}));

		[
			'`abc ${ `',
			'abc`123',
			'abc`${a`',
		].forEach(expr => test(`should give an error for invalid expression ${expr}`, (assert) => {
			assert.throws(() => jsep(expr));
		}));
	});
}());
