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

var CSSScanner = {

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
    if (c != -1)
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

var CSSParser = {
  mToken : null,
  mLookAhead : null,

  init: function(aString) {
    this.mToken = null;
    this.mLookAhead = null;
    CSSScanner.init(aString);
  },

  getToken: function(aSkipWS, aSkipComment) {
    if (this.mLookAhead) {
      this.mToken = this.mLookAhead;
      this.mLookAhead = null;
      return this.mToken;
    }

    this.mToken = CSSScanner.nextToken();
    while (this.mToken &&
           ((aSkipWS && this.mToken.isWhitespace()) ||
            (aSkipComment && this.mToken.isComment())))
      this.mToken = CSSScanner.nextToken();
    return this.mToken;
  },

  lookAhead: function(aSkipWS, aSkipComment) {
    var preservedToken = this.mToken;
    CSSScanner.preserveState();
    var token = this.getToken(aSkipWS, aSkipComment);
    CSSScanner.restoreState();
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
    CSSScanner.preserveState();
    var valid = false;
    var token = this.getToken(true, true);
    if (token.isNotNull() && token.isString()) {
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
        CSSScanner.forgetState();
        var rule = new jscsspImportRule();
        rule.parsedCssText = s;
        rule.href = href;
        rule.media = media;
        aSheet.cssRules.push(rule);
        return true;
      }
    }
    CSSScanner.restoreState();
    this.addUnknownAtRule(aSheet, "@import");
    return false;
  },

  parseNamespaceRule: function(aToken, aSheet) {
    var s = aToken.value;
    var valid = false;
    CSSScanner.preserveState();
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
        } else if (token.isFunction("url(")) {
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
            } else if (token.isWhitespace()) {
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
          CSSScanner.forgetState();
          var rule = new jscsspNamespaceRule();
          rule.parsedCssText = s;
          rule.prefix = prefix;
          rule.url = url;
          aSheet.cssRules.push(rule);
          return true;
        }
      }

    }
    CSSScanner.restoreState();
    this.addUnknownAtRule(aSheet, "@namespace");
    return false;
  },

  parseFontFaceRule: function(aToken, aSheet) {
    var s = aToken.value;
    var valid = false;
    var descriptors = [];
    CSSScanner.preserveState();
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
      CSSScanner.forgetState();
      var rule = new jscsspFontFaceRule();
      rule.parsedCssText = s;
      rule.descriptors = descriptors;
      aSheet.cssRules.push(rule)
      return true;
    }
    CSSScanner.restoreState();
    return false;
  },

  parsePageRule: function(aToken, aSheet) {
    var s = aToken.value;
    var valid = false;
    var declarations = [];
    CSSScanner.preserveState();
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
      CSSScanner.forgetState();
      var rule = new jscsspPageRule();
      rule.parsedCssText = s;
      rule.pageSelector = pageSelector;
      rule.declarations = declarations;
      aSheet.cssRules.push(rule)
      return true;
    }
    CSSScanner.restoreState();
    return false;
  },

  parseDeclaration: function(aToken, aDecl, aAcceptPriority) {
    CSSScanner.preserveState();
    var blocks = [];
    if (aToken.isIdent()) {
      var descriptor = aToken.value;
      var token = this.getToken(true, true);
      if (token.isSymbol(":")) {
        var token = this.getToken(true, true);
        var value = "";
        var foundPriority = false;
        while (token.isNotNull()) {
          if ((token.isSymbol(";") || token.isSymbol("}"))
              && !blocks.length) {
            if (token.isSymbol("}"))
              this.ungetToken();
            break;
          } else {
            // if we already found !important, the only token we
            // should accept is whitespace; it's an error otherwise
            if (foundPriority && !token.isWhitespace()) {
              descriptor = "";
              value = "";
              break;
            }
            value += token.value;
          }

          if (token.isSymbol("!")) {
            token = this.getToken(true, true);
            if (token.isIdent("important")
                && aAcceptPriority)
              foundPriority = true;
            else {
              // !something_else, it's an error...
              descriptor = "";
              value = "";
              break;
            }
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
          } else if (foundPriority && aAcceptPriority) {
            descriptor = "";
            value = "";
            break;
          }
          token = this.getToken(false, true);
        }
        if (descriptor && value) {
          CSSScanner.forgetState();
          var decl = new jscsspDeclaration();
          decl.property = descriptor;
          decl.value = value;
          decl.parsedCssText = descriptor + ": " + value + ";";
          aDecl.push(decl);
          return decl.parsedCssText;
        }
      }
    } else if (aToken.isComment()) {
      CSSScanner.forgetState();
      var comment = new jscsspComment();
      comment.parsedCssText = aToken.value;
      aDecl.push(comment);
      return comment.parsedCssText;
    }

    // we have an error here, let's skip it
    CSSScanner.restoreState();
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
    CSSScanner.preserveState();
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
        if (token.isComment()) {
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
        token = this.getToken(true, true);
      }
    }
    if (valid) {
      CSSScanner.forgetState();
      mediaRule.parsedCssText = s;
      aSheet.cssRules.push(mediaRule);
      return true;
    }
    CSSScanner.restoreState();
    return false;
  },

  parseStyleRule: function(aToken, aCssRules) {
    // first let's see if we have a selector here...
    var selector = this.parseSelector(aToken, false);
    var valid = false;
    var declarations = [];
    if (selector) {
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
          && (token.isWhitespace()
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

    this.init(aString);
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
      if (token.isWhitespace())
      {
        if (aTryToPreserveWhitespaces)
          this.addWhitespace(sheet, token.value);
      }

      else if (token.isComment())
      {
        if (aTryToPreserveComments)
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

jscsspToken.prototype = {

  isNotNull: function ()
  {
    return this.type;
  },

  _isOfType: function (aType, aValue)
  {
    return (this.type == aType && (!aValue || this.value.toLowerCase() == aValue));
  },

  isWhitespace: function(w)
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
    CSSParser.init(val);
    var token = CSSParser.getToken(false, false);
    if (token.isAtRule("@charset")) {
      if (CSSParser.parseCharsetRule(token, sheet)) {
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
    CSSParser.init(val);
    var token = CSSParser.getToken(true, false);
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
    CSSParser.init(val);
    var token = CSSParser.getToken(true, true);
    if (token.isAtRule("@import")) {
      if (CSSParser.parseImportRule(token, sheet)) {
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
    CSSParser.init(val);
    var token = CSSParser.getToken(true, true);
    if (token.isAtRule("@namespace")) {
      if (CSSParser.parseNamespaceRule(token, sheet)) {
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
                    + (this.priority ? this.priority : "")
                    + ";";
  },

  set cssText(val) {
    var declarations = [];
    CSSParser.init(val);
    var token = CSSParser.getToken(true, true);
    if (CSSParser.parseDeclaration(token, declarations, true)
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
    CSSParser.init(val);
    var token = CSSParser.getToken(true, true);
    if (token.isAtRule("@font-face")) {
      if (CSSParser.parseFontFaceRule(token, sheet)) {
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
      rv += this.cssRules[i].cssText + "\n";
    gTABS = preservedGTABS;
    return rv + gTABS + "}";
  },

  set cssText(val) {
    var sheet = {cssRules: []};
    CSSParser.init(val);
    var token = CSSParser.getToken(true, true);
    if (token.isAtRule("@media")) {
      if (CSSParser.parseMediaRule(token, sheet)) {
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
  this.mSelectorText = null;;
}

jscsspStyleRule.prototype = {
  get cssText() {
    var rv = gTABS + this.mSelectorText + " {\n";
    var preservedGTABS = gTABS;
    gTABS += "  ";
    for (var i = 0; i < this.declarations.length; i++)
      rv += gTABS + this.declarations[i].cssText + "\n";
    gTABS = preservedGTABS;
    return rv + gTABS + "}";
  },

  set cssText(val) {
    var sheet = {cssRules: []};
    CSSParser.init(val);
    var token = CSSParser.getToken(true, true);
    if (!token.isNotNull()) {
      if (CSSParser.parseStyleRule(token, sheet)) {
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
    CSSParser.init(val);
    var token = CSSParser.getToken(true, true);
    if (!token.isNotNull()) {
      var s = CSSParser.parseSelector(token, true);
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
    CSSParser.init(val);
    var token = CSSParser.getToken(true, true);
    if (token.isAtRule("@page")) {
      if (CSSParser.parsePageRule(token, sheet)) {
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
