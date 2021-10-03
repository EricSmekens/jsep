[npm]: https://img.shields.io/npm/v/@jsep-plugin/object
[npm-url]: https://www.npmjs.com/package/@jsep-plugin/object
[size]: https://packagephobia.now.sh/badge?p=@jsep-plugin/object
[size-url]: https://packagephobia.now.sh/result?p=@jsep-plugin/object

[![npm][npm]][npm-url]
[![size][size]][size-url]

# @jsep-plugin/object

A JSEP plugin for adding object expression support. Allows expressions of the form:

```javascript
jsep('{ a: 1, b: { c }}[d]');
```

## Install

```console
npm install @jsep-plugin/object
# or
yarn add @jsep-plugin/object
```

## Usage
```javascript
import jsep from 'jsep';
import jsepObject from '@jsep-plugin/object';
jsep.plugins.register(jsepObject);
```

## Meta

[LICENSE (MIT)](/LICENSE)
