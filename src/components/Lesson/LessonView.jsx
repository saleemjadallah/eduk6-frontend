import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, PlayCircle, Star } from 'lucide-react';

const LessonView = () => {
    return (
        <div className="flex-[1.5] bg-white rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black overflow-hidden flex flex-col">
            {/* Lesson Header */}
            <div className="bg-nanobanana-green border-b-4 border-black p-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold">SCIENCE</span>
                    <div className="flex gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-black" />
                        <Star className="w-4 h-4 fill-yellow-400 text-black" />
                        <Star className="w-4 h-4 fill-yellow-400 text-black" />
                    </div>
                </div>
                <h1 className="text-3xl font-black font-comic text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    The Solar System Adventure
                </h1>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]">
                <div className="space-y-6">
                    {/* Video Placeholder */}
                    <div className="aspect-video bg-black rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group cursor-pointer overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1614730341194-75c607ae82b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="Space"
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                                <PlayCircle className="w-8 h-8 ml-1" />
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="prose prose-lg max-w-none">
                        <h3 className="font-comic font-bold text-2xl mb-4">What is the Solar System?</h3>
                        <p className="font-medium text-gray-700 leading-relaxed">
                            The Solar System is our home in the galaxy! It consists of the Sun and everything that orbits around it, including eight planets, many moons, asteroids, comets, and meteoroids.
                        </p>

                        <div className="my-6 p-4 bg-yellow-50 border-l-8 border-nanobanana-yellow rounded-r-xl">
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <BookOpen className="w-5 h-5" />
                                Fun Fact!
                            </h4>
                            <p>The Sun contains 99.86% of the Solar System's known mass!</p>
                        </div>

                        <p className="font-medium text-gray-700 leading-relaxed">
                            Gravity is the force that keeps all these objects in orbit around the Sun. Without the Sun's gravity, the planets would fly off into deep space!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LessonView;
