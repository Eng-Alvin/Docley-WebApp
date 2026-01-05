import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

/**
 * Official Docley Logo Component
 * Features the Docley logo image with text, styled similar to Eden logo
 */
export function DocleyLogo({ className, size = 'default', showTagline = false, iconOnly = false }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const sizeConfig = {
        sm: {
            logoSize: 'h-6 w-6',
            textSize: 'text-lg',
            gap: 'gap-1.5',
        },
        default: {
            logoSize: 'h-8 w-8',
            textSize: 'text-xl',
            gap: 'gap-2',
        },
        lg: {
            logoSize: 'h-10 w-10',
            textSize: 'text-2xl',
            gap: 'gap-2.5',
        },
    };

    const config = sizeConfig[size] || sizeConfig.default;

    if (iconOnly) {
        return (
            <div className={cn(
                "relative group flex-shrink-0",
                className
            )}>
                <div className={cn(
                    "flex items-center justify-center rounded-xl transition-all duration-300 overflow-hidden",
                    "group-hover:scale-105",
                    config.logoSize
                )}>
                    <img
                        src="/docley-logo.png"
                        alt="Docley"
                        className="h-full w-full object-contain"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex items-center', config.gap, className)}>
            {/* Logo Image */}
            <div className={cn(
                'flex-shrink-0 rounded-lg overflow-hidden',
                config.logoSize
            )}>
                <img
                    src="/docley-logo.png"
                    alt="Docley"
                    className="h-full w-full object-contain"
                />
            </div>

            {/* Brand Name */}
            <span className={cn(
                'font-bold tracking-tight',
                config.textSize,
                isDark ? 'text-white' : 'text-slate-900'
            )}>
                Docley
            </span>

            {showTagline && (
                <span className={cn(
                    'text-xs uppercase tracking-wider ml-2',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                )}>
                    Academic Transformer
                </span>
            )}
        </div>
    );
}

