import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import PlanCard from "./PlanCard";

const plans = [
  {
    name: "Free",
    price: 0,
    limit: "10 queries/day",
    features: ["Basic AI access", "Community support"],
    tierKey: "free",
  },
  {
    name: "Basic",
    price: 299,
    limit: "25 queries/day",
    features: ["AI access", "Email support"],
    tierKey: "basic",
  },
  {
    name: "Premium",
    price: 999,
    limit: "100 queries/day",
    features: ["Priority AI access", "Chat history", "Priority support"],
    tierKey: "premium",
  },
  {
    name: "Pro",
    price: 1999,
    limit: "Unlimited",
    features: ["Priority AI access", "Chat history", "Dedicated", "Explanation + Quiz Support"],
    tierKey: "pro",
  },
];

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const [currentUserTier, setCurrentUserTier] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  /**
   * Fetches current user subscription details from API
   */
  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      
      // Get user profile from localStorage
      const profile = localStorage.getItem('vyoriqUserProfile');
      if (!profile) {
        navigate('/auth');
        return;
      }
      
      const userProfile = JSON.parse(profile);
      const userId = userProfile.userId;

      // Call backend subscription_details API
      const response = await fetch(`http://localhost:8000/subscription_details?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If no subscription found, user is on free tier
        setCurrentUserTier('free');
        setSubscriptionData(null);
        return;
      }

      const data = await response.json();
      setSubscriptionData(data);
      setCurrentUserTier(data.tier || 'free');
      
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      // Fallback to free tier on error
      setCurrentUserTier('free');
      setSubscriptionData(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filters plans based on subscription status
   * Hides free plan if user has an active subscription
   */
  const getVisiblePlans = () => {
    if (!subscriptionData || currentUserTier === 'free') {
      return plans; // Show all plans including free
    }
    
    // If user has active subscription, hide free plan
    return plans.filter(plan => plan.tierKey !== 'free');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  const visiblePlans = getVisiblePlans();
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center mb-4">
          <img 
            src="assets/edgini-logo.png" 
            alt="Edgini" 
            className="h-16 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate('/learn')}
          />
        </div>
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Choose Your Plan
      </h2>
      <div className="flex flex-wrap gap-6 justify-center">
        {visiblePlans.map((plan, idx) => (
          <PlanCard 
            key={idx} 
            plan={plan} 
            isCurrent={currentUserTier === plan.tierKey}
            isDisabled={currentUserTier === plan.tierKey}
          />
        ))}
      </div>
    </div>
  );
}
