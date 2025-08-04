import React from "react";
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

// Replace with Supabase data later
const currentUserTier = "free"; // temporary mock

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-center mb-4">
          <img src="assets/edgini-logo.png" alt="Edgini" className="h-16" />
        </div>
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Choose Your Plan
      </h2>
      <div className="flex flex-wrap gap-6 justify-center">
  {plans.map((plan, idx) => (
    <PlanCard key={idx} plan={plan} isCurrent={currentUserTier === plan.tierKey} />
  ))}
</div>
    </div>
  );
}
