import authenticatedFetch from '../utils/apiClient';

/**
 * Conversation API Service
 * Handles all conversation history related API calls
 * Uses authenticatedFetch for JWT-based authentication
 */

/**
 * Starts a new conversation with the AI tutor
 * @param {Object} params - Conversation parameters
 * @param {string} params.user_id - User ID
 * @param {string} params.topic - Learning topic
 * @param {string} params.class_level - User's grade level
 * @param {string} params.proficiency_level - User's proficiency level
 * @param {string} params.learning_goal - User's learning goal
 * @param {string} params.learning_style - User's learning style
 * @param {string} params.language - Language code (e.g., 'en', 'hi')
 * @param {string} params.locale - Locale string
 * @param {Array} params.chat_history - Array of previous messages
 * @param {string} params.stage - Current stage in learning flow
 * @param {string|null} params.last_answer - User's last answer
 * @returns {Promise<Object>} Response containing conversation_id, content, and next_stage
 */
export const startNewConversation = async (params) => {
  try {
    console.log('Starting new conversation with params:', {
      ...params,
      user_id: params.user_id ? '***' : undefined
    });

    const response = await authenticatedFetch('/curate', {
      method: 'POST',
      body: JSON.stringify(params)
    });

    console.log('New conversation started:', {
      conversation_id: response.conversation_id,
      next_stage: response.next_stage
    });

    return response;
  } catch (error) {
    console.error('Failed to start new conversation:', error);
    throw error;
  }
};

/**
 * Continues an existing conversation
 * @param {string} conversationId - UUID of the conversation to continue
 * @param {Object} params - Conversation parameters (same as startNewConversation)
 * @returns {Promise<Object>} Response containing updated conversation data
 */
export const continueConversation = async (conversationId, params) => {
  try {
    // Validate conversation ID format (basic UUID check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      throw new Error('Invalid conversation ID format');
    }

    console.log('Continuing conversation:', conversationId);

    const response = await authenticatedFetch(`/curate?conversation_id=${conversationId}`, {
      method: 'POST',
      body: JSON.stringify(params)
    });

    console.log('Conversation continued:', {
      conversation_id: response.conversation_id,
      next_stage: response.next_stage
    });

    return response;
  } catch (error) {
    console.error('Failed to continue conversation:', error);
    throw error;
  }
};

/**
 * Retrieves a paginated list of all conversations for the authenticated user
 * @param {number} page - Page number (starts from 1)
 * @param {number} limit - Items per page (max 50)
 * @param {boolean} includeInactive - Whether to include archived conversations
 * @returns {Promise<Object>} Response containing conversations array and pagination info
 */
export const getConversations = async (page = 1, limit = 10, includeInactive = false) => {
  try {
    // Validate parameters
    if (page < 1) page = 1;
    if (limit < 1 || limit > 50) limit = 10;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      include_inactive: includeInactive.toString()
    });

    console.log('Fetching conversations:', { page, limit, includeInactive });

    const response = await authenticatedFetch(`/conversations?${params.toString()}`);

    console.log('Conversations fetched:', {
      total: response.data?.pagination?.total || 0,
      page: response.data?.pagination?.page || page
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    throw error;
  }
};

/**
 * Retrieves a specific conversation with all its messages
 * @param {string} conversationId - UUID of the conversation
 * @param {number} page - Page number for messages (starts from 1)
 * @param {number} limit - Messages per page (max 100)
 * @returns {Promise<Object>} Response containing conversation details and messages
 */
export const getConversationDetails = async (conversationId, page = 1, limit = 50) => {
  try {
    // Validate conversation ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      throw new Error('Invalid conversation ID format');
    }

    // Validate parameters
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 50;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    console.log('Fetching conversation details:', conversationId);

    const response = await authenticatedFetch(`/conversations/${conversationId}?${params.toString()}`);

    console.log('Conversation details fetched:', {
      conversation_id: conversationId,
      message_count: response.data?.messages?.length || 0
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch conversation details:', error);

    // Handle specific error cases
    if (error.message?.includes('403')) {
      throw new Error('You do not have access to this conversation');
    } else if (error.message?.includes('404')) {
      throw new Error('Conversation not found');
    }

    throw error;
  }
};

/**
 * Reconstructs chat history array from conversation messages
 * Used when resuming a conversation
 * @param {Array} messages - Array of message objects from API
 * @returns {Array} Chat history array in format [{role, content}]
 */
export const reconstructChatHistory = (messages) => {
  try {
    if (!Array.isArray(messages)) {
      console.warn('Invalid messages array provided');
      return [];
    }

    // Sort messages by created_at to ensure correct order
    const sortedMessages = [...messages].sort((a, b) =>
      new Date(a.created_at) - new Date(b.created_at)
    );

    // Map to chat history format
    const chatHistory = sortedMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    console.log('Chat history reconstructed:', {
      message_count: chatHistory.length
    });

    return chatHistory;
  } catch (error) {
    console.error('Failed to reconstruct chat history:', error);
    return [];
  }
};

/**
 * Gets the last stage from conversation messages
 * Used when resuming a conversation
 * @param {Array} messages - Array of message objects from API
 * @returns {string} Last stage or 'explain' as default
 */
export const getLastStage = (messages) => {
  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      return 'explain';
    }

    // Sort messages by created_at and get the last one
    const sortedMessages = [...messages].sort((a, b) =>
      new Date(a.created_at) - new Date(b.created_at)
    );

    const lastMessage = sortedMessages[sortedMessages.length - 1];

    return lastMessage?.stage || 'explain';
  } catch (error) {
    console.error('Failed to get last stage:', error);
    return 'explain';
  }
};

/**
 * Formats conversation for display in UI
 * Sanitizes and formats conversation data for safe rendering
 * @param {Object} conversation - Raw conversation object from API
 * @returns {Object} Formatted conversation object
 */
export const formatConversationForDisplay = (conversation) => {
  try {
    const sanitizeText = (text) => {
      if (!text) return '';
      // Basic HTML entity encoding to prevent XSS
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    };

    return {
      id: conversation.id,
      title: sanitizeText(conversation.title || conversation.topic),
      topic: sanitizeText(conversation.topic),
      class_level: conversation.class_level,
      language: conversation.language,
      message_count: conversation.message_count || 0,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
      is_active: conversation.is_active
    };
  } catch (error) {
    console.error('Failed to format conversation:', error);
    return conversation;
  }
};

export default {
  startNewConversation,
  continueConversation,
  getConversations,
  getConversationDetails,
  reconstructChatHistory,
  getLastStage,
  formatConversationForDisplay
};
