export default class Hooks {
	/**
	 * @callback HookCallback
	 * @this {*|Jsep} this
	 * @param {Jsep} env
	 * @returns: void
	 */
	/**
	 * Adds the given callback to the list of callbacks for the given hook.
	 *
	 * The callback will be invoked when the hook it is registered for is run.
	 *
	 * One callback function can be registered to multiple hooks and the same hook multiple times.
	 *
	 * @param {string|object} name The name of the hook, or an object of callbacks keyed by name
	 * @param {HookCallback|boolean} callback The callback function which is given environment variables.
	 * @param {?boolean} [first=false] Will add the hook to the top of the list (defaults to the bottom)
	 * @public
	 */
	add(name, callback, first) {
		if (typeof arguments[0] != 'string') {
			// Multiple hook callbacks, keyed by name
			for (let name in arguments[0]) {
				this.add(name, arguments[0][name], arguments[1]);
			}
		}
		else {
			(Array.isArray(name) ? name : [name]).forEach(function (name) {
				this[name] = this[name] || [];

				if (callback) {
					this[name][first ? 'unshift' : 'push'](callback);
				}
			}, this);
		}
	}

	/**
	 * Runs a hook invoking all registered callbacks with the given environment variables.
	 *
	 * Callbacks will be invoked synchronously and in the order in which they were registered.
	 *
	 * @param {string} name The name of the hook.
	 * @param {Object<string, any>} env The environment variables of the hook passed to all callbacks registered.
	 * @public
	 */
	run(name, env) {
		this[name] = this[name] || [];
		this[name].forEach(function (callback) {
			callback.call(env && env.context ? env.context : env, env);
		});
	}
}
