const fs = require('fs');
// Test if problematic patterns work
const code = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Test</title><style>*{margin:0}</style></head><body><div class="test">Hello</div><script>const x=1+2;console.log(x)</script></body></html>';
console.log('Length:', code.length);
fs.writeFileSync('scripts/test-output.txt', code);
console.log('Written OK');
