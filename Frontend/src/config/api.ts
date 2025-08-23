// API Configuration for the InsightXR STEM Platform
// Replace the API key with your actual Google GenAI API key

export const API_CONFIG = {
  // Google GenAI API Key for chatbot functionality
  GOOGLE_API_KEY: 'AIzaSyC2bd0N9udqBvZ9vDPz-VLpU5Txg0RUJDg',
  
  // Supabase configuration (if needed)
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'your_supabase_url_here',
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here',
};

// Helper function to get the Google API key
export const getGoogleApiKey = (): string => {
  // First try environment variable, then fall back to config
  return process.env.VITE_GOOGLE_API_KEY || API_CONFIG.GOOGLE_API_KEY;
};

// Validate API configuration
export const validateApiConfig = (): boolean => {
  const apiKey = getGoogleApiKey();
  return apiKey && apiKey !== 'your_google_api_key_here' && apiKey.length > 0;
};

