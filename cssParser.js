/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   emk <VYV03354@nifty.ne.jp>
 *   Daniel Glazman <glazman@netscape.com>
 *   L. David Baron <dbaron@dbaron.org>
 *   Boris Zbarsky <bzbarsky@mit.edu>
 *   Mats Palmgren <mats.palmgren@bredband.net>
 *   Christian Biesinger <cbiesinger@web.de>
 *   Jeff Walden <jwalden+code@mit.edu>
 *   Jonathon Jongsma <jonathon.jongsma@collabora.co.uk>, Collabora Ltd.
 *   Siraj Razick <siraj.razick@collabora.co.uk>, Collabora Ltd.
 *   Daniel Glazman <daniel.glazman@disruptive-innovations.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

const CSS_ESCAPE  = '\\';

const IS_HEX_DIGIT  = 1;
const START_IDENT   = 2;
const IS_IDENT      = 4;
const IS_WHITESPACE = 8;

const W   = IS_WHITESPACE;
const I   = IS_IDENT;
const S   =          START_IDENT;
const SI  = IS_IDENT|START_IDENT;
const XI  = IS_IDENT            |IS_HEX_DIGIT;
const XSI = IS_IDENT|START_IDENT|IS_HEX_DIGIT;

function CSSScanner(aString)
{
  this.init(aString);
}

CSSScanner.prototype = {

  kLexTable: [
  //                                     TAB LF      FF  CR
     0,  0,  0,  0,  0,  0,  0,  0,  0,  W,  W,  0,  W,  W,  0,  0,
  //
     0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  // SPC !   "   #   $   %   &   '   (   )   *   +   ,   -   .   /
     W,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  I,  0,  0,
  // 0   1   2   3   4   5   6   7   8   9   :   ;   <   =   >   ?
     XI, XI, XI, XI, XI, XI, XI, XI, XI, XI, 0,  0,  0,  0,  0,  0,
  // @   A   B   C   D   E   F   G   H   I   J   K   L   M   N   O
     0,  XSI,XSI,XSI,XSI,XSI,XSI,SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // P   Q   R   S   T   U   V   W   X   Y   Z   [   \   ]   ^   _
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, 0,  S,  0,  0,  SI,
  // `   a   b   c   d   e   f   g   h   i   j   k   l   m   n   o
     0,  XSI,XSI,XSI,XSI,XSI,XSI,SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // p   q   r   s   t   u   v   w   x   y   z   {   |   }   ~
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, 0,  0,  0,  0,  0,
  //
     0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  //
     0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
  //     ¡   ¢   £   ¤   ¥   ¦   §   ¨   ©   ª   «   ¬   ­   ®   ¯
     0,  SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // °   ±   ²   ³   ´   µ   ¶   ·   ¸   ¹   º   »   ¼   ½   ¾   ¿
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // À   Á   Â   Ã   Ä   Å   Æ   Ç   È   É   Ê   Ë   Ì   Í   Î   Ï
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // Ð   Ñ   Ò   Ó   Ô   Õ   Ö   ×   Ø   Ù   Ú   Û   Ü   Ý   Þ   ß
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // à   á   â   ã   ä   å   æ   ç   è   é   ê   ë   ì   í   î   ï
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI,
  // ð   ñ   ò   ó   ô   õ   ö   ÷   ø   ù   ú   û   ü   ý   þ   ÿ
     SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI, SI
  ],

  mString : "",
  mPos : 0,
  mPreservedPos : [],

  init: function(aString) {
    this.mString = aString;
    this.mPos = 0;
    this.mPreservedPos = [];
  },

  getCurrentPos: function() {
    return this.mPos;
  },

  preserveState: function() {
    this.mPreservedPos.push(this.mPos);
  },

  restoreState: function() {
    if (this.mPreservedPos.length) {
      this.mPos = this.mPreservedPos.pop();
    }
  },

  forgetState: function() {
    if (this.mPreservedPos.length) {
      this.mPreservedPos.pop();
    }
  },

  read: function() {
    if (this.mPos < this.mString.length)
      return this.mString[this.mPos++];
    return -1;
  },

  peek: function() {
    if (this.mPos < this.mString.length)
      return this.mString[this.mPos];
    return -1;
  },

  isHexDigit: function(c) {
    var code = c.charCodeAt(0);
    return (code < 256 && (this.kLexTable[code] & IS_HEX_DIGIT) != 0);
  },

  isIdentStart: function(c) {
    var code = c.charCodeAt(0);
    return (code >= 256 || (this.kLexTable[code] & START_IDENT) != 0);
  },

  startsWithIdent: function(aFirstChar, aSecondChar) {
    var code = aFirstChar.charCodeAt(0);
    return this.isIdentStart(aFirstChar) ||
           (aFirstChar == "-" && this.isIdentStart(aSecondChar));
  },

  isIdent: function(c) {
    var code = c.charCodeAt(0);
    return (code >= 256 || (this.kLexTable[code] & IS_IDENT) != 0);
  },

  pushback: function() {
    this.mPos--;
  },

  nextHexValue: function() {
    var c = this.read();
    if (c == -1 || !this.isHexDigit(c))
      return new jscsspToken(jscsspToken.NULL_TYPE, null);
    var s = c;
    c = this.read();
    while (c != -1 && this.isHexDigit(c)) {
      s += c;
      c = this.read();
    }
    if (c != -1)
      this.pushback();
    return new jscsspToken(jscsspToken.HEX_TYPE, s);
  },

  gatherIdent: function(c) {
    var s = c;
    c = this.read();
    while (c != -1 && this.isIdent(c)) {
      s += c;
      c = this.read();
    }
    if (c != -1)
      this.pushback();
    return s;
  },

  parseIdent: function(c) {
    var value = this.gatherIdent(c);
    var nextChar = this.peek();
    if (nextChar == "(") {
      value += this.read();
      return new jscsspToken(jscsspToken.FUNCTION_TYPE, value);
    }
    return new jscsspToken(jscsspToken.IDENT_TYPE, value);
  },

  isDigit: function(c) {
    return (c >= '0') && (c <= '9');
  },

  parseComment: function(c) {
    var s = c;
    while ((c = this.read()) != -1) {
      s += c;
      if (c == "*") {
        c = this.read();
        if (c == -1)
          break;
        if (c == "/") {
          s += c;
          break;
        }
        this.pushback();
      }
    }
    return new jscsspToken(jscsspToken.COMMENT_TYPE, s);
  },

  parseNumber: function(c) {
    var s = c;
    var foundDot = false;
    while ((c = this.read()) != -1) {
      if (c == ".") {
        if (foundDot)
          break;
        else {
          s += c;
          foundDot = true;
        }
      } else if (this.isDigit(c))
        s += c;
      else
        break;
    }
    if (this.startsWithIdent(c, this.peek())) { // DIMENSION
      var unit = this.gatherIdent(c);
      s += unit;
      return new jscsspToken(jscsspToken.DIMENSION_TYPE, s);
    }
    else if (c == "%") {
      s += "%";
      return new jscsspToken(jscsspToken.PERCENTAGE_TYPE, s);
    }
    else if (c != -1)
      this.pushback();
    return new jscsspToken(jscsspToken.NUMBER_TYPE, s);
  },

  parseString: function(aStop) {
    var s = aStop;
    var previousChar = aStop;
    while ((c = this.read()) != -1) {
      if (c == aStop && previousChar != "\\") {
        s += c;
        break;
      }
      s += c;
      previousChar = c;
    }
    return new jscsspToken(jscsspToken.STRING_TYPE, s);
  },

  isWhiteSpace: function(c) {
    var code = c.charCodeAt(0);
    return code < 256 && (this.kLexTable[code] & IS_WHITESPACE) != 0;
  },

  eatWhiteSpace: function(c) {
    var s = c;
    while ((c = this.read()) != -1) {
      if (!this.isWhiteSpace(c))
        break;
      s += c;
    }
    if (c != -1)
      this.pushback();
    return s;
  },

  parseAtKeyword: function(c) {
    return new jscsspToken(jscsspToken.ATRULE_TYPE, this.gatherIdent(c));
  },

  nextToken: function() {
    var c = this.read();
    if (c == -1)
      return new jscsspToken(jscsspToken.NULL_TYPE, null);

    if (this.startsWithIdent(c, this.peek()))
      return this.parseIdent(c);

    if (c == '@') {
      var nextChar = this.read();
      if (nextChar != -1) {
        var followingChar = this.peek();
        this.pushback();
        if (this.startsWithIdent(nextChar, followingChar))
          return this.parseAtKeyword(c);
      }
    }

    if (c == "." || c == "+" || c == "-") {
      var nextChar = this.peek();
      if (this.isDigit(nextChar))
        return this.parseNumber(c);
      else if (nextChar == "." && c != ".") {
        firstChar = this.read();
        var secondChar = this.peek();
        this.pushback();
        if (this.isDigit(secondChar))
          return this.parseNumber(c);
      }
    }
    if (this.isDigit(c)) {
      return this.parseNumber(c);
    }

    if (c == "'" || c == '"')
      return this.parseString(c);

    if (this.isWhiteSpace(c))
      return new jscsspToken(jscsspToken.WHITESPACE_TYPE, this.eatWhiteSpace(c));

    if (c == "|" || c == "~" || c == "^" || c == "$" || c == "*") {
      var nextChar = this.read();
      if (nextChar == "=") {
        switch (c) {
          case "~" :
            return new jscsspToken(jscsspToken.INCLUDES_TYPE, "~=");
          case "|" :
            return new jscsspToken(jscsspToken.DASHMATCH_TYPE, "|=");
          case "^" :
            return new jscsspToken(jscsspToken.BEGINSMATCH_TYPE, "=");
          case "$" :
            return new jscsspToken(jscsspToken.ENDSMATCH_TYPE, "$=");
          case "*" :
            return new jscsspToken(jscsspToken.CONTAINSMATCH_TYPE, "*=");
          default :
            break;
        }
      } else if (nextChar != -1)
        this.pushback();
    }

    if (c == "/" && this.peek() == "*")
      return this.parseComment(c);

    return new jscsspToken(jscsspToken.SYMBOL_TYPE, c);
  }
};

function CSSParser(aString)
{
  this.mToken = null;
  this.mLookAhead = null;
  this.mScanner = new CSSScanner(aString);

  this.mPreserveWS = true;
  this.mPreserveComments = true;
}

CSSParser.prototype = {
  kBORDER_WIDTH_NAMES: {
      "thin": true,
      "medium": true,
      "thick": true
  },

  kBORDER_STYLE_NAMES: {
    "none": true,
    "hidden": true,
    "dotted": true,
    "dashed": true,
    "solid": true,
    "double": true,
    "groove": true,
    "ridge": true,
    "inset": true,
    "outset": true
  },

  kCOLOR_NAMES: {
    "transparent": true,
  
    "black": true,
    "silver": true,
    "gray": true,
    "white": true,
    "maroon": true,
    "red": true,
    "purple": true,
    "fuchsia": true,
    "green": true,
    "lime": true,
    "olive": true,
    "yellow": true,
    "navy": true,
    "blue": true,
    "teal": true,
    "aqua": true,
    
    "aliceblue": true,
    "antiquewhite": true,
    "aqua": true,
    "aquamarine": true,
    "azure": true,
    "beige": true,
    "bisque": true,
    "black": true,
    "blanchedalmond": true,
    "blue": true,
    "blueviolet": true,
    "brown": true,
    "burlywood": true,
    "cadetblue": true,
    "chartreuse": true,
    "chocolate": true,
    "coral": true,
    "cornflowerblue": true,
    "cornsilk": true,
    "crimson": true,
    "cyan": true,
    "darkblue": true,
    "darkcyan": true,
    "darkgoldenrod": true,
    "darkgray": true,
    "darkgreen": true,
    "darkgrey": true,
    "darkkhaki": true,
    "darkmagenta": true,
    "darkolivegreen": true,
    "darkorange": true,
    "darkorchid": true,
    "darkred": true,
    "darksalmon": true,
    "darkseagreen": true,
    "darkslateblue": true,
    "darkslategray": true,
    "darkslategrey": true,
    "darkturquoise": true,
    "darkviolet": true,
    "deeppink": true,
    "deepskyblue": true,
    "dimgray": true,
    "dimgrey": true,
    "dodgerblue": true,
    "firebrick": true,
    "floralwhite": true,
    "forestgreen": true,
    "fuchsia": true,
    "gainsboro": true,
    "ghostwhite": true,
    "gold": true,
    "goldenrod": true,
    "gray": true,
    "green": true,
    "greenyellow": true,
    "grey": true,
    "honeydew": true,
    "hotpink": true,
    "indianred": true,
    "indigo": true,
    "ivory": true,
    "khaki": true,
    "lavender": true,
    "lavenderblush": true,
    "lawngreen": true,
    "lemonchiffon": true,
    "lightblue": true,
    "lightcoral": true,
    "lightcyan": true,
    "lightgoldenrodyellow": true,
    "lightgray": true,
    "lightgreen": true,
    "lightgrey": true,
    "lightpink": true,
    "lightsalmon": true,
    "lightseagreen": true,
    "lightskyblue": true,
    "lightslategray": true,
    "lightslategrey": true,
    "lightsteelblue": true,
    "lightyellow": true,
    "lime": true,
    "limegreen": true,
    "linen": true,
    "magenta": true,
    "maroon": true,
    "mediumaquamarine": true,
    "mediumblue": true,
    "mediumorchid": true,
    "mediumpurple": true,
    "mediumseagreen": true,
    "mediumslateblue": true,
    "mediumspringgreen": true,
    "mediumturquoise": true,
    "mediumvioletred": true,
    "midnightblue": true,
    "mintcream": true,
    "mistyrose": true,
    "moccasin": true,
    "navajowhite": true,
    "navy": true,
    "oldlace": true,
    "olive": true,
    "olivedrab": true,
    "orange": true,
    "orangered": true,
    "orchid": true,
    "palegoldenrod": true,
    "palegreen": true,
    "paleturquoise": true,
    "palevioletred": true,
    "papayawhip": true,
    "peachpuff": true,
    "peru": true,
    "pink": true,
    "plum": true,
    "powderblue": true,
    "purple": true,
    "red": true,
    "rosybrown": true,
    "royalblue": true,
    "saddlebrown": true,
    "salmon": true,
    "sandybrown": true,
    "seagreen": true,
    "seashell": true,
    "sienna": true,
    "silver": true,
    "skyblue": true,
    "slateblue": true,
    "slategray": true,
    "slategrey": true,
    "snow": true,
    "springgreen": true,
    "steelblue": true,
    "tan": true,
    "teal": true,
    "thistle": true,
    "tomato": true,
    "turquoise": true,
    "violet": true,
    "wheat": true,
    "white": true,
    "whitesmoke": true,
    "yellow": true,
    "yellowgreen": true,
  
    "activeborder": true,
    "activecaption": true,
    "appworkspace": true,
    "background": true,
    "buttonface": true,
    "buttonhighlight": true,
    "buttonshadow": true,
    "buttontext": true,
    "captiontext": true,
    "graytext": true,
    "highlight": true,
    "highlighttext": true,
    "inactiveborder": true,
    "inactivecaption": true,
    "inactivecaptiontext": true,
    "infobackground": true,
    "infotext": true,
    "menu": true,
    "menutext": true,
    "scrollbar": true,
    "threeddarkshadow": true,
    "threedface": true,
    "threedhighlight": true,
    "threedlightshadow": true,
    "threedshadow": true,
    "window": true,
    "windowframe": true,
    "windowtext": true
  },

  get currentToken() {
    return this.mToken;
  },

  getHexValue: function() {
    this.mToken = this.mScanner.nextHexValue();
    return this.mToken;
  },

  getToken: function(aSkipWS, aSkipComment) {
    if (this.mLookAhead) {
      this.mToken = this.mLookAhead;
      this.mLookAhead = null;
      return this.mToken;
    }

    this.mToken = this.mScanner.nextToken();
    while (this.mToken &&
           ((aSkipWS && this.mToken.isWhiteSpace()) ||
            (aSkipComment && this.mToken.isComment())))
      this.mToken = this.mScanner.nextToken();
    return this.mToken;
  },

  lookAhead: function(aSkipWS, aSkipComment) {
    var preservedToken = this.mToken;
    this.mScanner.preserveState();
    var token = this.getToken(aSkipWS, aSkipComment);
    this.mScanner.restoreState();
    this.mToken = preservedToken;

    return token;
  },

  ungetToken: function() {
    this.mLookAhead = this.mToken;
  },

  addUnknownAtRule: function(aSheet, aString) {
    var blocks = [];
    var token = this.getToken(false, false);
    while (token.isNotNull()) {
      aString += token.value;
      if (token.isSymbol(";") && !blocks.length)
        break;
      else if (token.isSymbol("{")
               || token.isSymbol("(")
               || token.isSymbol("[")
               || token.type == "function") {
        blocks.push(token.isFunction() ? "(" : token.value);
      } else if (token.isSymbol("}")
                 || token.isSymbol(")")
                 || token.isSymbol("]")) {
        if (blocks.length) {
          var ontop = blocks[blocks.length - 1];
          if ((token.isSymbol("}") && ontop == "{")
              || (token.isSymbol(")") && ontop == "(")
              || (token.isSymbol("]") && ontop == "[")) {
            blocks.pop();
            if (!blocks.length)
              break;
          }
        }
      }
      token = this.getToken(false, false);
    }

    this.addUnknownRule(aSheet, aString);
  },

  addUnknownRule: function(aSheet, aString) {
    var rule = new jscsspErrorRule();
    rule.parsedCssText = aString;
    aSheet.cssRules.push(rule);
  },

  addWhitespace: function(aSheet, aString) {
    var rule = new jscsspWhitespace();
    rule.parsedCssText = aString;
    aSheet.cssRules.push(rule);
  },

  addComment: function(aSheet, aString) {
    var rule = new jscsspComment();
    rule.parsedCssText = aString;
    aSheet.cssRules.push(rule);
  },

  parseCharsetRule: function(aToken, aSheet) {
    var s = aToken.value;
    var token = this.getToken(false, false);
    if (token.isNotNull()
        && token.isWhiteSpace(" ")) {
      s += token.value;
      token = this.getToken(false, false);
      if (token.isNotNull() && token.isString()) {
        s += token.value;
        var encoding = token.value;
        token = this.getToken(false, false);
        if (token.isSymbol(";")) {
          s += token.value;
          var rule = new jscsspCharsetRule();
          rule.encoding = encoding;
          rule.parsedCssText = s;
          aSheet.cssRules.push(rule);
          return true;
        }
      }
    }

    this.addUnknownAtRule(aSheet, s);
    return false;
  },

  parseImportRule: function(aToken, aSheet) {
    var s = aToken.value;
    this.mScanner.preserveState();
    var valid = false;
    var token = this.getToken(true, true);
    if (token.isNotNull() && token.isString()) { // XXX MISSING url() case
      var href = token.value;
      s += " " + href;
      var media = [];
      token = this.getToken(true, true);
      while (token.isNotNull() && token.isIdent()) {
        s += " " + token.value;
        media.push(token.value);
        token = this.getToken(true, true);
        if (!token)
          break;
        if (token.isSymbol(",")) {
          s += ",";
        } else if (token.isSymbol(";")) {
          break;
        } else
          break;
        token = this.getToken(true, true);
      }
      if (token.isSymbol(";")) {
        valid = true;
        s += ";"
        this.mScanner.forgetState();
        var rule = new jscsspImportRule();
        rule.parsedCssText = s;
        rule.href = href;
        rule.media = media;
        aSheet.cssRules.push(rule);
        return true;
      }
    }
    this.mScanner.restoreState();
    this.addUnknownAtRule(aSheet, "@import");
    return false;
  },

  parseNamespaceRule: function(aToken, aSheet) {
    var s = aToken.value;
    var valid = false;
    this.mScanner.preserveState();
    var token = this.getToken(true, true);
    if (token.isNotNull()) {
      var prefix = "";
      var url = "";
      if (token.isIdent()) {
        prefix = token.value;
        s += " " + prefix;
        token = this.getToken(true, true);
      }
      if (token) {
        var foundURL = false;
        if (token.isString()) {
          foundURL = true;
          url = token.value;
          s += " " + url;
        } else if (token.isFunction("url(")) { // XXX use parseURL()
          s += " url(";
          foundURL = true;
          // get a url here...
          token = this.getToken(true, true);
          while (true) {
            if (!token.isNotNull()) {
              foundURL = false;
              break;
            }
            if (token.isString()) {
              url = token.value;
              s += url;
              token = this.getToken(true, true);
              if (token.isSymbol(")")) {
                s += ")";
                break;
              }
            } else if (token.isWhiteSpace()) {
              var nextToken = this.lookAhead(false, false);
              if (nextToken && nextToken.isSymbol(")")) {
                s += ")";
                this.getToken(false, false);
                break;
              } else
                foundURL = false;
            } else if (token.isSymbol(")")) {
              s += ")";
              break;
            } else {
              url += token.value;
              s += token.value;
            }

            token = this.getToken(false, false);
          }
        }
      }
      if (foundURL) {
        token = this.getToken(true, true);
        if (token.isSymbol(";")) {
          s += ";";
          this.mScanner.forgetState();
          var rule = new jscsspNamespaceRule();
          rule.parsedCssText = s;
          rule.prefix = prefix;
          rule.url = url;
          aSheet.cssRules.push(rule);
          return true;
        }
      }

    }
    this.mScanner.restoreState();
    this.addUnknownAtRule(aSheet, "@namespace");
    return false;
  },

  parseFontFaceRule: function(aToken, aSheet) {
    var s = aToken.value;
    var valid = false;
    var descriptors = [];
    this.mScanner.preserveState();
    var token = this.getToken(true, true);
    if (token.isNotNull()) {
      // expecting block start
      if (token.isSymbol("{")) {
        s += " " + token.value;
        var token = this.getToken(true, false);
        while (true) {
          if (token.isSymbol("}")) {
            s += "}";
            valid = true;
            break;
          } else {
            var d = this.parseDeclaration(token, descriptors, false);
            s += ((d && descriptors.length) ? " " : "") + d;
          }
          token = this.getToken(true, false);
        }
      }
    }
    if (valid) {
      this.mScanner.forgetState();
      var rule = new jscsspFontFaceRule();
      rule.parsedCssText = s;
      rule.descriptors = descriptors;
      aSheet.cssRules.push(rule)
      return true;
    }
    this.mScanner.restoreState();
    return false;
  },

  parsePageRule: function(aToken, aSheet) {
    var s = aToken.value;
    var valid = false;
    var declarations = [];
    this.mScanner.preserveState();
    var token = this.getToken(true, true);
    var pageSelector = "";
    if (token.isSymbol(":")) {
      token = this.getToken(false, false);
      if (token.isIdent()) {
        pageSelector = token.value;
        s += " :" + token.value;
        token = this.getToken(true, true);
      }
    }
    if (token.isNotNull()) {
      // expecting block start
      if (token.isSymbol("{")) {
        s += " " + token.value;
        var token = this.getToken(true, false);
        while (true) {
          if (token.isSymbol("}")) {
            s += "}";
            valid = true;
            break;
          } else {
            var d = this.parseDeclaration(token, declarations, true);
            s += ((d && declarations.length) ? " " : "") + d;
          }
          token = this.getToken(true, false);
        }
      }
    }
    if (valid) {
      this.mScanner.forgetState();
      var rule = new jscsspPageRule();
      rule.parsedCssText = s;
      rule.pageSelector = pageSelector;
      rule.declarations = declarations;
      aSheet.cssRules.push(rule)
      return true;
    }
    this.mScanner.restoreState();
    return false;
  },

  parseDefaultPropertyValue: function(token, aDecl, aAcceptPriority, descriptor) {
    var value = "";
    var blocks = [];
    var foundPriority = false;
    while (token.isNotNull()) {
      if ((token.isSymbol(";")
           || token.isSymbol("}")
           || token.isSymbol("!"))
          && !blocks.length) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }
  
      if (token.isSymbol("!")) {
        break;
      }
      else if (token.isSymbol("{")
                 || token.isSymbol("(")
                 || token.isSymbol("[")
                 || token.isFunction()) {
        blocks.push(token.isFunction() ? "(" : token.value);
      }
      else if (token.isSymbol("}")
                 || token.isSymbol(")")
                 || token.isSymbol("]")) {
        if (blocks.length) {
          var ontop = blocks[blocks.length - 1];
          if ((token.isSymbol("}") && ontop == "{")
              || (token.isSymbol(")") && ontop == "(")
              || (token.isSymbol("]") && ontop == "[")) {
            blocks.pop();
          }
        }
      }
      value += token.value;
      token = this.getToken(false, true);
    }
    if (value) {
      this.mScanner.forgetState();
      aDecl.push(this._createJscsspDeclaration(descriptor, value));
      return value;
    }
    return "";
  },

  parseMarginOrPaddingShorthand: function(token, aDecl, aAcceptPriority, aProperty)
  {
    var top = null;
    var bottom = null;
    var left = null;
    var right = null;

    var values = [];
    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (token.isDimension()
              || token.isPercentage()
              || token.isIdent("auto")) {
        values.push(token.value);
      }
      else
        return "";

      token = this.getToken(true, true);
    }

    var count = values.length;
    switch (count) {
      case 1:
        top = values[0];
        bottom = top;
        left = top;
        right = top;
        break;
      case 2:
        top = values[0];
        bottom = top;
        left = values[1];
        right = left;
        break;
      case 3:
        top = values[0];
        left = values[1];
        right = left;
        bottom = value[2];
        break;
      case 4:
        top = values[0];
        right = values[1];
        bottom = value[2];
        left = value[3];
        break;
      default:
        return "";
    }
    this.mScanner.forgetState();
    aDecl.push(this._createJscsspDeclaration(aProperty + "-top", top));
    aDecl.push(this._createJscsspDeclaration(aProperty + "-right", right));
    aDecl.push(this._createJscsspDeclaration(aProperty + "-bottom", bottom));
    aDecl.push(this._createJscsspDeclaration(aProperty + "-left", left));
   return top + " " + right + " " + bottom + " " + left;
  },

  parseBorderColorShorthand: function(token, aDecl, aAcceptPriority)
  {
    var top = null;
    var bottom = null;
    var left = null;
    var right = null;

    var values = [];
    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else {
        var color = this.parseColor(token);
        if (color)
          values.push(color);
        else
          return "";
      }

      token = this.getToken(true, true);
    }

    var count = values.length;
    switch (count) {
      case 1:
        top = values[0];
        bottom = top;
        left = top;
        right = top;
        break;
      case 2:
        top = values[0];
        bottom = top;
        left = values[1];
        right = left;
        break;
      case 3:
        top = values[0];
        left = values[1];
        right = left;
        bottom = value[2];
        break;
      case 4:
        top = values[0];
        right = values[1];
        bottom = value[2];
        left = value[3];
        break;
      default:
        return "";
    }
    this.mScanner.forgetState();
    aDecl.push(this._createJscsspDeclaration("border-top-color", top));
    aDecl.push(this._createJscsspDeclaration("border-right-color", right));
    aDecl.push(this._createJscsspDeclaration("border-bottom-color", bottom));
    aDecl.push(this._createJscsspDeclaration("border-left-color", left));
    return top + " " + right + " " + bottom + " " + left;
  },

  parseBorderWidthShorthand: function(token, aDecl, aAcceptPriority)
  {
    var top = null;
    var bottom = null;
    var left = null;
    var right = null;

    var values = [];
    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (token.isDimension()
               || (token.isIdent() && token.value in this.kBORDER_WIDTH_NAMES)) {
        values.push(token.value);
      }
      else
        return "";

      token = this.getToken(true, true);
    }

    var count = values.length;
    switch (count) {
      case 1:
        top = values[0];
        bottom = top;
        left = top;
        right = top;
        break;
      case 2:
        top = values[0];
        bottom = top;
        left = values[1];
        right = left;
        break;
      case 3:
        top = values[0];
        left = values[1];
        right = left;
        bottom = value[2];
        break;
      case 4:
        top = values[0];
        right = values[1];
        bottom = value[2];
        left = value[3];
        break;
      default:
        return "";
    }
    this.mScanner.forgetState();
    aDecl.push(this._createJscsspDeclaration("border-top-width", top));
    aDecl.push(this._createJscsspDeclaration("border-right-width", right));
    aDecl.push(this._createJscsspDeclaration("border-bottom-width", bottom));
    aDecl.push(this._createJscsspDeclaration("border-left-width", left));
    return top + " " + right + " " + bottom + " " + left;
  },

  parseBorderEdgeShorthand: function(token, aDecl, aAcceptPriority, aProperty)
  {
    var bWidth = null;
    var bStyle = null;
    var bColor = null;

    while (true) {
      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (!bWidth &&
               (token.isDimension()
                || (token.isIdent() && token.value in this.kBORDER_WIDTH_NAMES))) {
        bWidth = token.value;
      }

      else if (!bStyle &&
               (token.isIdent() && token.value in this.kBORDER_STYLE_NAMES)) {
        bStyle = token.value;
      }

      else {
        var color = this.parseColor(token);
        if (!bColor && color)
          bColor = color;
        else
          return "";
      }
      token = this.getToken(true, true);
    }

    // create the declarations
    this.mScanner.forgetState();
    bWidth = bWidth ? bWidth : "medium";
    bStyle = bStyle ? bStyle : "none";
    bColor = bColor ? bColor : "-moz-initial";

    function addPropertyToDecl(aSelf, aDecl, property, w, s, c) {
      aDecl.push(aSelf._createJscsspDeclaration(property + "-width", w));
      aDecl.push(aSelf._createJscsspDeclaration(property + "-style", s));
      aDecl.push(aSelf._createJscsspDeclaration(property + "-color", c));
    }

    if (aProperty == "border") {
      addPropertyToDecl(this, aDecl, "border-top", bWidth, bStyle, bColor);
      addPropertyToDecl(this, aDecl, "border-right", bWidth, bStyle, bColor);
      addPropertyToDecl(this, aDecl, "border-bottom", bWidth, bStyle, bColor);
      addPropertyToDecl(this, aDecl, "border-left", bWidth, bStyle, bColor);
    }
    else
      addPropertyToDecl(this, aDecl, aProperty, bWidth, bStyle, bColor);
    return bWidth + " " + bStyle + " " + bColor;
  },

  parseBackgroundShorthand: function(token, aDecl, aAcceptPriority)
  {
    const kHPos = {"left": true, "right": true };
    const kVPos = {"top": true, "bottom": true };
    const kPos = {"left": true, "right": true, "top": true, "bottom": true, "center": true};

    var bgColor = null;
    var bgRepeat = null;
    var bgAttachment = null;
    var bgImage = null;
    var bgPosition = null;

    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else {
        if (!bgAttachment &&
            (token.isIdent("scroll")
             || token.isIdent("fixed"))) {
          bgAttachment = token.value;
        }

        else if (!bgPosition &&
                 ((token.isIdent() && token.value in kPos)
                  || token.isDimension()
                  || token.isPercentage())) {
          bgPosition = token.value;
          token = this.getToken(true, true);
          if (token.isDimension() || token.isPercentage()) {
            bgPosition += " " + token.value;
          }
          else if (token.isIdent() && token.value in kPos) {
            if ((bgPosition in kHPos && token.value in kHPos) ||
                (bgPosition in kVPos && token.value in kVPos))
              return "";
            bgPosition += " " + token.value;
          }
          else {
            this.ungetToken();
            bgPosition += " center";
          }
        }

        else if (!bgRepeat &&
                 (token.isIdent("repeat")
                  || token.isIdent("repeat-x")
                  || token.isIdent("repeat-y")
                  || token.isIdent("no-repeat"))) {
          bgRepeat = token.value;
        }

        else if (!bgImage &&
                 (token.isFunction("url(")
                  || token.isIdent("none"))) {
          bgImage = token.value;
          if (token.isFunction("url(")) {
            token = this.getToken(true, true);
            var url = this.parseURL(token); // TODO
            if (url)
              bgImage += url;
            else
              return "";
          }
        }

        else {
          var color = this.parseColor(token);
          if (!bgColor && color)
            bgColor = color;
          else
            return "";
        }

      }

      token = this.getToken(true, true);
    }

    // create the declarations
    this.mScanner.forgetState();
    bgColor = bgColor ? bgColor : "transparent";
    bgImage = bgImage ? bgImage : "none";
    bgRepeat = bgRepeat ? bgRepeat : "repeat";
    bgAttachment = bgAttachment ? bgAttachment : "scroll";
    bgPosition = bgPosition ? bgPosition : "top left";

    aDecl.push(this._createJscsspDeclaration("background-color", bgColor));
    aDecl.push(this._createJscsspDeclaration("background-image", bgImage));
    aDecl.push(this._createJscsspDeclaration("background-repeat", bgRepeat));
    aDecl.push(this._createJscsspDeclaration("background-attachment", bgAttachment));
    aDecl.push(this._createJscsspDeclaration("background-position", bgPosition));
    return bgColor + " " + bgImage + " " + bgRepeat + " " + bgAttachment + " " + bgPosition;
  },

  parseCueShorthand: function(token, aDecl, aAcceptPriority)
  {
    var before = null;
    var after = null;

    var values = [];
    while (true) {

      if (!token.isNotNull())
        break;

      if (token.isSymbol(";")
          || (aAcceptPriority && token.isSymbol("!"))
          || token.isSymbol("}")) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      }

      else if (token.isIdent("none")) {
        values.push(token.value);
      }
      else if (token.isFunction("url(")) {
        var url = this.parseURL(token)
        if (url)
          values.push("url(" + url);
        else
          return "";
      }
      else
        return "";

      token = this.getToken(true, true);
    }

    var count = values.length;
    switch (count) {
      case 1:
        after = values[0];
        before = after;
        break;
      case 2:
        before = values[0];
        after = before;
        break;
      default:
        return "";
    }
    this.mScanner.forgetState();
    aDecl.push(this._createJscsspDeclaration("cue-before", before));
    aDecl.push(this._createJscsspDeclaration("cue-after", after));
   return before + " " + after;
  },

  _createJscsspDeclaration: function(property, value)
  {
    var decl = new jscsspDeclaration();
    decl.property = property;
    decl.value = value;
    decl.parsedCssText = property + ": " + value + ";";
    return decl;
  },
  
  parseURL: function(token)
  {
    var value = "";
    if (token.isString())
    {
      value += token.value;
      token = this.getToken(true, true);
    }
    else
      while (true)
      {
        if (!token.isNotNull())
          return "";
        // XXX missing whitespace case just before closing parenthesis
        if (token.isSymbol(")")) {
          break;
        }
        value += token.value;
        token = this.getToken(false, false);
      }

    if (token.isSymbol(")"))
      return value + ")";
    return "";
  },

  parseColor: function(token)
  {
    var color = "";
    if (token.isFunction("rgb(")
        || token.isFunction("rgba(")) {
      color = token.value;
      var isRgba = token.isFunction("rgba(")
      token = this.getToken(true, true);
      if (!token.isDimension() && !token.isPercentage())
        return "";
      color += token.value;
      token = this.getToken(true, true);
      if (!token.isSymbol(","))
        return "";
      color += ", ";
  
      token = this.getToken(true, true);
      if (!token.isDimension() && !token.isPercentage())
        return "";
      color += token.value;
      token = this.getToken(true, true);
      if (!token.isSymbol(","))
        return "";
      color += ", ";
  
      token = this.getToken(true, true);
      if (!token.isDimension() && !token.isPercentage())
        return "";
      color += token.value;
  
      if (isRgba) {
        token = this.getToken(true, true);
        if (!token.isSymbol(","))
          return "";
        color += ", ";
  
        token = this.getToken(true, true);
        if (!token.isDimension())
          return "";
        color += token.value;
      }
  
      token = this.getToken(true, true);
      if (!token.isSymbol(")"))
        return "";
      color += token.value;
    }
  
    else if (token.isFunction("hsl(")
             || token.isFunction("hsla(")) {
      color = token.value;
      var isHsla = token.isFunction("hsla(")
      token = this.getToken(true, true);
      if (!token.isDimension())
        return "";
      color += token.value;
      token = this.getToken(true, true);
      if (!token.isSymbol(","))
        return "";
      color += ", ";
  
      token = this.getToken(true, true);
      if (!token.isPercentage())
        return "";
      color += token.value;
      token = this.getToken(true, true);
      if (!token.isSymbol(","))
        return "";
      color += ", ";
  
      token = this.getToken(true, true);
      if (!token.isPercentage())
        return "";
      color += token.value;
  
      if (isHsla) {
        token = this.getToken(true, true);
        if (!token.isSymbol(","))
          return "";
        color += ", ";
  
        token = this.getToken(true, true);
        if (!token.isDimension())
          return "";
        color += token.value;
      }
  
      token = this.getToken(true, true);
      if (!token.isSymbol(")"))
        return "";
      color += token.value;
    }

    else if (token.isIdent()
             && (token.value in this.kCOLOR_NAMES))
      color = token.value;

    else if (token.isSymbol("#")) {
      token = this.getHexValue();
      if (!token.isHex())
        return "";
      var length = token.value.length;
      if (length != 3 && length != 6)
        return "";
      if (token.value.match( /[a-fA-F0-9]/g ).length != length)
        return "";
      color = "#" + token.value;
    }
    return color;
  },

  parseDeclaration: function(aToken, aDecl, aAcceptPriority) {
    this.mScanner.preserveState();
    var blocks = [];
    if (aToken.isIdent()) {
      var descriptor = aToken.value.toLowerCase();
      var token = this.getToken(true, true);
      if (token.isSymbol(":")) {
        var token = this.getToken(true, true);

        var value = "";
        var declarations = [];
        switch (descriptor) {
          case "background":
            value = this.parseBackgroundShorthand(token, declarations, aAcceptPriority);
            break;
          case "margin":
          case "padding":
            value = this.parseMarginOrPaddingShorthand(token, declarations, aAcceptPriority, descriptor);
            break;
          case "border-color":
            value = this.parseBorderColorShorthand(token, declarations, aAcceptPriority);
            break;
          case "border-style":
            value = this.parseBorderStyleShorthand(token, declarations, aAcceptPriority);
            break;
          case "border-width":
            value = this.parseBorderWidthShorthand(token, declarations, aAcceptPriority);
            break;
          case "border-top":
          case "border-right":
          case "border-bottom":
          case "border-left":
          case "border":
            value = this.parseBorderEdgeShorthand(token, declarations, aAcceptPriority, descriptor);
            break;
          default:
            value = this.parseDefaultPropertyValue(token, declarations, aAcceptPriority, descriptor);
            break;
        }
        token = this.currentToken;
        if (value) // no error above
        {
          var priority = false;
          if (token.isSymbol("!")) {
            token = this.getToken(true, true);
            if (token.isIdent("important")) {
              priority = true;
              token = this.getToken(true, true);
              if (token.isSymbol(";") || token.isSymbol("}")) {
                if (token.isSymbol("}"))
                  this.ungetToken();
              }
              else return "";
            }
            else return "";
          }
          else if  (token.isNotNull() && !token.isSymbol(";") && !token.isSymbol("}"))
            return "";
          for (var i = 0; i < declarations.length; i++) {
            declarations[i].priority = priority;
            aDecl.push(declarations[i]);
          }
          return descriptor + ": " + value + ";";
        }
      }
    }
    else if (aToken.isComment()) {
      if (this.mPreserveComments) {
	      this.mScanner.forgetState();
	      var comment = new jscsspComment();
	      comment.parsedCssText = aToken.value;
	      aDecl.push(comment);
      }
      return aToken.value;
    }

    // we have an error here, let's skip it
    this.mScanner.restoreState();
    var s = aToken.value;
    blocks = [];
    var token = this.getToken(false, false);
    while (token.isNotNull()) {
      s += token.value;
      if ((token.isSymbol(";") || token.isSymbol("}")) && !blocks.length) {
        if (token.isSymbol("}"))
          this.ungetToken();
        break;
      } else if (token.isSymbol("{")
                 || token.isSymbol("(")
                 || token.isSymbol("[")
                 || token.isFunction()) {
        blocks.push(token.isFunction() ? "(" : token.value);
      } else if (token.isSymbol("}")
                 || token.isSymbol(")")
                 || token.isSymbol("]")) {
        if (blocks.length) {
          var ontop = blocks[blocks.length - 1];
          if ((token.isSymbol("}") && ontop == "{")
              || (token.isSymbol(")") && ontop == "(")
              || (token.isSymbol("]") && ontop == "[")) {
            blocks.pop();
          }
        }
      }
      token = this.getToken(false, false);
    }
    return "";
  },

  parseMediaRule: function(aToken, aSheet) {
    var s = aToken.value;
    var valid = false;
    var mediaRule = new jscsspMediaRule();
    this.mScanner.preserveState();
    var token = this.getToken(true, true);
    var foundMedia = false;
    while (token.isNotNull()) {
      if (token.isIdent()) {
        foundMedia = true;
        s += " " + token.value;
        mediaRule.media.push(token.value);
        token = this.getToken(true, true);
        if (token.isSymbol(",")) {
          s += ",";
        } else {
          if (token.isSymbol("{"))
            this.ungetToken();
          else {
            // error...
            token = null;
            break;
          }
        }
      } else if (token.isSymbol("{"))
        break;
      else if (foundMedia) {
        token = null;
        // not a media list
        break;
      }
      token = this.getToken(true, true);
    }
    if (token.isSymbol("{")) {
      // ok let's parse style rules now...
      s += " { ";
      token = this.getToken(true, false);
      while (token.isNotNull()) {
        if (token.isComment() && this.mPreserveComments) {
          s += " " + token.value;
          var comment = new jscsspComment();
          comment.parsedCssText = token.value;
          mediaRule.cssRules.push(comment);
        } else if (token.isSymbol("}")) {
          valid = true;
          break;
        } else {
          var r = this.parseStyleRule(token, mediaRule);
          if (r)
            s += r;
        }
        token = this.getToken(true, false);
      }
    }
    if (valid) {
      this.mScanner.forgetState();
      mediaRule.parsedCssText = s;
      aSheet.cssRules.push(mediaRule);
      return true;
    }
    this.mScanner.restoreState();
    return false;
  },

	trim11: function(str) {
	  str = str.replace(/^\s+/, '');
	  for (var i = str.length - 1; i >= 0; i--) {
	    if (/\S/.test(str.charAt(i))) {
	      str = str.substring(0, i + 1);
	      break;
	    }
	  }
	  return str;
	},

  parseStyleRule: function(aToken, aCssRules) {
    // first let's see if we have a selector here...
    var selector = this.parseSelector(aToken, false);
    var valid = false;
    var declarations = [];
    if (selector) {
      selector = this.trim11(selector);
      var s = selector;
      var token = this.getToken(true, true);
      if (token.isSymbol("{")) {
        s += " { ";
        var token = this.getToken(true, false);
        while (true) {
          if (token.isSymbol("}")) {
            s += "}";
            valid = true;
            break;
          } else {
            var d = this.parseDeclaration(token, declarations, true);
            s += ((d && declarations.length) ? " " : "") + d;
          }
          token = this.getToken(true, false);
        }
      }
    }
    if (valid) {
      var rule = new jscsspStyleRule();
      rule.parsedCssText = s;
      rule.declarations = declarations;
      rule.mSelectorText = selector;
      aCssRules.cssRules.push(rule);
      return s;
    }
    return "";
  },

  parseSelector: function(aToken, aParseSelectorOnly) {
    var s = "";
    var isFirstInChain = true;
    var token = aToken;
    var valid = false;
    var combinatorFound = false;
    while (true) {
      if (!token.isNotNull()) {
        if (aParseSelectorOnly)
          return s;
        return "";
      }

      if (!aParseSelectorOnly && token.isSymbol("{")) {
        // end of selector
        this.ungetToken();
        valid = true;
        break;
      }

      var simpleSelector = this.parseSimpleSelector(token, isFirstInChain, true);
      if (null == simpleSelector)
        break; // error

      else if (simpleSelector)
      {
        s += simpleSelector;
      }

      else if (token.isSymbol(",")) {
        s += token.value;
        isFirstInChain = true;
        combinatorFound = false;
        token = this.getToken(false, true);
        continue;
      }
      // now combinators and grouping...
      else if (!combinatorFound
          && (token.isWhiteSpace()
              || token.isSymbol(">")
              || token.isSymbol("+")
              || token.isSymbol("~"))) {
        s += token.value;
        if (token.isSymbol(">")
            || token.isSymbol("+")
            || token.isSymbol("~"))
          combinatorFound = true;
        token = this.getToken(true, true);
        continue;
      }

      isFirstInChain == false;
      combinatorFound = false;
      token = this.getToken(false, true);
    }

    if (valid) {
      return s;
    }
    return "";
  },

  parseSimpleSelector: function(token, isFirstInChain, canNegate)
  {
    var s = "";
    if (isFirstInChain
        && (token.isSymbol("*") || token.isSymbol("|") || token.isIdent())) {
      // type or universal selector
      if (token.isSymbol("*") || token.isIdent()) {
        // we don't know yet if it's a prefix or a universal
        // selector
        s += token.value;
        token = this.getToken(false, true);
        if (token.isSymbol("|")) {
          // it's a prefix
          s += token.value;
          token = this.getToken(false, true);
          if (token.isIdent() || token.isSymbol("*")) {
            // ok we now have a type element or universal
            // selector
            s += token;
          } else
            // oops that's an error...
            return null;
        } else
          this.ungetToken();
      } else if (token.isSymbol("|")) {
        s += token.value;
        token = this.getToken(false, true);
        if (token.isIdent() || token.isSymbol("*")) {
          s += token.value;
        } else
          // oops that's an error
          return null;
      }
    }
  
    else if (token.isSymbol(".") || token.isSymbol("#")) {
      s += token.value;
      token = this.getToken(false, true);
      if (token.isIdent())
        s += token.value
      else
        return null;
    }

    else if (token.isSymbol(":")) {
      s += token.value;
      token = this.getToken(false, true);
      if (token.isSymbol(":")) {
        s += token.value;
        token = this.getToken(false, true);
      }
      if (token.isIdent())
        s += token.value
      else if (token.isFunction()) {
        s += token.value;
        if (token.isFunction(":not(")) {
          if (!canNegate)
            return null;
          token = this.getToken(true, true);
          var simpleSelector = this.parseSimpleSelector(token, isFirstInChain, false);
          if (!simpleSelector)
            return null;
          else {
            s += simpleSelector;
            token = this.getToken(true, true);
            if (token.isSymbol(")"))
              s += ")";
            else
              return null;
          }
        }
        else
          while (true) {
            token = this.getToken(false, true);
            if (token.isSymbol(")")) {
              s += ")";
              break;
            } else
              s += token.value;
          }
      } else
        return null;
  
    } else if (token.isSymbol("[")) {
      s += "[";
      token = this.getToken(true, true);
      if (token.isIdent() || token.isSymbol("*")) {
        s += token.value;
        var nextToken = this.getToken(true, true);
        if (token.isSymbol("|")) {
          s += "|";
          token = this.getToken(true, true);
          if (token.isIdent())
            s += token.value;
          else
            return null;
        } else
          this.ungetToken();
      } else if (token.isSymbol("|")) {
        s += "|";
        token = this.getToken(true, true);
        if (token.isIdent())
          s += token.value;
        else
          return null;
      }
  
      // nothing, =, *=, $=, ^=, |=
      token = this.getToken(true, true);
      if (token.isIncludes()
          || token.isDashmatch()
          || token.isBeginsmatch()
          || token.isEndsmatch()
          || token.isContainsmatch()
          || token.isSymbol("=")) {
        s += token.value;
      } else
        return null;
  
      token = this.getToken(true, true);
      if (token.isString() || token.isIdent())
        s += token.value;
      else
        return null;
  
      token = this.getToken(true, true);
      if (token.isSymbol("]"))
        s += token.value;
      else
        return null;
    }
    return s;
  },

  parse: function(aString, aTryToPreserveWhitespaces, aTryToPreserveComments) {
    if (!aString)
      return null; // early way out if we can

    this.mPreserveWS       = aTryToPreserveWhitespaces;
    this.mPreserveComments = aTryToPreserveComments;
    this.mScanner.init(aString);
    var sheet = new jscsspStylesheet();

    // @charset can only appear at first char of the stylesheet
    var token = this.getToken(false, false);
    if (!token.isNotNull())
      return;
    if (token.isAtRule("@charset")) {
      this.parseCharsetRule(token, sheet);
    }

    var foundStyleRules = false;
    var foundImportRules = false;
    var foundNameSpaceRules = false;
    while (true) {
      if (!token.isNotNull())
        break;
      if (token.isWhiteSpace())
      {
        if (aTryToPreserveWhitespaces)
          this.addWhitespace(sheet, token.value);
      }

      else if (token.isComment())
      {
        if (this.mPreserveComments)
          this.addComment(sheet, token.value);
      }

      else if (token.isAtRule()) {
        if (token.isAtRule("@import")) {
          // @import rules MUST occur before all style and namespace
          // rules
          if (!foundStyleRules && !foundNameSpaceRules)
            foundImportRules = this.parseImportRule(token, sheet);
          else
            this.addUnknownAtRule(sheet, token.value);
        } else if (token.isAtRule("@namespace")) {
          // @namespace rules MUST occur before all style rule and
          // after all @import rules
          if (!foundStyleRules)
            foundNameSpaceRules = this.parseNamespaceRule(token,
                sheet);
          else
            this.addUnknownAtRule(sheet, token.value);
        } else if (token.isAtRule("@font-face")) {
          if (this.parseFontFaceRule(token, sheet))
            foundStyleRules = true;
          else
            this.addUnknownAtRule(sheet, token.value);
        } else if (token.isAtRule("@page")) {
          if (this.parsePageRule(token, sheet))
            foundStyleRules = true;
          else
            this.addUnknownAtRule(sheet, token.value);
        } else if (token.isAtRule("@media")) {
          if (this.parseMediaRule(token, sheet))
            foundStyleRules = true;
          else
            this.addUnknownAtRule(sheet, token.value);
        }
      }

      else // plain style rules
      {
        this.parseStyleRule(token, sheet);
        foundStyleRules = true;
      }
      token = this.getToken(false);
    }

    return sheet;
  }

};


function jscsspToken(aType, aValue)
{
  this.type = aType;
  this.value = aValue;
}

jscsspToken.NULL_TYPE = 0;

jscsspToken.WHITESPACE_TYPE = 1;
jscsspToken.STRING_TYPE = 2;
jscsspToken.COMMENT_TYPE = 3;
jscsspToken.NUMBER_TYPE = 4;
jscsspToken.IDENT_TYPE = 5;
jscsspToken.FUNCTION_TYPE = 6;
jscsspToken.ATRULE_TYPE = 7;
jscsspToken.INCLUDES_TYPE = 8;
jscsspToken.DASHMATCH_TYPE = 9;
jscsspToken.BEGINSMATCH_TYPE = 10;
jscsspToken.ENDSMATCH_TYPE = 11;
jscsspToken.CONTAINSMATCH_TYPE = 12;
jscsspToken.SYMBOL_TYPE = 13;
jscsspToken.DIMENSION_TYPE = 14;
jscsspToken.PERCENTAGE_TYPE = 15;
jscsspToken.HEX_TYPE = 16;

jscsspToken.prototype = {

  isNotNull: function ()
  {
    return this.type;
  },

  _isOfType: function (aType, aValue)
  {
    return (this.type == aType && (!aValue || this.value.toLowerCase() == aValue));
  },

  isWhiteSpace: function(w)
  {
    return this._isOfType(jscsspToken.WHITESPACE_TYPE, w);
  },

  isString: function()
  {
    return this._isOfType(jscsspToken.STRING_TYPE);
  },

  isComment: function()
  {
    return this._isOfType(jscsspToken.COMMENT_TYPE);
  },

  isNumber: function()
  {
    return this._isOfType(jscsspToken.NUMBER_TYPE);
  },

  isSymbol: function(c)
  {
    return this._isOfType(jscsspToken.SYMBOL_TYPE, c);
  },

  isIdent: function(i)
  {
    return this._isOfType(jscsspToken.IDENT_TYPE, i);
  },

  isFunction: function(f)
  {
    return this._isOfType(jscsspToken.FUNCTION_TYPE, f);
  },

  isAtRule: function(a)
  {
    return this._isOfType(jscsspToken.ATRULE_TYPE, a);
  },

  isIncludes: function()
  {
    return this._isOfType(jscsspToken.INCLUDES_TYPE);
  },

  isDashmatch: function()
  {
    return this._isOfType(jscsspToken.DASHMATCH_TYPE);
  },

  isBeginsmatch: function()
  {
    return this._isOfType(jscsspToken.BEGINSMATCH_TYPE);
  },

  isEndsmatch: function()
  {
    return this._isOfType(jscsspToken.ENDSMATCH_TYPE);
  },

  isContainsmatch: function()
  {
    return this._isOfType(jscsspToken.CONTAINSMATCH_TYPE);
  },

  isSymbol: function(c)
  {
    return this._isOfType(jscsspToken.SYMBOL_TYPE, c);
  },

  isDimension: function()
  {
    return this._isOfType(jscsspToken.DIMENSION_TYPE);
  },

  isPercentage: function()
  {
    return this._isOfType(jscsspToken.PERCENTAGE_TYPE);
  },

  isHex: function()
  {
    return this._isOfType(jscsspToken.HEX_TYPE);
  }
}

const kJscsspUNKNOWN_RULE   = 0;
const kJscsspSTYLE_RULE     = 1
const kJscsspCHARSET_RULE   = 2;
const kJscsspIMPORT_RULE    = 3;
const kJscsspMEDIA_RULE     = 4;
const kJscsspFONT_FACE_RULE = 5;
const kJscsspPAGE_RULE      = 6;

const kJscsspNAMESPACE_RULE = 100;
const kJscsspCOMMENT        = 101;
const kJscsspWHITE_SPACE    = 102;

const kJscsspSTYLE_DECLARATION = 1000;

var gTABS = "";

function jscsspStylesheet()
{
  this.cssRules = [];
}

jscsspStylesheet.prototype = {
  insertRule: function(aRule, aIndex) {
    try {
     this.cssRules.splice(aIndex, 1, aRule);
    }
    catch(e) {
      dump("DOMException: jscsspStylesheet.insertRule\n")
    }
  },

  deleteRule: function(aIndex) {
    try {
      this.cssRules.splice(aIndex);
    }
    catch(e) {
      dump("DOMException: jscsspStylesheet.insertRule\n")
    }
  },

  get cssText() {
    var rv = "";
    for (var i = 0; i < this.cssRules.length; i++)
      rv += this.cssRules[i].cssText + "\n";
    return rv;
  }
};

/* kJscsspCHARSET_RULE */

function jscsspCharsetRule()
{
  this.type = kJscsspCHARSET_RULE;
  this.encoding = null;
  this.parsedCssText = null;
}

jscsspCharsetRule.prototype = {

  get cssText() {
    return "@charset " + this.encoding + ";";
  },

  set cssText(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(false, false);
    if (token.isAtRule("@charset")) {
      if (parser.parseCharsetRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.encoding = newRule.encoding;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspUNKNOWN_RULE */

function jscsspErrorRule()
{
  this.type = kJscsspUNKNOWN_RULE;
  this.parsedCssText = null;
}

jscsspErrorRule.prototype = {
  get cssText() {
    return this.parsedCssText;
  }
};

/* kJscsspCOMMENT */

function jscsspComment()
{
  this.type = kJscsspCOMMENT;
  this.parsedCssText = null;
}

jscsspComment.prototype = {
  get cssText() {
    return this.parsedCssText;
  },

  set cssText(val) {
    var parser = new CSSParser(val);
    var token = parser.getToken(true, false);
    if (token.isComment())
      this.parsedCssText = token.value;
    else
      throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspWHITE_SPACE */

function jscsspWhitespace()
{
  this.type = kJscsspWHITE_SPACE;
  this.parsedCssText = null;
}

/* kJscsspIMPORT_RULE */

function jscsspImportRule()
{
  this.type = kJscsspIMPORT_RULE;
  this.parsedCssText = null;
  this.href = null;
  this.media = []; 
}

jscsspImportRule.prototype = {
  get cssText() {
    var mediaString = this.media.join(", ");
    return "@import " + (mediaString ? mediaString + " " : "")
                      + this.href
                      + ";";
  },

  set cssText(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (token.isAtRule("@import")) {
      if (parser.parseImportRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.href = newRule.href;
        this.media = newRule.media;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspNAMESPACE_RULE */

function jscsspNamespaceRule()
{
  this.type = kJscsspNAMESPACE_RULE;
  this.parsedCssText = null;
  this.prefix = null;
  this.url = null;
}

jscsspNamespaceRule.prototype = {
  get cssText() {
    return "@namespace" + (this.prefix ? this.prefix + " ": "")
                        + this.url
                        + ";";
  },

  set cssText(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (token.isAtRule("@namespace")) {
      if (parser.parseNamespaceRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.url = newRule.url;
        this.prefix = newRule.prefix;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspSTYLE_DECLARATION */

function jscsspDeclaration()
{
  this.type = kJscsspSTYLE_DECLARATION;
  this.property = null;
  this.value = null;
  this.priority = null;
  this.parsedCssText = null;
}

jscsspDeclaration.prototype = {
  get cssText() {
    return this.property + ": "
                    + this.value
                    + (this.priority ? " !important" : "")
                    + ";";
  },

  set cssText(val) {
    var declarations = [];
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (parser.parseDeclaration(token, declarations, true)
        && declarations.length
        && declarations[0].type == kJscsspSTYLE_DECLARATION) {
      var newDecl = declarations.cssRules[0];
      this.property = newDecl.property;
      this.value = newDecl.value;
      this.priority = newDecl.priority;
      this.parsedCssText = newRule.parsedCssText;
      return;
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspFONT_FACE_RULE */

function jscsspFontFaceRule()
{
  this.type = kJscsspFONT_FACE_RULE;
  this.parsedCssText = null;
  this.descriptors = [];
}

jscsspFontFaceRule.prototype = {
  get cssText() {
    var rv = gTABS + "@font-face {\n";
    var preservedGTABS = gTABS;
    gTABS += "  ";
    for (var i = 0; i < this.descriptors.length; i++)
      rv += gTABS + this.descriptors[i].cssText + "\n";
    gTABS = preservedGTABS;
    return rv + gTABS + "}";
  },

  set cssText(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (token.isAtRule("@font-face")) {
      if (parser.parseFontFaceRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.descriptors = newRule.descriptors;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspMEDIA_RULE */

function jscsspMediaRule()
{
  this.type = kJscsspMEDIA_RULE;
  this.parsedCssText = null;
  this.cssRules = [];
  this.media = [];
}

jscsspMediaRule.prototype = {
  get cssText() {
    var rv = gTABS + "@media " + this.media.join(", ") + " {\n";
    var preservedGTABS = gTABS;
    gTABS += "  ";
    for (var i = 0; i < this.cssRules.length; i++)
      rv += gTABS + this.cssRules[i].cssText + "\n";
    gTABS = preservedGTABS;
    return rv + gTABS + "}";
  },

  set cssText(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (token.isAtRule("@media")) {
      if (parser.parseMediaRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.cssRules = newRule.cssRules;
        this.media = newRule.media;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspSTYLE_RULE */

function jscsspStyleRule()
{
  this.type = kJscsspSTYLE_RULE;
  this.parsedCssText = null;
  this.declarations = []
  this.mSelectorText = null;
}

jscsspStyleRule.prototype = {
  get cssText() {
    var rv = this.mSelectorText + " {\n";
    var preservedGTABS = gTABS;
    gTABS += "  ";
    for (var i = 0; i < this.declarations.length; i++)
      rv += gTABS + this.declarations[i].cssText + "\n";
    gTABS = preservedGTABS;
    return rv + gTABS + "}";
  },

  set cssText(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (!token.isNotNull()) {
      if (parser.parseStyleRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.mSelectorText = newRule.mSelectorText;
        this.declarations = newRule.declarations;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  },

  get selectorText() {
    return this.mSelectorText;
  },

  set selectorText(val) {
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (!token.isNotNull()) {
      var s = parser.parseSelector(token, true);
      if (s) {
        this.mSelectorText = s;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

/* kJscsspPAGE_RULE */

function jscsspPageRule()
{
  this.type = kJscsspPAGE_RULE;
  this.parsedCssText = null;
  this.pageSelector = null;
  this.declarations = [];
}

jscsspPageRule.prototype = {
  get cssText() {
    var rv = gTABS + "@page " + (this.mediaSelector ? this.mediaSelector : "")
                   + " {\n";
    var preservedGTABS = gTABS;
    gTABS += "  ";
    for (var i = 0; i < this.declarations.length; i++)
      rv += gTABS + this.declarations[i].cssText + "\n";
    gTABS = preservedGTABS;
    return rv + gTABS + "}";
  },

  set cssText(val) {
    var sheet = {cssRules: []};
    var parser = new CSSParser(val);
    var token = parser.getToken(true, true);
    if (token.isAtRule("@page")) {
      if (parser.parsePageRule(token, sheet)) {
        var newRule = sheet.cssRules[0];
        this.pageSelector = newRule.pageSelector;
        this.declarations = newRule.declarations;
        this.parsedCssText = newRule.parsedCssText;
        return;
      }
    }
    throw DOMException.SYNTAX_ERR;
  }
};

