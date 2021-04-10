export default function (jsep) {
	if (typeof jsep === 'undefined') {
		return;
	}

	const FSLSH_CODE = 47; // /
	const ASTSK_CODE = 42; // *
	const LF_CODE    = 10;

	jsep.hooks.add('gobble-spaces', function gobbleComment(env) {
		if (env.exprICode(env.index) === FSLSH_CODE) {
			let ch = env.exprICode(env.index + 1);
			if (ch === FSLSH_CODE) {
				// read to end of line
				env.index += 2;
				while (ch !== LF_CODE && !isNaN(ch)) {
					ch = env.exprICode(++env.index);
				}
			}
			else if (ch === ASTSK_CODE) {
				// read to */ or end of input
				env.index += 2;
				while (!isNaN(ch)) {
					ch = env.exprICode(++env.index);
					if (ch === ASTSK_CODE) {
						ch = env.exprICode(++env.index);
						if (ch === FSLSH_CODE) {
							env.index += 1;
							break;
						}
					}
				}
			}
		}
	});
};
