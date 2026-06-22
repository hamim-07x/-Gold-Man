import fs from 'fs';

function fixFile(file: string) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf-8');

    // Uniformly ensure we use basic Tailwind standard spacing for larger components
    // We already have `px-4 pt-safe-top pb-32` in DashboardView.tsx
    
    // Convert generic p-3 gap-3 to p-4 gap-4 to unify the card sizes
    content = content.replace(/p-3 flex flex-col gap-3/g, 'p-5 flex flex-col gap-4');
    content = content.replace(/gap-2\.5/g, 'gap-3');
    content = content.replace(/px-1\.5/g, 'px-2');
    
    // Bumping standard padding sizes slightly to give it a better breath room
    content = content.replace(/p-1\.5/g, 'p-2');
    content = content.replace(/px-1/g, 'px-2');
    
    fs.writeFileSync(file, content);
}

['src/components/DashboardView.tsx', 'src/components/WalletView.tsx', 'src/components/DailyStreakComponent.tsx', 'src/components/AdminPanel.tsx', 'src/App.tsx', 'src/components/Navigation.tsx'].forEach(fixFile);
