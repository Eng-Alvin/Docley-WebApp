import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ArrowRight, CheckCircle2, Wand2, Shield, TrendingUp, Sparkles, FileText } from 'lucide-react';
import { featuresData } from '../data/featuresData';

export default function Landing() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40 bg-white">
                <div className="container relative mx-auto px-4 md:px-6 text-center z-10">
                    <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-sm font-medium text-indigo-800 mb-8 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
                        New: Academic Style Scorer
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-tight">
                        Transform rough drafts into <br className="hidden md:block" />
                        <span className="text-indigo-600">Academic Excellence</span>
                    </h1>

                    <p className="mt-4 text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Don't just fix grammar. Upgrade your assignment's structure, tone, and clarity with AI designed specifically for university standards.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <Link to="/signup">
                            <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 shadow-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300">
                                Start Free Transformation <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link to="/blog">
                            <Button variant="ghost" size="lg" className="w-full sm:w-auto text-lg h-12 px-8 text-slate-600 hover:text-indigo-600 hover:bg-slate-50">
                                View Sample Work
                            </Button>
                        </Link>
                    </div>

                    {/* Product Demo Section */}
                    <div className="relative mx-auto max-w-6xl">
                        {/* Abstract background glow behind the demo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-100/50 via-purple-100/30 to-blue-100/50 blur-3xl rounded-full -z-10 opacity-60"></div>

                        <div className="rounded-xl border border-slate-200/60 bg-white shadow-2xl overflow-hidden backdrop-blur-sm">
                            {/* Browser Header Mockup */}
                            <div className="bg-slate-50/80 border-b border-slate-200/50 h-12 flex items-center px-4 gap-2">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-300/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-300/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-300/80"></div>
                                </div>
                                <div className="mx-auto w-1/2 h-8 bg-white rounded-md border border-slate-200/50 flex items-center justify-center shadow-sm">
                                    <div className="w-4 h-4 text-slate-400 mr-2"><Sparkles className="h-3 w-3" /></div>
                                    <span className="text-xs text-slate-400 font-medium">docley.app/editor</span>
                                </div>
                            </div>

                            {/* Product Interface Mockup (or Video Placeholder) */}
                            <div className="aspect-video bg-white flex items-center justify-center relative group cursor-pointer overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=2000&h=1200"
                                    alt="Docley Product Demo"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md group-hover:scale-110 transition-all duration-300">
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-indigo-600 border-b-[10px] border-b-transparent ml-1"></div>
                                    </div>
                                </div>

                                {/* Overlay Card Example - simulating the product "working" */}
                                <div className="absolute bottom-8 left-8 right-8 md:right-auto md:w-80 bg-white p-4 rounded-xl shadow-xl border border-indigo-100 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">Academic Tone Improved</p>
                                            <p className="text-xs text-slate-500 mt-1">Replaced "bad stuff" with "negative externalities"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Before / After Transformation Section */}
            <section className="py-20 bg-white" id="features">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-4">
                            See the Transformation
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            We don't just write for you; we elevate your own ideas into scholarly submission-ready work.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {/* Before Card */}
                        <Card className="border-red-100 bg-red-50/30">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase">Before</span>
                                    <span className="text-red-400 text-sm">Poor Structure</span>
                                </div>
                                <div className="space-y-4 font-mono text-sm text-slate-600 bg-white p-4 rounded-lg border border-red-100 opacity-75">
                                    <p>"So, basically, the economy is bad right now because of inflation. People can't buy stuff. It's really hard for everyone."</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs text-red-500 flex items-center"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span> Informal Tone</span>
                                        <span className="text-xs text-red-500 flex items-center"><span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1"></span> Vague</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* After Card */}
                        <Card className="border-indigo-100 bg-indigo-50/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3">
                                <Sparkles className="h-6 w-6 text-indigo-500 animate-pulse" />
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase">After</span>
                                    <span className="text-indigo-600 text-sm font-medium">Academic Standard</span>
                                </div>
                                <div className="space-y-4 font-serif text-base text-slate-800 bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                                    <p>"Currently, geometric inflation rates are creating significant economic headwinds. Reduced consumer purchasing power is precipitating widespread financial instability across multiple sectors."</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs text-green-600 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> Professional</span>
                                        <span className="text-xs text-green-600 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> Precise</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Feature Grid */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900">Everything you need to upgrade</h2>
                        <p className="text-slate-600 mt-4 max-w-2xl mx-auto">Our powerful engine handles the tedious parts of academic writing so you can focus on the ideas.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuresData.map((feature, index) => {
                            const colors = {
                                blue: { bg: "bg-blue-100", text: "text-blue-600", border: "hover:border-blue-200", shadow: "hover:shadow-blue-500/10" },
                                purple: { bg: "bg-purple-100", text: "text-purple-600", border: "hover:border-purple-200", shadow: "hover:shadow-purple-500/10" },
                                green: { bg: "bg-green-100", text: "text-green-600", border: "hover:border-green-200", shadow: "hover:shadow-green-500/10" },
                                indigo: { bg: "bg-indigo-100", text: "text-indigo-600", border: "hover:border-indigo-200", shadow: "hover:shadow-indigo-500/10" },
                                yellow: { bg: "bg-yellow-100", text: "text-yellow-600", border: "hover:border-yellow-200", shadow: "hover:shadow-yellow-500/10" },
                                red: { bg: "bg-red-100", text: "text-red-600", border: "hover:border-red-200", shadow: "hover:shadow-red-500/10" },
                            };
                            const color = colors[feature.color] || colors.blue;

                            return (
                                <div key={index} className={`group p-8 rounded-2xl bg-white border border-slate-200 ${color.border} hover:shadow-xl ${color.shadow} transition-all duration-300`}>
                                    <div className={`h-12 w-12 ${color.bg} rounded-xl flex items-center justify-center ${color.text} mb-6 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 opacity-50"></div>
                <div className="container relative mx-auto px-4 md:px-6 text-center">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to upgrade your grades?</h2>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">Join thousands of students transforming their academic journey today.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button size="lg" className="w-full sm:w-auto px-10 text-lg h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20">
                            Get Started for Free
                        </Button>
                    </div>
                    <p className="mt-6 text-sm text-slate-500">No credit card required. Cancel anytime.</p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
