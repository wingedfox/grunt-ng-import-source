'use strict';
var grunt = require('grunt');
var files = require('../file-list');

function getInclude (text) {
    return JSON.parse('{' + text + '}');
}

function HTMLTransformer (text) {
    var output = text.replace(/^(.*)(<!--\s+include:((?:.|[\r\n])+?)-->)((?:.|[\r\n])*?)(<!--\s+\/include\s+-->)/gim,
        function (match, p0, p1, p2, p3, p4) {
            grunt.log.verbose.writeln('Processing includes for ' + p1);
            var include = getInclude(p2);
            return p0 + p1 + files(include.files, include.options)(include.root).map(function(file) {
                return '\n' + p0 + '<script type="text/javascript" src="' + file + '"></script>';
            }).join('') + '\n' + p0 + p4;
    });

    return output;
}

module.exports = HTMLTransformer;