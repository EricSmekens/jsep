export default {
	name: 'jsepAssignment',

	init(jsep) {
		// Assignment support
		const assignmentOperators = new Set([
			'=',
			'*=',
			'**=',
			'/=',
			'%=',
			'+=',
			'-=',
			'<<=',
			'>>=',
			'>>>=',
			'&=',
			'^=',
			'|=',
		]);
		assignmentOperators.forEach(op => jsep.addBinaryOp(op, 0.9));

		jsep.hooks.add('after-expression', function gobbleAssignment(env) {
			if (assignmentOperators.has(env.node.operator)) {
				env.node.type = 'AssignmentExpression';
			}
		});
	}
};
