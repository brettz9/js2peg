start
    =  rulelist;

ALPHA
    =  [a-z]i;

BIT
    =  "0" / "1";

CHAR
    =  [\x01-\x7F];

CR
    =  "/x0D";

CRLF
    =  CR LF;

CTL
    =  [\x00-\x1F\x7F];

DIGIT
    =  [0-9];

DQUOTE
    =  "\x22";

HEXDIG
    =  DIGIT / "A" / "B" / "C" / "D" / "E" / "F";

HTAB
    =  "	";

LF
    =  "\n";

LWSP
    =  ( WSP / CRLF WSP )*;

OCTET
    =  [\x00-\xFF];

SP
    =  " ";

VCHAR
    =  [\x21-\x7E];

WSP
    =  SP / HTAB;

rulelist
    =  ( rule / ( c_wsp* c_nl ) )+;

rule
    =  rulename defined_as elements c_nl;

rulename
    =  ALPHA ( ALPHA / DIGIT / "-" )*;

defined_as
    =  c_wsp* ("=" / "=/" ) c_wsp*;

elements
    =  alternation c_wsp*;

c_wsp
    =  WSP / ( c_nl WSP );

c_nl
    =  comment / CRLF;

comment
    =  ";" ( WSP / VCHAR )* CRLF;

alternation
    =  concatenation ( c_wsp* / c_wsp* concatenation )*;

concatenation
    =  repetition ( c_wsp+ repetition )*;

repetition
    =  repeat? element;

repeat
    =  DIGIT+ / ( DIGIT* "*" DIGIT* );

element
    = rulename / group / option / char_val / num_val / prose_val;

group
    =  "(" c_wsp* alternation c_wsp* ")";

option
    =  "[" c_wsp* alternation c_wsp* "]";

char_val
    =  DQUOTE [\x20-\x21\x23-\x7E]* DQUOTE;

num_val
    =  "%" (bin_val / dec_val / hex_val );

bin_val
    =  "b" BIT+ ( ( "." BIT+ )+ / ( "-" BIT+ ) )?;

dec_val
    =  "d" DIGIT+ ( ( "." DIGIT+ )+ / ( "-" DIGIT+ ) )?;

hex_val
    =  "x" HEXDIG+ ( ( "." HEXDIG+ )+ / ( "-" HEXDIG+ ) )?;

prose_val
    =  "<" [\x20-\x3D\x3F-\x7E]* ">";


