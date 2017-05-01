'use strict';

class Token {

  constructor(name, text) {
    this.name = name;
    this.text = text;
  }

  toString() {
    return `<'${this.text}', ${this.name}>`;
  }

}

module.exports = Token;
