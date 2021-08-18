const OCURLY_CODE = 123; // {
const CCURLY_CODE = 125; // }
const OBJECT_EXP  = 'ObjectExpression';
const PROPERTY    = 'Property';

export default {
	name: 'object',

	init(jsep) {
		jsep.addBinaryOp(':', 0.5);

		// Object literal support
		function gobbleObjectExpression(env) {
			if (this.code === OCURLY_CODE) {
				this.index++;
				const properties = this.gobbleArguments(CCURLY_CODE)
					.map((arg) => {
						if (arg.type === jsep.IDENTIFIER) {
							return {
								type: PROPERTY,
								computed: false,
								key: arg,
								shorthand: true,
							};
						}
						if (arg.type === jsep.BINARY_EXP) {
							const computed = arg.left.type === jsep.ARRAY_EXP;
							return {
								type: PROPERTY,
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
					type: OBJECT_EXP,
					properties,
				};
			}
		}
		jsep.hooks.add('gobble-token', gobbleObjectExpression);
		jsep.hooks.add('after-token', gobbleObjectExpression);
	}
};
