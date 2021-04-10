import jsep from "../src/jsep.js";
import plugins from '../plugins/index.js';

(function() {
plugins.forEach(p => p(jsep));

var binops = {
	"+" : function(a, b) { return a + b; },
	"-" : function(a, b) { return a - b; },
	"*" : function(a, b) { return a * b; },
	"/" : function(a, b) { return a / b; },
	"%" : function(a, b) { return a % b; }
};
var unops = {
	"-" : function(a) { return -a; },
	"+" : function(a) { return +a; }
};

var do_eval = function(node) {
	if(node.type === "BinaryExpression") {
		return binops[node.operator](do_eval(node.left), do_eval(node.right));
	} else if(node.type === "UnaryExpression") {
		return unops[node.operator](do_eval(node.argument));
	} else if(node.type === "Literal") {
		return node.value;
	}
};

var test_op_expession = function(str, assert) {
	assert.equal(do_eval(jsep(str)), eval(str));
};

var filter_props = function(larger, smaller) {
	var rv = (typeof larger.length === 'number') ? [] : {};
	var prop_val;
	for(var prop_name in smaller) {
		prop_val  = smaller[prop_name];
		if(typeof prop_val === 'string' || typeof prop_val === 'number' || typeof prop_val === 'boolean' || prop_val === null) {
			rv[prop_name] = larger[prop_name];
		} else {
			rv[prop_name] = filter_props(larger[prop_name], prop_val);
		}
	}
	return rv;
};

var parse = jsep;
var test_parser = function(inp, out, assert) {
	var parse_val = parse(inp);
	return assert.deepEqual(filter_props(parse_val, out), out);
};
var esprima_comparison_test = function(str, assert) {
	var jsep_val = jsep(str),
		esprima_val = esprima.parse(str);
	return assert.deepEqual(jsep_val, esprima_val.body[0].expression);
};

QUnit.module("Expression Parser");

QUnit.test('Constants', function(assert) {
	test_parser("'abc'", {value: "abc"}, assert);
	test_parser('"abc"', {value: "abc"}, assert);
	test_parser("123", {value: 123}, assert);
	test_parser("12.3", {value: 12.3}, assert);
});

QUnit.test('Variables', function(assert) {
	test_parser("abc", {name: "abc"}, assert);
	test_parser("a.b[c[0]]", {
		property: {
			type: "MemberExpression"
		}
	}, assert);
	test_parser("Δέλτα", {name: "Δέλτα"}, assert);
});

QUnit.test('Function Calls', function(assert) {
	// test_parser("a(b, c(d,e), f)", {});
	test_parser("a b + c", {
		type: 'Compound',
		body: [
			{
				type: 'Identifier',
				name: 'a',
			},
			{
				type: 'BinaryExpression',
				operator: '+',
				left: {
					type: 'Identifier',
					name: 'b',
				},
				right: {
					type: 'Identifier',
					name: 'c',
				},
			},
		],
	}, assert);
	test_parser("'a'.toString()", {
		type: 'CallExpression',
		arguments: [],
		callee: {
			type: 'MemberExpression',
			computed: false,
			object: {
				type: 'Literal',
				value: 'a',
				raw: '\'a\'',
			},
			property: {
				type: 'Identifier',
				name: 'toString',
			},
		},
	}, assert);
	test_parser("[1].length", {
		type: "MemberExpression",
		computed: false,
		object: {
			type: "ArrayExpression",
			elements: [
				{
					type: "Literal",
					value: 1,
					raw: "1"
				}
			]
		},
		property: {
			type: "Identifier",
			name: "length"
		}
	}, assert);
	test_parser(";", {
		type: "Compound",
		body: []
	}, assert);
	test_parser("a().b(1)", {
		type: "CallExpression",
		arguments: [
			{
				type: "Literal",
				value: 1,
				raw: "1"
			}
		],
		callee: {
			type: "MemberExpression",
			computed: false,
			object: {
				type: "CallExpression",
				arguments: [],
				callee: {
					type: "Identifier",
					name: "a"
				}
			},
			property: {
				type: "Identifier",
				name: "b"
			}
		}
	}, assert);
});

QUnit.test('Plugins', function(assert) {
	// arrow functions:
	test_parser('a.find(() => true)', {
		type: "CallExpression",
		arguments: [
			{
				type: "ArrowFunctionExpression",
				params: null,
				body: {
					type: "Literal",
					value: true,
					raw: "true"
				}
			}
		],
		callee: {
			type: "MemberExpression",
			computed: false,
			object: {
				type: "Identifier",
				name: "a"
			},
			property: {
				type: "Identifier",
				name: "find"
			}
		}
	}, assert);

	test_parser('[1, 2].find(v => v === 2)', {
		type: "CallExpression",
		arguments: [
			{
				type: "ArrowFunctionExpression",
				params: [
					{
						type: "Identifier",
						name: "v"
					}
				],
				body: {
					type: "BinaryExpression",
					operator: "===",
					left: {
						type: "Identifier",
						name: "v"
					},
					right: {
						type: "Literal",
						value: 2,
						raw: "2"
					}
				}
			}
		],
		callee: {
			type: "MemberExpression",
			computed: false,
			object: {
				type: "ArrayExpression",
				elements: [
					{
						type: "Literal",
						value: 1,
						raw: "1"
					},
					{
						type: "Literal",
						value: 2,
						raw: "2"
					}
				]
			},
			property: {
				type: "Identifier",
				name: "find"
			}
		}
	}, assert);

	test_parser('a.find((val, key) => key === "abc")', {
		type: "CallExpression",
		arguments: [
			{
				type: "ArrowFunctionExpression",
				params: [
					{
						type: "Identifier",
						name: "val"
					},
					{
						type: "Identifier",
						name: "key"
					}
				],
				body: {
					type: "BinaryExpression",
					operator: "===",
					left: {
						type: "Identifier",
						name: "key"
					},
					right: {
						type: "Literal",
						value: "abc",
						raw: "\"abc\""
					}
				}
			}
		],
		callee: {
			type: "MemberExpression",
			computed: false,
			object: {
				type: "Identifier",
				name: "a"
			},
			property: {
				type: "Identifier",
				name: "find"
			}
		}
	}, assert);
	test_parser("(['a', 'b'].find(v => v === 'b').length > 1 || 2) === true", {}, assert);
	test_parser('a.find(val => key === "abc")', {}, assert);
	test_parser("a.find(() => []).length > 2", {}, assert);
	test_parser('(a || b).find(v => v(1))', {}, assert);

	// object expression/literal:
	test_parser('({ a: 1, b: 2 })', {
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

	test_parser('{ [key || key2]: { a: 0 } }', {
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

	test_parser('{ a: !1, ...b, c, ...(a || b) }', {
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
					type: "UnaryExpression",
					operator: "!",
					argument: {
						type: "Literal",
						value: 1,
						raw: "1"
					},
					prefix: true
				},
				shorthand: false
			},
			{
				type: "SpreadElement",
				argument: {
					type: "Identifier",
					name: "b"
				}
			},
			{
				type: "Property",
				computed: false,
				key: "c",
				shorthand: true
			},
			{
				type: "SpreadElement",
				argument: {
					type: "BinaryExpression",
					operator: "||",
					left: {
						type: "Identifier",
						name: "a"
					},
					right: {
						type: "Identifier",
						name: "b"
					}
				}
			}
		]
	}, assert);

	// assignment
	test_parser('a = 2', {
		type: "AssignmentExpression",
		operator: "=",
		left: {
			type: "Identifier",
			name: "a"
		},
		right: {
			type: "Literal",
			value: 2,
			raw: "2"
		}
	}, assert);
	test_parser('a += 2', {
		type: 'AssignmentExpression',
		operator: '+=',
	}, assert);

	// ignore comments
	test_parser('a /* ignore this */ > 1 // ignore this too', {
		type: 'BinaryExpression',
		operator: '>',
		left: { name: 'a' },
		right: { value: 1 },
	}, assert);

	// new operator
	test_parser('a = new Date(123)', {
		type: "AssignmentExpression",
		operator: "=",
		left: {
			type: "Identifier",
			name: "a"
		},
		right: {
			type: "NewExpression",
			arguments: [
				{
					type: "Literal",
					value: 123,
					raw: "123"
				}
			],
			callee: {
				type: "Identifier",
				name: "Date"
			}
		}
	}, assert);
	assert.throws(function(){
		jsep("new A");
	}, /new function/i, "detects invalid new");

	// template literals
	test_parser('abc`token ${`nested ${`deeply` + "str"} blah`}`', {
		type: "TaggedTemplateExpression",
		tag: {
			type: "Identifier",
			name: "abc"
		},
		quasi: {
			type: "TemplateLiteral",
			quasis: [
				{
					type: "TemplateElement",
					value: {
						raw: "token ",
						cooked: "token "
					},
					tail: false
				},
				{
					type: "TemplateElement",
					value: {
						raw: "",
						cooked: ""
					},
					tail: true
				}
			],
			expressions: [
				{
					type: "TemplateLiteral",
					quasis: [
						{
							type: "TemplateElement",
							value: {
								raw: "nested ",
								cooked: "nested "
							},
							tail: false
						},
						{
							type: "TemplateElement",
							value: {
								raw: " blah",
								cooked: " blah"
							},
							tail: true
						}
					],
					expressions: [
						{
							type: "BinaryExpression",
							operator: "+",
							left: {
								type: "TemplateLiteral",
								quasis: [
									{
										type: "TemplateElement",
										value: {
											raw: "deeply",
											cooked: "deeply"
										},
										tail: true
									}
								],
								expressions: []
							},
							right: {
								type: "Literal",
								value: "str",
								raw: "\"str\""
							}
						}
					]
				}
			]
		}
	}, assert);
	assert.throws(function(){
		jsep("`abc ${ `");
	}, /unclosed/i, "detects unclosed template");
});

QUnit.test('Custom alphanumeric operators', function(assert) {
	jsep.addBinaryOp("and", 2);
	test_parser("a and b", {
		type: "BinaryExpression",
		operator: "and",
		left: {type: "Identifier", name: "a"},
		right: {type: "Identifier", name: "b"}
	}, assert);
	test_parser("bands", {type: "Identifier", name: "bands"}, assert);

	test_parser("b ands", {type: "Compound"}, assert);

	jsep.addUnaryOp("not");
	test_parser("not a", {
		type: "UnaryExpression",
		operator: "not",
		argument: {type: "Identifier", name: "a"}
	}, assert);

	test_parser("notes", {type: "Identifier", name: "notes"}, assert);
});

QUnit.test('Custom identifier characters', function(assert) {
	jsep.addIdentifierChar("@");
	test_parser("@asd", {
		type: "Identifier",
		name: "@asd",
	}, assert);
});

QUnit.test('Bad Numbers', function(assert) {
	test_parser("1.", {type: "Literal", value: 1, raw: "1."}, assert);
    assert.throws(function(){
		var x = jsep("1.2.3");
	});
});

QUnit.test('Missing arguments', function(assert) {
    assert.throws(function(){
		var x = jsep("check(,)");
	}, "detects missing argument (all)");
    assert.throws(function(){
		var x = jsep("check(,1,2)");
	}, "detects missing argument (head)");
    assert.throws(function(){
		var x = jsep("check(1,,2)");
	}, "detects missing argument (intervening)");
    assert.throws(function(){
		var x = jsep("check(1,2,)");
	}, "detects missing argument (tail)");
});

QUnit.test('Uncompleted expression-call/array', function(assert) {
    assert.throws(function(){
		var x = jsep("myFunction(a,b");
	}, "detects unfinished expression call");

    assert.throws(function(){
		var x = jsep("[1,2");
	}, "detects unfinished array");

    assert.throws(function(){
        	var x = jsep("-1+2-");
    	}, /Expected expression after - at character 5/,
	"detects trailing operator");
});

QUnit.test('Esprima Comparison', function(assert) {
	([
		"[1,,3]",
		"[1,,]", // this is actually incorrect in esprima
		" true",
		"false ",
		" 1.2 ",
		" .2 ",
		"a",
		"a .b",
		"a.b. c",
		"a [b]",
		"a.b  [ c ] ",
		"$foo[ bar][ baz].other12 ['lawl'][12]",
		"$foo     [ 12	] [ baz[z]    ].other12*4 + 1 ",
		"$foo[ bar][ baz]    (a, bb ,   c  )   .other12 ['lawl'][12]",
		"(a(b(c[!d]).e).f+'hi'==2) === true",
		"(Object.variable.toLowerCase()).length == 3",
		"(Object.variable.toLowerCase())  .  length == 3",
		"[1] + [2]"
	]).map(function(test) {esprima_comparison_test(test, assert)});
});

QUnit.test('Ternary', function(assert) {
	test_parser('a ? b : c', {
		type: "ConditionalExpression",
		test: {
			type: 'Identifier',
			name: 'a',
		},
		consequent: {
			type: 'Identifier',
			name: 'b',
		},
		alternate: {
			name: 'c',
		},
	}, assert);

	test_parser('a||b ? c : d', { type: 'ConditionalExpression' }, assert);
});

}());
