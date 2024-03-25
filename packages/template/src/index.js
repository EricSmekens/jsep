const BTICK_CODE = 96; // `
const CCURLY_CODE = 125; // }
const TAGGED_TEMPLATE_EXPRESSION = 'TaggedTemplateExpression';
const TEMPLATE_LITERAL = 'TemplateLiteral';
const TEMPLATE_ELEMENT = 'TemplateElement';

export default {
	name: 'jsepTemplateLiteral',

	init(jsep) {
		function gobbleTemplateLiteral(env, gobbleMember = true) {
			if (this.code === BTICK_CODE) {
				const node = {
					type: TEMPLATE_LITERAL,
					quasis: [],
					expressions: [],
				};
				let cooked = '';
				let raw = '';
				let closed = false;
				const length = this.expr.length;
				const pushQuasi = () => node.quasis.push({
					type: TEMPLATE_ELEMENT,
					value: {
						raw,
						cooked,
					},
					tail: closed,
				});

				while (this.index < length) {
					let ch = this.expr.charAt(++this.index);

					if (ch === '`') {
						this.index += 1;
						closed = true;
						pushQuasi();

						env.node = node;

						if (gobbleMember) {
						  // allow . [] and () after template: `foo`.length
						  env.node = this.gobbleTokenProperty(env.node);
						}

						return env.node;
					}
					else if (ch === '$' && this.expr.charAt(this.index + 1) === '{') {
						this.index += 2;
						pushQuasi();
						raw = '';
						cooked = '';
						node.expressions.push(...this.gobbleExpressions(CCURLY_CODE));
						if (this.code !== CCURLY_CODE) {
							this.throwError('unclosed ${');
						}
					}
					else if (ch === '\\') {
						// Check for all of the common escape codes
						raw += ch;
						ch = this.expr.charAt(++this.index);
						raw += ch;

						switch (ch) {
							case 'n': cooked += '\n'; break;
							case 'r': cooked += '\r'; break;
							case 't': cooked += '\t'; break;
							case 'b': cooked += '\b'; break;
							case 'f': cooked += '\f'; break;
							case 'v': cooked += '\x0B'; break;
							default : cooked += ch;
						}
					}
					else {
						cooked += ch;
						raw += ch;
					}
				}
				this.throwError('Unclosed `');
			}
		}

		jsep.hooks.add('gobble-token', gobbleTemplateLiteral);

		jsep.hooks.add('after-token', function gobbleTaggedTemplateIdentifier(env) {
			if ((env.node.type === jsep.IDENTIFIER || env.node.type === jsep.MEMBER_EXP) && this.code === BTICK_CODE) {
				env.node = {
					type: TAGGED_TEMPLATE_EXPRESSION,
					tag: env.node,
					quasi: gobbleTemplateLiteral.bind(this)(env, false),
				};

				// allow . [] and () after tagged template: bar`foo`.length
				env.node = this.gobbleTokenProperty(env.node);

				return env.node;
			}
		});
	}
};
