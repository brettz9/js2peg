/*globals require */

/*
As defined per http://tools.ietf.org/html/rfc5234#section-4
see also: http://tools.ietf.org/html/rfc2616#section-2 and http://tools.ietf.org/html/rfc822#section-2
*/
(function () {
'use strict';

var 
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
    //abnfRules = fs.readFileSync('./rfc5234.pegjs', 'utf8');
    abnfRules = require('./rfc5234');

abnfRules = require('./objectify-peg-results')(abnfRules);

// console.log(abnfRules.prose_val[6].toString());

parser = j2p.buildParser(abnfRules);

//parser = j2p.buildParser(abnfRules);
//console.log(JSON.stringify(abnfRules));

parsed = parser.parse(str);
//console.log(j2p.output); // Can use this line instead of the next and then on command line, to pipe the PegJS grammar to a file, use: node label-peg.js > labeled-peg.pegjs
//console.dir((parsed)); // node label-peg.js > labeled-peg-output.js

// Todo: iterate over parser to convert to PegJS

console.log(JSON.stringify(parsed));
console.dir((parsed));

}());
