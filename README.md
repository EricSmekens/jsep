##jsep: JavaScript Expression Parser
jsep is a simple JavaScript expression parser written in JavaScript.It can parse JavaScript expressions but not operations. The difference between expressions and operations is akin to the difference between a cell in an Excel spreadsheet vs. a proper JavaScript program.

###Custom Build
While in the jsep project directory, run:

    npm install .
    make

The jsep built files will be in the build/ directory.

###Usage
####Client-side
    <script src="/PATH/TO/jsep.min.js" type="text/javascript"></script>
    ...
    var parse_tree = jsep("1 + 1");
####Node.JS
    var jsep = require("jsep");
    var parse_tree = jsep("1 + 1");

### License

See LICENSE file.

[jsep.from.so]: http://jsep.from.so/