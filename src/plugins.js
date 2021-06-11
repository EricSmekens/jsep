export default class Plugins {
	constructor(jsep) {
		this.jsep = jsep;
		this.plugins = {};
	}

	/**
	 * @callback PluginSetup
	 * @this {Jsep} jsep
	 * @returns: void
	 */
	/**
	 * Adds the given plugin to the registry
	 *
	 * @param {object} plugin
	 * @param {string} plugin.name The name of the plugin
	 * @param {PluginSetup} plugin.init The init function
	 * @public
	 */
	register(plugin) {
		if (typeof plugin !== 'object' || !plugin.name || !plugin.init) {
			throw new Error('Invalid JSEP plugin format');
		}
		if (this.plugins[plugin.name]) {
			// already registered. Ignore.
			return;
		}
		plugin.init(this.jsep);
		this.plugins[plugin.name] = plugin;
	}
}
