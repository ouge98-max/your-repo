import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MediaBubble from './MediaBubble';
import MediaBubbleGrid from './MediaBubbleGrid';
import { PlatformButton } from './ui/PlatformButton';
import { ShieldIcon, SparklesIcon, Bolt, WalletIcon } from './icons';
const rideVideoUrl = new URL('../ride.mp4', import.meta.url).href;
const creatorsImgUrl = new URL('../creators.jpg', import.meta.url).href;
// New media assets for bubble cluster
const playImgUrl = new URL('../play.jpg', import.meta.url).href;
const friendsImgUrl = new URL('../friends.jpg', import.meta.url).href;
const friendsCommImgUrl = new URL('../friends communication.jpg', import.meta.url).href;
const activitiesImgUrl = new URL('../activities.jpg', import.meta.url).href;
const airImgUrl = new URL('../air.jpg', import.meta.url).href;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  // Landing page focuses on clear CTA navigation

  // Bubble visuals use local/gradient backgrounds to avoid external image requests

  // Animation variants for value-prop icons
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  const handleCreateAccount = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brandGreen-50 via-white to-brandRed-100">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <motion.img 
              src="/logo.jpg" 
              alt="Ouma-Ge" 
              className="w-12 h-12 rounded-xl shadow-lg border-2 border-white object-cover"
              whileHover={{ rotate: 2, scale: 1.03 }}
              transition={{ type: 'spring', stiffness: 160, damping: 14 }}
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-brand-900 leading-none">Ouma-Ge</span>
              <span className="text-xs font-semibold text-muted-foreground">Bangladesh's first super app</span>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <motion.button 
              onClick={handleLogin}
              className="px-6 py-2 text-brandGreen-700 hover:text-brandGreen-800 font-medium transition-colors border-2 border-brandGreen-600 rounded-full hover:bg-brandGreen-50"
              whileHover={{ scale: 1.05 }}
            >
              Sign In
            </motion.button>
            <motion.button 
              onClick={handleCreateAccount}
              className="px-6 py-3 bg-gradient-to-r from-brandGreen-600 to-brandGreen-700 text-white rounded-full font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-white"
              whileHover={{ scale: 1.05 }}
            >
              Get Started
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative space-y-8 pt-8 md:pt-10 pb-16 md:pb-20 min-h-[320px]"
          >
            {/* Circle Bubble Cluster (visual accent like screenshot) */}
            <div className="bubble-cluster z-0 pointer-events-none" aria-hidden={true}>
              {/* Newly added image bubbles */}
              <div
                className="bubble bubble-md bubble-delay-2"
                style={{ left: 'calc(22% + 2px)', top: 'calc(18% - 2px)', animationDuration: '7.0s' }}
              >
                <MediaBubble src={playImgUrl} alt="Play moments" size={140} style={{ border: 'none' }} />
              </div>
              <div
                className="bubble bubble-sm bubble-delay-3"
                style={{ left: 'calc(80% - 3px)', top: 'calc(20% + 2px)', animationDuration: '7.4s' }}
              >
                <MediaBubble src={friendsImgUrl} alt="Friends together" size={80} style={{ border: 'none' }} />
              </div>
              <div
                className="bubble bubble-md bubble-delay-4"
                style={{ left: 'calc(8% - 2px)', top: 'calc(52% + 2px)', animationDuration: '7.8s' }}
              >
                <MediaBubble src={friendsCommImgUrl} alt="Friends communication" size={140} style={{ border: 'none' }} />
              </div>
              <div
                className="bubble bubble-sm bubble-delay-5"
                style={{ left: 'calc(44% + 3px)', top: 'calc(66% - 2px)', animationDuration: '6.9s' }}
              >
                <MediaBubble src={activitiesImgUrl} alt="Activities highlight" size={80} style={{ border: 'none' }} />
              </div>
              <div
                className="bubble bubble-lg bubble-delay-5"
                style={{ left: 'calc(64% - 3px)', top: 'calc(58% + 3px)', animationDuration: '6.9s' }}
              >
                <MediaBubble src={rideVideoUrl} alt="City ride moment" type="video" size={200} captionsSrc="/ride.vtt" style={{ border: 'none' }} />
              </div>
              
            </div>
            <div className="relative z-10 space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight"
              >
                Join us to unlock exclusive features for
                <span className="bg-gradient-to-r from-brandGreen-600 via-brand-700 to-brandRed-600 bg-clip-text text-transparent"> 
                  creators
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                Make creation, publishing, data analysis, and monetization more efficient.
              </motion.p>
            </div>

            {/* Value Props Strip */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
              <motion.div variants={itemVariants} className="value-prop-item flex items-center gap-2 bg-white/90 dark:bg-white/15 backdrop-blur-xl border border-white/40 dark:border-white/15 rounded-2xl px-3 py-2">
                <SparklesIcon className="h-5 w-5 text-brand-700" />
                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Inspirational content</span>
              </motion.div>
              <motion.div variants={itemVariants} className="value-prop-item flex items-center gap-2 bg-white/90 dark:bg-white/15 backdrop-blur-xl border border-white/40 dark:border-white/15 rounded-2xl px-3 py-2">
                <ShieldIcon className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Secure payments</span>
              </motion.div>
              <motion.div variants={itemVariants} className="value-prop-item flex items-center gap-2 bg-white/90 dark:bg-white/15 backdrop-blur-xl border border-white/40 dark:border-white/15 rounded-2xl px-3 py-2">
                <Bolt className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Faster services</span>
              </motion.div>
              <motion.div variants={itemVariants} className="value-prop-item flex items-center gap-2 bg-white/90 dark:bg-white/15 backdrop-blur-xl border border-white/40 dark:border-white/15 rounded-2xl px-3 py-2">
                <WalletIcon className="h-5 w-5 text-indigo-600" />
                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">Trusted wallet</span>
              </motion.div>
            </motion.div>

            {/* Feature Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-3 border border-white/20">
                <div className="w-10 h-10 bg-gradient-to-r from-brandGreen-600 to-brandRed-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Discover</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Explore trending content</p>
              </div>

              <div className="bg-white/70 dark:bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-3 border border-white/20">
                <div className="w-10 h-10 bg-gradient-to-r from-brandRed-600 to-brandGreen-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Share</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Post your lifestyle</p>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="relative z-10 flex flex-col sm:flex-row gap-4"
            >
              <PlatformButton 
                size="lg" 
                variant="primary"
                className="bg-gradient-to-r from-brandGreen-600 via-brand-700 to-brandRed-600 text-white rounded-full font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 cta-pulse shadow-lg"
                onClick={handleCreateAccount}
                haptic={true}
                keyboardShortcut="Enter"
                ariaLabel="Create new Oumage account"
              >
                <span>Create Account</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </PlatformButton>
              
              <PlatformButton 
                size="lg" 
                variant="outline" 
                className="border-2 border-brandGreen-600 text-brandGreen-600 dark:text-brandGreen-400 rounded-full font-semibold text-lg hover:bg-brandGreen-50 dark:hover:bg-brandGreen-900/20 transition-all duration-300"
                onClick={handleLogin}
                haptic={true}
                ariaLabel="Sign in to existing Oumage account"
              >
                Sign In
              </PlatformButton>
            </motion.div>

            {/* Mini Brand Palette */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="mt-2"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded-full bg-brandGreen-600 border-2 border-white"></span>
                  <span className="text-sm text-muted-foreground">Growth, prosperity</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded-full bg-brand-700 border-2 border-white"></span>
                  <span className="text-sm text-muted-foreground">Trust, technology</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-6 h-6 rounded-full bg-brandRed-600 border-2 border-white"></span>
                  <span className="text-sm text-muted-foreground">Energy, celebration</span>
                </div>
              </div>
            </motion.div>

            {/* Feature Showcase Grid */}
            <div className="mt-6">
              <MediaBubbleGrid />
            </div>
          </motion.div>

          {/* Right Side - Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-red-600 rounded-3xl blur-3xl opacity-20"></div>
              
              {/* Main phone mockup */}
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-4 shadow-2xl border border-white/20">
                <div className="aspect-[9/19] w-64 mx-auto">
                  {/* Phone screen content */}
                  <div className="bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-800 dark:to-purple-900 rounded-2xl p-4 h-full space-y-3">
                    {/* Mock content */}
                    <div className="flex space-x-2">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-red-600 rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-white/60 dark:bg-white/10 rounded-full w-3/4"></div>
                        <div className="h-3 bg-white/40 dark:bg-white/5 rounded-full w-1/2"></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="aspect-square bg-gradient-to-br from-red-500 to-green-600 rounded-xl"></div>
                      <div className="aspect-square bg-gradient-to-br from-brandGreen-500 via-brand-700 to-brandRed-600 rounded-xl"></div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-8 bg-white/60 dark:bg-white/10 rounded-xl"></div>
                      <div className="h-6 bg-white/40 dark:bg-white/5 rounded-lg w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-brandGreen-500 to-brand-700 rounded-2xl shadow-lg flex items-center justify-center"
              >
                <span className="text-white text-2xl">⭐</span>
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-brandRed-500 to-brandRed-600 rounded-xl shadow-lg flex items-center justify-center"
              >
                <span className="text-white text-xl">💎</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 dark:border-white/10 shadow-lg"
      >
        <div className="flex space-x-8 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">10M+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Creators</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">100M+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">50+</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Countries</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
