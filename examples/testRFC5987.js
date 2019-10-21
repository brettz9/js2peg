/*globals require */
(function () {
'use strict';

var $J = require('../js2peg'),
  query = '//b',
  rfc5987 = require('./rfc5987-utils'),
  str = rfc5987.encodeValueChars(query),
  // str = 'query*=UTF-8\'\'' + rfc5987.encodeValueChars(query),
  j2p = new $J(
    { // Optional configuration object
      semicolons: true,
      indent: 4,
      parserOptions: {
        cache: false,
        trackLineAndColumn: true
      }
    }
  ),
  rfc5987ParameterRules = require('./rfc5987'),
  parser = j2p.buildParser(rfc5987ParameterRules),
  // parsed = parser.parse(str);
  parsed = parser.parse(str, 'value_chars');

// console.log(j2p.output); // Can use this line instead of the next and then on command line, to pipe the PegJS grammar to a file, use: node testRFC5987.js > rfc5987.pegjs
console.log(parsed); // node testRFC5987.js > rfc5987-output.js

}());
