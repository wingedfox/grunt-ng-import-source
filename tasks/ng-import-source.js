'use strict';
/**
 * @fileoverview Task files and builds complete dependency tree
 * @author Ilya WingedFox Lebedev <ilya@lebedev.net>
 */

var esprima = require('esprima');
var esprimaAstUtils = require('esprima-ast-utils');

var htmlProcessor = require('../lib/processors/html');

module.exports = function(grunt) {

    grunt.registerMultiTask('ng-import-source', function() {
        var log = 'Building includes for ' + this.files.length + ' file(s)...';
        grunt.log.writeln(log);

        // getting to transform total file list to structure of
        this.files.forEach(function(file) {
            var contents = file.src.filter(function(filepath) {
                // Remove nonexistent files (it's up to you to filter or warn here).
                if (!grunt.file.exists(filepath)) {
                    grunt.verbose.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function(filepath) {
                return htmlProcessor(grunt.file.read(filepath));
            }).join('\n');

            grunt.file.write(file.dest, contents);
        });
        grunt.log.ok('DONE');
    });
};