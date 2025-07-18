import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function LearnPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]); // 🔁 for GPT context
  const [stage, setStage] = useState('explain');       // 👣 AI flow stage
  const [lastAnswer, setLastAnswer] = useState(null);  // 🧠 last user answer
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [username, setUsername] = useState('');

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

  const translations = {
    en: {
      placeholder: "Ask Vyoriq anything...",
      send: "Send",
      goalsTitle: "🎯 Goals",
      subjectsTitle: "📚 Subjects",
      thinking: "🧠 Vyoriq is thinking..."
    }
  };
  const t = translations[language] || translations.en;

  const extractTopicFromQuery = (text) =>
    text.replace(/^(what is|define|explain|tell me about)\s+/i, '').split('?')[0].trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: 'user', content: query };
    setMessages((prev) => [...prev, { type: 'user', content: query }]);
    setChatHistory((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);


    let body = {
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

    console.log("📦 Sending to backend:", JSON.stringify(body, null, 2));


    try {
      const response = await fetch('/curate', {
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

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r overflow-y-auto flex flex-col h-screen">
        <div>
          <div className="mb-4 flex justify-center">
            <img src="assets/vyoriq-logo.png" alt="Vyoriq Logo" className="h-10 w-auto" />
          </div>
          <h3 className="font-bold text-lg mb-2">🎓 Grade/Level:</h3>
          <p className="text-sm text-gray-700 mb-2">{userProfile?.gradeLevel || 'N/A'}</p>
          <h3 className="font-bold text-lg mb-2">🎯 Goal:</h3>
          <p className="text-sm text-gray-700 mb-2">{userProfile?.goal || 'N/A'}</p>
        </div>
        <div className="mt-auto text-center text-xs text-gray-500 pt-4">
          <p>🌍 Education for Everyone, Everywhere</p>
          <p>🚀 Let's Build Tomorrow, Today</p>
        </div>
      </aside>

      <main className="flex-1 p-6 pt-16 flex flex-col bg-white relative">
        <div className="absolute top-4 right-6 text-lg text-gray-800 font-semibold">
          {username && `👋 Hi, ${username}`}
          <button onClick={async () => {
            await supabase.auth.signOut();
            localStorage.clear();
            window.location.href = '/auth';
          }}
            className="ml-4 text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
            Logout
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`p-3 rounded shadow-md mb-2 ${msg.type === 'user' ? 'bg-blue-100 text-right' : 'bg-[#0a2b75] text-white text-left'}`}>
              {msg.type === 'ai' ? renderAIContent(msg.content) : msg.content}
            </div>
          ))}
          {loading && <div className="text-sm text-gray-500">{t.thinking}</div>}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.placeholder}
            className="flex-1 p-2 border rounded shadow font-semibold text-blue-900 placeholder-blue-900" required />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{t.send}</button>
        </form>
      </main>
    </div>
  );
}

