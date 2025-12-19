import { FileText, File, Presentation } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export function FloatingDocuments() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const documents = [
        { icon: FileText, delay: 0, x: '10%', y: '20%', size: 'w-16 h-16' },
        { icon: File, delay: 1, x: '85%', y: '30%', size: 'w-12 h-12' },
        { icon: Presentation, delay: 2, x: '15%', y: '70%', size: 'w-14 h-14' },
        { icon: FileText, delay: 3, x: '80%', y: '75%', size: 'w-10 h-10' },
        { icon: File, delay: 4, x: '5%', y: '50%', size: 'w-12 h-12' },
        { icon: Presentation, delay: 5, x: '90%', y: '60%', size: 'w-14 h-14' },
    ];

    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10 hidden lg:block">
            {documents.map((doc, idx) => {
                const Icon = doc.icon;
                return (
                    <div
                        key={idx}
                        className="absolute animate-float"
                        style={{
                            left: doc.x,
                            top: doc.y,
                            animationDelay: `${doc.delay}s`,
                            animationDuration: `${8 + doc.delay}s`,
                        }}
                    >
                        <div className={cn(
                            "relative rounded-xl p-3 shadow-2xl backdrop-blur-sm transform transition-all duration-1000 hover:scale-110",
                            doc.size,
                            isDark
                                ? "bg-white/10 border border-white/20 text-white/80"
                                : "bg-white/80 border border-blue-200/50 text-blue-600 shadow-blue-500/20"
                        )}>
                            <Icon className="w-full h-full" />
                            {/* 3D effect */}
                            <div className={cn(
                                "absolute inset-0 rounded-xl opacity-20 blur-xl",
                                isDark ? "bg-white" : "bg-blue-500"
                            )} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

