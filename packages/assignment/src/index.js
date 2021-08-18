const PLUS_CODE = 43; // +
const MINUS_CODE = 45; // -

export default {
	name: 'assignment',

	init(jsep) {
		// Assignment and Update support
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
		const updateOperators = [PLUS_CODE, MINUS_CODE];
		const updateNodeTypes = [jsep.IDENTIFIER, jsep.MEMBER_EXP];

		// See operator precedence https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
		assignmentOperators.forEach(op => jsep.addBinaryOp(op, 11));

		jsep.hooks.add('gobble-expression', function gobbleUpdatePrefix(env) {
			const code = this.code;
			if (updateOperators.some(c => c === code && c === this.expr.charCodeAt(this.index + 1))) {
				this.index += 2;
				env.node = {
					type: 'UpdateExpression',
					operator: code === PLUS_CODE ? '++' : '--',
					argument: this.gobbleExpression(),
					prefix: true,
				};
				if (!env.node.argument || !updateNodeTypes.includes(env.node.argument.type)) {
					this.throwError(`Unexpected ${env.node.operator}`);
				}
			}
		});

		jsep.hooks.add('after-token', function gobbleUpdatePostfix(env) {
			if (env.node) {
				const code = this.code;
				if (updateOperators.some(c => c === code && c === this.expr.charCodeAt(this.index + 1))) {
					if (!updateNodeTypes.includes(env.node.type)) {
						this.throwError(`Unexpected ${env.node.operator}`);
					}
					this.index += 2;
					env.node = {
						type: 'UpdateExpression',
						operator: code === PLUS_CODE ? '++' : '--',
						argument: env.node,
						prefix: false,
					};
				}
			}
		});

		jsep.hooks.add('after-expression', function gobbleAssignment(env) {
			if (env.node && assignmentOperators.has(env.node.operator)) {
				env.node.type = 'AssignmentExpression';
			}
		});
	},
};
