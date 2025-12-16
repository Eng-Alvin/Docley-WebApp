import { Link } from 'react-router-dom';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="w-full border-t border-slate-200 bg-slate-50">
            <div className="container mx-auto px-4 py-12 md:px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-violet-600">
                                <Sparkles className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="font-bold text-slate-900">Academic Transformer</span>
                        </div>
                        <p className="text-sm text-slate-500 max-w-xs">
                            Transform rough academic work into professional, submission-ready assignments with AI.
                        </p>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Product</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><Link to="/#features" className="hover:text-blue-600">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-blue-600">Pricing</Link></li>
                            <li><Link to="/blog" className="hover:text-blue-600">Blog</Link></li>
                            <li><Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Resources</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><a href="#" className="hover:text-blue-600">Documentation</a></li>
                            <li><a href="#" className="hover:text-blue-600">Guides</a></li>
                            <li><a href="#" className="hover:text-blue-600">Help Center</a></li>
                            <li><a href="#" className="hover:text-blue-600">Academic Integrity</a></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold text-slate-900">Legal</h3>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><a href="#" className="hover:text-blue-600">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-blue-600">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-blue-600">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} Docley Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-slate-400 hover:text-slate-600">
                            <Twitter className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-slate-400 hover:text-slate-600">
                            <Github className="h-5 w-5" />
                        </a>
                        <a href="#" className="text-slate-400 hover:text-slate-600">
                            <Linkedin className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
