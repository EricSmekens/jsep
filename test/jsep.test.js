import jsep from '../src/index.js';
import {testParser, testOpExpression, esprimaComparisonTest} from './test_utils.js';

(function () {
	QUnit.module('Expression Parser');

	QUnit.test('Constants', function (assert) {
		testParser('\'abc\'', { value: 'abc' }, assert);
		testParser('"abc"', { value: 'abc' }, assert);
		testParser('123', { value: 123 }, assert);
		testParser('12.3', { value: 12.3 }, assert);
	});

	QUnit.test('Variables', function (assert) {
		testParser('abc', { name: 'abc' }, assert);
		testParser('a.b[c[0]]', {
			property: {
				type: 'MemberExpression',
			},
		}, assert);
		testParser('Δέλτα', { name: 'Δέλτα' }, assert);
	});

	QUnit.test('Function Calls', function (assert) {
		// testParser("a(b, c(d,e), f)", {});
		testParser('a b + c', {}, assert);
		testParser('\'a\'.toString()', {}, assert);
		testParser('[1].length', {}, assert);
		testParser(';', {}, assert);
	});

	QUnit.test('Arrays', function (assert) {
		testParser('[]', { type: 'ArrayExpression', elements: [] }, assert);

		testParser('[a]', {
			type: 'ArrayExpression',
			elements: [{ type: 'Identifier', name: 'a' }],
		}, assert);
	});

	QUnit.test('Ops', function (assert) {
		testOpExpression('1', assert);
		testOpExpression('1+2', assert);
		testOpExpression('1*2', assert);
		testOpExpression('1*(2+3)', assert);
		testOpExpression('(1+2)*3', assert);
		testOpExpression('(1+2)*3+4-2-5+2/2*3', assert);
		testOpExpression('1 + 2-   3*	4 /8', assert);
		testOpExpression('\n1\r\n+\n2\n', assert);
	});

	QUnit.test('Custom operators', function (assert) {
		jsep.addBinaryOp('^', 10);
		testParser('a^b', {}, assert);

		jsep.addBinaryOp('×', 9);
		testParser('a×b', {
			type: 'BinaryExpression',
			left: { name: 'a' },
			right: { name: 'b' },
		}, assert);

		jsep.addBinaryOp('or', 1);
		testParser('oneWord ordering anotherWord', {
			type: 'Compound',
			body: [
				{
					type: 'Identifier',
					name: 'oneWord',
				},
				{
					type: 'Identifier',
					name: 'ordering',
				},
				{
					type: 'Identifier',
					name: 'anotherWord',
				},
			],
		}, assert);

		jsep.addUnaryOp('#');
		testParser('#a', {
			type: 'UnaryExpression',
			operator: '#',
			argument: { type: 'Identifier', name: 'a' },
		}, assert);

		jsep.addUnaryOp('not');
		testParser('not a', {
			type: 'UnaryExpression',
			operator: 'not',
			argument: { type: 'Identifier', name: 'a' },
		}, assert);

		jsep.addUnaryOp('notes');
		testParser('notes', {
			type: 'Identifier',
			name: 'notes',
		}, assert);
	});

	QUnit.test('Custom alphanumeric operators', function (assert) {
		jsep.addBinaryOp('and', 2);
		testParser('a and b', {
			type: 'BinaryExpression',
			operator: 'and',
			left: { type: 'Identifier', name: 'a' },
			right: { type: 'Identifier', name: 'b' },
		}, assert);
		testParser('bands', { type: 'Identifier', name: 'bands' }, assert);

		testParser('b ands', { type: 'Compound' }, assert);

		jsep.addUnaryOp('not');
		testParser('not a', {
			type: 'UnaryExpression',
			operator: 'not',
			argument: { type: 'Identifier', name: 'a' },
		}, assert);

		testParser('notes', { type: 'Identifier', name: 'notes' }, assert);
	});

	QUnit.test('Custom identifier characters', function (assert) {
		jsep.addIdentifierChar('@');
		testParser('@asd', {
			type: 'Identifier',
			name: '@asd',
		}, assert);
	});

	QUnit.test('Bad Numbers', function (assert) {
		testParser('1.', { type: 'Literal', value: 1, raw: '1.' }, assert);
		assert.throws(function () {
			jsep('1.2.3');
		});
	});

	QUnit.test('Missing arguments', function (assert) {
		assert.throws(function () {
			jsep('check(,)');
		}, 'detects missing argument (all)');
		assert.throws(function () {
			jsep('check(,1,2)');
		}, 'detects missing argument (head)');
		assert.throws(function () {
			jsep('check(1,,2)');
		}, 'detects missing argument (intervening)');
		assert.throws(function () {
			jsep('check(1,2,)');
		}, 'detects missing argument (tail)');
	});

	QUnit.test('Uncompleted expression-call/array', function (assert) {
		assert.throws(function () {
			jsep('myFunction(a,b');
		}, 'detects unfinished expression call');

		assert.throws(function () {
			jsep('[1,2');
		}, 'detects unfinished array');

		assert.throws(function () {
			jsep('-1+2-');
		}, /Expected expression after - at character 5/,
		'detects trailing operator');
	});

	QUnit.test('Esprima Comparison', function (assert) {
		([
			'[1,,3]',
			'[1,,]', // this is actually incorrect in esprima
			' true',
			'false ',
			' 1.2 ',
			' .2 ',
			'a',
			'a .b',
			'a.b. c',
			'a [b]',
			'a.b  [ c ] ',
			'$foo[ bar][ baz].other12 [\'lawl\'][12]',
			'$foo     [ 12	] [ baz[z]    ].other12*4 + 1 ',
			'$foo[ bar][ baz]    (a, bb ,   c  )   .other12 [\'lawl\'][12]',
			'(a(b(c[!d]).e).f+\'hi\'==2) === true',
			'(1,2)',
			'(a, a + b > 2)',
			'a((1 + 2), (e > 0 ? f : g))',
			'(((1)))',
			'(Object.variable.toLowerCase()).length == 3',
			'(Object.variable.toLowerCase())  .  length == 3',
			'[1] + [2]',
		]).forEach(function (test) {
			esprimaComparisonTest(test, assert);
		});
	});

	// Should support ternary by default (index.js):
	QUnit.test('Ternary', function (assert) {
		testParser('a ? b : c', { type: 'ConditionalExpression' }, assert);
		testParser('a||b ? c : d', { type: 'ConditionalExpression' }, assert);
	});

	const defaultHooks = Object.assign({}, jsep.hooks);
	QUnit.module('Hooks', (qunit) => {
		const resetHooks = () => {
			for (let key in jsep.hooks) {
				delete jsep.hooks[key];
			}
			Object.assign(jsep.hooks, defaultHooks);
		};

		qunit.beforeEach(resetHooks);
		qunit.afterEach(resetHooks);

		QUnit.module('gobble-spaces', () => {
			QUnit.test('should allow manipulating what is considered whitespace', (assert) => {
				const expr = 'a // skip all this';
				assert.throws(() => jsep(expr));

				jsep.hooksAdd('gobble-spaces', function () {
					if (this.char === '/' && this.expr.charAt(this.index + 1) === '/') {
						this.index += 2;
						while (!isNaN(this.code)) {
							this.index++;
						}
					}
				});
				testParser('a // skip all this', { type: 'Identifier' }, assert);
			});
		});

		QUnit.module('gobble-expression', () => {
			QUnit.test('should accept this.node set by hook', (assert) => {
				const expr = 'fn( 4 * 2';
				assert.throws(() => jsep(expr));

				jsep.hooksAdd('gobble-expression', function (env) {
					if (this.char === 'f') {
						this.index += 4;
						env.node = { type: 'custom' };
					}
				});
				testParser(expr, {}, assert);
			});
		});

		QUnit.module('after-expression', () => {
			QUnit.test('should allow altering an expression', (assert) => {
				jsep.hooksAdd('after-expression', function (env) {
					if (env.node) {
						env.node = { type: 'overruled' };
					}
				});
				testParser('1 + 2', { type: 'overruled' }, assert);
				jsep.hooks['after-expression'].pop();
			});
		});

		QUnit.module('gobble-token', () => {
			QUnit.test('should allow overriding gobbleToken', (assert) => {
				const expr = '...2';
				assert.throws(() => jsep(expr));
				jsep.hooksAdd('gobble-token', function (env) {
					if ([0, 1, 2].every(i => this.expr.charAt(i) === '.')) {
						this.index += 3;
						env.node = { type: 'spread' };
					}
				});
				testParser(expr, {}, assert);
			});

			QUnit.test('should allow manipulating found token', (assert) => {
				const after = [];
				jsep.hooksAdd('after-token', function (env) {
					if (env.node) {
						env.node.type += ':)';
					}
					after.push(env.node && env.node.type);
				});
				jsep('a + 1 * !c(3) || d.e');
				assert.equal(after.length, 4);
				assert.equal(after[0], 'Identifier:)');
				assert.equal(after[1], 'CallExpression:)');
				assert.equal(after[2], 'UnaryExpression:)');
				assert.equal(after[3], 'MemberExpression:)');
			});
		});
	});
}());
