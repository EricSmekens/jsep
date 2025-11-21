//     JavaScript Expression Parser (JSEP) <%= version %>
//     JSEP may be freely distributed under the MIT License
//     https://ericsmekens.github.io/jsep/
import Hooks from './hooks.js';
import Plugins from './plugins.js';

/** @typedef {Jsep & ((val: string) => Expression | never)} JsepInstance */
export class Jsep {
	/**
	 * @returns {JsepInstance}
	 */
	static instance() {
		const instance = new Jsep();

		// return a function (to parse), but rather than assigning all JSEP
		// API properties and methods to that function, use a Proxy:
		const jsep = new Proxy(instance.parse.bind(instance), {
			get: (t, k) => instance[k],
			set: (t, k, v) => {
				instance[k] = v;
				return true;
			},
		});
		jsep.Jsep = jsep; // allows for const { Jsep } = require('jsep'); --> no longer a class though

		return jsep;
	}

	/**
	 * @returns {string}
	 */
	toString() {
		return 'JavaScript Expression Parser (JSEP) v' + this.version;
	}

	constructor() {
		// NOTE: defining these constants on the instance for backward compatibility
		Object.assign(this, {
			version: '<%= version %>', // To be filled in by the builder

			// Node Types
			// ----------
			// This is the full set of types that any JSEP node can be.
			// Store them here to save space when minified
			COMPOUND:     'Compound',
			SEQUENCE_EXP: 'SequenceExpression',
			IDENTIFIER:   'Identifier',
			MEMBER_EXP:   'MemberExpression',
			LITERAL:      'Literal',
			THIS_EXP:     'ThisExpression',
			CALL_EXP:     'CallExpression',
			UNARY_EXP:    'UnaryExpression',
			BINARY_EXP:   'BinaryExpression',
			ARRAY_EXP:    'ArrayExpression',

			TAB_CODE:    9,
			LF_CODE:     10,
			CR_CODE:     13,
			SPACE_CODE:  32,
			PERIOD_CODE: 46, // '.'
			COMMA_CODE:  44, // ','
			SQUOTE_CODE: 39, // single quote
			DQUOTE_CODE: 34, // double quotes
			OPAREN_CODE: 40, // (
			CPAREN_CODE: 41, // )
			OBRACK_CODE: 91, // [
			CBRACK_CODE: 93, // ]
			QUMARK_CODE: 63, // ?
			SEMCOL_CODE: 59, // ;
			COLON_CODE:  58, // :
		});

		this.expr = '';
		this.index = 0;
		this.clearConfig();
	}

	/**
	 * @returns {JsepInstance}
	 */
	instance() {
		return Jsep.instance();
	}

	// ==================== CONFIG ================================
	/**
	 * set ternary to static property so it can be used by defaultConfig() method
	 * @param {IPlugin} ternary
	 */
	registerTernary(ternary) {
		Jsep.ternary = ternary;
		this.plugins.register(ternary);
	}

	/**
	 * sets config to default JSEP config
	 * @returns {this}
	 */
	defaultConfig() {
		this.unary_ops = {
			'-': 1,
			'!': 1,
			'~': 1,
			'+': 1
		};
		this.max_unop_len = this.getMaxKeyLen(this.unary_ops);

		// Also use a map for the binary operations but set their values to their
		// binary precedence for quick reference (higher number = higher precedence)
		// see [Order of operations](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)
		this.binary_ops = {
			'||': 1, '??': 1,
			'&&': 2, '|': 3, '^': 4, '&': 5,
			'==': 6, '!=': 6, '===': 6, '!==': 6,
			'<': 7, '>': 7, '<=': 7, '>=': 7,
			'<<': 8, '>>': 8, '>>>': 8,
			'+': 9, '-': 9,
			'*': 10, '/': 10, '%': 10,
			'**': 11,
		};
		this.max_binop_len = this.getMaxKeyLen(this.binary_ops);

		// sets specific binary_ops as right-associative
		this.right_associative = new Set(['**']);

		// Additional valid identifier chars, apart from a-z, A-Z and 0-9 (except on the starting char)
		this.additional_identifier_chars = new Set(['$', '_']);

		// Literals
		// ----------
		// Store the values to return for the various literals we may encounter
		this.literals = {
			'true': true,
			'false': false,
			'null': null
		};

		// Except for `this`, which is special. This could be changed to something like `'self'` as well
		this.this_str = 'this';

		this.hooks = new Hooks();
		this.plugins = new Plugins(this);
		if (Jsep.ternary) {
			this.plugins.register(Jsep.ternary);
		}
		return this;
	}

	/**
	 * clears JSEP config
	 * @returns {this}
	 */
	clearConfig() {
		this.removeAllUnaryOps();
		this.removeAllBinaryOps();
		this.removeAllIdentifierChars();
		this.removeAllLiterals();
		this.this_str = 'this';
		this.hooks = new Hooks();
		this.plugins = new Plugins(this);
		return this;
	}

	/**
	 * @param {string} op_name The name of the unary op to add
	 * @returns {this}
	 */
	addUnaryOp(op_name) {
		this.max_unop_len = Math.max(op_name.length, this.max_unop_len);
		this.unary_ops[op_name] = 1;
		return this;
	}

	/**
	 * @param {string} op_name The name of the binary op to add
	 * @param {number} precedence The precedence of the binary op (can be a float). Higher number = higher precedence
	 * @param {boolean} [isRightAssociative=false] whether operator is right-associative
	 * @returns {this}
	 */
	addBinaryOp(op_name, precedence, isRightAssociative) {
		this.max_binop_len = Math.max(op_name.length, this.max_binop_len);
		this.binary_ops[op_name] = precedence;
		if (isRightAssociative) {
			this.right_associative.add(op_name);
		}
		else {
			this.right_associative.delete(op_name);
		}
		return this;
	}

	/**
	 * @param {string} char The additional character to treat as a valid part of an identifier
	 * return {this}
	 */
	addIdentifierChar(char) {
		this.additional_identifier_chars.add(char);
		return this;
	}

	/**
	 * @param {string} literal_name The name of the literal to add
	 * @param {*} literal_value The value of the literal
	 * @returns {this}
	 */
	addLiteral(literal_name, literal_value) {
		this.literals[literal_name] = literal_value;
		return this;
	}

	/**
	 * @param {string} op_name The name of the unary op to remove
	 * return {this}
	 */
	removeUnaryOp(op_name) {
		delete this.unary_ops[op_name];
		if (op_name.length === this.max_unop_len) {
			this.max_unop_len = this.getMaxKeyLen(this.unary_ops);
		}
		return this;
	}

	/**
	 * return {this}
	 */
	removeAllUnaryOps() {
		this.unary_ops = {};
		this.max_unop_len = 0;

		return this;
	}

	/**
	 * @param {string} char The additional character to stop treating as a valid part of an identifier
	 * return {this}
	 */
	removeIdentifierChar(char) {
		this.additional_identifier_chars.delete(char);
		return this;
	}

	/**
	 * @param {string} char The additional character to stop treating as a valid part of an identifier
	 * return {this}
	 */
	removeAllIdentifierChars() {
		this.additional_identifier_chars = new Set();
		return this;
	}

	/**
	 * @param {string} op_name The name of the binary op to remove
	 * return {this}
	 */
	removeBinaryOp(op_name) {
		delete this.binary_ops[op_name];

		if (op_name.length === this.max_binop_len) {
			this.max_binop_len = this.getMaxKeyLen(this.binary_ops);
		}
		this.right_associative.delete(op_name);

		return this;
	}

	/**
	 * return {this}
	 */
	removeAllBinaryOps() {
		this.binary_ops = {};
		this.max_binop_len = 0;
		this.right_associative = new Set();

		return this;
	}

	/**
	 * @param {string} literal_name The name of the literal to remove
	 * return {this}
	 */
	removeLiteral(literal_name) {
		delete this.literals[literal_name];
		return this;
	}

	/**
	 * return {this}
	 */
	removeAllLiterals() {
		this.literals = {};
		return this;
	}
	// ==================== END CONFIG ============================


	/**
	 * @returns {string}
	 */
	get char() {
		return this.expr.charAt(this.index);
	}

	/**
	 * @returns {number}
	 */
	get code() {
		return this.expr.charCodeAt(this.index);
	};


	/**
	 * Get the longest key length of any object
	 * @param {object} obj
	 * @returns {number}
	 */
	getMaxKeyLen(obj) {
		return Math.max(0, ...Object.keys(obj).map(k => k.length));
	}

	/**
	 * `ch` is a character code in the next three functions
	 * @param {number} ch
	 * @returns {boolean}
	 */
	isDecimalDigit(ch) {
		return (ch >= 48 && ch <= 57); // 0...9
	}

	/**
	 * Returns the precedence of a binary operator or `0` if it isn't a binary operator. Can be float.
	 * @param {string} op_val
	 * @returns {number}
	 */
	binaryPrecedence(op_val) {
		return this.binary_ops[op_val] || 0;
	}

	/**
	 * Looks for start of identifier
	 * @param {number} ch
	 * @returns {boolean}
	 */
	isIdentifierStart(ch) {
		return  (ch >= 65 && ch <= 90) || // A...Z
			(ch >= 97 && ch <= 122) || // a...z
			(ch >= 128 && !this.binary_ops[String.fromCharCode(ch)]) || // any non-ASCII that is not an operator
			(this.additional_identifier_chars.has(String.fromCharCode(ch))); // additional characters
	}

	/**
	 * @param {number} ch
	 * @returns {boolean}
	 */
	isIdentifierPart(ch) {
		return this.isIdentifierStart(ch) || this.isDecimalDigit(ch);
	}

	/**
	 * throw error at index of the expression
	 * @param {string} message
	 * @throws
	 */
	throwError(message) {
		const error = new Error(message + ' at character ' + this.index);
		error.index = this.index;
		error.description = message;
		throw error;
	}

	/**
	 * Run a given hook
	 * @param {string} name
	 * @param {jsep.Expression|false} [node]
	 * @returns {?jsep.Expression}
	 */
	runHook(name, node) {
		if (this.hooks[name]) {
			const env = { context: this, node };
			this.hooks.run(name, env);
			return env.node;
		}
		return node;
	}

	/**
	 * Runs a given hook until one returns a node
	 * @param {string} name
	 * @returns {?jsep.Expression}
	 */
	searchHook(name) {
		if (this.hooks[name]) {
			const env = { context: this };
			this.hooks[name].find(function (callback) {
				callback.call(env.context, env);
				return env.node;
			});
			return env.node;
		}
	}

	/**
	 * Push `index` up to the next non-space character
	 */
	gobbleSpaces() {
		let ch = this.code;
		// Whitespace
		while (ch === this.SPACE_CODE
		|| ch === this.TAB_CODE
		|| ch === this.LF_CODE
		|| ch === this.CR_CODE) {
			ch = this.expr.charCodeAt(++this.index);
		}
		this.runHook('gobble-spaces');
	}

	/**
	 * Top-level method to parse all expressions and returns compound or single node
	 * @params {string} expr
	 * @returns {jsep.Expression}
	 */
	parse(expr) {
		this.expr = expr;
		this.index = 0;
		this.runHook('before-all');
		const nodes = this.gobbleExpressions();

		// If there's only one expression just try returning the expression
		const node = nodes.length === 1
		  ? nodes[0]
			: {
				type: this.COMPOUND,
				body: nodes
			};
		return this.runHook('after-all', node);
	}

	/**
	 * top-level parser (but can be reused within as well)
	 * @param {number} [untilICode]
	 * @returns {jsep.Expression[]}
	 */
	gobbleExpressions(untilICode) {
		let nodes = [], ch_i, node;

		while (this.index < this.expr.length) {
			ch_i = this.code;

			// Expressions can be separated by semicolons, commas, or just inferred without any
			// separators
			if (ch_i === this.SEMCOL_CODE || ch_i === this.COMMA_CODE) {
				this.index++; // ignore separators
			}
			else {
				// Try to gobble each expression individually
				if (node = this.gobbleExpression()) {
					nodes.push(node);
					// If we weren't able to find a binary expression and are out of room, then
					// the expression passed in probably has too much
				}
				else if (this.index < this.expr.length) {
					if (ch_i === untilICode) {
						break;
					}
					this.throwError('Unexpected "' + this.char + '"');
				}
			}
		}

		return nodes;
	}

	/**
	 * The main parsing function.
	 * @returns {?jsep.Expression}
	 */
	gobbleExpression() {
		const node = this.searchHook('gobble-expression') || this.gobbleBinaryExpression();
		this.gobbleSpaces();

		return this.runHook('after-expression', node);
	}

	/**
	 * Search for the operation portion of the string (e.g. `+`, `===`)
	 * Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
	 * and move down from 3 to 2 to 1 character until a matching binary operation is found
	 * then, return that binary operation
	 * @returns {string|boolean}
	 */
	gobbleBinaryOp() {
		this.gobbleSpaces();
		let to_check = this.expr.substr(this.index, this.max_binop_len);
		let tc_len = to_check.length;

		while (tc_len > 0) {
			// Don't accept a binary op when it is an identifier.
			// Binary ops that start with a identifier-valid character must be followed
			// by a non identifier-part valid character
			if (this.binary_ops.hasOwnProperty(to_check) && (
				!this.isIdentifierStart(this.code) ||
				(this.index + to_check.length < this.expr.length && !this.isIdentifierPart(this.expr.charCodeAt(this.index + to_check.length)))
			)) {
				this.index += tc_len;
				return to_check;
			}
			to_check = to_check.substr(0, --tc_len);
		}
		return false;
	}

	/**
	 * This function is responsible for gobbling an individual expression,
	 * e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
	 * @returns {?jsep.BinaryExpression}
	 */
	gobbleBinaryExpression() {
		let node, biop, prec, stack, biop_info, left, right, i, cur_biop;

		// First, try to get the leftmost thing
		// Then, check to see if there's a binary operator operating on that leftmost thing
		// Don't gobbleBinaryOp without a left-hand-side
		left = this.gobbleToken();
		if (!left) {
			return left;
		}
		biop = this.gobbleBinaryOp();

		// If there wasn't a binary operator, just return the leftmost node
		if (!biop) {
			return left;
		}

		// Otherwise, we need to start a stack to properly place the binary operations in their
		// precedence structure
		biop_info = { value: biop, prec: this.binaryPrecedence(biop), right_a: this.right_associative.has(biop) };

		right = this.gobbleToken();

		if (!right) {
			this.throwError("Expected expression after " + biop);
		}

		stack = [left, biop_info, right];

		// Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
		while ((biop = this.gobbleBinaryOp())) {
			prec = this.binaryPrecedence(biop);

			if (prec === 0) {
				this.index -= biop.length;
				break;
			}

			biop_info = { value: biop, prec, right_a: this.right_associative.has(biop) };

			cur_biop = biop;

			// Reduce: make a binary expression from the three topmost entries.
			const comparePrev = prev => biop_info.right_a && prev.right_a
				? prec > prev.prec
				: prec <= prev.prec;
			while ((stack.length > 2) && comparePrev(stack[stack.length - 2])) {
				right = stack.pop();
				biop = stack.pop().value;
				left = stack.pop();
				node = {
					type: this.BINARY_EXP,
					operator: biop,
					left,
					right
				};
				stack.push(node);
			}

			node = this.gobbleToken();

			if (!node) {
				this.throwError("Expected expression after " + cur_biop);
			}

			stack.push(biop_info, node);
		}

		i = stack.length - 1;
		node = stack[i];

		while (i > 1) {
			node = {
				type: this.BINARY_EXP,
				operator: stack[i - 1].value,
				left: stack[i - 2],
				right: node
			};
			i -= 2;
		}

		return node;
	}

	/**
	 * An individual part of a binary expression:
	 * e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
	 * @returns {boolean|jsep.Expression}
	 */
	gobbleToken() {
		let ch, to_check, tc_len, node;

		this.gobbleSpaces();
		node = this.searchHook('gobble-token');
		if (node) {
			return this.runHook('after-token', node);
		}

		ch = this.code;

		if (this.isDecimalDigit(ch) || ch === this.PERIOD_CODE) {
			// Char code 46 is a dot `.` which can start off a numeric literal
			return this.gobbleNumericLiteral();
		}

		if (ch === this.SQUOTE_CODE || ch === this.DQUOTE_CODE) {
			// Single or double quotes
			node = this.gobbleStringLiteral();
		}
		else if (ch === this.OBRACK_CODE) {
			node = this.gobbleArray();
		}
		else {
			to_check = this.expr.substr(this.index, this.max_unop_len);
			tc_len = to_check.length;

			while (tc_len > 0) {
				// Don't accept an unary op when it is an identifier.
				// Unary ops that start with a identifier-valid character must be followed
				// by a non identifier-part valid character
				if (this.unary_ops.hasOwnProperty(to_check) && (
					!this.isIdentifierStart(this.code) ||
					(this.index + to_check.length < this.expr.length && !this.isIdentifierPart(this.expr.charCodeAt(this.index + to_check.length)))
				)) {
					this.index += tc_len;
					const argument = this.gobbleToken();
					if (!argument) {
						this.throwError('missing unaryOp argument');
					}
					return this.runHook('after-token', {
						type: this.UNARY_EXP,
						operator: to_check,
						argument,
						prefix: true
					});
				}

				to_check = to_check.substr(0, --tc_len);
			}

			if (this.isIdentifierStart(ch)) {
				node = this.gobbleIdentifier();
				if (this.literals.hasOwnProperty(node.name)) {
					node = {
						type: this.LITERAL,
						value: this.literals[node.name],
						raw: node.name,
					};
				}
				else if (node.name === this.this_str) {
					node = { type: this.THIS_EXP };
				}
			}
			else if (ch === this.OPAREN_CODE) { // open parenthesis
				node = this.gobbleGroup();
			}
		}

		if (!node) {
			return this.runHook('after-token', false);
		}

		node = this.gobbleTokenProperty(node);
		return this.runHook('after-token', node);
	}

	/**
	 * Gobble properties of of identifiers/strings/arrays/groups.
	 * e.g. `foo`, `bar.baz`, `foo['bar'].baz`
	 * It also gobbles function calls:
	 * e.g. `Math.acos(obj.angle)`
	 * @param {jsep.Expression} node
	 * @returns {jsep.Expression}
	 */
	gobbleTokenProperty(node) {
		this.gobbleSpaces();

		let ch = this.code;
		while (ch === this.PERIOD_CODE || ch === this.OBRACK_CODE || ch === this.OPAREN_CODE || ch === this.QUMARK_CODE) {
			let optional;
			if (ch === this.QUMARK_CODE) {
				if (this.expr.charCodeAt(this.index + 1) !== this.PERIOD_CODE) {
					break;
				}
				optional = true;
				this.index += 2;
				this.gobbleSpaces();
				ch = this.code;
			}
			this.index++;

			if (ch === this.OBRACK_CODE) {
				node = {
					type: this.MEMBER_EXP,
					computed: true,
					object: node,
					property: this.gobbleExpression()
				};
				if (!node.property) {
					this.throwError('Unexpected "' + this.char + '"');
				}
				this.gobbleSpaces();
				ch = this.code;
				if (ch !== this.CBRACK_CODE) {
					this.throwError('Unclosed [');
				}
				this.index++;
			}
			else if (ch === this.OPAREN_CODE) {
				// A function call is being made; gobble all the arguments
				node = {
					type: this.CALL_EXP,
					'arguments': this.gobbleArguments(this.CPAREN_CODE),
					callee: node
				};
			}
			else if (ch === this.PERIOD_CODE || optional) {
				if (optional) {
					this.index--;
				}
				this.gobbleSpaces();
				node = {
					type: this.MEMBER_EXP,
					computed: false,
					object: node,
					property: this.gobbleIdentifier(),
				};
			}

			if (optional) {
				node.optional = true;
			} // else leave undefined for compatibility with esprima

			this.gobbleSpaces();
			ch = this.code;
		}

		return node;
	}

	/**
	 * Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
	 * keep track of everything in the numeric literal and then calling `parseFloat` on that string
	 * @returns {jsep.Literal}
	 */
	gobbleNumericLiteral() {
		let number = '', ch, chCode;

		while (this.isDecimalDigit(this.code)) {
			number += this.expr.charAt(this.index++);
		}

		if (this.code === this.PERIOD_CODE) { // can start with a decimal marker
			number += this.expr.charAt(this.index++);

			while (this.isDecimalDigit(this.code)) {
				number += this.expr.charAt(this.index++);
			}
		}

		ch = this.char;

		if (ch === 'e' || ch === 'E') { // exponent marker
			number += this.expr.charAt(this.index++);
			ch = this.char;

			if (ch === '+' || ch === '-') { // exponent sign
				number += this.expr.charAt(this.index++);
			}

			while (this.isDecimalDigit(this.code)) { // exponent itself
				number += this.expr.charAt(this.index++);
			}

			if (!this.isDecimalDigit(this.expr.charCodeAt(this.index - 1)) ) {
				this.throwError('Expected exponent (' + number + this.char + ')');
			}
		}

		chCode = this.code;

		// Check to make sure this isn't a variable name that start with a number (123abc)
		if (this.isIdentifierStart(chCode)) {
			this.throwError('Variable names cannot start with a number (' +
				number + this.char + ')');
		}
		else if (chCode === this.PERIOD_CODE || (number.length === 1 && number.charCodeAt(0) === this.PERIOD_CODE)) {
			this.throwError('Unexpected period');
		}

		return {
			type: this.LITERAL,
			value: parseFloat(number),
			raw: number
		};
	}

	/**
	 * Parses a string literal, staring with single or double quotes with basic support for escape codes
	 * e.g. `"hello world"`, `'this is\nJSEP'`
	 * @returns {jsep.Literal}
	 */
	gobbleStringLiteral() {
		let str = '';
		const startIndex = this.index;
		const quote = this.expr.charAt(this.index++);
		let closed = false;

		while (this.index < this.expr.length) {
			let ch = this.expr.charAt(this.index++);

			if (ch === quote) {
				closed = true;
				break;
			}
			else if (ch === '\\') {
				// Check for all of the common escape codes
				ch = this.expr.charAt(this.index++);

				switch (ch) {
					case 'n': str += '\n'; break;
					case 'r': str += '\r'; break;
					case 't': str += '\t'; break;
					case 'b': str += '\b'; break;
					case 'f': str += '\f'; break;
					case 'v': str += '\x0B'; break;
					default : str += ch;
				}
			}
			else {
				str += ch;
			}
		}

		if (!closed) {
			this.throwError('Unclosed quote after "' + str + '"');
		}

		return {
			type: this.LITERAL,
			value: str,
			raw: this.expr.substring(startIndex, this.index),
		};
	}

	/**
	 * Gobbles only identifiers
	 * e.g.: `foo`, `_value`, `$x1`
	 * Also, this function checks if that identifier is a literal:
	 * (e.g. `true`, `false`, `null`) or `this`
	 * @returns {jsep.Identifier}
	 */
	gobbleIdentifier() {
		let ch = this.code, start = this.index;

		if (this.isIdentifierStart(ch)) {
			this.index++;
		}
		else {
			this.throwError('Unexpected ' + this.char);
		}

		while (this.index < this.expr.length) {
			ch = this.code;

			if (this.isIdentifierPart(ch)) {
				this.index++;
			}
			else {
				break;
			}
		}
		return {
			type: this.IDENTIFIER,
			name: this.expr.slice(start, this.index),
		};
	}

	/**
	 * Gobbles a list of arguments within the context of a function call
	 * or array literal. This function also assumes that the opening character
	 * `(` or `[` has already been gobbled, and gobbles expressions and commas
	 * until the terminator character `)` or `]` is encountered.
	 * e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
	 * @param {number} termination
	 * @returns {jsep.Expression[]}
	 */
	gobbleArguments(termination) {
		const args = [];
		let closed = false;
		let separator_count = 0;

		while (this.index < this.expr.length) {
			this.gobbleSpaces();
			let ch_i = this.code;

			if (ch_i === termination) { // done parsing
				closed = true;
				this.index++;

				if (termination === this.CPAREN_CODE && separator_count && separator_count >= args.length){
					this.throwError('Unexpected token ' + String.fromCharCode(termination));
				}

				break;
			}
			else if (ch_i === this.COMMA_CODE) { // between expressions
				this.index++;
				separator_count++;

				if (separator_count !== args.length) { // missing argument
					if (termination === this.CPAREN_CODE) {
						this.throwError('Unexpected token ,');
					}
					else if (termination === this.CBRACK_CODE) {
						for (let arg = args.length; arg < separator_count; arg++) {
							args.push(null);
						}
					}
				}
			}
			else if (args.length !== separator_count && separator_count !== 0) {
				// NOTE: `&& separator_count !== 0` allows for either all commas, or all spaces as arguments
				this.throwError('Expected comma');
			}
			else {
				const node = this.gobbleExpression();

				if (!node || node.type === this.COMPOUND) {
					this.throwError('Expected comma');
				}

				args.push(node);
			}
		}

		if (!closed) {
			this.throwError('Expected ' + String.fromCharCode(termination));
		}

		return args;
	}

	/**
	 * Responsible for parsing a group of things within parentheses `()`
	 * that have no identifier in front (so not a function call)
	 * This function assumes that it needs to gobble the opening parenthesis
	 * and then tries to gobble everything within that parenthesis, assuming
	 * that the next thing it should see is the close parenthesis. If not,
	 * then the expression probably doesn't have a `)`
	 * @returns {boolean|jsep.Expression}
	 */
	gobbleGroup() {
		this.index++;
		let nodes = this.gobbleExpressions(this.CPAREN_CODE);
		if (this.code === this.CPAREN_CODE) {
			this.index++;
			if (nodes.length === 1) {
				return nodes[0];
			}
			else if (!nodes.length) {
				return false;
			}
			else {
				return {
					type: this.SEQUENCE_EXP,
					expressions: nodes,
				};
			}
		}
		else {
			this.throwError('Unclosed (');
		}
	}

	/**
	 * Responsible for parsing Array literals `[1, 2, 3]`
	 * This function assumes that it needs to gobble the opening bracket
	 * and then tries to gobble the expressions as arguments.
	 * @returns {jsep.ArrayExpression}
	 */
	gobbleArray() {
		this.index++;

		return {
			type: this.ARRAY_EXP,
			elements: this.gobbleArguments(this.CBRACK_CODE)
		};
	}
}

const jsep = Jsep.instance(); // empty config (see index.js)
jsep.defaultConfig();
export default jsep;
