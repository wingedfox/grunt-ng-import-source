'use strict';
/**
 * String builder from Literal
 * @author Ilya WingedFox Lebedev <ilya@lebedev.net>
 */
var esprima = require ('esprima');

/**
 * @returns {String} literal representation
 */
function LiteralBuilder (node) {
    return node.value;
}
LiteralBuilder.accept = function (node) {
    return esprima.Syntax.Literal === node.type;
};

module.exports = LiteralBuilder;