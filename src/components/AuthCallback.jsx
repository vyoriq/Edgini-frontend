import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import authenticatedFetch from '../utils/apiClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);


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

  useEffect(() => {
  const checkSessionAndProfile = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate('/auth');
        return;
      }

      const { user } = session;
      const userId = user.id;

      // Store type + email for onboarding fallback
      localStorage.setItem('vyoriqUserType', 'provider');
      localStorage.setItem('vyoriqUserEmail', user.email);

      // 🔍 Check if user exists in user_profiles table
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      

      if (error || !profile) {
        console.log('User profile not found. Redirecting to onboarding...');
        navigate('/onboarding');
      } else {

        const camelCaseProfile = {
          userId: profile.user_id,
          fullName: profile.full_name,
          email: profile.email,
          dob: profile.dob,
          gradeLevel: profile.grade_level,
          subject: profile.subject,
          goal: profile.goal,
          accessType: profile.access_type,
        };

        // Check language restriction before proceeding
        const shouldProceed = await checkLanguageRestriction(camelCaseProfile);
        
        // Optionally store profile in localStorage
        localStorage.setItem('vyoriqUserProfile', JSON.stringify(camelCaseProfile));
        
        if (shouldProceed) {
          navigate('/learn');
        }
        // If restricted, popup will be shown and user can choose to continue
      }

    } catch (err) {
      console.error('AuthCallback error:', err);
      navigate('/auth');
    }
  };

  checkSessionAndProfile();
}, [navigate]);




  return (
    <div>
      <p className="text-center mt-10">🔄 Finishing login... Please wait.</p>
      
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
                Close
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
