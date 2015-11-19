'use strict';
/**
 * Tries to process angular module reference {@link https://docs.angularjs.org/guide/module}
 * @author Ilya WingedFox Lebedev <ilya@lebedev.net>
 */
var esprima = require('esprima');
var grunt = require('grunt');

var LiteralBuilder = require('../builders/literal');
var FunctionBuilder = require('../builders/function');

/**
 * @param {Node} node - current ast node
 * @param {Node} parent - parent ast node
 * @param {String} src - current source file name
 * @param {Object} entries - module entries to record module, if any
 * @returns {Boolean} true current node is module reference and processed successfully, false otherwise
 */
function AngularModule(node, parent, src, entries) {
    if (esprima.Syntax.CallExpression === node.type &&
        esprima.Syntax.MemberExpression === node.callee.type &&
        'angular' === node.callee.object.name &&
        'module' === node.callee.property.name &&
        node.arguments.length === 1
        ) {
        // module reference
        var name = LiteralBuilder(node.arguments[0]);
        grunt.log.verbose.ok(('Found module reference: ' + name));

        if (!entries[name]) {
            entries[name] = {
                name: name,
                    mod: [
                    ],
                    src: [
                        src
                    ]
                };
        } else {
            entries[name].src.push(src);
        }
        return true;
    }
    return false;
}

module.exports = AngularModule;