
// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';


// const gradeSubjectMap = {
//   'K-12': ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Coding'],
//   'Undergraduate': ['Engineering', 'MBBS', 'BBA', 'BCom', 'Law', 'Arts', 'Science'],
//   'Postgraduate': ['Engineering', 'MBBS', 'BBA', 'BCom', 'Law', 'Arts', 'Science'],
//   'Doctoral': ['Research Methods', 'Advanced Theory', 'Dissertation Writing'],
//   'Executive Education': ['Leadership', 'AI/ML', 'Digital Strategy', 'HR', 'Operations', 'Finance'],
//   'Job Training': ['Python', 'Excel', 'Retail', 'Spoken English'],
// };

// const learningGoals = [
//   'Grade Advancement',
//   'Subject Mastery',
//   'Academic Certifications',
//   'Test/Exam Preparation',
//   'Course Completion',
//   'Skill Development',
//   'Career Advancement',
//   'Professional Certification',
//   'Job Readiness',
//   'Industry Knowledge',
// ];

// const accessTypes = ['Personal', 'Shared', 'School'];

// export default function OnboardingPage() {
//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const [userType, setUserType] = useState('manual');
//   const [dob, setDob] = useState('');
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [selectedGrade, setSelectedGrade] = useState('');
//   const [selectedSubjects, setSelectedSubjects] = useState([]);
//   const [selectedGoal, setSelectedGoal] = useState('');
//   const [accessType, setAccessType] = useState('');

//   useEffect(() => {
//     const type = localStorage.getItem('vyoriqUserType') || 'manual';
//     setUserType(type);
//   }, []);

//   const handleCheckboxChange = (subject) => {
//     setSelectedSubjects((prev) =>
//       prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
//     );
//   };

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   if (userType === 'manual') {
//     let users = JSON.parse(localStorage.getItem("vyoriqManualUser")) || [];

// if (users.some((u) => u.email === email)) {
//   alert("User already registered. Please log in.");
//   return;
// }

// const newUser = {
//   fullName,
//   email,
//   password,
//   dob,
//   gradeLevel: selectedGrade,
//   goal: selectedGoal,
//   subject: selectedSubjects,
//   accessType,
//   userType
// };

// users.push(newUser);
// const existingUsers = JSON.parse(localStorage.getItem("vyoriqManualUser")) || [];
// const updatedUsers = [...existingUsers, newUser];
// localStorage.setItem("vyoriqManualUser", JSON.stringify(updatedUsers));

//   }

//   const profile = {
//     fullName,
//     email,
//     dob,
//     gradeLevel: selectedGrade,
//     goal: selectedGoal,
//     subject: selectedSubjects,
//     accessType,
//     userType,
//   };
//   localStorage.setItem('vyoriqUserProfile', JSON.stringify(profile));
//   localStorage.setItem('isOnboarded', 'true');
//   navigate('/learn');
// };



//   return (
//     <div className="min-h-screen bg-[#002366] flex items-center justify-center">
//       <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
//         <div className="flex justify-center mb-4">
//           <img src="/assets/vyoriq-logo.png" alt="Vyoriq" className="h-16" />
//         </div>
//         <h3 className="text-center text-md mb-4">🙏 Hi {fullName || email || 'Learner'}</h3>

//         <form onSubmit={handleSubmit} className="text-left">
//           {userType === 'manual' && (
//             <>
//               <label className="block mb-2">📛 Full Name</label>
//               <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border p-2 mb-4" required />

//               <label className="block mb-2">📧 Email / Mobile</label>
//               <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 mb-4" required />

//               <label className="block mb-2">🔒 Password</label>
//               <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 mb-4" required />

//               <label className="block mb-2">🔒 Confirm Password</label>
//               <input type="password" className="w-full border p-2 mb-4" required />
//             </>
//           )}

//           <label className="block mb-2">🎂 Date of Birth</label>
//           <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full border p-2 mb-4" required />

//           <label className="block mb-2">🎓 Grade Level</label>
//           <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full border p-2 mb-4" required>
//             <option value="">Select Grade</option>
//             {Object.keys(gradeSubjectMap).map((grade) => (
//               <option key={grade} value={grade}>{grade}</option>
//             ))}
//           </select>

//           <label className="block mb-2">📚 Subjects</label>
//           <div className="flex flex-wrap gap-2 mb-4">
//             {(gradeSubjectMap[selectedGrade] || []).map((subj) => (
//               <label key={subj} className="inline-flex items-center">
//                 <input type="checkbox" value={subj} checked={selectedSubjects.includes(subj)} onChange={() => handleCheckboxChange(subj)} className="mr-1" /> {subj}
//               </label>
//             ))}
//           </div>

//           <label className="block mb-2">🎯 Learning Goals</label>
//           <div className="flex flex-wrap gap-2 mb-4">
//             {learningGoals.map((goal) => (
//               <label key={goal} className="inline-flex items-center">
//                 <input type="radio" name="goal" value={goal} checked={selectedGoal === goal} onChange={(e) => setSelectedGoal(e.target.value)} className="mr-1" /> {goal}
//               </label>
//             ))}
//           </div>

//           <label className="block mb-2">📱 Access Type</label>
//           <select value={accessType} onChange={(e) => setAccessType(e.target.value)} className="w-full border p-2 mb-4" required>
//             <option value="">Select Access Type</option>
//             {accessTypes.map((type) => (
//               <option key={type} value={type}>{type}</option>
//             ))}
//           </select>

//           <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Continue</button>
//         </form>

// <div className="bg-white bg-opacity-10 px-6 py-4 rounded-lg text-center">
//   <p className="text-xs mt-3">🌍 Education for Everyone, Everywhere</p>
//   <p className="text-xs mt-1">🚀 Let's Build Tomorrow, Today</p>
// </div>

//       </div>
//     </div>
//   );
// }



// -------------------------------------- new code ----------------------------------


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useTranslation } from 'react-i18next';

const gradeSubjectMap = {
  'K-12': ['Math', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Coding'],
  'Undergraduate': ['Engineering', 'MBBS', 'BBA', 'BCom', 'Law', 'Arts', 'Science'],
  'Postgraduate': ['Engineering', 'MBBS', 'BBA', 'BCom', 'Law', 'Arts', 'Science'],
  'Doctoral': ['Research Methods', 'Advanced Theory', 'Dissertation Writing'],
  'Executive Education': ['Leadership', 'AI/ML', 'Digital Strategy', 'HR', 'Operations', 'Finance'],
  'Job Training': ['Python', 'Excel', 'Retail', 'Spoken English'],
};

const learningGoals = [
  'Grade Advancement', 'Subject Mastery', 'Academic Certifications', 'Test/Exam Preparation',
  'Course Completion', 'Skill Development', 'Career Advancement', 'Professional Certification',
  'Job Readiness', 'Industry Knowledge',
];

const accessTypes = ['Personal', 'Shared', 'School'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [userType, setUserType] = useState('manual');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [accessType, setAccessType] = useState('');

  useEffect(() => {
    const type = localStorage.getItem('vyoriqUserType') || 'manual';
    setUserType(type);
  }, []);

  const handleCheckboxChange = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (password !== confirmPassword) {
  //     alert('Passwords do not match!');
  //     return;
  //   }

  //   try {
  //     // ✅ Step 1: Sign up user via Supabase Auth
  //     const { data: signupData, error: signupError } = await supabase.auth.signUp({
  //       email,
  //       password,
  //     });

  //     if (signupError) {
  //       alert(signupError.message);
  //       console.error('Signup error:', signupError);
  //       return;
  //     }

  //     const user = signupData?.user;
  //     if (!user || !user.id) {
  //       alert('User signup failed.');
  //       return;
  //     }

  //     // ✅ Step 2: Prepare profile payload with matching field names
  //     const profilePayload = {
  //       user_id: user.id,
  //       full_name: fullName,
  //       email: email,
  //       dob: dob,
  //       grade_level: selectedGrade,
  //       subject: selectedSubjects,
  //       goal: selectedGoal,
  //       access_type : accessType,
  //     };
  //     console.log(profilePayload, " profile payload --")

  //     // ✅ Step 3: Insert into 'profiles' table
  //     const { error: insertError } = await supabase
  //       .from('user_profiles')
  //       .insert([profilePayload]);

  //     if (insertError) {
  //       alert(insertError.message);
  //       console.error('Insert error:', insertError);
  //       return;
  //     }

  //     const camelCaseProfile = {
  //       userId: profileData.user_id,
  //       fullName: profileData.full_name,
  //       email: profileData.email,
  //       dob: profileData.dob,
  //       gradeLevel: profileData.grade_level,
  //       subject: profileData.subject,
  //       goal: profileData.goal,
  //       accessType: profileData.access_type,
  //     };

  //     // ✅ Step 4: Save to localStorage and navigate to Learn page
  //     localStorage.setItem('vyoriqUserProfile', JSON.stringify(camelCaseProfile));
  //     navigate('/learn');

  //   } catch (err) {
  //     console.error('Unexpected error:', err);
  //     alert('Unexpected error occurred during registration.');
  //   }
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    let user = null;

    try {
      // ✅ Step 1: Sign up user
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        alert(signupError.message);
        console.error('Signup error:', signupError);
        return;
      }

      user = signupData?.user;
      if (!user || !user.id) {
        alert('User signup failed.');
        return;
      }

      // ✅ Step 2: Insert profile
      const profilePayload = {
        user_id: user.id,
        full_name: fullName,
        email,
        dob,
        grade_level: selectedGrade,
        subject: selectedSubjects,
        goal: selectedGoal,
        access_type: accessType,
      };

      const { data: profileData, error: insertError } = await supabase
        .from('user_profiles')
        .insert([profilePayload])
        .select()
        .single();

      if (insertError) {
        // ⚠️ Rollback: delete user (via backend service role)
        await fetch('/api/rollback-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });

        alert('Profile creation failed. Account rolled back.');
        return;
      }

      // ✅ Step 3: Save to localStorage in camelCase
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

      try {
        localStorage.setItem('vyoriqUserProfile', JSON.stringify(camelCaseProfile));
        navigate('/learn');
      } catch (storageErr) {
        alert("User was registered successfully, but local storage failed.");
        console.error("LocalStorage Error:", storageErr);
        navigate('/auth');
        // optionally navigate to a fallback page
      }

    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Unexpected error occurred during registration.');
      if (user?.id) {
        // Cleanup if user was created but something failed after
        await fetch('/api/rollback-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });
      }
    }
  };




  return (
    <div className="min-h-screen bg-[#002366] flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
        <div className="flex justify-center mb-4">
          <img src="/assets/vyoriq-logo.png" alt="Vyoriq" className="h-16" />
        </div>
        <h3 className="text-center text-md mb-4">🙏 Hi {fullName || email || 'Learner'}</h3>

        <form onSubmit={handleSubmit} className="text-left">
          {userType === 'manual' && (
            <>
              <label className="block mb-2">📛 Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border p-2 mb-4" required />

              <label className="block mb-2">📧 Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 mb-4" required />

              <label className="block mb-2">🔒 Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 mb-4" required />

              <label className="block mb-2">🔒 Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border p-2 mb-4" required />
            </>
          )}

          <label className="block mb-2">🎂 Date of Birth</label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full border p-2 mb-4" required />

          <label className="block mb-2">🎓 Grade Level</label>
          <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} className="w-full border p-2 mb-4" required>
            <option value="">Select Grade</option>
            {Object.keys(gradeSubjectMap).map((grade) => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>

          <label className="block mb-2">📚 Subjects</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {(gradeSubjectMap[selectedGrade] || []).map((subj) => (
              <label key={subj} className="inline-flex items-center">
                <input type="checkbox" value={subj} checked={selectedSubjects.includes(subj)} onChange={() => handleCheckboxChange(subj)} className="mr-1" /> {subj}
              </label>
            ))}
          </div>

          <label className="block mb-2">🎯 Learning Goals</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {learningGoals.map((goal) => (
              <label key={goal} className="inline-flex items-center">
                <input type="radio" name="goal" value={goal} checked={selectedGoal === goal} onChange={(e) => setSelectedGoal(e.target.value)} className="mr-1" /> {goal}
              </label>
            ))}
          </div>

          <label className="block mb-2">📱 Access Type</label>
          <select value={accessType} onChange={(e) => setAccessType(e.target.value)} className="w-full border p-2 mb-4" required>
            <option value="">Select Access Type</option>
            {accessTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            {t('continue') || 'Continue'}
          </button>
        </form>

        <div className="bg-white bg-opacity-10 px-6 py-4 rounded-lg text-center mt-4">
          <p className="text-xs mt-3">🌍 Education for Everyone, Everywhere</p>
          <p className="text-xs mt-1">🚀 Let's Build Tomorrow, Today</p>
        </div>
      </div>
    </div>
  );
}
