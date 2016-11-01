
declare module 'jsep' {
  export class jsep {
    type: string;  

    constructor(expression: jsep | string);
  }

  export interface ILiteral extends jsep {
    type: "Literal";
    value: any;
    raw: string;
  }

  export interface IIdentifier extends jsep {
    type: 'Identifier'
    name: string;
  }

  export interface IBinaryExpression extends jsep {
    type: 'BinaryExpression';
    operator: string;
    left: jsep;
    right: jsep;
  }

  export interface ILogicalExpression extends jsep {
    type: 'LogicalExpression';
    operator: string;
    left: jsep;
    right: jsep;
  }

  export interface IConditionalExpression extends jsep {
    type: 'ConditionalExpression';
    test: any;
    consequent: any;
    alternate: any;
  }

  export interface IUnaryExpression extends jsep {
    type: 'UnaryExpression';
    operator: string;
    argument: jsep;
    prefix: boolean;
  }

  export interface IMemberExpression extends jsep {
    type: 'MemberExpression';
    computed: boolean;
    object: any | jsep;
    property: any | jsep;
  }

  export interface IThisExpression extends jsep {
    type: "ThisExpression";
  }

  export interface ICallExpression extends jsep {
    type: "CallExpression";
    arguments: any[];
    callee: any;
  }

  export interface IArrayExpression extends jsep {
    type: "ArrayExpression";
    elements: any[];
  }

  export interface ICompound extends jsep {
    type: "Compound";
    body: any[];
  }
}