import jsep from '../../src/jsep.js';
import jsepArrow from '../../src/plugins/jsepArrow.js';
import jsepAssignment from '../../src/plugins/jsepAssignment.js';
import jsepComment from '../../src/plugins/jsepComment.js';
import jsepNew from '../../src/plugins/jsepNew.js';
import jsepObject from '../../src/plugins/jsepObject.js';
import jsepRegex from '../../src/plugins/jsepRegex.js';
import jsepSpread from '../../src/plugins/jsepSpread.js';
import jsepTemplateLiteral from '../../src/plugins/jsepTemplateLiteral.js';
import jsepTernary from '../../src/plugins/jsepTernary.js';
import {testParser, resetJsepDefaults, esprimaComparisonTest} from '../test_utils.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugin:Combined', (qunit) => {
		qunit.before(() => {
			jsep.plugins.register(
				jsepArrow,
				jsepAssignment,
				jsepComment,
				jsepNew,
				jsepObject,
				jsepRegex,
				jsepSpread,
				jsepTemplateLiteral,
				jsepTernary
			);
		});
		qunit.after(resetJsepDefaults);

		[
			'a.find(() => true)',
			'[1, 2].find(v => v === 2)',
			'a.find((val, key) => key === "abc")',
			'a = 2',
			'a = 2',
			'a *= 2',
			'a **= 2',
			'a /= 2',
			'a %= 2',
			'a += 2',
			'a -= 2',
			'a <<= 2',
			'a >>= 2',
			'a >>>= 2',
			'a &= 2',
			'a ^= 2',
			'a |= 2',
			'a++',
			'a--',
			'++a',
			'--a',
			'(["a", "b"].find(v => v === "b").length > 1 || 2) === true',
			'a.find(val => key === "abc")',
			'a.find(() => []).length > 2',
			'(a || b).find(v => v(1))',
			'a /* ignore this */ > 1 // ignore this too', // especially with regex plugin
			'a /* ignore *\r\n *this */ > 1 // ignore this too',
			'a // ignore this\r\n > 1',
			'a /** {param} \r\n */ > 1',
			'new Date(123)',
			'new A().b',
			'new A() != null',
			'new A(), new B()',
			'[new A(), new A()]',
			'new A("1")',
			'new A(1, 2)',
			'({ a: 1, b: 2 })',
			'{ [key || key2]: { a: 0 } }',
			'{ a: { b: { c: 1 } } }',
			'{ a: b ? 1 : 2, c }',
			'fn({ a: 1 })',
			'/abc/',
			'/abc/ig',
			'/\\d{3}/',
			'a && /[a-z]{3}/ig.test(b)',
			'/\d(?=px)/.test(a)',
			'a / /123/',
			'/123/ig["test"](b)',
			'/123/["test"](b)',
			'/\\p{Emoji_Presentation}/gu.test("ticket to 大阪 costs ¥2000 👌.")',
			'/abc/+/123/',
			'[...a]',
			'fn(1, ...b)',
			'fn(...123)',
			'fn(..."abc")',
			'[1, ...[2, 3]]',
			'[1, ...(a ? b : c)]',
			'`hi ${name}`',
			'abc`token ${`nested ${`deeply` + "str"} blah`}`',
			'`hi ${last}, ${first} ${middle}!`',
			'`hi\\n\t`',
			'`a\nbc${ b ? 1 : 2 }`',
			'a((1 + 2), (e > 0 ? f : g))',
			'a ? b : c',
			'a||b ? c : d',
		].forEach(expr => {
			test(`should parse expr "${expr}" without error`, (assert) => {
				testParser(expr, {}, assert);
			});
		});

		([
			'a((1 + 2), (e > 0 ? f : g))',
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

			// assignment
			'a = 2',
			'a *= 2',
			'a /= 2', // especially with regex plugin
			'a %= 2',
			'a += 2',
			'a -= 2',
			'a <<= 2',
			'a >>= 2',
			'a >>>= 2',
			'a &= 2',
			'a ^= 2',
			'a |= 2',

			// regex
			'/[a-z]{3}/ig.test(b)',
			'/\d(?=px)/',
		]).forEach(expr => {
			test(`should match Esprima: ${expr}`, function (assert) {
				esprimaComparisonTest(expr, assert);
			});
		});
	});
}());
