export default function(jsep) {
  if (typeof jsep === 'undefined') {
    return;
  }

  const assignmentOperators = new Set([
    '=',
    '*=',
    '**=',
    '/=',
    '%=',
    '+=',
    '-=',
    '<<=',
    '>>=',
    '>>>=',
    '&=',
    '^=',
    '|=',
  ]);
  assignmentOperators.forEach(op => jsep.addBinaryOp(op, 0.9));

  jsep.hooks.add('after-binary', function gobbleAssignment(env) {
    if (assignmentOperators.has(env.node.operator)) {
      env.node.type = 'AssignmentExpression';
    }
  });
};
