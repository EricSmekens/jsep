//     JavaScript Expression Parser (JSEP) <%= version %>
//     JSEP may be freely distributed under the MIT License
//     https://ericsmekens.github.io/jsep/

export class Constants {}

// Node Types
// ----------
// This is the full set of types that any JSEP node can be.
// Store them here to save space when minified
Constants.COMPOUND = 'Compound';
Constants.SEQUENCE_EXP = 'SequenceExpression';
Constants.IDENTIFIER = 'Identifier';
Constants.MEMBER_EXP = 'MemberExpression';
Constants.LITERAL = 'Literal';
Constants.THIS_EXP = 'ThisExpression';
Constants.CALL_EXP = 'CallExpression';
Constants.UNARY_EXP = 'UnaryExpression';
Constants.BINARY_EXP = 'BinaryExpression';
Constants.CONDITIONAL_EXP = 'ConditionalExpression';
Constants.ARRAY_EXP = 'ArrayExpression';

Constants.TAB_CODE    = 9;
Constants.LF_CODE     = 10;
Constants.CR_CODE     = 13;
Constants.SPACE_CODE  = 32;
Constants.PERIOD_CODE = 46; // '.'
Constants.COMMA_CODE  = 44; // ','
Constants.SQUOTE_CODE = 39; // single quote
Constants.DQUOTE_CODE = 34; // double quotes
Constants.OPAREN_CODE = 40; // (
Constants.CPAREN_CODE = 41; // )
Constants.OBRACK_CODE = 91; // [
Constants.CBRACK_CODE = 93; // ]
Constants.QUMARK_CODE = 63; // ?
Constants.SEMCOL_CODE = 59; // ;
Constants.COLON_CODE  = 58; // :


export class JsepConfig {
	static get instance() {
		return JsepConfig._instance || new JsepConfig();
	}

	get Constants() {
		return Constants;
	}


	constructor() {
		JsepConfig._instance = this;

		// Operations
		// ----------

		// Use a quickly-accessible map to store all of the unary operators
		// Values are set to `1` (it really doesn't matter)
		this.unary_ops = {
			'-': 1,
			'!': 1,
			'~': 1,
			'+': 1
		};
		this.max_unop_len = JsepConfig.getMaxKeyLen(this.unary_ops);

		// Also use a map for the binary operations but set their values to their
		// binary precedence for quick reference:
		// see [Order of operations](http://en.wikipedia.org/wiki/Order_of_operations#Programming_language)
		this.binary_ops = {
			'||': 1, '&&': 2, '|': 3, '^': 4, '&': 5,
			'==': 6, '!=': 6, '===': 6, '!==': 6,
			'<': 7, '>': 7, '<=': 7, '>=': 7,
			'<<': 8, '>>': 8, '>>>': 8,
			'+': 9, '-': 9,
			'*': 10, '/': 10, '%': 10
		};
		this.max_binop_len = JsepConfig.getMaxKeyLen(this.binary_ops);

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
	}


	/**
	 * Get the longest key length of any object
	 * @param {object} obj
	 * @returns {number}
	 */
	static getMaxKeyLen(obj) {
		return Math.max(0, ...Object.keys(obj).map(k => k.length));
	}


	/**
	 * @method addUnaryOp
	 * @param {string} op_name The name of the unary op to add
	 * @return this
	 */
	addUnaryOp(op_name) {
		this.max_unop_len = Math.max(op_name.length, this.max_unop_len);
		this.unary_ops[op_name] = 1;
		return this;
	}

	/**
	 * @method jsep.addBinaryOp
	 * @param {string} op_name The name of the binary op to add
	 * @param {number} precedence The precedence of the binary op (can be a float)
	 * @return this
	 */
	addBinaryOp(op_name, precedence) {
		this.max_binop_len = Math.max(op_name.length, this.max_binop_len);
		this.binary_ops[op_name] = precedence;
		return this;
	}

	/**
	 * @method addIdentifierChar
	 * @param {string} char The additional character to treat as a valid part of an identifier
	 * @return this
	 */
	addIdentifierChar(char) {
		this.additional_identifier_chars.add(char);
		return this;
	}

	/**
	 * @method addLiteral
	 * @param {string} literal_name The name of the literal to add
	 * @param {*} literal_value The value of the literal
	 * @return this
	 */
	addLiteral(literal_name, literal_value) {
		this.literals[literal_name] = literal_value;
		return this;
	}

	/**
	 * @method removeUnaryOp
	 * @param {string} op_name The name of the unary op to remove
	 * @return this
	 */
	removeUnaryOp(op_name) {
		delete this.unary_ops[op_name];
		if (op_name.length === this.max_unop_len) {
			this.max_unop_len = JsepConfig.getMaxKeyLen(this.unary_ops);
		}
		return this;
	}

	/**
	 * @method removeAllUnaryOps
	 * @return this
	 */
	removeAllUnaryOps() {
		this.unary_ops = {};
		this.max_unop_len = 0;

		return this;
	}

	/**
	 * @method removeIdentifierChar
	 * @param {string} char The additional character to stop treating as a valid part of an identifier
	 * @return this
	 */
	removeIdentifierChar(char) {
		this.additional_identifier_chars.delete(char);
		return this;
	}

	/**
	 * @method removeBinaryOp
	 * @param {string} op_name The name of the binary op to remove
	 * @return this
	 */
	removeBinaryOp(op_name) {
		delete this.binary_ops[op_name];

		if (op_name.length === this.max_binop_len) {
			this.max_binop_len = JsepConfig.getMaxKeyLen(this.binary_ops);
		}

		return this;
	}

	/**
	 * @method removeAllBinaryOps
	 * @return this
	 */
	removeAllBinaryOps() {
		this.binary_ops = {};
		this.max_binop_len = 0;

		return this;
	}

	/**
	 * @method removeLiteral
	 * @param {string} literal_name The name of the literal to remove
	 * @return this
	 */
	removeLiteral(literal_name) {
		delete this.literals[literal_name];
		return this;
	}

	/**
	 * @method removeAllLiterals
	 * @return this
	 */
	removeAllLiterals() {
		this.literals = {};

		return this;
	}
}


// JavaScript Expression Parser
export class Jsep {
	static get version() {
		// To be filled in by the template
		return '<%= version %>';
	}

	/**
	 * @returns {(pos: number) => string}
	 */
	get charAtFunc() {
		return this.expr.charAt;
	}

	/**
	 * @returns {(index: number) => number}
	 */
	get charCodeAtFunc() {
		return this.expr.charCodeAt;
	}

	get _exprI() {
		return this.exprI(this.index);
	}

	get _exprICode() {
		return this.exprICode(this.index);
	};


	/**
	 * @param {string} expr a string with the passed in express
	 * @param {JsepConfig} [config]
	 * @returns Jsep
	 */
	constructor(expr, config = JsepConfig.instance) {
		// `index` stores the character number we are currently at while `length` is a constant
		// All of the gobbles below will modify `index` as we move along
		this.expr = expr;
		this.config = config;
		this.index = 0;
		this.length = expr.length;
	}

	static toString() {
		return 'JavaScript Expression Parser (JSEP) v' + Jsep.version;
	};


	/**
	 * throw error at index of the expression
	 * @param {string} message
	 * @param {number} index
	 */
	static throwError(message, index) {
		const error = new Error(message + ' at character ' + index);
		error.index = index;
		error.description = message;
		throw error;
	}

	/**
	 * Utility function (gets called from multiple places)
	 * @param {string} operator
	 * @param {jsep.Expression} left
	 * @param {jsep.Expression} right
	 * @returns {jsep.BinaryExpression}
	 */
	static createBinaryExpression(operator, left, right) {
		return {
			type: Constants.BINARY_EXP,
			operator,
			left,
			right
		};
	}

	/**
	 * `ch` is a character code in the next three functions
	 * @param {number} ch
	 * @returns {boolean}
	 */
	static isDecimalDigit(ch) {
		return (ch >= 48 && ch <= 57); // 0...9
	}

	/**
	 * throw error at index of the expression
	 * @param {string} message
	 */
	throwError(message, index = this.index) {
		Jsep.throwError(message, index);
	}

	/**
	 * Returns the precedence of a binary operator or `0` if it isn't a binary operator. Can be float.
	 * @param {string} op_val
	 * @returns {number}
	 */
	binaryPrecedence(op_val) {
		return this.config.binary_ops[op_val] || 0;
	}

	/**
	 * Looks for start of identifier
	 * @param {number} ch
	 * @returns {boolean}
	 */
	isIdentifierStart(ch) {
		return  (ch >= 65 && ch <= 90) || // A...Z
			(ch >= 97 && ch <= 122) || // a...z
			(ch >= 128 && !this.config.binary_ops[String.fromCharCode(ch)]) || // any non-ASCII that is not an operator
			(this.config.additional_identifier_chars.has(String.fromCharCode(ch))); // additional characters
	}

	/**
	 * @param {number} ch
	 * @returns {boolean}
	 */
	isIdentifierPart(ch) {
		return this.isIdentifierStart(ch) || Jsep.isDecimalDigit(ch);
	}

	/**
	 * @param {number} i
	 * @returns {string}
	 */
	exprI(i) {
		return this.charAtFunc.call(this.expr, i);
	}

	/**
	 * @param {number} i
	 * @returns {number}
	 */
	exprICode(i) {
		return this.charCodeAtFunc.call(this.expr, i);
	}

	/**
	 * Push `index` up to the next non-space character
	 */
	gobbleSpaces() {
		let ch = this._exprICode;
		// Whitespace
		while (ch === Constants.SPACE_CODE
		|| ch === Constants.TAB_CODE
		|| ch === Constants.LF_CODE
		|| ch === Constants.CR_CODE) {
			ch = this.exprICode(++this.index);
		}
	}

	/**
	 * Top-level method to parse all expressions and returns compound or singl
	 * @returns {jsep.Expression}
	 */
	parse() {
		const nodes = this.gobbleExpressions();

		// If there's only one expression just try returning the expression
		if (nodes.length === 1) {
			return nodes[0];
		}
		else {
			return {
				type: Constants.COMPOUND,
				body: nodes
			};
		}
	}

	/**
	 * top-level parser (but can be reused within as well)
	 * @param {number} [untilICode]
	 * @returns {jsep.Expression[]}
	 */
	gobbleExpressions(untilICode) {
		let nodes = [], ch_i, node;

		while (this.index < this.length) {
			ch_i = this._exprICode;

			// Expressions can be separated by semicolons, commas, or just inferred without any
			// separators
			if (ch_i === Constants.SEMCOL_CODE || ch_i === Constants.COMMA_CODE) {
				this.index++; // ignore separators
			}
			else {
				// Try to gobble each expression individually
				if (node = this.gobbleExpression()) {
					nodes.push(node);
					// If we weren't able to find a binary expression and are out of room, then
					// the expression passed in probably has too much
				}
				else if (this.index < this.length) {
					if (ch_i === untilICode) {
						break;
					}
					this.throwError('Unexpected "' + this._exprI + '"');
				}
			}
		}

		return nodes;
	}

	//
	/**
	 * The main parsing function. Much of this code is dedicated to ternary expressions
	 * @returns {?jsep.Expression}
	 */
	gobbleExpression() {
		const test = this.gobbleBinaryExpression();

		this.gobbleSpaces();

		if (this._exprICode === Constants.QUMARK_CODE) {
			// Ternary expression: test ? consequent : alternate
			this.index++;
			const consequent = this.gobbleExpression();

			if (!consequent) {
				this.throwError('Expected expression');
			}

			this.gobbleSpaces();

			if (this._exprICode === Constants.COLON_CODE) {
				this.index++;
				const alternate = this.gobbleExpression();

				if (!alternate) {
					this.throwError('Expected expression');
				}
				return {
					type: Constants.CONDITIONAL_EXP,
					test,
					consequent,
					alternate
				};
			}
			else {
				this.throwError('Expected :');
			}
		}
		else {
			return test;
		}
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
		let to_check = this.expr.substr(this.index, this.config.max_binop_len);
		let tc_len = to_check.length;

		while (tc_len > 0) {
			// Don't accept a binary op when it is an identifier.
			// Binary ops that start with a identifier-valid character must be followed
			// by a non identifier-part valid character
			if (this.config.binary_ops.hasOwnProperty(to_check) && (
				!this.isIdentifierStart(this._exprICode) ||
				(this.index + to_check.length < this.length && !this.isIdentifierPart(this.exprICode(this.index + to_check.length)))
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
		left = this.gobbleToken();
		biop = this.gobbleBinaryOp();

		// If there wasn't a binary operator, just return the leftmost node
		if (!biop) {
			return left;
		}

		// Otherwise, we need to start a stack to properly place the binary operations in their
		// precedence structure
		biop_info = { value: biop, prec: this.binaryPrecedence(biop)};

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

			biop_info = { value: biop, prec };

			cur_biop = biop;

			// Reduce: make a binary expression from the three topmost entries.
			while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
				right = stack.pop();
				biop = stack.pop().value;
				left = stack.pop();
				node = Jsep.createBinaryExpression(biop, left, right);
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
			node = Jsep.createBinaryExpression(stack[i - 1].value, stack[i - 2], node);
			i -= 2;
		}

		return node;
	}

	/**
	 * An individual part of a binary expression:
	 * e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
	 * @returns {boolean|{jsep.Expression}}
	 */
	gobbleToken() {
		let ch, to_check, tc_len, node;

		this.gobbleSpaces();
		ch = this._exprICode;

		if (Jsep.isDecimalDigit(ch) || ch === Constants.PERIOD_CODE) {
			// Char code 46 is a dot `.` which can start off a numeric literal
			return this.gobbleNumericLiteral();
		}

		if (ch === Constants.SQUOTE_CODE || ch === Constants.DQUOTE_CODE) {
			// Single or double quotes
			node = this.gobbleStringLiteral();
		}
		else if (ch === Constants.OBRACK_CODE) {
			node = this.gobbleArray();
		}
		else {
			to_check = this.expr.substr(this.index, this.config.max_unop_len);
			tc_len = to_check.length;

			while (tc_len > 0) {
				// Don't accept an unary op when it is an identifier.
				// Unary ops that start with a identifier-valid character must be followed
				// by a non identifier-part valid character
				if (this.config.unary_ops.hasOwnProperty(to_check) && (
					!this.isIdentifierStart(this._exprICode) ||
					(this.index + to_check.length < this.length && !this.isIdentifierPart(this.exprICode(this.index + to_check.length)))
				)) {
					this.index += tc_len;
					return {
						type: Constants.UNARY_EXP,
						operator: to_check,
						argument: this.gobbleToken(),
						prefix: true
					};
				}

				to_check = to_check.substr(0, --tc_len);
			}

			if (this.isIdentifierStart(ch)) {
				node = this.gobbleIdentifier();
			}
			else if (ch === Constants.OPAREN_CODE) { // open parenthesis
				node = this.gobbleGroup();
			}
		}

		if (!node) {
			return false;
		}

		this.gobbleSpaces();

		ch = this._exprICode;

		// Gobble properties of of identifiers/strings/arrays/groups.
		// e.g. `foo`, `bar.baz`, `foo['bar'].baz`
		// It also gobbles function calls:
		// e.g. `Math.acos(obj.angle)`

		while (ch === Constants.PERIOD_CODE || ch === Constants.OBRACK_CODE || ch === Constants.OPAREN_CODE) {
			this.index++;

			if (ch === Constants.PERIOD_CODE) {
				this.gobbleSpaces();
				node = {
					type: Constants.MEMBER_EXP,
					computed: false,
					object: node,
					property: this.gobbleIdentifier()
				};
			}
			else if (ch === Constants.OBRACK_CODE) {
				node = {
					type: Constants.MEMBER_EXP,
					computed: true,
					object: node,
					property: this.gobbleExpression()
				};
				this.gobbleSpaces();
				ch = this._exprICode;
				if (ch !== Constants.CBRACK_CODE) {
					this.throwError('Unclosed [');
				}
				this.index++;
			}
			else if (ch === Constants.OPAREN_CODE) {
				// A function call is being made; gobble all the arguments
				node = {
					type: Constants.CALL_EXP,
					'arguments': this.gobbleArguments(Constants.CPAREN_CODE),
					callee: node
				};
			}
			this.gobbleSpaces();
			ch = this._exprICode;
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

		while (Jsep.isDecimalDigit(this._exprICode)) {
			number += this.exprI(this.index++);
		}

		if (this._exprICode === Constants.PERIOD_CODE) { // can start with a decimal marker
			number += this.exprI(this.index++);

			while (Jsep.isDecimalDigit(this._exprICode)) {
				number += this.exprI(this.index++);
			}
		}

		ch = this._exprI;

		if (ch === 'e' || ch === 'E') { // exponent marker
			number += this.exprI(this.index++);
			ch = this._exprI;

			if (ch === '+' || ch === '-') { // exponent sign
				number += this.exprI(this.index++);
			}

			while (Jsep.isDecimalDigit(this._exprICode)) { // exponent itself
				number += this.exprI(this.index++);
			}

			if (!Jsep.isDecimalDigit(this.exprICode(this.index - 1)) ) {
				this.throwError('Expected exponent (' + number + this._exprI + ')');
			}
		}

		chCode = this._exprICode;

		// Check to make sure this isn't a variable name that start with a number (123abc)
		if (this.isIdentifierStart(chCode)) {
			this.throwError('Variable names cannot start with a number (' +
				number + this._exprI + ')');
		}
		else if (chCode === Constants.PERIOD_CODE) {
			this.throwError('Unexpected period');
		}

		return {
			type: Constants.LITERAL,
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
		let quote = this.exprI(this.index++);
		let closed = false;

		while (this.index < this.length) {
			let ch = this.exprI(this.index++);

			if (ch === quote) {
				closed = true;
				break;
			}
			else if (ch === '\\') {
				// Check for all of the common escape codes
				ch = this.exprI(this.index++);

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
			type: Constants.LITERAL,
			value: str,
			raw: quote + str + quote
		};
	}

	/**
	 * Gobbles only identifiers
	 * e.g.: `foo`, `_value`, `$x1`
	 * Also, this function checks if that identifier is a literal:
	 * (e.g. `true`, `false`, `null`) or `this`
	 * @returns {jsep.Expression}
	 */
	gobbleIdentifier() {
		let ch = this._exprICode, start = this.index, identifier;

		if (this.isIdentifierStart(ch)) {
			this.index++;
		}
		else {
			this.throwError('Unexpected ' + this._exprI);
		}

		while (this.index < this.length) {
			ch = this._exprICode;

			if (this.isIdentifierPart(ch)) {
				this.index++;
			}
			else {
				break;
			}
		}
		identifier = this.expr.slice(start, this.index);

		if (this.config.literals.hasOwnProperty(identifier)) {
			return {
				type: Constants.LITERAL,
				value: this.config.literals[identifier],
				raw: identifier
			};
		}
		else if (identifier === this.config.this_str) {
			return { type: Constants.THIS_EXP };
		}
		else {
			return {
				type: Constants.IDENTIFIER,
				name: identifier
			};
		}
	}

	/**
	 * Gobbles a list of arguments within the context of a function call
	 * or array literal. This function also assumes that the opening character
	 * `(` or `[` has already been gobbled, and gobbles expressions and commas
	 * until the terminator character `)` or `]` is encountered.
	 * e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
	 * @param {string} termination
	 * @returns {jsep.Expression[]}
	 */
	gobbleArguments(termination) {
		const args = [];
		let closed = false;
		let separator_count = 0;

		while (this.index < this.length) {
			this.gobbleSpaces();
			let ch_i = this._exprICode;

			if (ch_i === termination) { // done parsing
				closed = true;
				this.index++;

				if (termination === Constants.CPAREN_CODE && separator_count && separator_count >= args.length){
					this.throwError('Unexpected token ' + String.fromCharCode(termination));
				}

				break;
			}
			else if (ch_i === Constants.COMMA_CODE) { // between expressions
				this.index++;
				separator_count++;

				if (separator_count !== args.length) { // missing argument
					if (termination === Constants.CPAREN_CODE) {
						this.throwError('Unexpected token ,');
					}
					else if (termination === Constants.CBRACK_CODE) {
						for (let arg = args.length; arg < separator_count; arg++) {
							args.push(null);
						}
					}
				}
			}
			else {
				const node = this.gobbleExpression();

				if (!node || node.type === Constants.COMPOUND) {
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
		let nodes = this.gobbleExpressions(Constants.CPAREN_CODE);
		if (this._exprICode === Constants.CPAREN_CODE) {
			this.index++;
			if (nodes.length === 1) {
				return nodes[0];
			}
			else if (!nodes.length) {
				return false;
			}
			else {
				return {
					type: Constants.SEQUENCE_EXP,
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
			type: Constants.ARRAY_EXP,
			elements: this.gobbleArguments(Constants.CBRACK_CODE)
		};
	}
}


// Backward Compatibility:
const jsep = expr => (new Jsep(expr)).parse();
jsep.version = Jsep.version;
jsep.toString = Jsep.toString;

const config = JsepConfig.instance;
const configMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(config));
configMethods.forEach((m) => {
	if (m !== 'constructor') {
		jsep[m] = config[m].bind(config);
	}
});

export default jsep;
