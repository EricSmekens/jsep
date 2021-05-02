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
import { Jsep } from '/PATH/TO/jsep.min.js';
const parsed = Jsep.parse('1 + 1');
</script>
```

#### Node.JS

First, run `npm install jsep`. Then, in your source file:

```javascript
// ESM:
import { Jsep } from 'jsep';
const parse_tree = Jsep.parse('1 + 1');

// or:
import jsep from 'jsep';
const parse_tree = jsep('1 + 1');


// CJS:
const { Jsep } = require('jsep');
const parse_tree = Jsep.parse('1 + 1');

// or: (NOTE: versions prior to 1.x didn't require `.default`)
const jsep = require('jsep').default;
const parsed = jsep('1 + 1');
```

#### Custom Operators

```javascript
// Add a custom ^ binary operator with precedence 10
Jsep.addBinaryOp("^", 10);

// Add a custom @ unary operator
Jsep.addUnaryOp('@');

// Remove a binary operator
Jsep.removeBinaryOp(">>>");

// Remove a unary operator
Jsep.removeUnaryOp("~");
```

#### Custom Identifiers

You can add or remove additional valid identifier chars. ('_' and '$' are already treated like this.)

```javascript
// Add a custom @ identifier
Jsep.addIdentifierChar("@");

// Removes a custom @ identifier
Jsep.removeIdentifierChar('@');
```

### License

jsep is under the MIT license. See LICENSE file.

### Thanks

Some parts of the latest version of jsep were adapted from the esprima parser.
