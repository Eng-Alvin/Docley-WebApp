import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { blogPosts } from '../../data/blogData';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function BlogPost() {
    const { id } = useParams();
    const post = blogPosts.find(p => p.id === parseInt(id));

    if (!post) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Post not found</h1>
                    <Link to="/blog"><Button>Back to Blog</Button></Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />

            <article className="pt-20 pb-24">
                {/* Header */}
                <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center mb-12">
                    <Link to="/blog" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Articles
                    </Link>
                    <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-6">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">{post.category}</span>
                        <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {post.date}</span>
                        <span className="flex items-center"><Clock className="h-4 w-4 mr-1" /> {post.readTime}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-8">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-10 w-10 bg-slate-200 rounded-full overflow-hidden">
                            {/* Placeholder avatar */}
                            <span className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold">
                                {post.author.charAt(0)}
                            </span>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-slate-900">{post.author}</p>
                            <p className="text-xs text-slate-500">Academic Contributor</p>
                        </div>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="container mx-auto px-4 md:px-6 max-w-4xl mb-16">
                    <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                    <div
                        className="prose prose-slate prose-lg mx-auto prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-indigo-600 hover:prose-a:text-indigo-500"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* CTA in blog */}
                    <div className="mt-16 p-8 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 text-center">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">Want to fix these issues automatically?</h3>
                        <p className="text-slate-600 mb-6">Our AI Academic Transformer scans your work for these exact problems.</p>
                        <Link to="/signup">
                            <Button className="shadow-lg shadow-orange-500/20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none text-white">
                                Try Academic Transformer Free
                            </Button>
                        </Link>
                    </div>
                </div>
            </article>

            <Footer />
        </div>
    );
}
