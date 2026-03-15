const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\Edgar\\Krypt\\krypt\\src\\app\\(dashboard)\\projects\\page.tsx', 'utf-8');

const tags = ['div', 'section', 'details', 'summary', 'form', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'code', 'p', 'article', 'span', 'h1', 'h2', 'h3', 'h4', 'a', 'button', 'input'];

tags.forEach(tag => {
    const openCount = (content.match(new RegExp('<' + tag + '(\\s|>)', 'g')) || []).length;
    const closeCount = (content.match(new RegExp('</' + tag + '>', 'g')) || []).length;
    if (openCount !== closeCount) {
        console.log(`${tag}: <${openCount}, </${closeCount}`);
    }
});

const openBraces = (content.match(/\{/g) || []).length;
const closeBraces = (content.match(/\}/g) || []).length;
console.log(`Braces: {${openBraces}, }${closeBraces}`);

const openParens = (content.match(/\(/g) || []).length;
const closeParens = (content.match(/\)/g) || []).length;
console.log(`Parens: (${openParens}, )${closeParens}`);
