const ARROW_EXP = 'ArrowFunctionExpression';

// test arrow change

export default {
	name: 'arrow',

	init(jsep) {
		// arrow-function expressions: () => x, v => v, (a, b) => v
		jsep.addBinaryOp('=>', 0);

		// this hook searches for the special case () => ...
		// which would normally throw an error because of the invalid LHS to the bin op
		jsep.hooks.add('gobble-expression', function gobbleEmptyArrowArg(env) {
			this.gobbleSpaces();
			if (this.code === jsep.OPAREN_CODE) {
				const backupIndex = this.index;
				this.index++;

				this.gobbleSpaces();
				if (this.code === jsep.CPAREN_CODE) {
					this.index++;

					const biop = this.gobbleBinaryOp();
					if (biop === '=>') {
						// () => ...
						const body = this.gobbleToken();
						if (!body) {
							this.throwError("Expected expression after " + biop);
						}
						env.node = {
							type: ARROW_EXP,
							params: null,
							body,
						};
						return;
					}
				}
				this.index = backupIndex;
			}
		});

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
