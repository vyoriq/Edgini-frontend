import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  createRazorpayOrder, 
  initializeRazorpayPayment, 
  verifyPaymentAndCreateSubscription,
  validateUserInfo,
  generateExternalRef
} from '../services/razorpay';

export default function PlanCard({ plan, isCurrent, isDisabled = false }) {
  const navigate = useNavigate();
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
        alert('Please login first to subscribe');
        return;
      }
      
      const userProfile = JSON.parse(profile);
      if (!validateUserInfo(userProfile)) {
        alert('Invalid user information. Please login again.');
        return;
      }

      const userId = userProfile.userId;

      // Create Razorpay order
      setPaymentStatus('Creating payment order...');
      const orderData = {
        tier: plan.tierKey,
        amount: plan.price,
        currency: 'INR',
        user_id: userId
      };

      const orderDetails = await createRazorpayOrder(orderData);
      console.log("plan" , plan)
      // Initialize payment
      setPaymentStatus('Opening payment gateway...');
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

      const response = await fetch('http://localhost:8000/create_subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Subscription creation failed: ${errorData.detail || response.statusText}`);
      }

      // Redirect to order details page for free subscription
      // For free plans, we'll need to get the order ID from backend response
      if (response.ok) {
        const result = await response.json();
        const orderId = result.id || result.order_id || 'free_subscription';
        navigate(`/order-details/${orderId}`);
      } else {
        alert(`Failed to create subscription: ${error.message}`);
      }

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
      
      setPaymentStatus('Subscription created successfully!');
      
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
    className={`w-full sm:w-[48%] lg:w-[23%] max-w-[300px] rounded-2xl shadow-md p-6 border ${
      isCurrent ? "border-blue-600" : "border-gray-200"
    } bg-white flex flex-col justify-between`}
  >
    <div>
      <h3 className="text-xl font-semibold text-gray-800">{plan.name}</h3>
      <p className="text-3xl font-bold text-blue-700 mt-2">
        ₹{plan.price}
        <span className="text-sm text-gray-500 font-normal"> /month</span>
      </p>
      <p className="mt-2 text-sm text-gray-600">{plan.limit}</p>

      <ul className="mt-4 space-y-2 text-sm text-gray-700">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-500 font-bold">✓</span> {feature}
          </li>
        ))}
      </ul>
    </div>

    <div className="mt-6">
      {paymentStatus && (
        <div className="mb-2 text-sm text-blue-600 text-center">
          {paymentStatus}
        </div>
      )}
      <button
        className={`w-full py-2 rounded-xl font-semibold transition ${
          isCurrent || isSubscribing || isDisabled
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
        disabled={isCurrent || isSubscribing || isDisabled}
        onClick={handleSubscribe}
      >
        {isCurrent ? "Current Plan" : 
         isDisabled ? "Current Plan" :
         isSubscribing ? (paymentStatus ? "Processing..." : "Subscribing...") : 
         plan.price === 0 ? "Get Started" : "Subscribe"}
      </button>
    </div>
  </div>
);

}
