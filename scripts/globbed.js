const glob = require('glob');

/**
 * Get files by glob patterns
 */
function getGlobbedFiles(globPatterns, removeRoot) {
    // For context switching
    var _this = this;
    // URL paths regex
    var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');
    // The output array
    var output = [];
    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob 
    if (Array.isArray(globPatterns)) {
        globPatterns.forEach(globPattern => output = [...output, ..._this.getGlobbedFiles(globPattern, removeRoot)]);
    }
    else if (typeof (globPatterns) === 'string') {
        if (urlRegex.test(globPatterns)) {
            output.push(globPatterns);
        }
        else {
            var files = glob(globPatterns, { sync: true });
            if (removeRoot) {
                files = files.map(file => file.replace(removeRoot, ''));
            }
            output = [...output, ...files];
        }
    }
    return output;
}
exports.getGlobbedFiles = getGlobbedFiles;