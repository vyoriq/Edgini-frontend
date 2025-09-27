import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import authenticatedFetch from '../utils/apiClient';
import HindiKeyboard from './HindiKeyboard';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export default function LearnPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]); // 🔁 for GPT context
  const [stage, setStage] = useState('explain');       // 👣 AI flow stage
  const [lastAnswer, setLastAnswer] = useState(null);  // 🧠 last user answer
  const [loading, setLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [language, setLanguage] = useState('en');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [queryUsage, setQueryUsage] = useState({ current: 0, limit: 0 });
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [subscriptionFetched, setSubscriptionFetched] = useState(false); // Prevent duplicate API calls
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isHindiKeyboardVisible, setIsHindiKeyboardVisible] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  // Speech recognition hook
  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    error: speechError,
    hasPermission,
    toggleListening,
    resetTranscript
  } = useSpeechRecognition(language);


  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Add alert to see if we reach here
        console.log('LearnPage initializing...');
        
        // Wait for session to be ready
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Log to both console and alert so we can see it
        const sessionStatus = session ? 'Session found' : 'No session';
        console.log('Session status:', sessionStatus, session);
        
        // Don't redirect immediately, let's see what happens
        const profile = localStorage.getItem('vyoriqUserProfile');
        if (profile && !subscriptionFetched) {
          const parsed = JSON.parse(profile);
          setUserProfile(parsed);
          setUsername(parsed.name || parsed.fullName || parsed.user_metadata?.name || '');
          
          // Only try to fetch if we have a session
          if (session) {
            setSubscriptionFetched(true);
            fetchSubscriptionDetails();
          } else {
            console.error('No session available for API calls');
            // Show alert instead of immediate redirect
            alert('No active session found. Please log in again.');
            setTimeout(() => navigate('/auth'), 2000);
          }
        }
        const savedLang = localStorage.getItem('vyoriqLanguage') || 'en';
        setLanguage(savedLang);
      } catch (error) {
        console.error('Error in LearnPage initialization:', error);
        alert('Error initializing: ' + error.message);
      }
    };
    
    initializeApp();
  }, [subscriptionFetched]);

  // Debug queryUsage changes
  useEffect(() => {
    console.log('Query usage state updated:', queryUsage);
  }, [queryUsage]);

  // Handle speech recognition transcript updates
  useEffect(() => {
    if (transcript && transcript.trim()) {
      setQuery(transcript.trim());
    }
  }, [transcript]);

  useEffect(() => {
    // Close dropdown and sidebar when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.hamburger-menu')) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const extractTopicFromQuery = (text) =>
    text.replace(/^(what is|define|explain|tell me about)\s+/i, '').split('?')[0].trim();

  /**
   * Fetches user subscription details from backend API
   * Handles authentication and error cases securely
   */
  const fetchSubscriptionDetails = async () => {
    try {
      // Get user_id from localStorage instead of making API call
      const profile = localStorage.getItem('vyoriqUserProfile');
      if (!profile) {
        navigate("/auth");
        return null;
      }
      
      const userProfile = JSON.parse(profile);
      const userId = userProfile.userId;

      // Call backend subscription_details API with user_id parameter
      const data = await authenticatedFetch(`/subscription_details?user_id=${userId}`);
      setSubscriptionDetails(data);
      setQueryUsage(prev => ({
        current: prev.current || data.current , // Keep current usage from curate API
        limit: data.daily_limit || 0 // Set limit from subscription_details API
      }));
      console.log('Subscription details loaded. Daily limit:', data.daily_limit);
      return data;
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      // Fallback to local subscription check if API fails
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, { type: 'user', content: query }]);
    setChatHistory((prev) => [...prev, userMsg]);
    setQuery('');
    setIsThinking(true);


    let body = {
      user_id: userProfile.userId,
      topic: extractTopicFromQuery(query),
      class_level: userProfile.gradeLevel,
      proficiency_level: 'beginner',
      learning_goal: userProfile.goals?.[0] || 'curiosity',
      learning_style: userProfile.learningStyle || 'text-based',
      language,
      locale: 'India',
      chat_history: chatHistory || [],
      stage,
      last_answer: stage.includes('validate') ? query : null
    };


    try {
      const data = await authenticatedFetch('/curate', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const aiReply = data.content.text;

      // Update current query usage from curate API response
      if (data.current !== undefined) {
        setQueryUsage(prev => ({
          current: data.current, // Current usage from /curate endpoint
          limit: prev.limit // Keep limit from subscription_details API
        }));
        console.log('Updated current usage to:', data.current);
      }

      setMessages((prev) => [...prev, { type: 'ai', content: data.content }]);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: aiReply }]);
      setStage(data.next_stage || 'explain');

      // reset lastAnswer if not validating anymore
      if (!data.next_stage?.includes('validate')) setLastAnswer(null);
    } catch (err) {
      console.error('Fetch error:', err);
      
      // Handle specific exception message
      if (err.message && err.message.includes('Daily query limit reached')) {
        setShowUpgradePopup(true);
      } else {
        setMessages((prev) => [...prev, { type: 'ai', content: { text: '⚠️ Error fetching response. Please try again.' } }]);
      }
    } finally {
      setIsThinking(false);
    }
  };

  /**
   * Renders query usage display component with progress bar
   * Shows current usage vs daily limit
   */
  const renderQueryUsage = () => {
    if (!subscriptionDetails) return null;

    const { current, limit } = queryUsage;
    const isUnlimited = subscriptionDetails.plan === 'pro' || limit === -1;
    const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
    
    return (
      <div className="bg-gray-100">
        <h4 className="font-bold text-lg mb-2">
          📊 {t('queryUsage')}
        </h4>
        
        {isUnlimited ? (
          <div className="text-center">
            <p className="text-green-600 font-medium">{t('unlimitedQueries')}</p>
            <p className="text-xs text-gray-500">{t('proPlan')}</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">{current}</span>
              <span className="text-xs text-gray-600">{limit}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  percentage >= 90 ? 'bg-red-500' : 
                  percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-center text-gray-600">
              {limit - current} {t('queriesRemaining')}
            </p>
          </>
        )}
      </div>
    );
  };

  /**
   * Renders subscription badge with plan type (Free, Pro, Premium)
   * Shows appropriate styling and icons for each plan type
   */
  const renderSubscriptionBadge = () => {
    if (!subscriptionDetails) return null;

    const plan = subscriptionDetails.tier?.toLowerCase() || 'free';
    
    const planConfig = {
      free: {
        label: 'Free',
        color: 'bg-gray-500',
        icon: '🆓',
        textColor: 'text-white'
      },
      basic: {
        label: 'Basic',
        color: 'bg-blue-600',
        icon: '⚡',
        textColor: 'text-white'
      },
      pro: {
        label: 'Pro',
        color: 'bg-blue-600',
        icon: '⚡',
        textColor: 'text-white'
      },
      premium: {
        label: 'Premium',
        color: 'bg-gradient-to-r from-purple-600 to-gold-500',
        icon: '👑',
        textColor: 'text-white'
      }
    };

    const config = planConfig[plan] || planConfig.free;
    
    return (
      <div className="mb-4">
        <h4 className="font-bold text-lg mb-2">💎 {t('subscription')}</h4>
        <span className="text-base text-gray-700 mb-2">{t(`${plan}Plan`)} {t('plan')}</span>
      </div>
    );
  };

  /**
   * Renders upgrade popup modal when query limit is reached
   * Provides options to upgrade or continue with current plan
   */
  const renderUpgradePopup = () => {
    if (!showUpgradePopup) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-mx-auto m-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('dailyQueryLimit')}
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              {t('queryLimitMessage')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowUpgradePopup(false);
                  navigate('/subscription');
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                {t('upgradePlan')}
              </button>
              
              <button
                onClick={() => setShowUpgradePopup(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                {t('stayCurrentPlan')}
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              {t('queriesResetTomorrow')}
            </p>
          </div>
        </div>
      </div>
    );
  };

const renderAIContent = (content) => (
    <div className="space-y-2 p-4 text-white">
      {content.text && (
        <p className="whitespace-pre-wrap"
           dangerouslySetInnerHTML={{
             __html: content.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-yellow-300 font-semibold">$1</strong>')
           }} />
      )}
      {content.voice_url && (
        <audio controls className="mt-2">
          <source src={content.voice_url} type="audio/mpeg" />
        </audio>
      )}
      {!content.voice_url && content.notes?.voice && (
        <p className="text-xs italic text-yellow-200 mt-1">{content.notes.voice}</p>
      )}
      {content.image_url && (
        <img src={content.image_url} alt="Related visual" className="mt-4 rounded-md shadow" />
      )}
      {!content.image_url && content.notes?.image && (
        <p className="text-xs italic text-yellow-200 mt-1">{content.notes.image}</p>
      )}
      {content.notes?.video && (
        <p className="text-xs italic text-yellow-200 mt-1">{content.notes.video}</p>
      )}
    </div>
  );

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <div className="p-4">{t('checkingSubscription')}</div>;

  /**
   * Handles navigation to subscription plans
   */
  const handlePricingClick = () => {
    navigate('/subscription');
  };

  /**
   * Handles user logout
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/');
  };

  /**
   * Navigates to order history page
   */
  const handleOrderHistory = () => {
    navigate('/order-history');
    setIsUserDropdownOpen(false);
  };

  /**
   * Toggles user dropdown menu
   */
  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  /**
   * Toggles mobile sidebar visibility
   */
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  /**
   * Gets user display name or email
   */
  const getUserDisplayName = () => {
    if (!userProfile) return 'User';
    return userProfile.name || userProfile.email || username || 'User';
  };

  /**
   * Gets user initials for avatar
   */
  const getUserInitials = () => {
    if (!userProfile) return 'U';
    const name = userProfile.name || userProfile.email || username || 'User';
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  /**
   * Handles Hindi keyboard input changes
   * Updates query state with Hindi text input
   * @param {string} input - Hindi text from virtual keyboard
   */
  const handleHindiKeyboardChange = (input) => {
    setQuery(input);
  };

  /**
   * Toggles Hindi keyboard visibility
   * Shows/hides virtual keyboard based on language selection
   */
  const toggleHindiKeyboard = () => {
    setIsHindiKeyboardVisible(!isHindiKeyboardVisible);
  };

  /**
   * Closes Hindi keyboard
   */
  const closeHindiKeyboard = () => {
    setIsHindiKeyboardVisible(false);
  };

  /**
   * Checks if Hindi keyboard should be available
   * Returns true if current language is Hindi
   * @returns {boolean} Whether Hindi keyboard should be shown
   */
  const shouldShowHindiKeyboard = () => {
    return language === 'hi';
  };

  /**
   * Handles speech recognition toggle
   * Starts or stops speech recognition based on current state
   */
  const handleSpeechToggle = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      // If currently listening, stop
      toggleListening();
    } else {
      // If not listening, clear any existing query and start
      resetTranscript();
      toggleListening();
    }
  };

  /**
   * Gets the appropriate microphone icon based on speech state
   * @returns {JSX.Element} Microphone icon component
   */
  const getMicrophoneIcon = () => {
    if (isListening) {
      return (
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      );
    }

    return (
      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
      </svg>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}
      
      {/* Sidebar */}
      <aside 
        ref={sidebarRef}
        className={`
          fixed lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out
          w-64 sm:w-72 lg:w-64 bg-gray-100 border-r overflow-y-auto flex flex-col z-50
          h-full lg:h-auto p-3 sm:p-4
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div>
          <div className="mb-3 sm:mb-4 flex justify-center">
            <img src="assets/edgini-logo.png" alt="EdGini Logo" 
            className="mx-auto h-10 sm:h-12 lg:h-14 my-2 sm:my-4"
            />
          </div>
          <h3 className="font-bold text-base sm:text-lg mb-2">🎓 {t('gradeLevel') || "Grade/Level:"} </h3>
          <p className="text-sm sm:text-base text-gray-700 mb-2">{t(`grades.${userProfile?.gradeLevel}`) || 'N/A'}</p>
          <h3 className="font-bold text-base sm:text-lg mb-2">🎯 {t('goal') || "Goal:"} </h3>
          <p className="text-sm sm:text-base text-gray-700 mb-4">{t(userProfile?.goal) || 'N/A'}</p>
          
          {/* Subscription Badge */}
          {renderSubscriptionBadge()}
          
          {/* Query Usage Display */}
          {/* {renderQueryUsage()} */}
        </div>
        <div className="mt-auto text-center text-xs sm:text-sm text-gray-500 pt-4">
          <p>🌍 {t('educationTagline') || "Education for Everyone, Everywhere"}</p>
          <p>🚀 {t('futureTagline') || "Let's Build Tomorrow, Today"}</p>
        </div>
      </aside>

      <main className="flex-1 lg:ml-0 p-2 sm:p-4 lg:p-6 pt-10 sm:pt-14 lg:pt-16 pb-24 sm:pb-32 lg:pb-28 flex flex-col bg-white relative">
        {/* Header with hamburger menu and user info */}
        <div className="absolute top-1 sm:top-3 lg:top-4 left-2 sm:left-4 lg:left-6 right-2 sm:right-4 lg:right-6 flex items-center justify-between lg:justify-end">
          {/* Hamburger Menu - Mobile Only */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden hamburger-menu p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-sm sm:text-base lg:text-lg text-gray-800 font-semibold hidden sm:block">
              🙏 {t('greeting')}, {username || email || t('learner')}
            </div>
          
            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleUserDropdown}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1"
              >
                {/* User Avatar */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-medium">
                  {getUserInitials()}
                </div>
                
                {/* User Name */}
                <span className="text-xs sm:text-sm font-medium truncate max-w-20 sm:max-w-32 hidden sm:inline">
                  {getUserDisplayName()}
                </span>
              
                {/* Dropdown Arrow */}
                <svg 
                  className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 ${
                    isUserDropdownOpen ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {/* User Info Section */}
                    <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                        {getUserDisplayName()}
                      </p>
                      {userProfile?.email && (
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {userProfile.email}
                        </p>
                      )}
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={handlePricingClick}
                      className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      {t('pricing')}
                    </button>

                    <button
                      onClick={handleOrderHistory}
                      className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {t('orderHistory')}
                    </button>


                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-4 pb-6 sm:pb-8">
          {messages.map((msg, idx) => (
            <div key={idx} className={`p-2 sm:p-3 rounded shadow-md mb-2 ${msg.type === 'user' ? 'bg-blue-100 text-right' : 'bg-[#0a2b75] text-white text-left'}`}>
              {msg.type === 'ai' ? renderAIContent(msg.content) : msg.content}
            </div>
          ))}
          {isThinking && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
              <div className="flex items-center space-x-3">
                {/* Animated thinking dots */}
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>

                {/* EdGini thinking text */}
                <div className="flex-1">
                  <p className="text-sm sm:text-base font-medium text-blue-800">
                    🧠 EdGini is thinking...
                  </p>
                  {/* <p className="text-xs sm:text-sm text-blue-600 mt-1">
                    Finding the perfect answer for you
                  </p> */}
                </div>

                {/* EdGini logo/icon */}
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">E</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Speech Recognition Feedback */}
        {(isListening || speechError) && (
          <div className="fixed bottom-20 sm:bottom-24 lg:bottom-20 left-2 sm:left-4 lg:left-68 right-2 sm:right-4 lg:right-6 z-50">
            {isListening && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-800 text-sm font-medium">
                    🎤 Listening... Speak your question
                  </span>
                </div>
                {transcript && (
                  <div className="mt-2 text-sm text-gray-600 italic">
                    "{transcript}"
                  </div>
                )}
              </div>
            )}
            {speechError && !isListening && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="text-red-800 text-sm font-medium">
                    {speechError}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 shadow-lg p-2 sm:p-4 lg:p-6 z-40">
          <div className="flex items-center gap-1 sm:gap-2 max-w-full">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder={t("askEdgini") || "Ask EdGini anything..."}
              className="w-full p-2 sm:p-3 border rounded shadow font-semibold text-blue-900 placeholder-blue-900 text-sm sm:text-base" 
              required 
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {/* Speech Recognition Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={handleSpeechToggle}
                  className={`p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
                    isListening
                      ? 'text-red-600 hover:text-red-800 bg-red-50'
                      : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                  aria-label={isListening ? "Stop voice input" : "Start voice input"}
                  disabled={!speechSupported}
                >
                  {getMicrophoneIcon()}
                </button>
              )}

              {/* Hindi Keyboard Button */}
              {shouldShowHindiKeyboard() && (
                <button
                  type="button"
                  onClick={toggleHindiKeyboard}
                  className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                  title="Toggle Hindi Keyboard"
                  aria-label="Toggle Hindi keyboard"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs font-bold">हि</span>
                </button>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={isThinking}
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded text-sm sm:text-base min-w-[60px] sm:min-w-[80px] transition-all duration-200 ${
              isThinking
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isThinking ? t("processing") || "Processing..." : t("send") || "Send"}
          </button>
          </div>
        </form>
      </main>
      
      {/* Upgrade Popup Modal */}
      {renderUpgradePopup()}
      
      {/* Hindi Keyboard */}
      {shouldShowHindiKeyboard() && (
        <HindiKeyboard
          input={query}
          onInputChange={handleHindiKeyboardChange}
          isVisible={isHindiKeyboardVisible}
          onClose={closeHindiKeyboard}
        />
      )}
    </div>
    
  );
}

