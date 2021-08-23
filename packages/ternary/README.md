[npm]: https://img.shields.io/npm/v/@jsep-plugin/ternary
[npm-url]: https://www.npmjs.com/package/@jsep-plugin/ternary
[size]: https://packagephobia.now.sh/badge?p=@jsep-plugin/ternary
[size-url]: https://packagephobia.now.sh/result?p=@jsep-plugin/ternary

[![npm][npm]][npm-url]
[![size][size]][size-url]

# @jsep-plugin/ternary

A JSEP plugin for adding ternary expression support. Allows expressions of the form:

```javascript
jsep('a ? 1 : 2');
```

## Install

```console
npm install @jsep-plugin/ternary
# or
yarn add @jsep-plugin/ternary
```

## Usage
```javascript
import jsep from 'jsep';
import jsepTernary from '@jsep-plugin/ternary';
jsep.plugins.register(jsepTernary);
```

## Meta

[LICENSE (MIT)](/LICENSE)
