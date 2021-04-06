export default function(jsep) {
  if (typeof jsep === 'undefined') {
    return;
  }

  const PERIOD_CODE = 46; // '.'
  const OCURLY_CODE = 123; // {
  const CCURLY_CODE = 125; // }
  const OBJECT_EXPRESSION = 'ObjectExpression';
  const OBJECT_PATTERN = 'ObjectPattern';
  const PROPERTY = 'Property';
  const SPREAD_ELEMENT = 'SpreadElement';
  jsep.addBinaryOp(':', 0.5);

  const gobbleObject = function(type) {
    return function(env) {
      if (env.exprICode(env.index) === OCURLY_CODE) {
        env.index++;
        const args = env.gobbleArguments(CCURLY_CODE);
        const properties = args.map((arg) => {
          if (arg.type === 'SpreadElement') {
            return arg;
          }
          if (arg.type === 'Identifier') {
            return {
              type: PROPERTY,
              computed: false,
              key: arg.name,
              shorthand: true,
            };
          }
          if (arg.type === 'BinaryExpression') {
            const computed = arg.left.type === 'ArrayExpression';
            return {
              type: PROPERTY,
              computed,
              key: computed
                ? arg.left.elements[0]
                : arg.left,
              value: arg.right,
              shorthand: false,
            };
          }
          env.throwError('Unexpected object property');
        });

        env.node = {
          type,
          properties,
        };
      }
    };
  };
  jsep.hooks.add('after-expression', gobbleObject(OBJECT_EXPRESSION));
  jsep.hooks.add('after-token', gobbleObject(OBJECT_PATTERN));

  jsep.hooks.add('before-token', function gobbleSpread(env) {
    // check for spread operator:
    if ([0, 1, 2].every(i => env.exprICode(env.index + i) === PERIOD_CODE)) {
      env.index += 3;
      env.node = {
        type: SPREAD_ELEMENT,
        argument: env.gobbleExpression(),
      };
    }
  });
};
