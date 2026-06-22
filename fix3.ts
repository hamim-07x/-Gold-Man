import fs from 'fs';

function fixFile(file: string) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    // Make text larger and more consistent
    content = content.replace(/text-\[8px\]/g, 'text-[10px]');
    content = content.replace(/text-\[9px\]/g, 'text-[11px]');
    content = content.replace(/text-\[10px\]/g, 'text-xs');
    content = content.replace(/text-\[11px\]/g, 'text-sm');
    content = content.replace(/text-\[12px\]/g, 'text-sm');
    content = content.replace(/text-\[13px\]/g, 'text-sm');
    content = content.replace(/text-\[14px\]/g, 'text-base');
    
    fs.writeFileSync(file, content);
}

['src/App.tsx', 'src/components/DashboardView.tsx', 'src/components/WalletView.tsx', 'src/components/Navigation.tsx', 'src/components/DailyStreakComponent.tsx', 'src/components/AdminPanel.tsx'].forEach(fixFile);
