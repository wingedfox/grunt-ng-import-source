'use strict';
/**
 * Tries to process $inject property
 * {@link https://docs.angularjs.org/api/auto/service/$injector#-inject-annotation}
 * {@link https://docs.angularjs.org/guide/di#-inject-property-annotation}
 *
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
 * @returns {Boolean} true current node is $inject annotation and processed successfully, false otherwise
 */
function InjectProperty (node, parent, src, entries) {
    var deps = [];
    var log;
    if (esprima.Syntax.ArrayExpression === node.type &&
        esprima.Syntax.AssignmentExpression === parent.type &&
        parent.left.property &&
        esprima.Syntax.Identifier === parent.left.property.type &&
        '$inject' === parent.left.property.name) {
        //  func.$inject = ['d','e','p']
        // inline inject property
        grunt.log.verbose.ok(('Processing $inject annotation: ' + parent.left.object.name));

        deps = [];
        node.elements.forEach(function(cur) {
            if (LiteralBuilder.accept(cur)) {
                if (deps) {
                    deps.push(LiteralBuilder(cur));
                }
            } else {
                deps = null;
            }
        });
        log = 'Annotation found: ' + parent.left.object.name + '.' + parent.left.property.name + ' = [' + deps.join(',') + ']';

        if (deps) {
            grunt.verbose.debug(log);

            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

module.exports = InjectProperty;