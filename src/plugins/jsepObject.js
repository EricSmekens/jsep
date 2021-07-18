const OCURLY_CODE = 123; // {
const CCURLY_CODE = 125; // }
const OBJECT_EXP  = 'ObjectExpression';
const PROPERTY    = 'Property';

export default {
	name: 'jsepObject',

	init(jsep) {
		jsep.addBinaryOp(':', 0.5);

		// Object literal support
		function gobbleObjectExpression(env) {
			if (this.code === OCURLY_CODE && !env.node) {
				this.index++;
				const properties = this.gobbleArguments(CCURLY_CODE)
					.map((arg) => {
						if (arg.type === jsep.IDENTIFIER) {
							return {
								type: PROPERTY,
								computed: false,
								key: arg.name,
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
		jsep.hooksAdd('gobble-expression', gobbleObjectExpression);
		jsep.hooksAdd('after-token', gobbleObjectExpression);
	}
};