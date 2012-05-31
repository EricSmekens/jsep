(function (root) {
	"use strict";

	var unary_ops = ["-", "!"], // Permissible unary operations
		binary_ops = ["+", "-", "*", "/", "&&", "||", "&", "|", "<<", ">>", "===", "==", ">=", "<=",  "<", ">"]; //Permissible binary operations

	var ltrim_regex = /^\s+/,
		ltrim = function (str) {
			return str.replace(ltrim_regex, '');
		};

	var Parser = function (expr, options) {
		this.expr = expr;
		this.options = options;
		this.buffer = this.expr;
		this.curr_node = null;
	};

	(function (my) {
		var proto = my.prototype;
		proto.tokenize = function () {
			var rv = [];
			while (this.buffer) {
				this.gobble_expression();
				if (this.curr_node === false) {
					throw new Error("Unexpected " + this.buffer);
				}
				rv.push(this.curr_node);
			}
			if (rv.length === 1) {
				return rv[0];
			} else {
				return {
					type: "compound",
					statements: rv
				};
			}
		};

		proto.gobble_expression = function () {
			var node;
			this.curr_node = null;

			do {
				this.buffer = ltrim(this.buffer);
				node = false;
				if (node === false) {
					node = this.gobble_token();
				}
				if (node === false) {
					node = this.parse_fn_call();
				}
				if (node === false) {
					node = this.parse_parens();
				}
				if (node === false) {
					node = this.parse_binary_op();
				}
				if (node === false) {
					node = this.parse_unary_op();
				}

				if (node) {
					this.curr_node = node;
				}
			} while (node);


			return this.curr_node;
		};

		proto.gobble_token = function () {
			var node = false;
			if (node === false) {
				if (this.curr_node === null) {
					node = this.parse_variable();
				}
			}
			if (node === false) {
				node = this.parse_dot_property();
			}
			if (node === false) {
				node = this.parse_square_brackets_property();
			}
			if (node === false) {
				node = this.parse_constant();
			}
			return node;
		};

		var var_regex = new RegExp("^([A-Za-z_$][A-Za-z_$0-9]*)");
		proto.parse_variable = function () {
			var match = this.buffer.match(var_regex);
			if (match) { // We're dealing with a variable name
				var var_name = match[1];
				this.buffer = this.buffer.substr(match[0].length);
				return {
					type: "var",
					var_name: var_name,
					text: match[0]
				};
			}
			return false;
		};
		proto.parse_dot_property = function () {
			if (this.buffer[0] === ".") {
				if (this.curr_node === null) {
					throw new Error("Unexpected .");
				}

				this.buffer = this.buffer.substr(1);
				var prop_node = this.parse_variable();
				if (prop_node) {
					var node = {
						type: "prop",
						subtype: "dot",
						parent: this.curr_node,
						child: prop_node
					};
					return node;
				} else {
					throw new Error("Unexpected property '" + this.buffer[0] + "'");
				}
			}
			return false;
		};
		var square_brackets_regex = new RegExp("^\\[([^\\]]+)\\]");
		proto.parse_square_brackets_property = function () {
			var match = this.buffer.match(square_brackets_regex);
			if (match) {// We're dealing with square brackets
				var match_parser = new Parser(match[1]);
				var prop_node = match_parser.tokenize();

				this.buffer = this.buffer.substr(match[0].length);
				if (prop_node) {
					var node = {
						type: "prop",
						subtype: "square_brackets",
						parent: this.curr_node,
						child: prop_node,
						outer_text: match[0],
						inner_text: match[1]
					};
					return node;
				} else {
					throw new Error("Unexpected property '" + match[1] + "'");
				}
			}
			return false;
		};
		var start_str_regex = new RegExp("^['\"]");
		var number_regex = new RegExp("^(\\d+(\\.\\d+)?)");
		proto.parse_constant = function () {
			var match, node;
			match = this.buffer.match(number_regex);
			if (match) {
				this.buffer = this.buffer.substr(match[0].length);
				node = {
					type: "constant",
					text: match[0],
					value: parseFloat(match[1])
				};
				return node;
			} else {
				match = this.buffer.match(start_str_regex);
				if (match) {
					var quote_type = match[0];
					var matching_quote_index = this.buffer.indexOf(quote_type, quote_type.length);

					if (matching_quote_index >= 0) {
						var content = this.buffer.substring(1, matching_quote_index);
						node = {
							type: "constant",
							text: this.buffer.substring(0, matching_quote_index + 1),
							value: content
						};
						this.buffer = this.buffer.substr(matching_quote_index + 1);
						return node;
					} else {
						throw new Error("Unclosed quote in " + match[0]);
					}
				}
			}
			return false;
		};
		var open_paren_regex = new RegExp("^\\(");
		var fn_arg_regex = new RegExp("^\\s*,");
		var close_paren_regex = new RegExp("^\\s*\\)");
		proto.parse_fn_call = function () {
			if (this.curr_node && (this.curr_node.type === "prop" || this.curr_node.type === "var" || this.curr_node.type === "fn_call")) {
				var match;
				if (match = this.buffer.match(open_paren_regex)) {
					var arg_node = false;
					this.buffer = this.buffer.substr(1); // Kill the open paren
					var args = [];
					var old_curr_node = this.curr_node;
					do {
						this.curr_node = null;
						arg_node = this.gobble_expression();
						args.push(arg_node);
						if (match = this.buffer.match(fn_arg_regex)) {
							this.buffer = this.buffer.substr(match[0].length);
						} else if (match = this.buffer.match(close_paren_regex)) {
							this.buffer = this.buffer.substr(match[0].length);
							break;
						}
					} while(arg_node);
					this.curr_node = old_curr_node;
					var node = {
						type: "fn_call",
						args: args,
						fn: this.curr_node
					};
					return node;
				}
			}
			return false;
		};

		var starts_with = function (str, substr) {
			return str.substr(0,substr.length) === substr;
		};

		proto.parse_parens = function () {
			var match;
			if(match = this.buffer.match(open_paren_regex)) {
				this.buffer = this.buffer.substr(match[0].length);
				var previous_node = this.curr_node;
				this.curr_node = null;
				var contents = this.gobble_expression();
				if(match = this.buffer.match(close_paren_regex)) {
					this.buffer = this.buffer.substr(match[0].length);
					var node = {
						type: "grouping",
						contents: contents
					};
					return node;
				} else {
					throw new Error("Unclosed (");
				}
			}
			return false;
		};
		proto.parse_unary_op = function () {
			var i, leni;
			for(i = 0, leni = unary_ops.length; i<leni; i++) {
				var unary_op = unary_ops[i];
				if(starts_with(this.buffer, unary_op)) {
					this.buffer = this.buffer.substr(unary_op.length);
					var operand = this.gobble_expression();

					var node = {
						type: "op",
						subtype: "unary",
						op: unary_op,
						operands: [operand]
					};
					return node;
				}
			}
			return false;
		};
		proto.parse_binary_op = function () {
			if(this.curr_node !== null) {
				var i, len;
				for(i = 0, len = binary_ops.length; i<len; i++) {
					var binary_op = binary_ops[i];
					if(starts_with(this.buffer, binary_op)) {
						this.buffer = this.buffer.substr(binary_op.length);
						var operand_1 = this.curr_node;
						this.curr_node = null;
						var operand_2 = this.gobble_expression();

						var node = {
							type: "op",
							subtype: "binary",
							op: binary_op,
							operands: [operand_1, operand_2]
						};
						return node;
					}
				}
			}
			return false;
		};
	}(Parser));

	root.jsep = function (expr, options) {
		var parser = new Parser(expr, options);
		return parser.tokenize();
	};
}(this));
