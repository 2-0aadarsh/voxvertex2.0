'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/store/hooks';
import { useSocket } from '@/hooks/useSocket';

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { connectionStatus, reconnectAttempts } = useSocket();

  // Show connection status in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔌 Socket Status:', {
        isAuthenticated,
        connectionStatus,
        reconnectAttempts,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isAuthenticated, connectionStatus, reconnectAttempts]);

  // Show connection indicator in development
  if (process.env.NODE_ENV === 'development' && isAuthenticated) {
    return (
      <div className="relative">
        {/* Connection Status Indicator */}
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              connectionStatus === 'connected'
                ? 'bg-green-100 text-green-800'
                : connectionStatus === 'connecting'
                ? 'bg-yellow-100 text-yellow-800'
                : connectionStatus === 'reconnecting'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-500'
                    : connectionStatus === 'connecting'
                    ? 'bg-yellow-500 animate-pulse'
                    : connectionStatus === 'reconnecting'
                    ? 'bg-orange-500 animate-pulse'
                    : 'bg-red-500'
                }`}
              />
              <span>
                {connectionStatus === 'connected'
                  ? 'Connected'
                  : connectionStatus === 'connecting'
                  ? 'Connecting...'
                  : connectionStatus === 'reconnecting'
                  ? `Reconnecting... (${reconnectAttempts})`
                  : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {children}
      </div>
    );
  }

  return <>{children}</>;
};

export default SocketProvider;



