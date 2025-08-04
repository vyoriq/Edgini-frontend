import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function LearnPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]); // 🔁 for GPT context
  const [stage, setStage] = useState('explain');       // 👣 AI flow stage
  const [lastAnswer, setLastAnswer] = useState(null);  // 🧠 last user answer
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();


  useEffect(() => {
    const profile = localStorage.getItem('vyoriqUserProfile');
    if (profile) {
      const parsed = JSON.parse(profile);
      setUserProfile(parsed);
      setUsername(parsed.name || parsed.fullName || parsed.user_metadata?.name || '');
    }
    const savedLang = localStorage.getItem('vyoriqLanguage') || 'en';
    setLanguage(savedLang);
  }, []);

  const extractTopicFromQuery = (text) =>
    text.replace(/^(what is|define|explain|tell me about)\s+/i, '').split('?')[0].trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, { type: 'user', content: query }]);
    setChatHistory((prev) => [...prev, userMsg]);
    setQuery('');
    // setLoading(true);


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
      const response = await fetch('http://localhost:8000/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const aiReply = data.content.text;

      setMessages((prev) => [...prev, { type: 'ai', content: data.content }]);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: aiReply }]);
      setStage(data.next_stage || 'explain');

      // reset lastAnswer if not validating anymore
      if (!data.next_stage?.includes('validate')) setLastAnswer(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setMessages((prev) => [...prev, { type: 'ai', content: { text: '⚠️ Error fetching response' } }]);
    } finally {
      setLoading(false);
    }
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
    const checkSubscription = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        navigate("/auth");
        return;
      }

      const userId = user.user.id;

      // Fetch subscription
      const { data: subscription, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single();

      if (error || !subscription) {
        navigate("/subscription");
        return;
      }

      // Optional: Check daily limit
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("daily_query_count, last_query_date")
        .eq("user_id", userId)
        .single();

       console.log(profile?.daily_query_count)
       console.log(profile.last_query_date)

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      if (profile?.last_query_date !== today) {
        // reset logic in backend or here if needed
      } else {
        const limits = {
          free: 3,
          basic: 10,
          premium: 100,
        };

        const limit = limits[subscription.plan || "free"];
        if (profile?.daily_query_count >= limit) {
          navigate("/subscription");
          return;
        }
      }

      setLoading(false); // Allow page to load
    };

    checkSubscription();
  }, [navigate]);

  if (loading) return <div className="p-4">Checking your subscription...</div>;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r overflow-y-auto flex flex-col">
        <div>
          <div className="mb-4 flex justify-center">
            <img src="assets/edgini-logo.png" alt="Edgini Logo" 
            // className="h-10 w-auto" 
            className="mx-auto h-14 my-4"
            />
          </div>
          <h3 className="font-bold text-lg mb-2">🎓 {t('gradeLevel') || "Grade/Level:"} </h3>
          <p className="text-sm text-gray-700 mb-2">{t(`grades.${userProfile?.gradeLevel}`) || 'N/A'}</p>
          <h3 className="font-bold text-lg mb-2">🎯 {t('goal') || "Goal:"} </h3>
          <p className="text-sm text-gray-700 mb-2">{t(userProfile?.goal) || 'N/A'}</p>
        </div>
        <div className="mt-auto text-center text-xs text-gray-500 pt-4">
          <p>🌍 {t('educationTagline') || "Education for Everyone, Everywhere"}</p>
          <p>🚀 {t('futureTagline') || "Let's Build Tomorrow, Today"}</p>
        </div>
      </aside>

      <main className="flex-1 p-6 pt-16 flex flex-col bg-white relative">
        <div className="absolute top-4 right-6 text-lg text-gray-800 font-semibold">
          🙏 {t('greeting')}, {username || email || t('learner')}
          <button onClick={async () => {
            await supabase.auth.signOut();
            localStorage.clear();
            window.location.href = '/auth';
          }}
            className="ml-4 text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
            {t('logout') || "Logout"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`p-3 rounded shadow-md mb-2 ${msg.type === 'user' ? 'bg-blue-100 text-right' : 'bg-[#0a2b75] text-white text-left'}`}>
              {msg.type === 'ai' ? renderAIContent(msg.content) : msg.content}
            </div>
          ))}
          {loading && <div className="text-sm text-gray-500">🧠 {t("edginiThinking")}</div>}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("askEdgini") || "Ask Edgini anything..."}
            className="flex-1 p-2 border rounded shadow font-semibold text-blue-900 placeholder-blue-900" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{t("send") || "Send"}</button>
        </form>
      </main>
    </div>
    
  );
}

