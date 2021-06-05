import Hooks from '../src/hooks.js';

const { test } = QUnit;

(function () {
	QUnit.module('Hooks', (qunit) => {
		let callbacks;
		const callbackGenerator = (name) => {
			callbacks[name] = [];
			return (env) => {
				callbacks[name].push(env);
			};
		};
		qunit.beforeEach(() => {
			callbacks = {};
		});

		QUnit.module('Add', (qunit) => {
			let hooks;
			qunit.beforeEach(() => {
				hooks = new Hooks();
			});

			test('should initialize without any hooks', (assert) => {
				assert.equal(Object.getOwnPropertyNames(hooks).length, 0);
			});

			test('should add a hook by string/callback to the class properties', (assert) => {
				hooks.add('test', callbackGenerator('test'));
				assert.equal(Object.getOwnPropertyNames(hooks).length, 1);
				assert.equal(hooks.test.length, 1);
				hooks.test[0]('env');
				assert.equal(callbacks.test.length, 1);
				assert.equal(callbacks.test[0], 'env');
			});

			test('should add by object', (assert) => {
				hooks.add({
					test: callbackGenerator('test'),
					play: callbackGenerator('play'),
				});
				hooks.test[0]('testing');
				hooks.play[0]('playing');
				assert.equal(callbacks.test.length, 1);
				assert.equal(callbacks.test[0], 'testing');
				assert.equal(callbacks.play.length, 1);
				assert.equal(callbacks.play[0], 'playing');
			});

			test('should add hooks by string/callback with \'first\' property set', (assert) => {
				hooks.add('play', env => env.push('first'));
				hooks.add('play', env => env.push('second'), true);
				assert.equal(hooks.play.length, 2);

				const arr = [];
				hooks.play[0](arr);
				hooks.play[1](arr);
				assert.equal(arr.length, 2);
				assert.equal(arr[0], 'second');
				assert.equal(arr[1], 'first');
			});

			test('should add hooks by object with \'first\' property set', (assert) => {
				hooks.add({
					play: env => env.push('firstPlay'),
				}, false);
				hooks.add({
					play: env => env.push('secondPlay'),
				}, true);

				assert.equal(hooks.play.length, 2);

				const arr = [];
				hooks.play[0](arr);
				hooks.play[1](arr);
				assert.equal(arr.length, 2);
				assert.equal(arr[0], 'secondPlay');
				assert.equal(arr[1], 'firstPlay');
			});
		});

		QUnit.module('run', (qunit) => {
			let hooks;
			let env;
			qunit.beforeEach(() => {
				hooks = new Hooks();
				hooks.add('play', env => env.play.push('first'));
				hooks.add('play', env => env.play.push('second'));
				env = {
					play: [],
				};
			});

			test('should run hooks in order with given env', (assert) => {
				hooks.run('play', env);
				assert.equal(env.play.length, 2);
				assert.equal(env.play[0], 'first');
				assert.equal(env.play[1], 'second');
			});

			test('should be okay with no runners for a hook', (assert) => {
				hooks.run('working', env);
				assert.equal(env.play.length, 0);
				assert.equal(hooks.working.length, 0);
			});

			test('should use context property for \'this\' if it exists', (assert) => {
				hooks.add('playing', function (env) {
					env.play.push('env');
					this.push('this');
				});
				env.context = env.play;
				hooks.run('playing', env);
				assert.equal(env.play.length, 2);
				assert.equal(env.play[0], 'env');
				assert.equal(env.play[1], 'this');
			});
		});
	});
}());
