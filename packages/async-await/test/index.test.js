import jsep from '../../../src/jsep.js';
import arrow from '../../arrow/src/index.js';
import asyncAwait from '../src/index.js';
import { testParser, resetJsepDefaults, findNode } from '../../../test/test_utils.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugin:AsyncAwait', (qunit) => {
		qunit.before(() => jsep.plugins.register(
			arrow,
			asyncAwait
		));
		qunit.after(resetJsepDefaults);

		test('should parse basic await expression', (assert) => {
			testParser('await a', {
				type: "AwaitExpression",
				argument: {
					type: "Identifier",
					name: "a"
				},
			}, assert);
		});

		test('should parse arrow async await (multi args)', (assert) => {
			testParser('await a.run(async () => await v1)', {
				type: 'AwaitExpression',
				argument: {
					type: 'CallExpression',
					arguments: [
						{
							type: 'ArrowFunctionExpression',
							params: null,
							body: {
								type: 'AwaitExpression',
								argument: {
									type: 'Identifier',
									name: 'v1',
								},
							},
							async: true,
						},
					],
					callee: {},
				},
			}, assert);
		});

		test('should parse arrow async await (no args)', (assert) => {
			testParser('await a.find(async (v1, v2) => await v1(v2))', {
				type: 'AwaitExpression',
				argument: {
					type: 'CallExpression',
					arguments: [
						{
							type: 'ArrowFunctionExpression',
							params: [
								{
									type: 'Identifier',
									name: 'v1',
								},
								{
									type: 'Identifier',
									name: 'v2',
								}
							],
							body: {
								type: 'AwaitExpression',
								argument: {
									type: 'CallExpression',
									arguments: [
										{
											type: 'Identifier',
											name: 'v2',
										},
									],
									callee: {
										type: 'Identifier',
										name: 'v1',
									},
								},
							},
							async: true,
						},
					],
					callee: {
						type: 'MemberExpression',
						computed: false,
						object: {
							type: 'Identifier',
							name: 'a',
						},
						property: {
							type: 'Identifier',
							name: 'find',
						},
					},
				},
			}, assert);
		});

		[
			'asyncing(123)',
			'awaiting(123)',
			'["async", "await"]',
		].forEach((expr) => {
			test(`should ignore async/await literal match in ${expr}`, (assert) => {
				const parsed = jsep(expr);
				assert.equal(findNode(parsed, n => n.type === 'await' || n.async));
			});
		});

		[
			'await a.find(async v => await v)',
			'a.find(async ([v]) => await v)',
			'a.find(async () => await x)',
		].forEach(expr => {
			test(`should parse expr "${expr}" without error`, (assert) => {
				testParser(expr, {}, assert);
			});
		});

		[
			'async 123',
			'async a + b',
			'a.find(async () + 2)',
		].forEach(expr => test(`should throw on invalid async expression, ${expr}`, (assert) => {
			assert.throws(() => jsep(expr));
		}));
	});
}());
