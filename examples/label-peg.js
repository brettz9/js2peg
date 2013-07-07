/*globals require */

/*
As defined per http://tools.ietf.org/html/rfc5234#section-4
see also: http://tools.ietf.org/html/rfc2616#section-2 and http://tools.ietf.org/html/rfc822#section-2
*/
(function () {
'use strict';

var 
    pegRuleName, pegRule, ignoreUpperCaseRuleNames = true,
    parser, parsed,
    peg = require('../../pegjs'),
    overrideAction = require('pegjs-override-action'),
    fs = require('fs'),
    $J = require('../js2peg'),
    str = 'myRule = "lit"\r\nmyRule2 = "lit2"\r\n',
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
    pegRules = fs.readFileSync('./peg-src/parser.pegjs', 'utf8');

parser = peg.buildParser(pegRules, {
    plugins: [overrideAction],
    overrideActionPlugin: {
  /*      rules: function (ast, options) {
//            console.dir((ast.rules[1]));
            return ast.rules.map(function () {
                return 'aaaa';
            });
        }*/
    }
});

parsed = parser.parse(str);
//console.log(j2p.output); // Can use this line instead of the next and then on command line, to pipe the PegJS grammar to a file, use: node label-peg.js > labeled-peg.pegjs
console.log(console.dir(parsed)); // node label-peg.js > labeled-peg-output.js


}());
