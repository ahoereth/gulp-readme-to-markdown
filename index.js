var through2 = require('through2');
var path     = require('path');
var gutil    = require('gulp-util');
var defaults = require('lodash.defaults');
var foreach  = require('lodash.foreach');

/**
* gulp-readme-to-markdown
* Converts WordPress.org readme.txt style files to GitHub flavored markdown.
*
* @param {object} options
*   screenshot_url
*   screenshot_ext
*   uppercase
*   extract
*   extract_basename
*   details
*/
module.exports = function(options) {
  options = defaults(options || {}, {
    screenshot_url: 'https://ps.w.org/{plugin}/assets/{screenshot}.{ext}',
    screenshot_ext: 'png',
    uppercase: true,
    extract: {
      "Screenshots": null
    },
    extract_basename: '{basename}_{section}',
    details: true
  });

  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new gutil.PluginError('gulp-less', 'Streaming not supported'));
    }

    var str = file.contents.toString('utf8');

    // File basename.
    var basename = path.basename(file.path, path.extname(file.path));
    basename = ( options.uppercase ? basename.toUpperCase() : basename );

    // Handle titles.
    // From https://github.com/benbalter/WP-Readme-to-Github-Markdown
    str = str.replace(/^=([^=]+)=*?[\\s ]*?$/gim, "###$1###");
    str = str.replace(/^==([^=]+)==*?[\\s ]*?$/mig, "##$1##");
    str = str.replace(/^===([^=]+)===*?[\\s ]*?$/gim, "#$1#");

    // Handle detail listings.
    var details_pattern = options.details ? '**$1:** $2\n' : '';
    var d_match = str.match(/^([^#]+)##/mg);
    var details = d_match[0].replace(/^([^:\r\n]+):\s*(.+)\n|\r/gim, details_pattern);
    str = str.replace(d_match[0], details);

    // Handle code snippets, so multiline snippets are treated nicely in GH
    str =  str.replace(/^`\n/gm, '```\n');

    // Get plugin name.
    var n_match = str.match(/^#([^#]+)#[\\s ]*?$/im);
    var pluginname = n_match ?
    n_match[1].trim().toLowerCase().replace(/ /g, '-') :
    path.basename(path.dirname(file.path));
    pluginname = options.pluginname || pluginname;

    // Extract sections into individual files.
    var self = this;
    foreach (options.extract, function(val, key) {
      // options.extract is either an array of section titles or
      // an object of section title: extract file basenames
      var title = typeof key === 'number' ? val : key;
      var section_basename = typeof key === 'number' ? options.extract_basename
                                                     : val;
      var justremove = section_basename === null; // Remove or actually extract?
      section_basename = (section_basename || '')
        .replace('{basename}', basename)
        .replace('{section}', title.replace(' ', '_'));

      // Uppercase section basename if required.
      section_basename = options.uppercase ? section_basename.toUpperCase()
                                           : section_basename;

      // Section match pattern. Props @swenzel
      var pattern = new RegExp('^##\\s*'+title+'\\s*##$((?:.*\n?(?!^##[^#]*##$))*)', 'im');

      // Find section.
      var section_match = str.match(pattern);
      if (section_match) {
        if (!justremove) { // Remove or actually extract?
          // Upgrade headlines by one level and add trailing empty line.
          var section_content = section_match[0].replace(/^(#+)(?:#([^#]*)#)#*$/mig, '$1$2$1').trim() + '\n';

          // Create new file.
          var section_file = new gutil.File({
            base: path.basename(file.path),
            cwd: path.basename(file.path),
            path: path.join(path.basename(file.path), section_basename + '.md'),
            contents: new Buffer(section_content)
          });
          self.push(section_file);
        }

        // Remove from the source.
        str = str.replace(section_match[0], '');
      }
    });

    file.contents = new Buffer(str);

    // Rename original file.
    file.path = path.join(
      path.dirname(file.path),
      basename + '.md'
    );

    cb(null, file);
  });
};
