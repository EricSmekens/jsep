## jsep: A Tiny JavaScript Expression Parser

[jsep](https://ericsmekens.github.io/jsep/) is a simple expression parser written in JavaScript. It can parse JavaScript expressions but not operations. The difference between expressions and operations is akin to the difference between a cell in an Excel spreadsheet vs. a proper JavaScript program.

### Why jsep?

I wanted a lightweight, tiny parser to be included in one of my other libraries. [esprima](http://esprima.org/) and other parsers are great, but had more power than I need and were *way* too large to be included in a library that I wanted to keep relatively small.

jsep's output is almost identical to [esprima's](http://esprima.org/doc/index.html#ast), which is in turn based on [SpiderMonkey's](https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API).

### Custom Build

While in the jsep project directory, run:

```bash
npm install
npm run default
```

The jsep built files will be in the build/ directory.

### Usage

#### Client-side

```html
<script type="module">
  import jsep from '/PATH/TO/jsep.min.js';
  const parsed = jsep('1 + 1');
</script>

<script src="/PATH/TO/jsep.iife.min.js"></script>
  ...
let parse_tree = jsep("1 + 1");
```

#### Node.JS

First, run `npm install jsep`. Then, in your source file:

```javascript
// ESM:
import jsep from 'jsep';
const parse_tree = jsep('1 + 1');

// or:
import { Jsep } from 'jsep';
const parse_tree = Jsep.parse('1 + 1');


// CJS:
const jsep = require('jsep').default;
const parsed = jsep('1 + 1');

// or:
const { Jsep } = require('jsep');
const parse_tree = Jsep.parse('1 + 1');
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
JSEP supports defining custom hooks for extending or modifying the expression parsing.
Plugins are registered by calling `jsep.plugins.register()` with the plugin(s) as the argument(s).

#### JSEP-provided plugins:
* `jsepTernary`: Built-in by default, adds support for ternary `a ? b : c` expressions
* `jsepComment`: Adds support for ignoring comments: `a /* ignore this */ > 1 // ignore this too`
* `jsepNew`: Adds 'new' keyword support: `new Date()`
* `jsepObject`: Adds object expression support: `{ a: 1, b: { c }}`

#### How to add plugins:
Plugins have a `name` property so that they can only be registered once.
Any subsequent registrations will have no effect. Add a plugin by registering it with JSEP:

```javascript
import jsep from 'jsep';
import ternary from 'jsep/plugins/jsepTernary.js';
import object from 'jsep/plugins/jsepObject.js';
jsep.plugins.register(object);
jsep.plugins.register(ternary, object);
```

#### List plugins:
Plugins are stored in an object, keyed by their name.
They can be retrieved through `jsep.plugins.registered`.

#### Writing Your Own Plugin:
Plugins are objects with two properties: `name` and `init`.
Here's a simple plugin example:
```javascript
const plugin = {
  name: 'the plugin',
	init(jsep) {
    jsep.addAdentifierChar('@');
    jsep.hooksAdd('after-expression', function myPlugin(env) {
      if (this.char === '@') {
        env.node = null;
			}
		});
	},
};
```

##### Hooks
Most plugins will make use of hooks to modify the parsing behavior of jsep.
All hooks are bound to the jsep instance, are called with a single argument, and return void.
The `this` context provides access to the internal parsing methods of jsep
to allow reuse as needed. Some hook types will pass an object that allows reading/writing
the `node` property as needed.

##### Hook Types
* `before-all`: called just before starting all expression parsing.
* `after-all`: called after parsing all. Read/Write `arg.node` as required.
* `gobble-expression`: called just before attempting to parse an expression. Set `arg.node` as required.
* `after-expression`: called just after parsing an expression. Read/Write `arg.node` as required.
* `gobble-token`: called just before attempting to parse a token. Set `arg.node` as required.
* `after-token`: called just after parsing a token. Read/Write `arg.node` as required.
* `gobble-spaces`: called when gobbling whitespace.

##### The `this` context of Hooks
```typescript
export interface HookScope {
    index: number;
    expr: string;
    char: string; // current character of the expression
    code: number; // current character code of the expression
    gobbleSpaces: () => void;
    gobbleExpressions: (number?) => Eexpression[];
    gobbleExpression: () => Expression;
    gobbleBinaryOp: () => PossibleExpression;
    gobbleBinaryExpression: () => PossibleExpression;
    gobbleToken: () =>  PossibleExpression;
    gobbleNumericLiteral: () => PossibleExpression;
    gobbleStringLiteral: () => PossibleExpression;
    gobbleIdentifier: () => PossibleExpression;
    gobbleArguments: (number) => PossibleExpression;
    gobbleGroup: () => Expression;
    gobbleArray: () => PossibleExpression;
    throwError: (string) => void;
}
```

### License

jsep is under the MIT license. See LICENSE file.

### Thanks

Some parts of the latest version of jsep were adapted from the esprima parser.
