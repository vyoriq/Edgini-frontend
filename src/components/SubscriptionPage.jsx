import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authenticatedFetch from '../utils/apiClient';
import PlanCard from "./PlanCard";
import PricingToggle from "./PricingToggle";
import UpcomingPlanCard from "./UpcomingPlanCard";

const plans = [
  {
    nameKey: "freePlan",
    price: 0,
    // limitKey: "10 queries/day", // We'll translate this in the component
    // featureKeys: ["basicAIAccess", "communitySupport"],
    featureKeys: ["guidedSession", "gradeGoalAligned", "clearStructuredAnswers", "profileBasedPersonalization", "dailyLearning", "alwaysAvailable", "englishOnly"],
    tierKey: "free",
  },
  {
    nameKey: "premiumPlan",
    monthlyPrice: 499,
    yearlyPrice: 4999, // 16.5% discount
    originalMonthlyPrice: 999,
    originalYearlyPrice: 5988,
    isLaunchOffer: true,
    // limitKey: "100 queries/day",
    featureKeys: ["unlimitedAccess", "personalizedTutoring", "examPrepPractice", "priorityAccess", "gradeGoalAligned", "clearStructuredAnswers", "profileBasedPersonalization", "alwaysAvailable", "englishHindi"],
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
      console.log('Subscription data:', data); // Debug log to see available fields
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
   * Gets the actual billing period for a user
   * For paid users: determines billing period based on payment_amount
   * For free users: returns the toggle state
   */
  const getActualBillingPeriod = () => {
    // If user has paid subscription, determine billing period from payment amount
    if (subscriptionData && currentUserTier !== 'free' && subscriptionData.payment_amount) {
      // Check if payment amount matches yearly price (4999) or monthly price (499)
      if (subscriptionData.payment_amount === 4999) {
        return 'yearly';
      } else if (subscriptionData.payment_amount === 499) {
        return 'monthly';
      }
      // Fallback: use API billing_period if payment_amount doesn't match expected values
      return subscriptionData.billing_period || 'monthly';
    }
    // For free users, use toggle state
    return billingPeriod;
  };

  /**
   * Determines if toggle should be disabled (frozen)
   * Disabled for users with active paid subscriptions
   */
  const isToggleDisabled = () => {
    return subscriptionData && currentUserTier !== 'free';
  };

  /**
   * Filters plans based on subscription status and adds current pricing
   * Hides free plan if user has an active subscription
   */
  const getVisiblePlans = () => {
    const filteredPlans = !subscriptionData || currentUserTier === 'free'
      ? plans // Show all plans including free
      : plans.filter(plan => plan.tierKey !== 'free'); // Hide free plan if has subscription

    const actualBillingPeriod = getActualBillingPeriod();

    // Add current price based on user's actual subscription data for premium plan
    return filteredPlans.map(plan => {
      if (plan.tierKey === 'premium') {
        // For paid users, use their actual payment_amount from subscription data
        // For free users browsing, use the plan's pricing based on toggle
        const actualPrice = subscriptionData && currentUserTier !== 'free' && subscriptionData.payment_amount
          ? subscriptionData.payment_amount
          : (actualBillingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice);

        // Set the correct original pricing for cross-price section based on payment amount
        let originalMonthlyPrice = plan.originalMonthlyPrice;
        let originalYearlyPrice = plan.originalYearlyPrice;

        // If user paid for subscription, determine original pricing based on payment amount
        if (subscriptionData && currentUserTier !== 'free' && subscriptionData.payment_amount) {
          if (subscriptionData.payment_amount === 4999) {
            // User paid for yearly, show yearly original price
            originalYearlyPrice = plan.originalYearlyPrice;
            originalMonthlyPrice = plan.originalMonthlyPrice; // Keep for reference but won't be used
          } else if (subscriptionData.payment_amount === 499) {
            // User paid for monthly, show monthly original price
            originalMonthlyPrice = plan.originalMonthlyPrice;
            originalYearlyPrice = plan.originalYearlyPrice; // Keep for reference but won't be used
          }
        }

        return {
          ...plan,
          price: actualPrice,
          billingPeriod: actualBillingPeriod,
          originalMonthlyPrice,
          originalYearlyPrice
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 px-3 sm:px-4 lg:px-8">
      {/* Header with Logo and Close Button */}
      <div className="relative flex justify-center mb-4 sm:mb-6">
        <img
          src="assets/edgini-logo.png"
          alt="EdGini"
          className="h-12 sm:h-14 md:h-16 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/learn')}
        />

        {/* Close Button */}
        <button
          onClick={() => navigate('/learn')}
          className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Close and go back to learn page"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 text-gray-800 px-2">
        {t('choosePlan')}
      </h2>
      
      {/* Side-by-side Layout */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch min-h-0">
          
          {/* Available Plans Section */}
          <div className="flex flex-col">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">{t('availablePlans')}</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">{t('currentOfferings')}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-grow">
              {visiblePlans.map((plan, idx) => (
                <div key={idx} className="flex-1 w-full sm:w-auto">
                  <PlanCard
                    plan={plan}
                    isCurrent={currentUserTier === plan.tierKey}
                    isDisabled={currentUserTier === plan.tierKey}
                    billingPeriod={getActualBillingPeriod()}
                    onBillingToggle={plan.tierKey === 'premium' && !isToggleDisabled() ? setBillingPeriod : null}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Plans Section */}
          <div className="flex flex-col">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">{t('upcomingPlans')}</h3>
              <p className="text-sm sm:text-base text-gray-600 px-2">{t('upcomingPlansDescription')}</p>
            </div>
            
            <div className="flex-grow">
              <UpcomingPlanCard subscriptionData={subscriptionData} />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
