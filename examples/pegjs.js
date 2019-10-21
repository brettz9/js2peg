/*globals require, module */

/*
As defined per https://github.com/dmajda/pegjs/
*/

// This is probably not needed as available at https://github.com/dmajda/pegjs/blob/master/src/parser.pegjs
// Should still make Peg to JS parser (using that peg parser)


var $J = require('../js2peg');

module.exports = {
  // Todo: Import https://github.com/dmajda/pegjs/blob/master/examples/javascript.pegjs
  //    for Program, StringLiteral, Identifier, FunctionBody, Comment (and WhiteSpace?)
  // Todo: Allow or require whitespace and JS "Comment" as appropriate
  start: 'rulelist',
  rulelist: ['initializer', 'rule', '(', 'WS', 'rule', ')', '*'],
  WS: /\s/, // Todo: or use JS' WhiteSpace?
  initializer: ['"{"', 'Program', '"}"'],
  rule: ['rule_name', 'human_readable_rule_name', '?', '"="', 'parsing_expression', '";"', '?'],
  human_readable_rule_name: 'StringLiteral',
  rule_name: 'Identifier',
  parsing_expression: 'expression',
  literal: 'StringLiteral',
  one_character: '"."',
  characters: ['"["', , '"]"'],
  rule_name_reference: 'rule_name',
  expression: $J.or('literal', 'one_character', 'characters', 'rule_name_reference', 'parenthesized_expression', 'zero_or_more_expression', 'one_or_more_expression', 'zero_or_one_expression', 'match_ignore_expression', 'nonmatch_ignore_expression', 'match_ignore_predicate', 'nonmatch_ignore_predicate', 'labeled_expression',
  // 'match_string_expression', // Not allowed at present?
  'expression_sequence', 'action_expression', 'alternatives_expression'),
  parenthesized_expression: ['"("', 'expression', '")"'],
  zero_or_more_expression: ['expression', '"*"'],
  one_or_more_expression: ['expression', '"+"'],
  zero_or_one_expression: ['expression', '"?"'],
  match_ignore_expression: ['"&"', 'expression'],
  nonmatch_ignore_expression: ['"!"', 'expression'],
  match_ignore_predicate: ['"&"', '"{"', 'predicate', '"}"'],
  nonmatch_ignore_predicate: ['"!"', '"{"', 'predicate', '"}"'],
  predicate: 'FunctionBody',
  match_string_expression: ['"$"', 'expression'],
  labeled_expression: ['expression_label', 'expression'],
  expression_label: 'Identifier',
  expression_sequence: ['expression', '(', 'expression', 'WS', ')', '+'],
  action_expression: ['expression', '"{"', 'action', '"}"'],
  action: 'FunctionBody',
  alternatives_expression: ['expression', '(', '"/"', 'expression', ')', '+']
};
