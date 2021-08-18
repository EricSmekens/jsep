import { ExpressionType } from 'jsep';

declare module 'jsep' {

	namespace jsep {
		export interface Expression<T extends string = never> {
			type: ExpressionType | T;
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
			value: boolean | number | string | RegExp | null;
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

		type ExpressionType =
			'Compound'
			| 'Identifier'
			| 'MemberExpression'
			| 'Literal'
			| 'ThisExpression'
			| 'CallExpression'
			| 'UnaryExpression'
			| 'BinaryExpression'
			| 'LogicalExpression'
			| 'ConditionalExpression'
			| 'ArrayExpression';

		export type PossibleExpression = Expression | undefined;
		export interface HookScope {
			index: number;
			readonly expr: string;
			readonly char: string; // current character of the expression
			readonly code: number; // current character code of the expression
			gobbleSpaces: () => void;
			gobbleExpressions: (untilICode?: number) => Expression[];
			gobbleExpression: () => Expression;
			gobbleBinaryOp: () => PossibleExpression;
			gobbleBinaryExpression: () => PossibleExpression;
			gobbleToken: () => PossibleExpression;
			gobbleTokenProperty: (node: Expression) => Expression
			gobbleNumericLiteral: () => PossibleExpression;
			gobbleStringLiteral: () => PossibleExpression;
			gobbleIdentifier: (allowLiteral?: boolean) => PossibleExpression;
			gobbleArguments: (untilICode: number) => PossibleExpression;
			gobbleGroup: () => Expression;
			gobbleArray: () => PossibleExpression;
			throwError: (msg: string) => void;
		}

		export type HookType = 'gobble-expression' | 'after-expression' | 'gobble-token' | 'after-token' | 'gobble-spaces';
		export type HookCallback = (this: HookScope, env: { node?: Expression }) => void;
		type HookTypeObj = Partial<{ [key in HookType]: HookCallback}>

		export interface IHooks extends HookTypeObj {
			add(name: HookType, cb: HookCallback, first?: boolean): void;
			add(obj: { [name in HookType]: HookCallback }, first?: boolean): void;
			run(name: string, env: { context?: typeof jsep, node?: Expression }): void;
		}
		let hooks: IHooks;

		export interface IPlugin {
			name: string;
			init: (this: typeof jsep) => void;
		}
		export interface IPlugins {
			registered: { [name: string]: IPlugin };
			register: (...plugins: IPlugin[]) => void;
		}
		let plugins: IPlugins;

		let unary_ops: { [op: string]: any };
		let binary_ops: { [op: string]: number };
		let additional_identifier_chars: Set<string>;
		let literals: { [literal: string]: any };
		let this_str: string;

		function addBinaryOp(operatorName: string, precedence: number): void;

		function addUnaryOp(operatorName: string): void;

		function removeBinaryOp(operatorName: string): void;

		function removeUnaryOp(operatorName: string): void;

		function addIdentifierChar(identifierName: string): void;

		function removeIdentifierChar(identifierName: string): void;

		const version: string;
	}

	function jsep(val: string | jsep.Expression): jsep.Expression;

	export = jsep;
}
