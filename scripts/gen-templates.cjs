const fs = require('fs');

// Read existing data to preserve components + profiles
const existing = fs.readFileSync('src/data.ts', 'utf8');
const lines = existing.split('\n');

let tStart = 0, compStart = 0, profileStart = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const templates')) tStart = i;
  if (lines[i].includes('export const componentsList')) compStart = i;
  if (lines[i].includes('export const initialProfile')) profileStart = i;
}

const header = lines.slice(0, tStart).join('\n');
const componentsAndProfile = lines.slice(compStart).join('\n');

// Read template codes from separate files
const codesDir = 'scripts/codes';
const files = fs.readdirSync(codesDir).filter(f => f.endsWith('.txt'));
const templates = [];

for (const file of files) {
  const content = fs.readFileSync(codesDir + '/' + file, 'utf8');
  const firstNewline = content.indexOf('\n');
  const meta = content.substring(0, firstNewline).trim();
  const code = Buffer.from(content.substring(firstNewline + 1), 'base64').toString('utf8');
  const parts = meta.split('|');
  if (parts.length === 8) {
    templates.push({
      id: parts[0],
      title: parts[1],
      desc: parts[2],
      cat: parts[3],
      stars: parseInt(parts[4]),
      author: parts[5],
      views: parts[6],
      updated: parts[7],
      code: code
    });
  }
}

// Generate output
let output = header + '\n\nexport const templates: Template[] = [\n';

for (const t of templates) {
  const escapedCode = t.code
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, '');
  
  output += `  {\n    id: '${t.id}',\n    title: '${t.title}',\n    description: '${t.desc}',\n`;
  output += `    image: genThumb('${t.title.replace(/'/g, "\\'")}', '${t.cat}'),\n`;
  output += `    alt: '${t.desc.replace(/'/g, "\\'")}',\n`;
  output += `    framework: 'HTML/CSS',\n    category: '${t.cat}',\n`;
  output += `    stars: ${t.stars},\n    author: '${t.author}',\n    views: '${t.views}',\n`;
  output += `    lastUpdated: '${t.updated}',\n    code: '${escapedCode}',\n  },\n`;
}

output += '];\n\n' + componentsAndProfile;

fs.writeFileSync('src/data.ts', output, 'utf8');
console.log('Generated data.ts with', templates.length, 'templates');
console.log('Output size:', output.length, 'bytes');
