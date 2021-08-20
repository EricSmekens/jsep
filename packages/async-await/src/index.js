const ARROW_EXP = 'ArrowFunctionExpression';
const A_CODE = 97; // a (start of 'async')

export default {
	name: 'asyncAwait',

	init(jsep) {
		jsep.hooks.add('gobble-token', function gobbleAsync(env) {
			if (this.code === A_CODE && !jsep.isIdentifierStart(this.expr.charCodeAt(this.index + 5))) {
				const sub = this.expr.substr(this.index + 1, 4);
				if (sub === 'wait') {
					// found 'await'
					this.index += 5;
					const argument = this.gobbleToken();
					if (!argument) {
						this.throwError('unexpected \'await\'');
					}
					env.node = {
						type: 'AwaitExpression',
						argument,
					};
				}
				else if (sub === 'sync') {
					// found 'async'
					this.index += 5;
					env.node = this.gobbleExpression();
					if (env.node && env.node.type === ARROW_EXP) {
						env.node.async = true;
					}
					else {
						throw new Error('unexpected \'async\'');
					}
				}
			}
		});
	},
};
