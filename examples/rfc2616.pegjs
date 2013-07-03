start
    =  parameter;

CHAR
    =  [\x00-\x7f];

CR
    =  "\r";

CRLF
    =  CR LF;

CTL
    =  [\x00-\x1f\x7f];

HT
    =  "	";

HTAB
    =  "	";

LF
    =  "\n";

LWS
    =  CRLF? ( SP / HT )+;

LWSP
    =  ( WSP / CRLF WSP )*;

OCTET
    =  CHAR;

SP
    =  " ";

TEXT
    =  ( ( & ( LWS ) / ! ( CTL ) ) OCTET )+;

WSP
    = SP / HTAB;

attribute
    =  token;

parameter
    =  attribute LWSP "=" LWSP value;

qdtext
    =  ( ! ( '"' ) TEXT );

quoted_pair
    =  "\\" CHAR;

quoted_string
    =  "\"" ( qdtext / quoted_pair )+ "\"";

separators
    =  [\(\)<>@,;:"\/\[\]?={} \t];

token
    =  ( ! ( CTL / separators ) CHAR )+;

value
    =  token / quoted_string;


