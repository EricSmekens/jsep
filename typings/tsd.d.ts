declare module 'jsep' {

    namespace jsep {
        export interface Expression {
            type: ExpressionType;
        }

        export interface ArrayExpression extends Expression {
            type: 'ArrayExpression';
            elements: Expression[];
        }

        export interface BinaryExpression extends Expression {
            type: 'BinaryExpression';
            operator: string;
            left: Expression;
            right: Expression;
        }

        export interface CallExpression extends Expression {
            type: 'CallExpression';
            arguments: Expression[];
            callee: Expression;
        }

        export interface Compound extends Expression {
            type: 'Compound';
            body: Expression[];
        }

        export interface ConditionalExpression extends Expression {
            type: 'ConditionalExpression';
            test: Expression;
            consequent: Expression;
            alternate: Expression;
        }

        export interface Identifier extends Expression {
            type: 'Identifier';
            name: string;
        }

        export interface Literal extends Expression {
            type: 'Literal';
            value: boolean | number | string;
            raw: string;
        }

        export interface LogicalExpression extends Expression {
            type: 'LogicalExpression';
            operator: string;
            left: Expression;
            right: Expression;
        }

        export interface MemberExpression extends Expression {
            type: 'MemberExpression';
            computed: boolean;
            object: Expression;
            property: Expression;
        }

        export interface ThisExpression extends Expression {
            type: 'ThisExpression';
        }

        export interface UnaryExpression extends Expression {
            type: 'UnaryExpression';
            operator: string;
            argument: Expression;
            prefix: boolean;
        }

        type ExpressionType = 'Compound' | 'Identifier' | 'MemberExpression' | 'Literal' | 'ThisExpression' | 'CallExpression' | 'UnaryExpression' | 'BinaryExpression' | 'LogicalExpression' | 'ConditionalExpression' | 'ArrayExpression';

        function addBinaryOp(operatorName: string, precedence: number): void;

        function addUnaryOp(operatorName: string): void;

        function removeBinaryOp(operatorName: string): void;

        function removeUnaryOp(operatorName: string): void;

        const version: string;
    }

    function jsep(val: string | jsep.Expression): jsep.Expression;

    export = jsep;
}
