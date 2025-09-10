import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authenticatedFetch from '../utils/apiClient';
import PlanCard from "./PlanCard";
import PricingToggle from "./PricingToggle";

const plans = [
  {
    nameKey: "freePlan",
    price: 0,
    // limitKey: "10 queries/day", // We'll translate this in the component
    // featureKeys: ["basicAIAccess", "communitySupport"],
    featureKeys: ["Guided Session", "Grade & Goal Aligned", "Clear & Structured Answers", "Profile-Based Personalization", "Daily Learning", "Always Available", "English Only"],
    tierKey: "free",
  },
  {
    nameKey: "premiumPlan",
    monthlyPrice: 499,
    yearlyPrice: 4999, // 16.5% discount
    // limitKey: "100 queries/day",
    featureKeys: ["Unlimited Access", "Personalized Tutoring", "Exam Prep & Practice", "Priority Access", "Grade & Goal Aligned", "Clear & Structured Answers", "Profile-Based Personalization", "Always Available", "English & Hindi"],
    tierKey: "premium",
  },
  // {
  //   nameKey: "basicPlan",
  //   price: 299,
  //   limitKey: "25 queries/day",
  //   featureKeys: ["aiAccess", "emailSupport"],
  //   tierKey: "basic",
  // },
  // {
  //   nameKey: "premiumPlan",
  //   price: 999,
  //   limitKey: "100 queries/day",
  //   featureKeys: ["priorityAIAccess", "chatHistory", "prioritySupport"],
  //   tierKey: "premium",
  // },
  // {
  //   nameKey: "proPlan",
  //   price: 1999,
  //   limitKey: "unlimited",
  //   featureKeys: ["priorityAIAccess", "chatHistory", "dedicated", "explanationQuizSupport"],
  //   tierKey: "pro",
  // },
];

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [currentUserTier, setCurrentUserTier] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  useEffect(() => {
    fetchSubscriptionDetails();
    // Set language from localStorage
    const savedLang = localStorage.getItem("vyoriqLanguage") || "en";
    i18n.changeLanguage(savedLang);
  }, [i18n]);

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
      const data = await authenticatedFetch(`/subscription_details?user_id=${userId}`);
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
   * Filters plans based on subscription status and adds current pricing
   * Hides free plan if user has an active subscription
   */
  const getVisiblePlans = () => {
    const filteredPlans = !subscriptionData || currentUserTier === 'free' 
      ? plans // Show all plans including free
      : plans.filter(plan => plan.tierKey !== 'free'); // Hide free plan if has subscription
    
    // Add current price based on billing period for premium plan
    return filteredPlans.map(plan => {
      if (plan.tierKey === 'premium') {
        return {
          ...plan,
          price: billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice,
          billingPeriod
        };
      }
      return { ...plan, price: plan.price || 0 }; // Keep existing price for free plan
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingSubscription')}</p>
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
            alt="EdGini" 
            className="h-16 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate('/learn')}
          />
        </div>
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        {t('choosePlan')}
      </h2>
      
      <div className="flex flex-wrap gap-6 justify-center">
        {visiblePlans.map((plan, idx) => (
          <PlanCard 
            key={idx} 
            plan={plan} 
            isCurrent={currentUserTier === plan.tierKey}
            isDisabled={currentUserTier === plan.tierKey}
            billingPeriod={billingPeriod}
            onBillingToggle={plan.tierKey === 'premium' ? setBillingPeriod : null}
          />
        ))}
      </div>
    </div>
  );
}
