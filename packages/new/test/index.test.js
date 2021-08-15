import jsep from '../../../src/index.js';
import jsepNew from '../src/index.js';
import { testParser, resetJsepDefaults } from '../../../test/test_utils.js';

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
			'new A',
			'new A,new B',
			'fn(new A)',
			'!new A',
			'new 123',
			'new (a > 2 ? A : B)',
			'new (a > 1)',
		].forEach(expr => test(`should give an error for invalid expression ${expr}`, (assert) => {
			assert.throws(() => jsep(expr));
		}));
	});
}());
