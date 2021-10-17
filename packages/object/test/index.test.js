import jsep from '../../../src/index.js';
import object from '../src/index.js';
import { testParser, resetJsepDefaults } from '../../../test/test_utils.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugin:Object', (qunit) => {
		qunit.before(() => jsep.plugins.register(object));
		qunit.after(resetJsepDefaults);

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

		test('should parse object with member expression', (assert) => {
			testParser('{a:1}[b]', {
				type: 'MemberExpression',
				computed: true,
				object: {
					type: 'ObjectExpression',
					properties: [
						{
							type: 'Property',
							computed: false,
							key: {
								type: 'Identifier',
								name: 'a'
							},
							value: {
								type: 'Literal',
								value: 1,
								raw: '1'
							},
							shorthand: false
						}
					]
				},
				property: {
					type: 'Identifier',
					name: 'b'
				}
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

		test('should parse nested complex ternary with object plugin', (assert) => {
			testParser('a ? b ? 1 : c ? d ? e ? 3 : 4 : 5 : 6 : 7', {
				type: 'ConditionalExpression',
				test: {
					type: 'Identifier',
					name: 'a'
				},
				consequent: {
					type: 'ConditionalExpression',
					test: {
						type: 'Identifier',
						name: 'b'
					},
					consequent: {
						type: 'Literal',
						value: 1,
						raw: '1'
					},
					alternate: {
						type: 'ConditionalExpression',
						test: {
							type: 'Identifier',
							name: 'c'
						},
						consequent: {
							type: 'ConditionalExpression',
							test: {
								type: 'Identifier',
								name: 'd'
							},
							consequent: {
								type: 'ConditionalExpression',
								test: {
									type: 'Identifier',
									name: 'e'
								},
								consequent: {
									type: 'Literal',
									value: 3,
									raw: '3'
								},
								alternate: {
									type: 'Literal',
									value: 4,
									raw: '4'
								}
							},
							alternate: {
								type: 'Literal',
								value: 5,
								raw: '5'
							}
						},
						alternate: {
							type: 'Literal',
							value: 6,
							raw: '6'
						}
					}
				},
				alternate: {
					type: 'Literal',
					value: 7,
					raw: '7'
				}
			}, assert);
		});

		test('should parse nested ternary consequent/alternates while object plugin loaded', (assert) => {
			testParser('a ? 0 : b ? 1 : 2', {
				type: 'ConditionalExpression',
				test: {
					type: 'Identifier',
					name: 'a'
				},
				consequent: {
					type: 'Literal',
					value: 0,
					raw: '0'
				},
				alternate: {
					type: 'ConditionalExpression',
					test: {
						type: 'Identifier',
						name: 'b'
					},
					consequent: {
						type: 'Literal',
						value: 1,
						raw: '1'
					},
					alternate: {
						type: 'Literal',
						value: 2,
						raw: '2'
					}
				}
			}, assert);
		});

		test('should parse nested ternary with object values', (assert) => {
			testParser('a ? { a: 1 } : b ? { b: 1 } : { c: 1 }[c] === 1 ? \'c\' : null', {
				type: 'ConditionalExpression',
				test: {
					type: 'Identifier',
					name: 'a'
				},
				consequent: {
					type: 'ObjectExpression',
					properties: [
						{
							type: 'Property',
							computed: false,
							key: {
								type: 'Identifier',
								name: 'a'
							},
							value: {
								type: 'Literal',
								value: 1,
								raw: '1'
							},
							shorthand: false
						}
					]
				},
				alternate: {
					type: 'ConditionalExpression',
					test: {
						type: 'Identifier',
						name: 'b'
					},
					consequent: {
						type: 'ObjectExpression',
						properties: [
							{
								type: 'Property',
								computed: false,
								key: {
									type: 'Identifier',
									name: 'b'
								},
								value: {
									type: 'Literal',
									value: 1,
									raw: '1'
								},
								shorthand: false
							}
						]
					},
					alternate: {
						type: 'ConditionalExpression',
						test: {
							type: 'BinaryExpression',
							operator: '===',
							left: {
								type: 'MemberExpression',
								computed: true,
								object: {
									type: 'ObjectExpression',
									properties: [
										{
											type: 'Property',
											computed: false,
											key: {
												type: 'Identifier',
												name: 'c'
											},
											value: {
												type: 'Literal',
												value: 1,
												raw: '1'
											},
											shorthand: false
										}
									]
								},
								property: {
									type: 'Identifier',
									name: 'c'
								}
							},
							right: {
								type: 'Literal',
								value: 1,
								raw: '1'
							}
						},
						consequent: {
							type: 'Literal',
							value: 'c',
							raw: '\'c\''
						},
						alternate: {
							type: 'Literal',
							value: null,
							raw: 'null'
						}
					}
				}
			}, assert);
		});

		test('should not throw any errors', (assert) => {
			[
				'{ a: b ? 1 : 2, c }', // mixed object/ternary
				'fn({ a: 1 })', // function argument
				'a ? 0 : b ? 1 : 2', // nested ternary with no ()
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
