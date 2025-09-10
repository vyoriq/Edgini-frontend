import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authenticatedFetch from '../utils/apiClient';
import { 
  createRazorpayOrder, 
  initializeRazorpayPayment, 
  verifyPaymentAndCreateSubscription,
  validateUserInfo,
  generateExternalRef
} from '../services/razorpay';
import PricingToggle from './PricingToggle';

export default function PlanCard({ plan, isCurrent, isDisabled = false, billingPeriod, onBillingToggle }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  /**
   * Handles payment flow with Razorpay integration
   * Creates order, processes payment, and creates subscription
   */
  const handleSubscribe = async () => {
    if (isCurrent || isSubscribing || isDisabled) return;

    // Skip payment for free plan
    if (plan.tierKey === 'free' || plan.price === 0) {
      await handleFreeSubscription();
      return;
    }

    try {
      setIsSubscribing(true);
      setPaymentStatus('Preparing payment...');
      
      // Get and validate user profile
      const profile = localStorage.getItem('vyoriqUserProfile');
      if (!profile) {
        alert(t('pleaseLoginFirst'));
        return;
      }
      
      const userProfile = JSON.parse(profile);
      if (!validateUserInfo(userProfile)) {
        alert(t('invalidUserInfo'));
        return;
      }

      const userId = userProfile.userId;

      // Create Razorpay order
      setPaymentStatus(t('processing'));
      const orderData = {
        tier: plan.tierKey,
        amount: plan.price,
        currency: 'INR',
        user_id: userId,
        billing_period: plan.billingPeriod || 'monthly'
      };

      const orderDetails = await createRazorpayOrder(orderData);
      console.log("plan" , plan)
      // Initialize payment
      setPaymentStatus(t('processing'));
      initializeRazorpayPayment(
        {
          ...orderDetails,
          plan_name: plan.name
        },
        {
          name: userProfile.name || userProfile.email || 'User',
          email: userProfile.email || '',
          phone: userProfile.phone || ''
        },
        (paymentResponse) => handlePaymentSuccess(paymentResponse, userProfile),
        (error) => handlePaymentFailure(error)
      );

    } catch (error) {
      console.error('Error initiating payment:', error);
      setPaymentStatus('');
      alert(`Payment initiation failed: ${error.message}`);
    } finally {
      // Keep isSubscribing true until payment completes
    }
  };

  /**
   * Handles free subscription without payment
   */
  const handleFreeSubscription = async () => {
    try {
      setIsSubscribing(true);
      setPaymentStatus('Creating free subscription...');
      
      const profile = localStorage.getItem('vyoriqUserProfile');
      const userProfile = JSON.parse(profile);
      const userId = userProfile.userId;

      const subscriptionData = {
        user_id: userId,
        tier: plan.tierKey,
        status: "active",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daily_limit: 10,
        payment_provider: "free",
        external_ref: generateExternalRef(userId, plan.tierKey)
      };

      const result = await authenticatedFetch('/create_subscription', {
        method: 'POST',
        body: JSON.stringify(subscriptionData)
      });

      const orderId = result.id || result.order_id || 'free_subscription';
      navigate(`/order-details/${orderId}`);

    } catch (error) {
      console.error('Error creating free subscription:', error);
      alert(`Failed to create subscription: ${error.message}`);
    } finally {
      setIsSubscribing(false);
      setPaymentStatus('');
    }
  };

  /**
   * Handles successful payment verification and subscription creation
   */
  const handlePaymentSuccess = async (paymentResponse, userProfile) => {
    try {
      setPaymentStatus('Verifying payment...');
      
      // Payment verification and subscription creation is now handled by backend
      // No need to pass subscription data separately as backend creates subscription automatically

      // Verify payment and create subscription
      const result = await verifyPaymentAndCreateSubscription(paymentResponse, userProfile.userId);
      
      setPaymentStatus(t('subscriptionCreated'));
      
      // Extract order ID from payment response or result
      const orderId = paymentResponse.order_id || result.order_id || 'unknown';
      
      // Redirect to order details page
      setTimeout(() => {
        navigate(`/order-details/${orderId}`);
      }, 1000);

    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatus('');
      alert(`Payment verification failed: ${error.message}`);
    } finally {
      setIsSubscribing(false);
    }
  };

  /**
   * Handles payment failure scenarios
   */
  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    setPaymentStatus('');
    setIsSubscribing(false);
    
    if (error !== 'Payment cancelled by user') {
      // For payment failures, we might not have an order ID
      // You can either show alert or redirect to a generic failure page
      alert(`Payment failed: ${error}`);
    }
  };
  return (
  <div
    className={`w-full rounded-2xl shadow-md p-4 border ${
      isCurrent ? "border-blue-600" : "border-gray-200"
    } bg-white flex flex-col justify-between h-full`}
  >
    <div>
      {/* Title and Toggle Row for Premium Plan */}
      {plan.tierKey === 'premium' && onBillingToggle ? (
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">{t(plan.nameKey)}</h3>
          <div className="ml-4">
            <PricingToggle 
              billingPeriod={billingPeriod} 
              onToggle={onBillingToggle} 
            />
          </div>
        </div>
      ) : (
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-2">{t(plan.nameKey)}</h3>
      )}
      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-700 mt-2">
        ₹{plan.price}
        <span className="text-xs sm:text-sm text-gray-500 font-normal"> 
          /{plan.billingPeriod === 'yearly' ? t('year') : t('month')}
        </span>
      </p>
      
      {/* Show monthly equivalent for yearly billing */}
      {plan.billingPeriod === 'yearly' && plan.price > 0 && (
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          ₹{Math.round(plan.price / 12)}/{t('month')} {t('billedYearly')}
        </p>
      )}
      <p className="mt-2 text-xs sm:text-sm text-gray-600">
        {plan.limitKey === 'unlimited' ? t('unlimited') : plan.limitKey}
      </p>

      <ul className="mt-2 space-y-1 text-xs sm:text-sm text-gray-700 flex-grow">
        {plan.featureKeys.map((featureKey, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-500 font-bold text-xs sm:text-sm">✓</span> 
            <span className="leading-tight">{t(featureKey)}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="mt-4">
      {paymentStatus && (
        <div className="mb-2 text-xs sm:text-sm text-blue-600 text-center">
          {paymentStatus}
        </div>
      )}
      <button
        className={`w-full py-2 sm:py-3 rounded-lg font-semibold transition text-sm sm:text-base ${
          isCurrent || isSubscribing || isDisabled
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
        disabled={isCurrent || isSubscribing || isDisabled}
        onClick={handleSubscribe}
      >
        {isCurrent ? t('currentPlan') : 
         isDisabled ? t('currentPlan') :
         isSubscribing ? (paymentStatus ? t('processing') : t('subscribing')) : 
         plan.price === 0 ? t('getStarted') : t('subscribe')}
      </button>
    </div>
  </div>
);

}
