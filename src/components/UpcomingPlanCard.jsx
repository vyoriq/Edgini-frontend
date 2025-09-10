import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * UpcomingPlanCard component for displaying upcoming plans with early bird access
 * Shows a split card layout with features and early bird payment option
 */
export default function UpcomingPlanCard() {
  const { t } = useTranslation();

  const handleEarlyBirdAccess = () => {
    // Handle early bird payment logic here
    alert(t('earlyBirdAccessComingSoon'));
  };

  return (
    <div className="w-full rounded-2xl shadow-lg border border-gray-200 bg-white overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6 text-white">
        <h3 className="text-lg sm:text-xl font-bold mb-2">{t('upcomingPlans')}</h3>
        {/* <p className="text-purple-100 text-sm sm:text-base">{t('upcomingPlansDescription')}</p> */}
      </div>

      {/* Split Content */}
      <div className="grid md:grid-cols-2 gap-0 flex-grow">
        {/* Left Side - Premium Pro Features */}
        <div className="p-3 sm:p-4 border-r border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-600 rounded-full mr-2"></div>
            <h4 className="text-sm sm:text-base font-semibold text-gray-800">{t('premiumPlusPlan')}</h4>
            <span className="ml-1 px-1.5 py-0.5 text-xs sm:text-sm bg-purple-100 text-purple-800 rounded-full">
              {t('comingSoon')}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Parents Exam Prep</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Exam Prep & Practice</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Text + Voice + Images</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Full Progress + Personalization + Dashboard</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Multi-language + Audio</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Advanced Exam Support Video + Interactive Worksheets</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Upload Features of Answer Sheets to check the correctness and do revision</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">More....</span>
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
              <span className="text-blue-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Student + Teacher access</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Admin Dashboard - (Parent/teacher view)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Multi-language support</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Class & individual progress reports</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Custom curriculum integration</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Competitive prep modules (Olympiad, NEET, JEE, UPSC)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">Bundle with institution's own classes</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold text-xs sm:text-sm mt-0.5">✓</span>
              <span className="text-xs sm:text-sm text-gray-700 leading-tight">More....</span>
            </div>
          </div>
        </div>
      </div>

      {/* Early Bird Access Section */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-gray-200 mt-auto">
        <div className="text-center">
          <div className="flex justify-center items-center mb-3">
            <span className="text-xl sm:text-2xl mr-2">🚀</span>
            <h5 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">Subscribe Now for Early Bird Offer with ₹1 and avail discount once this Plan Releases</h5>
          </div>
          {/* <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-tight">
            Subscribe Now for Early Bird Offer with ₹1 and avail discount once this Plan Releases
          </p> */}
          <button
            onClick={handleEarlyBirdAccess}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            {t('getEarlyAccess')}
          </button>
          {/* <p className="text-xs sm:text-sm text-gray-500 mt-2">
            {t('earlyBirdBenefit')}
          </p> */}
        </div>
      </div>
    </div>
  );
}