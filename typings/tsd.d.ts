declare module 'jsep' {

	export type baseTypes = string | number | boolean | RegExp | null;
	export interface Expression {
		type: string;
		[key: string]: baseTypes | Expression | Array<baseTypes | Expression>;
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

	export type ExpressionType =
		'Compound'
		| 'Identifier'
		| 'MemberExpression'
		| 'Literal'
		| 'ThisExpression'
		| 'CallExpression'
		| 'UnaryExpression'
		| 'BinaryExpression'
		| 'ConditionalExpression'
		| 'ArrayExpression';

	export type CoreExpression =
		ArrayExpression
		| BinaryExpression
		| CallExpression
		| Compound
		| ConditionalExpression
		| Identifier
		| Literal
		| MemberExpression
		| ThisExpression
		| UnaryExpression;

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
		gobbleIdentifier: () => PossibleExpression;
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

	export interface IPlugin {
		name: string;
		init: (this: typeof jsep) => void;
	}
	export interface IPlugins {
		registered: { [name: string]: IPlugin };
		register: (...plugins: IPlugin[]) => void;
	}

	export class Jsep {
		public static hooks: IHooks;
		public static plugins: IPlugins;

		public static unary_ops: { [op: string]: any };
		public static binary_ops: { [op: string]: number };
		public static additional_identifier_chars: Set<string>;
		public static literals: { [literal: string]: any };
		public static this_str: string;

		public static get version(): string

		public static addUnaryOp(operatorName: string): Jsep;
		public static addBinaryOp(operatorName: string, precedence: number): Jsep;
		public static addIdentifierChar(char: string): Jsep;
		public static addLiteral(literalName: string, literalValue: string): Jsep;

		public static removeUnaryOp(operatorName: string): Jsep;
		public static removeAllUnaryOps(): Jsep;
		public static removeIdentifierChar(char: string): Jsep;
		public static removeBinaryOp(operatorName: string): Jsep;
		public static removeAllBinaryOps(): Jsep;
		public static removeLiteral(literalName: string): Jsep;
		public static removeAllLiterals(): Jsep;

		public get char(): string;
		public get code(): string;
		
		public constructor(expression: Expression);

		public static parse(val: string | Expression) : Expression;
	}

	type jsepType = {
		(val: string | Expression): Expression;
	} & typeof Jsep;

	const jsep: jsepType;

	export default jsep;
}
