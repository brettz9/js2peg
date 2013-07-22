/*globals require */
(function () {
'use strict';

var peg = require('../../pegjs'),
    fs = require('fs'),
    str = fs.readFileSync('./rfc5234.abnf', 'utf8').trim(),
    parser = peg.buildParser(
        String(fs.readFileSync('./rfc5234-labeled-2.pegjs')),
        { // Optional configuration object
            cache: false,
            trackLineAndColumn: true
        }
    ),
    parsed = parser.parse(str, {reportRemaining: 0});

console.log(parsed);

}());
