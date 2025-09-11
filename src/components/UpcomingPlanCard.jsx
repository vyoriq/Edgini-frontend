import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  createRazorpayOrder, 
  initializeRazorpayPayment, 
  verifyPaymentAndCreateSubscription,
  validateUserInfo
} from '../services/razorpay';

/**
 * UpcomingPlanCard component for displaying upcoming plans with early bird access
 * Shows a split card layout with features and early bird payment option
 */
export default function UpcomingPlanCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  /**
   * Handles early bird payment flow with ₹1 payment
   * Creates order with tier 'earlybird' and amount 1
   */
  const handleEarlyBirdAccess = async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
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

      // Create Razorpay order for early bird access
      setPaymentStatus(t('processing'));
      
      // Security validation: Ensure amount is exactly ₹1 for early bird
      const earlyBirdAmount = 1;
      if (earlyBirdAmount !== 1) {
        throw new Error('Invalid early bird amount');
      }
      
      const orderData = {
        tier: 'earlybird',
        amount: earlyBirdAmount, // ₹1 for early bird access
        currency: 'INR',
        user_id: userId,
        billing_period: 'early_bird'
      };

      const orderDetails = await createRazorpayOrder(orderData);

      // Initialize payment with early bird specific details
      setPaymentStatus(t('processing'));
      initializeRazorpayPayment(
        {
          ...orderDetails,
          plan_name: 'Early Bird Access'
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
      console.error('Error initiating early bird payment:', error);
      setPaymentStatus('');
      setIsProcessing(false);
      alert(`Payment initiation failed: ${error.message}`);
    }
  };

  /**
   * Handles successful early bird payment verification
   */
  const handlePaymentSuccess = async (paymentResponse, userProfile) => {
    try {
      setPaymentStatus('Verifying payment...');
      
      // Verify payment and create early bird subscription
      const result = await verifyPaymentAndCreateSubscription(paymentResponse, userProfile.userId);
      
      setPaymentStatus('Early bird access activated!');
      
      // Extract order ID and redirect to order details
      const orderId = paymentResponse.order_id || result.order_id || 'unknown';
      
      setTimeout(() => {
        navigate(`/order-details/${orderId}`);
      }, 1000);

    } catch (error) {
      console.error('Error verifying early bird payment:', error);
      setPaymentStatus('');
      alert(`Payment verification failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handles early bird payment failure scenarios
   */
  const handlePaymentFailure = (error) => {
    console.error('Early bird payment failed:', error);
    setPaymentStatus('');
    setIsProcessing(false);
    
    if (error !== 'Payment cancelled by user') {
      alert(`Payment failed: ${error}`);
    }
  };

  return (
    <div className="w-full rounded-2xl shadow-lg border border-gray-200 bg-white overflow-hidden h-full flex flex-col min-h-[350px] sm:min-h-[400px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-5 lg:p-6 text-white">
        <h3 className="text-lg sm:text-xl font-bold mb-2 text-center sm:text-left">{t('upcomingPlans')}</h3>
        {/* <p className="text-purple-100 text-sm sm:text-base">{t('upcomingPlansDescription')}</p> */}
      </div>

      {/* Split Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 flex-grow">
        {/* Left Side - Premium Pro Features */}
        <div className="p-3 sm:p-4 md:border-r border-gray-200 border-b md:border-b-0">
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-600 rounded-full mr-2"></div>
            <h4 className="text-sm sm:text-base font-semibold text-gray-800">{t('premiumPlusPlan')}</h4>
            <span className="ml-1 px-1.5 py-0.5 text-xs sm:text-sm bg-purple-100 text-purple-800 rounded-full">
              {t('comingSoon')}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('parentsExamPrep')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('examPrepPractice')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('textVoiceImages')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('fullProgressDashboard')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('multiLanguageAudio')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('advancedExamSupport')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('answerSheetUpload')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('moreFeatures')}</span>
            </div>
          </div>
        </div>

        {/* Right Side - Enterprise Features */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-600 rounded-full mr-2"></div>
            <h4 className="text-sm sm:text-base font-semibold text-gray-800">{t('institutionPackage')}</h4>
            <span className="ml-1 px-1.5 py-0.5 text-xs sm:text-sm bg-blue-100 text-blue-800 rounded-full">
              {t('comingSoon')}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('studentTeacherAccess')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('adminDashboard')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('multiLanguageSupport')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('progressReports')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('customCurriculum')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('competitiveModules')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('institutionBundle')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-sm sm:text-sm mt-0.5 flex-shrink-0">✓</span>
              <span className="text-sm sm:text-sm text-gray-700 leading-tight">{t('moreFeatures')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Early Bird Access Section */}
      <div className="p-4 sm:p-5 lg:p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-gray-200 mt-auto">
        <div className="text-center">
          <div className="flex justify-center items-center mb-3 flex-wrap gap-2">
            <span className="text-xl sm:text-2xl flex-shrink-0">🚀</span>
            <h5 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 text-center leading-tight">{t('earlyBirdOfferText')}</h5>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-tight">
            Subscribe for just ₹1 to get early access and special discounts
          </p>
          
          {/* Payment Status Display */}
          {paymentStatus && (
            <div className="mb-3 text-sm text-blue-600 text-center">
              {paymentStatus}
            </div>
          )}
          
          <button
            onClick={handleEarlyBirdAccess}
            disabled={isProcessing}
            className={`font-semibold py-3 sm:py-3 px-6 sm:px-6 rounded-lg transition-all duration-300 shadow-lg text-base sm:text-base w-full sm:w-auto ${
              isProcessing 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transform hover:scale-105 hover:shadow-xl'
            }`}
          >
            {isProcessing ? (paymentStatus ? 'Processing...' : 'Please wait...') : t('getEarlyAccess')}
          </button>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Only ₹1 • Secure payment via Razorpay
          </p>
        </div>
      </div>
    </div>
  );
}