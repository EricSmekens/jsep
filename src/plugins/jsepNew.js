export default {
	name: 'jsepNew',

	init(jsep) {
		jsep.addUnaryOp('new');

		jsep.hooks.add('after-token', function gobbleNew(env) {
			const node = env.node;
			if (node && node.operator === 'new') {
				if (!node.argument || ![jsep.CALL_EXP, jsep.MEMBER_EXP].includes(node.argument.type)) {
					this.throwError('Expected new function()');
				}
				env.node = node.argument;
				env.node.type = 'NewExpression';
			}
		});
	}
};
