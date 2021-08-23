[npm]: https://img.shields.io/npm/v/@jsep-plugin/template
[npm-url]: https://www.npmjs.com/package/@jsep-plugin/template
[size]: https://packagephobia.now.sh/badge?p=@jsep-plugin/template
[size-url]: https://packagephobia.now.sh/result?p=@jsep-plugin/template

[![npm][npm]][npm-url]
[![size][size]][size-url]

# @jsep-plugin/template

A JSEP plugin for adding template literal expression support. Allows expressions of the form:

```javascript
jsep('`hi ${name}`');
jsep('msg`hi ${name}`');
```

## Install

```console
npm install @jsep-plugin/template
# or
yarn add @jsep-plugin/template
```

## Usage
```javascript
import jsep from 'jsep';
import jsepTemplateLiteral from '@jsep-plugin/template';
jsep.plugins.register(jsepTemplateLiteral);
```

## Meta

[LICENSE (MIT)](/LICENSE)
