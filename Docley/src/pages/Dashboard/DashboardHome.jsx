import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockDocuments } from '../../data/documentsData';
import { FileText, ArrowRight, TrendingUp, Clock, AlertCircle, Plus, ChevronRight } from 'lucide-react';

export default function DashboardHome() {
    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Welcome back, Student</h1>
                    <p className="text-slate-500">Here's how your assignments are performing.</p>
                </div>
                <Link to="/dashboard/editor/new">
                    <Button className="shadow-lg shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none text-white">
                        <Plus className="mr-2 h-4 w-4" /> Upgrade New Assignment
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Upgrades</p>
                                <h3 className="text-2xl font-bold text-slate-900">12</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-green-100 bg-gradient-to-br from-white to-green-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Avg. Grade Boost</p>
                                <h3 className="text-2xl font-bold text-slate-900">+15%</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-orange-100 bg-gradient-to-br from-white to-orange-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">Issues Fixed</p>
                                <h3 className="text-2xl font-bold text-slate-900">143</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Documents */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Recent Documents</h2>
                    <Link to="/dashboard/documents">
                        <Button variant="link" className="text-indigo-600 hover:text-orange-600">View All</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockDocuments.map((doc) => (
                        <Link to={`/dashboard/editor/${doc.id}`} key={doc.id} className="block group h-full">
                            <Card className="hover:border-indigo-300 transition-all duration-200 border-slate-200 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
                                <CardContent className="p-5 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.status === 'upgraded' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'
                                            }`}>
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        {doc.status === 'upgraded' ? (
                                            <span className="inline-flex flex-col items-end">
                                                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Grade</span>
                                                <span className="text-lg font-bold text-green-600 leading-none">{doc.grade}</span>
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">Draft</span>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                                            {doc.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {doc.lastEdited}</span>
                                            <span>•</span>
                                            <span>{doc.wordCount} words</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between mt-auto">
                                        <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-500 transition-colors">Open Document</span>
                                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
