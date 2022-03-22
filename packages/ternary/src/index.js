const CONDITIONAL_EXP = 'ConditionalExpression';

export default {
	name: 'ternary',

	init(jsep) {
		// Ternary expression: test ? consequent : alternate
		jsep.hooks.add('after-expression', function gobbleTernary(env) {
			if (env.node && this.code === jsep.QUMARK_CODE) {
				this.index++;
				const test = env.node;
				const consequent = this.gobbleExpression();

				if (!consequent) {
					this.throwError('Expected expression');
				}

				this.gobbleSpaces();

				if (this.code === jsep.COLON_CODE) {
					this.index++;
					const alternate = this.gobbleExpression();

					if (!alternate) {
						this.throwError('Expected expression');
					}
					env.node = {
						type: CONDITIONAL_EXP,
						test,
						consequent,
						alternate,
					};

					// check for operators of higher priority than ternary (i.e. assignment)
					// jsep sets || at 1, and assignment at 0.9, and conditional should be between them
					if (test.operator && jsep.binary_ops[test.operator] <= 0.9) {
						let newTest = test;
						while (newTest.right.operator && jsep.binary_ops[newTest.right.operator] <= 0.9) {
							newTest = newTest.right;
						}
						env.node.test = newTest.right;
						newTest.right = env.node;
						env.node = test;
					}
				}
				else {
					this.throwError('Expected :');
				}
			}
		});
	},
};
