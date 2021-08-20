import * as jsep from 'jsep';
import { Expression } from 'jsep';
export const name: string;
export function init(this: typeof jsep): void;

export interface AwaitExpression extends Expression<'AwaitExpression'> {
	type: 'AwaitExpression';
	argument: Expression;
}
