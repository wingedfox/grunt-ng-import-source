'use strict';
var grunt = require('grunt');
var htmlparser = require('htmlparser2');
var files = require('../file-list');

var emptyTags = {
  'area': true,
  'base': true,
  'basefont': true,
  'br': true,
  'col': true,
  'frame': true,
  'hr': true,
  'img': true,
  'input': true,
  'isindex': true,
  'link': true,
  'meta': true,
  'param': true,
  'embed': true,
  '?xml': true
};
function getInclude (text) {
    return JSON.parse('{' + text.replace('include:', '') + '}');
}

function isInclude (text) {
    return text.indexOf('include:') === 1;
}

function isIncludeEnd (text) {
    return text.indexOf('/include') === 1;
}

function onopentag (name, attributes) {
console.log(attributes);
    if (emptyTags[name]) {
        return '<' + name + ' ' + Object.keys(attributes).map(function(k) {
            return k + '="' + attributes[k] + '"';
        }).join(' ') + '/>';
    } else {
        return '<' + name + ' ' + Object.keys(attributes).map(function(k) {
            return k + '="' + attributes[k] + '"'; 
        }).join(' ') + '>';
    }
}

//onopentagname(<str> name)
//onattribute(<str> name, <str> value)

function ontext (text) {
    return text;
}

function onclosetag(name){
    if (emptyTags[name]) {
        return '';
    } else {
        return '</' + name + '>';
    }
}

function onprocessinginstruction (name, data) {
console.log(arguments, data);
    return '<' + data + '>';
}

function oncomment(data) {
    return '<!--' + data + '-->';
}

function oncommentend() {
    return '';
}

//oncdatastart()
//oncdataend()
//onerror(<err> error)
//onreset()
function HTMLTransformer (text) {
    var output = '';
    /**
     * Marks replacement context, everything inside context will be removed
     * context is enabled from <!-- include: JSON --> to <!-- /include -->
     */
    var context = false;

    var parser = new htmlparser.Parser({
        onopentag: function (name, attr) {
             if (!context) {
                 output += onopentag(name, attr);
             }
        },
        onclosetag: function (name) {
             if (!context) {
                 output += onclosetag(name);
             }
        },
        onattribute: function () {
         console.log(arguments);
        },
        onprocessinginstruction: function (name, data) {
             if (!context) {
                 output += onprocessinginstruction(name, data);
             }
        },
        ontext: function (data) {
             if (!context) {
                 output += ontext(data);
             }
        },
        oncomment: function (data) {
             var res = oncomment(data);
             var start = isInclude(data);
             var end = isIncludeEnd(data);
             grunt.log.verbose.debug('Comment node found: start[' + start + '], end[' + end +']');
             if (context) {
                if (start) {
                    throw new Error('Forgot <!-- /include --> instruction?');
                }
                context = !end;
             } else {
                if (end) {
                    throw new Error('Forgot <!-- include: --> instruction?');
                }
                if (start) {
                    var include = getInclude(data);
                    if (include) {
                        var space = '\n' + output.match(/[\r\n]+(\s+)$/m)[1];
                        grunt.log.verbose.ok('Open context for ' + data);
                        files(include.files, include.options)(include.root).forEach(function(file){
                            res += space + '<script type="text/javascript" src="' + file + '"></script>';
                        });
                        res += space;
                    }
                    grunt.log.verbose.ok();
                    context = true;
                }
             }
             output += res;
        }
    }, {
        xmlMode: true,
        lowerCaseAttributeNames: false,
        lowerCaseTags: false,
        recognizeCDATA: false,
        recognizeSelfClosing: false
    });
    parser.write(text);
    parser.end();

    return output;
}

module.exports = HTMLTransformer;