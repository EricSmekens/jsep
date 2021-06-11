import Plugins from '../src/plugins.js';

const { test } = QUnit;

(function () {
	QUnit.module('Plugins', (qunit) => {
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

		QUnit.module('Register', (qunit) => {
			let plugins;
			qunit.beforeEach(() => {
				plugins = new Plugins({ fake: 'jsep' });
			});

			test('should register plugin with init', (assert) => {
				let init;
				const plugin = { name: 'plugin', init: jsep => init = jsep };
				plugins.register(plugin);
				assert.equal(init.fake, 'jsep');
			});

			test('should be okay with duplicate registration and not call init again', (assert) => {
				const plugin = { name: 'plugin', init: () => {} };
				plugins.register(plugin);
				plugin.init = () => {
					throw new Error('second init');
				};
				plugins.register(plugin);
				assert.equal(Object.keys(plugins.plugins).length, 1);
			});

			test('should throw on invalid plugin argument', (assert) => {
				[
					'noObject',
					[],
					1,
					null,
					{ bad: 'object' },
					{ name: '', init: () => {} },
					{ name: 'fake' },
					{ init: () => {} },
				].forEach(arg => assert.throws(() => plugins.register(arg)));
			});
		});
	});
}());
