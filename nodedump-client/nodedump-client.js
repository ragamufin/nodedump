(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(hljs) {
  var KEYWORDS = {
    keyword:
      // JS keywords
      'in if for while finally new do return else break catch instanceof throw try this ' +
      'switch continue typeof delete debugger super ' +
      // Coffee keywords
      'then unless until loop of by when and or is isnt not',
    literal:
      // JS literals
      'true false null undefined ' +
      // Coffee literals
      'yes no on off ',
    reserved: 'case default function var void with const let enum export import native ' +
      '__hasProp __extends __slice __bind __indexOf'
  };
  var JS_IDENT_RE = '[A-Za-z$_][0-9A-Za-z$_]*';
  var TITLE = {className: 'title', begin: JS_IDENT_RE};
  var SUBST = {
    className: 'subst',
    begin: '#\\{', end: '}',
    keywords: KEYWORDS,
    contains: [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE]
  };

  return {
    keywords: KEYWORDS,
    contains: [
      // Numbers
      hljs.BINARY_NUMBER_MODE,
      hljs.C_NUMBER_MODE,
      // Strings
      hljs.APOS_STRING_MODE,
      {
        className: 'string',
        begin: '"""', end: '"""',
        contains: [hljs.BACKSLASH_ESCAPE, SUBST]
      },
      {
        className: 'string',
        begin: '"', end: '"',
        contains: [hljs.BACKSLASH_ESCAPE, SUBST],
        relevance: 0
      },
      // Comments
      {
        className: 'comment',
        begin: '###', end: '###'
      },
      hljs.HASH_COMMENT_MODE,
      {
        className: 'regexp',
        begin: '///', end: '///',
        contains: [hljs.HASH_COMMENT_MODE]
      },
      {
        className: 'regexp', begin: '//[gim]*'
      },
      {
        className: 'regexp',
        begin: '/\\S(\\\\.|[^\\n])*/[gim]*' // \S is required to parse x / 2 / 3 as two divisions
      },
      {
        begin: '`', end: '`',
        excludeBegin: true, excludeEnd: true,
        subLanguage: 'javascript'
      },
      {
        className: 'function',
        begin: JS_IDENT_RE + '\\s*=\\s*(\\(.+\\))?\\s*[-=]>',
        returnBegin: true,
        contains: [
          TITLE,
          {
            className: 'params',
            begin: '\\(', end: '\\)'
          }
        ]
      },
      {
        className: 'class',
        beginWithKeyword: true, keywords: 'class',
        end: '$',
        illegal: ':',
        contains: [
          {
            beginWithKeyword: true, keywords: 'extends',
            endsWithParent: true,
            illegal: ':',
            contains: [TITLE]
          },
          TITLE
        ]
      },
      {
        className: 'property',
        begin: '@' + JS_IDENT_RE
      }
    ]
  };
};
},{}],2:[function(require,module,exports){
module.exports = function(hljs) {
  var FUNCTION = {
    className: 'function',
    begin: hljs.IDENT_RE + '\\(', end: '\\)',
    contains: [hljs.NUMBER_MODE, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE]
  };
  return {
    case_insensitive: true,
    illegal: '[=/|\']',
    contains: [
      hljs.C_BLOCK_COMMENT_MODE,
      {
        className: 'id', begin: '\\#[A-Za-z0-9_-]+'
      },
      {
        className: 'class', begin: '\\.[A-Za-z0-9_-]+',
        relevance: 0
      },
      {
        className: 'attr_selector',
        begin: '\\[', end: '\\]',
        illegal: '$'
      },
      {
        className: 'pseudo',
        begin: ':(:)?[a-zA-Z0-9\\_\\-\\+\\(\\)\\"\\\']+'
      },
      {
        className: 'at_rule',
        begin: '@(font-face|page)',
        lexems: '[a-z-]+',
        keywords: 'font-face page'
      },
      {
        className: 'at_rule',
        begin: '@', end: '[{;]', // at_rule eating first "{" is a good thing
                                 // because it doesn’t let it to be parsed as
                                 // a rule set but instead drops parser into
                                 // the default mode which is how it should be.
        excludeEnd: true,
        keywords: 'import page media charset',
        contains: [
          FUNCTION,
          hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE,
          hljs.NUMBER_MODE
        ]
      },
      {
        className: 'tag', begin: hljs.IDENT_RE,
        relevance: 0
      },
      {
        className: 'rules',
        begin: '{', end: '}',
        illegal: '[^\\s]',
        relevance: 0,
        contains: [
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: 'rule',
            begin: '[^\\s]', returnBegin: true, end: ';', endsWithParent: true,
            contains: [
              {
                className: 'attribute',
                begin: '[A-Z\\_\\.\\-]+', end: ':',
                excludeEnd: true,
                illegal: '[^\\s]',
                starts: {
                  className: 'value',
                  endsWithParent: true, excludeEnd: true,
                  contains: [
                    FUNCTION,
                    hljs.NUMBER_MODE,
                    hljs.QUOTE_STRING_MODE,
                    hljs.APOS_STRING_MODE,
                    hljs.C_BLOCK_COMMENT_MODE,
                    {
                      className: 'hexcolor', begin: '\\#[0-9A-F]+'
                    },
                    {
                      className: 'important', begin: '!important'
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  };
};
},{}],3:[function(require,module,exports){
var hljs = new function() {

  /* Utility functions */

  function escape(value) {
    return value.replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
  }

  function findCode(pre) {
    for (var node = pre.firstChild; node; node = node.nextSibling) {
      if (node.nodeName == 'CODE')
        return node;
      if (!(node.nodeType == 3 && node.nodeValue.match(/\s+/)))
        break;
    }
  }

  function blockText(block, ignoreNewLines) {
    return Array.prototype.map.call(block.childNodes, function(node) {
      if (node.nodeType == 3) {
        return ignoreNewLines ? node.nodeValue.replace(/\n/g, '') : node.nodeValue;
      }
      if (node.nodeName == 'BR') {
        return '\n';
      }
      return blockText(node, ignoreNewLines);
    }).join('');
  }

  function blockLanguage(block) {
    var classes = (block.className + ' ' + block.parentNode.className).split(/\s+/);
    classes = classes.map(function(c) {return c.replace(/^language-/, '')});
    for (var i = 0; i < classes.length; i++) {
      if (languages[classes[i]] || classes[i] == 'no-highlight') {
        return classes[i];
      }
    }
  }

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function _nodeStream(node, offset) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType == 3)
          offset += child.nodeValue.length;
        else if (child.nodeName == 'BR')
          offset += 1;
        else if (child.nodeType == 1) {
          result.push({
            event: 'start',
            offset: offset,
            node: child
          });
          offset = _nodeStream(child, offset);
          result.push({
            event: 'stop',
            offset: offset,
            node: child
          });
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(stream1, stream2, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (stream1.length && stream2.length) {
        if (stream1[0].offset != stream2[0].offset)
          return (stream1[0].offset < stream2[0].offset) ? stream1 : stream2;
        else {
          /*
          To avoid starting the stream just before it should stop the order is
          ensured that stream1 always starts first and closes last:

          if (event1 == 'start' && event2 == 'start')
            return stream1;
          if (event1 == 'start' && event2 == 'stop')
            return stream2;
          if (event1 == 'stop' && event2 == 'start')
            return stream1;
          if (event1 == 'stop' && event2 == 'stop')
            return stream2;

          ... which is collapsed to:
          */
          return stream2[0].event == 'start' ? stream1 : stream2;
        }
      } else {
        return stream1.length ? stream1 : stream2;
      }
    }

    function open(node) {
      function attr_str(a) {return ' ' + a.nodeName + '="' + escape(a.value) + '"'};
      return '<' + node.nodeName + Array.prototype.map.call(node.attributes, attr_str).join('') + '>';
    }

    while (stream1.length || stream2.length) {
      var current = selectStream().splice(0, 1)[0];
      result += escape(value.substr(processed, current.offset - processed));
      processed = current.offset;
      if ( current.event == 'start') {
        result += open(current.node);
        nodeStack.push(current.node);
      } else if (current.event == 'stop') {
        var node, i = nodeStack.length;
        do {
          i--;
          node = nodeStack[i];
          result += ('</' + node.nodeName.toLowerCase() + '>');
        } while (node != current.node);
        nodeStack.splice(i, 1);
        while (i < nodeStack.length) {
          result += open(nodeStack[i]);
          i++;
        }
      }
    }
    return result + escape(value.substr(processed));
  }

  /* Initialization */

  function compileLanguage(language) {

    function langRe(value, global) {
      return RegExp(
        value,
        'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : '')
      );
    }

    function compileMode(mode, parent) {
      if (mode.compiled)
        return;
      mode.compiled = true;

      var keywords = []; // used later with beginWithKeyword but filled as a side-effect of keywords compilation
      if (mode.keywords) {
        var compiled_keywords = {};

        function flatten(className, str) {
          str.split(' ').forEach(function(kw) {
            var pair = kw.split('|');
            compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];
            keywords.push(pair[0]);
          });
        }

        mode.lexemsRe = langRe(mode.lexems || hljs.IDENT_RE, true);
        if (typeof mode.keywords == 'string') { // string
          flatten('keyword', mode.keywords)
        } else {
          for (var className in mode.keywords) {
            if (!mode.keywords.hasOwnProperty(className))
              continue;
            flatten(className, mode.keywords[className]);
          }
        }
        mode.keywords = compiled_keywords;
      }
      if (parent) {
        if (mode.beginWithKeyword) {
          mode.begin = '\\b(' + keywords.join('|') + ')\\s';
        }
        mode.beginRe = langRe(mode.begin ? mode.begin : '\\B|\\b');
        if (!mode.end && !mode.endsWithParent)
          mode.end = '\\B|\\b';
        if (mode.end)
          mode.endRe = langRe(mode.end);
        mode.terminator_end = mode.end || '';
        if (mode.endsWithParent && parent.terminator_end)
          mode.terminator_end += (mode.end ? '|' : '') + parent.terminator_end;
      }
      if (mode.illegal)
        mode.illegalRe = langRe(mode.illegal);
      if (mode.relevance === undefined)
        mode.relevance = 1;
      if (!mode.contains) {
        mode.contains = [];
      }
      for (var i = 0; i < mode.contains.length; i++) {
        if (mode.contains[i] == 'self') {
          mode.contains[i] = mode;
        }
        compileMode(mode.contains[i], mode);
      }
      if (mode.starts) {
        compileMode(mode.starts, parent);
      }

      var terminators = [];
      for (var i = 0; i < mode.contains.length; i++) {
        terminators.push(mode.contains[i].begin);
      }
      if (mode.terminator_end) {
        terminators.push(mode.terminator_end);
      }
      if (mode.illegal) {
        terminators.push(mode.illegal);
      }
      mode.terminators = terminators.length ? langRe(terminators.join('|'), true) : {exec: function(s) {return null;}};
    }

    compileMode(language);
  }

  /*
  Core highlighting function. Accepts a language name and a string with the
  code to highlight. Returns an object with the following properties:

  - relevance (int)
  - keyword_count (int)
  - value (an HTML string with highlighting markup)

  */
  function highlight(language_name, value) {

    function subMode(lexem, mode) {
      for (var i = 0; i < mode.contains.length; i++) {
        var match = mode.contains[i].beginRe.exec(lexem);
        if (match && match.index == 0) {
          return mode.contains[i];
        }
      }
    }

    function endOfMode(mode, lexem) {
      if (mode.end && mode.endRe.test(lexem)) {
        return mode;
      }
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, lexem);
      }
    }

    function isIllegal(lexem, mode) {
      return mode.illegal && mode.illegalRe.test(lexem);
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];
      return mode.keywords.hasOwnProperty(match_str) && mode.keywords[match_str];
    }

    function processKeywords() {
      var buffer = escape(mode_buffer);
      if (!top.keywords)
        return buffer;
      var result = '';
      var last_index = 0;
      top.lexemsRe.lastIndex = 0;
      var match = top.lexemsRe.exec(buffer);
      while (match) {
        result += buffer.substr(last_index, match.index - last_index);
        var keyword_match = keywordMatch(top, match);
        if (keyword_match) {
          keyword_count += keyword_match[1];
          result += '<span class="'+ keyword_match[0] +'">' + match[0] + '</span>';
        } else {
          result += match[0];
        }
        last_index = top.lexemsRe.lastIndex;
        match = top.lexemsRe.exec(buffer);
      }
      return result + buffer.substr(last_index);
    }

    function processSubLanguage() {
      if (top.subLanguage && !languages[top.subLanguage]) {
        return escape(mode_buffer);
      }
      var result = top.subLanguage ? highlight(top.subLanguage, mode_buffer) : highlightAuto(mode_buffer);
      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Usecase in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        keyword_count += result.keyword_count;
        relevance += result.relevance;
      }
      return '<span class="' + result.language  + '">' + result.value + '</span>';
    }

    function processBuffer() {
      return top.subLanguage !== undefined ? processSubLanguage() : processKeywords();
    }

    function startNewMode(mode, lexem) {
      var markup = mode.className? '<span class="' + mode.className + '">': '';
      if (mode.returnBegin) {
        result += markup;
        mode_buffer = '';
      } else if (mode.excludeBegin) {
        result += escape(lexem) + markup;
        mode_buffer = '';
      } else {
        result += markup;
        mode_buffer = lexem;
      }
      top = Object.create(mode, {parent: {value: top}});
      relevance += mode.relevance;
    }

    function processLexem(buffer, lexem) {
      mode_buffer += buffer;
      if (lexem === undefined) {
        result += processBuffer();
        return 0;
      }

      var new_mode = subMode(lexem, top);
      if (new_mode) {
        result += processBuffer();
        startNewMode(new_mode, lexem);
        return new_mode.returnBegin ? 0 : lexem.length;
      }

      var end_mode = endOfMode(top, lexem);
      if (end_mode) {
        if (!(end_mode.returnEnd || end_mode.excludeEnd)) {
          mode_buffer += lexem;
        }
        result += processBuffer();
        do {
          if (top.className) {
            result += '</span>';
          }
          top = top.parent;
        } while (top != end_mode.parent);
        if (end_mode.excludeEnd) {
          result += escape(lexem);
        }
        mode_buffer = '';
        if (end_mode.starts) {
          startNewMode(end_mode.starts, '');
        }
        return end_mode.returnEnd ? 0 : lexem.length;
      }

      if (isIllegal(lexem, top))
        throw 'Illegal';

      /*
      Parser should not reach this point as all types of lexems should be caught
      earlier, but if it does due to some bug make sure it advances at least one
      character forward to prevent infinite looping.
      */
      mode_buffer += lexem;
      return lexem.length || 1;
    }

    var language = languages[language_name];
    compileLanguage(language);
    var top = language;
    var mode_buffer = '';
    var relevance = 0;
    var keyword_count = 0;
    var result = '';
    try {
      var match, count, index = 0;
      while (true) {
        top.terminators.lastIndex = index;
        match = top.terminators.exec(value);
        if (!match)
          break;
        count = processLexem(value.substr(index, match.index - index), match[0]);
        index = match.index + count;
      }
      processLexem(value.substr(index))
      return {
        relevance: relevance,
        keyword_count: keyword_count,
        value: result,
        language: language_name
      };
    } catch (e) {
      if (e == 'Illegal') {
        return {
          relevance: 0,
          keyword_count: 0,
          value: escape(value)
        };
      } else {
        throw e;
      }
    }
  }

  /*
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:

  - language (detected language)
  - relevance (int)
  - keyword_count (int)
  - value (an HTML string with highlighting markup)
  - second_best (object with the same structure for second-best heuristically
    detected language, may be absent)

  */
  function highlightAuto(text) {
    var result = {
      keyword_count: 0,
      relevance: 0,
      value: escape(text)
    };
    var second_best = result;
    for (var key in languages) {
      if (!languages.hasOwnProperty(key))
        continue;
      var current = highlight(key, text);
      current.language = key;
      if (current.keyword_count + current.relevance > second_best.keyword_count + second_best.relevance) {
        second_best = current;
      }
      if (current.keyword_count + current.relevance > result.keyword_count + result.relevance) {
        second_best = result;
        result = current;
      }
    }
    if (second_best.language) {
      result.second_best = second_best;
    }
    return result;
  }

  /*
  Post-processing of the highlighted markup:

  - replace TABs with something more useful
  - replace real line-breaks with '<br>' for non-pre containers

  */
  function fixMarkup(value, tabReplace, useBR) {
    if (tabReplace) {
      value = value.replace(/^((<[^>]+>|\t)+)/gm, function(match, p1, offset, s) {
        return p1.replace(/\t/g, tabReplace);
      });
    }
    if (useBR) {
      value = value.replace(/\n/g, '<br>');
    }
    return value;
  }

  /*
  Applies highlighting to a DOM node containing code. Accepts a DOM node and
  two optional parameters for fixMarkup.
  */
  function highlightBlock(block, tabReplace, useBR) {
    var text = blockText(block, useBR);
    var language = blockLanguage(block);
    if (language == 'no-highlight')
        return;
    var result = language ? highlight(language, text) : highlightAuto(text);
    language = result.language;
    var original = nodeStream(block);
    if (original.length) {
      var pre = document.createElement('pre');
      pre.innerHTML = result.value;
      result.value = mergeStreams(original, nodeStream(pre), text);
    }
    result.value = fixMarkup(result.value, tabReplace, useBR);

    var class_name = block.className;
    if (!class_name.match('(\\s|^)(language-)?' + language + '(\\s|$)')) {
      class_name = class_name ? (class_name + ' ' + language) : language;
    }
    block.innerHTML = result.value;
    block.className = class_name;
    block.result = {
      language: language,
      kw: result.keyword_count,
      re: result.relevance
    };
    if (result.second_best) {
      block.second_best = {
        language: result.second_best.language,
        kw: result.second_best.keyword_count,
        re: result.second_best.relevance
      };
    }
  }

  /*
  Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
  */
  function initHighlighting() {
    if (initHighlighting.called)
      return;
    initHighlighting.called = true;
    Array.prototype.map.call(document.getElementsByTagName('pre'), findCode).
      filter(Boolean).
      forEach(function(code){highlightBlock(code, hljs.tabReplace)});
  }

  /*
  Attaches highlighting to the page load event.
  */
  function initHighlightingOnLoad() {
    window.addEventListener('DOMContentLoaded', initHighlighting, false);
    window.addEventListener('load', initHighlighting, false);
  }

  var languages = {}; // a shortcut to avoid writing "this." everywhere

  /* Interface definition */

  this.LANGUAGES = languages;
  this.highlight = highlight;
  this.highlightAuto = highlightAuto;
  this.fixMarkup = fixMarkup;
  this.highlightBlock = highlightBlock;
  this.initHighlighting = initHighlighting;
  this.initHighlightingOnLoad = initHighlightingOnLoad;

  // Common regexps
  this.IDENT_RE = '[a-zA-Z][a-zA-Z0-9_]*';
  this.UNDERSCORE_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9_]*';
  this.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  this.C_NUMBER_RE = '(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
  this.BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
  this.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  this.BACKSLASH_ESCAPE = {
    begin: '\\\\[\\s\\S]', relevance: 0
  };
  this.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE],
    relevance: 0
  };
  this.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [this.BACKSLASH_ESCAPE],
    relevance: 0
  };
  this.C_LINE_COMMENT_MODE = {
    className: 'comment',
    begin: '//', end: '$'
  };
  this.C_BLOCK_COMMENT_MODE = {
    className: 'comment',
    begin: '/\\*', end: '\\*/'
  };
  this.HASH_COMMENT_MODE = {
    className: 'comment',
    begin: '#', end: '$'
  };
  this.NUMBER_MODE = {
    className: 'number',
    begin: this.NUMBER_RE,
    relevance: 0
  };
  this.C_NUMBER_MODE = {
    className: 'number',
    begin: this.C_NUMBER_RE,
    relevance: 0
  };
  this.BINARY_NUMBER_MODE = {
    className: 'number',
    begin: this.BINARY_NUMBER_RE,
    relevance: 0
  };

  // Utility functions
  this.inherit = function(parent, obj) {
    var result = {}
    for (var key in parent)
      result[key] = parent[key];
    if (obj)
      for (var key in obj)
        result[key] = obj[key];
    return result;
  }
}();
hljs.LANGUAGES['javascript'] = require('./javascript.js')(hljs);
hljs.LANGUAGES['xml'] = require('./xml.js')(hljs);
hljs.LANGUAGES['css'] = require('./css.js')(hljs);
hljs.LANGUAGES['coffeescript'] = require('./coffeescript.js')(hljs);
hljs.LANGUAGES['json'] = require('./json.js')(hljs);
module.exports = hljs;
},{"./coffeescript.js":1,"./css.js":2,"./javascript.js":4,"./json.js":5,"./xml.js":6}],4:[function(require,module,exports){
module.exports = function(hljs) {
  return {
    keywords: {
      keyword:
        'in if for while finally var new function do return void else break catch ' +
        'instanceof with throw case default try this switch continue typeof delete ' +
        'let yield const',
      literal:
        'true false null undefined NaN Infinity'
    },
    contains: [
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_NUMBER_MODE,
      { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          {
            className: 'regexp',
            begin: '/', end: '/[gim]*',
            illegal: '\\n',
            contains: [{begin: '\\\\/'}]
          },
          { // E4X
            begin: '<', end: '>;',
            subLanguage: 'xml'
          }
        ],
        relevance: 0
      },
      {
        className: 'function',
        beginWithKeyword: true, end: '{',
        keywords: 'function',
        contains: [
          {
            className: 'title', begin: '[A-Za-z$_][0-9A-Za-z$_]*'
          },
          {
            className: 'params',
            begin: '\\(', end: '\\)',
            contains: [
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE
            ],
            illegal: '["\'\\(]'
          }
        ],
        illegal: '\\[|%'
      }
    ]
  };
};
},{}],5:[function(require,module,exports){
module.exports = function(hljs) {
  var LITERALS = {literal: 'true false null'};
  var TYPES = [
    hljs.QUOTE_STRING_MODE,
    hljs.C_NUMBER_MODE
  ];
  var VALUE_CONTAINER = {
    className: 'value',
    end: ',', endsWithParent: true, excludeEnd: true,
    contains: TYPES,
    keywords: LITERALS
  };
  var OBJECT = {
    begin: '{', end: '}',
    contains: [
      {
        className: 'attribute',
        begin: '\\s*"', end: '"\\s*:\\s*', excludeBegin: true, excludeEnd: true,
        contains: [hljs.BACKSLASH_ESCAPE],
        illegal: '\\n',
        starts: VALUE_CONTAINER
      }
    ],
    illegal: '\\S'
  };
  var ARRAY = {
    begin: '\\[', end: '\\]',
    contains: [hljs.inherit(VALUE_CONTAINER, {className: null})], // inherit is also a workaround for a bug that makes shared modes with endsWithParent compile only the ending of one of the parents
    illegal: '\\S'
  };
  TYPES.splice(TYPES.length, 0, OBJECT, ARRAY);
  return {
    contains: TYPES,
    keywords: LITERALS,
    illegal: '\\S'
  };
};
},{}],6:[function(require,module,exports){
module.exports = function(hljs) {
  var XML_IDENT_RE = '[A-Za-z0-9\\._:-]+';
  var TAG_INTERNALS = {
    endsWithParent: true,
    contains: [
      {
        className: 'attribute',
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: '="', returnBegin: true, end: '"',
        contains: [{
            className: 'value',
            begin: '"', endsWithParent: true
        }]
      },
      {
        begin: '=\'', returnBegin: true, end: '\'',
        contains: [{
          className: 'value',
          begin: '\'', endsWithParent: true
        }]
      },
      {
        begin: '=',
        contains: [{
          className: 'value',
          begin: '[^\\s/>]+'
        }]
      }
    ]
  };
  return {
    case_insensitive: true,
    contains: [
      {
        className: 'pi',
        begin: '<\\?', end: '\\?>',
        relevance: 10
      },
      {
        className: 'doctype',
        begin: '<!DOCTYPE', end: '>',
        relevance: 10,
        contains: [{begin: '\\[', end: '\\]'}]
      },
      {
        className: 'comment',
        begin: '<!--', end: '-->',
        relevance: 10
      },
      {
        className: 'cdata',
        begin: '<\\!\\[CDATA\\[', end: '\\]\\]>',
        relevance: 10
      },
      {
        className: 'tag',
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending braket. The '$' is needed for the lexem to be recognized
        by hljs.subMode() that tests lexems outside the stream.
        */
        begin: '<style(?=\\s|>|$)', end: '>',
        keywords: {title: 'style'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</style>', returnEnd: true,
          subLanguage: 'css'
        }
      },
      {
        className: 'tag',
        // See the comment in the <style tag about the lookahead pattern
        begin: '<script(?=\\s|>|$)', end: '>',
        keywords: {title: 'script'},
        contains: [TAG_INTERNALS],
        starts: {
          end: '</script>', returnEnd: true,
          subLanguage: 'javascript'
        }
      },
      {
        begin: '<%', end: '%>',
        subLanguage: 'vbscript'
      },
      {
        className: 'tag',
        begin: '</?', end: '/?>',
        contains: [
          {
            className: 'title', begin: '[^ />]+'
          },
          TAG_INTERNALS
        ]
      }
    ]
  };
};
},{}],7:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],8:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],9:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],10:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("+xKvab"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"+xKvab":8,"./support/isBuffer":9,"inherits":7}],11:[function(require,module,exports){
(function (global){
/*
 * @description nodedump - Outputs variables in a visual, easy to read format based on ColdFusion's CFDUMP tag
 * @author Andrew Hewitt <ragamufin@gmail.com>
 * 
 */

/*
* 
 * requires
 */
// var util = require('util');
var format = require('util').format;
// var format = require('format').format;
var hljs = require('./highlight.js/highlight');

/*
 * constants
 */

// Default options
var DEFAULTOPTS = {
	expand: true
	,label:null
	,show:null
	,hide:null
	,top:null
	,levels: null
	,sortKeys: true
	,syntaxHighlight:true
	,dumpFunctionName: 'nodedump'
};

// used to figure out the datatype of a variable
var toClass = {}.toString;

// list of simple types
var SIMPLETYPES = ['String','Number','Boolean','Undefined','Null','Date','Math'];

// output related constants
var TABLE = '<table class="nodedump nodedump-%s"><tbody>%s</tbody></table>';
var ROWHEADER = '<tr><th colspan="2" class="nodedump-label nodedump-%s"%s onclick="nodedump.toggleTable(this);">%s</th></tr>';
var ROW = '<tr%s><td class="nodedump-label nodedump-%s"%s onclick="nodedump.toggleRow(this);">%s</td><td class="nodedump-data"%s>%s</td></tr>';
var ROWHEADER1COL = '<tr><th class="nodedump-label nodedump-%s"%s onclick="nodedump.toggleTable(this);">%s</th></tr>';
var ROW1COL = '<tr%s><td class="nodedump-data">%s</td></tr>';
var EMPTY = ' [empty]';
var ROWHEADEREMPTY = '<tr><th class="nodedump-%s">%s%s</th></tr>';
var ROWEMPTY = '<tr><td class="nodedump-%s">%s%s</td></tr>';
var ERRORDATATYPE = 'Error-thrown';
var TITLEEXPANDED = '';
var TITLECOLLAPSED = '';
var TITLEFILTERED = ' [Filtered - %s]';
var TITLEFILTEREDSHOWN = '%d of %d items shown';
var TITLEFILTEREDHIDDEN = '%d of %d items hidden';
var TITLEFILTEREDTOP = 'Top %d of %d items shown';
var TITLEFILTEREDLEVELS = '%d levels shown';
var EXPANDEDLABELSTYLE = ' title="' +  TITLEEXPANDED + '"';
var COLLAPSEDLABELSTYLE = ' style="font-style: italic;" title="' + TITLECOLLAPSED + '"';
var COLLAPSEDSTYLE = ' style="display:none"';
var CIRCULARREFERENCE = 'Circular-Reference';
var CIRCULARSPLITSTRING = ' &raquo; ';
var CIRCULARTOPSTRINGLIMIT = 12;
var TOP = '[TOP]';
var SYNTAXHIGHLIGHTCSS = '<style type="text/css">\n'
+'/* Google Code style (c) Aahan Krish <geekpanth3r@gmail.com>*/\n'
+'td.nodedump-data pre code{display:block;padding:.5em;background:#fff;color:#000}td.nodedump-data pre .comment,td.nodedump-data pre .template_comment,td.nodedump-data pre .javadoc,td.nodedump-data pre .comment *{color:#800}td.nodedump-data pre .keyword,td.nodedump-data pre .method,td.nodedump-data pre .list .title,td.nodedump-data pre .clojure .built_in,td.nodedump-data pre .nginx .title,td.nodedump-data pre .tag .title,td.nodedump-data pre .setting .value,td.nodedump-data pre .winutils,td.nodedump-data pre .tex .command,td.nodedump-data pre .http .title,td.nodedump-data pre .request,td.nodedump-data pre .status{color:#008}td.nodedump-data pre .envvar,td.nodedump-data pre .tex .special{color:#660}td.nodedump-data pre .string,td.nodedump-data pre .tag .value,td.nodedump-data pre .cdata,td.nodedump-data pre .filter .argument,td.nodedump-data pre .attr_selector,td.nodedump-data pre .apache .cbracket,td.nodedump-data pre .date,td.nodedump-data pre .regexp{color:#080}td.nodedump-data pre .sub .identifier,td.nodedump-data pre .pi,td.nodedump-data pre .tag,td.nodedump-data pre .tag .keyword,td.nodedump-data pre .decorator,td.nodedump-data pre .ini .title,td.nodedump-data pre .shebang,td.nodedump-data pre .prompt,td.nodedump-data pre .hexcolor,td.nodedump-data pre .rules .value,td.nodedump-data pre .css .value .number,td.nodedump-data pre .literal,td.nodedump-data pre .symbol,td.nodedump-data pre .ruby .symbol .string,td.nodedump-data pre .number,td.nodedump-data pre .css .function,td.nodedump-data pre .clojure .attribute{color:#066}td.nodedump-data pre .class .title,td.nodedump-data pre .haskell .type,td.nodedump-data pre .smalltalk .class,td.nodedump-data pre .javadoctag,td.nodedump-data pre .yardoctag,td.nodedump-data pre .phpdoc,td.nodedump-data pre .typename,td.nodedump-data pre .tag .attribute,td.nodedump-data pre .doctype,td.nodedump-data pre .class .id,td.nodedump-data pre .built_in,td.nodedump-data pre .setting,td.nodedump-data pre .params,td.nodedump-data pre .variable,td.nodedump-data pre .clojure .title{color:#606}td.nodedump-data pre .css .tag,td.nodedump-data pre .rules .property,td.nodedump-data pre .pseudo,td.nodedump-data pre .subst{color:#000}td.nodedump-data pre .css .class,td.nodedump-data pre .css .id{color:#9B703F}td.nodedump-data pre .value .important{color:#f70;font-weight:700}td.nodedump-data pre .rules .keyword{color:#C5AF75}td.nodedump-data pre .annotation,td.nodedump-data pre .apache .sqbracket,td.nodedump-data pre .nginx .built_in{color:#9B859D}td.nodedump-data pre .preprocessor,td.nodedump-data pre .preprocessor *{color:#444}td.nodedump-data pre .tex .formula{background-color:#EEE;font-style:italic}td.nodedump-data pre .diff .header,td.nodedump-data pre .chunk{color:gray;font-weight:700}td.nodedump-data pre .diff .change{background-color:#BCCFF9}td.nodedump-data pre .addition{background-color:#BAEEBA}td.nodedump-data pre .deletion{background-color:#FFC8BD}td.nodedump-data pre .comment .yardoctag{font-weight:700}'
+'</style>';
var CSS = '<style type="text/css">\n'
+'/* nodedump styles */\n'
+ 'table.nodedump, table.nodedump th, table.nodedump td { border-collapse: separate; border-spacing:2px; width: auto; line-height:normal; }\
table.nodedump {\
	font-size: x-small;\
	font-family: verdana, arial, helvetica, sans-serif;\
	cell-spacing: 2px;\
	background-color: #dddddd;\
	color: #222222;\
}\
table.nodedump .nodedump-label { cursor:pointer; }\
--table.nodedump td, table.nodedump th { background-color: #eeeeee; }\
--table.nodedump { background-color: #aaaaaa; }\
--table.nodedump th { text-align: left; color: white; padding: 5px; background-color: #cccccc; }\
--table.nodedump td { vertical-align : top; padding: 3px; background-color: #eeeeee; }\
table.nodedump { background-color: #707000; }\
table.nodedump th { text-align: left; color: white; padding: 5px; background-color: #ADAD00; }\
table.nodedump td { vertical-align : top; padding: 3px; background-color: #FFFF9E; }\
\n\
table.nodedump td.nodedump-data { background-color: #ffffff; }\
table.nodedump td.nodedump-data pre { line-height:normal; background-color: #ffffff; border:0; padding:0; }\n\
table.nodedump td.nodedump-data pre code { font-size: small; font-family: Consolas, Menlo, Monaco, Lucida Console, monospace; Courier New, monospace, serif; }\n\
\n\
table.nodedump-String { background-color: #888888; }\
table.nodedump-String td.nodedump-String { background-color: #dddddd; }\
table.nodedump-Number { background-color: #FF8833; }\
table.nodedump-Number td.nodedump-Number { background-color: #FFB885; }\
table.nodedump-Boolean { background-color : #eebb00; }\
table.nodedump-Boolean td.nodedump-Boolean { background-color: #FFDA75; }\
table.nodedump-Boolean td.nodedump-data span.nodedump-no { color: #aa0000; }\
table.nodedump-Boolean td.nodedump-data span.nodedump-yes { color: #008800; }\
table.nodedump-Date { background-color: #CE8D98; }\
table.nodedump-Date td.nodedump-Date { background-color: #ffcbd4; }\
table.nodedump-Math td.nodedump-data { color: white; font-weight: bold; background-color: #ADAD00; }\
table.nodedump-Null, table.nodedump-Undefined { background-color: #333333; }\
table.nodedump-Null td.nodedump-data, table.nodedump-Undefined td.nodedump-data { color:#ffffff; background-color: #333333; }\
\n\
table.nodedump-Object {	background-color: #0000cc; }\
table.nodedump-Object th.nodedump-Object { background-color: #4444cc; }\
table.nodedump-Object td.nodedump-Object { background-color: #ccddff; }\
\n\
table.nodedump-Array { background-color: #006600; }\
table.nodedump-Array th.nodedump-Array { background-color: #009900; }\
table.nodedump-Array td.nodedump-Array { background-color: #ccffcc; }\
table.nodedump-Function { background-color: #aa4400; }\
table.nodedump-Function th.nodedump-Function { background-color: #cc6600; }\
table.nodedump-RegExp { background-color: #884488; }\
table.nodedump-RegExp th.nodedump-RegExp { background-color: #aa66aa; }\
table.nodedump-RegExp td.nodedump-RegExp { background-color: #ffddff; }\
table.nodedump-Error { background-color: #CC3300; }\
table.nodedump-Error th.nodedump-Error { background-color: #CC3300; }\
table.nodedump-'+CIRCULARREFERENCE+', table.nodedump-'+ERRORDATATYPE+' { background-color: #333333; }\
table.nodedump-'+CIRCULARREFERENCE+' td.nodedump-'+CIRCULARREFERENCE+', table.nodedump-'+ERRORDATATYPE+' th.nodedump-'+ERRORDATATYPE+' { background-color: #333333; }\
table.nodedump-'+CIRCULARREFERENCE+' td.nodedump-label { color: #ffffff; }\n\
</style>';

var JS = "<script type=\"text/javascript\">\n\
	// based on CFDump's js\n\
	var nodedump;\n\
	nodedump = (function(){\n\
		var style;\n\
		return {\n\
			toggleRow: function(source){\n\
				var target = (document.all) ? source.parentElement.cells[1] : source.parentNode.lastChild;\n\
				this.toggleTarget(target,this.toggleSource(source));\n\
			} // end toggleRow\n\
\n\
			,toggleSource: function(source){\n\
				if (source.style.fontStyle=='italic') {\n\
					source.style.fontStyle='normal';\n\
					source.title='" + TITLEEXPANDED + "';\n\
					return 'open';\n\
				} else {\n\
					source.style.fontStyle='italic';\n\
					source.title='" + TITLECOLLAPSED + "';\n\
					return 'closed';\n\
				}\n\
			} // end toggleSource\n\
\n\
			,toggleTable: function(source){\n\
				var switchToState=this.toggleSource(source);\n\
				if(document.all) {\n\
					var table=source.parentElement.parentElement;\n\
					for(var i=1;i<table.rows.length;i++) {\n\
						target=table.rows[i];\n\
						this.toggleTarget(target,switchToState);\n\
					}\n\
				}\n\
				else {\n\
					var table=source.parentNode.parentNode;\n\
					for (var i=1;i<table.childNodes.length;i++) {\n\
						target=table.childNodes[i];\n\
						if(target.style) {\n\
							this.toggleTarget(target,switchToState);\n\
						}\n\
					}\n\
				}\n\
			} // end toggleTable\n\
\n\
			,toggleTarget: function(target,switchToState){\n\
				target.style.display = (switchToState=='open') ? '' : 'none';\n\
			} // end toggleTarget\n\
		};\n\
\n\
	})();\n\
</script>";

/*
 * Methods for building the output
 */

/*
 * Creates tables
 *
 * @param {string} dataType
 * @param {string} data body for the table
 * @returns the output for the table
 */
function doTable(dataType, data){
    return format(TABLE, dataType, data);
}

/*
 * Checks if the current row is expanded or not
 * 
 * @param {object} options
 * @param {boolean} isSimpleTypeMember
 * @returns {isRowExpanded.options|Boolean}
 */
function isRowExpanded(options, isSimpleTypeMember){
	return (!isSimpleTypeMember || (options && options.expand == true));
}

/*
 * Builds the style tag for the headers of tables
 * 
 * @param {string} dataType
 * @param {object} options
 * @returns {String|EXPANDEDLABELSTYLE|COLLAPSEDLABELSTYLE}
 */
function doHeaderStyle(dataType, options){
	var style = EXPANDEDLABELSTYLE;
	if(options.expand==false || (typeof options.expand=='object' && options.expand.indexOf(dataType) < 0))
		style = COLLAPSEDLABELSTYLE;

	return style;
}

/*
 * Builds the style tag for a row
 * 
 * @param {string} dataType
 * @param {object} options
 * @param {boolean} isSimpleTypeMember
 * @returns {COLLAPSEDSTYLE|String}
 */
function doRowStyle(dataType, options, isSimpleTypeMember){
	return ((
			isRowExpanded(options, isSimpleTypeMember)
			|| (typeof options.expand=='object' && options.expand.indexOf(dataType) > -1)
			) ? '' : COLLAPSEDSTYLE
	);
}

/*
 * Builds the style tag for the label cell
 * 
 * @param {string} options
 * @param {boolean} isSimpleTypeMember
 * @returns {String|COLLAPSEDLABELSTYLE|EXPANDEDLABELSTYLE}
 */
function doCellLabelStyle(options, isSimpleTypeMember){
	return isRowExpanded(options, isSimpleTypeMember) ? EXPANDEDLABELSTYLE : COLLAPSEDLABELSTYLE;
}

/*
 * Builds the style tag for the data cell
 * 
 * @param {object} options
 * @param {boolean} isSimpleTypeMember
 * @returns {String|COLLAPSEDSTYLE}
 */
function doCellStyle(options, isSimpleTypeMember){
	return isRowExpanded(options, isSimpleTypeMember) ? '' : COLLAPSEDSTYLE;
}

/*
 * Builds the header row of a table
 * 
 * @param {string} dataType
 * @param {string} data
 * @param {object} options
 * @returns {string}
 */
function doRowHeader(dataType, data, options){
	return format(ROWHEADER, dataType, doHeaderStyle(dataType, options), data);
}

/*
 * Builds a regular two column row
 * 
 * @param {string} dataType
 * @param {string} key
 * @param {string} data
 * @param {object} options
 * @param {boolean} isSimpleTypeMember
 * @returns {string}
 */
function doRow(dataType, key, data, options, isSimpleTypeMember){
    return format(
		ROW
		, doRowStyle(dataType, options, isSimpleTypeMember)
		, dataType
		, doCellLabelStyle(options, isSimpleTypeMember)
		, key
		, doCellStyle(options, isSimpleTypeMember)
		, data
	);
}

/*
 * Builds the header row for a 1 column table
 * 
 * @param {string} dataType
 * @param {string} data
 * @param {object} options
 * @returns {string}
 */
function doRowHeader1Col(dataType, data, options){
    return format(ROWHEADER1COL, dataType, doHeaderStyle(dataType, options), data);
}

/*
 * Builds the 1 column row
 * @param {string} dataType
 * @param {string} data
 * @param {object} options
 * @param {boolean} isSimpleTypeMember
 * @returns {string}
 */
function doRow1Col(dataType, data, options, isSimpleTypeMember){
    return format(ROW1COL, doRowStyle(dataType, options, isSimpleTypeMember), data);
}

/*
 * Builds the empty row
 * 
 * @param {string} dataType
 * @param {string} data
 * @returns {string}
 */
function doRowEmpty(dataType, data){
    return format(ROWEMPTY, dataType, data, EMPTY);
}

/*
 * Builds the header row for empty vars
 * 
 * @param {string} dataType
 * @param {string} data
 * @returns {string}
 */
function doRowHeaderEmpty(dataType, data){
    return format(ROWHEADEREMPTY, dataType, data, EMPTY);
}

/*
 * Outputs the initial markup necessary
 * @param {object} options
 * @returns {CSS|JS|SYNTAXHIGHLIGHTCSS|String}
 */
function doInitialOutput(options){
    return (options.syntaxHighlight? SYNTAXHIGHLIGHTCSS : '') + CSS + JS;
}

/*
 * Encodes HTML strings so they are displayed as such
 * 
 * @param {string} html
 * @returns {string}
 */
function escapeHtml(html){
    return String(html)
			.replace(/&(?!\w+;)/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');
};

/*
 * Figures out the datatype of a variable
 * @param {any} obj
 * @returns {string|getDataType.dataType}
 */
function getDataType(obj){
	var dataType = toClass.call( obj );
	dataType = dataType.split(' ')[1];
	dataType = dataType.substring(0, dataType.length-1);

	return dataType;
}

/*
 * Clones variables to avoid pass by reference issues
 * 
 * @param {any} orig
 * @param {optional|string} dataType
 * @returns {clone.newArray|Array|clone.orig}
 */
function clone(orig, dataType){
	if(!dataType)
		dataType = getDataType(orig);

	if(dataType == 'Array'){
		var newArray = [];
		for(var i = 0; i < orig.length; i++)
			newArray.push(orig[i]);

		return newArray;

	} else if(dataType == 'Object') {
		var newObject = {};
		for(var key in orig)
			newObject[key] = clone(orig[key]);

		return newObject;

	} else
		return orig;
}

/*
 * Returns a path to the original variable if the current one is a circular reference
 * 
 * @param {any} obj
 * @param {object} cache
 * @param {array} currentPath
 * @returns {Array}
 */
function getPathToCircularRef(obj, cache, currentPath){
	var circPath = [];
	if(typeof obj != 'object')
		return circPath;

	if(!cache.objects){
		cache.objects = [];
		cache.paths = [];
	}
	var pos = cache.objects.indexOf(obj);
	if(pos >= 0)
		circPath = cache.paths[pos];

	cache.objects.push(obj);
	cache.paths.push(currentPath);

	return circPath;
}

/*
 * Does all the dirty laundry of capturing variable output, recursively
 * 
 * @param {any} obj
 * @param {objects} cache
 * @param {array} currentPath
 * @param {objects} options
 * @returns {string}
 */
function dumpObject(obj, cache, currentPath, options){
	// do this on the first call
	var data = '';
	var dataType = getDataType(obj);
	var isSimpleType = (SIMPLETYPES.indexOf(dataType) >= 0);
	var bFirstCall = (currentPath.length == 0);
	var label = dataType;
	if(bFirstCall){
		var topPath = TOP;
		cache.bFilteredLevel = false;
		if(options.label){
			label = options.label + ' - ' + label;
			/*topPath += ' ' + options.label;
			if(topPath.length > CIRCULARTOPSTRINGLIMIT)
				topPath = topPath.substr(0, CIRCULARTOPSTRINGLIMIT) + '...';
			topPath += ' - ' + dataType;*/
		}
		currentPath = [topPath];
	}

	var bEmpty = false;
	var bHeader = !isSimpleType;

	if(isSimpleType){ // Simple types

		switch(dataType){
			case 'Boolean':
				var val = '<span class="'+(obj ? 'nodedump-yes' : 'nodedump-no')+'">' + obj + '</span>';
				data = doRow(dataType, label, val, options);
			break;
			case 'String':
				if(obj.length === 0)
					bEmpty = true;
				else {
					var val = escapeHtml(obj);
					//var val = '<pre><code class="lang-html">' + hljs.highlight('xml', obj).value + '</code></pre>';
					data = doRow(dataType, label, val, options);
				}
			break;
			case 'Math':
			case 'Undefined':
			case 'Null':
				data = doRow1Col(dataType, label, options, false);
			break;
			default:
				data = doRow(dataType, label, obj.toString(), options);
			break;
		}

	} else { // Non-Object types

		switch(dataType){
			case 'RegExp':
			case 'Error':
				data += doRowHeader1Col(dataType, label, options);
				data += doRow1Col(dataType, obj.toString(), options, true);
			break;
			case 'Function':
				bHeader = true;
				data += doRowHeader1Col(dataType, label, options);
				var txt = obj.toString();
				if(options.syntaxHighlight){
					var purtyText = hljs.highlight('javascript', txt);
					//var purtyText = hljs.highlightAuto(txt);
					txt = purtyText.value;
				} else {
					var txt = escapeHtml(obj.toString());
				}

				data += doRow1Col(dataType, '<pre><code class="lang-javascript">'+txt+'</code></pre>', options, true);
				//data += doRow1Col(dataType, '<pre><code>'+escapeHtml(obj.toString())+'</code></pre>', options, true);
			break;
			case 'Array':
			case 'Object':
			default:
				// check for circular references
				var circPath = getPathToCircularRef(obj, cache, currentPath);
				if(circPath.length > 0){
					dataType = CIRCULARREFERENCE;
					data = doRow(dataType, dataType, circPath.join(CIRCULARSPLITSTRING), options);
				} else {
					var subPath;
					var loopObj = [];
					for(var key in obj)
						loopObj.push(key);
					if(options.sortKeys){
						loopObj.sort(function (a, b) {
							return a.toLowerCase().localeCompare(b.toLowerCase());
						});
					}

					cache.level++;
					var filtered = [];
					var bFilteredTop = false;
					var numTotalKeys = loopObj.length;
					var key, val;
					var numKeysShown = 0;
					var numKeysHidden = 0;
					var errThrown;
					for (var i = 0; i < loopObj.length; i++) {
						key = loopObj[i];
						errThrown = '';
						try{
							val = obj[key];
						} catch(err){
							errThrown = err.toString();
						}
						if(bFirstCall){
							if(!(!options.show || (options.show.length && options.show.indexOf(key) >= 0))){
								numKeysHidden++;
								continue;
							} else if(options.hide && options.hide.length && options.hide.indexOf(key) >= 0){
								numKeysHidden++;
								continue;
							}
							if(options.top > 0 && numKeysShown === options.top){
								bFilteredTop = true;
								break;
							}
						}

						numKeysShown++;
						if(options.levels !== null && currentPath.length > options.levels){
							cache.bFilteredLevel = true;
							data += doRow(dataType, key, '', options, true);
							continue;
						}
						
						if(errThrown.length > 0){
							var errorRow = doRowHeader1Col(ERRORDATATYPE, ERRORDATATYPE, options)
											+ doRow1Col(ERRORDATATYPE, '<pre><code class="lang-javascript">'+hljs.highlight('javascript', errThrown).value+'</code></pre>', options, true);
											//+ doRow1Col(ERRORDATATYPE, errThrown, options, true);
							data += doRow(dataType, key, doTable(ERRORDATATYPE, errorRow), options, false);
							continue;
						}
						subPath = clone(currentPath, 'Array');
						subPath.push(key);
						data += doRow(dataType, key, dumpObject(val, cache, subPath, options), options, true);
					}
					
					if(numTotalKeys === 0)
						bEmpty = true;
					else {
						if(bFirstCall){
							if(numKeysShown !== numTotalKeys){
								if(options.show){
									filtered.push(format(TITLEFILTEREDSHOWN, numKeysShown, numTotalKeys));
								} else if(options.hide){
									filtered.push(format(TITLEFILTEREDHIDDEN, numKeysHidden, numTotalKeys));
									numTotalKeys = numTotalKeys - numKeysHidden;
								}
								if(!options.show && bFilteredTop)
									filtered.push(format(TITLEFILTEREDTOP, numKeysShown, numTotalKeys));
							}
							if(cache.bFilteredLevel)
								filtered.push(format(TITLEFILTEREDLEVELS, options.levels));

							if(filtered.length > 0)
								label += format(TITLEFILTERED, filtered.join(', '));
						}
						data = doRowHeader(dataType, label, options) + data;
					}
				}
			break;
		}

	}

    if(bEmpty)
            data = bHeader ? doRowHeaderEmpty(dataType, label) : doRowEmpty(dataType, label);

    return doTable(dataType, data);
}

/*
 * Function called to start the dump of a variable
 * 
 * @param {object} obj
 * @param {object} currentOptions
 * @returns {JS|CSS|SYNTAXHIGHLIGHTCSS|String}
 */
function dump(obj, currentOptions){
	var options = clone(DEFAULTOPTS);
	for(var opt in currentOptions){
		options[opt] = currentOptions[opt];
	}

    return doInitialOutput(options) + dumpObject(obj, {}, [], options);
}

/*
 * Optional initialization of nodedump
 * 
 * @param {object} options
 * @returns {this}
 */
function init(options){
	for(var opt in options){
		DEFAULTOPTS[opt] = options[opt];
	}

	setDumpFunctionName();

	return this;
}

/*
 * Sets the name of the global function that can be used to nodedump vars
 * 
 * @param {string} fnName
  */
function setDumpFunctionName(fnName){
	if(fnName)
		DEFAULTOPTS.dumpFunctionName = fnName;

	global[DEFAULTOPTS.dumpFunctionName] = dump;
}

setDumpFunctionName(); // set the name of the global nodedump function to the default
// exports
exports.dump = dump;
exports.init = init;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./highlight.js/highlight":3,"util":10}]},{},[11])