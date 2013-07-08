/*globals require */
(function () {
'use strict';

var $J = require('../js2peg'),
    //str = 'my-Rule = "lit"\r\n',
    fs = require('fs'),
    //str = fs.readFileSync('./rfc5234.abnf', 'utf8').trim(),
    str = 'rulelist       =  1*( rule / (*c-wsp c-nl) ) ;\r\n',
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
    objectify = 
        // function (rules) {return rules;} || 
        require('./objectify-peg-results.js'),
    abnfRules = require('./rfc5234-transformed'),
    parser = j2p.buildParser(
        objectify(abnfRules, function addAction (ruleName) {
            if (ruleName === 'repetition') {
                return false;
            }
            return '{\n' +
                'return ' + ruleName + ';' +
                '}';
        }, function hasNoAction (ruleName, rule, rules) {
            var lastRulePart = rule[rule.length - 1],
                rulePartType = typeof lastRulePart;
            return true;
            // return ruleName !== 'repetition';
            return Array.isArray(rule) && rulePartType !== 'function' && (rulePartType !== 'string' || !lastRulePart.trim().match(/^[\s\)]\{[\s\S]*\}$/));
        }),
        function () {
            var $J = require('../../js2peg');
        }
    ),
    parsed = parser.parse(str, {reportRemaining: 0});

console.log(j2p.output); // Can use this line instead of the next and then on command line, to pipe the PegJS grammar to a file, use: node testABNF.js > abnf.pegjs
//console.log(JSON.stringify(parsed)); // node testABNF.js > abnf-output.js
//console.dir(parsed);

function flatten(arr) {
    return arr.reduce(function flatten(res, a) { 
        Array.isArray(a) ? a.reduce(flatten, res) : res.push(a);
        return res;
    }, []);
}

//console.log(flatten(parsed).join(''));

}());