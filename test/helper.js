function extend(a, b) {
	for (var key in b) {
		a[key] = b[key];
	}
	return a;
}

function require_all(name /* [, name]* */) {
	for (var i=0; i<arguments.length; i++) {
		extend(global, require(arguments[i]));
	}
}

var File = require('file');
if (File.dirname && File.join) {
	// Narwhal
	var dir = File.dirname(module);
	require.loader.paths.unshift(File.join(dir, '..'));
	require_all("cssParser");
}

require_all('assert');

global.tests = {};
global.test = function test (description, func) {
	global.tests['test '+ description] = func;
};
