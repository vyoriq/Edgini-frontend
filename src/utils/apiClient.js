import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_APP_HOST;

/**
 * Get current access token from Supabase
 */
const getAccessToken = async () => {
  // Add persistent debugging to localStorage
  const debugInfo = [];
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    debugInfo.push(`Session check: ${new Date().toISOString()}`);
    debugInfo.push(`Session exists: ${!!session}`);
    debugInfo.push(`Session error: ${error ? error.message : 'none'}`);
    
    if (session) {
      debugInfo.push(`User ID: ${session.user?.id}`);
      debugInfo.push(`Token exists: ${!!session.access_token}`);
      debugInfo.push(`Token expires: ${new Date(session.expires_at * 1000).toISOString()}`);
      debugInfo.push(`Token first 20 chars: ${session.access_token?.substring(0, 20)}...`);
    }
    
    // Store debug info persistently
    localStorage.setItem('auth_debug', JSON.stringify(debugInfo));
    console.log('Auth Debug Info:', debugInfo);
    
    if (error) {
      console.error('Supabase auth error:', error);
      throw new Error(`Authentication error: ${error.message}`);
    }
    
    if (!session) {
      console.error('No session found');
      throw new Error('No active session');
    }
    
    if (!session.access_token) {
      console.error('No access token in session');
      throw new Error('No access token available');
    }
    
    // Check if token is expired
    const now = Date.now() / 1000;
    if (session.expires_at && session.expires_at < now) {
      console.error('Token has expired');
      throw new Error('Token has expired');
    }
    
    console.log('Token validated successfully');
    return session.access_token;
    
  } catch (error) {
    debugInfo.push(`Error: ${error.message}`);
    localStorage.setItem('auth_debug', JSON.stringify(debugInfo));
    throw error;
  }
};

/**
 * Make authenticated API request
 */
export const authenticatedFetch = async (endpoint, options = {}) => {
  try {
    const token = await getAccessToken();
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    console.log('Making request to:', url);
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token.substring(0, 50)}...`,
      ...options.headers
    });
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.status === 401) {
      console.error('401 Unauthorized - token may be invalid or expired');
      
      // Store 401 debug info
      const errorDebugInfo = [
        `401 Error at: ${new Date().toISOString()}`,
        `Request URL: ${url}`,
        `Request method: ${options.method || 'GET'}`,
        `Token used: ${token?.substring(0, 20)}...`
      ];
      localStorage.setItem('auth_401_debug', JSON.stringify(errorDebugInfo));
      
      // Don't immediately redirect - throw error and let component handle it
      throw new Error('Authentication failed - 401 Unauthorized');
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `API Error: ${response.status}`;
      
      // Preserve specific error messages for UI handling
      if (errorMessage.includes('Daily query limit reached')) {
        throw new Error('Daily query limit reached');
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
    
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default authenticatedFetch;