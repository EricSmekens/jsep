import jsep from '../../../src/index.js';
import assignment from '../src/index.js';
import {testParser, resetJsepDefaults, esprimaComparisonTest} from '../../../test/test_utils.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugin:Assignment', (qunit) => {
		const operators = [
			'=',
			'*=',
			'**=',
			'/=',
			'%=',
			'+=',
			'-=',
			'<<=',
			'>>=',
			'>>>=',
			'&=',
			'^=',
			'|=',
		];

		qunit.before(() => jsep.plugins.register(assignment));
		qunit.after(resetJsepDefaults);

		operators.forEach(op => test(`should correctly parse assignment operator, ${op}`, (assert) => {
			testParser(`a ${op} 2`, {
				type: "AssignmentExpression",
				operator: op,
				left: {
					type: "Identifier",
					name: "a"
				},
				right: {
					type: "Literal",
					value: 2,
					raw: "2"
				}
			}, assert);
		}));

		[
			{ expr: 'a++', expect: { operator: '++', prefix: false } },
			{ expr: 'a--', expect: { operator: '--', prefix: false } },
			{ expr: '++a', expect: { operator: '++', prefix: true } },
			{ expr: '--a', expect: { operator: '--', prefix: true } },
		].forEach(testCase => test(`should handle basic update expression ${testCase.expr}`, (assert) => {
			testParser(testCase.expr, Object.assign({
				type: "UpdateExpression",
				argument: {
					type: "Identifier",
					name: "a",
				},
			}, testCase.expect), assert);
		}));

		[
			'fn()++',
			'1++',
			'++',
			'(a + b)++',
			'--fn()',
			'--1',
			'--',
			'--(a + b)',
		].forEach(expr => test(`should throw on invalid update expression, ${expr}`, (assert) => {
			assert.throws(() => jsep(expr));
		}));

		[
			...operators
				.filter(op => op !== '**=') // not supported by esprima
				.map(op => `a ${op} 2`),
			'a++',
			'++a',
			'a--',
			'--a',
			'++a == 2',
			'a++ == 2',
			'2 == ++a',
			'2 == a++',
			'a ? a[1]++ : --b',
		].forEach((expr) => {
			test(`should match Esprima: ${expr}`, function (assert) {
				esprimaComparisonTest(expr, assert);
			});
		});
	});
}());
