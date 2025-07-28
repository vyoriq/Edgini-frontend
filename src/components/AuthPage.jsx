import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient'; // adjust if needed
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

export default function AuthPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

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

      // ✅ Step 3: Save profile to localStorage and navigate
      localStorage.setItem('vyoriqUserProfile', JSON.stringify(camelCaseProfile));
      localStorage.setItem('isOnboarded', 'true');
      navigate('/learn');

    } catch (err) {
      console.error('Unexpected login error:', err);
      alert('Unexpected error occurred during login.');
    }
  };


  const handleManualRegister = () => {
    navigate('/onboarding');
  };

  // ✅ JSX render block should follow this...

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">

        <img src="/assets/edgini-logo.png" alt="Edgini Logo" className="mx-auto h-20 my-4" />
        <h2 className="text-2xl font-bold mb-4">{t('signInHeading') || 'Learn with Edgini'}</h2>

          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-medium py-2 rounded-full w-full transition-all duration-200 shadow-sm mb-2"
            >
            <FcGoogle className="text-xl" />
            {t('continueWithGoogle') || 'Continue with Google'}
          </button>

          <button
            onClick={handleFacebookLogin}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-[#1877F2] font-medium py-2 rounded-full w-full transition-all duration-200 shadow-sm"
            >
            <FaFacebook className="text-xl text-blue-600" />
            {t('continueWithFacebook') || 'Continue with Facebook'}
          </button>

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
          {t('newUserPrompt') || 'New to Edgini?'}{' '}
          <button onClick={handleManualRegister} className="text-blue-600 underline">
            {t('registerHere') || 'Register here'}
          </button>
        </p>

        

<p className="text-xs mt-3">🌍{t('educationTagline') || 'Education for Everyone, Everywhere'}</p>
<p className="text-xs mt-1">🚀 {t('futureTagline') || "Let's Build Tomorrow, Today"}</p>

      </div>
    </div>
  );
}
