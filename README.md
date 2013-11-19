##jsep: A JavaScript Expression Parser
[jsep](http://jsep.from.so/) jsep is a simple expression parser written in JavaScript. It can parse JavaScript expressions but not operations. The difference between expressions and operations is akin to the difference between a cell in an Excel spreadsheet vs. a proper JavaScript program.

###Why jsep?
I wanted a lightweight, tiny parser to be included in one of my other libraries. [esprima](http://esprima.org/) and other parsers are great, but had more power than I need and were *way* too large to be included in a library that I wanted to keep relatively small.

###Custom Build
First, install [Grunt](http://gruntjs.com/). While in the jsep project directory, run:

    npm install .
    grunt

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


###Thanks
Some parts of the latest version of jsep were adapted from the esprima parser.
