import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * PricingToggle component for switching between Monthly and Yearly billing options
 * Displays a toggle switch with smooth animations and a savings badge for yearly option
 * @param {string} billingPeriod - Current billing period ('monthly' or 'yearly')
 * @param {function} onToggle - Callback function when toggle is switched (null to disable)
 */
export default function PricingToggle({ billingPeriod, onToggle }) {
  const { t } = useTranslation();

  const isDisabled = !onToggle;

  const handleToggle = () => {
    if (isDisabled) return;
    const newPeriod = billingPeriod === 'monthly' ? 'yearly' : 'monthly';
    onToggle(newPeriod);
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center gap-2">
        {/* Monthly Label */}
        <span
          className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
            isDisabled
              ? 'text-gray-400'
              : billingPeriod === 'monthly' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          {t('monthly')}
        </span>

        {/* Toggle Switch */}
        <div className="relative">
          <button
            onClick={handleToggle}
            disabled={isDisabled}
            className={`relative w-10 h-5 rounded-full transition-all duration-300 focus:outline-none ${
              isDisabled
                ? 'cursor-not-allowed opacity-50'
                : 'focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 hover:shadow-md cursor-pointer'
            } ${
              billingPeriod === 'yearly'
                ? isDisabled ? 'bg-gray-400' : 'bg-blue-600'
                : 'bg-gray-300'
            }`}
            aria-label={isDisabled ? t('billingPeriodLocked') : t('toggleBillingPeriod')}
          >
            {/* Toggle Circle */}
            <div
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                billingPeriod === 'yearly' ? 'transform translate-x-5' : 'transform translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Yearly Label */}
        <span
          className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
            isDisabled
              ? 'text-gray-400'
              : billingPeriod === 'yearly' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          {t('yearly')}
        </span>

        {/* Savings Badge - Only show for yearly */}
        {billingPeriod === 'yearly' && (
          <div className="transition-all duration-300 ease-in-out animate-fadeIn">
            {/* <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
              Save 16.5%
            </span> */}
          </div>
        )}
      </div>
    </div>
  );
}