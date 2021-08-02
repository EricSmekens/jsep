const ARROW_EXP = 'ArrowFunctionExpression';

export default {
	name: 'jsepArrow',

	init(jsep) {
		// arrow-function expressions: () => x, v => v, (a, b) => v
		jsep.addBinaryOp('=>', 0);
		jsep.hooks.add('after-expression', function fixBinaryArrow(env) {
			if (env.node && env.node.operator === '=>') {
				env.node = {
					type: ARROW_EXP,
					params: env.node.left ? [env.node.left] : null,
					body: env.node.right,
				};
				if (env.node.params && env.node.params[0].type === jsep.SEQUENCE_EXP) {
					env.node.params = env.node.params[0].expressions;
				}
			}
		});
	}
};
