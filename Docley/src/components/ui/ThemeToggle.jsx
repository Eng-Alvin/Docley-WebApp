import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export function ThemeToggle({ className }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-300 hover:scale-110",
                theme === 'dark'
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm",
                className
            )}
            aria-label="Toggle theme"
        >
            <Sun className={cn(
                "h-5 w-5 absolute transition-all duration-300",
                theme === 'light' ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
            )} />
            <Moon className={cn(
                "h-5 w-5 absolute transition-all duration-300",
                theme === 'dark' ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            )} />
        </button>
    );
}

