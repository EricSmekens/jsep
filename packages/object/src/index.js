const OCURLY_CODE = 123; // {
const CCURLY_CODE = 125; // }
const OBJECT_EXP  = 'ObjectExpression';
const PROPERTY    = 'Property';

export default {
	name: 'object',

	init(jsep) {
		// Object literal support
		function gobbleObjectExpression(env) {
			if (this.code === OCURLY_CODE) {
				this.index++;
				const properties = [];

				while (!isNaN(this.code)) {
					this.gobbleSpaces();
					if (this.code === CCURLY_CODE) {
						this.index++;
						env.node = this.gobbleTokenProperty({
							type: OBJECT_EXP,
							properties,
						});
						return;
					}

					// Note: using gobbleExpression instead of gobbleToken to support object destructuring
					const key = this.gobbleExpression();
					if (!key) {
						break; // missing }
					}

					this.gobbleSpaces();
					if (key.type === jsep.IDENTIFIER && (this.code === jsep.COMMA_CODE || this.code === CCURLY_CODE)) {
						// property value shorthand
						properties.push({
							type: PROPERTY,
							computed: false,
							key,
							value: key,
							shorthand: true,
						});
					}
					else if (this.code === jsep.COLON_CODE) {
						this.index++;
						const value = this.gobbleExpression();

						if (!value) {
							this.throwError('unexpected object property');
						}
						const computed = key.type === jsep.ARRAY_EXP;
						properties.push({
							type: PROPERTY,
							computed,
							key: computed
								? key.elements[0]
								: key,
							value: value,
							shorthand: false,
						});
						this.gobbleSpaces();
					}
					else if (key) {
						// spread, assignment (object destructuring with defaults), etc.
						properties.push(key);
					}

					if (this.code === jsep.COMMA_CODE) {
						this.index++;
					}
				}
				this.throwError('missing }');
			}
		}

		jsep.hooks.add('gobble-token', gobbleObjectExpression);
	}
};
