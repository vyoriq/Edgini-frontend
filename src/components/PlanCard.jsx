import React, { useState } from "react";

export default function PlanCard({ plan, isCurrent }) {
  const [isSubscribing, setIsSubscribing] = useState(false);

  /**
   * Creates subscription using backend API
   * Maps plan data to API format and handles subscription creation
   */
  const handleSubscribe = async () => {
    if (isCurrent || isSubscribing) return;

    try {
      setIsSubscribing(true);
      
      // Get user profile from localStorage
      const profile = localStorage.getItem('vyoriqUserProfile');
      if (!profile) {
        alert('Please login first to subscribe');
        return;
      }
      
      const userProfile = JSON.parse(profile);
      const userId = userProfile.userId;

      // Map plan tier to daily limits
      const dailyLimitMap = {
        free: 10,
        basic: 25, 
        premium: 100,
        pro: -1 // unlimited
      };

      // Calculate subscription dates (1 year from now)
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      const formattedEndDate = endDate.toISOString().split('T')[0];

      // Prepare API payload
      const subscriptionData = {
        user_id: userId,
        tier: plan.tierKey,
        status: "active",
        start_date: startDate,
        end_date: formattedEndDate,
        daily_limit: dailyLimitMap[plan.tierKey] || 10,
        payment_provider: "stripe",
        external_ref: `sub_${Date.now()}_${userId.slice(0, 8)}`
      };

      // Call create_subscription API
      const response = await fetch('http://localhost:8000/create_subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriptionData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Subscription creation failed: ${errorData.detail || response.statusText}`);
      }

      const result = await response.json();
      console.log('Subscription created successfully:', result);
      
      // Show success message and reload page to reflect changes
      alert(`Successfully subscribed to ${plan.name} plan! Your subscription is now active.`);
      window.location.reload();

    } catch (error) {
      console.error('Error creating subscription:', error);
      alert(`Failed to create subscription: ${error.message}`);
    } finally {
      setIsSubscribing(false);
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

    <button
      className={`mt-6 w-full py-2 rounded-xl font-semibold transition ${
        isCurrent || isSubscribing
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
      disabled={isCurrent || isSubscribing}
      onClick={handleSubscribe}
    >
      {isCurrent ? "Current Plan" : isSubscribing ? "Subscribing..." : "Subscribe"}
    </button>
  </div>
);

}
