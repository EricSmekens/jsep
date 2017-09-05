
declare module 'jsep' {

  namespace jsep {
    export interface IExpression {
      type: string;
    }

    export interface ILiteral extends IExpression {
      type: 'Literal';
      value: any;
      raw: string;
    }

    export interface IIdentifier extends IExpression {
      type: 'Identifier'
      name: string;
    }

    export interface IBinaryExpression extends IExpression {
      type: 'BinaryExpression';
      operator: string;
      left: IExpression;
      right: IExpression;
    }

    export interface IUnaryExpression extends IExpression {
      type: 'UnaryExpression';
      operator: string;
      argument: IExpression;
      prefix: boolean;
    }

    export interface IMemberExpression extends IExpression {
      type: 'MemberExpression';
      computed: boolean;
      object: IExpression;
      property: IExpression;
    }

    export interface ICallExpression extends IExpression {
      type: 'CallExpression';
      arguments: IExpression[];
      callee: IExpression;
    }

    export interface IConditionalExpression extends IExpression {
      type: 'ConditionalExpression';
      test: IExpression;
      consequent: IExpression;
      alternate: IExpression;
    }

    export function addBinaryOp(operatorSymbol: string, precedence: number);

    export function addUnaryOp(operatorSymbol: string);

    export function removeBinaryOp(operatorSymbol: string);

    export function removeUnaryOp(operatorSymbol: string);
  }

  function jsep(obj: string | jsep.IExpression): jsep.IExpression;

  export = jsep;
}
