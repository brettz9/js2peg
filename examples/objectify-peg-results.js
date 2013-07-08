/*globals module*/
module.exports = function (rules, customHandler, customPattern) {

    'use strict';

    var ruleName, rule, matchesCustom, customHandlerResult;
    customPattern = customPattern || /^[A-Z_]+$/;

    for (ruleName in rules) {
        matchesCustom = typeof customPattern === 'function' ? customPattern(ruleName, rules[ruleName], rules) : ruleName.match(customPattern);

        if (matchesCustom) {
            if (customHandler === true) {
                continue;
            }
            if (typeof customHandler === 'function') {
                customHandlerResult = customHandler(ruleName, matchesCustom);
                if (!customHandlerResult) { // Allow rule to be completely ignored
                    continue;
                }
            }
        }
        
        rule = rules[ruleName];
        rule = rules[ruleName] = Array.isArray(rule)? rule : [rule];
        
        rule.unshift(ruleName + ':', '(');
        rule.push(')');        
        // Todo: fix to encapsulate if last item in array is a function or braced string

        if (customHandlerResult) {
            rule.push(customHandlerResult);
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