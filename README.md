## js2peg ##

Converts a custom JavaScript syntax format into the PegJS file format. Offers the benefit of allowing more flexible building of grammars (and ready syntax highlighting by JavaScript-aware apps).

## Installation ##

`npm install js2peg`

## Usage ##

Require the module...

```javascript
var $J = require('js2peg');
```
Invoke the constructor to setup initial configuration:

```javascript
// Optional options object (below are shown the defaults)
$J({
    indent: 2, // Number of spaces to indent parsing expressions
    semicolons: false, // Whether to insert semi-colons after rule parsing expressions
    parserOptions: {
        cache: false, // If true, makes the parser cache results, avoiding exponential parsing time in pathological cases but making the parser slower
        trackLineAndColumn: false // If true, makes the parser track line and column (available as line and column variables in the actions and predicates
    }
});
```

## Instance properties ##

The properties of the above options object are also available as properties with the same name on the `$J` object.

In addition, the property `output` will exist on the object to indicate the string thus far built in the PegJS format (the empty string by default), and the property `parser` will store the last built PegJS parser object (set to `null` by default).

## Instance methods ##

### parse ###

**Arguments**: (`str`, `rules`, `initializer = undefined`)

This is a convenience method which:

1. calls `this.buildParser()` with the supplied `rules` and `initializer`
2. calls `parse()` (on the resulting PegJS parser object) with the supplied `str` string

### buildParser ###

**Arguments**: (`rules`, `initializer = undefined`)

This is a convenience method allowing you to use the same style of API as PegJS which:

1. calls `this.convert()` with the supplied `rules` and `initializer`
2. calls `PegJS.buildParser()` with the resulting output (the `this.output` property)
3. sets the `parser` property to the return value and also returns this parser object

One can then manually call the PegJS parser methods such as parse() or toSource() on the returned parser object. See `this.parse` to avoid the need for a separate `parse()` call.

### convert ###

**Arguments**: (`rules`, `initializer = undefined`)

The `initializer` is optional and if provided, can be a string wrapped in curly braces (`{...}`) or a function whose body will be copied (via `Function.prototype.toString()`) and then wrapped in curly braces to work as a PegJS grammar file (one can define arguments to the function, especially if one is in ECMAScript strict mode, to prevent issues with undefined variables, even though the function will not depend on these variables, depending solely on its string contents).

The `rules` object contains rule names (or rule names optionally followed by a colon and a string to serve as a PegJS rule name label) as keys.

The values on the `rules` object may be either a **string** to be:

1. preceded by whitespace...
    1. for regex matches: `.`, `(`, `)`, `.`
    2. for PegJS matching modifiers: `&` and `!`
    3. for PegJS OR condition: `/`
    4. for: `[...]` (regex matches), `{...}` (actions), `"..."` (literals)
    5. an expression label with a colon (optionally followed by content to be added directly, such as a rule name)
    6. a rule name
2. not preceded by whitespace
    1. `*`, `+`, `?`

...or an **object** or **function** to be serialized and then:

1. preceded by whitespace...
    1. A function whose contents are to be converted into a string (via `Function.prototype.toString()`) and used as an action within the grammar output
    2. An object with a `source` and optional `ignoreCase` property (as with a RegExp object or literal) to be added directly to the grammar output
    3. An object with a `literal` and optional `i` or `ignoreCase` property (as with a RegExp object or literal) to be stringified and added to the grammar output
2. currently not preceded by whitespace
    1. An object with a `expr` property to be added directly to the grammar output (it is preferred to use the class methods where possible to create such objects).

## Class methods ##

The following methods are of use internally or in defining modules.

### isECMAScriptIdentifier ###

**Arguments:** (`val`)

Indicates whether the supplied value `val` matches as a valid ECMAScript identifier. (Probably of most use internally.)

### stringify ###

**Arguments:** (`str`)

Returns the supplied string `str` surrounded by double-quotes and with all internal double-quotes escaped (useful for building literals without the likes of `JSON.stringify()`).

### repeat ###

**Arguments:** (`ct`, `str = ' '`)

Repeats the supplied string `str` a `ct` number of times. `str` defaults to a single space.

### getFunctionContents ###

**Arguments:** (`f`)

Converts a function `f` to a string (using `Function.prototype.toString()`), extracts the inner contents, and surrounds the result with curly braces. (Probably of most use internally.)

### isRegExp ###

**Arguments:** (`obj`)

Duck type checks an object `obj` for an `exec` method to determine whether the object is a regular expression object. (Probably of most use internally.)

### mixin ###

**Arguments:** (`targetObj`, `sourceObj`, `inherited = true`)

Mixes the object `sourceObj` onto the object `targetObj`, optionally (and by default) copying inherited properties as well as "own" properties of the `sourceObj`. If a property of `targetObj` already exists and the `sourceObj` is an array, the former will be overwritten by the latter (of use when a module redefines a rule), but otherwise the object will be recursively copied (creating an empty array or object when needed and not already present on the `targetObj`). Regular expression literals will be converted into JSON-stringifyable RegExp objects.

### or ###

**Arguments:** (`...`)

Takes an indefinite number of arguments, joins them together with a PegJS OR condition (" / "), adds the result onto an object via an `expr` property, and returns the object. The `expr` property is used to identify strings which should be copied directly into the grammar result without escaping.

### orStrings ###

**Arguments:** (`...`)

A convenience method to stringify all supplied arguments and then pass them to `js2peg.or()`.

### range ###

**Arguments:** (`item`, `min`, `max`)

Builds an object with an `expr` property set to the supplied `item` string being repeated (in PegJS format) in a space-separated list to the minimum `min` number of times and then encapsulated and repeated in an option group "( ... ?)" to the maximum `max` number of times.

See `js2peg.or()` regarding the `expr` property.

### exactly ###

**Arguments:** (`item`, `num`)

A convenience method to call `js2peg.range()` with its `min` and `max` arguments both set to `num`.

## Todos ##
1. See about getting RFC rule examples added to https://github.com/andreineculau/core-pegjs/tree/master/src/RFC ?
2. Allow multiple characters like ")+?" and utilize in example
3. Redo regex strings as regex literals in example (to take advantage of more diversity in JS expression syntax highlighting) once _or refactored to convert non-strings appropriately to strings

## Possible todos ##
1. Adapt PegJS to allow equivalents for ranges, etc.
2. Adapt PegJS to allow direct parsing of this JavaScript format
3. Adapt PegJS to build array of objects whose keys reflect rule names
4. Use PegJS to parse PegJS files and convert to the JavaScript format
5. Converter for EBNF? http://standards.iso.org/ittf/PubliclyAvailableStandards/s026153_ISO_IEC_14977_1996(E).zip
6. Check the whitespace generation more carefully to prevent redundant whitespace, etc.
