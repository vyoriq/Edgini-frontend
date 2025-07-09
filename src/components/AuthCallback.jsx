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

        // ✅ Bypassing profile check — all users go to Learn
        navigate('/learn');

        // ⛔️ From here onwards is skipped due to descoped profile logic
        /*
        const userId = session.user.id;

        const localProfile = localStorage.getItem('vyoriqUserProfile');
        const isOnboarded = localStorage.getItem('isOnboarded') === 'true';

        if (localProfile && isOnboarded) {
          navigate('/learn');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error || !profile) {
          console.error('Profile fetch error:', error);
          navigate('/onboarding');
          return;
        }

        const hasAllFields =
          profile.grade &&
          profile.learningGoals &&
          profile.subjects &&
          profile.accessType;

        localStorage.setItem('vyoriqUserProfile', JSON.stringify(profile));
        localStorage.setItem('isOnboarded', hasAllFields ? 'true' : 'false');

        if (hasAllFields) {
          navigate('/learn');
        } else {
          navigate('/onboarding');
        }
        */
      } catch (err) {
        console.error('AuthCallback error:', err);
        navigate('/auth');
      }
    };

    checkSessionAndProfile();
  }, [navigate]);

  return <p className="text-center mt-10">🔄 Finishing login... Please wait.</p>;
}
