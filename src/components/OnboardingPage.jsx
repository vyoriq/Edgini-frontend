import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from 'react-i18next';
import TermsFooter from './TermsFooter';

const gradeSubjectMap = {
  'k12': ['math', 'physics', 'chemistry', 'biology', 'english', 'history', 'geography', 'coding'],
  'undergraduate': ['engineering', 'mbbs', 'bba', 'bcom', 'law', 'arts', 'science'],
  'postgraduate': ['engineering', 'mbbs', 'bba', 'bcom', 'law', 'arts', 'science'],
  'doctoral': ['researchMethods', 'advancedTheory', 'dissertationWriting'],
  'executiveEducation': ['leadership', 'aiMl', 'digitalStrategy', 'hr', 'operations', 'finance'],
  'jobTraining': ['python', 'excel', 'retail', 'spokenEnglish']
};


export default function OnboardingPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [userType, setUserType] = useState('manual');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);


  useEffect(() => {
    const savedLang = localStorage.getItem("vyoriqLanguage") || "en";
    i18n.changeLanguage(savedLang);
  }, [i18n]);
  

  useEffect(() => {
    const type = localStorage.getItem('vyoriqUserType') || 'manual';
    const storedEmail = localStorage.getItem('vyoriqUserEmail') || '';
    setUserType(type);
    setEmail(storedEmail);
  }, []);

  const handleCheckboxChange = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };


  const handleSubmit = async (e) => {
  e.preventDefault();

  if (userType === 'manual' && password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  let user = null;

  try {
    if (userType === 'manual') {
      // ✅ Manual signup
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        alert(signupError.message);
        return;
      }

      user = signupData?.user;
    } else {
      // ✅ Provider signup
      const {
        data: { session },
      } = await supabase.auth.getSession();
      user = session?.user;
    }

    if (!user || !user.id) {
      alert('User fetch failed.');
      return;
    }

    // ✅ Insert profile
    const profilePayload = {
      user_id: user.id,
      full_name: fullName,
      email,
      dob,
      grade_level: selectedGrade,
      subject: selectedSubjects,
    };

    const { data: profileData, error: insertError } = await supabase
      .from('user_profiles')
      .insert([profilePayload])
      .select()
      .single();

    if (insertError) {
      if (userType === 'manual') {
        // Only rollback for manual signup
        await fetch('/api/rollback-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      }

      alert('Profile creation failed. Account rolled back.');
      return;
    }

    // ✅ Create subscription record after successful profile creation
    const startDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const formattedEndDate = endDate.toISOString().split('T')[0];

    const subscriptionPayload = {
      user_id: user.id,
      tier: 'free',
      status: 'active',
      start_date: startDate,
      end_date: formattedEndDate,
      is_active: true,
      payment_provider: null,
      external_ref: null,
      daily_limit: 10
    };

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert([subscriptionPayload]);

    if (subscriptionError) {
      // Rollback profile creation if subscription fails
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      if (userType === 'manual') {
        // Also rollback auth user for manual signup
        await fetch('/api/rollback-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      }

      alert('Subscription creation failed. Account rolled back.');
      return;
    }

    const camelCaseProfile = {
      userId: profileData.user_id,
      fullName: profileData.full_name,
      email: profileData.email,
      dob: profileData.dob,
      gradeLevel: profileData.grade_level,
      subject: profileData.subject,
    };

    localStorage.setItem('vyoriqUserProfile', JSON.stringify(camelCaseProfile));
    navigate('/learn');

  } catch (err) {
    console.error('Unexpected error:', err);
    alert('Unexpected error occurred during registration.');

    if (user?.id) {
      // Cleanup subscription and profile if they were created
      await supabase.from('subscriptions').delete().eq('user_id', user.id);
      await supabase.from('user_profiles').delete().eq('user_id', user.id);

      if (userType === 'manual') {
        await fetch('/api/rollback-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      }
    }
  }
};



  return (
    <div className="min-h-screen bg-[#002366] flex flex-col">
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
        <div className="flex justify-center mb-4">
          <img src="assets/edgini-logo.png" alt="EdGini" className="h-16" />
        </div>
        <h3 className="text-center text-md mb-4">🙏 {t('greeting')} {fullName || email || t('learner')}</h3>

        <form onSubmit={handleSubmit} className="text-left">
            <>
              <label className="block mb-2">📛 {t('name') || "Full Name"}  </label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border p-2 mb-4" required />

              <label className="block mb-2">📧 {t('email') || "Email"}  </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 mb-4"
                readOnly={userType === 'provider'}
                required
              />

              {userType === 'manual' && (
                <>
                  <label className="block mb-2">🔒 {t('password') || 'Password'}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border p-2 mb-4"
                    required
                  />

                  <label className="block mb-2"> 🔒 {t('confirmPassword') || 'Confirm Password'}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border p-2 mb-4"
                    required
                  />
                </>
              )}
            </>

          <label className="block mb-2">🎂 {t('dob') || "Date of Birth"}  </label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full border p-2 mb-4" required />

          <label className="block mb-2">🎓 {t('gradeLevel') || "Grade Level"} </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full border p-2 mb-4"
              required
            >
              <option value="">{t('selectGrade') || "Select Grade"}</option>
              {Object.keys(gradeSubjectMap).map((gradeKey) => (
                <option key={gradeKey} value={gradeKey}>
                  {t(`grades.${gradeKey}`) || gradeKey}
                </option>
              ))}
            </select>

          <label className="block mb-2">📚 {t('subjects') || "Subjects"} </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {(gradeSubjectMap[selectedGrade] || []).map((subjectKey) => (
                <label key={subjectKey} className="inline-flex items-center">
                  <input
                    type="checkbox"
                    value={subjectKey}
                    checked={selectedSubjects.includes(subjectKey)}
                    onChange={() => handleCheckboxChange(subjectKey)}
                    className="mr-1"
                  />
                  {t(`subjectNames.${subjectKey}`)}
                </label>
              ))}
            </div>


          <button type="submit" 
            className="w-full py-2 rounded-full font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 shadow"

          >
            {t('continue') || 'Continue'}
          </button>
        </form>

        <div className="bg-white bg-opacity-10 px-6 py-4 rounded-lg text-center mt-4">
          <p className="text-xs mt-3">🌍 {t('educationTagline') || "Education for Everyone, Everywhere"}</p>
          <p className="text-xs mt-1">🚀 {t('futureTagline') || "Let's Build Tomorrow, Today"}</p>
        </div>
        </div>
      </div>

      <TermsFooter />
    </div>
  );
}
