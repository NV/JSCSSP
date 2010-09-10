var fs = require("fs");
var sys = require("sys");
var github = fs.readFileSync("github.css", "utf-8");

var CSSParser = require("jscssp").CSSParser;
var cssParser = new CSSParser;

var Sheet = require("Sheet").Sheet;


(function(){
  var start = Date.now();
  var result = cssParser.parse(github);
  var end = Date.now();
  console.log("JSCSSP " + (end - start) +"ms");
})();

(function(){
  var start = Date.now();
  var result = new Sheet(github);
  var end = Date.now();
  console.log("Sheet  " + (end - start) +"ms");
})();
