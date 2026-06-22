import fs from 'fs';

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');
content = content.replace(/text-\[8px\]/g, 'text-[10px]');
content = content.replace(/text-\[9px\]/g, 'text-xs');
content = content.replace(/text-\[10px\]/g, 'text-xs');
content = content.replace(/text-\[11px\]/g, 'text-sm');
content = content.replace(/text-\[12px\]/g, 'text-sm');

fs.writeFileSync('src/components/AdminPanel.tsx', content);

let nav = fs.readFileSync('src/components/Navigation.tsx', 'utf-8');
nav = nav.replace(/text-\[8px\]/g, 'text-[10px]');
nav = nav.replace(/text-\[9px\]/g, 'text-[10px]');
nav = nav.replace(/text-\[10px\]/g, 'text-xs');
fs.writeFileSync('src/components/Navigation.tsx', nav);

let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace(/text-\[8px\]/g, 'text-[10px]');
app = app.replace(/text-\[9px\]/g, 'text-xs');
app = app.replace(/text-\[10px\]/g, 'text-xs');
app = app.replace(/text-\[11px\]/g, 'text-sm');
app = app.replace(/text-\[12px\]/g, 'text-sm');
fs.writeFileSync('src/App.tsx', app);
