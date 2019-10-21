/*globals require, module */

var $J = require('../js2peg');

module.exports = {
  start: 'parameter',
  /*
  http://tools.ietf.org/html/rfc5987#section-3.2.1
  parameters of RFC 2616 with RFC 2616 implied LWS translated to RFC 5234 LWSP
  parameter   = attribute LWSP "=" LWSP value
  */
  parameter: ['attribute', 'LWSP', '"="', 'LWSP', 'value'],
  // attribute   = token
  attribute: 'token',
  // value     = token / quoted-string
  'value': ['token', '/', 'quoted_string'],

  /*
  http://tools.ietf.org/html/rfc2616#section-2.2
  quoted-string  = ( <"> *(qdtext | quoted-pair ) <"> )
  */
  'quoted_string': [{literal: '"'}, '(', 'qdtext', '/', 'quoted_pair', ')', '+', {literal: '"'}],
  // token      = 1*<any CHAR except CTLs or separators>
  // i.e. (reordered hex),   not 09 20 22 28 29 2c 2f 3a 3b 3c 3d 3e 3f 40 5b 5d 7b 7d (between \x20-\x7e)
  /*token: ['chr:CHAR', '+', function (chr) { // May still consume too many characters to get here
    return chr.join('').match(/^.*?(?=[\x00-\x1f\x7f]|[()<>@,;:\\"\/\[\]?={} \t]|$)/);
  }],*/
  // token: /[\x21\x23-\x27\x2a\x2b\x2d\x2e\x30-\x39\x41-\x5a\x5c\x5e-\x7a\x7c\x7e]+/,
  token: ['(', '!', '(', 'CTL', '/', 'separators', ')', 'CHAR', ')', '+'],
  /*
  CHAR       = <any US-ASCII character (octets 0 - 127)>
  */
  'CHAR': /[\x00-\x7f]/,
  /*
  CTL      = <any US-ASCII control character
          (octets 0 - 31) and DEL (127)>
  */
  'CTL': /[\x00-\x1f\x7f]/,
  /*
  separators   =
          "(" | ")" | "<" | ">" | "@"
          | "," | ";" | ":" | "\" | <">
          | "/" | "[" | "]" | "?" | "="
          | "{" | "}" | SP | HT
          // i.e.,   28 29 3c 3e 40 2c 3b 3a 22 2f 5b 5d 3f 3d 7b 7d 20 9
          // or   40 41 60 62 64 44 59 58 34 47 91 93 63 61 123 125 32 9
  */
  separators: /[\(\)<>@,;:"\/\[\]?={} \t]/, // /^[\x09\x20\x22\x28\x29\x2c\x2f\x3a\x3b\x3c\x3d\x3e\x3f\x40\x5b\x5d\x7b\x7d]/,
  /*
    http://tools.ietf.org/html/rfc5234#appendix-B.1
    LWSP       =  *(WSP / CRLF WSP)
    WSP      =  SP / HTAB
    SP       =  %x20
    HTAB       =  %x09
    CRLF       =  CR LF
    CR       =  %x0D
    LF       =  %x0A
  */
  LWSP: ['(', 'WSP', '/', 'CRLF', 'WSP', ')', '*'],
  WSP: $J.or('SP', 'HTAB'),
  SP: '" "',
  HTAB: '"\t"',
  CRLF: ['CR', 'LF'],
  CR: '"\\r"',
  LF: '"\\n"',
  // /^(?:(?:\x0d\x0a)?[ \t])*/,
  // OCTET      = <any 8-bit sequence of data>
  OCTET: 'CHAR',
  /*
  TEXT       = <any OCTET except CTLs,
          but including LWS>
  LWS      = [CRLF] 1*( SP | HT )
  CRLF       = CR LF
  CR       = <US-ASCII CR, carriage return (13)>
  LF       = <US-ASCII LF, linefeed (10)>
  SP       = <US-ASCII SP, space (32)>
  HT       = <US-ASCII HT, horizontal-tab (9)>
  */
  // TEXT: /[\x09\x20-\x7e]/,
  TEXT: ['(', '(', '&', '(', 'LWS', ')', '/', '!', '(', 'CTL', ')', ')', 'OCTET', ')', '+'],
  LWS: ['CRLF', '?', '(', 'SP', '/', 'HT', ')', '+'],
  HT: '"\t"',
  // qdtext     = <any TEXT except <">>
  // qdtext: /[\x09\x20\x21\x23-\x7e]/,
  qdtext: ['(', '!', '(', "'\"'", ')', 'TEXT', ')'],

  // quoted-pair  = "\" CHAR
  'quoted_pair': ['"\\\\"', 'CHAR']
};
