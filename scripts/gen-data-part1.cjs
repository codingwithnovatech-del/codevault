const fs = require('fs');
const existing = fs.readFileSync('src/data.ts', 'utf8');
const lines = existing.split('\n');

// Find section boundaries
let tStart = 0, compStart = 0, profileStart = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('export const templates')) tStart = i;
  if (lines[i].includes('export const componentsList')) compStart = i;
  if (lines[i].includes('export const initialProfile')) profileStart = i;
}
const header = lines.slice(0, tStart).join('\n');
const componentsCode = lines.slice(compStart, profileStart).join('\n');
const profilesCode = lines.slice(profileStart).join('\n');
fs.writeFileSync('scripts/header.txt', header + '\n\nexport const templates: Template[] = [\n');
fs.writeFileSync('scripts/components_part.txt', '\n' + componentsCode + '\n' + profilesCode);
console.log('Header extracted:', header.length, 'bytes');
console.log('Components+Profiles:', (componentsCode + profilesCode).length, 'bytes');
