import jsep from '../jsep.js';

jsep.CONDITIONAL_EXP = 'ConditionalExpression';

// Ternary expression: test ? consequent : alternate
jsep.hooksAdd('after-expression', function gobbleTernary(env) {
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
				type: jsep.CONDITIONAL_EXP,
				test,
				consequent,
				alternate,
			};
		}
		else {
			this.throwError('Expected :');
		}
	}
});
