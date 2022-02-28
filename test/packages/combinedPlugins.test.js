import jsep from '../../src/jsep.js';
import jsepArrow from '../../packages/arrow/src/index.js';
import jsepAssignment from '../../packages/assignment/src/index.js';
import jsepAsyncAwait from '../../packages/async-await/src/index.js';
import jsepComment from '../../packages/comment/src/index.js';
import jsepNew from '../../packages/new/src/index.js';
import jsepNumbers from '../../packages/numbers/src/index.js';
import jsepObject from '../../packages/object/src/index.js';
import jsepRegex from '../../packages/regex/src/index.js';
import jsepSpread from '../../packages/spread/src/index.js';
import jsepTemplateLiteral from '../../packages/template/src/index.js';
import jsepTernary from '../../packages/ternary/src/index.js';
import {testParser, resetJsepDefaults, esprimaComparisonTest} from '../test_utils.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugin:Combined', (qunit) => {
		qunit.before(() => {
			jsep.plugins.register(
				jsepArrow,
				jsepAssignment,
				jsepAsyncAwait,
				jsepComment,
				jsepNew,
				jsepNumbers,
				jsepObject,
				jsepRegex,
				jsepSpread,
				jsepTemplateLiteral,
				jsepTernary
			);
		});
		qunit.after(resetJsepDefaults);

		[
			'a.find(() => true)',
			'[1, 2].find(v => v === 2)',
			'a.find((val, key) => key === "abc")',
			'a = 2',
			'a = 2',
			'a *= 2',
			'a **= 2',
			'a /= 2',
			'a %= 2',
			'a += 2',
			'a -= 2',
			'a <<= 2',
			'a >>= 2',
			'a >>>= 2',
			'a &= 2',
			'a ^= 2',
			'a |= 2',
			'a++',
			'a--',
			'++a',
			'--a',
			'(["a", "b"].find(v => v === "b").length > 1 || 2) === true',
			'a.find(val => key === "abc")',
			'a.find(() => []).length > 2',
			'(a || b).find(v => v(1))',
			'await a',
			'await a.find(async (v1, v2) => await v1(v2))',
			'await a.find(async v => await v)',
			'a.find(async ([v]) => await v)',
			'a.find(async () => await x)',
			'a /* ignore this */> 1 // ignore this too', // especially with regex plugin
			'a /* ignore *\r\n *this */> 1 // ignore this too',
			'a // ignore this\r\n> 1',
			'a /** {param} \r\n*/ > 1',
			'// a\na > 1',
			'new Date(123)',
			'new A().b',
			'new A() != null',
			'new A(), new B()',
			'[new A(), new A()]',
			'new A("1")',
			'new A(1, 2)',

			// numbers plugin:
			'0xA',
			'0xfF',
			'0xA_a',
			'0b01010101',
			'0b0000_0111',
			'0b1000_0000__0000_0000__0000_0000__0000_0000',
			'0755',
			'0o644',
			'0795',
			'115_200',
			'10_000E1',
			'1_0E2_0',
			'1_0E+2_0',
			'1E-2',
			'1_234.567_89',
			'0.1',
			'.1',

			'({ a: 1, b: 2 })',
			'{ [key || key2]: { a: 0 } }',
			'{ a: { b: { c: 1 } } }',
			'{ a: b ? 1 : 2, c }',
			'fn({ a: 1 })',
			'/abc/',
			'/abc/ig',
			'/\\d{3}/',
			'a && /[a-z]{3}/ig.test(b)',
			'/\d(?=px)/.test(a)',
			'a / /123/',
			'/123/ig["test"](b)',
			'/123/["test"](b)',
			'/\\p{Emoji_Presentation}/gu.test("ticket to 大阪 costs ¥2000 👌.")',
			'/abc/+/123/',
			'[...a]',
			'fn(1, ...b)',
			'fn(...123)',
			'fn(..."abc")',
			'[1, ...[2, 3]]',
			'[1, ...(a ? b : c)]',
			'{ ...a, ...b, c }',
			'`hi ${name}`',
			'abc`token ${`nested ${`deeply` + "str"} blah`}`',
			'`hi ${last}, ${first} ${middle}!`',
			'`hi\\n\t`',
			'`a\nbc${ b ? 1 : 2 }`',
			'a((1 + 2), (e > 0 ? f : g))',
			'a ? b : c',
			'a||b ? c : d',
		].forEach(expr => {
			test(`should parse expr "${expr}" without error`, (assert) => {
				testParser(expr, {}, assert);
			});
		});

		[
			'() =>',
			'a.find((  ) => )',
			'a.find((   ',

			'fn()++',
			'1++',
			'++',
			'(a + b)++',
			'--fn()',
			'--1',
			'--',
			'--(a + b)',

			'async 123',
			'async a + b',
			'a.find(async () + 2)',

			'a /* no close comment',

			'new A',
			'new A,new B',
			'fn(new A)',
			'!new A',
			'new 123',
			'new (a > 2 ? A : B)',
			'new (a > 1)',

			'{ a: }', // missing value
			'{ a: 1 ', // missing }
			'{ a: 2 ? 3, b }', // missing : in ternary

			'/abc', // unclosed regex
			'/a/xzw', // invalid flag
			'/a/xyz.test(a)', // invalid flag
			'/a(/', // unclosed (
			'/a[/', // unclosed [

			'[.....5]', // extra ..
			'[..2]', // missing .
			'[...3', // missing ]

			'1.2.3',
			'check(,)',
			'check(,1,2)',
			'check(1,,2)',
			'check(1,2,)',
			'check(a, b c d) ',
			'check(a, b, c d)',
			'check(a b, c, d)',
			'check(a b c, d)',
			'myFunction(a,b',
			'[1,2',
			'-1+2-',
		].forEach(expr => test(`should throw on invalid expression, ${expr}`, (assert) => {
			assert.throws(() => jsep(expr));
		}));

		([
			'a((1 + 2), (e > 0 ? f : g))',
			'[1,,3]',
			'[1,,]', // this is actually incorrect in esprima
			' true',
			'false ',
			' 1.2 ',
			' .2 ',
			'a',
			'a .b',
			'a.b. c',
			'a [b]',
			'a.b  [ c ] ',
			'$foo[ bar][ baz].other12 [\'lawl\'][12]',
			'$foo     [ 12	] [ baz[z]    ].other12*4 + 1 ',
			'$foo[ bar][ baz]    (a, bb ,   c  )   .other12 [\'lawl\'][12]',
			'(a(b(c[!d]).e).f+\'hi\'==2) === true',
			'(1,2)',
			'(a, a + b > 2)',
			'a((1 + 2), (e > 0 ? f : g))',
			'(((1)))',
			'(Object.variable.toLowerCase()).length == 3',
			'(Object.variable.toLowerCase())  .  length == 3',
			'[1] + [2]',

			// assignment
			'a = 2',
			'a *= 2',
			'a /= 2', // especially with regex plugin
			'a %= 2',
			'a += 2',
			'a -= 2',
			'a <<= 2',
			'a >>= 2',
			'a >>>= 2',
			'a &= 2',
			'a ^= 2',
			'a |= 2',
			'++a == 2',
			'a++ == 2',
			'2 == ++a',
			'2 == a++',
			'++a == 2',
			'a++ == 2',
			'2 == ++a',
			'2 == a++',
			'a ? a[1]++ : --b',

			// regex
			'/[a-z]{3}/ig.test(b)',
			'/\d(?=px)/',
		]).forEach(expr => {
			test(`should match Esprima: ${expr}`, function (assert) {
				esprimaComparisonTest(expr, assert);
			});
		});

		test('should parse arrow object defaults', (assert) => {
			testParser('[a].map(({a = 1} = {}) => a)', {
				type: 'CallExpression',
				arguments: [
					{
						type: 'ArrowFunctionExpression',
						params: [
							{
								type: 'AssignmentExpression',
								operator: '=',
								left: {
									type: 'ObjectExpression',
									properties: [
										{
											type: 'AssignmentExpression',
											operator: '=',
											left: {
												type: 'Identifier',
												name: 'a',
											},
											right: {
												type: 'Literal',
												value: 1,
												raw: '1',
											},
										},
									],
								},
								right: {
									type: 'ObjectExpression',
									properties: [],
								},
							},
						],
						body: {
							type: 'Identifier',
							name: 'a'
						}
					}
				],
				callee: {},
			}, assert);
		});

		test('should parse assignment to nested arrow function correctly', (assert) => {
			testParser(			'f = x => y => x + y', {
				type: 'AssignmentExpression',
				operator: '=',
				left: {
					type: 'Identifier',
					name: 'f',
				},
				right: {
					type: 'ArrowFunctionExpression',
					params: [
						{
							type: 'Identifier',
							name: 'x',
						}
					],
					body: {
						type: 'ArrowFunctionExpression',
						params: [
							{
								type: 'Identifier',
								name: 'y',
							}
						],
						body: {
							type: 'BinaryExpression',
							operator: '+',
							left: {
								type: 'Identifier',
								name: 'x',
							},
							right: {
								type: 'Identifier',
								name: 'y',
							},
						},
					},
				},
			}, assert);
		});

		([
			'(() => (x + 1))',
			'() => x + 1',
			'() => (x + 1)',
		]).forEach(expr => {
			test(`should parse arrow body ${expr} same, whether parenthesized or not`, function (assert) {
				testParser(			expr, {
					type: 'ArrowFunctionExpression',
					params: null,
					body: {
						type: 'BinaryExpression',
						operator: '+',
						left: {
							type: 'Identifier',
							name: 'x',
						},
						right: {
							type: 'Literal',
							value: 1,
							raw: '1',
						},
					},
				}, assert);
			});
		});

		test('should parse ()-enclosed, nested arrow correctly', (assert) => {
			testParser(			'x => (() => x + 1)', {
				type: 'ArrowFunctionExpression',
				params: [
					{
						type: 'Identifier',
						name: 'x',
					}
				],
				body: {
					type: 'ArrowFunctionExpression',
					params: null,
					body: {
						type: 'BinaryExpression',
						operator: '+',
						left: {
							type: 'Identifier',
							name: 'x',
						},
						right: {
							type: 'Literal',
							value: 1,
							raw: '1',
						},
					},
				},
			}, assert);
		});
	});
}());
