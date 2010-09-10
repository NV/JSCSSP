var fs = require("fs");
var sys = require("sys");
var github = fs.readFileSync("github.css", "utf-8");

var CSSParser = require("jscssp").CSSParser;
var cssParser = new CSSParser;

var Sheet = require("Sheet").Sheet;


(function(){
  var start = Date.now();
  var dom = cssParser.parse(github);
  var str = dom.cssText();
  var end = Date.now();
  console.log("JSCSSP " + (end - start) +"ms");
})();

(function(){
  var start = Date.now();
  var dom = new Sheet(github);
  var str = dom.toString();
  var end = Date.now();
  console.log("Sheet  " + (end - start) +"ms");
})();
