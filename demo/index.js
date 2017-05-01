const fs = require('fs');
const path = require('path');

const Parser = require('../index.js');

const file = fs.readFileSync(path.join(__dirname, './demo.md'), 'utf8');

const parser = new Parser(file);

console.log(parser.toHtml());
