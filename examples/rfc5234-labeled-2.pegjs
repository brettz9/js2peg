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
        }

start
    = $( rulelist);

ALPHA
    = $( [a-z]i);

BIT
    = $( "0" / "1");

CHAR
    = $( [\x01-\x7F]);

CR
    = $( "\x0D");

CRLF
    = $( CRLF:  ( CR LF ) {
        return '\n';
    });

CTL
    = $( [\x00-\x1F\x7F]);

DIGIT
    = $( [0-9]);

DQUOTE
    = $( "\x22");

HEXDIG
    = $( DIGIT / "A" / "B" / "C" / "D" / "E" / "F");

HTAB
    = $( "	");

LF
    = $( "\n");

LWSP
    = $( ( WSP / CRLF WSP )*);

OCTET
    = $( [\x00-\xFF]);

SP
    = $( " ");

VCHAR
    = $( [\x21-\x7E]);

WSP
    = $( SP / HTAB);

rulelist
    = $( ( rule / & ( c_wsp* c_nl ) )+);

rule
    = $( rulename defined_as elements c_nl);

rulename
    = $( rulename:  ( $ ( ALPHA ( ALPHA / DIGIT / "-" )* ) ) {
        return rulename.replace(/\-/g, '_');
    });

defined_as
    = $( equals:  ( c_wsp* ("=" / "=/" ) c_wsp* ) {
        return '=';
    });

elements
    = $( alternation c_wsp*);

c_wsp
    = $( WSP / ( c_nl WSP ));

c_nl
    = $( comment / CRLF);

comment
    = $( comment:  ( & ";" ( WSP / VCHAR )* CRLF ) {
        return '/*' + comment + '*/'; // Return multiline as we don't know whether it is or not
    });

alternation
    = $( concatenation ( c_wsp* "/" c_wsp* concatenation )*);

concatenation
    = $( repetition ( c_wsp+ repetition )*);

repetition
    =  min_max:  ( DIGIT* "*" DIGIT* / DIGIT+ )? element:  element {
        if (!min_max) {
            return element;
        }
        var min = parseInt(min_max[0].join(''), 10) || 0,
            max = parseInt(min_max[2].join(''), 10);

        element = Array.isArray(element) ? element.join('') : element;
        return range(element, min, max);
    };

element
    =  el:  (rulename / group / option / char_val / num_val / prose_val ) {
        return el;
    };

group
    = $( "(" c_wsp* alternation c_wsp* ")");

option
    = $( option:  ( & "[" & c_wsp* alternation & c_wsp* & "]" ) {
        return option + '?';
    });

char_val
    =  $ ( DQUOTE [\x20-\x21\x23-\x7E]* DQUOTE );

num_val
    = $( & "%" (bin_val / dec_val / hex_val ));

bin_val
    = $( & "b" bin:  ( BIT+ ( ( "." BIT+ )+ / ( "-" BIT+ ) )? ) {
        return parseInt(bin, 2);
    });

dec_val
    = $( & "d" dec:  ( DIGIT+ ( ( "." DIGIT+ )+ / ( "-" DIGIT+ ) )? ) {
        return parseInt(dec, 10);
    });

hex_val
    = $( & "x" hex:  ( HEXDIG+ ( ( "." HEXDIG+ )+ / ( "-" HEXDIG+ ) )? ) {
        return parseInt(hex, 16);
    });

prose_val
    = $( "<" [\x20-\x3D\x3F-\x7E]* ">");


