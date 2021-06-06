import '../../src/plugins/ternary.js';
import {testParser, esprimaComparisonTest} from '../test_utils.js';

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
	});
}());
