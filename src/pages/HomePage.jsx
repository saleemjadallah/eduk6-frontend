import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle, Zap, ArrowRight } from 'lucide-react';
import LessonView from '../components/Lesson/LessonView';
import ChatInterface from '../components/Chat/ChatInterface';

const HomePage = () => {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Navbar */}
            <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="text-2xl font-black font-comic text-nanobanana-blue flex items-center gap-2">
                    <div className="w-8 h-8 bg-nanobanana-yellow rounded-full border-2 border-black"></div>
                    K-6 AI Tutor
                </div>
                <div className="hidden md:flex gap-6 font-bold">
                    <a href="#features" className="hover:text-nanobanana-blue transition-colors">Features</a>
                    <a href="#about" className="hover:text-nanobanana-blue transition-colors">About</a>
                </div>
                <Link to="/study" className="bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-nanobanana-blue transition-colors">
                    Login
                </Link>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="max-w-3xl">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-6xl md:text-8xl font-black font-comic mb-8 leading-tight"
                            >
                                Learning is <span className="text-nanobanana-blue">Super</span> <span className="text-nanobanana-yellow inline-block transform -rotate-2">Fun!</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl md:text-2xl text-gray-600 mb-10 font-medium max-w-2xl"
                            >
                                Join Jeffrey on an amazing adventure through science, math, and more! Create flashcards, watch videos, and chat with your AI friend.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Link
                                    to="/study"
                                    className="inline-flex items-center gap-3 bg-nanobanana-green text-white text-xl font-bold px-8 py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px] active:shadow-none"
                                >
                                    Start Your Study
                                    <ArrowRight className="w-6 h-6" />
                                </Link>
                            </motion.div>
                        </div>

                        {/* Dashboard Preview */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="hidden lg:block relative"
                        >
                            <motion.div
                                animate={{ y: [-10, 10, -10] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="relative z-10 bg-nanobanana-blue p-4 rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-2 hover:rotate-0 transition-transform duration-500"
                            >
                                <div className="bg-white rounded-[2rem] overflow-hidden border-4 border-black h-[500px] flex">
                                    {/* Scaled down Lesson View */}
                                    <div className="w-1/2 border-r-4 border-black overflow-hidden relative">
                                        <div className="absolute inset-0 bg-black/5 z-10"></div> {/* Overlay to prevent interaction */}
                                        <div className="transform scale-[0.6] origin-top-left w-[166%] h-[166%]">
                                            <LessonView />
                                        </div>
                                    </div>
                                    {/* Chat Interface with Demo Mode */}
                                    <div className="w-1/2 bg-gray-50">
                                        <ChatInterface demoMode={true} />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Decorative elements behind preview */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-nanobanana-yellow rounded-full border-4 border-black z-0"></div>
                            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-pink-400 rounded-full border-4 border-black z-0"></div>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* How It Works Section */}
            <section className="py-20 bg-yellow-50 relative">
                {/* Top Wave */}
                <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[50px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <motion.path
                            animate={{
                                d: [
                                    "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z",
                                    "M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                                ]
                            }}
                            transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                            className="fill-white"
                        ></motion.path>
                    </svg>
                </div>

                <div className="max-w-7xl mx-auto px-6 pt-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black font-comic mb-4">
                            Magic Learning Powers! <span className="text-nanobanana-yellow">✨</span>
                        </h2>
                        <p className="text-xl text-gray-600 font-medium">It's as easy as 1, 2, 3!</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-2 bg-white/50 -translate-y-1/2 z-0 border-t-4 border-dashed border-nanobanana-blue/30"></div>

                        {/* Step 1: Upload */}
                        <motion.div
                            whileHover={{ y: -10, rotate: -2 }}
                            className="relative z-10 bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center"
                        >
                            <div className="w-20 h-20 mx-auto bg-pink-400 rounded-2xl border-4 border-black flex items-center justify-center mb-6 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <span className="font-black text-3xl">1</span>
                            </div>
                            <h3 className="text-2xl font-bold font-comic mb-2">Upload Lesson</h3>
                            <p className="text-gray-600 font-medium">Snap a pic or upload your homework file.</p>
                        </motion.div>

                        {/* Step 2: Highlight */}
                        <motion.div
                            whileHover={{ y: -10, rotate: 2 }}
                            className="relative z-10 bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center"
                        >
                            <div className="w-20 h-20 mx-auto bg-nanobanana-blue rounded-2xl border-4 border-black flex items-center justify-center mb-6 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <span className="font-black text-3xl">2</span>
                            </div>
                            <h3 className="text-2xl font-bold font-comic mb-2">Highlight Stuff</h3>
                            <p className="text-gray-600 font-medium">Pick the tricky parts you need help with.</p>
                        </motion.div>

                        {/* Step 3: Transfer to Jeffrey */}
                        <motion.div
                            whileHover={{ y: -10, rotate: -2 }}
                            className="relative z-10 bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center"
                        >
                            <div className="w-20 h-20 mx-auto bg-nanobanana-green rounded-2xl border-4 border-black flex items-center justify-center mb-6 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <span className="font-black text-3xl">3</span>
                            </div>
                            <h3 className="text-2xl font-bold font-comic mb-2">Ask Jeffrey!</h3>
                            <p className="text-gray-600 font-medium">Watch the magic happen as Jeffrey explains it!</p>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Wave */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[50px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-gray-50"></path>
                    </svg>
                </div>
            </section>
            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,215,0,1)]">
                            <div className="w-16 h-16 bg-nanobanana-yellow rounded-2xl border-4 border-black flex items-center justify-center mb-6">
                                <MessageCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold font-comic mb-4">Chat with Jeffrey</h3>
                            <p className="text-gray-600 font-medium">
                                Your friendly AI tutor is always ready to help you learn new things and answer your questions!
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(65,105,225,1)]">
                            <div className="w-16 h-16 bg-nanobanana-blue rounded-2xl border-4 border-black flex items-center justify-center mb-6 text-white">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold font-comic mb-4">Interactive Lessons</h3>
                            <p className="text-gray-600 font-medium">
                                Watch videos, read fun facts, and explore topics with interactive content on the left screen.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(50,205,50,1)]">
                            <div className="w-16 h-16 bg-nanobanana-green rounded-2xl border-4 border-black flex items-center justify-center mb-6 text-white">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold font-comic mb-4">Magic Tools</h3>
                            <p className="text-gray-600 font-medium">
                                Instantly create flashcards, cool infographics, and explainer videos with just one click!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black text-white py-12">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-comic font-bold mb-6">Ready to learn?</h2>
                    <Link to="/study" className="inline-block bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition-colors">
                        Get Started Now
                    </Link>
                    <p className="mt-8 text-gray-500 text-sm">© 2024 K-6 AI Tutor. Made with ❤️ and 🍌</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
