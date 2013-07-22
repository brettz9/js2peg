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
    // We load the dynamic RFC and then further enhance it (so that rule name-aware actions (to stringify array results) can be automatically added to most rules)
    abnfRules = require('./rfc5234-transformed'),
    parser = j2p.buildParser(
        abnfRules,
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
        },
        function (output, ruleName) {
            if (['repetition', 'char_val', 'element'].indexOf(ruleName) > -1) {
                return output;
            }
            return '$(' + output + ')';
        }
    ),
    parsed = parser.parse(str, {reportRemaining: 0});

console.log(parsed);

}());
