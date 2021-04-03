# JSEP Contributing Guide

## Code style

Please follow the code style of the rest of the project.
This is enforced via ESLint, whose config is [here](.eslintrc.json).
You can run `npm run lint` before committing to ensure your code does not violate the code style,
or -- better -- install an ESLint plugin for your editor, to see issues inline as you edit code.

Here are the rules in the ESLint file with some commentary about what they are (since JSON does not allow comments):

| Rule | Code | What it does |
| ---- | ---- | ------------ |
| [semi](https://eslint.org/docs/rules/semi) | `"semi": 1` | Mandatory semicolons |
| [no-dupe-args](https://eslint.org/docs/rules/no-dupe-args) | `"no-dupe-args": 1` | no duplicate parameter names in function declarations or expressions |
| [no-dupe-keys](https://eslint.org/docs/rules/no-dupe-keys) | `"no-dupe-keys": 1` | no duplicate keys in object literals |
| [no-unreachable](https://eslint.org/docs/rules/no-unreachable) | `"no-unreachable": 1` | no unreachable code after `return`, `throw`, `continue`, and `break` statements. |
| [valid-typeof](https://eslint.org/docs/rules/valid-typeof) | `"valid-typeof": 1` | enforces comparing typeof expressions to valid string literals |
| [curly](https://eslint.org/docs/rules/curly) | `"curly": 1` | No block statements without curly braces |
| [no-useless-call](https://eslint.org/docs/rules/no-useless-call) | `"no-useless-call": 1` | No useless `function.call()` or `.apply()` when it can be replaced with a regular function call |
| [brace-style](https://eslint.org/docs/rules/brace-style) | `"brace-style": [1,"stroustrup"]` | Stroustrup variant of _one true brace style_: `{` on the same line, `}` on its own line, `else`/`catch`/`finally` on separate lines |
| [no-mixed-spaces-and-tabs](https://eslint.org/docs/rules/no-mixed-spaces-and-tabs) | `"no-mixed-spaces-and-tabs": [1,"smart-tabs"]` | Tabs for indentation, spaces for alignment, no mixed spaces and tabs otherwise |
| [spaced-comment](https://eslint.org/docs/rules/spaced-comment) | `"spaced-comment": [1,"always",{"block":{"exceptions":["*"]}}]` | Mandatory space after `//` and `/*` |
| [arrow-spacing](https://eslint.org/docs/rules/arrow-spacing) | `"arrow-spacing": 1` | Spacing around `=>` |
| [comma-spacing](https://eslint.org/docs/rules/comma-spacing) | `"comma-spacing": 1` | Enforce spacing after comma, and not before |
| [keyword-spacing](https://eslint.org/docs/rules/keyword-spacing) | `"keyword-spacing": 1` | Spacing around keywords |

<!--
Table rows generated via running this in the console:
let r = {...}; // rules
let o = []; for (let i in r) {
    o.push(`| [${i}](https://eslint.org/docs/rules/${i}) | \`"${i}": ${JSON.stringify(r[i])}\` |  |`)
}; copy(o.join("\n"));
-->
