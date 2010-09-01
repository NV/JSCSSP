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

require_all('../cssParser');
global.QUnit = require("./QUnit/qunit/qunit.js").QUnit;
require('./qunit-tap');

global.tests = {};
global.test = function test (description, func) {
	global.tests['test '+ description] = func;
};
