import * as jsep from 'jsep';
import { Expression } from 'jsep';
export const name: string;
export function init(this: typeof jsep): void;

export interface ArrowExpression extends Expression {
	type: 'ArrowFunctionExpression';
	params: Expression[] | null;
	body: Expression;
	async?: boolean;
}

