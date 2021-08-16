export default {
	name: 'jsepSpread',

	init(jsep) {
		// Spread operator: ...a
		// Works in objects { ...a }, arrays [...a], function args fn(...a)
		// NOTE: does not prevent `a ? ...b : ...c` or `...123`
		jsep.hooks.add('gobble-token', function gobbleSpread(env) {
			if ([0, 1, 2].every(i => this.expr.charCodeAt(this.index + i) === jsep.PERIOD_CODE)) {
				this.index += 3;
				env.node = {
					type: 'SpreadElement',
					argument: this.gobbleExpression(),
				};
			}
		});
	},
};
