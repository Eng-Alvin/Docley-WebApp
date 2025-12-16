import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Link } from 'react-router-dom';
import { Check, X, HelpCircle } from 'lucide-react';

export default function Pricing() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />

            <div className="py-24 px-4 md:px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 mb-4">
                            Invest in your Grades
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Choose the plan that fits your academic journey. Upgrade anytime.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Free Plan */}
                        <Card className="border-slate-200">
                            <CardHeader>
                                <CardTitle>Starter</CardTitle>
                                <CardDescription>Perfect for trying it out</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-slate-900">$0</span>
                                    <span className="text-slate-500 ml-1">/month</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    <li className="flex items-center text-slate-700">
                                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span><strong>1 Full Transformation</strong> (Try all features)</span>
                                    </li>
                                    <li className="flex items-center text-slate-700">
                                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span>3 Document Uploads / month</span>
                                    </li>
                                    <li className="flex items-center text-slate-700">
                                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                        <span>Basic Structure Analysis</span>
                                    </li>
                                    <li className="flex items-center text-slate-400">
                                        <X className="h-5 w-5 mr-3 flex-shrink-0" />
                                        <span>No Advanced Fixing Option</span>
                                    </li>
                                    <li className="flex items-center text-slate-400">
                                        <X className="h-5 w-5 mr-3 flex-shrink-0" />
                                        <span>No Citation Generator</span>
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter className="pt-4 pb-8">
                                <Link to="/signup" className="w-full">
                                    <Button variant="outline" className="w-full border-slate-300 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600" size="lg">
                                        Get Started Free
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>

                        {/* Pro Plan */}
                        <Card className="relative border-indigo-200 shadow-xl shadow-indigo-500/10 scale-105 z-10">
                            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                                    Most Popular
                                </span>
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-indigo-900">Pro Student</CardTitle>
                                    {/* <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">POPULAR</span> */}
                                </div>
                                <CardDescription>For serious academic success</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-slate-900">$12</span>
                                    <span className="text-slate-500 ml-1">/month</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    <li className="flex items-center text-slate-800 font-medium">
                                        <Check className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                                        <span>Unlimited Transformations</span>
                                    </li>
                                    <li className="flex items-center text-slate-800 font-medium">
                                        <Check className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                                        <span>Advanced Tone Fixing</span>
                                    </li>
                                    <li className="flex items-center text-slate-800">
                                        <Check className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                                        <span>Full Citation Generator (APA7, MLA9)</span>
                                    </li>
                                    <li className="flex items-center text-slate-800">
                                        <Check className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                                        <span>Plagiarism Risk Checks</span>
                                    </li>
                                    <li className="flex items-center text-slate-800">
                                        <Check className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                                        <span>Priority Support</span>
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter className="pt-4 pb-8">
                                <Link to="/signup" className="w-full">
                                    <Button className="w-full shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:shadow-indigo-500/40" size="lg">
                                        Upgrade to Pro
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    </div>

                    <div className="mt-24 max-w-3xl mx-auto">
                        <h2 className="text-2xl font-bold text-center mb-10 text-slate-900">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            {[
                                { q: "Can I cancel my subscription anytime?", a: "Yes, absolutely. There are no lock-in contracts. You can cancel from your dashboard settings instantly." },
                                { q: "Is the AI undetectable?", a: "Our tool focuses on transforming YOUR ideas and structure. We don't generate content from scratch, making it much safer and more authentic than generic AI writers." },
                                { q: "What file formats do you support?", a: "We currently support direct text input, DOCX, and PDF uploads for analysis." }
                            ].map((faq, i) => (
                                <div key={i} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                                    <h3 className="flex items-center text-lg font-semibold text-slate-900 mb-2">
                                        <HelpCircle className="h-5 w-5 text-indigo-500 mr-2" />
                                        {faq.q}
                                    </h3>
                                    <p className="text-slate-600 pl-7">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
