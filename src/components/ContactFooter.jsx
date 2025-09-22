import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * ContactFooter Component - Displays contact email in footer
 * Reusable footer component for subscription and order pages
 */
export default function ContactFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-6 px-4 sm:px-6 lg:px-8 mt-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          {/* Envelope Icon */}
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>

          {/* Contact Text and Email */}
          <div>
            <span className="text-sm sm:text-base font-medium text-gray-700">
              {'Contact us'}:
            </span>
            <a
              href="mailto:Contact@Edgini.com"
              className="ml-2 text-sm sm:text-base text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 underline"
              aria-label="Send email to Contact@Edgini.com"
            >
              Contact@Edgini.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}