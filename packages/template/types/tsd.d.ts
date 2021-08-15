import * as jsep from 'jsep';
import { Expression } from 'jsep';
export const name: string;
export function init(this: typeof jsep): void;

export interface TaggedTemplateExpression extends Expression<'TaggedTemplateExpression'> {
	type: 'TaggedTemplateExpression';
	readonly tag: Expression;
	readonly quasi: TemplateLiteral;
}

export interface TemplateElement extends Expression<'TemplateElement'> {
	type: 'TemplateElement';
	value: { cooked: string; raw: string };
	tail: boolean;
}

export interface TemplateLiteral extends Expression<'TemplateLiteral'> {
	type: 'TemplateLiteral';
	quasis: TemplateElement[];
	expressions: Expression[];
}
