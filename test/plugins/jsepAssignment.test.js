import jsep from '../../src/index.js';
import assignment from '../../src/plugins/jsepAssignment.js';
import { testParser, resetJsepHooks } from '../test_utils.js';

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
		qunit.after(() => {
			operators.forEach(op => jsep.removeBinaryOp(op));
			resetJsepHooks();
		});

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
	});
}());
