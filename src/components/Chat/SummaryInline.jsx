import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Lightbulb, Star, Target, List } from 'lucide-react';

/**
 * SummaryInline - Displays a colorful, structured summary inline in chat
 * Shows title, key points, vocabulary, and fun facts in an engaging format
 */
const SummaryInline = ({ summary }) => {
    if (!summary) {
        return (
            <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-500">
                No summary available
            </div>
        );
    }

    const {
        title,
        overview,
        keyPoints = [],
        vocabulary = [],
        funFacts = [],
        takeaway,
    } = summary;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            className="w-full max-w-lg space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Title */}
            {title && (
                <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-2 p-3 bg-nanobanana-blue text-white rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                    <BookOpen className="w-6 h-6 flex-shrink-0" />
                    <h3 className="font-bold text-lg">{title}</h3>
                </motion.div>
            )}

            {/* Overview */}
            {overview && (
                <motion.div
                    variants={itemVariants}
                    className="p-3 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    <p className="text-sm leading-relaxed">{overview}</p>
                </motion.div>
            )}

            {/* Key Points */}
            {keyPoints.length > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="p-3 bg-nanobanana-yellow rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5" />
                        <h4 className="font-bold">Key Points</h4>
                    </div>
                    <ul className="space-y-2">
                        {keyPoints.map((point, index) => (
                            <motion.li
                                key={index}
                                variants={itemVariants}
                                className="flex items-start gap-2 text-sm"
                            >
                                <span className="flex-shrink-0 w-5 h-5 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                </span>
                                <span>{point}</span>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Vocabulary */}
            {vocabulary.length > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="p-3 bg-nanobanana-green rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <List className="w-5 h-5" />
                        <h4 className="font-bold">New Words</h4>
                    </div>
                    <div className="space-y-2">
                        {vocabulary.map((item, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="p-2 bg-white/50 rounded-lg"
                            >
                                <span className="font-bold text-sm">{item.term}</span>
                                <span className="text-sm"> - {item.definition}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Fun Facts */}
            {funFacts.length > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="p-3 bg-pink-200 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-5 h-5" />
                        <h4 className="font-bold">Fun Facts!</h4>
                    </div>
                    <ul className="space-y-2">
                        {funFacts.map((fact, index) => (
                            <motion.li
                                key={index}
                                variants={itemVariants}
                                className="flex items-start gap-2 text-sm"
                            >
                                <Star className="w-4 h-4 flex-shrink-0 text-yellow-600 fill-yellow-400" />
                                <span>{fact}</span>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>
            )}

            {/* Takeaway */}
            {takeaway && (
                <motion.div
                    variants={itemVariants}
                    className="p-3 bg-purple-200 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🎯</span>
                        <div>
                            <h4 className="font-bold text-sm">Remember This!</h4>
                            <p className="text-sm">{takeaway}</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default SummaryInline;
