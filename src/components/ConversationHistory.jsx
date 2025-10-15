import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getConversations, getConversationDetails, formatConversationForDisplay } from '../api/conversationApi';

/**
 * ConversationHistory Component
 * Displays a paginated list of user's past conversations
 * Allows viewing and resuming previous conversations
 */
export default function ConversationHistory() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [viewingDetails, setViewingDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  /**
   * Fetches conversations for current page
   */
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations(currentPage, itemsPerPage);

      if (data && data.conversations) {
        setConversations(data.conversations.map(formatConversationForDisplay));
        setTotalPages(data.pagination?.total_pages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [currentPage, itemsPerPage]);

  /**
   * Handles viewing conversation details
   */
  const handleViewDetails = async (conversationId) => {
    try {
      setDetailsLoading(true);
      const data = await getConversationDetails(conversationId);
      setSelectedConversation(data);
      setViewingDetails(true);
    } catch (err) {
      console.error('Failed to load conversation details:', err);
      alert('Failed to load conversation details');
    } finally {
      setDetailsLoading(false);
    }
  };

  /**
   * Handles resuming a conversation
   * Navigates back to learn page with conversation ID in state
   */
  const handleResumeConversation = (conversationId) => {
    // Navigate to learn page and trigger resume
    navigate('/learn', { state: { resumeConversationId: conversationId } });
  };

  /**
   * Formats date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  /**
   * Handles page change
   */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  /**
   * Renders pagination controls
   */
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 px-4">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} conversations
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-1">
            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = idx + 1;
              } else if (currentPage <= 3) {
                pageNum = idx + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + idx;
              } else {
                pageNum = currentPage - 2 + idx;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  /**
   * Renders conversation details modal
   */
  const renderDetailsModal = () => {
    if (!viewingDetails || !selectedConversation) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{selectedConversation.conversation?.title}</h2>
              <p className="text-sm text-blue-100">
                {selectedConversation.conversation?.message_count} messages •
                Started {formatDate(selectedConversation.conversation?.created_at)}
              </p>
            </div>
            <button
              onClick={() => setViewingDetails(false)}
              className="text-white hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
            {selectedConversation.messages?.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-100 text-left ml-8'
                    : 'bg-gray-100 text-left mr-8'
                }`}
              >
                <div className="font-semibold text-xs text-gray-600 mb-1">
                  {msg.role === 'user' ? 'You' : 'EdGini'}
                </div>
                <div className="text-sm">{msg.content}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 flex justify-end space-x-3">
            <button
              onClick={() => setViewingDetails(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
            <button
              onClick={() => handleResumeConversation(selectedConversation.conversation?.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Resume Conversation
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Conversations</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchConversations()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/learn')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Conversation History</h1>
                <p className="text-sm text-gray-600">View and resume your past conversations</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/learn')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              New Conversation
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">💬</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Conversations Yet</h2>
            <p className="text-gray-600 mb-6">Start a conversation to see your history here</p>
            <button
              onClick={() => navigate('/learn')}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Start Learning
            </button>
          </div>
        ) : (
          <>
            {/* Items per page selector */}
            <div className="mb-4 flex items-center justify-end space-x-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            {/* Conversation List */}
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {conversation.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>📚 Grade {conversation.class_level}</span>
                        <span>💬 {conversation.message_count} messages</span>
                        <span>🕐 {formatDate(conversation.updated_at)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(conversation.id)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleResumeConversation(conversation.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Resume
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </div>

      {/* Details Modal */}
      {renderDetailsModal()}

      {/* Loading overlay for details */}
      {detailsLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading conversation...</p>
          </div>
        </div>
      )}
    </div>
  );
}
