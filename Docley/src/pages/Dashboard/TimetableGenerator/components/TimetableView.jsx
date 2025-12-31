import React from 'react';
import { cn } from '../../../../lib/utils';
import { Card } from '../../../../components/ui/Card';
import { Clock, BookOpen, AlertCircle } from 'lucide-react';

export default function TimetableView({ timetable, isDark }) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Check if timetable is empty
    const hasSessions = Object.values(timetable).some(day => day.sessions && day.sessions.length > 0);

    if (!hasSessions) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className={cn("text-lg font-medium", isDark ? "text-white" : "text-slate-900")}>
                    No sessions could be generated
                </h3>
                <p className={cn("mt-2", isDark ? "text-slate-400" : "text-slate-600")}>
                    Try increasing your available hours or reducing the number of courses.
                </p>
            </div>
        );
    }

    return (
        <div className={cn(
            "p-6 md:p-8 animate-in fade-in zoom-in-95 duration-500",
            isDark ? "bg-slate-950" : "bg-white"
        )}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {days.map((day) => {
                    const dayData = timetable[day];
                    if (!dayData || !dayData.sessions || dayData.sessions.length === 0) return null;

                    return (
                        <div key={day} className={cn(
                            "rounded-xl overflow-hidden border shadow-sm flex flex-col h-full",
                            isDark 
                                ? "bg-slate-900/50 border-slate-800" 
                                : "bg-slate-50/50 border-slate-200"
                        )}>
                            {/* Day Header */}
                            <div className={cn(
                                "px-4 py-3 border-b font-semibold flex items-center justify-between",
                                isDark 
                                    ? "bg-slate-900 border-slate-800 text-white" 
                                    : "bg-white border-slate-200 text-slate-900"
                            )}>
                                <span>{day}</span>
                                <span className={cn(
                                    "text-xs font-normal px-2 py-0.5 rounded-full",
                                    isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"
                                )}>
                                    {dayData.sessions.length} sessions
                                </span>
                            </div>

                            {/* Sessions */}
                            <div className="p-3 space-y-3 flex-1">
                                {dayData.sessions.map((session, idx) => (
                                    <div key={idx} className={cn(
                                        "p-3 rounded-lg border relative overflow-hidden transition-transform hover:scale-[1.02]",
                                        isDark 
                                            ? "bg-slate-800 border-slate-700" 
                                            : "bg-white border-slate-200 shadow-sm"
                                    )}>
                                        {/* Difficulty Indicator Strip */}
                                        <div className={cn(
                                            "absolute left-0 top-0 bottom-0 w-1",
                                            session.difficulty === 'hard' 
                                                ? "bg-red-500" 
                                                : session.difficulty === 'medium' 
                                                    ? "bg-orange-500" 
                                                    : "bg-green-500"
                                        )} />
                                        
                                        <div className="pl-2">
                                            <div className={cn(
                                                "font-semibold text-sm truncate mb-1",
                                                isDark ? "text-white" : "text-slate-900"
                                            )}>
                                                {session.courseName}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs">
                                                <div className={cn(
                                                    "flex items-center gap-1",
                                                    isDark ? "text-slate-400" : "text-slate-500"
                                                )}>
                                                    <Clock className="w-3 h-3" />
                                                    {session.startTime}
                                                </div>
                                                <div className={cn(
                                                    "px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                                                    session.difficulty === 'hard'
                                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                        : session.difficulty === 'medium'
                                                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                )}>
                                                    {session.difficulty}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className={cn(
                "mt-8 text-center text-xs",
                isDark ? "text-slate-500" : "text-slate-400"
            )}>
                Generated by Docley Smart Study • {new Date().toLocaleDateString()}
            </div>
        </div>
    );
}
