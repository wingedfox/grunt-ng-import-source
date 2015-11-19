'use strict';
/**
 * Tries to process angular module declaration {@link https://docs.angularjs.org/guide/module}
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
 * @returns {Boolean} true current node is module declaration and processed successfully, false otherwise
 */
function AngularModuleDeclaration (node, parent, src, entries) {
    var deps = [];
    var log;
    if (esprima.Syntax.ArrayExpression === node.type &&
        esprima.Syntax.CallExpression === parent.type &&
        esprima.Syntax.MemberExpression === parent.callee.type &&
        'angular' === parent.callee.object.name &&
        'module' === parent.callee.property.name &&
        parent.arguments.length === 2) {
        // module declaration
        node.elements.forEach(function(cur) {
            if (LiteralBuilder.accept(cur)) {
                if (deps) {
                    deps.push(LiteralBuilder(cur));
                }
            } else {
                deps = null;
            }
        });

        if (deps) {
            var name = LiteralBuilder(parent.arguments[0]);
            log = 'Module declaration found: angular.module(' + name + ', [ ' + deps.join(',') + '])';
            grunt.log.verbose.ok('Processing module definition: ' + name);

            if (!entries[name]) {
                // for the module declaration build new entry in the module list
                entries[name] = {
                    name: name,
                    mod: [
                    ],
                    src: [
                        src
                    ]
                };
            } else {
                // update existing prepending declaration to maintain proper inclusion order
                entries[name].src.unshift(src);
            }

            // process module dependencies and update dependency map
            deps.forEach(function(dep) {
                if (!entries[dep]) {
                    // fill in brief entry record
                    entries[dep] = {
                        name: dep,
                        mod: [
                        ],
                        src: [
                        ]
                    };
                }
                entries[name].mod.push(entries[dep]);
            });

            grunt.verbose.debug(log);

            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

module.exports = AngularModuleDeclaration;