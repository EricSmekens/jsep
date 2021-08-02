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

		jsep.hooks.add('after-expression', function gobbleAssignmentOrPostfix(env) {
			if (env.node) {
				if (assignmentOperators.has(env.node.operator)) {
					env.node.type = 'AssignmentExpression';
				}

				// Replace Binary/Unary Operator with Update node, as needed:
				else if (['+', '-'].includes(env.node.operator) && env.node.right && env.node.right.operator === env.node.operator) {
					if (!env.node.left || !updateNodeTypes.includes(env.node.left.type)) {
						this.throwError('Invalid postfix operation');
					}
					env.node = {
						type: 'UpdateExpression',
						operator: env.node.operator + env.node.operator,
						argument: env.node.left,
						prefix: false,
					};
				}
			}
		});
	},
};
