import React from "react";

export default function PlanCard({ plan, isCurrent }) {
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
        isCurrent
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
      disabled={isCurrent}
      onClick={() => {
        if (!isCurrent) {
          // Later: trigger Stripe session or backend call
          alert(`Redirect to subscribe to ${plan.name}`);
        }
      }}
    >
      {isCurrent ? "Current Plan" : "Subscribe"}
    </button>
  </div>
);

}
