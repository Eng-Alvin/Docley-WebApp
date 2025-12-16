import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockDocuments } from '../../data/documentsData';
import { FileText, Clock, MoreVertical, Search, Filter, Plus, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { IntakeModal } from '../../components/modals/IntakeModal';

export default function DashboardDocuments() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showIntake, setShowIntake] = useState(false);
    const { addToast } = useToast();

    const filteredDocs = mockDocuments.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFilter = () => {
        addToast("Filter options coming soon!", "info");
    };

    return (
        <div className="space-y-6">
            <IntakeModal isOpen={showIntake} onClose={() => setShowIntake(false)} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search documents..."
                            className="pl-9 h-10 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={handleFilter}>
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={() => setShowIntake(true)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none shadow-lg shadow-orange-500/20 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" /> New
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredDocs.length > 0 ? (
                    filteredDocs.map((doc) => (
                        <div key={doc.id} className="group">
                            <Card className="hover:border-indigo-300 transition-all duration-200 border-slate-200 hover:shadow-md hover:translate-x-1">
                                <CardContent className="p-4 sm:p-6 flex items-center gap-4">
                                    {/* Icon */}
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${doc.status === 'upgraded'
                                        ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
                                        : 'bg-slate-50 text-slate-500 group-hover:bg-slate-100'
                                        } `}>
                                        <FileText className="h-6 w-6" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 grid md:grid-cols-4 gap-4 items-center">
                                        <div className="md:col-span-2">
                                            <Link to={`/dashboard/editor/${doc.id}`} className="block">
                                                <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                                    {doc.title}
                                                    {doc.status === 'draft' && <span className="text-amber-500 text-[10px] uppercase font-bold tracking-wider">Draft</span>}
                                                </h3>
                                                <p className="text-sm text-slate-500 truncate">{doc.excerpt}</p>
                                            </Link>
                                        </div>

                                        <div className="hidden md:flex items-center text-sm text-slate-500">
                                            <Clock className="h-3 w-3 mr-2" /> {doc.lastEdited}
                                        </div>

                                        <div className="flex items-center justify-end gap-3">
                                            {doc.status === 'upgraded' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                    Grade: {doc.grade}
                                                </span>
                                            ) : (
                                                <Link to={`/dashboard/editor/${doc.id}`}>
                                                    <Button size="sm" variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8 text-xs">
                                                        Resume <ArrowUpRight className="ml-1 h-3 w-3" />
                                                    </Button>
                                                </Link>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={() => addToast("Document options menu", "info")}>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed animate-in fade-in zoom-in duration-300">
                        <div className="mx-auto h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                            <Search className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900">No documents found</h3>
                        <p className="mt-1 text-sm text-slate-500">Try adjusting your search terms or create a new one.</p>
                        <div className="mt-6">
                            <Button variant="outline" onClick={() => setSearchTerm('')}>
                                Clear Search
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
