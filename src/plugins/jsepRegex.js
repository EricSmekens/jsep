const FSLASH_CODE = 47; // '/'

export default {
	name: 'jsepRegex',

	init(jsep) {
		// Regex literal: /abc123/ig
		jsep.hooks.add('gobble-token', function gobbleRegexLiteral(env) {
			if (this.code === FSLASH_CODE) {
				const patternIndex = ++this.index;

				while (this.index < this.expr.length) {
					if (this.char === '/') {
						const pattern = this.expr.slice(patternIndex, this.index);

						let flags = '';
						while (++this.index < this.expr.length) {
							const code = this.code;
							if ((code >= 97 && code <= 122) // a...z
								|| (code >= 65 && code <= 90) // A...Z
								|| (code >= 48 && code <= 57)) { // 0-9
								flags += this.char;
							}
							else {
								break;
							}
						}

						let value;
						try {
							value = new RegExp(pattern, flags);
						}
						catch (e) {
							this.throwError(e.message);
						}

						env.node = {
							type: jsep.LITERAL,
							value,
							raw: this.expr.slice(patternIndex - 1, this.index),
						};

						// allow . [] and () after regex: /regex/.test(a)
						env.node = this.gobbleTokenProperty(env.node);
						return env.node;
					}
					this.index += 1;
				}
				this.throwError('Unclosed Regex');
			}
		});
	},
};
