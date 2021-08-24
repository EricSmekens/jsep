[npm]: https://img.shields.io/npm/v/@jsep-plugin/new
[npm-url]: https://www.npmjs.com/package/@jsep-plugin/new
[size]: https://packagephobia.now.sh/badge?p=@jsep-plugin/new
[size-url]: https://packagephobia.now.sh/result?p=@jsep-plugin/new

[![npm][npm]][npm-url]
[![size][size]][size-url]

# @jsep-plugin/new

A JSEP plugin for adding `new` expression support. Allows expressions of the form:

```javascript
jsep('new Date()');
jsep('new RegExp("^\d+$")');
```

## Install

```console
npm install @jsep-plugin/new
# or
yarn add @jsep-plugin/new
```

## Usage
```javascript
import jsep from 'jsep';
import jsepNew from '@jsep-plugin/new';
jsep.plugins.register(jsepNew);
```

## Meta

[LICENSE (MIT)](/LICENSE)
