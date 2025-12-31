import React from 'react';
import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                    <Wrench className="h-8 w-8 text-orange-500" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    System Maintenance
                </h1>

                <p className="text-slate-500 mb-8">
                    We are currently performing scheduled maintenance to improve Docley.
                    <br />
                    Please check back in a few minutes.
                </p>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-orange-500/50 w-1/3 animate-[shimmer_2s_infinite] rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1s_infinite]"></div>
                    </div>
                </div>
                <p className="mt-4 text-xs text-slate-400 font-mono">
                    Status: Updating System...
                </p>
            </div>
        </div>
    );
}
