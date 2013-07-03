start
    =  parameter;

ALPHA
    =  [A-Za-z];

CHAR
    =  [\x00-\x7f];

CR
    =  "\r";

CRLF
    =  CR LF;

CTL
    =  [\x00-\x1f\x7f];

DIGIT
    =  [0-9];

HEXDIG
    = DIGIT / [A-F];

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

Language_Tag
    = langtag / privateuse / grandfathered;

OCTET
    =  CHAR;

SP
    =  " ";

TEXT
    =  ( ( & ( LWS ) / ! ( CTL ) ) OCTET )+;

WSP
    = SP / HTAB;

alphanum
    = ALPHA / DIGIT;

attr_char
    = ALPHA / DIGIT / [!#$&+\-.\^_`|~];

attribute
    =  token;

charset
    = "UTF-8" / "ISO-8859-1" / mime_charset;

ext_parameter
    =  parmname "*" LWSP "=" LWSP ext_value;

ext_value
    =  charset "'" language? "'" value_chars;

extension
    =  singleton ( "-" alphanum alphanum ( alphanum( alphanum( alphanum( alphanum( alphanum( alphanum ? ) ? ) ? ) ? ) ? ) ? ) )+;

extlang
    =  ALPHA ALPHA ALPHA  ( "-" ALPHA ALPHA ALPHA  ) ( "-" ALPHA ALPHA ALPHA  )+;

grandfathered
    = irregular / regular;

irregular
    = "en-GB-oed" / "i-ami" / "i-bnn" / "i-default" / "i-enochian" / "i-hak" / "i-klingon" / "i-lux" / "i-mingo" / "i-navajo" / "i-pwn" / "i-tao" / "i-tay" / "i-tsu" / "sgn-BE-FR" / "sgn-BE-NL" / "sgn-CH-DE";

langtag
    =  language ( "-" script )? ( "-" region )? ( "-" variant )* ( "-" extension )* ( "-" privateuse )?;

language
    =  ALPHA ALPHA ( ALPHA ? ) ( "-" extlang )* / ALPHA ALPHA ALPHA ALPHA  / ALPHA ALPHA ALPHA ALPHA ALPHA ( ALPHA( ALPHA( ALPHA ? ) ? ) ? );

mime_charset
    =  mime_charsetc+;

mime_charsetc
    = ALPHA / DIGIT / [!#$%&+\-\^_`{}~];

parameter
    =  attribute LWSP "=" LWSP value;

parmname
    =  attr_char+;

pct_encoded
    =  "%" HEXDIG HEXDIG;

privateuse
    =  "x" ( "-" alphanum ( alphanum( alphanum( alphanum( alphanum( alphanum( alphanum( alphanum ? ) ? ) ? ) ? ) ? ) ? ) ? ) )+;

qdtext
    =  ( ! ( '"' ) TEXT );

quoted_pair
    =  "\\" CHAR;

quoted_string
    =  "\"" ( qdtext / quoted_pair )+ "\"";

reg_parameter
    =  parmname LWSP "=" LWSP value;

region
    =  ALPHA ALPHA  / DIGIT DIGIT DIGIT ;

regular
    = "art-lojban" / "cel-gaulish" / "no-bok" / "no-nyn" / "zh-guoyu" / "zh-hakka" / "zh-min" / "zh-min-nan" / "zh-xiang";

script
    =  ALPHA ALPHA ALPHA ALPHA ;

separators
    =  [\(\)<>@,;:"\/\[\]?={} \t];

singleton
    = DIGIT / [A-WY-Z]i;

token
    =  ( ! ( CTL / separators ) CHAR )+;

value
    =  token / quoted_string;

value_chars
    =  (pct_encoded / attr_char )*;

variant
    =  alphanum alphanum alphanum alphanum alphanum ( alphanum( alphanum( alphanum ? ) ? ) ? ) / ( DIGIT alphanum alphanum alphanum  );


