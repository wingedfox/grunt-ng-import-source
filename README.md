# ng-import-source

>Automatic import of your Angular source files. This task is designed in respect to Angular DI and includes only references modules.
>Task is inspired by [grunt-include-source](http://github.com/jwvdiermen/grunt-include-source) and is mostly compatible with its options.
>It complements [usemin](https://github.com/yeoman/grunt-usemin) build process by provision of the source files in the html page, later processed by usemin flow

The main idea behind this plugin is to import only referred modules from the big library which is still under the massive development and can not be split on the separate artifacts.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install --save-dev grunt-ng-import-source
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-ng-import-source');
```

### Overview
In your project's Gruntfile, add a section named `ng-import-source` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  ng-import-source: {
    options: {
      // Task-specific options go here.
    },
    target: {
      // Target-specific file lists and/or options go here.
    }
  }
})
```

### Options
Currently task does not contain specific options.

### Target
Target is the most generic [task descriptor](http://gruntjs.com/configuring-tasks).

Example:
```js
grunt.initConfig({
  ng-import-source: {
    all: {
        files: [{
            src: '<%= yeoman.app %>/index.html': '<%= yeoman.app %>/index.html'
        }]
    }
  }
})
```

## Processing sources
To include sources all you need to do is place comment blocks with processing instructions in target html file(s).

Example:
```html
<body>
 <!-- include: "type":  "js",
               "root":  "app_module",
               "files": ["scripts/**/*.js","modules/**/*.js","!**/test/**/*.js"],
               "options": { "cwd": "app"} -->
 <!-- /include -->
```

### include
This instructions starts include block and overwrites all contents inside.

#### type
Block processing type, currently is not supported 

#### root
Root module to include references for. If omit, all found modules will be included in order of importance.

### files
Grunt [globbing pattern](http://gruntjs.com/api/grunt.file#globbing-patterns).

### options
Grunt file.expandMapping [options](http://gruntjs.com/api/grunt.file#grunt.file.expandmapping).

### /include
Finishes previously found include block.
> Note: there no pairing checked, you've been warned.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
See [CHANGELOG.md](//github.com/wingedfox/grunt-ng-import-source/blob/master/CHANGELOG.md).
