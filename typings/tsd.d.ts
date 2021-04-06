import { Expression } from 'jsep';

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

        // plugin types:
        export interface ArrowFunctionExpression extends Expression {
            type: 'ArrowFunctionExpression',
            params?: Expression[];
            body: Expression;
        }

        export interface SpreadElement extends Expression {
            type: 'SpreadElement';
            argument: Expression;
        }

        export interface AssignmentExpression extends Expression {
            type: 'AssignmentExpression',
            operator: string;
            left: Expression;
            right: Expression;
        }

        export interface NewExpression extends Expression {
            type: 'NewExpression';
            node: Expression;
        }

        export interface ObjectExpression extends Expression {
            type: 'ObjectExpression';
            properties: Array<Property | Identifier | SpreadElement>;
        }

        export interface ObjectPatterson extends Expression {
            type: 'ObjectPattern';
            properties: Array<Property | Identifier | SpreadElement>;
        }

        export interface Property extends Expression {
            type: 'Property';
            computed: boolean;
            key: Expression;
            value: Expression;
            shorthand: boolean;
        }

        type ExpressionType = 'Compound'
          | 'Identifier'
          | 'MemberExpression'
          | 'Literal'
          | 'ThisExpression'
          | 'CallExpression'
          | 'UnaryExpression'
          | 'BinaryExpression'
          | 'LogicalExpression'
          | 'ConditionalExpression'
          | 'ArrayExpression'
          | 'ArrowFunctionExpression'
          | 'SpreadElement'
          | 'AssignmentExpression'
          | 'NewExpression'
          | 'ObjectExpression'
          | 'ObjectPattern'
          | 'Property';

        export type PossibleExpression = Expression | false;
        export interface HookScope {
            index: number;
            expr: string;
            exprI: string;
            exprICode: () => number;
            gobbleSpaces: () => void;
            gobbleExpression: () => Expression;
            gobbleBinaryOp: () => PossibleExpression;
            gobbleBinaryExpression: () => PossibleExpression;
            gobbleToken: () =>  PossibleExpression;
            gobbleNumericLiteral: () => PossibleExpression;
            gobbleStringLiteral: () => PossibleExpression;
            gobbleIdentifier: () => PossibleExpression;
            gobbleArguments: (number) => PossibleExpression;
            gobbleGroup: () => Expression;
            gobbleArray: () => PossibleExpression;
            throwError: (string) => void;
            nodes: Expression[];
            node: PossibleExpression;
        }

        export type HookCallback = (env: HookScope) => void;

        function addBinaryOp(operatorName: string, precedence: number): void;

        function addUnaryOp(operatorName: string): void;

        function removeBinaryOp(operatorName: string): void;

        function removeUnaryOp(operatorName: string): void;

        function addIdentifierChar(identifierName: string): void;

        function removeIdentifierChar(identifierName: string): void;

        const hooks: {
            'before-all'?: HookCallback;
            'after-all'?: HookCallback;
            'before-expression'?: HookCallback;
            'after-expression'?: HookCallback;
            'before-binary'?: HookCallback;
            'after-binary'?: HookCallback;
            'before-token'?: HookCallback;
            'after-token'?: HookCallback;
        };

        const version: string;
    }

    function jsep(val: string | jsep.Expression): jsep.Expression;

    export = jsep;
}
