(function() {
var filter_props = function(larger, smaller) {
	var rv = {};
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
var test_parser = function(inp, out) {
	var parse_val = parse(inp);
	return deepEqual(filter_props(parse_val, out), out);
};

module("Expression Parser");

test('Constants', function() {
	test_parser("'abc'", {value: "abc"});
	test_parser('"abc"', {value: "abc"});
	test_parser("123", {value: 123});
	test_parser("12.3", {value: 12.3});
});

test('Variables', function() {
	test_parser("abc", {var_name: "abc"});
	test_parser("a.b[c[0]]", {
		child: {
			type: "prop"
		}
	});
});

test('Function Calls', function() {
	test_parser("a(b, c(d,e), f)", {});
	test_parser("a b + c", {});
	test_parser(";", {});
});


}());
