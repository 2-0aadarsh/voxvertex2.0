// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://voxvertex20-production.up.railway.app/api',
  SUBSCRIPTION_BASE_URL: `${process.env.NEXT_PUBLIC_API_URL || 'https://voxvertex20-production.up.railway.app/api'}/subscriptions`,
};

export default API_CONFIG;
