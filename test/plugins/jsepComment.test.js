import jsep from '../../src/index.js';
import comment from '../../src/plugins/jsepComment.js';
import { testParser, resetJsepHooks } from '../test_utils.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugin:Comment', (qunit) => {
		qunit.before(() => jsep.plugins.register(comment));
		qunit.after(resetJsepHooks);

		[
			'a /* ignore this */ > 1 // ignore this too',
			'a /* ignore *\r\n *this */ > 1 // ignore this too',
			'a // ignore this\r\n > 1',
			'a /** {param} \r\n */ > 1',
		].forEach(expr => test(`should parse out comments from expression ${expr}`, (assert) => {
			testParser('a /* ignore this */ > 1 // ignore this too', {
				type: 'BinaryExpression',
				operator: '>',
				left: { name: 'a' },
				right: { value: 1 },
			}, assert);
		}));

		[
			'a /* no close comment',
		].forEach(expr => test(`should give an error for invalid comment expression ${expr}`, (assert) => {
			assert.throws(() => jsep(expr));
		}));
	});
}());
