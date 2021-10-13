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

		test('should parse binary op with ConditionalExpression', function (assert) {
			testParser('a||b ? c : d', { type: 'ConditionalExpression' }, assert);
		});

		test('should parse minimal ternary', (assert) => {
			testParser('a ? b : c', {
				type: 'ConditionalExpression',
				test: {
					type: 'Identifier',
					name: 'a'
				},
				consequent: {
					type: 'Identifier',
					name: 'b'
				},
				alternate: {
					type: 'Identifier',
					name: 'c'
				}
			}, assert);
		});

		test('should parse secondary ternary on consequent side', (assert) => {
			testParser('a ? b ? c : 1 : 2', {
				type: 'ConditionalExpression',
				test: {
					type: 'Identifier',
					name: 'a'
				},
				alternate: {
					type: 'Literal',
					value: 2,
					raw: '2'
				},
				consequent: {
					type: 'ConditionalExpression',
					test: {
						type: 'Identifier',
						name: 'b'
					},
					consequent: {
						type: 'Identifier',
						name: 'c'
					},
					alternate: {
						type: 'Literal',
						value: 1,
						raw: '1'
					}
				}
			}, assert);
		});

		test('should parse secondary ternary on alternate side', (assert) => {
			testParser('a ? b : c ? 1 : 2', {
				type: 'ConditionalExpression',
				test: {
					type: 'Identifier',
					name: 'a'
				},
				consequent: {
					type: 'Identifier',
					name: 'b'
				},
				alternate: {
					type: 'ConditionalExpression',
					test: {
						type: 'Identifier',
						name: 'c'
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

		test('should parse 3 level ternaries with mixed consequent/alternate', (assert) => {
			testParser('a ? b ? 1 : c ? 5 : 6 : 7', {
				type: 'ConditionalExpression',
				test: {
					type: 'Identifier',
					name: 'a'
				},
				alternate: {
					type: 'Literal',
					value: 7,
					raw: '7'
				},
				consequent: {
					test: {
						type: 'Identifier',
						name: 'b'
					},
					alternate: {
						type: 'ConditionalExpression',
						test: {
							type: 'Identifier',
							name: 'c'
						},
						consequent: {
							type: 'Literal',
							value: 5,
							raw: '5'
						},
						alternate: {
							type: 'Literal',
							value: 6,
							raw: '6'
						}
					},
					consequent: {
						type: 'Literal',
						value: 1,
						raw: '1'
					},
					type: 'ConditionalExpression'
				}
			}, assert);
		});

		test('should parse 5-level ternaries mixed consequent/alternate', function (assert) {
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
