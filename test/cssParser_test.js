if (typeof require != "undefined") {
	require("./helper");
}


with (QUnit) {
	test("h1", function(){
		var parser = new CSSParser;
		var h1 = parser.parse("h1 {color: red;}");
		equal(h1.cssText().trim(), "h1 {\n  color: red;\n}");
	});
	test("input[name=text]", function(){
		var parser = new CSSParser;
		var sheet = parser.parse("input[name=text] {color: red;}");
		var rule = sheet.cssRules[0];
		equal(rule.mSelectorText, "input[name=text]");
	});
}


if (typeof module != "undefined" && typeof require != "undefined" && module === require.main) {
	if (typeof process != 'undefined') {
		// Node.js
		// TODO: find a way to run QUnit tests on Node without modifying them
	} else {
		// Narwhal
		require("test").run(tests);
	}
}
