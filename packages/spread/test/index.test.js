import jsep from '../../../src/index.js';
import spread from '../src/index.js';
import {resetJsepDefaults, testParser} from '../../../test/test_utils.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugin:Spread', (qunit) => {
		qunit.before(() => jsep.plugins.register(spread));
		qunit.after(resetJsepDefaults);

		test('should parse array spread', (assert) => {
			testParser('[...a]', {
				type: 'ArrayExpression',
				elements: [
					{
						type: 'SpreadElement',
						argument: {
							type: 'Identifier',
							'name': 'a',
						},
					},
				]
			}, assert);
		});

		test('should parse function spread', (assert) => {
			testParser('fn(1, ...b)', {
				type: 'CallExpression',
				arguments: [
					{
						type: 'Literal',
						value: 1,
						raw: '1'
					},
					{
						type: 'SpreadElement',
						argument: {
							type: 'Identifier',
							name: 'b'
						}
					}
				],
				callee: {
					type: 'Identifier',
					name: 'fn'
				}
			}, assert);
		});

		test('should not throw any errors', (assert) => {
			[
				'fn(...123)', // NOTE: invalid iterator is not checked by jsep (same for [....4] = ... 0.4)
				'fn(..."abc")',
				'[1, ...[2, 3]]',
				'[1, ...(a ? b : c)]',
			].forEach(expr => testParser(expr, {}, assert));
		});

		test('should give an error for invalid expressions', (assert) => {
			[
				// '[a ? ...b : ...c]', // is invalid JS, should be `...(a ? b : c)`, but jsep doesn't error
				'[.....5]', // extra ..
				'[..2]', // missing .
				'[...3', // missing ]
			].forEach(expr => assert.throws(() => jsep(expr)));
		});
	});
}());
