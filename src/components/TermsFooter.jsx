import React, { useState } from 'react';

/**
 * TermsFooter Component
 * Displays a compact footer with links to legal information (Terms, Privacy, etc.)
 * Content is displayed in modal dialogs when links are clicked
 * Responsive design with accessibility features
 */
export default function TermsFooter() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '' });

  /**
   * Opens modal with specified content
   * @param {string} title - Modal title
   * @param {string|JSX.Element} content - Modal content
   */
  const openModal = (title, content) => {
    setModalContent({ title, content });
    setIsModalOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  /**
   * Closes the modal and restores body scroll
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent({ title: '', content: '' });
    document.body.style.overflow = 'unset';
  };

  /**
   * Handles escape key press to close modal
   * @param {KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  // Content sections
  const sections = {
    about: {
      title: 'About Us',
      content: (
        <div className="space-y-4">
          <p>
            EdGini is a Made-in-India learning platform designed to inspire curiosity, creativity, and continuous learning.
            Built with a vision to make education more adaptive, inclusive, and engaging, EdGini blends technology with
            pedagogy to help learners discover their potential. Our platform combines intuitive learning tools, assessments,
            and insights to make learning measurable, fun, and future-ready.
          </p>
          <p>
            EdGini helps learners take charge of their learning journey through interactive lessons, progress insights,
            and goal-based challenges. It enables students to learn at their own pace while giving parents transparent
            visibility into performance and improvement areas. From foundational skills to advanced learning paths,
            EdGini empowers every student to grow with confidence and curiosity.
          </p>
          <p>
            EdGini for Institutions brings data-driven learning intelligence to classrooms. Schools and academies can
            deploy customized modules, track academic performance, and deliver personalized learning experiences for
            every student. Designed to integrate seamlessly with existing systems, EdGini helps institutions digitize,
            analyze, and elevate their teaching-learning outcomes—all within one unified platform.
          </p>
        </div>
      )
    },
    contact: {
      title: 'Contact Us',
      content: (
        <div className="space-y-4">
          <p>Have a question or collaboration in mind? We'd love to hear from you.</p>
          <div className="space-y-2">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:support@edgini.com" className="text-blue-600 hover:underline">
                support@edgini.com
              </a>
            </p>
            <p>
              <strong>Website:</strong>{' '}
              <a href="https://www.edgini.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                www.edgini.com
              </a>
            </p>
            <p><strong>Head Office:</strong> Bengaluru, India</p>
            <p className="text-sm text-gray-600">
              (Working hours: Monday–Friday, 9:00 AM – 6:00 PM IST)
            </p>
          </div>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      content: (
        <div className="space-y-4">
          <p>
            EdGini values your trust and is committed to protecting your privacy. We collect limited personal information
            only to improve user experience and provide tailored educational content. Your data is never sold or shared
            with unauthorized third parties. We implement strong encryption, access controls, and compliance practices
            to ensure your information remains secure. By using EdGini, you consent to the collection and use of data
            in accordance with this policy.
          </p>
        </div>
      )
    },
    refund: {
      title: 'Refund & Cancellation Policy',
      content: (
        <div className="space-y-4">
          <p>
            We strive to ensure every user experience is positive. Subscriptions or paid courses can be cancelled within
            7 days of purchase for a full refund, provided less than 20% of the content has been accessed. After 7 days,
            refunds are not applicable but users may transfer their subscription. For cancellations or refund assistance,
            please contact{' '}
            <a href="mailto:billing@edgini.com" className="text-blue-600 hover:underline">
              billing@edgini.com
            </a>{' '}
            with your registered email ID.
          </p>
        </div>
      )
    },
    shipping: {
      title: 'Shipping Policy',
      content: (
        <div className="space-y-4">
          <p>
            Since EdGini is a digital platform, there are no physical shipments. Upon successful payment, access to
            digital content and services is instantly activated on your registered account and accessed through EdGini
            educational panel. In a rare case of concerns, please contact{' '}
            <a href="mailto:support@edgini.com" className="text-blue-600 hover:underline">
              support@edgini.com
            </a>{' '}
            and our team will resolve it promptly.
          </p>
        </div>
      )
    },
    terms: {
      title: 'Terms & Conditions',
      content: (
        <div className="space-y-4">
          <p>
            By registering on EdGini, users agree to use the platform ethically and responsibly. Content on EdGini is
            proprietary and intended solely for personal or institutional learning purposes. Unauthorized distribution,
            duplication, or resale of any material is strictly prohibited. EdGini reserves the right to modify, suspend,
            or discontinue services to maintain quality and compliance. Continued use of the platform constitutes
            acceptance of the latest terms and conditions published on our site.
          </p>
        </div>
      )
    }
  };

  return (
    <>
      {/* Footer Bar */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center space-x-2">
              <img
                src="/assets/edgini-logo.png"
                alt="EdGini Logo"
                className="h-6 sm:h-8"
              />
              <span className="text-xs sm:text-sm text-gray-600">
                © {new Date().getFullYear()} EdGini
              </span>
            </div>

            {/* Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs sm:text-sm" aria-label="Footer navigation">
              <button
                onClick={() => openModal(sections.about.title, sections.about.content)}
                className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                aria-label="About Us"
              >
                About Us
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={() => openModal(sections.contact.title, sections.contact.content)}
                className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                aria-label="Contact Us"
              >
                Contact Us
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={() => openModal(sections.privacy.title, sections.privacy.content)}
                className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                aria-label="Privacy Policy"
              >
                Privacy Policy
              </button>
              <span className="text-gray-400 hidden sm:inline">|</span>
              <button
                onClick={() => openModal(sections.refund.title, sections.refund.content)}
                className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                aria-label="Refund & Cancellation Policy"
              >
                Refund Policy
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={() => openModal(sections.shipping.title, sections.shipping.content)}
                className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                aria-label="Shipping Policy"
              >
                Shipping
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={() => openModal(sections.terms.title, sections.terms.content)}
                className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
                aria-label="Terms & Conditions"
              >
                Terms
              </button>
            </nav>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={closeModal}
            aria-hidden="true"
          ></div>

          {/* Modal Content */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2
                  id="modal-title"
                  className="text-xl sm:text-2xl font-bold text-gray-900"
                >
                  {modalContent.title}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                <div className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  {modalContent.content}
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                <button
                  onClick={closeModal}
                  className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
