const $J = require('../js2peg'),
  rfc2616ParameterRules = require('./rfc2616');

module.exports = $J.mixin(
  rfc2616ParameterRules,
  {
    /*
    // http://tools.ietf.org/html/rfc5646#section-2.1
    pct-encoded   = "%" HEXDIG HEXDIG
           ; see [RFC3986], Section 2.1
    // http://tools.ietf.org/html/rfc3986#section-2.1
    // http://tools.ietf.org/html/rfc2234
     HEXDIG     =  DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
    */
    'HEXDIG': $J.or('DIGIT', '[A-F]'),

    /*
    http://tools.ietf.org/html/rfc5987#section-3.2.1
    // parameter   = reg-parameter / ext-parameter
    */
    parameter: $J.or('reg_parameter', 'ext_parameter'),
    // reg-parameter = parmname LWSP "=" LWSP value
    'reg_parameter': ['parmname', 'LWSP', '"="', 'LWSP', 'value'],
    // ext-parameter = parmname "*" LWSP "=" LWSP ext-value
    'ext_parameter': ['parmname', '"*"', 'LWSP', '"="', 'LWSP', 'ext_value'],
    // parmname    = 1*attr-char
    'parmname': ['attr_char', '+'],
    /*
    ext-value   = charset  "'" [ language ] "'" value-chars
           ; like RFC 2231's <extended-initial-value>
           ; (see [RFC2231], Section 7)
    */
    'ext_value': ['charset', "\"'\"", 'language', '?', "\"'\"", 'value_chars'],
    /*
    charset     = "UTF-8" / "ISO-8859-1" / mime-charset
    */
    charset: $J.or('"UTF-8"', '"ISO-8859-1"', 'mime_charset'),
    /*
    mime-charset  = 1*mime-charsetc
    */
    'mime_charset': ['mime_charsetc', '+'],
    /*
    mime-charsetc = ALPHA / DIGIT
           / "!" / "#" / "$" / "%" / "&"
           / "+" / "-" / "^" / "_" / "`"
           / "{" / "}" / "~"
           ; as <mime-charset> in Section 2.3 of [RFC2978]
           ; except that the single quote is not included
           ; SHOULD be registered in the IANA charset registry
    */
    'mime_charsetc': $J.or('ALPHA', 'DIGIT', '[!#$%&+\\-\\^_`{}~]'),
    // http://tools.ietf.org/html/rfc5234#appendix-B.1
    ALPHA: /[A-Za-z]/, // %x41-5A / %x61-7A
    // http://tools.ietf.org/html/rfc5234#appendix-B.1
    DIGIT: /[0-9]/, // x30-39
    /*
    http://tools.ietf.org/html/rfc5646#section-2.1
    language    = <Language-Tag, defined in [RFC5646], Section 2.1>
    Language-Tag  = langtag       ; normal language tags
           / privateuse      ; private use tag
           / grandfathered     ; grandfathered tags
     */
    'Language_Tag': $J.or('langtag', 'privateuse', 'grandfathered'),
    /*
    langtag     = language
           ["-" script]
           ["-" region]
           *("-" variant)
           *("-" extension)
           ["-" privateuse]
    */
    langtag: ['language', '(', '"-"', 'script', ')', '?', '(', '"-"', 'region', ')', '?', '(', '"-"', 'variant', ')', '*',
            '(', '"-"', 'extension', ')', '*', '(', '"-"', 'privateuse', ')', '?'],
     /*
    language    = 2*3ALPHA      ; shortest ISO 639 code
           ["-" extlang]     ; sometimes followed by
                     ; extended language subtags
           / 4ALPHA        ; or reserved for future use
           / 5*8ALPHA      ; or registered language subtag
    */
    language: [
      $J.range('ALPHA', 2, 3), '(', '"-"', 'extlang', ')', '*', '/',
      $J.exactly('ALPHA', 4), '/',
      $J.range('ALPHA', 5, 8)
    ],
    /*
    extlang     = 3ALPHA        ; selected ISO 639 codes
           *2("-" 3ALPHA)    ; permanently reserved
    */
    extlang: [$J.exactly('ALPHA', 3),
      // Todo: optimize?
      '(', '"-"', $J.exactly('ALPHA', 3), ')',
      '(', '"-"', $J.exactly('ALPHA', 3), ')', '+'
    ], // Todo: correct?
    /*
    script    = 4ALPHA        ; ISO 15924 code
    */
    script: $J.exactly('ALPHA', 4),
    /*
    region    = 2ALPHA        ; ISO 3166-1 code
           / 3DIGIT        ; UN M.49 code
    */
    region: [
      $J.exactly('ALPHA', 2), '/',
      $J.exactly('DIGIT', 3)
    ],
    /*
    variant     = 5*8alphanum     ; registered variants
           / (DIGIT 3alphanum)
    */
    variant: [
      $J.range('alphanum', 5, 8), '/',
      '(', 'DIGIT', $J.exactly('alphanum', 3), ')'
    ],
    /*
    extension   = singleton 1*("-" (2*8alphanum))

                     ; Single alphanumerics
                     ; "x" reserved for private use
    */
    extension: ['singleton', '(', '"-"', $J.range('alphanum', 2, 8), ')', '+'],
    /*
    singleton   = DIGIT         ; 0 - 9
           / %x41-57       ; A - W
           / %x59-5A       ; Y - Z
           / %x61-77       ; a - w
           / %x79-7A       ; y - z
    */
    singleton: $J.or('DIGIT', '[A-WY-Z]i'),
    /*
    privateuse  = "x" 1*("-" (1*8alphanum))
    */
    privateuse: ['"x"', '(', '"-"', $J.range('alphanum', 1, 8), ')', '+'],
    /*
    grandfathered = irregular       ; non-redundant tags registered
           / regular       ; during the RFC 3066 era
    */
    grandfathered: $J.or('irregular', 'regular'),
    /*
    irregular   = "en-GB-oed"     ; irregular tags do not match
           / "i-ami"       ; the 'langtag' production and
           / "i-bnn"       ; would not otherwise be
           / "i-default"     ; considered 'well-formed'
           / "i-enochian"    ; These tags are all valid,
           / "i-hak"       ; but most are deprecated
           / "i-klingon"     ; in favor of more modern
           / "i-lux"       ; subtags or subtag
           / "i-mingo"       ; combination
           / "i-navajo"
           / "i-pwn"
           / "i-tao"
           / "i-tay"
           / "i-tsu"
           / "sgn-BE-FR"
           / "sgn-BE-NL"
           / "sgn-CH-DE"
    */
    irregular: $J.orStrings('en-GB-oed', 'i-ami', 'i-bnn', 'i-default', 'i-enochian', 'i-hak', 'i-klingon', 'i-lux', 'i-mingo', 'i-navajo', 'i-pwn', 'i-tao', 'i-tay', 'i-tsu', 'sgn-BE-FR', 'sgn-BE-NL', 'sgn-CH-DE'),
    /*
    regular     = "art-lojban"    ; these tags match the 'langtag'
           / "cel-gaulish"     ; production, but their subtags
           / "no-bok"      ; are not extended language
           / "no-nyn"      ; or variant subtags: their meaning
           / "zh-guoyu"      ; is defined by their registration
           / "zh-hakka"      ; and all of these are deprecated
           / "zh-min"      ; in favor of a more modern
           / "zh-min-nan"    ; subtag or sequence of subtags
           / "zh-xiang"
    */
    regular: $J.orStrings('art-lojban', 'cel-gaulish', 'no-bok', 'no-nyn', 'zh-guoyu', 'zh-hakka', 'zh-min', 'zh-min-nan', 'zh-xiang'),
    /*
    alphanum    = (ALPHA / DIGIT)   ; letters and numbers
    */
    alphanum: $J.or('ALPHA', 'DIGIT'),
    /*
    value-chars   = *( pct-encoded / attr-char )
    */
    'value_chars': ['(', $J.or('pct_encoded', 'attr_char'), ')', '*'],
    /*
    pct-encoded   = "%" HEXDIG HEXDIG
           ; see [RFC3986], Section 2.1
    */
    'pct_encoded': ['"%"', 'HEXDIG', 'HEXDIG'],
    /*
    attr-char   = ALPHA / DIGIT
           / "!" / "#" / "$" / "&" / "+" / "-" / "."
           / "^" / "_" / "`" / "|" / "~"
           ; token except ( "*" / "'" / "%" )
    */
    'attr_char': $J.or('ALPHA', 'DIGIT', '[!#$&+\\-.\\^_`|~]')
  }
);
