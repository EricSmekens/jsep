import {Jsep} from '../../jsep.js';

// Ternary expression: test ? consequent : alternate
Jsep.hooksAdd('after-expression', function gobbleTernary(env) {
	if (this.code === Jsep.QUMARK_CODE) {
		this.index++;
		const test = env.node;
		const consequent = this.gobbleExpression();

		if (!consequent) {
			this.throwError('Expected expression');
		}

		this.gobbleSpaces();

		if (this.code === Jsep.COLON_CODE) {
			this.index++;
			const alternate = this.gobbleExpression();

			if (!alternate) {
				this.throwError('Expected expression');
			}
			env.node = {
				type: 'ConditionalExpression',
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
