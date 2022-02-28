import jsep from '../../../src/jsep.js';
import arrow from '../src/index.js';
import { testParser, resetJsepDefaults } from '../../../test/test_utils.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugin:Arrow Function', (qunit) => {
		qunit.before(() => jsep.plugins.register(arrow));
		qunit.after(resetJsepDefaults);

		test('should parse basic arrow expression with no args, () =>', (assert) => {
			testParser('a.find(() => true)', {
				type: "CallExpression",
				arguments: [
					{
						type: "ArrowFunctionExpression",
						params: null,
						body: {
							type: "Literal",
							value: true,
							raw: "true"
						}
					}
				],
				callee: {
					type: "MemberExpression",
					computed: false,
					object: {
						type: "Identifier",
						name: "a"
					},
					property: {
						type: "Identifier",
						name: "find"
					}
				}
			}, assert);
		});

		test('should parse basic arrow expression with single non-parenthesized arg, v =>', (assert) => {
			testParser('[1, 2].find(v => v === 2)', {
				type: "CallExpression",
				arguments: [
					{
						type: "ArrowFunctionExpression",
						params: [
							{
								type: "Identifier",
								name: "v"
							}
						],
						body: {
							type: "BinaryExpression",
							operator: "===",
							left: {
								type: "Identifier",
								name: "v"
							},
							right: {
								type: "Literal",
								value: 2,
								raw: "2"
							}
						}
					}
				],
				callee: {
					type: "MemberExpression",
					computed: false,
					object: {
						type: "ArrayExpression",
						elements: [
							{
								type: "Literal",
								value: 1,
								raw: "1"
							},
							{
								type: "Literal",
								value: 2,
								raw: "2"
							}
						]
					},
					property: {
						type: "Identifier",
						name: "find"
					}
				}
			}, assert);
		});

		test('should parse basic arrow expression with multiple arga, (a, b) =>', (assert) => {
			testParser('a.find((val, key) => key === "abc")', {
				type: "CallExpression",
				arguments: [
					{
						type: "ArrowFunctionExpression",
						params: [
							{
								type: "Identifier",
								name: "val"
							},
							{
								type: "Identifier",
								name: "key"
							}
						],
						body: {
							type: "BinaryExpression",
							operator: "===",
							left: {
								type: "Identifier",
								name: "key"
							},
							right: {
								type: "Literal",
								value: "abc",
								raw: "\"abc\""
							}
						}
					}
				],
				callee: {
					type: "MemberExpression",
					computed: false,
					object: {
						type: "Identifier",
						name: "a"
					},
					property: {
						type: "Identifier",
						name: "find"
					}
				}
			}, assert);
		});

		test('should parse nested arrow function correctly', (assert) => {
			testParser('x => y => a + b', {
				type: 'ArrowFunctionExpression',
				params: [
					{
						type: 'Identifier',
						name: 'x'
					}
				],
				body: {
					type: 'ArrowFunctionExpression',
					params: [
						{
							type: 'Identifier',
							name: 'y'
						}
					],
					body: {
						type: 'BinaryExpression',
						operator: '+',
						left: {
							type: 'Identifier',
							name: 'a'
						},
						right: {
							type: 'Identifier',
							name: 'b'
						}
					}
				}
			}, assert);
		});

		[
			'(["a", "b"].find(v => v === "b").length > 1 || 2) === true',
			'a.find(val => key === "abc")',
			'a.find(() => []).length > 2',
			'(a || b).find(v => v(1))',
			'a.find((  ) => 1)',
		].forEach(expr => {
			test(`should parse expr "${expr}" without error`, (assert) => {
				testParser(expr, {}, assert);
			});
		});

		[
			'() =>',
			'a.find((  ) => )',
			'a.find((   ',
		].forEach(expr => {
			QUnit.test(`should throw on invalid expr "${expr}"`, (assert) => {
				assert.throws(() => jsep(expr));
			});
		});
	});
}());
