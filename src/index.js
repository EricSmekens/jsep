// Add default plugins:
import jsep from './jsep.js';
import ternary from './plugins/ternary.js';

jsep.plugins.register(ternary);

export * from './jsep.js';
export default jsep;
