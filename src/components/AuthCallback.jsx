import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();

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

        // Optionally store profile in localStorage
        localStorage.setItem('vyoriqUserProfile', JSON.stringify(camelCaseProfile));
        
        navigate('/learn');
      }

    } catch (err) {
      console.error('AuthCallback error:', err);
      navigate('/auth');
    }
  };

  checkSessionAndProfile();
}, [navigate]);



  return <p className="text-center mt-10">🔄 Finishing login... Please wait.</p>;
}
