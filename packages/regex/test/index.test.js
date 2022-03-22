import jsep from '../../../src/index.js';
import jsepRegex from '../src/index.js';
import {testParser, resetJsepDefaults, esprimaComparisonTest} from '../../../test/test_utils.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugin:Regex Literal', (qunit) => {
		qunit.before(() => jsep.plugins.register(jsepRegex));
		qunit.after(resetJsepDefaults);

		test('should parse basic regular expression', (assert) => {
			testParser('/abc/', {
				type: 'Literal',
				value: /abc/,
				raw: '/abc/',
			}, assert);
		});

		test('should parse basic regex with flags', (assert) => {
			testParser('/abc/ig', {
				type: 'Literal',
				value: /abc/gi,
				raw: '/abc/ig',
			}, assert);
		});

		test('should handle escapes properly', (assert) => {
			testParser('/\\d{3}/', {
				type: 'Literal',
				value: /\d{3}/,
				raw: '/\\d{3}/',
			}, assert);
		});

		test('should be able to escape / properly', (assert) => {
			testParser('/^\\/$/', {
				type: 'Literal',
				value: /^\/$/,
				raw: '/^\\/$/',
			}, assert);
		});

		test('should parse more complex regex within expression', (assert) => {
			testParser('a && /[a-z]{3}/ig.test(b)', {
				type: 'BinaryExpression', // Note: Esprima = LogicalExpression, but but jsep has `&&` as a binary op
				operator: '&&',
				left: {
					type: 'Identifier',
					name: 'a'
				},
				right: {
					type: 'CallExpression',
					arguments: [
						{
							type: 'Identifier',
							name: 'b'
						}
					],
					callee: {
						type: 'MemberExpression',
						computed: false,
						object: {
							type: 'Literal',
							value: /[a-z]{3}/ig,
							raw: '/[a-z]{3}/ig'
						},
						property: {
							type: 'Identifier',
							name: 'test'
						}
					}
				}
			}, assert);
		});

		[
			'/[a-z]{3}/ig.test(b)',
			'/\\d(?=px)/',
			'a / 2', // regex should not interfere with binary operator
			'/\\//',
			'/\\//',     // => /\//
			'/[\\/]/',   // => /[\/]/
			'/[/]/',     // => /[/]/
			'/[\\]/]/',     // => /[\]]/
			'/\\\\\\//', // => /\\\//
			'/\\[/',     // => /\[/
			'2 / 3', // binop
			'2 / 3 / 4', // binop
		].forEach((expr) => {
			test(`${expr} should match Esprima`, function (assert) {
				esprimaComparisonTest(expr, assert);
			});
		});

		[
			'/\d(?=px)/.test(a)',
			'a / /123/',
			'/123/ig["test"](b)',
			'/123/["test"](b)',
			'/\\p{Emoji_Presentation}/gu.test("ticket to 大阪 costs ¥2000 👌.")',
			'/abc/+/123/',
		].forEach(expr => test(`should not throw an error on expression ${expr}`, (assert) => {
			testParser(expr, {}, assert);
		}));

		[
			'/abc', // unclosed regex
			'/a/xzw', // invalid flag
			'/a/xyz.test(a)', // invalid flag
			'/a(/', // unclosed (
			'/a[/', // unclosed [
			'/[\\]/', // unclosed [
			'/\\/', // unclosed regex
		].forEach(expr => test(`should give an error for invalid expression ${expr}`, (assert) => {
			assert.throws(() => jsep(expr));
		}));

		QUnit.module('Regex with binary / operators', (qu) => {
			qu.beforeEach(() => {
				resetJsepDefaults();
				jsep.plugins.register(jsepRegex);
				jsep.addBinaryOp('/=');
			});
			qu.after(resetJsepDefaults);

			test('Should parse correctly with /= and regex', (assert) => {
				testParser('a /= (/^\\d+$/.test(b) ? +b / 2 : 1)', {
					type: 'BinaryExpression', // (assignment plugin would convert to AssignmentExpression)
					operator: '/=',
					left: {
						type: 'Identifier',
						name: 'a'
					},
					right: {
						type: 'ConditionalExpression',
						test: {
							type: 'CallExpression',
							arguments: [
								{
									type: 'Identifier',
									name: 'b'
								}
							],
							callee: {
								type: 'MemberExpression',
								computed: false,
								object: {
									type: 'Literal',
									value: /^\d+$/,
									raw: '/^\\d+$/'
								},
								property: {
									type: 'Identifier',
									name: 'test'
								}
							}
						},
						consequent: {
							type: 'BinaryExpression',
							operator: '/',
							left: {
								type: 'UnaryExpression',
								operator: '+',
								argument: {
									type: 'Identifier',
									name: 'b'
								},
								prefix: true
							},
							right: {
								type: 'Literal',
								value: 2,
								raw: '2'
							}
						},
						alternate: {
							type: 'Literal',
							value: 1,
							raw: '1'
						}
					}
				}, assert);
			});
		});
	});
}());
