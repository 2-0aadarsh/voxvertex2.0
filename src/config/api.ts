// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  SUBSCRIPTION_BASE_URL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/subscriptions`,
};

export default API_CONFIG;
