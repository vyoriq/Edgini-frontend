import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authenticatedFetch from '../utils/apiClient';

/**
 * OrderHistory Component - Displays user's order history with pagination and filtering
 * Fetches order data from backend API and provides navigation to order details
 */
export default function OrderHistory() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchOrderHistory();
    // Set language from localStorage
    const savedLang = localStorage.getItem("vyoriqLanguage") || "en";
    i18n.changeLanguage(savedLang);
  }, [i18n]);

  /**
   * Fetches order history from the API
   */
  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user ID from localStorage
      const profile = localStorage.getItem('vyoriqUserProfile');
      if (!profile) {
        navigate('/auth');
        return;
      }

      const userProfile = JSON.parse(profile);
      const userId = userProfile.userId;

      const result = await authenticatedFetch(`/getOrderList/${userId}`);
      
      if (result.success && result.data) {
        setOrders(result.data.orders || []);
        setPagination(result.data.pagination || null);
      } else {
        setOrders([]);
      }

    } catch (err) {
      console.error('Error fetching order history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


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
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  /**
   * Gets status badge styling based on payment status
   */
  const getStatusBadge = (order) => {
    const paymentStatus = order.payment_info?.status;
    if (paymentStatus === 'captured') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-red-100 text-red-800 border-red-200';
  };

  /**
   * Gets status text based on payment status
   */
  const getStatusText = (order) => {
    const paymentStatus = order.payment_info?.status;
    return paymentStatus === 'captured' ? t('success') : t('failed');
  };

  /**
   * Gets plan name from tier
   */
  const getPlanName = (tier) => {
    const planNames = {
      'basic': t('basicPlan'),
      'premium': t('premiumPlan'),
      'pro': t('proPlan'),
      'free': t('freePlan')
    };
    return planNames[tier] || `${t('subscription')} ${t('plan')}`;
  };

  /**
   * Navigates to order details page
   */
  const viewOrderDetails = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };

  /**
   * Retry order (navigate to subscription page)
   */
  const retryOrder = () => {
    navigate('/subscription');
  };


  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header with Logo */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('orderHistory')}</h1>
            <p className="mt-2 text-gray-600">{t('viewManageOrders')}</p>
          </div>
          <img 
            src="/assets/edgini-logo.png" 
            alt="EdGini" 
            className="h-12 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/learn')}
          />
        </div>


        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loadingOrderHistory')}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">{t('errorLoadingOrders')}</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchOrderHistory}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noOrdersFound')}</h3>
            <p className="text-gray-600 mb-4">{t('noOrdersMessage')}</p>
            <button
              onClick={() => navigate('/subscription')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {t('browsePlans')}
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {orders.map((order, index) => (
                <div 
                  key={order.order_info?.order_id || index} 
                  className="p-6 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/order-details/${order.order_info?.order_id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getPlanName(order.subscription_info?.tier || order.metadata?.notes?.type?.split(' ')[0])}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(order)}`}>
                            {getStatusText(order)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatAmount(order.order_info?.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(order.order_info?.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">{t('orderID')}:</span>
                          <p className="font-mono mt-1">{order.order_info?.order_id || t('na')}</p>
                        </div>
                        <div>
                          <span className="font-medium">{t('paymentID')}:</span>
                          <p className="font-mono mt-1">{order.payment_info?.payment_id || t('na')}</p>
                        </div>
                        <div>
                          <span className="font-medium">{t('status')}:</span>
                          <p className="mt-1 capitalize">{order.payment_info?.status || t('pending')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}