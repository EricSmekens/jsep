import * as jsep from 'jsep';
import { Expression, IPlugin } from 'jsep';
export const name: string;
export function init(this: typeof jsep): void;

export interface AwaitExpression extends Expression {
	type: 'AwaitExpression';
	argument: Expression;
}

declare const _export: IPlugin;
export default _export;
