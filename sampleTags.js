var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

// consts
const PLUGIN_NAME = 'sample-tags';

function prefixStream(prefixText) {
    var stream = through();
    stream.write(prefixText);
    return stream;
}

// plugin level function (dealing with files)
function sampleTags(prefixText) {
    if (!prefixText) {
        throw new PluginError(PLUGIN_NAME, 'Missing prefix text!');
    }

    prefixText = new Buffer(prefixText); // allocate ahead of time

    // creating a stream through which each file will pass
    var stream = through.obj(function (file, enc, cb) {
        if (file.isBuffer()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Buffers not supported!'));
            return cb();
        }

        if (file.isStream()) {
            // define the streamer that will transform the content
            var streamer = prefixStream(prefixText);
            // catch errors from the streamer and emit a gulp plugin error
            streamer.on('error', this.emit.bind(this, 'error'));
            // start the transformation
            file.contents = file.contents.pipe(streamer);
        }

        // make sure the file goes through the next gulp plugin
        this.push(file);
        // tell the stream engine that we are done with this file
        cb();
    });

    // returning the file stream
    return stream;
}

module.exports = sampleTags;