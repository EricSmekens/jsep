//     JavaScript Expression Parser (JSEP) <%= version %>
//     JSEP may be freely distributed under the MIT License
//     https://ericsmekens.github.io/jsep/


// Node Types
// ----------

// This is the full set of types that any JSEP node can be.
// Store them here to save space when minified
const COMPOUND = 'Compound',
      SEQUENCE_EXP = 'SequenceExpression',
      IDENTIFIER = 'Identifier',
      MEMBER_EXP = 'MemberExpression',
      LITERAL = 'Literal',
      THIS_EXP = 'ThisExpression',
      CALL_EXP = 'CallExpression',
      UNARY_EXP = 'UnaryExpression',
      BINARY_EXP = 'BinaryExpression',
      CONDITIONAL_EXP = 'ConditionalExpression',
      ARRAY_EXP = 'ArrayExpression';

const TAB_CODE    = 9,
      LF_CODE     = 10,
      CR_CODE     = 13,
      SPACE_CODE  = 32,
      PERIOD_CODE = 46, // '.'
      COMMA_CODE  = 44, // ','
      SQUOTE_CODE = 39, // single quote
      DQUOTE_CODE = 34, // double quotes
      OPAREN_CODE = 40, // (
      CPAREN_CODE = 41, // )
      OBRACK_CODE = 91, // [
      CBRACK_CODE = 93, // ]
      QUMARK_CODE = 63, // ?
      SEMCOL_CODE = 59, // ;
      COLON_CODE  = 58; // :

let throwError = function(message, index) {
	let error = new Error(message + ' at character ' + index);
	error.index = index;
	error.description = message;
	throw error;
};

// Operations
// ----------

// Use a quickly-accessible map to store all of the unary operators
// Values are set to `1` (it really doesn't matter)
let unary_ops = {
	'-': 1,
	'!': 1,
	'~': 1,
	'+': 1
};

// Also use a map for the binary operations but set their values to their
// binary precedence for quick reference:
// see [Order of operations](http://en.wikipedia.org/wiki/Order_of_operations#Programming_language)
let binary_ops = {
	'||': 1, '&&': 2, '|': 3,  '^': 4,  '&': 5,
	'==': 6, '!=': 6, '===': 6, '!==': 6,
	'<': 7,  '>': 7,  '<=': 7,  '>=': 7,
	'<<':8,  '>>': 8, '>>>': 8,
	'+': 9, '-': 9,
	'*': 10, '/': 10, '%': 10
};

// Additional valid identifier chars, apart from a-z, A-Z and 0-9 (except on the starting char)
let additional_identifier_chars = new Set(['$', '_']);

// Get return the longest key length of any object
let getMaxKeyLen = function(obj) {
	return Math.max(0, ...Object.keys(obj).map(k => k.length));
};

let max_unop_len = getMaxKeyLen(unary_ops);
let max_binop_len = getMaxKeyLen(binary_ops);

// Literals
// ----------
// Store the values to return for the various literals we may encounter
let literals = {
	'true': true,
	'false': false,
	'null': null
};

// Except for `this`, which is special. This could be changed to something like `'self'` as well
let this_str = 'this';

// Returns the precedence of a binary operator or `0` if it isn't a binary operator
let binaryPrecedence = function(op_val) {
	return binary_ops[op_val] || 0;
};

// Utility function (gets called from multiple places)
let createBinaryExpression = function (operator, left, right) {
	return {
		type: BINARY_EXP,
		operator,
		left,
		right
	};
};

// `ch` is a character code in the next three functions
let isDecimalDigit = function(ch) {
	return (ch >= 48 && ch <= 57); // 0...9
};

let isIdentifierStart = function(ch) {
	return  (ch >= 65 && ch <= 90) || // A...Z
			(ch >= 97 && ch <= 122) || // a...z
			(ch >= 128 && !binary_ops[String.fromCharCode(ch)]) || // any non-ASCII that is not an operator
			(additional_identifier_chars.has(String.fromCharCode(ch))); // additional characters
};

let isIdentifierPart = function(ch) {
	return 	isIdentifierStart(ch) || isDecimalDigit(ch);
};

// Parsing
// -------
// `expr` is a string with the passed in expression
let jsep = function(expr) {
	// `index` stores the character number we are currently at while `length` is a constant
	// All of the gobbles below will modify `index` as we move along
	let index = 0;
	let charAtFunc = expr.charAt;
	let charCodeAtFunc = expr.charCodeAt;
	let exprI = function(i) {
		return charAtFunc.call(expr, i);
	};
	let exprICode = function(i) {
		return charCodeAtFunc.call(expr, i);
	};
	let length = expr.length;

	// Push `index` up to the next non-space character
	let gobbleSpaces = function() {
		let ch = exprICode(index);
		// Whitespace
		while (ch === SPACE_CODE || ch === TAB_CODE || ch === LF_CODE || ch === CR_CODE) {
			ch = exprICode(++index);
		}
	};

	// top-level parser (but can be reused within as well)
	let gobbleExpressions = function(untilICode) {
		let nodes = [], ch_i, node;

		while (index < length) {
			ch_i = exprICode(index);

			// Expressions can be separated by semicolons, commas, or just inferred without any
			// separators
			if (ch_i === SEMCOL_CODE || ch_i === COMMA_CODE) {
				index++; // ignore separators
			}
			else {
				// Try to gobble each expression individually
				if (node = gobbleExpression()) {
					nodes.push(node);
					// If we weren't able to find a binary expression and are out of room, then
					// the expression passed in probably has too much
				}
				else if (index < length) {
					if (untilICode && ch_i === untilICode) {
						break;
					}
					throwError('Unexpected "' + exprI(index) + '"', index);
				}
			}
		}

		return nodes;
	};

	// The main parsing function. Much of this code is dedicated to ternary expressions
	let gobbleExpression = function() {
		let test = gobbleBinaryExpression();
		let consequent, alternate;

		gobbleSpaces();

		if (exprICode(index) === QUMARK_CODE) {
			// Ternary expression: test ? consequent : alternate
			index++;
			consequent = gobbleExpression();

			if (!consequent) {
				throwError('Expected expression', index);
			}

			gobbleSpaces();

			if (exprICode(index) === COLON_CODE) {
				index++;
				alternate = gobbleExpression();

				if (!alternate) {
					throwError('Expected expression', index);
				}
				return {
					type: CONDITIONAL_EXP,
					test,
					consequent,
					alternate
				};
			}
			else {
				throwError('Expected :', index);
			}
		}
		else {
			return test;
		}
	};

	// Search for the operation portion of the string (e.g. `+`, `===`)
	// Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
	// and move down from 3 to 2 to 1 character until a matching binary operation is found
	// then, return that binary operation
	let gobbleBinaryOp = function() {
		gobbleSpaces();
		let biop, to_check = expr.substr(index, max_binop_len);
		let tc_len = to_check.length;

		while (tc_len > 0) {
			// Don't accept a binary op when it is an identifier.
			// Binary ops that start with a identifier-valid character must be followed
			// by a non identifier-part valid character
			if (binary_ops.hasOwnProperty(to_check) && (
				!isIdentifierStart(exprICode(index)) ||
				(index+to_check.length< expr.length && !isIdentifierPart(exprICode(index+to_check.length)))
			)) {
				index += tc_len;
				return to_check;
			}
			to_check = to_check.substr(0, --tc_len);
		}
		return false;
	};

	// This function is responsible for gobbling an individual expression,
	// e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
	let gobbleBinaryExpression = function() {
		let ch_i, node, biop, prec, stack, biop_info, left, right, i, cur_biop;

		// First, try to get the leftmost thing
		// Then, check to see if there's a binary operator operating on that leftmost thing
		left = gobbleToken();
		biop = gobbleBinaryOp();

		// If there wasn't a binary operator, just return the leftmost node
		if (!biop) {
			return left;
		}

		// Otherwise, we need to start a stack to properly place the binary operations in their
		// precedence structure
		biop_info = { value: biop, prec: binaryPrecedence(biop)};

		right = gobbleToken();

		if (!right) {
			throwError("Expected expression after " + biop, index);
		}

		stack = [left, biop_info, right];

		// Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
		while ((biop = gobbleBinaryOp())) {
			prec = binaryPrecedence(biop);

			if (prec === 0) {
				index -= biop.length;
				break;
			}

			biop_info = { value: biop, prec };

			cur_biop = biop;

			// Reduce: make a binary expression from the three topmost entries.
			while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
				right = stack.pop();
				biop = stack.pop().value;
				left = stack.pop();
				node = createBinaryExpression(biop, left, right);
				stack.push(node);
			}

			node = gobbleToken();

			if (!node) {
				throwError("Expected expression after " + cur_biop, index);
			}

			stack.push(biop_info, node);
		}

		i = stack.length - 1;
		node = stack[i];

		while (i > 1) {
			node = createBinaryExpression(stack[i - 1].value, stack[i - 2], node);
			i -= 2;
		}

		return node;
	};

	// An individual part of a binary expression:
	// e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
	let gobbleToken = function() {
		let ch, to_check, tc_len, node;

		gobbleSpaces();
		ch = exprICode(index);

		if (isDecimalDigit(ch) || ch === PERIOD_CODE) {
			// Char code 46 is a dot `.` which can start off a numeric literal
			return gobbleNumericLiteral();
		}

		if (ch === SQUOTE_CODE || ch === DQUOTE_CODE) {
			// Single or double quotes
			node = gobbleStringLiteral();
		}
		else if (ch === OBRACK_CODE) {
			node = gobbleArray();
		}
		else {
			to_check = expr.substr(index, max_unop_len);
			tc_len = to_check.length;

			while (tc_len > 0) {
			// Don't accept an unary op when it is an identifier.
			// Unary ops that start with a identifier-valid character must be followed
			// by a non identifier-part valid character
				if (unary_ops.hasOwnProperty(to_check) && (
					!isIdentifierStart(exprICode(index)) ||
					(index+to_check.length < expr.length && !isIdentifierPart(exprICode(index+to_check.length)))
				)) {
					index += tc_len;
					return {
						type: UNARY_EXP,
						operator: to_check,
						argument: gobbleToken(),
						prefix: true
					};
				}

				to_check = to_check.substr(0, --tc_len);
			}

			if (isIdentifierStart(ch)) {
				node = gobbleIdentifier();
			}
			else if (ch === OPAREN_CODE) { // open parenthesis
				node = gobbleGroup();
			}
		}

		if (!node) {
			return false;
		}

		gobbleSpaces();

		ch = exprICode(index);

		// Gobble properties of of identifiers/strings/arrays/groups.
		// e.g. `foo`, `bar.baz`, `foo['bar'].baz`
		// It also gobbles function calls:
		// e.g. `Math.acos(obj.angle)`

		while (ch === PERIOD_CODE || ch === OBRACK_CODE || ch === OPAREN_CODE) {
			index++;

			if (ch === PERIOD_CODE) {
				gobbleSpaces();
				node = {
					type: MEMBER_EXP,
					computed: false,
					object: node,
					property: gobbleIdentifier()
				};
			}
			else if (ch === OBRACK_CODE) {
				node = {
					type: MEMBER_EXP,
					computed: true,
					object: node,
					property: gobbleExpression()
				};
				gobbleSpaces();
				ch = exprICode(index);
				if (ch !== CBRACK_CODE) {
					throwError('Unclosed [', index);
				}
				index++;
			}
			else if (ch === OPAREN_CODE) {
				// A function call is being made; gobble all the arguments
				node = {
					type: CALL_EXP,
					'arguments': gobbleArguments(CPAREN_CODE),
					callee: node
				};
			}
			gobbleSpaces();
			ch = exprICode(index);
		}

		return node;
	};

	// Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
	// keep track of everything in the numeric literal and then calling `parseFloat` on that string
	let gobbleNumericLiteral = function() {
		let number = '', ch, chCode;

		while (isDecimalDigit(exprICode(index))) {
			number += exprI(index++);
		}

		if (exprICode(index) === PERIOD_CODE) { // can start with a decimal marker
			number += exprI(index++);

			while (isDecimalDigit(exprICode(index))) {
				number += exprI(index++);
			}
		}

		ch = exprI(index);

		if (ch === 'e' || ch === 'E') { // exponent marker
			number += exprI(index++);
			ch = exprI(index);

			if (ch === '+' || ch === '-') { // exponent sign
				number += exprI(index++);
			}

			while (isDecimalDigit(exprICode(index))) { // exponent itself
				number += exprI(index++);
			}

			if (!isDecimalDigit(exprICode(index-1)) ) {
				throwError('Expected exponent (' + number + exprI(index) + ')', index);
			}
		}

		chCode = exprICode(index);

		// Check to make sure this isn't a variable name that start with a number (123abc)
		if (isIdentifierStart(chCode)) {
			throwError('Variable names cannot start with a number (' +
						number + exprI(index) + ')', index);
		}
		else if (chCode === PERIOD_CODE) {
			throwError('Unexpected period', index);
		}

		return {
			type: LITERAL,
			value: parseFloat(number),
			raw: number
		};
	};

	// Parses a string literal, staring with single or double quotes with basic support for escape codes
	// e.g. `"hello world"`, `'this is\nJSEP'`
	let gobbleStringLiteral = function() {
		let str = '';
		let quote = exprI(index++);
		let closed = false;

		while (index < length) {
			let ch = exprI(index++);

			if (ch === quote) {
				closed = true;
				break;
			}
			else if (ch === '\\') {
				// Check for all of the common escape codes
				ch = exprI(index++);

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
			throwError('Unclosed quote after "'+str+'"', index);
		}

		return {
			type: LITERAL,
			value: str,
			raw: quote + str + quote
		};
	};

	// Gobbles only identifiers
	// e.g.: `foo`, `_value`, `$x1`
	// Also, this function checks if that identifier is a literal:
	// (e.g. `true`, `false`, `null`) or `this`
	let gobbleIdentifier = function() {
		let ch = exprICode(index), start = index, identifier;

		if (isIdentifierStart(ch)) {
			index++;
		}
		else {
			throwError('Unexpected ' + exprI(index), index);
		}

		while (index < length) {
			ch = exprICode(index);

			if (isIdentifierPart(ch)) {
				index++;
			}
			else {
				break;
			}
		}
		identifier = expr.slice(start, index);

		if (literals.hasOwnProperty(identifier)) {
			return {
				type: LITERAL,
				value: literals[identifier],
				raw: identifier
			};
		}
		else if (identifier === this_str) {
			return { type: THIS_EXP };
		}
		else {
			return {
				type: IDENTIFIER,
				name: identifier
			};
		}
	};

	// Gobbles a list of arguments within the context of a function call
	// or array literal. This function also assumes that the opening character
	// `(` or `[` has already been gobbled, and gobbles expressions and commas
	// until the terminator character `)` or `]` is encountered.
	// e.g. `foo(bar, baz)`, `my_func()`, or `[bar, baz]`
	let gobbleArguments = function(termination) {
		let args = [];
		let closed = false;
		let separator_count = 0;

		while (index < length) {
			gobbleSpaces();
			let ch_i = exprICode(index);

			if (ch_i === termination) { // done parsing
				closed = true;
				index++;

				if (termination === CPAREN_CODE && separator_count && separator_count >= args.length){
					throwError('Unexpected token ' + String.fromCharCode(termination), index);
				}

				break;
			}
			else if (ch_i === COMMA_CODE) { // between expressions
				index++;
				separator_count++;

				if (separator_count !== args.length) { // missing argument
					if (termination === CPAREN_CODE) {
						throwError('Unexpected token ,', index);
					}
					else if (termination === CBRACK_CODE) {
						for (let arg = args.length; arg < separator_count; arg++) {
							args.push(null);
						}
					}
				}
			}
			else {
				let node = gobbleExpression();

				if (!node || node.type === COMPOUND) {
					throwError('Expected comma', index);
				}

				args.push(node);
			}
		}

		if (!closed) {
			throwError('Expected ' + String.fromCharCode(termination), index);
		}

		return args;
	};

	// Responsible for parsing a group of things within parentheses `()`
	// that have no identifier in front (so not a function call)
	// This function assumes that it needs to gobble the opening parenthesis
	// and then tries to gobble everything within that parenthesis, assuming
	// that the next thing it should see is the close parenthesis. If not,
	// then the expression probably doesn't have a `)`
	let gobbleGroup = function() {
		index++;
		let nodes = gobbleExpressions(CPAREN_CODE);
		if (exprICode(index) === CPAREN_CODE) {
			index++;
			if (nodes.length === 1) {
				return nodes[0];
			}
			else {
				return {
					type: SEQUENCE_EXP,
					expressions: nodes,
				};
			}
		}
		else {
			throwError('Unclosed (', index);
		}
	};

	// Responsible for parsing Array literals `[1, 2, 3]`
	// This function assumes that it needs to gobble the opening bracket
	// and then tries to gobble the expressions as arguments.
	let gobbleArray = function() {
		index++;

		return {
			type: ARRAY_EXP,
			elements: gobbleArguments(CBRACK_CODE)
		};
	};

	let nodes = gobbleExpressions();

	// If there's only one expression just try returning the expression
	if (nodes.length === 1) {
		return nodes[0];
	}
	else {
		return {
			type: COMPOUND,
			body: nodes
		};
	}
};

// To be filled in by the template
jsep.version = '<%= version %>';
jsep.toString = function() {
	return 'JavaScript Expression Parser (JSEP) v' + jsep.version;
};

/**
 * @method jsep.addUnaryOp
 * @param {string} op_name The name of the unary op to add
 * @return jsep
 */
jsep.addUnaryOp = function(op_name) {
	max_unop_len = Math.max(op_name.length, max_unop_len);
	unary_ops[op_name] = 1;
	return this;
};

/**
 * @method jsep.addBinaryOp
 * @param {string} op_name The name of the binary op to add
 * @param {number} precedence The precedence of the binary op (can be a float)
 * @return jsep
 */
jsep.addBinaryOp = function(op_name, precedence) {
	max_binop_len = Math.max(op_name.length, max_binop_len);
	binary_ops[op_name] = precedence;
	return this;
};

/**
 * @method jsep.addIdentifierChar
 * @param {string} char The additional character to treat as a valid part of an identifier
 * @return jsep
 */
jsep.addIdentifierChar = function(char) {
	additional_identifier_chars.add(char);
	return this;
};

/**
 * @method jsep.addLiteral
 * @param {string} literal_name The name of the literal to add
 * @param {*} literal_value The value of the literal
 * @return jsep
 */
jsep.addLiteral = function(literal_name, literal_value) {
	literals[literal_name] = literal_value;
	return this;
};

/**
 * @method jsep.removeUnaryOp
 * @param {string} op_name The name of the unary op to remove
 * @return jsep
 */
jsep.removeUnaryOp = function(op_name) {
	delete unary_ops[op_name];
	if (op_name.length === max_unop_len) {
		max_unop_len = getMaxKeyLen(unary_ops);
	}
	return this;
};

/**
 * @method jsep.removeAllUnaryOps
 * @return jsep
 */
jsep.removeAllUnaryOps = function() {
	unary_ops = {};
	max_unop_len = 0;

	return this;
};

/**
 * @method jsep.removeIdentifierChar
 * @param {string} char The additional character to stop treating as a valid part of an identifier
 * @return jsep
 */
jsep.removeIdentifierChar = function(char) {
	additional_identifier_chars.delete(char);
	return this;
};


/**
 * @method jsep.removeBinaryOp
 * @param {string} op_name The name of the binary op to remove
 * @return jsep
 */
jsep.removeBinaryOp = function(op_name) {
	delete binary_ops[op_name];

	if (op_name.length === max_binop_len) {
		max_binop_len = getMaxKeyLen(binary_ops);
	}

	return this;
};

/**
 * @method jsep.removeAllBinaryOps
 * @return jsep
 */
jsep.removeAllBinaryOps = function() {
	binary_ops = {};
	max_binop_len = 0;

	return this;
};

/**
 * @method jsep.removeLiteral
 * @param {string} literal_name The name of the literal to remove
 * @return jsep
 */
jsep.removeLiteral = function(literal_name) {
	delete literals[literal_name];
	return this;
};

/**
 * @method jsep.removeAllLiterals
 * @return jsep
 */
jsep.removeAllLiterals = function() {
	literals = {};

	return this;
};

export default jsep;
