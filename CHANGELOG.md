## 1.0.0 - 2021-##-##
Rewrote to ESM, added a plugin system, and fixed numerous grammer issues

### Breaking Changes
- renamed `build` folder to `dist` (#130). The package file structure is now:
```
├── CHANGELOG.md
├── LICENSE
├── README.md
├── package.json
├── dist
│   ├── jsep.js
│   ├── jsep.min.js
│   ├── cjs
│   │   ├── jsep.cjs.js
│   │   ├── jsep.cjs.min.js
│   ├── iife
│   │   ├── jsep.iife.js
│   │   ├── jsep.iife.min.js
```
- Removed `LogicalExpression` and treat it as a `BinaryExpression` (#100)
- Call arguments must be either all comma-separated or all space-separated, but not mixed

### Added
- Added a plugin system, including plugins for
	- arrow expressions (`() => ...`)
	- assigment and update expressions (`a = 2`, `a++`)
	- comments (`/* .. */` and `// ...`)
	- new expressions (`new Date()`)
	- object expressions (`{a: 1, b}`)
	- regex support (`/123/ig`)
	- spread operator (`fn(...a)`, `[1, ...b]`, `{...c}`)
	- template expressions (`` `hi ${name}` ``, `` msg`hig ${name}` ``)

### Updated
- `(1, 2)` now returns a SequenceExpression instead of throwing an `Unclosed (` error
- moved the ConditionExpression (ternary) into a plugin, but it is still included by default

## 0.4.0 - 2021-03-21
### Added
- You can add or remove additional valid identifier chars.
- Support for gobble properties from array/strings. e.g. (`[1].length`)

### Updated
- Updated several dependancies for audit fixes.

## 0.3.5 - 2018-08-23
### Updated
- Development dependencies update for audit fixes.

## 0.3.4 - 2018-03-29
### Fixed
- Fixed identifiers as custom ops (#68,#83)

## 0.3.3 - 2017-12-16
### Notice
- No functional changes, only updated support for typescript definitions.
- There may be a few known issues, check the issue page for details.
### Changed
- Updated typings.
- Updated grunt-uglify for 0.03 kB smaller jsep.min.js! :)

## 0.3.2 - 2017-08-31
### Notice
First version that was using a CHANGELOG.md.

### Added
- Typings
- Functions to remove all binary/unary/etc. ops.

### Fixed
- Supports multiline expressions. 






