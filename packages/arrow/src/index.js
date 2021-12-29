const ARROW_EXP = 'ArrowFunctionExpression';

export default {
	name: 'arrow',

	init(jsep) {
		// arrow-function expressions: () => x, v => v, (a, b) => v
		jsep.addBinaryOp('=>', 0.1, true);

		// this hook searches for the special case () => ...
		// which would normally throw an error because of the invalid LHS to the bin op
		jsep.hooks.add('gobble-expression', function gobbleEmptyArrowArg(env) {
			this.gobbleSpaces();
			if (this.code === jsep.OPAREN_CODE) {
				const backupIndex = this.index;
				this.index++;

				this.gobbleSpaces();
				if (this.code === jsep.CPAREN_CODE) {
					this.index++;

					const biop = this.gobbleBinaryOp();
					if (biop === '=>') {
						// () => ...
						const body = this.gobbleBinaryExpression();
						if (!body) {
							this.throwError("Expected expression after " + biop);
						}
						env.node = {
							type: ARROW_EXP,
							params: null,
							body,
						};
						return;
					}
				}
				this.index = backupIndex;
			}
		});

		jsep.hooks.add('after-expression', function fixBinaryArrow(env) {
			updateBinariesToArrows(env.node);
		});

		function updateBinariesToArrows(node) {
			if (node) {
				// Traverse full tree, converting any sub-object nodes as needed
				Object.values(node).forEach((val) => {
					if (val && typeof val === 'object') {
						updateBinariesToArrows(val);
					}
				});

				if (node.operator === '=>') {
					node.type = ARROW_EXP;
					node.params = node.left ? [node.left] : null;
					node.body = node.right;
					if (node.params && node.params[0].type === jsep.SEQUENCE_EXP) {
						node.params = node.params[0].expressions;
					}
					delete node.left;
					delete node.right;
					delete node.operator;
				}
			}
		}
	}
};
