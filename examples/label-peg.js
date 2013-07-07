/*globals require */

/*
As defined per http://tools.ietf.org/html/rfc5234#section-4
see also: http://tools.ietf.org/html/rfc2616#section-2 and http://tools.ietf.org/html/rfc822#section-2
*/
(function () {
'use strict';

require('pegjs-require');
var 
    pegRuleName, pegRule, ignoreUpperCaseRuleNames = true,
    parser, parsed,
    $J = require('../js2peg'),
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
    pegRules = require('./peg-src/parser.pegjs');


for (pegRuleName in pegRules) {

    if (ignoreUpperCaseRuleNames && pegRuleName.match(/^[A-Z_$]$/)) {
        continue;
    }
    
    pegRule = pegRules[pegRuleName];
    pegRule = pegRules[pegRuleName] = Array.isArray(pegRule)? pegRule : [pegRule];
    
    pegRule.unshift(pegRuleName + ':', '(');
    pegRule.push(')');
    
    // Todo: fix to encapsulate if last item in array is a function or braced string
    pegRule.push('{\n' +
        'var ret = {};\n' +
        'ret["' + pegRuleName + '"] = ' + pegRuleName + ';\n'+
        'return ret;\n' +
    '}');
    
}

// console.log(pegRules.prose_val[6].toString());

parser = j2p.buildParser(pegRules);
parsed = parser.parse(str);
console.log(j2p.output); // Can use this line instead of the next and then on command line, to pipe the PegJS grammar to a file, use: node label-peg.js > labeled-peg.pegjs
//console.log(JSON.stringify(parsed)); // node label-peg.js > labeled-peg-output.js


}());
