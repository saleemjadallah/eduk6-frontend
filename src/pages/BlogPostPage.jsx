import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Tag,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  CheckCircle,
  Shield,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { getBlogPostBySlug, getRelatedPosts, blogPosts } from '../data/blogPosts';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const post = getBlogPostBySlug(slug);
  const relatedPosts = post ? getRelatedPosts(slug, 3) : [];

  // Redirect to blog if post not found
  useEffect(() => {
    if (!post) {
      navigate('/blog', { replace: true });
    }
  }, [post, navigate]);

  // Update document title for SEO
  useEffect(() => {
    if (post) {
      document.title = post.metaTitle;
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.metaDescription);
      }
    }
    return () => {
      document.title = 'Orbit Learn';
    };
  }, [post]);

  if (!post) {
    return null;
  }

  const shareUrl = `https://orbitlearn.com/blog/${post.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
  };

  // Category icon mapping
  const getCategoryIcon = (category) => {
    const icons = {
      'Safety & Privacy': Shield,
      'Learning Tips': BookOpen,
      'Product Updates': Sparkles,
    };
    return icons[category] || BookOpen;
  };

  const CategoryIcon = getCategoryIcon(post.category);

  // Parse markdown-like content to HTML
  const renderContent = (content) => {
    // Split content by paragraphs and headers
    const lines = content.trim().split('\n');
    let html = '';
    let inList = false;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        return;
      }

      // Headers
      if (trimmedLine.startsWith('## ')) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        const text = trimmedLine.substring(3);
        html += `<h2 class="text-2xl font-bold text-gray-900 mt-12 mb-6">${text}</h2>`;
      } else if (trimmedLine.startsWith('### ')) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        const text = trimmedLine.substring(4);
        html += `<h3 class="text-xl font-semibold text-gray-900 mt-8 mb-4">${text}</h3>`;
      }
      // Bold paragraphs (standalone)
      else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && trimmedLine.split('**').length === 3) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        const text = trimmedLine.slice(2, -2);
        html += `<p class="font-semibold text-gray-900 mt-6 mb-2">${text}</p>`;
      }
      // Numbered list items
      else if (/^\d+\.\s/.test(trimmedLine)) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        const text = trimmedLine.replace(/^\d+\.\s/, '');
        html += `<div class="flex items-start gap-3 my-4">
          <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">${trimmedLine.match(/^\d+/)[0]}</span>
          <p class="text-gray-700">${formatInlineText(text)}</p>
        </div>`;
      }
      // Bullet list items
      else if (trimmedLine.startsWith('- ')) {
        if (!inList) {
          html += '<ul class="space-y-3 my-4 ml-4">';
          inList = true;
        }
        const text = trimmedLine.substring(2);
        html += `<li class="flex items-start gap-2 text-gray-700">
          <span class="text-blue-500 mt-1.5">&#8226;</span>
          <span>${formatInlineText(text)}</span>
        </li>`;
      }
      // Regular paragraphs
      else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += `<p class="text-gray-700 leading-relaxed my-4">${formatInlineText(trimmedLine)}</p>`;
      }
    });

    if (inList) {
      html += '</ul>';
    }

    return html;
  };

  // Format inline text (bold, links, etc.)
  const formatInlineText = (text) => {
    // Bold text
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
    return text;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(post.schema)
        }}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Articles
          </Link>

          {/* Share buttons */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden sm:inline">Share:</span>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-blue-400 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Share on Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Share on Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={shareLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-blue-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <button
              onClick={handleCopyLink}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Copy link"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Article Header */}
      <section className="bg-white pt-12 pb-8 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                <CategoryIcon className="w-4 h-4" />
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-500 mb-6">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readingTime}
              </span>
              <span className="text-gray-400">|</span>
              <span>By {post.author}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="bg-white pb-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl aspect-video flex items-center justify-center overflow-hidden">
            <div className="text-center p-8">
              <Shield className="w-24 h-24 text-blue-600 mx-auto mb-4" />
              <span className="text-blue-600 font-medium text-lg">{post.category}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="bg-white py-8">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
          />
        </div>
      </article>

      {/* CTA Box */}
      <section className="bg-white py-8">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <Sparkles className="w-10 h-10 mx-auto mb-4 text-white/80" />
            <h3 className="text-2xl font-bold mb-3">
              Ready to see how safe AI learning can transform your child's education?
            </h3>
            <p className="text-white/90 mb-6 max-w-lg mx-auto">
              Try Orbit Learn free for 7 days. No credit card required.
            </p>
            <Link
              to="/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Start Your Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Author Box */}
      <section className="bg-white py-8 border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              OL
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{post.author}</h4>
              <p className="text-gray-600 text-sm">
                The Orbit Learn team is dedicated to making AI-powered education safe, engaging, and effective for children ages 4-12. We're parents and educators who believe every child deserves personalized learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => {
                const RelatedIcon = getCategoryIcon(relatedPost.category);
                return (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.slug}`}
                    className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 aspect-video flex items-center justify-center">
                      <RelatedIcon className="w-10 h-10 text-blue-400" />
                    </div>
                    <div className="p-4">
                      <span className="text-xs text-gray-500">{relatedPost.category}</span>
                      <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* More Articles Section - show if no related posts */}
      {relatedPosts.length === 0 && blogPosts.length > 1 && (
        <section className="bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Explore More Articles</h2>
            <p className="text-gray-600 mb-6">
              Stay updated with the latest insights on AI-powered learning and child education.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              View All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-500 text-sm">
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

export default BlogPostPage;
