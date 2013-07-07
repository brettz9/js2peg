/*globals require */

/*
As defined per http://tools.ietf.org/html/rfc5234#section-4
see also: http://tools.ietf.org/html/rfc2616#section-2 and http://tools.ietf.org/html/rfc822#section-2
*/
(function () {
'use strict';

var 
    abnfRuleName, abnfRule, ignoreUpperCaseRuleNames = true,
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
    abnfRules = require('./rfc5234');


for (abnfRuleName in abnfRules) {

    if (ignoreUpperCaseRuleNames && abnfRuleName.match(/^[A-Z_$]$/)) {
        continue;
    }
    
    abnfRule = abnfRules[abnfRuleName];
    abnfRule = abnfRules[abnfRuleName] = Array.isArray(abnfRule)? abnfRule : [abnfRule];
    
    abnfRule.unshift(abnfRuleName + ':', '(');
    abnfRule.push(')');
    
    // Todo: fix to encapsulate if last item in array is a function or braced string
    abnfRule.push('{\n' +
        'var ret = {};\n' +
        'ret["' + abnfRuleName + '"] = ' + abnfRuleName + ';\n'+
        'return ret;\n' +
    '}');
    
}

// console.log(abnfRules.prose_val[6].toString());

parser = j2p.buildParser(abnfRules);
parsed = parser.parse(str);
console.log(j2p.output); // Can use this line instead of the next and then on command line, to pipe the PegJS grammar to a file, use: node label-peg.js > labeled-peg.pegjs
//console.log(JSON.stringify(parsed)); // node label-peg.js > labeled-peg-output.js


}());
