import fs from 'fs';

let content = fs.readFileSync('src/components/DashboardView.tsx', 'utf-8');
content = content.replace(/text-\[8px\]/g, 'text-[10px]');
content = content.replace(/text-\[9px\]/g, 'text-xs');
content = content.replace(/text-\[10px\]/g, 'text-xs');
content = content.replace(/text-\[11px\]/g, 'text-sm');
content = content.replace(/text-\[12px\]/g, 'text-sm');
content = content.replace(/text-\[24px\]/g, 'text-2xl');
content = content.replace(/text-\[28px\]/g, 'text-3xl');

fs.writeFileSync('src/components/DashboardView.tsx', content);

let wallet = fs.readFileSync('src/components/WalletView.tsx', 'utf-8');
wallet = wallet.replace(/text-\[8px\]/g, 'text-[10px]');
wallet = wallet.replace(/text-\[9px\]/g, 'text-xs');
wallet = wallet.replace(/text-\[10px\]/g, 'text-xs');
fs.writeFileSync('src/components/WalletView.tsx', wallet);

let daily = fs.readFileSync('src/components/DailyStreakComponent.tsx', 'utf-8');
daily = daily.replace(/text-\[8px\]/g, 'text-[10px]');
daily = daily.replace(/text-\[9px\]/g, 'text-xs');
daily = daily.replace(/text-\[10px\]/g, 'text-xs');
fs.writeFileSync('src/components/DailyStreakComponent.tsx', daily);

