const CONDITIONAL_EXP = 'ConditionalExpression';

export default {
	name: 'ternary',

	init(jsep) {
		// Ternary expression: test ? consequent : alternate
		jsep.hooks.add('after-expression', function gobbleTernary(env) {
			if (env.node && this.code === jsep.QUMARK_CODE) {
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
						type: CONDITIONAL_EXP,
						test,
						consequent,
						alternate,
					};
				}
				// if binary operator is custom-added (i.e. object plugin), then correct it to a ternary node:
				// Note: BinaryExpressions can be stacked (similar to 1 + 1 + 1), so we have to collapse the stack
				// Only do one level at a time so we can unroll as we pop the ternary stack
				else if (test.operator === ':') {
					// this happens when the alternate is a ternary
					if (!consequent.right) {
						this.throwError('Expected :');
					}
					const node = findLastBinaryNode(consequent);
					test.right = {
						type: CONDITIONAL_EXP,
						test: test.right,
						consequent: node.left,
						alternate: node === consequent ? node.right : {
							// temporary values because we still have to wait to pop the consequent...
							operator: ':',
							left: node.right,
							right: consequent.right,
						},
					};
					env.node = test;
				}
				else if (consequent.operator === ':') {
					convertBinaryToConditional(findLastBinaryNode(consequent), test);
					env.node = consequent;
				}
				else if (consequent.alternate) {
					// cleanup the temporary placeholder we made, now that we have the consequent
					let alternate = consequent.alternate;
					while (alternate.alternate) {
						alternate = alternate.alternate;
					}
					env.node = {
						type: CONDITIONAL_EXP,
						test,
						consequent,
						alternate: alternate.right,
					};
					delete alternate.operator;
					delete alternate.right;
					Object.assign(alternate, alternate.left);
				}
				else {
					this.throwError('Expected :');
				}
			}
		});

		/**
		 * @param {jsep.Expression} node
		 * @returns {jsep.Expression}
		 */
		function findLastBinaryNode(node) {
			while (node.left && node.left.operator === ':') {
				node = node.left;
			}
			return node;
		}

		/**
		 * @param {jsep.BinaryExpression} node
		 * @param {jsep.Expression} test
		 * @returns {jsep.ConditionalExpression}
		 */
		function convertBinaryToConditional(node, test) {
			node.type = CONDITIONAL_EXP;
			node.test = test;
			node.consequent = node.left;
			node.alternate = node.right;
			delete node.operator;
			delete node.left;
			delete node.right;
		}
	},
};
