/*globals require */
(function () {
'use strict';

var $J = require('../js2peg'),
    //str = 'my-Rule = "lit"\r\n',
    fs = require('fs'),
    str = fs.readFileSync('./rfc5234.abnf', 'utf8').trim(),
    //str = 'rulelist       =  1*( rule / (*c-wsp c-nl) ) ;\r\n',
    j2p = new $J(
        { // Optional configuration object
            sortRules: false,
            indent: 4,
            semicolons: true,
            logPreParsingOutput: true,
            parserOptions: {
                cache: false,
                trackLineAndColumn: true
            }
        }
    ),
    objectify = 
        // function (rules) {return rules;} || 
        require('./objectify-peg-results.js'),

    // We load the dynamic RFC and then use "objectify" to further enhance it (so that rule name-aware actions (to stringify array results) can be automatically added to most rules)
    abnfRules = require('./rfc5234-transformed'),
    parser = j2p.buildParser(
        objectify(abnfRules,
            function addAction (ruleName) {
                if (ruleName === 'repetition' || ruleName === 'element') {
                    return false;
                }
                return '{\n' +
                    //'console.log(Array.isArray(' + ruleName + ') ? "' + ruleName + '": false);' +
                    // 'console.log("' + ruleName + '" + "===" + typeof ' + ruleName + ' + "+++" + ' + ruleName + ' + "\\n");' +
                    // 'console.log("---" + "' + ruleName + '" + "[" + (Array.isArray(' + ruleName + ')) + "]" + (Array.isArray(' + ruleName + ') ? flatten(' + ruleName + ').join(\'\') : ' + ruleName+ '));' +
                    'return Array.isArray(' + ruleName + ') ? flatten(' + ruleName + ').join(\'\') : ' + ruleName+ ';' +
                '}';
            },
            function hasNoAction (ruleName, rule, rules) {
                var lastRulePart = rule[rule.length - 1],
                    rulePartType = typeof lastRulePart;
                return true;
                //return ruleName === 'repetition' ? true : false;
                //return ruleName !== 'element';
                // return ruleName !== 'repetition';
                return Array.isArray(rule) && rulePartType !== 'function' && (rulePartType !== 'string' || !lastRulePart.trim().match(/^[\s\)]\{[\s\S]*\}$/));
            }
        ),
        function () {
            'use strict';
            var _dummySeparator = '\x00';

            function _repeat (ct, str) {
                return new Array(ct + 1).join(str || ' ');
            }

            function range (item, min, max) {
                var isMax = max && !isNaN(max);
                min = min || 0;

                var ret = (
                    (min ? _repeat(min, _dummySeparator + item) : (isMax ? '' : item)) + _dummySeparator +
                        (isMax ?
                            (
                                _repeat(max - min, '(' + _dummySeparator + item) + _dummySeparator +
                                _repeat(max - min, '?' + _dummySeparator + ')' + _dummySeparator)
                            ) :
                            (' ' + (min ? '+' : '*')))
                ).replace(new RegExp(_dummySeparator + '$'), '').split(_dummySeparator);

                return ret.join(' ');
            }

            function flatten(arr) {
                return arr.reduce(function flatten(res, a) {
                    Array.isArray(a) ? a.reduce(flatten, res) : res.push(a);
                    return res;
                }, []);
            }
        }
    ),
    parsed = parser.parse(str, {reportRemaining: 0});
//console.log(j2p.output); // Can use this line instead of the next and then on command line, to pipe the PegJS grammar to a file, use: node testABNF.js > abnf.pegjs
//console.log(JSON.stringify(parsed)); // node testABNF.js > abnf-output.js
//console.dir(parsed);

/*
function flatten(arr) {
    return arr.reduce(function flatten(res, a) { 
        Array.isArray(a) ? a.reduce(flatten, res) : res.push(a);
        return res;
    }, []);
}
*/

console.log(parsed);

// console.log(flatten(parsed).join(''));
// console.log(JSON.stringify(parsed.start.rulelist[0].rule[2].elements[0].alternation[0].concatenation[0]));

}());
