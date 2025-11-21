import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Clock,
  Users,
  Sparkles,
  AlertCircle,
  DollarSign,
  FileX,
  FileText,
  Image,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Camera,
  Plane,
  Check,
  Bell,
  Upload,
  MessageCircle,
  Mail,
  Book,
  ShoppingCart,
  Lock,
} from 'lucide-react';

// Gamma components
import Button from '../components/gamma/Button';
import Card from '../components/gamma/Card';
import Badge from '../components/gamma/Badge';
import FloatingOrb from '../components/gamma/FloatingOrb';
import GradientMesh from '../components/gamma/GradientMesh';
import SectionHeader from '../components/gamma/SectionHeader';
import GammaOfferings from '../components/gamma/GammaOfferings';

// Visa-specific components
import PainPointCard from '../components/visa/PainPointCard';
import RejectionReasonCard from '../components/visa/RejectionReasonCard';
import CountryCard from '../components/visa/CountryCard';
import JeffreyShowcase from '../components/visa/JeffreyShowcase';

// Assets
import gammaClouds from '../assets/gamma-travel-bg.png';

export default function VisaAssistHomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated gradient mesh background */}
        <GradientMesh />

        {/* Floating gradient orbs */}
        <FloatingOrb color="primary" size="600px" position="top-left" blur="120px" opacity={0.3} />
        <FloatingOrb color="secondary" size="500px" position="top-right" blur="100px" opacity={0.25} delay={2} />

        {/* Content */}
        <div className="relative z-10 text-center max-w-5xl mx-auto px-6 py-32">
          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge
              variant="gradient"
              size="lg"
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg shadow-primary-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-semibold">
                Powered by AI
              </span>
            </Badge>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 bg-clip-text text-transparent leading-tight tracking-tight"
          >
            Reduce Your Visa
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-green-600 to-amber-600 bg-clip-text text-transparent">
              Rejection Risk
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl lg:text-3xl text-neutral-600 mb-12 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            AI-powered document processing, form filling, and compliance checking for GCC visas and immigration
            applications
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link to="/register">
              <Button
                size="xl"
                variant="gradient"
                className="px-8 py-4 text-lg rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 hover:scale-105 transition-all duration-300 group"
              >
                Process Your Documents
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <a href="#how-it-works">
              <Button
                size="xl"
                variant="ghost"
                className="px-8 py-4 text-lg rounded-2xl bg-white/80 backdrop-blur-sm text-neutral-900 font-semibold border-2 border-neutral-200 hover:bg-white hover:border-neutral-300 hover:scale-105 transition-all duration-300"
              >
                See How It Works
              </Button>
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-neutral-600"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">
                <strong className="text-neutral-900">24/7</strong> AI assistance
              </span>
            </div>

            <div className="hidden sm:block w-px h-6 bg-neutral-300" />

            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">
                <strong className="text-neutral-900">Instant</strong> document processing
              </span>
            </div>

            <div className="hidden sm:block w-px h-6 bg-neutral-300" />

            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium">
                Trusted by <strong className="text-neutral-900">5,000+</strong> users
              </span>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ opacity: { delay: 0.8 }, y: { repeat: Infinity, duration: 1.5 } }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-neutral-400 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-neutral-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ===== PROBLEM STATEMENT SECTION ===== */}
      <section className="py-24 relative overflow-hidden">
        {/* Gamma Cloud Background */}
        <div className="absolute inset-0 z-0">
          <img src={gammaClouds} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />
        </div>

        {/* Decorative background pattern - kept but made subtle */}
        <div
          className="absolute inset-0 opacity-[0.02] z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900">
              The{' '}
              <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                Hidden Cost
              </span>{' '}
              of Visa Rejection
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              One small error can cost you months of delays, thousands in fees, and endless frustration
            </p>
          </SectionHeader>

          {/* Pain Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <PainPointCard
              icon={<AlertCircle className="w-8 h-8 text-red-500" />}
              stat="40%"
              label="Rejection Rate"
              description="of first-time visa applications get rejected due to document errors"
              color="red"
            />

            <PainPointCard
              icon={<Clock className="w-8 h-8 text-orange-500" />}
              stat="3-6 months"
              label="Wasted Time"
              description="average delay from rejection to successful reapplication"
              color="orange"
            />

            <PainPointCard
              icon={<DollarSign className="w-8 h-8 text-amber-500" />}
              stat="AED 5,000+"
              label="Hidden Costs"
              description="in reapplication fees, document updates, and lost opportunities"
              color="amber"
            />

            <PainPointCard
              icon={<FileX className="w-8 h-8 text-cyan-500" />}
              stat="127"
              label="Form Fields"
              description="average number of fields in a GCC visa application"
              color="cyan"
            />
          </div>

          {/* Common Rejection Reasons */}
          <div>
            <h3 className="text-3xl font-bold text-center mb-12 text-neutral-900">Top Reasons for Visa Rejection</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <RejectionReasonCard
                icon={<FileText className="w-10 h-10" />}
                title="Incomplete Documents"
                description="Missing attestations, wrong formats, expired certificates"
                percentage="42%"
              />

              <RejectionReasonCard
                icon={<Image className="w-10 h-10" />}
                title="Photo Non-Compliance"
                description="Wrong dimensions, background color, or facial requirements"
                percentage="28%"
              />

              <RejectionReasonCard
                icon={<AlertTriangle className="w-10 h-10" />}
                title="Form Errors"
                description="Typos, inconsistent dates, missing signatures"
                percentage="30%"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CORE FEATURES SECTION ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader className="text-center mb-20">
            <Badge variant="outline" className="mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Core Features
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
                Apply Confidently
              </span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              AI-powered tools that help reduce errors and improve compliance
            </p>
          </SectionHeader>

          {/* Bento Grid Layout */}
          {/* Gamma Offerings Grid */}
          <GammaOfferings />
        </div>
      </section>

      {/* ===== HOW IT WORKS SECTION ===== */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        {/* Gamma Cloud Background */}
        <div className="absolute inset-0 z-0">
          <img src={gammaClouds} alt="" className="w-full h-full object-cover rotate-180" />
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]" />
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Simple as{' '}
              <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">1-2-3</span>
            </h2>
            <p className="text-xl text-neutral-600">From documents to approval in three easy steps</p>
          </SectionHeader>

          {/* Steps - Horizontal timeline */}
          <div className="relative max-w-5xl mx-auto">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-green-600 to-amber-600 opacity-20 -translate-y-1/2 hidden lg:block" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
              {/* Step 1: Upload */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="mb-6 relative h-64 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden flex items-center justify-center">
                  <Upload className="w-24 h-24 text-blue-400" />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900">Upload Documents</h3>
                </div>

                <p className="text-neutral-600 text-lg leading-relaxed mb-4">
                  Upload your passport, CV, certificates, or existing documents. Our AI extracts all relevant data
                  automatically.
                </p>

                <ul className="space-y-2 text-neutral-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Passport, ID cards, certificates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Employment letters, contracts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>Any PDF, JPG, or PNG</span>
                  </li>
                </ul>
              </motion.div>

              {/* Step 2: AI Processing */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative"
              >
                <div className="mb-6 h-64 rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50 flex items-center justify-center">
                  <Sparkles className="w-24 h-24 text-cyan-400" />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-600 to-green-500 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                    2
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900">AI Processing</h3>
                </div>

                <p className="text-neutral-600 text-lg leading-relaxed mb-4">
                  Our AI extracts data, validates documents, and helps fill forms with high accuracy in seconds.
                </p>

                <ul className="space-y-2 text-neutral-600">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-500" />
                    <span>Data extraction & validation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-500" />
                    <span>Compliance checking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-500" />
                    <span>Auto-fill all forms</span>
                  </li>
                </ul>
              </motion.div>

              {/* Step 3: Download & Submit */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative"
              >
                <div className="mb-6 h-64 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-24 h-24 text-green-400" />
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-500 text-white font-bold text-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900">Download & Submit</h3>
                </div>

                <p className="text-neutral-600 text-lg leading-relaxed mb-4">
                  Download your completed, verified forms and documents. Submit with confidence.
                </p>

                <ul className="space-y-2 text-neutral-600">
                  <li className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span>Ready-to-submit forms</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span>Validation report included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span>Improved application quality</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== JEFFREY AI SHOWCASE SECTION ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <JeffreyShowcase />
        </div>
      </section>

      {/* ===== GCC COVERAGE SECTION ===== */}
      <section className="py-24 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Complete{' '}
              <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
                GCC Coverage
              </span>
            </h2>
            <p className="text-xl text-neutral-600">Supporting all visa types across the Gulf Cooperation Council</p>
          </SectionHeader>

          {/* Country Coverage Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            <CountryCard flag="🇦🇪" name="UAE" visaTypes={['Work', 'Tourist', 'Residence', 'Family']} />
            <CountryCard flag="🇸🇦" name="Saudi Arabia" visaTypes={['Work', 'Umrah', 'Tourist', 'Residence']} />
            <CountryCard flag="🇶🇦" name="Qatar" visaTypes={['Work', 'Tourist', 'Residence']} />
            <CountryCard flag="🇴🇲" name="Oman" visaTypes={['Work', 'Tourist', 'Residence']} />
            <CountryCard flag="🇧🇭" name="Bahrain" visaTypes={['Work', 'Tourist', 'Residence']} />
            <CountryCard flag="🇰🇼" name="Kuwait" visaTypes={['Work', 'Tourist', 'Residence']} />
          </div>

          {/* Upcoming: Unified GCC Visa */}
          <Card className="rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 p-12 text-center shadow-xl relative overflow-hidden">
            <Badge variant="outline" className="mb-6 inline-flex">
              <Sparkles className="w-4 h-4 mr-2" />
              Coming Soon
            </Badge>

            <h3 className="text-4xl font-bold text-neutral-900 mb-4">Unified GCC Visa Ready</h3>

            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              When the Unified GCC Visa launches, we'll be the first platform to provide a single interface for
              managing applications across all member states.
            </p>

            <Button variant="outline" size="lg" className="rounded-2xl">
              <Bell className="mr-2 w-5 h-5" />
              Notify Me
            </Button>

            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
            />
          </Card>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <FloatingOrb color="primary" position="top-left" blur="150px" opacity={0.1} />
        <FloatingOrb color="secondary" position="bottom-right" blur="150px" opacity={0.1} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <SectionHeader className="text-center mb-20">
            <Badge variant="gradient" className="mb-4">
              <DollarSign className="w-4 h-4 mr-2" />
              Simple, Transparent Pricing
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Pay Only for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
                What You Use
              </span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              No subscriptions. No hidden fees. Pay per document or form processed.
            </p>
          </SectionHeader>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* AI Form Filler */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-neutral-900 mb-2">AI Form Filler</h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-neutral-900">75</span>
                <span className="text-xl text-neutral-500">AED</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-neutral-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Auto-fill any government form</span>
                </li>
                <li className="flex items-start gap-2 text-neutral-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>High accuracy AI processing</span>
                </li>
                <li className="flex items-start gap-2 text-neutral-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>10-minute processing</span>
                </li>
              </ul>

              <Link to="/register">
                <Button variant="outline" className="w-full rounded-xl">
                  Get Started
                </Button>
              </Link>
            </motion.div>

            {/* Document Validator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Document Validator</h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-neutral-900">40</span>
                <span className="text-xl text-neutral-500">AED</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-neutral-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Attestation verification</span>
                </li>
                <li className="flex items-start gap-2 text-neutral-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Format compliance check</span>
                </li>
                <li className="flex items-start gap-2 text-neutral-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Rejection risk report</span>
                </li>
              </ul>

              <Link to="/register">
                <Button variant="outline" className="w-full rounded-xl">
                  Get Started
                </Button>
              </Link>
            </motion.div>

            {/* Photo Compliance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-white/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-6">
                <Camera className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Photo Compliance</h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold text-neutral-900">20</span>
                <span className="text-xl text-neutral-500">AED</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-neutral-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>GCC visa photo specs</span>
                </li>
                <li className="flex items-start gap-2 text-neutral-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Auto background fix</span>
                </li>
                <li className="flex items-start gap-2 text-neutral-700">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Dimension optimization</span>
                </li>
              </ul>

              <Link to="/register">
                <Button variant="outline" className="w-full rounded-xl">
                  Get Started
                </Button>
              </Link>
            </motion.div>

            {/* Travel Itinerary - FEATURED */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 text-white shadow-2xl shadow-amber-500/50 scale-105 hover:scale-110 transition-all duration-500 relative overflow-hidden"
            >
              <Badge
                variant="white"
                className="absolute top-6 right-6 bg-white/20 backdrop-blur-lg border border-white/30 text-white font-bold"
              >
                <Sparkles className="w-4 h-4 mr-1 fill-current" />
                NEW
              </Badge>

              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                <Plane className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold mb-2">Travel Itinerary</h3>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold">125</span>
                <span className="text-xl text-orange-200">AED</span>
              </div>

              <ul className="space-y-3 mb-8 text-orange-50">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Schengen & tourist visas</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Verified hotel bookings</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>Realistic daily plans</span>
                </li>
              </ul>

              <Link to="/register">
                <Button variant="white" className="w-full rounded-xl">
                  Get Started
                </Button>
              </Link>

              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gradient-radial from-white/20 to-transparent blur-3xl" />
            </motion.div>
          </div>

          {/* Bundle Pricing */}
          <Card className="rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 p-12 text-center shadow-xl">
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">Complete Visa Package</h3>
            <p className="text-lg text-neutral-600 mb-6">Get all 4 services bundled together and save 20%</p>

            <div className="flex items-center justify-center gap-4 mb-6">
              <span className="text-3xl font-bold text-neutral-400 line-through">AED 260</span>
              <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
                AED 208
              </span>
            </div>

            <Link to="/register">
              <Button size="lg" variant="gradient" className="rounded-2xl shadow-lg shadow-blue-500/30">
                <ShoppingCart className="mr-2 w-5 h-5" />
                Get Complete Package
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* ===== SOCIAL PROOF & TRUST SECTION ===== */}
      <section className="py-24 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
                Thousands
              </span>
            </h2>
            <p className="text-xl text-neutral-600">
              Join expatriates, HR professionals, and visa agents who trust our AI
            </p>
          </SectionHeader>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-20">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent mb-2">
                5,000+
              </div>
              <div className="text-neutral-600 text-lg">Users Served</div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent mb-2">
                24/7
              </div>
              <div className="text-neutral-600 text-lg">AI Support</div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent mb-2">
                10 min
              </div>
              <div className="text-neutral-600 text-lg">Avg. Processing</div>
            </div>

            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent mb-2">
                15,000+
              </div>
              <div className="text-neutral-600 text-lg">Forms Filled</div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-lg border-2 border-neutral-200"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="text-amber-400 text-xl">
                    ★
                  </div>
                ))}
              </div>
              <p className="text-neutral-700 mb-6 leading-relaxed">
                "Saved me 3 hours of frustration. The AI filled my work visa form perfectly in 10 minutes. Worth every
                dirham!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                  AK
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">Ahmed K.</div>
                  <div className="text-sm text-neutral-500">Software Engineer, Dubai</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-lg border-2 border-neutral-200"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="text-amber-400 text-xl">
                    ★
                  </div>
                ))}
              </div>
              <p className="text-neutral-700 mb-6 leading-relaxed">
                "VisaAssist helped me prepare better documentation and my application was much stronger. Great support
                throughout the process!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-bold">
                  PS
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">Priya S.</div>
                  <div className="text-sm text-neutral-500">HR Manager, Abu Dhabi</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-lg border-2 border-neutral-200"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="text-amber-400 text-xl">
                    ★
                  </div>
                ))}
              </div>
              <p className="text-neutral-700 mb-6 leading-relaxed">
                "As a visa agent, I process 50+ applications monthly. This tool cut my processing time by 70%.
                Incredible!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-bold">
                  MA
                </div>
                <div>
                  <div className="font-semibold text-neutral-900">Mohammed A.</div>
                  <div className="text-sm text-neutral-500">Visa Consultant, Riyadh</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <SectionHeader className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 text-neutral-900">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-xl text-neutral-600">Everything you need to know about our AI visa assistant</p>
          </SectionHeader>

          <div className="space-y-4">
            {[
              {
                question: 'How accurate is the AI form filling?',
                answer:
                  'Our AI uses advanced OCR and GPT-4 Vision to read passports, IDs, and certificates with high accuracy. Every form is validated before delivery to help minimize errors. While we strive for the highest accuracy, we recommend users review all auto-filled information before submission.',
              },
              {
                question: 'Which government forms are supported?',
                answer:
                  'We support 20+ government forms including UAE ICP residence visa, work permit, family visa; Saudi Arabia Muqeem, Iqama renewal, work visa; Qatar work permit, residence visa; Schengen tourist visa application; and other GCC forms for Oman, Bahrain, and Kuwait.',
              },
              {
                question: 'Is my personal data secure?',
                answer:
                  'Yes. All data is encrypted in transit (SSL) and at rest. Documents are automatically deleted after 30 days. Your data is not shared with third parties. We maintain GDPR compliance with enterprise-grade security using Cloudflare R2.',
              },
              {
                question: 'What if my visa still gets rejected?',
                answer:
                  'We cannot guarantee visa approval as the final decision rests with immigration authorities. Our service focuses on helping you prepare accurate, compliant documentation to strengthen your application. We strive to minimize common errors that lead to rejection, but visa decisions depend on many factors beyond documentation.',
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-neutral-50 rounded-2xl p-6 hover:bg-neutral-100 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">{faq.question}</h3>
                    <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Still have questions CTA */}
          <Card className="mt-16 rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 p-12 text-center shadow-xl">
            <MessageCircle className="w-16 h-16 mx-auto mb-6 text-blue-600" />
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">Still Have Questions?</h3>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Our support team is here to help! We respond within 2 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="gradient" size="lg" className="rounded-2xl px-8 shadow-lg shadow-blue-500/30">
                <Mail className="mr-2 w-5 h-5" />
                Contact Support
              </Button>
              <Button variant="outline" size="lg" className="rounded-2xl px-8">
                <Book className="mr-2 w-5 h-5" />
                View Help Center
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* ===== FINAL CTA SECTION ===== */}
      <section className="py-32 bg-gradient-to-br from-blue-600 via-green-600 to-amber-600 text-white relative overflow-hidden">
        {/* Animated background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Badge variant="white" className="mb-6 inline-flex bg-white/20 backdrop-blur-lg border border-white/30">
            <Sparkles className="w-4 h-4 mr-2" />
            Get Started Today
          </Badge>

          <h2 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
            Stop Wasting Time on
            <br />
            Visa Applications
          </h2>

          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Let AI handle the paperwork. You focus on what matters.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/register">
              <Button
                size="xl"
                variant="white"
                className="px-10 py-5 text-xl rounded-2xl bg-white text-blue-600 font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 group"
              >
                Process Documents Now
                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <a href="#pricing">
              <Button
                size="xl"
                variant="outline"
                className="px-10 py-5 text-xl rounded-2xl bg-transparent text-white font-semibold border-2 border-white/30 backdrop-blur-sm hover:bg-white/10 hover:border-white hover:scale-105 transition-all duration-300"
              >
                View Pricing
              </Button>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span>Data deleted after 30 days</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>10-minute processing</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-radial from-white/20 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 4, delay: 2 }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-radial from-white/20 to-transparent blur-3xl"
        />
      </section>
    </div>
  );
}
