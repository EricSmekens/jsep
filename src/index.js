// Add default plugins:
import jsep from './jsep.js';
import ternary from '../packages/ternary/src/index.js';

// NOTE: jsep has historically included ternary support, which was later moved into a plugin
// to include ternary in the "defaultConfig()" method, it needs to be specially added to Jsep
jsep.registerTernary(ternary);

export const Jsep = jsep;
export default jsep;
