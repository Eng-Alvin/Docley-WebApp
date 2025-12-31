import React from 'react';
import { cn } from '../../../../lib/utils';
import { Card } from '../../../../components/ui/Card';
import { Clock, Check, X } from 'lucide-react';

export default function AvailabilityForm({ data, onChange, isDark }) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleDayChange = (day, field, value) => {
        onChange({
            ...data,
            [day]: {
                ...data[day],
                [field]: value
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                        <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                            Weekly Availability
                        </h3>
                        <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                            Set your available study hours for each day.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {days.map((day) => {
                        const dayData = data[day] || { available: false, hours: 0, preferredTime: 'any' };
                        
                        return (
                            <div key={day} className={cn(
                                "flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border transition-all",
                                dayData.available 
                                    ? (isDark ? "bg-slate-900/50 border-orange-500/30" : "bg-orange-50 border-orange-200")
                                    : (isDark ? "bg-slate-900/30 border-slate-800 opacity-60" : "bg-slate-50 border-slate-100 opacity-60")
                            )}>
                                {/* Day Toggle */}
                                <div className="flex items-center justify-between md:w-48">
                                    <span className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                                        {day}
                                    </span>
                                    <button
                                        onClick={() => handleDayChange(day, 'available', !dayData.available)}
                                        className={cn(
                                            "relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500",
                                            dayData.available ? "bg-orange-500" : (isDark ? "bg-slate-700" : "bg-slate-300")
                                        )}
                                    >
                                        <span className={cn(
                                            "absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200",
                                            dayData.available ? "translate-x-6" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>

                                {/* Controls (Only if available) */}
                                {dayData.available && (
                                    <div className="flex-1 grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                                        <div>
                                            <label className={cn("block text-xs font-medium mb-1", isDark ? "text-slate-400" : "text-slate-500")}>
                                                Study Hours
                                            </label>
                                            <select
                                                value={dayData.hours}
                                                onChange={(e) => handleDayChange(day, 'hours', Number(e.target.value))}
                                                className={cn(
                                                    "w-full px-3 py-1.5 rounded-lg border text-sm outline-none transition-all",
                                                    isDark 
                                                        ? "bg-slate-800 border-slate-700 text-white focus:border-orange-500" 
                                                        : "bg-white border-slate-200 text-slate-900 focus:border-orange-500"
                                                )}
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(h => (
                                                    <option key={h} value={h}>{h} Hours</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={cn("block text-xs font-medium mb-1", isDark ? "text-slate-400" : "text-slate-500")}>
                                                Preferred Time
                                            </label>
                                            <select
                                                value={dayData.preferredTime}
                                                onChange={(e) => handleDayChange(day, 'preferredTime', e.target.value)}
                                                className={cn(
                                                    "w-full px-3 py-1.5 rounded-lg border text-sm outline-none transition-all",
                                                    isDark 
                                                        ? "bg-slate-800 border-slate-700 text-white focus:border-orange-500" 
                                                        : "bg-white border-slate-200 text-slate-900 focus:border-orange-500"
                                                )}
                                            >
                                                <option value="any">Any Time</option>
                                                <option value="morning">Morning</option>
                                                <option value="afternoon">Afternoon</option>
                                                <option value="evening">Evening</option>
                                                <option value="night">Night</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
