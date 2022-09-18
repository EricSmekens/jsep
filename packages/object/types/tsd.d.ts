import * as jsep from 'jsep';
import { Expression, IPlugin } from 'jsep';
export const name: string;
export function init(this: typeof jsep): void;

export interface ObjectExpression extends Expression {
	type: 'ObjectExpression';
	properties: Property[];
}

export interface Property extends Expression {
	type: 'Property';
	computed: boolean;
	key: Expression;
	shorthand: boolean;
	value?: Expression;
}

declare const _export: IPlugin;
export default _export;
