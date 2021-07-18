export default class Plugins {
	constructor(jsep) {
		this.jsep = jsep;
		this.registered = {};
	}

	/**
	 * @callback PluginSetup
	 * @this {Jsep} jsep
	 * @returns: void
	 */
	/**
	 * Adds the given plugin(s) to the registry
	 *
	 * @param {object} plugins
	 * @param {string} plugins.name The name of the plugin
	 * @param {PluginSetup} plugins.init The init function
	 * @public
	 */
	register(...plugins) {
		plugins.forEach((plugin) => {
			if (typeof plugin !== 'object' || !plugin.name || !plugin.init) {
				throw new Error('Invalid JSEP plugin format');
			}
			if (this.registered[plugin.name]) {
				// already registered. Ignore.
				return;
			}
			plugin.init(this.jsep);
			this.registered[plugin.name] = plugin;
		});
	}
}
