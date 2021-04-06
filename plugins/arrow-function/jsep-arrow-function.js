export default function(jsep) {
  if (typeof jsep === 'undefined') {
    return;
  }

  const EQUAL_CODE = 61; // =
  const GTHAN_CODE = 62; // >
  const ARROW_EXP = 'ArrowFunctionExpression';
  jsep.addBinaryOp('=>', 0);

  jsep.hooks.add('after-expression', function gobbleArrowExpression(env) {
    if (env.exprICode(env.index) === EQUAL_CODE) {
      // arrow expression: () => expr
      env.index++;
      if (env.exprICode(env.index) === GTHAN_CODE) {
        env.index++;
        env.node = {
          type: ARROW_EXP,
          params: env.node ? [env.node] : null,
          body: env.gobbleExpression(),
        };
      }
      else {
        env.throwError('Expected >');
      }
    }
  });

  // This is necessary when adding '=' as a binary operator (for assignment)
  // Otherwise '>' throws an error for the right-hand side
  jsep.hooks.add('after-binary', function gobbleArrowBinary(env) {
    if (env.node.operator === '=>') {
      env.node = {
        type: 'ArrowFunctionExpression',
        params: env.node.left ? [env.node.left] : null,
        body: env.node.right,
      };
    }
  });
};
