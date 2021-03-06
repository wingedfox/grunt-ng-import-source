'use strict';
/**
 * Traverses given file options and provides file list as output
 *
 * @author Ilya WingedFox Lebedev <ilya@lebedev.net>
 */

var grunt = require('grunt');
var esprima = require('esprima');
var esprimaAstUtils = require('esprima-ast-utils');
var ngAnnotate = require('ng-annotate');

var LiteralBuilder = require('./builders/literal');
var FunctionBuilder = require('./builders/function');

var AngularModule = require('./matchers/angular-module');
var AngularModuleDeclaration = require('./matchers/angular-module-declaration');
var InjectableFunction = require('./matchers/injectable-function');
var InjectProperty = require('./matchers/inject-property');

/**
 * Cache to store results of processing
 */
var cache = {};

/**
 * @param {Array|String} files - array or comma-separated list of file paths to build includes
 * @param {Object} options - expanding options, {@link http://gruntjs.com/api/grunt.file#grunt.file.expandmapping}
 * @returns {Array} expanded list of files
 */
function getFiles (files, options) {
    if ('string' === typeof (files)) {
        files = files.split(/,/g);
    }
    return grunt.file.expandMapping(files, '', options);
}

/**
 * Builds list of files bound to modules and linked dependencies
 *
 */
function FileList(files, options) {
    var cacheKey = JSON.stringify(files) + JSON.stringify(options);
    if (cache[cacheKey]) {
        grunt.log.verbose.ok('Return cached result');
        return cache[cacheKey];
    }

    function processFile(src, filepath) {
        var replacements = [], matches = [], arrays;
        try {
            // process source with ngAnnotate to ensure correctness of the dependencies
            var ann = ngAnnotate(src, {
                add: true,
                remove: true,
            });
            // prepare ast to traverse
            var ast = esprima.parse(ann.src, {loc: true, range: true, comment: false/*, raw: true, comment: true, array: true*/});
            // build annotations
            esprimaAstUtils.traverse(ast, findAnnotations(filepath));
        } catch (ex) {
            grunt.fail.fatal('Error parsing file: ' + ex);
        }
    }

    /**
     * @param {String} src - source file to walk over
     * @returns {Function} walker function bound to the given file src
     */
    function findAnnotations(src) {
        return function (node, parent, property, index, depth) {
            return InjectableFunction(node, parent, src, moduleEntries) ||
                InjectProperty(node, parent, src, moduleEntries) ||
                AngularModuleDeclaration(node, parent, src, moduleEntries) ||
                AngularModule(node, parent, src, moduleEntries);
        };
    }

    /**
     * Module entries list containing all available modules and their sources
     * Entry format
     * {
     *   name: name, //module name
     *   mod: [],    //list of dependencies
     *   src: [],    //list of sources
     * }
     */
    var moduleEntries = {
    };

    /**
     * Recursively walks through the module tree and builds file list with the matching modules
     *
     * @param {Object} entry - node to start from
     * @param {String} path - path to track cycle deps
     */
    function moduleEntriesWalker (entry, path) {
        return entry.mod.reduce(function(prev, cur) {
            if (path.indexOf(cur.name) > -1) {
                var s = String(moduleEntriesWalker.cDepCount);
                if (!moduleEntriesWalker.cDepCount) {
                    grunt.log.verbose.or.write(" ");
                }
                grunt.log.verbose.warn('Circular dependency [' + path.join('/').yellow + '] for "' + cur.name.red + '"')
                     .or.write(Array(s.length+1).join("\b")+(String(++moduleEntriesWalker.cDepCount)).yellow);
                return prev;
            } else {
                return prev.concat(moduleEntriesWalker(cur, path.concat(cur.name)));
            }
        }, entry.src.filter(function(s) {
            if (!moduleEntriesWalker.processed[s]) {
                moduleEntriesWalker.processed[s] = true;
                return true;
            } else {
                return false;
            }
        }));
    }

    getFiles(files, options).forEach(function(files){
        files.src.forEach(function(file) {
            processFile(grunt.file.read(file), files.dest);
        });
    });

    cache[cacheKey] = function filter (root) {
        moduleEntriesWalker.processed = {};
        moduleEntriesWalker.cDepCount = 0;
        var res;
        // walk through the module list and build source list
        if (root) {
            grunt.log.verbose.writeln('Including modules from root [' + root + ']... ').or.write('Including modules from root [' + root + ']... ');
            if (!moduleEntries[root]) {
                grunt.log.error('no root found'.red);
                grunt.fail.fatal('Aborting');
            }
            res = moduleEntriesWalker(moduleEntries[root], []);
        } else {
            grunt.log.write('Including all root entries...');
            res = Object.keys(moduleEntries).reduce(function(prev, cur) {
                return prev.concat(moduleEntriesWalker(moduleEntries[cur], []));
            }, []);
        }
        if (moduleEntriesWalker.cDepCount) {
            grunt.log.verbose.or.writeln(" cicular dependencies found... Use --verbose to list them.".yellow)
        } else {
            grunt.log.verbose.or.ok();
        }
        return res;
    };
    return cache[cacheKey];
}

module.exports = FileList;
