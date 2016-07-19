# gulp-readme-to-markdown #
Converts [WordPress.org readme.txt](https://wordpress.org/plugins/about/readme.txt) style files to [GitHub flavored markdown](https://help.github.com/articles/github-flavored-markdown/).
A simillar task is available for grunt by [stephenharris](https://github.com/stephenharris/wp-readme-to-markdown).


## Usage ##

    npm install gulp-readme-to-markdown


In your `gulpfile.js` specify a task like the following:

    var readme = require('gulp-readme-to-markdown');
    gulp.task('readme', function() {
      gulp.src([ 'readme.txt' ])
      .pipe(readme({
        details: false,
        screenshot_ext: ['jpg', 'jpg', 'png'],
        extract: {
          'changelog': 'CHANGELOG',
          'Frequently Asked Questions': 'FAQ'
        }
      }))
      .pipe(gulp.dest('.'));
    });

The result of this task can be seen in the [Featured Video Plus repo](https://github.com/ahoereth/featured-video-plus).


## Options ##
* `screenshot_url` *string*: Screenshot URL skeleton. Can contain {plugin}, {screenshot} and {ext} which each will be replaced with their appropriate values. Default: `https://ps.w.org/{plugin}/assets/{screenshot}.{ext}`
* `screenshot_ext` *string/array*: Either a string or an array of strings of the same size as  there are screenshots. Default: `png`
* `uppercase` *boolean*: Specifies if the filenames should be converted to uppercase when translated to `.md`. Default: `true`
* `extract` *array/object*: Section names or object of `section name: file basename` pairs. Results in the specified sections being extracted into their individual file. By default no sections are extracted. You can use `{basename}` and `{section}` in the object's values which will be replaced by the source file's basename / the section name. Spaces in section name are converted to underscores. The `uppercase` option also applies for extracted file basenames. If an object is given you can also specify `null` as value to just remove a section instead of actually extracting it.
* `extract_basename` *string*: The default basename for extracted files. Only used if an array and not an object is specified in the `extract` option. Default: `{basename}_{section}`
* `details` *boolean*: If the details listing at the top of the readme file should be copied over. Default: `true`
