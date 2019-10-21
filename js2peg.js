(function () {
'use strict';

const _labelSpace = ' ',
  _ruleExpressionSeparator = '\n',
  _postEqual = ' ',
  _expressionSequenceSpace = ' ',
  _ruleSeparator = '\n\n',
  _dummySeparator = '\x00',
  PEG = require('pegjs');

/**
* As per https://github.com/dmajda/pegjs/blob/master/src/parser.pegjs ,
* dollar sign not allowed in PEG identifiers as with ECMAScript identifiers
* @private
* @constant
*/
function _isPegIdentifier (val) {
  return val.match(/^[a-z_][0-9a-z_]*$/i);
}

/**
* @private
* @constant
*/
function _stringify (str) {
  const dblQ = '"';
  return dblQ + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + dblQ;
}

/**
* @private
* @constant
*/
function _repeat (ct, str) {
  return new Array(ct + 1).join(str || ' ');
}

/**
* @private
* @constant
*/
function _getFunctionContents (f) {
  return '{' + f.toString().replace(/^function \([^)]*?\) \{/, '').replace(/\}$/, '') + '}';
}


function _isRegExp (obj) {
  return obj && typeof obj.exec === 'function';
}

/**
* @param {Object} targetObj Object onto which to copy properties
* @param {Object} sourceObj Object from which to copy properties
* @param {Boolean} [inherited] Whether to copy inherited properties; defaults to true
*/
function _mixin (targetObj, sourceObj, inherited) {
  inherited = !(inherited === false);
  for (const p in sourceObj) {
    if (inherited || {}.hasOwnProperty.call(sourceObj, p)) {
      const srcObjProp = sourceObj[p];
      if (srcObjProp && typeof srcObjProp === 'object') {
        if (_isRegExp(srcObjProp)) {
          targetObj[p] = new RegExp(srcObjProp.source,
            (srcObjProp.global ? 'g' : '') +
            (srcObjProp.ignoreCase ? 'i' : '') +
            (srcObjProp.multiline ? 'm' : '') +
            (srcObjProp.sticky ? 'y' : '') // non-standard
          );
          // We avoid copying deprecated properties
          targetObj[p].lastIndex = srcObjProp.lastIndex; // Settable and works
        }
        else if (targetObj[p] && Array.isArray(srcObjProp)) { // We don't want to overwrite an existing array, just replace it
          targetObj[p] = srcObjProp;
        }
        else {
          targetObj[p] = _mixin(targetObj[p] || (Array.isArray(srcObjProp) ? [] : {}), srcObjProp);
        }
      }
      else {
        targetObj[p] = sourceObj[p];
      }
    }
  }
  return targetObj;
}


/**
* @private
* @constant
*/
function _or () {
  const arr = Array.prototype.slice.call(arguments);
  return {expr: arr.join(' / ')};
}
/**
* @private
* @constant
*/
function _orStrings () {
  const arr = Array.prototype.slice.call(arguments);
  return _or.apply(null, arr.map(_stringify));
}

/**
* @private
* @constant
* @param {Any} item
* @param {Number} min
* @param {Number} [max] Defaults to infinite
* @todo min + missing max working?
* @todo Make work with non-string items?
*/
function _range (item, min, max) {
  const ret = (
    _repeat(min, _dummySeparator + item) + _dummySeparator +
      ((max && min) ?
        (
          _repeat(max - min, '(' + _dummySeparator + item) + _dummySeparator +
          _repeat(max - min, '?' + _dummySeparator + ')' + _dummySeparator)
        ) :
        ' +')
  ). //replace(new RegExp('^' + _dummySeparator), '').
  replace(new RegExp(_dummySeparator + '$'), '').split(_dummySeparator);

  return {expr: ret.join(' ')};
}
/**
* @private
* @constant
*/
function _exactly (item, num) {
  return _range(item, num, num);
}

/**
*
* @property {Boolean} sortRules Whether to sort rules alphabetically but with "start" rule on top (default is true)
* @property {Number} indent Number of spaces to indent
* @property {Boolean} semicolons Whether to insert semi-colons after rule parsing expressions
* @property {Object} parserOptions Allows boolean options, "cache" and "trackLineAndColumn"
* @property {String} output The output string
*/
function js2peg (opts) {
  if (!(this instanceof js2peg)) {
    return new js2peg(opts);
  }
  this.output = '';
  this.parser = null;
  // OPTIONS
  opts = opts || {};
  this.sortRules = opts.sortRules !== false;
  this.indent = _repeat(opts.indent || 2);
  this.semicolons = !!opts.semicolons;
  this.parserOptions = opts.parserOptions || {};
}
/**
* @param {Object} rules Grammar rules
* @param {Function|String} [initializer] Initializer function or a string without the curly braces (optionally accessing parser "options" variable and whose vars/funcs (as strings!) to be accessible to rule actions & semantic predicates)
* @example
{
  'myRuleName:optional JS String label': [ // rule name must be JS identifier followed by optional semicolon-label group

  ],
  myRuleName2: [ // Unlabeled

  ],
}
*/
js2peg.prototype.parse = function (str, rules, initializer) {
  return this.generate(rules, initializer).parse(str);
};

// Allow analogous API to PEG
js2peg.prototype.generate = function (rules, initializer) {
  this.convert(rules, initializer);
  // Can call toSource() on parser to get source
  this.parser = PEG.generate(this.output, this.parserOptions);
  return this.parser;
};

js2peg.prototype.convert = function (rules, initializer) {
  const indent = this.indent,
    that = this,
    ruleNames = Object.keys(rules);

  let initial = this.output;
  // initializerStartBrace = 0,
  // initializerEndBrace = 0,

  if (this.sortRules) {
    ruleNames.sort(function (a, b) {
      // Ensure start rule is at top
      return a === 'start' ? -1 : b === 'start' ? 1 : (a > b ? 1 : -1);
    });
  }

  initial += typeof initializer === 'function' ? _getFunctionContents(initializer) : (initializer || '');

  this.output += ruleNames.reduce(function (output, ruleNameSeq) {
    const ruleNameLabel = ruleNameSeq.split(':'),
      ruleName = ruleNameLabel[0];
    let parsingExpressionSeq,
      label = null;

    if (ruleNameLabel.length > 1) {
      label = ruleNameLabel[1];
    }

    if (!_isPegIdentifier(ruleName)) {
      throw 'PegJS requires rule names to be valid JavaScript identifiers';
    }
    output += ruleName;
    if (label) {
      output += _labelSpace + _stringify(label);
    }
    output += _ruleExpressionSeparator + indent + '=' + _postEqual;

    parsingExpressionSeq = rules[ruleNameSeq];
    parsingExpressionSeq = Array.isArray(parsingExpressionSeq) ? parsingExpressionSeq : [parsingExpressionSeq];

    output = parsingExpressionSeq.reduce(function (prev, parsingExpression, i, parsingExpressionSeq) {
//console.log('i::'+i +'::'+parsingExpression);
      let colonPos;
      if (!parsingExpression) {
        throw 'Null parsing expression provided (' + typeof parsingExpression + '): ' + parsingExpression + ' as part of seq: ' + parsingExpressionSeq;
      }
      if (typeof parsingExpression === 'string') {
        if ([
            '.', // Regexp any
            '(', ')' , // Regexp groupings
            '&', '!', '$', // PegJS matching modifiers
            '/' // PegJS OR
          ].indexOf(parsingExpression) > -1 ||
          parsingExpression.match(/^\[[\s\S]+\]i?$/) ||
          parsingExpression.match(/^\{[\s\S]*\}$/) ||
          parsingExpression.match(/^(['"])[\s\S]*\1i?$/)
        ) {
          return prev + _expressionSequenceSpace + parsingExpression;
        }
        if ([
            '*', '+', '?' // Regexp grouping, modifiers
          ].indexOf(parsingExpression) > -1
        ) {
          return prev + parsingExpression; // No space as tokens above typically imply incomplete
        }

        colonPos = parsingExpression.indexOf(':');
        if (colonPos > -1) {
          // colon label
          prev += _expressionSequenceSpace + parsingExpression.slice(0, colonPos + 1);
          parsingExpression = parsingExpression.slice(colonPos + 1); // We'll assume the content after the colon (if any) can be added directly
        }
        else if (!_isPegIdentifier(parsingExpression)) {
          throw 'An unrecognized parsing expression (and not confirming as an ECMAScript identifier) was provided: ' + parsingExpression + ' (which is part of the sequence: ' + parsingExpressionSeq + ')';
        }
        // rule name
        return prev + _expressionSequenceSpace + parsingExpression;
      }
      if (typeof parsingExpression === 'function') {
        return prev + _expressionSequenceSpace + _getFunctionContents(parsingExpression);
      }
      if (typeof parsingExpression === 'object') {
        if (parsingExpression.source) {
          return prev + _expressionSequenceSpace + parsingExpression.source + (parsingExpression.ignoreCase ? 'i' : '');
        }
        if (parsingExpression.literal) {
          return prev + _expressionSequenceSpace + _stringify(parsingExpression.literal) + (parsingExpression.i || parsingExpression.ignoreCase ? 'i' : '');
        }
        if (parsingExpression.expr) { // Could just use "source"
          return prev + parsingExpression.expr;
        }
        if (Array.isArray(parsingExpression)) {
// eslint-disable-next-line no-console
console.log('parsingExpressionSeq:' + parsingExpressionSeq);
// Todo: this won't work as reduce() won't consider new array length
//          parsingExpressionSeq.splice.apply(parsingExpressionSeq, [0, 0].concat(parsingExpression));
// console.log('222:' + parsingExpressionSeq);
          throw 'not working';
          // return prev;
        }
        throw 'Unexpected object provided as parsing expression: ' + JSON.stringify(parsingExpression);
      }
      // boolean, number, xml
      throw 'Unexpected type provided as parsing expression (' + typeof parsingExpression + '): ' + parsingExpression;
    }, output);

    if (that.semicolons) {
      output += ';';
    }
    output += _ruleSeparator;

    return output;
  }, initial);
};

js2peg.isECMAScriptIdentifier = _isPegIdentifier;
js2peg.stringify = _stringify;
js2peg.repeat = _repeat;
js2peg.getFunctionContents = _getFunctionContents;
js2peg.isRegExp = _isRegExp;
js2peg.mixin = _mixin;
js2peg.or = _or;
js2peg.orStrings = _orStrings;
js2peg.range = _range;
js2peg.exactly = _exactly;

if (typeof module === 'undefined') {
  this.js2peg = js2peg;
} else {
  module.exports = js2peg;
}

}());
