[npm]: https://img.shields.io/npm/v/@jsep-plugin/numbers
[npm-url]: https://www.npmjs.com/package/@jsep-plugin/numbers
[size]: https://packagephobia.now.sh/badge?p=@jsep-plugin/numbers
[size-url]: https://packagephobia.now.sh/result?p=@jsep-plugin/numbers

[![npm][npm]][npm-url]
[![size][size]][size-url]

# @jsep-plugin/numbers

A JSEP plugin for adding support for additional number formats, hexadecimal, binary and octal.
It also adds support to ignore _ characters in numbers 

```javascript
jsep('0xA'); // hexadecimal (10)  
jsep('0b01001010'); // binary (74)
jsep('0644'); // octal (420)
jsep('0o644'); // octal (420)
jsep('115_200'); // decimal (115200)
```

## Install

```console
npm install @jsep-plugin/numbers
# or
yarn add @jsep-plugin/numbers
```

## Usage
```javascript
import jsep from 'jsep';
import jsepNumbers from '@jsep-plugin/numbers';
jsep.plugins.register(jsepNumbers);
```

## Meta

[LICENSE (MIT)](/LICENSE)
