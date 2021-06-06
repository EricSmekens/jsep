import jsep from '../../src/index.js';
import '../../src/plugins/object.js';
import { testParser } from '../test_utils.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugin:Object', () => {
		test('should parse basic object expression', (assert) => {
			testParser('({ a: 1, b: 2 })', {
				type: "ObjectExpression",
				properties: [
					{
						type: "Property",
						computed: false,
						key: {
							type: "Identifier",
							name: "a"
						},
						value: {
							type: "Literal",
							value: 1,
							raw: "1"
						},
						shorthand: false
					},
					{
						type: "Property",
						computed: false,
						key: {
							type: "Identifier",
							name: "b"
						},
						value: {
							type: "Literal",
							value: 2,
							raw: "2"
						},
						shorthand: false
					}
				]
			}, assert);
		});

		test('should parse object with variable key', (assert) => {
			testParser('{ [key || key2]: { a: 0 } }', {
				type: "ObjectExpression",
				properties: [
					{
						type: "Property",
						computed: true,
						key: {
							type: "BinaryExpression",
							operator: "||",
							left: {
								type: "Identifier",
								name: "key"
							},
							right: {
								type: "Identifier",
								name: "key2"
							}
						},
						value: {
							type: "ObjectExpression",
							properties: [
								{
									type: "Property",
									computed: false,
									key: {
										type: "Identifier",
										name: "a"
									},
									value: {
										type: "Literal",
										value: 0,
										raw: "0"
									},
									shorthand: false
								}
							]
						},
						shorthand: false
					}
				]
			}, assert);
		});

		test('should parse nested objects', (assert) => {
			QUnit.dump.maxDepth = 10;
			testParser('{ a: { b: { c: 1 } } }', {
				type: 'ObjectExpression',
				properties: [
					{
						type: 'Property',
						computed: false,
						shorthand: false,
						key: {
							type: 'Identifier',
							name: 'a',
						},
						value: {
							type: 'ObjectExpression',
							properties: [
								{
									type: 'Property',
									computed: false,
									shorthand: false,
									key: {
										type: 'Identifier',
										name: 'b',
									},
									value: {
										type: 'ObjectExpression',
										properties: [
											{
												type: 'Property',
												computed: false,
												shorthand: false,
												key: {
													type: 'Identifier',
													name: 'c',
												},
												value: {
													type: 'Literal',
													value: 1,
													raw: '1',
												},
											},
										],
									},
								},
							],
						},
					},
				],
			}, assert);
		});

		test('should not throw any errors', (assert) => {
			[
				'{ a: b ? 1 : 2, c }', // mixed object/ternary
				'fn({ a: 1 })', // function argument
			].forEach(expr => testParser(expr, {}, assert));
		});

		test('should give an error for invalid expressions', (assert) => {
			[
				'{ a: }', // missing value
				'{ a: 1 ', // missing }
				'{ a: 2 ? 3, b }', // missing : in ternary
			].forEach(expr => assert.throws(() => jsep(expr)));
		});
	});
}());
