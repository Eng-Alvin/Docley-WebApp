import React, { useState, useRef } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { 
    Calendar, 
    Clock, 
    BookOpen, 
    Settings, 
    ChevronRight, 
    ChevronLeft, 
    Save, 
    Download, 
    RefreshCw,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';

// Components
import AcademicContextForm from './components/AcademicContextForm';
import AvailabilityForm from './components/AvailabilityForm';
import CoursesForm from './components/CoursesForm';
import TimetableView from './components/TimetableView';
import { generateTimetable } from './utils';

// Sanitize OKLCH/OKLAB/var() colors before export
function sanitizeElementColors(root) {
    if (!root) return;
    const colorProps = [
        'color', 'background-color', 'border-color',
        'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
        'outline-color', 'text-decoration-color', 'fill', 'stroke'
    ];
    const isProblematic = (v) => v && (v.includes('oklch') || v.includes('oklab') || v.includes('var('));
    const walk = (el) => {
        try {
            const computed = window.getComputedStyle(el);
            colorProps.forEach((prop) => {
                const value = computed.getPropertyValue(prop);
                if (prop === 'color') el.style.setProperty(prop, '#0b0b0b', 'important');
                if (prop === 'fill') el.style.setProperty(prop, '#0b0b0b', 'important');
                if (prop === 'stroke') el.style.setProperty(prop, '#0b0b0b', 'important');
                if (prop.includes('background')) {
                    if (isProblematic(value) || value.includes('gradient') || value === 'transparent') {
                        el.style.setProperty(prop, '#ffffff', 'important');
                    }
                }
                if (prop.includes('border')) {
                    if (isProblematic(value) || value === 'transparent') {
                        el.style.setProperty(prop, '#e2e8f0', 'important');
                    }
                }
            });
        } catch (e) {}
        Array.from(el.children).forEach(walk);
    };
    walk(root);
}

export default function TimetableGenerator() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [timetable, setTimetable] = useState(null);
    const timetableRef = useRef(null);

    const [formData, setFormData] = useState({
        // Academic Context & Preferences
        studyGoal: '',
        examDate: '',
        sessionLength: 60, // minutes
        breakDuration: 10, // minutes
        maxSessionsPerDay: 4,
        
        // Availability
        availability: {
            Monday: { available: true, hours: 4, preferredTime: 'morning' },
            Tuesday: { available: true, hours: 4, preferredTime: 'morning' },
            Wednesday: { available: true, hours: 4, preferredTime: 'morning' },
            Thursday: { available: true, hours: 4, preferredTime: 'morning' },
            Friday: { available: true, hours: 4, preferredTime: 'morning' },
            Saturday: { available: true, hours: 6, preferredTime: 'afternoon' },
            Sunday: { available: false, hours: 0, preferredTime: 'any' },
        },

        // Courses
        courses: [
            { id: 1, name: '', priority: 'medium', difficulty: 'medium' }
        ]
    });

    const updateFormData = (section, data) => {
        setFormData(prev => ({
            ...prev,
            [section]: data
        }));
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else handleGenerate();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else if (step === 4) setStep(3); // Go back to editing from result
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulate processing time for UX
        setTimeout(() => {
            try {
                const result = generateTimetable(formData);
                setTimetable(result);
                setStep(4);
            } catch (error) {
                console.error("Generation failed", error);
                // Handle error
            } finally {
                setIsGenerating(false);
            }
        }, 1500);
    };

    const handleExport = async () => {
        if (timetableRef.current) {
            try {
                const original = timetableRef.current;
                const cloneWrapper = document.createElement('div');
                cloneWrapper.style.position = 'fixed';
                cloneWrapper.style.left = '-99999px';
                cloneWrapper.style.top = '0';
                cloneWrapper.style.background = '#ffffff';
                cloneWrapper.style.padding = '16px';
                const clone = original.cloneNode(true);
                cloneWrapper.appendChild(clone);
                document.body.appendChild(cloneWrapper);
                sanitizeElementColors(cloneWrapper);
                const canvas = await html2canvas(cloneWrapper, {
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    scale: 2,
                    useCORS: true,
                    logging: false
                });
                document.body.removeChild(cloneWrapper);
                const link = document.createElement('a');
                link.download = 'Docley-Timetable.png';
                link.href = canvas.toDataURL();
                link.click();
            } catch (err) {
                console.error("Export failed", err);
            }
        }
    };

    const steps = [
        { id: 1, title: 'Preferences', icon: Settings },
        { id: 2, title: 'Availability', icon: Clock },
        { id: 3, title: 'Courses', icon: BookOpen },
        { id: 4, title: 'Timetable', icon: Calendar },
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 min-h-[calc(100vh-80px)]">
            <div className="mb-8">
                <h1 className={cn("text-3xl font-bold mb-2", isDark ? "text-white" : "text-slate-900")}>
                    Smart Study Timetable
                </h1>
                <p className={cn("text-lg", isDark ? "text-slate-400" : "text-slate-600")}>
                    Generate a personalized study schedule based on your goals and availability.
                </p>
            </div>

            {/* Stepper */}
            <div className="mb-12">
                <div className="flex items-center justify-between relative max-w-3xl mx-auto">
                    <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 -z-10", isDark ? "bg-slate-800" : "bg-slate-200")}></div>
                    <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 h-1 transition-all duration-500 -z-10 bg-orange-500")} 
                         style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}></div>
                    
                    {steps.map((s) => (
                        <div key={s.id} className="flex flex-col items-center gap-2 bg-transparent">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 z-10",
                                step >= s.id 
                                    ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30" 
                                    : isDark ? "bg-slate-900 border-slate-700 text-slate-500" : "bg-white border-slate-300 text-slate-400"
                            )}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-xs font-medium absolute top-12 whitespace-nowrap",
                                step >= s.id ? (isDark ? "text-white" : "text-slate-900") : "text-slate-500"
                            )}>{s.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="mb-8 mt-16">
                {step === 1 && (
                    <AcademicContextForm 
                        data={formData} 
                        updateField={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
                        isDark={isDark}
                    />
                )}
                {step === 2 && (
                    <AvailabilityForm 
                        data={formData.availability} 
                        onChange={(data) => updateFormData('availability', data)}
                        isDark={isDark}
                    />
                )}
                {step === 3 && (
                    <CoursesForm 
                        data={formData.courses} 
                        onChange={(data) => updateFormData('courses', data)}
                        isDark={isDark}
                    />
                )}
                {step === 4 && timetable && (
                    <div ref={timetableRef} className="rounded-xl overflow-hidden">
                        <TimetableView timetable={timetable} isDark={isDark} />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-12 pt-6 border-t border-slate-200 dark:border-white/10">
                <Button 
                    variant="outline" 
                    onClick={handleBack}
                    disabled={isGenerating || step === 1}
                    className={cn(step === 1 && "invisible")}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                {step < 3 ? (
                    <Button onClick={handleNext} className="bg-orange-500 hover:bg-orange-600 text-white">
                        Next <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : step === 3 ? (
                    <Button onClick={handleGenerate} disabled={isGenerating} className="bg-orange-500 hover:bg-orange-600 text-white min-w-[160px]">
                        {isGenerating ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                Generate Timetable <ChevronRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                ) : (
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep(3)}>
                            <Settings className="w-4 h-4 mr-2" /> Adjust Inputs
                        </Button>
                        <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Download className="w-4 h-4 mr-2" /> Export Image
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
