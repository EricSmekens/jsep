(function() {
var binops = {
	"+" : function(a, b) { return a + b; },
	"-" : function(a, b) { return a - b; },
	"*" : function(a, b) { return a * b; },
	"/" : function(a, b) { return a / b; },
	"%" : function(a, b) { return a % b; }
};
var unops = {
	"-" : function(a) { return -a; },
	"+" : function(a) { return -a; }
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
		if(typeof prop_val === 'string' || typeof prop_val === 'number') {
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
	//test_parser("a(b, c(d,e), f)", {});
	test_parser("a b + c", {}, assert);
	test_parser("'a'.toString()", {}, assert);
	test_parser("[1].length", {}, assert);
	test_parser(";", {}, assert);
});

QUnit.test('Arrays', function(assert) {
	test_parser("[]", {type: 'ArrayExpression', elements: []}, assert);

	test_parser("[a]", {
		type: 'ArrayExpression',
		elements: [{type: 'Identifier', name: 'a'}]
	}, assert);
});

QUnit.test('Ops', function(assert) {
	test_op_expession("1", assert);
	test_op_expession("1+2", assert);
	test_op_expession("1*2", assert);
	test_op_expession("1*(2+3)", assert);
	test_op_expession("(1+2)*3", assert);
	test_op_expession("(1+2)*3+4-2-5+2/2*3", assert);
	test_op_expession("1 + 2-   3*	4 /8", assert);
	test_op_expession("\n1\r\n+\n2\n", assert);
});

QUnit.test('Custom operators', function(assert) {
	jsep.addBinaryOp("^", 10);
	test_parser("a^b", {}, assert);

    jsep.addBinaryOp("×", 9);
    test_parser("a×b", {
        type: 'BinaryExpression',
        left: {name: 'a'},
        right: {name: 'b'}
    }, assert);

	jsep.addBinaryOp("or", 1);
	test_parser("oneWord ordering anotherWord", {
		type: 'Compound',
		body: [
			{
				type: 'Identifier',
				name: 'oneWord'
			},
			{
				type: 'Identifier',
				name: 'ordering'
			},
			{
				type: 'Identifier',
				name: 'anotherWord'
			}
		]
    }, assert);

	jsep.addUnaryOp("#");
	test_parser("#a", {
		type: "UnaryExpression",
		operator: "#",
		argument: {type: "Identifier", name: "a"}
	}, assert);

	jsep.addUnaryOp("not");
	test_parser("not a", {
		type: "UnaryExpression",
		operator: "not",
		argument: {type: "Identifier", name: "a"}
	}, assert);

	jsep.addUnaryOp("notes");
	test_parser("notes", {
		type: "Identifier",
		name: "notes"
	}, assert);
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
	var val = jsep('a ? b : c');
    assert.equal(val.type, 'ConditionalExpression');
	val = jsep('a||b ? c : d');
    assert.equal(val.type, 'ConditionalExpression');
});

}());
