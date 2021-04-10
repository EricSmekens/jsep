## jsep: A Tiny JavaScript Expression Parser

[jsep](https://ericsmekens.github.io/jsep/) is a simple expression parser written in JavaScript. It can parse JavaScript expressions but not operations. The difference between expressions and operations is akin to the difference between a cell in an Excel spreadsheet vs. a proper JavaScript program.

### Why jsep?

I wanted a lightweight, tiny parser to be included in one of my other libraries. [esprima](http://esprima.org/) and other parsers are great, but had more power than I need and were *way* too large to be included in a library that I wanted to keep relatively small.

jsep's output is almost identical to [esprima's](http://esprima.org/doc/index.html#ast), which is in turn based on [SpiderMonkey's](https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API).

### Custom Build

First, install [Grunt](http://gruntjs.com/). While in the jsep project directory, run:

```bash
npm install .
grunt
```

The jsep built files will be in the build/ directory.

### Usage

#### Client-side

```javascript
<script src="/PATH/TO/jsep.min.js"></script>
...
let parse_tree = jsep("1 + 1");
```

#### Node.JS

First, run `npm install jsep`. Then, in your source file:

```javascript
let jsep = require("jsep");
let parse_tree = jsep("1 + 1");
```

#### Custom Operators

```javascript
// Add a custom ^ binary operator with precedence 10
jsep.addBinaryOp("^", 10);

// Add a custom @ unary operator
jsep.addUnaryOp('@');

// Remove a binary operator
jsep.removeBinaryOp(">>>");

// Remove a unary operator
jsep.removeUnaryOp("~");
```

#### Custom Identifiers

You can add or remove additional valid identifier chars. ('_' and '$' are already treated like this.)

```javascript
// Add a custom @ identifier
jsep.addIdentifierChar("@");

// Removes a custom @ identifier
jsep.removeIdentifierChar('@');
```

### Plugins
jsep supports defining custom hooks for extending or modifying the expression parsing.
All hooks are called with a single argument and return void.
The hook argument provides access to the internal parsing methods of jsep
to allow reuse as needed.

#### Hook Argument

```typescript
import { PossibleExpression } from 'jsep';

export interface HookScope {
	index: number;
	expr: string;
	exprI: string;
	exprICode: () => number;
	gobbleSpaces: () => void;
	gobbleExpression: () => Expression;
	gobbleBinaryOp: () => PossibleExpression;
	gobbleBinaryExpression: () => PossibleExpression;
	gobbleToken: () => PossibleExpression;
	gobbleNumericLiteral: () => PossibleExpression;
	gobbleStringLiteral: () => PossibleExpression;
	gobbleIdentifier: () => PossibleExpression;
	gobbleArguments: (number) => PossibleExpression;
	gobbleGroup: () => Expression;
	gobbleArray: () => PossibleExpression;
	throwError: (string) => void;
	nodes?: PossibleExpression[];
	node?: PossibleExpression;
}
```

#### Hook Types
* `before-all`: called just before starting all expression parsing
* `after-all`: called just before returning from parsing
* `gobble-expression`: called just before attempting to parse an expression
* `after-expression`: called just after parsing an expression
* `gobble-token`: called just before attempting to parse a token
* `after-token`: called just after parsing a token
* `gobble-spaces`: called when gobbling spaces

### How to add Hooks
```javascript
// single:
jsep.hooks.add('after-expression', function(env) {
	console.log('got expression', JSON.stringify(env.node, null, 2));
});
// last argument will add to the top of the array, instead of the bottom by default
jsep.hooks.add('after-all', () => console.log('done'), true);

// multi:
const myHooks = {
  'before-all': env => console.log(`parsing ${env.expr}`),
	'after-all': env => console.log(`found ${env.nodes.length} nodes`);
};
jsep.hooks.add(myHooks);
```

#### How to add plugins:
```javascript
const jsep = require('jsep');
const plugins = require('jsep/plugins');
plugins.forEach(p => p(jsep));
```

#### Optional Plugins:
* `arrowFunction`: Adds arrow-function support, `(a) => x`, `x => x`
* `assignment`: Adds support for assignment expressions
* `ignoreComments`: Adds support for ignoring comments: `// comment` and `/* comment */`
* `new`: Adds support for the `new` operator
* `object`: Adds support for object expressions
* `templateLiteral`: Adds support for template literals, `` `this ${value + `${nested}}` ``
* `ternary`: Built-in by default, adds support for ternary `a ? b : c` expressions

### License

jsep is under the MIT license. See LICENSE file.

### Thanks

Some parts of the latest version of jsep were adapted from the esprima parser.
