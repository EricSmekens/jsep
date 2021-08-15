[npm]: https://img.shields.io/npm/v/@jsep/plugin-comment
[npm-url]: https://www.npmjs.com/package/@jsep/plugin-comment
[size]: https://packagephobia.now.sh/badge?p=@jsep/plugin-comment
[size-url]: https://packagephobia.now.sh/result?p=@jsep/plugin-comment

[![npm][npm]][npm-url]
[![size][size]][size-url]

# @jsep/plugin-comment

A JSEP plugin for adding comment expression support. Allows expressions of the form:

```javascript
jsep('a = 2 // end of line comment');
jsep('a /* ignore this */ += 2');
jsep('a /* ignore \n this */ ++');
```

## Install

```console
npm install @jsep/plugin-comment
# or
yarn add @jsep/plugin-comment
```

## Usage
```javascript
import jsep from 'jsep';
import jsepComment from '@jsep/plugin-comment';
jsep.plugins.register(jsepComment);
```

## Meta

[LICENSE (MIT)](/LICENSE)
