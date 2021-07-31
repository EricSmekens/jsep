import jsep from '../src/jsep.js';

export const binOps = {
	'+': (a, b) => a + b,
	'-': (a, b) => a - b,
	'*': (a, b) => a * b,
	'/': (a, b) => a / b,
	'%': (a, b) => a % b,
};

export const unOps = {
	'-': a => -a,
	'+': a => +a,
};

/* eslint-enable brace-style */

export function doEval(node) {
	if (node.type === 'BinaryExpression') {
		return binOps[node.operator](doEval(node.left), doEval(node.right));
	}
	else if (node.type === 'UnaryExpression') {
		return unOps[node.operator](doEval(node.argument));
	}
	else if (node.type === 'Literal') {
		return node.value;
	}
}

export function testOpExpression(str, assert) {
	assert.equal(doEval(jsep(str)), eval(str));
}

export function filterProps(larger, smaller) {
	const rv = (typeof larger.length === 'number') ? [] : {};
	for (let propName in smaller) {
		let propVal = smaller[propName];
		if (typeof propVal === 'string' || typeof propVal === 'number' || typeof propVal === 'boolean' || propVal === null || propVal instanceof RegExp) {
			rv[propName] = larger[propName];
		}
		else {
			rv[propName] = filterProps(larger[propName], propVal);
		}
	}
	return rv;
}

export function testParser(inp, out, assert) {
	const parsedVal = jsep(inp);
	return assert.deepEqual(filterProps(parsedVal, out), out);
}

export function esprimaComparisonTest(str, assert) {
	const parsedVal = jsep(str);
	const esprimaVal = esprima.parse(str);
	return assert.deepEqual(parsedVal, esprimaVal.body[0].expression);
}

export const defaults = {
	hooks: {},
	plugins: Object.assign({}, jsep.plugins.registered),
	unary_ops: Object.assign({}, jsep.unary_ops),
	binary_ops: Object.assign({}, jsep.binary_ops),
	additional_identifier_chars: new Set(jsep.additional_identifier_chars),
	literals: Object.assign({}, jsep.literals),
	this_str: jsep.this_str,
};
Object.entries(jsep.hooks).forEach(([hookName, fns]) => {
	defaults.hooks[hookName] = [...fns];
});

export function resetJsepDefaults() {
	for (let key in jsep.hooks) {
		delete jsep.hooks[key];
	}
	Object.entries(defaults.hooks).forEach(([hookName, fns]) => {
		jsep.hooks[hookName] = [...fns];
	});
	jsep.unary_ops = Object.assign({}, defaults.unary_ops);
	jsep.binary_ops = Object.assign({}, defaults.binary_ops);
	jsep.additional_identifier_chars = new Set(defaults.additional_identifier_chars);
	jsep.literals = Object.assign({}, defaults.literals);
	jsep.this_str = defaults.this_str;
	jsep.plugins.registered = Object.assign({}, defaults.plugins);
}
