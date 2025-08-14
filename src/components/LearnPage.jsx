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
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [queryUsage, setQueryUsage] = useState({ current: 0, limit: 0 });
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
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

    // Fetch subscription details to get daily limit
    fetchSubscriptionDetails();
  }, []);

  // Debug queryUsage changes
  useEffect(() => {
    console.log('Query usage state updated:', queryUsage);
  }, [queryUsage]);

  const extractTopicFromQuery = (text) =>
    text.replace(/^(what is|define|explain|tell me about)\s+/i, '').split('?')[0].trim();

  /**
   * Fetches user subscription details from backend API
   * Handles authentication and error cases securely
   */
  const fetchSubscriptionDetails = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        navigate("/auth");
        return null;
      }

      // Call backend subscription_details API with user_id parameter
      const response = await fetch(`http://localhost:8000/subscription_details?user_id=${user.user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Subscription API error: ${response.status}`);
      }

      const data = await response.json();
      setSubscriptionDetails(data);
      setQueryUsage(prev => ({
        current: prev.current, // Keep current usage from curate API
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific "Daily query limit reached" exception
        if (errorData.detail && errorData.detail.includes('Daily query limit reached')) {
          setShowUpgradePopup(true);
          return;
        }
        
        throw new Error(`API Error: ${response.status} ${errorData.detail || response.statusText}`);
      }

      const data = await response.json();
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
      setLoading(false);
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
      <div className="bg-white p-3 rounded-lg shadow-sm border">
        <h4 className="font-semibold text-sm text-gray-700 mb-2">
          📊 Query Usage Today
        </h4>
        
        {isUnlimited ? (
          <div className="text-center">
            <p className="text-green-600 font-medium">Unlimited Queries</p>
            <p className="text-xs text-gray-500">Pro Plan</p>
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
              {limit - current} queries remaining
            </p>
          </>
        )}
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
              Daily Query Limit Reached
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              You've reached your daily query limit. Upgrade your plan to continue learning with Edgini.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowUpgradePopup(false);
                  navigate('/subscription');
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Upgrade Plan
              </button>
              
              <button
                onClick={() => setShowUpgradePopup(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Stay on Current Plan
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              Your queries will reset tomorrow
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
    const checkSubscription = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) {
        navigate("/auth");
        return;
      }

      try {
        // Fetch subscription details from backend API
        const subscriptionData = await fetchSubscriptionDetails();
        
        if (!subscriptionData) {
          // Fallback to local Supabase check if API fails
          const userId = user.user.id;
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
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking subscription:', error);
        navigate("/subscription");
      }
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
          <p className="text-sm text-gray-700 mb-4">{t(userProfile?.goal) || 'N/A'}</p>
          
          {/* Query Usage Display */}
          {renderQueryUsage()}
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
      
      {/* Upgrade Popup Modal */}
      {renderUpgradePopup()}
    </div>
    
  );
}

