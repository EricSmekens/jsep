const FSLSH_CODE = 47; // /
const ASTSK_CODE = 42; // *

export default {
	name: 'comment',

	init(jsep) {
		// treat all comments as whitespace to remove from parsing
		jsep.hooks.add('gobble-spaces', function gobbleComment(env) {
			if (this.code === FSLSH_CODE) {
				let ch = this.expr.charCodeAt(this.index + 1);
				if (ch === FSLSH_CODE) {
					// '//': read to end of line/input
					this.index += 2;
					while (ch !== jsep.LF_CODE && !isNaN(ch)) {
						ch = this.expr.charCodeAt(++this.index);
					}
				}
				else if (ch === ASTSK_CODE) {
					// read to */ or end of input
					env.index += 2;
					while (!isNaN(ch)) {
						ch = this.expr.charCodeAt(++this.index);
						if (ch === ASTSK_CODE) {
							ch = this.expr.charCodeAt(++this.index);
							if (ch === FSLSH_CODE) {
								this.index += 1;
								return;
							}
						}
					}

					// missing closing */
					this.throwError('Missing closing comment, */');
				}
			}
		});
	},
};
