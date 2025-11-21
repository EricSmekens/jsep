declare module 'jsep' {

	namespace jsep {
		export type baseTypes = string | number | boolean | RegExp | null | undefined | object;
		export interface Expression {
			type: string;
			[key: string]: baseTypes | Expression | Array<baseTypes | Expression>;
		}

		export interface ArrayExpression extends Expression {
			type: 'ArrayExpression';
			/** The expression can be null in the case of array holes ([ , , ]) */
			elements: Array<null | Expression>;
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

		export interface SequenceExpression extends Expression {
			type: 'SequenceExpression';
			expressions: Expression[];
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
			optional?: boolean;
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
			| 'SequenceExpression'
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
			| SequenceExpression
			| ConditionalExpression
			| Identifier
			| Literal
			| MemberExpression
			| ThisExpression
			| UnaryExpression;

		export type PossibleExpression = Expression | undefined;

		export type jsepInstance = typeof jsep & ((val: string) => Expression | never);
		function parse(expr: string): Expression | never;
		function instance(): jsepInstance;
		function defaultConfig(): jsepInstance;
		function clearConfig(): jsepInstance;

		export interface HookScope {
			index: number;
			get expr(): string;
			get char(): string; // current character of the expression
			get code(): number; // current character code of the expression
			isDecimalDigit: (ch: number) => boolean;
			isIdentifierStart: (ch: number) => boolean;
			isIdentifierPart: (ch: number) => boolean;
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
			throwError: (msg: string) => never;
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
		let right_associative: Set<string>;
		let additional_identifier_chars: Set<string>;
		let literals: { [literal: string]: any };
		let this_str: string;

		function addBinaryOp(operatorName: string, precedence: number, rightToLeft?: boolean): jsepInstance;

		function addUnaryOp(operatorName: string): jsepInstance;

		function addLiteral(literalName: string, literalValue: any): jsepInstance;

		function addIdentifierChar(identifierName: string): jsepInstance;

		function removeBinaryOp(operatorName: string): jsepInstance;

		function removeUnaryOp(operatorName: string): jsepInstance;

		function removeLiteral(literalName: string): jsepInstance;

		function removeIdentifierChar(identifierName: string): jsepInstance;

		function removeAllBinaryOps(): jsepInstance;

		function removeAllUnaryOps(): jsepInstance;

		function removeAllLiterals(): jsepInstance;

		function removeAllIdentifierChars(): jsepInstance;

		const version: string;
	}

	function jsep(val: string): jsep.Expression | never;

	export = jsep;
}
