[npm]: https://img.shields.io/npm/v/@jsep-plugin/async-await
[npm-url]: https://www.npmjs.com/package/@jsep-plugin/async-await
[size]: https://packagephobia.now.sh/badge?p=@jsep-plugin/async-await
[size-url]: https://packagephobia.now.sh/result?p=@jsep-plugin/async-await

[![npm][npm]][npm-url]
[![size][size]][size-url]

# @jsep-plugin/async-await

A JSEP plugin for adding async/await support. Allows expressions of the form:

```javascript
jsep('await a');
jsep('await a.find(async (v1, v2) => await v1(v2))');
```

## Install

```console
npm install @jsep-plugin/async-await
# or
yarn add @jsep-plugin/async-await
```

## Usage
```javascript
import jsep from 'jsep';
import jsepAsyncAwait from '@jsep-plugin/async-await';
jsep.plugins.register(jsepAsyncAwait);
```

## Meta

[LICENSE (MIT)](/LICENSE)
