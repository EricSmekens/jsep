import jsep from '../src/index.js';

import Benchmark from 'benchmark';

console.log('Starting performance test.');

const tests = [
	{name: 'simple string', value: '\'abc\''},
	{name: 'simple addition', value: '1+2'},
	{name: 'function call', value: 'a(b, c(d,e), f)'},
	{name: 'ternary', value: 'a ? b : c'}
];

const suite = new Benchmark.Suite;

tests.forEach((test) => {
	suite.add(test.name, () => {
		jsep(test.value);
	});
});

suite
	.on('cycle', function (event) {
		console.log(String(event.target));
	})
	.on('complete', function () {
		console.log('Performance test completed.');
	})
	.run({
		'async': true
	});
	