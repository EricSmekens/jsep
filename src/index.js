// Add default plugins:
import jsep from './jsep.js';
import ternary from '../packages/ternary/src/index.js';

jsep.plugins.register(ternary);

export * from './jsep.js';
export default jsep;
