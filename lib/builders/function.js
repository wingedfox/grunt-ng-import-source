'use strict';
/**
 * String builder from FunctionExpression
 * @author Ilya WingedFox Lebedev <ilya@lebedev.net>
 */
var esprima = require('esprima');

/**
 * @returns {String} function declaration representation
 */
function FunctionBuilder (node) {
    return 'function ' + (node.id ? node.id.name + ' ' : '') + '(' + 
        node.params.map(function(param) {
            return param.name;
        }) + ')';
}
FunctionBuilder.accept = function (node) {
    return esprima.Syntax.FunctionExpression === node.type;
};

module.exports = FunctionBuilder;