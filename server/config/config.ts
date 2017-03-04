import { allConfig, developmentConfig, productionConfig, testConfig } from './env';
const glob = require('glob');

let envConfig;
switch (process.env.NODE_ENV) {
  case 'development': case 'dev':
    envConfig = developmentConfig;
    break;
  case 'production': case 'prod':
    envConfig = productionConfig;
    break;
  case 'test':
    envConfig = testConfig;
    break;
}

export const config = Object.assign({}, allConfig, envConfig);


/**
 * Get files by glob patterns
 */
export function getGlobbedFiles(globPatterns, removeRoot?) {
	// For context switching
	var _this = this;

	// URL paths regex
	var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	// The output array
	var output = [];

	// If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob 
  if (Array.isArray(globPatterns)) {
		globPatterns.forEach(globPattern => 
      output = [...output, ..._this.getGlobbedFiles(globPattern, removeRoot)]
		);
  } else if (typeof(globPatterns) === 'string') {
    if (urlRegex.test(globPatterns)) {
			output.push(globPatterns);
    } else {
      var files = glob(globPatterns, { sync: true });
      if (removeRoot) {
        files = files.map(file => file.replace(removeRoot, ''));
      }
      output = [...output, ...files];
		}
	}

	return output;
};
