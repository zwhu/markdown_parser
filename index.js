'use strict';

const EOF = -1;

// \   backslash
// `   backtick
// *   asterisk
// _   underscore
// {}  curly braces
// []  square brackets
// ()  parentheses
// #   hash mark
// +   plus sign
// -   minus sign (hyphen)
// .   dot
// !   exclamation mark
// =   equal sign
// <>  angle brackets


// 统一换行符
const preprocessor = (text) => {
  text = text.replace(/\r\n|\n/g, '\n');
  text += '\n';
  return text;
};

/**
 * 给自己定一个最小的目标
 * 实现一个极简的 Markdown parser
 * 1. 支持列表，不支持嵌套
 * 2. 支持 code， 不支持嵌套，4个空格就是一个新的 Markdown 编辑器
 */

class Parser {
  constructor(input) {
    this.p = 0; // 当前字符所在字符串下标
    this.l = 0; // 当前字符所在行
    this.input = preprocessor(input || '');
    this.c = this.input[this.p]; // 当前字符
    this.asts = []; // parse 的中间数据结构
    this.position = {
      x: 0,
      y: 0
    };
    this.content = this.c; // 当前 statement 的 string
  }

  consume() {
    this.p += 1;
    this.position = {
      x: this.position.x += 1,
      y: this.position.y
    };

    if (this.p < this.input.length) {
      this.c = this.input[this.p];
      this.content += this.c;
    } else {
      this.c = EOF;
    }
  }

  block() {
    this.content = this.content.slice(-1);
    this.loopToOneLineEnd();
    this.asts.push({
      type: 'block',
      text: this.content.slice(0, -1)
    });
  }

  headers() {
    let i = 0;
    do {
      i += 1;
      this.consume();
    } while (this.c === '#' && i < 7);

    this.content = this.content.slice(-1);
    this.ws();
    this.content = this.content.slice(-1);
    this.loopToOneLineEnd();

    this.asts.push({
      type: `h${i}`,
      text: this.content.slice(0, -1)
    });
  }

  blankline() {
    this.asts.push({
      type: 'blankline',
      text: this.content
    });
  }

  blockquotes() {
    this.loopToOneLineEnd();
    this.asts.push({
      type: 'blockquotes',
      text: this.content.slice(1, -1)
    });
  }

  lists() {

  }

  codeblocks() {
    this.loopToOneLineEnd();
    this.asts.push({
      type: 'codeblocks',
      text: this.content
    });
  }

  horizontal() {

  }

  toHtml() {
    this.parse();
    return this.genHtml();
  }

  genHtml() {
    let i = 0;
    let html = '';
    while (i < this.asts.length) {
      let statement = this.asts[i];
      i += 1;
      if (/h[1-6]/.test(statement.type)) {
        html += `<${statement.type}>${statement.text}</${statement.type}>\n`;
      } else if (statement.type === 'block') {
        html += `<p>${statement.text}`;
        while (i < this.asts.length) {
          statement = this.asts[i];
          i += 1;
          if (statement.type === 'block') {
            html += `<br/>${statement.text}`;
          } else {
            i -= 1;
            break;
          }
        }
        html += '</p>\n';
      } else if (statement.type === 'codeblocks') {
        html += `<pre>\n${statement.text}`;
        while (i < this.asts.length) {
          statement = this.asts[i];
          i += 1;
          if (statement.type === 'codeblocks') {
            html += statement.text;
          } else {
            i -= 1;
            break;
          }
        }
        html += '</pre>\n';
      } else if (statement.type === 'blankline') {
        html += '';
      } else if (statement.type === 'blockquotes') {
        let text = statement.text;
        let child = new Parser(text);
        text = child.toHtml();
        html += `<blockquote>${text}`;
        while (i < this.asts.length) {
          statement = this.asts[i];
          text = statement.text;
          child = new Parser(text);
          text = child.toHtml();
          i += 1;
          if (statement.type === 'blockquotes') {
            html += text;
          } else {
            i -= 1;
            break;
          }
        }
        html += '</blockquote>\n';
      }
    }
    return html;
  }


  loopToOneLineEnd() {
    while (this.c !== '\n') {
      this.consume();
    }
  }

  nextLine() {
    this.position = { x: 0, y: this.position.y += 1 };
    this.content = '';
    this.consume();
  }

  ws() {
    // const whiteSpace = /\x20|\x09|\x0D|\x0A/;
    const whiteSpace = / /;
    while (whiteSpace.test(this.c)) {
      this.consume();
    }
  }

  parse() {
    while (this.c !== EOF) {
      this.ws();

      if (this.c === '\n') {
        this.blankline();
      } else if (this.position.x > 4) {
        this.codeblocks();
      } else if (this.c === '#') {
        this.headers();
      } else if (this.c === '>') {
        this.blockquotes();
      } else {
        this.block();
      }

      this.nextLine();
    }
  }

}

module.exports = Parser;
