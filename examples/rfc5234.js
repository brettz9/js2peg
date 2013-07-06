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
    CRLF: ['CR', 'LF'], // Internet standard newline
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
    rulelist: ['(', 'rule', '/', '(', 'c_wsp', '*', 'c_nl', ')', ')', '+'], // 1*( rule / (*c-wsp c-nl) )
    rule: ['rulename', 'defined_as', 'elements', 'c_nl'], // continues if next line starts with white space
    rulename: ['ALPHA', '(', 'ALPHA', '/', 'DIGIT', '/', '"-"', ')', '*'], // ALPHA *(ALPHA / DIGIT / "-")
    defined_as: ['c_wsp', '*', '(', $J.orStrings('=', '=/'), ')', 'c_wsp', '*'], // *c-wsp ("=" / "=/") *c-wsp // basic rules definition and incremental alternatives
    elements: ['alternation', 'c_wsp', '*'], // =  alternation *c-wsp
    c_wsp: ['WSP', '/', '(', 'c_nl', 'WSP', ')'],
    c_nl: ['comment', '/', 'CRLF'], // comment or newline
    comment: ['";"', '(', 'WSP', '/', 'VCHAR', ')', '*', 'CRLF'], // ";" *(WSP / VCHAR) CRLF
    alternation: ['concatenation', '(', 'c_wsp', '*', '"/"', 'c_wsp', '*', 'concatenation', ')', '*'], // concatenation *(*c-wsp "/" *c-wsp concatenation)
    concatenation: ['repetition', '(', 'c_wsp', '+', 'repetition', ')', '*'], // repetition *(1*c-wsp repetition)
    repetition: ['repeat', '?', 'element'], // [repeat] element
    repeat: ['DIGIT', '+', '/', '(', 'DIGIT', '*', '"*"', 'DIGIT', '*', ')'], // 1*DIGIT / (*DIGIT "*" *DIGIT)
    element: $J.or('rulename', 'group', 'option', 'char_val', 'num_val', 'prose_val'),
    group: ['"("', 'c_wsp', '*', 'alternation', 'c_wsp', '*', '")"'], // "(" *c-wsp alternation *c-wsp ")"
    option: ['"["', 'c_wsp', '*', 'alternation', 'c_wsp', '*', '"]"'], // "[" *c-wsp alternation *c-wsp "]"
    char_val: ['DQUOTE', /[\x20-\x21\x23-\x7E]*/, 'DQUOTE'], // DQUOTE *(%x20-21 / %x23-7E) DQUOTE // quoted string of SP and VCHAR without DQUOTE
    num_val: ['"%"', '(', $J.or('bin_val', 'dec_val', 'hex_val'), ')'],
    bin_val: ['"b"', 'BIT', '+', '(', '(', '"."', 'BIT', '+', ')', '+', '/', '(', '"-"', 'BIT', '+', ')', ')', '?'], // "b" 1*BIT [ 1*("." 1*BIT) / ("-" 1*BIT) ] // series of concatenated bit values or single ONEOF range
    dec_val: ['"d"', 'DIGIT', '+', '(', '(', '"."', 'DIGIT', '+', ')', '+', '/', '(', '"-"', 'DIGIT', '+', ')', ')', '?'], // "d" 1*DIGIT [ 1*("." 1*DIGIT) / ("-" 1*DIGIT) ]
    hex_val: ['"x"', 'HEXDIG', '+', '(', '(', '"."', 'HEXDIG', '+', ')', '+', '/', '(', '"-"', 'HEXDIG', '+', ')', ')', '?'], // "x" 1*HEXDIG [ 1*("." 1*HEXDIG) / ("-" 1*HEXDIG) ]
    prose_val: ['"<"', /[\x20-\x3D\x3F-\x7E]*/, '">"'] // "<" *(%x20-3D / %x3F-7E) ">" // bracketed string of SP and VCHAR without angles prose description, to be used as last resort

    /*
    // What is precedence for alternatives vs. sequences?
    start: 'rule',
    rule: ['name', '"="', 'definition'],
    name: /[a-z_$][0-9a-z_$]*//*, // todo: why problems with 'i' flag here?
    // If a definition uses angle brackets (e.g., "OCTET = <any 8-bit sequence of data>"), will need to convert manually
    definition: ['element', '+'], // We'll define these separately to avoid confusion
    element: [
        '(',
        $J.or(
            'literal', 'alternatives', 'local_alternatives', 'repetition', 'optional', 'specific_repetition', 'lists', 'comments'
        ),
        ')'
    ],
    literal: ["'\"'", '.', '*', "'\"'"], // todo: should exclude unescaped double quotes
    alternatives: ['element', '"/"', 'element'],
    local_alternatives: ['"("', 'element', 'element', '")"'],
    repetition: ['l', '?', '"*"', 'm', '?', 'element'],
    l: /[0-9]+/,
    m: /[0-9]+/,
    n: /[0-9]+/,
    optional: ['"["', 'element', '"]"'],
    specific_repetition: ['n', 'element'],
    lists: ['l', '?', '"#"', 'm', '?', 'element'], // Although defined at http://tools.ietf.org/html/rfc2616#section-2 with 'n' and 'm', http://tools.ietf.org/html/rfc822#section-2 gives a more reasonable reusage of 'l' and 'm'
    comments: ['";"', /.*//*]
    // implied_LWS: []
    */
};
