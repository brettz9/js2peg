/*globals require, escape, unescape*/
(function () {
'use strict';

// INCOMPLETE: Recursion issues!

var $J = require('../js2peg'),
    str = 'myRule = "lit"\r\n',
    j2p = new $J(
        { // Optional configuration object
            sortRules: false,
            indent: 4,
            semicolons: true,
            parserOptions: {
                cache: false,
                trackLineAndColumn: true
            }
        }
    ),
    abnfRules = require('./rfc5234'),
    parser = j2p.buildParser(abnfRules),
    // parsed = parser.parse(str);
    parsed = parser.parse(str);

console.log(j2p.output); // Can use this line instead of the next and then on command line, to pipe the PegJS grammar to a file, use: node testABNF.js > abnf.pegjs
//console.log(JSON.stringify(parsed)); // node testABNF.js > abnf-output.js

}());