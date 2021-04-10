export default function (jsep) {
	if (typeof jsep === 'undefined') {
		return;
	}

	const BTICK_CODE = 96; // `
	const CCURLY_CODE = 125; // }
	const TAGGED_TEMPLATE_EXPRESSION = 'TaggedTemplateExpression';
	const TEMPLATE_LITERAL = 'TemplateLiteral';
	const TEMPLATE_ELEMENT = 'TemplateElement';
	const IDENTIFIER = 'Identifier';

	jsep.hooks.add('after-token', function gobbleTaggedTemplateIdentifier(env) {
		if (env.node.type === IDENTIFIER && env.exprICode(env.index) === BTICK_CODE) {
			env.node = {
				type: TAGGED_TEMPLATE_EXPRESSION,
				tag: env.node,
				quasi: gobbleTemplateLiteral(env),
			};
		}
	});

	jsep.hooks.add('gobble-token', gobbleTemplateLiteral);

	function gobbleTemplateLiteral(env) {
		if (env.exprICode(env.index) === BTICK_CODE) {
			const node = {
				type: TEMPLATE_LITERAL,
				quasis: [],
				expressions: [],
			};
			let cooked = '';
			let raw = '';
			let closed = false;
			const length = env.expr.length;
			const pushQuasi = () => node.quasis.push({
				type: TEMPLATE_ELEMENT,
				value: {
					raw,
					cooked,
				},
				tail: closed,
			});

			while (env.index < length) {
				let ch = env.exprI(++env.index);

				if (ch === '`') {
					env.index += 1;
					closed = true;
					break;
				}
				else if (ch === '$' && env.exprI(env.index + 1) === '{') {
					env.index += 2;
					pushQuasi();
					raw = '';
					cooked = '';
					node.expressions = env.gobbleExpressions(CCURLY_CODE);
					if (env.exprICode(env.index) !== CCURLY_CODE) {
						env.throwError('unclosed ${');
					}
				}
				else if (ch === '\\') {
					// Check for all of the common escape codes
					raw += ch;
					ch = env.exprI(env.index++);
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

			if (!closed) {
				env.throwError('Unclosed `');
			}
			pushQuasi();

			env.node = node;
			return node;
		}
	}
};
