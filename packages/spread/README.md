[npm]: https://img.shields.io/npm/v/@jsep/plugin-spread
[npm-url]: https://www.npmjs.com/package/@jsep/plugin-spread
[size]: https://packagephobia.now.sh/badge?p=@jsep/plugin-spread
[size-url]: https://packagephobia.now.sh/result?p=@jsep/plugin-spread

[![npm][npm]][npm-url]
[![size][size]][size-url]

# @jsep/plugin-spread

A JSEP plugin for adding spread expression support. Allows expressions of the form:

```javascript
jsep('fn(1, ...a)');
jsep('{ ...a }');
jsep('[...a]');
```

## Install

```console
npm install @jsep/plugin-spread
# or
yarn add @jsep/plugin-spread
```

## Usage
```javascript
import jsep from 'jsep';
import jsepSpread from '@jsep/plugin-spread';
jsep.plugins.register(jsepSpread);
```

## Meta

[LICENSE (MIT)](/LICENSE)
