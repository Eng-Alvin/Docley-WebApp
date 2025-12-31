import React from 'react';
import { cn } from '../../../../lib/utils';
import { Card } from '../../../../components/ui/Card';
import { BookOpen, Calendar, Clock, Target } from 'lucide-react';

export default function AcademicContextForm({ data, updateField, isDark }) {
    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Academic Context */}
                <Card className="p-6 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
                            <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                            Academic Goal
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                                What is your main study goal?
                            </label>
                            <input
                                type="text"
                                value={data.studyGoal}
                                onChange={(e) => updateField('studyGoal', e.target.value)}
                                placeholder="e.g., Prepare for Finals, Complete Thesis, Learn Python"
                                className={cn(
                                    "w-full px-4 py-2.5 rounded-lg border transition-all focus:ring-2 focus:ring-orange-500/20 outline-none",
                                    isDark 
                                        ? "bg-slate-900 border-slate-700 text-white focus:border-orange-500" 
                                        : "bg-white border-slate-200 text-slate-900 focus:border-orange-500"
                                )}
                            />
                        </div>

                        <div>
                            <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                                Target Date / Exam Deadline (Optional)
                            </label>
                            <input
                                type="date"
                                value={data.examDate}
                                onChange={(e) => updateField('examDate', e.target.value)}
                                className={cn(
                                    "w-full px-4 py-2.5 rounded-lg border transition-all focus:ring-2 focus:ring-orange-500/20 outline-none",
                                    isDark 
                                        ? "bg-slate-900 border-slate-700 text-white focus:border-orange-500" 
                                        : "bg-white border-slate-200 text-slate-900 focus:border-orange-500"
                                )}
                            />
                        </div>
                    </div>
                </Card>

                {/* Learning Preferences */}
                <Card className="p-6 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                            Learning Preferences
                        </h3>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <div>
                            <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                                Session Length
                            </label>
                            <select
                                value={data.sessionLength}
                                onChange={(e) => updateField('sessionLength', Number(e.target.value))}
                                className={cn(
                                    "w-full px-4 py-2.5 rounded-lg border transition-all focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none",
                                    isDark 
                                        ? "bg-slate-900 border-slate-700 text-white focus:border-orange-500" 
                                        : "bg-white border-slate-200 text-slate-900 focus:border-orange-500"
                                )}
                            >
                                <option value={30}>30 Minutes</option>
                                <option value={45}>45 Minutes</option>
                                <option value={60}>60 Minutes</option>
                                <option value={90}>90 Minutes</option>
                                <option value={120}>2 Hours</option>
                            </select>
                        </div>

                        <div>
                            <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                                Break Duration
                            </label>
                            <select
                                value={data.breakDuration}
                                onChange={(e) => updateField('breakDuration', Number(e.target.value))}
                                className={cn(
                                    "w-full px-4 py-2.5 rounded-lg border transition-all focus:ring-2 focus:ring-orange-500/20 outline-none appearance-none",
                                    isDark 
                                        ? "bg-slate-900 border-slate-700 text-white focus:border-orange-500" 
                                        : "bg-white border-slate-200 text-slate-900 focus:border-orange-500"
                                )}
                            >
                                <option value={5}>5 Minutes</option>
                                <option value={10}>10 Minutes</option>
                                <option value={15}>15 Minutes</option>
                                <option value={20}>20 Minutes</option>
                                <option value={30}>30 Minutes</option>
                            </select>
                        </div>

                        <div>
                            <label className={cn("block text-sm font-medium mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                                Max Sessions / Day
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={12}
                                value={data.maxSessionsPerDay}
                                onChange={(e) => updateField('maxSessionsPerDay', Number(e.target.value))}
                                className={cn(
                                    "w-full px-4 py-2.5 rounded-lg border transition-all focus:ring-2 focus:ring-orange-500/20 outline-none",
                                    isDark 
                                        ? "bg-slate-900 border-slate-700 text-white focus:border-orange-500" 
                                        : "bg-white border-slate-200 text-slate-900 focus:border-orange-500"
                                )}
                            />
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
