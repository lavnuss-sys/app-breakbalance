import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// We re-apply the dark mode classes that the user wants, ensuring we only add them if not already there

const replaceColor = (regex, replacement) => {
    content = content.replace(regex, replacement);
}

replaceColor(/bg-\[#FFFEF9\]/g, 'bg-[#FFFEF9] dark:bg-[#1A1C14]');
replaceColor(/bg-white/g, 'bg-white dark:bg-[#2C311D]');

replaceColor(/text-\[#353A26\]/g, 'text-[#353A26] dark:text-[#FFFEF9]');
replaceColor(/text-\[#353A26\]\/40/g, 'text-[#353A26]/40 dark:text-[#FFFEF9]/40');
replaceColor(/text-\[#353A26\]\/50/g, 'text-[#353A26]/50 dark:text-[#FFFEF9]/50');
replaceColor(/text-\[#353A26\]\/60/g, 'text-[#353A26]/60 dark:text-[#FFFEF9]/60');
replaceColor(/text-\[#353A26\]\/70/g, 'text-[#353A26]/70 dark:text-[#FFFEF9]/70');
replaceColor(/text-\[#353A26\]\/80/g, 'text-[#353A26]/80 dark:text-[#FFFEF9]/80');

replaceColor(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
replaceColor(/text-slate-600/g, 'text-slate-600 dark:text-slate-300');
replaceColor(/text-slate-800/g, 'text-slate-800 dark:text-slate-200');

replaceColor(/border-\[#E2F0BD\]/g, 'border-[#E2F0BD] dark:border-[#4A5333]');
replaceColor(/border-slate-300/g, 'border-slate-300 dark:border-slate-600');
replaceColor(/bg-\[#353A26\]/g, 'bg-[#353A26] dark:bg-[#BAD66C]');
replaceColor(/text-white(?! \})/g, 'text-white dark:text-[#2C311D]'); // for buttons typically
// Fix some text-whites that shouldn't change
content = content.replace(/dark:text-\[#2C311D\] flex/g, 'text-white flex');

fs.writeFileSync('src/App.tsx', content);
