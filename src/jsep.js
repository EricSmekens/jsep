/*global module: true, exports: true, console: true */

(function (root) {
	"use strict";
	var unary_ops = ['-', '!', '~', '+'],
		binary_ops = ['+', '-', '*', '/', '%', '&&', '||', '&', '|', '<<', '>>',
						'===', '==', '!==', '!=', '>=', '<=',  '<', '>'],
		binary_op_len = binary_ops.length,
		literals = {
			'true': true,
			'false': false,
			'null': null
		},
		this_str = 'this',
		extend = function(base_obj, extension_obj) {
			for (var prop in extension_obj) {
				if(extension_obj.hasOwnProperty(prop)) {
					base_obj[prop] = extension_obj[prop];
				}
			}
			return base_obj;
		},
		binaryPrecedence = function(op_val) {
			// Taken from the esprima parser's function
			switch (op_val) {
				case '||': return 1;
				case '&&': return 2;
				case '|': return 3;
				case '^': return 4;
				case '&': return 5;
				case '==': case '!=': case '===': case '!==': return 6;
				case '<': case '>': case '<=': case '>=': return 7;
				case '<<': case '>>': case '>>>': return 8;
				case '+': case '-': return 9;
				case '*': case '/': case '%': return 11;
			}
			return 0;
		},
		// ch is a character code
		isDecimalDigit = function(ch) {
			return (ch >= 48 && ch <= 57);   // 0..9
		},
		isIdentifierStart = function(ch) {
			return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
					(ch >= 65 && ch <= 90) ||     // A..Z
					(ch >= 97 && ch <= 122);      // a..z
		},
		isIdentifierPart = function(ch) {
			return (ch === 36) || (ch === 95) ||  // $ (dollar) and _ (underscore)
				(ch >= 65 && ch <= 90) ||         // A..Z
				(ch >= 97 && ch <= 122) ||        // a..z
				(ch >= 48 && ch <= 57);           // 0..9
		},
		DONE = {},

		COMPOUND = "Compound",
		IDENTIFIER = "Identifier",
		MEMBER_EXP = "MemberExpression",
		LITERAL = "Literal",
		THIS_EXP = "ThisExpression",
		CALL_EXP = "CallExpression",
		UNARY_EXP = "UnaryExpression",
		BINARY_EXP = "BinaryExpression",
		LOGICAL_EXP = "LogicalExpression",

		start_str_regex = new RegExp('^[\'"]'),
		number_regex = new RegExp('^(\\d+(\\.\\d+)?)'),

		do_parse = function(expr) {
			var stack = [],
				index = 0,
				length = expr.length,
				createBinaryExpression = function (operator, left, right) {
					var type = (operator === '||' || operator === '&&') ? LOGICAL_EXP : BINARY_EXP;
					return {
						type: type,
						operator: operator,
						left: left,
						right: right
					};
				},
				gobbleBinaryOp = function() {
					var biop, i, j, op_len;
					outer: for(i = 0; i<binary_op_len; i++) {
						biop = binary_ops[i];
						op_len = biop.length;
						for(j = 0; j<op_len; j++) {
							if(biop[j] !== expr[index + j]) {
								continue outer;
							}
						}
						index += op_len;
						return biop;
					}
					return false;
				},
				gobbleExpression = function() {
					var nodes = [], ch_i, node, biop, prec, stack, biop_info, left, right, i;
					while(index < length) {
						gobbleSpaces();
						ch_i = expr[index];
						if((biop = gobbleBinaryOp())) {
							if(node) {
								prec = binaryPrecedence(biop);
								biop_info = { value: biop, prec: prec };
								index++;

								if(prec === 0) {
									continue;
								}
								if(stack) {
									right = stack.pop();
									// Reduce: make a binary expression from the three topmost entries.
									while ((stack.length > 2) && (prec <= stack[stack.length - 2].prec)) {
										right = stack.pop();
										biop = stack.pop().value;
										left = stack.pop();
										node = createBinaryExpression(biop, left, right);
										stack.push(node);
									}
								} else {
									left = node;
									right = gobbleExpression();
									stack = [left, biop_info, right];
								}
							} else if(unary_ops.indexOf(ch_i) >= 0) {
								node = gobbleToken();
								nodes.push(node);
							} else {
								throw new Error("Unexpected " + ch_i + " at character" + index);
							}
						} else if(ch_i === ';' || ch_i ===',') {
							index++; // ignore seperators
						} else {
							if(node) {
								i = stack.length - 1;
								node = stack[i];
								while(i > 1) {
									node = createBinaryExpression(stack[i - 1].value, stack[i - 2], node); 
									i -= 2;
								}
							}

							node = gobbleToken();
							nodes.push(node);
						}
					}
					if(nodes.length === 1) {
						return node[0];
					} else {
						return {
							type: COMPOUND,
							body: nodes
						};
					}
				},
				gobbleToken = function() {
					var ch = expr.charCodeAt(index),
						curr_node, op_index;
					
					gobbleSpaces();
					if(isDecimalDigit(ch) || ch === 46) {
						// Char code 46 is a dot (.)
						return gobbleNumericLiteral();
					} else if(ch === 39 || ch === 34) {
						// Single or double quotes (' or ")
						return gobbleStringLiteral();
					} else if(isIdentifierPart(ch)) {
						return gobbleVariable();
					} else if((op_index = unary_ops.indexOf(ch)) >= 0) {
						index++;
						return {
							type: UNARY_EXP,
							operator: unary_ops[op_index],
							"argument": gobbleToken(),
							prefix: true
						};
					} else if(ch === 40) {
						// Open parentheses
						index++;
						return gobbleGroup();
					} else {
						return false;
					}
				},
				gobbleSpaces = function() {
					var ch = expr.charCodeAt(index);
					// space or tab
					while(ch === 32 || ch === 9) {
						ch = expr.charCodeAt(++index);
					}
				},
				gobbleNumericLiteral = function() {
					var number = '';
					while(isDecimalDigit(expr.charCodeAt(index))) {
						number += expr[index++];
					}

					if(expr[index] === '.') {
						number += expr[index++];

						while(isDecimalDigit(expr.charCodeAt(index))) {
							number += expr[index++];
						}
					}

					return {
						type: LITERAL,
						value: parseFloat(number),
						raw: number
					};
				},
				gobbleStringLiteral = function() {
					var str = '', quote = expr[index++], closed = false, ch;

					while(index < length) {
						ch = expr[index++];
						if(ch === quote) {
							closed = true;
							break;
						} else if(ch === '\\') {
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
				gobbleIdentifier = function() {
					var ch, start = index, identifier;
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
				gobbleArguments = function() {
					var ch_i, args = [], node;
					while(index < length) {
						gobbleSpaces();
						ch_i = expr[index];
						if(ch_i === ')') {
							index++;
							break;
						} else if (ch_i === ',') {
							index++;
						} else {
							node = gobbleExpression();
							args.push(node);
							//throw new Error("Expected comma at character " + index);
						}
					}
					return args;
				},
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
								throw new Error("Unclosed [ at character " + index);
							}
						} else if(ch_i === '(') {
							index++;
							node = {
								type: CALL_EXP,
								"arguments": gobbleArguments(),
								callee: node
							};
						}
						ch_i = expr[index];
					}
					return node;
				},
				gobbleGroup = function() {
					var node = gobbleExpression();
					gobbleSpaces();
					if(expr[index] === ')') {
						index++;
						return node;
					} else {
						throw new Error("Unclosed [ at character " + index);
					}
				};

			return gobbleExpression();
		};
	do_parse.version = '<%= version %>';

	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = do_parse;
		}
		exports.do_parse = do_parse;
	} else {
		var old_jsep = root.jsep;
		root.jsep = do_parse;
		do_parse.noConflict = function() {
			var jsep = root.jsep;
			root.jsep = old_jsep;
			return jsep;
		};
	}
}(this));
