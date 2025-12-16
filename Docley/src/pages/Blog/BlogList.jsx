import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Card, CardContent } from '../../components/ui/Card';
import { blogPosts } from '../../data/blogData';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';

export default function BlogList() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />

            <div className="py-20 px-4 md:px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Academic Insights</h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Tips, tricks, and strategies to master university writing and productivity.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post) => (
                            <Link to={`/blog/${post.id}`} key={post.id} className="group">
                                <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow duration-300 border-slate-200">
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                                            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full font-medium">{post.category}</span>
                                            <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {post.readTime}</span>
                                        </div>

                                        <h2 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                            {post.title}
                                        </h2>

                                        <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                                            {post.excerpt}
                                        </p>

                                        <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-slate-100">
                                            <div className="flex items-center text-slate-500">
                                                <User className="h-3 w-3 mr-1" /> {post.author}
                                            </div>
                                            <div className="flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                Read <ArrowRight className="h-3 w-3 ml-1" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
