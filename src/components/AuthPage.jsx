import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient'; // adjust if needed
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import authenticatedFetch from '../utils/apiClient';

export default function AuthPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);

  useEffect(() => {
    localStorage.setItem('isOnboarded', 'false');
  }, []);

  useEffect(() => {
      const savedLang = localStorage.getItem("vyoriqLanguage") || "en";
      i18n.changeLanguage(savedLang);
    }, [i18n]);

  const handleGoogleLogin = async () => {
    const redirectUrl = `${window.location.origin}/auth/callback`; // resolves to http://localhost:5173 if you're on dev
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('Google Login Error:', error.message);
    }
  };


  const handleFacebookLogin = async () => {
  const redirectUrl = `${window.location.origin}/auth/callback`; // resolves to http://localhost:5173 if you're on dev
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: redirectUrl
    }
  });
  if (error) console.error('Facebook login error:', error);
};


  const handleManualLogin = async () => {
    if (!identifier || !password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      // ✅ Step 1: Sign in the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password: password,
      });

      if (authError) {
        alert('Login failed: ' + authError.message);
        console.error('Auth error:', authError);
        return;
      }

      const user = authData.user;
      if (!user || !user.id) {
        alert('Login failed: User not found.');
        return;
      }

      // ✅ Step 2: Fetch profile from user_profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profileData) {
        alert('Login failed: User profile not found.');
        console.error('Profile error:', profileError);
        return;
      }
      console.log(profileData, " profile fetched --")
      
      // save it to the local storage format
      const camelCaseProfile = {
        userId: profileData.user_id,
        fullName: profileData.full_name,
        email: profileData.email,
        dob: profileData.dob,
        gradeLevel: profileData.grade_level,
        subject: profileData.subject,
        goal: profileData.goal,
        accessType: profileData.access_type,
      };

      // ✅ Step 3: Check subscription and language restriction for free tier users
      const shouldProceed = await checkLanguageRestriction(camelCaseProfile);
      
      if (shouldProceed) {
        // ✅ Step 4: Save profile to localStorage and navigate
        localStorage.setItem('vyoriqUserProfile', JSON.stringify(camelCaseProfile));
        localStorage.setItem('isOnboarded', 'true');
        navigate('/learn');
      } else {
        // Language restriction triggered - popup will be shown, don't navigate
        // User profile will be saved when they close the popup
        localStorage.setItem('vyoriqUserProfile', JSON.stringify(camelCaseProfile));
        localStorage.setItem('isOnboarded', 'true');
      }

    } catch (err) {
      console.error('Unexpected login error:', err);
      alert('Unexpected error occurred during login.');
    }
  };



  /**
   * Checks if free tier users have selected a non-English language and restricts access
   * @param {Object} userProfile - User profile containing userId
   * @returns {boolean} - true if login should proceed, false if restricted
   */
  const checkLanguageRestriction = async (userProfile) => {
    try {
      // Get selected language from localStorage
      const selectedLanguage = localStorage.getItem("vyoriqLanguage") || "en";
      
      // If language is English, allow access
      if (selectedLanguage === "en") {
        return true;
      }
      
      // Fetch user subscription details
      const subscriptionData = await authenticatedFetch(`/subscription_details?user_id=${userProfile.userId}`);
      const userTier = subscriptionData.tier || "free";
      
      // If user is on free tier and selected non-English language, restrict access
      if (userTier === "free") {
        // Reset language to English
        localStorage.setItem("vyoriqLanguage", "en");
        i18n.changeLanguage("en");
        
        // Show popup message
        console.log('Language restriction triggered for free tier user with language:', selectedLanguage);
        setShowLanguagePopup(true);
        
        // Return false to prevent navigation
        return false;
      }
      
    } catch (error) {
      console.error("Error checking language restriction:", error);
      // If API call fails, default to allowing access but reset to English for safety
      localStorage.setItem("vyoriqLanguage", "en");
      i18n.changeLanguage("en");
      return true; // Allow access on error
    }
  };

  const handleManualRegister = () => {
    navigate('/onboarding');
  };

  // ✅ JSX render block should follow this...

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-blue-600 flex">
      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-8 text-white">
        <img src="/assets/edgini-white-text.png" alt="EdGini Logo" className="h-28 mb-10" />

        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold mb-6">Welcome to EdGini</h1>

          <p className="text-xl mb-4 leading-relaxed">
            Your Education Genie who answers all your questions anywhere, anytime.
          </p>

          <p className="text-xl mb-4 leading-relaxed">
            It's your Personalized AI Tutor – tailored to your grade, goals, and language.
          </p>

          <p className="text-xl mb-4 leading-relaxed">
            ✨ Learn smarter, practice better, and achieve more.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
          {/* Logo - always visible */}
          <img src="/assets/edgini-logo.png" alt="EdGini Logo" className="mx-auto h-20 my-4" />
          <h2 className="text-2xl font-bold mb-4">{t('signInHeading') || 'Learn with EdGini'}</h2>

          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-medium py-2 rounded-full w-full transition-all duration-200 shadow-sm mb-2"
            >
            <FcGoogle className="text-xl" />
            {t('continueWithGoogle') || 'Continue with Google'}
          </button>

          {/* <button
            onClick={handleFacebookLogin}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-[#1877F2] font-medium py-2 rounded-full w-full transition-all duration-200 shadow-sm"
            >
            <FaFacebook className="text-xl text-blue-600" />
            {t('continueWithFacebook') || 'Continue with Facebook'}
          </button> */}

      <input
      type="text"
      value={identifier}
      onChange={(e) => setIdentifier(e.target.value)}
      placeholder={t('emailOrMobile') || "Email or mobile"}
      required
      className="w-full border px-3 py-2 rounded text-sm mt-4"
      />

        <input
          type="password"
          placeholder={t('password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border px-3 py-2 rounded text-sm mb-1"
        />
        <button
          onClick={handleManualLogin}
          className="w-full py-2 rounded-full font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 shadow"

        >
          {t('login') || 'Login'}
        </button>

        <p className="text-sm mt-4">
          {t('newUserPrompt') || 'New to EdGini?'}{' '}
          <button onClick={handleManualRegister} className="text-blue-600 underline">
            {t('registerHere') || 'Register here'}
          </button>
        </p>

        

          <p className="text-xs mt-3">🌍{t('educationTagline') || 'Education for Everyone, Everywhere'}</p>
          <p className="text-xs mt-1">🚀 {t('futureTagline') || "Let's Build Tomorrow, Today"}</p>

        </div>
      </div>
      
      {/* Language Restriction Popup */}
      {showLanguagePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Language Restriction</h3>
              <button
                onClick={() => {
                  setShowLanguagePopup(false);
                  navigate('/learn');
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed">
                Sorry! Free tier users can only access the app in English. Please upgrade to Premium to access other languages.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowLanguagePopup(false);
                  navigate('/learn');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Continue Free
              </button>
              <button
                onClick={() => {
                  setShowLanguagePopup(false);
                  navigate("/subscription");
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
