import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface DashboardGammaCardProps {
    title: string;
    description: string;
    image: string;
    stats: {
        total: number;
        label: string;
        completeness?: number;
    };
    cta: {
        label: string;
        href: string;
    };
    onClick?: () => void;
    className?: string;
    delay?: number;
}

export const DashboardGammaCard: React.FC<DashboardGammaCardProps> = ({
    title,
    description,
    image,
    stats,
    cta,
    onClick,
    className,
    delay = 0,
}) => {
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -8 }}
        >
            <Link
                to={cta.href}
                onClick={handleClick}
                className={cn(
                    'block group relative overflow-hidden rounded-3xl bg-white border border-neutral-200 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col',
                    className
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Image Section */}
                    <div className="relative h-48 bg-gradient-to-br from-neutral-50 to-neutral-100 overflow-hidden flex items-center justify-center p-6">
                        <motion.img
                            src={image}
                            alt={title}
                            className="w-full h-full object-contain drop-shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {title}
                        </h3>
                        <p className="text-neutral-600 text-sm mb-6 line-clamp-2">
                            {description}
                        </p>

                        <div className="mt-auto">
                            {/* Stats */}
                            <div className="flex items-end justify-between mb-4 pb-4 border-b border-neutral-100">
                                <div>
                                    <div className="text-3xl font-bold text-neutral-900 leading-none mb-1">
                                        {stats.total}
                                    </div>
                                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                                        {stats.label}
                                    </div>
                                </div>

                                {stats.completeness !== undefined && (
                                    <div className="text-right w-1/2">
                                        <div className="text-xs font-semibold text-neutral-900 mb-1">
                                            {stats.completeness}% Complete
                                        </div>
                                        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                                style={{ width: `${stats.completeness}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-blue-600 text-sm group-hover:text-blue-700 transition-colors">
                                    {cta.label}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                    <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};
