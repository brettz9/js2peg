/*globals module*/
module.exports = function (rules, upperCaseHandling) {

    'use strict';

    var ruleName, rule, isUpperCase;
    upperCaseHandling = upperCaseHandling || upperCaseHandling !== false;

    for (ruleName in rules) {
        isUpperCase = ruleName.match(/^[A-Z_]+$/);
        if (upperCaseHandling === true && isUpperCase) {
            continue;
        }
        
        rule = rules[ruleName];
        rule = rules[ruleName] = Array.isArray(rule)? rule : [rule];
        
        rule.unshift(ruleName + ':', '(');
        rule.push(')');        
        // Todo: fix to encapsulate if last item in array is a function or braced string
        if (isUpperCase && typeof upperCaseHandling === 'function') {
            rule.push(upperCaseHandling(ruleName));
        }
        else {
            rule.push('{\n' +
                'var ret = {};\n' +
                // 'ret.$value = ' + ruleName + ';\n'+
                'ret["' + ruleName + '"] = ' + ruleName + ';\n'+
                'return ret;\n' +
            '}');
        }
    }
    return rules;
};