'use strict';
/**
 * Tries to process angular inline array annotation {@link https://docs.angularjs.org/guide/di#inline-array-annotation}
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
 * @returns {Boolean} true current node is array annotation and processed successfully, false otherwise
 */
function InjectableFunction (node, parent, src, entries) {
    var deps = [];
    var log;
    if (esprima.Syntax.ArrayExpression === node.type) {
        //  ['d','e','p',function(m,a,p){}]
        var last = node.elements[node.elements.length-1];
        if (last &&
            esprima.Syntax.FunctionExpression === last.type &&
            node.elements.length === last.params.length + 1) {
            // last element is injectable function
            if (esprima.Syntax.CallExpression === parent.type &&
                parent.arguments.length === 2) {
                grunt.log.verbose.ok(('Processing ' + parent.callee.property.name + ': ' + parent.arguments[0].value));
            }

            // build log entry
            log = 'Annotation found: [' + node.elements.map(function(cur) {
                if (LiteralBuilder.accept(cur)) {
                    if (deps) {
                        deps.push(LiteralBuilder(cur));
                    }
                    return LiteralBuilder(cur);
                } else if (FunctionBuilder.accept(cur) && cur === last) {
                    return FunctionBuilder(cur);
                } else {
                    // handle false positives
                    deps = null;
                }
            }, []).join(',') + ']';

        } else {
            return false;
        }
    } else {
        return false;
    }

    if (deps) {
        grunt.verbose.debug(log);
    }
    return !!deps;
}

module.exports = InjectableFunction;