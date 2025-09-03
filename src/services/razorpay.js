/**
 * Razorpay payment service module
 * Handles payment order creation, verification, and error management
 */
import authenticatedFetch from '../utils/apiClient';

/**
 * Creates a Razorpay order via backend API
 * @param {Object} orderData - Order creation data
 * @param {string} orderData.tier - Plan tier (basic, premium, pro)
 * @param {number} orderData.amount - Amount in INR
 * @param {string} orderData.currency - Currency code (default: INR)
 * @param {string} orderData.user_id - User identifier UUID
 * @returns {Promise<Object>} Order creation response
 */
export const createRazorpayOrder = async (orderData) => {
  try {
    // Input validation
    if (!orderData.tier || !orderData.amount || !orderData.user_id) {
      throw new Error('Missing required order data: tier, amount, or user_id');
    }

    if (orderData.amount <= 0) {
      throw new Error('Invalid amount: must be greater than 0');
    }

    // Generate receipt and prepare notes
    const receipt = `receipt_${orderData.tier}_${Date.now()}`;
    const notes = {
      type: `${orderData.tier} subscription`
    };

    // Sanitize input data to match backend API structure
    const sanitizedData = {
      user_id: String(orderData.user_id).trim(),
      tier: String(orderData.tier).trim(),
      amount: Number(orderData.amount), // Keep as rupees, backend will handle paise conversion
      currency: orderData.currency || 'INR',
      receipt: receipt,
      notes: notes
    };

    const result = await authenticatedFetch('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(sanitizedData)
    });
    console.log("-------------->",result)
    
    // Validate response structure (backend returns Razorpay order structure)
    if (!result.order_id || !result.amount) {
      throw new Error('Invalid order response from server');
    }

    // Map backend response to expected frontend structure
    return {
      order_id: result.order_id,
      amount: result.amount,
      currency: result.currency,
      receipt: result.receipt
    };

  } catch (error) {
    console.error('Error creating Razorpay order:', error.message);
    throw new Error(`Failed to create payment order: ${error.message}`);
  }
};

/**
 * Initializes Razorpay checkout and handles payment
 * @param {Object} orderDetails - Order details from backend
 * @param {Object} userInfo - User information
 * @param {Function} onSuccess - Success callback
 * @param {Function} onFailure - Failure callback
 */
export const initializeRazorpayPayment = (orderDetails, userInfo, onSuccess, onFailure) => {
  try {
    // Validate Razorpay availability
    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded');
    }

    // Validate required environment variable
    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKeyId || razorpayKeyId === 'YOUR_RAZORPAY_KEY_ID_HERE') {
      throw new Error('Razorpay Key ID not configured');
    }

    // Validate order details
    if (!orderDetails.order_id || !orderDetails.amount) {
      throw new Error('Invalid order details');
    }

    const options = {
      key: razorpayKeyId,
      amount: orderDetails.amount,
      currency: orderDetails.currency || 'INR',
      name: 'Edgini',
      description: `Subscription: ${orderDetails.plan_name || 'Premium Plan'}`,
      order_id: orderDetails.order_id,
      prefill: {
        name: userInfo.name || '',
        email: userInfo.email || '',
        contact: userInfo.phone || ''
      },
      theme: {
        color: '#2563eb' // Blue theme matching your app
      },
      handler: function (response) {
        // Payment success callback
        try {
          if (response.razorpay_payment_id && response.razorpay_signature) {
            onSuccess({
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              signature: response.razorpay_signature
            });
          } else {
            throw new Error('Invalid payment response');
          }
        } catch (error) {
          onFailure(error.message);
        }
      },
      modal: {
        ondismiss: function() {
          onFailure('Payment cancelled by user');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    
    // Handle payment errors
    rzp.on('payment.failed', function (response) {
      onFailure(`Payment failed: ${response.error.description || 'Unknown error'}`);
    });

    rzp.open();

  } catch (error) {
    console.error('Error initializing Razorpay payment:', error.message);
    onFailure(`Payment initialization failed: ${error.message}`);
  }
};

/**
 * Verifies payment and creates subscription via backend
 * @param {Object} paymentData - Payment verification data
 * @param {string} paymentData.payment_id - Razorpay payment ID
 * @param {string} paymentData.order_id - Razorpay order ID
 * @param {string} paymentData.signature - Razorpay signature
 * @param {string} userId - User UUID for subscription creation
 * @returns {Promise<Object>} Verification and subscription response
 */
export const verifyPaymentAndCreateSubscription = async (paymentData, userId) => {
  try {
    // Input validation
    if (!paymentData.payment_id || !paymentData.order_id || !paymentData.signature) {
      throw new Error('Missing required payment data');
    }

    if (!userId) {
      throw new Error('Missing required user ID');
    }

    // Prepare verification payload to match backend model structure
    const verificationData = {
      razorpay_order_id: String(paymentData.order_id).trim(),
      razorpay_payment_id: String(paymentData.payment_id).trim(),
      razorpay_signature: String(paymentData.signature).trim(),
      user_id: String(userId).trim()
    };

    const result = await authenticatedFetch('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData)
    });
    
    // Validate response
    if (!result.success) {
      throw new Error('Payment verification unsuccessful');
    }

    return result;

  } catch (error) {
    console.error('Error verifying payment:', error.message);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

/**
 * Utility function to format amount for display
 * @param {number} amountInPaise - Amount in paise
 * @returns {string} Formatted amount in INR
 */
export const formatAmount = (amountInPaise) => {
  try {
    const amountInRupees = Number(amountInPaise) / 100;
    return `₹${amountInRupees.toLocaleString('en-IN')}`;
  } catch (error) {
    return '₹0';
  }
};

/**
 * Validates user information for payment
 * @param {Object} userInfo - User information object
 * @returns {boolean} Validation result
 */
export const validateUserInfo = (userInfo) => {
  if (!userInfo || typeof userInfo !== 'object') {
    return false;
  }
  
  return Boolean(userInfo.userId && userInfo.email);
};

/**
 * Generates secure external reference for subscription
 * @param {string} userId - User identifier
 * @param {string} planTier - Plan tier
 * @returns {string} External reference string
 */
export const generateExternalRef = (userId, planTier) => {
  const timestamp = Date.now();
  const userIdHash = userId.slice(0, 8);
  return `razorpay_${planTier}_${timestamp}_${userIdHash}`;
};