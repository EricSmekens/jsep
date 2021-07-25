const CONDITIONAL_EXP = 'ConditionalExpression';

export default {
	name: 'jsepTernary',

	init(jsep) {
		// Ternary expression: test ? consequent : alternate
		jsep.hooks.add('after-expression', function gobbleTernary(env) {
			if (this.code === jsep.QUMARK_CODE) {
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
				}
				// if binary operator is custom-added (i.e. object plugin), then correct it to a ternary node:
				else if (consequent.operator === ':') {
					env.node = {
						type: CONDITIONAL_EXP,
						test,
						consequent: consequent.left,
						alternate: consequent.right,
					};
				}
				else {
					this.throwError('Expected :');
				}
			}
		});
	},
};
