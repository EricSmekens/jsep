// Add default plugins:
import jsep from './jsep.js';
import ternary from './plugins/jsepTernary.js';

jsep.plugins.register(ternary);

export * from './jsep.js';
export default jsep;
