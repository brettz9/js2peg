{
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
        }start
    =  start:  ( rulelist ) {
return Array.isArray(start) ? flatten(start).join('') : start;};

ALPHA
    =  ALPHA:  ( [a-z]i ) {
return Array.isArray(ALPHA) ? flatten(ALPHA).join('') : ALPHA;};

BIT
    =  BIT:  ( "0" / "1" ) {
return Array.isArray(BIT) ? flatten(BIT).join('') : BIT;};

CHAR
    =  CHAR:  ( [\x01-\x7F] ) {
return Array.isArray(CHAR) ? flatten(CHAR).join('') : CHAR;};

CR
    =  CR:  ( "\x0D" ) {
return Array.isArray(CR) ? flatten(CR).join('') : CR;};

CRLF
    =  CRLF:  ( CRLF:  ( CR LF ) {
        return '\n';
    } ) {
return Array.isArray(CRLF) ? flatten(CRLF).join('') : CRLF;};

CTL
    =  CTL:  ( [\x00-\x1F\x7F] ) {
return Array.isArray(CTL) ? flatten(CTL).join('') : CTL;};

DIGIT
    =  DIGIT:  ( [0-9] ) {
return Array.isArray(DIGIT) ? flatten(DIGIT).join('') : DIGIT;};

DQUOTE
    =  DQUOTE:  ( "\x22" ) {
return Array.isArray(DQUOTE) ? flatten(DQUOTE).join('') : DQUOTE;};

HEXDIG
    =  HEXDIG:  ( DIGIT / "A" / "B" / "C" / "D" / "E" / "F" ) {
return Array.isArray(HEXDIG) ? flatten(HEXDIG).join('') : HEXDIG;};

HTAB
    =  HTAB:  ( "	" ) {
return Array.isArray(HTAB) ? flatten(HTAB).join('') : HTAB;};

LF
    =  LF:  ( "\n" ) {
return Array.isArray(LF) ? flatten(LF).join('') : LF;};

LWSP
    =  LWSP:  ( ( WSP / CRLF WSP )* ) {
return Array.isArray(LWSP) ? flatten(LWSP).join('') : LWSP;};

OCTET
    =  OCTET:  ( [\x00-\xFF] ) {
return Array.isArray(OCTET) ? flatten(OCTET).join('') : OCTET;};

SP
    =  SP:  ( " " ) {
return Array.isArray(SP) ? flatten(SP).join('') : SP;};

VCHAR
    =  VCHAR:  ( [\x21-\x7E] ) {
return Array.isArray(VCHAR) ? flatten(VCHAR).join('') : VCHAR;};

WSP
    =  WSP:  ( SP / HTAB ) {
return Array.isArray(WSP) ? flatten(WSP).join('') : WSP;};

rulelist
    =  rulelist:  ( ( rule / & ( c_wsp* c_nl ) )+ ) {
return Array.isArray(rulelist) ? flatten(rulelist).join('') : rulelist;};

rule
    =  rule:  ( rulename defined_as elements c_nl ) {
return Array.isArray(rule) ? flatten(rule).join('') : rule;};

rulename
    =  rulename:  ( rulename:  ( $ ( ALPHA ( ALPHA / DIGIT / "-" )* ) ) {
        return rulename.replace(/\-/g, '_');
    } ) {
return Array.isArray(rulename) ? flatten(rulename).join('') : rulename;};

defined_as
    =  defined_as:  ( equals:  ( c_wsp* ("=" / "=/" ) c_wsp* ) {
        return '=';
    } ) {
return Array.isArray(defined_as) ? flatten(defined_as).join('') : defined_as;};

elements
    =  elements:  ( alternation c_wsp* ) {
return Array.isArray(elements) ? flatten(elements).join('') : elements;};

c_wsp
    =  c_wsp:  ( WSP / ( c_nl WSP ) ) {
return Array.isArray(c_wsp) ? flatten(c_wsp).join('') : c_wsp;};

c_nl
    =  c_nl:  ( comment / CRLF ) {
return Array.isArray(c_nl) ? flatten(c_nl).join('') : c_nl;};

comment
    =  comment:  ( comment:  ( & ";" ( WSP / VCHAR )* CRLF ) {
        return '/*' + comment + '*/'; // Return multiline as we don't know whether it is or not
    } ) {
return Array.isArray(comment) ? flatten(comment).join('') : comment;};

alternation
    =  alternation:  ( concatenation ( c_wsp* "/" c_wsp* concatenation )* ) {
return Array.isArray(alternation) ? flatten(alternation).join('') : alternation;};

concatenation
    =  concatenation:  ( repetition ( c_wsp+ repetition )* ) {
return Array.isArray(concatenation) ? flatten(concatenation).join('') : concatenation;};

repetition
    =  min_max:  ( DIGIT* "*" DIGIT* / DIGIT+ )? element:  element {
        if (!min_max) {
            return element;
        }
        var min = parseInt(min_max[0].join(''), 10) || 0,
            max = parseInt(min_max[2].join(''), 10);
        
//        console.log(min +'::'+max+'::::'+ element);
        element = Array.isArray(element) ? element.join('') : element;
//        console.log(min +'::'+max+'::'+typeof element + '::::'+ element);
//        console.log(($J.range(element, min, max)).expr);
        //return ($J.range(element, min, max)).expr;
        return range(element, min, max);
    };

element
    =  el:  (rulename / group / option / char_val / num_val / prose_val ) {
        return el;
    };

group
    =  group:  ( "(" c_wsp* alternation c_wsp* ")" ) {
return Array.isArray(group) ? flatten(group).join('') : group;};

option
    =  option:  ( option:  ( & "[" & c_wsp* alternation & c_wsp* & "]" ) {
        return option + '?';
    } ) {
return Array.isArray(option) ? flatten(option).join('') : option;};

char_val
    =  char_val:  ( $ ( DQUOTE [\x20-\x21\x23-\x7E]* DQUOTE ) ) {
return Array.isArray(char_val) ? flatten(char_val).join('') : char_val;};

num_val
    =  num_val:  ( & "%" (bin_val / dec_val / hex_val ) ) {
return Array.isArray(num_val) ? flatten(num_val).join('') : num_val;};

bin_val
    =  bin_val:  ( & "b" bin:  ( BIT+ ( ( "." BIT+ )+ / ( "-" BIT+ ) )? ) {
        return parseInt(bin, 2);
    } ) {
return Array.isArray(bin_val) ? flatten(bin_val).join('') : bin_val;};

dec_val
    =  dec_val:  ( & "d" dec:  ( DIGIT+ ( ( "." DIGIT+ )+ / ( "-" DIGIT+ ) )? ) {
        return parseInt(dec, 10);
    } ) {
return Array.isArray(dec_val) ? flatten(dec_val).join('') : dec_val;};

hex_val
    =  hex_val:  ( & "x" hex:  ( HEXDIG+ ( ( "." HEXDIG+ )+ / ( "-" HEXDIG+ ) )? ) {
        return parseInt(hex, 16);
    } ) {
return Array.isArray(hex_val) ? flatten(hex_val).join('') : hex_val;};

prose_val
    =  prose_val:  ( "<" [\x20-\x3D\x3F-\x7E]* ">" ) {
return Array.isArray(prose_val) ? flatten(prose_val).join('') : prose_val;};


