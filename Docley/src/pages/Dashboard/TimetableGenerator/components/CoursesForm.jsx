import React from 'react';
import { cn } from '../../../../lib/utils';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { BookOpen, Plus, Trash2, AlertCircle } from 'lucide-react';

export default function CoursesForm({ data, onChange, isDark }) {
    
    const addCourse = () => {
        onChange([
            ...data,
            { 
                id: Date.now(), 
                name: '', 
                priority: 'medium', 
                difficulty: 'medium' 
            }
        ]);
    };

    const removeCourse = (id) => {
        if (data.length > 1) {
            onChange(data.filter(c => c.id !== id));
        }
    };

    const updateCourse = (id, field, value) => {
        onChange(data.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
                                Courses & Subjects
                            </h3>
                            <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                                List the subjects you need to study.
                            </p>
                        </div>
                    </div>
                    <Button onClick={addCourse} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Plus className="w-4 h-4 mr-1" /> Add Course
                    </Button>
                </div>

                <div className="space-y-4">
                    {data.map((course, index) => (
                        <div key={course.id} className={cn(
                            "group relative p-4 rounded-xl border transition-all animate-in fade-in slide-in-from-left-2",
                            isDark 
                                ? "bg-slate-900/50 border-slate-700 hover:border-slate-600" 
                                : "bg-white border-slate-200 hover:border-slate-300"
                        )}>
                            <div className="grid md:grid-cols-12 gap-4 items-end">
                                {/* Course Name */}
                                <div className="md:col-span-6">
                                    <label className={cn("block text-xs font-medium mb-1.5", isDark ? "text-slate-400" : "text-slate-500")}>
                                        Course Name
                                    </label>
                                    <input
                                        type="text"
                                        value={course.name}
                                        onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                                        placeholder="e.g. Advanced Calculus"
                                        className={cn(
                                            "w-full px-4 py-2 rounded-lg border outline-none transition-all",
                                            isDark 
                                                ? "bg-slate-800 border-slate-700 text-white focus:border-orange-500" 
                                                : "bg-white border-slate-200 text-slate-900 focus:border-orange-500"
                                        )}
                                    />
                                </div>

                                {/* Priority */}
                                <div className="md:col-span-3">
                                    <label className={cn("block text-xs font-medium mb-1.5", isDark ? "text-slate-400" : "text-slate-500")}>
                                        Priority
                                    </label>
                                    <select
                                        value={course.priority}
                                        onChange={(e) => updateCourse(course.id, 'priority', e.target.value)}
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg border outline-none transition-all appearance-none",
                                            course.priority === 'high' 
                                                ? "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                                                : course.priority === 'low'
                                                    ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                                                    : isDark 
                                                        ? "bg-slate-800 border-slate-700 text-white" 
                                                        : "bg-white border-slate-200 text-slate-900"
                                        )}
                                    >
                                        <option value="high">High Priority</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low Priority</option>
                                    </select>
                                </div>

                                {/* Difficulty */}
                                <div className="md:col-span-2">
                                    <label className={cn("block text-xs font-medium mb-1.5", isDark ? "text-slate-400" : "text-slate-500")}>
                                        Difficulty
                                    </label>
                                    <select
                                        value={course.difficulty}
                                        onChange={(e) => updateCourse(course.id, 'difficulty', e.target.value)}
                                        className={cn(
                                            "w-full px-3 py-2 rounded-lg border outline-none transition-all appearance-none",
                                            isDark 
                                                ? "bg-slate-800 border-slate-700 text-white" 
                                                : "bg-white border-slate-200 text-slate-900"
                                        )}
                                    >
                                        <option value="hard">Hard</option>
                                        <option value="medium">Medium</option>
                                        <option value="easy">Easy</option>
                                    </select>
                                </div>

                                {/* Remove Button */}
                                <div className="md:col-span-1 flex justify-end">
                                    <button
                                        onClick={() => removeCourse(course.id)}
                                        disabled={data.length === 1}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            data.length === 1 
                                                ? "text-slate-300 cursor-not-allowed" 
                                                : "text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        )}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {data.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>Add at least one course to generate a timetable.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
