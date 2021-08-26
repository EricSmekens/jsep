import * as jsep from 'jsep';
import { Expression } from 'jsep';
export const name: string;
export function init(this: typeof jsep): void;

export interface UpdateExpression extends Expression {
	type: 'UpdateExpression';
	operator: '++' | '--';
	argument: Expression;
	prefix: boolean;
}

export interface AssignmentExpression extends Expression {
	type: 'AssignmentExpression';
	operator: '='
		| '*='
		| '**='
		| '/='
		| '%='
		| '+='
		| '-='
		| '<<='
		| '>>='
		| '>>>='
		| '&='
		| '^='
		| '|=';
	left: Expression;
	right: Expression;
}
