
//     JavaScript Expression Parser (JSEP) <%= version %>
//     JSEP may be freely distributed under the MIT License
// http://jsep.from.so/

/*global module: true, exports: true, console: true */
(function (root) {
	'use strict';
	// Node Types
	// ----------
	
	// This is the full set of types that any JSEP node can be.
	// Store them here to save space when minified
	var COMPOUND = 'Compound',
		IDENTIFIER = 'Identifier',
		MEMBER_EXP = 'MemberExpression',
		LITERAL = 'Literal',
		THIS_EXP = 'ThisExpression',
		CALL_EXP = 'CallExpression',
		UNARY_EXP = 'UnaryExpression',
		BINARY_EXP = 'BinaryExpression',
		LOGICAL_EXP = 'LogicalExpression',

	// Operations
	// ----------
	
	// Set `t` to `true` to save space (when minified, not gzipped)
		t = true,
	// Use a quickly-accessible map to store all of the unary operators
	// Values are set to `true` (it really doesn't matter)
		unary_ops = {'-': t, '!': t, '~': t, '+': t},
	// Also use a map for the binary operations but set their values to their
	// binary precedence for quick reference:
	// see [Order of operations](http://en.wikipedia.org/wiki/Order_of_operations#Programming_language)
		binary_ops = {
			'||': 1, '&&': 2, '|': 3,  '^': 4,  '&': 5,
			'==': 6, '!=': 6, '===': 6, '!==': 6,
			'<': 7,  '>': 7,  '<=': 7,  '>=': 7, 
			'<<':8,  '>>': 8, '>>>': 8,
			'+': 9, '-': 9,
			'*': 10, '/': 10, '%': 10
		},
	// Literals
	// ----------
	// Store the values to return for the various literals we may encounter
		literals = {
			'true': true,
			'false': false,
			'null': null
		},
	// Except for `this`, which is special. This could be changed to something like `'self'` as well
		this_str = 'this',
	// Returns the precedence of a binary operator or `0` if it isn't a binary operator
		binaryPrecedence = function(op_val) {
			return binary_ops[op_val] || 0;
		},
	// Utility function (gets called from multiple places)
	// Also note that `a && b` and `a || b` are *logical* expressions, not binary expressions
		createBinaryExpression = function (operator, left, right) {
			var type = (operator === '||' || operator === '&&') ? LOGICAL_EXP : BINARY_EXP;
			return {
				type: type,
				operator: operator,
				left: left,
				right: right
			};
		},
		// `ch` is a character code in the next three functions
		isDecimalDigit = function(ch) {
			return (ch >= 48 && ch <= 57); // 0...9
		},
		isIdentifierStart = function(ch) {
			return (ch === 36) || (ch === 95) || // `$` and `_`
					(ch >= 65 && ch <= 90) || // A...Z
					(ch >= 97 && ch <= 122); // a...z
		},
		isIdentifierPart = function(ch) {
			return (ch === 36) || (ch === 95) || // `$` and `_`
					(ch >= 65 && ch <= 90) || // A...Z
					(ch >= 97 && ch <= 122) || // a...z
					(ch >= 48 && ch <= 57); // 0...9
		},

		// Parsing
		// -------
		// `expr` is a string with the passed in expression
		do_parse = function(expr) {
			// `index` stores the character number we are currently at while `length` is a constant
			// All of the gobbles below will modify `index` as we move along
			var index = 0,
				length = expr.length,

				// Push `index` up to the next non-space character
				gobbleSpaces = function() {
					var ch = expr.charCodeAt(index);
					// space or tab
					while(ch === 32 || ch === 9) {
						ch = expr.charCodeAt(++index);
					}
				},

				// Search for the operation portion of the string (e.g. `+`, `===`)
				// Start by taking the longest possible binary operations (3 characters: `===`, `!==`, `>>>`)
				// and move down from 3 to 2 to 1 character until a matching binary operation is found
				// then, return that binary operation
				gobbleBinaryOp = function() {
					var biop, to_check = expr.substr(index, 3), tc_len = to_check.length;
					gobbleSpaces();
					while(tc_len > 0) {
						if(binary_ops.hasOwnProperty(to_check)) {
							index += tc_len;
							return to_check;
						}
						to_check = to_check.substr(0, --tc_len);
					}
					return false;
				},

				// This function is responsible for gobbling an individual expression,
				// e.g. `1`, `1+2`, `a+(b*2)-Math.sqrt(2)`
				gobbleExpression = function() {
					var ch_i, node, biop, prec, stack, biop_info, left, right, i;

					// First, try to get the leftmost thing
					// Then, check to see if there's a binary operator operating on that leftmost thing
					left = gobbleToken();
					biop = gobbleBinaryOp();

					// If there wasn't a binary operator, just return the leftmost node
					if(!biop) {
						return left;
					}

					// Otherwise, we need to start a stack to properly place the binary operations in their
					// precedence structure
					biop_info = { value: biop, prec: binaryPrecedence(biop)};

					right = gobbleToken();
					if(!right) {
						throw new Error("Expected expression after " + biop + " at character " + index);
					}
					stack = [left, biop_info, right];

					// Properly deal with precedence using [recursive descent](http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm)
					while((biop = gobbleBinaryOp())) {
						prec = binaryPrecedence(biop);

						if(prec === 0) {
							break;
						}
						biop_info = { value: biop, prec: prec };

						// Reduce: make a binary expression from the three topmost entries.
						while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
							right = stack.pop();
							biop = stack.pop().value;
							left = stack.pop();
							node = createBinaryExpression(biop, left, right);
							stack.push(node);
						}

						node = gobbleToken();
						if(!node) {
							throw new Error("Expected expression after " + biop + " at character " + index);
						}
						stack.push(biop_info);
						stack.push(node);
					}

					i = stack.length - 1;
					node = stack[i];
					while(i > 1) {
						node = createBinaryExpression(stack[i - 1].value, stack[i - 2], node); 
						i -= 2;
					}

					return node;
				},

				// An individual part of a binary expression:
				// e.g. `foo.bar(baz)`, `1`, `"abc"`, `(a % 2)` (because it's in parenthesis)
				gobbleToken = function() {
					var ch, curr_node, char;
					
					gobbleSpaces();
					char = expr[index];
					ch = expr.charCodeAt(index);

					if(isDecimalDigit(ch) || ch === 46) {
						// Char code 46 is a dot `.` which can start off a numeric literal
						return gobbleNumericLiteral();
					} else if(ch === 39 || ch === 34) {
						// Single or double quotes
						return gobbleStringLiteral();
					} else if(isIdentifierStart(ch)) {
						// `foo`, `bar.baz`
						return gobbleVariable();
					} else if(unary_ops.hasOwnProperty(char)) {
						// `-1`, `!false`
						// Just gobble the first character
						index++;
						return {
							type: UNARY_EXP,
							operator: char,
							argument: gobbleToken(),
							prefix: true
						};
					} else if(ch === 40) {
						// Open parentheses
						return gobbleGroup();
					} else {
						return false;
					}
				},
				// Parse simple numeric literals: `12`, `3.4`, `.5`. Do this by using a string to
				// keep track of everything in the numeric literal and then calling `parseFloat` on that string
				gobbleNumericLiteral = function() {
					var number = '';
					while(isDecimalDigit(expr.charCodeAt(index))) {
						number += expr[index++];
					}

					if(expr[index] === '.') { // can start with a decimal marker
						number += expr[index++];

						while(isDecimalDigit(expr.charCodeAt(index))) {
							number += expr[index++];
						}
					}

					// Check to make sure this isn't a varible name that start with a number (123abc)
					if(isIdentifierStart(expr.charCodeAt(index))) {
						throw new Error('Variable names cannot start with a number (' +
									number + expr[index] + ') at character ' + index);
					}

					return {
						type: LITERAL,
						value: parseFloat(number),
						raw: number
					};
				},

				// Parses a string literal, staring with single or double quotes with basic support for escape codes
				// e.g. `"hello world"`, `'this is\nJSEP'`
				gobbleStringLiteral = function() {
					var str = '', quote = expr[index++], closed = false, ch;

					while(index < length) {
						ch = expr[index++];
						if(ch === quote) {
							closed = true;
							break;
						} else if(ch === '\\') {
							// Check for all of the common escape codes
							ch = expr[index++];
							switch(ch) {
								case 'n': str += '\n'; break;
								case 'r': str += '\r'; break;
								case 't': str += '\t'; break;
								case 'b': str += '\b'; break;
								case 'f': str += '\f'; break;
								case 'v': str += '\x0B'; break;
							}
						} else {
							str += ch;
						}
					}

					if(!closed) {
						throw new Error('Unclosed quote after "'+str+'"');
					}

					return {
						type: LITERAL,
						value: str,
						raw: quote + str + quote
					};
				},
				
				// Gobbles only identifiers
				// e.g.: `foo`, `_value`, `$x1`
				// Also, this function checs if that identifier is a literal:
				// (e.g. `true`, `false`, `null`) or `this`
				gobbleIdentifier = function() {
					var ch = expr.charCodeAt(index), start = index, identifier;

					if(isIdentifierStart(ch)) {
						index++;
					}

					while(index < length) {
						ch = expr.charCodeAt(index);
						if(isIdentifierPart(ch)) {
							index++;
						} else {
							break;
						}
					}
					identifier = expr.slice(start, index);

					if(literals.hasOwnProperty(identifier)) {
						return {
							type: LITERAL,
							value: literals[identifier],
							raw: identifier
						};
					} else if(identifier === this_str) {
						return { type: THIS_EXP };
					} else {
						return {
							type: IDENTIFIER,
							name: identifier
						};
					}
				},

				// Gobbles a list of arguments within the context of a function call. This function
				// also assumes that the `(` has already been gobbled.
				// e.g. `foo(bar, baz)` or `my_func()`
				gobbleArguments = function() {
					var ch_i, args = [], node;
					while(index < length) {
						gobbleSpaces();
						ch_i = expr[index];
						if(ch_i === ')') { // done parsing
							index++;
							break;
						} else if (ch_i === ',') { // between expressions
							index++;
						} else {
							node = gobbleExpression();
							if(!node || node.type === COMPOUND) {
								throw new Error('Expected comma at character ' + index);
							}
							args.push(node);
						}
					}
					return args;
				},

				// Gobble a non-literal variable name. This variable name may include properties
				// e.g. `foo`, `bar.baz`, `foo['bar'].baz`
				// It also gobbles function calls:
				// e.g. `Math.acos(obj.angle)`
				gobbleVariable = function() {
					var ch_i, node, old_index;
					node = gobbleIdentifier();
					ch_i = expr[index];
					while(ch_i === '.' || ch_i === '[' || ch_i === '(') {
						if(ch_i === '.') {
							index++;
							node = {
								type: MEMBER_EXP,
								computed: false,
								object: node,
								property: gobbleIdentifier()
							};
						} else if(ch_i === '[') {
							old_index = index;
							index++;
							node = {
								type: MEMBER_EXP,
								computed: true,
								object: node,
								property: gobbleExpression()
							};
							gobbleSpaces();
							ch_i = expr[index];
							if(ch_i !== ']') {
								throw new Error('Unclosed [ at character ' + index);
							}
							index++;
						} else if(ch_i === '(') {
							// A function call is being made; gobble all the araguments
							index++;
							node = {
								type: CALL_EXP,
								'arguments': gobbleArguments(),
								callee: node
							};
						}
						ch_i = expr[index];
					}
					return node;
				},

				// Responsible for parsing a group of things within paraenteses `()`
				// This function assumes that it needs to gobble the opening parenthesis
				// and then tries to gobble everything within that parenthesis, asusming
				// that the next thing it should see is the close parenthesis. If not,
				// then the expression probably doesn't have a `)`
				gobbleGroup = function() {
					index++;
					var node = gobbleExpression();
					gobbleSpaces();
					if(expr[index] === ')') {
						index++;
						return node;
					} else {
						throw new Error('Unclosed ( at character ' + index);
					}
				},
				nodes = [], ch_i, node;
				
			while(index < length) {
				ch_i = expr[index];

				// Expressions can be separated by semicolons, commas, or just inferred without any
				// separators
				if(ch_i === ';' || ch_i ===',') {
					index++; // ignore separators
				} else {
					// Try to gobble each expression individually
					if((node = gobbleExpression())) {
						nodes.push(node);
					// If we weren't able to find a binary expression and are out of room, then
					// the expression passed in probably has too much
					} else if(index < length) {
						throw new Error("Unexpected '"+expr[index]+"' at character " + index);
					}
				}
			}

			// If there's only one expression just try returning the expression
			if(nodes.length === 1) {
				return nodes[0];
			} else {
				return {
					type: COMPOUND,
					body: nodes
				};
			}
		};

	// To be filled in by the template
	do_parse.version = '<%= version %>';
	do_parse.toString = function() { return 'JavaScript Expression Parser (JSEP) v' + do_parse.version; };

	// In desktop environments, have a way to restore the old value for `jsep`
	if (typeof root['export'] === 'undefined') {
		var old_jsep = root.jsep;
		// The star of the show! It's a function!
		root.jsep = do_parse;
		// And a curteous function willing to move out of the way for other similary-namaed objects!
		do_parse.noConflict = function() {
			var jsep = root.jsep;
			root.jsep = old_jsep;
			return jsep;
		};
	} else {
		// In Node.JS environments
		if (typeof root.module !== 'undefined' && module.exports) {
			exports = module.exports = do_parse;
		}
		exports.do_parse = do_parse;
	}
}(this));
