import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Heart, Shield, Rocket, BookOpen, Users } from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: 'Child-First Design',
      description: 'Every feature is crafted with children\'s safety, engagement, and learning outcomes as the top priority.',
      color: 'text-pink-500',
      bg: 'bg-pink-50',
    },
    {
      icon: Sparkles,
      title: 'AI for Good',
      description: 'We use AI responsibly to create personalized, engaging educational experiences while protecting privacy.',
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      icon: Shield,
      title: 'Privacy & Safety',
      description: 'COPPA compliant with strict data protection. Parents have full control over their children\'s information.',
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      icon: Rocket,
      title: 'Learning Should Be Fun',
      description: 'Education doesn\'t have to be boring. We make learning an adventure that kids actually want to go on.',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Making Learning an Adventure
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Orbit Learn transforms any educational content into personalized, engaging learning experiences
              that help K-6 students thrive. Powered by AI, designed for kids, trusted by parents.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg mb-4">
                We believe every child deserves access to personalized, engaging education that meets them
                where they are. Traditional one-size-fits-all approaches leave too many kids behind or bored.
              </p>
              <p className="text-gray-600 text-lg mb-4">
                Orbit Learn uses the power of AI to transform any educational material - textbooks, worksheets,
                notes - into interactive lessons, quizzes, and flashcards tailored to each child's age,
                interests, and learning style.
              </p>
              <p className="text-gray-600 text-lg">
                Whether it's making fractions fun for a visual learner or helping an eager reader dive deeper
                into science, we're here to make learning an adventure every child wants to go on.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-blue-600" />
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-yellow-900" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Stand For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 ${value.bg} rounded-xl flex items-center justify-center mb-4`}>
                  <value.icon className={`w-6 h-6 ${value.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Brief */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-12">
            Parents upload educational content, our AI transforms it into engaging lessons,
            and children learn through interactive study guides, quizzes, and flashcards -
            all while parents track progress from their dashboard.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Upload Content</h3>
              <p className="text-gray-600 text-sm">Parents add educational materials from school or anywhere else</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Magic</h3>
              <p className="text-gray-600 text-sm">Our AI creates personalized, age-appropriate learning materials</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-pink-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Kids Learn</h3>
              <p className="text-gray-600 text-sm">Children enjoy interactive lessons while parents track progress</p>
            </div>
          </div>
          <div className="mt-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Get Started Free
              <Rocket className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Built by Parents, for Parents</h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-8">
            Orbit Learn was created by parents and educators who understand the challenges of helping
            kids learn in today's world. We're committed to building tools that actually work for
            real families.
          </p>
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-sm">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-gray-600">Questions? We'd love to hear from you.</span>
            <Link to="/contact" className="text-blue-600 font-medium hover:underline">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Orbit Learn. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/privacy-policy" className="hover:text-gray-700">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-700">Terms of Service</Link>
            <Link to="/coppa" className="hover:text-gray-700">COPPA Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
