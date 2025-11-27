import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, MessageCircle, Star } from 'lucide-react';

const AnimatedCounter = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const SocialProofBar = () => {
  const stats = [
    {
      icon: Users,
      value: 10000,
      suffix: '+',
      label: 'Happy Families',
      color: 'nanobanana-blue',
    },
    {
      icon: MessageCircle,
      value: 1000000,
      suffix: '+',
      label: 'Questions Answered',
      color: 'nanobanana-green',
    },
    {
      icon: Star,
      value: 4.9,
      suffix: '',
      label: 'Star Rating',
      color: 'nanobanana-yellow',
      isDecimal: true,
    },
  ];

  return (
    <section className="py-8 bg-gradient-to-r from-gray-50 to-gray-100 border-y-4 border-black">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`w-14 h-14 bg-${stat.color} rounded-2xl border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
                style={{
                  backgroundColor: stat.color === 'nanobanana-blue' ? '#4169E1' :
                    stat.color === 'nanobanana-green' ? '#32CD32' : '#FFD700'
                }}
              >
                <stat.icon className={`w-7 h-7 ${stat.color === 'nanobanana-yellow' ? 'text-black' : 'text-white'}`} />
              </motion.div>
              <div>
                <div className="text-3xl md:text-4xl font-black font-comic">
                  {stat.isDecimal ? (
                    <span>{stat.value}</span>
                  ) : (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  )}
                  {stat.isDecimal && (
                    <span className="text-nanobanana-yellow ml-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 inline fill-current" />
                      ))}
                    </span>
                  )}
                </div>
                <div className="text-gray-600 font-bold text-sm">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofBar;
