export default {
	name: 'new',

	init(jsep) {
		jsep.addUnaryOp('new');

		jsep.hooks.add('after-token', function gobbleNew(env) {
			const node = env.node;
			if (node && node.operator === 'new') {
				if (!node.argument || ![jsep.CALL_EXP, jsep.MEMBER_EXP].includes(node.argument.type)) {
					this.throwError('Expected new function()');
				}
				env.node = node.argument;

				// Track the constructor call without changing its member-expression callee.
				let callNode = env.node;
				let memberNode = env.node;
				while (memberNode.type === jsep.MEMBER_EXP || (
					memberNode.type === jsep.CALL_EXP && memberNode.callee.type === jsep.MEMBER_EXP)) {
					memberNode = memberNode.type === jsep.MEMBER_EXP
						? memberNode.object
						: memberNode.callee.object;
					if (memberNode.type === jsep.CALL_EXP) {
						callNode = memberNode;
					}
				}
				if (callNode.type !== jsep.CALL_EXP) {
					this.throwError('Expected new function()');
				}
				callNode.type = 'NewExpression';
			}
		});
	}
};
