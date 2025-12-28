import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Tag,
  BookOpen,
  Shield,
  Sparkles
} from 'lucide-react';
import { blogPosts, getAllCategories } from '../data/blogPosts';

const BlogPage = () => {
  const categories = getAllCategories();
  const featuredPost = blogPosts[0]; // Most recent post as featured
  const otherPosts = blogPosts.slice(1);

  // Category icon mapping
  const getCategoryIcon = (category) => {
    const icons = {
      'Safety & Privacy': Shield,
      'Learning Tips': BookOpen,
      'Product Updates': Sparkles,
    };
    return icons[category] || BookOpen;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Meta Tags - would use react-helmet in production */}

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
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Orbit Learn Blog
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Insights on AI-powered learning, child safety, parenting tips, and educational technology for families and educators.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
              All Posts
            </span>
            {categories.map((category) => {
              const Icon = getCategoryIcon(category);
              return (
                <button
                  key={category}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                >
                  <Icon className="w-4 h-4" />
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
                Featured Article
              </span>

              <Link to={`/blog/${featuredPost.slug}`} className="block group">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Featured Image Placeholder */}
                  <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl aspect-video flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <Shield className="w-20 h-20 text-blue-600 mx-auto mb-4" />
                      <span className="text-blue-600 font-medium">{featuredPost.category}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readingTime}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {featuredPost.title}
                    </h2>

                    <p className="text-gray-600 text-lg mb-6 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {featuredPost.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                      Read Full Article
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Other Posts Grid */}
      {otherPosts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">More Articles</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPosts.map((post, index) => {
                const CategoryIcon = getCategoryIcon(post.category);
                return (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group h-full"
                    >
                      {/* Image Placeholder */}
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 aspect-video flex items-center justify-center">
                        <CategoryIcon className="w-12 h-12 text-blue-400" />
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                          <span>{post.category}</span>
                          <span>|</span>
                          <span>{post.readingTime}</span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>

                        <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read more <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Stay Updated on AI-Powered Learning
            </h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Get the latest insights on child safety, educational technology, and learning tips delivered to your inbox.
            </p>

            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </form>

            <p className="text-gray-500 text-sm mt-4">
              No spam, unsubscribe anytime. Read our{' '}
              <Link to="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Transform Your Child's Learning?
          </h2>
          <p className="text-white/90 mb-8 max-w-xl mx-auto">
            Join thousands of families using Orbit Learn to make education personalized, engaging, and safe.
          </p>
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
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
            <Link to="/contact" className="hover:text-gray-700">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
