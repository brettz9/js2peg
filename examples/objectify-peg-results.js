/*globals module*/
module.exports = function (rules, customHandler, customPattern) {

    'use strict';

    var ruleName, rule, matchesCustom;
    customPattern = customPattern || /^[A-Z_]+$/;

    for (ruleName in rules) {
        matchesCustom = ruleName.match(customPattern);
        if (customHandler === true && matchesCustom) {
            continue;
        }
        
        rule = rules[ruleName];
        rule = rules[ruleName] = Array.isArray(rule)? rule : [rule];
        
        rule.unshift(ruleName + ':', '(');
        rule.push(')');        
        // Todo: fix to encapsulate if last item in array is a function or braced string
        if (matchesCustom && typeof customHandler === 'function') {
            rule.push(customHandler(ruleName, matchesCustom));
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