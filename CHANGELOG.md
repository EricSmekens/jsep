## [1.1.2](https://github.com/EricSmekens/jsep/compare/v1.1.1...v1.1.2) (2021-10-17)


### Bug Fixes

* add missing `optional` property to types ([e2f758e](https://github.com/EricSmekens/jsep/commit/e2f758ea1a23675942e411d25629f01b6d45d867)), closes [#185](https://github.com/EricSmekens/jsep/issues/185)

## [1.1.1](https://github.com/EricSmekens/jsep/compare/v1.1.0...v1.1.1) (2021-10-13)


### Bug Fixes

* literal 'raw' value now matches input string ([432c514](https://github.com/EricSmekens/jsep/commit/432c51485d360e8d6db2b75d0296cd93a0277146)), closes [#192](https://github.com/EricSmekens/jsep/issues/192)

# [1.1.0](https://github.com/EricSmekens/jsep/compare/v1.0.3...v1.1.0) (2021-10-03)


### Features

* add optional chaining support (?.) ([56d1e3d](https://github.com/EricSmekens/jsep/commit/56d1e3daeba094a87b02432a8b6a5d3fecb1c4ed))

## [1.0.3](https://github.com/EricSmekens/jsep/compare/v1.0.2...v1.0.3) (2021-09-02)


### Bug Fixes

* firefox compatibility ([3e51523](https://github.com/EricSmekens/jsep/commit/3e51523ff56b69b08366356a9e5789873ed4f491)), closes [#178](https://github.com/EricSmekens/jsep/issues/178)

## 1.0.2 - 2021-08-26
Republish to include types.

## 1.0.1 - 2021-08-24
Fixed support for CommonJS modules. This is only a republish.

## 1.0.0 - 2021-08-22
Rewrote to ESM, added a plugin system, and fixed numerous grammar issues. For most standard use-cases, this release should not be a breaking change, as every effort was made to maintain compatibility.

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
- unary expressions with no argument now throw `missing unaryOp argument`
- binary expressions now require the left-hand side to exist
- conditional (ternary) expressions with no condition now throw `unexpected "?"`
- `.` now throws `unexpected .`
- `()()` now throws `unexpected "("`
- `a.this`, `a.true`, `a.false`, `a.null` now match esprima and treat the property as an identifier instead of a literal or ThisExpression

### Added
- Added a plugin system, including plugins for
    - arrow expressions (`() => ...`)
    - assigment and update expressions (`a = 2`, `a++`)
    - async/await (`await a.find(async (v1, v2) => await v1(v2))`)
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
