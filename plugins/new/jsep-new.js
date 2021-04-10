export default function (jsep) {
	if (typeof jsep === 'undefined') {
		return;
	}

	jsep.addUnaryOp('new');

	jsep.hooks.add('after-token', function gobbleNew(env) {
		const node = env.node;
		if (node && node.operator === 'new') {
			if (!node.argument || node.argument.type !== 'CallExpression') {
				env.throwError('Expected new function()');
			}
			env.node = node.argument;
			env.node.type = 'NewExpression';
		}
	});
};
