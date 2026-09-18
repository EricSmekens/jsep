import jsep from '../../../src/index.js';
import jsepNew from '../src/index.js';
import { testParser, resetJsepDefaults, esprimaComparisonTest } from '../../../test/test_utils.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugin:New', (qunit) => {
		qunit.before(() => jsep.plugins.register(jsepNew));
		qunit.after(resetJsepDefaults);

		test('should parse basic "new" expression', (assert) => {
			testParser('new Date(123)', {
				type: "NewExpression",
				arguments: [
					{
						type: "Literal",
						value: 123,
						raw: "123"
					}
				],
				callee: {
					type: "Identifier",
					name: "Date"
				}
			}, assert);
		});

		test('should parse new with member expression', (assert) => {
			testParser('new Date(1).month', {
				type: "MemberExpression",
				object: {
					type: 'NewExpression',
					arguments: [
						{
							type: 'Literal',
							value: 1,
						},
					],
					callee: {
						type: 'Identifier',
						name: 'Date',
					},
				},
				property: {
					type: 'Identifier',
					name: 'month',
				},
			}, assert);
		});

		test('should parse multiple nested new expressions', (assert) => {
			testParser('new Date(new Date().setDate(new Date().getDate() - 5))', {
				type: 'NewExpression',
				arguments: [
					{
						type: 'CallExpression',
						arguments: [
							{
								type: 'BinaryExpression',
								operator: '-',
								left: {
									type: 'CallExpression',
									arguments: [],
									callee: {
										type: 'MemberExpression',
										computed: false,
										object: {
											type: 'NewExpression',
											arguments: [],
											callee: {
												type: 'Identifier',
												name: 'Date'
											}
										},
										property: {
											type: 'Identifier',
											name: 'getDate'
										}
									}
								},
								right: {
									type: 'Literal',
									value: 5,
									raw: '5'
								}
							}
						],
						callee: {
							type: 'MemberExpression',
							computed: false,
							object: {
								type: 'NewExpression',
								arguments: [],
								callee: {
									type: 'Identifier',
									name: 'Date'
								}
							},
							property: {
								type: 'Identifier',
								name: 'setDate'
							}
						}
					}
				],
				callee: {
					type: 'Identifier',
					name: 'Date'
				}
			}, assert);
		});

		[
			'new window.Date()',
			'new FullCalendar.Calendar()',
			'new window.Date(123)',
			'new namespace.constructors.A(1, 2)',
			'new window["Date"](123)',
			'new constructors[key](value)',
			'new constructors[choose()]()',
			'new this.Constructor(1)',
			'new window.Date(1).month',
			'new window.Date(1).getTime()',
			'new window["Date"](1)["getTime"]()',
			'new namespace.A(1).b(2).c(3)',
			'new namespace.A(1).b[key]',
			'new namespace.A(new namespace.B(2)).method(new namespace.C(3))',
			'new (window.Date)(123)',
			'(new window.Date(123)).getTime()',
			'new Date(new Date().setDate(new Date().getDate() - 5))',
			'new A().b()',
			'new A().b.c(1)',
			'new A()[key](1)',
			'new (A)().b',
			'new (factory())(1)',
			'new (namespace.factory())(1)',
			'new (condition ? A : B)(1)',
			'window.Date(123)',
		].forEach(expr => test(`should match Esprima: ${expr}`, (assert) => {
			esprimaComparisonTest(expr, assert);
		}));

		[
			'new A().b',
			'new A()["b"].c + 2',
			'new A() + 2',
			'new A() != null',
			'new A(), new B()',
			'[new A(), new A()]',
			'new A("1")',
			'new A(1, 2)',
		].forEach(expr => test(`should not throw any errors for ${expr}`, (assert) => {
			testParser(expr, {}, assert);
		}));

		[
			['new A', 5],
			['new A,new B', 5],
			['fn(new A)', 8],
			['!new A', 6],
			['new 123', 7],
			['new (a > 2 ? A : B)', 19],
			['new (a > 1)', 11],
			['new A.b', 7],
			['new A["b"]', 10],
			['new (A.b)', 9],
		].forEach(([expr, index]) => test(`should give an error for invalid expression ${expr}`, (assert) => {
			assert.throws(() => jsep(expr), function (error) {
				return error.description === 'Expected new function()' && error.index === index;
			});
		}));
	});
}());
