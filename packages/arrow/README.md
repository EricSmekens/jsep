[npm]: https://img.shields.io/npm/v/@jsep-plugin/arrow
[npm-url]: https://www.npmjs.com/package/@jsep-plugin/arrow
[size]: https://packagephobia.now.sh/badge?p=@jsep-plugin/arrow
[size-url]: https://packagephobia.now.sh/result?p=@jsep-plugin/arrow

[![npm][npm]][npm-url]
[![size][size]][size-url]

# @jsep-plugin/arrow

A JSEP plugin for adding arrow-function support. Allows expressions of the form:

```javascript
jsep('a.find(v => v === 1)');
jsep('a.map((v, i) => i)');
jsep('a.map(() => true)');
```

## Install

```console
npm install @jsep-plugin/arrow
# or
yarn add @jsep-plugin/arrow
```

## Usage
```javascript
import jsep from 'jsep';
import jsepArrow from '@jsep-plugin/arrow';
jsep.plugins.register(jsepArrow);
```

## Meta

[LICENSE (MIT)](/LICENSE)
