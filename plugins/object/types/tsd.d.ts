import * as jsep from 'jsep';
import { Expression } from 'jsep';
export const name: string;
export function init(this: typeof jsep): void;

export interface ObjectExpression extends Expression<'ObjectExpression'> {
	type: 'ObjectExpression';
	properties: Property[];
}

export interface Property extends Expression<'Property'> {
	type: 'Property';
	computed: boolean;
	key: Expression;
	shorthand: boolean;
	value?: Expression;
}
