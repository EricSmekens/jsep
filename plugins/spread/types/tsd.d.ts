import * as jsep from 'jsep';
import { Expression } from 'jsep';
export const name: string;
export function init(this: typeof jsep): void;

export interface SpreadElement extends Expression<'SpreadElement'> {
	type: 'ObjectExpression';
	argument: Expression;
}
