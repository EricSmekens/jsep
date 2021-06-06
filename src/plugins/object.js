import jsep from '../jsep.js';

Object.assign(jsep, {
	OCURLY_CODE: 123, // {
	CCURLY_CODE: 125, // }
	OBJECT_EXP: 'ObjectExpression',
	PROPERTY: 'Property',
});
jsep.addBinaryOp(':', 0.5);

// Object literal support
function gobbleObjectExpression(env) {
	if (this.code === jsep.OCURLY_CODE && !env.node) {
		this.index++;
		const properties = this.gobbleArguments(jsep.CCURLY_CODE)
			.map((arg) => {
				if (arg.type === jsep.IDENTIFIER) {
					return {
						type: jsep.PROPERTY,
						computed: false,
						key: arg.name,
						shorthand: true,
					};
				}
				if (arg.type === jsep.BINARY_EXP) {
					const computed = arg.left.type === jsep.ARRAY_EXP;
					return {
						type: jsep.PROPERTY,
						computed,
						key: computed
							? arg.left.elements[0]
							: arg.left,
						value: arg.right,
						shorthand: false,
					};
				}
				// complex value (i.e. ternary, spread)
				return arg;
			});
		env.node = {
			type: jsep.OBJECT_EXP,
			properties,
		};
	}
}
jsep.hooksAdd('gobble-expression', gobbleObjectExpression);
jsep.hooksAdd('after-token', gobbleObjectExpression);
