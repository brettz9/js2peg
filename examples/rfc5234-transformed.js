/*globals require, module */

/*
As defined per http://tools.ietf.org/html/rfc5234#section-4
see also: http://tools.ietf.org/html/rfc2616#section-2 and http://tools.ietf.org/html/rfc822#section-2
*/

var $J = require('../js2peg');

module.exports = {
    start: 'rulelist',

    // Core Rules (from http://tools.ietf.org/html/rfc5234#appendix-B.1 )
    ALPHA: /[a-z]/i, // [/[\x41-\x5A]/, '/', /[\x61-\x7A]/]
    BIT: ['"0"', '/', '"1"'],
    CHAR: /[\x01-\x7F]/, // any 7-bit US-ASCII character, excluding NUL
    CR: '"\\x0D"', // carriage return
    CRLF: ['CRLF:', '(', 'CR', 'LF', ')', function (CRLF) {
        return '\n';
    }], // Internet standard newline
    CTL: /[\x00-\x1F\x7F]/, // controls
    DIGIT: /[0-9]/, // /[\x30-\x39]/
    DQUOTE: '"\\x22"', // " (Double Quote)
    HEXDIG: ['DIGIT', '/', {expr: ' '}, $J.orStrings('A', 'B', 'C', 'D', 'E', 'F')],
    HTAB: '"\t"', // '"\x09"', // horizontal tab
    LF: '"\\n"', // '"\x0A"', // linefeed
    /*
    Use of this linear-white-space rule
    permits lines containing only white
    space that are no longer legal in
    mail headers and have caused
    interoperability problems in other
    contexts.
    Do not use when defining mail
    headers and use with caution in
    other contexts.
    */
    LWSP: ['(', 'WSP', '/', 'CRLF', 'WSP', ')', '*'],
    OCTET: /[\x00-\xFF]/, //  8 bits of data
    SP: '" "', // '"\x20"',
    VCHAR: /[\x21-\x7E]/, // visible (printing) characters
    WSP: ['SP', '/', 'HTAB'], // white space

    // From ABNF definition of ABNF (http://tools.ietf.org/html/rfc5234#section-4 )
    rulelist: ['(', 'rule', '/', '&', '(', 'c_wsp', '*', 'c_nl', ')', ')', '+'], // 1*( rule / (*c-wsp c-nl) )
    rule: ['rulename', 'defined_as', 'elements', 'c_nl'], // continues if next line starts with white space
    rulename: ['rulename:', '(', '$', '(', 'ALPHA', '(', 'ALPHA', '/', 'DIGIT', '/', '"-"', ')', '*', ')', ')', function (rulename) {
        return rulename.replace(/\-/g, '_');
    }], // ALPHA *(ALPHA / DIGIT / "-")
    defined_as: ['equals:', '(', 'c_wsp', '*', '(', $J.orStrings('=', '=/'), ')', 'c_wsp', '*', ')', function (equals) {
        return '=';
    }], // *c-wsp ("=" / "=/") *c-wsp // basic rules definition and incremental alternatives
    elements: ['alternation', 'c_wsp', '*'], // =  alternation *c-wsp
    c_wsp: ['WSP', '/', '(', 'c_nl', 'WSP', ')'],
    c_nl: ['comment', '/', 'CRLF'], // comment or newline
    comment: ['comment:', '(', '&', '";"', '(', 'WSP', '/', 'VCHAR', ')', '*', 'CRLF', ')', function (comment) {
        return '/*' + comment + '*/'; // Return multiline as we don't know whether it is or not
    }], // ";" *(WSP / VCHAR) CRLF
    alternation: ['concatenation', '(', 'c_wsp', '*', '"/"', 'c_wsp', '*', 'concatenation', ')', '*'], // concatenation *(*c-wsp "/" *c-wsp concatenation)
    concatenation: ['repetition', '(', 'c_wsp', '+', 'repetition', ')', '*'], // repetition *(1*c-wsp repetition)
    
    repetition: ['(', 'min:', '(', 'DIGIT', '+', ')', '/', '(', 'min2:DIGIT', '*', '"*"', 'max:', 'DIGIT', '*', ')', ')', '?', 'element:', 'element', function (min, min2, max, element) {
console.log('mintype:'+typeof min);
        if (typeof min === 'undefined' && typeof min === 'undefined' && typeof max === 'undefined') {
            if (typeof element === 'undefined') {
                return null;
            }
            return element;
        }
        min = typeof min === 'undefined' ? 0 : min;
        min2 = typeof min2 === 'undefined' ? 0 : min2;
        max = typeof max === 'undefined' ? undefined : max;
        return ($J.range(element, min || min2 || 0, max)).expr;
    }], // [repeat] element
    //repetition: ['repeat', '?', 'element'], // [repeat] element
    // repeat: ['DIGIT', '+', '/', '(', 'DIGIT', '*', '"*"', 'DIGIT', '*', ')'], // 1*DIGIT / (*DIGIT "*" *DIGIT)
    element: $J.or('rulename', 'group', 'option', 'char_val', 'num_val', 'prose_val'),
    group: ['"("', 'c_wsp', '*', 'alternation', 'c_wsp', '*', '")"'], // "(" *c-wsp alternation *c-wsp ")"
    option: ['option:', '(', '&', '"["', '&', 'c_wsp', '*', 'alternation', '&', 'c_wsp', '*', '&', '"]"', ')', function (option) {
        return option + '?';
    }], // "[" *c-wsp alternation *c-wsp "]"
    char_val: ['$', '(', 'DQUOTE', /[\x20-\x21\x23-\x7E]*/, 'DQUOTE', ')'], // DQUOTE *(%x20-21 / %x23-7E) DQUOTE // quoted string of SP and VCHAR without DQUOTE
    num_val: ['&', '"%"', '(', $J.or('bin_val', 'dec_val', 'hex_val'), ')'],
    
    bin_val: ['&', '"b"', 'bin:', '(', 'BIT', '+', '(', '(', '"."', 'BIT', '+', ')', '+', '/', '(', '"-"', 'BIT', '+', ')', ')', '?', ')', function (bin) {
        return parseInt(bin, 2);
    }], // "b" 1*BIT [ 1*("." 1*BIT) / ("-" 1*BIT) ] // series of concatenated bit values or single ONEOF range
    dec_val: ['&', '"d"', 'dec:', '(', 'DIGIT', '+', '(', '(', '"."', 'DIGIT', '+', ')', '+', '/', '(', '"-"', 'DIGIT', '+', ')', ')', '?', ')', function (dec) {
        return parseInt(dec, 10);
    }], // "d" 1*DIGIT [ 1*("." 1*DIGIT) / ("-" 1*DIGIT) ]
    hex_val: ['&', '"x"', 'hex:', '(', 'HEXDIG', '+', '(', '(', '"."', 'HEXDIG', '+', ')', '+', '/', '(', '"-"', 'HEXDIG', '+', ')', ')', '?', ')', function (hex) {
        return parseInt(hex, 16);
    }], // "x" 1*HEXDIG [ 1*("." 1*HEXDIG) / ("-" 1*HEXDIG) ]
    
    prose_val: ['"<"', /[\x20-\x3D\x3F-\x7E]*/, '">"'] // "<" *(%x20-3D / %x3F-7E) ">" // bracketed string of SP and VCHAR without angles prose description, to be used as last resort
};
