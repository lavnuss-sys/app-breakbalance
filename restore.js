import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove all dark mode classes
content = content.replace(/\s*dark:[^\s"'`]+/g, '');

// Also fix the root div where I added dark mode manually via isDarkMode logic:
content = content.replace(
    /min-h-screen \$\{isDarkMode \? 'dark bg-\[#1A1A1A\]' : \(appStatus === 'dashboard' \? 'bg-\[#FFFEF9\]' : 'bg-\[#1A1A1A\]'\)\}/,
    "min-h-screen ${isDarkMode ? 'dark bg-[#1A1A1A]' : (appStatus === 'dashboard' ? 'bg-[#FFFEF9]' : 'bg-[#1A1A1A]')}"
);

fs.writeFileSync('src/App.tsx', content);
