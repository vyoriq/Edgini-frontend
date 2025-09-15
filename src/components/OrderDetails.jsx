import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authenticatedFetch from '../utils/apiClient';

/**
 * OrderDetails Component - Fetches and displays order details from backend
 * Gets order_id from URL params and calls getOrderDetails API
 */
export default function OrderDetails() {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches order details from backend API
   */
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!order_id) {
        throw new Error(t('orderIDRequired'));
      }

      const result = await authenticatedFetch(`/getOrderDetails/${order_id}`);
      
      // Handle the nested response structure
      if (result.success && result.data) {
        setOrderData(result.data);
      } else {
        throw new Error(t('invalidResponseFormat'));
      }

    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    // Set language from localStorage
    const savedLang = localStorage.getItem("vyoriqLanguage") || "en";
    i18n.changeLanguage(savedLang);
  }, [order_id, i18n]);

  /**
   * Formats amount for display
   */
  const formatAmount = (amount) => {
    if (!amount) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  /**
   * Formats date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return t('na');
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Determines if payment was successful based on order data
   * Handles early bird access (₹1) differently since no subscription is created
   */
  const isPaymentSuccessful = () => {
    if (!orderData) return false;

    // Check payment status from the nested structure
    const paymentStatus = orderData?.payment_info?.status;
    const amount = orderData?.order_info?.amount;

    // For early bird access (₹1), only check payment status since no subscription is created
    if (amount === 1 || amount === 1.0) {
      return paymentStatus === 'captured';
    }

    // For regular subscriptions, check both payment and subscription status
    const subscriptionStatus = orderData?.subscription_info?.status;
    const isActive = orderData?.subscription_info?.is_active;

    return paymentStatus === 'captured' && subscriptionStatus === 'active' && isActive;
  };

  /**
   * Navigation handlers
   */
  const handleBackToSubscription = () => {
    navigate('/subscription');
  };

  const handleGoToLearn = () => {
    navigate('/learn');
  };

  const handleRetryPayment = () => {
    navigate('/subscription');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loadingOrderDetails')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-8">
            <img src="/assets/edgini-logo.png" alt="EdGini" className="h-16" />
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-red-600 mb-4">{t('errorLoadingOrder')}</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="space-y-3">
              <button
                onClick={fetchOrderDetails}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
              >
                {t('retry')}
              </button>
              <button
                onClick={handleBackToSubscription}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
              >
                {t('backToPlans')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  const isSuccess = isPaymentSuccessful();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/edgini-logo.png" 
            alt="EdGini" 
            className="h-16 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate('/learn')}
          />
        </div>

        {/* Order Status Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Status Icon */}
          <div className="mb-6">
            {isSuccess ? (
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            ) : (
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Status Message */}
          <h2 className={`text-2xl font-bold mb-2 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
            {isSuccess ? t('paymentSuccessful') : t('paymentFailed')}
          </h2>

          <p className="text-gray-600 mb-6">
            {isSuccess
              ? orderData?.order_info?.amount === 1 || orderData?.order_info?.amount === 1.0
                ? 'Your early bird access has been activated! You\'ll get special discounts when premium features launch.'
                : `${t('yourPlan')} ${orderData?.subscription_info?.tier || ''} ${t('subscriptionActivated')}`
              : orderData?.payment_info?.failure_reason
                ? `${t('paymentFailed')}: ${orderData.payment_info.failure_reason}`
                : t('paymentFailedMessage')
            }
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('orderDetails')}</h3>
            
            <div className="space-y-3">
              {/* Order ID */}
              <div className="flex justify-between">
                <span className="text-gray-600">{t('orderID')}:</span>
                <span className="font-mono text-sm text-gray-800">{orderData?.order_info?.order_id}</span>
              </div>

              {/* Payment ID */}
              {orderData?.payment_info?.payment_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('paymentID')}:</span>
                  <span className="font-mono text-sm text-gray-800">{orderData.payment_info.payment_id}</span>
                </div>
              )}

              {/* Amount */}
              {orderData?.order_info?.amount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('amount')}:</span>
                  <span className="font-semibold text-gray-800">{formatAmount(orderData.order_info.amount)}</span>
                </div>
              )}

              {/* Currency */}
              {orderData?.order_info?.currency && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('currency')}:</span>
                  <span className="text-gray-800">{orderData.order_info.currency}</span>
                </div>
              )}

              {/* Payment Status */}
              <div className="flex justify-between">
                <span className="text-gray-600">{t('paymentStatus')}:</span>
                <span className={`font-semibold capitalize ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                  {orderData?.payment_info?.status || t('unknown')}
                </span>
              </div>

              {/* Subscription Tier */}
              {orderData?.subscription_info?.tier && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('plan')}:</span>
                  <span className="font-semibold text-gray-800 capitalize">{orderData.subscription_info.tier}</span>
                </div>
              )}

              {/* Subscription Status */}
              {orderData?.subscription_info?.status && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subscriptionStatus')}:</span>
                  <span className={`font-semibold capitalize ${
                    orderData.subscription_info.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {orderData.subscription_info.status === 'active' ? t('active') : t('inactive')}
                  </span>
                </div>
              )}

              {/* Daily Limit */}
              {orderData?.subscription_info?.daily_limit && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('dailyLimit')}:</span>
                  <span className="text-gray-800">
                    {orderData.subscription_info.daily_limit === -1 
                      ? t('unlimited') 
                      : `${orderData.subscription_info.daily_limit} ${t('queries')}`
                    }
                  </span>
                </div>
              )}

              {/* Subscription Period */}
              {orderData?.subscription_info?.start_date && orderData?.subscription_info?.end_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('validUntil')}:</span>
                  <span className="text-sm text-gray-800">{formatDate(orderData.subscription_info.end_date)}</span>
                </div>
              )}

              {/* Order Created Date */}
              {orderData?.order_info?.created_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('orderCreated')}:</span>
                  <span className="text-sm text-gray-800">{formatDate(orderData.order_info.created_at)}</span>
                </div>
              )}

              {/* Payment Completed Date */}
              {orderData?.payment_info?.payment_completed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('paymentCompleted')}:</span>
                  <span className="text-sm text-gray-800">{formatDate(orderData.payment_info.payment_completed_at)}</span>
                </div>
              )}

              {/* Receipt */}
              {orderData?.order_info?.receipt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('receipt')}:</span>
                  <span className="font-mono text-sm text-gray-800">{orderData.order_info.receipt}</span>
                </div>
              )}

              {/* Subscription ID */}
              {orderData?.subscription_info?.subscription_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subscriptionID')}:</span>
                  <span className="font-mono text-sm text-gray-800">{orderData.subscription_info.subscription_id}</span>
                </div>
              )}

              {/* Payment Failure Reason (if any) */}
              {orderData?.payment_info?.failure_reason && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-gray-600 block mb-2">{t('failureReason')}:</span>
                  <span className="text-sm text-red-600 bg-red-50 p-2 rounded">{orderData.payment_info.failure_reason}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isSuccess ? (
              <>
                <button
                  onClick={handleGoToLearn}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
                >
                  {t('startLearning')}
                </button>
                <button
                  onClick={handleBackToSubscription}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                >
                  {t('viewPlans')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleRetryPayment}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
                >
                  {t('tryAgain')}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition"
                >
                  {t('goToHome')}
                </button>
              </>
            )}
          </div>

          {/* Support Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {t('needHelp')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}