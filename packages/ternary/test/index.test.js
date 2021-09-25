import jsep from '../../../src/jsep.js';
import ternary from '../src/index.js';
import {testParser, esprimaComparisonTest} from '../../../test/test_utils.js';

jsep.plugins.register(ternary);
const { test } = QUnit;

(function () {
	QUnit.module('Ternary', () => {
		test('should match Esprima', function (assert) {
			([
				'a((1 + 2), (e > 0 ? f : g))',
			]).forEach(function (test) {
				esprimaComparisonTest(test, assert);
			});
		});

		test('should result in ConditionalExpression', function (assert) {
			testParser('a ? b : c', { type: 'ConditionalExpression' }, assert);
			testParser('a||b ? c : d', { type: 'ConditionalExpression' }, assert);
		});

		[
			'a ? b : ', // missing value
			'a ? b', // missing :
			'a : b ?', // backwards
		].forEach((expr) => {
			test(`should give an error for invalid expression ${expr}`, (assert) => {
				assert.throws(() => jsep(expr));
			});
		});
	});
}());
